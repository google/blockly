/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Node.js script to run Automated tests in Chrome, via webdriver.
 */

const chai = require('chai');
const {
  testSetup,
  testFileLocations,
  connect,
  switchRTL,
  dragBlockTypeFromFlyout,
  getSelectedBlockId,
  screenDirection,
} = require('./test_setup');

let browser;
suite('This tests mutating a Blockly block', function (done) {
  // Setting timeout to unlimited as the webdriver takes a longer time to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  suiteSetup(async function () {
    browser = await testSetup(testFileLocations.PLAYGROUND);
  });

  test('This test mutating a block creates more inputs', async function () {
    await testingMutator(screenDirection.LTR);
  });

  // Teardown entire suite after test are done running
  suiteTeardown(async function () {
    await browser.deleteSession();
  });
});

async function testingMutator(delta) {
  // Drag out print from flyout.
  const controlIfFlyout = await dragBlockTypeFromFlyout(
    browser,
    'Logic',
    'controls_if',
    delta * 50,
    50
  );
  // Click on the mutator and drag out else ig block
  const mutatorWheel = await browser.$(
    '#blocklyDiv > div > svg.blocklySvg > g > g.blocklyBlockCanvas > g.blocklyDraggable.blocklySelected > g.blocklyIconGroup'
  );
  await mutatorWheel.click();
  await browser.pause(100);
  const elseIfFlyout = await browser.$(
    '#blocklyDiv > div > svg.blocklySvg > g > g.blocklyBubbleCanvas > g > g:nth-child(2) > svg:nth-child(1) > g > g.blocklyFlyout > g > g.blocklyBlockCanvas > g:nth-child(3)'
  );
  await elseIfFlyout.dragAndDrop({x: delta * 50, y: 42});
  // Get the original number of mutator inputs
  await browser.pause(100);

  // Get the ids for block before mutating
  const originalInputs = await browser.execute(() => {
    const originalInputs =
      Blockly.getMainWorkspace().getAllBlocks()[0].inputList.length;
    return originalInputs;
  });

  await browser.pause(100);
  // Get the ids for the blocks in the mutator
  const blockIds = await browser.execute(() => {
    const mutatorBlock = Blockly.getMainWorkspace().getAllBlocks()[0];
    // Adding the first element in the array is the original block id, the second is the first mutator block, and the third is the second mutator block
    const blockIds = [
      mutatorBlock.id,
      mutatorBlock.mutator.getWorkspace().getAllBlocks()[0].id,
      mutatorBlock.mutator.getWorkspace().getAllBlocks()[1].id,
    ];
    return blockIds;
  });

  // The flyout block and the workspace block have the same id, so to get around that I pass in the selector to the connect function
  const dragBlockSelector = await browser.$(
    '#blocklyDiv > div > svg.blocklySvg > g > g.blocklyBubbleCanvas > g > g:nth-child(2) > svg:nth-child(1) > g > g.blocklyBlockCanvas > g.blocklyDraggable'
  );
  // For some reason this needs a lot more time
  await browser.pause(2000);
  // Connect the mutator blocks
  await connect(
    browser,
    blockIds[2],
    'PREVIOUS',
    blockIds[1],
    'NEXT',
    blockIds[0],
    dragBlockSelector
  );

  // For some reason this needs a lot more time
  await browser.pause(200);

  // Get the ids for block after mutating
  const afterInputs = await browser.execute(() => {
    const afterInputs =
      Blockly.getMainWorkspace().getAllBlocks()[0].inputList.length;
    return afterInputs;
  });

  chai.assert.isTrue(afterInputs > originalInputs);
}
