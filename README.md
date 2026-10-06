# Glowbook

![React Native](https://img.shields.io/badge/React_Native-0.86-149ECA?logo=react)
![Expo](https://img.shields.io/badge/Expo_SDK-57-000020?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)
![Maestro](https://img.shields.io/badge/E2E-Maestro-7D4CDB)
![SQLite](https://img.shields.io/badge/Persistencia-SQLite-003B57?logo=sqlite)

Aplicación móvil para reservar servicios de belleza y bienestar y gestionar citas profesionales. Usa Expo Router, SQLite local, React Query, Zustand y StyleSheet. No requiere backend, credenciales externas ni archivo `.env`. La autenticación y las cuentas son de demostración.

## Requisitos

- Node.js 24 y npm.
- Android Studio con Android SDK, un emulador o un dispositivo con depuración USB.
- JDK 17 o 21; configurar `JAVA_HOME`, `ANDROID_HOME` y las herramientas del SDK en `PATH`.
- Maestro CLI para las pruebas E2E.
- Para compilar iOS: macOS y Xcode. iOS no está validado en esta entrega.

## Instalar y ejecutar

Ejecutar desde la raíz del proyecto:

```bash
npm ci
npx expo start
```

Expo Go permite explorar la app con una versión compatible con el SDK. Para Maestro se necesita instalar la app nativa con identificador **`com.glowbook.app`**; Expo Go utiliza otro identificador.

## Compilar e instalar Android

Con el emulador iniciado o un dispositivo conectado:

```bash
adb devices -l
npm run android
```

El comando genera el proyecto Android si no existe, compila debug, instala la app e inicia Metro. APK generado: `android/app/build/outputs/apk/debug/app-debug.apk`.

Para abrir posteriormente la build debug instalada, iniciar Metro con `npx expo start`. Si el dispositivo conectado por USB no alcanza el servidor:

```bash
adb reverse tcp:8081 tcp:8081
```

Para generar e instalar una variante release con JavaScript incluido, que funciona sin Metro:

```bash
npx expo run:android --variant release
```

La configuración nativa actual utiliza la firma debug; configurar una firma propia antes de distribuir la app. La validación registrada corresponde a debug, no a release.

## Cuentas demo y datos

| Rol         | Correo                   | Contraseña    |
| ----------- | ------------------------ | ------------- |
| Cliente     | cliente@glowbook.app     | Glowbook2026! |
| Profesional | profesional@glowbook.app | Glowbook2026! |

La base `glowbook.db` se inicializa con datos demo automáticamente. Sesión y citas se conservan al reiniciar. Borrar los datos de la app restablece la base; los flows E2E lo hacen para ejecutarse de forma independiente.

## Comprobaciones de código

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test:unit
npx expo install --check
```

Las pruebas unitarias usan SQLite de Node para comprobar las reglas del repositorio. Las pruebas E2E ejecutan la app nativa en Android.

## Pruebas E2E con Maestro

Instalación para macOS/Linux o WSL:

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

Para Windows, seguir la [instalación oficial de Maestro](https://docs.maestro.dev/getting-started/installing-maestro). Comprobar el CLI con `maestro --version` y el dispositivo con `adb devices -l`.

Con la app nativa instalada, el dispositivo conectado y Metro activo si se usa debug:

```bash
maestro test .maestro/cliente-registro-y-reserva.yaml
maestro test .maestro/profesional-ver-citas.yaml
maestro test .maestro/cliente-login-y-mis-citas.yaml
```

Para ejecutar los tres flows, guardar logs/JUnit, recoger capturas y actualizar el HTML:

```bash
npm run e2e
node scripts/update-e2e-docs.mjs
npm run verify:artifacts
```

Para repetir solo un flow conservando los resultados de los demás:

```bash
npm run e2e -- cliente-registro-y-reserva
node scripts/update-e2e-docs.mjs
```

El script publica una captura únicamente cuando el flow termina con código 0 y genera el PNG. Fechas y resultados: [results.json](docs/e2e/reports/results.json).

| Escenario                                         | Captura                                                    | Reporte                                                  |
| ------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| Registro de cliente y reserva                     | [PNG](docs/e2e/screenshots/cliente-registro-y-reserva.png) | [JUnit](docs/e2e/reports/cliente-registro-y-reserva.xml) |
| Profesional: consulta, confirmación y cancelación | [PNG](docs/e2e/screenshots/profesional-ver-citas.png)      | [JUnit](docs/e2e/reports/profesional-ver-citas.xml)      |
| Cliente: acceso y consulta de sus citas           | [PNG](docs/e2e/screenshots/cliente-login-y-mis-citas.png)  | [JUnit](docs/e2e/reports/cliente-login-y-mis-citas.xml)  |

## Estructura

```text
app/                  Rutas de bienvenida, autenticación, cliente y profesional
src/components/       Controles y componentes compartidos
src/data/             SQLite, migraciones, seed, repositorio y hooks
src/state/            Estado efímero de interfaz
src/utils/            Fechas, moneda y solapamientos
plugins/              Configuración nativa para conectar debug con Metro
tests/                Pruebas unitarias y especificaciones Gherkin
.maestro/             Flows E2E Android
scripts/              Ejecución E2E y verificación de artefactos
docs/                 Arquitectura, escenarios, capturas y reportes
```

## Documentación técnica

Para visualizar los HTML, clonar o descargar el repositorio completo y abrirlos en un navegador, conservando las carpetas de capturas y reportes.

- [Arquitectura, diagramas, librerías y patrones](docs/arquitectura.html).
- [Escenarios y casos de uso E2E, con capturas](docs/e2e/escenarios.html).
- Gherkin: [reserva](tests/features/cliente-reserva.feature), [agenda profesional](tests/features/profesional-agenda.feature) y [citas del cliente](tests/features/cliente-mis-citas.feature).
- [Resultados de verificación y diagnóstico de Java en Windows](docs/verificacion.md).
- [Auditoría de interfaz nativa con Impeccable](docs/auditoria-nativa.md).

En emuladores lentos, puede ampliarse el arranque del driver Maestro en PowerShell con `$env:MAESTRO_DRIVER_STARTUP_TIMEOUT='180000'`. [Referencia oficial](https://github.com/mobile-dev-inc/maestro-docs/blob/main/maestro-cli/environment-variables.md).

Para revisar dependencias, ejecutar `npm audit`. Los avisos registrados están en [dependency-audit.json](docs/e2e/reports/dependency-audit.json).
