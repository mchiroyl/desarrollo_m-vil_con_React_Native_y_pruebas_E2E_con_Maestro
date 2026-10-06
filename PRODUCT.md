# Glowbook

<!-- impeccable:product-schema 1 -->

## Platform

android

## Usuarios y propósito

Clientes que buscan servicios de belleza y bienestar y profesionales que gestionan citas.
Proyecto académico y de portafolio para demostrar desarrollo móvil y pruebas E2E verificables.

## Flujos

Selección de rol, registro e inicio de sesión mock. El cliente explora categorías y profesionales,
reserva un servicio con fecha y horario y consulta sus citas. El profesional consulta su agenda,
abre el detalle y confirma o cancela mediante una decisión explícita.

## Restricciones confirmadas

React Native con Expo y TypeScript, Expo Router, SQLite local como fuente principal, React Query
y Zustand para estado efímero. Sin backend, pagos ni servicios externos. Texto visible en español
latinoamericano; nombres de código en inglés. Maestro usa el identificador com.glowbook.app.
Las capturas de evidencia deben proceder de ejecuciones reales en Android.

## Accesibilidad y diseño

Conservar la identidad visual existente. Controles con testID y etiquetas de accesibilidad,
áreas táctiles de al menos 48 dp, estados vacíos y de error, manejo del teclado y zonas seguras.
La orientación es vertical y la apariencia es clara. iOS existe en la configuración Expo,
pero esta entrega valida Android; no se presenta evidencia de ejecución en iOS.

## Criterios de aceptación

Instalación reproducible, verificaciones de tipos/lint/formato, pruebas de persistencia y
solapamientos, tres flows Maestro independientes, capturas auténticas y documentos locales.
La calificación corresponde al evaluador y no es una garantía del producto.
