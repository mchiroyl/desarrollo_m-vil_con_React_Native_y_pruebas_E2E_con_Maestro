import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';

const flows = ['cliente-registro-y-reserva', 'profesional-ver-citas', 'cliente-login-y-mis-citas'];
const requestedFlows = process.argv.slice(2);
if (requestedFlows.some((flow) => !flows.includes(flow))) {
  console.error(`Flow desconocido. Opciones: ${flows.join(', ')}`);
  process.exit(1);
}
const selectedFlows = requestedFlows.length
  ? flows.filter((flow) => requestedFlows.includes(flow))
  : flows;
const screenshots = resolve('docs/e2e/screenshots');
const reports = resolve('docs/e2e/reports');
mkdirSync(screenshots, { recursive: true });
mkdirSync(reports, { recursive: true });
const resultsFile = join(reports, 'results.json');
const previousResults =
  requestedFlows.length && existsSync(resultsFile)
    ? JSON.parse(readFileSync(resultsFile, 'utf8')).results
    : [];
const results = previousResults.filter((result) => !selectedFlows.includes(result.flow));

function findScreenshot(directory, name) {
  if (!existsSync(directory)) return null;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      const match = findScreenshot(path, name);
      if (match) return match;
    } else if (entry.name === `${name}.png`) return path;
  }
  return null;
}

for (const flow of selectedFlows) {
  const runDirectory = `docs/e2e/runs/${flow}-${Date.now()}`;
  mkdirSync(runDirectory, { recursive: true });
  const args = [
    'test',
    '--no-ansi',
    '--format',
    'JUNIT',
    '--output',
    `docs/e2e/reports/${flow}.xml`,
    '--test-output-dir',
    runDirectory,
    '--debug-output',
    join(runDirectory, 'debug'),
    `.maestro/${flow}.yaml`,
  ];
  const startedAt = new Date().toISOString();
  console.log(`Ejecutando ${flow}…`);
  const isWindows = process.platform === 'win32';
  const run = spawnSync(
    isWindows ? (process.env.ComSpec ?? 'cmd.exe') : 'maestro',
    isWindows ? ['/d', '/c', 'maestro.bat', ...args] : args,
    {
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    },
  );
  const log = `${run.stdout ?? ''}\n${run.stderr ?? ''}${run.error ? `\n${run.error.message}` : ''}`;
  writeFileSync(join(reports, `${flow}.log`), log);
  console.log(log);
  const capture = findScreenshot(runDirectory, flow);
  const passed = run.status === 0 && capture !== null;
  if (passed) copyFileSync(capture, join(screenshots, `${flow}.png`));
  results.push({
    flow,
    passed,
    exitCode: run.status,
    startedAt,
    finishedAt: new Date().toISOString(),
    screenshot: passed ? `screenshots/${flow}.png` : null,
    runDirectory,
  });
}
writeFileSync(
  resultsFile,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      results: flows.flatMap((flow) => results.filter((result) => result.flow === flow)),
    },
    null,
    2,
  ),
);
process.exitCode = results.every((result) => result.passed) ? 0 : 1;
