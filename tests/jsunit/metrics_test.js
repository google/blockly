/**
 * @license
 * Copyright 2018 Google LLC
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
'use strict';

function assertDimensionsMatch(toCheck, left, top, width, height) {
  assertEquals('Top did not match.', top, toCheck.top);
  assertEquals('Left did not match.', left, toCheck.left);
  assertEquals('Width did not match.', width, toCheck.width);
  assertEquals('Height did not match.', height, toCheck.height);
}

/**
 * Make a mock workspace object with two properties: getBlocksBoundingBox and
 * scale.
 */
function makeMockWs(scale, x, y, width, height) {
  return {
    getBlocksBoundingBox: function() {
      return {
        top: y,
        bottom: y + height,
        left: x,
        right: x + width
      }
    },
    scale: scale
  };
}

// Empty workspace.
var test_GetContentDimensionsExact_empty = function() {
  var ws = makeMockWs(1, 0, 0, 0, 0)
  var defaultZoom = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
  assertDimensionsMatch(defaultZoom, 0, 0, 0, 0);
}

var test_GetContentDimensionsExact_emptyZoomIn = function() {
  var ws = makeMockWs(2, 0, 0, 0, 0)
  var zoomIn = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
  assertDimensionsMatch(zoomIn, 0, 0, 0, 0);
}

var test_GetContentDimensionsExact_emptyZoomOut = function() {
  var ws = makeMockWs(.5, 0, 0, 0, 0)
  var zoomOut = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
  assertDimensionsMatch(zoomOut, 0, 0, 0, 0);
}

// Non-empty workspace, with top-left corner at ws origin.
var test_GetContentDimensionsExact_nonEmptyAtOrigin = function() {
  var ws = makeMockWs(1, 0, 0, 100, 100)
  var defaultZoom = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
  // Pixel and ws units are the same at default zoom.
  assertDimensionsMatch(defaultZoom, 0, 0, 100, 100);
}

var test_GetContentDimensionsExact_nonEmptyAtOriginZoomIn = function() {
  var ws = makeMockWs(2, 0, 0, 100, 100)
  var zoomIn = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
  // 1 ws unit = 2 pixels at this zoom level.
  assertDimensionsMatch(zoomIn, 0, 0, 200, 200);
}

var test_GetContentDimensionsExact_nonEmptyAtOriginZoomOut = function() {
  var ws = makeMockWs(.5, 0, 0, 100, 100)
  var zoomOut = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
  // 1 ws unit = 0.5 pixels at this zoom level.
  assertDimensionsMatch(zoomOut, 0, 0, 50, 50);
}

// Non-empty workspace, with top-left corner in positive ws coordinates.
var test_GetContentDimensionsExact_nonEmptyPositiveOrigin = function() {
  var ws = makeMockWs(1, 10, 10, 100, 100)
  var defaultZoom = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
  // Pixel and ws units are the same at default zoom.
  assertDimensionsMatch(defaultZoom, 10, 10, 100, 100);
}

// Changing zoom will change both width/height and origin location in pixels.
var test_GetContentDimensionsExact_nonEmptyPositiveOriginZoomIn = function() {
  var ws = makeMockWs(2, 10, 10, 100, 100)
  var zoomIn = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
  // 1 ws unit = 2 pixels at this zoom level.
  assertDimensionsMatch(zoomIn, 20, 20, 200, 200);
}

var test_GetContentDimensionsExact_nonEmptyPositiveOriginZoomOut = function() {
  var ws = makeMockWs(.5, 10, 10, 100, 100)
  var zoomOut = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
  // 1 ws unit = 0.5 pixels at this zoom level.
  assertDimensionsMatch(zoomOut, 5, 5, 50, 50);
}

// Non-empty workspace, with top-left corner in negative ws coordinates.
var test_GetContentDimensionsExact_nonEmptyNegativeOrigin = function() {
  var ws = makeMockWs(1, -10, -10, 100, 100)
  var defaultZoom = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
  // Pixel and ws units are the same at default zoom.
  assertDimensionsMatch(defaultZoom, -10, -10, 100, 100);
}

// Changing zoom will change both width/height and origin location in pixels.
var test_GetContentDimensionsExact_nonEmptyNegativeOriginZoomIn = function() {
  var ws = makeMockWs(2, -10, -10, 100, 100)
  var zoomIn = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
  // 1 ws unit = 2 pixels at this zoom level.
  assertDimensionsMatch(zoomIn, -20, -20, 200, 200);
}

var test_GetContentDimensionsExact_nonEmptyNegativeOriginZoomOut = function() {
  var ws = makeMockWs(.5, -10, -10, 100, 100)
  var zoomOut = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
  // 1 ws unit = 0.5 pixels at this zoom level.
  assertDimensionsMatch(zoomOut, -5, -5, 50, 50);
}
