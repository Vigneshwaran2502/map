import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Info, Play, Pause, BarChart3, Database, Search, Map as MapIcon, RotateCcw } from 'lucide-react';
import { LayerMetadata, FilterState, SITES, YEARS, PARAMETERS } from '../types';

interface SidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableLayers: LayerMetadata[];
  activeLayers: string[];
  toggleLayer: (layerName: string) => void;
  onTimeMode: () => void;
  isTimeMode: boolean;
  onRunAnalysis: () => void;
  analysisLoading: boolean;
  debugMode: boolean;
  setDebugMode: (val: boolean) => void;
  baselineYear: number;
  setBaselineYear: (y: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  filters,
  setFilters,
  availableLayers,
  activeLayers,
  toggleLayer,
  onTimeMode,
  isTimeMode,
  onRunAnalysis,
  analysisLoading,
  debugMode,
  setDebugMode,
  baselineYear,
  setBaselineYear
}) => {

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 w-80 shadow-2xl z-20 overflow-hidden font-sans">
      <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 dark:from-indigo-900 dark:to-blue-900 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
            <MapIcon size={20} className="text-white" />
          </div>
          <h1 className="text-lg font-black uppercase tracking-tighter leading-none">Coastal Change<br /><span className="text-indigo-200">Intelligence</span></h1>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-200/60">Hackathon Prototype v2.0</p>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto flex-1 dark:text-gray-300">

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search layers..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all dark:placeholder-gray-600"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Global Selectors */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
            <Settings size={14} /> Project parameters
          </div>

          <div className="space-y-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Survey Site</label>
              <select
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                value={filters.site}
                onChange={(e) => handleFilterChange('site', e.target.value)}
              >
                <option value="">Select a Site</option>
                {SITES.map(s => <option key={s} value={s}>Site {s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Baseline Year</label>
                <select
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  value={baselineYear}
                  onChange={(e) => setBaselineYear(Number(e.target.value))}
                >
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Analysis Year</label>
                <select
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                >
                  <option value="">Latest (2020)</option>
                  {YEARS.filter(y => y > baselineYear).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onRunAnalysis}
            disabled={analysisLoading || !filters.site}
            className={`w-full py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 font-bold text-sm ${analysisLoading ? 'bg-gray-600 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.02] active:scale-95'}`}
          >
            <BarChart3 size={18} />
            {analysisLoading ? 'Computing...' : 'Run Change Analysis'}
          </button>

          <button
            onClick={onTimeMode}
            className={`w-full py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-sm border-2 ${isTimeMode ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50'}`}
          >
            {isTimeMode ? <Pause size={18} /> : <Play size={18} />}
            {isTimeMode ? 'Stop Animation' : 'Animate Shoreline Change'}
          </button>
        </div>

        {/* Diagnostics Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Database size={14} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-500 uppercase">Dev Diagnostics</span>
          </div>
          <button
            onClick={() => setDebugMode(!debugMode)}
            className={`w-10 h-5 rounded-full relative transition-colors ${debugMode ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
          >
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${debugMode ? 'left-6' : 'left-1'}`}></div>
          </button>
        </div>

        {/* Available Layers */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Database size={12} /> Layers ({availableLayers.length})
            </label>
          </div>

          <div className="space-y-1">
            {availableLayers.length === 0 && (
              <div className="p-8 text-center bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-400">No layers found for current filters.</p>
              </div>
            )}
            {availableLayers.map(layer => (
              <motion.div
                whileHover={{ x: 4 }}
                key={layer.layer_name}
                className={`flex items-center justify-between p-3 rounded-xl border border-transparent transition-all cursor-pointer ${activeLayers.includes(layer.layer_name) ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                onClick={() => toggleLayer(layer.layer_name)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${layer.year === 2011 ? 'bg-red-500' : 'bg-sky-500'}`}></div>
                  <div>
                    <p className={`text-xs font-bold ${activeLayers.includes(layer.layer_name) ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>{layer.layer_name}</p>
                    <p className="text-[9px] text-gray-400 font-medium uppercase tracking-tighter">{layer.site} • {layer.year} • {layer.parameter}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};