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
  getBlockElementById
} = require('./test_setup');


suite('Mutating a block', function (done) {
  this.timeout(0);

  suiteSetup(async function () {
    this.browser = await testSetup(testFileLocations.PLAYGROUND);
  });

  test.only('Mutating a block creates more inputs', async function () {
    await testMutator(this.browser, screenDirection.LTR);
  });
});

async function testMutator(browser, delta) {
  await dragBlockTypeFromFlyout(
    browser,
    'Logic',
    'controls_if',
    delta * 50,
    50,
  );
  const mutatorWheel = await browser.$(
    '#blocklyDiv > div > svg.blocklySvg > g > g.blocklyBlockCanvas > ' +
    'g.blocklyDraggable.blocklySelected > g.blocklyIconGroup',
  );
  await mutatorWheel.click();
  await browser.pause(PAUSE_TIME);
  const elseIfFlyout = await browser.$(
    '#blocklyDiv > div > svg.blocklySvg > g > g.blocklyBubbleCanvas > g > ' +
    'g:nth-child(2) > svg:nth-child(1) > g > g.blocklyFlyout > g > ' +
    'g.blocklyBlockCanvas > g:nth-child(3)',
  );
  await elseIfFlyout.dragAndDrop({x: delta * 50, y: 42});
  await browser.pause(PAUSE_TIME);

  const {mutatorBlockId, ifQuarkId, elseIfQuarkId} =
      await browser.execute(() => {
        const mutatorBlock = Blockly.getMainWorkspace().getAllBlocks()[0];
        const quarkBlocks = mutatorBlock.mutator.getWorkspace().getAllBlocks();
        return {
          mutatorBlockId: mutatorBlock.id,
          ifQuarkId: quarkBlocks[0].id,
          elseIfQuarkId: quarkBlocks[1].id,
        };
      });

  // For some reason this needs a lot more time.
  await browser.pause(2000);
  await connect(
    browser,
    await getBlockElementById(browser, elseIfQuarkId),
    'PREVIOUS',
    await getBlockElementById(browser, ifQuarkId),
    'NEXT',
    mutatorBlockId,
  );
  await browser.pause(PAUSE_TIME);

  const finalInputCount = await browser.execute(() => {
    return Blockly.getMainWorkspace().getAllBlocks()[0].inputList.length;
  });

  chai.assert.equal(finalInputCount, 4);
}
