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
const path = require('path');
const {posixPath} = require('../../../scripts/helpers');

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
      'https://rachel-fenichel.github.io/blockly/demos/code/index.html';
    console.log(url);
    console.log('Starting webdriverio...');
    browser = await webdriverio.remote(options);
    console.log('Loading URL: ' + url);
    await browser.url(url);
    return browser;
  });

  test('Testing Procedure', async function () {
    const functionButton = await browser.$('#blockly\\:9 > div.blocklyTreeRow');
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    functionButton.click();
    let toReturnBlock = await browser.$(
      '#content_blocks > div > svg:nth-child(7) > g > g.blocklyBlockCanvas > g:nth-child(4)'
    );
    await toReturnBlock.dragAndDrop({x: 50, y: 20});

    //Drag out second
    functionButton.click();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    toReturnBlock = await browser.$(
      '#content_blocks > div > svg:nth-child(7) > g > g.blocklyBlockCanvas > g:nth-child(4)'
    );
    await toReturnBlock.dragAndDrop({x: 300, y: 200});

    //Drag out numeric
    const mathButton = await browser.$('#blockly\\:3 > div.blocklyTreeRow');
    mathButton.click();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const numericBlock = await browser.$(
      '#content_blocks > div > svg:nth-child(7) > g > g.blocklyBlockCanvas > g:nth-child(2)'
    );
    await numericBlock.dragAndDrop({x: 50, y: 20});

    //Connect numeric to first procedure
    const numericWorkspace = await browser.$(
      '#content_blocks > div > svg.blocklySvg > g > g.blocklyBlockCanvas > g.blocklyDraggable.blocklySelected'
    );
    const doSomething = await browser.$(
      '#content_blocks > div > svg.blocklySvg > g > g.blocklyBlockCanvas > g:nth-child(1)'
    );
    await numericWorkspace.dragAndDrop(doSomething);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    await numericWorkspace.dragAndDrop({x: 90, y: 20});

    //Drag out doSomething from flyout and connect it to doSomething2
    const doSomething2 = await browser.$(
      '#content_blocks > div > svg.blocklySvg > g > g.blocklyBlockCanvas > g:nth-child(1)'
    );
    functionButton.click();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    doSomethingFlyout = await browser.$(
      '#content_blocks > div > svg:nth-child(7) > g > g.blocklyBlockCanvas > g:nth-child(8)'
    );
    await doSomethingFlyout.dragAndDrop(doSomething2);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const doSomethingFlyoutWorkspace = await browser.$(
      '#content_blocks > div > svg.blocklySvg > g > g.blocklyBlockCanvas > g.blocklyDraggable.blocklySelected'
    );
    await doSomethingFlyoutWorkspace.dragAndDrop({x: 130, y: 20});

    //Drag out print from flyout and connect it with doSomething 2
    const textButton = await browser.$('#blockly\\:4 > div.blocklyTreeRow');
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    textButton.click();
    let printFlyout = await browser.$(
      '#content_blocks > div > svg:nth-child(7) > g > g.blocklyBlockCanvas > g:nth-child(22)'
    );
    await printFlyout.dragAndDrop({x: 50, y: 20});
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    functionButton.click();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    doSomething2Flyout = await browser.$(
      '#content_blocks > div > svg:nth-child(7) > g > g.blocklyBlockCanvas > g:nth-child(10)'
    );
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    await doSomething2Flyout.dragAndDrop({x: 130, y: 20});
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const doSomething2FlyoutWorkspace = await browser.$(
      '#content_blocks > div > svg.blocklySvg > g > g.blocklyBlockCanvas > g.blocklyDraggable.blocklySelected'
    );
    const printWorkSpace = await browser.$(
      '#content_blocks > div > svg.blocklySvg > g > g.blocklyBlockCanvas > g:nth-child(3)'
    );
    await doSomething2FlyoutWorkspace.dragAndDrop(printWorkSpace);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    await doSomething2FlyoutWorkspace.dragAndDrop({x: 65, y: 0});

    //Click run button and verify the number is 123
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const runButton = await browser.$('#runButton');
    runButton.click();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec
    const alertText = await browser.getAlertText(); //get the alert text
    chai.assert.equal(alertText, '123');
  });

  // Teardown entire suite after test are done running
  suiteTeardown(async function () {
    await browser.deleteSession();
  });
});
