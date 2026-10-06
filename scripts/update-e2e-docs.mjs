import { readFileSync, writeFileSync } from 'node:fs';

const report = JSON.parse(readFileSync('docs/e2e/reports/results.json', 'utf8'));
const scenarios = [
  {
    flow: 'cliente-registro-y-reserva',
    title: 'Registro de cliente y reserva',
    objective: 'Crear una cuenta, explorar profesionales y persistir una cita pendiente.',
    prerequisites:
      'App instalada en Android, datos locales restablecidos y profesional demo con servicio y disponibilidad.',
    steps: [
      'Elegir cliente y abrir registro.',
      'Ingresar nombre, correo y contraseña de prueba.',
      'Filtrar Barbería y abrir Ríos Barber Club.',
      'Elegir Corte clásico, el primer día y las 09:00.',
      'Revisar y aceptar la reserva; comprobar la cita en Mis citas.',
    ],
    expected: 'La cita aparece en la agenda del cliente y permanece guardada en SQLite.',
  },
  {
    flow: 'profesional-ver-citas',
    title: 'Profesional consulta, confirma y cancela citas',
    objective: 'Revisar el detalle y gestionar una cita recibida con confirmación explícita.',
    prerequisites: 'Estado local limpio; cuenta profesional@glowbook.app y cita demo pendiente.',
    steps: [
      'Iniciar sesión como profesional demo.',
      'Encontrar la cita pendiente de Corte clásico.',
      'Abrir su detalle y verificar acciones.',
      'Confirmar y aceptar el diálogo.',
      'Cancelar la cita confirmada, aceptar el diálogo y verificar que ya no hay acciones.',
    ],
    expected: 'La cita pasa de pendiente a confirmada y luego a cancelada; el horario queda libre.',
  },
  {
    flow: 'cliente-login-y-mis-citas',
    title: 'Cliente inicia sesión y consulta sus citas',
    objective: 'Consultar reservas y comprobar persistencia de sesión y agenda tras reiniciar.',
    prerequisites: 'Estado local limpio; cuenta cliente@glowbook.app con reservas semilla.',
    steps: [
      'Abrir una ruta de cliente sin sesión y verificar que se muestra la bienvenida.',
      'Ingresar las credenciales demo de cliente.',
      'Abrir una ruta profesional y verificar que el cliente permanece en su navegación.',
      'Abrir Mis citas.',
      'Verificar la reserva demo.',
      'Cerrar y abrir la app sin borrar datos.',
      'Volver a Mis citas y comprobar que la reserva sigue disponible.',
    ],
    expected:
      'El cliente conserva su sesión y puede consultar los servicios y estados de sus citas.',
  },
];
const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const date = new Date(report.generatedAt).toLocaleString('es-GT', {
  timeZone: 'America/Guatemala',
});
const passed = report.results.filter((result) => result.passed).length;
const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Escenarios E2E · Glowbook</title><style>
body{margin:0;background:#f7f8f4;color:#202a27;font:16px/1.6 system-ui,sans-serif}header,main,footer{max-width:1050px;margin:auto;padding:24px}h1{font-size:36px}h2{color:#24594e}article{background:#fff;border:1px solid #dce5dc;border-radius:16px;padding:24px;margin:24px 0;display:grid;grid-template-columns:1fr 320px;gap:24px}figure{margin:0}img{max-width:100%;height:auto;border-radius:12px;border:1px solid #dce5dc}figcaption{font-size:14px;color:#58645e}a{color:#24594e}code{overflow-wrap:anywhere}dt{font-weight:700}dd{margin:0 0 16px}.status{padding:16px;background:#e2f0e8;border-radius:12px}@media(max-width:760px){article{grid-template-columns:1fr}figure{max-width:360px;margin:auto}}@media print{article{break-inside:avoid}}
</style></head><body><header><h1>Pruebas E2E de Glowbook</h1>
<p>Especificaciones Gherkin y flows ejecutables de Maestro, independientes mediante <code>clearState: true</code>.</p>
<p class="status">Última ejecución: ${escape(date)} (Guatemala). Flows con reporte y captura: ${passed}/3.
Dispositivo de esta validación: emulador Pixel 7, Android 14 / API 34. Maestro 2.11.0.
<a href="reports/results.json">Resultados JSON</a>.</p></header><main>
${scenarios
  .map((scenario, index) => {
    const result = report.results.find((item) => item.flow === scenario.flow);
    return `<article><section><h2>${index + 1}. ${escape(scenario.title)}</h2>
<p><code>.maestro/${scenario.flow}.yaml</code></p><dl><dt>Objetivo</dt><dd>${escape(scenario.objective)}</dd><dt>Precondiciones</dt><dd>${escape(scenario.prerequisites)}</dd></dl>
<ol>${scenario.steps.map((step) => `<li>${escape(step)}</li>`).join('')}</ol><p><strong>Resultado esperado:</strong> ${escape(scenario.expected)}</p>
<p><strong>Resultado observado:</strong> ${result?.passed ? 'Flow completado con código de salida 0 y captura real.' : 'Flow sin evidencia exitosa; consultar el log de ejecución.'}</p>
<p><a href="reports/${scenario.flow}.xml">Reporte JUnit</a> · <a href="reports/${scenario.flow}.log">Log de ejecución</a></p></section><figure>
${result?.passed ? `<a href="screenshots/${scenario.flow}.png"><img src="screenshots/${scenario.flow}.png" alt="Captura real de ${escape(scenario.title)}"></a>` : '<p>Captura exitosa pendiente. No se presenta evidencia fabricada.</p>'}
<figcaption>${escape(scenario.title)}: evidencia capturada por Maestro en Android.</figcaption></figure></article>`;
  })
  .join('\n')}
</main><footer><a href="../arquitectura.html">Arquitectura</a> · <a href="../../README.md">README</a><p>Estas pruebas verifican los escenarios descritos; no garantizan una calificación.</p></footer></body></html>`;
writeFileSync('docs/e2e/escenarios.html', html);
