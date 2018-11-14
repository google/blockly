/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Node.js script to run generator tests in Firefox, via webdriver.
 */
var webdriverio = require('webdriverio');
var fs = require('fs');

/**
 * Run the generator for a given language and save the results to a file.
 * @param {Thenable} browser A Thenable managing the processing of the browser
 *     tests.
 * @param {string} filename Where to write the output file.
 * @param {Function} codegenFn The function to run for code generation for this
 *     language.
 * @return the Thenable managing the processing of the browser tests.
 */
function runLangGeneratorInBrowser(browser, filename, codegenFn) {
  return browser
      .pause(5000)
      .then(function() {
        this.execute(codegenFn)
      })
      .pause(10000)
      .getValue("#importExport")
      .then(function(result) {
        fs.writeFile(filename, result, function(err) {
          if (err) {
            return console.log(err);
          }
        });
      });
}

/**
 * Runs the generator tests in Firefox. It uses webdriverio to
 * launch Firefox and load index.html. Outputs a summary of the test results
 * to the console and outputs files for later validation.
 * @return the Thenable managing the processing of the browser tests.
 */
function runGeneratorsInBrowser() {
  var options = {
      desiredCapabilities: {
          browserName: 'firefox'
      }
  };

  var url = 'file://' + __dirname + '/index.html';
  var prefix = 'tests/generators/tmp/generated'
  console.log('Starting webdriverio...');
  return webdriverio
      .remote(options)
      .init()
      .then(function() {
        console.log('Initialized.\nLoading url: ' + url);
      })
      .url(url)
      .then(function() {
        console.log('about to load');
        this.execute(function() {
          checkAll();
          loadSelected();
        })
      })
      .pause(10000)
      .then(function() {
        return runLangGeneratorInBrowser(this, prefix + '.js', function() {
          toJavaScript();
        });
      })
      .then(function() {
        return runLangGeneratorInBrowser(this, prefix + '.py', function() {
          toPython();
        });
      })
      .then(function() {
        return runLangGeneratorInBrowser(this, prefix + '.dart', function() {
          toDart();
        });
      })
      .then(function() {
        return runLangGeneratorInBrowser(this, prefix + '.lua', function() {
          toLua();
        });
      })
      .then(function() {
        return runLangGeneratorInBrowser(this, prefix + '.php', function() {
          toPhp();
        });
      })
      .pause(10000)
      .catch(function(e) {
        console.error('Error: ', e);

        if (require.main === module) {
          // .catch() doesn't seem to work in the calling code,
          // even if the error is rethrown. To ensure the script
          // exit code is non-zero, shutdown the process here.
          process.exit(1);
        }

        // WARNING: Catching this outside of runJsUnitTestsInBrowser() is not
        // working. However, killing the process doesn't seem good, either.
        throw e;
      });
}

module.exports = runGeneratorsInBrowser;

if (require.main === module) {
  try {
    runGeneratorsInBrowser()
    .catch(function(e) {
      // TODO: Never called during errors. Fix.
      console.error('Error: ' + e);
      process.exit(1);
    })
    .endAll()
    .then(function() {
      console.log('JSUnit tests completed');
      process.exit(0);
    });
  } catch(e) {
    console.error('Uncaught error: ', e);
    process.exit(1);
  }
}
