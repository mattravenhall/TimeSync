const map = L.map('map').setView([20, 0], 2);

// Helper functions for astronomical calculations
function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

function radToDeg(radians) {
    return radians * (180 / Math.PI);
}

function getJulianDate(date) {
    const time = date.getTime();
    const tzoffset = date.getTimezoneOffset();
    return (time / 86400000) - (tzoffset / 1440) + 2440587.5;
}

function getGMST(julianDate) {
    const JD0 = Math.floor(julianDate) + 0.5;
    const T = (JD0 - 2451545.0) / 36525;
    let GMST = 280.46061837 + 360.98564736629 * (julianDate - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
    return GMST % 360;
}

function getSunDeclination(julianDate) {
    const n = julianDate - 2451545.0;
    const L = 280.460 + 0.9856474 * n;
    const g = 357.528 + 0.9856003 * n;
    const lambda = L + 1.915 * Math.sin(degToRad(g)) + 0.020 * Math.sin(degToRad(2 * g));
    const epsilon = 23.439 - 0.0000004 * n;
    return radToDeg(Math.asin(Math.sin(degToRad(epsilon)) * Math.sin(degToRad(lambda))));
}

function getSunRightAscension(julianDate) {
    const n = julianDate - 2451545.0;
    const L = 280.460 + 0.9856474 * n;
    const g = 357.528 + 0.9856003 * n;
    const lambda = L + 1.915 * Math.sin(degToRad(g)) + 0.020 * Math.sin(degToRad(2 * g));
    const epsilon = 23.439 - 0.0000004 * n;
    return radToDeg(Math.atan2(Math.cos(degToRad(epsilon)) * Math.sin(degToRad(lambda)), Math.cos(degToRad(lambda))));
}

function getSunPosition(date) {
    const JD = getJulianDate(date);
    const GMST = getGMST(JD);
    const declination = getSunDeclination(JD);
    const rightAscension = getSunRightAscension(JD);

    const LST = GMST + date.getUTCMilliseconds() * 360 / 86400000; // Simplified LST calculation
    const longitude = LST - rightAscension;

    return {
        latitude: declination,
        longitude: longitude % 360 > 180 ? longitude % 360 - 360 : longitude % 360
    };
}

function getTerminatorPoints(date) {
    const sunPos = getSunPosition(date);
    const terminatorLine = [];
    const interval = 1; // degrees

    // Calculate points along the terminator line from -180 to 180 longitude
    for (let i = -180; i <= 180; i += interval) {
        const lat = radToDeg(Math.atan(-Math.cos(degToRad(i + sunPos.longitude)) / Math.tan(degToRad(sunPos.latitude))));
        terminatorLine.push([lat, i]);
    }

    const nightPolygonPoints = [...terminatorLine];

    // Determine which pole is in the night side and add points to close the polygon
    if (sunPos.latitude >= 0) { // Sun is in Northern Hemisphere or on equator, night extends to South Pole
        nightPolygonPoints.push([-90, 180]); // South-east corner
        nightPolygonPoints.push([-90, -180]); // South-west corner
    } else { // Sun is in Southern Hemisphere, night extends to North Pole
        nightPolygonPoints.push([90, 180]); // North-east corner
        nightPolygonPoints.push([90, -180]); // North-west corner
    }

    // Close the polygon by adding the first point again
    nightPolygonPoints.push(nightPolygonPoints[0]);

    return nightPolygonPoints;
}



function countryCodeToEmoji(countryCode) {
    return countryCode.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
}

const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
});

const lightTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
});

darkTiles.addTo(map);

const initialLocations = [
    { name: 'New York', originalName: 'New York', lat: 40.7128, lng: -74.0060, tz: 'America/New_York', countryCode: 'US' },
    { name: 'London', originalName: 'London', lat: 51.5074, lng: -0.1278, tz: 'Europe/London', countryCode: 'GB' },
    { name: 'Tokyo', originalName: 'Tokyo', lat: 35.6895, lng: 139.6917, tz: 'Asia/Tokyo', countryCode: 'JP' },
    { name: 'Sydney', originalName: 'Sydney', lat: -33.8688, lng: 151.2093, tz: 'Australia/Sydney', countryCode: 'AU' },
    { name: 'Beijing', originalName: 'Beijing', lat: 39.9042, lng: 116.4074, tz: 'Asia/Shanghai', countryCode: 'CN' },
    { name: 'Moscow', originalName: 'Moscow', lat: 55.7558, lng: 37.6173, tz: 'Europe/Moscow', countryCode: 'RU' },
    { name: 'Cairo', originalName: 'Cairo', lat: 30.0444, lng: 31.2357, tz: 'Africa/Cairo', countryCode: 'EG' },
    { name: 'Rio de Janeiro', originalName: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, tz: 'America/Sao_Paulo', countryCode: 'BR' },
    { name: 'Los Angeles', originalName: 'Los Angeles', lat: 34.0523, lng: -118.2437, tz: 'America/Los_Angeles', countryCode: 'US' },
    { name: 'Cape Town', originalName: 'Cape Town', lat: -33.9258, lng: 18.4232, tz: 'Africa/Johannesburg', countryCode: 'ZA' },
    { name: 'New Delhi', originalName: 'New Delhi', lat: 28.6214, lng: 77.2148, tz: 'Asia/Kolkata', countryCode: 'IN' },
];

let managedLocations = [];
let nextLocationId = 0;
let showCountryFlags = localStorage.getItem('showCountryFlags') === 'true'; // Load state from local storage

function saveLocations() {
    localStorage.setItem('managedLocations', JSON.stringify(managedLocations.map(item => ({
        id: item.id,
        location: { ...item.location, originalName: item.location.originalName || item.location.name }, // Ensure originalName is saved
        color: item.color,
        visible: item.visible
    }))));
    localStorage.setItem('nextLocationId', nextLocationId);
    localStorage.setItem('showCountryFlags', showCountryFlags);
}

function loadLocations() {
    const savedLocations = localStorage.getItem('managedLocations');
    const savedNextLocationId = localStorage.getItem('nextLocationId');

    if (savedLocations) {
        const parsedLocations = JSON.parse(savedLocations);
        managedLocations = []; // Clear existing locations
        parsedLocations.forEach(item => {
            // Ensure originalName is set, defaulting to name if not present (for old saves)
            const locationData = { ...item.location, originalName: item.location.originalName || item.location.name };

            // Recreate Leaflet markers
            const icon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color: ${item.color}; width: 10px; height: 10px; border-radius: 50%;"></div>`,
                iconSize: [10, 10]
            });
            const marker = L.marker([locationData.lat, locationData.lng], { icon });
            marker.bindTooltip(`<b>${showCountryFlags ? countryCodeToEmoji(locationData.countryCode) : ''} ${locationData.name}</b><br>...`, { permanent: true, direction: 'top' });
            
            if (item.visible) {
                marker.addTo(map);
            }

            managedLocations.push({
                id: item.id,
                location: locationData,
                marker: marker,
                color: item.color,
                visible: item.visible
            });
        });
        nextLocationId = savedNextLocationId ? parseInt(savedNextLocationId) : 0;
        renderLocationList();
        updateTimes();
    } else {
        // If no saved locations, load initial ones
        initialLocations.forEach(loc => {
            addNewLocation(loc, '#3388ff', loc.countryCode);
        });
        renderLocationList();
        updateTimes();
    }
    // Set initial button text based on loaded state
    document.getElementById('toggle-countries-btn').textContent = showCountryFlags ? '🗺️' : '🗺️';
}

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



const cityInput = document.getElementById('city-input');
const colorInput = document.getElementById('color-input');
const addLocationBtn = document.getElementById('add-location-btn');
const locationList = document.getElementById('location-list');

function renderLocationList() {
    locationList.innerHTML = '';
    managedLocations.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'location-item';
        listItem.dataset.id = item.id;

        listItem.innerHTML = `
            <span class="location-name-display">${showCountryFlags ? countryCodeToEmoji(item.location.countryCode) : ''} ${item.location.name}</span>
            <div class="controls">
                <input type="color" value="${item.color}">
                <button class="toggle-vis">${item.visible ? '👁️' : '🙈'}</button>
                <button class="rename-location">✏️</button>
                <button class="remove">🗑️</button>
            </div>
        `;
        locationList.appendChild(listItem);

        const nameSpan = listItem.querySelector('.location-name-display');
        const renameButton = listItem.querySelector('.rename-location');

        renameButton.addEventListener('click', () => {
            nameSpan.contentEditable = true;
            nameSpan.focus();
            // Select all text for easy editing
            const range = document.createRange();
            range.selectNodeContents(nameSpan);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        });

        nameSpan.addEventListener('blur', () => {
            nameSpan.contentEditable = false;
            const newName = nameSpan.textContent.trim();
            // If the new name is empty or just the emoji, revert to original name
            if (newName === '' || newName === countryCodeToEmoji(item.location.countryCode).trim()) {
                item.location.name = item.location.originalName;
            } else {
                // Remove the emoji from the newName before saving if it's present
                item.location.name = newName.replace(new RegExp(`^${countryCodeToEmoji(item.location.countryCode)}\s*`), '');
            }
            saveLocations();
            updateTimes(); // Update marker tooltip immediately
            // Re-set the display text to ensure emoji is correct based on showCountryFlags
            nameSpan.textContent = `${showCountryFlags ? countryCodeToEmoji(item.location.countryCode) : ''} ${item.location.name}`;
        });

        nameSpan.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent new line
                nameSpan.blur(); // Trigger blur event to save
            }
        });
    }); // Closing brace for managedLocations.forEach
}

function changeMarkerColor(id, newColor) {
    const item = managedLocations.find(i => i.id === id);
    if (item) {
        item.color = newColor;
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${newColor}; width: 10px; height: 10px; border-radius: 50%;"></div>`,
            iconSize: [10, 10]
        });
        item.marker.setIcon(icon);
        saveLocations();
    }
}

function toggleMarkerVisibility(id) {
    const item = managedLocations.find(i => i.id === id);
    if (item) {
        item.visible = !item.visible;
        if (item.visible) {
            item.marker.addTo(map);
        } else {
            map.removeLayer(item.marker);
        }
        renderLocationList();
        saveLocations();
    }
}

function removeLocation(id) {
    const itemIndex = managedLocations.findIndex(i => i.id === id);
    if (itemIndex > -1) {
        const item = managedLocations[itemIndex];
        if (map.hasLayer(item.marker)) {
            map.removeLayer(item.marker);
        }
        managedLocations.splice(itemIndex, 1);
        renderLocationList();
        saveLocations();
    }
}

locationList.addEventListener('click', (e) => {
    const target = e.target;
    const listItem = target.closest('.location-item');
    if (!listItem) return;
    const id = parseInt(listItem.dataset.id);

    if (target.classList.contains('remove')) {
        removeLocation(id);
    } else if (target.classList.contains('toggle-vis')) {
        toggleMarkerVisibility(id);
    }
});

locationList.addEventListener('input', (e) => {
    const target = e.target;
    const listItem = target.closest('.location-item');
    if (target.type === 'color' && listItem) {
        const id = parseInt(listItem.dataset.id);
        changeMarkerColor(id, target.value);
    }
});

function addNewLocation(location, color, countryCode) {
    const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%;"></div>`,
        iconSize: [10, 10]
    });

    const marker = L.marker([location.lat, location.lng], { icon }).addTo(map);
    
    marker.bindTooltip(`<b>${showCountryFlags ? countryCodeToEmoji(countryCode) : ''} ${location.name}</b><br>...`, { permanent: true, direction: 'top' });

    const newItem = {
        id: nextLocationId++,
        location: { ...location, countryCode: countryCode, originalName: location.name }, // Store original name
        marker: marker,
        color: color,
        visible: true
    };
    managedLocations.push(newItem);
    saveLocations();
}

async function geocodeAndAddLocation() {
    const cityName = cityInput.value;
    if (!cityName) return;

    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const newLocation = {
            name: result.name,
            lat: result.latitude,
            lng: result.longitude,
            tz: result.timezone
        };
        addNewLocation(newLocation, colorInput.value, result.country_code);
        renderLocationList();
        updateTimes();
        cityInput.value = '';
    } else {
        alert('City not found!');
    }
}

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

addLocationBtn.addEventListener('click', geocodeAndAddLocation);

const placeholderToggle = document.getElementById('placeholder-toggle');
const placeholderContent = document.getElementById('placeholder-content');
const locationListToggle = document.getElementById('location-list-toggle');
const locationListContent = document.getElementById('location-list-content');

placeholderToggle.addEventListener('click', () => {
    placeholderContent.classList.toggle('hidden');
});

locationListToggle.addEventListener('click', () => {
    locationListContent.classList.toggle('hidden');
});

const configToggle = document.getElementById('config-toggle');
const configContent = document.getElementById('config-content');

configToggle.addEventListener('click', () => {
    configContent.classList.toggle('hidden');
});

const themeToggle = document.getElementById('theme-toggle');
const daylightToggle = document.getElementById('daylight-toggle');
const toggleCountriesBtn = document.getElementById('toggle-countries-btn');
const exportLocationsBtn = document.getElementById('export-locations-btn');
const importLocationsBtn = document.getElementById('import-locations-btn');
const importLocationsInput = document.getElementById('import-locations-input');
const resetLocationsBtn = document.getElementById('reset-locations-btn');

let daylightOverlay = L.polygon([], { color: '#000', weight: 1, fillColor: '#1a1a2e', fillOpacity: 0.8, interactive: false });
let isDaylightVisible = false;

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
        map.removeLayer(darkTiles);
        lightTiles.addTo(map);
        themeToggle.innerHTML = '⚪';
    } else {
        map.removeLayer(lightTiles);
        darkTiles.addTo(map);
        themeToggle.innerHTML = '⚫';
    }
});

daylightToggle.addEventListener('click', () => {
    isDaylightVisible = !isDaylightVisible;
    if (isDaylightVisible) {
        updateDaylightOverlay();
        daylightOverlay.addTo(map);
        daylightToggle.innerHTML = '🌙';
    } else {
        map.removeLayer(daylightOverlay);
        daylightToggle.innerHTML = '☀️';
    }
});

toggleCountriesBtn.addEventListener('click', () => {
    showCountryFlags = !showCountryFlags;
    localStorage.setItem('showCountryFlags', showCountryFlags);
    toggleCountriesBtn.textContent = showCountryFlags ? '🗺️' : '🗺️';
    renderLocationList(); // Re-render list to update flags
    updateTimes(); // Update marker tooltips
});

exportLocationsBtn.addEventListener('click', exportLocations);

importLocationsBtn.addEventListener('click', () => {
    importLocationsInput.click();
});

importLocationsInput.addEventListener('change', importLocations);

importLocationsBtn.addEventListener('click', () => {
    importLocationsInput.click();
});

importLocationsInput.addEventListener('change', importLocations);

resetLocationsBtn.addEventListener('click', () => {
    // Remove all existing markers from the map
    managedLocations.forEach(item => {
        if (map.hasLayer(item.marker)) {
            map.removeLayer(item.marker);
        }
    });
    managedLocations = []; // Clear the array
    nextLocationId = 0; // Reset ID counter

    // Add initial locations back
    initialLocations.forEach(loc => {
        addNewLocation(loc, '#3388ff', loc.countryCode);
    });
    renderLocationList();
    updateTimes();
    saveLocations(); // Save the reset state
});

function updateDaylightOverlay() {
    if (isDaylightVisible) {
        const terminatorPoints = getTerminatorPoints(new Date());
        daylightOverlay.setLatLngs(terminatorPoints);
    }
}

setInterval(updateDaylightOverlay, 60000); // Update every minute

function exportLocations() {
    const dataStr = JSON.stringify(managedLocations.map(item => ({
        location: item.location,
        color: item.color,
        visible: item.visible
    })), null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'locations.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importLocations(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (!Array.isArray(importedData)) {
                alert('Invalid file format: Expected an array of locations.');
                return;
            }

            // Clear existing locations from map and list
            managedLocations.forEach(item => {
                if (map.hasLayer(item.marker)) {
                    map.removeLayer(item.marker);
                }
            });
            managedLocations = [];
            nextLocationId = 0;

            // Add imported locations
            for (const item of importedData) {
                if (item.location && item.location.name && item.location.lat !== undefined && item.location.lng !== undefined && item.location.tz && item.color) {
                    // Re-geocode to get country_code if missing or for validation
                    let countryCode = item.location.countryCode;
                    if (!countryCode) {
                        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${item.location.name}&count=1`);
                        const data = await response.json();
                        if (data.results && data.results.length > 0) {
                            countryCode = data.results[0].country_code;
                        }
                    }
                    addNewLocation(item.location, item.color, countryCode || 'UN'); // Use 'UN' for unknown country
                    if (!item.visible) {
                        // If imported as not visible, hide it after adding
                        managedLocations[managedLocations.length - 1].visible = false;
                        map.removeLayer(managedLocations[managedLocations.length - 1].marker);
                    }
                } else {
                    console.warn('Skipping invalid imported location item:', item);
                }
            }
            saveLocations();
            renderLocationList();
            updateTimes();
            alert('Locations imported successfully!');
        } catch (error) {
            alert('Error importing locations: ' + error.message);
            console.error('Error importing locations:', error);
        }
    };
    reader.readAsText(file);
}

initialize();