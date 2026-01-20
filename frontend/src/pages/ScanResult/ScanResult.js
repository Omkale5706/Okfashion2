import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ScanResult.css';

const ScanResult = () => {
  const { id } = useParams();
  const [scan, setScan] = useState(null);

  useEffect(() => {
    fetchScan();
  }, [id]);

  const fetchScan = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`/api/scans/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setScan(response.data.data);
  };

  if (!scan) return <p>Loading...</p>;

  const colorPalette = scan.analysis?.colorPalette || [];
  const recommendations = scan.analysis?.recommendations || {};

  return (
    <div className="scan-result">
      <h1>Scan Result</h1>
      <img src={scan.imageUrl} alt="Scan" className="scan-image" />
      <div className="result-details">
        <h3>Analysis</h3>
        <p>Face Shape: {scan.analysis?.faceShape || 'Not available'}</p>
        <p>Skin Tone: {scan.analysis?.skinTone || 'Not available'}</p>
        <p>Body Type: {scan.analysis?.bodyType || 'Not available'}</p>

        {colorPalette.length > 0 && (
          <div>
            <h4>Color Palette</h4>
            <ul>
              {colorPalette.map((item, idx) => (
                <li key={idx}>{item.name || item.color || item.hex}</li>
              ))}
            </ul>
          </div>
        )}

        {recommendations.styles?.length > 0 && (
          <div>
            <h4>Recommended Styles</h4>
            <ul>
              {recommendations.styles.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {recommendations.colors?.length > 0 && (
          <div>
            <h4>Recommended Colors</h4>
            <ul>
              {recommendations.colors.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanResult;
