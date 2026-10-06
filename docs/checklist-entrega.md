# Checklist de entrega de Glowbook

Contraste con las dos capturas de la consigna y con los requisitos ampliados del texto original.
Revisión de archivos y reportes existentes; no se repitieron los flows en esta revisión.
La última ejecución E2E registrada terminó el 5 de octubre de 2026 a las 22:51 en Guatemala.

## Lo solicitado en el diagrama

- [x] Aplicación móvil con React Native y Expo, construida en la raíz del proyecto.
- [x] Cliente puede explorar profesionales y reservar servicios.
- [x] Profesional puede consultar su agenda y el detalle de reservas.
- [x] Pruebas E2E ejecutables con Maestro sobre Android.
- [x] Tres especificaciones Gherkin separadas de los tres flows YAML.
      Gherkin usa `Característica`, `Escenario`, `Dado`, `Cuando` y `Entonces` con `# language: es`.
      Especificaciones: [reserva](../tests/features/cliente-reserva.feature),
      [agenda profesional](../tests/features/profesional-agenda.feature) y
      [citas del cliente](../tests/features/cliente-mis-citas.feature).
      Maestro ejecuta los YAML; no se presenta Gherkin como un runner ni se afirma usar Cucumber.
- [x] HTML que describe cada escenario con capturas reales: [escenarios.html](e2e/escenarios.html).
- [x] HTML técnico con librerías, flujos, patrones y diagramas locales:
      [arquitectura.html](arquitectura.html). Lectura estimada de cuatro minutos; no cronometrada.
- [x] Evidencia de ejecución: tres flows aprobados, códigos de salida 0 y reportes JUnit sin fallos.

## Requisitos ampliados solicitados

- [x] TypeScript, Expo Router y ocho rutas de bienvenida, autenticación, cliente y profesional.
- [x] Registro e inicio de sesión locales, selección de rol y cuentas demo deterministas.
- [x] Restricciones de navegación por sesión y rol, incluidos enlaces directos.
- [x] SQLite como persistencia principal, migración versionada, seed idempotente y consultas parametrizadas.
- [x] React Query para consultas y mutaciones; Zustand para estado efímero; StyleSheet para estilos.
- [x] Usuarios, profesionales, categorías, servicios, disponibilidad, citas y sesión persistidos.
- [x] Prevención de reservas incompatibles del cliente y profesional, con validación transaccional.
- [x] Citas pendientes, confirmadas y canceladas; revisión y confirmación de acciones.
- [x] Interfaz en español, estados vacíos y de carga, validación y manejo de errores.
- [x] Selectores testID, etiquetas de accesibilidad y controles táctiles ampliados.
- [x] Flows con appId `com.glowbook.app`, comentarios en inglés y estado limpio independiente.
- [x] README en español con instalación, ejecución, cuentas demo, comandos Maestro y enlaces de evidencia.
- [x] Impeccable instalado y aplicado como guía de auditoría nativa:
      [auditoria-nativa.md](auditoria-nativa.md).
- [x] Build Android debug compilada e instalada en emulador Pixel 7 API 34.
- [x] TypeScript, ESLint y Prettier aprobados; 12 pruebas aprobadas.
- [x] PNG, Gherkin, appId, JUnit y enlaces locales comprobados nuevamente con `npm run verify:artifacts`.

Evidencia detallada: [verificacion.md](verificacion.md),
[resultados E2E](e2e/reports/results.json) y [resultados de calidad](e2e/reports/quality-results.json).

## Pendiente para cerrar la entrega académica

- [x] Proyecto publicado en la rama `main` del [repositorio público de Glowbook](https://github.com/mchiroyl/desarrollo_m-vil_con_React_Native_y_pruebas_E2E_con_Maestro).
      Push verificado contra el commit local y acceso público comprobado mediante la API de GitHub sin autenticación.
- [x] Archivos publicados comprobados: tres Gherkin, tres flows Maestro, dos HTML y tres capturas reales, junto con código y reportes.
      Para consultar los HTML, descargar o clonar el repositorio completo y abrirlos conservando sus carpetas de recursos.

- [ ] Presentar la tarea y comprobar el acuse o estado de envío de la plataforma.
      La captura muestra «En progreso / Siguiente: Presentar tarea»; no se verificó el estado actual.
- [ ] Confirmar si el docente acepta el enlace de GitHub o exige además un ZIP u otro formato.
      El usuario indicó el repositorio de destino; las capturas no especifican el formato de envío académico.
- [ ] Confirmar que el evaluador pueda descargar el repositorio y abrir los HTML en su equipo.
      El acceso público y los enlaces locales funcionan; no se comprobó el equipo del evaluador.
- [ ] Incluir una aclaración de alcance en el envío: «Se implementó una aplicación móvil nativa
      con React Native y Expo, conforme al diagrama; el objetivo escrito menciona una aplicación web».
- [ ] Revisar cualquier rúbrica o indicación adicional del docente que no aparezca en estas capturas.

Fecha límite mostrada en la captura: lunes 5 de octubre de 2026, 23:59.
Las capturas indican un valor total de tres puntos, sin un desglose de criterios o pesos.

## Límites que no son requisitos explícitos del diagrama

- [ ] Revisar los 29 avisos transitivos de dependencias antes de un uso en producción.
- [ ] Validar iOS, hardware real, TalkBack, tablets y build release si se amplía ese alcance.

Estos límites están documentados y no se presentan como verificados. No se requiere convertir
la app a web ni añadir funciones ajenas al diagrama para cubrir los requisitos visibles.

**Conclusión:** los requisitos técnicos visibles del diagrama están implementados y tienen
evidencia y están publicados en GitHub. Falta verificar la entrega formal, la apertura de los HTML
en el equipo del evaluador y cualquier criterio adicional.
No es posible garantizar 3/3 puntos sin la rúbrica completa y la evaluación del docente.
