/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('DropDownDiv', function() {
  suite('Positioning', function() {
    setup(function() {
      this.boundsStub = sinon.stub(Blockly.DropDownDiv, 'getBoundsInfo_')
          .returns({
            left: 0,
            right: 100,
            top: 0,
            bottom: 100,
            width: 100,
            height: 100
          });
      this.sizeStub = sinon.stub(Blockly.utils.style, 'getSize')
          .returns({
            width: 60,
            height: 60
          });
      this.clientHeightStub = sinon.stub(document.documentElement, 'clientHeight')
          .get(function() { return 1000; });
      this.clientTopStub = sinon.stub(document.documentElement, 'clientTop')
          .get(function() { return 0; });
    });
    teardown(function() {
      this.boundsStub.restore();
      this.sizeStub.restore();
      this.clientHeightStub.restore();
      this.clientTopStub.restore();
    });
    test('Below, in Bounds', function() {
      var metrics = Blockly.DropDownDiv.getPositionMetrics_(50, 0, 50, -10);
      // "Above" in value actually means below in render.
      chai.assert.isAtLeast(metrics.initialY, 0);
      chai.assert.isAbove(metrics.finalY, 0);
      chai.assert.isTrue(metrics.arrowVisible);
      chai.assert.isTrue(metrics.arrowAtTop);
    });
    test('Above, in Bounds', function() {
      var metrics = Blockly.DropDownDiv.getPositionMetrics_(50, 100, 50, 90);
      // "Below" in value actually means above in render.
      chai.assert.isAtMost(metrics.initialY, 100);
      chai.assert.isBelow(metrics.finalY, 100);
      chai.assert.isTrue(metrics.arrowVisible);
      chai.assert.isFalse(metrics.arrowAtTop);
    });
    test('Below, out of Bounds', function() {
      var metrics = Blockly.DropDownDiv.getPositionMetrics_(50, 60, 50, 50);
      // "Above" in value actually means below in render.
      chai.assert.isAtLeast(metrics.initialY, 60);
      chai.assert.isAbove(metrics.finalY, 60);
      chai.assert.isTrue(metrics.arrowVisible);
      chai.assert.isTrue(metrics.arrowAtTop);
    });
    test('Above, in Bounds', function() {
      var metrics = Blockly.DropDownDiv.getPositionMetrics_(50, 100, 50, 90);
      // "Below" in value actually means above in render.
      chai.assert.isAtMost(metrics.initialY, 100);
      chai.assert.isBelow(metrics.finalY, 100);
      chai.assert.isTrue(metrics.arrowVisible);
      chai.assert.isFalse(metrics.arrowAtTop);
    });
    test('No Solution, Render At Top', function() {
      this.clientHeightStub.get(function() { return 100; });
      var metrics = Blockly.DropDownDiv.getPositionMetrics_(50, 60, 50, 50);
      // "Above" in value actually means below in render.
      chai.assert.equal(metrics.initialY, 0);
      chai.assert.equal(metrics.finalY, 0);
      chai.assert.isFalse(metrics.arrowVisible);
      chai.assert.isNotOk(metrics.arrowAtTop);
    });
  });
});
