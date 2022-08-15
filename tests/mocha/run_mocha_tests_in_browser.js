/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Node.js script to run Mocha tests in Chrome, via webdriver.
 */
var webdriverio = require('webdriverio');

module.exports = runMochaTestsInBrowser;

/**
 * Runs the Mocha tests in this directory in Chrome. It uses webdriverio to
 * launch Chrome and load index.html. Outputs a summary of the test results
 * to the console.
 * @return {number} 0 on success, 1 on failure.
 */
async function runMochaTestsInBrowser() {
  var options = {
    capabilities: {
      browserName: 'chrome'
    },
    services: [
      ['selenium-standalone']
    ],
    logLevel: 'warn'
  };
  // Run in headless mode on Github Actions.
  if (process.env.CI) {
    options.capabilities['goog:chromeOptions'] = {
      args: [
        '--headless', '--no-sandbox', '--disable-dev-shm-usage',
        '--allow-file-access-from-files',
      ]
    };
  } else {
    // --disable-gpu is needed to prevent Chrome from hanging on Linux with
    // NVIDIA drivers older than v295.20. See 
    // https://github.com/google/blockly/issues/5345 for details.
    options.capabilities['goog:chromeOptions'] = {
      args: ['--allow-file-access-from-files', '--disable-gpu']
    };
  }

  var url = 'file://' + __dirname + '/index.html';
  console.log('Starting webdriverio...');
  const browser = await webdriverio.remote(options);
  console.log('Initialized.\nLoading url: ' + url);
  await browser.url(url);

  await browser.waitUntil(async () => {
    var elem = await browser.$('#failureCount');
    var text = await elem.getAttribute('tests_failed');
    return text != 'unset';
  }, {
    timeout: 50000
  });

  const elem = await browser.$('#failureCount');
  const numOfFailure = await elem.getAttribute('tests_failed');

  if (numOfFailure > 0) {
    console.log('============Blockly Mocha Test Failures================')
    const failureMessagesEls = await browser.$$('#failureMessages p');
    if (!failureMessagesEls.length) {
      console.log('There is at least one test failure, but no messages reported. Mocha may be failing because no tests are being run.');
    }
    for (let el of failureMessagesEls) {
      console.log(await el.getText());
    }
  }

  console.log('============Blockly Mocha Test Summary=================');
  console.log(numOfFailure + ' tests failed');
  console.log('============Blockly Mocha Test Summary=================');
  if (parseInt(numOfFailure) !== 0) {
    return 1;
  }
  await browser.deleteSession();
  return 0;
}

if (require.main === module) {
  runMochaTestsInBrowser().catch(e => {
    console.error(e);
    process.exit(1);
  }).then(function(result) {
    if (result) {
      console.log('Mocha tests failed');
      process.exit(1);
    } else {
      console.log('Mocha tests passed');
      process.exit(0);
    }
  });
}
