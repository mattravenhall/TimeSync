let managedLocations = [];
let nextLocationId = 0;
let showCountryFlags = localStorage.getItem('showCountryFlags') !== 'false'; // Load state from local storage, defaulting to true

function saveLocations() {
    // Update localStorage with current managedLocations, nextLocationId, and showCountryFlags
    localStorage.setItem('managedLocations', JSON.stringify(managedLocations.map(item => ({
        id: item.id,
        location: { ...item.location, originalName: item.location.originalName || item.location.name }, // Ensure originalName is saved
        color: item.color,
        visible: item.visible
    }))));
    localStorage.setItem('nextLocationId', nextLocationId);
    localStorage.setItem('showCountryFlags', showCountryFlags);
    renderLocationList();
}

function loadLocations() {
    // If locations are saved locally, load them to managedLocations, else load the default preset
    const savedLocations = localStorage.getItem('managedLocations');
    const savedNextLocationId = localStorage.getItem('nextLocationId');

    if (savedLocations) {
        const parsedLocations = JSON.parse(savedLocations);
        managedLocations = []; // Clear existing locations
        parsedLocations.forEach(async (item) => {
            // Ensure originalName is set, defaulting to name if not present (for old saves)
            const locationData = { ...item.location, originalName: item.location.originalName || item.location.name };

            // Recreate Leaflet markers
            const icon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color: ${item.color}; width: 10px; height: 10px; border-radius: 50%;"></div>`,
                iconSize: [10, 10]
            });
            const marker = L.marker([locationData.lat, locationData.lng], { icon });
            const weatherCode = showWeather ? await fetchWeather(locationData.lat, locationData.lng) : null;
            const weatherEmoji = showWeather && weatherCode !== null ? getWeatherEmoji(weatherCode) : '';
            const countryEmoji = showCountryFlags && locationData.countryCode ? countryCodeToEmoji(locationData.countryCode) : '';
            const emojiLine = [countryEmoji, weatherEmoji].filter(Boolean).join(' ');
            marker.bindTooltip(`<b>${locationData.name}</b><br>...${emojiLine ? `<br>${emojiLine}` : ''}`, { permanent: true, direction: 'top' });
            
            if (item.visible) {
                marker.addTo(map);
            }

            // Populate managedLocations
            managedLocations.push({
                id: item.id,
                location: locationData,
                marker: marker,
                color: item.color,
                visible: item.visible,
                weatherCode: weatherCode
            });
        });
        nextLocationId = savedNextLocationId ? parseInt(savedNextLocationId) : 0;
        renderLocationList();
        // updateTimes();
    } else {
        // If no saved locations, load the default preset
        loadPreset('Global');
    }
}

function loadPreset(presetName) {
    // Switch to a preset group of locations
    const preset = presets[presetName];
    if (!preset) return;

    // TODO: Possibly remove this if we end up saving custom sets
    if (managedLocations.length > 0) {
        if (!confirm('Loading a preset will remove your custom markers. Are you sure?')) {
            return;
        }
    }

    // Clear existing locations
    managedLocations.forEach(item => {
        if (map.hasLayer(item.marker)) {
            map.removeLayer(item.marker);
        }
    });
    managedLocations = [];
    nextLocationId = 0;

    // Load preset locations
    preset.locations.forEach(loc => {
        addNewLocation(loc, loc.color, loc.countryCode);
    });

    // Set map view
    map.setView(preset.center, preset.zoom);

    renderLocationList();
    // updateTimes();
    // saveLocations();
}


async function addNewLocation(location, color, countryCode) {
    // Create a new managedLocations item
    const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%;"></div>`,
        iconSize: [10, 10]
    });

    const marker = L.marker([location.lat, location.lng], { icon }).addTo(map);
    const weatherCode = showWeather ? await fetchWeather(location.lat, location.lng) : null;
    const weatherEmoji = showWeather && weatherCode !== null ? getWeatherEmoji(weatherCode) : '';
    const countryEmoji = showCountryFlags && countryCode ? countryCodeToEmoji(countryCode) : '';
    const emojiLine = [countryEmoji, weatherEmoji].filter(Boolean).join(' ');
    
    marker.bindTooltip(`<b>${location.name}</b><br>...${emojiLine ? `<br>${emojiLine}` : ''}`, { permanent: true, direction: 'top' });

    const newItem = {
        id: nextLocationId++,
        location: { ...location, countryCode: countryCode, originalName: location.name },
        marker: marker,
        color: color,
        visible: true,
        weatherCode: weatherCode
    };
    managedLocations.push(newItem);
    saveLocations();
}

async function geocodeAndAddLocation() {
    // Fetch metadata for the current cityInput.value, then add to managedLocations
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
        // updateTimes();
        cityInput.value = '';
    } else {
        alert('City not found!');
    }
}

function exportLocations() {
    // Export managedLocations to JSON
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
    // Load locations from a JSON
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
            // renderLocationList();
            // updateTimes();
            alert('Locations imported successfully!');
        } catch (error) {
            alert('Error importing locations: ' + error.message);
            console.error('Error importing locations:', error);
        }
    };
    reader.readAsText(file);
}

function countryCodeToEmoji(countryCode) {
    return countryCode.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
}