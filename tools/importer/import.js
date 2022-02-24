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

    // const main = document.getElementById('main-content');
    // return main;

    document.querySelectorAll('section, div').forEach((section) => {
      const img = WebImporter.DOMUtils.getImgFromBackground(section, document);
      if (img) {
        section.before(img);
      }
    });

    return document.body;

  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {String} url The url of the document being transformed.
   * @param {HTMLDocument} document The document
   */
  generateDocumentPath: (url, document) => {
    return new URL(url).pathname.replace(/\/$/, '');
  },
}