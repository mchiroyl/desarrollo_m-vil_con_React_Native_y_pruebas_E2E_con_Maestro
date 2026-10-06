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

## Documentación lista para entregar

- [x] Word local `docs/Pruebas E2E en Aplicaciones Móviles.docx` completado en seis páginas y revisado visualmente.
- [x] Carátula y enlace originales conservados; carátula comprobada sin cambios.
- [x] Word incluye resumen, enlaces a los HTML, instrucciones para abrirlos, arquitectura con diagrama,
      tres escenarios Gherkin, tres capturas reales y resultados de Maestro con enlaces a YAML y JUnit.
- [x] Alcance móvil y entorno Android debug declarados en el Word.
      El documento está preparado para adjuntarlo a la plataforma; se conserva localmente y no está publicado en GitHub.

## Publicación y entrega académica

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
- [x] Incluir la aclaración de alcance móvil en el documento de entrega, conforme al diagrama.
      El objetivo escrito de la consigna menciona una aplicación web; la implementación y la evidencia son móviles.
- [ ] Revisar cualquier rúbrica o indicación adicional del docente que no aparezca en estas capturas.

Fecha límite mostrada en la captura: lunes 5 de octubre de 2026, 23:59.
Las capturas indican un valor total de tres puntos, sin un desglose de criterios o pesos.

## Revisión de publicación segura ética y profesional

- [x] Búsqueda de patrones comunes de tokens y claves privadas en los tres commits publicados al momento de la revisión, sin coincidencias.
      Esta búsqueda no equivale a una auditoría completa ni garantiza ausencia de todos los tipos de secretos.
- [x] Word académico, bases de datos locales, archivos de entorno y claves privadas fuera de los archivos versionados revisados.
- [x] Cuentas y datos de prueba identificados como demostración; las contraseñas publicadas corresponden a esas cuentas locales.
- [x] Resultados respaldados por capturas y reportes reales; alcance Android debug y límites de validación declarados.
- [x] README técnico con comandos de instalación, compilación y pruebas; estructura de código y evidencias organizada.
- [ ] Completar las atribuciones de terceros: conservar el crédito de Expo y adjuntar la licencia Apache 2.0 y la atribución de Impeccable.
      El LICENSE actual conserva el aviso MIT de Expo; los archivos de Impeccable declaran Apache 2.0 sin una licencia completa separada en el repositorio.
- [ ] Añadir descripción y temas al apartado About de GitHub.
- [ ] Confirmar las reglas del curso sobre asistencia de IA y declarar su uso cuando corresponda.
      La conformidad académica depende de las indicaciones del docente.
- [ ] Sustituir el hash SHA-256 con prefijo fijo por un mecanismo de almacenamiento de contraseñas apropiado si se prepara una versión con usuarios reales.
      La autenticación actual está declarada como demostración local.

La revisión de publicación comprobó archivos e historial para los aspectos indicados; no fue una auditoría completa de seguridad de la aplicación.

## Validaciones adicionales antes de producción

- [ ] Revisar los 29 avisos transitivos de dependencias antes de un uso en producción.
- [ ] Validar iOS, hardware real, TalkBack, tablets y build release si se amplía ese alcance.

Estos límites están documentados y no se presentan como verificados. No se requiere convertir
la app a web ni añadir funciones ajenas al diagrama para cubrir los requisitos visibles.

**Conclusión:** los requisitos técnicos visibles del diagrama están implementados y tienen
evidencia y están publicados en GitHub. El Word de entrega está completado y revisado.
Falta verificar la entrega formal, la apertura de los HTML
en el equipo del evaluador y cualquier criterio adicional.
También quedan pendientes las atribuciones de terceros y la presentación About del repositorio.
No es posible garantizar 3/3 puntos sin la rúbrica completa y la evaluación del docente,
ni presentar esta revisión como una certificación de seguridad para producción.
