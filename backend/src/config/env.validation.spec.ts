import { validateEnv } from './env.validation';

const base = {
  DATABASE_URL: 'postgresql://app:app@localhost:5433/studentapp',
  JWT_ACCESS_SECRET: 'dev_access_secret_change_me',
  JWT_REFRESH_SECRET: 'dev_refresh_secret_change_me',
};
const strong = { JWT_ACCESS_SECRET: 'a'.repeat(40), JWT_REFRESH_SECRET: 'b'.repeat(40) };

describe('validateEnv', () => {
  it('accepts the dev defaults', () => {
    expect(() => validateEnv(base)).not.toThrow();
  });
  it('lists every missing required variable', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL is required[\s\S]*JWT_ACCESS_SECRET is required/);
  });
  it('rejects a non-postgres DATABASE_URL and unknown NODE_ENV', () => {
    expect(() => validateEnv({ ...base, DATABASE_URL: 'mysql://x' })).toThrow(/postgresql/);
    expect(() => validateEnv({ ...base, NODE_ENV: 'prod' })).toThrow(/NODE_ENV/);
  });
  it('rejects placeholder/weak secrets in production and staging', () => {
    expect(() => validateEnv({ ...base, NODE_ENV: 'production' })).toThrow(/at least 32/);
    expect(() => validateEnv({ ...base, NODE_ENV: 'staging' })).toThrow(/at least 32/);
  });
  it('rejects identical access/refresh secrets in production', () => {
    const s = 'x'.repeat(40);
    expect(() =>
      validateEnv({ ...base, NODE_ENV: 'production', JWT_ACCESS_SECRET: s, JWT_REFRESH_SECRET: s }),
    ).toThrow(/must differ/);
  });
  it('accepts strong secrets in production', () => {
    expect(() => validateEnv({ ...base, ...strong, NODE_ENV: 'production' })).not.toThrow();
  });
});
