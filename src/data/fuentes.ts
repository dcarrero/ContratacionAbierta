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
}

export interface Descarga {
  nombre: string
  url: string
  formato: string
  tamaño?: string
  periodo?: string
}

export const fuentes: Fuente[] = [
  // === NACIONALES ===
  {
    id: 'placsp-licitaciones',
    nombre: 'PLACSP — Licitaciones por contratante',
    descripcion: 'Feed principal de licitaciones publicadas por los perfiles de contratante en la Plataforma de Contratación del Sector Público. Incluye todas las administraciones con perfil propio.',
    tipo: 'nacional',
    entidad: 'Ministerio de Hacienda',
    url_portal: 'https://contrataciondelestado.es',
    url_datos: 'https://www.hacienda.gob.es/es-ES/GobiernoAbierto/Datos%20Abiertos/Paginas/licitaciones_plataforma_contratacion.aspx',
    formato: 'Atom XML (CODICE 2.07)',
    registros: '~4 millones',
    cobertura: '2012–actualidad',
    actualizacion: 'Diaria',
    licencia: 'Datos abiertos',
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
    descripcion: 'Contratos menores publicados a través de los perfiles de contratante. Contratos de importe inferior a los umbrales de la LCSP.',
    tipo: 'nacional',
    entidad: 'Ministerio de Hacienda',
    url_portal: 'https://contrataciondelestado.es',
    url_datos: 'https://www.hacienda.gob.es/es-ES/GobiernoAbierto/Datos%20Abiertos/Paginas/ContratosMenores.aspx',
    formato: 'Atom XML (CODICE 2.07)',
    registros: '~2 millones',
    cobertura: '2018–actualidad',
    actualizacion: 'Diaria',
    licencia: 'Datos abiertos',
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
    descripcion: 'Licitaciones publicadas por entidades sin perfil propio en PLACSP, que agregan a través de plataformas de comunidades autónomas, diputaciones y otros entes. Incluye Navarra, Baleares, municipios y más.',
    tipo: 'nacional',
    entidad: 'Ministerio de Hacienda',
    url_portal: 'https://contrataciondelestado.es',
    url_datos: 'https://www.hacienda.gob.es/es-ES/GobiernoAbierto/Datos%20Abiertos/Paginas/licitacionesagregacion.aspx',
    formato: 'Atom XML (CODICE 2.07)',
    registros: '~1,7 millones de entries',
    cobertura: '2016–actualidad',
    actualizacion: 'Diaria',
    licencia: 'Datos abiertos',
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
    descripcion: 'Encargos a medios propios personificados (empresas publicas, entes instrumentales). Regulados por art. 32-33 LCSP. No son licitaciones competitivas.',
    tipo: 'nacional',
    entidad: 'Ministerio de Hacienda',
    url_portal: 'https://contrataciondelestado.es',
    url_datos: 'https://www.hacienda.gob.es/es-ES/GobiernoAbierto/Datos%20Abiertos/Paginas/encargosmediospropios.aspx',
    formato: 'Atom XML (CODICE 2.07)',
    registros: '~15.000',
    cobertura: '2022–actualidad',
    actualizacion: 'Diaria',
    licencia: 'Datos abiertos',
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
    descripcion: 'Consultas previas al mercado antes de definir pliegos. Fase exploratoria, no son contratos adjudicados. Util para anticipar futuras licitaciones.',
    tipo: 'nacional',
    entidad: 'Ministerio de Hacienda',
    url_portal: 'https://contrataciondelestado.es',
    url_datos: 'https://www.hacienda.gob.es/es-ES/GobiernoAbierto/Datos%20Abiertos/Paginas/consultaspreliminaresmercado.aspx',
    formato: 'Atom XML (CODICE 2.07)',
    registros: '~3.800',
    cobertura: '2022–actualidad',
    actualizacion: 'Diaria',
    licencia: 'Datos abiertos',
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
