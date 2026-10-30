import { selectDailyVerse, getSaoPauloDateString } from '../../src/services/daily-verse/selection-engine.js';
import fs from 'node:fs';
import path from 'node:path';

const targetDate = process.argv[2] || getSaoPauloDateString();
console.log(`[Amanhecer] Selecionando passagem bíblica para a data: ${targetDate}`);

const selected = selectDailyVerse(targetDate);
console.log(`[Amanhecer] Passagem selecionada com sucesso: ${selected.reference}`);
console.log(`[Amanhecer] Tema: ${selected.theme}`);
console.log(`[Amanhecer] Texto: "${selected.text}"`);

const outputDir = path.resolve('editorial', 'evaluations');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const outputFile = path.join(outputDir, `selected-passage-${targetDate}.json`);
fs.writeFileSync(outputFile, JSON.stringify(selected, null, 2), 'utf-8');
console.log(`[Amanhecer] Passagem gravada em: ${outputFile}`);
