import { useState } from 'react';
import { runShorelineAnalysis } from '../services/api';
import { YEARS } from '../types';

export const useCoastalAnalysis = () => {
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runAnalysis = async (site: string, baselineYear: number, targetYear: number | string) => {
        setLoading(true);
        setError(null);
        try {
            // Logic for comparison years: If specific year selected, use that. Else use all years > baseline
            const comparisonYears = targetYear
                ? [Number(targetYear)]
                : YEARS.filter(y => y > baselineYear);

            const data = await runShorelineAnalysis(site, baselineYear, comparisonYears);
            setResults(data);
            return data;
        } catch (err: any) {
            setError(err.message || "Analysis failed");
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        results,
        loading,
        error,
        runAnalysis,
        setResults // Exposed to clear results if needed
    };
};
