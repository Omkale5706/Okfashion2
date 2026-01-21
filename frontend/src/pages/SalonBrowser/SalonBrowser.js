import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import Footer from '../../components/Footer/Footer';
import './SalonBrowser.css';
import 'leaflet/dist/leaflet.css';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SalonBrowser = () => {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSalons();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setUserLocation(null);
        }
      );
    }
  }, []);

  const fetchSalons = async () => {
    try {
      const response = await axios.get('/api/partners/salons/search');
      setSalons(response.data.data || []);
    } catch (error) {
      console.error('Error fetching salons:', error);
      setSalons([]);
    } finally {
      setLoading(false);
    }
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
    return salons
      .map((salon) => {
        const coords = getCoords(salon);
        const distance = userLocation && coords ? getDistanceKm(userLocation, coords) : null;
        return { ...salon, distance, coords };
      })
      .sort((a, b) => {
        if (a.distance == null && b.distance == null) return 0;
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });
  }, [salons, userLocation]);

  const mapCenter = useMemo(() => {
    if (userLocation) return userLocation;
    const firstWithCoords = salonsWithDistance.find((salon) => salon.coords);
    return firstWithCoords?.coords || { lat: 19.076, lng: 72.8777 };
  }, [userLocation, salonsWithDistance]);

  return (
    <>
      <div className="salon-browser">
        <h1>Nearby Salons</h1>
        <div className="salon-layout">
          <div className="salon-list">
            {loading && <p className="salon-empty">Loading salons...</p>}
            {!loading && salonsWithDistance.length === 0 && (
              <p className="salon-empty">No salons found yet.</p>
            )}
            {!loading && salonsWithDistance.length > 0 && salonsWithDistance.map((salon) => (
              <div
                key={salon._id}
                className={`salon-card ${selectedSalon?._id === salon._id ? 'active' : ''}`}
                onClick={() => setSelectedSalon(salon)}
              >
                <div>
                  <h3>{salon.name}</h3>
                  <p>{salon.location?.city || salon.location?.address || 'Location not provided'}</p>
                  <p>Rating: {salon.ratings?.average || 0}</p>
                  {salon.distance != null && (
                    <p className="salon-distance">{salon.distance.toFixed(1)} km away</p>
                  )}
                </div>
                <button className="btn-primary" onClick={() => navigate('/ai-stylist')}>
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
          <div className="salon-map">
            <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={false} className="map-container">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {userLocation && (
                <Marker position={userLocation}>
                  <Popup>Your location</Popup>
                </Marker>
              )}
              {salonsWithDistance.map((salon) =>
                salon.coords ? (
                  <Marker key={salon._id} position={salon.coords}>
                    <Popup>
                      <strong>{salon.name}</strong>
                      <br />
                      {salon.location?.city || salon.location?.address}
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SalonBrowser;
