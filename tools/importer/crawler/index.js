/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable class-methods-use-this, no-console */

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import Excel from 'exceljs';

const urls = [];

async function main(startPageURL) {
  const startTime = new Date().getTime();

  const origin = new URL(startPageURL).origin;
  try {
    await explore(startPageURL, origin);
  } catch (error) {
    console.error(` Error while exploring`, error);
  }

  const rows = [['urls']];
  urls.forEach(u => {
    rows.push([u]);
  });

  const workbook = new Excel.Workbook();
  const sheet = workbook.addWorksheet('helix-default');
  sheet.addRows(rows);
  await workbook.xlsx.writeFile(`urls.xlsx`);

  console.log();
  console.log(`Crawled ${urls.length} pages.`);
  console.log(`Process took ${(new Date().getTime() - startTime) / 1000}s.`);

}

async function explore(url, origin) {
  if (urls.includes(url)) return;
  urls.push(url);
  console.log(`Exploring ${url}`);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const res = await fetch(url);
  if (res.ok) {
    
    const text = await res.text();

    if (text) {
      const { document } = new JSDOM(text).window;

      const links = document.querySelectorAll('a');
      if (links) {
        const promises = [];
        links.forEach((a) => {
          if (a.href) {
            let target = a.href;
            if (a.href.startsWith('/')) {
              target = new URL(a.href, url).toString();
            }
            const targetURL = new URL(target);
            if (targetURL.origin === origin && !urls.includes(target)) {
              promises.push(explore(target, origin));
            }
          }
        });

        await Promise.all(promises);
      }
    }
  } else {
    console.warn(`Failed exploring ${url}`);
  }
}

try {
  await main('https://www.westjet.com/book/last-minute-flights');
  // await main('https://blog.adobe.com');
} catch (error) {
  console.error(error);
}