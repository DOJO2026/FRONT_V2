import { Injectable, signal } from '@angular/core';

export interface ReasoningStep {
  id: number;
  title: string;
  duration: string;
  status: 'done' | 'active' | 'pending';
  details: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReasoningCanvasService {
  readonly isOpen = signal<boolean>(false);
  readonly title = signal<string>('Matriz Comparativa de Riesgos Contractuales & SLA 2026');
  readonly documentType = signal<string>('Informe Ejecutivo • Legal / Opex');
  readonly activeTab = signal<'preview' | 'source'>('preview');

  readonly reasoningSteps = signal<ReasoningStep[]>([
    {
      id: 1,
      title: 'Extracción semántica y vectorización de cláusulas contractuales',
      duration: '420ms',
      status: 'done',
      details: 'Recuperados 8 fragmentos de Contrato_Marco.pdf y Anexo_SLA_2026.docx con similitud >0.92.'
    },
    {
      id: 2,
      title: 'Normalización de penalizaciones y fórmulas de cálculo de disponibilidad',
      duration: '680ms',
      status: 'done',
      details: 'Estandarizado cálculo de caídas bajo SLA 99.5% y topes mensuales de facturación (30%).'
    },
    {
      id: 3,
      title: 'Síntesis de recomendaciones operativas y matriz de mitigación',
      duration: '310ms',
      status: 'done',
      details: 'Generada comparativa ponderada entre alternativas de proveedores con 3 niveles de severidad.'
    }
  ]);

  readonly canvasContent = signal<string>(`# MATRIZ COMPARATIVA DE RIESGOS CONTRACTUALES & SLA

**Fecha de Generación:** 04 Septiembre 2026  
**Área Responsable:** Asesoría Jurídica & Operaciones Cloud  
**Fuentes Verificadas:** Contrato_Marco_Operaciones_2026.pdf (Pág. 18), Anexo_SLA_v2.docx (Pág. 4)

---

## 1. Resumen Ejecutivo
El presente informe sintetiza las condiciones críticas de penalización e indemnización aplicables a los proveedores de infraestructura tecnológica contratados para el ejercicio fiscal 2026. Se destaca una alta exposición en caso de indisponibilidad superior a 4 horas en incidentes de Severidad 1.

---

## 2. Tabla Comparativa de Proveedores & SLAs

| Proveedor | SLA Garantizado | Penalización Indisponibilidad | Tiempo Respuesta S1 | Límite Máximo Mensual |
| :--- | :---: | :---: | :---: | :---: |
| **Proveedor Principal (A)** | 99.9% | 10% canon / 0.1% caída | 15 minutos | 30% facturación |
| **Proveedor Secundario (B)** | 99.5% | 5% canon / 0.2% caída | 30 minutos | 20% facturación |
| **Servicios Cloud (C)** | 99.95% | Crédito de servicio progresivo | 60 minutos | 15% facturación |

---

## 3. Acciones de Mitigación Recomendadas
1. **Auditoría Técnica Previa a Renovación**: Exigir certificados de disponibilidad auditados por un tercero independiente antes del 15 de Noviembre.
2. **Revisión de Cláusula de Rescisión**: Homogeneizar las causales de resolución anticipada para permitir salida sin penalización ante dos incumplimientos consecutivos.
3. **Póliza de SLA & Continuidad Cloud**: Comprobar cobertura de respaldo y failover multirregión ante caídas críticas o interrupción de operaciones.`);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  setActiveTab(tab: 'preview' | 'source'): void {
    this.activeTab.set(tab);
  }

  applyEdit(instruction: string): void {
    if (!instruction.trim()) return;
    const current = this.canvasContent();
    const updated = `${current}\n\n> **Nota del Copilot:** Se ha integrado el requerimiento: "${instruction}". Se actualizó la sección de recomendaciones conforme a los lineamientos corporativos.`;
    this.canvasContent.set(updated);
  }
}
