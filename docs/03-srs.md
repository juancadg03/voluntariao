# 03 · Especificación de requisitos de software (SRS)

**Proyecto:** Calida
**Versión:** 0.3 · **Fecha:** 14/11/2026 · **Estado:** borrador para revisión
**Plantilla de referencia:** IEEE 830-1998 (adaptada)
**Relacionados:** [01 · Diagrama de contexto](01-diagrama-de-contexto.md) · [02 · Casos de uso](02-casos-de-uso.md)

---

## 1. Introducción

### 1.1 Propósito

Definir los requisitos funcionales y no funcionales de Calida, una plataforma que centraliza en un solo lugar las oportunidades de voluntariado y de incidencia social en Cali. Este documento sirve como base para el diseño, el desarrollo y las pruebas del sistema.

### 1.2 Alcance

Calida es una aplicación web responsive que permite:

- A **organizaciones** y **ciudadanos con iniciativas** publicar actividades que necesitan apoyo, clasificadas por categoría temática y tipo de ayuda (mano de obra, donaciones, transporte, etc.).
- A **voluntarios registrados** inscribirse a esas necesidades y recibir avisos del organizador.
- A **visitantes** sin cuenta explorar las iniciativas en un listado y en un mapa de la ciudad.
- Al **administrador** moderar el contenido, gestionar usuarios y consultar estadísticas de uso.

### 1.3 Definiciones

| Término | Definición |
|---|---|
| **Iniciativa** | Actividad o ayuda publicada por una organización o ciudadano. Tiene título, foto, descripción, fecha, lugar y medio de contacto. |
| **Categoría temática** | Área social de la iniciativa (ej. salud, educación, infancia, medio ambiente). |
| **Tipo de ayuda** | Clase de apoyo que se necesita: mano de obra, donaciones, transporte, asesoría, difusión u otro. |
| **Necesidad** | Parte concreta de una iniciativa que requiere un tipo de ayuda (ej. "10 personas de mano de obra" o "50 sándwiches en donación"). |
| **Inscripción** | Registro de un voluntario en una necesidad. Queda pendiente hasta que el organizador la confirma. |
| **Medio de contacto** | Enlace a un grupo de WhatsApp o número de celular colombiano. |
| **Organización** | Entidad formal (fundación, hospital, ONG u otra) que publica iniciativas. |
| **Ciudadano con iniciativa** | Persona natural que publica una iniciativa sin estar vinculada a una organización reconocida. |
| **Voluntario** | Usuario registrado que se inscribe a necesidades. |
| **Visitante** | Persona sin cuenta. Puede consultar, pero no inscribirse ni reportar. |
| **Moderación** | Revisión por parte del administrador antes de publicar una iniciativa. |
| **Incidencia social** | Actividades orientadas a influir en políticas o en la opinión pública sobre un problema social (ej. campañas, foros, jornadas de sensibilización). |

### 1.4 Referencias

- Ley 1581 de 2012 (protección de datos personales, Colombia).
- Decreto 1377 de 2013 (reglamentación de la Ley 1581).
- IEEE 830-1998, *Recommended Practice for Software Requirements Specifications*.
- WCAG 2.1, nivel AA (accesibilidad web).
- `compartido/contratos.js` del repositorio, que define los DTO y estados actuales.

### 1.5 Visión general del documento

La sección 2 describe el contexto y los actores. La sección 3 detalla los requisitos funcionales y su trazabilidad. La sección 4 cubre los requisitos no funcionales. Las secciones 5 a 7 describen datos, reglas de negocio e interfaces externas. La sección 8 lista las decisiones pendientes.

---

## 2. Descripción general

### 2.1 Perspectiva del producto

Calida es un sistema nuevo e independiente: una interfaz web y una API propias, con su propia base de datos. Se relaciona con tres servicios externos: OpenStreetMap (mapas y geocodificación), Cloudinary (fotos) y WhatsApp como canal externo de contacto. Los avisos de la plataforma se muestran dentro de la aplicación, sin correo.

Ver el diagrama de contexto en [01 · Diagrama de contexto](01-diagrama-de-contexto.md).

### 2.2 Actores

| Actor | Tipo | Cuenta | Descripción |
|---|---|---|---|
| Organización | Usuario registrado | Sí | Publica y gestiona iniciativas, necesidades e inscripciones recibidas. |
| Ciudadano con iniciativa | Usuario registrado | Sí | Publica y gestiona iniciativas con las mismas funciones que una organización, sin verificación formal. |
| Voluntario | Usuario registrado | Sí | Se inscribe a necesidades, recibe avisos y consulta su historial. |
| Visitante | Usuario no registrado | No | Consulta el listado, el mapa y los detalles. No puede inscribirse ni reportar. |
| Administrador | Usuario interno | Sí | Modera, gestiona usuarios y consulta estadísticas. |

### 2.3 Funciones principales

- **A. Cuentas y acceso:** registro, inicio de sesión y perfil. La recuperación de contraseña queda fuera de v1 (RF-006).
- **B. Publicación de iniciativas:** creación, edición, necesidades y cambios de estado.
- **C. Descubrimiento:** listado con filtros, mapa interactivo y detalle de cada iniciativa.
- **D. Inscripción:** inscripción de voluntarios, gestión por parte del organizador y notificaciones.
- **E. Moderación:** reportes, aprobación, rechazo y suspensión.
- **F. Administración y estadísticas:** gestión de usuarios, panel de indicadores y auditoría.

### 2.4 Restricciones

- **RS-01.** La versión 1 cubre únicamente el municipio de Cali.
- **RS-02.** La interfaz y los contenidos son solo en español.
- **RS-03.** La plataforma es web responsive. No hay aplicación nativa en esta versión.
- **RS-04.** No se procesan pagos ni donaciones monetarias.
- **RS-05.** No hay chat interno. La comunicación se hace por WhatsApp o teléfono.
- **RS-06.** La zona horaria del sistema es America/Bogota (UTC-5).
- **RS-07.** El visitante sin cuenta no puede inscribirse ni reportar iniciativas.

### 2.5 Supuestos y dependencias

- **S-01.** Los usuarios tienen acceso a internet y a un correo electrónico válido.
- **S-02.** Los enlaces de WhatsApp publicados siguen siendo válidos. El sistema no verifica el contenido de esos grupos.
- **S-03.** El proveedor de mapas (OpenStreetMap) ofrece tiles y geocodificación dentro de los límites de uso requeridos.
- **S-04.** Cloudinary (plan gratuito) almacena y sirve las fotos. La autenticación y la base de datos son parte del sistema (ver [04 · Arquitectura](04-arquitectura.md)).
- **S-05.** El equipo de desarrollo utilizará un repositorio Git y pruebas automatizadas.

---

## 3. Requisitos funcionales

Prioridad según MoSCoW: **M** = obligatorio, **S** = deseable, **C** = opcional, **W** = no en esta versión.

### 3.1 Cuentas y acceso (módulo A)

| ID | Requisito | Prio. | Caso de uso |
|---|---|---|---|
| RF-001 | El sistema debe permitir el registro de organizaciones con nombre, correo, contraseña, ciudad y descripción. | M | UC-01 |
| RF-002 | El sistema debe permitir el registro de ciudadanos con iniciativa con nombre, correo, contraseña y teléfono opcional. | M | UC-01 |
| RF-003 | El sistema debe permitir el registro de voluntarios con nombre, correo, contraseña y teléfono opcional. | M | UC-01 |
| RF-004 | El sistema debe verificar el correo electrónico mediante un enlace enviado al registrarse. | W (ADR-22) | UC-01 |
| RF-005 | El sistema debe permitir el inicio y cierre de sesión con correo y contraseña. | M | UC-02 |
| RF-006 | El sistema debe permitir recuperar la contraseña mediante un enlace temporal enviado por correo. | W (ADR-22) | UC-02 |
| RF-007 | El sistema debe bloquear temporalmente el acceso tras varios intentos fallidos de inicio de sesión. | M | UC-02 |
| RF-008 | Los usuarios registrados deben poder editar su perfil. | S | UC-15 |
| RF-009 | El administrador debe poder marcar una organización como verificada. | S | UC-13 |
| RF-010 | El visitante debe poder explorar el listado, el mapa y los detalles sin cuenta, pero no debe poder inscribirse ni reportar. En su lugar debe ver una invitación a registrarse. | M | UC-06 a UC-08 |

### 3.2 Publicación de iniciativas (módulo B)

| ID | Requisito | Prio. | Caso de uso |
|---|---|---|---|
| RF-011 | El sistema debe permitir crear una iniciativa con: título, foto, descripción, categoría temática, tipos de ayuda, fecha y hora de inicio, lugar, ubicación en el mapa, ciudad y medio de contacto. | M | UC-03 |
| RF-012 | La foto es obligatoria. El sistema debe aceptar formatos JPG, PNG y WebP de hasta 5 MB. | M | UC-03 |
| RF-013 | El sistema debe permitir guardar una iniciativa como borrador sin que esté completa. | S | UC-03 |
| RF-014 | El sistema debe permitir enviar a revisión solo las iniciativas que cumplen todos los campos obligatorios. | M | UC-03 |
| RF-015 | La ubicación puede definirse escribiendo una dirección (que el sistema convierte en coordenadas) o marcando un punto en el mapa. | M | UC-03 |
| RF-016 | Las categorías temáticas deben ser una lista predefinida administrable por el administrador. | M | UC-03 |
| RF-017 | Los tipos de ayuda deben ser una lista predefinida administrable. La lista inicial es: mano de obra, donaciones, transporte, asesoría, difusión y otro. Una iniciativa puede tener varios tipos. | M | UC-03, UC-04 |
| RF-018 | El sistema debe permitir gestionar varias necesidades por iniciativa, cada una con nombre, tipo de ayuda, unidad y cantidad objetivo. | M | UC-04 |
| RF-019 | El sistema debe mostrar el progreso de cada necesidad: cantidad objetivo, cantidad confirmada y estado (*pendiente*, *comprometida*, *recibida*, *cubierta*). | M | UC-04 |
| RF-020 | El organizador debe poder editar una iniciativa, y el sistema debe guardar la fecha de la última modificación. | M | UC-05 |
| RF-021 | El organizador debe poder cambiar el estado de la iniciativa entre *borrador*, *pendiente de revisión*, *publicada*, *en preparación*, *lista*, *realizada*, *completada*, *suspendida* y *cancelada*. | M | UC-05 |
| RF-022 | Al cancelar o suspender una iniciativa, el sistema debe retirarla del listado y del mapa, y notificar a los voluntarios con inscripción confirmada. | M | UC-05 |

### 3.3 Descubrimiento: listado, mapa y detalle (módulo C)

| ID | Requisito | Prio. | Caso de uso |
|---|---|---|---|
| RF-023 | El sistema debe mostrar un listado paginado de iniciativas publicadas, ordenado por fecha de inicio. | M | UC-06 |
| RF-024 | El sistema debe permitir filtrar por ciudad, categoría temática, tipo de ayuda, fecha (un día) y texto libre. | M | UC-06 |
| RF-025 | El sistema debe mostrar un mapa de Cali con un marcador por cada iniciativa publicada con ubicación. | M | UC-07 |
| RF-026 | Cuando haya marcadores muy cercanos, el mapa debe agruparlos y mostrar la cantidad. | S | UC-07 |
| RF-027 | Al seleccionar un marcador, el sistema debe mostrar una tarjeta con título, foto, fecha, categoría y enlace al detalle. | M | UC-07 |
| RF-028 | Los filtros del listado y del mapa deben estar sincronizados. | M | UC-06, UC-07 |
| RF-029 | Si el usuario autoriza su ubicación, el sistema debe permitir ordenar las iniciativas por distancia. | W (ADR-13) | UC-07 |
| RF-030 | La página de detalle debe mostrar: título, foto, descripción, fecha y hora, lugar, mapa de ubicación, categoría, tipos de ayuda, organizador, necesidades con su progreso y medio de contacto. | M | UC-08 |
| RF-031 | El botón de contacto debe abrir el enlace de WhatsApp o marcar el número publicado. Está disponible para visitantes y voluntarios. | M | UC-08 |
| RF-032 | Cada iniciativa debe tener una URL pública compartible. | S | UC-08 |

### 3.4 Inscripción (módulo D)

| ID | Requisito | Prio. | Caso de uso |
|---|---|---|---|
| RF-033 | El voluntario debe poder inscribirse a una necesidad indicando la cantidad a aportar y, opcionalmente, un mensaje. Nombre y correo se toman de su cuenta. | M | UC-09 |
| RF-034 | Cada inscripción debe quedar en estado *pendiente* hasta que el organizador la confirme. | M | UC-09 |
| RF-035 | El sistema debe impedir que un mismo voluntario se inscriba dos veces a la misma necesidad. | M | UC-09 |
| RF-036 | El sistema debe impedir inscribirse por una cantidad mayor que la pendiente de la necesidad. | M | UC-09 |
| RF-037 | Al recibir una inscripción, el sistema debe notificar al organizador dentro de la plataforma (contador de avisos y lista) y mostrarla en su panel. | M | UC-09 |
| RF-038 | El organizador debe poder ver las inscripciones de cada iniciativa y cambiar su estado a *confirmada*, *rechazada*, *cancelada* o *cumplida*. | M | UC-10 |
| RF-039 | Al confirmar una inscripción, el sistema debe actualizar la cantidad confirmada y el estado de la necesidad. | M | UC-10 |
| RF-040 | Al cambiar el estado de una inscripción, el sistema debe notificar al voluntario dentro de la plataforma. | M | UC-10 |
| RF-041 | Los datos de contacto de los voluntarios solo deben ser visibles para el organizador de la iniciativa correspondiente. | M | UC-10 |
| RF-042 | El voluntario debe poder ver su historial de inscripciones y el estado de cada una. | M | UC-16 |

### 3.5 Moderación (módulo E)

| ID | Requisito | Prio. | Caso de uso |
|---|---|---|---|
| RF-043 | Cualquier voluntario debe poder reportar una iniciativa indicando motivo y descripción. | M | UC-11 |
| RF-044 | El sistema debe mostrar al administrador una cola con las iniciativas pendientes de revisión y las reportadas. | M | UC-12 |
| RF-045 | Toda iniciativa debe ser aprobada por el administrador antes de publicarse. | M | UC-12 |
| RF-046 | El administrador debe poder aprobar, rechazar con motivo o suspender una iniciativa. | M | UC-12 |
| RF-047 | El administrador debe poder suspender o reactivar una cuenta. | M | UC-13 |
| RF-048 | Cada decisión de moderación debe notificar dentro de la plataforma al organizador afectado. | M | UC-12 |

### 3.6 Administración y estadísticas (módulo F)

| ID | Requisito | Prio. | Caso de uso |
|---|---|---|---|
| RF-049 | El administrador debe ver un panel con el número de organizaciones, ciudadanos con iniciativa y voluntarios registrados. | M | UC-14 |
| RF-050 | El panel debe mostrar iniciativas por estado, categoría temática, tipo de ayuda y ciudad. | M | UC-14 |
| RF-051 | El panel debe mostrar inscripciones por estado y la tasa de cumplimiento (cumplidas sobre confirmadas). | M | UC-14 |
| RF-052 | El panel debe mostrar visitas al listado y al mapa, y los filtros más usados. | S | UC-14 |
| RF-053 | Todos los indicadores deben poder filtrarse por rango de fechas. | M | UC-14 |
| RF-054 | Los indicadores deben poder exportarse a CSV. | S | UC-14 |
| RF-055 | El sistema debe mantener un registro de auditoría con las acciones del administrador (moderación, suspensiones, verificaciones). | M | UC-12, UC-13 |
| RF-056 | El administrador debe poder ver el perfil, la fecha de registro, la última actividad y el número de iniciativas o inscripciones de cada usuario. | S | UC-13 |

---

## 4. Requisitos no funcionales

| ID | Categoría | Requisito |
|---|---|---|
| RNF-001 | Rendimiento | El listado y el mapa deben cargar en menos de 3 segundos en una conexión 4G con 500 iniciativas publicadas. |
| RNF-002 | Rendimiento | El 95 % de las respuestas del servidor deben llegar en menos de 500 ms. |
| RNF-003 | Disponibilidad | El sistema debe estar disponible al menos el 99 % del tiempo mensual, excluyendo mantenimientos programados. Con hosting gratuito es un objetivo, no una garantía (ver 04 §12). |
| RNF-004 | Seguridad | Las contraseñas deben almacenarse con un hash seguro (bcrypt), nunca en texto plano (ADR-18). |
| RNF-005 | Seguridad | Toda la comunicación debe usar HTTPS. |
| RNF-006 | Seguridad | Todas las entradas deben validarse en el servidor. El sistema debe protegerse contra XSS, CSRF e inyección SQL. |
| RNF-007 | Seguridad | Los formularios públicos (registro, reportes) deben tener protección anti-spam y limitación de tasa de peticiones. En v1 se limita el número de peticiones por IP en registro, login y reportes (ADR-24). |
| RNF-008 | Seguridad | Cada rol solo debe acceder a sus datos. La API debe impedir, por ejemplo, que un organizador modifique iniciativas de otro (ADR-19). Cada regla de acceso tiene una prueba automática. |
| RNF-009 | Privacidad | El sistema debe mostrar un aviso de privacidad y pedir autorización para el tratamiento de datos, conforme a la Ley 1581 de 2012. |
| RNF-010 | Privacidad | El usuario debe poder solicitar la supresión de sus datos personales. |
| RNF-011 | Privacidad | Los datos de contacto de los voluntarios solo son visibles para el organizador de la iniciativa correspondiente. |
| RNF-012 | Usabilidad | La interfaz debe ser responsive desde 360 px de ancho, con diseño mobile-first. |
| RNF-013 | Usabilidad | Un voluntario debe poder inscribirse en 3 pasos o menos desde el detalle de una iniciativa. |
| RNF-014 | Accesibilidad | La plataforma debe cumplir WCAG 2.1 nivel AA. |
| RNF-015 | Compatibilidad | Debe funcionar en las dos últimas versiones de Chrome, Firefox, Safari y Edge, y en navegadores móviles de Android e iOS. |
| RNF-016 | Escalabilidad | La ciudad debe ser un atributo de los datos, no una restricción del código, para permitir expandir el sistema a otras ciudades. |
| RNF-017 | Mantenibilidad | El código debe escribirse en JavaScript, con pruebas unitarias para la lógica de negocio y pruebas end-to-end para los flujos principales (UC-03, UC-07, UC-09). |
| RNF-018 | Respaldo | La base de datos debe respaldarse diariamente, con retención mínima de 7 días. |
| RNF-019 | Rendimiento | Las imágenes deben optimizarse (formato WebP y miniaturas) para que cada imagen de listado pese menos de 300 KB. |
| RNF-020 | Auditoría | Las acciones de moderación y administración deben registrar usuario, fecha, hora y acción realizada. |
| RNF-021 | Mantenibilidad | El frontend debe construirse con React y el backend con Node.js y Express, sobre PostgreSQL (ADR-16, ADR-17). |

---

## 5. Modelo de datos conceptual

Las entidades coinciden con `compartido/contratos.js`. Las credenciales (correo y hash de la contraseña) se guardan en una entidad **Usuario**, y cada usuario tiene un **Perfil** con sus datos.

| Entidad | Atributos principales | Relaciones |
|---|---|---|
| **Usuario** | id, correo, hash de la contraseña, intentos fallidos, bloqueado hasta | Tiene un Perfil. Nunca se muestra fuera del sistema. |
| **Perfil** | id (igual al del Usuario), nombre, rol (*organizacion*, *ciudadano*, *voluntario*, *administrador*), teléfono, estado (*activo*, *suspendido*), fecha de registro | Un perfil de organización o ciudadano publica Iniciativas. Un voluntario tiene Inscripciones. |
| **Organización** | id, perfil_id, descripción, ciudad, verificada (sí/no) | Extiende el Perfil. Publica Iniciativas. |
| **Iniciativa** | id, organizador_id, título, descripción, categoria_id, ciudad, lugar, latitud, longitud, foto, fecha_inicio, fecha_fin (opcional), medio_contacto, estado, publicada_en, actualizada_en | Tiene Necesidades, Reportes y tipos de ayuda (relación muchos a muchos). |
| **Necesidad** | id, iniciativa_id, nombre, tipo_ayuda_id, unidad, cantidad_objetivo, cantidad_confirmada, estado | Pertenece a una Iniciativa. Tiene Inscripciones. |
| **Inscripción** | id, necesidad_id, voluntario_id, cantidad, mensaje, estado (*pendiente*, *confirmada*, *rechazada*, *cancelada*, *cumplida*), fecha | Pertenece a una Necesidad y a un Perfil voluntario. Es obligatoria la cuenta. |
| **Categoría temática** | id, nombre, activa | Asociada a muchas Iniciativas. |
| **Tipo de ayuda** | id, nombre, activo | Asociado a muchas Iniciativas y Necesidades. |
| **Reporte** | id, iniciativa_id, reportado_por, motivo, descripción, estado, fecha | Pertenece a una Iniciativa. |
| **Registro de auditoría** | id, administrador_id, acción, entidad afectada, fecha | Independiente. Solo lectura. |

---

## 6. Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | Una iniciativa solo puede enviarse a revisión si tiene título, foto, descripción, categoría temática, al menos un tipo de ayuda, fecha de inicio, lugar, ubicación y medio de contacto. |
| RN-02 | La fecha de inicio debe ser posterior a la fecha actual en el momento de enviar a revisión. |
| RN-03 | La ubicación debe estar dentro de los límites del municipio de Cali. |
| RN-04 | El medio de contacto debe ser un enlace válido de WhatsApp (`chat.whatsapp.com` o `wa.me`) o un número de celular colombiano de 10 dígitos que empiece por 3. |
| RN-05 | La descripción no puede superar 2 000 caracteres. El título no puede superar 120 caracteres. |
| RN-06 | Una iniciativa que no está en estado *publicada* o *en preparación* no aparece en el listado ni en el mapa. |
| RN-07 | La cantidad confirmada de una necesidad no puede superar su cantidad objetivo. |
| RN-08 | Un voluntario solo puede tener una inscripción pendiente o confirmada por necesidad. |
| RN-09 | Un usuario suspendido no puede iniciar sesión ni publicar. Sus iniciativas publicadas quedan suspendidas. |
| RN-10 | Una organización verificada muestra una insignia visible en sus iniciativas. |
| RN-11 | Las iniciativas reportadas por tres o más voluntarios distintos se envían automáticamente a la cola de moderación. |
| RN-12 | Las fechas de filtros e indicadores se calculan en la zona horaria America/Bogota. |
| RN-13 | Solo los usuarios con sesión iniciada pueden inscribirse a una necesidad o reportar una iniciativa. |

---

## 7. Interfaces externas

### 7.1 Interfaz de usuario

- Página principal con listado y acceso a mapa, visible sin cuenta.
- Vista de mapa a pantalla completa en móvil, con tarjeta inferior al seleccionar un marcador.
- Formularios con validación en tiempo real y mensajes en español.
- Panel de organización y ciudadano con: mis iniciativas, inscripciones recibidas y perfil.
- Panel de voluntario con: mis inscripciones y perfil.
- Panel de administrador con: cola de moderación, usuarios, categorías, tipos de ayuda, estadísticas y auditoría.

### 7.2 Interfaces con sistemas externos

| Sistema | Tipo de interfaz | Uso |
|---|---|---|
| Cloudinary | API REST (desde el servidor) | Guardar y servir fotos optimizadas y sus miniaturas. |
| Proveedor de mapas (OpenStreetMap, Leaflet) | API y tiles | Geocodificación y visualización del mapa de Cali. |
| Notificaciones internas | Tabla propia, consultada por la interfaz cada 60 s | Avisos de inscripción, cambios de estado y decisiones de moderación, dentro de la plataforma. |

### 7.3 Interfaces de software

- Las rutas de la API deben documentarse con los tipos de `compartido/contratos.js` como referencia, por ejemplo `GET /api/iniciativas`, `GET /api/iniciativas/:id` y `POST /api/inscripciones`.

---

## 8. Preguntas abiertas

Estas decisiones aún no están cerradas. Cada una tiene una propuesta por defecto que se usará hasta que se confirme.

| ID | Pregunta | Propuesta por defecto |
|---|---|---|
| P-01 | ¿Se acepta "Calida" como nombre definitivo del sistema? | Sí. Nombre usado en todos los documentos. |
| P-02 | ¿Las organizaciones deben demostrar su existencia formal (NIT, documento) antes de publicar? | No en v1. La verificación es manual, desde el panel del administrador. |
| P-03 | ¿Cuál es la lista inicial de categorías temáticas? | Salud, educación, infancia, adulto mayor, alimentación, medio ambiente, cultura, derechos humanos e incidencia social. |
| P-04 | ¿Se confirma que `contratos.ts` debe actualizarse con los nuevos tipos de ayuda (mano de obra, donaciones, transporte, asesoría, difusión, otro)? | **Confirmado:** tipos de ayuda como tabla administrable, ya reflejado en `compartido/contratos.js`. |
| P-05 | ¿Las inscripciones tienen cupo máximo automático, o siempre las confirma el organizador? | El organizador confirma manualmente. Sin cupo automático. |
| P-06 | ¿Qué proveedor de mapas se usa para el mapa? | **Confirmado:** OpenStreetMap con Leaflet, gratis. |
| P-07 | ¿Se usará un servicio de correo para avisos? | **Confirmado:** no por ahora. Los avisos son dentro de la plataforma, y tampoco hay correos de cuenta (ADR-22). |
| P-08 | ¿El código se escribe en JavaScript o en TypeScript? | **Confirmado:** JavaScript. |
| P-09 | ¿Se necesitan los ocho estados de iniciativa de `contratos.ts`, o se simplifican? | **Confirmado:** 10 estados, con `pendiente_revision` y `rechazada` para la moderación (ADR-07). |
| P-10 | ¿Quién crea las categorías y los tipos de ayuda? | Solo el administrador, desde el panel. |
