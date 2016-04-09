// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.ac.RendererTest');
goog.setTestOnly('goog.ui.ac.RendererTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.State');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.fx.dom.FadeInAndShow');
goog.require('goog.fx.dom.FadeOutAndHide');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.ac.AutoComplete');
goog.require('goog.ui.ac.Renderer');
var renderer;
var rendRows = [];
var someElement;
var target;
var viewport;
var viewportTarget;
var propertyReplacer;

function setUpPage() {
  someElement = goog.dom.getElement('someElement');
  target = goog.dom.getElement('target');
  viewport = goog.dom.getElement('viewport');
  viewportTarget = goog.dom.getElement('viewportTarget');
  propertyReplacer = new goog.testing.PropertyReplacer();
}


// One-time set up of rows formatted for the renderer.
var rows = [
  'Amanda Annie Anderson', 'Frankie Manning', 'Louis D Armstrong',
  // NOTE(user): sorry about this test input, but it has caused problems
  // in the past, so I want to make sure to test against it.
  'Foo Bar................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................', '<div><div>test</div></div>',
  '<div><div>test1</div><div>test2</div></div>',
  '<div>random test string<div>test1</div><div><div>test2</div><div>test3</div></div></div>'
];

for (var i = 0; i < rows.length; i++) {
  rendRows.push({id: i, data: rows[i]});
}

function setUp() {
  renderer = new goog.ui.ac.Renderer();
  renderer.rowDivs_ = [];
  renderer.target_ = target;
}

function tearDown() {
  renderer.dispose();
  propertyReplacer.reset();
}

function testBasicMatchingWithHtmlRow() {
  // '<div><div>test</div></div>'
  var row = rendRows[4];
  var token = 'te';
  enableHtmlRendering(renderer);
  var node = renderer.renderRowHtml(row, token);
  var boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 1);
}

function testShouldMatchOnlyOncePerDefaultWithComplexHtmlStrings() {
  // '<div><div>test1</div><div>test2</div></div>'
  var row = rendRows[5];
  var token = 'te';
  enableHtmlRendering(renderer);
  var node = renderer.renderRowHtml(row, token);
  var boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);

  // It should match and render highlighting for the first 'test1' and
  // stop here. This is the default behavior of the renderer.
  assertNumBoldTags(boldTagElArray, 1);
}

function testShouldMatchMultipleTimesWithComplexHtmlStrings() {
  renderer.setHighlightAllTokens(true);

  // '<div><div>test1</div><div>test2</div></div>'
  var row = rendRows[5];
  var token = 'te';
  enableHtmlRendering(renderer);
  var node = renderer.renderRowHtml(row, token);
  var boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);

  // It should match and render highlighting for both 'test1' and 'test2'.
  assertNumBoldTags(boldTagElArray, 2);

  // Try again with a more complex HTML string.
  // '<div>random test
  // string<div>test1</div><div><div>test2</div><div>test3</div></div></div>'
  row = rendRows[6];
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  // It should match 'test', 'test1', 'test2' and 'test3' wherever
  // they are in the DOM tree.
  assertNumBoldTags(boldTagElArray, 4);
}

function testBasicStringTokenHighlightingUsingUniversalMatching() {
  var row = rendRows[0];  // 'Amanda Annie Anderson'
  renderer.setMatchWordBoundary(false);

  // Should highlight first match only.
  var token = 'A';
  var node = renderer.renderRowHtml(row, token);
  var boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 1);
  assertPreviousNodeText(boldTagElArray[0], '');
  assertHighlightedText(boldTagElArray[0], 'A');
  assertLastNodeText(node, 'manda Annie Anderson');

  // Match should be case insensitive, and should match tokens in the
  // middle of words if useWordMatching is turned off ("an" in Amanda).
  var token = 'an';
  var node = renderer.renderRowHtml(row, token);
  var boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 1);
  assertPreviousNodeText(boldTagElArray[0], 'Am');
  assertHighlightedText(boldTagElArray[0], 'an');
  assertLastNodeText(node, 'da Annie Anderson');

  // Should only match on non-empty strings.
  token = '';
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 0);
  assertLastNodeText(node, 'Amanda Annie Anderson');

  // Should not match leading whitespace.
  token = ' an';
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 0);
  assertLastNodeText(node, 'Amanda Annie Anderson');
}

function testBasicStringTokenHighlighting() {
  var row = rendRows[0];  // 'Amanda Annie Anderson'

  // Should highlight first match only.
  var token = 'A';
  var node = renderer.renderRowHtml(row, token);
  var boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 1);
  assertPreviousNodeText(boldTagElArray[0], '');
  assertHighlightedText(boldTagElArray[0], 'A');
  assertLastNodeText(node, 'manda Annie Anderson');

  // Should only match on non-empty strings.
  token = '';
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 0);
  assertLastNodeText(node, 'Amanda Annie Anderson');

  // Match should be case insensitive, and should not match tokens in the
  // middle of words ("an" in Amanda).
  token = 'an';
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 1);
  assertPreviousNodeText(boldTagElArray[0], 'Amanda ');
  assertHighlightedText(boldTagElArray[0], 'An');
  assertLastNodeText(node, 'nie Anderson');

  // Should not match whitespace.
  token = ' ';
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 0);
  assertLastNodeText(node, 'Amanda Annie Anderson');

  // Should not match leading whitespace since all matches are at the start of
  // word boundaries.
  token = ' an';
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 0);
  assertLastNodeText(node, 'Amanda Annie Anderson');

  // Should match trailing whitespace.
  token = 'annie ';
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 1);
  assertPreviousNodeText(boldTagElArray[0], 'Amanda ');
  assertHighlightedText(boldTagElArray[0], 'Annie ');
  assertLastNodeText(node, 'Anderson');

  // Should match across whitespace.
  row = rendRows[2];  // 'Louis D Armstrong'
  token = 'd a';
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 1);
  assertPreviousNodeText(boldTagElArray[0], 'Louis ');
  assertHighlightedText(boldTagElArray[0], 'D A');
  assertLastNodeText(node, 'rmstrong');

  // Should match the last token.
  token = 'aRmStRoNg';
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 1);
  assertPreviousNodeText(boldTagElArray[0], 'Louis D ');
  assertHighlightedText(boldTagElArray[0], 'Armstrong');
  assertLastNodeText(node, '');
}

// The name of this function is fortuitous, in that it gets tested
// last on FF. The lazy regexp on FF is particularly slow, and causes
// the test to take a long time, and sometimes time out when run on forge
// because it triggers the test runner to go back to the event loop...
function testPathologicalInput() {
  // Should not hang on bizarrely long strings
  var row = rendRows[3];  // pathological row
  var token = 'foo';
  var node = renderer.renderRowHtml(row, token);
  var boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 1);
  assertHighlightedText(boldTagElArray[0], 'Foo');
  assert(
      goog.string.startsWith(
          boldTagElArray[0].nextSibling.nodeValue, ' Bar...'));
}

function testBasicArrayTokenHighlighting() {
  var row = rendRows[1];  // 'Frankie Manning'

  // Only the first match in the array should be highlighted.
  var token = ['f', 'm'];
  var node = renderer.renderRowHtml(row, token);
  var boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 1);
  assertPreviousNodeText(boldTagElArray[0], '');
  assertHighlightedText(boldTagElArray[0], 'F');
  assertLastNodeText(node, 'rankie Manning');

  // Only the first match in the array should be highlighted.
  token = ['m', 'f'];
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 1);
  assertPreviousNodeText(boldTagElArray[0], 'Frankie ');
  assertHighlightedText(boldTagElArray[0], 'M');
  assertLastNodeText(node, 'anning');

  // Skip tokens that do not match.
  token = ['asdf', 'f'];
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 1);
  assertPreviousNodeText(boldTagElArray[0], '');
  assertHighlightedText(boldTagElArray[0], 'F');
  assertLastNodeText(node, 'rankie Manning');

  // Highlight nothing if no tokens match.
  token = ['Foo', 'bar', 'baz'];
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 0);
  assertLastNodeText(node, 'Frankie Manning');

  // Empty array should not match.
  token = [];
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 0);
  assertLastNodeText(node, 'Frankie Manning');

  // Empty string in array should not match.
  token = [''];
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 0);
  assertLastNodeText(node, 'Frankie Manning');

  // Whitespace in array should not match.
  token = [' '];
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 0);
  assertLastNodeText(node, 'Frankie Manning');

  // Whitespace entries in array should not match.
  token = [' ', 'man'];
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 1);
  assertPreviousNodeText(boldTagElArray[0], 'Frankie ');
  assertHighlightedText(boldTagElArray[0], 'Man');
  assertLastNodeText(node, 'ning');

  // Whitespace in array entry should match as a whole token.
  row = rendRows[2];  // 'Louis D Armstrong'
  token = ['d arm', 'lou'];
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 1);
  assertPreviousNodeText(boldTagElArray[0], 'Louis ');
  assertHighlightedText(boldTagElArray[0], 'D Arm');
  assertLastNodeText(node, 'strong');
}

function testHighlightAllTokensSingleTokenHighlighting() {
  renderer.setHighlightAllTokens(true);
  var row = rendRows[0];  // 'Amanda Annie Anderson'

  // All matches at the start of the word should be highlighted when
  // highlightAllTokens is set.
  var token = 'a';
  var node = renderer.renderRowHtml(row, token);
  var boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 3);
  assertPreviousNodeText(boldTagElArray[0], '');
  assertHighlightedText(boldTagElArray[0], 'A');
  assertPreviousNodeText(boldTagElArray[1], 'manda ');
  assertHighlightedText(boldTagElArray[1], 'A');
  assertPreviousNodeText(boldTagElArray[2], 'nnie ');
  assertHighlightedText(boldTagElArray[2], 'A');
  assertLastNodeText(node, 'nderson');

  // Should not match on empty string.
  token = '';
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 0);
  assertLastNodeText(node, 'Amanda Annie Anderson');

  // Match should be case insensitive.
  token = 'AN';
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 2);
  assertPreviousNodeText(boldTagElArray[0], 'Amanda ');
  assertHighlightedText(boldTagElArray[0], 'An');
  assertPreviousNodeText(boldTagElArray[1], 'nie ');
  assertHighlightedText(boldTagElArray[1], 'An');
  assertLastNodeText(node, 'derson');

  // Should not match on whitespace.
  token = ' ';
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 0);
  assertLastNodeText(node, 'Amanda Annie Anderson');

  // When highlighting all tokens, should match despite leading whitespace.
  token = '  am';
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 1);
  assertPreviousNodeText(boldTagElArray[0], '');
  assertHighlightedText(boldTagElArray[0], 'Am');
  assertLastNodeText(node, 'anda Annie Anderson');

  // Should match with trailing whitepsace.
  token = 'ann   ';
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 1);
  assertPreviousNodeText(boldTagElArray[0], 'Amanda ');
  assertHighlightedText(boldTagElArray[0], 'Ann');
  assertLastNodeText(node, 'ie Anderson');
}

function testHighlightAllTokensMultipleStringTokenHighlighting() {
  renderer.setHighlightAllTokens(true);
  var row = rendRows[1];  // 'Frankie Manning'

  // Each individual space-separated token should match.
  var token = 'm F';
  var node = renderer.renderRowHtml(row, token);
  var boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 2);
  assertPreviousNodeText(boldTagElArray[0], '');
  assertHighlightedText(boldTagElArray[0], 'F');
  assertPreviousNodeText(boldTagElArray[1], 'rankie ');
  assertHighlightedText(boldTagElArray[1], 'M');
  assertLastNodeText(node, 'anning');
}

function testHighlightAllTokensArrayTokenHighlighting() {
  renderer.setHighlightAllTokens(true);
  var row = rendRows[0];  // 'Amanda Annie Anderson'

  // All tokens in the array should match.
  var token = ['AM', 'AN'];
  var node = renderer.renderRowHtml(row, token);
  var boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 3);
  assertPreviousNodeText(boldTagElArray[0], '');
  assertHighlightedText(boldTagElArray[0], 'Am');
  assertPreviousNodeText(boldTagElArray[1], 'anda ');
  assertHighlightedText(boldTagElArray[1], 'An');
  assertPreviousNodeText(boldTagElArray[2], 'nie ');
  assertHighlightedText(boldTagElArray[2], 'An');
  assertLastNodeText(node, 'derson');

  // Empty array should not match.
  token = [];
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 0);
  assertLastNodeText(node, 'Amanda Annie Anderson');

  // Empty string in array should not match.
  token = [''];
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 0);
  assertLastNodeText(node, 'Amanda Annie Anderson');

  // Whitespace in array should not match.
  token = [' '];
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 0);
  assertLastNodeText(node, 'Amanda Annie Anderson');

  // Empty string entries in array should not match.
  token = ['', 'Ann'];
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 1);
  assertPreviousNodeText(boldTagElArray[0], 'Amanda ');
  assertHighlightedText(boldTagElArray[0], 'Ann');
  assertLastNodeText(node, 'ie Anderson');

  // Whitespace entries in array should not match.
  token = [' ', 'And'];
  node = renderer.renderRowHtml(row, token);
  boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 1);
  assertPreviousNodeText(boldTagElArray[0], 'Amanda Annie ');
  assertHighlightedText(boldTagElArray[0], 'And');
  assertLastNodeText(node, 'erson');

  // Whitespace in array entry should match as a whole token.
  token = ['annie a', 'Am'];
  node = renderer.renderRowHtml(row, token);
  var boldTagElArray = node.getElementsByTagName(goog.dom.TagName.B);
  assertNumBoldTags(boldTagElArray, 2);
  assertPreviousNodeText(boldTagElArray[0], '');
  assertHighlightedText(boldTagElArray[0], 'Am');
  assertPreviousNodeText(boldTagElArray[1], 'anda ');
  assertHighlightedText(boldTagElArray[1], 'Annie A');
  assertLastNodeText(node, 'nderson');
}

function testMenuFadeDuration() {
  renderer.maybeCreateElement_();

  var hideCalled = false;
  var hideAnimCalled = false;
  var showCalled = false;
  var showAnimCalled = false;

  propertyReplacer.set(goog.style, 'setElementShown', function(el, state) {
    if (state) {
      showCalled = true;
    } else {
      hideCalled = true;
    }
  });

  propertyReplacer.set(goog.fx.dom.FadeInAndShow.prototype, 'play', function() {
    showAnimCalled = true;
  });

  propertyReplacer.set(
      goog.fx.dom.FadeOutAndHide.prototype, 'play',
      function() { hideAnimCalled = true; });

  // Default behavior does show/hide but not animations.

  renderer.show();
  assertTrue(showCalled);
  assertFalse(showAnimCalled);

  renderer.dismiss();
  assertTrue(hideCalled);
  assertFalse(hideAnimCalled);

  // But animations can be turned on.

  showCalled = false;
  hideCalled = false;
  renderer.setMenuFadeDuration(100);

  renderer.show();
  assertFalse(showCalled);
  assertTrue(showAnimCalled);

  renderer.dismiss();
  assertFalse(hideCalled);
  assertTrue(hideAnimCalled);
}

function testAriaTags() {
  renderer.maybeCreateElement_();

  assertNotNull(target);
  assertEvaluatesToFalse(
      'The role should be empty.', goog.a11y.aria.getRole(target));
  assertEquals(
      '', goog.a11y.aria.getState(target, goog.a11y.aria.State.HASPOPUP));
  assertEquals(
      '', goog.a11y.aria.getState(
              renderer.getElement(), goog.a11y.aria.State.EXPANDED));
  assertEquals('', goog.a11y.aria.getState(target, goog.a11y.aria.State.OWNS));

  renderer.show();
  assertEquals(
      'true', goog.a11y.aria.getState(target, goog.a11y.aria.State.HASPOPUP));
  assertEquals(
      'true', goog.a11y.aria.getState(target, goog.a11y.aria.State.EXPANDED));
  assertEquals(
      'true', goog.a11y.aria.getState(
                  renderer.getElement(), goog.a11y.aria.State.EXPANDED));
  assertEquals(
      renderer.getElement().id,
      goog.a11y.aria.getState(target, goog.a11y.aria.State.OWNS));

  renderer.dismiss();
  assertEquals(
      'false', goog.a11y.aria.getState(target, goog.a11y.aria.State.HASPOPUP));
  assertEquals(
      'false', goog.a11y.aria.getState(target, goog.a11y.aria.State.EXPANDED));
  assertEquals(
      'false', goog.a11y.aria.getState(
                   renderer.getElement(), goog.a11y.aria.State.EXPANDED));
  assertEquals('', goog.a11y.aria.getState(target, goog.a11y.aria.State.OWNS));
}

function testHiliteRowWithDefaultRenderer() {
  renderer.renderRows(rendRows, '');
  renderer.hiliteRow(2);
  assertEquals(2, renderer.hilitedRow_);
  assertTrue(
      goog.dom.classlist.contains(
          renderer.rowDivs_[2], renderer.activeClassName));
}

function testHiliteRowWithCustomRenderer() {
  goog.dispose(renderer);

  // Use a custom renderer that doesn't put the result divs as direct children
  // of this.element_.
  var customRenderer = {
    render: function(renderer, element, rows, token) {
      // Put all of the results into a results holder div that is a child of
      // this.element_.
      var resultsHolder = goog.dom.createDom(goog.dom.TagName.DIV);
      goog.dom.appendChild(element, resultsHolder);
      for (var i = 0, row; row = rows[i]; ++i) {
        var node = renderer.renderRowHtml(row, token);
        goog.dom.appendChild(resultsHolder, node);
      }
    }
  };
  renderer = new goog.ui.ac.Renderer(null, customRenderer);

  // Make sure we can still highlight the row at position 2 even though
  // this.element_.childNodes contains only a single child.
  renderer.renderRows(rendRows, '');
  renderer.hiliteRow(2);
  assertEquals(2, renderer.hilitedRow_);
  assertTrue(
      goog.dom.classlist.contains(
          renderer.rowDivs_[2], renderer.activeClassName));
}

function testReposition() {
  renderer.renderRows(rendRows, '', target);
  var el = renderer.getElement();
  el.style.position = 'absolute';
  el.style.width = '100px';

  renderer.setAutoPosition(true);
  renderer.redraw();

  var rendererOffset = goog.style.getPageOffset(renderer.getElement());
  var rendererSize = goog.style.getSize(renderer.getElement());
  var targetOffset = goog.style.getPageOffset(target);
  var targetSize = goog.style.getSize(target);

  assertEquals(0 + targetOffset.x, rendererOffset.x);
  assertRoughlyEquals(targetOffset.y + targetSize.height, rendererOffset.y, 1);
}

function testRepositionWithRightAlign() {
  renderer.renderRows(rendRows, '', target);
  var el = renderer.getElement();
  el.style.position = 'absolute';
  el.style.width = '150px';

  renderer.setAutoPosition(true);
  renderer.setRightAlign(true);
  renderer.redraw();

  var rendererOffset = goog.style.getPageOffset(renderer.getElement());
  var rendererSize = goog.style.getSize(renderer.getElement());
  var targetOffset = goog.style.getPageOffset(target);
  var targetSize = goog.style.getSize(target);

  assertRoughlyEquals(
      targetOffset.x + targetSize.width, rendererOffset.x + rendererSize.width,
      1);
  assertRoughlyEquals(targetOffset.y + targetSize.height, rendererOffset.y, 1);
}

function testRepositionResizeHeight() {
  renderer = new goog.ui.ac.Renderer(viewport);
  // Render the first 4 rows from test set.
  renderer.renderRows(rendRows.slice(0, 4), '', viewportTarget);
  renderer.setAutoPosition(true);
  renderer.setShowScrollbarsIfTooLarge(true);

  // Stick a huge row in the dropdown element, to make sure it won't
  // fit in the viewport.
  var hugeRow =
      goog.dom.createDom(goog.dom.TagName.DIV, {style: 'height:1000px'});
  goog.dom.appendChild(renderer.getElement(), hugeRow);

  renderer.reposition();

  var rendererOffset = goog.style.getPageOffset(renderer.getElement());
  var rendererSize = goog.style.getSize(renderer.getElement());
  var viewportOffset = goog.style.getPageOffset(viewport);
  var viewportSize = goog.style.getSize(viewport);

  assertRoughlyEquals(
      viewportOffset.y + viewportSize.height,
      rendererSize.height + rendererOffset.y, 1);

  // Remove the huge row, and make sure that the dropdown element gets shrunk.
  renderer.getElement().removeChild(hugeRow);
  renderer.reposition();

  rendererOffset = goog.style.getPageOffset(renderer.getElement());
  rendererSize = goog.style.getSize(renderer.getElement());
  viewportOffset = goog.style.getPageOffset(viewport);
  viewportSize = goog.style.getSize(viewport);

  assertTrue(
      (rendererSize.height + rendererOffset.y) <
      (viewportOffset.y + viewportSize.height));
}

function testHiliteEvent() {
  renderer.renderRows(rendRows, '');

  var hiliteEventFired = false;
  goog.events.listenOnce(
      renderer, goog.ui.ac.AutoComplete.EventType.ROW_HILITE, function(e) {
        hiliteEventFired = true;
        assertEquals(e.row, rendRows[1].data);
      });
  renderer.hiliteRow(1);
  assertTrue(hiliteEventFired);

  hiliteEventFired = false;
  goog.events.listenOnce(
      renderer, goog.ui.ac.AutoComplete.EventType.ROW_HILITE, function(e) {
        hiliteEventFired = true;
        assertNull(e.row);
      });
  renderer.hiliteRow(rendRows.length);  // i.e. out of bounds.
  assertTrue(hiliteEventFired);
}

// ------- Helper functions -------

// The default rowRenderer will escape any HTML in the row content.
// Activating HTML rendering will allow HTML strings to be rendered to DOM
// instead of being escaped.
function enableHtmlRendering(renderer) {
  renderer.customRenderer_ = {
    renderRow: function(row, token, node) {
      node.innerHTML = row.data.toString();
    }
  };
}

function assertNumBoldTags(boldTagElArray, expectedNum) {
  assertEquals(
      'Incorrect number of bold tags', expectedNum, boldTagElArray.length);
}

function assertPreviousNodeText(boldTag, expectedText) {
  var prevNode = boldTag.previousSibling;
  assertEquals(
      'Expected text before the token does not match', expectedText,
      prevNode.nodeValue);
}

function assertHighlightedText(boldTag, expectedHighlightedText) {
  assertEquals(
      'Incorrect text bolded', expectedHighlightedText, boldTag.innerHTML);
}

function assertLastNodeText(node, expectedText) {
  var lastNode = node.lastChild;
  assertEquals(
      'Incorrect text in the last node', expectedText, lastNode.nodeValue);
}
