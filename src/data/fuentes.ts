export interface Fuente {
  id: string
  nombre: string
  descripcion: string
  tipo: 'nacional' | 'regional' | 'dataset'
  entidad: string
  url_portal: string
  url_datos?: string
  formato: string
  registros?: string
  cobertura: string
  actualizacion: string
  licencia: string
  descargas?: Descarga[]
  // Campos para pagina de detalle
  descripcion_larga?: string
  campos?: string[]
  ejemplos?: Ejemplo[]
}

export interface Descarga {
  nombre: string
  url: string
  formato: string
  tamaño?: string
  periodo?: string
}

export interface Ejemplo {
  lenguaje: string
  titulo: string
  codigo: string
}

export const fuentes: Fuente[] = [
  // === NACIONALES ===
  {
    id: 'placsp-licitaciones',
    nombre: 'PLACSP — Licitaciones por contratante',
    descripcion: 'Feed principal de licitaciones publicadas por los perfiles de contratante en la Plataforma de Contratacion del Sector Publico. Incluye todas las administraciones con perfil propio.',
    tipo: 'nacional',
    entidad: 'Ministerio de Hacienda',
    url_portal: 'https://contrataciondelestado.es',
    url_datos: 'https://www.hacienda.gob.es/es-ES/GobiernoAbierto/Datos%20Abiertos/Paginas/licitaciones_plataforma_contratacion.aspx',
    formato: 'Atom XML (CODICE 2.07)',
    registros: '~4 millones',
    cobertura: '2012–actualidad',
    actualizacion: 'Diaria',
    licencia: 'Datos abiertos',
    descripcion_larga: `La Plataforma de Contratacion del Sector Publico (PLACSP) es el portal oficial del Gobierno de Espana para la publicidad de licitaciones y contratos publicos. Gestionado por el Ministerio de Hacienda, centraliza la informacion de todas las administraciones publicas que tienen perfil de contratante propio.

El feed de sindicacion (sindicacion_643) proporciona los datos en formato Atom XML siguiendo la especificacion CODICE 2.07 (Componentes y Documentos Interoperables de Comercio Electronico). Cada entry del feed contiene un bloque ContractFolderStatus con toda la informacion estructurada del contrato.

Los archivos ZIP anuales contienen todos los ficheros .atom del ano, con un maximo de 500 entries por fichero, encadenados mediante links de paginacion. Se actualizan diariamente con los cambios del dia anterior.`,
    campos: [
      'ContractFolderID — Numero de expediente',
      'ContractFolderStatusCode — Estado (PUB, ADJ, RES, FOR, ANU...)',
      'LocatedContractingParty — Organo contratante (NIF, DIR3, nombre)',
      'ProcurementProject/Name — Objeto del contrato',
      'ProcurementProject/TypeCode — Tipo (1=Suministros, 2=Servicios, 3=Obras)',
      'BudgetAmount/TaxExclusiveAmount — Importe licitacion sin IVA',
      'BudgetAmount/TotalAmount — Importe licitacion con IVA',
      'TenderingProcess/ProcedureCode — Procedimiento (1=Abierto, 2=Restringido...)',
      'RealizedLocation/CountrySubentityCode — Codigo NUTS del lugar de ejecucion',
      'TenderResult/WinningParty — Adjudicatario (NIF, nombre)',
      'TenderResult/AwardedTenderedProject/PayableAmount — Importe adjudicacion',
      'TenderResult/AwardDate — Fecha de adjudicacion',
      'RequiredCommodityClassification/ItemClassificationCode — Codigo CPV',
    ],
    ejemplos: [
      {
        lenguaje: 'curl',
        titulo: 'Descargar ZIP anual',
        codigo: `# Descargar licitaciones de 2025
curl -sLk -o licitaciones_2025.zip \\
  "https://contrataciondelsectorpublico.gob.es/sindicacion/sindicacion_643/licitacionesPerfilesContratanteCompleto3_2025.zip"

# Descomprimir
unzip licitaciones_2025.zip -d licitaciones_2025/

# Ver primer fichero
head -100 licitaciones_2025/licitacionesPerfilesContratanteCompleto3.atom`,
      },
      {
        lenguaje: 'python',
        titulo: 'Parsear entries del feed Atom',
        codigo: `import zipfile
import xml.etree.ElementTree as ET

# Namespaces CODICE
NS = {
    'atom': 'http://www.w3.org/2005/Atom',
    'cbc': 'urn:dgpe:names:draft:codice:schema:xsd:CommonBasicComponents-2',
    'cac': 'urn:dgpe:names:draft:codice:schema:xsd:CommonAggregateComponents-2',
    'cac-ext': 'urn:dgpe:names:draft:codice-place-ext:schema:xsd:CommonAggregateComponents-2',
}

with zipfile.ZipFile('licitaciones_2025.zip') as zf:
    for name in zf.namelist():
        if not name.endswith('.atom'):
            continue
        tree = ET.parse(zf.open(name))
        root = tree.getroot()

        for entry in root.findall('atom:entry', NS):
            title = entry.findtext('atom:title', '', NS)
            updated = entry.findtext('atom:updated', '', NS)
            link = entry.find('atom:link', NS)
            url = link.get('href', '') if link is not None else ''

            # Datos del contrato (ContractFolderStatus)
            cfs = entry.find('.//{urn:dgpe:names:draft:codice-place-ext:schema:xsd:CommonAggregateComponents-2}ContractFolderStatus')
            if cfs is None:
                continue

            expediente = cfs.findtext('{urn:dgpe:names:draft:codice:schema:xsd:CommonBasicComponents-2}ContractFolderID', '')
            objeto = cfs.findtext('.//{urn:dgpe:names:draft:codice:schema:xsd:CommonBasicComponents-2}Name', '')

            print(f'{expediente}: {objeto[:80]}')`,
      },
      {
        lenguaje: 'php',
        titulo: 'Leer feed Atom con SimpleXML',
        codigo: `<?php
// Leer un fichero .atom del ZIP
$xml = simplexml_load_file('licitaciones_2025/licitacionesPerfilesContratanteCompleto3.atom');

// Registrar namespaces CODICE
$namespaces = [
    'cbc' => 'urn:dgpe:names:draft:codice:schema:xsd:CommonBasicComponents-2',
    'cac' => 'urn:dgpe:names:draft:codice:schema:xsd:CommonAggregateComponents-2',
    'cac-ext' => 'urn:dgpe:names:draft:codice-place-ext:schema:xsd:CommonAggregateComponents-2',
];

foreach ($xml->entry as $entry) {
    $title = (string) $entry->title;
    $link = (string) ($entry->link['href'] ?? '');
    $updated = (string) $entry->updated;

    // Buscar ContractFolderStatus
    $entry->registerXPathNamespace('cac-ext', $namespaces['cac-ext']);
    $entry->registerXPathNamespace('cbc', $namespaces['cbc']);

    $cfs = $entry->xpath('.//cac-ext:ContractFolderStatus');
    if (empty($cfs)) continue;

    $cfs[0]->registerXPathNamespace('cbc', $namespaces['cbc']);
    $expediente = (string) ($cfs[0]->xpath('cbc:ContractFolderID')[0] ?? '');

    echo "$expediente: $title\\n";
}`,
      },
    ],
    descargas: Array.from({ length: 15 }, (_, i) => {
      const year = 2012 + i
      return {
        nombre: `Licitaciones ${year}`,
        url: `https://contrataciondelsectorpublico.gob.es/sindicacion/sindicacion_643/licitacionesPerfilesContratanteCompleto3_${year}.zip`,
        formato: 'ZIP (Atom XML)',
        periodo: `${year}`,
      }
    }),
  },
  {
    id: 'placsp-menores',
    nombre: 'PLACSP — Contratos menores',
    descripcion: 'Contratos menores publicados a traves de los perfiles de contratante. Contratos de importe inferior a los umbrales de la LCSP.',
    tipo: 'nacional',
    entidad: 'Ministerio de Hacienda',
    url_portal: 'https://contrataciondelestado.es',
    url_datos: 'https://www.hacienda.gob.es/es-ES/GobiernoAbierto/Datos%20Abiertos/Paginas/ContratosMenores.aspx',
    formato: 'Atom XML (CODICE 2.07)',
    registros: '~2 millones',
    cobertura: '2018–actualidad',
    actualizacion: 'Diaria',
    licencia: 'Datos abiertos',
    descripcion_larga: `Los contratos menores son aquellos cuyo importe no supera los 40.000 euros (obras) o 15.000 euros (suministros y servicios), segun el articulo 118 de la Ley 9/2017, de Contratos del Sector Publico (LCSP). No requieren publicidad ni concurrencia competitiva.

Este feed (sindicacion_1143) tiene la misma estructura CODICE que el de licitaciones, pero contiene exclusivamente contratos menores. Disponible desde 2018.`,
    campos: [
      'ContractFolderID — Numero de expediente',
      'LocatedContractingParty — Organo contratante (NIF, nombre)',
      'ProcurementProject/Name — Objeto del contrato',
      'ProcurementProject/TypeCode — Tipo de contrato',
      'BudgetAmount/TaxExclusiveAmount — Importe sin IVA',
      'TenderResult/WinningParty — Adjudicatario',
      'TenderResult/PayableAmount — Importe adjudicacion',
    ],
    ejemplos: [
      {
        lenguaje: 'curl',
        titulo: 'Descargar contratos menores',
        codigo: `# Descargar menores de 2025
curl -sLk -o menores_2025.zip \\
  "https://contrataciondelsectorpublico.gob.es/sindicacion/sindicacion_1143/contratosMenoresPerfilesContratantes_2025.zip"`,
      },
    ],
    descargas: Array.from({ length: 9 }, (_, i) => {
      const year = 2018 + i
      return {
        nombre: `Menores ${year}`,
        url: `https://contrataciondelsectorpublico.gob.es/sindicacion/sindicacion_1143/contratosMenoresPerfilesContratantes_${year}.zip`,
        formato: 'ZIP (Atom XML)',
        periodo: `${year}`,
      }
    }),
  },
  {
    id: 'placsp-agregacion',
    nombre: 'PLACSP — Plataformas agregadas',
    descripcion: 'Licitaciones publicadas por entidades sin perfil propio en PLACSP, que agregan a traves de plataformas de comunidades autonomas, diputaciones y otros entes.',
    tipo: 'nacional',
    entidad: 'Ministerio de Hacienda',
    url_portal: 'https://contrataciondelestado.es',
    url_datos: 'https://www.hacienda.gob.es/es-ES/GobiernoAbierto/Datos%20Abiertos/Paginas/licitacionesagregacion.aspx',
    formato: 'Atom XML (CODICE 2.07)',
    registros: '~1,7 millones de entries',
    cobertura: '2016–actualidad',
    actualizacion: 'Diaria',
    licencia: 'Datos abiertos',
    descripcion_larga: `Este feed contiene licitaciones de entidades que no tienen perfil de contratante propio en PLACSP, sino que publican a traves de plataformas agregadas de comunidades autonomas, diputaciones y otros entes territoriales.

Incluye datos de Navarra, Baleares, municipios y entidades menores. Los IDs de expediente usan formato PREFIX_EXPEDIENTE donde el prefijo identifica la plataforma de origen. Las URLs de detalle pueden apuntar a portales regionales en vez de a contrataciondelestado.es.

Mismo formato CODICE XML que los demas feeds de PLACSP.`,
    descargas: Array.from({ length: 11 }, (_, i) => {
      const year = 2016 + i
      return {
        nombre: `Agregacion ${year}`,
        url: `https://contrataciondelsectorpublico.gob.es/sindicacion/sindicacion_1044/PlataformasAgregadasSinMenores_${year}.zip`,
        formato: 'ZIP (Atom XML)',
        periodo: `${year}`,
      }
    }),
  },
  {
    id: 'placsp-emp',
    nombre: 'PLACSP — Encargos a medios propios',
    descripcion: 'Encargos a medios propios personificados (empresas publicas, entes instrumentales). Regulados por art. 32-33 LCSP.',
    tipo: 'nacional',
    entidad: 'Ministerio de Hacienda',
    url_portal: 'https://contrataciondelestado.es',
    url_datos: 'https://www.hacienda.gob.es/es-ES/GobiernoAbierto/Datos%20Abiertos/Paginas/encargosmediospropios.aspx',
    formato: 'Atom XML (CODICE 2.07)',
    registros: '~15.000',
    cobertura: '2022–actualidad',
    actualizacion: 'Diaria',
    licencia: 'Datos abiertos',
    descripcion_larga: `Los encargos a medios propios personificados son una forma de contratacion directa regulada por los articulos 32 y 33 de la LCSP. Permiten a las administraciones encargar prestaciones directamente a entidades de su propio sector publico (empresas publicas, fundaciones, consorcios) sin licitacion competitiva.

Estos encargos tienen obligacion de publicidad desde 2021 y se publican en PLACSP con formato CODICE similar al de licitaciones.`,
    descargas: Array.from({ length: 5 }, (_, i) => {
      const year = 2022 + i
      return {
        nombre: `EMP ${year}`,
        url: `https://contrataciondelsectorpublico.gob.es/sindicacion/sindicacion_1383/EMP_SectorPublico_${year}.zip`,
        formato: 'ZIP (Atom XML)',
        periodo: `${year}`,
      }
    }),
  },
  {
    id: 'placsp-cpm',
    nombre: 'PLACSP — Consultas preliminares de mercado',
    descripcion: 'Consultas previas al mercado antes de definir pliegos. Fase exploratoria, no son contratos adjudicados.',
    tipo: 'nacional',
    entidad: 'Ministerio de Hacienda',
    url_portal: 'https://contrataciondelestado.es',
    url_datos: 'https://www.hacienda.gob.es/es-ES/GobiernoAbierto/Datos%20Abiertos/Paginas/consultaspreliminaresmercado.aspx',
    formato: 'Atom XML (CODICE 2.07)',
    registros: '~3.800',
    cobertura: '2022–actualidad',
    actualizacion: 'Diaria',
    licencia: 'Datos abiertos',
    descripcion_larga: `Las consultas preliminares de mercado (art. 115 LCSP) permiten a los organos contratantes realizar estudios y consultas al mercado antes de definir las condiciones de una futura licitacion. No son contratos ni licitaciones: son la fase previa de exploracion.

Utiles para empresas que quieran anticipar oportunidades de licitacion. Publicadas en PLACSP desde 2022 con formato XML propio (PreliminaryMarketConsultationStatus).`,
    descargas: Array.from({ length: 5 }, (_, i) => {
      const year = 2022 + i
      return {
        nombre: `CPM ${year}`,
        url: `https://contrataciondelsectorpublico.gob.es/sindicacion/sindicacion_1403/CPM_SectorPublico_${year}.zip`,
        formato: 'ZIP (Atom XML)',
        periodo: `${year}`,
      }
    }),
  },
  {
    id: 'bdns',
    nombre: 'BDNS — Base de Datos Nacional de Subvenciones',
    descripcion: 'Sistema Nacional de Publicidad de Subvenciones y Ayudas Publicas. Convocatorias, concesiones, planes estrategicos y grandes beneficiarios de todas las administraciones espanolas (AGE, CCAA, entidades locales, universidades). API REST publica sin autenticacion.',
    tipo: 'nacional',
    entidad: 'IGAE — Ministerio de Hacienda',
    url_portal: 'https://www.infosubvenciones.es/bdnstrans/GE/es/index',
    url_datos: 'https://www.infosubvenciones.es/bdnstrans/doc/swagger',
    formato: 'REST API (JSON)',
    registros: '~10,5M concesiones / ~350.000 convocatorias',
    cobertura: 'Desde 2016',
    actualizacion: 'Continua',
    licencia: 'Datos abiertos',
    descripcion_larga: `La Base de Datos Nacional de Subvenciones (BDNS) es el sistema oficial de publicidad de subvenciones y ayudas publicas en Espana, regulado por la Ley 38/2003 General de Subvenciones (tras la reforma de la Ley 15/2014). Gestionada por la Intervencion General de la Administracion del Estado (IGAE) del Ministerio de Hacienda y Funcion Publica, centraliza la informacion de todas las ayudas concedidas por la AGE, las comunidades autonomas, las entidades locales, las universidades publicas y demas entes del sector publico estatal.

El Sistema Nacional de Publicidad de Subvenciones y Ayudas Publicas (SNPSAP) expone esta informacion a traves de un portal ciudadano en infosubvenciones.es y de una API REST publica documentada con Swagger/OpenAPI. La API permite consultar convocatorias, concesiones individuales, planes estrategicos, listados de grandes beneficiarios y sanciones, con filtros por fecha, organo convocante, jerarquia territorial (nivel1/nivel2/nivel3), instrumento de la ayuda, CPV y otros criterios.

Desde la renovacion del portal por Hacienda, es posible descargar conjuntos de datos completos ademas de consultar la API en tiempo real. El acceso a los endpoints publicos no requiere registro ni clave de API.`,
    campos: [
      'codigoBDNS — Codigo unico de la convocatoria',
      'titulo / descripcion — Objeto de la convocatoria',
      'nivel1 / nivel2 / nivel3 — Jerarquia territorial del organo convocante',
      'organo — Organo que convoca la ayuda',
      'fechaRecepcion / fechaPublicacion — Fechas de tramitacion',
      'tiposBeneficiarios — Tipos de beneficiarios elegibles',
      'instrumentos — Instrumento (subvencion, prestamo, aval, entrega dineraria...)',
      'importeTotal — Importe maximo de la convocatoria',
      'descripcionFinalidad — Finalidad de la ayuda (sector/objetivo)',
      'convocatoriaBases — URL de las bases reguladoras',
      'beneficiario — NIF/CIF y nombre del beneficiario (en concesiones)',
      'importe — Importe concedido (en concesiones)',
      'ayudaEstado / ayudaDeMinimis — Clasificacion juridica de la ayuda',
    ],
    ejemplos: [
      {
        lenguaje: 'curl',
        titulo: 'Buscar convocatorias recientes',
        codigo: `# Documentacion Swagger de la API
open https://www.infosubvenciones.es/bdnstrans/doc/swagger

# Buscar convocatorias publicadas en 2025
curl -s "https://www.infosubvenciones.es/bdnstrans/api/convocatorias/busqueda?fechaDesde=01/01/2025&fechaHasta=31/12/2025&pageSize=50&page=0" \\
  -H "Accept: application/json" | python3 -m json.tool`,
      },
      {
        lenguaje: 'python',
        titulo: 'Paginar convocatorias con requests',
        codigo: `import requests

BASE = 'https://www.infosubvenciones.es/bdnstrans/api'
session = requests.Session()
session.headers.update({'Accept': 'application/json'})

page = 0
while True:
    resp = session.get(f'{BASE}/convocatorias/busqueda', params={
        'fechaDesde': '01/01/2025',
        'fechaHasta': '31/12/2025',
        'pageSize': 100,
        'page': page,
    })
    resp.raise_for_status()
    data = resp.json()
    items = data.get('content', [])
    if not items:
        break
    for c in items:
        print(c.get('codigoBDNS'), '-', (c.get('descripcion') or '')[:80])
    page += 1`,
      },
      {
        lenguaje: 'python',
        titulo: 'Descargar concesiones por NIF beneficiario',
        codigo: `import requests

BASE = 'https://www.infosubvenciones.es/bdnstrans/api'

# Concesiones de un NIF concreto en un rango de fechas
resp = requests.get(f'{BASE}/concesiones/busqueda', params={
    'numeroIdentificacion': 'B12345678',
    'fechaDesde': '01/01/2024',
    'fechaHasta': '31/12/2025',
    'pageSize': 200,
    'page': 0,
}, headers={'Accept': 'application/json'})

for c in resp.json().get('content', []):
    print(f"{c.get('fechaConcesion')} | {c.get('importe')} EUR | BDNS {c.get('codigoBDNS')}")`,
      },
    ],
  },
  {
    id: 'bquant',
    nombre: 'BQuant Finance — Dataset historico',
    descripcion: 'Dataset de 8,69 millones de registros historicos de licitaciones publicas recopilados y estructurados por BQuant Finance. Formato Parquet optimizado para analisis.',
    tipo: 'dataset',
    entidad: 'BQuant Finance',
    url_portal: 'https://bquant.io',
    url_datos: 'https://github.com/BquantFinance/licitaciones-espana',
    formato: 'Parquet',
    registros: '8,69 millones',
    cobertura: 'Historico',
    actualizacion: 'Periodica',
    licencia: 'Datos abiertos',
    descripcion_larga: `BQuant Finance ha recopilado y estructurado un dataset de 8,69 millones de registros de licitaciones publicas espanolas en formato Apache Parquet, optimizado para analisis con Python (pandas, polars) y herramientas de data science.

El repositorio en GitHub contiene el dataset completo con 48 campos por registro, incluyendo datos que no siempre estan disponibles en los feeds oficiales como el importe con IVA.`,
    campos: [
      'id — Identificador unico',
      'expediente — Numero de expediente',
      'objeto — Descripcion del contrato',
      'tipo_contrato — Suministros, Servicios, Obras...',
      'procedimiento — Abierto, Restringido, Negociado...',
      'importe_licitacion — Importe sin IVA',
      'importe_adj_con_iva — Importe adjudicacion con IVA',
      'nif_adjudicatario — NIF/CIF del adjudicatario',
      'nombre_adjudicatario — Nombre del adjudicatario',
      'nuts — Codigo NUTS del lugar de ejecucion',
      'cpv — Codigo CPV del objeto',
      'fecha_publicacion, fecha_adjudicacion, fecha_formalizacion',
    ],
    ejemplos: [
      {
        lenguaje: 'python',
        titulo: 'Cargar dataset con pandas',
        codigo: `import pandas as pd

# Descargar desde GitHub (o clonar el repo)
df = pd.read_parquet('licitaciones_espana.parquet')

print(f'Registros: {len(df):,}')
print(f'Columnas: {list(df.columns)}')

# Filtrar por CCAA (Andalucia = ES61)
andalucia = df[df['nuts'].str.startswith('ES61', na=False)]
print(f'Andalucia: {len(andalucia):,} contratos')

# Top 10 adjudicatarios por importe
top = df.groupby('nombre_adjudicatario')['importe_adj_con_iva'].sum()
print(top.sort_values(ascending=False).head(10))`,
      },
      {
        lenguaje: 'python',
        titulo: 'Analisis con polars (mas rapido)',
        codigo: `import polars as pl

df = pl.read_parquet('licitaciones_espana.parquet')

# Contratos por tipo
print(df.group_by('tipo_contrato').agg(
    pl.count().alias('n'),
    pl.col('importe_licitacion').sum().alias('importe_total')
).sort('n', descending=True))`,
      },
    ],
  },

  // === REGIONALES ===
  {
    id: 'cat',
    nombre: 'Generalitat de Catalunya — Contractacio Publica',
    descripcion: 'Portal de datos abiertos de la Generalitat de Catalunya con todos los contratos publicos catalanes. API Socrata con acceso libre y sin limites.',
    tipo: 'regional',
    entidad: 'Generalitat de Catalunya',
    url_portal: 'https://analisi.transparenciacatalunya.cat',
    url_datos: 'https://analisi.transparenciacatalunya.cat/Sector-P-blic/Contractaci-p-blica-de-la-Generalitat-de-Cataluny/ybgg-dgi6',
    formato: 'API Socrata (JSON/CSV)',
    registros: '~1,7 millones',
    cobertura: 'Desde 2010',
    actualizacion: 'Semanal',
    licencia: 'Datos abiertos Generalitat',
    descripcion_larga: `El portal de transparencia de la Generalitat de Catalunya ofrece acceso completo a todos los contratos publicos catalanes a traves de una API Socrata. Sin necesidad de registro ni API key, con paginacion automatica y soporte para filtros SoQL.

Es una de las fuentes regionales mas completas de Espana, con 1,7 millones de registros desde 2010.`,
    ejemplos: [
      {
        lenguaje: 'curl',
        titulo: 'Consultar API Socrata',
        codigo: `# Primeros 10 contratos
curl -s "https://analisi.transparenciacatalunya.cat/resource/ybgg-dgi6.json?\\$limit=10" | python3 -m json.tool

# Filtrar por ano
curl -s "https://analisi.transparenciacatalunya.cat/resource/ybgg-dgi6.json?\\$where=data_publicacio>'2025-01-01'&\\$limit=100"

# Contar registros totales
curl -s "https://analisi.transparenciacatalunya.cat/resource/ybgg-dgi6.json?\\$select=count(*)"`,
      },
      {
        lenguaje: 'python',
        titulo: 'Descargar datos con sodapy',
        codigo: `from sodapy import Socrata

client = Socrata("analisi.transparenciacatalunya.cat", None)

# Obtener 1000 registros
results = client.get("ybgg-dgi6", limit=1000)
print(f'{len(results)} contratos')

# Filtrar por tipo
servicios = client.get("ybgg-dgi6",
    where="tipus_contracte='Serveis'",
    limit=500)`,
      },
      {
        lenguaje: 'php',
        titulo: 'Consultar API con PHP',
        codigo: `<?php
// Sin autenticacion, acceso libre
$url = 'https://analisi.transparenciacatalunya.cat/resource/ybgg-dgi6.json';
$params = http_build_query([
    '$limit' => 100,
    '$where' => "data_publicacio > '2025-01-01'",
]);

$response = file_get_contents("$url?$params");
$contratos = json_decode($response, true);

foreach ($contratos as $c) {
    echo $c['codi_expedient'] . ': ' . $c['objecte_contracte'] . "\\n";
}`,
      },
    ],
  },
  {
    id: 'anda',
    nombre: 'Junta de Andalucia — Contratos menores',
    descripcion: 'Datos abiertos de contratos menores del sector publico andaluz. Portal CKAN con CSV anuales. Tambien disponible API ElasticSearch del portal PDC (857K expedientes).',
    tipo: 'regional',
    entidad: 'Junta de Andalucia',
    url_portal: 'https://www.juntadeandalucia.es/datosabiertos/portal/',
    url_datos: 'https://www.juntadeandalucia.es/datosabiertos/portal/dataset/contratos-menores',
    formato: 'CSV (pipe-delimited) + API ES',
    registros: '~693.000',
    cobertura: '2018–actualidad',
    actualizacion: 'Trimestral',
    licencia: 'CC BY 4.0',
    descripcion_larga: `La Junta de Andalucia publica los contratos menores de su administracion en el portal de datos abiertos, en formato CSV con delimitador pipe (|). Los ficheros son anuales y cubren desde 2018.

Adicionalmente, el portal PDC de la Junta tiene una API ElasticSearch con 857.000 expedientes que incluye datos adicionales como fechas de publicacion y IDs internos.`,
  },
  {
    id: 'eusk',
    nombre: 'Pais Vasco — Contratacion publica',
    descripcion: 'API REST del Gobierno Vasco con todos los contratos publicos de Euskadi. Acceso libre, paginacion automatica.',
    tipo: 'regional',
    entidad: 'Gobierno Vasco',
    url_portal: 'https://www.contratacion.euskadi.eus',
    url_datos: 'https://opendata.euskadi.eus/webopd00-apicontract/api/contracts',
    formato: 'API REST (JSON)',
    registros: '~530.000',
    cobertura: 'Desde 2014',
    actualizacion: 'Semanal',
    licencia: 'Datos abiertos Euskadi',
    descripcion_larga: `El Gobierno Vasco ofrece una API REST completa con todos los contratos publicos de Euskadi. Acceso libre sin autenticacion, con paginacion automatica y filtros por fecha, tipo de contrato y organo contratante.`,
    ejemplos: [
      {
        lenguaje: 'curl',
        titulo: 'Consultar API Euskadi',
        codigo: `# Primeros contratos (JSON)
curl -s "https://opendata.euskadi.eus/webopd00-apicontract/api/contracts?_page=1&_pageSize=10" | python3 -m json.tool`,
      },
      {
        lenguaje: 'python',
        titulo: 'Paginar resultados',
        codigo: `import requests

url = 'https://opendata.euskadi.eus/webopd00-apicontract/api/contracts'
page = 1

while True:
    resp = requests.get(url, params={'_page': page, '_pageSize': 100})
    data = resp.json()
    contracts = data.get('items', [])
    if not contracts:
        break
    for c in contracts:
        print(c.get('contractIdentifier'), c.get('contractObject', '')[:60])
    page += 1`,
      },
    ],
  },
  {
    id: 'val',
    nombre: 'Comunitat Valenciana — Contratacion',
    descripcion: 'Portal de datos abiertos de la Generalitat Valenciana con contratos publicos en formato CSV.',
    tipo: 'regional',
    entidad: 'Generalitat Valenciana',
    url_portal: 'https://dadesobertes.gva.es',
    formato: 'CSV',
    registros: '~165.000',
    cobertura: 'Desde 2016',
    actualizacion: 'Trimestral',
    licencia: 'Datos abiertos GVA',
  },
  {
    id: 'cyl',
    nombre: 'Castilla y Leon — Contratos',
    descripcion: 'Datos abiertos de contratos publicos de la Junta de Castilla y Leon.',
    tipo: 'regional',
    entidad: 'Junta de Castilla y Leon',
    url_portal: 'https://datosabiertos.jcyl.es',
    formato: 'CSV',
    registros: '~142.000',
    cobertura: 'Desde 2015',
    actualizacion: 'Trimestral',
    licencia: 'Datos abiertos JCyL',
  },
  {
    id: 'cyl-subvenciones',
    nombre: 'Castilla y Leon — Subvenciones concedidas',
    descripcion: 'Subvenciones registradas como concedidas en la BDNS por la administracion autonomica de Castilla y Leon. Publicadas en el portal de analisis de datos abiertos de la Junta con API Opendatasoft, CSV, JSON y Excel.',
    tipo: 'regional',
    entidad: 'Junta de Castilla y Leon',
    url_portal: 'https://analisis.datosabiertos.jcyl.es/explore/dataset/subvenciones-concedidas/information/',
    url_datos: 'https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets/subvenciones-concedidas/records',
    formato: 'CSV/JSON/XLS + API Opendatasoft',
    cobertura: 'Desde 2016',
    actualizacion: 'No programada',
    licencia: 'CC BY 4.0',
    descripcion_larga: `Dataset del portal de analisis de datos abiertos de la Junta de Castilla y Leon que expone las subvenciones concedidas por la administracion autonomica castellanoleonesa, tomando como origen la Base de Datos Nacional de Subvenciones (BDNS) gestionada por la IGAE del Ministerio de Hacienda.

Incluye dos magnitudes principales: el importe de concesion (cantidad comprometida en el momento del otorgamiento) y la ayuda equivalente (importe tras descontar cargas fiscales; en el caso de subvenciones suele coincidir con el importe de concesion). El portal utiliza el motor Opendatasoft, que expone una API REST documentada con endpoints de consulta, exportacion y agregacion, ademas de descargas directas en CSV, JSON y Excel.

El dataset excluye convocatorias con mas de 10.000 registros por limitaciones de exportacion de la propia BDNS. La actualizacion no sigue un calendario programado. Esta publicacion cumple con lo previsto en el Real Decreto 130/2019 sobre publicidad de subvenciones y ayudas publicas.`,
    ejemplos: [
      {
        lenguaje: 'curl',
        titulo: 'Consultar API Opendatasoft',
        codigo: `# Primeros 20 registros en JSON
curl -s "https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets/subvenciones-concedidas/records?limit=20" | python3 -m json.tool

# Descargar dataset completo en CSV
curl -sL -o subvenciones_cyl.csv \\
  "https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets/subvenciones-concedidas/exports/csv"

# Agregado: importe total por ano de concesion
curl -s "https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets/subvenciones-concedidas/records?select=year(fecha_de_la_concesion)%20as%20anio,sum(importe)%20as%20total&group_by=anio&order_by=anio"`,
      },
      {
        lenguaje: 'python',
        titulo: 'Paginar con requests',
        codigo: `import requests

BASE = 'https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets/subvenciones-concedidas/records'

offset = 0
while True:
    resp = requests.get(BASE, params={'limit': 100, 'offset': offset})
    resp.raise_for_status()
    results = resp.json().get('results', [])
    if not results:
        break
    for r in results:
        print(r.get('fecha_de_la_concesion'), r.get('beneficiario'), r.get('importe'))
    offset += 100`,
      },
    ],
  },
  {
    id: 'clm-subvenciones',
    nombre: 'Castilla-La Mancha — Subvenciones concedidas',
    descripcion: 'Base de datos publica de subvenciones concedidas por la Junta de Comunidades de Castilla-La Mancha y su sector publico vinculado, con buscador avanzado y exportacion directa en CSV y XLS. Fuente: Intervencion General de la JCCM.',
    tipo: 'regional',
    entidad: 'Junta de Comunidades de Castilla-La Mancha',
    url_portal: 'https://datosabiertos.castillalamancha.es/dataset/base-de-datos-de-subvenciones-de-castilla-la-mancha',
    url_datos: 'http://concesiones.castillalamancha.es/Concesion.php',
    formato: 'CSV / XLS (buscador web)',
    cobertura: 'Desde 2014',
    actualizacion: 'Continua',
    licencia: 'Datos abiertos JCCM',
    descripcion_larga: `Base de datos oficial de subvenciones y ayudas concedidas por la Administracion de la Junta de Comunidades de Castilla-La Mancha y su sector publico vinculado o dependiente. La fuente de los datos es la Intervencion General de la JCCM. El dataset se publica en el portal de datos abiertos de Castilla-La Mancha y se accede a traves de una aplicacion web de consulta en concesiones.castillalamancha.es.

El buscador permite filtrar por convocatoria, finalidad, organismo responsable, rango de fechas de concesion, beneficiario (nombre o NIF/CIF), tipo de subvencion (convocatoria o directa), tipo de beneficiario (personas fisicas, empresas, PYMES) y rangos de importe. Para cada concesion se muestra el estado (pagado, justificado, reintegros). Los resultados pueden exportarse directamente como listado CSV o XLS.

La cobertura temporal arranca el 1 de enero de 2014. No se publican subvenciones cuando ello pudiera vulnerar derechos al honor, la intimidad o la privacidad conforme a la Ley Organica 1/1982.`,
    ejemplos: [
      {
        lenguaje: 'curl',
        titulo: 'Pagina de busqueda y exportacion',
        codigo: `# La descarga se realiza desde la UI web tras aplicar filtros.
# Abre la aplicacion de consulta:
open "http://concesiones.castillalamancha.es/Concesion.php"

# Tras filtrar (por ejemplo, fechas 2024-2025 y tipo "Convocatoria"),
# pulsa "Listado CSV" o "Listado XLS" para descargar el conjunto filtrado.`,
      },
    ],
  },
  {
    id: 'can',
    nombre: 'Canarias — Contratacion',
    descripcion: 'Datos abiertos de contratos del Gobierno de Canarias.',
    tipo: 'regional',
    entidad: 'Gobierno de Canarias',
    url_portal: 'https://datos.canarias.es',
    formato: 'CSV',
    registros: '~81.000',
    cobertura: 'Desde 2017',
    actualizacion: 'Mensual',
    licencia: 'Datos abiertos Canarias',
  },
  {
    id: 'ara',
    nombre: 'Aragon — Contratacion',
    descripcion: 'Portal de contratacion del Gobierno de Aragon con datos abiertos en CSV.',
    tipo: 'regional',
    entidad: 'Gobierno de Aragon',
    url_portal: 'https://serviciosciudadano.aragon.es',
    formato: 'CSV',
    registros: '~46.000',
    cobertura: 'Desde 2018',
    actualizacion: 'Trimestral',
    licencia: 'Datos abiertos Aragon',
  },
  {
    id: 'ast',
    nombre: 'Asturias — Contratacion centralizada',
    descripcion: 'Datos CSV del Principado de Asturias con contratacion centralizada.',
    tipo: 'regional',
    entidad: 'Principado de Asturias',
    url_portal: 'https://miprincipado.asturias.es/perfil-contratante',
    formato: 'CSV',
    registros: '~375.000',
    cobertura: '2019–2024',
    actualizacion: 'Trimestral',
    licencia: 'Datos abiertos Asturias',
  },
  {
    id: 'mad',
    nombre: 'Comunidad de Madrid — Contratacion',
    descripcion: 'Feed Atom de licitaciones de la Comunidad de Madrid.',
    tipo: 'regional',
    entidad: 'Comunidad de Madrid',
    url_portal: 'https://contratos-publicos.comunidad.madrid',
    url_datos: 'https://contratos-publicos.comunidad.madrid/feed/licitaciones2',
    formato: 'Atom XML',
    registros: '~1.400',
    cobertura: 'Desde 2023',
    actualizacion: 'Diaria',
    licencia: 'Datos abiertos Madrid',
  },
]
