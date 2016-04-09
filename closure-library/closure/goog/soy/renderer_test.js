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

goog.provide('goog.soy.RendererTest');
goog.setTestOnly('goog.soy.RendererTest');

goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.html.SafeHtml');
goog.require('goog.i18n.bidi.Dir');
goog.require('goog.soy.Renderer');
goog.require('goog.soy.data.SanitizedContentKind');
/** @suppress {extraRequire} */
goog.require('goog.soy.testHelper');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

var handleRender;


function setUp() {
  // Replace the empty default implementation.
  handleRender = goog.soy.Renderer.prototype.handleRender =
      goog.testing.recordFunction(goog.soy.Renderer.prototype.handleRender);
}


var dataSupplier = {getData: function() { return {name: 'IjValue'}; }};


function testRenderElement() {
  var testDiv = goog.dom.createElement(goog.dom.TagName.DIV);

  var renderer = new goog.soy.Renderer(dataSupplier);
  renderer.renderElement(
      testDiv, example.injectedDataTemplate, {name: 'Value'});
  assertEquals('ValueIjValue', elementToInnerHtml(testDiv));
  assertEquals(testDiv, handleRender.getLastCall().getArguments()[0]);
  handleRender.assertCallCount(1);
}


function testRenderElementWithNoTemplateData() {
  var testDiv = goog.dom.createElement(goog.dom.TagName.DIV);

  var renderer = new goog.soy.Renderer(dataSupplier);
  renderer.renderElement(testDiv, example.noDataTemplate);
  assertEquals('<div>Hello</div>', elementToInnerHtml(testDiv));
  assertEquals(testDiv, handleRender.getLastCall().getArguments()[0]);
  handleRender.assertCallCount(1);
}


function testRenderAsFragment() {
  var renderer = new goog.soy.Renderer(dataSupplier);
  var fragment =
      renderer.renderAsFragment(example.injectedDataTemplate, {name: 'Value'});
  assertEquals('ValueIjValue', fragmentToHtml(fragment));
  assertEquals(fragment, handleRender.getLastCall().getArguments()[0]);
  handleRender.assertCallCount(1);
}


function testRenderAsFragmentWithNoTemplateData() {
  var renderer = new goog.soy.Renderer(dataSupplier);
  var fragment = renderer.renderAsFragment(example.noDataTemplate);
  assertEquals(goog.dom.NodeType.ELEMENT, fragment.nodeType);
  assertEquals('<div>Hello</div>', fragmentToHtml(fragment));
  assertEquals(fragment, handleRender.getLastCall().getArguments()[0]);
  handleRender.assertCallCount(1);
}


function testRenderAsElement() {
  var renderer = new goog.soy.Renderer(dataSupplier);
  var element =
      renderer.renderAsElement(example.injectedDataTemplate, {name: 'Value'});
  assertEquals('ValueIjValue', elementToInnerHtml(element));
  assertEquals(element, handleRender.getLastCall().getArguments()[0]);
  handleRender.assertCallCount(1);
}


function testRenderAsElementWithNoTemplateData() {
  var renderer = new goog.soy.Renderer(dataSupplier);
  var elem = renderer.renderAsElement(example.noDataTemplate);
  assertEquals('Hello', elementToInnerHtml(elem));
  assertEquals(elem, handleRender.getLastCall().getArguments()[0]);
}


function testRenderConvertsToString() {
  var renderer = new goog.soy.Renderer(dataSupplier);
  assertEquals(
      'Output should be a string', 'Hello <b>World</b>',
      renderer.render(example.sanitizedHtmlTemplate));
  assertUndefined(handleRender.getLastCall().getArguments()[0]);
  handleRender.assertCallCount(1);
}


function testRenderRejectsNonHtmlStrictTemplates() {
  var renderer = new goog.soy.Renderer(dataSupplier);
  assertEquals(
      'Assertion failed: ' +
          'render was called with a strict template of kind other than "html"' +
          ' (consider using renderText or renderStrict)',
      assertThrows(function() {
        renderer.render(example.unsanitizedTextTemplate, {});
      }).message);
  handleRender.assertCallCount(0);
}


function testRenderStrictDoesNotConvertToString() {
  var renderer = new goog.soy.Renderer(dataSupplier);
  var result = renderer.renderStrict(example.sanitizedHtmlTemplate);
  assertEquals('Hello <b>World</b>', result.content);
  assertEquals(goog.soy.data.SanitizedContentKind.HTML, result.contentKind);
  assertUndefined(handleRender.getLastCall().getArguments()[0]);
  handleRender.assertCallCount(1);
}


function testRenderStrictValidatesOutput() {
  var renderer = new goog.soy.Renderer(dataSupplier);
  // Passes.
  renderer.renderStrict(example.sanitizedHtmlTemplate, {});
  // No SanitizedContent at all.
  assertEquals(
      'Assertion failed: ' +
          'renderStrict cannot be called on a non-strict soy template',
      assertThrows(function() {
        renderer.renderStrict(example.noDataTemplate, {});
      }).message);
  assertUndefined(handleRender.getLastCall().getArguments()[0]);
  // Passes.
  renderer.renderStrict(
      example.sanitizedHtmlTemplate, {},
      goog.soy.data.SanitizedContentKind.HTML);
  // Wrong content kind.
  assertEquals(
      'Assertion failed: ' +
          'renderStrict was called with the wrong kind of template',
      assertThrows(function() {
        renderer.renderStrict(
            example.sanitizedHtmlTemplate, {},
            goog.soy.data.SanitizedContentKind.JS);
      }).message);
  assertUndefined(handleRender.getLastCall().getArguments()[0]);

  // renderStrict's opt_kind parameter defaults to SanitizedContentKind.HTML:
  // Passes.
  renderer.renderStrict(example.sanitizedHtmlTemplate, {});
  // Rendering non-HTML template fails:
  assertEquals(
      'Assertion failed: ' +
          'renderStrict was called with the wrong kind of template',
      assertThrows(function() {
        renderer.renderStrict(example.unsanitizedTextTemplate, {});
      }).message);
  assertUndefined(handleRender.getLastCall().getArguments()[0]);
  handleRender.assertCallCount(3);
}


function testRenderText() {
  var renderer = new goog.soy.Renderer(dataSupplier);
  // RenderText converts to string.
  assertEquals(
      'Output of renderText should be a string', 'I <3 Puppies & Kittens',
      renderer.renderText(example.unsanitizedTextTemplate));
  assertUndefined(handleRender.getLastCall().getArguments()[0]);
  // RenderText on non-strict template fails.
  assertEquals(
      'Assertion failed: ' +
          'renderText cannot be called on a non-strict soy template',
      assertThrows(function() {
        renderer.renderText(example.noDataTemplate, {});
      }).message);
  // RenderText on non-text template fails.
  assertEquals(
      'Assertion failed: ' +
          'renderText was called with a template of kind other than "text"',
      assertThrows(function() {
        renderer.renderText(example.sanitizedHtmlTemplate, {});
      }).message);
  handleRender.assertCallCount(1);
}

function testRenderSafeHtml() {
  var renderer = new goog.soy.Renderer(dataSupplier);
  var result = renderer.renderSafeHtml(example.sanitizedHtmlTemplate);
  assertEquals('Hello <b>World</b>', goog.html.SafeHtml.unwrap(result));
  assertEquals(goog.i18n.bidi.Dir.LTR, result.getDirection());
}
