export interface LayerMetadata {
  layer_name: string;
  site: 'A' | 'C';
  year: number;
  parameter: 'Shoreline' | 'Boundary' | 'HTL' | 'LTL' | 'CRZ' | 'SEA' | 'CREEK';
  geometry: 'LineString' | 'Polygon';
  crs: string;
  source: string;
  description?: string;
}

export interface FilterState {
  site: string;
  year: string;
  parameter: string;
  search: string;
}

export const SITES = ['A', 'C'];
export const YEARS = Array.from({ length: 10 }, (_, i) => 2011 + i);
export const PARAMETERS = ['Shoreline', 'Boundary', 'HTL', 'LTL', 'CRZ', 'SEA', 'CREEK'];
