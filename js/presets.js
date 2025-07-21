const presets = {
  "Global": {
    center: [20, 0],
    zoom: 2,
    locations: [
      { name: 'New York', lat: 40.7128, lng: -74.0060, tz: 'America/New_York', countryCode: 'US', color: '#F7C343' },
      { name: 'London', lat: 51.5074, lng: -0.1278, tz: 'Europe/London', countryCode: 'GB', color: '#D84848' },
      { name: 'Tokyo', lat: 35.6895, lng: 139.6917, tz: 'Asia/Tokyo', countryCode: 'JP', color: '#6A4C9C' },
      { name: 'Sydney', lat: -33.8688, lng: 151.2093, tz: 'Australia/Sydney', countryCode: 'AU', color: '#44D7B6' },
      { name: 'Beijing', lat: 39.9042, lng: 116.4074, tz: 'Asia/Shanghai', countryCode: 'CN', color: '#D84848' },
      { name: 'Moscow', lat: 55.7558, lng: 37.6173, tz: 'Europe/Moscow', countryCode: 'RU', color: '#D84848' },
      { name: 'Cairo', lat: 30.0444, lng: 31.2357, tz: 'Africa/Cairo', countryCode: 'EG', color: '#F7C343' },
      { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, tz: 'America/Sao_Paulo', countryCode: 'BR', color: '#52D744' },
      { name: 'Los Angeles', lat: 34.0523, lng: -118.2437, tz: 'America/Los_Angeles', countryCode: 'US', color: '#F7C343' },
      { name: 'Cape Town', lat: -33.9258, lng: 18.4232, tz: 'Africa/Johannesburg', countryCode: 'ZA', color: '#52D744' },
      { name: 'New Delhi', lat: 28.6214, lng: 77.2148, tz: 'Asia/Kolkata', countryCode: 'IN', color: '#F78843' },
    ]
  },
  "Europe": {
    center: [48.8566, 12.3522],
    zoom: 5,
    locations: [
      { name: 'London', lat: 51.5074, lng: -0.1278, tz: 'Europe/London', countryCode: 'GB', color: '#D84848' },
      { name: 'Paris', lat: 48.8566, lng: 2.3522, tz: 'Europe/Paris', countryCode: 'FR', color: '#4477D7' },
      { name: 'Berlin', lat: 52.5200, lng: 13.4050, tz: 'Europe/Berlin', countryCode: 'DE', color: '#F7C343' },
      { name: 'Madrid', lat: 40.4168, lng: -3.7038, tz: 'Europe/Madrid', countryCode: 'ES', color: '#F78843' },
      { name: 'Rome', lat: 41.9028, lng: 12.4964, tz: 'Europe/Rome', countryCode: 'IT', color: '#52D744' },
      { name: 'Moscow', lat: 55.7558, lng: 37.6173, tz: 'Europe/Moscow', countryCode: 'RU', color: '#D84848' },
      { name: 'Amsterdam', lat: 52.3676, lng: 4.9041, tz: 'Europe/Amsterdam', countryCode: 'NL', color: '#F78843' },
      { name: 'Prague', lat: 50.0755, lng: 14.4378, tz: 'Europe/Prague', countryCode: 'CZ', color: '#6A4C9C' },
      { name: 'Kyiv', lat: 50.4501, lng: 30.5234, tz: 'Europe/Kiev', countryCode: 'UA', color: '#F7C343' },
      { name: 'Vienna', lat: 48.2082, lng: 16.3738, tz: 'Europe/Vienna', countryCode: 'AT', color: '#D84848' },
    ]
  },
  "USA": {
    center: [39.8283, -98.5795],
    zoom: 5,
    locations: [
      { name: 'New York', lat: 40.7128, lng: -74.0060, tz: 'America/New_York', countryCode: 'US', color: '#F7C343' },
      { name: 'Los Angeles', lat: 34.0523, lng: -118.2437, tz: 'America/Los_Angeles', countryCode: 'US', color: '#F7C343' },
      { name: 'Chicago', lat: 41.8781, lng: -87.6298, tz: 'America/Chicago', countryCode: 'US', color: '#D84848' },
      { name: 'Houston', lat: 29.7604, lng: -95.3698, tz: 'America/Chicago', countryCode: 'US', color: '#4477D7' },
      { name: 'Phoenix', lat: 33.4484, lng: -112.0740, tz: 'America/Phoenix', countryCode: 'US', color: '#F78843' },
      { name: 'Miami', lat: 25.7617, lng: -80.1918, tz: 'America/New_York', countryCode: 'US', color: '#44D7B6' },
      { name: 'Seattle', lat: 47.6062, lng: -122.3321, tz: 'America/Los_Angeles', countryCode: 'US', color: '#6A4C9C' },
      { name: 'Denver', lat: 39.7392, lng: -104.9903, tz: 'America/Denver', countryCode: 'US', color: '#52D744' },
      { name: 'Boston', lat: 42.3601, lng: -71.0589, tz: 'America/New_York', countryCode: 'US', color: '#D84848' },
      { name: 'Washington D.C.', lat: 38.9072, lng: -77.0369, tz: 'America/New_York', countryCode: 'US', color: '#4477D7' },
    ]
  },
  "Asia": {
    center: [25, 100],
    zoom: 4,
    locations: [
        { name: 'Tokyo', lat: 35.6895, lng: 139.6917, tz: 'Asia/Tokyo', countryCode: 'JP', color: '#6A4C9C' },
        { name: 'Beijing', lat: 39.9042, lng: 116.4074, tz: 'Asia/Shanghai', countryCode: 'CN', color: '#D84848' },
        { name: 'New Delhi', lat: 28.6214, lng: 77.2148, tz: 'Asia/Kolkata', countryCode: 'IN', color: '#F78843' },
        { name: 'Singapore', lat: 1.3521, lng: 103.8198, tz: 'Asia/Singapore', countryCode: 'SG', color: '#44D7B6' },
        { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, tz: 'Asia/Hong_Kong', countryCode: 'HK', color: '#D84848' },
        { name: 'Seoul', lat: 37.5665, lng: 126.9780, tz: 'Asia/Seoul', countryCode: 'KR', color: '#4477D7' },
        { name: 'Bangkok', lat: 13.7563, lng: 100.5018, tz: 'Asia/Bangkok', countryCode: 'TH', color: '#F7C343' },
        { name: 'Dubai', lat: 25.276987, lng: 55.296249, tz: 'Asia/Dubai', countryCode: 'AE', color: '#F7C343' },
        { name: 'Jakarta', lat: -6.2088, lng: 106.8456, tz: 'Asia/Jakarta', countryCode: 'ID', color: '#52D744' },
        { name: 'Mumbai', lat: 19.0760, lng: 72.8777, tz: 'Asia/Kolkata', countryCode: 'IN', color: '#F78843' },
    ]
  },
  "Africa": {
      center: [2.8, 17.0],
      zoom: 4,
      locations: [
          { name: 'Cairo', lat: 30.0444, lng: 31.2357, tz: 'Africa/Cairo', countryCode: 'EG', color: '#F7C343' },
          { name: 'Lagos', lat: 6.5244, lng: 3.3792, tz: 'Africa/Lagos', countryCode: 'NG', color: '#52D744' },
          { name: 'Kinshasa', lat: -4.4419, lng: 15.2663, tz: 'Africa/Kinshasa', countryCode: 'CD', color: '#4477D7' },
          { name: 'Johannesburg', lat: -26.2041, lng: 28.0473, tz: 'Africa/Johannesburg', countryCode: 'ZA', color: '#D84848' },
          { name: 'Nairobi', lat: -1.2921, lng: 36.8219, tz: 'Africa/Nairobi', countryCode: 'KE', color: '#F78843' },
          { name: 'Addis Ababa', lat: 9.0054, lng: 38.7578, tz: 'Africa/Addis_Ababa', countryCode: 'ET', color: '#6A4C9C' },
          { name: 'Dakar', lat: 14.7167, lng: -17.4677, tz: 'Africa/Dakar', countryCode: 'SN', color: '#F7C343' },
          { name: 'Casablanca', lat: 33.5731, lng: -7.5898, tz: 'Africa/Casablanca', countryCode: 'MA', color: '#D84848' },
      ]
  },
  "North America": {
      center: [45, -100],
      zoom: 4,
      locations: [
          { name: 'New York', lat: 40.7128, lng: -74.0060, tz: 'America/New_York', countryCode: 'US', color: '#F7C343' },
          { name: 'Los Angeles', lat: 34.0523, lng: -118.2437, tz: 'America/Los_Angeles', countryCode: 'US', color: '#F7C343' },
          { name: 'Mexico City', lat: 19.4326, lng: -99.1332, tz: 'America/Mexico_City', countryCode: 'MX', color: '#52D744' },
          { name: 'Toronto', lat: 43.6532, lng: -79.3832, tz: 'America/Toronto', countryCode: 'CA', color: '#D84848' },
          { name: 'Chicago', lat: 41.8781, lng: -87.6298, tz: 'America/Chicago', countryCode: 'US', color: '#D84848' },
          { name: 'Vancouver', lat: 49.2827, lng: -123.1207, tz: 'America/Vancouver', countryCode: 'CA', color: '#4477D7' },
          { name: 'Havana', lat: 23.1136, lng: -82.3666, tz: 'America/Havana', countryCode: 'CU', color: '#F78843' },
          { name: 'Montreal', lat: 45.5017, lng: -73.5673, tz: 'America/Toronto', countryCode: 'CA', color: '#6A4C9C' },
      ]
  },
  "South America": {
      center: [-24.2350, -61.9253],
      zoom: 4,
      locations: [
          { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, tz: 'America/Sao_Paulo', countryCode: 'BR', color: '#52D744' },
          { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, tz: 'America/Argentina/Buenos_Aires', countryCode: 'AR', color: '#4477D7' },
          { name: 'Lima', lat: -12.0464, lng: -77.0428, tz: 'America/Lima', countryCode: 'PE', color: '#F78843' },
          { name: 'Bogotá', lat: 4.7110, lng: -74.0721, tz: 'America/Bogota', countryCode: 'CO', color: '#D84848' },
          { name: 'Santiago', lat: -33.4489, lng: -70.6693, tz: 'America/Santiago', countryCode: 'CL', color: '#6A4C9C' },
          { name: 'Caracas', lat: 10.4806, lng: -66.9036, tz: 'America/Caracas', countryCode: 'VE', color: '#F7C343' },
          { name: 'La Paz', lat: -16.4897, lng: -68.1193, tz: 'America/La_Paz', countryCode: 'BO', color: '#D84848' },
      ]
  },
  "Australasia": {
      center: [-25.2744, 133.7751],
      zoom: 4,
      locations: [
          { name: 'Sydney', lat: -33.8688, lng: 151.2093, tz: 'Australia/Sydney', countryCode: 'AU', color: '#44D7B6' },
          { name: 'Melbourne', lat: -37.8136, lng: 144.9631, tz: 'Australia/Melbourne', countryCode: 'AU', color: '#6A4C9C' },
          { name: 'Auckland', lat: -36.8485, lng: 174.7633, tz: 'Pacific/Auckland', countryCode: 'NZ', color: '#4477D7' },
          { name: 'Perth', lat: -31.9505, lng: 115.8605, tz: 'Australia/Perth', countryCode: 'AU', color: '#F7C343' },
          { name: 'Brisbane', lat: -27.4698, lng: 153.0251, tz: 'Australia/Brisbane', countryCode: 'AU', color: '#D84848' },
          { name: 'Wellington', lat: -41.2865, lng: 174.7762, tz: 'Pacific/Auckland', countryCode: 'NZ', color: '#52D744' },
          { name: 'Adelaide', lat: -34.9285, lng: 138.6007, tz: 'Australia/Adelaide', countryCode: 'AU', color: '#F78843' },
          { name: 'Christchurch', lat: -43.5321, lng: 172.6362, tz: 'Pacific/Auckland', countryCode: 'NZ', color: '#6A4C9C' },
          { name: 'Darwin', lat: -12.4634, lng: 130.8456, tz: 'Australia/Darwin', countryCode: 'AU', color: '#F78843' },
      ]
  },
  "Middle East": {
      center: [26.8, 45.0],
      zoom: 5,
      locations: [
          { name: 'Dubai', lat: 25.276987, lng: 55.296249, tz: 'Asia/Dubai', countryCode: 'AE', color: '#F7C343' },
          { name: 'Riyadh', lat: 24.7136, lng: 46.6753, tz: 'Asia/Riyadh', countryCode: 'SA', color: '#52D744' },
          { name: 'Jerusalem', lat: 31.7683, lng: 35.2137, tz: 'Asia/Jerusalem', countryCode: 'IL', color: '#4477D7' },
          { name: 'Istanbul', lat: 41.0082, lng: 28.9784, tz: 'Europe/Istanbul', countryCode: 'TR', color: '#D84848' },
          { name: 'Tehran', lat: 35.6892, lng: 51.3890, tz: 'Asia/Tehran', countryCode: 'IR', color: '#6A4C9C' },
          { name: 'Doha', lat: 25.2854, lng: 51.5310, tz: 'Asia/Qatar', countryCode: 'QA', color: '#F78843' },
          { name: 'Baghdad', lat: 33.3152, lng: 44.3661, tz: 'Asia/Baghdad', countryCode: 'IQ', color: '#F7C343' },
          { name: 'Muscat', lat: 23.5859, lng: 58.3829, tz: 'Asia/Muscat', countryCode: 'OM', color: '#D84848' },
      ]
  }
  // "Capitals": {
  //     center: [20, 0],
  //     zoom: 2,
  //     locations: [
  //         { name: 'Abu Dhabi', lat: 24.4539, lng: 54.3773, tz: 'Asia/Dubai', countryCode: 'AE', color: '#F7C343' },
  //         { name: 'Abuja', lat: 9.0765, lng: 7.3986, tz: 'Africa/Lagos', countryCode: 'NG', color: '#52D744' },
  //         { name: 'Accra', lat: 5.6037, lng: -0.1870, tz: 'Africa/Accra', countryCode: 'GH', color: '#4477D7' },
  //         { name: 'Amsterdam', lat: 52.3676, lng: 4.9041, tz: 'Europe/Amsterdam', countryCode: 'NL', color: '#F78843' },
  //         { name: 'Ankara', lat: 39.9334, lng: 32.8663, tz: 'Europe/Istanbul', countryCode: 'TR', color: '#D84848' },
  //         { name: 'Astana', lat: 51.1694, lng: 71.4491, tz: 'Asia/Almaty', countryCode: 'KZ', color: '#6A4C9C' },
  //         { name: 'Athens', lat: 37.9838, lng: 23.7275, tz: 'Europe/Athens', countryCode: 'GR', color: '#44D7B6' },
  //         { name: 'Baghdad', lat: 33.3152, lng: 44.3661, tz: 'Asia/Baghdad', countryCode: 'IQ', color: '#F7C343' },
  //         { name: 'Baku', lat: 40.4093, lng: 49.8671, tz: 'Asia/Baku', countryCode: 'AZ', color: '#52D744' },
  //         { name: 'Bangkok', lat: 13.7563, lng: 100.5018, tz: 'Asia/Bangkok', countryCode: 'TH', color: '#4477D7' },
  //         { name: 'Beijing', lat: 39.9042, lng: 116.4074, tz: 'Asia/Shanghai', countryCode: 'CN', color: '#D84848' },
  //         { name: 'Berlin', lat: 52.5200, lng: 13.4050, tz: 'Europe/Berlin', countryCode: 'DE', color: '#F7C343' },
  //         { name: 'Bern', lat: 46.9480, lng: 7.4474, tz: 'Europe/Zurich', countryCode: 'CH', color: '#F78843' },
  //         { name: 'Bogotá', lat: 4.7110, lng: -74.0721, tz: 'America/Bogota', countryCode: 'CO', color: '#D84848' },
  //         { name: 'Brasília', lat: -15.8267, lng: -47.9218, tz: 'America/Sao_Paulo', countryCode: 'BR', color: '#52D744' },
  //         { name: 'Bratislava', lat: 48.1486, lng: 17.1077, tz: 'Europe/Bratislava', countryCode: 'SK', color: '#6A4C9C' },
  //         { name: 'Brussels', lat: 50.8503, lng: 4.3517, tz: 'Europe/Brussels', countryCode: 'BE', color: '#44D7B6' },
  //         { name: 'Bucharest', lat: 44.4268, lng: 26.1025, tz: 'Europe/Bucharest', countryCode: 'RO', color: '#F7C343' },
  //         { name: 'Budapest', lat: 47.4979, lng: 19.0402, tz: 'Europe/Budapest', countryCode: 'HU', color: '#52D744' },
  //         { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, tz: 'America/Argentina/Buenos_Aires', countryCode: 'AR', color: '#4477D7' },
  //         { name: 'Cairo', lat: 30.0444, lng: 31.2357, tz: 'Africa/Cairo', countryCode: 'EG', color: '#D84848' },
  //         { name: 'Canberra', lat: -35.2809, lng: 149.1300, tz: 'Australia/Sydney', countryCode: 'AU', color: '#F7C343' },
  //         { name: 'Caracas', lat: 10.4806, lng: -66.9036, tz: 'America/Caracas', countryCode: 'VE', color: '#F78843' },
  //         { name: 'Copenhagen', lat: 55.6761, lng: 12.5683, tz: 'Europe/Copenhagen', countryCode: 'DK', color: '#D84848' },
  //         { name: 'Dakar', lat: 14.7167, lng: -17.4677, tz: 'Africa/Dakar', countryCode: 'SN', color: '#52D744' },
  //     ]
  // }
};