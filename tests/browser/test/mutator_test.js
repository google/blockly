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
  getBlockTypeFromCategory,
  switchRTL,
} = require('./test_setup');

let browser;
suite('Testing Field Edits', function (done) {
  // Setting timeout to unlimited as the webdriver takes a longer time to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  suiteSetup(async function () {
    browser = await testSetup(testFileLocations.playground);
  });

  test('Testing Field Edits LTR', async function () {
    await testingMutator(1);
  });

  // Teardown entire suite after test are done running
  suiteTeardown(async function () {
    await browser.deleteSession();
  });
});

async function testingMutator(delta) {
  // Drag out print from flyout.
  const controlIfFlyout = await getBlockTypeFromCategory(
    browser,
    'Logic',
    'controls_if'
  );
  await controlIfFlyout.dragAndDrop({x: delta * 50, y: 50});
  // Get the number of transform elements on the if do block
  const ifDo = await browser.$(
    '#blocklyDiv > div > svg.blocklySvg > g > g.blocklyBlockCanvas > g.blocklyDraggable.blocklySelected'
  );
  let ifDoNumHTML = await ifDo.getHTML();
  const ifDoTransformCountBefore = (ifDoNumHTML.match(/transform/g) || []).length;
  console.log(ifDoTransformCountBefore);
  // Click mutator
  const mutatorWheel = await browser.$(
    '#blocklyDiv > div > svg.blocklySvg > g > g.blocklyBlockCanvas > g.blocklyDraggable.blocklySelected > g.blocklyIconGroup'
  );

  await mutatorWheel.click();
  // Create the new configuration
  const elseIfFlyout = await browser.$(
    '#blocklyDiv > div > svg.blocklySvg > g > g.blocklyBubbleCanvas > g > g:nth-child(2) > svg:nth-child(1) > g > g.blocklyFlyout > g > g.blocklyBlockCanvas > g:nth-child(3)'
  );

  elseIfFlyout.dragAndDrop({x: delta * 50, y: 42});
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec

  const elseIf = await browser.$(
    '#blocklyDiv > div > svg.blocklySvg > g > g.blocklyBubbleCanvas > g > g:nth-child(2) > svg:nth-child(1) > g > g.blocklyBlockCanvas > g.blocklyDraggable'
  );

  elseIf.dragAndDrop({x: delta * -25, y: -10});
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
  // Check to see that the new configuration has more transform elements
  ifDoNumHTML = await ifDo.getHTML();
  const ifDoTransformCountAfter = (ifDoNumHTML.match(/transform/g) || []).length;

  chai.assert.isTrue(ifDoTransformCountAfter > ifDoTransformCountBefore);
}
