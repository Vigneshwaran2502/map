import React, { useState } from 'react';
import { FilterState, LayerMetadata, YEARS } from '../types';
import {
  Play, Loader2, Map as MapIcon, Layers, Radio, Settings, StopCircle,
  LayoutDashboard, SplitSquareHorizontal, Table, UploadCloud, Globe,
  ChevronDown, ChevronRight, PenTool, MousePointer2, Circle
} from 'lucide-react';

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
  viewMode: 'standard' | 'analytical' | 'metadata' | 'playground' | 'precision_demo';
  setViewMode: (mode: 'standard' | 'analytical' | 'metadata' | 'playground' | 'precision_demo') => void;
  playgroundTool?: 'draw' | 'select' | 'buffer' | null;
  setPlaygroundTool?: (tool: 'draw' | 'select' | 'buffer' | null) => void;
  onOpenUpload: () => void;
  onOpenAnalysis?: () => void;
}

const CollapsibleSection: React.FC<{
  title: string,
  icon: React.ReactNode,
  children: React.ReactNode,
  defaultOpen?: boolean
}> = ({ title, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-800 bg-gray-900/40 rounded-lg overflow-hidden backdrop-blur-sm transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-900/60 hover:bg-gray-800/80 transition-colors border-b border-gray-800/50"
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300">
          <span className="text-cyan-500">{icon}</span> {title}
        </div>
        {isOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
      </button>
      {isOpen && <div className="p-4 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">{children}</div>}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  filters, setFilters, availableLayers, activeLayers, toggleLayer,
  onTimeMode, isTimeMode, onRunAnalysis, analysisLoading,
  debugMode, setDebugMode, baselineYear, setBaselineYear,
  viewMode, setViewMode, playgroundTool, setPlaygroundTool, onOpenUpload, onOpenAnalysis
}) => {

  const sites = ['A', 'C'];

  return (
    <div className="w-[360px] h-full flex flex-col bg-[#020617] border-r border-gray-800 relative z-20 text-white shadow-2xl">

      {/* Header */}
      <div className="p-6 border-b border-gray-800 bg-[#0f172a]">
        <h1 className="text-xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-3">
          <Radio className="text-cyan-500 animate-pulse" size={20} />
          COASTAL INTEL
        </h1>
        <div className="flex justify-between items-end mt-2">
          <p className="text-[10px] text-gray-500 font-mono tracking-wider">CHANGE DETECTION PLATFORM</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-900">v2.0</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">

        {/* View Mode Switcher */}
        <div className="grid grid-cols-4 gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800">
          {[
            { id: 'standard', icon: LayoutDashboard, label: 'Dash' },
            { id: 'analytical', icon: SplitSquareHorizontal, label: 'Analyt' },
            { id: 'precision_demo', icon: Radio, label: 'Demo' },
            { id: 'metadata', icon: Table, label: 'Data' },
            { id: 'playground', icon: Globe, label: 'Global' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded-md text-[10px] font-bold uppercase transition-all
                        ${viewMode === mode.id
                  ? 'bg-cyan-900/20 text-cyan-400 shadow-lg border border-cyan-800/50'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                }
                    `}
            >
              <mode.icon size={14} /> {mode.label}
            </button>
          ))}
        </div>

        {/* 1. Global Playground Tools - ONLY Visible in Playground Mode */}
        {viewMode === 'playground' && (
          <CollapsibleSection title="Global Tools" icon={<Globe size={14} />}>
            <div className="space-y-3">
              <p className="text-xs text-gray-400">Interactive analysis tools for the global map.</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPlaygroundTool?.(playgroundTool === 'draw' ? null : 'draw')}
                  className={`flex flex-col items-center gap-2 p-3 bg-gray-900 border rounded-lg transition-all group
                                ${playgroundTool === 'draw' ? 'border-cyan-500 text-cyan-400 bg-cyan-900/20' : 'border-gray-700 hover:border-cyan-500 hover:text-cyan-400'}
                            `}
                >
                  <PenTool size={18} className={playgroundTool === 'draw' ? 'text-cyan-400' : 'text-gray-500 group-hover:text-cyan-400'} />
                  <span className="text-[10px] uppercase font-bold">Draw</span>
                </button>
                <button
                  onClick={() => setPlaygroundTool?.(playgroundTool === 'select' ? null : 'select')}
                  className={`flex flex-col items-center gap-2 p-3 bg-gray-900 border rounded-lg transition-all group
                                ${playgroundTool === 'select' ? 'border-cyan-500 text-cyan-400 bg-cyan-900/20' : 'border-gray-700 hover:border-cyan-500 hover:text-cyan-400'}
                            `}
                >
                  <MousePointer2 size={18} className={playgroundTool === 'select' ? 'text-cyan-400' : 'text-gray-500 group-hover:text-cyan-400'} />
                  <span className="text-[10px] uppercase font-bold">Select</span>
                </button>
                <button
                  onClick={() => setPlaygroundTool?.(playgroundTool === 'buffer' ? null : 'buffer')}
                  className={`flex flex-col items-center gap-2 p-3 bg-gray-900 border rounded-lg transition-all group
                                ${playgroundTool === 'buffer' ? 'border-cyan-500 text-cyan-400 bg-cyan-900/20' : 'border-gray-700 hover:border-cyan-500 hover:text-cyan-400'}
                            `}
                >
                  <Circle size={18} className={playgroundTool === 'buffer' ? 'text-cyan-400' : 'text-gray-500 group-hover:text-cyan-400'} />
                  <span className="text-[10px] uppercase font-bold">Buffer</span>
                </button>
              </div>
              <div className="p-3 bg-cyan-950/30 border border-cyan-900/50 rounded text-[10px] text-cyan-300">
                <span className="font-bold">TIP:</span> Click anywhere on the map for instant analysis.
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* 2. Survey Configuration */}
        <CollapsibleSection title="Survey Config" icon={<Settings size={14} />}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500">Target Site</label>
              <div className="grid grid-cols-2 gap-2">
                {sites.map(s => (
                  <button
                    key={s}
                    onClick={() => setFilters({ ...filters, site: s })}
                    disabled={viewMode === 'playground'}
                    className={`py-2 px-3 rounded-md text-xs font-bold border transition-all 
                            ${filters.site === s && viewMode !== 'playground'
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                      }
                            ${viewMode === 'playground' ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                  >
                    Site {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Baseline</label>
                <select
                  value={baselineYear}
                  disabled={viewMode === 'playground'}
                  onChange={(e) => setBaselineYear(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-800 rounded-md py-2 px-3 text-sm text-gray-300 focus:border-cyan-500 focus:outline-none disabled:opacity-50"
                >
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Analysis</label>
                <select
                  value={filters.year || '2020'}
                  disabled={viewMode === 'playground'}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-md py-2 px-3 text-sm text-gray-300 focus:border-cyan-500 focus:outline-none disabled:opacity-50"
                >
                  {YEARS.filter(y => y > baselineYear).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* 3. Data Input */}
        <CollapsibleSection title="Data Input" icon={<UploadCloud size={14} />}>
          <button
            onClick={onOpenUpload}
            className="w-full flex items-center justify-center gap-3 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 rounded-lg text-xs font-bold uppercase transition-all text-gray-300 group"
          >
            <div className="p-2 bg-gray-900 rounded-full group-hover:scale-110 transition-transform">
              <UploadCloud size={18} className="text-cyan-500" />
            </div>
            <span>Import External Data</span>
          </button>
          <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold mt-2 px-1">
            <span>CSV</span>
            <span>GeoJSON</span>
            <span>Shapefile</span>
          </div>
        </CollapsibleSection>

        {/* 4. Analysis Controls */}
        <CollapsibleSection title="Analysis" icon={<Layers size={14} />}>
          <button
            onClick={onRunAnalysis}
            disabled={analysisLoading || viewMode === 'playground'}
            className={`w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 p-[1px] rounded-lg
                 ${(analysisLoading || viewMode === 'playground') ? 'opacity-50 cursor-not-allowed' : ''}
              `}
          >
            <div className="bg-gray-900/80 group-hover:bg-gray-900/0 transition-colors duration-300 rounded-[7px] w-full h-full p-3 flex items-center justify-center gap-3">
              {analysisLoading ? <Loader2 className="animate-spin text-white" /> : <Play fill="currentColor" size={16} className="text-white" />}
              <span className="font-bold text-sm tracking-wide uppercase text-white">
                {analysisLoading ? 'Processing...' : 'Run Analysis'}
              </span>
            </div>
          </button>

          {/* Timeline Controls */}
          <div className="mt-4 p-3 bg-gray-950 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Timeline Playback</span>
              {isTimeMode && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>}
            </div>
            <button
              onClick={onTimeMode}
              className={`w-full py-2 flex items-center justify-center gap-2 rounded text-xs font-bold uppercase transition-all border 
                    ${isTimeMode
                  ? 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                }`}
            >
              {isTimeMode ? <><StopCircle size={14} /> Stop</> : <><Play size={14} /> Play Animation</>}
            </button>
          </div>
        </CollapsibleSection>

        {/* Diagnostic Toggle Footer */}
        <div className="mt-auto pt-6 border-t border-gray-800">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${debugMode ? 'text-green-500' : 'text-gray-600 hover:text-gray-400'} transition-colors`}
          >
            <Settings size={12} />
            Diagnostics: {debugMode ? 'ONLINE' : 'OFFLINE'}
          </button>
        </div>

      </div>
    </div>
  );
};