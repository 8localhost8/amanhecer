import fs from 'node:fs';
import path from 'node:path';

// Policy: REVIEW (requires manual approval file) or AUTO
const EDITORIAL_POLICY = process.env.EDITORIAL_POLICY || 'REVIEW';
const targetDate = process.argv[2];

if (!targetDate) {
  console.error('[Publicador Amanhecer] Informe a data a ser publicada (YYYY-MM-DD).');
  process.exit(1);
}

console.log(`[Publicador Amanhecer] Verificando devocional para a data: ${targetDate} (Política: ${EDITORIAL_POLICY})`);

const candidateFile = path.resolve('editorial', 'evaluations', `evaluation-${targetDate}.json`);
if (!fs.existsSync(candidateFile)) {
  console.error(`[Publicador Amanhecer] Relatório de avaliação para ${targetDate} não encontrado.`);
  process.exit(1);
}

const evaluation = JSON.parse(fs.readFileSync(candidateFile, 'utf-8'));

if (!evaluation.approvedByAI) {
  console.error(`[Publicador Amanhecer] Conteúdo não foi aprovado pela IA (Nota: ${evaluation.weightedScore}/100). Publicação bloqueada.`);
  process.exit(1);
}

if (EDITORIAL_POLICY === 'REVIEW' && !evaluation.humanApproved) {
  console.warn(`[Publicador Amanhecer] Política REVIEW ativa: Devocional aguardando confirmação editorial humana. Não publicado automaticamente.`);
  process.exit(0);
}

console.log(`[Publicador Amanhecer] Publicação autorizada para ${targetDate}!`);
