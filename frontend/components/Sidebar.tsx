import React from 'react';
import { FilterState, LayerMetadata, YEARS } from '../types';
import { Play, Loader2, Map as MapIcon, Layers, Radio, Settings, StopCircle, LayoutDashboard, SplitSquareHorizontal } from 'lucide-react';

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
  setDebugMode: (mode: boolean) => void;
  baselineYear: number;
  setBaselineYear: (year: number) => void;
  viewMode: 'standard' | 'analytical';
  setViewMode: (mode: 'standard' | 'analytical') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  filters, setFilters, availableLayers, activeLayers, toggleLayer,
  onTimeMode, isTimeMode, onRunAnalysis, analysisLoading,
  debugMode, setDebugMode, baselineYear, setBaselineYear,
  viewMode, setViewMode
}) => {

  const sites = ['A', 'C']; // Expanded as needed

  return (
    <div className="w-[340px] h-full flex flex-col bg-gray-900 border-r border-gray-800 backdrop-blur-xl relative z-20 text-white shadow-2xl">

      {/* Header */}
      <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
        <h1 className="text-xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center gap-2">
          <Radio className="text-blue-500 animate-pulse" size={20} />
          COASTAL INTEL
        </h1>
        <p className="text-[10px] text-gray-500 font-mono mt-1 tracking-wider">CHANGE DETECTION PLATFORM</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

        {/* View Mode Toggle */}
        <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setViewMode('standard')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold uppercase transition-all ${viewMode === 'standard' ? 'bg-gray-800 text-white shadow-lg border border-gray-700' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <LayoutDashboard size={14} /> Dashboard
          </button>
          <button
            onClick={() => setViewMode('analytical')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold uppercase transition-all ${viewMode === 'analytical' ? 'bg-cyan-900/30 text-cyan-400 shadow-lg border border-cyan-800/50' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <SplitSquareHorizontal size={14} /> Analytical
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            <MapIcon size={12} /> Survey Configuration
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-500">Target Site</label>
            <div className="grid grid-cols-2 gap-2">
              {sites.map(s => (
                <button
                  key={s}
                  onClick={() => setFilters({ ...filters, site: s })}
                  className={`py-2 px-3 rounded-md text-xs font-bold border transition-all ${filters.site === s ? 'bg-blue-600 border-blue-500 text-white shadow-blue-900/50 shadow-lg' : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'}`}
                >
                  Site {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500">Baseline Year</label>
              <select
                value={baselineYear}
                onChange={(e) => setBaselineYear(Number(e.target.value))}
                className="w-full bg-gray-950 border border-gray-800 rounded-md py-2 px-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500">Analysis Year</label>
              <select
                value={filters.year || '2020'}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="w-full bg-gray-950 border border-gray-800 rounded-md py-2 px-3 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                {YEARS.filter(y => y > baselineYear).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onRunAnalysis}
          disabled={analysisLoading}
          className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 p-[1px] rounded-lg"
        >
          <div className="bg-gray-900/50 group-hover:bg-transparent transition-colors duration-300 rounded-[7px] w-full h-full p-3 flex items-center justify-center gap-3">
            {analysisLoading ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" size={16} />}
            <span className="font-bold text-sm tracking-wide uppercase">
              {analysisLoading ? 'Processing...' : 'Run Change Analysis'}
            </span>
          </div>
        </button>

        {/* Playback Controls */}
        {viewMode === 'standard' && (
          <div className="p-4 bg-gray-800/30 border border-white/5 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase">
              <span>Timeline Playback</span>
              <span className={`w-2 h-2 rounded-full ${isTimeMode ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
            </div>
            <button
              onClick={onTimeMode}
              className={`w-full py-2 flex items-center justify-center gap-2 rounded-md text-xs font-bold uppercase transition-all border ${isTimeMode ? 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`}
            >
              {isTimeMode ? <><StopCircle size={16} /> Stop Animation</> : <><Play size={16} /> Start Animation</>}
            </button>
          </div>
        )}

        {/* Diagnostics Toggle */}
        <div className="pt-6 border-t border-gray-800">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${debugMode ? 'text-green-400' : 'text-gray-600 hover:text-gray-400'} transition-colors`}
          >
            <Settings size={14} />
            Dev Diagnostics: {debugMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
};