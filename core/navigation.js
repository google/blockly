/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
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

goog.provide('Blockly.Navigation');

Blockly.Navigation.connection = null;
Blockly.Navigation.inArr = [];
Blockly.Navigation.outArr = [];

Blockly.Navigation.navigateBetweenStacks = function(forward) {
  var curBlock = Blockly.selected;
  if (!curBlock) {
    return null;
  }
  var curRoot = curBlock.getRootBlock();
  var topBlocks = curRoot.workspace.getTopBlocks();
  for (var i = 0; i < topBlocks.length; i++) {
    var topBlock = topBlocks[i];
    if (curRoot.id == topBlock.id) {
      var offset = forward ? 1 : -1;
      var resultIndex = i + offset;
      if (resultIndex == -1) {
        resultIndex = topBlocks.length - 1;
      } else if (resultIndex == topBlocks.length) {
        resultIndex = 0;
      }
      topBlocks[resultIndex].select();
      return Blockly.selected;
    }
  }
  throw Error('Couldn\'t find ' + (forward ? 'next' : 'previous') +
      ' stack?!?!?!');
};

Blockly.Navigation.setConnection = function() {
  Blockly.keyboardAccessibilityMode_ = true;
  Blockly.Navigation.connection = Blockly.selected.previousConnection;
  Blockly.cursor.showWithConnection(Blockly.selected.previousConnection);
};

Blockly.Navigation.keyboardNext = function() {
  Blockly.Navigation.inArr = [];
  var curConnect = Blockly.Navigation.connection;
  var nextConnection;
  if (!curConnect) {
    return null;
  }
  var nxtBlock = curConnect.sourceBlock_.getNextBlock();
  if (nxtBlock){
    nextConnection = nxtBlock.previousConnection;
  }
  else {
    nextConnection = curConnect.sourceBlock_.nextConnection;
  }
  //Set cursor here
  Blockly.cursor.showWithConnection(nextConnection);
  Blockly.Navigation.connection = nextConnection;
  return nextConnection;
};

Blockly.Navigation.keyboardPrev = function() {
  var curConnect = Blockly.Navigation.connection;
  var prevConnection;
  if (!curConnect) {
    return null;
  }
  var prevBlock = curConnect.sourceBlock_.getParent();
  if (curConnect === curConnect.sourceBlock_.nextConnection) {
    prevConnection = curConnect.sourceBlock_.previousConnection;
  } else if (prevBlock){
    prevConnection = prevBlock.previousConnection;
  }
  else {
    prevConnection = curConnect.sourceBlock_.previousConnection;
  }
  //Set cursor here
  Blockly.cursor.showWithConnection(prevConnection);
  Blockly.Navigation.connection = prevConnection;
  return prevConnection;
};

Blockly.Navigation.findCurBlock = function(curConnect) {
  var curBlock;
  if (curConnect.type === Blockly.INPUT_VALUE) {
    curBlock = curConnect.targetBlock();
  } else if (curConnect.type == Blockly.PREVIOUS_STATEMENT) {
    curBlock = curConnect.sourceBlock_;
  } else if (curConnect.type == Blockly.NEXT_STATEMENT) {
    curBlock = curConnect.targetConnection.sourceBlock_;
  }
  return curBlock;
};

Blockly.Navigation.keyboardIn = function() {
  if (!Blockly.Navigation.connection) { return; }

  var prevConnection;
  var connection;
  var inArr = Blockly.Navigation.inArr;
  var curConnect = Blockly.Navigation.connection;
  var curBlock = Blockly.Navigation.findCurBlock(curConnect);
  var curInputs = curBlock.inputList;
  Blockly.Navigation.outArr.push(curConnect);

  //Add all inputs on block to a list
  for (var i = curInputs.length - 1; i >= 0; i--) {
    var curInput = curInputs[i];
    if (inArr.indexOf(curInput.connection) < 0
        && curInput.connection) {
      inArr.push(curInput.connection);
    }
  }
  if (Blockly.Navigation.inArr.length === 0) {
    Blockly.Navigation.keyboardNext();
  } else {
    //pop value off of the list
    connection = inArr.pop();
    //display that value
    Blockly.cursor.showWithConnection(connection);
    //change current to the popped off value
    Blockly.Navigation.connection = connection;
  }
};

Blockly.Navigation.keyboardOut = function() {
  var curConnect = Blockly.Navigation.connection;
  var outArr = Blockly.Navigation.outArr;
  var prevConnect = outArr.pop();

  if (!prevConnect) {
    return;
  }
  //Add the current connection to in array
  Blockly.Navigation.inArr.push(curConnect);
  //show the previous connection
  Blockly.cursor.showWithConnection(prevConnect);
  //Make previous connection our current connection
  Blockly.Navigation.connection = prevConnect;
};

Blockly.Navigation.navigate = function(e) {
  if (e.keyCode === goog.events.KeyCodes.UP) {
    Blockly.Navigation.keyboardPrev();
  } else if (e.keyCode === goog.events.KeyCodes.DOWN) {
    Blockly.Navigation.keyboardNext();
  } else if (e.keyCode === goog.events.KeyCodes.RIGHT) {
    Blockly.Navigation.keyboardIn();
  } else if (e.keyCode === goog.events.KeyCodes.LEFT) {
    Blockly.Navigation.keyboardOut();
  }
};

Blockly.Navigation.enableKeyboardAccessibility = function() {
  Blockly.keyboardAccessibilityMode_ = true;
};

Blockly.Navigation.disableKeyboardAccessibility = function() {
  Blockly.keyboardAccessibilityMode_ = false;
};
