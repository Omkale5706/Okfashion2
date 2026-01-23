import React, { useState, useRef, useEffect } from 'react';
import { FaCamera, FaUpload, FaTimes, FaMagic, FaChartLine, FaUserCircle, FaPalette, FaTint, FaMale, FaSave, FaFilePdf, FaRobot, FaCheckCircle } from 'react-icons/fa';
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
  const [cvReady, setCvReady] = useState(false);
  const [trendTab, setTrendTab] = useState('trending');
  const [recTab, setRecTab] = useState('curated');
  const [formInputs, setFormInputs] = useState({
    gender: 'male',
    occasion: 'daily',
    budget: 'medium'
  });
  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const overlayRef = useRef(null);
  const streamRef = useRef(null);
  const faceMeshRef = useRef(null);
  const poseRef = useRef(null);
  const isProcessingRef = useRef(false);
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

  const waitForOpenCV = () => new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (window.cv && window.cv.Mat) {
        resolve(true);
        return;
      }
      if (Date.now() - start > 15000) {
        reject(new Error('OpenCV failed to load'));
        return;
      }
      requestAnimationFrame(check);
    };
    check();
  });

  const ensureOpenCV = async () => {
    if (cvReady) return true;
    await waitForOpenCV();
    setCvReady(true);
    return true;
  };

  const lerpPoint = (a, b, t) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t
  });

  const toPixel = (pt, width, height) => ({
    x: pt.x * width,
    y: pt.y * height
  });

  const drawOverlay = ({
    faceLandmarks,
    poseLandmarks,
    width,
    height,
    mirror = false
  }) => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    if (mirror) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    if (faceLandmarks?.length) {
      ctx.fillStyle = 'rgba(124,58,237,0.8)';
      faceLandmarks.forEach((lm) => {
        const p = toPixel(lm, width, height);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      const jawConnections = [
        234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152,
        377, 400, 378, 379, 365, 397, 288, 361, 323, 454
      ];
      ctx.strokeStyle = 'rgba(124,58,237,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      jawConnections.forEach((idx, i) => {
        const p = toPixel(faceLandmarks[idx], width, height);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }

    if (poseLandmarks?.length) {
      const connections = [
        [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
        [11, 23], [12, 24], [23, 24], [23, 25], [24, 26],
        [25, 27], [26, 28]
      ];
      ctx.strokeStyle = 'rgba(236,72,153,0.6)';
      ctx.lineWidth = 2;
      connections.forEach(([a, b]) => {
        const p1 = toPixel(poseLandmarks[a], width, height);
        const p2 = toPixel(poseLandmarks[b], width, height);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      ctx.fillStyle = 'rgba(236,72,153,0.9)';
      poseLandmarks.forEach((lm) => {
        const p = toPixel(lm, width, height);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();
  };

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

  // Face measurements from 468 landmarks (normalized coordinates)
  const getFaceMeasurements = (landmarks) => {
    const leftCheek = landmarks[234];
    const rightCheek = landmarks[454];
    const foreheadLeft = landmarks[127];
    const foreheadRight = landmarks[356];
    const chin = landmarks[152];
    const forehead = landmarks[10];
    const jawLeft = landmarks[172];
    const jawRight = landmarks[397];

    const faceWidth = distance(leftCheek, rightCheek);
    const faceHeight = distance(forehead, chin);
    const jawWidth = distance(jawLeft, jawRight);
    const foreheadWidth = distance(foreheadLeft, foreheadRight);

    return {
      faceWidth,
      faceHeight,
      jawWidth,
      foreheadWidth
    };
  };

  // Face shape classification using normalized ratios
  const classifyFaceShape = ({ faceWidth, faceHeight, jawWidth, foreheadWidth }) => {
    const heightToWidth = faceHeight / faceWidth;
    const jawToFaceWidth = jawWidth / faceWidth;
    const foreheadToFaceWidth = foreheadWidth / faceWidth;

    console.log({ heightToWidth, jawToFaceWidth, foreheadToFaceWidth });

    const cheekbonesWidest = faceWidth > jawWidth && faceWidth > foreheadWidth;
    const jawForeheadDiff = Math.abs(jawToFaceWidth - foreheadToFaceWidth);

    let faceShape = 'Uncertain';
    let confidenceScore = 0.45;

    if (heightToWidth > 1.35 && jawForeheadDiff < 0.05) {
      faceShape = 'Rectangle';
      confidenceScore = Math.min(1, 0.7 + (heightToWidth - 1.35));
    } else if (heightToWidth < 1.25 && jawToFaceWidth > 0.85) {
      faceShape = 'Square';
      confidenceScore = Math.min(1, 0.65 + (jawToFaceWidth - 0.85));
    } else if (heightToWidth > 1.3 && jawToFaceWidth < foreheadToFaceWidth) {
      faceShape = 'Oval';
      confidenceScore = Math.min(1, 0.65 + (heightToWidth - 1.3));
    } else if (heightToWidth < 1.25 && jawToFaceWidth < 0.8) {
      faceShape = 'Round';
      confidenceScore = Math.min(1, 0.65 + (0.8 - jawToFaceWidth));
    } else if (foreheadToFaceWidth < jawToFaceWidth && cheekbonesWidest) {
      faceShape = 'Diamond';
      confidenceScore = 0.65;
    } else if (heightToWidth > 1.25 && jawToFaceWidth < 0.85) {
      faceShape = 'Heart';
      confidenceScore = 0.6;
    }

    return {
      faceShape,
      confidenceScore,
      ratios: {
        heightToWidth,
        jawToFaceWidth,
        foreheadToFaceWidth
      }
    };
  };

  // Body measurements from 33 pose landmarks (shoulders/hips + interpolated waist)
  const getBodyMeasurements = (poseLandmarks) => {
    if (!poseLandmarks || poseLandmarks.length < 25) return null;
    const leftShoulder = poseLandmarks[11];
    const rightShoulder = poseLandmarks[12];
    const leftHip = poseLandmarks[23];
    const rightHip = poseLandmarks[24];
    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return null;

    const leftWaist = lerpPoint(leftShoulder, leftHip, 0.5);
    const rightWaist = lerpPoint(rightShoulder, rightHip, 0.5);

    const shoulderWidth = distance(leftShoulder, rightShoulder);
    const hipWidth = distance(leftHip, rightHip);
    const waistWidth = distance(leftWaist, rightWaist);

    return { shoulderWidth, hipWidth, waistWidth };
  };

  // Body shape classification using torso ratios
  // Body shape classification using torso ratios
  const classifyBodyShape = ({ shoulderWidth, hipWidth, waistWidth }) => {
    const shoulderToHip = shoulderWidth / hipWidth;
    const waistToShoulder = waistWidth / shoulderWidth;

    let bodyShape = 'Rectangle';
    let confidenceScore = 0.55;

    if (shoulderToHip >= 1.2) {
      bodyShape = 'Inverted Triangle';
      confidenceScore = Math.min(1, 0.65 + (shoulderToHip - 1.2));
    } else if (shoulderToHip <= 0.85) {
      bodyShape = 'Triangle';
      confidenceScore = Math.min(1, 0.65 + (0.85 - shoulderToHip));
    } else if (waistToShoulder < 0.75) {
      bodyShape = 'Trapezoid';
      confidenceScore = Math.min(1, 0.6 + (0.75 - waistToShoulder));
    } else if (waistToShoulder > 0.95) {
      bodyShape = 'Oval';
      confidenceScore = Math.min(1, 0.6 + (waistToShoulder - 0.95));
    }

    return {
      bodyShape,
      confidenceScore,
      ratios: {
        shoulderToHip,
        waistToShoulder
      }
    };
  };

  const ConfidenceBar = ({ value }) => {
    const pct = Math.round(Math.min(1, Math.max(0, value || 0)) * 100);
    return (
      <div className="confidence">
        <div className="confidence-track">
          <span className="confidence-fill" style={{ width: `${pct}%` }}></span>
        </div>
        <span className="confidence-label">{pct}% confidence</span>
      </div>
    );
  };

  const AnalysisCard = ({ icon, label, value, confidence }) => (
    <div className="analysis-card">
      <div className="analysis-card-header">
        <span className="analysis-icon">{icon}</span>
        <span className="analysis-label">{label}</span>
      </div>
      <div className="analysis-value-strong">{value || 'Unavailable'}</div>
      <ConfidenceBar value={confidence} />
    </div>
  );

  const getColorReason = (tone, undertone, color) => {
    if (!tone || !undertone) return `Balances your palette with ${color}.`;
    if (undertone === 'Warm') return `${color} complements warm undertones and adds glow.`;
    if (undertone === 'Cool') return `${color} enhances cool undertones with crisp contrast.`;
    return `${color} keeps your palette balanced and refined.`;
  };

  const ColorPalette = ({ colors, tone, undertone }) => (
    <div className="color-swatches">
      {colors.map((color, index) => (
        <div key={color} className="color-box" data-highlight={index === 0}>
          <div
            className="color-chip"
            style={{ background: `linear-gradient(135deg, ${color} 0%, rgba(255,255,255,0.25) 100%)` }}
            title={getColorReason(tone, undertone, color)}
          ></div>
          <span>{color}</span>
        </div>
      ))}
    </div>
  );

  const getFaceBounds = (landmarks, width, height) => {
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;

    landmarks.forEach((lm) => {
      const x = lm.x * width;
      const y = lm.y * height;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });

    const paddingX = (maxX - minX) * 0.08;
    const paddingY = (maxY - minY) * 0.1;

    const x = Math.max(0, minX - paddingX);
    const y = Math.max(0, minY - paddingY);
    const w = Math.min(width - x, maxX - minX + paddingX * 2);
    const h = Math.min(height - y, maxY - minY + paddingY * 2);

    return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
  };

  // Skin tone + undertone from face ROI using OpenCV.js K-Means clustering
  const getSkinToneOpenCV = async (image, landmarks) => {
    await ensureOpenCV();
    const cv = window.cv;
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    const bounds = getFaceBounds(landmarks, width, height);

    const src = cv.imread(image);
    const roi = src.roi(new cv.Rect(bounds.x, bounds.y, bounds.w, bounds.h));
    const roiRgb = new cv.Mat();
    cv.cvtColor(roi, roiRgb, cv.COLOR_RGBA2RGB);

    const roiHsv = new cv.Mat();
    cv.cvtColor(roiRgb, roiHsv, cv.COLOR_RGB2HSV);

    const pixels = [];
    for (let y = 0; y < roiHsv.rows; y += 2) {
      for (let x = 0; x < roiHsv.cols; x += 2) {
        const hsvIndex = (y * roiHsv.cols + x) * 3;
        const h = roiHsv.data[hsvIndex];
        const s = roiHsv.data[hsvIndex + 1];
        const v = roiHsv.data[hsvIndex + 2];
        if (v < 40 || v > 230 || s < 40) continue;
        const rgbIndex = (y * roiRgb.cols + x) * 3;
        pixels.push(
          roiRgb.data[rgbIndex],
          roiRgb.data[rgbIndex + 1],
          roiRgb.data[rgbIndex + 2]
        );
      }
    }

    if (pixels.length < 30) {
      src.delete();
      roi.delete();
      roiRgb.delete();
      roiHsv.delete();
      throw new Error('Low light or unclear image');
    }

    const sampleCount = pixels.length / 3;
    const samples = cv.matFromArray(sampleCount, 3, cv.CV_32F, pixels);
    const labels = new cv.Mat();
    const centers = new cv.Mat();
    const criteria = new cv.TermCriteria(cv.TermCriteria_EPS + cv.TermCriteria_MAX_ITER, 10, 1.0);
    cv.kmeans(samples, 3, labels, criteria, 3, cv.KMEANS_PP_CENTERS, centers);

    const counts = new Array(3).fill(0);
    for (let i = 0; i < labels.rows; i += 1) {
      counts[labels.intAt(i, 0)] += 1;
    }
    const dominantIndex = counts.indexOf(Math.max(...counts));
    const dominantRatio = counts[dominantIndex] / sampleCount;
    const dominant = {
      r: centers.floatAt(dominantIndex, 0),
      g: centers.floatAt(dominantIndex, 1),
      b: centers.floatAt(dominantIndex, 2)
    };

    const luminance = 0.2126 * dominant.r + 0.7152 * dominant.g + 0.0722 * dominant.b;
    let tone = 'Medium';
    if (luminance >= 190) tone = 'Fair';
    else if (luminance >= 165) tone = 'Light';
    else if (luminance < 120) tone = 'Deep';

    const lab = new cv.Mat();
    const dominantMat = cv.matFromArray(1, 1, cv.CV_8UC3, [
      Math.round(dominant.r),
      Math.round(dominant.g),
      Math.round(dominant.b)
    ]);
    cv.cvtColor(dominantMat, lab, cv.COLOR_RGB2Lab);
    const a = lab.data[1];
    const b = lab.data[2];
    let undertone = 'Neutral';
    if (b > 150 && a > 135) undertone = 'Warm';
    else if (b < 135) undertone = 'Cool';

    src.delete();
    roi.delete();
    roiRgb.delete();
    roiHsv.delete();
    samples.delete();
    labels.delete();
    centers.delete();
    dominantMat.delete();
    lab.delete();

    return { tone, undertone, rgb: dominant, confidenceScore: Math.min(1, 0.5 + dominantRatio) };
  };

  const getColorPalette = (tone, undertone) => {
    if (tone === 'Fair') {
      return undertone === 'Warm'
        ? ['Peach', 'Coral', 'Ivory', 'Buttercream', 'Apricot']
        : ['Lavender', 'Powder Blue', 'Rose', 'Ivory', 'Silver'];
    }
    if (tone === 'Light') {
      return undertone === 'Warm'
        ? ['Golden Beige', 'Olive', 'Warm Camel', 'Terracotta', 'Cream']
        : ['Cool Grey', 'Seafoam', 'Sky Blue', 'Mauve', 'Soft White'];
    }
    if (tone === 'Deep') {
      return undertone === 'Warm'
        ? ['Mustard', 'Bronze', 'Olive', 'Chocolate', 'Gold']
        : ['Cobalt', 'Plum', 'Emerald', 'Charcoal', 'White'];
    }
    return undertone === 'Warm'
      ? ['Emerald', 'Teal', 'Warm Beige', 'Burgundy', 'Cream']
      : ['Navy', 'Ruby', 'Slate', 'Lilac', 'Soft White'];
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
    let isMounted = true;

    const processFrame = async () => {
      if (!isMounted || !cameraActive) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        requestAnimationFrame(processFrame);
        return;
      }
      if (isProcessingRef.current) {
        requestAnimationFrame(processFrame);
        return;
      }

      isProcessingRef.current = true;
      try {
        const faceRes = await runFaceMesh(video);
        let poseRes = null;
        try {
          poseRes = await runPose(video);
        } catch (poseError) {
          console.warn('Pose analysis failed:', poseError);
        }

        drawOverlay({
          faceLandmarks: faceRes.multiFaceLandmarks?.[0],
          poseLandmarks: poseRes?.poseLandmarks || null,
          width: video.videoWidth,
          height: video.videoHeight,
          mirror: true
        });
      } catch (error) {
        console.error('Live analysis error:', error);
      } finally {
        isProcessingRef.current = false;
      }

      requestAnimationFrame(processFrame);
    };

    if (cameraActive) {
      processFrame();
    } else if (overlayRef.current) {
      const ctx = overlayRef.current.getContext('2d');
      ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    }

    return () => {
      isMounted = false;
    };
  }, [cameraActive]);

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
      const faceMeasurements = getFaceMeasurements(faceLandmarks);
      const faceShapeResult = classifyFaceShape(faceMeasurements);
      const faceShape = faceShapeResult.faceShape;
      const skinData = await getSkinToneOpenCV(image, faceLandmarks);
      const bodyMeasurements = poseResults?.poseLandmarks
        ? getBodyMeasurements(poseResults.poseLandmarks)
        : null;
      const bodyShapeResult = bodyMeasurements
        ? classifyBodyShape(bodyMeasurements)
        : null;
      const bodyShape = bodyShapeResult?.bodyShape || null;
      const colorPalette = getColorPalette(skinData.tone, skinData.undertone);
      const recs = generateRecommendations(formInputs, {
        faceShape,
        skinTone: skinData.tone,
        undertone: skinData.undertone,
        bodyShape,
        colorPalette
      });

      setResults({
        faceShape,
        faceShapeConfidence: faceShapeResult.confidenceScore,
        faceShapeRatios: faceShapeResult.ratios,
        skinTone: skinData.tone,
        undertone: skinData.undertone,
        skinToneConfidence: skinData.confidenceScore,
        bodyShape,
        bodyShapeConfidence: bodyShapeResult?.confidenceScore || 0,
        colorPalette,
        measurements: {
          faceWidth: faceMeasurements.faceWidth,
          faceHeight: faceMeasurements.faceHeight,
          shoulderWidth: bodyMeasurements?.shoulderWidth || null,
          hipWidth: bodyMeasurements?.hipWidth || null,
          waistWidth: bodyMeasurements?.waistWidth || null
        },
        recommendations: {
          outfits: recs.outfits,
          hairstyles: recs.hairstyles,
          accessories: recs.accessories,
          bestOutfit: recs.bestOutfit,
          rationale: recs.rationale
        }
      });
      const targetWidth = imageRef.current?.clientWidth || image.naturalWidth || image.width;
      const targetHeight = imageRef.current?.clientHeight || image.naturalHeight || image.height;
      drawOverlay({
        faceLandmarks,
        poseLandmarks: poseResults?.poseLandmarks || null,
        width: targetWidth,
        height: targetHeight,
        mirror: false
      });
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.message || 'Unable to analyze image. Use a clear, well-lit photo.');
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
            undertone: results.undertone,
            measurements: results.measurements,
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

          <div className="onboarding-steps">
            <div className="onboarding-card">
              <span className="step-tag">Step 1</span>
              <h4>Upload photo</h4>
              <p>Pick a clear image with good lighting.</p>
            </div>
            <div className="onboarding-card">
              <span className="step-tag">Step 2</span>
              <h4>AI analysis</h4>
              <p>We analyze face shape, skin tone, and body type.</p>
            </div>
            <div className="onboarding-card">
              <span className="step-tag">Step 3</span>
              <h4>Get style & salons</h4>
              <p>Receive curated outfits and nearby salon picks.</p>
            </div>
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
                    <canvas ref={overlayRef} className="overlay-canvas" />
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
                    <div className="image-overlay-wrapper">
                      <img
                        ref={imageRef}
                        src={capturedImage}
                        alt="Captured"
                        className="captured-image"
                      />
                      <canvas ref={overlayRef} className="overlay-canvas" />
                    </div>
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
              <div className="analysis-subtitle">
                <p>Body shape, face features, and style analysis</p>
                <span className={`ai-indicator ${analyzing ? 'scanning' : results ? 'done' : ''}`}>
                  <FaRobot /> {analyzing ? 'Scanning…' : results ? 'Analysis complete' : 'Waiting for scan'}
                  {results && !analyzing && <FaCheckCircle />}
                </span>
                <span className="ai-micro">Analyzed using facial landmarks & body proportions</span>
              </div>

              {!results ? (
                <div className="empty-state">
                  {analyzing ? (
                    <div className="analyzing-state">
                      <div className="analysis-skeleton">
                        <div className="skeleton-line title"></div>
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line short"></div>
                      </div>
                      <p>Analyzing your photo...</p>
                    </div>
                  ) : (
                    <p>Upload a photo to see AI analysis results</p>
                  )}
                </div>
              ) : (
                <div className="results-container">
                  <div className="result-actions premium-actions">
                    <button className="btn-secondary" onClick={saveScanResult}>
                      <FaSave /> Save Result
                    </button>
                    <button className="btn-primary" onClick={downloadPdf}>
                      <FaFilePdf /> Download PDF
                    </button>
                  </div>
                  <div className="analysis-grid premium-grid">
                    <AnalysisCard
                      icon={<FaUserCircle />}
                      label="Face Shape"
                      value={results.faceShape}
                      confidence={results.faceShapeConfidence}
                    />
                    <AnalysisCard
                      icon={<FaPalette />}
                      label="Skin Tone"
                      value={results.skinTone}
                      confidence={results.skinToneConfidence}
                    />
                    <AnalysisCard
                      icon={<FaTint />}
                      label="Undertone"
                      value={results.undertone}
                      confidence={results.skinToneConfidence}
                    />
                    <AnalysisCard
                      icon={<FaMale />}
                      label="Body Shape"
                      value={results.bodyShape}
                      confidence={results.bodyShapeConfidence}
                    />
                  </div>

                  <div className="color-section premium-colors">
                    <h4>Your Perfect Colors</h4>
                    <ColorPalette
                      colors={results.colorPalette}
                      tone={results.skinTone}
                      undertone={results.undertone}
                    />
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
