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
      scale: scale,
      scrollX: 10,
      scrollY: 10,
      isContentBounded: function() {}
    };
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
    setup(function() {
      this.ws = makeMockWs(1, 0, 0, 0, 0);
      this.metricsManager = new Blockly.MetricsManager(this.ws);
      this.contentDimensionsStub =
          sinon.stub(this.metricsManager, 'getContentDimensionsExact_');
    });
    test('Empty workspace', function() {
      // The location of the viewport.
      var mockViewMetrics = {top: 0, left: 0, width: 200, height: 200};
      // The bounding box around the blocks on the screen.
      var mockContentDimensions = {top: 0, left: 0, width: 0, height: 0};
      this.contentDimensionsStub.returns(mockContentDimensions);

      var contentMetrics =
          this.metricsManager.getContentDimensionsBounded_(mockViewMetrics);

      // Should add half the view width to all sides.
      assertDimensionsMatch(contentMetrics, -200, -200, 400, 400);
    });
    test('Non empty workspace', function() {
      // The location of the viewport.
      var mockViewMetrics = {top: 0, left: 0, width: 200, height: 200};
      // The bounding box around the blocks on the screen.
      var mockContentDimensions = {top: 100, left: 100, width: 50, height: 50};
      this.contentDimensionsStub.returns(mockContentDimensions);

      var contentMetrics =
          this.metricsManager.getContentDimensionsBounded_(mockViewMetrics);

      // Should add half of the view width to all sides.
      assertDimensionsMatch(contentMetrics, -50, -50, 350, 350);
    });
  });
  suite('getAbsoluteMetrics', function() {
    setup(function() {
      this.ws = makeMockWs(1, 0, 0, 0, 0);
      this.metricsManager = new Blockly.MetricsManager(this.ws);
      this.toolboxMetricsStub =
          sinon.stub(this.metricsManager, 'getToolboxMetrics');
      this.flyoutMetricsStub =
          sinon.stub(this.metricsManager, 'getFlyoutMetrics');
      this.getToolboxStub =
          sinon.stub(this.metricsManager.workspace_, 'getToolbox');
      this.getFlyoutStub =
          sinon.stub(this.metricsManager.workspace_, 'getFlyout');
    });
    test('Toolbox at left', function() {
      this.toolboxMetricsStub.returns({width: 107, height: 0, position: 2});
      this.flyoutMetricsStub.returns({});
      this.getToolboxStub.returns(true);
      this.getFlyoutStub.returns(false);

      var absoluteMetrics = this.metricsManager.getAbsoluteMetrics();

      assertDimensionsMatch(absoluteMetrics, 107, 0);
    });
    test('Toolbox at top', function() {
      this.toolboxMetricsStub.returns({width: 0, height: 107, position: 0});
      this.flyoutMetricsStub.returns({});
      this.getToolboxStub.returns(true);
      this.getFlyoutStub.returns(false);

      var absoluteMetrics = this.metricsManager.getAbsoluteMetrics();

      assertDimensionsMatch(absoluteMetrics, 0, 107);
    });
    test('Flyout at left', function() {
      this.toolboxMetricsStub.returns({width: 107, height: 0, position: 2});
      this.flyoutMetricsStub.returns({width: 107, height: 0, position: 2});
      this.getToolboxStub.returns(false);
      this.getFlyoutStub.returns(true);

      var absoluteMetrics = this.metricsManager.getAbsoluteMetrics();

      assertDimensionsMatch(absoluteMetrics, 107, 0);
    });
    test('Flyout at top', function() {
      this.toolboxMetricsStub.returns({width: 0, height: 107, position: 0});
      this.flyoutMetricsStub.returns({width: 0, height: 107, position: 0});
      this.getToolboxStub.returns(false);
      this.getFlyoutStub.returns(true);

      var absoluteMetrics = this.metricsManager.getAbsoluteMetrics();

      assertDimensionsMatch(absoluteMetrics, 0, 107);
    });
  });
  suite('getViewMetrics', function() {
    setup(function() {
      this.ws = makeMockWs(1, 0, 0, 0, 0);
      this.metricsManager = new Blockly.MetricsManager(this.ws);
      this.toolboxMetricsStub =
          sinon.stub(this.metricsManager, 'getToolboxMetrics');
      this.flyoutMetricsStub =
          sinon.stub(this.metricsManager, 'getFlyoutMetrics');
      this.getToolboxStub =
          sinon.stub(this.metricsManager.workspace_, 'getToolbox');
      this.getFlyoutStub =
          sinon.stub(this.metricsManager.workspace_, 'getFlyout');
      this.svgMetricsStub = sinon.stub(this.metricsManager, 'getSvgMetrics');
    });
    test('Toolbox at left', function() {
      this.toolboxMetricsStub.returns({width: 107, height: 0, position: 2});
      this.flyoutMetricsStub.returns({});
      this.svgMetricsStub.returns({width: 500, height: 500});
      this.getToolboxStub.returns(true);
      this.getFlyoutStub.returns(false);

      var viewMetrics = this.metricsManager.getViewMetrics();

      assertDimensionsMatch(viewMetrics, -10, -10, 393, 500);
    });
    test('Toolbox at top', function() {
      this.toolboxMetricsStub.returns({width: 0, height: 107, position: 0});
      this.flyoutMetricsStub.returns({});
      this.svgMetricsStub.returns({width: 500, height: 500});
      this.getToolboxStub.returns(true);
      this.getFlyoutStub.returns(false);

      var viewMetrics = this.metricsManager.getViewMetrics();

      assertDimensionsMatch(viewMetrics, -10, -10, 500, 393);
    });
    test('Flyout at left', function() {
      this.toolboxMetricsStub.returns({});
      this.flyoutMetricsStub.returns({width: 107, height: 0, position: 2});
      this.svgMetricsStub.returns({width: 500, height: 500});
      this.getToolboxStub.returns(false);
      this.getFlyoutStub.returns(true);

      var viewMetrics = this.metricsManager.getViewMetrics();

      assertDimensionsMatch(viewMetrics, -10, -10, 393, 500);
    });
    test('Flyout at top', function() {
      this.toolboxMetricsStub.returns({});
      this.flyoutMetricsStub.returns({width: 0, height: 107, position: 0});
      this.svgMetricsStub.returns({width: 500, height: 500});
      this.getToolboxStub.returns(false);
      this.getFlyoutStub.returns(true);

      var viewMetrics = this.metricsManager.getViewMetrics();

      assertDimensionsMatch(viewMetrics, -10, -10, 500, 393);
    });
    test('Get in workspace coordinates ', function() {
      var scale = 2;
      var getWorkspaceCoordinates = true;
      this.ws.scale = scale;
      this.toolboxMetricsStub.returns({});
      this.flyoutMetricsStub.returns({width: 0, height: 107, position: 0});
      this.svgMetricsStub.returns({width: 500, height: 500});
      this.getToolboxStub.returns(false);
      this.getFlyoutStub.returns(true);

      var viewMetrics =
          this.metricsManager.getViewMetrics(getWorkspaceCoordinates);

      assertDimensionsMatch(
          viewMetrics, -10 / scale, -10 / scale, 500 / scale, 393 / scale);
    });
  });
  suite('getContentMetrics', function() {
    setup(function() {
      this.ws = makeMockWs(1, 0, 0, 0, 0);
      this.metricsManager = new Blockly.MetricsManager(this.ws);
      this.viewMetricsStub = sinon.stub(this.metricsManager, 'getViewMetrics');
      this.isContentBoundedStub =
          sinon.stub(this.metricsManager.workspace_, 'isContentBounded');
      this.getBoundedMetricsStub =
          sinon.stub(this.metricsManager, 'getContentDimensionsBounded_');
      this.getExactMetricsStub =
          sinon.stub(this.metricsManager, 'getContentDimensionsExact_');
    });
    test('Content Dimensions in pixel coordinates bounded ws', function() {
      this.isContentBoundedStub.returns(true);
      this.getBoundedMetricsStub.returns(
          {height: 0, width: 0, left: 0, top: 0});

      var contentMetrics = this.metricsManager.getContentMetrics(false);

      assertDimensionsMatch(contentMetrics, 0, 0, 0, 0);
      sinon.assert.calledOnce(this.getBoundedMetricsStub);
      sinon.assert.calledOnce(this.viewMetricsStub);
    });
    test('Content Dimensions in pixel coordinates exact ws', function() {
      this.isContentBoundedStub.returns(false);
      this.getExactMetricsStub.returns({height: 0, width: 0, left: 0, top: 0});

      var contentMetrics = this.metricsManager.getContentMetrics(false);

      assertDimensionsMatch(contentMetrics, 0, 0, 0, 0);
      sinon.assert.calledOnce(this.getExactMetricsStub);
      sinon.assert.notCalled(this.viewMetricsStub);
    });
    test('Content Dimensions in ws coordinates bounded ws', function() {
      var getWorkspaceCoordinates = true;
      this.ws.scale = 2;
      this.isContentBoundedStub.returns(true);
      this.getBoundedMetricsStub.returns(
          {height: 100, width: 100, left: 100, top: 100});

      var contentMetrics =
          this.metricsManager.getContentMetrics(getWorkspaceCoordinates);

      assertDimensionsMatch(contentMetrics, 50, 50, 50, 50);
      sinon.assert.calledOnce(this.getBoundedMetricsStub);
      sinon.assert.calledOnce(this.viewMetricsStub);
    });
  });
});
