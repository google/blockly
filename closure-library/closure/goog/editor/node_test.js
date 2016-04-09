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

goog.provide('goog.editor.nodeTest');
goog.setTestOnly('goog.editor.nodeTest');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.editor.node');
goog.require('goog.style');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.dom');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var expectedFailures;
var parentNode;
var childNode1;
var childNode2;
var childNode3;

var gChildWsNode1 = null;
var gChildTextNode1 = null;
var gChildNbspNode1 = null;
var gChildMixedNode1 = null;
var gChildWsNode2a = null;
var gChildWsNode2b = null;
var gChildTextNode3a = null;
var gChildWsNode3 = null;
var gChildTextNode3b = null;

function setUpPage() {
  expectedFailures = new goog.testing.ExpectedFailures();
  parentNode = document.getElementById('parentNode');
  childNode1 = parentNode.childNodes[0];
  childNode2 = parentNode.childNodes[1];
  childNode3 = parentNode.childNodes[2];
}


function tearDown() {
  expectedFailures.handleTearDown();
}

function setUpDomTree() {
  gChildWsNode1 = document.createTextNode(' \t\r\n');
  gChildTextNode1 = document.createTextNode('Child node');
  gChildNbspNode1 = document.createTextNode('\u00a0');
  gChildMixedNode1 = document.createTextNode('Text\n plus\u00a0');
  gChildWsNode2a = document.createTextNode('');
  gChildWsNode2b = document.createTextNode(' ');
  gChildTextNode3a = document.createTextNode('I am a grand child');
  gChildWsNode3 = document.createTextNode('   \t  \r   \n');
  gChildTextNode3b = document.createTextNode('I am also a grand child');

  childNode3.appendChild(gChildTextNode3a);
  childNode3.appendChild(gChildWsNode3);
  childNode3.appendChild(gChildTextNode3b);

  childNode1.appendChild(gChildMixedNode1);
  childNode1.appendChild(gChildWsNode1);
  childNode1.appendChild(gChildNbspNode1);
  childNode1.appendChild(gChildTextNode1);

  childNode2.appendChild(gChildWsNode2a);
  childNode2.appendChild(gChildWsNode2b);
  document.body.appendChild(parentNode);
}

function tearDownDomTree() {
  goog.dom.removeChildren(childNode1);
  goog.dom.removeChildren(childNode2);
  goog.dom.removeChildren(childNode3);
  gChildWsNode1 = null;
  gChildTextNode1 = null;
  gChildNbspNode1 = null;
  gChildMixedNode1 = null;
  gChildWsNode2a = null;
  gChildWsNode2b = null;
  gChildTextNode3a = null;
  gChildWsNode3 = null;
  gChildTextNode3b = null;
}

function testGetCompatModeQuirks() {
  var quirksIfr = document.createElement(goog.dom.TagName.IFRAME);
  document.body.appendChild(quirksIfr);
  // Webkit used to default to standards mode, but fixed this in
  // Safari 4/Chrome 2, aka, WebKit 530.
  // Also IE10 fails here.
  // TODO(johnlenz):  IE10+ inherit quirks mode from the owner document
  // according to:
  // http://msdn.microsoft.com/en-us/library/ff955402(v=vs.85).aspx
  // but this test shows different behavior for IE10 and 11. If we discover
  // that we care about quirks mode documents we should investigate
  // this failure.
  expectedFailures.expectFailureFor(
      (goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher('530')) ||
      (goog.userAgent.IE && goog.userAgent.isVersionOrHigher('10') &&
       !goog.userAgent.isVersionOrHigher('11')));
  expectedFailures.run(function() {
    assertFalse(
        'Empty sourceless iframe is quirks mode, not standards mode',
        goog.editor.node.isStandardsMode(
            goog.dom.getFrameContentDocument(quirksIfr)));
  });
  document.body.removeChild(quirksIfr);
}

function testGetCompatModeStandards() {
  var standardsIfr = document.createElement(goog.dom.TagName.IFRAME);
  document.body.appendChild(standardsIfr);
  var doc = goog.dom.getFrameContentDocument(standardsIfr);
  doc.open();
  doc.write('<!DOCTYPE HTML><html><head></head><body>&nbsp;</body></html>');
  doc.close();
  assertTrue(
      'Iframe with DOCTYPE written in is standards mode',
      goog.editor.node.isStandardsMode(doc));
  document.body.removeChild(standardsIfr);
}


/**
 * Creates a DOM tree and tests that getLeftMostLeaf returns proper node
 */
function testGetLeftMostLeaf() {
  setUpDomTree();

  assertEquals(
      'Should skip ws node', gChildMixedNode1,
      goog.editor.node.getLeftMostLeaf(parentNode));
  assertEquals(
      'Should skip ws node', gChildMixedNode1,
      goog.editor.node.getLeftMostLeaf(childNode1));
  assertEquals(
      'Has no non ws leaves', childNode2,
      goog.editor.node.getLeftMostLeaf(childNode2));
  assertEquals(
      'Should return first child', gChildTextNode3a,
      goog.editor.node.getLeftMostLeaf(childNode3));
  assertEquals(
      'Has no children', gChildTextNode1,
      goog.editor.node.getLeftMostLeaf(gChildTextNode1));

  tearDownDomTree();
}


/**
 * Creates a DOM tree and tests that getRightMostLeaf returns proper node
 */
function testGetRightMostLeaf() {
  setUpDomTree();

  assertEquals(
      "Should return child3's rightmost child", gChildTextNode3b,
      goog.editor.node.getRightMostLeaf(parentNode));
  assertEquals(
      'Should skip ws node', gChildTextNode1,
      goog.editor.node.getRightMostLeaf(childNode1));
  assertEquals(
      'Has no non ws leaves', childNode2,
      goog.editor.node.getRightMostLeaf(childNode2));
  assertEquals(
      'Should return last child', gChildTextNode3b,
      goog.editor.node.getRightMostLeaf(childNode3));
  assertEquals(
      'Has no children', gChildTextNode1,
      goog.editor.node.getRightMostLeaf(gChildTextNode1));

  tearDownDomTree();
}


/**
 * Creates a DOM tree and tests that getFirstChild properly ignores
 * ignorable nodes
 */
function testGetFirstChild() {
  setUpDomTree();

  assertNull(
      'Has no none ws children', goog.editor.node.getFirstChild(childNode2));
  assertEquals(
      'Should skip first child, as it is ws', gChildMixedNode1,
      goog.editor.node.getFirstChild(childNode1));
  assertEquals(
      'Should just return first child', gChildTextNode3a,
      goog.editor.node.getFirstChild(childNode3));
  assertEquals(
      'Should return first child', childNode1,
      goog.editor.node.getFirstChild(parentNode));

  assertNull(
      'First child of a text node should return null',
      goog.editor.node.getFirstChild(gChildTextNode1));
  assertNull(
      'First child of null should return null',
      goog.editor.node.getFirstChild(null));

  tearDownDomTree();
}


/**
 * Create a DOM tree and test that getLastChild properly ignores
 * ignorable nodes
 */
function testGetLastChild() {
  setUpDomTree();

  assertNull(
      'Has no none ws children', goog.editor.node.getLastChild(childNode2));
  assertEquals(
      'Should skip last child, as it is ws', gChildTextNode1,
      goog.editor.node.getLastChild(childNode1));
  assertEquals(
      'Should just return last child', gChildTextNode3b,
      goog.editor.node.getLastChild(childNode3));
  assertEquals(
      'Should return last child', childNode3,
      goog.editor.node.getLastChild(parentNode));

  assertNull(
      'Last child of a text node should return null',
      goog.editor.node.getLastChild(gChildTextNode1));
  assertNull(
      'Last child of null should return null',
      goog.editor.node.getLastChild(gChildTextNode1));

  tearDownDomTree();
}


/**
 * Test if nodes that should be ignorable return false and nodes that should
 * not be ignored return true.
 */
function testIsImportant() {
  var wsNode = document.createTextNode(' \t\r\n');
  assertFalse(
      'White space node is ignorable', goog.editor.node.isImportant(wsNode));
  var textNode = document.createTextNode('Hello');
  assertTrue('Text node is important', goog.editor.node.isImportant(textNode));
  var nbspNode = document.createTextNode('\u00a0');
  assertTrue(
      'Node with nbsp is important', goog.editor.node.isImportant(nbspNode));
  var imageNode = document.createElement(goog.dom.TagName.IMG);
  assertTrue(
      'Image node is important', goog.editor.node.isImportant(imageNode));
}


/**
 * Test that isAllNonNbspWhiteSpace returns true if node contains only
 * whitespace that is not nbsp and false otherwise
 */
function testIsAllNonNbspWhiteSpace() {
  var wsNode = document.createTextNode(' \t\r\n');
  assertTrue(
      'String is all non nbsp',
      goog.editor.node.isAllNonNbspWhiteSpace(wsNode));
  var textNode = document.createTextNode('Hello');
  assertFalse(
      'String should not be whitespace',
      goog.editor.node.isAllNonNbspWhiteSpace(textNode));
  var nbspNode = document.createTextNode('\u00a0');
  assertFalse(
      'String has nbsp', goog.editor.node.isAllNonNbspWhiteSpace(nbspNode));
}


/**
 * Creates a DOM tree and Test that getPreviousSibling properly ignores
 * ignorable nodes
 */
function testGetPreviousSibling() {
  setUpDomTree();

  assertNull(
      'No previous sibling',
      goog.editor.node.getPreviousSibling(gChildTextNode3a));
  assertEquals(
      'Should have text sibling', gChildTextNode3a,
      goog.editor.node.getPreviousSibling(gChildWsNode3));
  assertEquals(
      'Should skip over white space sibling', gChildTextNode3a,
      goog.editor.node.getPreviousSibling(gChildTextNode3b));
  assertNull(
      'No previous sibling',
      goog.editor.node.getPreviousSibling(gChildMixedNode1));
  assertEquals(
      'Should have mixed text sibling', gChildMixedNode1,
      goog.editor.node.getPreviousSibling(gChildWsNode1));
  assertEquals(
      'Should skip over white space sibling', gChildMixedNode1,
      goog.editor.node.getPreviousSibling(gChildNbspNode1));
  assertNotEquals(
      'Should not move past ws and nbsp', gChildMixedNode1,
      goog.editor.node.getPreviousSibling(gChildTextNode1));
  assertEquals(
      'Should go to child 2', childNode2,
      goog.editor.node.getPreviousSibling(childNode3));
  assertEquals(
      'Should go to child 1', childNode1,
      goog.editor.node.getPreviousSibling(childNode2));
  assertNull(
      'Only has white space siblings',
      goog.editor.node.getPreviousSibling(gChildWsNode2b));

  tearDownDomTree();
}


/**
 * Creates a DOM tree and tests that getNextSibling properly ignores igrnorable
 * nodes when determining the next sibling
 */
function testGetNextSibling() {
  setUpDomTree();

  assertEquals(
      'Child 1 should have Child 2', childNode2,
      goog.editor.node.getNextSibling(childNode1));
  assertEquals(
      'Child 2 should have child 3', childNode3,
      goog.editor.node.getNextSibling(childNode2));
  assertNull(
      'Child 3 has no next sibling',
      goog.editor.node.getNextSibling(childNode3));
  assertNotEquals(
      'Should not skip ws and nbsp nodes', gChildTextNode1,
      goog.editor.node.getNextSibling(gChildMixedNode1));
  assertNotEquals(
      'Should not skip nbsp node', gChildTextNode1,
      goog.editor.node.getNextSibling(gChildWsNode1));
  assertEquals(
      'Should have sibling', gChildTextNode1,
      goog.editor.node.getNextSibling(gChildNbspNode1));
  assertNull(
      'Should have no next sibling',
      goog.editor.node.getNextSibling(gChildTextNode1));
  assertNull(
      'Only has ws sibling', goog.editor.node.getNextSibling(gChildWsNode2a));
  assertNull(
      'Has no next sibling', goog.editor.node.getNextSibling(gChildWsNode2b));
  assertEquals(
      'Should skip ws node', gChildTextNode3b,
      goog.editor.node.getNextSibling(gChildTextNode3a));

  tearDownDomTree();
}


function testIsEmpty() {
  var textNode = document.createTextNode('');
  assertTrue(
      'Text node with no content should be empty',
      goog.editor.node.isEmpty(textNode));
  textNode.data = '\xa0';
  assertTrue(
      'Text node with nbsp should be empty',
      goog.editor.node.isEmpty(textNode));
  assertFalse(
      'Text node with nbsp should not be empty when prohibited',
      goog.editor.node.isEmpty(textNode, true));

  textNode.data = '     ';
  assertTrue(
      'Text node with whitespace should be empty',
      goog.editor.node.isEmpty(textNode));
  textNode.data = 'notEmpty';
  assertFalse(
      'Text node with text should not be empty',
      goog.editor.node.isEmpty(textNode));

  var div = document.createElement(goog.dom.TagName.DIV);
  assertTrue('Empty div should be empty', goog.editor.node.isEmpty(div));
  div.innerHTML = '<iframe></iframe>';
  assertFalse(
      'Div containing an iframe is not empty', goog.editor.node.isEmpty(div));
  div.innerHTML = '<img></img>';
  assertFalse(
      'Div containing an image is not empty', goog.editor.node.isEmpty(div));
  div.innerHTML = '<embed></embed>';
  assertFalse(
      'Div containing an embed is not empty', goog.editor.node.isEmpty(div));
  div.innerHTML = '<div><span></span></div>';
  assertTrue(
      'Div containing other empty tags is empty',
      goog.editor.node.isEmpty(div));
  div.innerHTML = '<div><span>  </span></div>';
  assertTrue(
      'Div containing other empty tags and whitespace is empty',
      goog.editor.node.isEmpty(div));
  div.innerHTML = '<div><span>Not empty</span></div>';
  assertFalse(
      'Div containing tags and text is not empty',
      goog.editor.node.isEmpty(div));

  var img = document.createElement(goog.dom.TagName.IMG);
  assertFalse('Empty img should not be empty', goog.editor.node.isEmpty(img));

  var iframe = document.createElement(goog.dom.TagName.IFRAME);
  assertFalse(
      'Empty iframe should not be empty', goog.editor.node.isEmpty(iframe));

  var embed = document.createElement(goog.dom.TagName.EMBED);
  assertFalse(
      'Empty embed should not be empty', goog.editor.node.isEmpty(embed));
}


/**
 * Test that getLength returns 0 if the node has no length and no children,
 * the # of children if the node has no length but does have children,
 * and the length of the node if the node does have length
 */
function testGetLength() {
  var parentNode = document.createElement(goog.dom.TagName.P);

  assertEquals(
      'Length 0 and no children', 0, goog.editor.node.getLength(parentNode));

  var childNode1 = document.createTextNode('node 1');
  var childNode2 = document.createTextNode('node number 2');
  var childNode3 = document.createTextNode('');
  parentNode.appendChild(childNode1);
  parentNode.appendChild(childNode2);
  parentNode.appendChild(childNode3);
  assertEquals(
      'Length 0 and 3 children', 3, goog.editor.node.getLength(parentNode));
  assertEquals(
      'Text node, length 6', 6, goog.editor.node.getLength(childNode1));
  assertEquals(
      'Text node, length 0', 0, goog.editor.node.getLength(childNode3));
}

function testFindInChildrenSuccess() {
  var parentNode = document.createElement(goog.dom.TagName.DIV);
  parentNode.innerHTML = '<div>foo</div><b>foo2</b>';

  var index = goog.editor.node.findInChildren(parentNode, function(node) {
    return node.tagName == goog.dom.TagName.B;
  });
  assertEquals('Should find second child', index, 1);
}

function testFindInChildrenFailure() {
  var parentNode = document.createElement(goog.dom.TagName.DIV);
  parentNode.innerHTML = '<div>foo</div><b>foo2</b>';

  var index = goog.editor.node.findInChildren(
      parentNode, function(node) { return false; });
  assertNull("Shouldn't find a child", index);
}

function testFindHighestMatchingAncestor() {
  setUpDomTree();
  var predicateFunc = function(node) {
    return node.tagName == goog.dom.TagName.DIV;
  };
  var node = goog.editor.node.findHighestMatchingAncestor(
      gChildTextNode3a, predicateFunc);
  assertNotNull('Should return an ancestor', node);
  assertEquals(
      'Should have found "parentNode" as the last ' +
          'ancestor matching the predicate',
      parentNode, node);

  predicateFunc = function(node) { return node.childNodes.length == 1; };
  node = goog.editor.node.findHighestMatchingAncestor(
      gChildTextNode3a, predicateFunc);
  assertNull("Shouldn't return an ancestor", node);

  tearDownDomTree();
}

function testIsBlock() {
  var blockDisplays = [
    'block', 'list-item', 'table', 'table-caption', 'table-cell',
    'table-column', 'table-column-group', 'table-footer', 'table-footer-group',
    'table-header-group', 'table-row', 'table-row-group'
  ];

  var structuralTags = [
    goog.dom.TagName.BODY, goog.dom.TagName.FRAME, goog.dom.TagName.FRAMESET,
    goog.dom.TagName.HEAD, goog.dom.TagName.HTML
  ];

  // The following tags are considered inline in IE, except LEGEND which is
  // only a block element in WEBKIT.
  var ambiguousTags = [
    goog.dom.TagName.DETAILS, goog.dom.TagName.HR, goog.dom.TagName.ISINDEX,
    goog.dom.TagName.LEGEND, goog.dom.TagName.MAP, goog.dom.TagName.NOFRAMES,
    goog.dom.TagName.OPTGROUP, goog.dom.TagName.OPTION, goog.dom.TagName.SUMMARY
  ];

  // Older versions of IE and Gecko consider the following elements to be
  // inline, but IE9+ and Gecko 2.0+ recognize the new elements.
  var legacyAmbiguousTags = [
    goog.dom.TagName.ARTICLE, goog.dom.TagName.ASIDE,
    goog.dom.TagName.FIGCAPTION, goog.dom.TagName.FIGURE,
    goog.dom.TagName.FOOTER, goog.dom.TagName.HEADER, goog.dom.TagName.HGROUP,
    goog.dom.TagName.NAV, goog.dom.TagName.SECTION
  ];

  var tagsToIgnore = goog.array.flatten(structuralTags, ambiguousTags);

  if ((goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) ||
      (goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher('2'))) {
    goog.array.extend(tagsToIgnore, legacyAmbiguousTags);
  }

  // Appending an applet tag can cause the test to hang if Java is blocked on
  // the system.
  tagsToIgnore.push(goog.dom.TagName.APPLET);

  // Appending an embed tag to the page in IE brings up a warning dialog about
  // loading Java content.
  if (goog.userAgent.IE) {
    tagsToIgnore.push(goog.dom.TagName.EMBED);
  }

  for (var tag in goog.dom.TagName) {
    if (goog.array.contains(tagsToIgnore, tag)) {
      continue;
    }

    var el = goog.dom.createElement(tag);
    document.body.appendChild(el);
    var display = goog.style.getCascadedStyle(el, 'display') ||
        goog.style.getComputedStyle(el, 'display');
    goog.dom.removeNode(el);

    if (goog.editor.node.isBlockTag(el)) {
      assertContains(
          'Display for ' + tag + ' should be block-like', display,
          blockDisplays);
    } else {
      assertNotContains(
          'Display for ' + tag + ' should not be block-like', display,
          blockDisplays);
    }
  }
}

function createDivWithTextNodes(var_args) {
  var dom = goog.dom.createDom(goog.dom.TagName.DIV);
  for (var i = 0; i < arguments.length; i++) {
    goog.dom.appendChild(dom, goog.dom.createTextNode(arguments[i]));
  }
  return dom;
}

function testSkipEmptyTextNodes() {
  assertNull(
      'skipEmptyTextNodes should gracefully handle null',
      goog.editor.node.skipEmptyTextNodes(null));

  var dom1 = createDivWithTextNodes('abc', '', 'xyz', '', '');
  assertEquals(
      'expected not to skip first child', dom1.firstChild,
      goog.editor.node.skipEmptyTextNodes(dom1.firstChild));
  assertEquals(
      'expected to skip second child', dom1.childNodes[2],
      goog.editor.node.skipEmptyTextNodes(dom1.childNodes[1]));
  assertNull(
      'expected to skip all the rest of the children',
      goog.editor.node.skipEmptyTextNodes(dom1.childNodes[3]));
}

function testIsEditableContainer() {
  var editableContainerElement = document.getElementById('editableTest');
  assertTrue(
      'Container element should be considered editable container',
      goog.editor.node.isEditableContainer(editableContainerElement));

  var nonEditableContainerElement = document.getElementById('parentNode');
  assertFalse(
      'Other element should not be considered editable container',
      goog.editor.node.isEditableContainer(nonEditableContainerElement));
}

function testIsEditable() {
  var editableContainerElement = document.getElementById('editableTest');
  var childNode = editableContainerElement.firstChild;
  var childElement =
      editableContainerElement.getElementsByTagName(goog.dom.TagName.SPAN)[0];

  assertFalse(
      'Container element should not be considered editable',
      goog.editor.node.isEditable(editableContainerElement));
  assertTrue(
      'Child text node should be considered editable',
      goog.editor.node.isEditable(childNode));
  assertTrue(
      'Child element should be considered editable',
      goog.editor.node.isEditable(childElement));
  assertTrue(
      'Grandchild node should be considered editable',
      goog.editor.node.isEditable(childElement.firstChild));
  assertFalse(
      'Other element should not be considered editable',
      goog.editor.node.isEditable(document.getElementById('parentNode')));
}

function testFindTopMostEditableAncestor() {
  var root = document.getElementById('editableTest');
  var span = root.getElementsByTagName(goog.dom.TagName.SPAN)[0];
  var textNode = span.firstChild;

  assertEquals(
      'Should return self if self is matched.', textNode,
      goog.editor.node.findTopMostEditableAncestor(textNode, function(node) {
        return node.nodeType == goog.dom.NodeType.TEXT;
      }));
  assertEquals(
      'Should not walk out of editable node.', null,
      goog.editor.node.findTopMostEditableAncestor(textNode, function(node) {
        return node.tagName == goog.dom.TagName.BODY;
      }));
  assertEquals(
      'Should not match editable container.', null,
      goog.editor.node.findTopMostEditableAncestor(textNode, function(node) {
        return node.tagName == goog.dom.TagName.DIV;
      }));
  assertEquals(
      'Should find node in editable container.', span,
      goog.editor.node.findTopMostEditableAncestor(textNode, function(node) {
        return node.tagName == goog.dom.TagName.SPAN;
      }));
}

function testSplitDomTreeAt() {
  var innerHTML = '<p>1<b>2</b>3</p>';
  var root = goog.dom.createElement(goog.dom.TagName.DIV);

  root.innerHTML = innerHTML;
  var result = goog.editor.node.splitDomTreeAt(
      root.getElementsByTagName(goog.dom.TagName.B)[0], null, root);
  goog.testing.dom.assertHtmlContentsMatch('<p>1<b>2</b></p>', root);
  goog.testing.dom.assertHtmlContentsMatch('<p>3</p>', result);

  root.innerHTML = innerHTML;
  result = goog.editor.node.splitDomTreeAt(
      root.getElementsByTagName(goog.dom.TagName.B)[0],
      goog.dom.createTextNode('and'), root);
  goog.testing.dom.assertHtmlContentsMatch('<p>1<b>2</b></p>', root);
  goog.testing.dom.assertHtmlContentsMatch('<p>and3</p>', result);
}

function testTransferChildren() {
  var prefix = '<b>Bold 1</b>';
  var innerHTML = '<b>Bold</b><ul><li>Item 1</li><li>Item 2</li></ul>';

  var root1 = goog.dom.createElement(goog.dom.TagName.DIV);
  root1.innerHTML = innerHTML;

  var root2 = goog.dom.createElement(goog.dom.TagName.P);
  root2.innerHTML = prefix;

  var b = root1.getElementsByTagName(goog.dom.TagName.B)[0];

  // Transfer the children.
  goog.editor.node.transferChildren(root2, root1);
  assertEquals(0, root1.childNodes.length);
  goog.testing.dom.assertHtmlContentsMatch(prefix + innerHTML, root2);
  assertEquals(b, root2.getElementsByTagName(goog.dom.TagName.B)[1]);

  // Transfer them back.
  goog.editor.node.transferChildren(root1, root2);
  assertEquals(0, root2.childNodes.length);
  goog.testing.dom.assertHtmlContentsMatch(prefix + innerHTML, root1);
  assertEquals(b, root1.getElementsByTagName(goog.dom.TagName.B)[1]);
}
