const cityInput = document.getElementById('city-input');
const colorInput = document.getElementById('color-input');
const addLocationBtn = document.getElementById('add-location-btn');
const locationList = document.getElementById('location-list');
const dropPinBtn = document.getElementById('drop-pin-btn');

let isPinDropMode = false;

const presetSelect = document.getElementById('preset-select');
const loadPresetBtn = document.getElementById('load-preset-btn');

function populatePresetDropdown() {
    for (const presetName in presets) {
        const option = document.createElement('option');
        option.value = presetName;
        option.textContent = presetName;
        presetSelect.appendChild(option);
    }
}

loadPresetBtn.addEventListener('click', () => {
    const selectedPreset = presetSelect.value;
    if (selectedPreset) {
        loadPreset(selectedPreset);
    }
});

function togglePinDropMode() {
    isPinDropMode = !isPinDropMode;
    const mapContainer = document.getElementById('map');
    if (isPinDropMode) {
        mapContainer.style.cursor = 'crosshair';
        dropPinBtn.classList.add('active'); // Add active class for styling
    } else {
        mapContainer.style.cursor = '';
        dropPinBtn.classList.remove('active');
    }
}

dropPinBtn.addEventListener('click', togglePinDropMode);


function renderLocationList() {
    // Updating locations list in Locations box
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

addLocationBtn.addEventListener('click', geocodeAndAddLocation);

const informationToggle = document.getElementById('information-toggle');
const informationContent = document.getElementById('information-content');
const locationListToggle = document.getElementById('location-list-toggle');
const locationListContent = document.getElementById('location-list-content');

informationToggle.addEventListener('click', () => {
    informationContent.classList.toggle('hidden');
});

locationListToggle.addEventListener('click', () => {
    locationListContent.classList.toggle('hidden');
    renderLocationList();
});

const configToggle = document.getElementById('config-toggle');
const configContent = document.getElementById('config-content');

configToggle.addEventListener('click', () => {
    configContent.classList.toggle('hidden');
});

const daylightToggle = document.getElementById('daylight-toggle');
const toggleCountriesBtn = document.getElementById('toggle-countries-btn');
const toggleWeatherBtn = document.getElementById('toggle-weather-btn');
const exportLocationsBtn = document.getElementById('export-locations-btn');
const importLocationsBtn = document.getElementById('import-locations-btn');
const importLocationsInput = document.getElementById('import-locations-input');
const resetLocationsBtn = document.getElementById('reset-locations-btn');

let showWeather = localStorage.getItem('showWeather') !== 'false';

daylightToggle.addEventListener('click', () => {
    isDaylightVisible = !isDaylightVisible;
    if (isDaylightVisible) {
        updateDaylightOverlay();
        daylightOverlay.addTo(map);
        // daylightToggle.innerHTML = '🌙';
    } else {
        map.removeLayer(daylightOverlay);
        // daylightToggle.innerHTML = '☀️';
    }
});

toggleCountriesBtn.addEventListener('click', () => {
    showCountryFlags = !showCountryFlags;
    localStorage.setItem('showCountryFlags', showCountryFlags);
    toggleCountriesBtn.textContent = showCountryFlags ? '🗺️' : '🗺️';
    renderLocationList(); // Re-render list to update flags
    updateTimes(); // Update marker tooltips
});

toggleWeatherBtn.addEventListener('click', () => {
    showWeather = !showWeather;
    localStorage.setItem('showWeather', showWeather);
    updateTimes();
});


exportLocationsBtn.addEventListener('click', exportLocations);

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

    loadPreset("Global");
    saveLocations(); // Save the reset state
});

/* Utilise latest repo commit as our id */
async function getLatestCommitId(owner, repo) {
    const url = `https://api.github.com/repos/mattravenhall/TimeSync/commits?per_page=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.length > 0) {
            return data[0].sha;
        }
        return null;
    } catch (error) {
        console.error("Error fetching version:", error);
        return null;
    }
}

getLatestCommitId().then(commitId => {
    if (commitId) {
        document.getElementById('commit-id-display').textContent = `v${commitId.substring(0, 7)}`;
    } else {
        document.getElementById('commit-id-display').textContent = 'latest';
    }
});