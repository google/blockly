const fs = require('promise-fs');
const sep = require('path').sep;
const Blockly = require('../../blockly_node_javascript_en.js');


/**
 * The .js sources to the unittest_ blocks and generators.
 * @type {Array<string>}
 */
const UNITTEST_SRCS = [
  'unittest.js',
  'unittest_javascript.js'
];

/**
 * Loads the unit test blocks and each .xml workspace, generates the code
 * (JavaScript only, at the moment), and runs the results in an external VM.
 * @return {boolean} Whether all tests passed.
 */
async function runGeneratorTestsHeadless() {
  var allTestsPassed = true;

  // Load the unittest blocks
  // These files were designed for use in a browser (via index.html)
  // and so can not be required(..)'d in the normal node manner.
  for (let src of UNITTEST_SRCS) {
    let buffer = await fs.readFile(__dirname + sep + src);
    eval(buffer.toString());
  }

  // Get the list of .xml workspaces
  let files = await fs.readdir(__dirname);
  for (let filename of files) {
    if (filename.endsWith('.xml')) {
      allTestsPassed &= await runAllGeneratorTestsForFile(filename);
    }
  }

  return allTestsPassed;
}

async function runAllGeneratorTestsForFile(filename) {
  var allTestsPassed = await runGeneratorTest(
      "JavaScript", workspaceXml, runJavaScriptAndParseResults);
  // TODO: Implement other generator languages.
  return allTestsPassed;
}

async function runGeneratorTest(generatorId, filename, asyncExecCodeFn) {
  let generator = Blockly[generatorId];
  var success = false;
  var workspaceXml, code;

  try {
    let buffer = await fs.readfile(__dirname + sep + filename);
    var workspaceXml = Blockly.Xml.textToDom(buffer.toString());
  } catch (e) {
    console.error('Error loading file "' + filename + '":', e);
    return false;
  }

  try {
    let workspace = new Blockly.workspace();
    try {
      Blockly.Xml.domToWorkspace(workspaceXml, workspace);
      code = generator.workspaceToCode(workspace);
    } catch (e) {
      console.error('Failed to generate ' + generatorId + ':', e);
    } finally {
      workspace.release();
    }
  } catch(e) {
    console.error('Failed to create workspace:', e);
  }
  if (!code) {
    return false;
  }

  var failureCount = await asyncExecCodeFn(code);
  if (typeof failureCount !== 'number') {
    throw new Error('Expected asyncExecCodeFn(code) to return number. ' +
          'Received ' + (typeof failureCount));
  }
  var success = (failureCount === 0);
  var msg = 'Testing ' + generatorId + ' with ' + filename + ': '
      (success ? 'All tests passed.' : failureCount + ' failures.');
  console.log(msg)
  return success;
}

async function runJavaScriptAndParseResults(code) {
  console.log(code);  // TODO
  return 0;
}

if (require.main === module) {
  var allTestsPassed = false;
  try {
    allTestsPassed = await runGeneratorTestsHeadless();
    console.log('Generator tests completed.');
  } catch(e) {
    console.error('Error: ', e);
    allTestsPassed = false;
  } finally {
    process.exit(allTestsPassed ? 0 : 1);
  }
}
