import { ChatSuggestion } from '../models/chat-message.model';

export const CHAT_SUGGESTIONS_MOCK: ChatSuggestion[] = [
  {
    id: 'sug-1',
    title: 'Análisis de Cláusulas y Penalizaciones',
    description: 'Revisar contratos marco 2026 y detectar penalizaciones por incumplimiento de SLA.',
    prompt: '¿Cuáles son las cláusulas de penalización y resolución anticipada en el contrato marco de proveedores 2026?',
    icon: 'document',
    category: 'Legal'
  },
  {
    id: 'sug-2',
    title: 'Resumen Ejecutivo Financiero',
    description: 'Consolidar el balance de costes operativos del último trimestre y desvíos presupuestarios.',
    prompt: 'Genera un resumen ejecutivo de las métricas financieras del Q3 identificando desvíos mayores al 5%.',
    icon: 'sparkles',
    category: 'Finanzas'
  },
  {
    id: 'sug-3',
    title: 'Auditoría y Cumplimiento SOC2',
    description: 'Evaluar controles de acceso, cifrado en reposo y retención de logs de seguridad.',
    prompt: '¿Qué controles de acceso y políticas de retención de logs están vigentes para la certificación SOC2?',
    icon: 'search',
    category: 'Seguridad'
  },
  {
    id: 'sug-4',
    title: 'Comparativa de Proveedores Cloud',
    description: 'Comparar niveles de servicio y compromisos de disponibilidad entre proveedores actuales.',
    prompt: 'Compara los acuerdos de nivel de servicio (SLA) de disponibilidad y tiempos de respuesta de nuestros proveedores.',
    icon: 'settings',
    category: 'Operaciones'
  }
];
