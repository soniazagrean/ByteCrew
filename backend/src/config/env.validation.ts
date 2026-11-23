export type AppEnvironment = 'development' | 'staging' | 'production' | 'test';

const ENVIRONMENTS: AppEnvironment[] = ['development', 'staging', 'production', 'test'];
const REQUIRED = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const;
const MIN_SECRET_LENGTH = 32;

/**
 * Validates environment variables at startup (used by ConfigModule.validate).
 * Fails fast with every problem listed, instead of crashing later at runtime.
 */
export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const errors: string[] = [];
  const get = (k: string) => (typeof config[k] === 'string' ? (config[k] as string).trim() : '');

  const nodeEnv = (get('NODE_ENV') || 'development') as AppEnvironment;
  if (!ENVIRONMENTS.includes(nodeEnv)) {
    errors.push(`NODE_ENV must be one of: ${ENVIRONMENTS.join(', ')} (got "${nodeEnv}")`);
  }

  for (const key of REQUIRED) {
    if (!get(key)) errors.push(`${key} is required`);
  }

  if (get('DATABASE_URL') && !/^postgres(ql)?:\/\//.test(get('DATABASE_URL'))) {
    errors.push('DATABASE_URL must start with postgresql://');
  }

  const port = get('PORT');
  if (port && !(Number.isInteger(Number(port)) && Number(port) > 0 && Number(port) < 65536)) {
    errors.push('PORT must be a valid port number');
  }

  // Stricter rules for deployed environments
  if (nodeEnv === 'staging' || nodeEnv === 'production') {
    for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) {
      const v = get(key);
      if (v && (v.length < MIN_SECRET_LENGTH || /change_me/i.test(v))) {
        errors.push(`${key} must be at least ${MIN_SECRET_LENGTH} chars and not a dev placeholder in ${nodeEnv}`);
      }
    }
    if (get('JWT_ACCESS_SECRET') && get('JWT_ACCESS_SECRET') === get('JWT_REFRESH_SECRET')) {
      errors.push('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must differ');
    }
  }

  if (errors.length) {
    throw new Error(`Invalid environment configuration:\n - ${errors.join('\n - ')}`);
  }
  return config;
}
