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

goog.provide('goog.ui.style.app.PrimaryActionButtonRendererTest');
goog.setTestOnly('goog.ui.style.app.PrimaryActionButtonRendererTest');

goog.require('goog.dom');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.ui.style');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.ui.style.app.PrimaryActionButtonRenderer');
var renderer = goog.ui.style.app.PrimaryActionButtonRenderer.getInstance();
var button;

// Write iFrame tag to load reference FastUI markup. Then, our tests will
// compare the generated markup to the reference markup.
var refPath = '../../../../../' +
    'webutil/css/fastui/app/primaryactionbutton_spec.html';
goog.testing.ui.style.writeReferenceFrame(refPath);

function setUp() {
  button = new goog.ui.Button('Hello Generated', renderer);
}

function tearDown() {
  if (button) {
    button.dispose();
  }
  goog.dom.getElement('sandbox').innerHTML = '';
}

function testGeneratedButton() {
  button.render(goog.dom.getElement('sandbox'));
  goog.testing.ui.style.assertStructureMatchesReference(button.getElement(),
      'normal-resting');
}

function testButtonStates() {
  button.render(goog.dom.getElement('sandbox'));
  goog.testing.ui.style.assertStructureMatchesReference(button.getElement(),
      'normal-resting');
  button.setState(goog.ui.Component.State.HOVER, true);
  goog.testing.ui.style.assertStructureMatchesReference(button.getElement(),
      'normal-hover');
  button.setState(goog.ui.Component.State.HOVER, false);
  button.setState(goog.ui.Component.State.FOCUSED, true);
  goog.testing.ui.style.assertStructureMatchesReference(button.getElement(),
      'normal-focused');
  button.setState(goog.ui.Component.State.FOCUSED, false);
  button.setState(goog.ui.Component.State.ACTIVE, true);
  goog.testing.ui.style.assertStructureMatchesReference(button.getElement(),
      'normal-active');
  button.setState(goog.ui.Component.State.ACTIVE, false);
  button.setState(goog.ui.Component.State.DISABLED, true);
  goog.testing.ui.style.assertStructureMatchesReference(button.getElement(),
      'normal-disabled');
}
