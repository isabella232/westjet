/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable no-console, class-methods-use-this */

const createLFFBlock = (main, document) => {
  const section = main.querySelector('.gray-area.section');
  if (section) {
    const data = [['Low Fare Finder']];
    const content = section.querySelector('.container-copy');
    if (content) {
      data.push([content]);
    }

    const table = WebImporter.DOMUtils.createTable(data, document);
    section.replaceWith(table);
  }
}

const createFlightslock = (main, document) => {
  const container = main.querySelector('.tab-accordion-container');
  if (container) {
    const data = [['Fligts']];
    const accordions = container.querySelectorAll('.tab-accordion');
    if (accordions) {
      accordions.forEach((a) => {
        data.push([a]);
      });
    }

    const table = WebImporter.DOMUtils.createTable(data, document);
    container.replaceWith(table);
  }
}

const createAirportDetailsBlock = (main, document) => {
  const section = main.querySelector('.airInfo');
  if (section) {
    const data = [['Airport Details']];
    const text = section.innerHTML.trim().replace('Airport Details: ', '');
    data.push([text]);

    const table = WebImporter.DOMUtils.createTable(data, document);
    section.replaceWith(table);
  }
}

const makeAbsoluteLinks = (main) => {
  main.querySelectorAll('a').forEach((a) => {
    if (a.href.startsWith('/')) {
      const u = new URL(a.href, 'https://main--westjet--hlxsites.hlx3.page/');
      a.href = u.toString();
    }
  });
}

function createMetadata(main, document) {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  const desc = document.querySelector('[name="description"]');
  if (desc) {
    meta.Description = desc.content;
  }
  
  const author = document.querySelector('[name="author"]');
  if (author) {
    meta.Author = author.content;
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
}

export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  transformDOM: (document) => {
    // simply return the body, no transformation (yet)
    const remove = document.querySelectorAll('header, footer');
    if (remove) {
      remove.forEach((element) => { element.remove(); });
    }

    const main = document.getElementById('main-content');

    createLFFBlock(main, document);
    createFlightslock(main, document);
    createAirportDetailsBlock(main, document);
    createMetadata(main, document);
    makeAbsoluteLinks(main);

    WebImporter.DOMUtils.remove(main, [
      '.tab-nav'
    ]);

    return main;

  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {String} url The url of the document being transformed.
   * @param {HTMLDocument} document The document
   */
  generateDocumentPath: (url) => {
    return new URL(url).pathname.replace(/\/$/, '');
  },
}