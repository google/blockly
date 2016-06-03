
'use strict';

// Depending on the URL argument, render as LTR or RTL.
var rtl = (document.location.search == '?rtl');
var workspace = null;

/** Full set of possible tests. */
var testSuite = {
  "drag_to_next": {
    description: "Create a stack of two blocks",
    dragList: [
      function() { dragToNext("a", "b", true); }
    ]
  },
  "drag_to_next_twice": {
    description: "Create a stack of three blocks",
    dragList: [
      function() { dragToNext("a", "b", true); },
      function() { dragToNext("b", "c", false); }
    ]
  },
  "drag_to_next_by_inferior": {
    description: "Drag the inferior block",
    dragList: [
      function() { dragToNext("a", "b", false); }
    ]
  },
  "drag_between": {
    description: "Drag a block between two connected blocks",
    dragList: [
      function() { dragToNext("a", "b", true); },
      function() { dragToNext("a", "c", false); }
    ]
  }
};

var runSpeed = 1;
// Which tests to run on this pass.
var testToRunList = [];
var testIndex = 0;
var runningTestInfo = null;
var dragList = [];
var dragIndex = 0;

var TEST_PASSED = 0;
var TEST_FAILED = 1;
var TEST_NOT_RUN = 2;


function createTestPicker() {
  var container = document.getElementById('test_picker');

  for (var key in testSuite) {
    var value = testSuite[key];

    var label = document.createElement("label");
    var input = document.createElement("input");
    input.type = "checkbox";
    input.name = key;
    input.value = key;
    input.id = key;
    input.checked = true;
    label.appendChild(input);
    container.appendChild(label);
    label.appendChild(document.createTextNode(key));
    var statusLabel = document.createTextNode("");
    label.appendChild(statusLabel);
    container.appendChild(document.createElement("br"));

    // Remember inputs and status labels so we don't have to find them later.
    value.input = input;
    value.statusLabel = statusLabel;
    value.label = label;
    value.name = key;
  }
}

function start() {
  var toolbox = document.getElementById('toolbox');
  workspace = Blockly.inject('blocklyDiv',
          {comments: true,
           disable: true,
           collapse: true,
           grid:
             {spacing: 25,
              length: 3,
              colour: '#ccc',
              snap: true},
           maxBlocks: Infinity,
           media: '../media/',
           readOnly: false,
           rtl: rtl,
           scrollbars: true,
           toolbox: {},
           zoom:
             {controls: true,
              wheel: true,
              startScale: 1.0,
              maxScale: 4,
              minScale: .25,
              scaleSpeed: 1.1}
          });
  createTestPicker();
}

function addAllTests() {
  setAllCheckboxes(true);
  addCheckedTests(true);
}

function setAllCheckboxes(state) {
  for (var key in testSuite) {
    testSuite[key].input.checked = state;
  }
}

function addCheckedTests() {
  testToRunList = [];
  for (var key in testSuite) {
    var value = testSuite[key];
    var input = value.input;
    if (input && input.checked) {
      testToRunList.push(
        testSuite[key]
      );
    }
  }
}

function assert(condition, message) {
  if (!condition) {
    throw message || "Assertion failed";
  }
}

function assertEquals(a, b, message) {
  if (a != b) {
    throw message + "\nExpected: " + a + "\n but found: " + b || "Assertion failed";
  }
}

function dragByBlock(blockToDrag, dx, dy) {
  if (!blockToDrag) {
    dragWrapper();
    return;
  }
  // Note: We could just pass in the bounding client rect and that would speed
  // this up but lose some encapsulation.  If necessary we'll do it later.
  var blockTop = blockToDrag.svgGroup_.getBoundingClientRect().top;
  var blockLeft = blockToDrag.svgGroup_.getBoundingClientRect().left;
  // Click somewhere on the block.
  var mouseDownEvent = new MouseEvent('mousedown',
      {clientX: blockLeft + 5, clientY: blockTop + 5});
  blockToDrag.onMouseDown_(mouseDownEvent);
  // Throw in a move for good measure.
  window.setTimeout(
    function() {
      var mouseMoveEvent = new MouseEvent('mousemove',
          {clientX: blockLeft + dx,
          clientY: blockTop + dy});
      blockToDrag.onMouseMove_(mouseMoveEvent);
      // And a second mvoe to get the highlighting right.
      window.setTimeout(
      function() {
        var mouseMoveEvent = new MouseEvent('mousemove',
            {clientX: blockLeft + dx,
            clientY: blockTop + dy});
        blockToDrag.onMouseMove_(mouseMoveEvent);
        // Drop at dx, dy.
        window.setTimeout(
          function() {
            var mouseUpEvent = new MouseEvent('mouseup',
                {clientX: blockLeft + dx,
                clientY: blockTop + dy});
            blockToDrag.onMouseUp_(mouseUpEvent);
            window.setTimeout(dragWrapper, 100 * runSpeed);
          }, 30 * runSpeed);
      }, 30 * runSpeed);
    }, 30 * runSpeed);
}

function dragByConnection(superiorBlock, superiorBlockConnection,
    inferiorBlock, inferiorBlockConnection, dragSuperior) {

  var superiorBlockBounds = superiorBlock.svgGroup_.getBoundingClientRect();
  var inferiorBlockBounds = inferiorBlock.svgGroup_.getBoundingClientRect();

  var dx = (inferiorBlockBounds.left + inferiorBlockConnection.offsetInBlock_.x) -
      (superiorBlockBounds.left + superiorBlockConnection.offsetInBlock_.x);
  var dy = (inferiorBlockBounds.top + inferiorBlockConnection.offsetInBlock_.y) -
      (superiorBlockBounds.top + superiorBlockConnection.offsetInBlock_.y);

  if(dragSuperior) {
    dragByBlock(superiorBlock, dx, dy);
  } else {
    dragByBlock(inferiorBlock, -dx, -dy);
  }
}

/**
 * @param {string} superiorBlockId the id of the block that will be superior
 *    after the drag.
 * @param {string} inferiorBlockId The id of the block that will be inferior
 *    after the drag.
 * @param {string} inputName The name of the input to connect to on the superior
 *    block.
 * @param {boolean} dragSuperior True if the superior block should be dragged,
 *     false if the inferior block should be dragged.
 */
function dragToInput(superiorBlockId, inferiorBlockId, inputName, dragSuperior) {
  var superiorBlock = Blockly.getMainWorkspace().getBlockById(superiorBlockId);
  var inferiorBlock = Blockly.getMainWorkspace().getBlockById(inferiorBlockId);

  assert(superiorBlock, 'Superior block was missing.  Id was ' + superiorBlockId);
  assert(inferiorBlock, 'Inferior block was missing.  Id was ' + inferiorBlockId);

  var superiorBlockInput = superiorBlock.getInput(inputName);
  assert(superiorBlockInput, 'Input not found on superior block.');

  var superiorBlockConnection = superiorBlockInput.connection;
  assert(superiorBlockConnection, 'Connection not found on input');

  if (superiorBlockConnection.type == Blockly.INPUT_VALUE) {
    var inferiorBlockConnection = inferiorBlock.outputConnection;
    assert(inferiorBlockConnection, 'No output connection on inferior block');
  } else if (superiorBlockConnection.type == Blockly.NEXT_STATEMENT) {
    var inferiorBlockConnection = inferiorBlock.previousConnection;
    assert(inferiorBlockConnection, 'No previous connection on inferior block');
  }

  dragByConnection(superiorBlock, superiorBlockConnection,
      inferiorBlock, inferiorBlockConnection, dragSuperior);
}

function dragToNext(superiorBlockId, inferiorBlockId, dragSuperior) {
  var superiorBlock = Blockly.getMainWorkspace().getBlockById(superiorBlockId);
  var inferiorBlock = Blockly.getMainWorkspace().getBlockById(inferiorBlockId);

  assert(superiorBlock, 'Superior block was missing.  Id was ' + superiorBlockId);
  assert(inferiorBlock, 'Inferior block was missing.  Id was ' + inferiorBlockId);

  var superiorBlockConnection = superiorBlock.nextConnection;
  assert(superiorBlockConnection, 'Connection not found on superior block.');

  var inferiorBlockConnection = inferiorBlock.previousConnection;
  assert(inferiorBlockConnection, 'Connection not found on inferior block.');

  dragByConnection(superiorBlock, superiorBlockConnection,
      inferiorBlock, inferiorBlockConnection, dragSuperior);
}

function clearStatuses() {
  for (var key in testSuite) {
    setTestStatus(testSuite[key], TEST_NOT_RUN);
  }
}

function runTestWrapper() {
  var testInfo = testToRunList[testIndex];
  testIndex++;
  if (testInfo) {
    runningTestInfo = testInfo;
    runTest();
  } else {
    console.log("Done running tests");
  }
}

function runTest() {
  var statusLabel = runningTestInfo.statusLabel;
  statusLabel.nodeValue = "\tRunning...";
  console.info("Running test " + runningTestInfo.name);
  var elementId = runningTestInfo.name + '_initial';
  Blockly.Xml.domToWorkspace(document.getElementById(elementId), workspace);
  dragList = runningTestInfo.dragList;
  dragWrapper();
}

function startTesting() {
  runSpeed = Math.round(10 / document.getElementById('run_speed').value);
  testIndex = 0;
  clearStatuses();
  runTestWrapper();
}

function setTestStatus(testInfo, state) {
  if (state == TEST_PASSED) {
    var text = ":\tPassed";
    var color = "green";
  } else if (state == TEST_FAILED) {
    var text = ":\tFailed";
    var color = "red";
  } else if (state == TEST_NOT_RUN) {
    var text = "";
    var color = "black";
  }
  testInfo.statusLabel.nodeValue = text;
  testInfo.label.setAttribute("style", "color:" + color);
}

/**
 * Creates a function that returns a false location for the block when it is
 * being serialized to XML.
 * @param {number} i The value to use in the fake coordinate.
 */
function reposition_factory(i) {
  return function() {
    return new goog.math.Coordinate(i, i);
  };
}

/**
 * Helper function to normalize block locatiosn at the end of a test.  Top level
 * blocks are sorted by id and given unique locations.  This guarantees that two
 * workspaces with the same blocks can be compared by xml without needing to
 * strip out location attributes.
 */
function repositionBlocks() {
  var blocks = workspace.getTopBlocks();
  blocks.sort(function(a, b) {
    return (a.id > b.id) ? 1 : -1;
  });

  for(var i = 0; i < blocks.length; i++) {
    blocks[i].getRelativeToSurfaceXY = reposition_factory(i);
  }
}

/**
 * Normalizes workspace DOM to a format that can be compared with string
 * comparison.
 * @param {!Element} input A tree of XML elements.
 * @return {string} Text representation with most whitespace removed.
 */
function normalizedDomToPrettyText(input) {
  var result = Blockly.Xml.domToPrettyText(input);
  // Replace whitespace with simple spaces.
  result = result.replace(/(\r\n|\n|\r|\t|\s)/gm," ");
  // Combine multiple spaces.
  result = result.replace(/\s+/g," ");
  return result;
}

function endTest() {
  repositionBlocks();

  var elementId = runningTestInfo.name + '_golden';
  var result = Blockly.Xml.workspaceToDom(workspace).
      getElementsByTagName("block");
  var golden = document.getElementById(elementId).
      getElementsByTagName("block");

  for (var i = 0; i < result.length; i++) {
    var comparableResult = normalizedDomToPrettyText(result[i]);
    var comparableGolden = normalizedDomToPrettyText(golden[i]);
    assertEquals(comparableGolden, comparableResult,
        "Resulting workspaces were not the same");
  }
  console.log('%ctest passed: ' + runningTestInfo.name, 'color:green');
  setTestStatus(runningTestInfo, TEST_PASSED);
}


function cleanUpTest() {
  dragIndex = 0;
  workspace.clear();
  setTimeout(runTestWrapper, 30 * runSpeed);
}

function dragWrapper() {
  var dragInfo = dragList[dragIndex];
  dragIndex++;
  if (dragInfo) {
    try {
      dragInfo();
    } catch (e) {
      dragIndex = 0;
      workspace.clear();
      console.error('test failed: ' + runningTestInfo.name);
      console.error(e);
      setTestStatus(runningTestInfo, TEST_FAILED);
    }
  } else {
    try {
      endTest();
    } catch (e) {
      console.error('test failed: ' + runningTestInfo.name);
      console.error(e);
      setTestStatus(runningTestInfo, TEST_FAILED);
    }
    setTimeout(cleanUpTest, 300 * runSpeed);
  }
}
