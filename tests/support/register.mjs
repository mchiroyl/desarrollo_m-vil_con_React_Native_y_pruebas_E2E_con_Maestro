import { registerHooks } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'expo-crypto') {
      return { url: new URL('./crypto.mjs', import.meta.url).href, shortCircuit: true };
    }
    if (specifier.startsWith('@/')) {
      const path = fileURLToPath(new URL(`src/${specifier.slice(2)}`, root));
      for (const suffix of ['.ts', '.tsx']) {
        if (existsSync(path + suffix)) {
          return { url: pathToFileURL(path + suffix).href, shortCircuit: true };
        }
      }
    }
    return nextResolve(specifier, context);
  },
});
