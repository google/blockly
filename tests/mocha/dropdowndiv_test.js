/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {assert} from '../../node_modules/chai/chai.js';
import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';

suite('DropDownDiv', function () {
  suite('Positioning', function () {
    setup(function () {
      sharedTestSetup.call(this);
      this.boundsStub = sinon
        .stub(Blockly.DropDownDiv.TEST_ONLY, 'getBoundsInfo')
        .returns({
          left: 0,
          right: 100,
          top: 0,
          bottom: 100,
          width: 100,
          height: 100,
        });
      this.sizeStub = sinon
        .stub(Blockly.utils.style.TEST_ONLY, 'getSizeInternal')
        .returns({
          width: 60,
          height: 60,
        });
      this.clientHeightStub = sinon
        .stub(document.documentElement, 'clientHeight')
        .get(function () {
          return 1000;
        });
      this.clientTopStub = sinon
        .stub(document.documentElement, 'clientTop')
        .get(function () {
          return 0;
        });
    });
    teardown(function () {
      sharedTestTeardown.call(this);
    });
    test('Below, in Bounds', function () {
      const metrics = Blockly.DropDownDiv.TEST_ONLY.getPositionMetrics(
        50,
        0,
        50,
        -10,
      );
      // "Above" in value actually means below in render.
      assert.isAtLeast(metrics.initialY, 0);
      assert.isAbove(metrics.finalY, 0);
      assert.isTrue(metrics.arrowVisible);
      assert.isTrue(metrics.arrowAtTop);
    });
    test('Above, in Bounds', function () {
      const metrics = Blockly.DropDownDiv.TEST_ONLY.getPositionMetrics(
        50,
        100,
        50,
        90,
      );
      // "Below" in value actually means above in render.
      assert.isAtMost(metrics.initialY, 100);
      assert.isBelow(metrics.finalY, 100);
      assert.isTrue(metrics.arrowVisible);
      assert.isFalse(metrics.arrowAtTop);
    });
    test('Below, out of Bounds', function () {
      const metrics = Blockly.DropDownDiv.TEST_ONLY.getPositionMetrics(
        50,
        60,
        50,
        50,
      );
      // "Above" in value actually means below in render.
      assert.isAtLeast(metrics.initialY, 60);
      assert.isAbove(metrics.finalY, 60);
      assert.isTrue(metrics.arrowVisible);
      assert.isTrue(metrics.arrowAtTop);
    });
    test('Above, in Bounds', function () {
      const metrics = Blockly.DropDownDiv.TEST_ONLY.getPositionMetrics(
        50,
        100,
        50,
        90,
      );
      // "Below" in value actually means above in render.
      assert.isAtMost(metrics.initialY, 100);
      assert.isBelow(metrics.finalY, 100);
      assert.isTrue(metrics.arrowVisible);
      assert.isFalse(metrics.arrowAtTop);
    });
    test('No Solution, Render At Top', function () {
      this.clientHeightStub.get(function () {
        return 100;
      });
      const metrics = Blockly.DropDownDiv.TEST_ONLY.getPositionMetrics(
        50,
        60,
        50,
        50,
      );
      // "Above" in value actually means below in render.
      assert.equal(metrics.initialY, 0);
      assert.equal(metrics.finalY, 0);
      assert.isFalse(metrics.arrowVisible);
      assert.isNotOk(metrics.arrowAtTop);
    });
  });
});
