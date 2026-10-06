import { ChatMessage } from '../models/chat-message.model';

export const INITIAL_CHAT_MESSAGES_MOCK: Record<string, ChatMessage[]> = {
  'chat-1': [
    {
      id: 'msg-1',
      conversationId: 'chat-1',
      role: 'user',
      content: 'Reportar caída en API Gateway y alta latencia en base de datos Cloud Spanner',
      timestamp: '10:41 AM'
    },
    {
      id: 'msg-2',
      conversationId: 'chat-1',
      role: 'assistant',
      content: `Hemos recibido y registrado los detalles preliminares de tu incidencia técnica bajo el expediente provisional **#INC-2026-8942-PROD**.\n\nPara que nuestro equipo de **DevOps y SRE** pueda diagnosticar la causa raíz (RCA), aislar el impacto en microservicios y proceder a la mitigación dentro del SLA comprometido, **¿deseas adjuntar telemetría o evidencias de respaldo** (logs de error, volcados de trazas OpenTelemetry o capturas de monitoreo)?`,
      timestamp: '10:42 AM',
      modelUsed: 'Gemini 1.5 Pro • RAG',
      interactiveType: 'claim_ask_attachment',
      claimDetails: {
        claimNumber: 'INC-2026-8942-PROD',
        status: 'En Diagnóstico de Telemetría',
        description: 'Caída en API Gateway y alta latencia en Spanner DB',
        policyNumber: '#SLA-TI-99421'
      },
      sources: [
        {
          id: 'src-1',
          title: 'Manual_Operaciones_SRE_Kubernetes.pdf',
          page: 11,
          category: 'Gestión de Incidentes Críticos',
          confidence: 97,
          snippet: 'La presentación de logs estructurados y métricas telemétricas con hash de autenticidad reduce el tiempo de resolución (MTTR) de 4 horas a menos de 15 minutos hábiles.'
        }
      ]
    }
  ],
  'chat-2': [
    {
      id: 'msg-3',
      conversationId: 'chat-2',
      role: 'user',
      content: 'Genera un resumen ejecutivo de las métricas financieras del Q3 identificando desvíos mayores al 5%.',
      timestamp: '08:14 AM'
    },
    {
      id: 'msg-4',
      conversationId: 'chat-2',
      role: 'assistant',
      content: `A continuación se presenta el **Resumen Ejecutivo de Desvíos Presupuestarios - Q3 2025**:

### Desvíos Superiores al 5%
* **Infraestructura Cloud & GPU**: Presupuestado €140,000 / Real €158,200 (**+13.0% desvío**). Causa principal: mayor consumo de tokens en procesamiento batch de auditorías.
* **Licenciamiento Software Especializado**: Presupuestado €85,000 / Real €91,800 (**+8.0% desvío**). Causa: incremento de 15 puestos para equipo de Data Science.
* **Servicios Profesionales de Consultoría**: Presupuestado €210,000 / Real €195,400 (**-6.9% ahorro**). Causa: internalización de automatizaciones RPA.

### Balance Neto
El desvío consolidado de la división de tecnología cerró en un **+2.4%**, manteniéndose dentro del margen de tolerancia directiva del 5%.`,
      timestamp: '08:15 AM',
      modelUsed: 'Gemini 1.5 Pro',
      sources: [
        {
          id: 'src-4',
          title: 'Balance_Financiero_Consolidado_Q3.xlsx',
          page: 2,
          category: 'Finanzas / Opex',
          confidence: 96,
          snippet: 'Partida Opex Cloud: Consumo real €158,200 frente a provisión de €140,000 (+13.0%).'
        }
      ]
    }
  ]
};
