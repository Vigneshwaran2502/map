import { LayerMetadata, FilterState } from '../types';

const API_BASE = 'http://localhost:3001/api';

export const fetchSites = async () => {
  const res = await fetch(`${API_BASE}/sites`);
  return res.json();
};

export const fetchMetadata = async (filters: FilterState): Promise<LayerMetadata[]> => {
  const params = new URLSearchParams();
  if (filters.site) params.append('site', filters.site);
  if (filters.year) params.append('year', filters.year);
  if (filters.parameter) params.append('parameter', filters.parameter);
  if (filters.search) params.append('query', filters.search);

  const res = await fetch(`${API_BASE}/metadata?${params.toString()}`);
  return res.json();
};

export const fetchGeoJSON = async (layerName: string): Promise<any> => {
  const res = await fetch(`${API_BASE}/geojson/${layerName}`);
  return res.json();
};

export const runShorelineAnalysis = async (site: string, baselineYear: number, comparisonYears: number[]) => {
  const res = await fetch(`${API_BASE}/analysis/shoreline-change`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ site, baselineYear, comparisonYears })
  });
  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
};
