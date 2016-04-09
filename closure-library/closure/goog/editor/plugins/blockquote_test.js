// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.editor.plugins.BlockquoteTest');
goog.setTestOnly('goog.editor.plugins.BlockquoteTest');

goog.require('goog.dom');
goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.editor.plugins.Blockquote');
goog.require('goog.testing.editor.FieldMock');
goog.require('goog.testing.editor.TestHelper');
goog.require('goog.testing.jsunit');

var SPLIT = '<span id="split-point"></span>';
var root, helper, field, plugin;

function setUp() {
  root = goog.dom.getElement('root');
  helper = new goog.testing.editor.TestHelper(root);
  field = new goog.testing.editor.FieldMock();

  helper.setUpEditableElement();
}

function tearDown() {
  field.$verify();
  helper.tearDownEditableElement();
}

function createPlugin(requireClassname, opt_paragraphMode) {
  field.queryCommandValue('+defaultTag')
      .$anyTimes()
      .$returns(opt_paragraphMode ? goog.dom.TagName.P : undefined);

  plugin = new goog.editor.plugins.Blockquote(requireClassname);
  plugin.registerFieldObject(field);
  plugin.enable(field);
}

function execCommand() {
  field.$replay();

  // With splitPoint we try to mimic the behavior of EnterHandler's
  // deleteCursorSelection_.
  var splitPoint = goog.dom.getElement('split-point');
  var position = goog.editor.BrowserFeature.HAS_W3C_RANGES ?
      {node: splitPoint.nextSibling, offset: 0} :
      splitPoint;
  if (goog.editor.BrowserFeature.HAS_W3C_RANGES) {
    goog.dom.removeNode(splitPoint);
    goog.dom.Range.createCaret(position.node, 0).select();
  } else {
    goog.dom.Range.createCaret(position, 0).select();
  }

  var result = plugin.execCommand(
      goog.editor.plugins.Blockquote.SPLIT_COMMAND, position);
  if (!goog.editor.BrowserFeature.HAS_W3C_RANGES) {
    goog.dom.removeNode(splitPoint);
  }

  return result;
}

function testSplitBlockquoteDoesNothingWhenNotInBlockquote() {
  root.innerHTML = '<div>Test' + SPLIT + 'ing</div>';

  createPlugin(false);
  assertFalse(execCommand());
  helper.assertHtmlMatches('<div>Testing</div>');
}

function testSplitBlockquoteDoesNothingWhenNotInBlockquoteWithClass() {
  root.innerHTML = '<blockquote>Test' + SPLIT + 'ing</blockquote>';

  createPlugin(true);
  assertFalse(execCommand());
  helper.assertHtmlMatches('<blockquote>Testing</blockquote>');
}

function testSplitBlockquoteInBlockquoteWithoutClass() {
  root.innerHTML = '<blockquote>Test' + SPLIT + 'ing</blockquote>';

  createPlugin(false);
  assertTrue(execCommand());
  helper.assertHtmlMatches(
      '<blockquote>Test</blockquote>' +
      '<div>' + (goog.editor.BrowserFeature.HAS_W3C_RANGES ? '&nbsp;' : '') +
      '</div>' +
      '<blockquote>ing</blockquote>');
}

function testSplitBlockquoteInBlockquoteWithoutClassInParagraphMode() {
  root.innerHTML = '<blockquote>Test' + SPLIT + 'ing</blockquote>';

  createPlugin(false, true);
  assertTrue(execCommand());
  helper.assertHtmlMatches(
      '<blockquote>Test</blockquote>' +
      '<p>' + (goog.editor.BrowserFeature.HAS_W3C_RANGES ? '&nbsp;' : '') +
      '</p>' +
      '<blockquote>ing</blockquote>');
}

function testSplitBlockquoteInBlockquoteWithClass() {
  root.innerHTML =
      '<blockquote class="tr_bq">Test' + SPLIT + 'ing</blockquote>';

  createPlugin(true);
  assertTrue(execCommand());

  helper.assertHtmlMatches(
      '<blockquote class="tr_bq">Test</blockquote>' +
      '<div>' + (goog.editor.BrowserFeature.HAS_W3C_RANGES ? '&nbsp;' : '') +
      '</div>' +
      '<blockquote class="tr_bq">ing</blockquote>');
}

function testSplitBlockquoteInBlockquoteWithClassInParagraphMode() {
  root.innerHTML =
      '<blockquote class="tr_bq">Test' + SPLIT + 'ing</blockquote>';

  createPlugin(true, true);
  assertTrue(execCommand());
  helper.assertHtmlMatches(
      '<blockquote class="tr_bq">Test</blockquote>' +
      '<p>' + (goog.editor.BrowserFeature.HAS_W3C_RANGES ? '&nbsp;' : '') +
      '</p>' +
      '<blockquote class="tr_bq">ing</blockquote>');
}

function testIsSplittableBlockquoteWhenRequiresClassNameToSplit() {
  createPlugin(true);

  var blockquoteWithClassName =
      goog.dom.createDom(goog.dom.TagName.BLOCKQUOTE, 'tr_bq');
  assertTrue(
      'blockquote should be detected as splittable',
      plugin.isSplittableBlockquote(blockquoteWithClassName));

  var blockquoteWithoutClassName =
      goog.dom.createDom(goog.dom.TagName.BLOCKQUOTE, 'foo');
  assertFalse(
      'blockquote should not be detected as splittable',
      plugin.isSplittableBlockquote(blockquoteWithoutClassName));

  var nonBlockquote = goog.dom.createDom(goog.dom.TagName.SPAN, 'tr_bq');
  assertFalse(
      'element should not be detected as splittable',
      plugin.isSplittableBlockquote(nonBlockquote));
}

function testIsSplittableBlockquoteWhenNotRequiresClassNameToSplit() {
  createPlugin(false);

  var blockquoteWithClassName =
      goog.dom.createDom(goog.dom.TagName.BLOCKQUOTE, 'tr_bq');
  assertTrue(
      'blockquote should be detected as splittable',
      plugin.isSplittableBlockquote(blockquoteWithClassName));

  var blockquoteWithoutClassName =
      goog.dom.createDom(goog.dom.TagName.BLOCKQUOTE, 'foo');
  assertTrue(
      'blockquote should be detected as splittable',
      plugin.isSplittableBlockquote(blockquoteWithoutClassName));

  var nonBlockquote = goog.dom.createDom(goog.dom.TagName.SPAN, 'tr_bq');
  assertFalse(
      'element should not be detected as splittable',
      plugin.isSplittableBlockquote(nonBlockquote));
}

function testIsSetupBlockquote() {
  createPlugin(false);

  var blockquoteWithClassName =
      goog.dom.createDom(goog.dom.TagName.BLOCKQUOTE, 'tr_bq');
  assertTrue(
      'blockquote should be detected as setup',
      plugin.isSetupBlockquote(blockquoteWithClassName));

  var blockquoteWithoutClassName =
      goog.dom.createDom(goog.dom.TagName.BLOCKQUOTE, 'foo');
  assertFalse(
      'blockquote should not be detected as setup',
      plugin.isSetupBlockquote(blockquoteWithoutClassName));

  var nonBlockquote = goog.dom.createDom(goog.dom.TagName.SPAN, 'tr_bq');
  assertFalse(
      'element should not be detected as setup',
      plugin.isSetupBlockquote(nonBlockquote));
}

function testIsUnsetupBlockquote() {
  createPlugin(false);

  var blockquoteWithClassName =
      goog.dom.createDom(goog.dom.TagName.BLOCKQUOTE, 'tr_bq');
  assertFalse(
      'blockquote should not be detected as unsetup',
      plugin.isUnsetupBlockquote(blockquoteWithClassName));

  var blockquoteWithoutClassName =
      goog.dom.createDom(goog.dom.TagName.BLOCKQUOTE, 'foo');
  assertTrue(
      'blockquote should be detected as unsetup',
      plugin.isUnsetupBlockquote(blockquoteWithoutClassName));

  var nonBlockquote = goog.dom.createDom(goog.dom.TagName.SPAN, 'tr_bq');
  assertFalse(
      'element should not be detected as unsetup',
      plugin.isUnsetupBlockquote(nonBlockquote));
}
