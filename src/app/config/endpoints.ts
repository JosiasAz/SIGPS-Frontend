export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    ME: '/api/v1/auth/me',
  },
  PACIENTES: {
    BASE: '/api/v1/patients',
    BY_ID: (id: number | string) => `/api/v1/patients/${id}`,
  },
  ESPECIALISTAS: {
    BASE: '/api/v1/especialistas',
    BY_ID: (id: number | string) => `/api/v1/especialistas/${id}`,
  },
  AGENDAS: {
    BASE: '/api/v1/agendas',
    BY_ID: (id: number | string) => `/api/v1/agendas/${id}`,
    AGENDAR: '/api/v1/agendas/agendar',
    CONSULTAS: '/api/v1/agendas/consultas',
    STATUS_CONSULTA: (id: number | string) => `/api/v1/agendas/consultas/${id}/status`,
  },
  FILA: {
    BASE: '/api/v1/queue',
    ATENDER: '/api/v1/queue/check-in',
    IA_ANALYSIS: '/api/v1/queue/ai-analysis',
  },
  CHAT: {
    BASE: '/api/v1/chat',
    CONVERSATIONS: '/api/v1/chat/conversations',
    MESSAGES: (otherId: number) => `/api/v1/chat/messages/${otherId}`,
    READ: (otherId: number) => `/api/v1/chat/messages/${otherId}/read`,
    WS: '/ws/chat',
  },
  EXAMES: {
    BASE: '/api/v1/exams',
    UPLOAD: '/api/v1/exams/upload',
  },
  RELATORIOS: {
    KPIS: '/api/v1/relatorios/kpis',
  },
  CONFIG: '/api/v1/config',
};
