# DOJO 2.0 • Estructuras JSON para Integración con Backend

Este directorio contiene la definición completa y los ejemplos JSON de los contratos que el frontend de **DOJO 2.0** requiere para comunicarse con el backend.

Para la guía detallada de integración, cabeceras, rutas y modelos TypeScript, consulta el documento principal:
👉 **[CONTRATO_API_BACKEND.md](./CONTRATO_API_BACKEND.md)**

---

## Índice Rápido de Esquemas JSON

| Módulo | Archivo JSON | Descripción |
| :--- | :--- | :--- |
| **Chat** | [`chat/conversations.json`](./chat/conversations.json) | Listado del historial de conversaciones en la barra lateral. |
| **Chat** | [`chat/messages.json`](./chat/messages.json) | Mensajes detallados por hilo con estados interactivos y citas RAG. |
| **Chat** | [`chat/send-message-request.json`](./chat/send-message-request.json) | Payload enviado desde el frontend al disparar una consulta. |
| **Chat** | [`chat/message-response.json`](./chat/message-response.json) | Respuesta completa síncrona devuelta por el modelo. |
| **Chat** | [`chat/streaming-events.json`](./chat/streaming-events.json) | Flujo de eventos Server-Sent Events (SSE) para streaming en vivo. |
| **Fuentes** | [`fuentes/fuentes-repository.json`](./fuentes/fuentes-repository.json) | Repositorio de documentos de la base de conocimiento corporativa. |
| **Fuentes** | [`fuentes/cita-rag-detalle.json`](./fuentes/cita-rag-detalle.json) | Telemetría vectorial completa (similitud coseno, tokens, página) para el visor RAG. |
| **Fuentes** | [`fuentes/search-fuentes-request.json`](./fuentes/search-fuentes-request.json) | Payload de búsqueda semántica híbrida. |
| **Fuentes** | [`fuentes/search-fuentes-response.json`](./fuentes/search-fuentes-response.json) | Chunks y documentos encontrados en la base vectorial. |
| **Upload** | [`upload/upload-request.json`](./upload/upload-request.json) | Solicitud de subida de logs, trazas OpenTelemetry o métricas. |
| **Upload** | [`upload/upload-response.json`](./upload/upload-response.json) | Confirmación de recepción de archivo con URL e ID de tarea. |
| **Upload** | [`upload/upload-queue-status.json`](./upload/upload-queue-status.json) | Estado de procesamiento y progreso de vectorización en cola. |
| **Upload** | [`upload/escaneo-forense-result.json`](./upload/escaneo-forense-result.json) | Resultado de análisis forense con hash SHA-256 autenticado y diagnóstico RCA. |
| **Estados** | [`estados/user-profile.json`](./estados/user-profile.json) | Perfil de sesión, cuota de tokens y permisos de **Diego Bueno**. |
| **Estados** | [`estados/models-config.json`](./estados/models-config.json) | Modelos LLM disponibles (Gemini 1.5 Pro, Flash, Gemma) y parámetros de inferencia. |
| **Estados** | [`estados/system-status.json`](./estados/system-status.json) | Estado de salud de clusters EKS, microservicios monitoreados y SLA. |
