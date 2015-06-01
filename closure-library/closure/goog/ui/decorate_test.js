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

goog.provide('goog.ui.decorateTest');
goog.setTestOnly('goog.ui.decorateTest');

goog.require('goog.testing.jsunit');
goog.require('goog.ui.decorate');
goog.require('goog.ui.registry');
// Fake component and renderer implementations, for testing only.

// UnknownComponent has no default renderer or decorator registered.
function UnknownComponent() {
}

// FakeComponentX's default renderer is FakeRenderer.  It also has a
// decorator.
function FakeComponentX() {
  this.element = null;
}

FakeComponentX.prototype.decorate = function(element) {
  this.element = element;
};

// FakeComponentY doesn't have an explicitly registered default
// renderer; it should inherit the default renderer from its superclass.
// It does have a decorator registered.
function FakeComponentY() {
  FakeComponentX.call(this);
}
goog.inherits(FakeComponentY, FakeComponentX);

// FakeComponentZ is just another component.  Its default renderer is
// FakeSingletonRenderer, but it has no decorator registered.
function FakeComponentZ() {
}

// FakeRenderer is a stateful renderer.
function FakeRenderer() {
}

// FakeSingletonRenderer is a stateless renderer that can be used as a
// singleton.
function FakeSingletonRenderer() {
}

FakeSingletonRenderer.instance_ = new FakeSingletonRenderer();

FakeSingletonRenderer.getInstance = function() {
  return FakeSingletonRenderer.instance_;
};

function setUp() {
  goog.ui.registry.setDefaultRenderer(FakeComponentX, FakeRenderer);
  goog.ui.registry.setDefaultRenderer(FakeComponentZ,
      FakeSingletonRenderer);

  goog.ui.registry.setDecoratorByClassName('fake-component-x',
      function() {
        return new FakeComponentX();
      });
  goog.ui.registry.setDecoratorByClassName('fake-component-y',
      function() {
        return new FakeComponentY();
      });
}

function tearDown() {
  goog.ui.registry.reset();
}

function testDecorate() {
  var dx = goog.ui.decorate(document.getElementById('x'));
  assertTrue('Decorator for element with fake-component-x class must be ' +
      'a FakeComponentX', dx instanceof FakeComponentX);
  assertEquals('Element x must have been decorated',
      document.getElementById('x'), dx.element);

  var dy = goog.ui.decorate(document.getElementById('y'));
  assertTrue('Decorator for element with fake-component-y class must be ' +
      'a FakeComponentY', dy instanceof FakeComponentY);
  assertEquals('Element y must have been decorated',
      document.getElementById('y'), dy.element);

  var dz = goog.ui.decorate(document.getElementById('z'));
  assertNull('Decorator for element with unknown class must be null', dz);

  var du = goog.ui.decorate(document.getElementById('u'));
  assertNull('Decorator for element without CSS class must be null', du);
}
