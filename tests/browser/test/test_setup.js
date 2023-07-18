/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Node.js script to run automated functional tests in
 * Chrome, via webdriver.
 *
 * This file is to be used in the suiteSetup for any automated fuctional test.
 *
 * Note: In this file many functions return browser elements that can
 * be clicked or otherwise interacted with through Selenium WebDriver. These
 * elements are not the raw HTML and SVG elements on the page; they are
 * identifiers that Selenium can use to find those elements.
 */

const webdriverio = require('webdriverio');
const path = require('path');
const {posixPath} = require('../../../scripts/helpers');

let browser;
async function testSetup(url) {
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
  console.log('Starting webdriverio...');
  browser = await webdriverio.remote(options);
  console.log('Loading URL: ' + url);
  await browser.url(url);
  return browser;
}

const testFileLocations = {
  BLOCK_FACTORY:
    'file://' +
    posixPath(path.join(__dirname, '..', '..', '..', 'demos', 'blockfactory')) +
    '/index.html',
  CODE_DEMO:
    'file://' +
    posixPath(path.join(__dirname, '..', '..', '..', 'demos', 'code')) +
    '/index.html',
  PLAYGROUND:
    'file://' +
    posixPath(path.join(__dirname, '..', '..')) +
    '/playground.html',
};

/**
 * Enum for both LTR and RTL use cases.
 *
 * @readonly
 * @enum {number}
 */
const screenDirection = {
  RTL: -1,
  LTR: 1,
};

/**
 * @param browser The active WebdriverIO Browser object.
 * @return A Promise that resolves to the ID of the currently selected block.
 */
async function getSelectedBlockId(browser) {
  return await browser.execute(() => {
    // Note: selected is an ICopyable and I am assuming that it is a BlockSvg.
    return Blockly.common.getSelected()?.id;
  });
}

/**
 * @param browser The active WebdriverIO Browser object.
 * @return A Promise that resolves to the selected block's root SVG element,
 *     as an interactable browser element.
 */
async function getSelectedBlockElement(browser) {
  const id = await getSelectedBlockId(browser);
  return getBlockElementById(browser, id);
}

/**
 * @param browser The active WebdriverIO Browser object.
 * @param id The ID of the Blockly block to search for.
 * @return A Promise that resolves to the root SVG element of the block with
 *     the given ID, as an interactable browser element.
 */
async function getBlockElementById(browser, id) {
  const elem = await browser.$(`[data-id="${id}"]`);
  elem['id'] = id;
  return elem;
}

/**
 * @param browser The active WebdriverIO Browser object.
 * @param categoryName The name of the toolbox category to find.
 * @return A Promise that resolves to the root element of the toolbox
 *     category with the given name, as an interactable browser element.
 * @throws If the category cannot be found.
 */
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

/**
 * @param browser The active WebdriverIO Browser object.
 * @param categoryName The name of the toolbox category to search.
 * @param n Which block to select, 0-indexed from the top of the category.
 * @return A Promise that resolves to the root element of the nth
 *     block in the given category.
 */
async function getNthBlockOfCategory(browser, categoryName, n) {
  const category = await getCategory(browser, categoryName);
  category.click();
  await browser.pause(100);
  const block = await browser.$(
    `.blocklyFlyout .blocklyBlockCanvas > g:nth-child(${3 + n * 2})`
  );
  return block;
}

/**
 * @param browser The active WebdriverIO Browser object.
 * @param categoryName The name of the toolbox category to search.
 * @param blockType The type of the block to search for.
 * @return A Promise that resolves to the root element of the first
 *     block with the given type in the given category.
 */
async function getBlockTypeFromCategory(browser, categoryName, blockType) {
  const category = await getCategory(browser, categoryName);
  category.click();
  await browser.pause(100);

  const id = await browser.execute((blockType) => {
    return Blockly.getMainWorkspace()
      .getFlyout()
      .getWorkspace()
      .getBlocksByType(blockType)[0].id;
  }, blockType);
  return getBlockElementById(browser, id);
}

/**
 * @param browser The active WebdriverIO Browser object.
 * @param blockType The type of the block to search for in the workspace.
 * @param position The the position of the block type on the workspace.
 * @return A Promise that resolves to the root element of the block with the
 *     given position and type on the workspace.
 */
async function getBlockTypeFromWorkspace(browser, blockType, position) {
  const id = await browser.execute(
    (blockType, position) => {
      return Blockly.getMainWorkspace().getBlocksByType(blockType, true)[
        position
      ].id;
    },
    blockType,
    position
  );
  return getBlockElementById(browser, id);
}

/**
 * @param browser The active WebdriverIO Browser object.
 * @param id The ID of the block the connection is on.
 * @param connectionName Which connection to return. An input name
 *     to get a value or statement connection, and otherwise the type of the connection.
 * @param mutatorBlockId a string that represents the main block id 
 * @return A Promise that resolves to the  location of the specific connection in screen
 *     coordinates.
 */
async function getLocationOfBlockConnection(browser, id, connectionName, mutatorBlockId,isSecondBlock) {
  return await browser.execute(
    (id, connectionName,mutatorBlockId, isSecondBlock) => {
      let block;
       console.log(id);
      if(mutatorBlockId &&!isSecondBlock){
       block = Blockly.getMainWorkspace().getBlockById(mutatorBlockId).mutator.getWorkspace().getBlockById(id);
      }else if(mutatorBlockId && isSecondBlock) {
        block = Blockly.common.getSelected(); 
      } else { 
        block = Blockly.getMainWorkspace().getBlockById(id);
      }

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
      console.log(Blockly);
      return Blockly.utils.svgMath.wsToScreenCoordinates(
        Blockly.getMainWorkspace(),
        loc
      );
    },
    id,
    connectionName,
    mutatorBlockId,
    isSecondBlock
  );
}

/**
 * Drags a block toward another block so that the specified connections attach.
 *
 * @param browser The active WebdriverIO Browser object.
 * @param draggedBlock The block to drag.
 * @param draggedConnection The active connection on the block being dragged.
 * @param targetBlock The block to drag to.
 * @param targetConnection The connection to connect to on the target block.
 * @param mutatorBlockId a string that represents the main block id 
 * @return A Promise that resolves when the actions are completed.
 */
async function connect(
  browser,
  draggedBlock,
  draggedConnection,
  targetBlock,
  targetConnection,
  mutatorBlockId
) {
  let draggedLocation;
  let targetLocation;
  if(mutatorBlockId){
   draggedLocation = await getLocationOfBlockConnection(
    browser,
    draggedBlock,
    draggedConnection,
    mutatorBlockId,
    true
  );
   targetLocation = await getLocationOfBlockConnection(
    browser,
    targetBlock,
    targetConnection,
    mutatorBlockId,
  );
}else{
   draggedLocation = await getLocationOfBlockConnection(
    browser,
    draggedBlock.id,
    draggedConnection,
  );
   targetLocation = await getLocationOfBlockConnection(
    browser,
    targetBlock.id,
    targetConnection,
  )
}

  const delta = {
    x: targetLocation.x - draggedLocation.x,
    y: targetLocation.y - draggedLocation.y,
  };
  await draggedBlock.dragAndDrop(delta);
}

/**
 * Switch the playground to RTL mode.
 *
 * @param browser The active WebdriverIO Browser object.
 * @return A Promise that resolves when the actions are completed.
 */
async function switchRTL(browser) {
  const ltrForm = await browser.$('#options > select:nth-child(1)');
  await ltrForm.selectByIndex(1);
}

/**
 * Drag the specified block from the flyout and return the root element
 * of the block.
 *
 * @param browser The active WebdriverIO Browser object.
 * @param categoryName The name of the toolbox category to search.
 * @param n Which block to select, indexed from the top of the category.
 * @param x The x-distance to drag, as a delta from the block's
 *     initial location on screen.
 * @param y The y-distance to drag, as a delta from the block's
 *     initial location on screen.
 * @return A Promise that resolves to the root element of the newly
 *     created block.
 */
async function dragNthBlockFromFlyout(browser, categoryName, n, x, y) {
  const flyoutBlock = await getNthBlockOfCategory(browser, categoryName, n);
  await flyoutBlock.dragAndDrop({x: x, y: y});
  return await getSelectedBlockElement(browser);
}

/**
 * Drag the specified block from the flyout and return the root element
 * of the block.
 *
 * @param browser The active WebdriverIO Browser object.
 * @param categoryName The name of the toolbox category to search.
 * @param type The type of the block to search for.
 * @param x The x-distance to drag, as a delta from the block's
 *     initial location on screen.
 * @param y The y-distance to drag, as a delta from the block's
 *     initial location on screen.
 * @return A Promise that resolves to the root element of the newly
 *     created block.
 */
async function dragBlockTypeFromFlyout(browser, categoryName, type, x, y) {
  const flyoutBlock = await getBlockTypeFromCategory(
    browser,
    categoryName,
    type
  );
  await flyoutBlock.dragAndDrop({x: x, y: y});
  return await getSelectedBlockElement(browser);
}

/**
 * Right-click on the specified block, then click on the specified
 * context menu item.
 *
 * @param browser The active WebdriverIO Browser object.
 * @param block The block to click, as an interactable element.
 * @param itemText The display text of the context menu item to click.
 * @return A Promise that resolves when the actions are completed.
 */
async function contextMenuSelect(browser, block, itemText) {
  // Clicking will always happen in the middle of the block's bounds
  // (including children) by default, which causes problems if it has holes
  // (e.g. statement inputs).
  // Instead we want to click 20% from the right and 5% from the top.
  const xOffset = -Math.round((await block.getSize('width')) * 0.3);
  const yOffset = -Math.round((await block.getSize('height')) * 0.45);

  await block.click({button: 2, x: xOffset, y: yOffset});
  await browser.pause(100);

  const item = await browser.$(`div=${itemText}`);
  await item.click();

  await browser.pause(100);
}

/**
 * Get all blocks on the main workspace.  Because the blocks have circular
 * references that can't be JSON-encoded they can't be returned directly, so
 * extract relevant properties only.
 *
 * @param browser The active WebdriverIO Browser object.
 * @return A Promise that resolves to an array of blocks on the main workspace.
 */
async function getAllBlocks(browser) {
  return browser.execute(() => {
    // return Blockly.getMainWorkspace().getAllBlocks(false);
    return Blockly.getMainWorkspace()
      .getAllBlocks(false)
      .map((block) => ({
        type: block.type,
        id: block.id,
      }));
  });
}

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
  dragBlockTypeFromFlyout,
  connect,
  switchRTL,
  contextMenuSelect,
  screenDirection,
  getBlockTypeFromWorkspace,
  getAllBlocks,
};
