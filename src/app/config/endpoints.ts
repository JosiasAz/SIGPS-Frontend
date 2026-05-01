export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    ME: '/api/v1/auth/me',
  },
  PACIENTES: {
    BASE: '/api/v1/pacientes',
    BY_ID: (id: number | string) => `/api/v1/pacientes/${id}`,
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
    BASE: '/api/v1/fila',
    ATENDER: '/api/v1/fila/atender',
    IA_ANALYSIS: '/api/v1/fila/analise-ia',
  },
  CHAT: {
    BASE: '/api/v1/chat',
    MESSAGES: '/api/v1/chat/messages',
    READ: '/api/v1/chat/messages/read',
    WS: '/ws/chat',
  },
  EXAMES: {
    BASE: '/api/v1/exames',
    UPLOAD: '/api/v1/exames/upload',
  },
  RELATORIOS: {
    KPIS: '/api/v1/relatorios/kpis',
  },
  CONFIG: '/api/v1/config',
};
