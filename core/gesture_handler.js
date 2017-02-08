/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview The class that handles gestures (drags, clicks, etc) across
 * all of Blockly, including multiple workspaces.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

/**
 * @name Blockly.GestureHandler
 * @namespace
 */
goog.provide('Blockly.GestureHandler');

goog.require('Blockly.Gesture');
goog.require('Blockly.Touch');


/**
 * Map from touch identifiers to in-progress gestures.
 * @type {!Object<string, Blockly.Gesture>}
 * @private
 */
Blockly.GestureHandler.gestureMap_ = Object.create(null);

/**
 * How many gestures are currently being tracked.
 * @type {number}
 * @private
 */
Blockly.GestureHandler.numGesturesInProgress_ = 0;

/**
 * The maximum allowable number of concurrent gestures.
 * @type {number}
 * @const
 */
Blockly.GestureHandler.MAX_GESTURES = 1;

/**
 * Look up the gesture that is tracking this touch stream.  May create a new
 * gesture.
 * @param {!Event} e Mouse event or touch event
 * @return {Blockly.Gesture} The gesture that is tracking this touch stream,
 *     or null if no valid gesture exists.
 */
Blockly.GestureHandler.gestureForEvent = function(e) {
  var id = Blockly.Touch.getTouchIdentifierFromEvent(e);
  var gesture = Blockly.GestureHandler.gestureMap_[id];
  if (gesture) {
    return gesture;
  } else if (Blockly.GestureHandler.numGesturesInProgress_ >=
      Blockly.GestureHandler.MAX_GESTURES) {
    return null;
  }

  // No gesture existed for this identifier, but this looks like the start of a
  // new gesture.
  if (e.type == 'mousedown' || e.type == 'touchstart') {
    gesture = new Blockly.Gesture(e, id);
    Blockly.GestureHandler.gestureMap_[id] = gesture;
    Blockly.GestureHandler.numGesturesInProgress_++;
    return gesture;
  }
  // No gesture existed and this event couldn't be the start of a new gesture.
  return null;
};

/**
 * Delete the current gesture for the specified touch identifier.
 * @param {string} id The touch id whose gesture should be deleted.
 */
Blockly.GestureHandler.removeGestureForId = function(id) {
  var gesture = Blockly.GestureHandler.gestureMap_[id];
  if (gesture) {
    gesture.dispose();
    Blockly.GestureHandler.numGesturesInProgress_--;
  }
  Blockly.GestureHandler.gestureMap_[id] = null;
};

/**
 * List all gestures in progress on the given workspace.
 * @param {!Blockly.WorkspaceSvg} ws The workspace to look for.
 * @return {!Array.<!Blockly.Gesture>} A list of all gestures on this workspace.
 */
Blockly.GestureHandler.getGesturesOnWorkspace = function(ws) {
  // TODO: Consider naming inconsistency between "getGesturesOnWorkspace" and
  // "removeGestureForId", "gestureForEvent".
  var result = [];
  // TODO: Speed of for ... in?
  for (var id in Blockly.GestureHandler.gestureMap_) {
    var gesture = Blockly.GestureHandler.gestureMap_[id];
    if (gesture && gesture.isOnWorkspace(ws)) {
      result.push(gesture);
    }
  }
  return result;
};