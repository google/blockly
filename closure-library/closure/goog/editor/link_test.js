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

goog.provide('goog.editor.LinkTest');
goog.setTestOnly('goog.editor.LinkTest');

goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.editor.Link');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var anchor;

function setUp() {
  anchor = goog.dom.createDom(goog.dom.TagName.A);
  document.body.appendChild(anchor);
}

function tearDown() {
  goog.dom.removeNode(anchor);
}

function testCreateNew() {
  var link = new goog.editor.Link(anchor, true);
  assertNotNull('Should have created object', link);
  assertTrue('Should be new', link.isNew());
  assertEquals('Should have correct anchor', anchor, link.getAnchor());
  assertEquals('Should be empty', '', link.getCurrentText());
}

function testCreateNotNew() {
  var link = new goog.editor.Link(anchor, false);
  assertNotNull('Should have created object', link);
  assertFalse('Should not be new', link.isNew());
  assertEquals('Should have correct anchor', anchor, link.getAnchor());
  assertEquals('Should be empty', '', link.getCurrentText());
}

function testCreateNewLinkFromText() {
  var url = 'http://www.google.com/';
  anchor.innerHTML = url;
  var link = goog.editor.Link.createNewLinkFromText(anchor);
  assertNotNull('Should have created object', link);
  assertEquals('Should have url in anchor', url, anchor.href);
}

function testCreateNewLinkFromTextLeadingTrailingWhitespace() {
  var url = 'http://www.google.com/';
  var urlWithSpaces = ' ' + url + ' ';
  anchor.innerHTML = urlWithSpaces;
  var urlWithSpacesUpdatedByBrowser = anchor.innerHTML;
  var link = goog.editor.Link.createNewLinkFromText(anchor);
  assertNotNull('Should have created object', link);
  assertEquals('Should have url in anchor', url, anchor.href);
  assertEquals('The text should still have spaces',
      urlWithSpacesUpdatedByBrowser, link.getCurrentText());
}

function testCreateNewLinkFromTextWithAnchor() {
  var url = 'https://www.google.com/';
  anchor.innerHTML = url;
  var link = goog.editor.Link.createNewLinkFromText(anchor, '_blank');
  assertNotNull('Should have created object', link);
  assertEquals('Should have url in anchor', url, anchor.href);
  assertEquals('Should have _blank target', '_blank', anchor.target);
}

function testInitialize() {
  var link = goog.editor.Link.createNewLink(anchor, 'http://www.google.com');
  assertNotNull('Should have created object', link);
  assertTrue('Should be new', link.isNew());
  assertEquals('Should have correct anchor', anchor, link.getAnchor());
  assertEquals('Should be empty', '', link.getCurrentText());
}

function testInitializeWithTarget() {
  var link = goog.editor.Link.createNewLink(anchor, 'http://www.google.com',
      '_blank');
  assertNotNull('Should have created object', link);
  assertTrue('Should be new', link.isNew());
  assertEquals('Should have correct anchor', anchor, link.getAnchor());
  assertEquals('Should be empty', '', link.getCurrentText());
  assertEquals('Should have _blank target', '_blank', anchor.target);
}

function testSetText() {
  var link = goog.editor.Link.createNewLink(anchor, 'http://www.google.com',
      '_blank');
  assertEquals('Should be empty', '', link.getCurrentText());
  link.setTextAndUrl('Text', 'http://docs.google.com/');
  assertEquals('Should point to http://docs.google.com/',
      'http://docs.google.com/', anchor.href);
  assertEquals('Should have correct text', 'Text', link.getCurrentText());
}

function testSetBoldText() {
  anchor.innerHTML = '<b></b>';
  var link = goog.editor.Link.createNewLink(anchor, 'http://www.google.com',
      '_blank');
  assertEquals('Should be empty', '', link.getCurrentText());
  link.setTextAndUrl('Text', 'http://docs.google.com/');
  assertEquals('Should point to http://docs.google.com/',
      'http://docs.google.com/', anchor.href);
  assertEquals('Should have correct text', 'Text', link.getCurrentText());
  assertEquals('Should still be bold', goog.dom.TagName.B,
      anchor.firstChild.tagName);
}

function testLinkImgTag() {
  anchor.innerHTML = '<img src="www.google.com" alt="alt_txt">';
  var link = goog.editor.Link.createNewLink(anchor, 'http://www.google.com',
      '_blank');
  assertEquals('Test getCurrentText', 'alt_txt', link.getCurrentText());
  link.setTextAndUrl('newText', 'http://docs.google.com/');
  assertEquals('Test getCurrentText', 'newText', link.getCurrentText());
  assertEquals('Should point to http://docs.google.com/',
      'http://docs.google.com/', anchor.href);

  assertEquals('Should still have img tag', goog.dom.TagName.IMG,
      anchor.firstChild.tagName);

  assertEquals('Alt should equal "newText"', 'newText',
      anchor.firstChild.getAttribute('alt'));
}

function testSetMixed() {
  anchor.innerHTML = '<b>A</b>B';
  var link = goog.editor.Link.createNewLink(anchor, 'http://www.google.com',
      '_blank');
  assertEquals('Should have text: AB', 'AB', link.getCurrentText());
  link.setTextAndUrl('Text', 'http://docs.google.com/');
  assertEquals('Should point to http://docs.google.com/',
      'http://docs.google.com/', anchor.href);
  assertEquals('Should have correct text', 'Text', link.getCurrentText());
  assertEquals('Should not be bold', goog.dom.NodeType.TEXT,
      anchor.firstChild.nodeType);
}

function testPlaceCursorRightOf() {
  // IE can only do selections properly if the region is editable.
  var ed = goog.dom.createDom(goog.dom.TagName.DIV);
  goog.dom.replaceNode(ed, anchor);
  ed.contentEditable = true;
  ed.appendChild(anchor);

  // In order to test the cursor placement properly, we need to have
  // link text.  See more details in the test below.
  anchor.innerHTML = 'I am text';

  var link = goog.editor.Link.createNewLink(anchor, 'http://www.google.com');
  link.placeCursorRightOf();

  var range = goog.dom.Range.createFromWindow();
  assertTrue('Range should be collapsed', range.isCollapsed());
  var startNode = range.getStartNode();

  if (goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher('528')) {
    assertEquals('Selection should be to the right of the anchor',
        anchor, startNode.previousSibling);
  } else {
    // Check that the selection is the "right" place.
    //
    // If you query the selection, it is actually still inside the anchor,
    // but if you type, it types outside the anchor.
    //
    // Best we can do is test that it is at the end of the anchor text.
    assertEquals('Selection should be in anchor text',
        anchor.firstChild, startNode);
    assertEquals('Selection should be at the end of the text',
        anchor.firstChild.length, range.getStartOffset());
  }

  if (ed) {
    goog.dom.removeNode(ed);
  }
}

function testIsLikelyUrl() {
  var good = [
    // Proper URLs
    'http://google.com', 'http://google.com/', 'http://192.168.1.103',
    'http://www.google.com:8083', 'https://antoine', 'https://foo.foo.net',
    'ftp://google.com:22/', 'http://user@site.com',
    'ftp://user:pass@ftp.site.com', 'http://google.com/search?q=laser%20cats',
    'aim:goim?screenname=en2es', 'mailto:x@y.com',

    // Bad URLs a browser will accept
    'www.google.com', 'www.amazon.co.uk', 'amazon.co.uk', 'foo2.foo3.com',
    'pandora.tv', 'marketing.us', 'del.icio.us', 'bridge-line.com',
    'www.frigid.net:80', 'www.google.com?q=foo', 'www.foo.com/j%20.txt',
    'foodtv.net', 'google.com', 'slashdot.org', '192.168.1.1',
    'justin.edu?kumar&nbsp;something', 'google.com/search?q=hot%20pockets',

    // Due to TLD explosion, these could be URLs either now or soon.
    'ww.jester', 'juicer.fake', 'abs.nonsense.something', 'filename.txt'
  ];
  for (var i = 0; i < good.length; i++) {
    assertTrue(good[i] + ' should be good',
        goog.editor.Link.isLikelyUrl(good[i]));
  }

  var bad = [
    // Definitely not URLs
    'bananas', 'http google com', '<img>', 'Sad :/', '*garbage!.123',
    'ftp', 'http', '/', 'https', 'this is', '*!&.banana!*&!',
    'www.jester is gone.com', 'ftp .nospaces.net', 'www_foo_net',
    "www.'jester'.net", 'www:8080',
    'www . notnsense.com', 'email@address.com',

    // URL-ish but not quite
    '  http://www.google.com', 'http://www.google.com:8081   ',
    'www.google.com foo bar', 'google.com/search?q=not quite'
  ];

  for (i = 0; i < bad.length; i++) {
    assertFalse(bad[i] + ' should be bad',
        goog.editor.Link.isLikelyUrl(bad[i]));
  }
}

function testIsLikelyEmailAddress() {
  var good = [
    // Valid email addresses
    'foo@foo.com', 'foo1@foo2.foo3.com', 'f45_1@goog13.org', 'user@gmail.co.uk',
    'jon-smith@crazy.net', 'roland1@capuchino.gov', 'ernir@gshi.nl',
    'JOON@jno.COM', 'media@meDIa.fREnology.FR', 'john.mail4me@del.icio.us',
    'www9@wc3.madeup1.org', 'hi@192.168.1.103', 'hi@192.168.1.1'
  ];
  for (var i = 0; i < good.length; i++) {
    assertTrue(goog.editor.Link.isLikelyEmailAddress(good[i]));
  }

  var bad = [
    // Malformed/incomplete email addresses
    'user', '@gmail.com', 'user@gmail', 'user@.com', 'user@gmail.c',
    'user@gmail.co.u', '@ya.com', '.@hi3.nl', 'jim.com',
    'ed:@gmail.com', '*!&.banana!*&!', ':jon@gmail.com',
    '3g?@bil.com', 'adam be@hi.net', 'john\nsmith@test.com',
    "www.'jester'.net", "'james'@covald.net", 'ftp://user@site.com/',
    'aim:goim?screenname=en2es', 'user:pass@site.com', 'user@site.com yay'
  ];

  for (i = 0; i < bad.length; i++) {
    assertFalse(goog.editor.Link.isLikelyEmailAddress(bad[i]));
  }
}

function testIsMailToLink() {
  assertFalse(goog.editor.Link.isMailto());
  assertFalse(goog.editor.Link.isMailto(null));
  assertFalse(goog.editor.Link.isMailto(''));
  assertFalse(goog.editor.Link.isMailto('http://foo.com'));
  assertFalse(goog.editor.Link.isMailto('http://mailto:80'));

  assertTrue(goog.editor.Link.isMailto('mailto:'));
  assertTrue(goog.editor.Link.isMailto('mailto://'));
  assertTrue(goog.editor.Link.isMailto('mailto://ptucker@gmail.com'));
}

function testGetValidLinkFromText() {
  var textLinkPairs = [
    // input text, expected link output
    'www.foo.com', 'http://www.foo.com',
    'user@gmail.com', 'mailto:user@gmail.com',
    'http://www.foo.com', 'http://www.foo.com',
    'https://this.that.edu', 'https://this.that.edu',
    'nothing to see here', null
  ];
  var link = new goog.editor.Link(anchor, true);

  for (var i = 0; i < textLinkPairs.length; i += 2) {
    link.currentText_ = textLinkPairs[i];
    var result = link.getValidLinkFromText();
    assertEquals(textLinkPairs[i + 1], result);
  }
}
