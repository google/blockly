
var fakeDragStack = [];

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

function fakeDragById(id, dx, dy, opt_workspace) {
  var ws = opt_workspace ? opt_workspace : Blockly.getMainWorkspace();
  var blockToDrag = ws.getBlockById(id);
  if (!blockToDrag) {
    dragWrapper();
    return;
  }
  fakeDragByBlock(blockToDrag, dx, dy);
}


function fakeDragByBlock(blockToDrag, dx, dy) {
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
            window.setTimeout(dragWrapper, 100);
          }, 30);
      }, 30);
    }, 30);
}

function fakeDragConnectBefore(firstBlockId, secondBlockId) {
  var firstBlock = Blockly.getMainWorkspace().getBlockById(firstBlockId);
  var secondBlock = Blockly.getMainWorkspace().getBlockById(secondBlockId);

  if (!(firstBlock && secondBlock)) {
    throw 'Couldn\'t find those blocks';
  }
  var firstBlockNext = firstBlock.nextConnection;
  var secondBlockPrevious = secondBlock.previousConnection;

  if (!(firstBlockNext && secondBlockPrevious)) {
    throw 'These blocks don\'t have the right connections.';
  }

  var firstBlockBounds = firstBlock.svgGroup_.getBoundingClientRect();
  var secondBlockBounds = secondBlock.svgGroup_.getBoundingClientRect();

  var xDiff = (secondBlockBounds.left + secondBlockPrevious.offsetInBlock_.x) -
      (firstBlockBounds.left + firstBlockNext.offsetInBlock_.x);
  var yDiff = (secondBlockBounds.top + secondBlockPrevious.offsetInBlock_.y) -
      (firstBlockBounds.top + firstBlockNext.offsetInBlock_.y);

  //fakeDragByBlock(firstBlockId, xDiff - 1, yDiff - 1);
  fakeDragById(firstBlockId, xDiff - 1, yDiff - 1);
}

function fakeDragByConnection(superiorBlock, superiorBlockConnection,
    inferiorBlock, inferiorBlockConnection, dragSuperior) {

  var superiorBlockBounds = superiorBlock.svgGroup_.getBoundingClientRect();
  var inferiorBlockBounds = inferiorBlock.svgGroup_.getBoundingClientRect();

  var dx = (inferiorBlockBounds.left + inferiorBlockConnection.offsetInBlock_.x) -
      (superiorBlockBounds.left + superiorBlockConnection.offsetInBlock_.x);
  var dy = (inferiorBlockBounds.top + inferiorBlockConnection.offsetInBlock_.y) -
      (superiorBlockBounds.top + superiorBlockConnection.offsetInBlock_.y);

  if(dragSuperior) {
    fakeDragByBlock(superiorBlock, dx, dy);
  } else {
    fakeDragByBlock(inferiorBlock, dx, dy);
  }
};

/**
 * @param superiorBlockId the id of the block that will be superior after the drag.
 * @param inferiorBlockId The id of the block that will be inferior after the drag.
 * @param inputName The name of the input to connect to on the superior block.
 * @param {boolean} dragSuperior True if the superior block should be dragged,
 *     false if the inferior block should be dragged.
 */
function fakeDragToInput(superiorBlockId, inferiorBlockId, inputName, dragSuperior) {
  var superiorBlock = Blockly.getMainWorkspace().getBlockById(superiorBlockId);
  var inferiorBlock = Blockly.getMainWorkspace().getBlockById(inferiorBlockId);

  assert(superiorBlock, 'Superior block was missing.');
  assert(inferiorBlock, 'Inferior block was missing.');

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

  fakeDragByConnection(superiorBlock, superiorBlockConnection,
      inferiorBlock, inferiorBlockConnection, dragSuperior);
};

function fakeDragToNext(superiorBlockId, inferiorBlockId, dragSuperior) {
  var superiorBlock = Blockly.getMainWorkspace().getBlockById(superiorBlockId);
  var inferiorBlock = Blockly.getMainWorkspace().getBlockById(inferiorBlockId);

  assert(superiorBlock, 'Superior block was missing.');
  assert(inferiorBlock, 'Inferior block was missing.');

  var superiorBlockConnection = superiorBlock.nextConnection;
  assert(superiorBlockConnection, 'Connection not found on superior block.');

  var inferiorBlockConnection = inferiorBlock.previousConnection;
  assert(inferiorBlockConnection, 'Connection not found on inferior block.');

  fakeDragByConnection(superiorBlock, superiorBlockConnection,
      inferiorBlock, inferiorBlockConnection, dragSuperior);
};

var testToRunList = [];
var runningTestInfo = null;



function setUp() {
  testToRunList.push({
    name: "drag_to_next_twice",
    dragStack: [
      function() { fakeDragToNext("a", "b", true); },
      function() { fakeDragToNext("b", "c", true); }
    ]
  });

  testToRunList.push({
    name: "drag_to_next",
    dragStack: [
      function() { fakeDragToNext("a", "b", true); }
    ]
  });

  console.time('Running tests');
}

function runTestWrapper() {
  var testInfo = testToRunList.pop();
  if (testInfo) {
    runningTestInfo = testInfo;
    runTest();
  } else {
    console.log("Done running tests");
    console.timeEnd('Running tests');
  }
}

function runTest() {
  var elementId = runningTestInfo.name + '_initial';
  Blockly.Xml.domToWorkspace(document.getElementById(elementId), workspace);
  fakeDragStack = runningTestInfo.dragStack;
  dragWrapper();
}

function reposition_factory(i) {
  return function() {
    return new goog.math.Coordinate(i, i);
  };
}

function repositionBlocks() {
  var blocks = workspace.getTopBlocks();
  blocks.sort(function(a, b) {
    return (a.id > b.id) ? 1 : -1;
  });

  for(var i = 0; i < blocks.length; i++) {
    blocks[i].getRelativeToSurfaceXY = reposition_factory(i);
  }
}

function endTest() {
  repositionBlocks();

  var elementId = runningTestInfo.name + '_golden';
  var result = Blockly.Xml.workspaceToDom(workspace).
      getElementsByTagName("block");
  var golden = document.getElementById(elementId).
      getElementsByTagName("block");

  for (var i = 0; i < result.length; i++) {
    var comparableResult =
        Blockly.Xml.domToPrettyText(result[i]).replace(/(\r\n|\n|\r|\s)/gm,"");
    var comparableGolden =
        Blockly.Xml.domToPrettyText(golden[i]).replace(/(\r\n|\n|\r|\s)/gm,"");
    assertEquals(comparableResult, comparableGolden,
        "Resulting workspaces were not the same");
  }
  console.log('test passed: ' + runningTestInfo.name);
}


function cleanUp() {
  setTimeout(function() {
      workspace.clear();
      runTestWrapper(); },
    1000);
}

function dragWrapper() {
  var dragInfo = fakeDragStack.pop();
  if (dragInfo) {
    dragInfo();
  } else {
    try {
      endTest();
    } catch (e) {
      console.error('test failed: ' + runningTestInfo.name);
      console.error(e);
    }
    cleanUp();
  }
}


