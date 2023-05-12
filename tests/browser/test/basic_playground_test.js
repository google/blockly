/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Node.js script to run Automated tests in Chrome, via webdriver.
 */

const webdriverio = require('webdriverio');
const chai = require('chai');
<<<<<<< HEAD
const path = require('path');
const {posixPath} = require('../../../scripts/helpers');
=======
>>>>>>> upstream/develop

let browser;
suite('Testing Connecting Blocks', function (done) {
  // Setting timeout to unlimited as the webdriver takes a longer time to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  suiteSetup(async function () {
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
    const url =
      'file://' +
      posixPath(path.join(__dirname, '..', '..')) +
      '/playground.html';
    console.log(url);
    console.log('Starting webdriverio...');
    browser = await webdriverio.remote(options);
    console.log('Loading URL: ' + url);
    await browser.url(url);
    return browser;
  });

  test('Testing Block Flyout', async function () {
    const logicButton = await browser.$('#blockly-0');
    logicButton.click();
    const ifDoBlock = await browser.$(
      '#blocklyDiv > div > svg:nth-child(7) > g > g.blocklyBlockCanvas > g:nth-child(3)'
    );
    await ifDoBlock.dragAndDrop({x: 20, y: 20});
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const blockOnWorkspace = await browser.execute(() => {
      const newBlock = Blockly.getMainWorkspace().getAllBlocks(false)[0];
      if (newBlock.id) {
        return true;
      } else {
        return false;
      }
    });

    chai.assert.isTrue(blockOnWorkspace);
  });

  // Teardown entire suite after test are done running
  suiteTeardown(async function () {
    await browser.deleteSession();
  });
});
