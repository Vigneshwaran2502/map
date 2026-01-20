const API_BASE = 'http://localhost:3001/api';

async function run() {
    try {
        console.log('Testing /api/sites...');
        const r1 = await fetch(`${API_BASE}/sites`);
        console.log('Sites Status:', r1.status);
        if (r1.ok) {
            const data1 = await r1.json();
            console.log('Sites Data:', JSON.stringify(data1).substring(0, 100) + '...');
        } else {
            console.log('Sites Error:', await r1.text());
        }

        console.log('Testing /api/analysis/shoreline-change...');
        const r2 = await fetch(`${API_BASE}/analysis/shoreline-change`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ site: 'A', baselineYear: 2011, comparisonYears: [2020] })
        });
        console.log('Analysis Status:', r2.status);
        if (r2.ok) {
            const data2 = await r2.json();
            console.log('Analysis Keys:', Object.keys(data2));
        } else {
            console.log('Analysis Error:', await r2.text());
        }
    } catch (e) {
        console.error('Test Execution Error:', e);
    }
}

run();
