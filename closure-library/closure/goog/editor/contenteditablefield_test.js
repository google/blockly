// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.editor.ContentEditableFieldTest');
goog.setTestOnly('goog.editor.ContentEditableFieldTest');

goog.require('goog.dom');
goog.require('goog.editor.ContentEditableField');
/** @suppress {extraRequire} needed for test setup */
goog.require('goog.editor.field_test');
goog.require('goog.testing.jsunit');

FieldConstructor = goog.editor.ContentEditableField;

function testNoIframeAndSameElement() {
  var field = new goog.editor.ContentEditableField('testField');
  field.makeEditable();
  assertFalse(field.usesIframe());
  assertEquals('Original element should equal field element',
      field.getOriginalElement(), field.getElement());
  assertEquals('Sanity check on original element',
      'testField', field.getOriginalElement().id);
  assertEquals('Editable document should be same as main document',
      document, field.getEditableDomHelper().getDocument());
  field.dispose();
}

function testMakeEditableAndUnEditable() {
  var elem = goog.dom.getElement('testField');
  goog.dom.setTextContent(elem, 'Hello world');
  var field = new goog.editor.ContentEditableField('testField');

  field.makeEditable();
  assertEquals('true', String(elem.contentEditable));
  assertEquals('Hello world', goog.dom.getTextContent(elem));
  field.setHtml(false /* addParas */, 'Goodbye world');
  assertEquals('Goodbye world', goog.dom.getTextContent(elem));

  field.makeUneditable();
  assertNotEquals('true', String(elem.contentEditable));
  assertEquals('Goodbye world', goog.dom.getTextContent(elem));
  field.dispose();
}
