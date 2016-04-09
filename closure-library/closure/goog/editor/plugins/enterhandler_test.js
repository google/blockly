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

goog.provide('goog.editor.plugins.EnterHandlerTest');
goog.setTestOnly('goog.editor.plugins.EnterHandlerTest');

goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.editor.Field');
goog.require('goog.editor.Plugin');
goog.require('goog.editor.plugins.Blockquote');
goog.require('goog.editor.plugins.EnterHandler');
goog.require('goog.editor.range');
goog.require('goog.events');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.dom');
goog.require('goog.testing.editor.TestHelper');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var savedHtml;

var field1;
var field2;
var firedDelayedChange;
var firedBeforeChange;
var clock;
var container;
var EXPECTEDFAILURES;

function setUpPage() {
  container = goog.dom.getElement('container');
}

function setUp() {
  EXPECTEDFAILURES = new goog.testing.ExpectedFailures();
  savedHtml = goog.dom.getElement('root').innerHTML;
  clock = new goog.testing.MockClock(true);
}

function setUpFields(classnameRequiredToSplitBlockquote) {
  field1 = makeField('field1', classnameRequiredToSplitBlockquote);
  field2 = makeField('field2', classnameRequiredToSplitBlockquote);

  field1.makeEditable();
  field2.makeEditable();
}

function tearDown() {
  clock.dispose();

  EXPECTEDFAILURES.handleTearDown();

  goog.dom.getElement('root').innerHTML = savedHtml;
}

function testEnterInNonSetupBlockquote() {
  setUpFields(true);
  resetChangeFlags();
  var prevented = !selectNodeAndHitEnter(field1, 'field1cursor');
  waitForChangeEvents();
  assertChangeFlags();

  // make sure there's just one blockquote, and that the text has been deleted.
  var elem = field1.getElement();
  var dom = field1.getEditableDomHelper();
  EXPECTEDFAILURES.expectFailureFor(
      goog.userAgent.OPERA,
      'The blockquote is overwritten with DIV due to CORE-22104 -- Opera ' +
          'overwrites the BLOCKQUOTE ancestor with DIV when doing FormatBlock ' +
          'for DIV');
  try {
    assertEquals(
        'Blockquote should not be split', 1,
        dom.getElementsByTagNameAndClass(
               goog.dom.TagName.BLOCKQUOTE, null, elem)
            .length);
  } catch (e) {
    EXPECTEDFAILURES.handleException(e);
  }
  assert(
      'Selection should be deleted', -1 == elem.innerHTML.indexOf('selection'));

  assertEquals(
      'The event should have been prevented only on webkit', prevented,
      goog.userAgent.WEBKIT);
}

function testEnterInSetupBlockquote() {
  setUpFields(true);
  resetChangeFlags();
  var prevented = !selectNodeAndHitEnter(field2, 'field2cursor');
  waitForChangeEvents();
  assertChangeFlags();

  // make sure there are two blockquotes, and a DIV with nbsp in the middle.
  var elem = field2.getElement();
  var dom = field2.getEditableDomHelper();
  assertEquals(
      'Blockquote should be split', 2,
      dom.getElementsByTagNameAndClass(goog.dom.TagName.BLOCKQUOTE, null, elem)
          .length);
  assert(
      'Selection should be deleted', -1 == elem.innerHTML.indexOf('selection'));

  assert(
      'should have div with &nbsp;',
      -1 != elem.innerHTML.indexOf('>' + getNbsp() + '<'));
  assert('event should have been prevented', prevented);
}

function testEnterInNonSetupBlockquoteWhenClassnameIsNotRequired() {
  setUpFields(false);

  resetChangeFlags();
  var prevented = !selectNodeAndHitEnter(field1, 'field1cursor');
  waitForChangeEvents();
  assertChangeFlags();

  // make sure there are two blockquotes, and a DIV with nbsp in the middle.
  var elem = field1.getElement();
  var dom = field1.getEditableDomHelper();
  assertEquals(
      'Blockquote should be split', 2,
      dom.getElementsByTagNameAndClass(goog.dom.TagName.BLOCKQUOTE, null, elem)
          .length);
  assert(
      'Selection should be deleted', -1 == elem.innerHTML.indexOf('selection'));

  assert(
      'should have div with &nbsp;',
      -1 != elem.innerHTML.indexOf('>' + getNbsp() + '<'));
  assert('event should have been prevented', prevented);
}

function testEnterInBlockquoteCreatesDivInBrMode() {
  setUpFields(true);
  selectNodeAndHitEnter(field2, 'field2cursor');
  var elem = field2.getElement();
  var dom = field2.getEditableDomHelper();

  var firstBlockquote = dom.getElementsByTagNameAndClass(
      goog.dom.TagName.BLOCKQUOTE, null, elem)[0];
  var div = dom.getNextElementSibling(firstBlockquote);
  assertEquals('Element after blockquote should be a div', 'DIV', div.tagName);
  assertEquals(
      'Element after div should be second blockquote', 'BLOCKQUOTE',
      dom.getNextElementSibling(div).tagName);
}


/**
 * Tests that breaking after a BR doesn't result in unnecessary newlines.
 * @bug 1471047
 */
function testEnterInBlockquoteRemovesUnnecessaryBrWithCursorAfterBr() {
  setUpFields(true);

  // Assume the following HTML snippet:-
  // <blockquote>one<br>|two<br></blockquote>
  //
  // After enter on the cursor position without the fix, the resulting HTML
  // after the blockquote split was:-
  // <blockquote>one</blockquote>
  // <div>&nbsp;</div>
  // <blockquote><br>two<br></blockquote>
  //
  // This creates the impression on an unnecessary newline. The resulting HTML
  // after the fix is:-
  //
  // <blockquote>one<br></blockquote>
  // <div>&nbsp;</div>
  // <blockquote>two<br></blockquote>
  field1.setHtml(
      false, '<blockquote id="quote" class="tr_bq">one<br>' +
          'two<br></blockquote>');
  var dom = field1.getEditableDomHelper();
  goog.dom.Range.createCaret(dom.getElement('quote'), 2).select();
  goog.testing.events.fireKeySequence(
      field1.getElement(), goog.events.KeyCodes.ENTER);
  var elem = field1.getElement();
  var secondBlockquote = dom.getElementsByTagNameAndClass(
      goog.dom.TagName.BLOCKQUOTE, null, elem)[1];
  assertHTMLEquals('two<br>', secondBlockquote.innerHTML);

  // Verifies that a blockquote split doesn't happen if it doesn't need to.
  field1.setHtml(
      false, '<blockquote class="tr_bq">one<br id="brcursor"></blockquote>');
  selectNodeAndHitEnter(field1, 'brcursor');
  assertEquals(
      1,
      dom.getElementsByTagNameAndClass(goog.dom.TagName.BLOCKQUOTE, null, elem)
          .length);
}


/**
 * Tests that breaking in a text node before a BR doesn't result in unnecessary
 * newlines.
 * @bug 1471047
 */
function testEnterInBlockquoteRemovesUnnecessaryBrWithCursorBeforeBr() {
  setUpFields(true);

  // Assume the following HTML snippet:-
  // <blockquote>one|<br>two<br></blockquote>
  //
  // After enter on the cursor position, the resulting HTML should be.
  // <blockquote>one<br></blockquote>
  // <div>&nbsp;</div>
  // <blockquote>two<br></blockquote>
  field1.setHtml(
      false, '<blockquote id="quote" class="tr_bq">one<br>' +
          'two<br></blockquote>');
  var dom = field1.getEditableDomHelper();
  var cursor = dom.getElement('quote').firstChild;
  goog.dom.Range.createCaret(cursor, 3).select();
  goog.testing.events.fireKeySequence(
      field1.getElement(), goog.events.KeyCodes.ENTER);
  var elem = field1.getElement();
  var secondBlockquote = dom.getElementsByTagNameAndClass(
      goog.dom.TagName.BLOCKQUOTE, null, elem)[1];
  assertHTMLEquals('two<br>', secondBlockquote.innerHTML);

  // Ensures that standard text node split works as expected with the new
  // change.
  field1.setHtml(
      false, '<blockquote id="quote" class="tr_bq">one<b>two</b><br>');
  cursor = dom.getElement('quote').firstChild;
  goog.dom.Range.createCaret(cursor, 3).select();
  goog.testing.events.fireKeySequence(
      field1.getElement(), goog.events.KeyCodes.ENTER);
  secondBlockquote = dom.getElementsByTagNameAndClass(
      goog.dom.TagName.BLOCKQUOTE, null, elem)[1];
  assertHTMLEquals('<b>two</b><br>', secondBlockquote.innerHTML);
}


/**
 * Tests that pressing enter in a blockquote doesn't create unnecessary
 * DOM subtrees.
 *
 * @bug 1991539
 * @bug 1991392
 */
function testEnterInBlockquoteRemovesExtraNodes() {
  setUpFields(true);

  // Let's assume we have the following DOM structure and the
  // cursor is placed after the first numbered list item "one".
  //
  // <blockquote class="tr_bq">
  //   <div><div>a</div><ol><li>one|</li></div>
  //   <div>two</div>
  // </blockquote>
  //
  // After pressing enter, we have the following structure.
  //
  // <blockquote class="tr_bq">
  //   <div><div>a</div><ol><li>one|</li></div>
  // </blockquote>
  // <div>&nbsp;</div>
  // <blockquote class="tr_bq">
  //   <div><ol><li><span id=""></span></li></ol></div>
  //   <div>two</div>
  // </blockquote>
  //
  // This appears to the user as an empty list. After the fix, the HTML
  // will be
  //
  // <blockquote class="tr_bq">
  //   <div><div>a</div><ol><li>one|</li></div>
  // </blockquote>
  // <div>&nbsp;</div>
  // <blockquote class="tr_bq">
  //   <div>two</div>
  // </blockquote>
  //
  field1.setHtml(
      false, '<blockquote class="tr_bq">' +
          '<div><div>a</div><ol><li id="cursor">one</li></div>' +
          '<div>b</div>' +
          '</blockquote>');
  var dom = field1.getEditableDomHelper();
  goog.dom.Range.createCaret(dom.getElement('cursor').firstChild, 3).select();
  goog.testing.events.fireKeySequence(
      field1.getElement(), goog.events.KeyCodes.ENTER);
  var elem = field1.getElement();
  var secondBlockquote = dom.getElementsByTagNameAndClass(
      goog.dom.TagName.BLOCKQUOTE, null, elem)[1];
  assertHTMLEquals('<div>b</div>', secondBlockquote.innerHTML);

  // Ensure that we remove only unnecessary subtrees.
  field1.setHtml(
      false, '<blockquote class="tr_bq">' +
          '<div><span>a</span><div id="cursor">one</div><div>two</div></div>' +
          '<div><span>c</span></div>' +
          '</blockquote>');
  goog.dom.Range.createCaret(dom.getElement('cursor').firstChild, 3).select();
  goog.testing.events.fireKeySequence(
      field1.getElement(), goog.events.KeyCodes.ENTER);
  secondBlockquote = dom.getElementsByTagNameAndClass(
      goog.dom.TagName.BLOCKQUOTE, null, elem)[1];
  var expectedHTML = '<div><div>two</div></div>' +
      '<div><span>c</span></div>';
  assertHTMLEquals(expectedHTML, secondBlockquote.innerHTML);

  // Place the cursor in the middle of a line.
  field1.setHtml(
      false, '<blockquote id="quote" class="tr_bq">' +
          '<div>one</div><div>two</div>' +
          '</blockquote>');
  goog.dom.Range.createCaret(dom.getElement('quote').firstChild.firstChild, 1)
      .select();
  goog.testing.events.fireKeySequence(
      field1.getElement(), goog.events.KeyCodes.ENTER);
  var blockquotes =
      dom.getElementsByTagNameAndClass(goog.dom.TagName.BLOCKQUOTE, null, elem);
  assertEquals(2, blockquotes.length);
  assertHTMLEquals('<div>o</div>', blockquotes[0].innerHTML);
  assertHTMLEquals('<div>ne</div><div>two</div>', blockquotes[1].innerHTML);
}

function testEnterInList() {
  setUpFields(true);

  // <enter> in a list should *never* be handled by custom code. Lists are
  // just way too complicated to get right.
  field1.setHtml(false, '<ol><li>hi!<span id="field1cursor"></span></li></ol>');
  if (goog.userAgent.OPERA) {
    // Opera doesn't actually place the selection in the empty span
    // unless we add a text node first.
    var dom = field1.getEditableDomHelper();
    dom.getElement('field1cursor').appendChild(dom.createTextNode(''));
  }
  var prevented = !selectNodeAndHitEnter(field1, 'field1cursor');
  assertFalse('<enter> in a list should not be prevented', prevented);
}

function testEnterAtEndOfBlockInWebkit() {
  setUpFields(true);

  if (goog.userAgent.WEBKIT) {
    field1.setHtml(
        false, '<blockquote>hi!<span id="field1cursor"></span></blockquote>');

    var cursor = field1.getEditableDomHelper().getElement('field1cursor');
    goog.editor.range.placeCursorNextTo(cursor, false);
    goog.dom.removeNode(cursor);

    var prevented = !goog.testing.events.fireKeySequence(
        field1.getElement(), goog.events.KeyCodes.ENTER);
    waitForChangeEvents();
    assertChangeFlags();
    assert('event should have been prevented', prevented);

    // Make sure that the block now has two brs.
    var elem = field1.getElement();
    assertEquals(
        'should have inserted two br tags: ' + elem.innerHTML, 2,
        goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.BR, null, elem)
            .length);
  }
}


/**
 * Tests that deleting a BR that comes right before a block element works.
 * @bug 1471096
 * @bug 2056376
 */
function testDeleteBrBeforeBlock() {
  setUpFields(true);

  // This test only works on Gecko, because it's testing for manual deletion of
  // BR tags, which is done only for Gecko. For other browsers we fall through
  // and let the browser do the delete, which can only be tested with a robot
  // test (see javascript/apps/editor/tests/delete_br_robot.html).
  if (goog.userAgent.GECKO) {
    field1.setHtml(false, 'one<br><br><div>two</div>');
    var helper = new goog.testing.editor.TestHelper(field1.getElement());
    helper.select(field1.getElement(), 2);  // Between the two BR's.
    goog.testing.events.fireKeySequence(
        field1.getElement(), goog.events.KeyCodes.DELETE);
    assertEquals(
        'Should have deleted exactly one <br>', 'one<br><div>two</div>',
        field1.getElement().innerHTML);

    // We test the case where the BR has a previous sibling which is not
    // a block level element.
    field1.setHtml(false, 'one<br><ul><li>two</li></ul>');
    helper.select(field1.getElement(), 1);  // Between one and BR.
    goog.testing.events.fireKeySequence(
        field1.getElement(), goog.events.KeyCodes.DELETE);
    assertEquals(
        'Should have deleted the <br>', 'one<ul><li>two</li></ul>',
        field1.getElement().innerHTML);
    // Verify that the cursor is placed at the end of the text node "one".
    var range = field1.getRange();
    var focusNode = range.getFocusNode();
    assertTrue('The selected range should be collapsed', range.isCollapsed());
    assertTrue(
        'The focus node should be the text node "one"',
        focusNode.nodeType == goog.dom.NodeType.TEXT &&
            focusNode.data == 'one');
    assertEquals(
        'The focus offset should be at the end of the text node "one"',
        focusNode.length, range.getFocusOffset());
    assertTrue(
        'The next sibling of the focus node should be the UL',
        focusNode.nextSibling &&
            focusNode.nextSibling.tagName == goog.dom.TagName.UL);

    // We test the case where the previous sibling of the BR is a block
    // level element.
    field1.setHtml(false, '<div>foo</div><br><div><span>bar</span></div>');
    helper.select(field1.getElement(), 1);  // Before the BR.
    goog.testing.events.fireKeySequence(
        field1.getElement(), goog.events.KeyCodes.DELETE);
    assertEquals(
        'Should have deleted the <br>',
        '<div>foo</div><div><span>bar</span></div>',
        field1.getElement().innerHTML);
    range = field1.getRange();
    assertEquals(
        'The selected range should be contained within the <span>',
        goog.dom.TagName.SPAN, range.getContainerElement().tagName);
    assertTrue('The selected range should be collapsed', range.isCollapsed());
    // Verify that the cursor is placed inside the span at the beginning of bar.
    focusNode = range.getFocusNode();
    assertTrue(
        'The focus node should be the text node "bar"',
        focusNode.nodeType == goog.dom.NodeType.TEXT &&
            focusNode.data == 'bar');
    assertEquals(
        'The focus offset should be at the beginning ' +
            'of the text node "bar"',
        0, range.getFocusOffset());

    // We test the case where the BR does not have a previous sibling.
    field1.setHtml(false, '<br><ul><li>one</li></ul>');
    helper.select(field1.getElement(), 0);  // Before the BR.
    goog.testing.events.fireKeySequence(
        field1.getElement(), goog.events.KeyCodes.DELETE);
    assertEquals(
        'Should have deleted the <br>', '<ul><li>one</li></ul>',
        field1.getElement().innerHTML);
    range = field1.getRange();
    // Verify that the cursor is placed inside the LI at the text node "one".
    assertEquals(
        'The selected range should be contained within the <li>',
        goog.dom.TagName.LI, range.getContainerElement().tagName);
    assertTrue('The selected range should be collapsed', range.isCollapsed());
    focusNode = range.getFocusNode();
    assertTrue(
        'The focus node should be the text node "one"',
        (focusNode.nodeType == goog.dom.NodeType.TEXT &&
         focusNode.data == 'one'));
    assertEquals(
        'The focus offset should be at the beginning of ' +
            'the text node "one"',
        0, range.getFocusOffset());

    // Testing deleting a BR followed by a block level element and preceded
    // by a BR.
    field1.setHtml(false, '<br><br><ul><li>one</li></ul>');
    helper.select(field1.getElement(), 1);  // Between the BR's.
    goog.testing.events.fireKeySequence(
        field1.getElement(), goog.events.KeyCodes.DELETE);
    assertEquals(
        'Should have deleted the <br>', '<br><ul><li>one</li></ul>',
        field1.getElement().innerHTML);
    // Verify that the cursor is placed inside the LI at the text node "one".
    range = field1.getRange();
    assertEquals(
        'The selected range should be contained within the <li>',
        goog.dom.TagName.LI, range.getContainerElement().tagName);
    assertTrue('The selected range should be collapsed', range.isCollapsed());
    focusNode = range.getFocusNode();
    assertTrue(
        'The focus node should be the text node "one"',
        (focusNode.nodeType == goog.dom.NodeType.TEXT &&
         focusNode.data == 'one'));
    assertEquals(
        'The focus offset should be at the beginning of ' +
            'the text node "one"',
        0, range.getFocusOffset());
  }  // End if GECKO
}


/**
 * Tests that deleting a BR before a blockquote doesn't remove quoted text.
 * @bug 1471075
 */
function testDeleteBeforeBlockquote() {
  setUpFields(true);

  if (goog.userAgent.GECKO) {
    field1.setHtml(
        false, '<br><br><div><br><blockquote>foo</blockquote></div>');
    var helper = new goog.testing.editor.TestHelper(field1.getElement());
    helper.select(field1.getElement(), 0);  // Before the first BR.
    // Fire three deletes in quick succession.
    goog.testing.events.fireKeySequence(
        field1.getElement(), goog.events.KeyCodes.DELETE);
    goog.testing.events.fireKeySequence(
        field1.getElement(), goog.events.KeyCodes.DELETE);
    goog.testing.events.fireKeySequence(
        field1.getElement(), goog.events.KeyCodes.DELETE);
    assertEquals(
        'Should have deleted all the <br>\'s and the blockquote ' +
            'isn\'t affected',
        '<div><blockquote>foo</blockquote></div>',
        field1.getElement().innerHTML);
    var range = field1.getRange();
    assertEquals(
        'The selected range should be contained within the ' +
            '<blockquote>',
        goog.dom.TagName.BLOCKQUOTE, range.getContainerElement().tagName);
    assertTrue('The selected range should be collapsed', range.isCollapsed());
    var focusNode = range.getFocusNode();
    assertTrue(
        'The focus node should be the text node "foo"',
        (focusNode.nodeType == goog.dom.NodeType.TEXT &&
         focusNode.data == 'foo'));
    assertEquals(
        'The focus offset should be at the ' +
            'beginning of the text node "foo"',
        0, range.getFocusOffset());
  }
}


/**
 * Tests that deleting a BR is working normally (that the workaround for the
 * bug is not causing double deletes).
 * @bug 1471096
 */
function testDeleteBrNormal() {
  setUpFields(true);

  // This test only works on Gecko, because it's testing for manual deletion of
  // BR tags, which is done only for Gecko. For other browsers we fall through
  // and let the browser do the delete, which can only be tested with a robot
  // test (see javascript/apps/editor/tests/delete_br_robot.html).
  if (goog.userAgent.GECKO) {
    field1.setHtml(false, 'one<br><br><br>two');
    var helper = new goog.testing.editor.TestHelper(field1.getElement());
    helper.select(
        field1.getElement(), 2);  // Between the first and second BR's.
    field1.getElement().focus();
    goog.testing.events.fireKeySequence(
        field1.getElement(), goog.events.KeyCodes.DELETE);
    assertEquals(
        'Should have deleted exactly one <br>', 'one<br><br>two',
        field1.getElement().innerHTML);

  }  // End if GECKO
}


/**
 * Tests that deleteCursorSelectionW3C_ correctly recognizes visually
 * collapsed selections in Opera even if they contain a <br>.
 * See the deleteCursorSelectionW3C_ comment in enterhandler.js.
 */
function testCollapsedSelectionKeepsBrOpera() {
  setUpFields(true);

  if (goog.userAgent.OPERA) {
    field1.setHtml(false, '<div><br id="pleasedontdeleteme"></div>');
    field1.focus();
    goog.testing.events.fireKeySequence(
        field1.getElement(), goog.events.KeyCodes.ENTER);
    assertNotNull(
        'The <br> must not have been deleted',
        goog.dom.getElement('pleasedontdeleteme'));
  }
}


/**
 * Selects the node at the given id, and simulates an ENTER keypress.
 * @param {goog.editor.Field} field The field with the node.
 * @param {string} id A DOM id.
 * @return {boolean} Whether preventDefault was called on the event.
 */
function selectNodeAndHitEnter(field, id) {
  var dom = field.getEditableDomHelper();
  var cursor = dom.getElement(id);
  goog.dom.Range.createFromNodeContents(cursor).select();
  return goog.testing.events.fireKeySequence(
      cursor, goog.events.KeyCodes.ENTER);
}


/**
 * Creates a field with only the enter handler plugged in, for testing.
 * @param {string} id A DOM id.
 * @return {goog.editor.Field} A field.
 */
function makeField(id, classnameRequiredToSplitBlockquote) {
  var field = new goog.editor.Field(id);
  field.registerPlugin(new goog.editor.plugins.EnterHandler());
  field.registerPlugin(
      new goog.editor.plugins.Blockquote(classnameRequiredToSplitBlockquote));

  goog.events.listen(
      field, goog.editor.Field.EventType.BEFORECHANGE, function() {
        // set the global flag that beforechange was fired.
        firedBeforeChange = true;
      });
  goog.events.listen(
      field, goog.editor.Field.EventType.DELAYEDCHANGE, function() {
        // set the global flag that delayed change was fired.
        firedDelayedChange = true;
      });

  return field;
}


/**
 * Reset all the global flags related to change events.
 */
function resetChangeFlags() {
  waitForChangeEvents();
  firedBeforeChange = firedDelayedChange = false;
}


/**
 * Asserts that both change flags were fired since the last reset.
 */
function assertChangeFlags() {
  assert('Beforechange should have fired', firedBeforeChange);
  assert('Delayedchange should have fired', firedDelayedChange);
}


/**
 * Wait for delayedchange to propagate.
 */
function waitForChangeEvents() {
  clock.tick(
      goog.editor.Field.DELAYED_CHANGE_FREQUENCY +
      goog.editor.Field.CHANGE_FREQUENCY);
}

function getNbsp() {
  // On WebKit (pre-528) and Opera, &nbsp; shows up as its unicode character in
  // innerHTML under some circumstances.
  return (goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher('528')) ||
          goog.userAgent.OPERA ?
      '\u00a0' :
      '&nbsp;';
}


function testPrepareContent() {
  setUpFields(true);
  assertPreparedContents('hi', 'hi');
  assertPreparedContents(
      goog.editor.BrowserFeature.COLLAPSES_EMPTY_NODES ? '<br>' : '', '   ');
}


/**
 * Assert that the prepared contents matches the expected.
 */
function assertPreparedContents(expected, original) {
  assertEquals(
      expected,
      field1.reduceOp_(goog.editor.Plugin.Op.PREPARE_CONTENTS_HTML, original));
}

// UTILITY FUNCTION TESTS.

function testDeleteW3CSimple() {
  if (goog.editor.BrowserFeature.HAS_W3C_RANGES) {
    container.innerHTML = '<div>abcd</div>';
    var range = goog.dom.Range.createFromNodes(
        container.firstChild.firstChild, 1, container.firstChild.firstChild, 3);
    range.select();
    goog.editor.plugins.EnterHandler.deleteW3cRange_(range);

    goog.testing.dom.assertHtmlContentsMatch('<div>ad</div>', container);
  }
}

function testDeleteW3CAll() {
  if (goog.editor.BrowserFeature.HAS_W3C_RANGES) {
    container.innerHTML = '<div>abcd</div>';
    var range = goog.dom.Range.createFromNodes(
        container.firstChild.firstChild, 0, container.firstChild.firstChild, 4);
    range.select();
    goog.editor.plugins.EnterHandler.deleteW3cRange_(range);

    goog.testing.dom.assertHtmlContentsMatch('<div>&nbsp;</div>', container);
  }
}

function testDeleteW3CPartialEnd() {
  if (goog.editor.BrowserFeature.HAS_W3C_RANGES) {
    container.innerHTML = '<div>ab</div><div>cd</div>';
    var range = goog.dom.Range.createFromNodes(
        container.firstChild.firstChild, 1, container.lastChild.firstChild, 1);
    range.select();
    goog.editor.plugins.EnterHandler.deleteW3cRange_(range);

    goog.testing.dom.assertHtmlContentsMatch('<div>ad</div>', container);
  }
}

function testDeleteW3CNonPartialEnd() {
  if (goog.editor.BrowserFeature.HAS_W3C_RANGES) {
    container.innerHTML = '<div>ab</div><div>cd</div>';
    var range = goog.dom.Range.createFromNodes(
        container.firstChild.firstChild, 1, container.lastChild.firstChild, 2);
    range.select();
    goog.editor.plugins.EnterHandler.deleteW3cRange_(range);

    goog.testing.dom.assertHtmlContentsMatch('<div>a</div>', container);
  }
}

function testIsInOneContainer() {
  if (goog.editor.BrowserFeature.HAS_W3C_RANGES) {
    container.innerHTML = '<div><br></div>';
    var div = container.firstChild;
    var range = goog.dom.Range.createFromNodes(div, 0, div, 1);
    range.select();
    assertTrue(
        'Selection must be recognized as being in one container',
        goog.editor.plugins.EnterHandler.isInOneContainerW3c_(range));
  }
}

function testDeletingEndNodesWithNoNewLine() {
  if (goog.editor.BrowserFeature.HAS_W3C_RANGES) {
    container.innerHTML =
        'a<div>b</div><div><br></div><div>c</div><div>d</div>';
    var range = goog.dom.Range.createFromNodes(
        container.childNodes[2], 0, container.childNodes[4].childNodes[0], 1);
    range.select();
    var newRange = goog.editor.plugins.EnterHandler.deleteW3cRange_(range);
    goog.testing.dom.assertHtmlContentsMatch('a<div>b</div>', container);
    assertTrue(newRange.isCollapsed());
    assertEquals(container, newRange.getStartNode());
    assertEquals(2, newRange.getStartOffset());
  }
}
