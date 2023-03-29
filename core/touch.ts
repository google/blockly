/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.Touch');

import type {Gesture} from './gesture.js';
import * as deprecation from './utils/deprecation.js';


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
 */
export const TOUCH_MAP: {[key: string]: string[]} = {
  'mousedown': ['pointerdown'],
  'mouseenter': ['pointerenter'],
  'mouseleave': ['pointerleave'],
  'mousemove': ['pointermove'],
  'mouseout': ['pointerout'],
  'mouseover': ['pointerover'],
  'mouseup': ['pointerup', 'pointercancel'],
  'touchend': ['pointerup'],
  'touchcancel': ['pointercancel'],
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
 * @internal
 */
export function longStart(e: PointerEvent, gesture: Gesture) {
  longStop();
  longPid_ = setTimeout(function() {
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
 */
export function shouldHandleEvent(e: Event): boolean {
  // Do not replace the startsWith with a check for `instanceof PointerEvent`.
  // `click` and `contextmenu` are PointerEvents in some browsers,
  // despite not starting with `pointer`, but we want to always handle them
  // without worrying about touch identifiers.
  return !(e.type.startsWith('pointer')) ||
      (e instanceof PointerEvent && checkTouchIdentifier(e));
}

/**
 * Get the pointer identifier from the given event.
 *
 * @param e Pointer event.
 * @returns The pointerId of the event.
 */
export function getTouchIdentifierFromEvent(e: PointerEvent): string {
  return `${e.pointerId}`;
}

/**
 * Check whether the pointer identifier on the event matches the current saved
 * identifier. If the current identifier was unset, save the identifier from
 * the event. This starts a drag/gesture, during which pointer events with
 * other identifiers will be silently ignored.
 *
 * @param e Pointer event.
 * @returns Whether the identifier on the event matches the current saved
 *     identifier.
 */
export function checkTouchIdentifier(e: PointerEvent): boolean {
  const identifier = getTouchIdentifierFromEvent(e);

  if (touchIdentifier_) {
    // We're already tracking some touch/mouse event.  Is this from the same
    // source?
    return touchIdentifier_ === identifier;
  }
  if (e.type === 'pointerdown') {
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
 */
export function setClientFromTouch(e: Event|PseudoEvent) {
  deprecation.warn('setClientFromTouch()', 'version 9', 'version 10');
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
 */
export function isMouseOrTouchEvent(e: Event|PseudoEvent): boolean {
  deprecation.warn('isMouseOrTouchEvent()', 'version 9', 'version 10');
  return e.type.startsWith('touch') || e.type.startsWith('mouse') ||
      e.type.startsWith('pointer');
}

/**
 * Check whether a given event is a touch event or a pointer event.
 *
 * @param e An event.
 * @returns True if it is a touch or pointer event; false otherwise.
 */
export function isTouchEvent(e: Event|PseudoEvent): boolean {
  deprecation.warn('isTouchEvent()', 'version 9', 'version 10');
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
 */
export function splitEventByTouches(e: Event): Array<Event|PseudoEvent> {
  deprecation.warn('splitEventByTouches()', 'version 9', 'version 10');
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
