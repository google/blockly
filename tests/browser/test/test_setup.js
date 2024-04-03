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

let driver = null;

/**
 * The default amount of time to wait during a test. Increase this to make
 * tests easier to watch; decrease it to make tests run faster.
 */
const PAUSE_TIME = 50;

/**
 * Start up the test page. This should only be done once, to avoid
 * constantly popping browser windows open and closed.
 * @return A Promsie that resolves to a webdriverIO browser that tests can manipulate.
 */
async function driverSetup() {
  const options = {
    capabilities: {
      'browserName': 'chrome',
      'goog:chromeOptions': {
        args: ['--allow-file-access-from-files'],
      },
    },
    logLevel: 'warn',
  };

  // Run in headless mode on Github Actions.
  if (process.env.CI) {
    options.capabilities['goog:chromeOptions'].args.push(
      '--headless',
      '--no-sandbox',
      '--disable-dev-shm-usage',
    );
  } else {
    // --disable-gpu is needed to prevent Chrome from hanging on Linux with
    // NVIDIA drivers older than v295.20. See
    // https://github.com/google/blockly/issues/5345 for details.
    options.capabilities['goog:chromeOptions'].args.push('--disable-gpu');
  }
  // Use Selenium to bring up the page
  console.log('Starting webdriverio...');
  driver = await webdriverio.remote(options);
  return driver;
}

/**
 * End the webdriverIO session.
 * @return A Promise that resolves after the actions have been completed.
 */
async function driverTeardown() {
  await driver.deleteSession();
  driver = null;
  return;
}

/**
 * Navigate to the correct URL for the test, using the shared driver.
 * @param {string} playgroundUrl The URL to open for the test, which should be
 *     a Blockly playground with a workspace.
 * @return A Promsie that resolves to a webdriverIO browser that tests can manipulate.
 */
async function testSetup(playgroundUrl) {
  if (!driver) {
    await driverSetup();
  }
  await driver.url(playgroundUrl);
  // Wait for the workspace to exist and be rendered.
  await driver
    .$('.blocklySvg .blocklyWorkspace > .blocklyBlockCanvas')
    .waitForExist({timeout: 2000});
  return driver;
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
  PLAYGROUND_RTL:
    'file://' +
    posixPath(path.join(__dirname, '..', '..')) +
    '/playground.html?dir=rtl',
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
 * Find a clickable element on the block and click it.
 * We can't always use the block's SVG root because clicking will always happen
 * in the middle of the block's bounds (including children) by default, which
 * causes problems if it has holes (e.g. statement inputs). Instead, this tries
 * to get the first text field on the block. It falls back on the block's SVG root.
 * @param browser The active WebdriverIO Browser object.
 * @param block The block to click, as an interactable element.
 * @param clickOptions The options to pass to webdriverio's element.click function.
 * @return A Promise that resolves when the actions are completed.
 */
async function clickBlock(browser, block, clickOptions) {
  const findableId = 'clickTargetElement';
  // In the browser context, find the element that we want and give it a findable ID.
  await browser.execute(
    (blockId, newElemId) => {
      const block = Blockly.getMainWorkspace().getBlockById(blockId);
      for (const input of block.inputList) {
        for (const field of input.fieldRow) {
          if (field instanceof Blockly.FieldLabel) {
            field.getSvgRoot().id = newElemId;
            return;
          }
        }
      }
      // No label field found. Fall back to the block's SVG root.
      block.getSvgRoot().id = findableId;
    },
    block.id,
    findableId,
  );

  // In the test context, get the Webdriverio Element that we've identified.
  const elem = await browser.$(`#${findableId}`);

  await elem.click(clickOptions);

  // In the browser context, remove the ID.
  await browser.execute((elemId) => {
    const clickElem = document.getElementById(elemId);
    clickElem.removeAttribute('id');
  }, findableId);
}

/**
 * @param browser The active WebdriverIO Browser object.
 * @param categoryName The name of the toolbox category to find.
 * @return A Promise that resolves to the root element of the toolbox
 *     category with the given name, as an interactable browser element.
 * @throws If the category cannot be found.
 */
async function getCategory(browser, categoryName) {
  const category = browser.$(`.blocklyToolboxCategory*=${categoryName}`);
  category.waitForExist();

  return await category;
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
  await category.click();
  const block = await browser.$(
    `.blocklyFlyout .blocklyBlockCanvas > g:nth-child(${3 + n * 2})`,
  );
  return block;
}

/**
 * @param browser The active WebdriverIO Browser object.
 * @param categoryName The name of the toolbox category to search.
 *     Null if the toolbox has no categories (simple).
 * @param blockType The type of the block to search for.
 * @return A Promise that resolves to the root element of the first
 *     block with the given type in the given category.
 */
async function getBlockTypeFromCategory(browser, categoryName, blockType) {
  if (categoryName) {
    const category = await getCategory(browser, categoryName);
    await category.click();
  }

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
    position,
  );
  return getBlockElementById(browser, id);
}

/**
 * @param browser The active WebdriverIO Browser object.
 * @param id The ID of the block the connection is on.
 * @param connectionName Which connection to return. An input name to
 *     get a value or statement connection, and otherwise the type of
 *     the connection.
 * @param mutatorBlockId The block that holds the mutator icon or null if the target block is on the main workspace
 * @return A Promise that resolves to the location of the specific
 *     connection in screen coordinates.
 */
async function getLocationOfBlockConnection(
  browser,
  id,
  connectionName,
  mutatorBlockId,
) {
  return await browser.execute(
    (id, connectionName, mutatorBlockId) => {
      let block;
      if (mutatorBlockId) {
        block = Blockly.getMainWorkspace()
          .getBlockById(mutatorBlockId)
          .mutator.getWorkspace()
          .getBlockById(id);
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
        connection.getOffsetInBlock(),
      );
      return Blockly.utils.svgMath.wsToScreenCoordinates(
        Blockly.getMainWorkspace(),
        loc,
      );
    },
    id,
    connectionName,
    mutatorBlockId,
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
 * @param mutatorBlockId The block that holds the mutator icon or null if the
 *     target block is on the main workspace
 * @param dragBlockSelector The selector of the block to drag
 * @return A Promise that resolves when the actions are completed.
 */
async function connect(
  browser,
  draggedBlock,
  draggedConnection,
  targetBlock,
  targetConnection,
  mutatorBlockId,
  dragBlockSelector,
) {
  const draggedLocation = await getLocationOfBlockConnection(
    browser,
    draggedBlock.id,
    draggedConnection,
    mutatorBlockId,
  );
  const targetLocation = await getLocationOfBlockConnection(
    browser,
    targetBlock.id,
    targetConnection,
    mutatorBlockId,
  );

  const delta = {
    x: Math.round(targetLocation.x - draggedLocation.x),
    y: Math.round(targetLocation.y - draggedLocation.y),
  };
  if (mutatorBlockId) {
    await dragBlockSelector.dragAndDrop(delta);
  } else {
    await draggedBlock.dragAndDrop(delta);
  }
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
  await browser.pause(PAUSE_TIME + 450);
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
 *     Null if the toolbox has no categories (simple).
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
    type,
  );
  await flyoutBlock.dragAndDrop({x: x, y: y});
  return await getSelectedBlockElement(browser);
}

/**
 * Drags the specified block type from the mutator flyout of the given block and
 * returns the root element of the block.
 *
 * @param browser The active WebdriverIO Browser object.
 * @param mutatorBlock The block with the mutator attached that we want to drag
 *     a block from.
 * @param type The type of the block to search for.
 * @param x The x-distance to drag, as a delta from the block's
 *     initial location on screen.
 * @param y The y-distance to drag, as a delta from the block's
 *     initial location on screen.
 * @return A Promise that resolves to the root element of the newly
 *     created block.
 */
async function dragBlockFromMutatorFlyout(browser, mutatorBlock, type, x, y) {
  const id = await browser.execute(
    (mutatorBlockId, blockType) => {
      return Blockly.getMainWorkspace()
        .getBlockById(mutatorBlockId)
        .mutator.getWorkspace()
        .getFlyout()
        .getWorkspace()
        .getBlocksByType(blockType)[0].id;
    },
    mutatorBlock.id,
    type,
  );
  const flyoutBlock = await getBlockElementById(browser, id);
  await flyoutBlock.dragAndDrop({x: x, y: y});
  return await getSelectedBlockElement(browser);
}

/**
 * Right-click on the specified block, then click on the specified
 * context menu item.
 *
 * @param browser The active WebdriverIO Browser object.
 * @param block The block to click, as an interactable element. This block should
 *    have text on it, because we use the text element as the click target.
 * @param itemText The display text of the context menu item to click.
 * @return A Promise that resolves when the actions are completed.
 */
async function contextMenuSelect(browser, block, itemText) {
  await clickBlock(browser, block, {button: 2});

  const item = await browser.$(`div=${itemText}`);
  await item.waitForExist();
  await item.click();

  await browser.pause(PAUSE_TIME);
}

/**
 * Opens the mutator bubble for the given block.
 *
 * @param browser The active WebdriverIO Browser object.
 * @param block The block to click, as an interactable element.
 * @return A Promise that resolves when the actions are complete.
 */
async function openMutatorForBlock(browser, block) {
  const icon = await browser.$(`[data-id="${block.id}"] > g.blocklyIconGroup`);
  await icon.click();
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
    return Blockly.getMainWorkspace()
      .getAllBlocks(false)
      .map((block) => ({
        type: block.type,
        id: block.id,
      }));
  });
}

/**
 * Find the flyout's scrollbar and scroll by the specified amount.
 * This makes several assumptions:
 *  - A flyout with a valid scrollbar exists, is open, and is in view.
 *  - The workspace has a trash can, which means it has a second (hidden) flyout.
 * @param browser The active WebdriverIO Browser object.
 * @param xDelta How far to drag the flyout in the x direction. Positive is right.
 * @param yDelta How far to drag the flyout in the y direction. Positive is down.
 * @return A Promise that resolves when the actions are completed.
 */
async function scrollFlyout(browser, xDelta, yDelta) {
  // There are two flyouts on the playground workspace: one for the trash can
  // and one for the toolbox. We want the second one.
  // This assumes there is only one scrollbar handle in the flyout, but it could
  // be either horizontal or vertical.
  await browser.pause(PAUSE_TIME);
  const scrollbarHandle = await browser
    .$$(`.blocklyFlyoutScrollbar`)[1]
    .$(`rect.blocklyScrollbarHandle`);
  await scrollbarHandle.dragAndDrop({x: xDelta, y: yDelta});
  await browser.pause(PAUSE_TIME);
}

module.exports = {
  testSetup,
  testFileLocations,
  driverSetup,
  driverTeardown,
  getSelectedBlockElement,
  getSelectedBlockId,
  getBlockElementById,
  clickBlock,
  getCategory,
  getNthBlockOfCategory,
  getBlockTypeFromCategory,
  dragNthBlockFromFlyout,
  dragBlockTypeFromFlyout,
  dragBlockFromMutatorFlyout,
  connect,
  switchRTL,
  contextMenuSelect,
  openMutatorForBlock,
  screenDirection,
  getBlockTypeFromWorkspace,
  getAllBlocks,
  scrollFlyout,
  PAUSE_TIME,
};
