const axios = require('axios');

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

const mapPlace = (place) => ({
  name: place.name,
  lat: place.geometry?.location?.lat,
  lng: place.geometry?.location?.lng,
  rating: place.rating || 0,
  address: place.vicinity || place.formatted_address || '',
  placeId: place.place_id,
});

// @desc    Get nearby salons using Google Places
// @route   GET /api/nearby-salons?lat=&lng=&radius=
// @access  Public
exports.getNearbySalons = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!GOOGLE_PLACES_API_KEY) {
      return res.status(500).json({ message: 'Google Places API key missing.' });
    }

    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng are required.' });
    }

    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    const response = await axios.get(url, {
      params: {
        key: GOOGLE_PLACES_API_KEY,
        location: `${lat},${lng}`,
        radius,
        type: 'hair_salon',
      },
    });

    const results = (response.data.results || []).map(mapPlace).filter((place) => place.lat && place.lng);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Nearby salons error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Unable to fetch salons from Google Places.' });
  }
};

// @desc    Geocode city name using Google Geocoding
// @route   GET /api/nearby-salons/geocode?city=
// @access  Public
exports.geocodeCity = async (req, res) => {
  try {
    const { city } = req.query;

    if (!GOOGLE_PLACES_API_KEY) {
      return res.status(500).json({ message: 'Google Places API key missing.' });
    }

    if (!city) {
      return res.status(400).json({ message: 'city is required.' });
    }

    const url = 'https://maps.googleapis.com/maps/api/geocode/json';
    const response = await axios.get(url, {
      params: {
        key: GOOGLE_PLACES_API_KEY,
        address: city,
      },
    });

    const result = response.data.results?.[0];
    if (!result) {
      return res.status(404).json({ message: 'City not found.' });
    }

    res.json({
      success: true,
      data: {
        city: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
    });
  } catch (error) {
    console.error('Geocode error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Unable to geocode city.' });
  }
};
