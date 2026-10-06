# Contrato de Integración API Backend • DOJO 2.0
> **Documento Oficial de Especificación Técnica & Esquemas JSON**  
> **Destinatario:** Equipo de Desarrollo Backend & Arquitectura Cloud  
> **Aplicación:** DOJO 2.0 • Copiloto de Sistemas, Observabilidad & Infraestructura  
> **Usuario Activo:** Diego Bueno (`diego.bueno@dojo.corp` - *Arquitecto Cloud & DevOps*)

---

## 1. Convenciones Generales de la API

* **Base URL:** `/api/v1`
* **Formato de intercambio:** `application/json; charset=utf-8`
* **Transmisión en tiempo real:** `text/event-stream` (Server-Sent Events - SSE)
* **Autenticación:** Cabecera HTTP `Authorization: Bearer <jwt_token>`
* **Manejo de fechas:** Formato ISO-8601 UTC (`2026-10-05T15:45:00.000Z`)
* **Estructura Estándar de Respuesta (Envelope):**
  ```json
  {
    "success": true,
    "data": { ... },
    "meta": { ... }
  }
  ```
* **Estructura Estándar de Error:**
  ```json
  {
    "success": false,
    "error": {
      "code": "ERROR_CODE_STRING",
      "message": "Descripción clara del fallo en español.",
      "details": []
    }
  }
  ```

---

## 2. Mapa de Directorios & Archivos JSON de Ejemplo

Toda la estructura de datos requerida por el Frontend se encuentra organizada en la carpeta `estructura/`:

```
estructura/
├── chat/
│   ├── conversations.json          # Listado de conversaciones e historial
│   ├── messages.json               # Mensajes por conversación con estados interactivos
│   ├── send-message-request.json   # Payload de envío de consulta (prompt)
│   ├── message-response.json       # Respuesta completa del backend (modo no streaming)
│   └── streaming-events.json       # Flujo de eventos SSE para streaming en tiempo real
├── fuentes/
│   ├── fuentes-repository.json     # Repositorio de documentos de la base de conocimiento
│   ├── cita-rag-detalle.json       # Telemetría vectorial completa para el visor modal RAG
│   ├── search-fuentes-request.json # Solicitud de búsqueda semántica híbrida
│   └── search-fuentes-response.json# Resultados de fragmentos vectoriales coincidentes
├── upload/
│   ├── upload-request.json         # Solicitud de inicio de carga de archivos / logs
│   ├── upload-response.json        # Respuesta con ID y URL prefirmada
│   ├── upload-queue-status.json    # Estado de cola y progreso de vectorización
│   └── escaneo-forense-result.json # Resultado de análisis forense y hash SHA-256
├── estados/
│   ├── user-profile.json           # Perfil y cuota de tokens de Diego Bueno
│   ├── models-config.json          # Configuración de LLMs y parámetros RAG
│   └── system-status.json          # Estado de clusters, observabilidad P99 y SLA
└── CONTRATO_API_BACKEND.md         # Esta especificación técnica
```

---

## 3. Módulo 1: Chat & Copiloto (`/api/v1/chat`)

### 3.1 Obtener lista de conversaciones
* **Método:** `GET`
* **Ruta:** `/api/v1/chat/conversations`
* **Parámetros Query:** `?archived=false&category=Operaciones&search=spanner`
* **Respuesta Exitosa (200 OK):** Archivo de referencia [`estructura/chat/conversations.json`](./chat/conversations.json)

```typescript
export interface ChatConversation {
  id: string;
  title: string;
  updatedAt: string;
  dateGroup: 'Hoy' | 'Ayer' | 'Últimos 7 días' | 'Mes anterior';
  pinned?: boolean;
  archived?: boolean;
  messageCount?: number;
  category?: 'Legal' | 'Operaciones' | 'Ciberseguridad' | 'Finanzas' | 'General' | 'Observabilidad' | 'Infraestructura' | 'Bases de Datos';
  modelUsed?: string;
  citedSourcesCount?: number;
  tokensUsed?: number;
  positiveFeedbackCount?: number;
}
```

### 3.2 Obtener mensajes de una conversación
* **Método:** `GET`
* **Ruta:** `/api/v1/chat/conversations/:id/messages`
* **Respuesta Exitosa (200 OK):** Archivo de referencia [`estructura/chat/messages.json`](./chat/messages.json)

```typescript
export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: MessageSource[];
  status?: 'sending' | 'thinking' | 'streaming' | 'complete' | 'error';
  feedback?: 'up' | 'down' | null;
  modelUsed?: string;
  interactiveType?:
    | 'claim_prompt_request'
    | 'claim_ask_attachment'
    | 'claim_uploader'
    | 'claim_scanned_result';
  claimDetails?: {
    claimNumber: string;
    status: string;
    description?: string;
    policyNumber?: string;
  };
}
```

### 3.3 Enviar mensaje a DOJO AI
* **Método:** `POST`
* **Ruta:** `/api/v1/chat/messages`
* **Headers:**  
  `Accept: text/event-stream` (si `stream: true`) o `Accept: application/json`
* **Cuerpo de Solicitud (Request):** Archivo [`estructura/chat/send-message-request.json`](./chat/send-message-request.json)
  ```json
  {
    "conversationId": "chat-1",
    "content": "¿Cuáles son los parámetros de autoescalado y throttling en el API Gateway para mitigar picos de latencia P99?",
    "modelId": "gemini-1.5-pro",
    "temperature": 0.2,
    "reasoningDepth": "standard",
    "stream": true,
    "attachedDocs": ["Arquitectura_Plataforma_DOJO_2.0.pdf"]
  }
  ```

#### Modo Streaming (SSE):
El backend emite eventos progresivos según [`estructura/chat/streaming-events.json`](./chat/streaming-events.json):
1. `event: thinking` → Actualiza el indicador de razonamiento del asistente.
2. `event: sources` → Envía los fragmentos documentales recuperados por RAG.
3. `event: token` → Envía fragmentos de texto (*chunks* markdown).
4. `event: done` → Notifica la finalización con el conteo final de tokens y metadatos.

---

## 4. Módulo 2: Fuentes Documentales & RAG (`/api/v1/fuentes`)

### 4.1 Repositorio de Documentos Indexados
* **Método:** `GET`
* **Ruta:** `/api/v1/fuentes`
* **Respuesta Exitosa (200 OK):** Archivo [`estructura/fuentes/fuentes-repository.json`](./fuentes/fuentes-repository.json)

```typescript
export interface RepositoryDocItem {
  id: string;
  title: string;
  category: string;
  size: string;
  updatedAt: string;
  chunks: number;
  embeddingModel: string;
  description: string;
}
```

### 4.2 Detalle de Cita Vectorial (Visor Modal RAG)
* **Método:** `GET`
* **Ruta:** `/api/v1/fuentes/citas/:id`
* **Respuesta Exitosa (200 OK):** Archivo [`estructura/fuentes/cita-rag-detalle.json`](./fuentes/cita-rag-detalle.json)

```typescript
export interface RagCitation {
  id: string;
  title: string;
  page?: number;
  snippet: string;
  confidence: number;
  category?: string;
  chunkId?: string;
  cosineSimilarity?: number;
  tokensCount?: number;
  embeddingModel?: string;
  totalDocumentPages?: number;
  surroundingContext?: string;
}
```

---

## 5. Módulo 3: Upload & Análisis Forense (`/api/v1/upload`)

### 5.1 Iniciar Subida de Telemetría o Logs
* **Método:** `POST`
* **Ruta:** `/api/v1/upload/iniciar`
* **Request:** [`estructura/upload/upload-request.json`](./upload/upload-request.json)
* **Response (201 Created):** [`estructura/upload/upload-response.json`](./upload/upload-response.json)

### 5.2 Estado de Cola & Vectorización
* **Método:** `GET`
* **Ruta:** `/api/v1/upload/cola`
* **Response (200 OK):** [`estructura/upload/upload-queue-status.json`](./upload/upload-queue-status.json)

### 5.3 Escáner Telemétrico Forense (Unidad Óptica / OCR)
* **Método:** `POST`
* **Ruta:** `/api/v1/upload/escanear-forense`
* **Response (200 OK):** [`estructura/upload/escaneo-forense-result.json`](./upload/escaneo-forense-result.json)
  * Genera el Hash criptográfico SHA-256 en tiempo real.
  * Extrae número de ticket, SLA asignado, cálculo de RTO y diagnóstico de causa raíz (RCA).

---

## 6. Módulo 4: Estados del Sistema & Perfil (`/api/v1/estados`)

### 6.1 Perfil de Usuario (Diego Bueno)
* **Método:** `GET`
* **Ruta:** `/api/v1/estados/usuario`
* **Response (200 OK):** [`estructura/estados/user-profile.json`](./estados/user-profile.json)
  * Provee nombre (`Diego Bueno`), iniciales (`DB`), departamento, tokens consumidos y cuota mensual (100,000 tokens).

### 6.2 Configuración de Modelos e Inferencia
* **Método:** `GET`
* **Ruta:** `/api/v1/estados/modelos`
* **Response (200 OK):** [`estructura/estados/models-config.json`](./estados/models-config.json)

### 6.3 Estado Global de Infraestructura DOJO 2.0
* **Método:** `GET`
* **Ruta:** `/api/v1/estados/sistema`
* **Response (200 OK):** [`estructura/estados/system-status.json`](./estados/system-status.json)
  * Métricas en vivo: 1,240 microservicios monitoreados, 7 regiones cloud, latencia P99 de 78.4ms, estado del cluster EKS y disponibilidad SLA del 99.98%.
