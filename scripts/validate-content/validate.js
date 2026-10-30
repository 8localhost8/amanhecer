import fs from 'node:fs';
import path from 'node:path';
import { validateDevotionalDeterministically } from '../../src/services/ai/deterministic-validator.js';

const targetFile = process.argv[2];
if (!targetFile) {
  console.error('[Amanhecer Validador] Informe o caminho do arquivo JSON do devocional.');
  process.exit(1);
}

const raw = fs.readFileSync(path.resolve(targetFile), 'utf-8');
const devotional = JSON.parse(raw);

console.log(`[Amanhecer Validador] Iniciando validação determinística sem IA para: ${devotional.title || devotional.id}`);

const result = validateDevotionalDeterministically(devotional);

if (result.isValid) {
  console.log('✅ Validação determinística APROVADA: Cânon, versículos e catálogo validados.');
  process.exit(0);
} else {
  console.error('❌ Validação determinística REPROVADA:');
  result.errors.forEach(err => console.error(` - ${err}`));
  if (result.criticalErrors.length > 0) {
    console.error('Erros críticos:');
    result.criticalErrors.forEach(err => console.error(` [${err.code}]: ${err.explanation}`));
  }
  process.exit(1);
}
