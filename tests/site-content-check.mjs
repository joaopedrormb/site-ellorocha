import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const htmlFiles = [
  'index.html',
  'a-familia.html',
  'clinica-geral.html',
  'estetica.html',
  'implantes.html',
  'endodontia.html',
  'sitemap.xml',
];

const requiredAssets = [
  'fachada-ellorocha.jpg',
  'recepcao.jpg',
  'recepcao-1.jpg',
  'sala-atendimento.jpg',
  'consultorio-1.jpg',
  'familia-trabalhando.jpg',
  'dra-ester.jpg',
  'dra-larissa.jpg',
  'dra-stephanie.jpg',
  'brinde-ello-1.jpg',
  'brinde-ello-2.jpg',
  'antes-depois-1.jpeg',
  'implantes-apoio.png',
  'endodontia-apoio.png',
];

const errors = [];

async function read(file) {
  try {
    return await fs.readFile(path.join(root, file), 'utf8');
  } catch {
    errors.push(`Missing file: ${file}`);
    return '';
  }
}

for (const asset of requiredAssets) {
  try {
    await fs.access(path.join(root, 'assets/img', asset));
  } catch {
    errors.push(`Missing copied asset: assets/img/${asset}`);
  }
}

const contents = new Map();
for (const file of htmlFiles) {
  contents.set(file, await read(file));
}
const allHtml = [...contents.values()].join('\n');

for (const forbidden of ['Coisas p o site/', 'sorrisos de verdade', 'feito à mão', 'Clínica geral &amp; endodontia', 'Clínica geral & endodontia']) {
  if (allHtml.toLowerCase().includes(forbidden.toLowerCase())) {
    errors.push(`Forbidden content still present: ${forbidden}`);
  }
}

const index = contents.get('index.html') || '';
if (!index.includes('3 especialidades + clínico geral')) {
  errors.push('Home proof does not say "3 especialidades + clínico geral".');
}
for (const link of ['estetica.html', 'implantes.html', 'endodontia.html', 'clinica-geral.html']) {
  if (!index.includes(`href="${link}"`)) {
    errors.push(`Home missing service link: ${link}`);
  }
}
for (const img of ['fachada-ellorocha.jpg', 'dra-ester.jpg', 'dra-larissa.jpg', 'dra-stephanie.jpg']) {
  if (!index.includes(`assets/img/${img}`)) {
    errors.push(`Home missing image: ${img}`);
  }
}

const clinica = contents.get('clinica-geral.html') || '';
if (!clinica.toLowerCase().includes('limpeza') || !clinica.toLowerCase().includes('restaura')) {
  errors.push('Clínica geral page is not focused on limpeza/restaurações.');
}
if (clinica.toLowerCase().includes('tratamento de canal')) {
  errors.push('Clínica geral still contains treatment-of-canal positioning.');
}

const endodontia = contents.get('endodontia.html') || '';
for (const term of ['tratamento de canal', 'dor', 'preservar', 'Dra. Larissa']) {
  if (!endodontia.includes(term)) {
    errors.push(`Endodontia page missing: ${term}`);
  }
}

const sitemap = contents.get('sitemap.xml') || '';
if (!sitemap.includes('endodontia.html')) {
  errors.push('Sitemap missing endodontia.html.');
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Site content checks passed.');
