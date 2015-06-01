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

goog.provide('goog.events.ActionHandlerTest');
goog.setTestOnly('goog.events.ActionHandlerTest');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.ActionHandler');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');

var actionHandler;
function setUp() {
  actionHandler = new goog.events.ActionHandler(
      goog.dom.getElement('actionDiv'));
}
function tearDown() {
  actionHandler.dispose();
}

// Tests to see that both the BEFOREACTION and ACTION events are fired
function testActionHandlerWithBeforeActionHandler() {
  var actionEventFired = false;
  var beforeActionFired = false;
  goog.events.listen(actionHandler,
      goog.events.ActionHandler.EventType.ACTION,
      function(e) {
        actionEventFired = true;
      });
  goog.events.listen(actionHandler,
      goog.events.ActionHandler.EventType.BEFOREACTION,
      function(e) {
        beforeActionFired = true;
      });
  goog.testing.events.fireClickSequence(goog.dom.getElement('actionDiv'));
  assertTrue('BEFOREACTION event was not fired', beforeActionFired);
  assertTrue('ACTION event was not fired', actionEventFired);
}

// Tests to see that the ACTION event is fired, even if there is no
// BEFOREACTION handler.
function testActionHandlerWithoutBeforeActionHandler() {
  var actionEventFired = false;
  goog.events.listen(actionHandler,
      goog.events.ActionHandler.EventType.ACTION,
      function(e) {actionEventFired = true;});
  goog.testing.events.fireClickSequence(goog.dom.getElement('actionDiv'));
  assertTrue('ACTION event was not fired', actionEventFired);
}

// If the BEFOREACTION listener swallows the event, it should cancel the
// ACTION event.
function testBeforeActionCancel() {
  var actionEventFired = false;
  var beforeActionFired = false;
  goog.events.listen(actionHandler,
      goog.events.ActionHandler.EventType.ACTION,
      function(e) {actionEvent = e;});
  goog.events.listen(actionHandler,
      goog.events.ActionHandler.EventType.BEFOREACTION,
      function(e) {
        beforeActionFired = true;
        e.preventDefault();
      });
  goog.testing.events.fireClickSequence(goog.dom.getElement('actionDiv'));
  assertTrue(beforeActionFired);
  assertFalse(actionEventFired);
}
