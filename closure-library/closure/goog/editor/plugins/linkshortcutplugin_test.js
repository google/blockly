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

goog.provide('goog.editor.plugins.LinkShortcutPluginTest');
goog.setTestOnly('goog.editor.plugins.LinkShortcutPluginTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.editor.Field');
goog.require('goog.editor.plugins.BasicTextFormatter');
goog.require('goog.editor.plugins.LinkBubble');
goog.require('goog.editor.plugins.LinkShortcutPlugin');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.dom');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent.product');

var propertyReplacer;

function setUp() {
  propertyReplacer = new goog.testing.PropertyReplacer();
}

function tearDown() {
  propertyReplacer.reset();
  var field = document.getElementById('cleanup');
  goog.dom.removeChildren(field);
  field.innerHTML = '<div id="field">http://www.google.com/</div>';
}

function testShortcutCreatesALink() {
  if (goog.userAgent.product.SAFARI) {
    // TODO(b/20733468): Disabled so we can get the rest of the Closure test
    // suite running in a continuous build. Will investigate later.
    return;
  }

  propertyReplacer.set(
      window, 'prompt', function() { return 'http://www.google.com/'; });
  var linkBubble = new goog.editor.plugins.LinkBubble();
  var formatter = new goog.editor.plugins.BasicTextFormatter();
  var plugin = new goog.editor.plugins.LinkShortcutPlugin();
  var fieldEl = document.getElementById('field');
  var field = new goog.editor.Field('field');
  field.registerPlugin(formatter);
  field.registerPlugin(linkBubble);
  field.registerPlugin(plugin);
  field.makeEditable();
  field.focusAndPlaceCursorAtStart();
  var textNode =
      goog.testing.dom.findTextNode('http://www.google.com/', fieldEl);
  goog.testing.events.fireKeySequence(
      field.getElement(), goog.events.KeyCodes.K, {ctrlKey: true});

  var href = field.getElement().getElementsByTagName(goog.dom.TagName.A)[0];
  assertEquals('http://www.google.com/', href.href);
  var bubbleLink =
      document.getElementById(goog.editor.plugins.LinkBubble.TEST_LINK_ID_);
  assertEquals('http://www.google.com/', bubbleLink.innerHTML);
}
