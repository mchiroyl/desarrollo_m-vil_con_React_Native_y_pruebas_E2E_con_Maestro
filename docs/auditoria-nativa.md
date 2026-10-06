# Auditoría nativa de Glowbook

Se aplicaron Impeccable 4.5.0 (`context`, `audit.native`, `craft-floor` y referencia Android)
a una aplicación React Native existente. Se conservaron sus colores, componentes y estructura.
No se ejecutó el detector HTML/CSS ni se configuraron hooks web para componentes nativos.
El contexto del producto está en [PRODUCT.md](../PRODUCT.md).

## Alcance y criterios

Código fuente de las ocho rutas, componentes compartidos, tema y navegación. Los flows Maestro
producen capturas del emulador Pixel 7 / Android 14; su estado observado está en
[escenarios.html](e2e/escenarios.html). La revisión estática no acredita TalkBack, rendimiento en
hardware real ni adaptación a tablet. Los resultados son una evaluación técnica, no la nota
académica del proyecto.

| Dimensión            | Evaluación de código (0–4) | Evidencia y límites                                                                                                                                                                                                                                        |
| -------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accesibilidad        | 3                          | Todos los Pressable/TextInput tienen testID y etiquetas; los botones y campos compartidos las propagan. Se ampliaron los objetivos táctiles y se oscureció el texto secundario. Navegación respeta Reduce Motion. TalkBack completo pendiente de hardware. |
| Rendimiento          | 2                          | Repositorio asíncrono, consultas parametrizadas, caché e invalidación por claves. La disponibilidad se inserta por lotes. Las listas usan ScrollView y no están virtualizadas para grandes volúmenes. No se hicieron benchmarks.                           |
| Apariencia y tema    | 3                          | Tema compartido y estados de selección, carga, vacío, error y confirmación. Apariencia clara explícita; no ofrece tema oscuro. Persisten algunos colores locales en componentes.                                                                           |
| Convenciones Android | 3                          | SafeAreaView, teclado, navegación nativa con Expo Router, Back y diálogos con Modal. Identificador propio y capturas desde Android. Navegación visual personalizada con Lucide; no es una implementación completa de Material 3.                           |
| Adaptación           | 2                          | Formularios desplazables y diálogo con ancho máximo. Orientación vertical; no hay diseño específico para tablet, plegables ni orientación horizontal.                                                                                                      |
| Total                | 13/20                      | Evaluación acotada de código; no equivale a una calificación ni a una auditoría de producción.                                                                                                                                                             |

## Problemas corregidos

- Controles sin etiquetas explícitas: etiquetas en servicios, días, horarios, filtros, enlaces,
  tarjetas y navegación. `AppButton` anuncia su texto y estado; `TextField` anuncia su etiqueta.
- Objetivos táctiles pequeños: controles de rol, filtros, horarios, especialidad, iconos y
  enlaces se ampliaron a 48 dp o más.
- Texto secundario de bajo contraste: `colors.muted` pasó a `#58645E` para lectura sobre las
  superficies claras. Los campos conservan el escalado de texto del sistema.
- Cambios de estado sin confirmación: diálogos de revisión de reserva y confirmación/cancelación,
  con testID en aceptar y volver; las acciones duplicadas se bloquean mientras se guarda.
- Errores confundidos con datos ausentes: detalle de cita y perfil distinguen fallos de lectura y
  permiten reintentar. Las agendas incluyen estados vacíos y mensajes de error.
- Inicio lento y sin estado visible: se eliminó una inserción redundante de horarios del seed,
  se conservó su inserción por lotes y se añadió una pantalla de carga durante la inicialización.
  El provider se vuelve a montar al reintentar, sin conservar una promesa rechazada de Suspense.
- Sesión y rol sin restricción completa: protección central que también aplica a enlaces directos.

## Hallazgos restantes por prioridad

- **P2 — Listas sin virtualización.** `AppScreen` y agendas usan ScrollView. El volumen demo es
  pequeño; para cientos de citas se recomienda FlatList con paginación. Comando sugerido:
  `/impeccable optimize`.
- **P2 — Alcance limitado de adaptación.** La app conserva el diseño de teléfono vertical;
  no se presenta una validación de tablet o plegables. Comando sugerido: `/impeccable adapt`.
- **P3 — Apariencia clara.** Es una elección explícita de esta entrega, no una prueba de tema
  oscuro. Para ampliar el producto, definir roles semánticos de color para ambas apariencias.
  Comando sugerido: `/impeccable colorize`.

No se identificaron bloqueos de producto en la revisión estática final. La ejecución E2E y sus
limitaciones se informan por separado en [verificacion.md](verificacion.md). Después de ampliar
el alcance, `/impeccable polish` permite revisar la coherencia visual sin sustituir las pruebas.

## Prácticas que se conservan

Texto y errores en español, controles nativos, datos SQLite sin backend, separación del estado
efímero, navegación por archivos y selectores estables. Las capturas de éxito se publican
únicamente cuando Maestro termina con código 0 y genera el archivo correspondiente.
