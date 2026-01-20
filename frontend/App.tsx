import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MapData } from './components/MapData';
import { InsightsPanel } from './components/InsightsPanel';
import { LayerMetadata, FilterState, YEARS } from './types';
import { fetchMetadata, runShorelineAnalysis } from './services/api';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    site: 'A',
    year: '2020',
    parameter: 'Shoreline',
    search: ''
  });

  const [baselineYear, setBaselineYear] = useState(2011);
  const [availableLayers, setAvailableLayers] = useState<LayerMetadata[]>([]);
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const [isTimeMode, setIsTimeMode] = useState(false);
  const [animationYear, setAnimationYear] = useState<number>(2011);
  const [debugMode, setDebugMode] = useState(false);

  // Fetch layers when filters change
  useEffect(() => {
    fetchMetadata(filters)
      .then(data => setAvailableLayers(data))
      .catch(console.error);
  }, [filters]);

  // Initial setup: Show baseline and latest shoreline
  useEffect(() => {
    if (filters.site) {
      setActiveLayers([
        `Site${filters.site}_${baselineYear}_Shoreline`,
        `Site${filters.site}_2020_Shoreline`
      ]);
    }
  }, [filters.site, baselineYear]);

  // Animation Loop
  useEffect(() => {
    let interval: any;
    if (isTimeMode) {
      interval = setInterval(() => {
        setAnimationYear(prev => {
          const next = prev + 1;
          return next > 2020 ? 2011 : next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimeMode]);

  // Update active layers for time mode
  useEffect(() => {
    if (isTimeMode && filters.site) {
      setActiveLayers([`Site${filters.site}_${animationYear}_Shoreline`]);
    }
  }, [animationYear, isTimeMode, filters.site]);

  const handleRunAnalysis = async () => {
    if (!filters.site) return;
    setAnalysisLoading(true);
    setShowInsights(true);

    try {
      const comparisonYears = filters.year ? [Number(filters.year)] : YEARS.filter(y => y > baselineYear);
      const results = await runShorelineAnalysis(filters.site, baselineYear, comparisonYears);
      setAnalysisResults(results);
    } catch (err) {
      console.error(err);
      alert("Analysis failed: Ensure backend is running.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleExport = (format: 'json' | 'csv') => {
    if (!analysisResults) return;
    const blob = new Blob([format === 'json' ? JSON.stringify(analysisResults, null, 2) : "Site,Year,Metric\n" + analysisResults.site + "," + analysisResults.comparisonYear + "," + analysisResults.netChangeSqm], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Coastal_Analysis_Report.${format}`;
    a.click();
  };

  const toggleLayer = (layerName: string) => {
    setActiveLayers(prev =>
      prev.includes(layerName)
        ? prev.filter(n => n !== layerName)
        : [...prev, layerName]
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-black font-sans selection:bg-indigo-500 selection:text-white">

      <Sidebar
        filters={filters}
        setFilters={setFilters}
        availableLayers={availableLayers}
        activeLayers={activeLayers}
        toggleLayer={toggleLayer}
        onTimeMode={() => setIsTimeMode(!isTimeMode)}
        isTimeMode={isTimeMode}
        onRunAnalysis={handleRunAnalysis}
        analysisLoading={analysisLoading}
        debugMode={debugMode}
        setDebugMode={setDebugMode}
        baselineYear={baselineYear}
        setBaselineYear={setBaselineYear}
      />

      <main className="flex-1 relative flex flex-col bg-gray-100 dark:bg-gray-950">

        {/* Map Container */}
        <div className="flex-1 min-h-[600px] transition-all duration-500 ease-in-out">
          <MapData
            activeLayers={activeLayers}
            allLayers={availableLayers}
            siteFilter={filters.site || 'A'}
            heatmapPoints={analysisResults?.heatmapPoints}
            debugMode={debugMode}
          />
        </div>

        {/* Time Mode Indicator Overlay */}
        <AnimatePresence>
          {isTimeMode && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-[1000] flex items-center gap-8 text-white min-w-[400px]"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-1">Animation Timeline</span>
                <div className="text-3xl font-black tracking-tighter transition-all duration-300 tabular-nums">{animationYear}</div>
              </div>
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                  animate={{ width: `${((animationYear - 2011) / 9) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                Live Deck
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analytics Insights Overlay */}
        {showInsights && (
          <InsightsPanel
            results={analysisResults}
            loading={analysisLoading}
            onExport={handleExport}
            onClose={() => setShowInsights(false)}
          />
        )}

      </main>

    </div>
  );
};

export default App;