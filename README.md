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
- [Cloudflare Pages](https://pages.cloudflare.com) — Hosting estático

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # Genera en ./dist/
npm run preview    # Preview del build
```

## Despliegue

Hosting en **Cloudflare Pages** (sitio 100% estático). Conectar el repo en el
panel de Cloudflare Pages con esta configuración de build:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version:** `22` (definida en `.nvmrc`)

Cada push a `main` dispara build y deploy automáticos. Las redirecciones se
gestionan en `public/_redirects` (formato nativo de Pages) y la página de error
se sirve desde `dist/404.html` (generada por `src/pages/404.astro`).

Despliegue manual alternativo por CLI:

```bash
npx wrangler pages deploy dist
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
│   ├── cookies.astro      # Política de cookies
│   └── 404.astro          # Página de error 404
└── styles/
    └── global.css
```

## Proyecto relacionado

Los datos catalogados aquí se consumen en [**contratacion-publica-abierta**](https://github.com/dcarrero/contratacion-publica-abierta), el portal open source de transparencia en contratación pública (Laravel 12 + PostgreSQL) con ~8,2M contratos indexados.

## Licencia

Código: MIT. Los datos enlazados son propiedad de sus respectivas administraciones públicas.

---

Hecho con ❤️ por [Color Vivo Internet S.L.](https://colorvivo.com) desde Madrid y Herencia (Ciudad Real) — España
