import React, { useEffect, useState } from 'react';
import { FilterState, LayerMetadata, SITES, YEARS, PARAMETERS } from '../types';
import { fetchMetadata } from '../services/api';
import { Search, Loader2 } from 'lucide-react';

export const MetadataCatalogue: React.FC = () => {
  const [layers, setLayers] = useState<LayerMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    site: '',
    year: '',
    parameter: '',
    search: ''
  });

  useEffect(() => {
    setLoading(true);
    fetchMetadata(filters)
      .then(data => {
        setLayers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch metadata:", err);
        setLoading(false);
      });
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-full w-full bg-slate-50 p-8 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Coastal Geospatial Metadata Catalogue</h1>
          <p className="text-slate-500">Standardized registry of coastal datasets for traceability and interoperability.</p>
        </div>
        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex gap-4">
             {/* Summary Stats could go here */}
             <span className="text-sm text-slate-600 font-medium px-2">Total Datasets: {layers.length}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search for datasets, sites, parameters..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        <select 
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={filters.site}
          onChange={(e) => handleFilterChange('site', e.target.value)}
        >
          <option value="">All Sites</option>
          {SITES.map(s => <option key={s} value={s}>Site {s}</option>)}
        </select>

        <select 
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={filters.year}
          onChange={(e) => handleFilterChange('year', e.target.value)}
        >
          <option value="">All Years</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select 
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={filters.parameter}
          onChange={(e) => handleFilterChange('parameter', e.target.value)}
        >
          <option value="">All Parameters</option>
          {PARAMETERS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white rounded-xl border border-slate-200 shadow-sm relative">
        {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
        )}
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-0">
            <tr>
              <th className="px-6 py-4 border-b border-slate-200">Dataset Name</th>
              <th className="px-6 py-4 border-b border-slate-200">Site</th>
              <th className="px-6 py-4 border-b border-slate-200">Year</th>
              <th className="px-6 py-4 border-b border-slate-200">Parameter</th>
              <th className="px-6 py-4 border-b border-slate-200">CRS</th>
              <th className="px-6 py-4 border-b border-slate-200">Geometry Type</th>
              <th className="px-6 py-4 border-b border-slate-200">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {layers.length > 0 ? layers.map((layer, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 font-medium text-slate-800">{layer.layer_name}</td>
                <td className="px-6 py-3">Site {layer.site}</td>
                <td className="px-6 py-3">{layer.year}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${layer.parameter === 'Shoreline' ? 'bg-blue-100 text-blue-700' :
                      layer.parameter === 'Boundary' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                    {layer.parameter}
                  </span>
                </td>
                <td className="px-6 py-3 font-mono text-xs">{layer.crs}</td>
                <td className="px-6 py-3">{layer.geometry}</td>
                <td className="px-6 py-3 text-slate-500">{layer.source}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  {!loading && "No datasets found matching your filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
