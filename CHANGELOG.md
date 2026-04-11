# Changelog

Todos los cambios relevantes de este proyecto se documentan aqui.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

## [0.2.0] - 2026-04-11

### Added

Siete nuevas fuentes regionales de subvenciones, cubriendo las CCAA que
tenian dataset publico propio ademas del mirror en BDNS. Todas las URLs
han sido verificadas con curl antes de incluirlas.

- **Catalunya — RAISC** (`/fuentes/cat-subvenciones/`). Registre d'Ajuts
  i Subvencions de Catalunya, dos datasets Socrata con **>21 millones de
  concesiones** (s9xt-n979) y 64k convocatorias (khxn-nv6a) desde 2018.
  API Socrata con SoQL, sin autenticacion. La fuente regional mas rica de
  Espana por volumen.
- **Andalucia — Subvenciones otorgadas** (`/fuentes/anda-subvenciones/`).
  API REST propia con OpenAPI en `datos.juntadeandalucia.es/api/v0/
  subventions/`. Descarga integral en JSON (~38 MB) o CSV, CC BY 4.0,
  actualizacion diaria.
- **Pais Vasco — Ayudas concedidas Euskadi** (`/fuentes/eusk-subvenciones/`).
  Dataset JSON unificado del Gobierno Vasco + 3 diputaciones forales +
  ayuntamientos adheridos, alimentado desde BDNS. Open Data Euskadi.
- **Comunitat Valenciana — Ayudas y subvenciones GVA**
  (`/fuentes/val-subvenciones/`). Datasets anuales CKAN en
  `dadesobertes.gva.es` (eco-gvo-subv-YYYY) desde 2019, con CSV/JSON/XML
  y API REST CKAN.
- **Asturias — Subvenciones del Principado**
  (`/fuentes/ast-subvenciones/`). CSVs directos estables en
  `descargas.asturias.es` (historico 2016-2023 + 2024 en adelante +
  convocatorias), licencia CC BY 4.0.
- **Canarias — Subvenciones, premios y becas**
  (`/fuentes/can-subvenciones/`). CSV mensual del Gobierno de Canarias
  en `datos.canarias.es` con diccionario de datos. Cubre tramites
  electronicos desde diciembre 2020.
- **Illes Balears — Concessions de subvencions**
  (`/fuentes/bal-subvenciones/`). CSV bilingue (ca/es) del Govern de les
  Illes Balears en `intranet.caib.es/opendatacataleg/` (dominio publico a
  pesar del nombre), mirror BDNS, CC BY.

Las entradas de Asturias, Canarias y Baleares incluyen ejemplos de
descarga directa con `curl` y carga con `pandas`.

### Changed

- Catalogo de fuentes pasa de 18 a **25** entradas. Las CCAA con dataset
  propio de subvenciones pasan de 2 (CyL, CLM) a 9 (+ Catalunya, Andalucia,
  Euskadi, Valencia, Asturias, Canarias, Baleares).

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
