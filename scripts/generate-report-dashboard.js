const fs = require('fs');
const path = require('path');

const root = process.cwd();
const jsonResultsPath = path.join(root, 'test-results', 'results.json');
const summaryPath = path.join(root, 'test-results', 'learning-summary.json');
const outputPath = path.join(root, 'playwright-report', 'learning-dashboard.html');

function readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function flattenSpecs(suites = [], out = []) {
  for (const suite of suites) {
    if (suite.specs?.length) out.push(...suite.specs);
    if (suite.suites?.length) flattenSpecs(suite.suites, out);
  }
  return out;
}

function buildHtml({ summary, results }) {
  const totals = summary.totals || { total: 0, passed: 0, failed: 0, skipped: 0 };
  const durationMs = summary.durationMs || results.stats?.duration || 0;
  const failures = summary.failures || [];
  const tests = summary.tests || [];
  const byProject = summary.byProject || {};
  const byFile = summary.byFile || {};

  const pieTotal = Math.max(totals.total, 1);
  const passPct = ((totals.passed / pieTotal) * 100).toFixed(1);
  const failPct = ((totals.failed / pieTotal) * 100).toFixed(1);
  const skipPct = ((totals.skipped / pieTotal) * 100).toFixed(1);

  const fileRows = Object.entries(byFile)
    .sort((a, b) => b[1].durationMs - a[1].durationMs)
    .map(([file, stats]) => {
      return `<tr>
        <td>${file}</td>
        <td>${stats.passed || 0}</td>
        <td>${stats.failed || 0}</td>
        <td>${stats.skipped || 0}</td>
        <td>${stats.durationMs || 0}</td>
      </tr>`;
    })
    .join('');

  const projectBlocks = Object.entries(byProject)
    .map(([project, stats]) => {
      const total = (stats.passed || 0) + (stats.failed || 0) + (stats.skipped || 0) || 1;
      return `
        <div class="project-card">
          <h3>${project}</h3>
          <div class="bar"><span style="width:${((stats.passed || 0) / total) * 100}%" class="pass"></span></div>
          <div class="bar"><span style="width:${((stats.failed || 0) / total) * 100}%" class="fail"></span></div>
          <div class="bar"><span style="width:${((stats.skipped || 0) / total) * 100}%" class="skip"></span></div>
          <p>P:${stats.passed || 0} F:${stats.failed || 0} S:${stats.skipped || 0}</p>
        </div>
      `;
    })
    .join('');

  const failureItems = failures.length
    ? failures
        .map(
          (f) => `<li><strong>${f.title}</strong> <em>(${f.project})</em><br/><small>${f.file}</small><br/>${f.error}</li>`,
        )
        .join('')
    : '<li>No failures 🎉</li>';

  const allSpecs = flattenSpecs(results.suites || []);

  const testRows = tests.length
    ? tests
        .map(
          (t) => `<tr>
        <td>${t.fullTitle || t.title}</td>
        <td>${t.project}</td>
        <td>${t.status}</td>
        <td>${t.durationMs}</td>
      </tr>`,
        )
        .join('')
    : '<tr><td colspan="4">No test list data</td></tr>';

  const testsBySpec = tests.reduce((acc, test) => {
    const spec = test.file || 'unknown-spec';
    if (!acc[spec]) acc[spec] = [];
    acc[spec].push(test);
    return acc;
  }, {});

  const expandableSpecs = Object.entries(testsBySpec)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([spec, specTests]) => {
      const passed = specTests.filter((t) => t.status === 'passed').length;
      const failed = specTests.filter((t) => t.status === 'failed').length;
      const skipped = specTests.filter((t) => t.status === 'skipped').length;

      const rows = specTests
        .map(
          (t) => `<tr>
            <td>${t.title}</td>
            <td>${t.project}</td>
            <td>${t.status}</td>
            <td>${t.durationMs}</td>
          </tr>`,
        )
        .join('');

      return `
        <details class="spec-details">
          <summary>
            <span class="spec-title">${spec}</span>
            <span class="spec-meta">Total: ${specTests.length} | ✅ ${passed} | ❌ ${failed} | ⏭ ${skipped}</span>
          </summary>
          <table>
            <thead><tr><th>Test</th><th>Project</th><th>Status</th><th>Duration ms</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </details>
      `;
    })
    .join('');

  return `<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Playwright Learning Dashboard</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; background: #0f172a; color: #e2e8f0; }
    h1, h2 { margin: 0 0 12px; }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(120px, 1fr)); gap: 12px; margin: 16px 0; }
    .card { background: #1e293b; padding: 12px; border-radius: 10px; }
    .big { font-size: 24px; font-weight: bold; }
    .layout { display: grid; grid-template-columns: 320px 1fr; gap: 16px; margin: 20px 0; }
    .panel { background: #1e293b; padding: 14px; border-radius: 10px; }
    .pie { width: 220px; height: 220px; border-radius: 50%; margin: 10px auto; background:
      conic-gradient(#22c55e 0 ${passPct}%, #ef4444 ${passPct}% ${Number(passPct) + Number(failPct)}%, #f59e0b ${Number(passPct) + Number(failPct)}% 100%);
    }
    .legend span { display: inline-block; margin-right: 10px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 5px; }
    .project-wrap { display: grid; grid-template-columns: repeat(3, minmax(180px, 1fr)); gap: 10px; }
    .project-card { background: #334155; padding: 10px; border-radius: 8px; }
    .bar { height: 8px; background: #0f172a; border-radius: 8px; margin: 6px 0; overflow: hidden; }
    .bar span { display: block; height: 100%; }
    .pass { background: #22c55e; }
    .fail { background: #ef4444; }
    .skip { background: #f59e0b; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border-bottom: 1px solid #334155; padding: 8px; text-align: left; }
    ul { margin: 0; padding-left: 18px; }
    .spec-details { background: #1e293b; border-radius: 8px; padding: 8px 10px; margin-bottom: 10px; }
    .spec-details summary { cursor: pointer; display: flex; justify-content: space-between; gap: 10px; list-style: none; }
    .spec-details summary::-webkit-details-marker { display: none; }
    .spec-title { font-weight: 600; }
    .spec-meta { color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <h1>📈 Playwright Enhanced Dashboard</h1>
  <p>Generated: ${summary.generatedAt || new Date().toISOString()}</p>

  <div class="grid">
    <div class="card"><div>Total</div><div class="big">${totals.total}</div></div>
    <div class="card"><div>Passed</div><div class="big">${totals.passed}</div></div>
    <div class="card"><div>Failed</div><div class="big">${totals.failed}</div></div>
    <div class="card"><div>Duration (ms)</div><div class="big">${Math.round(durationMs)}</div></div>
  </div>

  <div class="layout">
    <div class="panel">
      <h2>Status split</h2>
      <div class="pie"></div>
      <div class="legend">
        <span><i class="dot" style="background:#22c55e"></i>Pass ${passPct}%</span>
        <span><i class="dot" style="background:#ef4444"></i>Fail ${failPct}%</span>
        <span><i class="dot" style="background:#f59e0b"></i>Skip ${skipPct}%</span>
      </div>
    </div>
    <div class="panel">
      <h2>By project</h2>
      <div class="project-wrap">${projectBlocks || '<div>No data</div>'}</div>
    </div>
  </div>

  <div class="layout">
    <div class="panel">
      <h2>Failures</h2>
      <ul>${failureItems}</ul>
    </div>
    <div class="panel">
      <h2>Slow files (duration)</h2>
      <table>
        <thead><tr><th>File</th><th>Pass</th><th>Fail</th><th>Skip</th><th>Duration ms</th></tr></thead>
        <tbody>${fileRows || '<tr><td colspan="5">No file data</td></tr>'}</tbody>
      </table>
      <p>Total specs in JSON: ${allSpecs.length}</p>
    </div>
  </div>

  <div class="panel">
    <h2>Test names run (${tests.length})</h2>
    <table>
      <thead><tr><th>Test</th><th>Project</th><th>Status</th><th>Duration ms</th></tr></thead>
      <tbody>${testRows}</tbody>
    </table>
  </div>

  <div class="panel">
    <h2>Specs (expand to view tests)</h2>
    ${expandableSpecs || '<p>No spec grouping data</p>'}
  </div>
</body>
</html>`;
}

function main() {
  const results = readJsonSafe(jsonResultsPath);
  const summary = readJsonSafe(summaryPath);
  const html = buildHtml({ summary, results });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`Dashboard written to ${outputPath}`);
}

main();
