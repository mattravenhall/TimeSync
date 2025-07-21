function updateTimes() {
    managedLocations.forEach(item => {
        if (item.visible && map.hasLayer(item.marker)) {
            const time = moment().tz(item.location.tz).format('HH:mm:ss');
            item.marker.setTooltipContent(`<b>${showCountryFlags ? countryCodeToEmoji(item.location.countryCode) : ''} ${item.location.name}</b><br>${time}`);
        }
    });
    if (userLocationVisible && userMarker && map.hasLayer(userMarker)) {
        const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const time = moment().tz(userTz).format('HH:mm:ss');
        userMarker.setTooltipContent(`<b>Your Location</b><br>${time}`);
    }
}

let userTimezoneLayer = null;
let userMarker = null;
const tzToggle = document.getElementById('tz-toggle');
let userLocationVisible = false;
let hasUserLocationBeenRequested = false;

async function toggleUserLocationInfo() {
    userLocationVisible = !userLocationVisible;
    if (userLocationVisible) {
        if (!hasUserLocationBeenRequested) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    const { latitude, longitude } = position.coords;
                    userMarker = L.marker([latitude, longitude], {
                        icon: L.divIcon({
                            className: 'user-marker',
                            html: `<div style="background-color: red; width: 10px; height: 10px; border-radius: 50%;"></div>`,
                            iconSize: [10, 10]
                        })
                    });
                    userMarker.bindTooltip(`<b>Your Location</b><br>${moment().format('HH:mm:ss')}`, { permanent: true, direction: 'top' });
                    userMarker.addTo(map);
                });
            }
            hasUserLocationBeenRequested = true;
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
        if (userMarker && map.hasLayer(userMarker)) map.removeLayer(userMarker);
        if (userTimezoneLayer && map.hasLayer(userTimezoneLayer)) map.removeLayer(userTimezoneLayer);
    }
}

tzToggle.addEventListener('click', toggleUserLocationInfo);

map.on('click', async (e) => {
    if (!isPinDropMode) return;

    const { lat, lng } = e.latlng;

    try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        const data = await response.json();

        // Use the most specific location name available as a fallback
        const locationName = data.city || data.locality || data.principalSubdivision || data.countryName;

        if (locationName) {
            const countryCode = data.countryCode;
            const timezone = data.localityInfo.informative.find(i => i.description === 'time zone')?.ianaTimeId || 'Etc/GMT';
            
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

function initialize() {
    loadLocations();
    setInterval(updateTimes, 1000);

    // Initialize daylight overlay and button text
    if (isDaylightVisible) {
        updateDaylightOverlay();
        daylightOverlay.addTo(map);
        daylightToggle.innerHTML = '🌙';
    } else {
        daylightToggle.innerHTML = '☀️';
    }
}

initialize();