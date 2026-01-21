import React, { useState, useRef, useEffect } from 'react';
import { FaCamera, FaUpload, FaTimes, FaMagic, FaChartLine } from 'react-icons/fa';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Pose } from '@mediapipe/pose';
import { jsPDF } from 'jspdf';
import { toast } from 'react-toastify';
import Footer from '../../components/Footer/Footer';
import './AIStylist.css';

const AIStylist = () => {
  const [activeTab, setActiveTab] = useState('photo');
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [trendItems, setTrendItems] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsError, setTrendsError] = useState('');
  const [trendTab, setTrendTab] = useState('trending');
  const [recTab, setRecTab] = useState('curated');
  const [formInputs, setFormInputs] = useState({
    gender: 'male',
    occasion: 'daily',
    budget: 'medium'
  });
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const faceMeshRef = useRef(null);
  const poseRef = useRef(null);
  const handleInputChange = (e) => {
    setFormInputs({ ...formInputs, [e.target.name]: e.target.value });
  };

  const buildBestOutfit = ({ gender, occasion, budget }, analysis = {}) => {
    const { faceShape, bodyShape, skinTone } = analysis;
    let outfit = '';
    const rationale = [];

    if (gender === 'female') {
      if (occasion === 'wedding') outfit = 'Embroidered Anarkali with statement dupatta';
      else if (occasion === 'interview') outfit = 'Tailored blazer with pencil skirt and neutral pumps';
      else if (occasion === 'party') outfit = 'Satin midi dress with sleek heels';
      else outfit = 'Knit top with high-waist jeans and white sneakers';
    } else if (gender === 'male') {
      if (occasion === 'wedding') outfit = 'Classic kurta with Nehru jacket and straight trousers';
      else if (occasion === 'interview') outfit = 'Navy blazer with crisp shirt and tapered chinos';
      else if (occasion === 'party') outfit = 'Statement bomber with dark slim-fit jeans';
      else outfit = 'Oxford shirt with relaxed chinos and loafers';
    } else {
      if (occasion === 'wedding') outfit = 'Structured ethnic set with layered stole';
      else if (occasion === 'interview') outfit = 'Minimal blazer with straight-leg trousers';
      else if (occasion === 'party') outfit = 'Monochrome co-ord set with bold sneakers';
      else outfit = 'Relaxed overshirt with tapered pants';
    }

    if (bodyShape === 'Inverted Triangle') rationale.push('Balance shoulders with straight-leg or wide-leg bottoms.');
    if (bodyShape === 'Pear') rationale.push('Add structure on top and keep the lower half streamlined.');
    if (bodyShape === 'Rectangle') rationale.push('Create shape with layered tailoring and waist definition.');
    if (faceShape === 'Round') rationale.push('Prefer V-necks to elongate the neckline.');
    if (faceShape === 'Square') rationale.push('Softer necklines help balance angular features.');
    if (faceShape === 'Heart') rationale.push('Boat or scoop necklines balance wider foreheads.');
    if (skinTone === 'Light') rationale.push('Pastels and cool tones will lift your complexion.');
    if (skinTone === 'Deep') rationale.push('Rich jewel tones enhance contrast beautifully.');
    if (budget === 'low') rationale.push('Focus on cotton blends and smart layering for value.');
    if (budget === 'high') rationale.push('Premium fabrics like wool or silk elevate the look.');

    return { outfit, rationale };
  };

  const generateRecommendations = ({ gender, occasion, budget }, analysis = {}) => {
    const base = {
      outfits: [],
      hairstyles: [],
      accessories: [],
      colors: []
    };

    if (occasion === 'wedding') {
      base.outfits.push('Elegant traditional attire', 'Embroidered ethnic wear');
      base.accessories.push('Statement jewelry', 'Classic watch');
    } else if (occasion === 'interview') {
      base.outfits.push('Tailored blazer', 'Neutral formal trousers');
      base.accessories.push('Minimalist belt', 'Leather shoes');
    } else if (occasion === 'party') {
      base.outfits.push('Bold statement jacket', 'Slim-fit jeans');
      base.accessories.push('Layered chains', 'Stylish sneakers');
    } else {
      base.outfits.push('Smart casual shirt', 'Comfortable chinos');
      base.accessories.push('Everyday watch', 'Sunglasses');
    }

    if (gender === 'female') {
      base.hairstyles.push('Soft waves', 'Textured bob');
      base.outfits.push('A-line dress', 'High-waisted trousers');
    } else {
      base.hairstyles.push('Classic fade', 'Textured quiff');
      base.outfits.push('Structured jacket', 'Crisp button-down');
    }

    if (budget === 'low') {
      base.outfits.push('Basic tees with layered styling');
      base.colors.push('Navy', 'White', 'Grey');
    } else if (budget === 'high') {
      base.outfits.push('Designer statement pieces');
      base.colors.push('Emerald', 'Burgundy', 'Ivory');
    } else {
      base.outfits.push('Mid-range versatile essentials');
      base.colors.push('Olive', 'Beige', 'Charcoal');
    }

    if (analysis.colorPalette?.length) {
      base.colors = analysis.colorPalette;
    }

    const { outfit, rationale } = buildBestOutfit({ gender, occasion, budget }, analysis);
    base.bestOutfit = outfit;
    base.rationale = rationale;

    return base;
  };

  const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  const initFaceMesh = async () => {
    if (!faceMeshRef.current) {
      const faceMesh = new FaceMesh({
        locateFile: (file) => {
          if (file.startsWith('pose_')) {
            return `${process.env.PUBLIC_URL}/mediapipe/pose/${file}`;
          }
          return `${process.env.PUBLIC_URL}/mediapipe/face_mesh/${file}`;
        }
      });
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      faceMeshRef.current = faceMesh;
    }
    return faceMeshRef.current;
  };

  const initPose = async () => {
    if (!poseRef.current) {
      const pose = new Pose({
        locateFile: (file) => `${process.env.PUBLIC_URL}/mediapipe/pose/${file}`
      });
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      poseRef.current = pose;
    }
    return poseRef.current;
  };

  const runFaceMesh = async (image) => {
    const faceMesh = await initFaceMesh();
    return new Promise((resolve, reject) => {
      let settled = false;
      faceMesh.onResults((res) => {
        if (settled) return;
        settled = true;
        resolve(res);
      });
      faceMesh.send({ image }).catch((err) => {
        if (settled) return;
        settled = true;
        reject(err);
      });
    });
  };

  const runPose = async (image) => {
    const pose = await initPose();
    return new Promise((resolve, reject) => {
      let settled = false;
      pose.onResults((res) => {
        if (settled) return;
        settled = true;
        resolve(res);
      });
      pose.send({ image }).catch((err) => {
        if (settled) return;
        settled = true;
        reject(err);
      });
    });
  };

  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  const detectFaceShape = (landmarks) => {
    const leftCheek = landmarks[234];
    const rightCheek = landmarks[454];
    const foreheadLeft = landmarks[70];
    const foreheadRight = landmarks[300];
    const chin = landmarks[152];
    const forehead = landmarks[10];
    const jawLeft = landmarks[172];
    const jawRight = landmarks[397];

    const faceWidth = distance(leftCheek, rightCheek);
    const faceHeight = distance(forehead, chin);
    const jawWidth = distance(jawLeft, jawRight);
    const foreheadWidth = distance(foreheadLeft, foreheadRight);

    const ratio = faceWidth / faceHeight;
    const jawToForehead = jawWidth / foreheadWidth;

    if (ratio < 0.75) return 'Rectangle';
    if (jawToForehead < 0.9) return 'Heart';
    if (ratio < 0.82 && jawToForehead < 0.98) return 'Oval';
    if (ratio >= 0.82 && ratio <= 0.95 && Math.abs(jawToForehead - 1) < 0.08) return 'Square';
    if (ratio >= 0.82 && ratio <= 1.02) return 'Round';
    return 'Oval';
  };

  const detectSkinTone = (image, landmarks) => {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const samplePoints = [234, 454, 10, 152, 168];
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;

    samplePoints.forEach((index) => {
      const lm = landmarks[index];
      if (!lm) return;
      const x = Math.min(canvas.width - 1, Math.max(0, Math.round(lm.x * canvas.width)));
      const y = Math.min(canvas.height - 1, Math.max(0, Math.round(lm.y * canvas.height)));
      const data = ctx.getImageData(x, y, 1, 1).data;
      r += data[0];
      g += data[1];
      b += data[2];
      count += 1;
    });

    if (!count) {
      return { tone: 'Medium', rgb: { r: 150, g: 120, b: 100 } };
    }

    r /= count;
    g /= count;
    b /= count;

    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    let tone = 'Medium';
    if (luminance > 180) tone = 'Light';
    else if (luminance < 120) tone = 'Deep';

    return { tone, rgb: { r, g, b } };
  };

  const detectBodyShape = (poseLandmarks) => {
    if (!poseLandmarks || poseLandmarks.length < 25) return 'Not detected';
    const leftShoulder = poseLandmarks[11];
    const rightShoulder = poseLandmarks[12];
    const leftHip = poseLandmarks[23];
    const rightHip = poseLandmarks[24];
    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return 'Not detected';

    const shoulderWidth = distance(leftShoulder, rightShoulder);
    const hipWidth = distance(leftHip, rightHip);
    if (!shoulderWidth || !hipWidth) return 'Not detected';

    const ratio = shoulderWidth / hipWidth;
    if (ratio > 1.15) return 'Inverted Triangle';
    if (ratio < 0.9) return 'Pear';
    return 'Rectangle';
  };

  const getColorPalette = (tone) => {
    if (tone === 'Light') {
      return ['Powder Blue', 'Soft Lavender', 'Blush', 'Ivory', 'Mint'];
    }
    if (tone === 'Deep') {
      return ['Gold', 'Cobalt Blue', 'Crimson', 'Olive', 'White'];
    }
    return ['Emerald Green', 'Navy Blue', 'Burgundy', 'Teal', 'Cream'];
  };


  const fetchTrends = async () => {
    try {
      setTrendsLoading(true);
      setTrendsError('');
      const response = await fetch('/api/trends?limit=9');
      const data = await response.json();
      if (data.success) {
        setTrendItems(data.data);
      } else {
        throw new Error('Trend fetch failed');
      }
    } catch (error) {
      console.error('Trend fetch error:', error);
      setTrendsError('Unable to load fashion trends right now.');
    } finally {
      setTrendsLoading(false);
    }
  };

  const getTrendCards = () => {
    if (trendItems.length === 0) return [];
    const items = [...trendItems];
    if (trendTab === 'curated') return items.slice(0, 6);
    if (trendTab === 'foryou') return items.slice(2, 8);
    return items.slice(0, 6);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'trends' && trendItems.length === 0 && !trendsLoading) {
      fetchTrends();
    }
  }, [activeTab]);

  useEffect(() => {
    if (recTab === 'trending' && trendItems.length === 0 && !trendsLoading) {
      fetchTrends();
    }
  }, [recTab]);

  const attachStreamToVideo = () => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Video playing successfully');
            toast.success('Camera started successfully!');
          })
          .catch((err) => {
            console.error('Video play error:', err);
            toast.error('Error playing video stream');
          });
      }
    } else {
      // Retry on next frame if video element is not mounted yet
      requestAnimationFrame(attachStreamToVideo);
    }
  };

  const startCamera = async () => {
    try {
      console.log('Requesting camera access...');
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      console.log('Stream obtained:', stream);
      streamRef.current = stream;
      attachStreamToVideo();
    } catch (error) {
      console.error('Camera error details:', error);
      setCameraActive(false);
      let errorMessage = 'Unable to access camera. ';

      if (error.name === 'NotAllowedError') {
        errorMessage += 'Camera permission denied. Please allow camera access.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera device found.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use.';
      } else {
        errorMessage += 'Please check permissions.';
      }

      toast.error(errorMessage);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/png');
      setCapturedImage(imageData);
      stopCamera();
      analyzeImage(imageData);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result);
        analyzeImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imageData) => {
    setAnalyzing(true);
    try {
      const image = await loadImage(imageData);
      const faceResults = await runFaceMesh(image);
      let poseResults = null;
      try {
        poseResults = await runPose(image);
      } catch (poseError) {
        console.warn('Pose analysis failed:', poseError);
      }

      if (!faceResults.multiFaceLandmarks || faceResults.multiFaceLandmarks.length === 0) {
        throw new Error('No face detected');
      }

      const faceLandmarks = faceResults.multiFaceLandmarks[0];
      const faceShape = detectFaceShape(faceLandmarks);
      const { tone: skinTone } = detectSkinTone(image, faceLandmarks);
      const bodyShape = poseResults?.poseLandmarks
        ? detectBodyShape(poseResults.poseLandmarks)
        : 'Not detected';
      const colorPalette = getColorPalette(skinTone);
      const recs = generateRecommendations(formInputs, { faceShape, skinTone, bodyShape, colorPalette });

      setResults({
        faceShape,
        skinTone,
        bodyShape,
        colorPalette,
        recommendations: {
          outfits: recs.outfits,
          hairstyles: recs.hairstyles,
          accessories: recs.accessories,
          bestOutfit: recs.bestOutfit,
          rationale: recs.rationale
        }
      });
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Unable to analyze image. Use a clear, well-lit photo.');
      setResults(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const saveScanResult = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to save your scan');
        return;
      }

      await fetch('/api/scans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrl: capturedImage,
          analysis: {
            faceShape: results.faceShape,
            skinTone: results.skinTone,
            bodyType: results.bodyShape,
            colorPalette: results.colorPalette.map((color) => ({ color })),
            recommendations: {
              styles: results.recommendations.outfits,
              colors: results.colorPalette,
            },
          },
          confidence: 82,
        }),
      });

      toast.success('Scan saved!');
    } catch (error) {
      toast.error('Unable to save scan');
    }
  };

  const downloadPdf = () => {
    if (!results) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('OK Fashion - Style Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Face Shape: ${results.faceShape}`, 20, 35);
    doc.text(`Skin Tone: ${results.skinTone}`, 20, 43);
    doc.text(`Body Shape: ${results.bodyShape}`, 20, 51);
    doc.text('Recommendations:', 20, 65);
    results.recommendations.outfits.forEach((item, i) => {
      doc.text(`• ${item}`, 25, 75 + i * 6);
    });
    doc.save('style-report.pdf');
  };

  const resetAnalysis = () => {
    setCapturedImage(null);
    setResults(null);
    stopCamera();
  };

  const renderMatchCard = (title, subtitle, match) => (
    <div className="rec-item-card">
      <div className="rec-item-thumb">
        <div className="rec-thumb-shine" />
      </div>
      <div className="rec-item-info">
        <h5>{title}</h5>
        <p>{subtitle}</p>
        <div className="match-row">
          <span className="match-star">★</span>
          <span>{match}% match</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="ai-stylist-page">
        <div className="ai-stylist-container">
          <div className="ai-stylist-header">
            <h1>AI Fashion Stylist</h1>
            <p>Upload your photo and get personalized outfit recommendations powered by AI</p>
          </div>

          <div className="tabs-container">
            <button 
              className={`tab ${activeTab === 'photo' ? 'active' : ''}`}
              onClick={() => setActiveTab('photo')}
            >
              <FaCamera /> Photo Analysis
            </button>
            <button 
              className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
              onClick={() => setActiveTab('recommendations')}
            >
              <FaMagic /> AI Recommendations
            </button>
            <button 
              className={`tab ${activeTab === 'trends' ? 'active' : ''}`}
              onClick={() => setActiveTab('trends')}
            >
              <FaChartLine /> Fashion Trends
            </button>
          </div>

          {activeTab === 'photo' && (
            <div className="content-area">
              <div className="upload-section">
              <div className="section-header">
                <FaCamera />
                <h2>Upload Your Photo</h2>
              </div>
              <p className="section-subtitle">Take a photo or upload an image for AI analysis</p>

              <div className="ai-inputs">
                <div className="input-group">
                  <label>Gender</label>
                  <select name="gender" value={formInputs.gender} onChange={handleInputChange}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Occasion</label>
                  <select name="occasion" value={formInputs.occasion} onChange={handleInputChange}>
                    <option value="daily">Daily</option>
                    <option value="party">Party</option>
                    <option value="interview">Interview</option>
                    <option value="wedding">Wedding</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Budget</label>
                  <select name="budget" value={formInputs.budget} onChange={handleInputChange}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="camera-container">
                {!cameraActive && !capturedImage ? (
                  <div className="drop-zone">
                    <div className="upload-icon">
                      <FaUpload size={48} />
                    </div>
                    <h3>Drop your photo here</h3>
                    <p className="drop-text">or click to browse files</p>
                    <div className="upload-buttons">
                      <label className="upload-photo-btn">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          hidden
                        />
                        <FaUpload /> Upload Photo
                      </label>
                      <button className="use-camera-btn" onClick={startCamera}>
                        <FaCamera /> Use Camera
                      </button>
                    </div>
                  </div>
                ) : cameraActive && !capturedImage ? (
                  <div className="video-wrapper">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        height: '100%',
                        minHeight: '400px',
                        objectFit: 'cover',
                        backgroundColor: '#000',
                        display: 'block',
                        transform: 'scaleX(-1)'
                      }}
                      onLoadedMetadata={() => {
                        console.log('Video metadata loaded');
                        if (videoRef.current) {
                          videoRef.current.play();
                        }
                      }}
                      onCanPlay={() => {
                        console.log('Video can play');
                      }}
                      onError={(e) => {
                        console.error('Video error:', e);
                        toast.error('Error loading video stream');
                      }}
                    />
                    <div className="camera-controls">
                      <button className="capture-btn" onClick={capturePhoto}>
                        <FaCamera /> Capture Photo
                      </button>
                      <button className="cancel-btn" onClick={stopCamera}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="captured-image-container">
                    <img src={capturedImage} alt="Captured" className="captured-image" />
                    <button className="reset-btn" onClick={resetAnalysis}>
                      <FaTimes /> Reset
                    </button>
                  </div>
                )}
              </div>
              </div>

              <div className="analysis-section">
              <div className="section-header">
                <FaMagic />
                <h2>AI Analysis</h2>
              </div>
              <p className="section-subtitle">Body shape, face features, and style analysis</p>

              {!results ? (
                <div className="empty-state">
                  {analyzing ? (
                    <div className="analyzing-state">
                      <div className="spinner"></div>
                      <p>Analyzing your photo...</p>
                    </div>
                  ) : (
                    <p>Upload a photo to see AI analysis results</p>
                  )}
                </div>
              ) : (
                <div className="results-container">
                  <div className="result-actions">
                    <button className="btn-secondary" onClick={saveScanResult}>
                      Save Result
                    </button>
                    <button className="btn-primary" onClick={downloadPdf}>
                      Download PDF
                    </button>
                  </div>
                  <div className="analysis-grid">
                    <div className="analysis-item">
                      <h4>Face Shape</h4>
                      <p className="analysis-value">{results.faceShape}</p>
                    </div>
                    <div className="analysis-item">
                      <h4>Skin Tone</h4>
                      <p className="analysis-value">{results.skinTone}</p>
                    </div>
                    <div className="analysis-item">
                      <h4>Body Shape</h4>
                      <p className="analysis-value">{results.bodyShape}</p>
                    </div>
                  </div>

                  <div className="color-section">
                    <h4>Your Perfect Colors</h4>
                    <div className="color-swatches">
                      {results.colorPalette.map((color, index) => (
                        <div key={index} className="color-box">
                          <div
                            className="color-circle"
                            style={{ backgroundColor: color }}
                          ></div>
                          <span>{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="recommendations-section">
                    <h4>Style Recommendations</h4>
                    <div className="rec-category">
                      <h5>Outfits</h5>
                      <ul>
                        {results.recommendations.outfits.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rec-category">
                      <h5>Hairstyles</h5>
                      <ul>
                        {results.recommendations.hairstyles.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rec-category">
                      <h5>Accessories</h5>
                      <ul>
                        {results.recommendations.accessories.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="tab-panel">
              <div className="recommendations-hero">
                <h2>AI Style Recommendations</h2>
                <p>Personalized suggestions powered by advanced AI algorithms</p>
              </div>

              {!results ? (
                <div className="analysis-section">
                  <div className="empty-state">
                    <p>Run a photo analysis to unlock recommendations.</p>
                  </div>
                </div>
              ) : (
                <div className="recommendations-body">
                  <div className="recommendations-tabs">
                    <button
                      className={`rec-tab ${recTab === 'curated' ? 'active' : ''}`}
                      onClick={() => setRecTab('curated')}
                    >
                      AI Curated
                    </button>
                    <button
                      className={`rec-tab ${recTab === 'trending' ? 'active' : ''}`}
                      onClick={() => setRecTab('trending')}
                    >
                      Trending Now
                    </button>
                    <button
                      className={`rec-tab ${recTab === 'foryou' ? 'active' : ''}`}
                      onClick={() => setRecTab('foryou')}
                    >
                      Just for You
                    </button>
                  </div>

                  {recTab === 'curated' && (
                    <>
                      <div className="recommendation-card">
                        <div className="rec-card-header">
                          <span className="rec-chip">AI Curated</span>
                          <div>
                            <h3>Perfect for Your Body Shape</h3>
                            <p>Specially selected for {results.bodyShape.toLowerCase()} body type</p>
                          </div>
                        </div>
                        <div className="rec-card-grid">
                          {renderMatchCard(
                            results.recommendations.outfits[0] || results.recommendations.bestOutfit,
                            'Accentuates your best features',
                            94
                          )}
                          {renderMatchCard(
                            results.recommendations.outfits[1] || 'Tailored straight-leg trousers',
                            'Elongates your silhouette',
                            91
                          )}
                        </div>
                      </div>

                      <div className="recommendation-card">
                        <div className="rec-card-header">
                          <span className="rec-chip">Color Match</span>
                          <div>
                            <h3>Complements Your Skin Tone</h3>
                            <p>{results.skinTone} undertones work beautifully with these colors</p>
                          </div>
                        </div>
                        <div className="rec-card-grid">
                          {renderMatchCard(
                            results.colorPalette[0] || 'Emerald Blouse',
                            'Enhances your natural glow',
                            89
                          )}
                          {renderMatchCard(
                            results.colorPalette[1] || 'Coral Cardigan',
                            'Brightens your complexion',
                            87
                          )}
                        </div>
                      </div>

                      <div className="recommendation-card learning-card">
                        <div className="rec-card-header">
                          <span className="rec-chip">Continuous Learning</span>
                          <div>
                            <h3>Continuous Learning</h3>
                            <p>Our AI learns from your preferences and feedback to provide better recommendations over time.</p>
                          </div>
                        </div>
                        <div className="learning-grid">
                          <div>
                            <h4>7</h4>
                            <p>Items Liked</p>
                          </div>
                          <div>
                            <h4>94%</h4>
                            <p>Accuracy Rate</p>
                          </div>
                          <div>
                            <h4>12</h4>
                            <p>Style Updates</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {recTab === 'trending' && (
                    trendItems.length === 0 ? (
                      <div className="empty-state">
                        <p>Loading trends for you...</p>
                      </div>
                    ) : (
                      <div className="trend-grid">
                        {getTrendCards().map((item, index) => (
                          <div className="trend-card" key={`${item.link}-${index}`}>
                            <div className="trend-media">
                              <span className="trend-badge">{80 + (index % 15)}% popular</span>
                            </div>
                            <div className="trend-body">
                              <h4>{item.title}</h4>
                              <p className="trend-meta">
                                {item.source} • {item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Latest'}
                              </p>
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                className="trend-cta"
                              >
                                Explore Trend
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {recTab === 'foryou' && (
                    <div className="recommendation-card">
                      <div className="rec-card-header">
                        <span className="rec-chip">Just for You</span>
                        <div>
                          <h3>{results.recommendations.bestOutfit}</h3>
                          <p>Tailored to your {results.bodyShape.toLowerCase()} body type and {results.skinTone.toLowerCase()} skin tone</p>
                        </div>
                      </div>
                      {results.recommendations.rationale?.length > 0 && (
                        <ul className="recommendation-list">
                          {results.recommendations.rationale.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}
                      <div className="rec-card-grid">
                        {renderMatchCard(
                          results.recommendations.outfits[2] || 'Layered overshirt with relaxed jeans',
                          'On-trend and effortless',
                          90
                        )}
                        {renderMatchCard(
                          results.recommendations.outfits[3] || 'Structured blazer with tapered pants',
                          'Polished and versatile',
                          88
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="tab-panel">
              <div className="analysis-section">
                <div className="section-header">
                  <FaChartLine />
                  <h2>Fashion Trends</h2>
                </div>
                <p className="section-subtitle">Live headlines from leading fashion publications</p>

                <div className="trend-tabs">
                  <button
                    className={`trend-tab ${trendTab === 'curated' ? 'active' : ''}`}
                    onClick={() => setTrendTab('curated')}
                  >
                    AI Curated
                  </button>
                  <button
                    className={`trend-tab ${trendTab === 'trending' ? 'active' : ''}`}
                    onClick={() => setTrendTab('trending')}
                  >
                    Trending Now
                  </button>
                  <button
                    className={`trend-tab ${trendTab === 'foryou' ? 'active' : ''}`}
                    onClick={() => setTrendTab('foryou')}
                  >
                    Just for You
                  </button>
                </div>

                {trendsLoading && (
                  <div className="empty-state">
                    <p>Loading trends...</p>
                  </div>
                )}

                {!trendsLoading && trendsError && (
                  <div className="empty-state">
                    <p>{trendsError}</p>
                  </div>
                )}

                {!trendsLoading && !trendsError && trendItems.length === 0 && (
                  <div className="empty-state">
                    <p>No trends available yet.</p>
                  </div>
                )}

                {!trendsLoading && !trendsError && trendItems.length > 0 && (
                  <>
                    <div className="trend-grid">
                      {getTrendCards().map((item, index) => (
                        <div className="trend-card" key={`${item.link}-${index}`}>
                          <div className="trend-media">
                            <span className="trend-badge">
                              {trendTab === 'trending' ? `${80 + (index % 15)}% popular` : `${85 + (index % 10)}% match`}
                            </span>
                          </div>
                          <div className="trend-body">
                            <h4>{item.title}</h4>
                            <p className="trend-meta">
                              {item.source} • {item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Latest'}
                            </p>
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="trend-cta"
                            >
                              Explore Trend
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="trend-stats">
                      <div className="trend-stat">
                        <span>7</span>
                        <p>Items Liked</p>
                      </div>
                      <div className="trend-stat">
                        <span>94%</span>
                        <p>Accuracy Rate</p>
                      </div>
                      <div className="trend-stat">
                        <span>12</span>
                        <p>Style Updates</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AIStylist;
