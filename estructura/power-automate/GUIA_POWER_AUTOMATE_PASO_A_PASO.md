# Guía Oficial: Flujo de Reclamos y Aprobaciones en Power Automate

> **Integración DOJO 2.0 ↔ Microsoft Power Automate & Office 365 Outlook**  
> **Escenario:** Proceso integral de Reclamos e Incidencias con Aprobación Interactiva en Outlook.  
> **Solución Implementada:** **Opción 2 (100% Gratuita / Conectores Estándar Office 365)** — No requiere licencia Premium ni tarjeta de crédito.

---

## 1. ¿Por qué usamos la Opción 2?

Al intentar guardar un flujo con el disparador *"Cuando se recibe una solicitud HTTP"*, Microsoft solicita una licencia **Power Automate Premium**.

Para evitar cualquier costo o periodo de prueba que caduque, utilizamos la **Opción 2**:
* **Disparador:** `Office 365 Outlook` ➔ *"Cuando llega un nuevo correo electrónico (V3)"* con filtro de asunto `[RECLAMO DOJO]`.
* **Aprobación:** `Aprobaciones (Approvals)` ➔ *"Iniciar y esperar una aprobación"*.
* **Resultado:** Tarjetas interactivas con botones **Aprobar** y **Rechazar** directamente en tu bandeja de Outlook.
* **Licenciamiento:** **100% Estándar e Incluido** en tu cuenta empresarial de Microsoft 365 (`diego.bueno@ayesa.com` en AYESA).

---

## 2. Arquitectura de la Solución (Opción 2)

```
┌──────────────────────────────────────────────┐
│        DOJO 2.0 (Frontend Angular 20)        │
│  Usuario crea reclamo o escanea evidencia    │
└──────────────────────┬───────────────────────┘
                       │ Abre Outlook Web con asunto:
                       │ "[RECLAMO DOJO] #REC-2026-XXXX: Titulo"
                       ▼
┌──────────────────────────────────────────────┐
│  Disparador Estándar en Power Automate       │
│  "Cuando llega un nuevo correo (V3)"         │
│  Filtro de Asunto: [RECLAMO DOJO]            │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Acción: Iniciar y esperar una aprobación    │
│  Tipo: Aprobar/Rechazar: primero en responder│
│  Asignado a: diego.bueno@ayesa.com           │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Condición: ¿Resultado == "Approve"?          │
└──────────────┬────────────────┬──────────────┘
               │ Sí             │ No
               ▼                ▼
     ┌──────────────────┐ ┌──────────────────┐
     │  Rama Aprobado   │ │  Rama Rechazado  │
     │  Envía correo de │ │  Envía correo con│
     │  confirmación    │ │  observaciones   │
     └──────────────────┘ └──────────────────┘
```

---

## 3. Configuración en Power Automate (En 3 Minutos)

Tienes tu flujo abierto en [make.powerautomate.com](https://make.powerautomate.com). Realiza estos pasos:

### Paso 1: Cambiar el Disparador
1. En el bloque superior que dice *"Cuando se recibe una solicitud HTTP"*, haz clic en los **3 puntos (...)** en la esquina superior derecha del bloque y selecciona **Eliminar** (*Delete*).
2. Haz clic en **+ Agregar un desencadenador** (*Add a trigger*).
3. En la barra de búsqueda escribe: `Office 365 Outlook`.
4. Selecciona el disparador:
   👉 **Cuando llega un nuevo correo electrónico (V3)** (*When a new email arrives (V3)*).
5. Configura los parámetros:
   * **Carpeta:** `Bandeja de entrada` (*Inbox*)
   * **Filtro de asunto:** `[RECLAMO DOJO]`
   * *(Opcional)* En opciones avanzadas: Solo con datos adjuntos = `No`.

---

### Paso 2: Configurar la Acción de Aprobación
1. Selecciona el segundo bloque que ya tienes: **Iniciar y esperar una aprobación** (*Start and wait for an approval*).
2. Verifica sus campos:
   * **Tipo de aprobación:** `Aprobar o rechazar: primero en responder` (*Approve/Reject - First to respond*).
   * **Título:** `Aprobación de Reclamo DOJO: @{triggerOutputs()?['body/subject']}` *(o selecciona contenido dinámico: Asunto)*.
   * **Asignado a:** `diego.bueno@ayesa.com` *(o selecciona contenido dinámico: De / From)*.
   * **Detalles:** `@{triggerOutputs()?['body/bodyPreview']}` *(o selecciona contenido dinámico: Vista previa del cuerpo o Cuerpo)*.
   * **Vínculo del elemento:** `http://localhost:4200/claims`
   * **Descripción del vínculo:** `Ver en Panel de Reclamos DOJO 2.0`

---

### Paso 3: Configurar la Condición
1. Selecciona el tercer bloque: **Condición** (*Condition*).
2. En la regla:
   * Primer valor (contenido dinámico): **Resultado** (*Outcome*).
   * Condición: **es igual a** (*is equal to*).
   * Segundo valor: `Approve`
3. En la rama **En caso positivo (True)**:
   * Agrega la acción **Enviar un correo electrónico (V2)** (Office 365 Outlook).
   * **Para:** `@{triggerOutputs()?['body/from']}`
   * **Asunto:** `✅ RECLAMO APROBADO: @{triggerOutputs()?['body/subject']}`
   * **Cuerpo:**
     ```
     Su reclamo ha sido APROBADO por el supervisor.
     Comentarios: @{outputs('Iniciar_y_esperar_una_aprobación')?['body/responseSummary']}
     ```
4. En la rama **En caso negativo (False)**:
   * Agrega la acción **Enviar un correo electrónico (V2)**.
   * **Para:** `@{triggerOutputs()?['body/from']}`
   * **Asunto:** `❌ RECLAMO RECHAZADO: @{triggerOutputs()?['body/subject']}`
   * **Cuerpo:**
     ```
     Su reclamo ha sido RECHAZADO.
     Motivo: @{outputs('Iniciar_y_esperar_una_aprobación')?['body/responseSummary']}
     ```

---

### Paso 4: Guardar el Flujo
* Haz clic en **Guardar** (*Save*) en la parte superior derecha.
* **¡Comprobación exitosa!** Verás que se guarda de inmediato con un check verde, sin ningún mensaje ni alerta de licencia Premium.

---

## 4. Cómo Probar la Integración en Vivo desde DOJO 2.0

### Método A: Desde el Panel de Reclamos (`/claims`)
1. En DOJO, abre el menú y ve a **Reclamos**.
2. Haz clic en **"Nuevo Reclamo"**.
3. Completa el formulario (asegúrate de que el correo del aprobador sea `diego.bueno@ayesa.com`) y haz clic en **"Registrar y Disparar"**.
4. Se abrirá una pestaña de **Outlook Web** con el correo listo y redactado.
5. Haz clic en **"Enviar"**.
6. En menos de 30 segundos:
   * Tu flujo de Power Automate se activa.
   * Recibirás en tu bandeja de entrada el correo con la tarjeta interactiva: botones **Aprobar** y **Rechazar**.
   * Haz clic en **Aprobar**, escribe un comentario y presiona **Enviar**.
   * El flujo completará la ejecución con éxito.

### Método B: Desde el Chat del Robot con IA
1. Abre el Chat en DOJO 2.0.
2. Escribe: *"Quiero registrar un reclamo de infraestructura"* o selecciona un chip sugerido.
3. El robot te ofrecerá adjuntar logs o telemetría. Acepta y escanea el informe.
4. El escáner HUD forense verificará el archivo con firma SHA-256 y creará automáticamente el reclamo oficial.
5. Verás el botón **"Ver en Reclamos Power Automate"** que te llevará al panel con el ticket radicado.

---

## 5. Referencia Alternativa: Opción 1 (Disparador HTTP Premium)

Si en el futuro tu organización cuenta con licenciamiento **Power Automate Premium**, puedes regresar al disparador HTTP Request:
* Ver esquema de contrato en: `estructura/power-automate/reclamo-webhook-request.json`
* En DOJO, cambia la modalidad en el banner a *"Webhook HTTP (Premium)"* y pega la URL de invoke.
