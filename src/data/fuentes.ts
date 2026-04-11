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
  {
    id: 'cat-subvenciones',
    nombre: 'Catalunya — RAISC (Concesiones y convocatorias)',
    descripcion: 'Registre d\'Ajuts i Subvencions de Catalunya (RAISC) de la Generalitat. Dos datasets Socrata con >21 millones de concesiones y 64.000 convocatorias de la Generalitat, diputaciones y ayuntamientos catalanes. La fuente mas rica de subvenciones de toda Espana.',
    tipo: 'regional',
    entidad: 'Generalitat de Catalunya',
    url_portal: 'https://analisi.transparenciacatalunya.cat/Economia/Concessions-del-RAISC-Registre-de-subvencions-i-aj/s9xt-n979',
    url_datos: 'https://analisi.transparenciacatalunya.cat/resource/s9xt-n979.json',
    formato: 'API Socrata (JSON/CSV/XML + SoQL)',
    registros: '~21,1 millones concesiones / ~64.000 convocatorias',
    cobertura: 'Desde noviembre 2018',
    actualizacion: 'Continua',
    licencia: 'CC BY (datos abiertos Generalitat)',
    descripcion_larga: `El Registre d'Ajuts i Subvencions de Catalunya (RAISC) es el registro oficial de subvenciones y ayudas publicas de Catalunya, gestionado por la Generalitat y publicado como dos datasets Socrata en el portal de transparencia de la Generalitat. Contiene datos de la Generalitat, las cuatro diputaciones provinciales (Barcelona, Girona, Lleida, Tarragona) y los ayuntamientos catalanes.

El dataset de **concesiones** (s9xt-n979) supera los 21 millones de registros — es con diferencia la mayor fuente regional de subvenciones de Espana. El dataset de **convocatorias** (khxn-nv6a) tiene alrededor de 64.000 entradas. Ambos estan accesibles a traves de la API Socrata estandar, que soporta filtros SoQL (select, where, group_by, order_by), paginacion con $limit/$offset y exportacion en JSON, CSV y XML. No requiere autenticacion ni API key.

Como fuente, es un superconjunto del BDNS para el ambito catalan: incluye mas ayuntamientos y un historico mas detallado que lo que expone la BDNS nacional filtrada por Catalunya.`,
    campos: [
      'id_concessio — Identificador unico de la concesion',
      'id_convocatoria — Identificador de la convocatoria asociada',
      'organ — Organo concedente',
      'beneficiari — Nombre del beneficiario',
      'nif_beneficiari — NIF/CIF del beneficiario',
      'tipus_beneficiari — Tipo (persona fisica, empresa, entidad sin animo de lucro, etc.)',
      'import_concedit — Importe concedido (EUR)',
      'data_concessio — Fecha de concesion',
      'instrument — Instrumento (subvencion, prestamo, etc.)',
      'finalitat — Finalidad de la ayuda',
      'sector — Sector tematico',
    ],
    ejemplos: [
      {
        lenguaje: 'curl',
        titulo: 'Consultar API Socrata (RAISC)',
        codigo: `# Contar concesiones totales
curl -s "https://analisi.transparenciacatalunya.cat/resource/s9xt-n979.json?\\$select=count(*)"

# Primeras 10 concesiones
curl -s "https://analisi.transparenciacatalunya.cat/resource/s9xt-n979.json?\\$limit=10" | python3 -m json.tool

# Top 20 beneficiarios por importe total
curl -s "https://analisi.transparenciacatalunya.cat/resource/s9xt-n979.json?\\$select=beneficiari,sum(import_concedit)%20as%20total&\\$group=beneficiari&\\$order=total%20DESC&\\$limit=20"

# Convocatorias del dataset secundario
curl -s "https://analisi.transparenciacatalunya.cat/resource/khxn-nv6a.json?\\$limit=10" | python3 -m json.tool`,
      },
      {
        lenguaje: 'python',
        titulo: 'Paginar con sodapy',
        codigo: `from sodapy import Socrata

client = Socrata("analisi.transparenciacatalunya.cat", None)

# Concesiones filtradas por fecha
offset = 0
while True:
    batch = client.get("s9xt-n979",
        where="data_concessio > '2025-01-01'",
        limit=2000,
        offset=offset)
    if not batch:
        break
    for r in batch:
        print(r.get('data_concessio'), r.get('beneficiari'), r.get('import_concedit'))
    offset += 2000`,
      },
      {
        lenguaje: 'python',
        titulo: 'Agregado con polars',
        codigo: `import polars as pl
import requests

# Agregado por organo concedente (top 50)
url = 'https://analisi.transparenciacatalunya.cat/resource/s9xt-n979.json'
params = {
    '$select': 'organ,count(*) as n,sum(import_concedit) as total',
    '$group': 'organ',
    '$order': 'total DESC',
    '$limit': 50,
}
data = requests.get(url, params=params).json()
df = pl.DataFrame(data)
print(df)`,
      },
    ],
  },
  {
    id: 'anda-subvenciones',
    nombre: 'Andalucia — Subvenciones otorgadas',
    descripcion: 'API REST oficial de la Junta de Andalucia con todas las subvenciones otorgadas por la administracion andaluza. Endpoint propio con OpenAPI, descarga integral en JSON o CSV, actualizacion diaria y licencia CC BY 4.0.',
    tipo: 'regional',
    entidad: 'Junta de Andalucia',
    url_portal: 'https://www.juntadeandalucia.es/datosabiertos/portal/dataset/subvenciones-otorgadas-por-la-junta-de-andalucia',
    url_datos: 'https://datos.juntadeandalucia.es/api/v0/subventions/all?format=json',
    formato: 'API REST (JSON/CSV) + OpenAPI',
    cobertura: 'Actualizacion diaria',
    actualizacion: 'Diaria',
    licencia: 'CC BY 4.0',
    descripcion_larga: `Dataset oficial de la Junta de Andalucia con todas las subvenciones otorgadas por la administracion autonomica andaluza. Publicado por la Consejeria de Economia, Hacienda, Fondos Europeos y Dialogo Social. La actualizacion es diaria y la licencia es CC BY 4.0.

A diferencia de otras fuentes regionales que solo ofrecen descarga de CSV o mirror de BDNS, Andalucia expone una API REST propia con OpenAPI documentado (/api/v0/subventions/openapi.json). El endpoint /all?format=json devuelve el dataset completo como JSON (en torno a 38 MB) y /all?format=csv lo entrega como CSV. La API esta alojada en el subdominio datos.juntadeandalucia.es y redirige a ficheros generados en festa.juntadeandalucia.es (Portal Andaluz de Datos Abiertos).`,
    ejemplos: [
      {
        lenguaje: 'curl',
        titulo: 'Descargar dataset completo',
        codigo: `# Descarga JSON completa (~38 MB)
curl -sL -o subvenciones_andalucia.json \\
  "https://datos.juntadeandalucia.es/api/v0/subventions/all?format=json"

# O en CSV
curl -sL -o subvenciones_andalucia.csv \\
  "https://datos.juntadeandalucia.es/api/v0/subventions/all?format=csv"

# Inspeccionar OpenAPI spec
curl -s "https://datos.juntadeandalucia.es/api/v0/subventions/openapi.json" | python3 -m json.tool | head -40`,
      },
      {
        lenguaje: 'python',
        titulo: 'Cargar dataset con pandas',
        codigo: `import pandas as pd

df = pd.read_json('https://datos.juntadeandalucia.es/api/v0/subventions/all?format=json')
print(f'Registros: {len(df):,}')
print(df.columns.tolist())
print(df.head())

# Top beneficiarios por importe
top = df.groupby('nombre_beneficiario')['importe'].sum().sort_values(ascending=False).head(20)
print(top)`,
      },
    ],
  },
  {
    id: 'eusk-subvenciones',
    nombre: 'Pais Vasco — Ayudas concedidas (Euskadi)',
    descripcion: 'Open Data Euskadi — dataset unificado de ayudas y subvenciones concedidas por el Gobierno Vasco, las tres diputaciones forales y los ayuntamientos adheridos. Alimentado desde BDNS, disponible en JSON descargable.',
    tipo: 'regional',
    entidad: 'Gobierno Vasco',
    url_portal: 'https://opendata.euskadi.eus/webopd00-dataset/es/contenidos/ds_ayudas_subvenciones/ayudas_concedidas_euskadi_bdns/es_def/index.shtml',
    url_datos: 'https://opendata.euskadi.eus/contenidos/ds_ayudas_subvenciones/ayudas_concedidas_euskadi_bdns/opendata/ayudas_concedidas_euskadi.json',
    formato: 'JSON (descarga directa)',
    cobertura: 'Desde 2018',
    actualizacion: 'Periodica (alimentada desde BDNS)',
    licencia: 'Datos abiertos Euskadi',
    descripcion_larga: `Dataset de Open Data Euskadi que unifica las ayudas y subvenciones concedidas por el Gobierno Vasco, las tres diputaciones forales (Araba, Bizkaia, Gipuzkoa) y los ayuntamientos adheridos. La fuente es la Base de Datos Nacional de Subvenciones (BDNS) filtrada al ambito de Euskadi, reestructurada y republicada por el portal vasco.

Ademas del JSON unificado, el portal ofrece series temporales anuales (2018-2025), un dataset de "ultimos 90 dias" y, en algunos casos, datasets especificos por entidad (como el Ayuntamiento de Bilbao). Open Data Euskadi es uno de los portales mas maduros de Espana, con API REST general documentada en opendata.euskadi.eus/apis/.`,
    ejemplos: [
      {
        lenguaje: 'curl',
        titulo: 'Descargar JSON unificado',
        codigo: `# Descargar dataset unificado
curl -sL -o ayudas_euskadi.json \\
  "https://opendata.euskadi.eus/contenidos/ds_ayudas_subvenciones/ayudas_concedidas_euskadi_bdns/opendata/ayudas_concedidas_euskadi.json"

# Ver cuantos registros trae
python3 -c "import json; print(len(json.load(open('ayudas_euskadi.json'))))"`,
      },
      {
        lenguaje: 'python',
        titulo: 'Analisis con pandas',
        codigo: `import pandas as pd
import requests

url = 'https://opendata.euskadi.eus/contenidos/ds_ayudas_subvenciones/ayudas_concedidas_euskadi_bdns/opendata/ayudas_concedidas_euskadi.json'
df = pd.DataFrame(requests.get(url).json())

print(f'Registros: {len(df):,}')
print(df.dtypes)

# Top organos concedentes
print(df.groupby('organo_concedente')['importe'].sum().sort_values(ascending=False).head(15))`,
      },
    ],
  },
  {
    id: 'val-subvenciones',
    nombre: 'Comunitat Valenciana — Ayudas y subvenciones GVA',
    descripcion: 'Dataset CKAN de la Generalitat Valenciana con las ayudas y subvenciones concedidas por la GVA. Publicadas por ano como datasets independientes (eco-gvo-subv-YYYY) desde 2019, descargables en CSV, JSON y XML.',
    tipo: 'regional',
    entidad: 'Generalitat Valenciana',
    url_portal: 'https://dadesobertes.gva.es/es/dataset/eco-gvo-subv-2025',
    url_datos: 'https://dadesobertes.gva.es/es/api/3/action/package_show?id=eco-gvo-subv-2025',
    formato: 'CSV/JSON/XML (CKAN multi-ano)',
    cobertura: 'Desde 2019 (un dataset por ano)',
    actualizacion: 'Continua (los ultimos 2 meses no son definitivos)',
    licencia: 'CC BY',
    descripcion_larga: `La Generalitat Valenciana publica las ayudas y subvenciones concedidas por la GVA en el portal dadesobertes.gva.es como una serie de datasets anuales independientes: eco-gvo-subv-2019, eco-gvo-subv-2020, ..., eco-gvo-subv-2025. Cada dataset tiene sus propios recursos (CSV, JSON, XML) y se gestiona sobre CKAN, con API REST estandar en /api/3/action/.

Las notas del portal aclaran dos cuestiones importantes: (1) los ultimos 2 meses no son definitivos porque los datos se consolidan a posteriori; (2) los datasets se mantienen 4 anos tras la concesion. Existen ademas datasets especificos para casos concretos como las ayudas DANA (eco-ayudas-dana) y los pagos medios a beneficiarios (eco-pmp-subvenciones).`,
    ejemplos: [
      {
        lenguaje: 'curl',
        titulo: 'Listar recursos del dataset anual',
        codigo: `# Metadatos del dataset 2025 via CKAN API
curl -s "https://dadesobertes.gva.es/es/api/3/action/package_show?id=eco-gvo-subv-2025" \\
  | python3 -m json.tool | head -50

# Listar todos los datasets de subvenciones GVA
curl -s "https://dadesobertes.gva.es/es/api/3/action/package_search?q=eco-gvo-subv&rows=20" \\
  | python3 -c "import json, sys; d=json.load(sys.stdin); print('\\n'.join(r['name'] for r in d['result']['results']))"`,
      },
      {
        lenguaje: 'python',
        titulo: 'Iterar todos los anos',
        codigo: `import requests

API = 'https://dadesobertes.gva.es/es/api/3/action'

for year in range(2019, 2026):
    pkg = requests.get(f'{API}/package_show', params={'id': f'eco-gvo-subv-{year}'}).json()
    if not pkg.get('success'):
        continue
    for res in pkg['result']['resources']:
        if res['format'].upper() == 'CSV':
            print(f"{year}: {res['url']}")`,
      },
    ],
  },
  {
    id: 'ast-subvenciones',
    nombre: 'Asturias — Subvenciones y ayudas del Principado',
    descripcion: 'CSVs directos del Principado de Asturias con subvenciones concedidas (2016-2023 historico + 2024 en adelante) y convocatorias. Publicacion estable en descargas.asturias.es con licencia CC BY 4.0.',
    tipo: 'regional',
    entidad: 'Principado de Asturias',
    url_portal: 'https://datos.gob.es/es/catalogo/a03002951-subvenciones-y-ayudas-del-principado-de-asturias',
    url_datos: 'https://descargas.asturias.es/asturias/opendata/SectorPublico/subvenciones/concesiones-subvs-2024-.csv',
    formato: 'CSV (descarga directa)',
    cobertura: 'Desde 2016',
    actualizacion: 'Trimestral/anual',
    licencia: 'CC BY 4.0',
    descripcion_larga: `El Principado de Asturias publica las subvenciones y ayudas concedidas por su administracion como CSVs directos en descargas.asturias.es. Hay dos ficheros principales de concesiones (uno historico 2016-2023 y otro 2024 en adelante) y un fichero de convocatorias. Los enlaces son estables y no requieren autenticacion.

Se federa en datos.gob.es con el identificador a03002951. La licencia es CC BY 4.0 y la actualizacion sigue un calendario trimestral/anual.`,
    ejemplos: [
      {
        lenguaje: 'curl',
        titulo: 'Descargar CSVs directos',
        codigo: `# Concesiones historicas 2016-2023
curl -sL -o asturias_subv_2016_2023.csv \\
  "https://descargas.asturias.es/asturias/opendata/SectorPublico/subvenciones/concesiones-subvs-2016-2023.csv"

# Concesiones 2024 en adelante (se actualiza)
curl -sL -o asturias_subv_2024.csv \\
  "https://descargas.asturias.es/asturias/opendata/SectorPublico/subvenciones/concesiones-subvs-2024-.csv"

# Convocatorias
curl -sL -o asturias_convocatorias.csv \\
  "https://descargas.asturias.es/asturias/opendata/SectorPublico/subvenciones/convocatorias-subvs.csv"`,
      },
      {
        lenguaje: 'python',
        titulo: 'Cargar y unir historico + actual con pandas',
        codigo: `import pandas as pd

BASE = 'https://descargas.asturias.es/asturias/opendata/SectorPublico/subvenciones'

hist = pd.read_csv(f'{BASE}/concesiones-subvs-2016-2023.csv', sep=';', encoding='utf-8')
nuevo = pd.read_csv(f'{BASE}/concesiones-subvs-2024-.csv', sep=';', encoding='utf-8')

df = pd.concat([hist, nuevo], ignore_index=True)
print(f'Registros totales: {len(df):,}')
print(df.columns.tolist())`,
      },
    ],
  },
  {
    id: 'can-subvenciones',
    nombre: 'Canarias — Subvenciones, premios y becas',
    descripcion: 'Dataset CSV del Gobierno de Canarias con subvenciones, premios y becas gestionados electronicamente. Actualizacion mensual con un dataset activo y otro historico, ambos descarga directa en datos.canarias.es.',
    tipo: 'regional',
    entidad: 'Gobierno de Canarias',
    url_portal: 'https://datos.canarias.es/catalogos/general/dataset/subvenciones-premios-y-becas-del-gobierno-de-canarias',
    url_datos: 'https://datos.canarias.es/catalogos/general/dataset/0dba6b65-e377-4a3a-855c-5c35b9a2b3d6/resource/f988d0ba-9bc5-4d4a-93ec-cf567f971d34/download/subvenciones_premios_becas.csv',
    formato: 'CSV (descarga directa)',
    cobertura: 'Desde diciembre 2020',
    actualizacion: 'Mensual',
    licencia: 'Aviso legal Gobierno de Canarias',
    descripcion_larga: `El Gobierno de Canarias publica mensualmente un dataset con todas las subvenciones, premios y becas que concede a traves de tramites electronicos. El portal datos.canarias.es ofrece dos datasets complementarios: uno "actual" con los datos vigentes y otro "historico" con snapshots mensuales.

Junto al CSV principal se publica un diccionario de datos con las claves especiales (_U para "desconocido" y _Z para "no aplica") que pueden aparecer en los valores. El dataset cubre solo trámites electronicos gestionados por la administracion autonomica, no los cabildos insulares.`,
    ejemplos: [
      {
        lenguaje: 'curl',
        titulo: 'Descarga del CSV actual',
        codigo: `# Dataset actual (vigente)
curl -sL -o canarias_subv.csv \\
  "https://datos.canarias.es/catalogos/general/dataset/0dba6b65-e377-4a3a-855c-5c35b9a2b3d6/resource/f988d0ba-9bc5-4d4a-93ec-cf567f971d34/download/subvenciones_premios_becas.csv"

# Diccionario de campos
curl -sL -o canarias_diccionario.csv \\
  "https://datos.canarias.es/catalogos/general/dataset/0dba6b65-e377-4a3a-855c-5c35b9a2b3d6/resource/c4c6cbd9-3f3b-4bb0-8279-5cfcfa69cc2e/download/diccionario_datos_subvenciones_premios_y_becas_del_gobierno_de_canarias.csv"`,
      },
      {
        lenguaje: 'python',
        titulo: 'Cargar CSV con pandas',
        codigo: `import pandas as pd

url = 'https://datos.canarias.es/catalogos/general/dataset/0dba6b65-e377-4a3a-855c-5c35b9a2b3d6/resource/f988d0ba-9bc5-4d4a-93ec-cf567f971d34/download/subvenciones_premios_becas.csv'

# Canarias suele usar ; como separador
df = pd.read_csv(url, sep=';', encoding='utf-8', na_values=['_U', '_Z'])
print(f'Registros: {len(df):,}')
print(df.head())`,
      },
    ],
  },
  {
    id: 'bal-subvenciones',
    nombre: 'Illes Balears — Concesiones de subvenciones',
    descripcion: 'Dataset bilingue del Govern de les Illes Balears con las concesiones de subvenciones de la CAIB. CSVs directos en catalan y castellano, alimentados desde BDNS y actualizados trimestralmente.',
    tipo: 'regional',
    entidad: 'Govern de les Illes Balears',
    url_portal: 'https://intranet.caib.es/opendatacataleg/dataset/fcdd06a9-bb2e-4b5b-bf3b-a3d48d208e6e',
    url_datos: 'https://intranet.caib.es/opendatacataleg/dataset/fcdd06a9-bb2e-4b5b-bf3b-a3d48d208e6e/resource/31c679b8-e09d-4260-8573-f825fbe683a8/download/concessions_subvencions_es.csv',
    formato: 'CSV bilingue (ca/es)',
    cobertura: 'Se mantienen 4 anos tras la concesion',
    actualizacion: 'Trimestral',
    licencia: 'CC BY',
    descripcion_larga: `Dataset oficial del Govern de les Illes Balears con todas las concesiones de subvenciones de la Comunitat Autonoma. Publicado por la Direccion General de Coordinacion y Transparencia, es un mirror estructurado de los datos de Baleares en la BDNS. El dataset esta disponible en dos idiomas (catalan y castellano) como CSVs independientes.

El alojamiento esta en intranet.caib.es/opendatacataleg/ (a pesar del nombre "intranet", es publico y sin autenticacion), y se accede tambien desde catalegdades.caib.cat que hace redireccion. La retencion de datos es de 4 anos tras la concesion conforme a la normativa de proteccion de datos.`,
    ejemplos: [
      {
        lenguaje: 'curl',
        titulo: 'Descargar CSVs bilingues',
        codigo: `# Version castellana
curl -sL -o baleares_subv_es.csv \\
  "https://intranet.caib.es/opendatacataleg/dataset/fcdd06a9-bb2e-4b5b-bf3b-a3d48d208e6e/resource/31c679b8-e09d-4260-8573-f825fbe683a8/download/concessions_subvencions_es.csv"

# Version catalana
curl -sL -o baleares_subv_ca.csv \\
  "https://intranet.caib.es/opendatacataleg/dataset/fcdd06a9-bb2e-4b5b-bf3b-a3d48d208e6e/resource/3b7c5819-57ec-47fe-8594-d3a0a1985e49/download/concessions_subvencions_ca.csv"`,
      },
      {
        lenguaje: 'python',
        titulo: 'Cargar CSV con pandas',
        codigo: `import pandas as pd

url = 'https://intranet.caib.es/opendatacataleg/dataset/fcdd06a9-bb2e-4b5b-bf3b-a3d48d208e6e/resource/31c679b8-e09d-4260-8573-f825fbe683a8/download/concessions_subvencions_es.csv'

# Baleares suele usar ; como separador; probar ambos si falla
try:
    df = pd.read_csv(url, sep=';', encoding='utf-8')
except Exception:
    df = pd.read_csv(url, sep=',', encoding='utf-8')

print(f'Registros: {len(df):,}')
print(df.columns.tolist())`,
      },
    ],
  },
]
