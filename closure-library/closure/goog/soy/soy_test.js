// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.soyTest');
goog.setTestOnly('goog.soyTest');

goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.functions');
goog.require('goog.soy');
/** @suppress {extraRequire} */
goog.require('goog.soy.testHelper');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');

var stubs;

function setUp() {
  stubs = new goog.testing.PropertyReplacer();
}

function tearDown() {
  stubs.reset();
}

function testRenderElement() {
  var testDiv = goog.dom.createElement(goog.dom.TagName.DIV);
  goog.soy.renderElement(testDiv, example.multiRootTemplate, {name: 'Boo'});
  assertEquals('<div>Hello</div><div>Boo</div>', elementToInnerHtml(testDiv));
}


function testRenderElementWithNoTemplateData() {
  var testDiv = goog.dom.createElement(goog.dom.TagName.DIV);
  goog.soy.renderElement(testDiv, example.noDataTemplate);
  assertEquals('<div>Hello</div>', elementToInnerHtml(testDiv));
}


function testRenderAsFragmentTextNode() {
  var fragment = goog.soy.renderAsFragment(
      example.textNodeTemplate, {name: 'Boo'});
  assertEquals(goog.dom.NodeType.TEXT, fragment.nodeType);
  assertEquals('Boo', fragmentToHtml(fragment));
}


function testRenderAsFragmentInjectedData() {
  var fragment = goog.soy.renderAsFragment(example.injectedDataTemplate,
      {name: 'Boo'}, {name: 'ijBoo'});
  assertEquals(goog.dom.NodeType.TEXT, fragment.nodeType);
  assertEquals('BooijBoo', fragmentToHtml(fragment));
}


function testRenderAsFragmentSingleRoot() {
  var fragment = goog.soy.renderAsFragment(
      example.singleRootTemplate, {name: 'Boo'});
  assertEquals(goog.dom.NodeType.ELEMENT, fragment.nodeType);
  assertEquals(goog.dom.TagName.SPAN, fragment.tagName);
  assertEquals('Boo', fragment.innerHTML);
}


function testRenderAsFragmentMultiRoot() {
  var fragment = goog.soy.renderAsFragment(
      example.multiRootTemplate, {name: 'Boo'});
  assertEquals(goog.dom.NodeType.DOCUMENT_FRAGMENT, fragment.nodeType);
  assertEquals('<div>Hello</div><div>Boo</div>', fragmentToHtml(fragment));
}


function testRenderAsFragmentNoData() {
  var fragment = goog.soy.renderAsFragment(example.noDataTemplate);
  assertEquals(goog.dom.NodeType.ELEMENT, fragment.nodeType);
  assertEquals('<div>Hello</div>', fragmentToHtml(fragment));
}


function testRenderAsElementTextNode() {
  var elem = goog.soy.renderAsElement(example.textNodeTemplate, {name: 'Boo'});
  assertEquals(goog.dom.NodeType.ELEMENT, elem.nodeType);
  assertEquals(goog.dom.TagName.DIV, elem.tagName);
  assertEquals('Boo', elementToInnerHtml(elem));
}

function testRenderAsElementInjectedData() {
  var elem = goog.soy.renderAsElement(example.injectedDataTemplate,
      {name: 'Boo'}, {name: 'ijBoo'});
  assertEquals(goog.dom.NodeType.ELEMENT, elem.nodeType);
  assertEquals(goog.dom.TagName.DIV, elem.tagName);
  assertEquals('BooijBoo', elementToInnerHtml(elem));
}


function testRenderAsElementSingleRoot() {
  var elem = goog.soy.renderAsElement(
      example.singleRootTemplate, {name: 'Boo'});
  assertEquals(goog.dom.NodeType.ELEMENT, elem.nodeType);
  assertEquals(goog.dom.TagName.SPAN, elem.tagName);
  assertEquals('Boo', elementToInnerHtml(elem));
}


function testRenderAsElementMultiRoot() {
  var elem = goog.soy.renderAsElement(example.multiRootTemplate, {name: 'Boo'});
  assertEquals(goog.dom.NodeType.ELEMENT, elem.nodeType);
  assertEquals(goog.dom.TagName.DIV, elem.tagName);
  assertEquals('<div>Hello</div><div>Boo</div>', elementToInnerHtml(elem));
}

function testRenderAsElementWithNoData() {
  var elem = goog.soy.renderAsElement(example.noDataTemplate);
  assertEquals('Hello', elementToInnerHtml(elem));
}


/**
 * Asserts that the function throws an error for unsafe templates.
 * @param {Function} function Callback to test.
 */
function assertUnsafeTemplateOutputErrorThrown(func) {
  stubs.set(goog.asserts, 'ENABLE_ASSERTS', true);
  assertContains('Soy template output is unsafe for use as HTML',
      assertThrows(func).message);
  stubs.set(goog.asserts, 'ENABLE_ASSERTS', false);
  assertEquals('zSoyz', func());
}

function testAllowButEscapeUnsanitizedText() {
  var div = goog.dom.createElement(goog.dom.TagName.DIV);
  goog.soy.renderElement(div, example.unsanitizedTextTemplate);
  assertEquals('I &lt;3 Puppies &amp; Kittens', div.innerHTML);
  var fragment = goog.soy.renderAsFragment(example.unsanitizedTextTemplate);
  assertEquals('I <3 Puppies & Kittens', fragment.nodeValue);
  assertEquals('I &lt;3 Puppies &amp; Kittens',
      goog.soy.renderAsElement(example.unsanitizedTextTemplate).innerHTML);
}

function testRejectSanitizedCss() {
  assertUnsafeTemplateOutputErrorThrown(function() {
    goog.soy.renderAsElement(example.sanitizedCssTemplate);
  });
}

function testRejectSanitizedCss() {
  assertUnsafeTemplateOutputErrorThrown(function() {
    return goog.soy.renderAsElement(
        example.templateSpoofingSanitizedContentString).innerHTML;
  });
}

function testRejectStringTemplatesWhenModeIsSet() {
  stubs.set(goog.soy, 'REQUIRE_STRICT_AUTOESCAPE', true);
  assertUnsafeTemplateOutputErrorThrown(function() {
    return goog.soy.renderAsElement(example.noDataTemplate).innerHTML;
  });
}

function testAcceptSanitizedHtml() {
  assertEquals('Hello World', goog.dom.getTextContent(
      goog.soy.renderAsElement(example.sanitizedHtmlTemplate)));
}

function testRejectSanitizedHtmlAttributes() {
  // Attributes context has nothing to do with html.
  assertUnsafeTemplateOutputErrorThrown(function() {
    return goog.dom.getTextContent(
        goog.soy.renderAsElement(example.sanitizedHtmlAttributesTemplate));
  });
}

function testAcceptNonObject() {
  // Some templates, or things that spoof templates in unit tests, might return
  // non-strings in unusual cases.
  assertEquals('null', goog.dom.getTextContent(
      goog.soy.renderAsElement(goog.functions.constant(null))));
}

function testDebugAssertionWithBadFirstTag() {
  try {
    goog.soy.renderAsElement(example.tableRowTemplate);
    // Expect no exception in production code.
    assert(!goog.DEBUG);
  } catch (e) {
    // Expect exception in debug code.
    assert(goog.DEBUG);
    // Make sure to let the developer know which tag caused the problem.
    assertContains('<tr>', e.message);
  }

  try {
    goog.soy.renderAsFragment(example.tableRowTemplate);
    // Expect no exception in production code.
    assert(!goog.DEBUG);
  } catch (e) {
    // Expect exception in debug code.
    assert(goog.DEBUG);
    // Make sure to let the developer know which tag caused the problem.
    assertContains('<tr>', e.message);
  }

  try {
    goog.soy.renderAsElement(example.colGroupTemplateCaps);
    // Expect no exception in production code.
    assert(!goog.DEBUG);
  } catch (e) {
    // Expect exception in debug code.
    assert(goog.DEBUG);
    // Make sure to let the developer know which tag caused the problem.
    assertContains('<COLGROUP>', e.message);
  }
}
