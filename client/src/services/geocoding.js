git /**
 * Reverse geocodes coordinates (lat, lng) to a human-readable address name 
 * using the free OpenStreetMap Nominatim API.
 */
export const getAddressFromCoords = async (lat, lng) => {
  if (!lat || !lng) return 'Unknown Location';
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'Smart-Blood-Testing-App',
        },
      }
    );
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();
    const addr = data.address;

    // Pick the most relevant parts for a short, readable address
    const parts = [
      addr.road || addr.suburb || addr.neighbourhood,
      addr.city || addr.town || addr.village,
      addr.state
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : data.display_name.split(',').slice(0, 3).join(', ');
  } catch (err) {
    console.error('Reverse geocoding error:', err);
    return 'Location name unavailable';
  }
};
