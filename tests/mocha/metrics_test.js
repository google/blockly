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
    chai.assert.equal(top, toCheck.top, 'Top did not match.');
    chai.assert.equal(left, toCheck.left, 'Left did not match.');
    chai.assert.equal(width, toCheck.width, 'Width did not match.');
    chai.assert.equal(height, toCheck.height, 'Height did not match.');
  }

  // Make a mock workspace object with two properties:
  // getBlocksBoundingBox and scale.
  function makeMockWs(scale, x, y, width, height) {
    return {
      getBlocksBoundingBox: function() {
        return {top: y, bottom: y + height, left: x, right: x + width};
      },
      getToolbox: function() {},
      getFlyout: function() {},
      scale: scale
    };
  }

  function absoluteSetup(
      metricsManager, toolboxMetrics, flyoutMetrics, getToolbox, getFlyout) {
    var toolboxMetricsStub = sinon.stub(metricsManager, 'getToolboxMetrics');
    var flyoutMetricsStub = sinon.stub(metricsManager, 'getFlyoutMetrics');
    var getToolboxStub = sinon.stub(metricsManager.workspace_, 'getToolbox');
    var getFlyoutStub = sinon.stub(metricsManager.workspace_, 'getFlyout');

    toolboxMetricsStub.onCall(0).returns(toolboxMetrics);
    flyoutMetricsStub.onCall(0).returns(flyoutMetrics);
    getToolboxStub.onCall(0).returns(getToolbox);
    getFlyoutStub.onCall(0).returns(getFlyout);
  }

  setup(function() {
    sharedTestSetup.call(this);
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('getContentDimensionsExact_', function() {
    test('Empty', function() {
      var ws = makeMockWs(1, 0, 0, 0, 0);
      var metricsManager = new Blockly.MetricsManager(ws);
      var defaultZoom = metricsManager.getContentDimensionsExact_(ws);
      assertDimensionsMatch(defaultZoom, 0, 0, 0, 0);
    });
    test('Empty zoom in', function() {
      var ws = makeMockWs(2, 0, 0, 0, 0);
      var metricsManager = new Blockly.MetricsManager(ws);
      var zoomIn = metricsManager.getContentDimensionsExact_(ws);
      assertDimensionsMatch(zoomIn, 0, 0, 0, 0);
    });
    test('Empty zoom out', function() {
      var ws = makeMockWs(.5, 0, 0, 0, 0);
      var metricsManager = new Blockly.MetricsManager(ws);
      var zoomOut = metricsManager.getContentDimensionsExact_(ws);
      assertDimensionsMatch(zoomOut, 0, 0, 0, 0);
    });
    test('Non empty at origin', function() {
      var ws = makeMockWs(1, 0, 0, 100, 100);
      var metricsManager = new Blockly.MetricsManager(ws);
      var defaultZoom = metricsManager.getContentDimensionsExact_(ws);
      // Pixel and ws units are the same at default zoom.
      assertDimensionsMatch(defaultZoom, 0, 0, 100, 100);
    });
    test('Non empty at origin zoom in', function() {
      var ws = makeMockWs(2, 0, 0, 100, 100);
      var metricsManager = new Blockly.MetricsManager(ws);
      var zoomIn = metricsManager.getContentDimensionsExact_(ws);
      // 1 ws unit = 2 pixels at this zoom level.
      assertDimensionsMatch(zoomIn, 0, 0, 200, 200);
    });
    test('Non empty at origin zoom out', function() {
      var ws = makeMockWs(.5, 0, 0, 100, 100);
      var metricsManager = new Blockly.MetricsManager(ws);
      var zoomOut = metricsManager.getContentDimensionsExact_(ws);
      // 1 ws unit = 0.5 pixels at this zoom level.
      assertDimensionsMatch(zoomOut, 0, 0, 50, 50);
    });
    test('Non empty positive origin', function() {
      var ws = makeMockWs(1, 10, 10, 100, 100);
      var metricsManager = new Blockly.MetricsManager(ws);
      var defaultZoom = metricsManager.getContentDimensionsExact_(ws);
      // Pixel and ws units are the same at default zoom.
      assertDimensionsMatch(defaultZoom, 10, 10, 100, 100);
    });
    test('Non empty positive origin zoom in', function() {
      var ws = makeMockWs(2, 10, 10, 100, 100);
      var metricsManager = new Blockly.MetricsManager(ws);
      var zoomIn = metricsManager.getContentDimensionsExact_(ws);
      // 1 ws unit = 2 pixels at this zoom level.
      assertDimensionsMatch(zoomIn, 20, 20, 200, 200);
    });
    test('Non empty positive origin zoom out', function() {
      var ws = makeMockWs(.5, 10, 10, 100, 100);
      var metricsManager = new Blockly.MetricsManager(ws);
      var zoomOut = metricsManager.getContentDimensionsExact_(ws);
      // 1 ws unit = 0.5 pixels at this zoom level.
      assertDimensionsMatch(zoomOut, 5, 5, 50, 50);
    });
    test('Non empty negative origin', function() {
      var ws = makeMockWs(1, -10, -10, 100, 100);
      var metricsManager = new Blockly.MetricsManager(ws);
      var defaultZoom = metricsManager.getContentDimensionsExact_(ws);
      // Pixel and ws units are the same at default zoom.
      assertDimensionsMatch(defaultZoom, -10, -10, 100, 100);
    });
    test('Non empty negative origin zoom in', function() {
      var ws = makeMockWs(2, -10, -10, 100, 100);
      var metricsManager = new Blockly.MetricsManager(ws);
      var zoomIn = metricsManager.getContentDimensionsExact_(ws);
      // 1 ws unit = 2 pixels at this zoom level.
      assertDimensionsMatch(zoomIn, -20, -20, 200, 200);
    });
    test('Non empty negative origin zoom out', function() {
      var ws = makeMockWs(.5, -10, -10, 100, 100);
      var metricsManager = new Blockly.MetricsManager(ws);
      var zoomOut = metricsManager.getContentDimensionsExact_(ws);
      // 1 ws unit = 0.5 pixels at this zoom level.
      assertDimensionsMatch(zoomOut, -5, -5, 50, 50);
    });
  });

  suite('getContentDimensionsBounded_', function() {
    test('Empty workspace', function() {
      var metricsManager = new Blockly.MetricsManager({});
      var contentDimensionsStub =
          sinon.stub(metricsManager, 'getContentDimensionsExact_');
      // The location of the viewport.
      var mockViewMetrics = {top: 0, left: 0, width: 200, height: 200};
      // The bounding box around the blocks on the screen.
      var mockContentDimensions = {top: 0, left: 0, width: 0, height: 0};
      contentDimensionsStub.onCall(0).returns(mockContentDimensions);
      var contentMetrics =
          metricsManager.getContentDimensionsBounded_(mockViewMetrics);
      // Should add half the view width to all sides.
      assertDimensionsMatch(contentMetrics, -200, -200, 400, 400);
    });
    test('Non empty workspace', function() {
      var metricsManager = new Blockly.MetricsManager({});
      var contentDimensionsStub =
          sinon.stub(metricsManager, 'getContentDimensionsExact_');
      // The location of the viewport.
      var mockViewMetrics = {top: 0, left: 0, width: 200, height: 200};
      // The bounding box around the blocks on the screen.
      var mockContentDimensions = {top: 100, left: 100, width: 50, height: 50};
      contentDimensionsStub.onCall(0).returns(mockContentDimensions);
      var contentMetrics =
          metricsManager.getContentDimensionsBounded_(mockViewMetrics);
      // Should add half of the view width to all sides.
      assertDimensionsMatch(contentMetrics, -50, -50, 350, 350);
    });
  });
  suite('getAbsoluteMetrics', function() {
    test('Toolbox at left', function() {
      var ws = makeMockWs();
      var metricsManager = new Blockly.MetricsManager(ws);
      var toolboxMetrics = {width: 107, height: 0, position: 2};
      var flyoutMetrics = {};
      absoluteSetup(metricsManager, toolboxMetrics, flyoutMetrics, true, false);
      var absoluteMetrics = metricsManager.getAbsoluteMetrics();
      assertDimensionsMatch(absoluteMetrics, 107, 0);
    });
    test('Toolbox at top', function() {
      var ws = makeMockWs();
      var metricsManager = new Blockly.MetricsManager(ws);
      var toolboxMetrics = {width: 0, height: 107, position: 0};
      var flyoutMetrics = {};
      absoluteSetup(metricsManager, toolboxMetrics, flyoutMetrics, true, false);
      var absoluteMetrics = metricsManager.getAbsoluteMetrics();
      assertDimensionsMatch(absoluteMetrics, 0, 107);
    });
    test('Flyout at left', function() {
      var ws = makeMockWs();
      var metricsManager = new Blockly.MetricsManager(ws);
      var toolboxMetrics = {};
      var flyoutMetrics = {width: 107, height: 0};
      absoluteSetup(metricsManager, toolboxMetrics, flyoutMetrics, false, true);
      var absoluteMetrics = metricsManager.getAbsoluteMetrics();
      assertDimensionsMatch(absoluteMetrics, 107, 0);
    });
    test('Flyout at top', function() {
      var ws = makeMockWs(1, 0, 0, 0, 0);
      var metricsManager = new Blockly.MetricsManager(ws);
      var defaultZoom = metricsManager.getContentDimensionsExact_(ws);
      assertDimensionsMatch(defaultZoom, 0, 0, 0, 0);
    });
  });
  suite('getViewMetrics', function() {
    test('Toolbox at left', function() {
      var ws = makeMockWs(1, 0, 0, 0, 0);
      var metricsManager = new Blockly.MetricsManager(ws);
      var defaultZoom = metricsManager.getContentDimensionsExact_(ws);
      assertDimensionsMatch(defaultZoom, 0, 0, 0, 0);
    });
    test('Toolbox at top', function() {
      var ws = makeMockWs(1, 0, 0, 0, 0);
      var metricsManager = new Blockly.MetricsManager(ws);
      var defaultZoom = metricsManager.getContentDimensionsExact_(ws);
      assertDimensionsMatch(defaultZoom, 0, 0, 0, 0);
    });
    test('Flyout at left', function() {
      var ws = makeMockWs(1, 0, 0, 0, 0);
      var metricsManager = new Blockly.MetricsManager(ws);
      var defaultZoom = metricsManager.getContentDimensionsExact_(ws);
      assertDimensionsMatch(defaultZoom, 0, 0, 0, 0);
    });
    test('Flyout at top', function() {
      var ws = makeMockWs(1, 0, 0, 0, 0);
      var metricsManager = new Blockly.MetricsManager(ws);
      var defaultZoom = metricsManager.getContentDimensionsExact_(ws);
      assertDimensionsMatch(defaultZoom, 0, 0, 0, 0);
    });
    test('Get in workspace coordinates ', function() {
      var ws = makeMockWs(1, 0, 0, 0, 0);
      var metricsManager = new Blockly.MetricsManager(ws);
      var defaultZoom = metricsManager.getContentDimensionsExact_(ws);
      assertDimensionsMatch(defaultZoom, 0, 0, 0, 0);
    });
  });
  suite('getContentMetrics', function() {
    test('Content Dimensions in pixel coordinates', function() {
      var ws = makeMockWs(1, 0, 0, 0, 0);
      var metricsManager = new Blockly.MetricsManager(ws);
      var defaultZoom = metricsManager.getContentDimensionsExact_(ws);
      assertDimensionsMatch(defaultZoom, 0, 0, 0, 0);
    });
    test('Content Dimensions in workspace coordinates', function() {
      var ws = makeMockWs(1, 0, 0, 0, 0);
      var metricsManager = new Blockly.MetricsManager(ws);
      var defaultZoom = metricsManager.getContentDimensionsExact_(ws);
      assertDimensionsMatch(defaultZoom, 0, 0, 0, 0);
    });
  });
});
