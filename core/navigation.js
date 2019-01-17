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
  if (prevBlock){
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

Blockly.Navigation.navigate = function(e) {
  if (e.keyCode === goog.events.KeyCodes.UP) {
    Blockly.Navigation.keyboardPrev();
  } else if (e.keyCode === goog.events.KeyCodes.DOWN) {
    Blockly.Navigation.keyboardNext();
  }
};

Blockly.Navigation.enableKeyboardAccessibility = function() {
  Blockly.keyboardAccessibilityMode_ = true;
};

Blockly.Navigation.disableKeyboardAccessibility = function() {
  Blockly.keyboardAccessibilityMode_ = false;
};
