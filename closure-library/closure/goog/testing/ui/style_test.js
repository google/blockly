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

goog.provide('goog.testing.ui.styleTest');
goog.setTestOnly('goog.testing.ui.styleTest');

goog.require('goog.dom');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.ui.style');

// Write iFrame tag to load reference FastUI markup. Then, our tests will
// compare the generated markup to the reference markup.
var refPath = 'style_reference.html';
goog.testing.ui.style.writeReferenceFrame(refPath);

// assertStructureMatchesReference should succeed if the structure, node
// names, and classes match.
function testCorrect() {
  var el = goog.dom.getFirstElementChild(goog.dom.getElement('correct'));
  goog.testing.ui.style.assertStructureMatchesReference(el, 'reference');
}

// assertStructureMatchesReference should fail if one of the nodes is
// missing a class.
function testMissingClass() {
  var el = goog.dom.getFirstElementChild(
      goog.dom.getElement('missing-class'));
  var e = assertThrows(function() {
    goog.testing.ui.style.assertStructureMatchesReference(el, 'reference');
  });
  assertContains('all reference classes', e.message);
}

// assertStructureMatchesReference should NOT fail if one of the nodes has
// an additional class.
function testExtraClass() {
  var el = goog.dom.getFirstElementChild(
      goog.dom.getElement('extra-class'));
  goog.testing.ui.style.assertStructureMatchesReference(el, 'reference');
}

// assertStructureMatchesReference should fail if there is a missing child
// node somewhere in the DOM structure.
function testMissingChild() {
  var el = goog.dom.getFirstElementChild(
      goog.dom.getElement('missing-child'));
  var e = assertThrows(function() {
    goog.testing.ui.style.assertStructureMatchesReference(el, 'reference');
  });
  assertContains('same number of children', e.message);
}

// assertStructureMatchesReference should fail if there is an extra child
// node somewhere in the DOM structure.
function testExtraChild() {
  var el = goog.dom.getFirstElementChild(
      goog.dom.getElement('extra-child'));
  var e = assertThrows(function() {
    goog.testing.ui.style.assertStructureMatchesReference(el, 'reference');
  });
  assertContains('same number of children', e.message);
}
