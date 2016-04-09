// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.dom.pattern.matcherTest');
goog.setTestOnly('goog.dom.pattern.matcherTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.pattern.EndTag');
goog.require('goog.dom.pattern.FullTag');
goog.require('goog.dom.pattern.Matcher');
goog.require('goog.dom.pattern.Repeat');
goog.require('goog.dom.pattern.Sequence');
goog.require('goog.dom.pattern.StartTag');
goog.require('goog.dom.pattern.callback.Counter');
goog.require('goog.dom.pattern.callback.Test');
goog.require('goog.iter.StopIteration');
goog.require('goog.testing.jsunit');

function testMatcherAndStartTag() {
  var pattern = new goog.dom.pattern.StartTag('P');

  var counter = new goog.dom.pattern.callback.Counter();
  var matcher = new goog.dom.pattern.Matcher();
  matcher.addPattern(pattern, counter.getCallback());
  matcher.match(document.body);

  assertEquals('StartTag(p) should match 5 times in body', 5, counter.count);
}

function testMatcherAndStartTagTwice() {
  var pattern = new goog.dom.pattern.StartTag('P');

  var counter = new goog.dom.pattern.callback.Counter();
  var matcher = new goog.dom.pattern.Matcher();
  matcher.addPattern(pattern, counter.getCallback());
  matcher.match(document.body);

  assertEquals('StartTag(p) should match 5 times in body', 5, counter.count);

  // Make sure no state got mangled.
  counter.reset();
  matcher.match(document.body);

  assertEquals(
      'StartTag(p) should match 5 times in body again', 5, counter.count);
}

function testMatcherAndStartTagAttributes() {
  var pattern = new goog.dom.pattern.StartTag('SPAN', {id: /./});

  var counter = new goog.dom.pattern.callback.Counter();
  var matcher = new goog.dom.pattern.Matcher();
  matcher.addPattern(pattern, counter.getCallback());
  matcher.match(document.body);

  assertEquals(
      'StartTag(span,id) should match 2 times in body', 2, counter.count);
}

function testMatcherWithTwoPatterns() {
  var pattern1 = new goog.dom.pattern.StartTag('SPAN');
  var pattern2 = new goog.dom.pattern.StartTag('P');

  var counter = new goog.dom.pattern.callback.Counter();

  var matcher = new goog.dom.pattern.Matcher();
  matcher.addPattern(pattern1, counter.getCallback());
  matcher.addPattern(pattern2, counter.getCallback());

  matcher.match(document.body);

  assertEquals(
      'StartTag(span|p) should match 8 times in body', 8, counter.count);
}

function testMatcherWithQuit() {
  var pattern1 = new goog.dom.pattern.StartTag('SPAN');
  var pattern2 = new goog.dom.pattern.StartTag('P');

  var count = 0;
  var callback = function(node, position) {
    if (node.nodeName == goog.dom.TagName.SPAN) {
      throw goog.iter.StopIteration;
      return true;
    }
    count++;
  };

  var matcher = new goog.dom.pattern.Matcher();
  matcher.addPattern(pattern1, callback);
  matcher.addPattern(pattern2, callback);

  matcher.match(document.body);

  assertEquals('Stopped span|p should match 1 time in body', 1, count);
}

function testMatcherWithReplace() {
  var pattern1 = new goog.dom.pattern.StartTag('B');
  var pattern2 = new goog.dom.pattern.StartTag('I');

  var count = 0;
  var callback = function(node, position) {
    count++;
    if (node.nodeName == goog.dom.TagName.B) {
      var i = goog.dom.createDom(goog.dom.TagName.I);
      node.parentNode.insertBefore(i, node);
      goog.dom.removeNode(node);

      position.setPosition(i);

      return true;
    }
  };

  var matcher = new goog.dom.pattern.Matcher();
  matcher.addPattern(pattern1, callback);
  matcher.addPattern(pattern2, callback);

  matcher.match(goog.dom.getElement('div1'));

  assertEquals('i|b->i should match 5 times in div1', 5, count);
}

function testMatcherAndFullTag() {
  var pattern = new goog.dom.pattern.FullTag('P');

  var test = new goog.dom.pattern.callback.Test();

  var matcher = new goog.dom.pattern.Matcher();
  matcher.addPattern(pattern, test.getCallback());

  matcher.match(goog.dom.getElement('p1'));

  assert('FullTag(p) should match on p1', test.matched);

  test.reset();
  matcher.match(goog.dom.getElement('div1'));

  assert('FullTag(p) should not match on div1', !test.matched);
}

function testMatcherAndSequence() {
  var pattern = new goog.dom.pattern.Sequence(
      [
        new goog.dom.pattern.StartTag('P'),
        new goog.dom.pattern.StartTag('SPAN'),
        new goog.dom.pattern.EndTag('SPAN'), new goog.dom.pattern.EndTag('P')
      ],
      true);

  var counter = new goog.dom.pattern.callback.Counter();
  var matcher = new goog.dom.pattern.Matcher();
  matcher.addPattern(pattern, counter.getCallback());
  matcher.match(document.body);

  assertEquals('Sequence should match 1 times in body', 1, counter.count);
}

function testMatcherAndRepeatFullTag() {
  var pattern =
      new goog.dom.pattern.Repeat(new goog.dom.pattern.FullTag('P'), 1);

  var count = 0;
  var tcount = 0;
  var matcher = new goog.dom.pattern.Matcher();
  matcher.addPattern(pattern, function() {
    count++;
    tcount += pattern.count;
  });
  matcher.match(document.body);

  assertEquals('Repeated p should match 2 times in body', 2, count);
  assertEquals('Repeated p should match 5 total times in body', 5, tcount);
}
