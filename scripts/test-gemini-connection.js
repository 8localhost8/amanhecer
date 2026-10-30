import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';

// Load .env
const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[match[1]] = value.trim();
    }
  });
}

const writerKey = process.env.GEMINI_WRITER_API_KEY;
const reviewerKey = process.env.GEMINI_REVIEWER_API_KEY;

console.log('[Amanhecer] Testando conexão com a API do Google Gemini...');

async function testConnection() {
  try {
    console.log('[1/2] Testando Gemini Escritor...');
    const writerAi = new GoogleGenAI({ apiKey: writerKey });
    const writerRes = await writerAi.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Responda em uma palavra: Ok.',
    });
    console.log('✅ Gemini Escritor conectado com sucesso! Resposta:', writerRes.text?.trim());

    console.log('[2/2] Testando Gemini Revisor...');
    const reviewerAi = new GoogleGenAI({ apiKey: reviewerKey });
    const reviewerRes = await reviewerAi.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Responda em uma palavra: Ok.',
    });
    console.log('✅ Gemini Revisor conectado com sucesso! Resposta:', reviewerRes.text?.trim());

    console.log('\n🎉 Ambas as chaves de API estão plenamente ativas e funcionais!');
  } catch (err) {
    console.error('❌ Erro na validação das chaves Gemini:', err.message || err);
  }
}

testConnection();
