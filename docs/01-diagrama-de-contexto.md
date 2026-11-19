# 01 · Diagrama de contexto

**Proyecto:** Calida
**Versión:** 0.3 · **Fecha:** 14/11/2026 · **Estado:** borrador

---

## 1. Propósito

Este diagrama muestra el sistema como una caja negra: quiénes interactúan con él, qué información intercambian y qué sistemas externos necesita para funcionar. No describe la arquitectura interna.

## 2. Diagrama

```mermaid
flowchart LR
    ORG["🏢 Organización<br/>(fundación, hospital, ONG)"]
    CIU["👤 Ciudadano con iniciativa"]
    VOL["🙋 Voluntario<br/>(con cuenta)"]
    VIS["👀 Visitante<br/>(sin cuenta)"]
    ADM["🛠️ Administrador"]

    SIS(("Calida<br/>Oportunidades de voluntariado<br/>e incidencia social en Cali"))

    MAPA["🗺️ Proveedor de mapas<br/>(OpenStreetMap)"]
    FOTOS["🖼️ Cloudinary<br/>(almacenamiento de fotos)"]
    WA["💬 WhatsApp / teléfono<br/>(canal externo)"]

    ORG -- "publica iniciativas,<br/>necesidades y contacto" --> SIS
    CIU -- "publica iniciativas" --> SIS
    VOL -- "se inscribe a ayudas<br/>y gestiona su perfil" --> SIS
    VIS -- "explora listado, mapa<br/>y detalles" --> SIS
    ADM -- "modera, gestiona usuarios<br/>y consulta estadísticas" --> SIS

    SIS -- "panel de gestión y<br/>inscripciones recibidas" --> ORG
    SIS -- "estado de sus publicaciones" --> CIU
    SIS -- "estado de sus inscripciones<br/>y avisos del organizador" --> VOL
    SIS -- "listado, mapa e iniciativas" --> VIS
    SIS -- "panel, reportes y<br/>cola de moderación" --> ADM

    SIS -- "direcciones → coordenadas<br/>y capas del mapa" --> MAPA
    SIS -- "fotos de iniciativas" --> FOTOS
    VOL -. "contacta directamente<br/>al grupo o teléfono" .-> WA
    VIS -. "contacta directamente<br/>al grupo o teléfono" .-> WA
```

## 3. Actores

| Actor | Descripción | Cuenta | Qué hace con el sistema |
|---|---|---|---|
| **Organización** | Fundaciones, hospitales, ONG u otras entidades reconocidas que necesitan voluntarios, donaciones o transporte. | Sí | Publica y gestiona iniciativas, define necesidades y gestiona las inscripciones que recibe. |
| **Ciudadano con iniciativa** | Persona sin organización formal que quiere impulsar una actividad y necesita apoyo de otras personas. | Sí | Publica y gestiona sus iniciativas con las mismas funciones básicas de una organización. |
| **Voluntario** | Persona registrada que quiere apoyar una iniciativa. | Sí | Explora, se inscribe a necesidades, recibe avisos y consulta su historial. |
| **Visitante** | Persona que entra al sistema sin registrarse. | No | Explora el listado, el mapa y los detalles. No puede inscribirse ni reportar. |
| **Administrador** | Responsable de la plataforma. | Sí (rol interno) | Modera publicaciones, gestiona usuarios y consulta estadísticas. |

## 4. Sistemas externos

| Sistema externo | Intercambio | Motivo |
|---|---|---|
| Proveedor de mapas (OpenStreetMap con Leaflet) | El sistema envía direcciones y recibe coordenadas; carga las capas del mapa. | Visualizar las iniciativas en el mapa de Cali. |
| Cloudinary | El sistema envía las fotos de las iniciativas y recibe la dirección (URL) donde quedan publicadas. | Guardar y servir fotos sin ocupar el servidor propio. |
| WhatsApp / teléfono | Canal externo al sistema. Voluntarios y visitantes abren el enlace del grupo o marcan el número. | Contacto directo. El sistema no gestiona mensajes. |

## 5. Flujos de información principales

| Desde | Hacia | Información |
|---|---|---|
| Organización / Ciudadano | Sistema | Iniciativa (título, foto, descripción, fecha, lugar, ubicación, contacto, categoría, tipos de ayuda) y necesidades. |
| Voluntario | Sistema | Inscripción a una necesidad (cantidad y mensaje opcional), reportes y perfil. |
| Visitante | Sistema | Filtros de búsqueda y consultas al listado y al mapa. |
| Sistema | Visitante / Voluntario | Listado, mapa, detalle de iniciativas y medio de contacto público. |
| Sistema | Organización / Ciudadano | Nuevas inscripciones y cambios de estado de sus iniciativas. |
| Sistema | Administrador | Cola de moderación, reportes y estadísticas agregadas. |

## 6. Límites del sistema

**Dentro del alcance (v1):**
- Publicación, edición y gestión de iniciativas y necesidades.
- Exploración por listado y mapa, con filtros por categoría y tipo de ayuda.
- Inscripción de voluntarios registrados y avisos dentro de la plataforma.
- Moderación, gestión de usuarios y estadísticas para el administrador.

**Fuera del alcance (v1):**
- Donaciones monetarias o pasarelas de pago.
- Chat interno entre voluntarios y organizaciones (la comunicación se hace por WhatsApp o teléfono).
- Certificación o registro oficial de horas de voluntariado.
- Gestión de inventario de donaciones.
- Ciudades distintas a Cali.
- Correos electrónicos: avisos, verificación de cuenta y recuperación de contraseña (ADR-06, ADR-22).

> **Nota (versión 0.3):** la base de datos y la autenticación ya no aparecen como sistemas externos. Antes las daba Supabase; ahora son parte de Calida (ver [04 · Arquitectura](04-arquitectura.md), ADR-16 a ADR-18). El diagrama de contexto solo muestra lo que está **fuera** de la caja.
