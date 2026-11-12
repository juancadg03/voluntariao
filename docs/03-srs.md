# 03 · Especificación de requisitos de software (SRS)

**Proyecto:** VoluntariaCali (nombre provisional)
**Versión:** 0.1 · **Fecha:** 12/11/2026 · **Estado:** borrador para revisión
**Plantilla de referencia:** IEEE 830-1998 (adaptada)
**Relacionados:** [01 · Diagrama de contexto](01-diagrama-de-contexto.md) · [02 · Casos de uso](02-casos-de-uso.md)

---

## 1. Introducción

### 1.1 Propósito

Definir los requisitos funcionales y no funcionales de VoluntariaCali, una plataforma que centraliza en un solo lugar las oportunidades de voluntariado y de incidencia social en Cali. Este documento sirve como base para el diseño, el desarrollo y las pruebas del sistema.

### 1.2 Alcance

VoluntariaCali es una aplicación web responsive que permite:

- A **organizaciones** y **ciudadanos con iniciativas** publicar actividades que necesitan apoyo (voluntarios, donaciones en especie o transporte).
- A **voluntarios** descubrir esas actividades en un listado y en un mapa de la ciudad, y postularse.
- Al **administrador** moderar el contenido, gestionar usuarios y consultar estadísticas de uso.

### 1.3 Definiciones

| Término | Definición |
|---|---|
| **Iniciativa** | Actividad o ayuda publicada por una organización o ciudadano. Tiene título, foto, descripción, fecha, lugar y medio de contacto. |
| **Necesidad** | Parte concreta de una iniciativa que requiere un aporte (ej. "10 voluntarios" o "50 sándwiches"). |
| **Participación** | Postulación de un voluntario a una necesidad. |
| **Medio de contacto** | Enlace a un grupo de WhatsApp o número de teléfono celular colombiano. |
| **Organización** | Entidad formal (fundación, hospital, ONG u otra) que publica iniciativas. |
| **Ciudadano con iniciativa** | Persona natural que publica una iniciativa sin estar vinculada a una organización reconocida. |
| **Voluntario** | Persona que consulta la plataforma y se postula a una necesidad. Puede hacerlo sin cuenta. |
| **Visitante** | Usuario sin sesión iniciada. |
| **Moderación** | Revisión por parte del administrador antes o después de publicar una iniciativa. |
| **Incidencia social** | Actividades orientadas a influir en políticas o en la opinión pública sobre un problema social (ej. campañas, foros, jornadas de sensibilización). |

### 1.4 Referencias

- Ley 1581 de 2012 (protección de datos personales, Colombia).
- Decreto 1377 de 2013 (reglamentación de la Ley 1581).
- IEEE 830-1998, *Recommended Practice for Software Requirements Specifications*.
- WCAG 2.1, nivel AA (accesibilidad web).
- `src/types/contratos.ts` del repositorio, que define los DTO y estados actuales.

### 1.5 Visión general del documento

La sección 2 describe el contexto y los actores. La sección 3 detalla los requisitos funcionales y su trazabilidad. La sección 4 cubre los requisitos no funcionales. Las secciones 5 a 7 describen datos, reglas de negocio e interfaces externas. La sección 8 lista las preguntas abiertas que requieren decisión del cliente.

---

## 2. Descripción general

### 2.1 Perspectiva del producto

VoluntariaCali es un sistema nuevo e independiente. Se relaciona con tres servicios externos: un proveedor de mapas, un servicio de correo transaccional y un almacenamiento de imágenes. La comunicación entre voluntarios y organizaciones ocurre fuera del sistema, por WhatsApp o teléfono.

Ver el diagrama de contexto en [01 · Diagrama de contexto](01-diagrama-de-contexto.md).

### 2.2 Actores

| Actor | Tipo | Cuenta | Descripción |
|---|---|---|---|
| Organización | Usuario registrado | Sí | Publica y gestiona iniciativas y necesidades. |
| Ciudadano con iniciativa | Usuario registrado | Sí | Publica y gestiona iniciativas con las mismas funciones que una organización, pero sin verificación formal. |
| Voluntario | Usuario o visitante | Opcional | Explora, se postula y, si tiene cuenta, consulta su historial. |
| Administrador | Usuario interno | Sí | Modera, gestiona usuarios y consulta estadísticas. |

### 2.3 Funciones principales

- **A. Cuentas y acceso:** registro, inicio de sesión, perfil y recuperación de contraseña.
- **B. Publicación de iniciativas:** creación, edición, necesidades y cambios de estado.
- **C. Descubrimiento:** listado con filtros, mapa interactivo y detalle de cada iniciativa.
- **D. Participación:** postulación de voluntarios, gestión por parte del organizador y notificaciones.
- **E. Moderación:** reportes, aprobación, rechazo y suspensión.
- **F. Administración y estadísticas:** gestión de usuarios, panel de indicadores y auditoría.

### 2.4 Restricciones

- **RS-01.** La versión 1 cubre únicamente el municipio de Cali.
- **RS-02.** La interfaz y los contenidos son solo en español.
- **RS-03.** La plataforma es web responsive. No hay aplicación nativa en esta versión.
- **RS-04.** No se procesan pagos ni donaciones monetarias.
- **RS-05.** No hay chat interno. La comunicación se hace por WhatsApp o teléfono.
- **RS-06.** La zona horaria del sistema es America/Bogota (UTC-5).

### 2.5 Supuestos y dependencias

- **S-01.** Los organizadores tienen acceso a internet y a correo electrónico.
- **S-02.** Los enlaces de WhatsApp publicados por los organizadores siguen siendo válidos. El sistema no verifica el contenido de esos grupos.
- **S-03.** El proveedor de mapas ofrece geocodificación y visualización de mapas dentro de los límites de uso requeridos.
- **S-04.** El equipo de desarrollo utilizará un repositorio Git y una estrategia de pruebas automatizadas.

---

## 3. Requisitos funcionales

Prioridad según MoSCoW: **M** = obligatorio, **S** = deseable, **C** = opcional.

### 3.1 Cuentas y acceso (módulo A)

| ID | Requisito | Prio. | Caso de uso |
|---|---|---|---|
| RF-001 | El sistema debe permitir el registro de organizaciones con nombre, correo, contraseña, ciudad y descripción. | M | UC-01 |
| RF-002 | El sistema debe permitir el registro de ciudadanos con iniciativa con nombre, correo, contraseña y teléfono opcional. | M | UC-01 |
| RF-003 | El sistema debe verificar el correo electrónico mediante un enlace enviado al registrarse. | M | UC-01 |
| RF-004 | El sistema debe permitir el inicio y cierre de sesión con correo y contraseña. | M | UC-02 |
| RF-005 | El sistema debe permitir recuperar la contraseña mediante un enlace temporal enviado por correo. | M | UC-02 |
| RF-006 | El sistema debe bloquear temporalmente el acceso tras varios intentos fallidos de inicio de sesión. | M | UC-02 |
| RF-007 | Los usuarios con rol de organización o ciudadano deben poder editar su perfil. | S | UC-15 |
| RF-008 | El administrador debe poder marcar una organización como verificada. | S | UC-13 |
| RF-009 | El visitante sin cuenta debe poder explorar, ver el mapa, ver detalles y postularse. | M | UC-06 a UC-09 |

### 3.2 Publicación de iniciativas (módulo B)

| ID | Requisito | Prio. | Caso de uso |
|---|---|---|---|
| RF-010 | El sistema debe permitir crear una iniciativa con: título, foto, descripción, categoría, fecha y hora de inicio, lugar, ubicación en el mapa, ciudad y medio de contacto. | M | UC-03 |
| RF-011 | La foto es obligatoria. El sistema debe aceptar formatos JPG, PNG y WebP de hasta 5 MB. | M | UC-03 |
| RF-012 | El sistema debe permitir guardar una iniciativa como borrador sin que esté completa. | S | UC-03 |
| RF-013 | El sistema debe permitir publicar una iniciativa solo cuando cumple todos los campos obligatorios. | M | UC-03 |
| RF-014 | La ubicación puede definirse escribiendo una dirección (que el sistema convierte en coordenadas) o marcando un punto en el mapa. | M | UC-03 |
| RF-015 | El sistema debe permitir gestionar varias necesidades por iniciativa, cada una con nombre, tipo de aporte, unidad y cantidad objetivo. | M | UC-04 |
| RF-016 | Los tipos de aporte son: voluntariado, donación en especie y transporte. | M | UC-04 |
| RF-017 | El sistema debe mostrar el progreso de cada necesidad: cantidad objetivo, cantidad confirmada y estado (*pendiente*, *comprometida*, *recibida*, *cubierta*). | M | UC-04 |
| RF-018 | El organizador debe poder editar una iniciativa y dejar registro de la fecha de la última modificación. | M | UC-05 |
| RF-019 | El organizador debe poder cambiar el estado de la iniciativa entre *borrador*, *publicada*, *en preparación*, *lista*, *realizada*, *completada*, *suspendida* y *cancelada*. | M | UC-05 |
| RF-020 | Al cancelar o suspender una iniciativa, el sistema debe retirarla del listado y del mapa, y notificar a los voluntarios con participación confirmada. | M | UC-05 |
| RF-021 | Las categorías deben ser una lista predefinida administrable (ej. salud, educación, alimentación, infancia, adulto mayor, medio ambiente, cultura, derechos humanos, incidencia social). | M | UC-03 |

### 3.3 Descubrimiento: listado, mapa y detalle (módulo C)

| ID | Requisito | Prio. | Caso de uso |
|---|---|---|---|
| RF-022 | El sistema debe mostrar un listado paginado de iniciativas publicadas, ordenado por fecha de inicio. | M | UC-06 |
| RF-023 | El sistema debe permitir filtrar por ciudad, categoría, fecha (un día), tipo de aporte y texto libre. | M | UC-06 |
| RF-024 | El sistema debe mostrar un mapa de Cali con un marcador por cada iniciativa publicada con ubicación. | M | UC-07 |
| RF-025 | Cuando haya marcadores muy cercanos, el mapa debe agruparlos y mostrar la cantidad. | S | UC-07 |
| RF-026 | Al seleccionar un marcador, el sistema debe mostrar una tarjeta con título, foto, fecha, categoría y enlace al detalle. | M | UC-07 |
| RF-027 | Los filtros del listado y del mapa deben estar sincronizados. | M | UC-06, UC-07 |
| RF-028 | Si el voluntario autoriza su ubicación, el sistema debe permitir ordenar las iniciativas por distancia. | C | UC-07 |
| RF-029 | La página de detalle debe mostrar: título, foto, descripción, fecha y hora, lugar, mapa de ubicación, categoría, organizador, necesidades con su progreso y medio de contacto. | M | UC-08 |
| RF-030 | El botón de contacto debe abrir el enlace de WhatsApp o marcar el número publicado. | M | UC-08 |
| RF-031 | Cada iniciativa debe tener una URL pública compartible. | S | UC-08 |

### 3.4 Participación (módulo D)

| ID | Requisito | Prio. | Caso de uso |
|---|---|---|---|
| RF-032 | El voluntario debe poder postularse a una necesidad indicando nombre, correo, tipo de aporte y cantidad, sin necesidad de cuenta. | M | UC-09 |
| RF-033 | Cada postulación debe quedar en estado *pendiente* hasta que el organizador la confirme. | M | UC-09 |
| RF-034 | El sistema debe impedir que un mismo correo se postule dos veces a la misma necesidad. | M | UC-09 |
| RF-035 | El sistema debe impedir postularse por más cantidad que la pendiente de la necesidad. | M | UC-09 |
| RF-036 | Al recibir una postulación, el sistema debe enviar un correo al organizador. | M | UC-09 |
| RF-037 | El organizador debe poder ver las postulaciones de cada iniciativa y cambiar su estado a *confirmada*, *rechazada*, *cancelada* o *cumplida*. | M | UC-10 |
| RF-038 | Al confirmar una postulación, el sistema debe actualizar la cantidad confirmada y el estado de la necesidad. | M | UC-10 |
| RF-039 | Al cambiar el estado de una postulación, el sistema debe notificar al voluntario por correo. | M | UC-10 |
| RF-040 | El sistema no debe mostrar a otros usuarios los datos de contacto de los voluntarios. Solo el organizador de la iniciativa puede verlos. | M | UC-10 |
| RF-041 | Un voluntario con cuenta debe poder ver su historial de postulaciones y el estado de cada una. | C | UC-16 |
| RF-042 | Si un voluntario que postuló sin cuenta crea una cuenta con el mismo correo, el sistema debe asociar sus postulaciones anteriores. | S | UC-16 |

### 3.5 Moderación (módulo E)

| ID | Requisito | Prio. | Caso de uso |
|---|---|---|---|
| RF-043 | Cualquier voluntario debe poder reportar una iniciativa indicando motivo y descripción. | M | UC-11 |
| RF-044 | El sistema debe mostrar al administrador una cola con las iniciativas pendientes de revisión y las reportadas. | M | UC-12 |
| RF-045 | El administrador debe poder aprobar, rechazar con motivo o suspender una iniciativa. | M | UC-12 |
| RF-046 | El administrador debe poder suspender o reactivar una cuenta. | M | UC-13 |
| RF-047 | Cada decisión de moderación debe notificar por correo al organizador afectado. | M | UC-12 |

### 3.6 Administración y estadísticas (módulo F)

| ID | Requisito | Prio. | Caso de uso |
|---|---|---|---|
| RF-048 | El administrador debe ver un panel con: número de organizaciones, de ciudadanos con iniciativa y de voluntarios que se han postulado. | M | UC-14 |
| RF-049 | El panel debe mostrar iniciativas por estado, categoría y ciudad. | M | UC-14 |
| RF-050 | El panel debe mostrar participaciones por estado y la tasa de cumplimiento (cumplidas sobre confirmadas). | M | UC-14 |
| RF-051 | El panel debe mostrar visitas al listado y al mapa, y número de búsquedas y filtros más usados. | S | UC-14 |
| RF-052 | Todos los indicadores deben poder filtrarse por rango de fechas. | M | UC-14 |
| RF-053 | Los indicadores deben poder exportarse a CSV. | S | UC-14 |
| RF-054 | El sistema debe mantener un registro de auditoría con las acciones del administrador (moderación, suspensiones, verificaciones). | M | UC-12, UC-13 |
| RF-055 | El administrador debe poder ver el perfil, la fecha de registro, la última actividad y el número de iniciativas de cada usuario. | S | UC-13 |

---

## 4. Requisitos no funcionales

| ID | Categoría | Requisito |
|---|---|---|
| RNF-001 | Rendimiento | El listado y el mapa deben cargar en menos de 3 segundos en una conexión 4G con 500 iniciativas publicadas. |
| RNF-002 | Rendimiento | El 95 % de las respuestas del servidor deben llegar en menos de 500 ms. |
| RNF-003 | Disponibilidad | El sistema debe estar disponible al menos el 99 % del tiempo mensual, excluyendo mantenimientos programados. |
| RNF-004 | Seguridad | Las contraseñas deben almacenarse con un algoritmo de hash seguro (bcrypt o argon2). Nunca en texto plano. |
| RNF-005 | Seguridad | Toda la comunicación debe usar HTTPS. |
| RNF-006 | Seguridad | Todas las entradas deben validarse en el servidor. El sistema debe protegerse contra XSS, CSRF e inyección SQL. |
| RNF-007 | Seguridad | Los formularios públicos (registro, postulación, reportes) deben tener protección anti-spam y limitación de tasa de peticiones. |
| RNF-008 | Seguridad | Cada rol solo debe acceder a sus funciones. Un organizador no puede modificar iniciativas de otro. |
| RNF-009 | Privacidad | El sistema debe mostrar un aviso de privacidad y pedir autorización para el tratamiento de datos, conforme a la Ley 1581 de 2012. |
| RNF-010 | Privacidad | El usuario debe poder solicitar la supresión de sus datos personales. |
| RNF-011 | Privacidad | Los datos de contacto de los voluntarios solo son visibles para el organizador de la iniciativa correspondiente. |
| RNF-012 | Usabilidad | La interfaz debe ser responsive desde 360 px de ancho, con diseño mobile-first. |
| RNF-013 | Usabilidad | Un voluntario debe poder postularse en 3 pasos o menos desde el detalle de una iniciativa. |
| RNF-014 | Accesibilidad | La plataforma debe cumplir WCAG 2.1 nivel AA. |
| RNF-015 | Compatibilidad | Debe funcionar en las dos últimas versiones de Chrome, Firefox, Safari y Edge, y en navegadores móviles de Android e iOS. |
| RNF-016 | Escalabilidad | La ciudad debe ser un atributo de los datos, no una restricción del código, para permitir expandir el sistema a otras ciudades. |
| RNF-017 | Mantenibilidad | El código debe estar en TypeScript, con pruebas unitarias para la lógica de negocio y pruebas end-to-end para los flujos principales (UC-03, UC-07, UC-09). |
| RNF-018 | Respaldo | La base de datos debe respaldarse diariamente, con retención mínima de 7 días. |
| RNF-019 | Rendimiento | Las imágenes deben optimizarse (formato WebP y miniaturas) para que cada imagen de listado pese menos de 300 KB. |
| RNF-020 | Auditoría | Las acciones de moderación y administración deben registrar usuario, fecha, hora y acción realizada. |

---

## 5. Modelo de datos conceptual

Las entidades se basan en `src/types/contratos.ts`. Los nombres y estados coinciden con ese archivo.

| Entidad | Atributos principales | Relaciones |
|---|---|---|
| **Usuario** | id, correo, hash de contraseña, rol (*organizacion*, *ciudadano*, *administrador*), estado (*activo*, *suspendido*), fecha de registro | Tiene un perfil de organización o ciudadano. |
| **Organización** | id, nombre, descripción, ciudad, verificada (sí/no) | Pertenece a un Usuario. Publica Iniciativas. |
| **Ciudadano con iniciativa** | id, nombre, teléfono (opcional) | Pertenece a un Usuario. Publica Iniciativas. |
| **Iniciativa** | id, título, descripción, categoría, ciudad, lugar, latitud, longitud, foto, fecha_inicio, fecha_fin (opcional), medio_contacto, estado, publicada_en, actualizada_en | Pertenece a un organizador. Tiene Necesidades y Reportes. |
| **Necesidad** | id, nombre, tipo_aporte, unidad, cantidad_objetivo, cantidad_confirmada, estado | Pertenece a una Iniciativa. Tiene Participaciones. |
| **Participación** | id, nombre, correo, tipo_aporte, cantidad, estado (*pendiente*, *confirmada*, *rechazada*, *cancelada*, *cumplida*), fecha | Pertenece a una Necesidad. Puede asociarse a un Usuario. |
| **Reporte** | id, motivo, descripción, estado, fecha | Pertenece a una Iniciativa. |
| **Categoría** | id, nombre, activa | Asociada a muchas Iniciativas. |
| **Registro de auditoría** | id, usuario administrador, acción, entidad afectada, fecha | Independiente. Solo lectura. |

---

## 6. Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | Una iniciativa solo puede publicarse si tiene título, foto, descripción, categoría, fecha de inicio, lugar, ubicación y medio de contacto. |
| RN-02 | La fecha de inicio debe ser posterior a la fecha actual en el momento de publicar. |
| RN-03 | La ubicación debe estar dentro de los límites del municipio de Cali. |
| RN-04 | El medio de contacto debe ser un enlace válido de WhatsApp (`chat.whatsapp.com` o `wa.me`) o un número de celular colombiano de 10 dígitos que empiece por 3. |
| RN-05 | La descripción no puede superar 2 000 caracteres. El título no puede superar 120 caracteres. |
| RN-06 | Una iniciativa suspendida o cancelada no aparece en el listado ni en el mapa. |
| RN-07 | La cantidad confirmada de una necesidad no puede superar su cantidad objetivo. |
| RN-08 | Un correo solo puede tener una postulación pendiente o confirmada por necesidad. |
| RN-09 | Un usuario suspendido no puede iniciar sesión ni publicar. Sus iniciativas publicadas quedan suspendidas. |
| RN-10 | Una organización verificada muestra una insignia visible en sus iniciativas. |
| RN-11 | Las iniciativas reportadas por tres o más voluntarios distintos se envían automáticamente a la cola de moderación. |
| RN-12 | La fecha de los filtros y de los indicadores se calcula en la zona horaria America/Bogota. |

---

## 7. Interfaces externas

### 7.1 Interfaz de usuario

- Página principal con listado y acceso a mapa.
- Vista de mapa a pantalla completa en móvil, con tarjeta inferior al seleccionar un marcador.
- Formularios con validación en tiempo real y mensajes en español.
- Panel de organización y ciudadano con: mis iniciativas, participaciones y perfil.
- Panel de administrador con: cola de moderación, usuarios, estadísticas y auditoría.

### 7.2 Interfaces con sistemas externos

| Sistema | Tipo de interfaz | Uso |
|---|---|---|
| Proveedor de mapas | API (geocodificación y mapas) | Convertir direcciones en coordenadas y mostrar el mapa de Cali. |
| Servicio de correo | API SMTP o API HTTP | Enviar verificaciones, notificaciones y restablecimientos. |
| Almacenamiento de imágenes | API de archivos | Guardar y servir fotos optimizadas. |

### 7.3 Interfaces de software

- La API del sistema debe documentarse con los tipos de `src/types/contratos.ts` como fuente única de verdad, con rutas como `GET /api/iniciativas`, `GET /api/iniciativas/:id` y `POST /api/participaciones`.

---

## 8. Preguntas abiertas

Estas decisiones afectan el diseño. Cada una tiene una propuesta por defecto que se usará hasta que se confirme.

| ID | Pregunta | Propuesta por defecto |
|---|---|---|
| P-01 | ¿Cuál es el nombre definitivo del sistema? | VoluntariaCali (provisional). |
| P-02 | ¿Los voluntarios necesitan cuenta para postularse, o basta con su correo? | Sin cuenta para postularse (como indica `contratos.ts`). Cuenta opcional para ver historial. |
| P-03 | ¿Todas las iniciativas pasan por aprobación del administrador, o solo las de ciudadanos con iniciativa? | Todas pasan por moderación en la primera versión. |
| P-04 | ¿Las organizaciones deben demostrar su existencia formal (NIT, documento) antes de publicar? | No en v1. La verificación es manual, desde el panel del administrador. |
| P-05 | ¿Se incluyen donaciones en especie y transporte, además de voluntariado? | Sí, como indica `contratos.ts`. |
| P-06 | ¿Las postulaciones tienen cupo máximo y confirmación automática, o siempre las confirma el organizador? | El organizador confirma manualmente. Sin cupo automático. |
| P-07 | ¿Qué proveedor de mapas se usará: Google Maps (de pago por uso) o OpenStreetMap con Leaflet (gratuito)? | OpenStreetMap con Leaflet, por costo cero. |
| P-08 | ¿Qué stack tecnológico se usará para el backend y la base de datos? | Por confirmar. El repositorio sugiere TypeScript y Next.js. |
| P-09 | ¿Se necesitan los ocho estados de iniciativa de `contratos.ts`, o se simplifican? | Se mantienen los ocho por ahora. Revisar tras las pruebas con usuarios. |
| P-10 | ¿Existe una lista oficial de categorías, o las define el administrador? | El administrador las gestiona. Lista inicial propuesta en RF-021. |
