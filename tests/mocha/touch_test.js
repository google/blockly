/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

 goog.declareModuleId('Blockly.test.touch');

 import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';
 
 suite('Touch', function() {
    setup(function() {
        sharedTestSetup.call(this);
    });

    teardown(function() {
        Blockly.Touch.clearTouchIdentifier();
        sharedTestTeardown.call(this);
    });

    suite('shouldHandleTouch', function() {
        test('handles mousedown event', function() {
            const mouseEvent = new MouseEvent('mousedown');
            chai.assert.isTrue(Blockly.Touch.shouldHandleEvent(mouseEvent));
        });

        test('handles multiple mousedown events', function() {
            const mouseEvent1 = new MouseEvent('mousedown');
            const mouseEvent2 = new MouseEvent('mousedown');
            Blockly.Touch.shouldHandleEvent(mouseEvent1);
            chai.assert.isTrue(Blockly.Touch.shouldHandleEvent(mouseEvent2));
        });

        test('does not handle mouseup if not tracking touch', function() {
            const mouseEvent = new MouseEvent('mouseup');
            chai.assert.isFalse(Blockly.Touch.shouldHandleEvent(mouseEvent));
        });

        test('handles mouseup if already tracking a touch', function() {
            const mousedown = new MouseEvent('mousedown');
            const mouseup = new MouseEvent('mouseup');
            // Register the mousedown event first
            Blockly.Touch.shouldHandleEvent(mousedown);
            chai.assert.isTrue(Blockly.Touch.shouldHandleEvent(mouseup));
        });

        test('handles pointerdown if this is a new touch', function() {
            const pointerdown = new PointerEvent('pointerdown', {pointerId: 1, pointerType: 'touch'});
            chai.assert.isTrue(Blockly.Touch.shouldHandleEvent(pointerdown));
        });

        test('does not handle pointerdown if part of a different touch', function() {
            const pointerdown1 = new PointerEvent('pointerdown', {pointerId: 1, pointerType: 'touch'});
            const pointerdown2 = new PointerEvent('pointerdown', {pointerId: 2, pointerType: 'touch'});
            Blockly.Touch.shouldHandleEvent(pointerdown1);
            chai.assert.isFalse(Blockly.Touch.shouldHandleEvent(pointerdown2));
        });

        test('does not handle pointerdown after a mousedown', function() {
            const mouseEvent = new MouseEvent('mousedown');
            const pointerdown = new PointerEvent('pointerdown', {pointerId: 1, pointerType: 'touch'});
            Blockly.Touch.shouldHandleEvent(mouseEvent);
            chai.assert.isFalse(Blockly.Touch.shouldHandleEvent(pointerdown));
        });

        test('does not handle pointerup if not tracking touch', function() {
            const pointerup = new PointerEvent('pointerup', {pointerId: 1, pointerType: 'touch'});
            chai.assert.isFalse(Blockly.Touch.shouldHandleEvent(pointerup));
        });

        test('handles pointerup if part of existing touch', function() {
            const pointerdown = new PointerEvent('pointerdown', {pointerId: 1, pointerType: 'touch'});
            const pointerup = new PointerEvent('pointerdown', {pointerId: 1, pointerType: 'touch'});
            Blockly.Touch.shouldHandleEvent(pointerdown);
            chai.assert.isTrue(Blockly.Touch.shouldHandleEvent(pointerup));
        });
    });

    suite('getTouchIdentifierFromEvent', function() {
        test('is mouse for MouseEvents', function() {
            const mousedown = new MouseEvent('mousedown');
            chai.assert.equal(Blockly.Touch.getTouchIdentifierFromEvent(mousedown), 'mouse');
        });

        test('is pointerId for mouse PointerEvents', function() {
            const pointerdown = new PointerEvent('pointerdown', {pointerId: 7, pointerType: 'mouse'});
            chai.assert.equal(Blockly.Touch.getTouchIdentifierFromEvent(pointerdown), 7);
        });

        test('is pointerId for touch PointerEvents', function() {
            const pointerdown = new PointerEvent('pointerdown', {pointerId: 42, pointerType: 'touch'});
            chai.assert.equal(Blockly.Touch.getTouchIdentifierFromEvent(pointerdown), 42);
        });
    });
 });
