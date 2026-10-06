# Verificación de Glowbook

Validación local realizada el 5 de octubre de 2026 (Guatemala), sobre el código de esta entrega.
Los resultados automatizados y capturas de los escenarios están en
[escenarios.html](e2e/escenarios.html).

## Instalación y calidad

- `npm ci --ignore-scripts`: instalación limpia completada; 666 paquetes instalados.
- `npm ci --dry-run --ignore-scripts --no-audit --no-fund`: lockfile compatible con el manifiesto.
- `npx expo install --check`: dependencias compatibles con Expo SDK 57.
- `npm run typecheck`, `npm run lint`, `npm run format:check`: código de salida 0.
- `npm run test:unit`: 12 pruebas aprobadas, incluidas persistencia tras reabrir SQLite,
  migración, seed idempotente, disponibilidad, colisiones, autorización, registro y transiciones.

Logs: [tipos](e2e/reports/typecheck.log), [lint](e2e/reports/lint.log),
[tests](e2e/reports/unit.log), [formato](e2e/reports/format.log),
[resultados de calidad](e2e/reports/quality-results.json).

## Compilación y ejecución Android

Node 24.19.0, JDK 21.0.12, Android SDK local y emulador Pixel 7 API 34 (Android 14, x86_64).
Metro inició en el puerto 8081 y compiló el bundle Android; la app instalada mostró la interfaz
en español sin una pantalla de error de JavaScript.

Comando ejecutado desde `android/`:

```powershell
./gradlew.bat assembleDebug -PreactNativeArchitectures=x86_64 --max-workers=1 '-Dorg.gradle.jvmargs=-Xmx1536m -XX:MaxMetaspaceSize=512m' '-Dorg.gradle.parallel=false'
```

Resultado: `BUILD SUCCESSFUL in 11m 46s`, 453 tareas (403 ejecutadas y 50 actualizadas).
APK debug: `android/app/build/outputs/apk/debug/app-debug.apk`, 88 525 540 bytes,
identificador verificado en los metadatos: `com.glowbook.app`.
SHA-256: `D77359ECB6E6013DEE10A113CA8C10932FEFE06946DC5D7192A490BE31BA24DE`.
`adb install -r` terminó con `Success`; se conectó Metro mediante `adb reverse tcp:8081 tcp:8081`.
Resumen del artefacto compilado: [android-build.json](e2e/reports/android-build.json).

El entorno Windows requirió un ajuste temporal de `JAVA_TOOL_OPTIONS`
para los sockets internos del JDK. Se liberó el daemon Gradle después de compilar para reducir
la presión de memoria del emulador. No se cambiaron ajustes globales de Java.

Si Java informa `Unable to establish loopback connection`, esta fue la configuración usada
en PowerShell antes de compilar o ejecutar Maestro:

```powershell
$env:JAVA_TOOL_OPTIONS = '-Djdk.net.unixdomain.tmpdir=D:\UMG\QA\mobile\.unavailable-unix-socket-directory'
```

La ruta corresponde al equipo de validación y debe permanecer inexistente para que el pipe
interno del JDK use el fallback TCP. Este ajuste solo afecta al proceso y sus hijos;
no debe configurarse globalmente ni aplicarse si el problema no aparece.
[Propiedad documentada por Oracle](https://docs.oracle.com/en/java/javase/16/core/networking-properties.html).

## Maestro y evidencia

Maestro 2.11.0 ejecuta los tres YAML con estado limpio e identificador nativo propio.
El script `npm run e2e` guarda reportes JUnit y logs; publica una captura solamente si el flow
sale con código 0 y genera el PNG. El estado exacto de la última ejecución está en
[results.json](e2e/reports/results.json).

La primera reserva falló porque el teclado cubría el siguiente campo del flow;
se corrigió ocultando el teclado y desplazando cada campo antes de tocarlo.
Un intento del flow de agenda no inició al perder la conexión del driver Android.
Se repitieron los flows pendientes con `MAESTRO_DRIVER_STARTUP_TIMEOUT=180000`;
los reportes publicados corresponden al último intento de cada escenario.
Se eliminó además una inserción redundante de cientos de horarios individuales del seed:
la inicialización utiliza la renovación por lotes y muestra un estado de carga en español.
Los flows esperan a que la pantalla esté lista antes de interactuar o abrir enlaces.

- Registro, exploración y reserva: [flow](../.maestro/cliente-registro-y-reserva.yaml).
- Profesional, detalle, confirmación y cancelación: [flow](../.maestro/profesional-ver-citas.yaml).
- Cliente, agenda, restricciones por rol y persistencia tras reiniciar:
  [flow](../.maestro/cliente-login-y-mis-citas.yaml).

`node scripts/update-e2e-docs.mjs` genera el HTML desde esos resultados.
`npm run verify:artifacts` comprueba enlaces locales, identificadores, reportes y PNG reales.

Las fechas y duraciones de la última ejecución están en los JSON y reportes JUnit por escenario.
La ejecución final terminó con **3/3 flows aprobados**, cada uno con código de salida 0 y captura.
Se reinició Metro con `--clear`, sin modo CI, para que los flows usaran el código final.
El bundle se volvió a generar y se comprobó que contiene el nuevo estado de carga;
su tamaño y SHA-256 están en [metro-bundle.json](e2e/reports/metro-bundle.json).

Se inspeccionaron las tres capturas nativas y se renderizaron los HTML en Chrome local.
`npm run verify:artifacts` terminó con código 0: enlaces, tres Gherkin, appId, PNG y JUnit
comprobados. Los diagramas SVG se renderizan localmente sin servicios externos.

## Límites comprobables

- Se validó Android en emulador y una build debug. iOS, una build release, TalkBack en hardware,
  tablets y grandes volúmenes de datos no se presentan como probados.
- `npm audit` informó 29 avisos transitivos (10 moderados y 19 altos), conservados en
  [dependency-audit.json](e2e/reports/dependency-audit.json). No se aplicó `audit fix --force`
  porque propone cambios incompatibles del stack. La entrega usa autenticación local de
  demostración y no sustituye un servicio de identidad para producción.
- La build informa deprecaciones de dependencias para futuras versiones de Gradle;
  no impidieron compilar ni instalar el APK.
- La auditoría [nativa](auditoria-nativa.md) distingue la revisión de código de las pruebas
  ejecutadas. Ninguna de estas verificaciones garantiza la calificación del evaluador.
