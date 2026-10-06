import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const failures = [];
const appId = JSON.parse(readFileSync('app.json', 'utf8')).expo.android.package;
const flows = ['cliente-registro-y-reserva', 'profesional-ver-citas', 'cliente-login-y-mis-citas'];
for (const feature of ['cliente-reserva', 'profesional-agenda', 'cliente-mis-citas']) {
  const path = `tests/features/${feature}.feature`;
  if (!existsSync(path)) failures.push(`Falta escenario Gherkin: ${feature}`);
  else if (!readFileSync(path, 'utf8').startsWith('# language: es'))
    failures.push(`Idioma Gherkin incorrecto: ${feature}`);
}
for (const file of [
  'docs/arquitectura.html',
  'docs/e2e/escenarios.html',
  'README.md',
  'docs/auditoria-nativa.md',
  'docs/verificacion.md',
]) {
  if (!existsSync(file)) {
    failures.push(`Falta ${file}`);
    continue;
  }
  const source = readFileSync(file, 'utf8');
  const links = file.endsWith('.html')
    ? [...source.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1])
    : [...source.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]);
  for (const link of links) {
    if (/^(https?:|data:|#|mailto:)/.test(link)) continue;
    const target = resolve(dirname(file), link.split('#')[0]);
    if (!existsSync(target)) failures.push(`Enlace roto: ${file} → ${link}`);
  }
}
const resultsFile = 'docs/e2e/reports/results.json';
const results = existsSync(resultsFile)
  ? JSON.parse(readFileSync(resultsFile, 'utf8')).results
  : [];
for (const flow of flows) {
  const yaml = readFileSync(`.maestro/${flow}.yaml`, 'utf8');
  if (!yaml.startsWith(`appId: ${appId}`)) failures.push(`appId incorrecto: ${flow}`);
  const result = results.find((item) => item.flow === flow);
  if (!result?.passed || result.exitCode !== 0) failures.push(`Flow sin éxito acreditado: ${flow}`);
  const image = `docs/e2e/screenshots/${flow}.png`;
  if (!existsSync(image)) failures.push(`Falta captura: ${flow}`);
  else {
    const bytes = readFileSync(image);
    if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || bytes.readUInt32BE(16) === 0)
      failures.push(`PNG inválido: ${flow}`);
  }
  const report = `docs/e2e/reports/${flow}.xml`;
  if (!existsSync(report)) failures.push(`Falta reporte JUnit: ${flow}`);
  else if (/<failure\b|<error\b/.test(readFileSync(report, 'utf8')))
    failures.push(`JUnit con fallos: ${flow}`);
}
const architecture = readFileSync('docs/arquitectura.html', 'utf8');
if ((architecture.match(/<svg\b/g) ?? []).length < 3)
  failures.push('Faltan diagramas locales de arquitectura/datos/E2E');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    'Artefactos, enlaces locales, identificadores, capturas PNG y tres reportes E2E verificados.',
  );
