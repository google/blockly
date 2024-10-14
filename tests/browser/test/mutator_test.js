/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const chai = require('chai');
const {
  testSetup,
  testFileLocations,
  connect,
  dragBlockTypeFromFlyout,
  screenDirection,
  PAUSE_TIME,
  getBlockElementById,
  dragBlockFromMutatorFlyout,
  openMutatorForBlock,
} = require('./test_setup');

suite('Mutating a block', function (done) {
  this.timeout(0);

  suiteSetup(async function () {
    this.browser = await testSetup(testFileLocations.PLAYGROUND);
  });

  test('Mutating a block creates more inputs', async function () {
    await testMutator(this.browser, screenDirection.LTR);
  });
});

async function testMutator(browser, delta) {
  const mutatorBlock = await dragBlockTypeFromFlyout(
    browser,
    'Logic',
    'controls_if',
    delta * 50,
    50,
  );
  await openMutatorForBlock(browser, mutatorBlock);
  await browser.pause(PAUSE_TIME);
  await dragBlockFromMutatorFlyout(
    browser,
    mutatorBlock,
    'controls_if_elseif',
    delta * 50,
    50,
  );
  await browser.pause(PAUSE_TIME);

  const {mutatorBlockId, ifQuarkId, elseIfQuarkId} = await browser.execute(
    () => {
      const mutatorBlock = Blockly.getMainWorkspace().getAllBlocks()[0];
      const quarkBlocks = mutatorBlock.mutator.getWorkspace().getAllBlocks();
      return {
        mutatorBlockId: mutatorBlock.id,
        ifQuarkId: quarkBlocks[0].id,
        elseIfQuarkId: quarkBlocks[1].id,
      };
    },
  );

  // The flyout block and the workspace block have the same id, so to get
  // around that I pass in the selector to the connect function.
  const dragBlockSelector = await browser.$(
    '#blocklyDiv > div > svg.blocklySvg > g > g.blocklyBubbleCanvas > g > ' +
      'g:nth-child(2) > svg:nth-child(1) > g > g.blocklyBlockCanvas > ' +
      'g.blocklyDraggable',
  );
  // For some reason this needs a lot more time.
  await browser.pause(2000);
  await connect(
    browser,
    await getBlockElementById(browser, elseIfQuarkId),
    'PREVIOUS',
    await getBlockElementById(browser, ifQuarkId),
    'NEXT',
    mutatorBlockId,
    dragBlockSelector,
  );
  await browser.pause(PAUSE_TIME);

  const finalInputCount = await browser.execute(() => {
    return Blockly.getMainWorkspace().getAllBlocks()[0].inputList.length;
  });

  chai.assert.equal(finalInputCount, 4);
}
