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

goog.provide('goog.editor.plugins.BasicTextFormatterTest');
goog.setTestOnly('goog.editor.plugins.BasicTextFormatterTest');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.editor.Command');
goog.require('goog.editor.Field');
goog.require('goog.editor.Plugin');
goog.require('goog.editor.plugins.BasicTextFormatter');
goog.require('goog.object');
goog.require('goog.style');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.LooseMock');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.editor.FieldMock');
goog.require('goog.testing.editor.TestHelper');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.mockmatchers');
goog.require('goog.userAgent');

var stubs;

var SAVED_HTML;
var FIELDMOCK;
var FORMATTER;
var ROOT;
var HELPER;
var OPEN_SUB;
var CLOSE_SUB;
var OPEN_SUPER;
var CLOSE_SUPER;
var MOCK_BLOCKQUOTE_STYLE = 'border-left: 1px solid gray;';
var MOCK_GET_BLOCKQUOTE_STYLES = function() {
  return MOCK_BLOCKQUOTE_STYLE;
};

var REAL_FIELD;
var REAL_PLUGIN;

var expectedFailures;

function setUpPage() {
  stubs = new goog.testing.PropertyReplacer();
  SAVED_HTML = goog.dom.getElement('html').innerHTML;
  FIELDMOCK;
  FORMATTER;
  ROOT = goog.dom.getElement('root');
  HELPER;
  OPEN_SUB = goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher('530') ?
      '<span class="Apple-style-span" style="vertical-align: sub;">' :
      '<sub>';
  CLOSE_SUB =
      goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher('530') ?
      '</span>' :
      '</sub>';
  OPEN_SUPER =
      goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher('530') ?
      '<span class="Apple-style-span" style="vertical-align: super;">' :
      '<sup>';
  CLOSE_SUPER =
      goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher('530') ?
      '</span>' :
      '</sup>';
  expectedFailures = new goog.testing.ExpectedFailures();
}

function setUp() {
  FIELDMOCK = new goog.testing.editor.FieldMock();

  FORMATTER = new goog.editor.plugins.BasicTextFormatter();
  FORMATTER.fieldObject = FIELDMOCK;
}

function setUpRealField() {
  REAL_FIELD = new goog.editor.Field('real-field');
  REAL_PLUGIN = new goog.editor.plugins.BasicTextFormatter();
  REAL_FIELD.registerPlugin(REAL_PLUGIN);
  REAL_FIELD.makeEditable();
}

function setUpRealFieldIframe() {
  REAL_FIELD = new goog.editor.Field('iframe');
  FORMATTER = new goog.editor.plugins.BasicTextFormatter();
  REAL_FIELD.registerPlugin(FORMATTER);
  REAL_FIELD.makeEditable();
}

function selectRealField() {
  goog.dom.Range.createFromNodeContents(REAL_FIELD.getElement()).select();
  REAL_FIELD.dispatchSelectionChangeEvent();
}

function tearDown() {
  tearDownFontSizeTests();

  if (REAL_FIELD) {
    REAL_FIELD.makeUneditable();
    REAL_FIELD.dispose();
    REAL_FIELD = null;
  }

  expectedFailures.handleTearDown();
  stubs.reset();

  goog.dom.getElement('html').innerHTML = SAVED_HTML;
}

function setUpListAndBlockquoteTests() {
  var htmlDiv = document.getElementById('html');
  HELPER = new goog.testing.editor.TestHelper(htmlDiv);
  HELPER.setUpEditableElement();

  FIELDMOCK.getElement();
  FIELDMOCK.$anyTimes();
  FIELDMOCK.$returns(htmlDiv);
}

function tearDownHelper() {
  HELPER.tearDownEditableElement();
  HELPER.dispose();
  HELPER = null;
}

function tearDownListAndBlockquoteTests() {
  tearDownHelper();
}

function testIEList() {
  if (goog.userAgent.IE) {
    setUpListAndBlockquoteTests();

    FIELDMOCK.queryCommandValue('rtl').$returns(null);

    FIELDMOCK.$replay();
    var ul = goog.dom.getElement('outerUL');
    goog.dom.Range
        .createFromNodeContents(goog.dom.getFirstElementChild(ul).firstChild)
        .select();
    FORMATTER.fixIELists_();
    assertFalse('Unordered list must not have ordered type', ul.type == '1');
    var ol = goog.dom.getElement('ol');
    ol.type = 'disc';
    goog.dom.Range
        .createFromNodeContents(goog.dom.getFirstElementChild(ul).firstChild)
        .select();
    FORMATTER.fixIELists_();
    assertFalse('Ordered list must not have unordered type', ol.type == 'disc');
    ol.type = '1';
    goog.dom.Range
        .createFromNodeContents(goog.dom.getFirstElementChild(ul).firstChild)
        .select();
    FORMATTER.fixIELists_();
    assertTrue('Ordered list must retain ordered list type', ol.type == '1');
    tearDownListAndBlockquoteTests();
  }
}

function testWebKitList() {
  if (goog.userAgent.WEBKIT) {
    setUpListAndBlockquoteTests();

    FIELDMOCK.queryCommandValue('rtl').$returns(null);

    FIELDMOCK.$replay();
    var ul = document.getElementById('outerUL');
    var html = ul.innerHTML;
    goog.dom.Range.createFromNodeContents(ul).select();

    FORMATTER.fixSafariLists_();
    assertEquals('Contents of UL shouldn\'t change', html, ul.innerHTML);

    ul = document.getElementById('outerUL2');
    goog.dom.Range.createFromNodeContents(ul).select();

    FORMATTER.fixSafariLists_();
    var childULs = ul.getElementsByTagName(goog.dom.TagName.UL);
    assertEquals('UL should have one child UL', 1, childULs.length);
    tearDownListAndBlockquoteTests();
  }
}

function testGeckoListFont() {
  if (goog.userAgent.GECKO) {
    setUpListAndBlockquoteTests();
    FIELDMOCK.queryCommandValue(goog.editor.Command.DEFAULT_TAG)
        .$returns('BR')
        .$times(2);

    FIELDMOCK.$replay();
    var p = goog.dom.getElement('geckolist');
    var font = p.firstChild;
    goog.dom.Range.createFromNodeContents(font).select();
    retVal = FORMATTER.beforeInsertListGecko_();
    assertFalse('Workaround shouldn\'t be applied when not needed', retVal);

    goog.dom.removeChildren(font);
    goog.dom.Range.createFromNodeContents(font).select();
    var retVal = FORMATTER.beforeInsertListGecko_();
    assertTrue('Workaround should be applied when needed', retVal);
    document.execCommand('insertorderedlist', false, true);
    assertTrue(
        'Font should be Courier',
        /courier/i.test(document.queryCommandValue('fontname')));
    tearDownListAndBlockquoteTests();
  }
}

function testSwitchListType() {
  if (!goog.userAgent.WEBKIT) {
    return;
  }
  // Test that we're not seeing https://bugs.webkit.org/show_bug.cgi?id=19539,
  // the type of multi-item lists.
  setUpListAndBlockquoteTests();

  FIELDMOCK.$replay();
  var list = goog.dom.getElement('switchListType');
  var parent = goog.dom.getParentElement(list);

  goog.dom.Range.createFromNodeContents(list).select();
  FORMATTER.execCommandInternal('insertunorderedlist');
  list = goog.dom.getFirstElementChild(parent);
  assertEquals(goog.dom.TagName.UL, list.tagName);
  assertEquals(
      3, goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.LI, null, list)
             .length);

  goog.dom.Range.createFromNodeContents(list).select();
  FORMATTER.execCommandInternal('insertorderedlist');
  list = goog.dom.getFirstElementChild(parent);
  assertEquals(goog.dom.TagName.OL, list.tagName);
  assertEquals(
      3, goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.LI, null, list)
             .length);

  tearDownListAndBlockquoteTests();
}

function testIsSilentCommand() {
  var commands =
      goog.object.getValues(goog.editor.plugins.BasicTextFormatter.COMMAND);
  var silentCommands =
      [goog.editor.plugins.BasicTextFormatter.COMMAND.CREATE_LINK];

  for (var i = 0; i < commands.length; i += 1) {
    var command = commands[i];
    var shouldBeSilent = goog.array.contains(silentCommands, command);
    var isSilent =
        goog.editor.plugins.BasicTextFormatter.prototype.isSilentCommand.call(
            null, command);
    assertEquals(shouldBeSilent, isSilent);
  }
}

function setUpSubSuperTests() {
  goog.dom.setTextContent(ROOT, '12345');
  HELPER = new goog.testing.editor.TestHelper(ROOT);
  HELPER.setUpEditableElement();
}

function tearDownSubSuperTests() {
  tearDownHelper();
}

function testSubscriptRemovesSuperscript() {
  setUpSubSuperTests();
  FIELDMOCK.$replay();

  HELPER.select('12345', 1, '12345', 4);  // Selects '234'.
  FORMATTER.execCommandInternal(
      goog.editor.plugins.BasicTextFormatter.COMMAND.SUPERSCRIPT);
  HELPER.assertHtmlMatches('1' + OPEN_SUPER + '234' + CLOSE_SUPER + '5');
  FORMATTER.execCommandInternal(
      goog.editor.plugins.BasicTextFormatter.COMMAND.SUBSCRIPT);
  HELPER.assertHtmlMatches('1' + OPEN_SUB + '234' + CLOSE_SUB + '5');

  FIELDMOCK.$verify();
  tearDownSubSuperTests();
}

function testSuperscriptRemovesSubscript() {
  setUpSubSuperTests();
  FIELDMOCK.$replay();

  HELPER.select('12345', 1, '12345', 4);  // Selects '234'.
  FORMATTER.execCommandInternal(
      goog.editor.plugins.BasicTextFormatter.COMMAND.SUBSCRIPT);
  HELPER.assertHtmlMatches('1' + OPEN_SUB + '234' + CLOSE_SUB + '5');
  FORMATTER.execCommandInternal(
      goog.editor.plugins.BasicTextFormatter.COMMAND.SUPERSCRIPT);
  HELPER.assertHtmlMatches('1' + OPEN_SUPER + '234' + CLOSE_SUPER + '5');

  FIELDMOCK.$verify();
  tearDownSubSuperTests();
}

function testSubscriptRemovesSuperscriptIntersecting() {
  // Tests: 12345 , sup(23) , sub(34) ==> 1+sup(2)+sub(34)+5
  // This is more complex because the sub and sup calls are made on separate
  // fields which intersect each other and queryCommandValue seems to return
  // false if the command is only applied to part of the field.
  setUpSubSuperTests();
  FIELDMOCK.$replay();

  HELPER.select('12345', 1, '12345', 3);  // Selects '23'.
  FORMATTER.execCommandInternal(
      goog.editor.plugins.BasicTextFormatter.COMMAND.SUPERSCRIPT);
  HELPER.assertHtmlMatches('1' + OPEN_SUPER + '23' + CLOSE_SUPER + '45');
  HELPER.select('23', 1, '45', 1);  // Selects '34'.
  FORMATTER.execCommandInternal(
      goog.editor.plugins.BasicTextFormatter.COMMAND.SUBSCRIPT);
  HELPER.assertHtmlMatches(
      '1' + OPEN_SUPER + '2' + CLOSE_SUPER + OPEN_SUB + '34' + CLOSE_SUB + '5');

  FIELDMOCK.$verify();
  tearDownSubSuperTests();
}

function testSuperscriptRemovesSubscriptIntersecting() {
  // Tests: 12345 , sub(23) , sup(34) ==> 1+sub(2)+sup(34)+5
  setUpSubSuperTests();
  FIELDMOCK.$replay();

  HELPER.select('12345', 1, '12345', 3);  // Selects '23'.
  FORMATTER.execCommandInternal(
      goog.editor.plugins.BasicTextFormatter.COMMAND.SUBSCRIPT);
  HELPER.assertHtmlMatches('1' + OPEN_SUB + '23' + CLOSE_SUB + '45');
  HELPER.select('23', 1, '45', 1);  // Selects '34'.
  FORMATTER.execCommandInternal(
      goog.editor.plugins.BasicTextFormatter.COMMAND.SUPERSCRIPT);
  HELPER.assertHtmlMatches(
      '1' + OPEN_SUB + '2' + CLOSE_SUB + OPEN_SUPER + '34' + CLOSE_SUPER + '5');

  FIELDMOCK.$verify();
  tearDownSubSuperTests();
}

function setUpLinkTests(text, url, isEditable) {
  stubs.set(window, 'prompt', function() { return url; });

  ROOT.innerHTML = text;
  HELPER = new goog.testing.editor.TestHelper(ROOT);
  if (isEditable) {
    HELPER.setUpEditableElement();
    FIELDMOCK
        .execCommand(
            goog.editor.Command.MODAL_LINK_EDITOR,
            goog.testing.mockmatchers.isObject)
        .$returns(undefined);
    FORMATTER.focusField_ = function() {
      throw 'Field should not be re-focused';
    };
  }

  FIELDMOCK.getElement().$anyTimes().$returns(ROOT);

  FIELDMOCK.setModalMode(true);

  FIELDMOCK.isSelectionEditable().$anyTimes().$returns(isEditable);
}

function tearDownLinkTests() {
  tearDownHelper();
}

function testLink() {
  setUpLinkTests('12345', 'http://www.x.com/', true);
  FIELDMOCK.$replay();

  HELPER.select('12345', 3);
  FORMATTER.execCommandInternal(goog.editor.Command.LINK);
  HELPER.assertHtmlMatches(
      goog.editor.BrowserFeature.GETS_STUCK_IN_LINKS ?
          '123<a href="http://www.x.com/">http://www.x.com/</a>&nbsp;45' :
          '123<a href="http://www.x.com/">http://www.x.com/</a>45');

  FIELDMOCK.$verify();
  tearDownLinkTests();
}

function testLinks() {
  var url1 = 'http://google.com/1';
  var url2 = 'http://google.com/2';
  var dialogUrl = 'http://google.com/3';
  var html = '<p>' + url1 + '</p><p>' + url2 + '</p>';
  setUpLinkTests(html, dialogUrl, true);
  FIELDMOCK.$replay();

  HELPER.select(url1, 0, url2, url2.length);
  FORMATTER.execCommandInternal(goog.editor.Command.LINK);
  HELPER.assertHtmlMatches(
      '<p><a href="' + url1 + '">' + url1 + '</a></p><p>' +
      '<a href="' + dialogUrl + '">' +
      (goog.userAgent.EDGE_OR_IE ? dialogUrl : url2) + '</a></p>');
}

function testSelectedLink() {
  setUpLinkTests('12345', 'http://www.x.com/', true);
  FIELDMOCK.$replay();

  HELPER.select('12345', 1, '12345', 4);
  FORMATTER.execCommandInternal(goog.editor.Command.LINK);
  HELPER.assertHtmlMatches(
      goog.editor.BrowserFeature.GETS_STUCK_IN_LINKS ?
          '1<a href="http://www.x.com/">234</a>&nbsp;5' :
          '1<a href="http://www.x.com/">234</a>5');

  FIELDMOCK.$verify();
  tearDownLinkTests();
}

function testCanceledLink() {
  setUpLinkTests('12345', undefined, true);
  FIELDMOCK.$replay();

  HELPER.select('12345', 1, '12345', 4);
  FORMATTER.execCommandInternal(goog.editor.Command.LINK);
  HELPER.assertHtmlMatches('12345');

  assertEquals('234', FIELDMOCK.getRange().getText());

  FIELDMOCK.$verify();
  tearDownLinkTests();
}

function testUnfocusedLink() {
  FIELDMOCK.$reset();
  FIELDMOCK.getEditableDomHelper().$anyTimes().$returns(
      goog.dom.getDomHelper(window.document));
  setUpLinkTests('12345', undefined, false);
  FIELDMOCK.getRange().$anyTimes().$returns(null);
  FIELDMOCK.$replay();

  FORMATTER.execCommandInternal(goog.editor.Command.LINK);
  HELPER.assertHtmlMatches('12345');

  FIELDMOCK.$verify();
  tearDownLinkTests();
}

function testCreateLink() {
  var text = 'some text here';
  var url = 'http://google.com';

  ROOT.innerHTML = text;
  HELPER = new goog.testing.editor.TestHelper(ROOT);
  HELPER.setUpEditableElement();
  FIELDMOCK.isSelectionEditable().$anyTimes().$returns(true);
  FIELDMOCK.getElement().$anyTimes().$returns(ROOT);
  FIELDMOCK.$replay();

  HELPER.select(text, 0, text, text.length);
  FORMATTER.execCommandInternal(
      goog.editor.plugins.BasicTextFormatter.COMMAND.CREATE_LINK,
      FIELDMOCK.getRange(), url);
  HELPER.assertHtmlMatches('<a href="' + url + '">' + text + '</a>');

  FIELDMOCK.$verify();
  tearDownLinkTests();
}

function setUpJustifyTests(html) {
  ROOT.innerHTML = html;
  HELPER = new goog.testing.editor.TestHelper(ROOT);
  HELPER.setUpEditableElement(ROOT);

  FIELDMOCK.getElement();
  FIELDMOCK.$anyTimes();
  FIELDMOCK.$returns(ROOT);

  FIELDMOCK.getElement();
  FIELDMOCK.$anyTimes();
  FIELDMOCK.$returns(ROOT);
}

function tearDownJustifyTests() {
  tearDownHelper();
}

function testJustify() {
  setUpJustifyTests('<div>abc</div><p>def</p><div>ghi</div>');
  FIELDMOCK.$replay();

  HELPER.select('abc', 1, 'def', 1);  // Selects 'bcd'.
  FORMATTER.execCommandInternal(
      goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_CENTER);
  HELPER.assertHtmlMatches(
      '<div style="text-align: center">abc</div>' +
      '<p style="text-align: center">def</p>' +
      '<div>ghi</div>');

  FIELDMOCK.$verify();
  tearDownJustifyTests();
}

function testJustifyInInline() {
  setUpJustifyTests('<div>a<i>b</i>c</div><div>d</div>');
  FIELDMOCK.$replay();

  HELPER.select('b', 0, 'b', 1);  // Selects 'b'.
  FORMATTER.execCommandInternal(
      goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_CENTER);
  HELPER.assertHtmlMatches(
      '<div style="text-align: center">a<i>b</i>c</div><div>d</div>');

  FIELDMOCK.$verify();
  tearDownJustifyTests();
}

function testJustifyInBlock() {
  setUpJustifyTests('<div>a<div>b</div>c</div>');
  FIELDMOCK.$replay();

  HELPER.select('b', 0, 'b', 1);  // Selects 'h'.
  FORMATTER.execCommandInternal(
      goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_CENTER);
  HELPER.assertHtmlMatches(
      '<div>a<div style="text-align: center">b</div>c</div>');

  FIELDMOCK.$verify();
  tearDownJustifyTests();
}

var isFontSizeTest = false;
var defaultFontSizeMap;

function setUpFontSizeTests() {
  isFontSizeTest = true;
  ROOT.innerHTML = '1<span style="font-size:2px">23</span>4' +
      '<span style="font-size:5px; white-space:pre">56</span>7';
  HELPER = new goog.testing.editor.TestHelper(ROOT);
  HELPER.setUpEditableElement();
  FIELDMOCK.getElement().$returns(ROOT).$anyTimes();

  // Map representing the sizes of the text in the HTML snippet used in these
  // tests. The key is the exact text content of each text node, and the value
  // is the initial size of the font in pixels. Since tests may cause a text
  // node to be split in two, this also contains keys that initially don't
  // match any text node, but may match one later if an existing node is
  // split. The value for these keys is null, signifying no text node should
  // exist with that content.
  defaultFontSizeMap = {
    '1': 16,
    '2': null,
    '23': 2,
    '3': null,
    '4': 16,
    '5': null,
    '56': 5,
    '6': null,
    '7': 16
  };
  assertFontSizes('Assertion failed on default font sizes!', {});
}

function tearDownFontSizeTests() {
  if (isFontSizeTest) {
    tearDownHelper();
    isFontSizeTest = false;
  }
}


/**
 * Asserts that the text nodes set up by setUpFontSizeTests() have had their
 * font sizes changed as described by sizeChangesMap.
 * @param {string} msg Assertion error message.
 * @param {Object<string,?number>} sizeChangesMap Maps the text content
 *     of a text node to be measured to its expected font size in pixels, or
 *     null if that text node should not be present in the document (i.e.
 *     because it was split into two). Only the text nodes that have changed
 *     from their default need to be specified.
 */
function assertFontSizes(msg, sizeChangesMap) {
  goog.object.extend(defaultFontSizeMap, sizeChangesMap);
  for (var k in defaultFontSizeMap) {
    var node = HELPER.findTextNode(k);
    var expected = defaultFontSizeMap[k];
    if (expected) {
      assertNotNull(msg + ' [couldn\'t find text node "' + k + '"]', node);
      assertEquals(
          msg + ' [incorrect font size for "' + k + '"]', expected,
          goog.style.getFontSize(node.parentNode));
    } else {
      assertNull(msg + ' [unexpected text node "' + k + '"]', node);
    }
  }
}


/**
 * Regression test for {@bug 1286408}. Tests that when you change the font
 * size of a selection, any font size styles that were nested inside are
 * removed.
 */
function testFontSizeOverridesStyleAttr() {
  setUpFontSizeTests();
  FIELDMOCK.$replay();

  HELPER.select('1', 0, '4', 1);  // Selects 1234.
  FORMATTER.execCommandInternal(
      goog.editor.plugins.BasicTextFormatter.COMMAND.FONT_SIZE, 6);

  assertFontSizes(
      'New font size should override existing font size',
      {'1': 32, '23': 32, '4': 32});

  if (goog.editor.BrowserFeature.DOESNT_OVERRIDE_FONT_SIZE_IN_STYLE_ATTR) {
    var span = HELPER.findTextNode('23').parentNode;
    assertFalse(
        'Style attribute should be gone',
        span.getAttributeNode('style') != null &&
            span.getAttributeNode('style').specified);
  }

  FIELDMOCK.$verify();
}


/**
 * Make sure the style stripping works when the selection starts and stops in
 * different nodes that both contain font size styles.
 */
function testFontSizeOverridesStyleAttrMultiNode() {
  setUpFontSizeTests();
  FIELDMOCK.$replay();

  HELPER.select('23', 0, '56', 2);  // Selects 23456.
  FORMATTER.execCommandInternal(
      goog.editor.plugins.BasicTextFormatter.COMMAND.FONT_SIZE, 6);
  var span = HELPER.findTextNode('23').parentNode;
  var span2 = HELPER.findTextNode('56').parentNode;

  assertFontSizes(
      'New font size should override existing font size in all spans',
      {'23': 32, '4': 32, '56': 32});
  var whiteSpace = goog.userAgent.IE ?
      goog.style.getCascadedStyle(span2, 'whiteSpace') :
      goog.style.getComputedStyle(span2, 'whiteSpace');
  assertEquals(
      'Whitespace style in last span should have been left', 'pre', whiteSpace);

  if (goog.editor.BrowserFeature.DOESNT_OVERRIDE_FONT_SIZE_IN_STYLE_ATTR) {
    assertFalse(
        'Style attribute should be gone from first span',
        span.getAttributeNode('style') != null &&
            span.getAttributeNode('style').specified);
    assertTrue(
        'Style attribute should not be gone from last span',
        span2.getAttributeNode('style').specified);
  }

  FIELDMOCK.$verify();
}


/**
 * Makes sure the font size style is not removed when only a part of the
 * element with font size style is selected during the font size command.
 */
function testFontSizeDoesntOverrideStyleAttr() {
  setUpFontSizeTests();
  FIELDMOCK.$replay();

  HELPER.select('23', 1, '4', 1);  // Selects 34 (half of span with font size).
  FORMATTER.execCommandInternal(
      goog.editor.plugins.BasicTextFormatter.COMMAND.FONT_SIZE, 6);

  assertFontSizes(
      'New font size shouldn\'t override existing font size before selection',
      {'2': 2, '23': null, '3': 32, '4': 32});

  FIELDMOCK.$verify();
}


/**
 * Makes sure the font size style is not removed when only a part of the
 * element with font size style is selected during the font size command, but
 * is removed for another element that is fully selected.
 */
function testFontSizeDoesntOverrideStyleAttrMultiNode() {
  setUpFontSizeTests();
  FIELDMOCK.$replay();

  HELPER.select('23', 1, '56', 2);  // Selects 3456.
  FORMATTER.execCommandInternal(
      goog.editor.plugins.BasicTextFormatter.COMMAND.FONT_SIZE, 6);

  assertFontSizes(
      'New font size shouldn\'t override existing font size before ' +
          'selection, but still override existing font size in last span',
      {'2': 2, '23': null, '3': 32, '4': 32, '56': 32});

  FIELDMOCK.$verify();
}


/**
 * Helper to make sure the precondition that executing the font size command
 * wraps the content in font tags instead of modifying the style attribute is
 * maintained by the browser even if the selection is already text that is
 * wrapped in a tag with a font size style. We test this with several
 * permutations of how the selection looks: selecting the text in the text
 * node, selecting the whole text node as a unit, or selecting the whole span
 * node as a unit. Sometimes the browser wraps the text node with the font
 * tag, sometimes it wraps the span with the font tag. Either one is ok as
 * long as a font tag is actually being used instead of just modifying the
 * span's style, because our fix for {@bug 1286408} would remove that style.
 * @param {function()} doSelect Function to select the "23" text in the test
 *     content.
 */
function doTestFontSizeStyledSpan(doSelect) {
  // Make sure no new browsers start getting this bad behavior. If they do,
  // this test will unexpectedly pass.
  expectedFailures.expectFailureFor(
      !goog.editor.BrowserFeature.DOESNT_OVERRIDE_FONT_SIZE_IN_STYLE_ATTR);

  try {
    setUpFontSizeTests();
    FIELDMOCK.$replay();

    doSelect();
    FORMATTER.execCommandInternal(
        goog.editor.plugins.BasicTextFormatter.COMMAND.FONT_SIZE, 7);
    var parentNode = HELPER.findTextNode('23').parentNode;
    var grandparentNode = parentNode.parentNode;
    var fontNode = goog.dom.getElementsByTagNameAndClass(
        goog.dom.TagName.FONT, undefined, ROOT)[0];
    var spanNode = goog.dom.getElementsByTagNameAndClass(
        goog.dom.TagName.SPAN, undefined, ROOT)[0];
    assertTrue(
        'A font tag should have been added either outside or inside' +
            ' the existing span',
        parentNode == spanNode && grandparentNode == fontNode ||
            parentNode == fontNode && grandparentNode == spanNode);

    FIELDMOCK.$verify();
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

function testFontSizeStyledSpanSelectingText() {
  doTestFontSizeStyledSpan(function() { HELPER.select('23', 0, '23', 2); });
}

function testFontSizeStyledSpanSelectingTextNode() {
  doTestFontSizeStyledSpan(function() {
    var textNode = HELPER.findTextNode('23');
    HELPER.select(textNode.parentNode, 0, textNode.parentNode, 1);
  });
}

function testFontSizeStyledSpanSelectingSpanNode() {
  doTestFontSizeStyledSpan(function() {
    var spanNode = HELPER.findTextNode('23').parentNode;
    HELPER.select(spanNode.parentNode, 1, spanNode.parentNode, 2);
  });
}

function setUpIframeField(content) {
  var ifr = document.getElementById('iframe');
  var body = ifr.contentWindow.document.body;
  body.innerHTML = content;

  HELPER = new goog.testing.editor.TestHelper(body);
  HELPER.setUpEditableElement();
  FIELDMOCK = new goog.testing.editor.FieldMock(ifr.contentWindow);
  FIELDMOCK.getElement();
  FIELDMOCK.$anyTimes();
  FIELDMOCK.$returns(body);
  FIELDMOCK.queryCommandValue('rtl');
  FIELDMOCK.$anyTimes();
  FIELDMOCK.$returns(null);
  FORMATTER.fieldObject = FIELDMOCK;
}

function tearDownIframeField() {
  tearDownHelper();
}

function setUpConvertBreaksToDivTests() {
  ROOT.innerHTML = '<p>paragraph</p>one<br id="br1">two<br><br><br>three';
  HELPER = new goog.testing.editor.TestHelper(ROOT);
  HELPER.setUpEditableElement();

  FIELDMOCK.getElement();
  FIELDMOCK.$anyTimes();
  FIELDMOCK.$returns(ROOT);
}

function tearDownConvertBreaksToDivTests() {
  tearDownHelper();
}


/** @bug 1414941 */
function testConvertBreaksToDivsKeepsP() {
  if (goog.editor.BrowserFeature.CAN_LISTIFY_BR) {
    return;
  }
  setUpConvertBreaksToDivTests();
  FIELDMOCK.$replay();

  HELPER.select('three', 0);
  FORMATTER.convertBreaksToDivs_();
  assertEquals(
      'There should still be a <p> tag', 1,
      FIELDMOCK.getElement().getElementsByTagName(goog.dom.TagName.P).length);
  var html = FIELDMOCK.getElement().innerHTML.toLowerCase();
  assertNotBadBrElements(html);
  assertNotContains(
      'There should not be empty <div> elements', '<div><\/div>', html);

  FIELDMOCK.$verify();
  tearDownConvertBreaksToDivTests();
}


/**
* @bug 1414937
* @bug 934535
*/
function testConvertBreaksToDivsDoesntCollapseBR() {
  if (goog.editor.BrowserFeature.CAN_LISTIFY_BR) {
    return;
  }
  setUpConvertBreaksToDivTests();
  FIELDMOCK.$replay();

  HELPER.select('three', 0);
  FORMATTER.convertBreaksToDivs_();
  var html = FIELDMOCK.getElement().innerHTML.toLowerCase();
  assertNotBadBrElements(html);
  assertNotContains(
      'There should not be empty <div> elements', '<div><\/div>', html);
  if (goog.userAgent.IE) {
    // <div><br></div> misbehaves in IE
    assertNotContains(
        '<br> should not be used to prevent <div> from collapsing',
        '<div><br><\/div>', html);
  }

  FIELDMOCK.$verify();
  tearDownConvertBreaksToDivTests();
}

function testConvertBreaksToDivsSelection() {
  if (goog.editor.BrowserFeature.CAN_LISTIFY_BR) {
    return;
  }
  setUpConvertBreaksToDivTests();
  FIELDMOCK.$replay();

  HELPER.select('two', 1, 'three', 3);
  var before = FIELDMOCK.getRange().getText().replace(/\s/g, '');
  FORMATTER.convertBreaksToDivs_();
  assertEquals(
      'Selection must not be changed', before,
      FIELDMOCK.getRange().getText().replace(/\s/g, ''));

  FIELDMOCK.$verify();
  tearDownConvertBreaksToDivTests();
}


/** @bug 1414937 */
function testConvertBreaksToDivsInsertList() {
  setUpConvertBreaksToDivTests();
  FIELDMOCK.$replay();

  HELPER.select('three', 0);
  FORMATTER.execCommandInternal('insertorderedlist');
  assertTrue(
      'Ordered list must be inserted',
      FIELDMOCK.getEditableDomHelper().getDocument().queryCommandState(
          'insertorderedlist'));
  tearDownConvertBreaksToDivTests();
}


/**
 * Regression test for {@bug 1939883}, where if a br has an id, it causes
 * the convert br code to throw a js error. This goes a step further and
 * ensures that the id is preserved in the resulting div element.
 */
function testConvertBreaksToDivsKeepsId() {
  if (goog.editor.BrowserFeature.CAN_LISTIFY_BR) {
    return;
  }
  setUpConvertBreaksToDivTests();
  FIELDMOCK.$replay();

  HELPER.select('one', 0, 'two', 0);
  FORMATTER.convertBreaksToDivs_();
  var html = FIELDMOCK.getElement().innerHTML.toLowerCase();
  assertNotBadBrElements(html);
  var idBr = document.getElementById('br1');
  assertNotNull('There should still be a tag with id="br1"', idBr);
  assertEquals(
      'The tag with id="br1" should be a <div> now', goog.dom.TagName.DIV,
      idBr.tagName);
  assertNull(
      'There should not be any tag with id="temp_br"',
      document.getElementById('temp_br'));

  FIELDMOCK.$verify();
  tearDownConvertBreaksToDivTests();
}


/**
 * @bug 2420054
 */
var JUSTIFICATION_COMMANDS = [
  goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_LEFT,
  goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_RIGHT,
  goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_CENTER,
  goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_FULL
];
function doTestIsJustification(command) {
  setUpRealField();
  REAL_FIELD.setHtml(false, 'foo');
  selectRealField();
  REAL_FIELD.execCommand(command);

  for (var i = 0; i < JUSTIFICATION_COMMANDS.length; i++) {
    if (JUSTIFICATION_COMMANDS[i] == command) {
      assertTrue(
          'queryCommandValue(' + JUSTIFICATION_COMMANDS[i] +
              ') should be true after execCommand(' + command + ')',
          REAL_FIELD.queryCommandValue(JUSTIFICATION_COMMANDS[i]));
    } else {
      assertFalse(
          'queryCommandValue(' + JUSTIFICATION_COMMANDS[i] +
              ') should be false after execCommand(' + command + ')',
          REAL_FIELD.queryCommandValue(JUSTIFICATION_COMMANDS[i]));
    }
  }
}
function testIsJustificationLeft() {
  doTestIsJustification(
      goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_LEFT);
}
function testIsJustificationRight() {
  doTestIsJustification(
      goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_RIGHT);
}
function testIsJustificationCenter() {
  doTestIsJustification(
      goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_CENTER);
}
function testIsJustificationFull() {
  doTestIsJustification(
      goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_FULL);
}


/**
 * Regression test for {@bug 1414813}, where all 3 justification buttons are
 * considered "on" when you first tab into the editable field. In this
 * situation, when lorem ipsum is the only node in the editable field iframe
 * body, mockField.getRange() returns an empty range.
 */
function testIsJustificationEmptySelection() {
  var mockField = new goog.testing.LooseMock(goog.editor.Field);

  mockField.getRange();
  mockField.$anyTimes();
  mockField.$returns(null);
  mockField.getPluginByClassId('Bidi');
  mockField.$anyTimes();
  mockField.$returns(null);
  FORMATTER.fieldObject = mockField;

  mockField.$replay();

  assertFalse(
      'Empty selection should not be justified',
      FORMATTER.isJustification_(
          goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_CENTER));
  assertFalse(
      'Empty selection should not be justified',
      FORMATTER.isJustification_(
          goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_FULL));
  assertFalse(
      'Empty selection should not be justified',
      FORMATTER.isJustification_(
          goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_RIGHT));
  assertFalse(
      'Empty selection should not be justified',
      FORMATTER.isJustification_(
          goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_LEFT));

  mockField.$verify();
}

function testIsJustificationSimple1() {
  setUpRealField();
  REAL_FIELD.setHtml(false, '<div align="right">foo</div>');
  selectRealField();

  assertFalse(
      REAL_FIELD.queryCommandValue(
          goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_LEFT));
  assertTrue(
      REAL_FIELD.queryCommandValue(
          goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_RIGHT));
}

function testIsJustificationSimple2() {
  setUpRealField();
  REAL_FIELD.setHtml(false, '<div style="text-align: right;">foo</div>');
  selectRealField();

  assertFalse(
      REAL_FIELD.queryCommandValue(
          goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_LEFT));
  assertTrue(
      REAL_FIELD.queryCommandValue(
          goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_RIGHT));
}

function testIsJustificationComplete1() {
  setUpRealField();
  REAL_FIELD.setHtml(
      false, '<div align="left">a</div><div align="right">b</div>');
  selectRealField();

  assertFalse(
      REAL_FIELD.queryCommandValue(
          goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_LEFT));
  assertFalse(
      REAL_FIELD.queryCommandValue(
          goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_RIGHT));
}

function testIsJustificationComplete2() {
  setUpRealField();
  REAL_FIELD.setHtml(
      false, '<div align="left">a</div><div align="left">b</div>');
  selectRealField();

  assertTrue(
      REAL_FIELD.queryCommandValue(
          goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_LEFT));
  assertFalse(
      REAL_FIELD.queryCommandValue(
          goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_RIGHT));
}

function testIsJustificationComplete3() {
  setUpRealField();
  REAL_FIELD.setHtml(
      false, '<div align="right">a</div><div align="right">b</div>');
  selectRealField();

  assertFalse(
      REAL_FIELD.queryCommandValue(
          goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_LEFT));
  assertTrue(
      REAL_FIELD.queryCommandValue(
          goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_RIGHT));
}

function testIsJustificationComplete4() {
  setUpRealField();
  REAL_FIELD.setHtml(
      false, '<div align="right"><div align="left">a</div></div>' +
          '<div align="right">b</div>');
  selectRealField();

  assertFalse(
      REAL_FIELD.queryCommandValue(
          goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_LEFT));
  assertTrue(
      REAL_FIELD.queryCommandValue(
          goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_RIGHT));
}

function testIsJustificationComplete5() {
  setUpRealField();
  REAL_FIELD.setHtml(
      false, '<div align="right">a</div>b' +
          '<div align="right">c</div>');
  selectRealField();

  assertFalse(
      REAL_FIELD.queryCommandValue(
          goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_LEFT));
  assertFalse(
      REAL_FIELD.queryCommandValue(
          goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_RIGHT));
}


/** @bug 2472589 */
function doTestIsJustificationPInDiv(useCss, align, command) {
  setUpRealField();
  var html = '<div ' + (useCss ? 'style="text-align:' : 'align="') + align +
      '"><p>foo</p></div>';

  REAL_FIELD.setHtml(false, html);
  selectRealField();
  assertTrue(
      'P inside ' + align + ' aligned' + (useCss ? ' (using CSS)' : '') +
          ' DIV should be considered ' + align + ' aligned',
      REAL_FIELD.queryCommandValue(command));
}
function testIsJustificationPInDivLeft() {
  doTestIsJustificationPInDiv(
      false, 'left',
      goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_LEFT);
}
function testIsJustificationPInDivRight() {
  doTestIsJustificationPInDiv(
      false, 'right',
      goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_RIGHT);
}
function testIsJustificationPInDivCenter() {
  doTestIsJustificationPInDiv(
      false, 'center',
      goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_CENTER);
}
function testIsJustificationPInDivJustify() {
  doTestIsJustificationPInDiv(
      false, 'justify',
      goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_FULL);
}
function testIsJustificationPInDivLeftCss() {
  doTestIsJustificationPInDiv(
      true, 'left',
      goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_LEFT);
}
function testIsJustificationPInDivRightCss() {
  doTestIsJustificationPInDiv(
      true, 'right',
      goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_RIGHT);
}
function testIsJustificationPInDivCenterCss() {
  doTestIsJustificationPInDiv(
      true, 'center',
      goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_CENTER);
}
function testIsJustificationPInDivJustifyCss() {
  doTestIsJustificationPInDiv(
      true, 'justify',
      goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_FULL);
}


function testPrepareContent() {
  setUpRealField();
  assertPreparedContents('\n', '\n');

  if (goog.editor.BrowserFeature.COLLAPSES_EMPTY_NODES) {
    assertPreparedContents(
        "&nbsp;<script>alert('hi')<" + '/script>',
        "<script>alert('hi')<" + '/script>');
  } else {
    assertNotPreparedContents("<script>alert('hi')<" + '/script>');
  }

  if (goog.editor.BrowserFeature.CONVERT_TO_B_AND_I_TAGS) {
    assertPreparedContents(
        '<b id=\'foo\'>hi</b>', '<strong id=\'foo\'>hi</strong>');
    assertPreparedContents('<i>hi</i>', '<em>hi</em>');
    assertNotPreparedContents('<embed>');
  } else {
    assertNotPreparedContents('<em>hi</em>');
    assertNotPreparedContents('<strong id=\'foo\'>hi</strong>');
  }
}

function testScrubImagesRemovesCustomAttributes() {
  var fieldElem = goog.dom.getElement('real-field');
  goog.dom.removeChildren(fieldElem);
  var attrs = {
    'src': 'http://www.google.com/foo.jpg',
    'tabIndex': '0',
    'tabIndexSet': '0'
  };
  attrs[goog.HASH_CODE_PROPERTY_] = '0';
  goog.dom.appendChild(
      fieldElem, goog.dom.createDom(goog.dom.TagName.IMG, attrs));

  setUpRealField();

  var html = REAL_FIELD.getCleanContents();
  assert(
      'Images must not have forbidden attributes: ' + html,
      -1 == html.indexOf('tabIndex') && -1 == html.indexOf('closure'));
  assert(
      'Image URLs must not be made relative by default: ' + html,
      -1 != html.indexOf('/foo.jpg'));
}

function testGeckoSelectionChange() {
  if (!goog.userAgent.GECKO || !goog.userAgent.isVersionOrHigher('1.9')) {
    return;
  }

  setUpRealFieldIframe();
  // Use native selection for this test because goog.dom.Range will
  // change selections of <br>
  var ifr = document.getElementById('iframe');
  ifr.contentWindow.document.body.innerHTML = 'hello<br id="br1"><br id="br2">';
  var body = ifr.contentWindow.document.body;
  var range = REAL_FIELD.getRange();
  var browserRange = range.getBrowserRangeObject();
  browserRange.setStart(body, 2);
  browserRange.setEnd(body, 2);
  FORMATTER.applyExecCommandGeckoFixes_('formatblock');
  var updatedRange = REAL_FIELD.getRange().getBrowserRangeObject();
  assertEquals(
      'Range should have been updated to deep range', 'br2',
      updatedRange.startContainer.id);
  assertEquals(
      'Range should have been updated to deep range', 0,
      updatedRange.startOffset);
}

function testIEExecCommandFixes() {
  if (!goog.userAgent.IE) {
    return;
  }

  setUpRealField();
  REAL_FIELD.setHtml(false, '<blockquote>hi</blockquote>');
  goog.dom.Range.createFromNodeContents(REAL_FIELD.getElement()).select();

  var nodes = REAL_PLUGIN.applyExecCommandIEFixes_('insertOrderedList');
  if (goog.userAgent.isVersionOrHigher('9')) {
    assertHTMLEquals(
        '<blockquote>hi<div style="height:0px"></div></blockquote>',
        REAL_FIELD.getCleanContents());
  } else {
    assertHTMLEquals(
        '<blockquote>hi <div style="height:0px"></div></blockquote>',
        REAL_FIELD.getCleanContents());
  }
}


/**
 * Assert that the prepared contents matches the expected.
 */
function assertPreparedContents(expected, original) {
  assertEquals(
      expected, REAL_FIELD.reduceOp_(
                    goog.editor.Plugin.Op.PREPARE_CONTENTS_HTML, original));
}


/**
 * Assert that sanitization doesn't affect the given text.
 */
function assertNotPreparedContents(text) {
  assertPreparedContents(text, text);
}


/**
 * Assert that only BR elements expected to persist after convertBreaksToDivs_
 * are in the HTML.
 */
function assertNotBadBrElements(html) {
  if (goog.userAgent.IE) {
    assertNotContains('There should not be <br> elements', '<br', html);
  } else {
    assertFalse(
        'There should not be <br> elements, except ones to prevent ' +
            '<div>s from collapsing' + html,
        /(?!<div>)<br>(?!<\/div>)/.test(html));
  }
}
