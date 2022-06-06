/**
 * @fileoverview Constant declarations for common key codes.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 */


/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Constant declarations for common key codes.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @namespace Blockly.utils.KeyCodes
 */


/**
 * Key codes for common characters.
 *
 * Copied from Closure's goog.events.KeyCodes
 *
 * This list is not localized and therefore some of the key codes are not
 * correct for non US keyboard layouts. See comments below.
 *
 * @alias Blockly.utils.KeyCodes
 */
export enum KeyCodes {
  WIN_KEY_FF_LINUX,
  MAC_ENTER = 3,
  BACKSPACE = 8,
  TAB,
  NUM_CENTER = 12,
  // NUMLOCK on FF/Safari Mac
  ENTER,
  SHIFT = 16,
  CTRL,
  ALT,
  PAUSE,
  CAPS_LOCK,
  ESC = 27,
  SPACE = 32,
  PAGE_UP,
  // also NUM_NORTH_EAST
  PAGE_DOWN,
  // also NUM_SOUTH_EAST
  END,
  // also NUM_SOUTH_WEST
  HOME,
  // also NUM_NORTH_WEST
  LEFT,
  // also NUM_WEST
  UP,
  // also NUM_NORTH
  RIGHT,
  // also NUM_EAST
  DOWN,
  // also NUM_SOUTH
  PLUS_SIGN = 43,
  // NOT numpad plus
  PRINT_SCREEN,
  INSERT,
  // also NUM_INSERT
  DELETE,
  // also NUM_DELETE
  ZERO = 48,
  ONE,
  TWO,
  THREE,
  FOUR,
  FIVE,
  SIX,
  SEVEN,
  EIGHT,
  NINE,
  FF_SEMICOLON = 59,
  // Firefox (Gecko) fires this for semicolon instead of 186
  FF_EQUALS = 61,
  // Firefox (Gecko) fires this for equals instead of 187
  FF_DASH = 173,
  // Firefox (Gecko) fires this for dash instead of 189
  // Firefox (Gecko) fires this for # on UK keyboards, rather than
  // Shift+SINGLE_QUOTE.
  FF_HASH = 163,
  QUESTION_MARK = 63,
  // needs localization
  AT_SIGN,
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
  V,
  W,
  X,
  Y,
  Z,
  META,
  // WIN_KEY_LEFT
  WIN_KEY_RIGHT,
  CONTEXT_MENU,
  NUM_ZERO = 96,
  NUM_ONE,
  NUM_TWO,
  NUM_THREE,
  NUM_FOUR,
  NUM_FIVE,
  NUM_SIX,
  NUM_SEVEN,
  NUM_EIGHT,
  NUM_NINE,
  NUM_MULTIPLY,
  NUM_PLUS,
  NUM_MINUS = 109,
  NUM_PERIOD,
  NUM_DIVISION,
  F1,
  F2,
  F3,
  F4,
  F5,
  F6,
  F7,
  F8,
  F9,
  F10,
  F11,
  F12,
  NUMLOCK = 144,
  SCROLL_LOCK,

  // OS-specific media keys like volume controls and browser controls.
  FIRST_MEDIA_KEY = 166,
  LAST_MEDIA_KEY = 183,

  SEMICOLON = 186,
  // needs localization
  DASH = 189,
  // needs localization
  EQUALS = 187,
  // needs localization
  COMMA,
  // needs localization
  PERIOD = 190,
  // needs localization
  SLASH,
  // needs localization
  APOSTROPHE,
  // needs localization
  TILDE = 192,
  // needs localization
  SINGLE_QUOTE = 222,
  // needs localization
  OPEN_SQUARE_BRACKET = 219,
  // needs localization
  BACKSLASH,
  // needs localization
  CLOSE_SQUARE_BRACKET,
  // needs localization
  WIN_KEY = 224,
  MAC_FF_META = 224,
  // Firefox (Gecko) fires this for the meta key instead of 91
  MAC_WK_CMD_LEFT = 91,
  // WebKit Left Command key fired, same as META
  MAC_WK_CMD_RIGHT = 93,
  // WebKit Right Command key fired, different from META
  WIN_IME = 229,
  // "Reserved for future use". Some programs (e.g. the SlingPlayer 2.4 ActiveX
  // control) fire this as a hacky way to disable screensavers.
  VK_NONAME = 252,

  // We've seen users whose machines fire this keycode at regular one
  // second intervals. The common thread among these users is that
  // they're all using Dell Inspiron laptops, so we suspect that this
  // indicates a hardware/bios problem.
  // http://en.community.dell.com/support-forums/laptop/f/3518/p/19285957/19523128.aspx
  PHANTOM = 255
}
