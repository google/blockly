// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.ac.AutoCompleteTest');
goog.setTestOnly('goog.ui.ac.AutoCompleteTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.dom');
goog.require('goog.dom.InputType');
goog.require('goog.dom.TagName');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.string');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.mockmatchers');
goog.require('goog.ui.ac.AutoComplete');
goog.require('goog.ui.ac.InputHandler');
goog.require('goog.ui.ac.RenderOptions');
goog.require('goog.ui.ac.Renderer');



/**
 * Mock DataStore
 * @constructor
 */
function MockDS(opt_autoHilite) {
  this.autoHilite_ = opt_autoHilite;
  var disabledRow = {
    match: function(str) {return this.text.match(str);},
    rowDisabled: true,
    text: 'hello@u.edu'
  };
  this.rows_ = [
    '"Slartibartfast Theadore" <fjordmaster@magrathea.com>',
    '"Zaphod Beeblebrox" <theprez@universe.gov>',
    '"Ford Prefect" <ford@theguide.com>',
    '"Arthur Dent" <has.no.tea@gmail.com>',
    '"Marvin The Paranoid Android" <marv@googlemail.com>',
    'the.mice@magrathea.com',
    'the.mice@myotherdomain.com',
    'hello@a.com',
    disabledRow,
    'row@u.edu',
    'person@a.edu'
  ];
  this.isRowDisabled = function(row) {
    return !!row.rowDisabled;
  };
}

MockDS.prototype.requestMatchingRows = function(token, maxMatches,
                                                matchHandler) {
  var escapedToken = goog.string.regExpEscape(token);
  var matcher = new RegExp('(^|\\W+)' + escapedToken);
  var matches = [];
  for (var i = 0; i < this.rows_.length && matches.length < maxMatches; ++i) {
    var row = this.rows_[i];
    if (row.match(matcher)) {
      matches.push(row);
    }
  }
  if (this.autoHilite_ === undefined) {
    matchHandler(token, matches);
  } else {
    var options = new goog.ui.ac.RenderOptions();
    options.setAutoHilite(this.autoHilite_);
    matchHandler(token, matches, options);
  }
};


/**
 * Mock Selection Handler
 */

function MockSelect() {
}
goog.inherits(MockSelect, goog.events.EventTarget);

MockSelect.prototype.selectRow = function(row) {
  this.selectedRow = row;
};



/**
 * Renderer subclass that exposes additional private members for testing.
 * @constructor
 */
function TestRend() {
  goog.ui.ac.Renderer.call(this, goog.dom.getElement('test-area'));
}
goog.inherits(TestRend, goog.ui.ac.Renderer);

TestRend.prototype.getRenderedRows = function() {
  return this.rows_;
};

TestRend.prototype.getHilitedRowIndex = function() {
  return this.hilitedRow_;
};

TestRend.prototype.getHilitedRowDiv = function() {
  return this.rowDivs_[this.hilitedRow_];
};

TestRend.prototype.getRowDiv = function(index) {
  return this.rowDivs_[index];
};

var handler;
var inputElement;
var mockControl;

function setUp() {
  inputElement = goog.dom.createDom(goog.dom.TagName.INPUT,
                                    {type: goog.dom.InputType.TEXT});
  handler = new goog.events.EventHandler();
  mockControl = new goog.testing.MockControl();
}

function tearDown() {
  handler.dispose();
  mockControl.$tearDown();
  goog.dom.removeChildren(goog.dom.getElement('test-area'));
}


/**
 * Make sure results are truncated (or not) by setMaxMatches.
 */
function testMaxMatches() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);

  ac.setMaxMatches(2);
  ac.setToken('the');
  assertEquals(2, rend.getRenderedRows().length);
  ac.setToken('');

  ac.setMaxMatches(3);
  ac.setToken('the');
  assertEquals(3, rend.getRenderedRows().length);
  ac.setToken('');

  ac.setMaxMatches(1000);
  ac.setToken('the');
  assertEquals(4, rend.getRenderedRows().length);
  ac.setToken('');
}

function testHiliteViaMouse() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var updates = 0;
  var row = null;
  var rowNode = null;
  handler.listen(rend,
      goog.ui.ac.AutoComplete.EventType.ROW_HILITE,
      function(evt) {
        updates++;
        rowNode = evt.rowNode;
      });
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setMaxMatches(4);
  ac.setToken('the');
  // Need to set the startRenderingRows_ time to something long ago, otherwise
  // the mouse event will not be fired.  (The autocomplete logic waits for some
  // time to pass after rendering before firing mouseover events.)
  rend.startRenderingRows_ = -1;
  var hilitedRowDiv = rend.getRowDiv(3);
  goog.testing.events.fireMouseOverEvent(hilitedRowDiv);
  assertEquals(2, updates);
  assertTrue(goog.string.contains(rowNode.innerHTML, 'mice@myotherdomain.com'));
}

function testMouseClickBeforeHilite() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setMaxMatches(4);
  ac.setToken('the');
  // Need to set the startRenderingRows_ time to something long ago, otherwise
  // the mouse event will not be fired.  (The autocomplete logic waits for some
  // time to pass after rendering before firing mouseover events.)
  rend.startRenderingRows_ = -1;

  // hilite row 3...
  var hilitedRowDiv = rend.getRowDiv(3);
  goog.testing.events.fireMouseOverEvent(hilitedRowDiv);

  // but click row 2, to simulate mouse getting ahead of focus.
  var targetRowDiv = rend.getRowDiv(2);
  goog.testing.events.fireClickEvent(targetRowDiv);

  assertEquals('the.mice@magrathea.com', select.selectedRow);
}

function testMouseClickOnFirstRowBeforeHilite() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setAutoHilite(false);
  ac.setMaxMatches(4);
  ac.setToken('the');

  // Click the first row before highlighting it, to simulate mouse getting ahead
  // of focus.
  var targetRowDiv = rend.getRowDiv(0);
  goog.testing.events.fireClickEvent(targetRowDiv);

  assertEquals(
      '"Zaphod Beeblebrox" <theprez@universe.gov>', select.selectedRow);
}

function testMouseClickOnRowAfterBlur() {
  var ds = new MockDS();
  var rend = new TestRend();
  var ih = new goog.ui.ac.InputHandler();
  ih.attachInput(inputElement);

  var ac = new goog.ui.ac.AutoComplete(ds, rend, ih);
  goog.testing.events.fireFocusEvent(inputElement);
  ac.setToken('the');
  var targetRowDiv = rend.getRowDiv(0);

  // Simulate the user clicking on an autocomplete row in the short time between
  // blur and autocomplete dismissal.
  goog.testing.events.fireBlurEvent(inputElement);
  assertNotThrows(function() {
    goog.testing.events.fireClickEvent(targetRowDiv);
  });
}


/*
 * Send AutoComplete a SELECT event with empty string for the row. We can't
 * simulate with a simple mouse click, so we dispatch the event directly.
 */
function testSelectEventEmptyRow() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setMaxMatches(4);
  ac.setToken('the');
  rend.startRenderingRows_ = -1;

  // hilight row 2 ('the.mice@...')
  var hilitedRowDiv = rend.getRowDiv(2);
  goog.testing.events.fireMouseOverEvent(hilitedRowDiv);
  assertUndefined(select.selectedRow);

  // Dispatch an event that does not specify a row.
  rend.dispatchEvent({
    type: goog.ui.ac.AutoComplete.EventType.SELECT,
    row: ''
  });

  assertEquals('the.mice@magrathea.com', select.selectedRow);
}

function testSuggestionsUpdateEvent() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  var updates = 0;
  handler.listen(ac,
      goog.ui.ac.AutoComplete.EventType.SUGGESTIONS_UPDATE,
      function() {
        updates++;
      });

  ac.setToken('the');
  assertEquals(1, updates);

  ac.setToken('beeb');
  assertEquals(2, updates);

  ac.setToken('ford');
  assertEquals(3, updates);

  ac.dismiss();
  assertEquals(4, updates);

  ac.setToken('dent');
  assertEquals(5, updates);
}

function checkHilitedIndex(renderer, index) {
  assertEquals(index, renderer.getHilitedRowIndex());
}

function testGetRowCount() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  assertEquals(0, ac.getRowCount());

  ac.setToken('Zaphod');
  assertEquals(1, ac.getRowCount());

  ac.setMaxMatches(2);
  ac.setToken('the');
  assertEquals(2, ac.getRowCount());
}


/**
 * Try using next and prev to navigate past the ends with default behavior of
 * allowFreeSelect_ and wrap_.
 */
function testHiliteNextPrev_default() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);

  var updates = 0;
  handler.listen(rend,
      goog.ui.ac.AutoComplete.EventType.ROW_HILITE,
      function() {
        updates++;
      });

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(4);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('the');
    assertEquals(4, rend.getRenderedRows().length);
    // check to see if we can select the last of the 4 items
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);
    ac.hiliteNext();
    checkHilitedIndex(rend, 2);
    ac.hiliteNext();
    checkHilitedIndex(rend, 3);
    // try going over the edge
    ac.hiliteNext();
    checkHilitedIndex(rend, 3);

    // go back down
    ac.hilitePrev();
    checkHilitedIndex(rend, 2);
    ac.hilitePrev();
    checkHilitedIndex(rend, 1);
    ac.hilitePrev();
    checkHilitedIndex(rend, 0);
    ac.hilitePrev();
    checkHilitedIndex(rend, 0);
  }
  // 21 changes in the loop above (3 * 7)
  assertEquals(21, updates);
}


/**
 * Try using next and prev to navigate past the ends with default behavior of
 * allowFreeSelect_ and wrap_ and with a disabled first row.
 */
function testHiliteNextPrevWithDisabledFirstRow_default() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);

  var updates = 0;
  handler.listen(rend,
      goog.ui.ac.AutoComplete.EventType.ROW_HILITE,
      function() {
        updates++;
      });

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(3);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times with disabled first row
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('edu');
    assertEquals(3, rend.getRenderedRows().length);
    // The first row is disabled, second should be highlighted.
    checkHilitedIndex(rend, 1);
    ac.hiliteNext();
    checkHilitedIndex(rend, 2);
    // try going over the edge
    ac.hiliteNext();
    checkHilitedIndex(rend, 2);

    // go back down
    ac.hilitePrev();
    checkHilitedIndex(rend, 1);
    // First row is disabled, make sure we don't highlight it.
    ac.hilitePrev();
    checkHilitedIndex(rend, 1);
  }
  // 9 changes in the loop above (3 * 3)
  assertEquals(9, updates);
}


/**
 * Try using next and prev to navigate past the ends with default behavior of
 * allowFreeSelect_ and wrap_ and with a disabled middle row.
 */
function testHiliteNextPrevWithDisabledMiddleRow_default() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);

  var updates = 0;
  handler.listen(rend,
      goog.ui.ac.AutoComplete.EventType.ROW_HILITE,
      function() {
        updates++;
      });

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(3);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times with disabled middle row
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('u');
    assertEquals(3, rend.getRenderedRows().length);
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    // Second row is disabled and should be skipped.
    checkHilitedIndex(rend, 2);
    // try going over the edge
    ac.hiliteNext();
    checkHilitedIndex(rend, 2);

    // go back down
    ac.hilitePrev();
    // Second row is disabled, make sure we don't highlight it.
    checkHilitedIndex(rend, 0);
    ac.hilitePrev();
    checkHilitedIndex(rend, 0);
  }
  // 9 changes in the loop above (3 * 3)
  assertEquals(9, updates);
}


/**
 * Try using next and prev to navigate past the ends with default behavior of
 * allowFreeSelect_ and wrap_ and with a disabled last row.
 */
function testHiliteNextPrevWithDisabledLastRow_default() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);

  var updates = 0;
  handler.listen(rend,
      goog.ui.ac.AutoComplete.EventType.ROW_HILITE,
      function() {
        updates++;
      });

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(3);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times with disabled last row
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('h');
    assertEquals(3, rend.getRenderedRows().length);
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);
    // try going over the edge since last row is disabled
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);

    // go back down
    ac.hilitePrev();
    checkHilitedIndex(rend, 0);
    ac.hilitePrev();
    checkHilitedIndex(rend, 0);
  }
  // 9 changes in the loop above (3 * 3)
  assertEquals(9, updates);
}


/**
 * Try using next and prev to navigate past the ends with wrap_ off and
 * allowFreeSelect_ on.
 */
function testHiliteNextPrev_allowFreeSelect() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setAllowFreeSelect(true);

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(4);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('the');
    assertEquals(4, rend.getRenderedRows().length);
    // check to see if we can select the last of the 4 items
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);
    ac.hiliteNext();
    checkHilitedIndex(rend, 2);
    ac.hiliteNext();
    checkHilitedIndex(rend, 3);
    // try going over the edge. Since allowFreeSelect is on, this will
    // deselect the last row.
    ac.hiliteNext();
    checkHilitedIndex(rend, -1);

    // go back down the list
    ac.hiliteNext();
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);

    // go back up the list.
    ac.hilitePrev();
    checkHilitedIndex(rend, 0);
    // go back above the first, deselects first.
    ac.hilitePrev();
    checkHilitedIndex(rend, -1);
  }
}


/**
 * Try using next and prev to navigate past the ends with wrap_ off and
 * allowFreeSelect_ on, and a disabled first row.
 */
function testHiliteNextPrevWithDisabledFirstRow_allowFreeSelect() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setAllowFreeSelect(true);

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(4);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times with disabled first row
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('edu');
    assertEquals(3, rend.getRenderedRows().length);
    // The first row is disabled, second should be highlighted.
    checkHilitedIndex(rend, 1);
    ac.hiliteNext();
    checkHilitedIndex(rend, 2);
    // Try going over the edge. Since allowFreeSelect is on, this will
    // deselect the last row.
    ac.hiliteNext();
    checkHilitedIndex(rend, -1);

    // go back down the list, first row is disabled
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);
    ac.hiliteNext();
    checkHilitedIndex(rend, 2);

    // go back up the list.
    ac.hilitePrev();
    checkHilitedIndex(rend, 1);
    // first is disabled, so deselect the second.
    ac.hilitePrev();
    checkHilitedIndex(rend, -1);
  }
}


/**
 * Try using next and prev to navigate past the ends with wrap_ off and
 * allowFreeSelect_ on, and a disabled middle row.
 */
function testHiliteNextPrevWithDisabledMiddleRow_allowFreeSelect() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setAllowFreeSelect(true);

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(4);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times with disabled middle row
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('u');
    assertEquals(3, rend.getRenderedRows().length);
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    // Second row is disabled and should be skipped.
    checkHilitedIndex(rend, 2);
    // try going over the edge. Since allowFreeSelect is on, this will
    // deselect the last row.
    ac.hiliteNext();
    checkHilitedIndex(rend, -1);

    // go back down the list
    ac.hiliteNext();
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    checkHilitedIndex(rend, 2);

    // go back up the list.
    ac.hilitePrev();
    checkHilitedIndex(rend, 0);
    // go back above the first, deselects first.
    ac.hilitePrev();
    checkHilitedIndex(rend, -1);
  }
}


/**
 * Try using next and prev to navigate past the ends with wrap_ off and
 * allowFreeSelect_ on, and a disabled last row.
 */
function testHiliteNextPrevWithDisabledLastRow_allowFreeSelect() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setAllowFreeSelect(true);

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(4);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times with disabled last row
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('h');
    assertEquals(3, rend.getRenderedRows().length);
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);
    // try going over the edge since last row is disabled. Since allowFreeSelect
    // is on, this will deselect the last row.
    ac.hiliteNext();
    checkHilitedIndex(rend, -1);

    // go back down the list
    ac.hiliteNext();
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);

    // go back up the list.
    ac.hilitePrev();
    checkHilitedIndex(rend, 0);
    // go back above the first, deselects first.
    ac.hilitePrev();
    checkHilitedIndex(rend, -1);
  }
}


/**
 * Try using next and prev to navigate past the ends with wrap_ on
 * allowFreeSelect_ off.
 */
function testHiliteNextPrev_wrap() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setWrap(true);

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(4);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('the');
    assertEquals(4, rend.getRenderedRows().length);
    // check to see if we can select the last of the 4 items
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);
    ac.hiliteNext();
    checkHilitedIndex(rend, 2);
    ac.hiliteNext();
    checkHilitedIndex(rend, 3);
    // try going over the edge. Since wrap is on, this will go back to 0.
    ac.hiliteNext();
    checkHilitedIndex(rend, 0);

    // go back down the list
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);

    // go back up the list.
    ac.hilitePrev();
    checkHilitedIndex(rend, 0);
    // go back above the first, selects last.
    ac.hilitePrev();
    checkHilitedIndex(rend, 3);
  }
}


/**
 * Try using next and prev to navigate past the ends with wrap_ on
 * allowFreeSelect_ off and a disabled first row.
 */
function testHiliteNextPrevWithDisabledFirstRow_wrap() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setWrap(true);

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(4);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times with disabled first row
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('edu');
    assertEquals(3, rend.getRenderedRows().length);
    // The first row is disabled, second should be highlighted.
    checkHilitedIndex(rend, 1);
    ac.hiliteNext();
    checkHilitedIndex(rend, 2);
    // try going over the edge. Since wrap is on and first row is disabled,
    // this will go back to 1.
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);

    // go back down the list
    ac.hiliteNext();
    checkHilitedIndex(rend, 2);

    // go back up the list.
    ac.hilitePrev();
    checkHilitedIndex(rend, 1);
    // first is disabled, so wrap and select the last.
    ac.hilitePrev();
    checkHilitedIndex(rend, 2);
  }
}


/**
 * Try using next and prev to navigate past the ends with wrap_ on
 * allowFreeSelect_ off and a disabled middle row.
 */
function testHiliteNextPrevWithDisabledMiddleRow_wrap() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setWrap(true);

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(4);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times with disabled middle row
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('u');
    assertEquals(3, rend.getRenderedRows().length);
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    // Second row is disabled and should be skipped.
    checkHilitedIndex(rend, 2);
    // try going over the edge. Since wrap is on, this will go back to 0.
    ac.hiliteNext();
    checkHilitedIndex(rend, 0);

    // go back down the list
    ac.hiliteNext();
    checkHilitedIndex(rend, 2);

    // go back up the list.
    ac.hilitePrev();
    checkHilitedIndex(rend, 0);
    // go back above the first, selects last.
    ac.hilitePrev();
    checkHilitedIndex(rend, 2);
  }
}


/**
 * Try using next and prev to navigate past the ends with wrap_ on
 * allowFreeSelect_ off and a disabled last row.
 */
function testHiliteNextPrevWithDisabledLastRow_wrap() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setWrap(true);

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(4);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times with disabled last row
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('h');
    assertEquals(3, rend.getRenderedRows().length);
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);
    // try going over the edge since last row is disabled. Since wrap is on,
    // this will go back to 0.
    ac.hiliteNext();
    checkHilitedIndex(rend, 0);

    // go back down the list
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);

    // go back up the list.
    ac.hilitePrev();
    checkHilitedIndex(rend, 0);
    // go back above the first, since wrap is on and last row is disabled, this
    // will select the second last.
    ac.hilitePrev();
    checkHilitedIndex(rend, 1);
  }
}


/**
 * Try using next and prev to navigate past the ends with wrap_ on
 * allowFreeSelect_ on.
 */
function testHiliteNextPrev_wrapAndAllowFreeSelect() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setWrap(true);
  ac.setAllowFreeSelect(true);

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(4);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('the');
    assertEquals(4, rend.getRenderedRows().length);
    // check to see if we can select the last of the 4 items
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);
    ac.hiliteNext();
    checkHilitedIndex(rend, 2);
    ac.hiliteNext();
    checkHilitedIndex(rend, 3);
    // try going over the edge. Since free select is on, this should go
    // to -1.
    ac.hiliteNext();
    checkHilitedIndex(rend, -1);

    // go back down the list
    ac.hiliteNext();
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);

    // go back up the list.
    ac.hilitePrev();
    checkHilitedIndex(rend, 0);
    // go back above the first, free select.
    ac.hilitePrev();
    checkHilitedIndex(rend, -1);
    // wrap to last
    ac.hilitePrev();
    checkHilitedIndex(rend, 3);
  }
}


/**
 * Try using next and prev to navigate past the ends with wrap_ on
 * allowFreeSelect_ on and a disabled first row.
 */
function testHiliteNextPrevWithDisabledFirstRow_wrapAndAllowFreeSelect() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setWrap(true);
  ac.setAllowFreeSelect(true);

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(4);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times with disabled first row
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('edu');
    assertEquals(3, rend.getRenderedRows().length);
    // The first row is disabled, second should be highlighted.
    checkHilitedIndex(rend, 1);
    ac.hiliteNext();
    checkHilitedIndex(rend, 2);
    // try going over the edge. Since free select is on, this should go to -1.
    ac.hiliteNext();
    checkHilitedIndex(rend, -1);

    // go back down the list, fist row is disabled
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);
    ac.hiliteNext();
    checkHilitedIndex(rend, 2);

    // go back up the list.
    ac.hilitePrev();
    checkHilitedIndex(rend, 1);
    // go back above the first, free select.
    ac.hilitePrev();
    checkHilitedIndex(rend, -1);
    // wrap to last
    ac.hilitePrev();
    checkHilitedIndex(rend, 2);
  }
}


/**
 * Try using next and prev to navigate past the ends with wrap_ on
 * allowFreeSelect_ on and a disabled middle row.
 */
function testHiliteNextPrevWithDisabledMiddleRow_wrapAndAllowFreeSelect() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setWrap(true);
  ac.setAllowFreeSelect(true);

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(4);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times with disabled middle row
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('u');
    assertEquals(3, rend.getRenderedRows().length);
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    // Second row is disabled and should be skipped.
    checkHilitedIndex(rend, 2);
    // try going over the edge. Since free select is on, this should go to -1
    ac.hiliteNext();
    checkHilitedIndex(rend, -1);

    // go back down the list
    ac.hiliteNext();
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    checkHilitedIndex(rend, 2);

    // go back up the list.
    ac.hilitePrev();
    checkHilitedIndex(rend, 0);
    // go back above the first, free select.
    ac.hilitePrev();
    checkHilitedIndex(rend, -1);
    // wrap to last
    ac.hilitePrev();
    checkHilitedIndex(rend, 2);
  }
}


/**
 * Try using next and prev to navigate past the ends with wrap_ on
 * allowFreeSelect_ on and a disabled last row.
 */
function testHiliteNextPrevWithDisabledLastRow_wrapAndAllowFreeSelect() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setWrap(true);
  ac.setAllowFreeSelect(true);

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(4);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times with disabled last row
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('h');
    assertEquals(3, rend.getRenderedRows().length);
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);
    // try going over the edge since last row is disabled. Since free select is
    // on, this should go to -1
    ac.hiliteNext();
    checkHilitedIndex(rend, -1);

    // go back down the list
    ac.hiliteNext();
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);

    // go back up the list.
    ac.hilitePrev();
    checkHilitedIndex(rend, 0);
    // go back above the first, free select.
    ac.hilitePrev();
    checkHilitedIndex(rend, -1);
    // wrap to the second last, since last is disabled.
    ac.hilitePrev();
    checkHilitedIndex(rend, 1);
  }
}


/**
 * Try using next and prev to navigate past the ends with wrap_ on
 * allowFreeSelect_ on AND turn autoHilite_ off.
 */
function testHiliteNextPrev_wrapAndAllowFreeSelectNoAutoHilite() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setWrap(true);
  ac.setAllowFreeSelect(true);
  ac.setAutoHilite(false);

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(4);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('the');
    assertEquals(4, rend.getRenderedRows().length);
    // check to see if we can select the last of the 4 items.
    // Initially nothing should be selected since autoHilite_ is off.
    checkHilitedIndex(rend, -1);
    ac.hilitePrev();
    checkHilitedIndex(rend, 3);
    ac.hiliteNext();
    checkHilitedIndex(rend, -1);
    ac.hiliteNext();
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);
    ac.hiliteNext();
    checkHilitedIndex(rend, 2);
    ac.hiliteNext();
    checkHilitedIndex(rend, 3);
    // try going over the edge. Since free select is on, this should go
    // to -1.
    ac.hiliteNext();
    checkHilitedIndex(rend, -1);

    // go back down the list
    ac.hiliteNext();
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);

    // go back up the list.
    ac.hilitePrev();
    checkHilitedIndex(rend, 0);
    // go back above the first, free select.
    ac.hilitePrev();
    checkHilitedIndex(rend, -1);
    // wrap to last
    ac.hilitePrev();
    checkHilitedIndex(rend, 3);
  }
}


/**
 * Try using next and prev to navigate past the ends with wrap_ on
 * allowFreeSelect_ on AND turn autoHilite_ off, and a disabled first row.
 */
function testHiliteNextPrevWithDisabledFirstRow_wrapAndAllowFreeSelectNoAutoHilite() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setWrap(true);
  ac.setAllowFreeSelect(true);
  ac.setAutoHilite(false);

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(4);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times with disabled first row
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('edu');
    assertEquals(3, rend.getRenderedRows().length);
    // Initially nothing should be selected since autoHilite_ is off.
    checkHilitedIndex(rend, -1);
    ac.hilitePrev();
    checkHilitedIndex(rend, 2);
    ac.hiliteNext();
    checkHilitedIndex(rend, -1);
    ac.hiliteNext();
    // First row is disabled.
    checkHilitedIndex(rend, 1);
    ac.hiliteNext();
    checkHilitedIndex(rend, 2);
    // try going over the edge. Since free select is on, this should go to -1
    ac.hiliteNext();
    checkHilitedIndex(rend, -1);

    // go back down the list, first row is disabled
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);
    ac.hiliteNext();
    checkHilitedIndex(rend, 2);

    // go back up the list.
    ac.hilitePrev();
    checkHilitedIndex(rend, 1);
    // go back above the first, free select.
    ac.hilitePrev();
    checkHilitedIndex(rend, -1);
    // wrap to last
    ac.hilitePrev();
    checkHilitedIndex(rend, 2);
  }
}


/**
 * Try using next and prev to navigate past the ends with wrap_ on
 * allowFreeSelect_ on AND turn autoHilite_ off, and a disabled middle row.
 */
function testHiliteNextPrevWithDisabledMiddleRow_wrapAndAllowFreeSelectNoAutoHilite() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setWrap(true);
  ac.setAllowFreeSelect(true);
  ac.setAutoHilite(false);

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(4);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times with disabled middle row
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('u');
    assertEquals(3, rend.getRenderedRows().length);
    // Initially nothing should be selected since autoHilite_ is off.
    checkHilitedIndex(rend, -1);
    ac.hilitePrev();
    checkHilitedIndex(rend, 2);
    ac.hiliteNext();
    checkHilitedIndex(rend, -1);
    ac.hiliteNext();
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    // Second row is disabled
    checkHilitedIndex(rend, 2);
    // try going over the edge. Since free select is on, this should go to -1.
    ac.hiliteNext();
    checkHilitedIndex(rend, -1);

    // go back down the list
    ac.hiliteNext();
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    // Second row is disabled.
    checkHilitedIndex(rend, 2);

    // go back up the list.
    ac.hilitePrev();
    checkHilitedIndex(rend, 0);
    // go back above the first, free select.
    ac.hilitePrev();
    checkHilitedIndex(rend, -1);
    // wrap to last
    ac.hilitePrev();
    checkHilitedIndex(rend, 2);
  }
}


/**
 * Try using next and prev to navigate past the ends with wrap_ on
 * allowFreeSelect_ on AND turn autoHilite_ off, and a disabled last row.
 */
function testHiliteNextPrevWithDisabledLastRow_wrapAndAllowFreeSelectNoAutoHilite() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setWrap(true);
  ac.setAllowFreeSelect(true);
  ac.setAutoHilite(false);

  // make sure 'next' and 'prev' don't explode before any token is set
  ac.hiliteNext();
  ac.hilitePrev();
  ac.setMaxMatches(4);
  assertEquals(0, rend.getRenderedRows().length);

  // check a few times with disabled last row
  for (var i = 0; i < 3; ++i) {
    ac.setToken('');
    ac.setToken('h');
    assertEquals(3, rend.getRenderedRows().length);
    // Initially nothing should be selected since autoHilite_ is off.
    checkHilitedIndex(rend, -1);
    ac.hilitePrev();
    // Last row is disabled
    checkHilitedIndex(rend, 1);
    ac.hiliteNext();
    checkHilitedIndex(rend, -1);
    ac.hiliteNext();
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);
    // try going over the edge. Since free select is on, this should go to -1.
    ac.hiliteNext();
    checkHilitedIndex(rend, -1);

    // go back down the list
    ac.hiliteNext();
    checkHilitedIndex(rend, 0);
    ac.hiliteNext();
    checkHilitedIndex(rend, 1);

    // go back up the list.
    ac.hilitePrev();
    checkHilitedIndex(rend, 0);
    // go back above the first, free select.
    ac.hilitePrev();
    checkHilitedIndex(rend, -1);
    // wrap to last
    ac.hilitePrev();
    checkHilitedIndex(rend, 1);
  }
}

function testHiliteWithChangingNumberOfRows() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setAutoHilite(true);
  ac.setMaxMatches(4);

  ac.setToken('m');
  assertEquals(4, rend.getRenderedRows().length);
  checkHilitedIndex(rend, 0);

  ac.setToken('ma');
  assertEquals(3, rend.getRenderedRows().length);
  checkHilitedIndex(rend, 0);

  // Hilite the second element
  var id = rend.getRenderedRows()[1].id;
  ac.hiliteId(id);

  ac.setToken('mar');
  assertEquals(1, rend.getRenderedRows().length);
  checkHilitedIndex(rend, 0);

  ac.setToken('ma');
  assertEquals(3, rend.getRenderedRows().length);
  checkHilitedIndex(rend, 0);

  // Hilite the second element
  var id = rend.getRenderedRows()[1].id;
  ac.hiliteId(id);

  ac.setToken('m');
  assertEquals(4, rend.getRenderedRows().length);
  checkHilitedIndex(rend, 0);
}


/**
 * Checks that autohilite is disabled when there is no token; this allows the
 * user to tab out of an empty autocomplete.
 */
function testNoAutoHiliteWhenTokenIsEmpty() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setWrap(true);
  ac.setAllowFreeSelect(true);
  ac.setAutoHilite(true);
  ac.setMaxMatches(4);

  ac.setToken('');
  assertEquals(4, rend.getRenderedRows().length);
  // No token; nothing should be hilited.
  checkHilitedIndex(rend, -1);

  ac.setToken('the');
  assertEquals(4, rend.getRenderedRows().length);
  // Now there is a token, so the first row should be highlighted.
  checkHilitedIndex(rend, 0);
}


/**
 * Checks that opt_preserveHilited works.
 */
function testPreserveHilitedWithoutAutoHilite() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setWrap(true);
  ac.setAllowFreeSelect(true);
  ac.setMaxMatches(4);
  ac.setAutoHilite(false);

  ac.setToken('m');
  assertEquals(4, rend.getRenderedRows().length);
  // No token; nothing should be hilited.
  checkHilitedIndex(rend, -1);

  // Hilite the second element
  var id = rend.getRenderedRows()[1].id;
  ac.hiliteId(id);

  checkHilitedIndex(rend, 1);

  // Re-render and check if the second element is still hilited
  ac.renderRows(rend.getRenderedRows(), true /* preserve hilite */);

  checkHilitedIndex(rend, 1);

  // Re-render without preservation
  ac.renderRows(rend.getRenderedRows());

  checkHilitedIndex(rend, -1);
}


/**
 * Checks that the autohilite argument "true" of the matcher is used.
 */
function testAutoHiliteFromMatcherTrue() {
  var ds = new MockDS(true);
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setWrap(true);
  ac.setAllowFreeSelect(true);
  ac.setAutoHilite(false);  // Will be overruled.
  ac.setMaxMatches(4);

  ac.setToken('the');
  assertEquals(4, rend.getRenderedRows().length);
  // The first row should be highlighted.
  checkHilitedIndex(rend, 0);
}


/**
 * Checks that the autohilite argument "false" of the matcher is used.
 */
function testAutoHiliteFromMatcherFalse() {
  var ds = new MockDS(false);
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setWrap(true);
  ac.setAllowFreeSelect(true);
  ac.setAutoHilite(true);  // Will be overruled.
  ac.setMaxMatches(4);

  ac.setToken('the');
  assertEquals(4, rend.getRenderedRows().length);
  // The first row should not be highlighted.
  checkHilitedIndex(rend, -1);
}


/**
 * Hilite using ids, the way mouse-based hiliting would work.
 */
function testHiliteId() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);

  // check a few times
  for (var i = 0; i < 3; ++i) {
    ac.setToken('m');
    assertEquals(4, rend.getRenderedRows().length);
    // try hiliting all 3
    for (var x = 0; x < 4; ++x) {
      var id = rend.getRenderedRows()[x].id;
      ac.hiliteId(id);
      assertEquals(ac.getIdOfIndex_(x), id);
    }
  }
}


/**
 * Test selecting the hilited row
 */
function testSelection() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac;

  // try with default selection
  ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setToken('m');
  ac.selectHilited();
  assertEquals('"Slartibartfast Theadore" <fjordmaster@magrathea.com>',
               select.selectedRow);

  // try second item
  ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setToken('the');
  ac.hiliteNext();
  ac.selectHilited();
  assertEquals('"Ford Prefect" <ford@theguide.com>',
               select.selectedRow);
}


/**
 * Dismiss when empty and non-empty
 */
function testDismiss() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();

  // dismiss empty
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  var dismissed = 0;
  handler.listen(ac,
      goog.ui.ac.AutoComplete.EventType.DISMISS,
      function() {
        dismissed++;
      });
  ac.dismiss();
  assertEquals(1, dismissed);

  ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setToken('sir not seen in this picture');
  ac.dismiss();

  // dismiss with contents
  ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setToken('t');
  ac.dismiss();
}

function testTriggerSuggestionsOnUpdate() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);

  var dismissCalled = 0;
  rend.dismiss = function() {
    dismissCalled++;
  };

  var updateCalled = 0;
  select.update = function(opt_force) {
    updateCalled++;
  };

  // Normally, menu is dismissed after selecting row (without updating).
  ac.setToken('the');
  ac.selectHilited();
  assertEquals(1, dismissCalled);
  assertEquals(0, updateCalled);

  // But not if we re-trigger on update.
  ac.setTriggerSuggestionsOnUpdate(true);
  ac.setToken('the');
  ac.selectHilited();
  assertEquals(1, dismissCalled);
  assertEquals(1, updateCalled);
}

function testDispose() {
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setToken('the');
  ac.dispose();
}


/**
 * Ensure that activedescendant is updated properly.
 */
function testRolesAndStates() {
  function checkActiveDescendant(activeDescendant) {
    assertNotNull(inputElement);
    assertEquals(
        goog.a11y.aria.getActiveDescendant(inputElement),
        activeDescendant);
  }
  function checkRole(el, role) {
    assertNotNull(el);
    assertEquals(goog.a11y.aria.getRole(el), role);
  }
  var ds = new MockDS();
  var rend = new TestRend();
  var select = new MockSelect();
  var ac = new goog.ui.ac.AutoComplete(ds, rend, select);
  ac.setTarget(inputElement);

  // initially activedescendant is not set
  checkActiveDescendant(null);

  // highlight the matching row and check that activedescendant updates
  ac.setToken('');
  ac.setToken('the');
  ac.hiliteNext();
  checkActiveDescendant(rend.getHilitedRowDiv());

  // highligted row should have a role of 'option'
  checkRole(rend.getHilitedRowDiv(), goog.a11y.aria.Role.OPTION);

  // closing the autocomplete should clear activedescendant
  ac.dismiss();
  checkActiveDescendant(null);
}

function testAttachInputWithAnchor() {
  var anchorElement = goog.dom.createDom(goog.dom.TagName.DIV,
                                         null, inputElement);

  var mockRenderer = mockControl.createLooseMock(
      goog.ui.ac.Renderer, true);
  mockRenderer.setAnchorElement(anchorElement);
  var ignore = goog.testing.mockmatchers.ignoreArgument;
  mockRenderer.renderRows(ignore, ignore, inputElement);

  var mockInputHandler = mockControl.createLooseMock(
      goog.ui.ac.InputHandler, true);
  mockInputHandler.attachInputs(inputElement);

  mockControl.$replayAll();
  var autoComplete = new goog.ui.ac.AutoComplete(
      null, mockRenderer, mockInputHandler);
  autoComplete.attachInputWithAnchor(inputElement, anchorElement);
  autoComplete.setTarget(inputElement);

  autoComplete.renderRows(['abc', 'def']);
  mockControl.$verifyAll();
}

function testDetachInputWithAnchor() {
  var mockRenderer = mockControl.createLooseMock(
      goog.ui.ac.Renderer, true);
  var mockInputHandler = mockControl.createLooseMock(
      goog.ui.ac.InputHandler, true);
  var anchorElement = goog.dom.createDom(goog.dom.TagName.DIV,
                                         null, inputElement);
  var inputElement2 = goog.dom.createDom(goog.dom.TagName.INPUT,
                                         {type: goog.dom.InputType.TEXT});
  var anchorElement2 = goog.dom.createDom(goog.dom.TagName.DIV,
                                          null, inputElement2);

  mockControl.$replayAll();
  var autoComplete = new goog.ui.ac.AutoComplete(
      null, mockRenderer, mockInputHandler);

  autoComplete.attachInputWithAnchor(inputElement, anchorElement);
  autoComplete.attachInputWithAnchor(inputElement2, anchorElement2);
  autoComplete.detachInputs(inputElement, inputElement2);

  assertFalse(goog.getUid(inputElement) in autoComplete.inputToAnchorMap_);
  assertFalse(goog.getUid(inputElement2) in autoComplete.inputToAnchorMap_);
  mockControl.$verifyAll();
}
