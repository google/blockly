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

goog.provide('goog.ui.media.FlashObjectTest');
goog.setTestOnly('goog.ui.media.FlashObjectTest');

goog.require('goog.dom');
goog.require('goog.dom.DomHelper');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.html.SafeUrl');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.media.FlashObject');
goog.require('goog.userAgent');


var FLASH_URL = 'http://www.youtube.com/v/RbI7cCp0v6w&hl=en&fs=1';
var control = new goog.testing.MockControl();
var domHelper = control.createLooseMock(goog.dom.DomHelper);
// TODO(user): mocking window.document throws exceptions in FF2. find out how
// to mock it.
var documentHelper = {body: control.createLooseMock(goog.dom.DomHelper)};
var element = goog.dom.createElement(goog.dom.TagName.DIV);

function setUp() {
  control.$resetAll();
  domHelper.getDocument().$returns(documentHelper).$anyTimes();
  domHelper.createElement(goog.dom.TagName.DIV).$returns(element).$anyTimes();
  documentHelper.body.appendChild(element).$anyTimes();
}

function tearDown() {
  control.$verifyAll();
}

function getFlashVarsFromElement(flash) {
  var el = flash.getFlashElement();

  // This should work in everything except IE:
  if (el.hasAttribute && el.hasAttribute('flashvars'))
    return el.getAttribute('flashvars');

  // For IE: find and return the value of the correct param element:
  el = el.firstChild;
  while (el) {
    if (el.name == 'FlashVars') {
      return el.value;
    }
    el = el.nextSibling;
  }
  return '';
}

function testInstantiationAndRendering() {
  control.$replayAll();

  var flash = new goog.ui.media.FlashObject(FLASH_URL, domHelper);
  flash.render();
  flash.dispose();
}

function testRenderedWithCorrectAttributes() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(11)) {
    return;
  }

  control.$replayAll();

  var flash = new goog.ui.media.FlashObject(FLASH_URL, domHelper);
  flash.setAllowScriptAccess('allowScriptAccess');
  flash.setBackgroundColor('backgroundColor');
  flash.setId('id');
  flash.setFlashVars({'k1': 'v1', 'k2': 'v2'});
  flash.setWmode('wmode');
  flash.render();

  var el = flash.getFlashElement();
  assertEquals('true', el.getAttribute('allowFullScreen'));
  assertEquals('all', el.getAttribute('allowNetworking'));
  assertEquals('allowScriptAccess', el.getAttribute('allowScriptAccess'));
  assertEquals(
      goog.ui.media.FlashObject.FLASH_CSS_CLASS, el.getAttribute('class'));
  assertEquals('k1=v1&k2=v2', el.getAttribute('FlashVars'));
  assertEquals('id', el.getAttribute('id'));
  assertEquals('id', el.getAttribute('name'));
  assertEquals('https://www.macromedia.com/go/getflashplayer',
      el.getAttribute('pluginspage'));
  assertEquals('high', el.getAttribute('quality'));
  assertEquals('false', el.getAttribute('SeamlessTabbing'));
  assertEquals(FLASH_URL, el.getAttribute('src'));
  assertEquals('application/x-shockwave-flash',
      el.getAttribute('type'));
  assertEquals('wmode', el.getAttribute('wmode'));
}

function testRenderedWithCorrectAttributesOldIe() {
  if (!goog.userAgent.IE || goog.userAgent.isDocumentModeOrHigher(11)) {
    return;
  }

  control.$replayAll();

  var flash = new goog.ui.media.FlashObject(FLASH_URL, domHelper);
  flash.setAllowScriptAccess('allowScriptAccess');
  flash.setBackgroundColor('backgroundColor');
  flash.setId('id');
  flash.setFlashVars({'k1': 'v1', 'k2': 'v2'});
  flash.setWmode('wmode');
  flash.render();

  var el = flash.getFlashElement();
  assertEquals('class',
      goog.ui.media.FlashObject.FLASH_CSS_CLASS, el.getAttribute('class'));
  assertEquals('clsid:d27cdb6e-ae6d-11cf-96b8-444553540000',
      el.getAttribute('classid'));
  assertEquals('id', 'id', el.getAttribute('id'));
  assertEquals('name', 'id', el.getAttribute('name'));

  assertContainsParam(el, 'allowFullScreen', 'true');
  assertContainsParam(el, 'allowNetworking', 'all');
  assertContainsParam(el, 'AllowScriptAccess', 'allowScriptAccess');
  assertContainsParam(el, 'bgcolor', 'backgroundColor');
  assertContainsParam(el, 'FlashVars', 'FlashVars');
  assertContainsParam(el, 'movie', FLASH_URL);
  assertContainsParam(el, 'quality', 'high');
  assertContainsParam(el, 'SeamlessTabbing', 'false');
  assertContainsParam(el, 'wmode', 'wmode');

}

function testUrlIsSanitized() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(11)) {
    return;
  }

  control.$replayAll();

  var flash = new goog.ui.media.FlashObject('javascript:evil', domHelper);
  flash.render();
  var el = flash.getFlashElement();

  assertEquals(goog.html.SafeUrl.INNOCUOUS_STRING, el.getAttribute('src'));
}

function testUrlIsSanitizedOldIe() {
  if (!goog.userAgent.IE || goog.userAgent.isDocumentModeOrHigher(11)) {
    return;
  }

  control.$replayAll();

  var flash = new goog.ui.media.FlashObject('javascript:evil', domHelper);
  flash.render();
  var el = flash.getFlashElement();

  assertContainsParam(el, 'movie', goog.html.SafeUrl.INNOCUOUS_STRING);
}

function assertContainsParam(element, expectedName, expectedValue) {
  var failureMsg = 'Expected param with name \"' + expectedName +
      '\" and value \"' + expectedValue + '\". Not found in child nodes: ' +
      element.innerHTML;
  for (var i = 0; i < element.childNodes.length; i++) {
    var child = element.childNodes[i];
    var name = child.getAttribute('name');
    if (name === expectedName) {
      if (!child.getAttribute('value') === expectedValue) {
        fail(failureMsg);
      }
      return;
    }
  }
  fail(failureMsg);
}

function testSetFlashVar() {
  control.$replayAll();

  var flash = new goog.ui.media.FlashObject(FLASH_URL, domHelper);

  assertTrue(flash.getFlashVars().isEmpty());
  flash.setFlashVar('foo', 'bar');
  flash.setFlashVar('hello', 'world');
  assertFalse(flash.getFlashVars().isEmpty());

  flash.render();

  assertEquals('foo=bar&hello=world', getFlashVarsFromElement(flash));
  flash.dispose();
}

function testAddFlashVars() {
  control.$replayAll();

  var flash = new goog.ui.media.FlashObject(FLASH_URL, domHelper);

  assertTrue(flash.getFlashVars().isEmpty());
  flash.addFlashVars({
    'using': 'an',
    'object': 'literal'
  });
  assertFalse(flash.getFlashVars().isEmpty());

  flash.render();

  assertEquals('using=an&object=literal', getFlashVarsFromElement(flash));
  flash.dispose();
}


/**
 * @deprecated Remove once setFlashVars is removed.
 */
function testSetFlashVarsUsingFalseAsTheValue() {
  control.$replayAll();

  var flash = new goog.ui.media.FlashObject(FLASH_URL, domHelper);

  assertTrue(flash.getFlashVars().isEmpty());
  flash.setFlashVars('beEvil', false);
  assertFalse(flash.getFlashVars().isEmpty());

  flash.render();

  assertEquals('beEvil=false', getFlashVarsFromElement(flash));
  flash.dispose();
}


/**
 * @deprecated Remove once setFlashVars is removed.
 */
function testSetFlashVarsWithWrongArgument() {
  control.$replayAll();

  assertThrows(function() {
    var flash = new goog.ui.media.FlashObject(FLASH_URL, domHelper);
    flash.setFlashVars('foo=bar');
    flash.dispose();
  });
}

function testSetFlashVarUrlEncoding() {
  control.$replayAll();

  var flash = new goog.ui.media.FlashObject(FLASH_URL, domHelper);
  flash.setFlashVar('foo', 'bar and some extra spaces');
  flash.render();
  assertEquals('foo=bar%20and%20some%20extra%20spaces',
      getFlashVarsFromElement(flash));
  flash.dispose();
}

function testThrowsRequiredVersionOfFlashNotAvailable() {
  control.$replayAll();

  var flash = new goog.ui.media.FlashObject(FLASH_URL, domHelper);
  flash.setRequiredVersion('999.999.999');

  assertTrue(flash.hasRequiredVersion());

  assertThrows(function() {
    flash.render();
  });

  flash.dispose();
}

function testIsLoadedAfterDispose() {
  control.$replayAll();

  var flash = new goog.ui.media.FlashObject(FLASH_URL, domHelper);
  flash.render();
  // TODO(user): find out a way to test the loadness of flash movies on
  // asynchronous tests. if debugger; is left here, the test pass. if removed
  // the test fails. that happens because flash needs some time to be
  // considered loaded, after flash.render() is called (like img.src i guess).
  //debugger;
  //assertTrue(flash.isLoaded());
  flash.dispose();
  assertFalse(flash.isLoaded());
}

function testXssAttacks() {
  control.$replayAll();

  called = false;
  var injection = '' +
      '">' +
      '</embed>' +
      '<script>called = true; // evil arbitrary js injected here<\/script>' +
      '<embed src=""';
  var flash = new goog.ui.media.FlashObject(injection, domHelper);
  flash.render();
  // Makes sure FlashObject html escapes user input.
  // NOTE(user): this test fails if the URL is not HTML escaped, showing that
  // html escaping is necessary to avoid attacks.
  assertFalse(called);
}

function testPropagatesEventsConsistently() {
  var event = control.createLooseMock(goog.events.Event);

  // we expect any event to have its propagation stopped.
  event.stopPropagation();

  control.$replayAll();

  var flash = new goog.ui.media.FlashObject(FLASH_URL, domHelper);
  flash.render();
  event.target = flash.getElement();
  event.type = goog.events.EventType.CLICK;
  goog.testing.events.fireBrowserEvent(event);
  flash.dispose();
}

function testEventsGetsSinked() {
  var called = false;
  var flash = new goog.ui.media.FlashObject(FLASH_URL);
  var parent = goog.dom.createElement(goog.dom.TagName.DIV);
  flash.render(parent);

  goog.events.listen(parent, goog.events.EventType.CLICK, function(e) {
    called = true;
  });

  assertFalse(called);

  goog.testing.events.fireClickSequence(flash.getElement());

  assertFalse(called);
  flash.dispose();
}
