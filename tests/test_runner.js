if (require.main !== module) {
  throw __filename + ' must be called directly.';
}

var testFns = [
      require('./jsunit/run_jsunit_tests_in_browser')
    ];

var errored = false;
testFns.forEach((testFn) => {
  try {
    testFn();
  } catch (errorStr) {
    errored = true;
    console.error(errorStr + '\n\n');
  }
});

if (errored) {
  process.exit(1);
}
