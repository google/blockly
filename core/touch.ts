/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Touch handling for Blockly.
 *
 * @namespace Blockly.Touch
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.Touch');

import type {Gesture} from './gesture.js';


/**
 * A mock event, created from either a mouse or touch event,
 * with no more than one entry in the changedTouches array.
 */
interface PseudoEvent {
  type: string;
  changedTouches: Touch[];
  target: Element;
  stopPropagation: () => void;
  preventDefault: () => void;
}

/** Length in ms for a touch to become a long press. */
const LONGPRESS = 750;

/**
 * Whether touch is enabled in the browser.
 * Copied from Closure's goog.events.BrowserFeature.TOUCH_ENABLED
 */
export const TOUCH_ENABLED = 'ontouchstart' in globalThis ||
    !!(globalThis['document'] && document.documentElement &&
       'ontouchstart' in
           document.documentElement) ||  // IE10 uses non-standard touch events,
    // so it has a different check.
    !!(globalThis['navigator'] &&
       (globalThis['navigator']['maxTouchPoints'] ||
        (globalThis['navigator'] as any)['msMaxTouchPoints']));

/** Which touch events are we currently paying attention to? */
let touchIdentifier_: string|null = null;

/**
 * The TOUCH_MAP lookup dictionary specifies additional touch events to fire,
 * in conjunction with mouse events.
 *
 * @alias Blockly.Touch.TOUCH_MAP
 */
export const TOUCH_MAP: {[key: string]: string[]} = globalThis['PointerEvent'] ?
    {
      'mousedown': ['pointerdown'],
      'mouseenter': ['pointerenter'],
      'mouseleave': ['pointerleave'],
      'mousemove': ['pointermove'],
      'mouseout': ['pointerout'],
      'mouseover': ['pointerover'],
      'mouseup': ['pointerup', 'pointercancel'],
      'touchend': ['pointerup'],
      'touchcancel': ['pointercancel'],
    } :
    {
      'mousedown': ['touchstart'],
      'mousemove': ['touchmove'],
      'mouseup': ['touchend', 'touchcancel'],
    };

/** PID of queued long-press task. */
let longPid_: AnyDuringMigration = 0;

/**
 * Context menus on touch devices are activated using a long-press.
 * Unfortunately the contextmenu touch event is currently (2015) only supported
 * by Chrome.  This function is fired on any touchstart event, queues a task,
 * which after about a second opens the context menu.  The tasks is killed
 * if the touch event terminates early.
 *
 * @param e Touch start event.
 * @param gesture The gesture that triggered this longStart.
 * @alias Blockly.Touch.longStart
 * @internal
 */
export function longStart(e: Event, gesture: Gesture) {
  longStop();
  // Punt on multitouch events.
  // AnyDuringMigration because:  Property 'changedTouches' does not exist on
  // type 'Event'.
  if ((e as AnyDuringMigration).changedTouches &&
      (e as AnyDuringMigration).changedTouches.length !== 1) {
    return;
  }
  longPid_ = setTimeout(function() {
    // TODO(#6097): Make types accurate, possibly by refactoring touch handling.
    // AnyDuringMigration because:  Property 'changedTouches' does not exist on
    // type 'Event'.
    const typelessEvent = e as AnyDuringMigration;
    // Additional check to distinguish between touch events and pointer events
    if (typelessEvent.changedTouches) {
      // TouchEvent
      typelessEvent.button = 2;  // Simulate a right button click.
      // e was a touch event.  It needs to pretend to be a mouse event.
      typelessEvent.clientX = typelessEvent.changedTouches[0].clientX;
      typelessEvent.clientY = typelessEvent.changedTouches[0].clientY;
    }

    // Let the gesture route the right-click correctly.
    if (gesture) {
      gesture.handleRightClick(e);
    }
  }, LONGPRESS);
}

/**
 * Nope, that's not a long-press.  Either touchend or touchcancel was fired,
 * or a drag hath begun.  Kill the queued long-press task.
 *
 * @alias Blockly.Touch.longStop
 * @internal
 */
export function longStop() {
  if (longPid_) {
    clearTimeout(longPid_);
    longPid_ = 0;
  }
}

/**
 * Clear the touch identifier that tracks which touch stream to pay attention
 * to.  This ends the current drag/gesture and allows other pointers to be
 * captured.
 *
 * @alias Blockly.Touch.clearTouchIdentifier
 */
export function clearTouchIdentifier() {
  touchIdentifier_ = null;
}

/**
 * Decide whether Blockly should handle or ignore this event.
 * Mouse and touch events require special checks because we only want to deal
 * with one touch stream at a time.  All other events should always be handled.
 *
 * @param e The event to check.
 * @returns True if this event should be passed through to the registered
 *     handler; false if it should be blocked.
 * @alias Blockly.Touch.shouldHandleEvent
 */
export function shouldHandleEvent(e: Event|PseudoEvent): boolean {
  return !isMouseOrTouchEvent(e) || checkTouchIdentifier(e);
}

/**
 * Get the touch identifier from the given event.  If it was a mouse event, the
 * identifier is the string 'mouse'.
 *
 * @param e Mouse event or touch event.
 * @returns The touch identifier from the first changed touch, if defined.
 *     Otherwise 'mouse'.
 * @alias Blockly.Touch.getTouchIdentifierFromEvent
 */
export function getTouchIdentifierFromEvent(e: Event|PseudoEvent): string {
  if (e instanceof MouseEvent) {
    return 'mouse';
  }

  if (e instanceof PointerEvent) {
    return String(e.pointerId);
  }

  /**
   * TODO(#6097): Fix types. This is a catch-all for everything but mouse
   * and pointer events.
   */
  const pseudoEvent = /** {!PseudoEvent} */ e;

  // AnyDuringMigration because:  Property 'changedTouches' does not exist on
  // type 'PseudoEvent | Event'. AnyDuringMigration because:  Property
  // 'changedTouches' does not exist on type 'PseudoEvent | Event'.
  // AnyDuringMigration because:  Property 'changedTouches' does not exist on
  // type 'PseudoEvent | Event'. AnyDuringMigration because:  Property
  // 'changedTouches' does not exist on type 'PseudoEvent | Event'.
  // AnyDuringMigration because:  Property 'changedTouches' does not exist on
  // type 'PseudoEvent | Event'.
  return (pseudoEvent as AnyDuringMigration).changedTouches &&
          (pseudoEvent as AnyDuringMigration).changedTouches[0] &&
          (pseudoEvent as AnyDuringMigration).changedTouches[0].identifier !==
              undefined &&
          (pseudoEvent as AnyDuringMigration).changedTouches[0].identifier !==
              null ?
      String((pseudoEvent as AnyDuringMigration).changedTouches[0].identifier) :
      'mouse';
}

/**
 * Check whether the touch identifier on the event matches the current saved
 * identifier.  If there is no identifier, that means it's a mouse event and
 * we'll use the identifier "mouse".  This means we won't deal well with
 * multiple mice being used at the same time.  That seems okay.
 * If the current identifier was unset, save the identifier from the
 * event.  This starts a drag/gesture, during which touch events with other
 * identifiers will be silently ignored.
 *
 * @param e Mouse event or touch event.
 * @returns Whether the identifier on the event matches the current saved
 *     identifier.
 * @alias Blockly.Touch.checkTouchIdentifier
 */
export function checkTouchIdentifier(e: Event|PseudoEvent): boolean {
  const identifier = getTouchIdentifierFromEvent(e);

  // if (touchIdentifier_) is insufficient because Android touch
  // identifiers may be zero.
  if (touchIdentifier_ !== undefined && touchIdentifier_ !== null) {
    // We're already tracking some touch/mouse event.  Is this from the same
    // source?
    return touchIdentifier_ === identifier;
  }
  if (e.type === 'mousedown' || e.type === 'touchstart' ||
      e.type === 'pointerdown') {
    // No identifier set yet, and this is the start of a drag.  Set it and
    // return.
    touchIdentifier_ = identifier;
    return true;
  }
  // There was no identifier yet, but this wasn't a start event so we're going
  // to ignore it.  This probably means that another drag finished while this
  // pointer was down.
  return false;
}

/**
 * Set an event's clientX and clientY from its first changed touch.  Use this to
 * make a touch event work in a mouse event handler.
 *
 * @param e A touch event.
 * @alias Blockly.Touch.setClientFromTouch
 */
export function setClientFromTouch(e: Event|PseudoEvent) {
  // AnyDuringMigration because:  Property 'changedTouches' does not exist on
  // type 'PseudoEvent | Event'.
  if (e.type.startsWith('touch') && (e as AnyDuringMigration).changedTouches) {
    // Map the touch event's properties to the event.
    // AnyDuringMigration because:  Property 'changedTouches' does not exist on
    // type 'PseudoEvent | Event'.
    const touchPoint = (e as AnyDuringMigration).changedTouches[0];
    // AnyDuringMigration because:  Property 'clientX' does not exist on type
    // 'PseudoEvent | Event'.
    (e as AnyDuringMigration).clientX = touchPoint.clientX;
    // AnyDuringMigration because:  Property 'clientY' does not exist on type
    // 'PseudoEvent | Event'.
    (e as AnyDuringMigration).clientY = touchPoint.clientY;
  }
}

/**
 * Check whether a given event is a mouse, touch, or pointer event.
 *
 * @param e An event.
 * @returns True if it is a mouse, touch, or pointer event; false otherwise.
 * @alias Blockly.Touch.isMouseOrTouchEvent
 */
export function isMouseOrTouchEvent(e: Event|PseudoEvent): boolean {
  return e.type.startsWith('touch') || e.type.startsWith('mouse') ||
      e.type.startsWith('pointer');
}

/**
 * Check whether a given event is a touch event or a pointer event.
 *
 * @param e An event.
 * @returns True if it is a touch or pointer event; false otherwise.
 * @alias Blockly.Touch.isTouchEvent
 */
export function isTouchEvent(e: Event|PseudoEvent): boolean {
  return e.type.startsWith('touch') || e.type.startsWith('pointer');
}

/**
 * Split an event into an array of events, one per changed touch or mouse
 * point.
 *
 * @param e A mouse event or a touch event with one or more changed touches.
 * @returns An array of events or pseudo events.
 *     Each pseudo-touch event will have exactly one changed touch and there
 * will be no real touch events.
 * @alias Blockly.Touch.splitEventByTouches
 */
export function splitEventByTouches(e: Event): Array<Event|PseudoEvent> {
  const events = [];
  // AnyDuringMigration because:  Property 'changedTouches' does not exist on
  // type 'PseudoEvent | Event'.
  if ((e as AnyDuringMigration).changedTouches) {
    // AnyDuringMigration because:  Property 'changedTouches' does not exist on
    // type 'PseudoEvent | Event'.
    for (let i = 0; i < (e as AnyDuringMigration).changedTouches.length; i++) {
      const newEvent = {
        type: e.type,
        // AnyDuringMigration because:  Property 'changedTouches' does not exist
        // on type 'PseudoEvent | Event'.
        changedTouches: [(e as AnyDuringMigration).changedTouches[i]],
        target: e.target,
        stopPropagation() {
          e.stopPropagation();
        },
        preventDefault() {
          e.preventDefault();
        },
      };
      events[i] = newEvent;
    }
  } else {
    events.push(e);
  }
  // AnyDuringMigration because:  Type '(Event | { type: string; changedTouches:
  // Touch[]; target: EventTarget | null; stopPropagation(): void;
  // preventDefault(): void; })[]' is not assignable to type '(PseudoEvent |
  // Event)[]'.
  return events as AnyDuringMigration;
}
