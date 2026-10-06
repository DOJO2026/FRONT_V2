import { Injectable, signal } from '@angular/core';

export interface CorporatePromptTemplate {
  id: string;
  title: string;
  category: 'Legal & Contratos' | 'Operaciones & SLA' | 'Ciberseguridad' | 'Finanzas' | 'RRHH';
  description: string;
  prompt: string;
  variables: string[];
  tokensEstimate: number;
  isFavorite: boolean;
  department: string;
}

export interface PromptHistoryItem {
  id: string;
  prompt: string;
  timestamp: string;
  tokenCost: number;
  category?: string;
}

const INITIAL_TEMPLATES: CorporatePromptTemplate[] = [
  {
    id: 'tmpl-1',
    title: 'Auditoría de Penalizaciones por Disponibilidad SLA',
    category: 'Operaciones & SLA',
    description: 'Evalúa cláusulas de penalización por caídas de infraestructura y calcula descuentos automáticos.',
    prompt: 'Realiza una auditoría exhaustiva de las cláusulas de penalización por indisponibilidad en el Contrato Marco 2026. Identifica los umbrales de SLA (99.5%), el cálculo de penalizaciones por cada 0.1% de caída y los topes máximos de facturación mensual.',
    variables: ['Contrato Marco 2026', 'SLA 99.5%'],
    tokensEstimate: 42,
    isFavorite: true,
    department: 'Operaciones Cloud'
  },
  {
    id: 'tmpl-2',
    title: 'Análisis de Cumplimiento GDPR & Privacidad',
    category: 'Legal & Contratos',
    description: 'Revisa políticas de privacidad, cláusulas tipo de la UE y medidas de cifrado de datos sensibles.',
    prompt: 'Analiza el documento de Política de Privacidad corporativa respecto a los requerimientos de GDPR. Resume el tratamiento de datos sensibles, medidas de seguridad de cifrado y el procedimiento de ejercicio de derechos ARCO.',
    variables: ['Política de Privacidad', 'GDPR'],
    tokensEstimate: 38,
    isFavorite: false,
    department: 'Legal & Compliance'
  },
  {
    id: 'tmpl-3',
    title: 'Matriz Comparativa de Riesgos & Proveedores',
    category: 'Ciberseguridad',
    description: 'Compara garantías de servicio, tiempos de resolución de incidencias S1/S2 y certificaciones ISO.',
    prompt: 'Genera una matriz comparativa detallada entre nuestros proveedores de infraestructura tecnológica para 2026, evaluando cobertura de póliza de responsabilidad civil, soporte 24/7 y certificaciones ISO 27001.',
    variables: ['Proveedores Cloud', 'ISO 27001'],
    tokensEstimate: 45,
    isFavorite: true,
    department: 'Seguridad de la Información'
  },
  {
    id: 'tmpl-4',
    title: 'Conciliación de Desviación Presupuestaria Opex Q3',
    category: 'Finanzas',
    description: 'Identifica partidas con desviación mayor al 5% y proyecta impacto en el cierre fiscal.',
    prompt: 'Revisa el Tarifario y Presupuesto de Operaciones Cloud de 2026. Detecta cualquier desviación entre los costes previstos y el consumo real de compute units y almacenamiento SSD en el tercer trimestre.',
    variables: ['Presupuesto 2026', 'Q3'],
    tokensEstimate: 39,
    isFavorite: false,
    department: 'Control de Gestión'
  },
  {
    id: 'tmpl-5',
    title: 'Guía de Reembolsos y Beneficios de Salud',
    category: 'RRHH',
    description: 'Extrae coberturas odontológicas, topes anuales y procedimientos para solicitar reintegros.',
    prompt: 'Explica los pasos que debe seguir un empleado para solicitar el reembolso de gastos médicos extraordinarios según la Póliza de Salud corporativa 2026. Incluye plazos máximos y documentación obligatoria.',
    variables: ['Póliza Salud', 'Reembolsos'],
    tokensEstimate: 35,
    isFavorite: false,
    department: 'Personas & Talento'
  },
  {
    id: 'tmpl-6',
    title: 'Evaluación de Vulnerabilidades & Protocolo SOC2 Tipo II',
    category: 'Ciberseguridad',
    description: 'Revisión de controles de acceso privilegiado y registro de auditorías periódicas.',
    prompt: 'Evalúa los controles de seguridad exigidos por el estándar SOC2 Tipo II en nuestros entornos de producción. Identifica las exigencias sobre registros de auditoría inmutables y retención mínima de logs.',
    variables: ['SOC2 Tipo II', 'Logs'],
    tokensEstimate: 41,
    isFavorite: true,
    department: 'Ciberseguridad'
  }
];

const INITIAL_HISTORY: PromptHistoryItem[] = [
  {
    id: 'hist-1',
    prompt: '¿Cuáles son las penalizaciones por indisponibilidad en el contrato marco?',
    timestamp: 'Hace 10 minutos',
    tokenCost: 18,
    category: 'Legal'
  },
  {
    id: 'hist-2',
    prompt: 'Compara los tiempos de respuesta para incidentes de severidad 1 de los proveedores A y B.',
    timestamp: 'Hace 45 minutos',
    tokenCost: 24,
    category: 'Operaciones'
  },
  {
    id: 'hist-3',
    prompt: '¿Qué requisitos exige la directiva de ciberseguridad para cifrado de copias de seguridad?',
    timestamp: 'Ayer, 16:30',
    tokenCost: 22,
    category: 'Ciberseguridad'
  },
  {
    id: 'hist-4',
    prompt: 'Resume las exclusiones principales de la póliza de salud para personal directivo.',
    timestamp: '02 Sep, 11:15',
    tokenCost: 19,
    category: 'RRHH'
  }
];

@Injectable({
  providedIn: 'root'
})
export class PromptTemplatesService {
  readonly isOpen = signal<boolean>(false);
  readonly activeTab = signal<'templates' | 'history' | 'favorites'>('templates');
  readonly selectedCategory = signal<string>('Todas');
  readonly searchQuery = signal<string>('');

  readonly templates = signal<CorporatePromptTemplate[]>(INITIAL_TEMPLATES);
  readonly promptHistory = signal<PromptHistoryItem[]>(INITIAL_HISTORY);

  // Signal consumed by PromptBarComponent to fill prompt text
  readonly selectedPromptToFill = signal<string | null>(null);

  open(tab: 'templates' | 'history' | 'favorites' = 'templates'): void {
    this.activeTab.set(tab);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  setActiveTab(tab: 'templates' | 'history' | 'favorites'): void {
    this.activeTab.set(tab);
  }

  setSelectedCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  setSearchQuery(q: string): void {
    this.searchQuery.set(q);
  }

  toggleFavorite(id: string): void {
    this.templates.update((tmpls) =>
      tmpls.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  }

  usePrompt(prompt: string): void {
    this.selectedPromptToFill.set(prompt);
    this.recordPromptHistory(prompt);
    this.close();
  }

  clearPromptToFill(): void {
    this.selectedPromptToFill.set(null);
  }

  recordPromptHistory(prompt: string, category = 'General'): void {
    if (!prompt.trim()) return;
    const newItem: PromptHistoryItem = {
      id: `hist-${Date.now()}`,
      prompt: prompt.trim(),
      timestamp: 'Ahora mismo',
      tokenCost: Math.round(prompt.length / 4) + 6,
      category
    };
    this.promptHistory.update((hist) => [newItem, ...hist.slice(0, 19)]);
  }

  clearHistory(): void {
    this.promptHistory.set([]);
  }
}
