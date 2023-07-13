const chai = require('chai');
const {testSetup, testFileLocations, getBlockTypeFromCategory, getSelectedBlockElement, getBlockTypeFromWorkspace, getAllBlocks, getBlockElementById, contextMenuSelect} = require('./test_setup');
const {Key} = require('webdriverio');

let browser;
const firstBlockId = "/q5Q_1$kf`gSEFU9C7vK"
const startBlocks = {
  "blocks": {
    "languageVersion": 0,
    "blocks": [
      {
        "type": "text_print",
        "id": firstBlockId,
        "x": 63,
        "y": 88,
        "inputs": {
          "TEXT": {
            "shadow": {
              "type": "text",
              "id": "]2?G%L#p9Vgca{zd6#JB",
              "fields": {
                "TEXT": "1"
              }
            }
          }
        },
        "next": {
          "block": {
            "type": "text_print",
            "id": "FyV$;[AN7G5frPOrpXg@",
            "inputs": {
              "TEXT": {
                "shadow": {
                  "type": "text",
                  "id": "3q[_v5rA3sl/Vw$*:jGp",
                  "fields": {
                    "TEXT": "2"
                  }
                },
                "block": {
                  "type": "text_trim",
                  "id": "o1O*0%]Vq-4/Nh}2j|wF",
                  "fields": {
                    "MODE": "BOTH"
                  },
                  "inputs": {
                    "TEXT": {
                      "shadow": {
                        "type": "text",
                        "id": "A878E^l0J%Hm3iu,j3eV",
                        "fields": {
                          "TEXT": "abc"
                        }
                      },
                      "block": {
                        "type": "text",
                        "id": "Bma#)g!^Nm_TMHry#ve}",
                        "fields": {
                          "TEXT": "hello"
                        }
                      }
                    }
                  }
                }
              }
            },
            "next": {
              "block": {
                "type": "text_print",
                "id": "{s3Ci:xp;NCsV0(_9ofD",
                "inputs": {
                  "TEXT": {
                    "shadow": {
                      "type": "text",
                      "id": "_zw:|_*p~3itPhy#O*4I",
                      "fields": {
                        "TEXT": "3"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]
  }
};
const pauseLength = 20;

suite('Delete blocks', function (done) {
  // Setting timeout to unlimited as the webdriver takes a longer time to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  suiteSetup(async function () {
    browser = await testSetup(testFileLocations.playground);
  });

  // Clear the workspace and load the start blocks before each test
  setup(async function() {
    await browser.execute(() => {
      // Clear the workspace manually so we can ensure it's clear before moving on to the next test.
      Blockly.getMainWorkspace().clear();
    });
    // Wait for the workspace to be cleared of blocks (no blocks found on main workspace)
    await browser.$('.blocklySvg .blocklyWorkspace > .blocklyBlockCanvas > .blocklyDraggable').waitForExist({timeout: 2000, reverse: true});

    // Load the start blocks
    await browser.execute((blocks) => {
      Blockly.serialization.workspaces.load(blocks, Blockly.getMainWorkspace());
    }, startBlocks);
    // Wait for there to be a block on the main workspace before continuing
    (await getBlockElementById(browser, firstBlockId)).waitForExist({timeout: 2000});
  });

  test('Delete block using backspace key', async function () {
    const before = await getAllBlocks(this.browser).length;
    // Get first print block, click to select it, and delete it using backspace key.
    const block = (await getBlockElementById(browser, firstBlockId)).$('.blocklyPath');
    await block.click();
    await browser.keys([Key.Backspace]);
    const after = await getAllBlocks(this.browser).length;
    chai.assert.equal(before-2, after, 'Expected there to be two fewer blocks after deletion of block and shadow');
  });

  test('Delete block using delete key', async function () {
    const before = await getAllBlocks(this.browser).length;
    // Get first print block, click to select it, and delete it using delete key.
    const block = (await getBlockElementById(browser, firstBlockId)).$('.blocklyPath');
    await block.click();
    await browser.keys([Key.Delete]);
    const after = await getAllBlocks(this.browser).length;
    chai.assert.equal(before-2, after, 'Expected there to be two fewer blocks after deletion of block and shadow');
  });

  test('Delete block using context menu', async function () {
    const before = await getAllBlocks(this.browser).length;
    // Get first print block, click to select it, and delete it using context menu.
    const block = (await getBlockElementById(browser, firstBlockId)).$('.blocklyPath');
    await contextMenuSelect(browser, block, 'Delete 2 Blocks');
    const after = await getAllBlocks(this.browser).length;
    chai.assert.equal(before-2, after, 'Expected there to be two fewer blocks after deletion of block and shadow');
  });

  test('Undo block deletion', async function () {
    const before = await getAllBlocks(this.browser).length;
    // Get first print block, click to select it, and delete it using backspace key.
    const block = (await getBlockElementById(browser, firstBlockId)).$('.blocklyPath');
    await block.click();
    await browser.keys([Key.Backspace]);
    await browser.pause(pauseLength);
    // Undo
    await browser.keys([Key.Ctrl, 'Z']);
    const after = await getAllBlocks(this.browser).length;
    chai.assert.equal(before, after, 'Expected there to be the original number of blocks after undoing a delete');
  });

  test('Redo block deletion', async function () {
    const before = await getAllBlocks(this.browser).length;
    // Get first print block, click to select it, and delete it using backspace key.
    const block = (await getBlockElementById(browser, firstBlockId)).$('.blocklyPath');
    await block.click();
    await browser.keys([Key.Backspace]);
    await browser.pause(pauseLength);
    // Undo
    await browser.keys([Key.Ctrl, 'Z']);
    await browser.pause(pauseLength);
    // Redo
    await browser.keys([Key.Ctrl, Key.Shift, 'Z']);
    await browser.pause(pauseLength);
    const after = await getAllBlocks(this.browser).length;
    chai.assert.equal(before-2, after, 'Expected there to be fewer blocks after undoing and redoing a delete');
  });
  

  // Teardown entire suite after test are done running
  suiteTeardown(async function () {
    await browser.deleteSession();
  });
});