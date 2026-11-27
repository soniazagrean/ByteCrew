const DEV_ORIGIN = 'http://localhost:5173'; // Vite dev server

/**
 * Browser origins allowed to call the API: the comma-separated CORS_ORIGINS.
 * When it is unset, only local development allows the Vite dev server.
 */
export function corsOrigins(env: NodeJS.ProcessEnv = process.env): string[] {
  const configured = (env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  if (configured.length) return configured;
  return (env.NODE_ENV || 'development') === 'development' ? [DEV_ORIGIN] : [];
}
