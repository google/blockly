// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.ui.PopupTest');
goog.setTestOnly('goog.ui.PopupTest');

goog.require('goog.positioning.AnchoredPosition');
goog.require('goog.positioning.Corner');
goog.require('goog.style');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Popup');
goog.require('goog.userAgent');


/**
 * This is used to round pixel values on FF3 Mac.
 */
function assertRoundedEquals(a, b, c) {
  function round(x) {
    return goog.userAgent.GECKO && (goog.userAgent.MAC || goog.userAgent.X11) &&
        goog.userAgent.isVersionOrHigher('1.9') ? Math.round(x) : x;
  }
  if (arguments.length == 3) {
    assertEquals(a, round(b), round(c));
  } else {
    assertEquals(round(a), round(b));
  }
}

function testCreateAndReposition() {
  var anchorEl = document.getElementById('anchor');
  var popupEl = document.getElementById('popup');
  var corner = goog.positioning.Corner;

  var pos = new goog.positioning.AnchoredPosition(anchorEl,
                                                  corner.BOTTOM_START);
  var popup = new goog.ui.Popup(popupEl, pos);
  popup.setVisible(true);

  var anchorRect = goog.style.getBounds(anchorEl);
  var popupRect = goog.style.getBounds(popupEl);
  assertRoundedEquals('Left edge of popup should line up with left edge ' +
                      'of anchor.',
                      anchorRect.left,
                      popupRect.left);
  assertRoundedEquals('Popup should be positioned just below the anchor.',
                      anchorRect.top + anchorRect.height,
                      popupRect.top);

  // Reposition.
  anchorEl.style.marginTop = '7px';
  popup.reposition();

  anchorRect = goog.style.getBounds(anchorEl);
  popupRect = goog.style.getBounds(popupEl);
  assertRoundedEquals('Popup should be positioned just below the anchor.',
                      anchorRect.top + anchorRect.height,
                      popupRect.top);
}


function testSetPinnedCorner() {
  var anchorEl = document.getElementById('anchor');
  var popupEl = document.getElementById('popup');
  var corner = goog.positioning.Corner;

  var pos = new goog.positioning.AnchoredPosition(anchorEl,
                                                  corner.BOTTOM_START);
  var popup = new goog.ui.Popup(popupEl, pos);
  popup.setVisible(true);

  var anchorRect = goog.style.getBounds(anchorEl);
  var popupRect = goog.style.getBounds(popupEl);
  assertRoundedEquals('Left edge of popup should line up with left edge ' +
                      'of anchor.',
                      anchorRect.left,
                      popupRect.left);
  assertRoundedEquals('Popup should be positioned just below the anchor.',
                      anchorRect.top + anchorRect.height,
                      popupRect.top);

  // Change pinned corner.
  popup.setPinnedCorner(corner.BOTTOM_END);

  anchorRect = goog.style.getBounds(anchorEl);
  popupRect = goog.style.getBounds(popupEl);
  assertRoundedEquals('Right edge of popup should line up with left edge ' +
                      'of anchor.',
                      anchorRect.left,
                      popupRect.left + popupRect.width);
  assertRoundedEquals('Bottom edge of popup should line up with bottom ' +
                      'of anchor.',
                      anchorRect.top + anchorRect.height,
                      popupRect.top + popupRect.height);

  // Position outside the viewport.
  anchorEl.style.marginLeft = '0';
  popup.reposition();

  anchorRect = goog.style.getBounds(anchorEl);
  popupRect = goog.style.getBounds(popupEl);

  assertRoundedEquals('Right edge of popup should line up with left edge ' +
                      'of anchor.',
                      anchorRect.left,
                      popupRect.left + popupRect.width);

  anchorEl.style.marginLeft = '';
}
