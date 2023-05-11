/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Node.js script to run Automated tests in Chrome, via webdriver.
 */


const webdriverio = require('webdriverio');
const chai = require('chai');

let browser;
suite("Testing Connecting Blocks", function(done) {
  this.timeout(0);
  // Setup Selenium for each of the test
  suiteSetup(async function() {
    const options = {
      capabilities: {
        "browserName": 'chrome',
        'goog:chromeOptions': {
          args: ['--allow-file-access-from-files'],
        },
      },
      services: [
        ['selenium-standalone'],
      ],
      logLevel: 'warn',
    };
  
    // Run in headless mode on Github Actions.
    if (process.env.CI) {
      options.capabilities['goog:chromeOptions'].args.push(
          '--headless', '--no-sandbox', '--disable-dev-shm-usage',);
    } else {
      // --disable-gpu is needed to prevent Chrome from hanging on Linux with
      // NVIDIA drivers older than v295.20. See
      // https://github.com/google/blockly/issues/5345 for details.
      options.capabilities['goog:chromeOptions'].args.push('--disable-gpu');
    }
  // Use Selenium to bring up the page
  const url = 'https://blockly-demo.appspot.com/static/demos/blockfactory/index.html';
    console.log('Starting webdriverio...');
    browser = await webdriverio.remote(options);
    console.log('Loading URL: ' + url);
    await browser.url(url);
    return browser;
  });
  test('Testing Block Drag', async function() {
    const startingBlock = await browser.$('#blockly > div > svg.blocklySvg > g > g.blocklyBlockCanvas > g:nth-child(2)');
    const blocklyCanvas = await browser.$('#blockly > div > svg.blocklySvg > g > g.blocklyBlockCanvas');
    const firstPostion = await blocklyCanvas.getAttribute('transform');
    await startingBlock.dragAndDrop({x: 20, y: 20});
    const secondPosition = await blocklyCanvas.getAttribute('transform');
    chai.assert.notEqual(firstPostion, secondPosition);
  });
  // Teardown entire suite after test are done running
  suiteTeardown(async function() {
    await browser.deleteSession();
    });
});

