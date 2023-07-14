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
  getSelectedBlockId,
  switchRTL,
  dragBlockTypeFromFlyout,
  screenDirection,
} = require('./test_setup');

let browser;
suite('Testing Mutator', function (done) {
  // Setting timeout to unlimited as the webdriver takes a longer time to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  suiteSetup(async function () {
    browser = await testSetup(testFileLocations.playground);
  });

  test('Testing Field Edits LTR', async function () {
    await testingMutator(screenDirection.LTR);
  });
  /*
  test('Testing Field Edits RTL', async function () {
    await switchRTL(browser);
    await testingMutator(screenDirection.RTL);
  });
  */

  // Teardown entire suite after test are done running
  suiteTeardown(async function () {
    //await browser.deleteSession();
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
  const elseIfFlyout = await browser.$(
    '#blocklyDiv > div > svg.blocklySvg > g > g.blocklyBubbleCanvas > g > g:nth-child(2) > svg:nth-child(1) > g > g.blocklyFlyout > g > g.blocklyBlockCanvas > g:nth-child(3)'
  );
  elseIfFlyout.dragAndDrop({x: delta * 50, y: 42});
  await browser.pause(100);
  // Get the ids for the blocks in the mutator 
  blockIds =  await browser.execute(
    () => {
      const mutatorBlock = Blockly.getMainWorkspace().getAllBlocks()[0];
      // Adding the first element in the array is the original block id, the second is the first mutator block, and the third is the second mutator block
      const mutatorWorkspaceFirstBlock = mutatorBlock.mutator.getWorkspace().getAllBlocks(false)[0].id;
      let blockIds=[Blockly.getMainWorkspace().getAllBlocks()[0].id,mutatorWorkspaceFirstBlock,Blockly.common.getSelected()?.id];
     return blockIds;
    }
  );


  chai.assert.equal(blockIds.length, '3');
}
