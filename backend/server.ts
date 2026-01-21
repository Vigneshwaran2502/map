import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as turf from '@turf/turf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Load Metadata
const metadataPath = path.join(__dirname, 'metadata.json');
const getMetadata = () => {
  const data = fs.readFileSync(metadataPath, 'utf8');
  return JSON.parse(data);
};

// API: Get Sites
app.get('/api/sites', (req, res) => {
  res.json([
    { id: 'A', name: 'Site A (Juhu Beach)', center: [19.1000, 72.8260] },
    { id: 'C', name: 'Site C (Thane Creek)', center: [19.1600, 72.9850] }
  ]);
});

// API: Get Metadata with filtering
app.get('/api/metadata', (req, res) => {
  let metadata = getMetadata();
  const { site, year, parameter, query } = req.query;

  if (site) metadata = metadata.filter((m: any) => m.site === site);
  if (year) metadata = metadata.filter((m: any) => m.year.toString() === year);
  if (parameter) metadata = metadata.filter((m: any) => m.parameter === parameter);
  if (query) {
    const q = (query as string).toLowerCase();
    metadata = metadata.filter((m: any) => m.layer_name.toLowerCase().includes(q));
  }

  res.json(metadata);
});

// Helper to generate mock shoreline based on site, year, and jitter
const generateShoreline = (site: string, year: number) => {
  // Site A: Juhu Beach Area (Mumbai West Coast) - North-South orientation
  // Site C: Thane Creek - North-South orientation

  const isSiteA = site === 'A';

  // Starting Points (South-ish)
  const baseLat = isSiteA ? 19.0850 : 19.1300;
  const baseLng = isSiteA ? 72.8260 : 72.9850;

  const points = [];
  const numPoints = 80;
  // Span of the coastline in degrees (Latitude)
  const latSpan = 0.06; // ~6-7km

  // Year-based shift: 
  // For Site A (West Coast), erosion means moving East (inland). 
  // 1 degree lat = ~111km. 0.0001 deg = ~11m.
  // Erosion: +Lng (East) for West coast.
  const yearOffset = (year - 2011) * 0.00008; // ~8m per year shift

  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints;

    // North-South Line: Vary Latitude
    const lat = baseLat + (fraction * latSpan);

    // Wiggle Longitude
    // Create a natural looking curve (approximate Juhu curve)
    // Juhu curves slightly outwards (West) then in.
    const curve = Math.sin(fraction * Math.PI) * 0.003;
    const noise = Math.sin(fraction * 15) * 0.0005 + Math.cos(fraction * 8) * 0.0003;

    let lng = baseLng - curve + noise;

    // Apply erosion/accretion shift
    // Site A: Erosion moves line East (+)
    if (isSiteA) {
      lng += yearOffset;
    } else {
      // Site C: Creek erosion might widen it (move West/East away from center? Simplified: Move West)
      lng -= yearOffset;
    }

    points.push([lng, lat]);
  }

  return turf.lineString(points);
};

// API: Serve GeoJSON with CRS Validation
app.get('/api/geojson/:layer', (req, res) => {
  const layerName = req.params.layer;
  const metadata = getMetadata().find((m: any) => m.layer_name === layerName);

  if (!metadata) {
    return res.status(404).json({ error: "Layer not found" });
  }

  let geojson: any;
  if (metadata.parameter === 'Shoreline') {
    geojson = generateShoreline(metadata.site, metadata.year);
  } else {
    // Boundary polygon
    // Boundary polygon
    const baseLat = metadata.site === 'A' ? 19.0850 : 19.1300;
    const baseLng = metadata.site === 'A' ? 72.8260 : 72.9850;
    geojson = turf.polygon([[
      [baseLng - 0.01, baseLat - 0.01],
      [baseLng + 0.02, baseLat - 0.01],
      [baseLng + 0.02, baseLat + 0.07],
      [baseLng - 0.01, baseLat + 0.07],
      [baseLng - 0.01, baseLat - 0.01]
    ]]);
  }

  // CRS Validation Logic
  const coords = turf.coordAll(geojson)[0];
  const isUTM = Math.abs(coords[0]) > 180 || Math.abs(coords[1]) > 90;

  const response = {
    ...geojson,
    properties: {
      ...metadata,
      crs_warning: isUTM ? "GeoJSON CRS mismatch suspected (UTM detected)" : null,
      debug_coords: coords
    }
  };

  res.json(response);
});

// API: Coastal Change Analysis
app.post('/api/analysis/shoreline-change', (req, res) => {
  const { site, baselineYear, comparisonYears } = req.body;

  if (!site || !baselineYear || !comparisonYears || !Array.isArray(comparisonYears)) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const baseline = generateShoreline(site, baselineYear);
  const targetYear = comparisonYears[comparisonYears.length - 1];
  const target = generateShoreline(site, targetYear);

  // 1. Compute Max/Avg Shift
  let totalShift = 0;
  let maxShift = 0;
  const heatmapPoints: number[][] = [];

  const baselineCoords = baseline.geometry.coordinates;
  const targetCoords = target.geometry.coordinates;

  baselineCoords.forEach((coord, i) => {
    if (targetCoords[i]) {
      const dist = turf.distance(coord, targetCoords[i], { units: 'meters' });
      totalShift += dist;
      if (dist > maxShift) maxShift = dist;
      // Heatmap Intensity: dist / max possible (simulated)
      heatmapPoints.push([coord[1], coord[0], Math.min(dist / 50, 1)]);
    }
  });

  const avgShift = totalShift / baselineCoords.length;

  // 2. Area Change (Simplified via Buffer Difference)
  // Create polygons by closing the lines with a bounding box
  const createPoly = (line: any) => {
    const coords = [...line.geometry.coordinates];
    const first = coords[0];
    const last = coords[coords.length - 1];
    // Close it way inland
    coords.push([last[0], last[1] - 0.01]);
    coords.push([first[0], first[1] - 0.01]);
    coords.push(first);
    return turf.polygon([coords]);
  };

  try {
    const polyBase = createPoly(baseline);
    const polyTarget = createPoly(target);

    let erosionArea = 0;
    let accretionArea = 0;

    try {
      const erosion = turf.difference(turf.featureCollection([polyBase, polyTarget]));
      erosionArea = erosion ? turf.area(erosion) : 0;
    } catch (e) {
      console.warn('Erosion calculation failed:', e);
    }

    try {
      const accretion = turf.difference(turf.featureCollection([polyTarget, polyBase]));
      accretionArea = accretion ? turf.area(accretion) : 0;
    } catch (e) {
      console.warn('Accretion calculation failed:', e);
    }

    res.json({
      site,
      baselineYear,
      comparisonYear: targetYear,
      maxShiftM: parseFloat(maxShift.toFixed(2)),
      avgShiftM: parseFloat(avgShift.toFixed(2)),
      erosionSqm: parseFloat(erosionArea.toFixed(2)),
      accretionSqm: parseFloat(accretionArea.toFixed(2)),
      netChangeSqm: parseFloat((accretionArea - erosionArea).toFixed(2)),
      heatmapPoints,
      changedLayers: [
        `Site${site}_${baselineYear}_Shoreline`,
        `Site${site}_${targetYear}_Shoreline`
      ]
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Coastal Backend running on http://localhost:${PORT}`);
});
