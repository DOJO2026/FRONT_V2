export interface MessageSource {
  id: string;
  title: string;
  url?: string;
  page?: number;
  snippet: string;
  confidence: number;
  category?: string;
}

export interface ChatMessagesRequest {
  conversationId: string;
  content: string;
  modelId: string;
  temperature: number;
  reasoningDepth: 'disabled' | 'standard' | 'deep';
  stream: boolean;
  attachedDocs: string[];
}

export interface ChatMessageApiResponse {
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Array<{ title: string; url?: string }>;
  status?: 'sending' | 'thinking' | 'streaming' | 'complete' | 'error';
  feedback?: 'up' | 'down' | null;
  modelUsed?: string;
  interactiveType?: 'claim_prompt_request' | 'claim_ask_attachment' | 'claim_uploader' | 'claim_scanned_result';
  claimDetails?: {
    claimNumber: string;
    status: string;
    description?: string;
    policyNumber?: string;
  };
  blocked?: boolean;
  toolsUsed?: string[];
}

export interface ChatValidationError {
  detail: Array<{
    loc: Array<string | number>;
    msg: string;
    type: string;
    input?: unknown;
    ctx?: Record<string, unknown>;
  }>;
}

export interface ScannedAttachment {
  name: string;
  size: string;
  type: string;
  sha256: string;
  previewUrl?: string;
  ocrExtractedData?: {
    claimNumber: string;
    incidentDate: string;
    policyNumber: string;
    declaredAmount: string;
    category: string;
    confidenceScore: number;
    issuer: string;
  };
}

export interface ScannedAttachmentState {
  file?: ScannedAttachment;
  isScanning?: boolean;
  scanProgress?: number;
  scanStep?: string;
  isProcessed?: boolean;
}

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
  attachmentState?: ScannedAttachmentState;
  claimDetails?: {
    claimNumber: string;
    status: string;
    description?: string;
    policyNumber?: string;
  };
}

export interface ChatSuggestion {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: 'document' | 'sparkles' | 'search' | 'settings';
  category: string;
}
