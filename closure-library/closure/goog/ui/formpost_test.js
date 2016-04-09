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

goog.provide('goog.ui.FormPostTest');
goog.setTestOnly('goog.ui.FormPostTest');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.object');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.FormPost');
goog.require('goog.userAgent.product');
goog.require('goog.userAgent.product.isVersion');

var TARGET = 'target';
var ACTION_URL = 'http://url/';
var formPost;
var parameters;
var submits;
var originalCreateDom = goog.ui.FormPost.prototype.createDom;

function isChrome7or8() {
  // Temporarily disabled in Chrome 7 & 8. See b/3176768
  if (goog.userAgent.product.CHROME &&
      goog.userAgent.product.isVersion('7.0') &&
      !goog.userAgent.product.isVersion('8.0')) {
    return false;
  }

  return true;
}

function setUp() {
  formPost = new goog.ui.FormPost();
  submits = 0;

  // Replace the form's submit method with a fake.
  goog.ui.FormPost.prototype.createDom = function() {
    originalCreateDom.apply(this, arguments);

    this.getElement().submit = function() { submits++ };
  };
  parameters = {'foo': 'bar', 'baz': 1, 'array': [0, 'yes']};
}

function tearDown() {
  formPost.dispose();
  goog.ui.FormPost.prototype.createDom = originalCreateDom;
}

function testPost() {
  formPost.post(parameters, ACTION_URL, TARGET);
  expectUrlAndParameters_(ACTION_URL, TARGET, parameters);
}

function testPostWithDefaults() {
  // Temporarily disabled in Chrome 7. See See b/3176768
  if (isChrome7or8) {
    return;
  }
  formPost = new goog.ui.FormPost();
  formPost.post(parameters);
  expectUrlAndParameters_('', '', parameters);
}

function expectUrlAndParameters_(url, target, parameters) {
  var form = formPost.getElement();
  assertEquals('element must be a form', goog.dom.TagName.FORM, form.tagName);
  assertEquals('form must be hidden', 'none', form.style.display);
  assertEquals('form method must be POST', 'POST', form.method.toUpperCase());
  assertEquals('submits', 1, submits);
  assertEquals('action attribute', url, form.action);
  assertEquals('target attribute', target, form.target);
  var inputs =
      goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.INPUT, null, form);
  var formValues = {};
  for (var i = 0, input = inputs[i]; input = inputs[i]; i++) {
    if (goog.isArray(formValues[input.name])) {
      formValues[input.name].push(input.value);
    } else if (input.name in formValues) {
      formValues[input.name] = [formValues[input.name], input.value];
    } else {
      formValues[input.name] = input.value;
    }
  }
  var expected = goog.object.map(parameters, valueToString);
  assertObjectEquals('form values must match', expected, formValues);
}

function valueToString(value) {
  if (goog.isArray(value)) {
    return goog.array.map(value, valueToString);
  }
  return String(value);
}
