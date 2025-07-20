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

const daylightToggle = document.getElementById('daylight-toggle');
const toggleCountriesBtn = document.getElementById('toggle-countries-btn');
const exportLocationsBtn = document.getElementById('export-locations-btn');
const importLocationsBtn = document.getElementById('import-locations-btn');
const importLocationsInput = document.getElementById('import-locations-input');
const resetLocationsBtn = document.getElementById('reset-locations-btn');

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