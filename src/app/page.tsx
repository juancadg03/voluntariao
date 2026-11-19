"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./bienvenida.module.css";

export default function Inicio() {
  const [mensaje, setMensaje] = useState("");

  return (
    <main className={styles.pagina}>
      <section className={styles.acceso} aria-labelledby="titulo-acceso">
        <div className={styles.tarjeta}>
          <img src="/calida/logo.svg" alt="Cálida" width="108" height="48" />
          <h1 id="titulo-acceso">Iniciar sesión</h1>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setMensaje("El inicio de sesión aún no está disponible. Puedes explorar las iniciativas sin una cuenta.");
            }}
          >
            <label>
              Correo electrónico
              <input type="email" autoComplete="username" placeholder="nombre@ejemplo.com" required />
            </label>
            <label>
              Contraseña
              <input type="password" autoComplete="current-password" required />
            </label>
            <button type="submit">Iniciar sesión</button>
          </form>
          {mensaje && <p role="status">{mensaje}</p>}
        </div>
      </section>
      <section className={styles.bienvenida} aria-labelledby="titulo-bienvenida">
        <h2 id="titulo-bienvenida">¡Te damos la bienvenida a Cálida!</h2>
        <p>Encuentra voluntariados e iniciativas ciudadanas en Cali. Elige una causa y colabora.</p>
        <p>¿Tienes una iniciativa?<br />Compártela y encuentra personas que te ayuden.</p>
        <Link href="/iniciativas">Ver iniciativas</Link>
      </section>
    </main>
  );
}
