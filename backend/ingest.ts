import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import shp from 'shpjs';
import * as turf from '@turf/turf';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Helper: Detect Geometry Columns in CSV
const detectColumns = (headers: string[]) => {
    const norm = headers.map(h => h.toLowerCase());
    const latIdx = norm.findIndex(h => ['lat', 'latitude', 'y', 'north'].some(k => h.includes(k)));
    const lngIdx = norm.findIndex(h => ['lon', 'lng', 'longitude', 'x', 'east'].some(k => h.includes(k)));
    return { latIdx, lngIdx, headers };
};

// Endpoint: Ingest Data
router.post('/ingest', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'No file uploaded' });

        let geojson: any = { type: 'FeatureCollection', features: [] };
        let metadata = {
            filename: file.originalname,
            format: '',
            featureCount: 0,
            detectedGeometry: 'Unknown'
        };

        // CSV Handling
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            metadata.format = 'CSV';
            const records = parse(file.buffer, { skip_empty_lines: true });
            if (records.length < 2) return res.status(400).json({ error: 'Empty or invalid CSV' });

            const headers = records[0];
            const { latIdx, lngIdx } = detectColumns(headers);

            if (latIdx === -1 || lngIdx === -1) {
                return res.status(400).json({
                    error: 'Could not detect geospatial columns. Please ensure columns formatted as Lat/Lon exist.',
                    headers
                });
            }

            const features = records.slice(1).map((row: any[]) => {
                const lat = parseFloat(row[latIdx]);
                const lng = parseFloat(row[lngIdx]);
                if (isNaN(lat) || isNaN(lng)) return null;

                // Extract properties (all other columns)
                const properties: any = {};
                headers.forEach((h: string, i: number) => {
                    if (i !== latIdx && i !== lngIdx) properties[h] = row[i];
                });

                return turf.point([lng, lat], properties);
            }).filter((f: any) => f !== null);

            geojson.features = features;
            metadata.detectedGeometry = 'Point';
        }

        // GeoJSON Handling
        else if (file.originalname.endsWith('.json') || file.originalname.endsWith('.geojson')) {
            metadata.format = 'GeoJSON';
            const parsed = JSON.parse(file.buffer.toString());
            if (parsed.type === 'FeatureCollection') geojson = parsed;
            else if (parsed.type === 'Feature') geojson = { type: 'FeatureCollection', features: [parsed] };
            else return res.status(400).json({ error: 'Invalid GeoJSON structure' });

            metadata.detectedGeometry = geojson.features[0]?.geometry?.type || 'Mixed';
        }

        // Shapefile (ZIP) Handling
        else if (file.originalname.endsWith('.zip')) {
            metadata.format = 'Shapefile (ZIP)';
            const parsed = await shp(file.buffer);
            // shpjs returns FeatureCollection or array of them
            if (Array.isArray(parsed)) {
                // Flatten if multiple layers
                parsed.forEach(fc => geojson.features.push(...fc.features));
            } else {
                geojson = parsed;
            }
            metadata.detectedGeometry = geojson.features[0]?.geometry?.type || 'Mixed';
        }

        else {
            return res.status(400).json({ error: 'Unsupported file format. Use CSV, GeoJSON, or Shapefile (ZIP).' });
        }

        metadata.featureCount = geojson.features.length;

        res.json({
            success: true,
            metadata,
            data: geojson
        });

    } catch (error) {
        console.error('Ingestion error:', error);
        res.status(500).json({ error: 'Processing failed', details: error instanceof Error ? error.message : 'Unknown' });
    }
});

export default router;
