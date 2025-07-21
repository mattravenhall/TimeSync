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
let showCountryFlags = localStorage.getItem('showCountryFlags') !== 'false'; // Load state from local storage, defaulting to true

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

function countryCodeToEmoji(countryCode) {
    return countryCode.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
}