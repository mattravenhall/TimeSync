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
    // TODO: Set this to something like -360, 360 to avoid hard stop at edges
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

let daylightOverlay = L.polygon([], { color: '#000', weight: 0, fillColor: '#1a1a2e', fillOpacity: 0.8, interactive: false });
let isDaylightVisible = false;

function updateDaylightOverlay() {
    if (isDaylightVisible) {
        const terminatorPoints = getTerminatorPoints(new Date());
        daylightOverlay.setLatLngs(terminatorPoints);
    }
}

setInterval(updateDaylightOverlay, 60000); // Update every minute
