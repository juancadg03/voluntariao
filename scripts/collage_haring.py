#!/usr/bin/env python3
"""
Collage estilo Keith Haring a partir de dibujos SVG.

Toma todos los .svg de una carpeta y los reparte al azar sobre un lienzo,
cuidando que no se monten unos sobre otros. El resultado es un único SVG
(vectorial, así que se ve nítido a cualquier tamaño).

Uso básico (desde la raíz del proyecto):
    python3 scripts/collage_haring.py

Ejemplos:
    python3 scripts/collage_haring.py --semilla 7
    python3 scripts/collage_haring.py --ancho 1920 --alto 1080 --fondo "#ffd400"
    python3 scripts/collage_haring.py --excluir logo1 logo2a logo2b logo3a logo3b

Solo usa la librería estándar de Python (no hay que instalar nada).
"""

import argparse
import math
import random
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

SVG_NS = "http://www.w3.org/2000/svg"
XLINK_NS = "http://www.w3.org/1999/xlink"
ET.register_namespace("", SVG_NS)
ET.register_namespace("xlink", XLINK_NS)


# ---------------------------------------------------------------------------
# 1. Leer cada dibujo y convertirlo en un <symbol> reutilizable
# ---------------------------------------------------------------------------
# Idea clave: cada archivo se guarda UNA sola vez dentro de <defs> como un
# <symbol>, y luego se "estampa" con <use> todas las veces que queramos.
# Así el archivo final no crece aunque un dibujo aparezca 5 veces.

def limpiar_nombre(nombre):
    """Convierte 'persona caja.svg' en un id válido: 'persona_caja'."""
    return re.sub(r"[^A-Za-z0-9_-]", "_", nombre)


def leer_dibujo(ruta):
    """Devuelve (id, viewBox, ancho, alto, elemento <symbol>) o None si falla."""
    try:
        raiz = ET.parse(ruta).getroot()
    except ET.ParseError as e:
        print(f"  ! No pude leer {ruta.name}: {e}", file=sys.stderr)
        return None

    # El viewBox dice qué rectángulo del dibujo es visible: "x y ancho alto".
    viewbox = raiz.get("viewBox")
    if not viewbox:
        print(f"  ! {ruta.name} no tiene viewBox, lo salto", file=sys.stderr)
        return None
    vx, vy, vw, vh = (float(n) for n in viewbox.replace(",", " ").split())

    prefijo = limpiar_nombre(ruta.stem)
    simbolo = ET.Element(f"{{{SVG_NS}}}symbol", {"id": prefijo, "viewBox": viewbox})

    for hijo in list(raiz):
        if not hijo.tag.startswith(f"{{{SVG_NS}}}"):
            continue  # metadatos de Inkscape (sodipodi:namedview, etc.)
        simbolo.append(hijo)

    # Inkscape repite ids como "layer1" o "path211" en distintos archivos.
    # Al juntar todo en un solo SVG chocarían, así que les ponemos prefijo.
    for el in simbolo.iter():
        if el is not simbolo and el.get("id"):
            el.set("id", f"{prefijo}__{el.get('id')}")
        for attr in list(el.attrib):
            # Quitamos atributos propios de Inkscape (no son SVG estándar).
            if "inkscape" in attr or "sodipodi" in attr:
                del el.attrib[attr]

    return prefijo, vw, vh, simbolo


# ---------------------------------------------------------------------------
# 2. Colocar los dibujos sin que se toquen
# ---------------------------------------------------------------------------
# Usamos "muestreo por rechazo": proponemos una posición al azar y, si choca
# con algo ya puesto, la descartamos y probamos otra. Simple y efectivo.
#
# Cada dibujo ocupa un rectángulo (su "caja"). Si lo rotamos, la caja que
# lo contiene crece; calculamos esa caja rotada para comparar choques.

def caja_rotada(ancho, alto, grados):
    """Ancho y alto de la caja que contiene un rectángulo rotado."""
    r = math.radians(grados)
    c, s = abs(math.cos(r)), abs(math.sin(r))
    return ancho * c + alto * s, ancho * s + alto * c


def se_chocan(a, b, margen):
    """¿Los rectángulos a y b (x, y, w, h) se tocan, contando el margen?"""
    return not (
        a[0] + a[2] + margen <= b[0]
        or b[0] + b[2] + margen <= a[0]
        or a[1] + a[3] + margen <= b[1]
        or b[1] + b[3] + margen <= a[1]
    )


def colocar(dibujos, args, rng):
    """Devuelve una lista de colocaciones: (id, x, y, w, h, grados)."""
    lado_menor = min(args.ancho, args.alto)
    tam_max = lado_menor * args.tam_max
    tam_min = lado_menor * args.tam_min

    puestos = []   # colocaciones finales
    cajas = []     # rectángulos ocupados, para detectar choques
    usos = {d[0]: 0 for d in dibujos}

    # Barajamos y recorremos en rondas: primero sale cada dibujo una vez,
    # luego se repiten (como en Haring, donde el lienzo queda lleno).
    total_intentos = args.intentos
    for intento in range(total_intentos):
        if len(puestos) >= args.max_figuras:
            break

        # El tamaño empieza grande y se va achicando: primero entran las
        # figuras grandes y después las pequeñas rellenan los huecos.
        progreso = intento / total_intentos
        tam = tam_max - (tam_max - tam_min) * progreso
        tam *= rng.uniform(0.85, 1.15)

        # Preferimos el dibujo que menos veces se ha usado (variedad).
        menos = min(usos.values())
        candidatos = [d for d in dibujos if usos[d[0]] <= menos + args.repeticion]
        ident, vw, vh, _ = rng.choice(candidatos)

        # Escalamos para que el lado más largo del dibujo mida "tam".
        escala = tam / max(vw, vh)
        w, h = vw * escala, vh * escala
        grados = rng.uniform(-args.rotacion, args.rotacion)
        bw, bh = caja_rotada(w, h, grados)

        if bw > args.ancho or bh > args.alto:
            continue
        bx = rng.uniform(0, args.ancho - bw)
        by = rng.uniform(0, args.alto - bh)
        caja = (bx, by, bw, bh)

        if any(se_chocan(caja, otra, args.margen) for otra in cajas):
            continue

        # La caja rotada tiene el mismo centro que el dibujo sin rotar.
        cx, cy = bx + bw / 2, by + bh / 2
        puestos.append((ident, cx - w / 2, cy - h / 2, w, h, grados))
        cajas.append(caja)
        usos[ident] += 1

    return puestos


# ---------------------------------------------------------------------------
# 3. Armar el SVG final
# ---------------------------------------------------------------------------

def construir_svg(dibujos, puestos, args):
    svg = ET.Element(f"{{{SVG_NS}}}svg", {
        "width": str(args.ancho),
        "height": str(args.alto),
        "viewBox": f"0 0 {args.ancho} {args.alto}",
        "version": "1.1",
    })
    defs = ET.SubElement(svg, f"{{{SVG_NS}}}defs")
    usados = {p[0] for p in puestos}
    for ident, _, _, simbolo in dibujos:
        if ident in usados:          # solo guardamos los que aparecen
            defs.append(simbolo)

    if args.fondo != "none":
        ET.SubElement(svg, f"{{{SVG_NS}}}rect", {
            "width": "100%", "height": "100%", "fill": args.fondo,
        })

    for ident, x, y, w, h, grados in puestos:
        cx, cy = x + w / 2, y + h / 2
        ET.SubElement(svg, f"{{{SVG_NS}}}use", {
            "href": f"#{ident}",
            f"{{{XLINK_NS}}}href": f"#{ident}",  # para visores antiguos
            "x": f"{x:.2f}", "y": f"{y:.2f}",
            "width": f"{w:.2f}", "height": f"{h:.2f}",
            "transform": f"rotate({grados:.2f} {cx:.2f} {cy:.2f})",
        })
    return ET.ElementTree(svg)


# ---------------------------------------------------------------------------
# Programa principal
# ---------------------------------------------------------------------------

def main():
    raiz_proyecto = Path(__file__).resolve().parent.parent
    p = argparse.ArgumentParser(description="Collage SVG estilo Keith Haring")
    p.add_argument("--carpeta", type=Path, default=raiz_proyecto / "imgs" / "svg",
                   help="carpeta con los dibujos .svg")
    p.add_argument("--salida", type=Path, default=raiz_proyecto / "imgs" / "collage_login.svg")
    p.add_argument("--ancho", type=int, default=1440)
    p.add_argument("--alto", type=int, default=900)
    p.add_argument("--fondo", default="#ffffff", help='color de fondo o "none"')
    p.add_argument("--semilla", type=int, default=None,
                   help="número para repetir exactamente el mismo resultado")
    p.add_argument("--tam-max", type=float, default=0.14,
                   help="tamaño máximo de figura, como fracción del lado menor")
    p.add_argument("--tam-min", type=float, default=0.05,
                   help="tamaño mínimo de figura, como fracción del lado menor")
    p.add_argument("--margen", type=float, default=6, help="espacio mínimo entre figuras (px)")
    p.add_argument("--rotacion", type=float, default=15, help="giro máximo en grados (±)")
    p.add_argument("--intentos", type=int, default=80000)
    p.add_argument("--max-figuras", type=int, default=500)
    p.add_argument("--repeticion", type=int, default=1,
                   help="cuánto puede adelantarse un dibujo a los demás en usos (0 = rondas estrictas)")
    p.add_argument("--excluir", nargs="*", default=[],
                   help="nombres de archivo (sin .svg) que no se usan")
    args = p.parse_args()

    semilla = args.semilla if args.semilla is not None else random.randrange(1_000_000)
    rng = random.Random(semilla)

    archivos = sorted(f for f in args.carpeta.glob("*.svg") if f.stem not in args.excluir)
    print(f"Leyendo {len(archivos)} dibujos de {args.carpeta}")
    dibujos = [d for d in (leer_dibujo(f) for f in archivos) if d]
    if not dibujos:
        sys.exit("No encontré dibujos válidos.")

    puestos = colocar(dibujos, args, rng)
    arbol = construir_svg(dibujos, puestos, args)
    args.salida.parent.mkdir(parents=True, exist_ok=True)
    arbol.write(args.salida, encoding="utf-8", xml_declaration=True)

    print(f"Colocadas {len(puestos)} figuras · semilla {semilla}")
    print(f"Guardado en {args.salida}")


if __name__ == "__main__":
    main()
