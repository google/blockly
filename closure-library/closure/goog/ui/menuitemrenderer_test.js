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

goog.provide('goog.ui.MenuItemRendererTest');
goog.setTestOnly('goog.ui.MenuItemRendererTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.a11y.aria.State');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.ui.rendererasserts');
goog.require('goog.ui.Component');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.MenuItemRenderer');

var sandbox;
var item, renderer;

function setUp() {
  sandbox = goog.dom.getElement('sandbox');
  item = new goog.ui.MenuItem('Hello');
  renderer = goog.ui.MenuItemRenderer.getInstance();
}

function tearDown() {
  item.dispose();
  goog.dom.removeChildren(sandbox);
}

function testMenuItemRenderer() {
  assertNotNull('Instance must not be null', renderer);
  assertEquals(
      'Singleton getter must always return same instance', renderer,
      goog.ui.MenuItemRenderer.getInstance());
}

function testCreateDom() {
  var element = renderer.createDom(item);
  assertNotNull('Element must not be null', element);
  assertSameElements(
      'Element must have the expected class names', ['goog-menuitem'],
      goog.dom.classlist.get(element));
  assertEquals(
      'Element must have exactly one child element', 1,
      element.childNodes.length);
  assertHTMLEquals(
      'Child element must have the expected structure',
      '<div class="goog-menuitem-content">Hello</div>', element.innerHTML);
}

function testCreateDomWithHoverState() {
  item.setHighlighted(true);
  var element = renderer.createDom(item);
  assertSameElements(
      'Element must have the expected class names',
      ['goog-menuitem', 'goog-menuitem-highlight'],
      goog.dom.classlist.get(element));
}

function testCreateDomForCheckableItem() {
  item.setSupportedState(goog.ui.Component.State.CHECKED, true);
  item.render();
  var element = item.getElement();
  assertNotNull(element);
  assertSameElements(
      'Element must have the expected class names',
      ['goog-menuitem', 'goog-option'], goog.dom.classlist.get(element));
  assertEquals(
      'Element must have ARIA role menuitemcheckbox',
      goog.a11y.aria.Role.MENU_ITEM_CHECKBOX, goog.a11y.aria.getRole(element));

  item.setChecked(true);
  assertTrue('Item must be checked', item.isChecked());
  assertSameElements(
      'Checked item must have the expected class names',
      ['goog-menuitem', 'goog-option', 'goog-option-selected'],
      goog.dom.classlist.get(element));
  assertEquals(
      'Item must have checked ARIA state', 'true',
      goog.a11y.aria.getState(element, goog.a11y.aria.State.CHECKED));
}

function testCreateUpdateDomForCheckableItem() {
  // Render the item first, then update its supported states to include CHECKED.
  item.render();
  var element = item.getElement();
  item.setSupportedState(goog.ui.Component.State.CHECKED, true);
  assertNotNull(element);
  assertSameElements(
      'Element must have the expected class names',
      ['goog-menuitem', 'goog-option'], goog.dom.classlist.get(element));
  assertEquals(
      'Element must have ARIA role menuitemcheckbox',
      goog.a11y.aria.Role.MENU_ITEM_CHECKBOX, goog.a11y.aria.getRole(element));

  // Now actually check the item.
  item.setChecked(true);
  assertTrue('Item must be checked', item.isChecked());
  assertSameElements(
      'Checked item must have the expected class names',
      ['goog-menuitem', 'goog-option', 'goog-option-selected'],
      goog.dom.classlist.get(element));
  assertEquals(
      'Item must have checked ARIA state', 'true',
      goog.a11y.aria.getState(element, goog.a11y.aria.State.CHECKED));
}

function testCreateDomForSelectableItem() {
  item.setSupportedState(goog.ui.Component.State.SELECTED, true);
  item.render();
  var element = item.getElement();
  assertNotNull(element);
  assertSameElements(
      'Element must have the expected class names',
      ['goog-menuitem', 'goog-option'], goog.dom.classlist.get(element));
  assertEquals(
      'Element must have ARIA role menuitemradio',
      goog.a11y.aria.Role.MENU_ITEM_RADIO, goog.a11y.aria.getRole(element));

  item.setSelected(true);
  assertTrue('Item must be selected', item.isSelected());
  assertSameElements(
      'Selected item must have the expected class names',
      ['goog-menuitem', 'goog-option', 'goog-option-selected'],
      goog.dom.classlist.get(element));
  assertEquals(
      'Item must have selected ARIA state', 'true',
      goog.a11y.aria.getState(element, goog.a11y.aria.State.CHECKED));
}

function testCreateUpdateDomForSelectableItem() {
  // Render the item first, then update its supported states to include
  // SELECTED.
  item.render();
  var element = item.getElement();
  item.setSupportedState(goog.ui.Component.State.SELECTED, true);
  assertNotNull(element);
  assertSameElements(
      'Element must have the expected class names',
      ['goog-menuitem', 'goog-option'], goog.dom.classlist.get(element));
  assertEquals(
      'Element must have ARIA role menuitemradio',
      goog.a11y.aria.Role.MENU_ITEM_RADIO, goog.a11y.aria.getRole(element));

  // Now actually select the item.
  item.setSelected(true);
  assertTrue('Item must be selected', item.isSelected());
  assertSameElements(
      'Selected item must have the expected class names',
      ['goog-menuitem', 'goog-option', 'goog-option-selected'],
      goog.dom.classlist.get(element));
  assertEquals(
      'Item must have selected ARIA state', 'true',
      goog.a11y.aria.getState(element, goog.a11y.aria.State.CHECKED));
}

function testGetContentElement() {
  assertNull(
      'Content element must be the null initially', item.getContentElement());
  item.createDom();
  assertEquals(
      'Content element must be the element\'s first child',
      item.getElement().firstChild, item.getContentElement());
}

function testDecorate() {
  sandbox.innerHTML = '<div id="foo">Hello</div>';
  var foo = goog.dom.getElement('foo');

  var element = renderer.decorate(item, foo);
  assertSameElements(
      'Element must have the expected class names', ['goog-menuitem'],
      goog.dom.classlist.get(element));
  assertEquals(
      'Element must have exactly one child element', 1,
      element.childNodes.length);
  assertHTMLEquals(
      'Child element must have the expected structure',
      '<div class="goog-menuitem-content">Hello</div>', element.innerHTML);
}

function testDecorateWithContentStructure() {
  sandbox.innerHTML =
      '<div id="foo"><div class="goog-menuitem-content">Hello</div></div>';
  var foo = goog.dom.getElement('foo');

  var element = renderer.decorate(item, foo);
  assertSameElements(
      'Element must have the expected class names', ['goog-menuitem'],
      goog.dom.classlist.get(element));
  assertEquals(
      'Element must have exactly one child element', 1,
      element.childNodes.length);
  assertHTMLEquals(
      'Child element must have the expected structure',
      '<div class="goog-menuitem-content">Hello</div>', element.innerHTML);
}

function testDecorateWithHoverState() {
  sandbox.innerHTML =
      '<div id="foo" class="goog-menuitem-highlight">Hello</div>';
  var foo = goog.dom.getElement('foo');

  assertFalse('Item must not be highlighted', item.isHighlighted());
  var element = renderer.decorate(item, foo);
  assertSameElements(
      'Element must have the expected class names',
      ['goog-menuitem', 'goog-menuitem-highlight'],
      goog.dom.classlist.get(element));
  assertTrue('Item must be highlighted', item.isHighlighted());
}

function testDecorateCheckableItem() {
  sandbox.innerHTML = '<div id="foo" class="goog-option">Hello</div>';
  var foo = goog.dom.getElement('foo');

  assertFalse(
      'Item must not be checkable',
      item.isSupportedState(goog.ui.Component.State.CHECKED));
  var element = renderer.decorate(item, foo);
  assertSameElements(
      'Element must have the expected class names',
      ['goog-menuitem', 'goog-option'], goog.dom.classlist.get(element));
  assertTrue(
      'Item must be checkable',
      item.isSupportedState(goog.ui.Component.State.CHECKED));
  assertHTMLEquals(
      'Child element must have the expected structure',
      '<div class="goog-menuitem-content">' +
          '<div class="goog-menuitem-checkbox"></div>Hello</div>',
      element.innerHTML);
}

function testSetContent() {
  item.setSupportedState(goog.ui.Component.State.CHECKED, true);
  var element = renderer.createDom(item);
  assertHTMLEquals(
      'Child element must have the expected structure',
      '<div class="goog-menuitem-content">' +
          '<div class="goog-menuitem-checkbox"></div>Hello</div>',
      element.innerHTML);

  renderer.setContent(element, 'Goodbye');
  assertHTMLEquals(
      'Child element must have the expected structure',
      '<div class="goog-menuitem-content">' +
          '<div class="goog-menuitem-checkbox"></div>Goodbye</div>',
      element.innerHTML);
}

function testDoesntCallGetCssClassInConstructor() {
  goog.testing.ui.rendererasserts.assertNoGetCssClassCallsInConstructor(
      goog.ui.MenuItemRenderer);
}
