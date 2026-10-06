import { KnowledgeDocument, KnowledgeStats } from '../models/knowledge.model';

export const INITIAL_KNOWLEDGE_DOCS_MOCK: KnowledgeDocument[] = [
  {
    id: 'kdoc-1',
    title: 'Contrato_Marco_Operaciones.pdf',
    category: 'Legal',
    fileSize: '3.8 MB',
    totalPages: 18,
    chunksCount: 42,
    embeddingModel: 'text-embedding-004',
    dimension: 768,
    avgSimilarity: 0.984,
    status: 'indexed',
    lastUpdated: 'Hoy, 09:30',
    isActiveInChat: true,
    chunks: [
      {
        id: 'chk-1-1',
        chunkIndex: 1,
        page: 3,
        tokenCount: 164,
        content:
          'Cláusula 3.1: Los proveedores deberán garantizar el cumplimiento íntegro del marco regulatorio de protección de datos personales y responder por cualquier brecha que comprometa la confidencialidad de la información corporativa.',
        cosineSimilarity: 0.988,
        vectorPreview: [0.038, -0.194, 0.442, -0.012, 0.812]
      },
      {
        id: 'chk-1-2',
        chunkIndex: 2,
        page: 7,
        tokenCount: 182,
        content:
          'Cláusula 7.4: Los servicios suministrados bajo este contrato marco mantendrán una garantía técnica ininterrumpida de 24 meses contados a partir de la firma del acta de recepción definitiva.',
        cosineSimilarity: 0.952,
        vectorPreview: [0.012, 0.312, -0.089, 0.418, 0.623]
      },
      {
        id: 'chk-1-3',
        chunkIndex: 3,
        page: 14,
        tokenCount: 198,
        content:
          'Cláusula 14.2: Penalizaciones contractuales por interrupción no programada. Se aplicará un descuento mensual automático del 8% sobre la facturación de servicios cuando la indisponibilidad acumulada supere los 43 minutos en un mismo mes natural.',
        cosineSimilarity: 0.994,
        vectorPreview: [0.088, -0.245, 0.512, 0.134, 0.901]
      }
    ]
  },
  {
    id: 'kdoc-2',
    title: 'Anexo_SLA_2026.docx',
    category: 'Operaciones',
    fileSize: '1.4 MB',
    totalPages: 14,
    chunksCount: 28,
    embeddingModel: 'text-embedding-004',
    dimension: 768,
    avgSimilarity: 0.976,
    status: 'indexed',
    lastUpdated: 'Ayer, 16:45',
    isActiveInChat: true,
    chunks: [
      {
        id: 'chk-2-1',
        chunkIndex: 1,
        page: 2,
        tokenCount: 145,
        content:
          'Sección 2: Métricas de Disponibilidad Comprometida. La plataforma garantizará un umbral no inferior a 99.95% en régimen ininterrumpido 24/7/365 para todos los servicios catalogados como de nivel crítico.',
        cosineSimilarity: 0.991,
        vectorPreview: [0.044, -0.112, 0.388, -0.054, 0.771]
      },
      {
        id: 'chk-2-2',
        chunkIndex: 2,
        page: 5,
        tokenCount: 176,
        content:
          'Sección 5: Protocolo de Soporte y Tiempos de Respuesta. Las incidencias de Severidad 1 (Crítica) deberán ser atendidas en menos de 15 minutos (RTO) con escalado automático a la dirección de ingeniería.',
        cosineSimilarity: 0.965,
        vectorPreview: [-0.015, 0.208, 0.419, 0.088, 0.643]
      }
    ]
  },
  {
    id: 'kdoc-3',
    title: 'Auditoría_Seguridad_ISO27001.pdf',
    category: 'Ciberseguridad',
    fileSize: '5.2 MB',
    totalPages: 32,
    chunksCount: 64,
    embeddingModel: 'text-embedding-004',
    dimension: 768,
    avgSimilarity: 0.968,
    status: 'indexed',
    lastUpdated: '1 Sep 2026',
    isActiveInChat: false,
    chunks: [
      {
        id: 'chk-3-1',
        chunkIndex: 1,
        page: 8,
        tokenCount: 190,
        content:
          'Control A.9.2: Gestión de accesos privilegiados. Se prohíben cuentas genéricas o compartidas. Todo acceso administrativo requerirá autenticación multifactor basada en tokens físicos FIDO2 o biometría.',
        cosineSimilarity: 0.978,
        vectorPreview: [0.071, -0.188, 0.521, 0.044, 0.819]
      },
      {
        id: 'chk-3-2',
        chunkIndex: 2,
        page: 22,
        tokenCount: 210,
        content:
          'Control A.10.1: Criptografía en reposo y en tránsito. Todos los flujos de inferencia de modelos IA deberán estar blindados mediante TLS 1.3 y claves criptográficas administradas mediante HSM con rotación trimestral.',
        cosineSimilarity: 0.982,
        vectorPreview: [0.092, -0.045, 0.612, 0.112, 0.874]
      }
    ]
  },
  {
    id: 'kdoc-4',
    title: 'Politica_Retencion_Cero.pdf',
    category: 'Legal',
    fileSize: '890 KB',
    totalPages: 8,
    chunksCount: 16,
    embeddingModel: 'text-embedding-004',
    dimension: 768,
    avgSimilarity: 0.954,
    status: 'indexed',
    lastUpdated: '28 Ago 2026',
    isActiveInChat: false,
    chunks: [
      {
        id: 'chk-4-1',
        chunkIndex: 1,
        page: 3,
        tokenCount: 155,
        content:
          'Lineamiento de Privacidad: Política Zero-Data Retention (ZDR). Las instrucciones enviadas por los usuarios y los fragmentos recuperados en memoria para la generación RAG no podrán almacenarse permanentemente para reentrenamiento comercial de modelos base.',
        cosineSimilarity: 0.985,
        vectorPreview: [0.035, -0.210, 0.490, -0.015, 0.795]
      }
    ]
  },
  {
    id: 'kdoc-5',
    title: 'Guia_Cumplimiento_Gobierno_IA.pdf',
    category: 'Ciberseguridad',
    fileSize: '2.1 MB',
    totalPages: 12,
    chunksCount: 24,
    embeddingModel: 'text-embedding-004',
    dimension: 768,
    avgSimilarity: 0.941,
    status: 'indexed',
    lastUpdated: '25 Ago 2026',
    isActiveInChat: false,
    chunks: [
      {
        id: 'chk-5-1',
        chunkIndex: 1,
        page: 4,
        tokenCount: 172,
        content:
          'Marco de IA Responsable: Principio de Explicabilidad y Citas Fidedignas. Cualquier inferencia generada por el Copilot que proponga modificaciones contractuales o financieras deberá incluir obligatoriamente el identificador de chunk y documento oficial de origen.',
        cosineSimilarity: 0.963,
        vectorPreview: [0.052, -0.142, 0.468, 0.082, 0.788]
      }
    ]
  },
  {
    id: 'kdoc-6',
    title: 'Presupuesto_Operativo_Cloud_2026.xlsx',
    category: 'Finanzas',
    fileSize: '3.1 MB',
    totalPages: 6,
    chunksCount: 18,
    embeddingModel: 'text-embedding-004',
    dimension: 768,
    avgSimilarity: 0.932,
    status: 'indexed',
    lastUpdated: '20 Ago 2026',
    isActiveInChat: false,
    chunks: [
      {
        id: 'chk-6-1',
        chunkIndex: 1,
        page: 1,
        tokenCount: 130,
        content:
          'Presupuesto Proyectado Q1-Q4: Desglose de inversión en capacidad de cómputo GPU y cuotas de inferencia Gemini 1.5 Pro con límite mensual asignado de $45,000 USD y reserva de contingencia del 10%.',
        cosineSimilarity: 0.948,
        vectorPreview: [0.021, -0.098, 0.355, 0.124, 0.690]
      }
    ]
  },
  {
    id: 'kdoc-7',
    title: 'Manual_Onboarding_Ingenieria.pdf',
    category: 'RRHH',
    fileSize: '4.5 MB',
    totalPages: 22,
    chunksCount: 45,
    embeddingModel: 'text-embedding-004',
    dimension: 768,
    avgSimilarity: 0.915,
    status: 'indexed',
    lastUpdated: '15 Ago 2026',
    isActiveInChat: false,
    chunks: [
      {
        id: 'chk-7-1',
        chunkIndex: 1,
        page: 5,
        tokenCount: 160,
        content:
          'Proceso de Integración Técnica: Estándares de desarrollo, directrices de arquitectura modular en Angular 20, convenciones de diseño corporativo y protocolos de seguridad en el ciclo de vida del software.',
        cosineSimilarity: 0.922,
        vectorPreview: [0.018, 0.144, 0.392, -0.042, 0.635]
      }
    ]
  }
];

export const KNOWLEDGE_STATS_MOCK: KnowledgeStats = {
  totalDocuments: 7,
  totalChunks: 237,
  vectorStorageSize: '84.2 MB',
  embeddingModel: 'text-embedding-004 (768d)',
  avgQueryLatency: '14 ms',
  indexedDepartments: 5
};
