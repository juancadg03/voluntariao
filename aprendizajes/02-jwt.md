# 02 · JWT (JSON Web Token)

**Categoría:** Autenticación · **Se usa en Calida:** **no**. Se estudió y se descartó (ADR-18, lección L-04 de la [guía 00](../docs/00-guia-de-proyecto.md))

> Vale la pena conocerlo aunque Calida no lo use: aparece en muchísimos tutoriales, APIs y ofertas de trabajo. Saber **cuándo no usarlo** también es un aprendizaje.

---

## 1. El problema que resuelve

Después del login, cada petición debe demostrar quién es el usuario (ver [01 · Cookies](01-cookies.md)). Hay dos formas de hacerlo:

| Forma | Qué lleva el navegador | Cómo sabe el servidor quién eres |
|---|---|---|
| **Sesión en el servidor** (Calida) | Un id aleatorio, sin significado. | Busca ese id en su base de datos. |
| **Token autocontenido (JWT)** | Un texto con los datos del usuario **y una firma**. | Revisa la firma. **No consulta ninguna base.** |

El JWT existe para el segundo caso: que el servidor pueda confiar en lo que dice el token **sin guardar nada ni consultar nada**.

> **Analogía:** la sesión es como un guardarropa: te dan un ficho con un número y la información (tu abrigo) se queda adentro. El JWT es como un carnet con sello oficial: toda la información va en el carnet, y el portero solo revisa que el sello sea auténtico.

## 2. ¿Qué es?

Un JWT es un texto con **tres partes separadas por puntos**:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJyb2wiOiJ2b2x1bnRhcmlvIiwiaWF0IjoxNzYzMTM2MDAwLCJleHAiOjE3NjM3NDA4MDB9.YPGr5cND6HYS3LK14tl_W7dIN4ELm-3yYK3RsMSzvDQ
```

- Hasta el primer punto: la **cabecera**.
- Entre los dos puntos: los **datos** (*payload*).
- Después del segundo punto: la **firma**.

Este token es real: está firmado con el secreto del ejercicio de la sección 10. Cada parte está codificada en **Base64URL**, una forma de escribir bytes con letras y números. Al decodificarlas:

```json
// 1. Cabecera: cómo se firmó
{ "alg": "HS256", "typ": "JWT" }

// 2. Datos (payload): lo que el servidor afirma sobre el usuario
{ "sub": "123", "rol": "voluntario", "iat": 1763136000, "exp": 1763740800 }

// 3. Firma: HMAC-SHA256( cabecera + "." + datos , SECRETO )
```

### ⚠️ Lo más importante: Base64 **no es cifrado**

Cualquiera puede decodificar la cabecera y los datos, sin necesidad de conocer el secreto. Pruébalo en Node:

```js
const datos = 'eyJzdWIiOiIxMjMiLCJyb2wiOiJ2b2x1bnRhcmlvIn0';
console.log(Buffer.from(datos, 'base64url').toString());   // {"sub":"123","rol":"voluntario"}
```

Por eso, **nunca se pone información secreta en un JWT** (contraseñas, documentos, datos privados). El JWT no oculta nada: solo **garantiza que nadie lo modificó**.

## 3. Cómo funciona la firma, paso a paso

Esta es la parte que hace confiable al JWT. Para entenderla se necesitan dos ideas previas: qué es un **hash** y qué es un **HMAC**.

### 3.1 Idea previa: la función hash (SHA-256)

Una **función hash** recibe cualquier texto, de cualquier tamaño, y devuelve una "huella digital" de tamaño fijo. SHA-256 siempre devuelve 256 bits (32 bytes, que se ven como 64 caracteres hexadecimales):

```
SHA-256("hola") = b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79
SHA-256("Hola") = e633f4fc79badea1dc5db970cf397c8248bac47cc3acf9915ba60b5d76b0e88f
```

Estos valores son reales. Puedes comprobarlos con `node -e "console.log(require('crypto').createHash('sha256').update('hola').digest('hex'))"`.

Tiene cuatro propiedades que importan:

| Propiedad | Qué significa | Ejemplo |
|---|---|---|
| **Determinista** | El mismo texto siempre da la misma huella. | `"hola"` da siempre `b221d9…`. |
| **Tamaño fijo** | Una palabra o un libro entero: siempre 64 caracteres hex. | |
| **Efecto avalancha** | Cambiar **un solo carácter** cambia la huella por completo. | `hola` → `b221…`, `Hola` → `e633…`. No se parecen en nada. |
| **De una sola vía** | Con la huella no se puede reconstruir el texto original. | Con `b221d9…` no hay forma de calcular "hola", salvo probando textos hasta acertar. |

> **Conexión con algoritmos:** se parece a una función de *hashing* de una tabla hash, pero diseñada para que sea imposible encontrar a propósito dos textos con la misma huella (*colisión*).

### 3.2 Idea previa: HMAC = hash + secreto

Un hash solo **no sirve** como firma: cualquiera puede calcular `SHA-256(datos)`. Si un atacante cambia los datos, recalcula el hash y listo.

**HMAC** (*Hash-based Message Authentication Code*) mezcla el texto con un **secreto** antes de calcular el hash:

```
HMAC-SHA256(texto, secreto)  →  32 bytes
```

Ahora, para calcular la huella correcta **hay que conocer el secreto**. Quien no lo tiene no puede producirla.

> ¿Por qué no simplemente `SHA-256(secreto + texto)`? Porque esa forma ingenua tiene una debilidad conocida (*length extension*). HMAC aplica el hash dos veces, con el secreto mezclado de una forma especial, para evitarlo. No necesitas saber los detalles: **usa siempre HMAC, nunca inventes tu propia mezcla**.

> **Analogía:** el secreto es como la receta de un sello de lacre. Cualquiera puede ver el sello en la carta, pero solo quien tiene el molde puede fabricar uno igual.

### 3.3 No es una suma: las dos partes se **unen con un punto**

Una duda común: "¿la firma es la suma de la cabecera y los datos?". **No se suman**: se **concatenan**, o sea, se pegan como texto, con un punto en medio. Ese texto completo es lo que entra al HMAC.

Con el token de ejemplo de la sección 2:

```
cabecera64 = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
datos64    = eyJzdWIiOiIxMjMiLCJyb2wiOiJ2b2x1bnRhcmlvIiwiaWF0IjoxNzYzMTM2MDAwLCJleHAiOjE3NjM3NDA4MDB9

entrada    = cabecera64 + "." + datos64
           = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJyb2wiOiJ2b2x1bnRhcmlvIiwiaWF0IjoxNzYzMTM2MDAwLCJleHAiOjE3NjM3NDA4MDB9
```

**¿Por qué entran las dos partes y no solo los datos?** Porque así la firma protege **ambas**. Si alguien cambia la cabecera (por ejemplo, el algoritmo) o los datos, la entrada cambia y la firma ya no coincide.

### 3.4 Firmar: lo que hace el servidor al crear el token

```
Paso 1. Escribir la cabecera y los datos como JSON
        {"alg":"HS256","typ":"JWT"}
        {"sub":"123","rol":"voluntario","iat":1763136000,"exp":1763740800}

Paso 2. Pasar cada JSON a Base64URL
        eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
        eyJzdWIiOiIxMjMiLCJyb2wiOiJ2b2x1bnRhcmlvIiwiaWF0IjoxNzYzMTM2MDAwLCJleHAiOjE3NjM3NDA4MDB9

Paso 3. Unirlos con un punto → "entrada" (sección 3.3)

Paso 4. Calcular HMAC-SHA256(entrada, secreto)
        secreto = "solo-para-practicar-un-secreto-largo"
        resultado (32 bytes en hex):
        60f1abe5c343e87612dcb2b5e2d97f5bb74837810b9bedf260add1b0c4b3bc34

Paso 5. Pasar esos 32 bytes a Base64URL → la firma
        YPGr5cND6HYS3LK14tl_W7dIN4ELm-3yYK3RsMSzvDQ

Paso 6. Token = entrada + "." + firma
```

### 3.5 Verificar: lo que hace el servidor en cada petición

El servidor **no "descifra" la firma**. Hace algo más simple: **vuelve a calcularla** y compara.

```
Llega:  eyJhbGci…IkpXVCJ9 . eyJzdWIi…NDA4MDB9 . YPGr5cND6HYS3LK14tl_W7dIN4ELm-3yYK3RsMSzvDQ
        └─ cabecera64 ──┘   └─── datos64 ───┘   └──────────── firma recibida ────────────┘

Paso 1. Separar por los puntos. Si no hay exactamente 3 partes → rechazar.

Paso 2. Leer la cabecera y comprobar que alg sea "HS256".
        Si dice otra cosa (por ejemplo "none") → rechazar.

Paso 3. Recalcular: HMAC-SHA256(cabecera64 + "." + datos64, MI secreto)
        → firma esperada

Paso 4. Comparar la firma esperada con la recibida.
        ¿Iguales?  → nadie tocó la cabecera ni los datos.
        ¿Distintas? → rechazar (401).

Paso 5. Solo ahora leer los datos y comprobar exp.
        Si ya pasó la fecha → rechazar (token vencido).
```

**El orden importa:** primero la firma, después los datos. Si lees `rol` antes de verificar, estás confiando en algo que cualquiera pudo escribir.

### 3.6 ¿Qué pasa si alguien intenta engañar al servidor?

Todos estos valores son reales, calculados con el secreto de práctica.

**Intento 1: cambiar el rol y dejar la firma original.**

```
datos falsos = {"sub":"123","rol":"administrador",...}
            → eyJzdWIiOiIxMjMiLCJyb2wiOiJhZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzYzMTM2MDAwLCJleHAiOjE3NjM3NDA4MDB9

firma que trae el token:    YPGr5cND6HYS3LK14tl_W7dIN4ELm-3yYK3RsMSzvDQ   (la original)
firma que calcula el server: k6SR_1b06fo9Rxmx9B5mUJWaaPMZEuJ6ACUbmggRGUQ
                             → no coinciden → rechazado
```

Por el efecto avalancha, cambiar `voluntario` por `administrador` produce una firma totalmente distinta.

**Intento 2: cambiar el rol y calcular una firma nueva.** Para eso el atacante necesita el secreto. Si usa otro secreto, obtiene otra firma:

```
HMAC(entrada original, "otro-secreto") = WeNbOtrWav1J2GNPi-iefhlxJUcPINdRD22aqty_kRo
HMAC(entrada original, secreto real)   = YPGr5cND6HYS3LK14tl_W7dIN4ELm-3yYK3RsMSzvDQ
```

Sin el secreto correcto, ninguna firma que fabrique va a coincidir.

**Intento 3: adivinar el secreto.** Esta es la amenaza real. El atacante tiene un token válido (por ejemplo, el suyo propio), así que puede probar secretos en su computador, sin hacer peticiones al servidor, hasta que uno produzca la misma firma.
- Si el secreto es `"123456"` o `"calida2026"`, lo encuentra en segundos con una lista de contraseñas comunes.
- Si el secreto tiene 32 bytes aleatorios (`crypto.randomBytes(32).toString('hex')`), hay 2²⁵⁶ posibilidades: más que átomos en el universo observable. Es imposible.

**Por eso el secreto debe ser largo y aleatorio**, y vivir solo en una variable de entorno del servidor.

### 3.7 Un detalle de seguridad: comparar en tiempo constante

Una comparación normal (`a === b`) se detiene en el primer carácter distinto. Si un atacante mide con mucha precisión cuánto tarda el servidor en responder, en teoría puede deducir cuántos caracteres de su firma acertó. Esto se llama *ataque de tiempo* (*timing attack*).

Por eso la verificación usa `crypto.timingSafeEqual`, que siempre tarda lo mismo, sin importar dónde está la diferencia. La librería `jsonwebtoken` ya lo hace por ti.

### 3.8 Hacerlo a mano, sin librería

Para entenderlo de verdad, este código firma y verifica un JWT **solo con `node:crypto`**, que viene incluido en Node. Hace lo mismo que `jsonwebtoken`, sin las comprobaciones extra. **Es para aprender: en un proyecto real usa la librería.**

```js
// jwt-a-mano.mjs  →  ejecutar con: node jwt-a-mano.mjs
import { createHmac, timingSafeEqual } from 'node:crypto';

const SECRETO = 'solo-para-practicar-un-secreto-largo';
const aBase64 = (objeto) => Buffer.from(JSON.stringify(objeto)).toString('base64url');
const deBase64 = (texto) => JSON.parse(Buffer.from(texto, 'base64url').toString());

function firmarJWT(datos, secreto) {
  const cabecera64 = aBase64({ alg: 'HS256', typ: 'JWT' });
  const datos64 = aBase64(datos);
  const entrada = `${cabecera64}.${datos64}`;                       // se UNEN con un punto
  const firma64 = createHmac('sha256', secreto).update(entrada).digest('base64url');
  return `${entrada}.${firma64}`;
}

function verificarJWT(token, secreto) {
  // Paso 1: separar las tres partes
  const partes = token.split('.');
  if (partes.length !== 3) throw new Error('Formato inválido');
  const [cabecera64, datos64, firma64] = partes;

  // Paso 2: revisar el algoritmo
  if (deBase64(cabecera64).alg !== 'HS256') throw new Error('Algoritmo no permitido');

  // Paso 3: recalcular la firma con NUESTRO secreto
  const firmaEsperada = createHmac('sha256', secreto).update(`${cabecera64}.${datos64}`).digest();
  const firmaRecibida = Buffer.from(firma64, 'base64url');

  // Paso 4: comparar en tiempo constante
  if (firmaRecibida.length !== firmaEsperada.length || !timingSafeEqual(firmaRecibida, firmaEsperada)) {
    throw new Error('Firma inválida');
  }

  // Paso 5: solo ahora confiar en los datos y revisar el vencimiento
  const datos = deBase64(datos64);
  if (Math.floor(Date.now() / 1000) >= datos.exp) throw new Error('Token vencido');
  return datos;
}

// ── Pruebas ──
const ahora = Math.floor(Date.now() / 1000);
const token = firmarJWT({ sub: '123', rol: 'voluntario', iat: ahora, exp: ahora + 3600 }, SECRETO);
console.log('1. Token nuevo:      ', token);
console.log('2. Verificado:       ', verificarJWT(token, SECRETO));

const [cab, , firma] = token.split('.');
const falso = `${cab}.${aBase64({ sub: '123', rol: 'administrador', iat: ahora, exp: ahora + 3600 })}.${firma}`;
try { verificarJWT(falso, SECRETO); } catch (e) { console.log('3. Rol cambiado:     ', e.message); }

try { verificarJWT(token, 'otro-secreto'); } catch (e) { console.log('4. Otro secreto:     ', e.message); }

const viejo = firmarJWT({ sub: '123', rol: 'voluntario', iat: ahora - 7200, exp: ahora - 3600 }, SECRETO);
try { verificarJWT(viejo, SECRETO); } catch (e) { console.log('5. Vencido hace 1 h: ', e.message); }
```

Salida (el token cambia cada vez, porque `iat` y `exp` dependen de la hora):

```
1. Token nuevo:       eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMi….8sKSTYEsi9qpHB0RH7bb7Zvt8iZLLsS7BxwSF69xFes
2. Verificado:        { sub: '123', rol: 'voluntario', iat: 1794679211, exp: 1794682811 }
3. Rol cambiado:      Firma inválida
4. Otro secreto:      Firma inválida
5. Vencido hace 1 h:  Token vencido
```

Este ejercicio no necesita instalar nada. Prueba a cambiar cosas: quita el paso 2 y fabrica un token con `"alg":"none"` sin firma, o compara qué pasa si lees los datos antes del paso 4.

### 3.9 Algoritmos de firma

| Algoritmo | Tipo | Cuándo se usa |
|---|---|---|
| `HS256` | HMAC con un solo secreto compartido. El mismo secreto firma y verifica. | Un solo servidor firma y verifica. Es el caso de esta sección. |
| `RS256` / `ES256` | Par de llaves: la **privada** firma y la **pública** verifica. | Varios servicios verifican tokens que solo uno emite (por ejemplo, "Iniciar sesión con Google"). Quien verifica no puede fabricar tokens, porque no tiene la llave privada. |

## 4. Los datos estándar (*claims*)

Los campos del payload se llaman *claims*. Algunos tienen nombre estándar:

| Claim | Significado | Ejemplo |
|---|---|---|
| `sub` | *Subject*: de quién habla el token (id del usuario). | `"123"` |
| `exp` | *Expiration*: cuándo vence, en segundos desde 1970 (*timestamp Unix*). | `1763740800` |
| `iat` | *Issued at*: cuándo se creó. | `1763136000` |
| `iss` | *Issuer*: quién lo emitió. | `"calida-api"` |
| `aud` | *Audience*: para quién es. | `"calida-web"` |

Además se pueden agregar campos propios, como `rol`. Hay que recordar que viajan en **todas** las peticiones y que **cualquiera los puede leer**.

## 5. Cómo se usa en Node (librería `jsonwebtoken`)

```bash
npm install jsonwebtoken
```

```js
import jwt from 'jsonwebtoken';

const SECRETO = process.env.JWT_SECRETO;   // nunca escrito en el código

// ── Crear (en el login) ──────────────────────────────────────────
const token = jwt.sign(
  { sub: usuario.id, rol: perfil.rol },     // datos
  SECRETO,
  { expiresIn: '7d', algorithm: 'HS256' }   // agrega exp e iat por ti
);
res.cookie('sesion', token, { httpOnly: true, secure: true, sameSite: 'lax' });

// ── Verificar (middleware en cada petición) ──────────────────────
function exigirSesion(req, res, next) {
  try {
    const datos = jwt.verify(req.cookies.sesion, SECRETO, { algorithms: ['HS256'] });
    req.usuario = { id: datos.sub, rol: datos.rol };
    next();
  } catch (error) {
    // TokenExpiredError (venció) o JsonWebTokenError (firma inválida, token roto)
    res.status(401).json({ error: 'Sesión inválida' });
  }
}
```

Fíjate en que `jwt.verify` **no consulta ninguna base de datos**. Esa es toda la gracia del JWT.

> ⚠️ `jwt.decode()` **no verifica la firma**: solo lee los datos. Nunca lo uses para decidir permisos.

## 6. ¿Dónde se guarda el token en el navegador?

| Lugar | Cómo viaja | Riesgo |
|---|---|---|
| **Cookie `HttpOnly`** | Sola, en cada petición. | Bajo. JavaScript no la lee. Hay que cuidar CSRF (`SameSite`). |
| **`localStorage`** + cabecera `Authorization: Bearer <token>` | El código la agrega a mano en cada `fetch`. | **Alto.** Cualquier script inyectado (XSS) puede leer el token y enviarlo a otro lado. |

Muchos tutoriales usan `localStorage` porque es fácil de mostrar. Para sesiones en un navegador, la cookie `HttpOnly` es más segura.

## 7. Ventajas y desventajas

### Ventajas
- **Sin estado en el servidor:** no hace falta tabla de sesiones ni consultarla. Sirve cuando hay muchos servidores o servicios que no comparten base de datos.
- **Entre sistemas:** un servicio emite el token y otros lo verifican, incluso de otras empresas (con `RS256` y la llave pública). Así funcionan OAuth y OpenID Connect ("Iniciar sesión con Google").
- **Apps móviles y APIs públicas:** no dependen del navegador ni de las cookies.

### Desventajas
- **No se puede revocar.** Un token vale hasta su `exp`, aunque el usuario cierre sesión o lo suspendan. Para invalidarlo antes hace falta una "lista negra" en la base… y entonces ya se consulta la base, que era lo que se quería evitar.
- **Datos desactualizados.** Si el token dice `"rol":"organizacion"` y el administrador cambia ese rol, el token sigue diciendo lo viejo hasta que vence.
- **Un secreto que proteger.** Si `JWT_SECRETO` se filtra, alguien puede fabricar tokens válidos de cualquier usuario.
- **Más grande** que un id de sesión, y viaja en cada petición.
- **Fácil de configurar mal:** aceptar `alg: "none"` (token sin firma), no fijar `algorithms` en `verify`, o usar un secreto corto como `"123456"`.

### El patrón *access token* + *refresh token*

Para suavizar el problema de la revocación, muchos sistemas usan dos tokens:
- **Access token:** un JWT de vida muy corta (5 a 15 minutos), que se usa en cada petición.
- **Refresh token:** de vida larga y **guardado en la base**. Sirve para pedir un access token nuevo, y se puede revocar.

Funciona, pero ahora hay dos tokens, una tabla y un flujo de renovación. Es más complejo que una sesión simple.

## 8. JWT o sesión en la base: ¿cuándo usar cada uno?

| Situación | Mejor opción |
|---|---|
| Un solo servidor con su base de datos, y una web en el navegador | **Sesión en la base** |
| Hay que poder cerrar sesión o suspender usuarios al instante | **Sesión en la base** |
| Muchos servicios que no comparten base y deben confiar en el mismo usuario | JWT |
| Iniciar sesión con un proveedor externo (Google, GitHub) | JWT (te lo entregan ellos) |
| API pública para apps móviles o terceros | JWT (u otros tokens) |

## 9. En Calida: por qué **no** se usa

La primera versión de la ADR-18 eligió JWT. Al preguntarnos "¿qué es y por qué lo necesitamos?", apareció una contradicción:

1. La ventaja del JWT es **no consultar la base** en cada petición.
2. Pero Calida **ya consulta la base en cada petición** para cargar el perfil, porque si el administrador suspende a alguien, la suspensión debe funcionar al instante (RN-09).
3. Entonces pagábamos los costos del JWT (librería, secreto, no poder cerrar sesión de verdad) **sin recibir su beneficio**.

**Decisión:** sesiones guardadas en la tabla `sesiones`. La cookie lleva solo un id aleatorio ([04 · §7.1](../docs/04-arquitectura.md), ADR-18). La historia completa está en la lección **L-04** de la [guía 00](../docs/00-guia-de-proyecto.md).

**¿Cuándo lo reconsideraríamos?** Si Calida tuviera una app móvil, varios servicios separados, o "Iniciar sesión con Google".

## 10. Para practicar (10 minutos)

En una carpeta fuera del proyecto, ejecuta `npm init -y`, luego `npm install jsonwebtoken`, y crea `prueba.mjs`:

```js
import jwt from 'jsonwebtoken';
const SECRETO = 'solo-para-practicar-un-secreto-largo';

// 1. Crear un token
const token = jwt.sign({ sub: '123', rol: 'voluntario' }, SECRETO, { expiresIn: '10s' });
console.log('Token:', token);

// 2. Leer los datos SIN el secreto (no está cifrado)
const [, datos] = token.split('.');
console.log('Cualquiera lee:', Buffer.from(datos, 'base64url').toString());

// 3. Verificar con el secreto
console.log('Verificado:', jwt.verify(token, SECRETO));

// 4. Intentar falsificarlo: cambiar el rol y conservar la firma
const [cab, , firma] = token.split('.');
const datosFalsos = Buffer.from(JSON.stringify({ sub: '123', rol: 'administrador' })).toString('base64url');
try {
  jwt.verify(`${cab}.${datosFalsos}.${firma}`, SECRETO);
} catch (e) {
  console.log('Falsificación detectada:', e.message);   // invalid signature
}

// 5. Esperar a que venza
setTimeout(() => {
  try { jwt.verify(token, SECRETO); } catch (e) { console.log('Después de 11 s:', e.name); } // TokenExpiredError
}, 11_000);
```

Ejecuta `node prueba.mjs` y observa los cinco resultados.

> Existen páginas como jwt.io para decodificar tokens. Sirven para tokens de práctica, pero **nunca pegues ahí un token real**: quien lo tenga puede usarlo hasta que venza.

## 11. Resumen

- Un JWT tiene **cabecera.datos.firma**, cada parte en Base64URL.
- **No está cifrado:** cualquiera lee los datos. La firma solo garantiza que **nadie los cambió**.
- La firma es `HMAC-SHA256(cabecera64 + "." + datos64, secreto)`: las partes se **unen con un punto**, no se suman.
- Verificar = **recalcular** la firma con el secreto propio y comparar; solo después se confía en los datos y se revisa `exp`.
- El secreto debe ser largo y aleatorio: con un token en la mano, un secreto débil se adivina sin tocar el servidor.
- Con `RS256`, una llave privada firma y una pública verifica. Ninguna de las dos formas consulta la base.
- Su gran debilidad: **no se puede revocar** antes de que venza.
- Si se usa en una web, va en una cookie `HttpOnly`, no en `localStorage`.
- En la librería: `jwt.sign()` para crear y `jwt.verify()` para comprobar (fijando `algorithms`). Nunca uses `jwt.decode()` para decidir permisos.
- Calida no lo usa, porque ya consulta la base en cada petición. Una sesión en la tabla `sesiones` es más simple y se puede cerrar de verdad.
