/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Node.js script to run automated functional tests in Chrome, via webdriver.
 * This file is to be used in the suiteSetup for any automated fuctional test.
 */

const webdriverio = require('webdriverio');
const path = require('path');
const {posixPath} = require('../../../scripts/helpers');

let browser;
async function testSetup(testFile) {
  let url;
  const options = {
    capabilities: {
      'browserName': 'chrome',
      'goog:chromeOptions': {
        args: ['--allow-file-access-from-files'],
      },
    },
    services: [['selenium-standalone']],
    logLevel: 'warn',
  };

  // Run in headless mode on Github Actions.
  if (process.env.CI) {
    options.capabilities['goog:chromeOptions'].args.push(
      '--headless',
      '--no-sandbox',
      '--disable-dev-shm-usage'
    );
  } else {
    // --disable-gpu is needed to prevent Chrome from hanging on Linux with
    // NVIDIA drivers older than v295.20. See
    // https://github.com/google/blockly/issues/5345 for details.
    options.capabilities['goog:chromeOptions'].args.push('--disable-gpu');
  }
  // Use Selenium to bring up the page
  if (testFile == testFileLocations.blockfactory) {
    url =
      'file://' +
      posixPath(
        path.join(__dirname, '..', '..', '..', 'demos', 'blockfactory')
      ) +
      '/index.html';
  } else if (testFile == testFileLocations.code) {
    url =
      'file://' +
      posixPath(path.join(__dirname, '..', '..', '..', 'demos', 'code')) +
      '/index.html';
  } else {
    url =
      'file://' +
      posixPath(path.join(__dirname, '..', '..')) +
      '/playground.html';
  }
  console.log(url);
  console.log('Starting webdriverio...');
  browser = await webdriverio.remote(options);
  console.log('Loading URL: ' + url);
  await browser.url(url);
  return browser;
}

const testFileLocations = {
  blockfactory: 0,
  code: 1,
  playground: 2,
};

async function getSelectedBlockId(browser) {
  return await browser.execute(() => {
    // Note: selected is an ICopyable and I am assuming that it is a BlockSvg.
    return Blockly.common.getSelected()?.id;
  });
}

/**
 * @param {Browser} browser The active WebdriverIO Browser object.
 * @return {WebElement} The selected block's root SVG element, as an interactable
 *     browser element.
 */
async function getSelectedBlockElement(browser) {
  const id = await getSelectedBlockId(browser);
  return getBlockElementById(browser, id);
}

/**
 * @param {Browser} browser The active WebdriverIO Browser object.
 * @param {string} id The ID of the Blockly block to search for.
 * @return {WebElement} The root SVG element of the block with the given ID, as an
 *     interactable browser element.
 */
async function getBlockElementById(browser, id) {
  const elem = await browser.$(`[data-id="${id}"]`);
  elem['id'] = id;
  return elem;
}
async function getCategory(browser, categoryName) {
  const categories = await browser.$$('.blocklyTreeLabel');

  let category;
  for (const c of categories) {
    const text = await c.getText();
    if (text === categoryName) {
      category = c;
    }
  }
  if (!category) throw Error();

  return category;
}

async function getNthBlockOfCategory(browser, categoryName, n) {
  const category = await getCategory(browser, categoryName);
  category.click();
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
  const block = await browser.$(
    `.blocklyFlyout .blocklyBlockCanvas > g:nth-child(${3 + n * 2})`
  );
  return block;
}

async function getBlockTypeFromCategory(browser, categoryName, blockType) {
  const category = await getCategory(browser, categoryName);
  category.click();
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec

  const id = await browser.execute((blockType) => {
    return Blockly.getMainWorkspace()
      .getFlyout()
      .getWorkspace()
      .getBlocksByType(blockType)[0].id;
  }, blockType);
  return getBlockElementById(browser, id);
}

async function getLocationOfBlockConnection(browser, id, connectionName) {
  return await browser.execute(
    (id, connectionName) => {
      const block = Blockly.getMainWorkspace().getBlockById(id);

      let connection;
      switch (connectionName) {
        case 'OUTPUT':
          connection = block.outputConnection;
          break;
        case 'PREVIOUS':
          connection = block.previousConnection;
          break;
        case 'NEXT':
          connection = block.nextConnection;
          break;
        default:
          connection = block.getInput(connectionName).connection;
          break;
      }

      const loc = Blockly.utils.Coordinate.sum(
        block.getRelativeToSurfaceXY(),
        connection.getOffsetInBlock()
      );
      return Blockly.utils.svgMath.wsToScreenCoordinates(
        Blockly.getMainWorkspace(),
        loc
      );
    },
    id,
    connectionName
  );
}

async function connect(
  browser,
  draggedBlock,
  draggedConnection,
  targetBlock,
  targetConnection
) {
  const draggedLocation = await getLocationOfBlockConnection(
    browser,
    draggedBlock.id,
    draggedConnection
  );
  const targetLocation = await getLocationOfBlockConnection(
    browser,
    targetBlock.id,
    targetConnection
  );

  const delta = {
    x: targetLocation.x - draggedLocation.x,
    y: targetLocation.y - draggedLocation.y,
  };
  await draggedBlock.dragAndDrop(delta);
}

async function dragNthBlockFromFlyout(browser, categoryName, n, x, y) { 
    const flyoutBlock = await getNthBlockOfCategory(
    browser,
    categoryName,
    n
  );
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
  await flyoutBlock.dragAndDrop({x: x, y: y});
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
  return await getSelectedBlockElement(browser);
};

module.exports = {
  testSetup,
  testFileLocations,
  getSelectedBlockElement,
  getSelectedBlockId,
  getBlockElementById,
  getCategory,
  getNthBlockOfCategory,
  getBlockTypeFromCategory,
  dragNthBlockFromFlyout,
  connect,
};
