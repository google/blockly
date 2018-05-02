var runJsUnitTestsInBrowser = require('./jsunit/run_jsunit_tests_in_browser');

var errored = false;

// Run the JsUnit tests in a browser.
try {
  runJsUnitTestsInBrowser();
} catch(errorStr) {
  errored = true;
  console.error(errorStr + '\n\n');
}

if (errored) {
  process.exit(1);
}