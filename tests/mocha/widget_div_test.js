/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.widgetDiv');

const {sharedTestSetup, sharedTestTeardown} = goog.require('Blockly.test.helpers');


suite('WidgetDiv', function() {
  setup(function() {
    sharedTestSetup.call(this);
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('positionWithAnchor', function() {
    function makeBBox(left, top, width, height) {
      return {
        left: left,
        right: left + width,
        top: top,
        bottom: top + height,
        width: width,
        height: height
      };
    }

    setup(function() {
      Blockly.WidgetDiv.createDom();
      this.viewportBBox = makeBBox(0, 0, 1000, 1003);
      this.widgetSize = {
        width: 100,
        height: 102
      };
      this.anchorSize = {
        width: 90,
        height: 91
      };

      this.testWidgetPosition = function(
          anchorBBox, rtl, expectedX, expectedY, expectedHeight) {
        Blockly.WidgetDiv.positionWithAnchor(
            this.viewportBBox, anchorBBox, this.widgetSize, rtl);
        let style = Blockly.WidgetDiv.getDiv().style;
        chai.assert.equal(style.left, expectedX + 'px', 'Left');
        chai.assert.equal(style.top, expectedY + 'px', 'Top');
        chai.assert.equal(style.height, expectedHeight + 'px', 'Height');
      };
    });

    suite('LTR', function() {
      test('noConflict', function() {
        // Anchor placed in the middle.
        let anchorBBox =
            makeBBox(500, 500, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed just below at the left side of the
        // anchor.
        let expectedX = anchorBBox.left;
        let expectedY = anchorBBox.top + this.anchorSize.height;
        this.testWidgetPosition(
            anchorBBox, false, expectedX, expectedY, this.widgetSize.height);
      });
  
      test('topConflict', function() {
        // Anchor close to the top.
        let anchorBBox =
            makeBBox(500, 50, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed just below the anchor.
        let expectedX = anchorBBox.left;
        let expectedY = anchorBBox.top + this.anchorSize.height;
        this.testWidgetPosition(
            anchorBBox, false, expectedX, expectedY, this.widgetSize.height);
      });
  
      test('bottomConflict', function() {
        // Anchor placed close to the bottom.
        let anchorBBox =
            makeBBox(500, 900, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed just above the anchor.
        let expectedX = anchorBBox.left;
        let expectedY = anchorBBox.top - this.widgetSize.height;
        this.testWidgetPosition(
            anchorBBox, false, expectedX, expectedY, this.widgetSize.height);
      });
  
      test('leftConflict', function() {
        // Anchor placed close to the left side.
        let anchorBBox =
            makeBBox(50, 500, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed at the anchor.
        let expectedX = anchorBBox.left;
        let expectedY = anchorBBox.top + this.anchorSize.height;
        this.testWidgetPosition(
            anchorBBox, false, expectedX, expectedY, this.widgetSize.height);
      });
  
      test('rightConflict', function() {
        // Anchor placed close to the right side.
        let anchorBBox =
            makeBBox(950, 500, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed as far right as possible--at the edge of
        // the screen.
        let expectedX = this.viewportBBox.width - this.widgetSize.width;
        let expectedY = anchorBBox.top + this.anchorSize.height;
        this.testWidgetPosition(
            anchorBBox, false, expectedX, expectedY, this.widgetSize.height);
      });
    });
    suite('RTL', function() {
      test('noConflict', function() {
        // Anchor placed in the middle
        let anchorBBox =
            makeBBox(500, 500, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed at the right side of the anchor.
        let expectedX = anchorBBox.right - this.widgetSize.width;
        let expectedY = anchorBBox.top + this.anchorSize.height;
        this.testWidgetPosition(
            anchorBBox, true, expectedX, expectedY, this.widgetSize.height);
      });

      test('topConflict', function() {
        // Anchor close to the top.
        let anchorBBox =
            makeBBox(500, 50, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed just below the anchor.
        let expectedX = anchorBBox.right - this.widgetSize.width;
        let expectedY = anchorBBox.top + this.anchorSize.height;
        this.testWidgetPosition(
            anchorBBox, true, expectedX, expectedY, this.widgetSize.height);
      });

      test('bottomConflict', function() {
        // Anchor placed close to the bottom.
        let anchorBBox =
            makeBBox(500, 900, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed just above the anchor.
        let expectedX = anchorBBox.right - this.widgetSize.width;
        let expectedY = anchorBBox.top - this.widgetSize.height;
        this.testWidgetPosition(
            anchorBBox, true, expectedX, expectedY, this.widgetSize.height);
      });

      test('leftConflict', function() {
        // Anchor placed close to the left side.
        let anchorBBox =
            makeBBox(10, 500, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed as far left as possible--at the edge of
        // the screen.
        let expectedX = 0;
        let expectedY = anchorBBox.top + this.anchorSize.height;
        this.testWidgetPosition(
            anchorBBox, true, expectedX, expectedY, this.widgetSize.height);
      });

      test('rightConflict', function() {
        // Anchor placed close to the right side.
        let anchorBBox =
            makeBBox(950, 500, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed as far right as possible--at the edge of
        // the screen.
        let expectedX = this.viewportBBox.width - this.widgetSize.width;
        let expectedY = anchorBBox.top + this.anchorSize.height;
        this.testWidgetPosition(
            anchorBBox, true, expectedX, expectedY, this.widgetSize.height);
      });
    });
  });
});
