import { DailyActivity, DepartmentUsage, KpiMetric, TelemetryLog, TopDocument } from '../models/analytics.model';

export const KPI_METRICS_MOCK: KpiMetric[] = [
  {
    id: 'kpi-1',
    title: 'Consultas al Copilot',
    value: '1,482',
    change: '+18.4%',
    isPositive: true,
    icon: 'chat',
    color: 'primary',
    subtitle: 'vs. 1,252 en el periodo anterior'
  },
  {
    id: 'kpi-2',
    title: 'Consumo de Tokens',
    value: '42,350',
    change: '42.4% cuota',
    isPositive: true,
    icon: 'sparkles',
    color: 'info',
    subtitle: 'Límite asignado: 100,000 / mes'
  },
  {
    id: 'kpi-3',
    title: 'Latencia Promedio RAG',
    value: '1.24s',
    change: '-240ms',
    isPositive: true,
    icon: 'refresh',
    color: 'success',
    subtitle: 'Optimización de embeddings activa'
  },
  {
    id: 'kpi-4',
    title: 'Satisfacción de Usuario',
    value: '97.2%',
    change: '+3.1%',
    isPositive: true,
    icon: 'thumb-up',
    color: 'warning',
    subtitle: '342 valoraciones registradas'
  }
];

export const DEPARTMENT_USAGE_MOCK: DepartmentUsage[] = [
  { department: 'Legal & Contratos', queriesCount: 540, percentage: 36.4, color: '#10A37F', icon: 'document' },
  { department: 'Finanzas & Control', queriesCount: 380, percentage: 25.6, color: '#38BDF8', icon: 'sparkles' },
  { department: 'Seguridad & SOC2', queriesCount: 260, percentage: 17.5, color: '#818CF8', icon: 'settings' },
  { department: 'Operaciones & Cloud', queriesCount: 180, percentage: 12.1, color: '#F59E0B', icon: 'refresh' },
  { department: 'Recursos Humanos', queriesCount: 122, percentage: 8.4, color: '#EC4899', icon: 'user' }
];

export const DAILY_ACTIVITY_MOCK: DailyActivity[] = [
  { day: 'Lun', date: '25 Feb', queries: 198, tokensK: 5.8 },
  { day: 'Mar', date: '26 Feb', queries: 242, tokensK: 7.2 },
  { day: 'Mié', date: '27 Feb', queries: 286, tokensK: 8.4 },
  { day: 'Jue', date: '28 Feb', queries: 310, tokensK: 9.1 },
  { day: 'Vie', date: '01 Mar', queries: 275, tokensK: 7.9 },
  { day: 'Sáb', date: '02 Mar', queries: 94, tokensK: 2.3 },
  { day: 'Dom', date: '03 Mar', queries: 77, tokensK: 1.6 }
];

export const TOP_DOCUMENTS_MOCK: TopDocument[] = [
  {
    id: 'doc-1',
    title: 'Contrato_Marco_Operaciones_2026.pdf',
    category: 'Legal',
    citationsCount: 342,
    confidenceAvg: 97.4,
    size: '4.8 MB',
    lastCited: 'Hace 8 min'
  },
  {
    id: 'doc-2',
    title: 'Anexo_SLA_Tecnologico_v2.docx',
    category: 'Operaciones',
    citationsCount: 215,
    confidenceAvg: 95.1,
    size: '1.2 MB',
    lastCited: 'Hace 24 min'
  },
  {
    id: 'doc-3',
    title: 'Balance_Financiero_Consolidado_Q3.xlsx',
    category: 'Finanzas',
    citationsCount: 188,
    confidenceAvg: 96.8,
    size: '3.4 MB',
    lastCited: 'Hace 1 hora'
  },
  {
    id: 'doc-4',
    title: 'Politica_Seguridad_Terceros_SOC2.pdf',
    category: 'Seguridad',
    citationsCount: 164,
    confidenceAvg: 93.2,
    size: '2.1 MB',
    lastCited: 'Hace 3 horas'
  },
  {
    id: 'doc-5',
    title: 'Auditoria_Infraestructura_Cloud.pdf',
    category: 'Infraestructura',
    citationsCount: 98,
    confidenceAvg: 91.5,
    size: '5.6 MB',
    lastCited: 'Ayer'
  }
];

export const TELEMETRY_LOGS_MOCK: TelemetryLog[] = [
  {
    id: 'log-1',
    prompt: '¿Cuáles son las cláusulas de penalización por caída de SLA?',
    category: 'Legal',
    model: 'Gemini 1.5 Pro',
    latencyMs: 1120,
    tokens: 432,
    timestamp: '10:42 AM',
    status: 'success',
    feedback: 'up'
  },
  {
    id: 'log-2',
    prompt: 'Resumen de desvíos presupuestarios en licencias cloud Q3',
    category: 'Finanzas',
    model: 'Gemini 1.5 Pro',
    latencyMs: 980,
    tokens: 388,
    timestamp: '08:15 AM',
    status: 'success',
    feedback: 'up'
  },
  {
    id: 'log-3',
    prompt: 'Verificar retención de logs de firewall perimetral SOC2',
    category: 'Seguridad',
    model: 'Gemini 1.5 Pro',
    latencyMs: 1450,
    tokens: 512,
    timestamp: 'Ayer 17:30',
    status: 'success',
    feedback: null
  },
  {
    id: 'log-4',
    prompt: 'Comparativa de costos por usuario de herramientas RPA',
    category: 'Operaciones',
    model: 'Gemini 1.5 Pro',
    latencyMs: 820,
    tokens: 290,
    timestamp: 'Ayer 14:12',
    status: 'success',
    feedback: 'up'
  },
  {
    id: 'log-5',
    prompt: 'Extracción de tablas no estructuradas de archivo corrupto',
    category: 'Legal',
    model: 'Gemini 1.5 Pro',
    latencyMs: 2310,
    tokens: 110,
    timestamp: '28 Feb 11:05',
    status: 'warning',
    feedback: 'down'
  }
];
