# ContratacionAbierta.com

Catálogo de fuentes de datos abiertos de contratación pública en España.

Reúne todas las fuentes oficiales conocidas en un solo lugar: feeds Atom de PLACSP, APIs regionales, portales de datos abiertos de comunidades autónomas y datasets históricos. Con enlaces directos a los datos originales y archivos listos para descargar.

## Contenido

- **5 feeds nacionales** — Licitaciones, contratos menores, plataformas agregadas, encargos a medios propios y consultas preliminares de mercado (PLACSP / Ministerio de Hacienda)
- **9 fuentes regionales** — Catalunya, Andalucía, País Vasco, Asturias, Valencia, Castilla y León, Canarias, Aragón, Madrid
- **1 dataset histórico** — BQuant Finance (8,69M registros en Parquet)
- **40+ archivos ZIP** descargables directamente desde servidores oficiales
- **Portales de consulta** — Sitios con datos ya procesados para consulta ciudadana

## Stack

- [Astro](https://astro.build) — Static site generator
- [Tailwind CSS 4](https://tailwindcss.com) — Estilos
- [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography) — Páginas legales

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # Genera en ./dist/
npm run preview    # Preview del build
```

## Estructura

```
src/
├── components/
│   ├── Nav.astro          # Navegación sticky
│   └── Footer.astro       # Pie con legal + créditos
├── data/
│   └── fuentes.ts         # Catálogo de 15 fuentes con URLs y descargas
├── layouts/
│   └── Layout.astro       # Layout base con SEO (OG, canonical)
├── pages/
│   ├── index.astro        # Home
│   ├── fuentes.astro      # Fuentes de datos (nacionales + regionales)
│   ├── fuentes/[id].astro # Ficha individual por fuente
│   ├── descargas.astro    # Descargas directas de ZIPs
│   ├── portales.astro     # Portales de consulta ciudadana
│   ├── codigo.astro       # Código y recursos open source
│   ├── aviso-legal.astro  # Aviso legal
│   ├── privacidad.astro   # Política de privacidad
│   └── cookies.astro      # Política de cookies
└── styles/
    └── global.css
```

## Proyecto relacionado

Los datos catalogados aquí se importan y procesan en un proyecto privado de análisis de datos de contratación pública con ~8M contratos indexados.

## Licencia

Código: MIT. Los datos enlazados son propiedad de sus respectivas administraciones públicas.

---

Hecho con ❤️ por [Color Vivo Internet S.L.](https://colorvivo.com) desde Madrid y Herencia (Ciudad Real) — España
