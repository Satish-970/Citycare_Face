import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const apiUrl =
  process.env.VITE_API_BASE_URL ||
  process.env.NG_APP_API_BASE_URL ||
  process.env.API_BASE_URL ||
  'http://localhost:7070';

const normalizedApiUrl = apiUrl.replace(/\/+$/, '');
const target = resolve('src/environments/environment.generated.ts');
const body = `export const generatedEnvironment = {
  apiUrl: ${JSON.stringify(normalizedApiUrl)},
};
`;

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, body);

console.log(`Using API base URL: ${normalizedApiUrl}`);
