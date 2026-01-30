import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MapView } from './components/MapView';
import { AnalyticalView } from './components/AnalyticalView';
import { ChangeInsights } from './components/ChangeInsights';
import { MetadataCatalogue } from './components/MetadataCatalogue';
import { FilterState, LayerMetadata } from './types';
import { fetchMetadata } from './services/api';
import { useCoastalAnalysis } from './hooks/useCoastalAnalysis';

const App: React.FC = () => {
  // --- STATE ---
  const [viewMode, setViewMode] = useState<'standard' | 'analytical' | 'metadata'>('standard');

  const [filters, setFilters] = useState<FilterState>({
    site: 'A',
    year: '2020',
    parameter: 'Shoreline',
    search: ''
  });

  const [baselineYear, setBaselineYear] = useState(2011);
  const [availableLayers, setAvailableLayers] = useState<LayerMetadata[]>([]);
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [showInsights, setShowInsights] = useState(false);

  // Time Animation State
  const [isTimeMode, setIsTimeMode] = useState(false);
  const [animationYear, setAnimationYear] = useState<number>(2011);
  const [debugMode, setDebugMode] = useState(false);

  const { results, loading, runAnalysis } = useCoastalAnalysis();

  // --- EFFECTS ---

  // Fetch layers metadata
  useEffect(() => {
    fetchMetadata(filters)
      .then(data => setAvailableLayers(data))
      .catch(console.error);
  }, [filters]);

  // Initial Layer Setup
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
          // Loop between baseline and target (simplify to 2020 for now)
          return next > 2020 ? baselineYear : next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimeMode, baselineYear]);

  // Sync animation with active layers
  useEffect(() => {
    if (isTimeMode && filters.site) {
      setActiveLayers([`Site${filters.site}_${animationYear}_Shoreline`]);
    } else if (!isTimeMode && filters.site && activeLayers.length < 2) {
      // Restore default view if stopped
      setActiveLayers([
        `Site${filters.site}_${baselineYear}_Shoreline`,
        `Site${filters.site}_${filters.year || 2020}_Shoreline`
      ]);
    }
  }, [animationYear, isTimeMode, filters.site]);

  // --- HANDLERS ---

  const handleRunAnalysis = async () => {
    if (!filters.site) return;
    setShowInsights(true);
    await runAnalysis(filters.site, baselineYear, filters.year || 2020);
  };

  const handleExport = (format: 'json' | 'csv') => {
    if (!results) return;
    const blob = new Blob(
      [format === 'json' ? JSON.stringify(results, null, 2) :
        `Site,Year,NetChange\n${results.site},${results.comparisonYear},${results.netChangeSqm}`],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Coastal_Report.${format}`;
    a.click();
  };

  const toggleLayer = (layerName: string) => {
    setActiveLayers(prev =>
      prev.includes(layerName) ? prev.filter(n => n !== layerName) : [...prev, layerName]
    );
  };

  const targetYear = Number(filters.year || 2020);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black font-sans selection:bg-cyan-500 selection:text-black">

      <Sidebar
        filters={filters}
        setFilters={setFilters}
        availableLayers={availableLayers}
        activeLayers={activeLayers}
        toggleLayer={toggleLayer} // Optional usages
        onTimeMode={() => setIsTimeMode(!isTimeMode)}
        isTimeMode={isTimeMode}
        onRunAnalysis={handleRunAnalysis}
        analysisLoading={loading}
        debugMode={debugMode}
        setDebugMode={setDebugMode}
        baselineYear={baselineYear}
        setBaselineYear={setBaselineYear}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <main className="flex-1 relative flex flex-col bg-gray-950">

        {viewMode === 'standard' ? (
          <MapView
            activeLayers={activeLayers}
            allLayers={availableLayers}
            siteFilter={filters.site || 'A'}
            heatmapPoints={results?.heatmapPoints}
            debugMode={debugMode}
            animationYear={animationYear}
            isTimeMode={isTimeMode}
            baselineYear={baselineYear}
            comparisonYear={targetYear}
          />
        ) : viewMode === 'analytical' ? (
          <AnalyticalView
            site={filters.site || 'A'}
            baselineYear={baselineYear}
            targetYear={targetYear}
            heatmapPoints={results?.heatmapPoints}
          />
        ) : (
          <MetadataCatalogue />
        )}

        {/* Floating Insights Panel (Right) - Visible in both modes or just standard? User requirement implies Right Panel. */}
        {showInsights && (
          <ChangeInsights
            results={results}
            loading={loading}
            onExport={handleExport}
            onClose={() => setShowInsights(false)}
          />
        )}

      </main>
    </div>
  );
};

export default App;