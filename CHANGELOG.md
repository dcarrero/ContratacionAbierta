# Changelog

Todos los cambios relevantes de este proyecto se documentan aqui.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

## [0.1.0] - 2026-04-11

### Added

- **BDNS — Base de Datos Nacional de Subvenciones** como nueva fuente nacional
  en `/fuentes/bdns/`. Incluye ficha completa con descripcion larga, listado de
  campos principales y tres ejemplos de codigo (curl y Python) contra los
  endpoints `https://www.infosubvenciones.es/bdnstrans/api/convocatorias/busqueda`
  y `/concesiones/busqueda`.
- **Castilla y Leon — Subvenciones concedidas** como nueva fuente regional en
  `/fuentes/cyl-subvenciones/`. API Opendatasoft v2.1 con descargas en CSV,
  JSON y XLS, licencia CC BY 4.0.
- **Castilla-La Mancha — Subvenciones concedidas** como nueva fuente regional
  en `/fuentes/clm-subvenciones/`. Buscador web de la JCCM con exportacion
  CSV/XLS, datos desde 2014.
- **subvencions.cat** anadido al catalogo de `/portales/` como observatorio
  independiente de subvenciones de Cataluna (Ciencia de Dades, datos del RAISC
  de la Generalitat).

### Changed

- Ampliado el alcance de `/fuentes/` y `/portales/` para cubrir contratacion
  publica **y subvenciones**. Actualizados los meta `title`/`description`, las
  cabeceras y los parrafos introductorios de ambas paginas.
- Subtitulo de la seccion "Fuentes nacionales" generalizado para reflejar que
  ahora incluye tanto PLACSP como BDNS.

## [0.0.1] - 2026-03-30

Primera version publicada. Incluye:

- Catalogo inicial de fuentes de datos de contratacion publica (PLACSP,
  regionales CCAA, datasets historicos).
- Paginas de ficha individual por fuente con campos, ejemplos de codigo y
  descargas.
- Portales de consulta (contratacionabierta.es, contractes.cat).
- Seccion de codigo con repositorios externos verificados.
- SEO completo: sitemap, robots.txt, llms.txt, Schema.org, Open Graph.
- Footer legal con aviso legal, privacidad y cookies.
- Licencia MIT.
