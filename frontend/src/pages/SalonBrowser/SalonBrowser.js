import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import Footer from '../../components/Footer/Footer';
import './SalonBrowser.css';
import 'leaflet/dist/leaflet.css';

const SalonBrowser = () => {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [displayLabel, setDisplayLabel] = useState('');
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [latestScan, setLatestScan] = useState(null);
  const [salonError, setSalonError] = useState('');
  const navigate = useNavigate();
  const radiusKm = 10;
  const markerRefs = useRef({});
  const citySearchRef = useRef(null);

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });

  const LocationSelector = ({ onUseLocation, onSearchCity }) => (
    <div className="location-selector">
      <button className="btn-primary" onClick={onUseLocation}>
        Use my current location
      </button>
      <CitySearchInput onSearchCity={onSearchCity} />
      {locationError && <p className="location-error">{locationError}</p>}
    </div>
  );

  const CitySearchInput = ({ onSearchCity }) => (
    <div className="city-search" ref={citySearchRef}>
      <div className="city-input-wrapper">
        <input
          type="text"
          placeholder="Search city"
          value={cityQuery}
          onChange={(e) => {
            setCityQuery(e.target.value);
            setSelectedCity(null);
            setSuggestionsOpen(true);
          }}
          onFocus={() => {
            if (citySuggestions.length) setSuggestionsOpen(true);
          }}
        />
        <span className="city-helper">Start typing your city</span>
      </div>
      <button
        className="btn-secondary"
        onClick={onSearchCity}
        disabled={!selectedCity}
      >
        Search
      </button>
      {suggestionsOpen && (
        <div className="city-suggestions">
          {cityQuery.trim().length < 2 ? (
            <div className="city-suggestion empty">Start typing your city</div>
          ) : citySuggestions.length === 0 ? (
            <div className="city-suggestion empty">No matching cities found</div>
          ) : (
            citySuggestions.map((item) => (
              <button
                type="button"
                key={`${item.placeId}-${item.name}`}
                className="city-suggestion"
                onClick={() => handleCitySelect(item)}
              >
                {item.displayName}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );

  const SalonCard = ({ salon }) => (
    <div
      className={`salon-card ${selectedSalon?._id === salon._id ? 'active' : ''}`}
      onClick={() => setSelectedSalon(salon)}
    >
      <div className="salon-card-header">
        <h3>{salon.name}</h3>
        {salon.isRecommended && <span className="badge">Recommended for you</span>}
      </div>
      <p className="salon-location">
        {salon.address || salon.location?.city || salon.location?.address || 'Location not provided'}
      </p>
      <div className="salon-meta">
        <span><FaMapMarkerAlt /> {salon.distance != null ? `${salon.distance.toFixed(1)} km` : 'Distance unavailable'}</span>
        <span><FaStar /> {salon.ratings?.average || 0}</span>
      </div>
      <div className="salon-tags">
        {(salon.tags || []).map((tag) => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      <div className="salon-actions">
        <button
          className="btn-secondary"
          onClick={(event) => {
            event.stopPropagation();
            handleDirections(salon);
          }}
        >
          Get Directions
        </button>
        <button
          className="btn-secondary"
          onClick={(event) => {
            event.stopPropagation();
            if (!salon.coords) return;
            const url = `https://www.openstreetmap.org/?mlat=${salon.coords.lat}&mlon=${salon.coords.lng}#map=16/${salon.coords.lat}/${salon.coords.lng}`;
            window.open(url, '_blank');
          }}
        >
          View on Map
        </button>
        <button
          className="btn-primary"
          onClick={(event) => {
            event.stopPropagation();
            navigate('/ai-stylist');
          }}
        >
          Book Appointment
        </button>
      </div>
    </div>
  );

  const SalonList = ({ items }) => (
    <div className="salon-list">
      <div className="salon-list-header">
        <h2>Salons near you</h2>
        <span>Matched using your style & location</span>
      </div>
      {loading && (
        <div className="salon-skeletons">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="salon-card skeleton" key={`skeleton-${index}`}>
              <div className="skeleton-line title"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
              <div className="skeleton-tags">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && items.length === 0 && salons.length === 0 && !salonError && (
        <p className="salon-empty">We could not find salons yet. Try another city or location.</p>
      )}
      {!loading && salonError && (
        <p className="salon-empty">{salonError}</p>
      )}
      {!loading && items.length > 0 && items.map((salon) => (
        <SalonCard key={salon._id} salon={salon} />
      ))}
    </div>
  );

  const MapFocus = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
      if (center) map.setView(center, zoom, { animate: true });
    }, [center, zoom, map]);
    return null;
  };

  const SalonMap = ({ center, items }) => (
    <div className="salon-map">
      <MapContainer center={center} zoom={selectedSalon ? 14 : 13} scrollWheelZoom={false} className="map-container">
        <MapFocus center={center} zoom={selectedSalon ? 14 : 13} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>Your location</Popup>
          </Marker>
        )}
        {items.map((salon) =>
          salon.coords ? (
            <Marker
              key={salon._id}
              position={salon.coords}
              ref={(ref) => {
                if (ref) markerRefs.current[salon._id] = ref;
              }}
            >
              <Popup>
                <strong>{salon.name}</strong>
                <br />
                {salon.address || 'Address not available'}
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );

  useEffect(() => {
    const saved = localStorage.getItem('okf-location');
    if (saved) {
      const preference = JSON.parse(saved);
      if (preference.type === 'geo') {
        setUserLocation(preference.coords);
        setDisplayLabel('Showing salons near you');
      }
      if (preference.type === 'city') {
        setSelectedCity({
          name: preference.city,
          displayName: preference.city,
          coords: preference.coords,
        });
        setCityQuery(preference.city);
        setUserLocation(preference.coords);
        setDisplayLabel(`Showing salons in ${preference.city}`);
      }
      if (preference?.coords) {
        fetchSalonsByCoords(preference.coords);
      }
    }
    fetchLatestScan();
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if (!citySearchRef.current) return;
      if (!citySearchRef.current.contains(event.target)) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const query = cityQuery.trim();
    if (query.length < 2) {
      setCitySuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`
        );
        const data = await response.json();
        const mapped = (data || []).map((item) => {
          const name =
            item.address?.city ||
            item.address?.town ||
            item.address?.village ||
            item.address?.county ||
            item.name ||
            query;
          return {
            placeId: item.place_id,
            name,
            displayName: item.display_name,
            coords: { lat: parseFloat(item.lat), lng: parseFloat(item.lon) }
          };
        });
        setCitySuggestions(mapped);
        setSuggestionsOpen(true);
      } catch (error) {
        console.error('City suggestion error:', error);
        setCitySuggestions([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [cityQuery]);

  const fetchSalonsByCoords = async ({ lat, lng }) => {
    try {
      setLoading(true);
      setSalonError('');
      const response = await axios.get('https://overpass-api.de/api/interpreter', {
        params: {
          data: `[out:json];(node["shop"="hairdresser"](around:${radiusKm * 1000},${lat},${lng});node["shop"="beauty"](around:${radiusKm * 1000},${lat},${lng});node["amenity"="salon"](around:${radiusKm * 1000},${lat},${lng}););out;`
        }
      });
      const elements = response.data.elements || [];
      const parsed = elements.map((node) => ({
        _id: `osm-${node.id}`,
        name: node.tags?.name || 'Salon',
        lat: node.lat,
        lng: node.lon,
        address: [node.tags?.['addr:street'], node.tags?.['addr:city']].filter(Boolean).join(', '),
        tags: [node.tags?.shop, node.tags?.amenity].filter(Boolean),
      }));
      setSalons(parsed);
      setDisplayLabel('Showing salons near you');
      setSalonError('');
    } catch (error) {
      console.error('Error fetching salons:', error);
      setSalons([]);
      setSalonError('Unable to load salons from OpenStreetMap.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestScan = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get('/api/scans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const scans = response.data.data || [];
      if (scans.length > 0) {
        setLatestScan(scans[0]);
      }
    } catch (error) {
      console.error('Error loading scans:', error);
    }
  };

  const handleUseLocation = () => {
    setLocationStatus('loading');
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationStatus('denied');
      setLocationError('Geolocation not supported. Please search by city.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setDisplayLabel('Showing salons near you');
        localStorage.setItem('okf-location', JSON.stringify({ type: 'geo', coords }));
        setLocationStatus('success');
        fetchSalonsByCoords(coords);
      },
      () => {
        setLocationStatus('denied');
        setLocationError('Location access denied. Please select a city.');
      }
    );
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setCityQuery(city.name);
    setSuggestionsOpen(false);
    setCitySuggestions([]);
    applyCitySelection(city);
  };

  const applyCitySelection = (city) => {
    if (!city?.coords) return;
    setLocationStatus('loading');
    setLocationError('');
    setUserLocation(city.coords);
    setDisplayLabel(`Showing salons in ${city.name}`);
    localStorage.setItem(
      'okf-location',
      JSON.stringify({ type: 'city', city: city.name, coords: city.coords })
    );
    fetchSalonsByCoords(city.coords);
    setLocationStatus('success');
  };

  const geocodeCity = async () => {
    if (!selectedCity) return;
    applyCitySelection(selectedCity);
  };

  const getCoords = (salon) => {
    const coords = salon.location?.coordinates;
    if (!coords?.latitude || !coords?.longitude) return null;
    return { lat: coords.latitude, lng: coords.longitude };
  };

  const getDistanceKm = (from, to) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(to.lat - from.lat);
    const dLng = toRad(to.lng - from.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const salonsWithDistance = useMemo(() => {
    if (!salons.length) return [];
    const enriched = salons.map((salon) => {
      const coords = salon.lat && salon.lng ? { lat: salon.lat, lng: salon.lng } : getCoords(salon);
      const distance = userLocation && coords ? getDistanceKm(userLocation, coords) : null;
      const tags = (salon.services || [])
        .map((service) => service.serviceName)
        .filter(Boolean)
        .slice(0, 4);
      const isRecommended = Boolean(
        latestScan && tags.some((tag) => tag.toLowerCase().includes('hair'))
      );
      return { ...salon, distance, coords, tags, isRecommended, _id: salon._id };
    });

    const sorted = enriched.sort((a, b) => {
      if (a.distance == null && b.distance == null) return 0;
      if (a.distance == null) return 1;
      if (b.distance == null) return -1;
      return a.distance - b.distance;
    });

    if (!userLocation) return sorted;
    const withinRadius = sorted.filter((salon) => salon.distance != null && salon.distance <= radiusKm);
    return withinRadius.length ? withinRadius : sorted;
  }, [salons, userLocation, latestScan]);

  useEffect(() => {
    console.log('Salons list:', salonsWithDistance);
  }, [salonsWithDistance]);

  const mapCenter = useMemo(() => {
    if (selectedSalon?.coords) return selectedSalon.coords;
    if (userLocation) return userLocation;
    const firstWithCoords = salonsWithDistance.find((salon) => salon.coords);
    return firstWithCoords?.coords || { lat: 19.076, lng: 72.8777 };
  }, [userLocation, salonsWithDistance, selectedSalon]);

  useEffect(() => {
    if (selectedSalon?.coords && markerRefs.current[selectedSalon._id]) {
      markerRefs.current[selectedSalon._id].openPopup();
    }
  }, [selectedSalon]);

  const handleDirections = (salon) => {
    if (!salon.coords || !userLocation) return;
    const destination = `${salon.coords.lat},${salon.coords.lng}`;
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${origin};${destination}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <div className="salon-browser">
        <div className="salon-header">
          <div>
            <h1>Nearby Salons</h1>
            <p className="salon-subtitle">
              {displayLabel || 'Find salons near your location or favorite city.'}
            </p>
            <span className="salon-micro">Salons matched using your style & location</span>
          </div>
        </div>

        <LocationSelector
          onUseLocation={handleUseLocation}
          onSearchCity={geocodeCity}
        />

        <div className="salon-layout">
          <SalonMap center={mapCenter} items={salonsWithDistance} />
          <SalonList items={salonsWithDistance} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SalonBrowser;
