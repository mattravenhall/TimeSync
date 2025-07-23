function getWeatherEmoji(weatherCode) {
    const icons = {
        999: '❓', // Fetch failed
        0: '☀️', // Clear sky
        1: '🌤️', // Mainly clear
        2: '⛅️', // Partly cloudy
        3: '☁️', // Overcast
        45: '🌫️', // Fog
        48: '🌫️', // Depositing rime fog
        51: '🌦️', // Drizzle, light
        53: '🌦️', // Drizzle, moderate
        55: '🌦️', // Drizzle, dense
        56: '🥶', // Freezing Drizzle, light
        57: '🥶', // Freezing Drizzle, dense
        61: '🌧️', // Rain, slight
        63: '🌧️', // Rain, moderate
        65: '🌧️', // Rain, heavy
        66: '🥶', // Freezing Rain, light
        67: '🥶', // Freezing Rain, heavy
        71: '🌨️', // Snow fall, slight
        73: '🌨️', // Snow fall, moderate
        75: '🌨️', // Snow fall, heavy
        77: '🌨️', // Snow grains
        80: '🌧️', // Rain showers, slight
        81: '🌧️', // Rain showers, moderate
        82: '🌧️', // Rain showers, violent
        85: '🌨️', // Snow showers, slight
        86: '🌨️', // Snow showers, heavy
        95: '⛈️', // Thunderstorm, slight or moderate
        96: '⛈️', // Thunderstorm with slight hail
        99: '⛈️', // Thunderstorm with heavy hail
    };
    return icons[weatherCode] || '❓';
}

async function fetchWeather(lat, lon) {
    // Get weather at a given location
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await response.json();
        return data.current_weather.weathercode;
    } catch (error) {
        // console.error('Error fetching weather:', error);
        return 999;
    }
}

// User location information
let userTimezoneLayer = null;
let userMarker = null;
const userToggle = document.getElementById('user-toggle');
let userLocationVisible = false;
let hasUserLocationBeenRequested = false;

async function toggleUserLocationInfo() {
    userLocationVisible = !userLocationVisible;
    if (userLocationVisible) {
        userToggle.innerHTML = "Hide My Location"
        if (!hasUserLocationBeenRequested) {
            hasUserLocationBeenRequested = true;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;

                    let userCountryCode = '';
                    try {
                        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                        const data = await response.json();
                        userCountryCode = data.countryCode || '';
                    } catch (error) {
                        console.error('Error fetching user country code:', error);
                    }

                    const weatherCode = showWeather ? await fetchWeather(latitude, longitude) : null;

                    userMarker = L.marker([latitude, longitude], {
                        icon: L.divIcon({
                            className: 'user-marker',
                            html: `<div style="background-color: red; width: 10px; height: 10px; border-radius: 50%;"></div>`,
                            iconSize: [10, 10]
                        })
                    });
                    userMarker.countryCode = userCountryCode; // Store for later
                    userMarker.weatherCode = weatherCode;
                    const weatherEmoji = showWeather && weatherCode !== null ? getWeatherEmoji(weatherCode) : '';
                    const countryEmoji = showCountryFlags && userMarker.countryCode ? countryCodeToEmoji(userMarker.countryCode) : '';
                    const emojiLine = [countryEmoji, weatherEmoji].filter(Boolean).join(' ');
                    userMarker.bindTooltip(`<b>Your Location</b><br>${moment().format('HH:mm:ss')}${emojiLine ? `<br>${emojiLine}` : ''}`, { permanent: true, direction: 'top' });
                    userMarker.addTo(map);
                });
            }
        } else if (userMarker) {
            userMarker.addTo(map);
        }

        if (!userTimezoneLayer) {
            const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const response = await fetch('https://raw.githubusercontent.com/evansiroky/timezone-boundary-builder/main/dist/timezones.geojson');
            const timezones = await response.json();
            const userTimezone = timezones.features.find(feature => feature.properties.tzid === userTz);
            if (userTimezone) {
                userTimezoneLayer = L.geoJSON(userTimezone, { style: { color: 'red', weight: 2, fill: false } });
            }
        }
        if (userTimezoneLayer) userTimezoneLayer.addTo(map);
    } else {
        userToggle.innerHTML = "Show My Location"
        if (userMarker && map.hasLayer(userMarker)) map.removeLayer(userMarker);
        if (userTimezoneLayer && map.hasLayer(userTimezoneLayer)) map.removeLayer(userTimezoneLayer);
    }
}

userToggle.addEventListener('click', toggleUserLocationInfo);

// Update functions
function updateTimes() {
    // Update time and associated marker tooltips
    managedLocations.forEach(async (item) => {
        if (item.visible && map.hasLayer(item.marker)) {
            const time = moment().tz(item.location.tz).format('HH:mm:ss');
            const countryEmoji = showCountryFlags && item.location.countryCode ? countryCodeToEmoji(item.location.countryCode) : '';
            const weatherEmoji = showWeather && item.weatherCode !== null ? getWeatherEmoji(item.weatherCode) : '';
            const emojiLine = [countryEmoji, weatherEmoji].filter(Boolean).join(' ');
            const tooltipContent = `<b>${item.location.name}</b><br>${time}${emojiLine ? `<br>${emojiLine}` : ''}`;
            item.marker.setTooltipContent(tooltipContent);
        }
    });
    if (userLocationVisible && userMarker && map.hasLayer(userMarker)) {
        const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const time = moment().tz(userTz).format('HH:mm:ss');
        const countryEmoji = showCountryFlags && userMarker.countryCode ? countryCodeToEmoji(userMarker.countryCode) : '';
        const weatherEmoji = showWeather && userMarker.weatherCode ? getWeatherEmoji(userMarker.weatherCode) : '';
        const emojiLine = [countryEmoji, weatherEmoji].filter(Boolean).join(' ');
        const tooltipContent = `<b>Your Location</b><br>${time}${emojiLine ? `<br>${emojiLine}` : ''}`;
        userMarker.setTooltipContent(tooltipContent);
    }
}

function updateWeather(patch_only = false) {
    // Update weather codes for all visible managedLocations
    managedLocations.forEach(async (item) => {  // Markers
        if (item.visible && map.hasLayer(item.marker)) {
            if (showWeather) {
                // If patching, only fetch if no weatherCode
                if ((patch_only && (item.weatherCode !== null || item.weatherCode == 999)) || !patch_only) {
                    item.weatherCode = await fetchWeather(item.location.lat, item.location.lng);
                    // console.error("fetching for " + item.location.name + " at " + item.location.lat + ", " + item.location.lng + " found " + item.weatherCode);
                }
            }
        }
    });
    if (userLocationVisible && userMarker && map.hasLayer(userMarker)) {  // User marker
        userMarker.weatherCode = showWeather ? fetchWeather(userMarker.location.lat, userMarker.location.lng) : null;
    };
}

map.on('click', async (e) => {
    // Implement adding new locations via pin mode
    if (!isPinDropMode) return;

    const { lat, lng } = e.latlng;

    try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        const data = await response.json();

        // Use the most specific location name available as a fallback
        const locationName = data.city || data.locality || data.principalSubdivision || data.countryName;

        if (locationName) {
            const countryCode = data.countryCode;
            const timezone = data.localityInfo.informative.find(i => i.description === 'time zone')?.name || '';
            
            if (confirm(`Add "${locationName}, ${countryCode}" to your locations?`)) {
                const newLocation = {
                    name: locationName,
                    lat: lat,
                    lng: lng,
                    tz: timezone
                };
                addNewLocation(newLocation, colorInput.value, countryCode);
                renderLocationList();
                updateTimes();
            }
        } else {
            alert('Could not find a location at these coordinates.');
        }
    } catch (error) {
        console.error('Error during reverse geocoding:', error);
        alert('An error occurred while finding the location.');
    } finally {
        // Always exit pin drop mode after a click
        togglePinDropMode();
    }
});

// Entrypoint
function initialize() {
    loadLocations();
    populatePresetDropdown();
    setInterval(updateTimes, 1000);  // Update times every second
    setInterval(updateWeather, 900000);  // Update weather every 15 minutest
    setInterval(updateWeather, 5000, true);  // Patch updates (so markers without a weather code) every 5 minutes
    // setInterval(updateWeather, 300000, true);  // Patch updates (so markers without a weather code) every 5 minutes

    // Initialize daylight overlay and button text
    if (isDaylightVisible) {
        updateDaylightOverlay();
        daylightOverlay.addTo(map);
    }
}

initialize();
