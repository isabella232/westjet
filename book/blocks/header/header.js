import { readBlockConfig } from '../../scripts/scripts.js';

function setLinksToWj(element) {
  element.querySelectorAll('a').forEach((a) => {
    a.href = new URL(a.getAttribute('href'), 'https://www.westjet.com/');
  });
}

async function replaceNavContent(nav) {
  const resp = await fetch(`https://www.westjet.com/en-ca/integration/header`);
  const html = await resp.text();
  const div = document.createElement('div');
  div.innerHTML = html;
  setLinksToWj(div);
  nav.querySelectorAll('div').forEach((section, i) => i && section.remove());
  const h2s = div.querySelectorAll('.navbar-nav a.primary');
  h2s.forEach(a => {
    const text = a.textContent;
    const link = a.href;
    const ul = a.closest('li').querySelector('ul');
    const item = document.createElement('div');
    item.innerHTML = `<h2><a href="${link}">${text}</a></h2>`;
    if (ul) item.append(ul);
    nav.append(item);
  })
}

/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */

function collapseAllNavSections(sections) {
  sections.querySelectorAll('.nav-section').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch nav content
  const navPath = cfg.nav || '/nav';
  const resp = await fetch(`${navPath}.plain.html`);
  let html = await resp.text();
  html = html.replaceAll('/icons/', '/book/icons/');

  // decorate nav DOM
  const nav = document.createElement('div');
  nav.classList.add('nav');
  nav.setAttribute('aria-role', 'navigation');
  const navSections = document.createElement('div');
  navSections.classList.add('nav-sections');
  nav.innerHTML = html;
  await replaceNavContent(nav);
  nav.querySelectorAll(':scope > div').forEach((navSection, i) => {
    if (!i) {
      // first section is the brand section
      const brand = navSection;
      brand.classList.add('nav-brand');
    } else {
      // all other sections
      navSections.append(navSection);
      navSection.classList.add('nav-section');
      const h2 = navSection.querySelector('h2');
      if (h2) {
        h2.addEventListener('click', () => {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          collapseAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        });
      }
    }
  });
  nav.append(navSections);

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = '<div class="nav-hamburger-icon"></div>';
  hamburger.addEventListener('click', () => {
    const expanded = nav.getAttribute('aria-expanded') === 'true';
    document.body.style.overflowY = expanded ? '' : 'hidden';
    nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  });
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  block.append(nav);
}
