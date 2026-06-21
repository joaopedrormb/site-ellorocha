import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const htmlFiles = [
  'index.html',
  'a-familia.html',
  'especialidades.html',
  'contato.html',
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
  'lado-fora-mesinha.jpg',
  'consultorio-1.jpg',
  'familia-trabalhando.jpg',
  'familia-rocha-retrato.webp',
  'familia-rocha-mesa.webp',
  'familia-rocha-fachada.webp',
  'perfil-ester-exemplo.webp',
  'perfil-larissa-exemplo.webp',
  'perfil-stephanie-exemplo.webp',
  'tratamento-estetica.webp',
  'tratamento-implantes.webp',
  'tratamento-endodontia.webp',
  'tratamento-clinica-geral.webp',
  'tratamento-proteses.webp',
  'dra-ester.jpg',
  'dra-larissa.jpg',
  'dra-stephanie.jpg',
  'brinde-ello-1.jpg',
  'brinde-ello-2.jpg',
  'antes-depois-1.jpeg',
  'sorriso-1.jpg',
  'implantes-apoio.png',
  'implantes-apoio.webp',
  'endodontia-apoio.png',
  'endodontia-apoio.webp',
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
if (!index.includes('5 áreas')) {
  errors.push('Home proof does not say "5 áreas".');
}
if (!index.includes('href="especialidades.html"') && !index.includes('href="especialidades.html#')) {
  errors.push('Home missing link to unified specialties page.');
}
if (!index.includes('href="contato.html"')) {
  errors.push('Home missing link to contact page.');
}
for (const visibleFile of ['index.html', 'a-familia.html', 'especialidades.html', 'contato.html']) {
  if ((contents.get(visibleFile) || '').includes('index.html#contato')) {
    errors.push(`${visibleFile} still links to home contact anchor.`);
  }
}
if (index.includes('id="contato"')) {
  errors.push('Home still has the full contact section instead of using contato.html.');
}
for (const hiddenServiceLink of ['href="estetica.html"', 'href="implantes.html"', 'href="endodontia.html"', 'href="clinica-geral.html"']) {
  for (const visibleFile of ['index.html', 'a-familia.html', 'especialidades.html']) {
    if ((contents.get(visibleFile) || '').includes(hiddenServiceLink)) {
      errors.push(`${visibleFile} still links to hidden service route: ${hiddenServiceLink}`);
    }
  }
}
for (const img of ['fachada-ellorocha.jpg', 'perfil-ester-exemplo.webp', 'perfil-larissa-exemplo.webp', 'perfil-stephanie-exemplo.webp']) {
  if (!index.includes(`assets/img/${img}`)) {
    errors.push(`Home missing image: ${img}`);
  }
}
if (!index.includes('assets/img/lado-fora-mesinha.jpg')) {
  errors.push('Home missing external space image: lado-fora-mesinha.jpg');
}
if (!index.includes('Espaço externo')) {
  errors.push('Home missing "Espaço externo" caption.');
}
if (!index.includes('assets/img/familia-rocha-retrato.webp')) {
  errors.push('Home missing generated family portrait concept.');
}
if (!index.includes('FOTO EXEMPLO - TIRAR ESSA FOTO')) {
  errors.push('Home missing example-photo label text.');
}
if (!index.includes('Mãe e filhas trabalhando lado a lado, com áreas que se completam')) {
  errors.push('Home family text still needs the real public-facing copy.');
}
for (const treatmentImage of ['tratamento-estetica.webp', 'tratamento-implantes.webp', 'tratamento-endodontia.webp', 'tratamento-clinica-geral.webp', 'tratamento-proteses.webp']) {
  if (!index.includes(`assets/img/${treatmentImage}`)) {
    errors.push(`Home specialties missing treatment image: ${treatmentImage}`);
  }
}
for (const treatmentTitle of ['Limpeza, prevenção e cáries', 'Estética dental', 'Implantes &amp; cirurgias', 'Próteses dentárias', 'Endodontia']) {
  if (!index.includes(treatmentTitle)) {
    errors.push(`Home specialties missing treatment title: ${treatmentTitle}`);
  }
}
for (const heavyImage of ['assets/img/implantes-apoio.png', 'assets/img/endodontia-apoio.png']) {
  if (allHtml.includes(heavyImage)) {
    errors.push(`Heavy PNG still referenced in rendered HTML: ${heavyImage}`);
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
if (!sitemap.includes('especialidades.html')) {
  errors.push('Sitemap missing especialidades.html.');
}
if (!sitemap.includes('contato.html')) {
  errors.push('Sitemap missing contato.html.');
}
for (const hiddenRoute of ['estetica.html', 'implantes.html', 'endodontia.html', 'clinica-geral.html']) {
  if (sitemap.includes(hiddenRoute)) {
    errors.push(`Sitemap still exposes hidden service route: ${hiddenRoute}`);
  }
}

const especialidades = contents.get('especialidades.html') || '';
for (const sectionId of ['limpeza', 'estetica', 'implantes', 'proteses', 'endodontia']) {
  if (!especialidades.includes(`id="${sectionId}"`)) {
    errors.push(`Unified specialties page missing section: ${sectionId}`);
  }
}
for (const title of ['Limpeza, prevenção e cáries', 'Estética dental', 'Implantes e cirurgias', 'Próteses dentárias', 'Endodontia']) {
  if (!especialidades.includes(title)) {
    errors.push(`Unified specialties page missing title: ${title}`);
  }
}
for (const treatmentImage of ['tratamento-estetica.webp', 'tratamento-implantes.webp', 'tratamento-endodontia.webp', 'tratamento-clinica-geral.webp', 'tratamento-proteses.webp']) {
  if (!especialidades.includes(`assets/img/${treatmentImage}`)) {
    errors.push(`Unified specialties page missing treatment image: ${treatmentImage}`);
  }
}
for (const requiredTerm of ['Tratamento de cáries', 'Clareamento dental', 'Extrações e cirurgia de sisos', 'Enxertos ósseos', 'L-PRF', 'Pino/núcleo intrarradicular', 'Prótese sobre implante']) {
  if (!especialidades.includes(requiredTerm)) {
    errors.push(`Unified specialties page missing term: ${requiredTerm}`);
  }
}
for (const forbiddenSpecialtyImage of ['assets/img/consultorio-1.jpg', 'assets/img/sala-atendimento.jpg', 'assets/img/dra-larissa.jpg', 'assets/img/dra-stephanie.jpg']) {
  if (especialidades.includes(forbiddenSpecialtyImage)) {
    errors.push(`Unified specialties page still uses non-treatment image: ${forbiddenSpecialtyImage}`);
  }
}

const contato = contents.get('contato.html') || '';
for (const required of ['WhatsApp', 'Endere', 'Instagram', 'data-contact', 'fachada-ellorocha.jpg', 'recepcao.jpg']) {
  if (!contato.includes(required)) {
    errors.push(`Contact page missing: ${required}`);
  }
}
if (!contato.includes('assets/img/familia-rocha-fachada.webp')) {
  errors.push('Contact page missing generated family facade concept.');
}
if (!contato.includes('FOTO EXEMPLO - TIRAR ESSA FOTO')) {
  errors.push('Contact page missing example-photo label text.');
}

const familia = contents.get('a-familia.html') || '';
if (!familia.includes('assets/img/familia-rocha-mesa.webp')) {
  errors.push('Family page missing generated seated family concept.');
}
if (!familia.includes('FOTO EXEMPLO - TIRAR ESSA FOTO')) {
  errors.push('Family page missing example-photo label text.');
}
for (const profileImage of ['perfil-ester-exemplo.webp', 'perfil-larissa-exemplo.webp', 'perfil-stephanie-exemplo.webp']) {
  if (!familia.includes(`assets/img/${profileImage}`)) {
    errors.push(`Family page missing generated profile image: ${profileImage}`);
  }
}
if (!familia.includes('Nos bastidores do cuidado')) {
  errors.push('Family page missing behind-the-scenes section for current real photos.');
}

for (const hiddenFile of ['estetica.html', 'implantes.html', 'endodontia.html', 'clinica-geral.html']) {
  const hiddenContent = contents.get(hiddenFile) || '';
  if (!hiddenContent.includes('<meta name="robots" content="noindex,follow">')) {
    errors.push(`${hiddenFile} is a hidden route but is not marked noindex.`);
  }
  for (const hiddenServiceLink of ['href="estetica.html"', 'href="implantes.html"', 'href="endodontia.html"', 'href="clinica-geral.html"']) {
    if (hiddenContent.includes(hiddenServiceLink)) {
      errors.push(`${hiddenFile} still promotes hidden service route: ${hiddenServiceLink}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Site content checks passed.');
