/**
 * Ambiente local (ng serve). Produção/Vercel usam environment.ts → api.sigps.online
 */
export const environment = {
    production: false,
    useMock: false,
    apiUrl: 'http://127.0.0.1:5000',
};
