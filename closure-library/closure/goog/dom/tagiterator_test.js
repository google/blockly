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

goog.provide('goog.dom.TagIteratorTest');
goog.setTestOnly('goog.dom.TagIteratorTest');

goog.require('goog.dom');
goog.require('goog.dom.TagIterator');
goog.require('goog.dom.TagName');
goog.require('goog.dom.TagWalkType');
goog.require('goog.iter');
goog.require('goog.iter.StopIteration');
goog.require('goog.testing.dom');
goog.require('goog.testing.jsunit');

var it;
var pos;

function assertStartTag(type) {
  assertEquals('Position ' + pos + ' should be start tag',
      goog.dom.TagWalkType.START_TAG, it.tagType);
  assertTrue('isStartTag should return true', it.isStartTag());
  assertFalse('isEndTag should return false', it.isEndTag());
  assertFalse('isNonElement should return false', it.isNonElement());
  assertEquals('Position ' + pos + ' should be ' + type, type,
      it.node.tagName);
}

function assertEndTag(type) {
  assertEquals('Position ' + pos + ' should be end tag',
      goog.dom.TagWalkType.END_TAG, it.tagType);
  assertFalse('isStartTag should return false', it.isStartTag());
  assertTrue('isEndTag should return true', it.isEndTag());
  assertFalse('isNonElement should return false', it.isNonElement());
  assertEquals('Position ' + pos + ' should be ' + type, type,
      it.node.tagName);
}

function assertTextNode(value) {
  assertEquals('Position ' + pos + ' should be text node',
      goog.dom.TagWalkType.OTHER, it.tagType);
  assertFalse('isStartTag should return false', it.isStartTag());
  assertFalse('isEndTag should return false', it.isEndTag());
  assertTrue('isNonElement should return true', it.isNonElement());
  assertEquals('Position ' + pos + ' should be "' + value + '"', value,
      it.node.nodeValue);
}

function testBasicHTML() {
  it = new goog.dom.TagIterator(goog.dom.getElement('test'));
  pos = 0;

  goog.iter.forEach(it, function() {
    pos++;
    switch (pos) {
      case 1:
        assertStartTag(goog.dom.TagName.DIV);
        break;
      case 2:
        assertStartTag(goog.dom.TagName.A);
        break;
      case 3:
        assertTextNode('T');
        break;
      case 4:
        assertStartTag(goog.dom.TagName.B);
        assertEquals('Depth at <B> should be 3', 3, it.depth);
        break;
      case 5:
        assertTextNode('e');
        break;
      case 6:
        assertEndTag(goog.dom.TagName.B);
        break;
      case 7:
        assertTextNode('xt');
        break;
      case 8:
        assertEndTag(goog.dom.TagName.A);
        break;
      case 9:
        assertStartTag(goog.dom.TagName.SPAN);
        break;
      case 10:
        assertEndTag(goog.dom.TagName.SPAN);
        break;
      case 11:
        assertStartTag(goog.dom.TagName.P);
        break;
      case 12:
        assertTextNode('Text');
        break;
      case 13:
        assertEndTag(goog.dom.TagName.P);
        break;
      case 14:
        assertEndTag(goog.dom.TagName.DIV);
        assertEquals('Depth at end should be 0', 0, it.depth);
        break;
      default:
        throw goog.iter.StopIteration;
    }
  });
}

function testSkipTag() {
  it = new goog.dom.TagIterator(goog.dom.getElement('test'));
  pos = 0;

  goog.iter.forEach(it, function() {
    pos++;
    switch (pos) {
      case 1:
        assertStartTag(goog.dom.TagName.DIV);
        break;
      case 2:
        assertStartTag(goog.dom.TagName.A);
        it.skipTag();
        break;
      case 3:
        assertStartTag(goog.dom.TagName.SPAN);
        break;
      case 4:
        assertEndTag(goog.dom.TagName.SPAN);
        break;
      case 5:
        assertStartTag(goog.dom.TagName.P);
        break;
      case 6:
        assertTextNode('Text');
        break;
      case 7:
        assertEndTag(goog.dom.TagName.P);
        break;
      case 8:
        assertEndTag(goog.dom.TagName.DIV);
        assertEquals('Depth at end should be 0', 0, it.depth);
        break;
      default:
        throw goog.iter.StopIteration;
    }
  });
}

function testRestartTag() {
  it = new goog.dom.TagIterator(goog.dom.getElement('test'));
  pos = 0;
  var done = false;

  goog.iter.forEach(it, function() {
    pos++;
    switch (pos) {
      case 1:
        assertStartTag(goog.dom.TagName.DIV);
        break;
      case 2:
        assertStartTag(goog.dom.TagName.A);
        it.skipTag();
        break;
      case 3:
        assertStartTag(goog.dom.TagName.SPAN);
        break;
      case 4:
        assertEndTag(goog.dom.TagName.SPAN);
        break;
      case 5:
        assertStartTag(goog.dom.TagName.P);
        break;
      case 6:
        assertTextNode('Text');
        break;
      case 7:
        assertEndTag(goog.dom.TagName.P);
        break;
      case 8:
        assertEndTag(goog.dom.TagName.DIV);
        assertEquals('Depth at end should be 0', 0, it.depth);

        // Do them all again, starting after this element.
        if (!done) {
          pos = 1;
          it.restartTag();
          done = true;
        }
        break;
      default:
        throw goog.iter.StopIteration;
    }
  });
}


function testSkipTagReverse() {
  it = new goog.dom.TagIterator(goog.dom.getElement('test'), true);
  pos = 9;

  goog.iter.forEach(it, function() {
    pos--;
    switch (pos) {
      case 1:
        assertStartTag(goog.dom.TagName.DIV);
        assertEquals('Depth at end should be 0', 0, it.depth);
        break;
      case 2:
        assertEndTag(goog.dom.TagName.A);
        it.skipTag();
        break;
      case 3:
        assertStartTag(goog.dom.TagName.SPAN);
        break;
      case 4:
        assertEndTag(goog.dom.TagName.SPAN);
        break;
      case 5:
        assertStartTag(goog.dom.TagName.P);
        break;
      case 6:
        assertTextNode('Text');
        break;
      case 7:
        assertEndTag(goog.dom.TagName.P);
        break;
      case 8:
        assertEndTag(goog.dom.TagName.DIV);
        break;
      default:
        throw goog.iter.StopIteration;
    }
  });
}


function testUnclosedLI() {
  it = new goog.dom.TagIterator(goog.dom.getElement('test2'));
  pos = 0;

  goog.iter.forEach(it, function() {
    pos++;
    switch (pos) {
      case 1:
        assertStartTag(goog.dom.TagName.UL);
        break;
      case 2:
        assertStartTag(goog.dom.TagName.LI);
        assertEquals('Depth at <LI> should be 2', 2, it.depth);
        break;
      case 3:
        assertTextNode('Not');
        break;
      case 4:
        assertEndTag(goog.dom.TagName.LI);
        break;
      case 5:
        assertStartTag(goog.dom.TagName.LI);
        assertEquals('Depth at second <LI> should be 2', 2, it.depth);
        break;
      case 6:
        assertTextNode('Closed');
        break;
      case 7:
        assertEndTag(goog.dom.TagName.LI);
        break;
      case 8:
        assertEndTag(goog.dom.TagName.UL);
        assertEquals('Depth at end should be 0', 0, it.depth);
        break;
      default:
        throw goog.iter.StopIteration;
    }
  });
}

function testReversedUnclosedLI() {
  it = new goog.dom.TagIterator(goog.dom.getElement('test2'), true);
  pos = 9;

  goog.iter.forEach(it, function() {
    pos--;
    switch (pos) {
      case 1:
        assertStartTag(goog.dom.TagName.UL);
        assertEquals('Depth at start should be 0', 0, it.depth);
        break;
      case 2:
        assertStartTag(goog.dom.TagName.LI);
        break;
      case 3:
        assertTextNode('Not');
        break;
      case 4:
        assertEndTag(goog.dom.TagName.LI);
        assertEquals('Depth at <LI> should be 2', 2, it.depth);
        break;
      case 5:
        assertStartTag(goog.dom.TagName.LI);
        break;
      case 6:
        assertTextNode('Closed');
        break;
      case 7:
        assertEndTag(goog.dom.TagName.LI);
        assertEquals('Depth at second <LI> should be 2', 2, it.depth);
        break;
      case 8:
        assertEndTag(goog.dom.TagName.UL);
        break;
      default:
        throw goog.iter.StopIteration;
    }
  });
}

function testConstrained() {
  it = new goog.dom.TagIterator(goog.dom.getElement('test3'), false, false);
  pos = 0;

  goog.iter.forEach(it, function() {
    pos++;
    switch (pos) {
      case 1:
        assertStartTag(goog.dom.TagName.DIV);
        break;
      case 2:
        assertTextNode('text');
        break;
      case 3:
        assertEndTag(goog.dom.TagName.DIV);
        break;
    }
  });

  assertEquals('Constrained iterator should stop at position 3.', 3, pos);
}

function testUnconstrained() {
  it = new goog.dom.TagIterator(goog.dom.getElement('test3'), false, true);
  pos = 0;

  goog.iter.forEach(it, function() {
    pos++;
    switch (pos) {
      case 1:
        assertStartTag(goog.dom.TagName.DIV);
        break;
      case 2:
        assertTextNode('text');
        break;
      case 3:
        assertEndTag(goog.dom.TagName.DIV);
        break;
    }
  });

  assertNotEquals('Unonstrained iterator should not stop at position 3.', 3,
      pos);
}

function testConstrainedText() {
  it = new goog.dom.TagIterator(goog.dom.getElement('test3').firstChild,
      false, false);
  pos = 0;

  goog.iter.forEach(it, function() {
    pos++;
    switch (pos) {
      case 1:
        assertTextNode('text');
        break;
    }
  });

  assertEquals('Constrained text iterator should stop at position 1.', 1,
      pos);
}

function testReverseConstrained() {
  it = new goog.dom.TagIterator(goog.dom.getElement('test3'), true, false);
  pos = 4;

  goog.iter.forEach(it, function() {
    pos--;
    switch (pos) {
      case 1:
        assertStartTag(goog.dom.TagName.DIV);
        break;
      case 2:
        assertTextNode('text');
        break;
      case 3:
        assertEndTag(goog.dom.TagName.DIV);
        break;
    }
  });

  assertEquals('Constrained reversed iterator should stop at position 1.', 1,
      pos);
}

function testSpliceRemoveSingleNode() {
  var testDiv = goog.dom.getElement('testSplice');
  testDiv.innerHTML = '<br/>';
  it = new goog.dom.TagIterator(testDiv.firstChild);

  goog.iter.forEach(it, function(node, dummy, i) {
    i.splice();
  });

  assertEquals('Node not removed', 0, testDiv.childNodes.length);
}

function testSpliceRemoveFirstTextNode() {
  var testDiv = goog.dom.getElement('testSplice');
  testDiv.innerHTML = 'hello<b>world</b><em>goodbye</em>';
  it = new goog.dom.TagIterator(testDiv.firstChild, false, true);

  goog.iter.forEach(it, function(node, dummy, i) {
    if (node.nodeType == 3 && node.data == 'hello') {
      i.splice();
    }
    if (node.nodeName == goog.dom.TagName.EM) {
      i.splice(goog.dom.createDom(goog.dom.TagName.I, null, node.childNodes));
    }
  });

  goog.testing.dom.assertHtmlMatches('<b>world</b><i>goodbye</i>',
      testDiv.innerHTML);
}

function testSpliceReplaceFirstTextNode() {
  var testDiv = goog.dom.getElement('testSplice');
  testDiv.innerHTML = 'hello<b>world</b>';
  it = new goog.dom.TagIterator(testDiv.firstChild, false, true);

  goog.iter.forEach(it, function(node, dummy, i) {
    if (node.nodeType == 3 && node.data == 'hello') {
      i.splice(goog.dom.createDom(goog.dom.TagName.EM, null, 'HELLO'));
    } else if (node.nodeName == goog.dom.TagName.EM) {
      i.splice(goog.dom.createDom(goog.dom.TagName.I, null, node.childNodes));
    }
  });

  goog.testing.dom.assertHtmlMatches('<i>HELLO</i><b>world</b>',
      testDiv.innerHTML);
}

function testSpliceReplaceSingleNode() {
  var testDiv = goog.dom.getElement('testSplice');
  testDiv.innerHTML = '<br/>';
  it = new goog.dom.TagIterator(testDiv.firstChild);

  goog.iter.forEach(it, function(node, dummy, i) {
    i.splice(goog.dom.createDom(goog.dom.TagName.LINK),
             goog.dom.createDom(goog.dom.TagName.IMG));
  });

  goog.testing.dom.assertHtmlMatches('<link><img>', testDiv.innerHTML);
}

function testSpliceFlattenSingleNode() {
  var testDiv = goog.dom.getElement('testSplice');
  testDiv.innerHTML = '<div><b>one</b>two<i>three</i></div>';
  it = new goog.dom.TagIterator(testDiv.firstChild);

  goog.iter.forEach(it, function(node, dummy, i) {
    i.splice(node.childNodes);
  });

  goog.testing.dom.assertHtmlMatches('<b>one</b>two<i>three</i>',
      testDiv.innerHTML);
}

function testSpliceMiddleNode() {
  var testDiv = goog.dom.getElement('testSplice');
  testDiv.innerHTML = 'a<b>hello<span>world</span></b>c';
  it = new goog.dom.TagIterator(testDiv);

  goog.iter.forEach(it, function(node, dummy, i) {
    if (node.nodeName == goog.dom.TagName.B) {
      i.splice(goog.dom.createDom(goog.dom.TagName.IMG));
    }
  });

  goog.testing.dom.assertHtmlMatches('a<img>c', testDiv.innerHTML);
}

function testSpliceMiddleNodeReversed() {
  var testDiv = goog.dom.getElement('testSplice');
  testDiv.innerHTML = 'a<b>hello<span>world</span></b>c';
  it = new goog.dom.TagIterator(testDiv, true);

  goog.iter.forEach(it, function(node, dummy, i) {
    if (node.nodeName == goog.dom.TagName.B) {
      i.splice(goog.dom.createDom(goog.dom.TagName.IMG));
    }
  });

  goog.testing.dom.assertHtmlMatches('a<img>c', testDiv.innerHTML);
}

function testSpliceMiddleNodeAtEndTag() {
  var testDiv = goog.dom.getElement('testSplice');
  testDiv.innerHTML = 'a<b>hello<span>world</span></b>c';
  it = new goog.dom.TagIterator(testDiv);

  goog.iter.forEach(it, function(node, dummy, i) {
    if (node.tagName == goog.dom.TagName.B && i.isEndTag()) {
      i.splice(goog.dom.createDom(goog.dom.TagName.IMG));
    }
  });

  goog.testing.dom.assertHtmlMatches('a<img>c', testDiv.innerHTML);
}

function testSpliceMultipleNodes() {
  var testDiv = goog.dom.getElement('testSplice');
  testDiv.innerHTML = '<strong>this</strong> is <em>from IE</em>';
  it = new goog.dom.TagIterator(testDiv);

  goog.iter.forEach(it, function(node, dummy, i) {
    var replace = null;
    if (node.nodeName == goog.dom.TagName.STRONG) {
      replace = goog.dom.createDom(goog.dom.TagName.B, null, node.childNodes);
    } else if (node.nodeName == goog.dom.TagName.EM) {
      replace = goog.dom.createDom(goog.dom.TagName.I, null, node.childNodes);
    }
    if (replace) {
      i.splice(replace);
    }
  });

  goog.testing.dom.assertHtmlMatches('<b>this</b> is <i>from IE</i>',
      testDiv.innerHTML);
}

function testSpliceMultipleNodesAtEnd() {
  var testDiv = goog.dom.getElement('testSplice');
  testDiv.innerHTML = '<strong>this</strong> is <em>from IE</em>';
  it = new goog.dom.TagIterator(testDiv);

  goog.iter.forEach(it, function(node, dummy, i) {
    var replace = null;
    if (node.nodeName == goog.dom.TagName.STRONG && i.isEndTag()) {
      replace = goog.dom.createDom(goog.dom.TagName.B, null, node.childNodes);
    } else if (node.nodeName == goog.dom.TagName.EM && i.isEndTag()) {
      replace = goog.dom.createDom(goog.dom.TagName.I, null, node.childNodes);
    }
    if (replace) {
      i.splice(replace);
    }
  });

  goog.testing.dom.assertHtmlMatches('<b>this</b> is <i>from IE</i>',
      testDiv.innerHTML);
}

function testSpliceMultipleNodesReversed() {
  var testDiv = goog.dom.getElement('testSplice');
  testDiv.innerHTML = '<strong>this</strong> is <em>from IE</em>';
  it = new goog.dom.TagIterator(testDiv, true);

  goog.iter.forEach(it, function(node, dummy, i) {
    var replace = null;
    if (node.nodeName == goog.dom.TagName.STRONG) {
      replace = goog.dom.createDom(goog.dom.TagName.B, null, node.childNodes);
    } else if (node.nodeName == goog.dom.TagName.EM) {
      replace = goog.dom.createDom(goog.dom.TagName.I, null, node.childNodes);
    }
    if (replace) {
      i.splice(replace);
    }
  });

  goog.testing.dom.assertHtmlMatches('<b>this</b> is <i>from IE</i>',
      testDiv.innerHTML);
}
