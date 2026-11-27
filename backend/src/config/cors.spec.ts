import { corsOrigins } from './cors';

describe('corsOrigins', () => {
  it('allows the Vite dev server by default in development', () => {
    expect(corsOrigins({})).toEqual(['http://localhost:5173']);
    expect(corsOrigins({ NODE_ENV: 'development' })).toEqual(['http://localhost:5173']);
  });

  it('allows nothing by default in deployed environments', () => {
    expect(corsOrigins({ NODE_ENV: 'staging' })).toEqual([]);
    expect(corsOrigins({ NODE_ENV: 'production' })).toEqual([]);
  });

  it('parses a comma-separated list and drops trailing slashes', () => {
    expect(
      corsOrigins({ NODE_ENV: 'production', CORS_ORIGINS: ' https://a.example/, https://b.example ,' }),
    ).toEqual(['https://a.example', 'https://b.example']);
  });
});
