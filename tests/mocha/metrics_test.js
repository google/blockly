/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Metrics tests.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

suite('Metrics', function() {
  function assertDimensionsMatch(toCheck, left, top, width, height) {
    assertEquals('Top did not match.', top, toCheck.top);
    assertEquals('Left did not match.', left, toCheck.left);
    assertEquals('Width did not match.', width, toCheck.width);
    assertEquals('Height did not match.', height, toCheck.height);
  }

  // Make a mock workspace object with two properties:
  // getBlocksBoundingBox and scale.
  function makeMockWs(scale, x, y, width, height) {
    return {
      getBlocksBoundingBox: function() {
        return {
          top: y,
          bottom: y + height,
          left: x,
          right: x + width
        };
      },
      scale: scale
    };
  }

  test('GetContentDimensionsExact - empty', function() {
    var ws = makeMockWs(1, 0, 0, 0, 0);
    var defaultZoom = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
    assertDimensionsMatch(defaultZoom, 0, 0, 0, 0);
  });
  test('GetContentDimensionsExact - empty zoom in', function() {
    var ws = makeMockWs(2, 0, 0, 0, 0);
    var zoomIn = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
    assertDimensionsMatch(zoomIn, 0, 0, 0, 0);
  });
  test('GetContentDimensionsExact - empty zoom out', function() {
    var ws = makeMockWs(.5, 0, 0, 0, 0);
    var zoomOut = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
    assertDimensionsMatch(zoomOut, 0, 0, 0, 0);
  });
  test('GetContentDimensionsExact - non empty at origin', function() {
    var ws = makeMockWs(1, 0, 0, 100, 100);
    var defaultZoom = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
    // Pixel and ws units are the same at default zoom.
    assertDimensionsMatch(defaultZoom, 0, 0, 100, 100);
  });
  test('GetContentDimensionsExact - non empty at origin zoom in', function() {
    var ws = makeMockWs(2, 0, 0, 100, 100);
    var zoomIn = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
    // 1 ws unit = 2 pixels at this zoom level.
    assertDimensionsMatch(zoomIn, 0, 0, 200, 200);
  });
  test('GetContentDimensionsExact - non empty at origin zoom out', function() {
    var ws = makeMockWs(.5, 0, 0, 100, 100);
    var zoomOut = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
    // 1 ws unit = 0.5 pixels at this zoom level.
    assertDimensionsMatch(zoomOut, 0, 0, 50, 50);
  });
  test('GetContentDimensionsExact - non empty positive origin', function() {
    var ws = makeMockWs(1, 10, 10, 100, 100);
    var defaultZoom = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
    // Pixel and ws units are the same at default zoom.
    assertDimensionsMatch(defaultZoom, 10, 10, 100, 100);
  });
  test('GetContentDimensionsExact - non empty positive origin zoom in', function() {
    var ws = makeMockWs(2, 10, 10, 100, 100);
    var zoomIn = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
    // 1 ws unit = 2 pixels at this zoom level.
    assertDimensionsMatch(zoomIn, 20, 20, 200, 200);
  });
  test('GetContentDimensionsExact - non empty positive origin zoom out', function() {
    var ws = makeMockWs(.5, 10, 10, 100, 100);
    var zoomOut = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
    // 1 ws unit = 0.5 pixels at this zoom level.
    assertDimensionsMatch(zoomOut, 5, 5, 50, 50);
  });
  test('GetContentDimensionsExact - non empty negative origin', function() {
    var ws = makeMockWs(1, -10, -10, 100, 100);
    var defaultZoom = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
    // Pixel and ws units are the same at default zoom.
    assertDimensionsMatch(defaultZoom, -10, -10, 100, 100);
  });
  test('GetContentDimensionsExact - non empty negative origin zoom in', function() {
    var ws = makeMockWs(2, -10, -10, 100, 100);
    var zoomIn = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
    // 1 ws unit = 2 pixels at this zoom level.
    assertDimensionsMatch(zoomIn, -20, -20, 200, 200);
  });
  test('GetContentDimensionsExact - non empty negative origin zoom out', function() {
    var ws = makeMockWs(.5, -10, -10, 100, 100);
    var zoomOut = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
    // 1 ws unit = 0.5 pixels at this zoom level.
    assertDimensionsMatch(zoomOut, -5, -5, 50, 50);
  });
});
