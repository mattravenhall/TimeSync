const map = L.map('map').setView([20, 0], 2);

const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
});

const lightTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
});

darkTiles.addTo(map);

const themeToggle = document.getElementById('theme-toggle');

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