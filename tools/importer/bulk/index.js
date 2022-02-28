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

import { FSHandler, Utils } from '@adobe/helix-importer';

import fs from 'fs-extra';
import Excel from 'exceljs';

import Importer from './importer.js';
import getEntries from './entries.js';

import projectModuleImport from '../import.js';

/* eslint-disable no-console */

const TARGET_HOST = 'https://main--westjet--hlxsites.hlx3.page';

async function main() {
  // tslint:disable-next-line: no-empty
  const noop = () => {};

  const customLogger = {
    debug: noop,
    info: noop,
    log: noop,
    warn: (...args) => console.log(args),
    error: (...args) => console.error(args),
  };

  const handler = new FSHandler('.import/output/', customLogger);

  const entries = await getEntries(`${TARGET_HOST}/_drafts/import/crawledurls.json?limit=5494`);

  const importer = new Importer({
    storageHandler: handler,
    cache: '.import/cache/',
    // skipDocxConversion: true,
    skipMDFileCreation: true,
    logger: customLogger,
    projectModuleImport
  });

  const imported = [[
    'source',
    'file',
  ]];

  const errors = [[
    'url',
  ]];

  await Utils.asyncForEach(entries, async (e, index) => {
    try {
      const resources = await importer.import(e, { target: TARGET_HOST, entries });

      resources.forEach((entry) => {
        console.log(`${index} - ${entry.source} -> ${entry.docx || entry.md}`);
        imported.push([
          entry.source,
          entry.docx,
        ]);
      });
    } catch (error) {
      errors.push([e]);
      console.error(`${index} - Could not import ${e}`, error);
    }
  });

  const createExcelFile = async (fileName, rows) => {
    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet('helix-default');
    sheet.addRows(rows);
    const dir = '.import/output/';
    await fs.ensureDir(dir);
    await workbook.xlsx.writeFile(`${dir}/${fileName}.xlsx`);
  }

  await createExcelFile('imported', imported);
  await createExcelFile('errors', errors);

  console.log('Done');
}

main();
