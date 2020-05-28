/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('WidgetDiv', function() {

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
        var style = Blockly.WidgetDiv.DIV.style;
        chai.assert.equal(style.left, expectedX + 'px', 'Left');
        chai.assert.equal(style.top, expectedY + 'px', 'Top');
        chai.assert.equal(style.height, expectedHeight + 'px', 'Height');
      };
    });

    suite('LTR', function() {
      test('noConflict', function() {
        // Anchor placed in the middle.
        var anchorBBox =
            makeBBox(500, 500, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed just below at the left side of the
        // anchor.
        var expectedX = anchorBBox.left;
        var expectedY = anchorBBox.top + this.anchorSize.height;
        this.testWidgetPosition(
            anchorBBox, false, expectedX, expectedY, this.widgetSize.height);
      });
  
      test('topConflict', function() {
        // Anchor close to the top.
        var anchorBBox =
            makeBBox(500, 50, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed just below the anchor.
        var expectedX = anchorBBox.left;
        var expectedY = anchorBBox.top + this.anchorSize.height;
        this.testWidgetPosition(
            anchorBBox, false, expectedX, expectedY, this.widgetSize.height);
      });
  
      test('bottomConflict', function() {
        // Anchor placed close to the bottom.
        var anchorBBox =
            makeBBox(500, 900, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed just above the anchor.
        var expectedX = anchorBBox.left;
        var expectedY = anchorBBox.top - this.widgetSize.height;
        this.testWidgetPosition(
            anchorBBox, false, expectedX, expectedY, this.widgetSize.height);
      });
  
      test('leftConflict', function() {
        // Anchor placed close to the left side.
        var anchorBBox =
            makeBBox(50, 500, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed at the anchor.
        var expectedX = anchorBBox.left;
        var expectedY = anchorBBox.top + this.anchorSize.height;
        this.testWidgetPosition(
            anchorBBox, false, expectedX, expectedY, this.widgetSize.height);
      });
  
      test('rightConflict', function() {
        // Anchor placed close to the right side.
        var anchorBBox =
            makeBBox(950, 500, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed as far right as possible--at the edge of
        // the screen.
        var expectedX = this.viewportBBox.width - this.widgetSize.width;
        var expectedY = anchorBBox.top + this.anchorSize.height;
        this.testWidgetPosition(
            anchorBBox, false, expectedX, expectedY, this.widgetSize.height);
      });
    });
    suite('RTL', function() {
      test('noConflict', function() {
        // Anchor placed in the middle
        var anchorBBox =
            makeBBox(500, 500, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed at the right side of the anchor.
        var expectedX = anchorBBox.right - this.widgetSize.width;
        var expectedY = anchorBBox.top + this.anchorSize.height;
        this.testWidgetPosition(
            anchorBBox, true, expectedX, expectedY, this.widgetSize.height);
      });

      test('topConflict', function() {
        // Anchor close to the top.
        var anchorBBox =
            makeBBox(500, 50, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed just below the anchor.
        var expectedX = anchorBBox.right - this.widgetSize.width;
        var expectedY = anchorBBox.top + this.anchorSize.height;
        this.testWidgetPosition(
            anchorBBox, true, expectedX, expectedY, this.widgetSize.height);
      });

      test('bottomConflict', function() {
        // Anchor placed close to the bottom.
        var anchorBBox =
            makeBBox(500, 900, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed just above the anchor.
        var expectedX = anchorBBox.right - this.widgetSize.width;
        var expectedY = anchorBBox.top - this.widgetSize.height;
        this.testWidgetPosition(
            anchorBBox, true, expectedX, expectedY, this.widgetSize.height);
      });

      test('leftConflict', function() {
        // Anchor placed close to the left side.
        var anchorBBox =
            makeBBox(10, 500, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed as far left as possible--at the edge of
        // the screen.
        var expectedX = 0;
        var expectedY = anchorBBox.top + this.anchorSize.height;
        this.testWidgetPosition(
            anchorBBox, true, expectedX, expectedY, this.widgetSize.height);
      });

      test('rightConflict', function() {
        // Anchor placed close to the right side.
        var anchorBBox =
            makeBBox(950, 500, this.anchorSize.width, this.anchorSize.height);
        // The widget div should be placed as far right as possible--at the edge of
        // the screen.
        var expectedX = this.viewportBBox.width - this.widgetSize.width;
        var expectedY = anchorBBox.top + this.anchorSize.height;
        this.testWidgetPosition(
            anchorBBox, true, expectedX, expectedY, this.widgetSize.height);
      });
    });
  });
});
