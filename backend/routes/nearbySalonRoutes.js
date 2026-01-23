const express = require('express');
const { getNearbySalons, geocodeCity } = require('../controllers/nearbySalonController');

const router = express.Router();

router.get('/', getNearbySalons);
router.get('/geocode', geocodeCity);

module.exports = router;
