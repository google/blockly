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

goog.provide('goog.ui.CheckboxTest');
goog.setTestOnly('goog.ui.CheckboxTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.a11y.aria.State');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Checkbox');
goog.require('goog.ui.CheckboxRenderer');
goog.require('goog.ui.Component');
goog.require('goog.ui.ControlRenderer');
goog.require('goog.ui.decorate');

var checkbox;

function setUp() {
  checkbox = new goog.ui.Checkbox();
}

function tearDown() {
  checkbox.dispose();
}

function testClassNames() {
  checkbox.createDom();

  checkbox.setChecked(false);
  assertSameElements(
      'classnames of unchecked checkbox',
      ['goog-checkbox', 'goog-checkbox-unchecked'],
      goog.dom.classlist.get(checkbox.getElement()));

  checkbox.setChecked(true);
  assertSameElements(
      'classnames of checked checkbox',
      ['goog-checkbox', 'goog-checkbox-checked'],
      goog.dom.classlist.get(checkbox.getElement()));

  checkbox.setChecked(null);
  assertSameElements(
      'classnames of partially checked checkbox',
      ['goog-checkbox', 'goog-checkbox-undetermined'],
      goog.dom.classlist.get(checkbox.getElement()));

  checkbox.setEnabled(false);
  assertSameElements(
      'classnames of partially checked disabled checkbox',
      ['goog-checkbox', 'goog-checkbox-undetermined', 'goog-checkbox-disabled'],
      goog.dom.classlist.get(checkbox.getElement()));
}

function testIsEnabled() {
  assertTrue('enabled by default', checkbox.isEnabled());
  checkbox.setEnabled(false);
  assertFalse('has been disabled', checkbox.isEnabled());
}

function testCheckedState() {
  assertTrue(
      'unchecked by default', !checkbox.isChecked() && checkbox.isUnchecked() &&
          !checkbox.isUndetermined());

  checkbox.setChecked(true);
  assertTrue(
      'set to checked', checkbox.isChecked() && !checkbox.isUnchecked() &&
          !checkbox.isUndetermined());

  checkbox.setChecked(null);
  assertTrue(
      'set to partially checked', !checkbox.isChecked() &&
          !checkbox.isUnchecked() && checkbox.isUndetermined());
}

function testToggle() {
  checkbox.setChecked(null);
  checkbox.toggle();
  assertTrue('undetermined -> checked', checkbox.getChecked());
  checkbox.toggle();
  assertFalse('checked -> unchecked', checkbox.getChecked());
  checkbox.toggle();
  assertTrue('unchecked -> checked', checkbox.getChecked());
}

function testEvents() {
  checkbox.render();

  var events = [];
  goog.events.listen(
      checkbox,
      [
        goog.ui.Component.EventType.ACTION, goog.ui.Component.EventType.CHECK,
        goog.ui.Component.EventType.UNCHECK, goog.ui.Component.EventType.CHANGE
      ],
      function(e) { events.push(e.type); });

  checkbox.setEnabled(false);
  goog.testing.events.fireClickSequence(checkbox.getElement());
  assertArrayEquals('disabled => no events', [], events);
  assertFalse('checked state did not change', checkbox.getChecked());
  events = [];

  checkbox.setEnabled(true);
  goog.testing.events.fireClickSequence(checkbox.getElement());
  assertArrayEquals(
      'ACTION+CHECK+CHANGE fired',
      [
        goog.ui.Component.EventType.ACTION, goog.ui.Component.EventType.CHECK,
        goog.ui.Component.EventType.CHANGE
      ],
      events);
  assertTrue('checkbox became checked', checkbox.getChecked());
  events = [];

  goog.testing.events.fireClickSequence(checkbox.getElement());
  assertArrayEquals(
      'ACTION+UNCHECK+CHANGE fired',
      [
        goog.ui.Component.EventType.ACTION, goog.ui.Component.EventType.UNCHECK,
        goog.ui.Component.EventType.CHANGE
      ],
      events);
  assertFalse('checkbox became unchecked', checkbox.getChecked());
  events = [];

  goog.events.listen(checkbox, goog.ui.Component.EventType.CHECK, function(e) {
    e.preventDefault();
  });
  goog.testing.events.fireClickSequence(checkbox.getElement());
  assertArrayEquals(
      'ACTION+CHECK fired',
      [goog.ui.Component.EventType.ACTION, goog.ui.Component.EventType.CHECK],
      events);
  assertFalse('toggling has been prevented', checkbox.getChecked());
}

function testCheckboxAriaLabelledby() {
  var label = goog.dom.createElement(goog.dom.TagName.DIV);
  var label2 = goog.dom.createElement(
      goog.dom.TagName.DIV, {id: checkbox.makeId('foo')});
  document.body.appendChild(label);
  document.body.appendChild(label2);
  try {
    checkbox.setChecked(false);
    checkbox.setLabel(label);
    checkbox.render(label);
    assertNotNull(checkbox.getElement());
    assertEquals(
        label.id, goog.a11y.aria.getState(
                      checkbox.getElement(), goog.a11y.aria.State.LABELLEDBY));

    checkbox.setLabel(label2);
    assertEquals(
        label2.id, goog.a11y.aria.getState(
                       checkbox.getElement(), goog.a11y.aria.State.LABELLEDBY));
  } finally {
    document.body.removeChild(label);
    document.body.removeChild(label2);
  }
}

function testLabel() {
  var label = goog.dom.createElement(goog.dom.TagName.DIV);
  document.body.appendChild(label);
  try {
    checkbox.setChecked(false);
    checkbox.setLabel(label);
    checkbox.render(label);

    // Clicking on label toggles checkbox.
    goog.testing.events.fireClickSequence(label);
    assertTrue(
        'checkbox toggled if the label is clicked', checkbox.getChecked());
    goog.testing.events.fireClickSequence(checkbox.getElement());
    assertFalse('checkbox toggled if it is clicked', checkbox.getChecked());

    // Test that mouse events on the label have the correct effect on the
    // checkbox state when it is enabled.
    checkbox.setEnabled(true);
    goog.testing.events.fireMouseOverEvent(label);
    assertTrue(checkbox.hasState(goog.ui.Component.State.HOVER));
    assertContains(
        'checkbox gets hover state on mouse over', 'goog-checkbox-hover',
        goog.dom.classlist.get(checkbox.getElement()));
    goog.testing.events.fireMouseDownEvent(label);
    assertTrue(checkbox.hasState(goog.ui.Component.State.ACTIVE));
    assertContains(
        'checkbox gets active state on label mousedown', 'goog-checkbox-active',
        goog.dom.classlist.get(checkbox.getElement()));
    goog.testing.events.fireMouseOutEvent(checkbox.getElement());
    assertFalse(checkbox.hasState(goog.ui.Component.State.HOVER));
    assertNotContains(
        'checkbox does not have hover state after mouse out',
        'goog-checkbox-hover', goog.dom.classlist.get(checkbox.getElement()));
    assertFalse(checkbox.hasState(goog.ui.Component.State.ACTIVE));
    assertNotContains(
        'checkbox does not have active state after mouse out',
        'goog-checkbox-active', goog.dom.classlist.get(checkbox.getElement()));

    // Test label mouse events on disabled checkbox.
    checkbox.setEnabled(false);
    goog.testing.events.fireMouseOverEvent(label);
    assertFalse(checkbox.hasState(goog.ui.Component.State.HOVER));
    assertNotContains(
        'disabled checkbox does not get hover state on mouseover',
        'goog-checkbox-hover', goog.dom.classlist.get(checkbox.getElement()));
    goog.testing.events.fireMouseDownEvent(label);
    assertFalse(checkbox.hasState(goog.ui.Component.State.ACTIVE));
    assertNotContains(
        'disabled checkbox does not get active state mousedown',
        'goog-checkbox-active', goog.dom.classlist.get(checkbox.getElement()));
    goog.testing.events.fireMouseOutEvent(checkbox.getElement());
    assertFalse(checkbox.hasState(goog.ui.Component.State.ACTIVE));
    assertNotContains(
        'checkbox does not get stuck in hover state', 'goog-checkbox-hover',
        goog.dom.classlist.get(checkbox.getElement()));

    // Making the label null prevents it from affecting checkbox state.
    checkbox.setEnabled(true);
    checkbox.setLabel(null);
    goog.testing.events.fireClickSequence(label);
    assertFalse('label element deactivated', checkbox.getChecked());
    goog.testing.events.fireClickSequence(checkbox.getElement());
    assertTrue('checkbox still active', checkbox.getChecked());
  } finally {
    document.body.removeChild(label);
  }
}

function testLabel_setAgain() {
  var label = goog.dom.createElement(goog.dom.TagName.DIV);
  document.body.appendChild(label);
  try {
    checkbox.setChecked(false);
    checkbox.setLabel(label);
    checkbox.render(label);

    checkbox.getElement().focus();
    checkbox.setLabel(label);
    assertEquals(
        'checkbox should not have lost focus', checkbox.getElement(),
        document.activeElement);
  } finally {
    document.body.removeChild(label);
  }
}

function testConstructor() {
  assertEquals(
      'state is unchecked', goog.ui.Checkbox.State.UNCHECKED,
      checkbox.getChecked());

  var testCheckboxWithState =
      new goog.ui.Checkbox(goog.ui.Checkbox.State.UNDETERMINED);
  assertNotNull('checkbox created with custom state', testCheckboxWithState);
  assertEquals(
      'checkbox state is undetermined', goog.ui.Checkbox.State.UNDETERMINED,
      testCheckboxWithState.getChecked());
  testCheckboxWithState.dispose();
}

function testCustomRenderer() {
  var cssClass = 'my-custom-checkbox';
  var renderer = goog.ui.ControlRenderer.getCustomRenderer(
      goog.ui.CheckboxRenderer, cssClass);
  var customCheckbox = new goog.ui.Checkbox(undefined, undefined, renderer);
  customCheckbox.createDom();
  assertElementsEquals(
      ['my-custom-checkbox', 'my-custom-checkbox-unchecked'],
      goog.dom.classlist.get(customCheckbox.getElement()));
  customCheckbox.setChecked(true);
  assertElementsEquals(
      ['my-custom-checkbox', 'my-custom-checkbox-checked'],
      goog.dom.classlist.get(customCheckbox.getElement()));
  customCheckbox.setChecked(null);
  assertElementsEquals(
      ['my-custom-checkbox', 'my-custom-checkbox-undetermined'],
      goog.dom.classlist.get(customCheckbox.getElement()));
  customCheckbox.dispose();
}

function testGetAriaRole() {
  checkbox.createDom();
  assertNotNull(checkbox.getElement());
  assertEquals(
      "Checkbox's ARIA role should be 'checkbox'", goog.a11y.aria.Role.CHECKBOX,
      goog.a11y.aria.getRole(checkbox.getElement()));
}

function testCreateDomUpdateAriaState() {
  checkbox.createDom();
  assertNotNull(checkbox.getElement());
  assertEquals(
      'Checkbox must have default false ARIA state aria-checked', 'false',
      goog.a11y.aria.getState(
          checkbox.getElement(), goog.a11y.aria.State.CHECKED));

  checkbox.setChecked(goog.ui.Checkbox.State.CHECKED);
  assertEquals(
      'Checkbox must have true ARIA state aria-checked', 'true',
      goog.a11y.aria.getState(
          checkbox.getElement(), goog.a11y.aria.State.CHECKED));

  checkbox.setChecked(goog.ui.Checkbox.State.UNCHECKED);
  assertEquals(
      'Checkbox must have false ARIA state aria-checked', 'false',
      goog.a11y.aria.getState(
          checkbox.getElement(), goog.a11y.aria.State.CHECKED));

  checkbox.setChecked(goog.ui.Checkbox.State.UNDETERMINED);
  assertEquals(
      'Checkbox must have mixed ARIA state aria-checked', 'mixed',
      goog.a11y.aria.getState(
          checkbox.getElement(), goog.a11y.aria.State.CHECKED));
}

function testDecorateUpdateAriaState() {
  var decorateSpan = goog.dom.getElement('decorate');
  checkbox.decorate(decorateSpan);

  assertEquals(
      'Checkbox must have default false ARIA state aria-checked', 'false',
      goog.a11y.aria.getState(
          checkbox.getElement(), goog.a11y.aria.State.CHECKED));

  checkbox.setChecked(goog.ui.Checkbox.State.CHECKED);
  assertEquals(
      'Checkbox must have true ARIA state aria-checked', 'true',
      goog.a11y.aria.getState(
          checkbox.getElement(), goog.a11y.aria.State.CHECKED));

  checkbox.setChecked(goog.ui.Checkbox.State.UNCHECKED);
  assertEquals(
      'Checkbox must have false ARIA state aria-checked', 'false',
      goog.a11y.aria.getState(
          checkbox.getElement(), goog.a11y.aria.State.CHECKED));

  checkbox.setChecked(goog.ui.Checkbox.State.UNDETERMINED);
  assertEquals(
      'Checkbox must have mixed ARIA state aria-checked', 'mixed',
      goog.a11y.aria.getState(
          checkbox.getElement(), goog.a11y.aria.State.CHECKED));
}

function testSpaceKey() {
  var normalSpan = goog.dom.getElement('normal');

  checkbox.decorate(normalSpan);
  assertEquals(
      'default state is unchecked', goog.ui.Checkbox.State.UNCHECKED,
      checkbox.getChecked());
  goog.testing.events.fireKeySequence(normalSpan, goog.events.KeyCodes.SPACE);
  assertEquals(
      'SPACE toggles checkbox to be checked', goog.ui.Checkbox.State.CHECKED,
      checkbox.getChecked());
  goog.testing.events.fireKeySequence(normalSpan, goog.events.KeyCodes.SPACE);
  assertEquals(
      'another SPACE toggles checkbox to be unchecked',
      goog.ui.Checkbox.State.UNCHECKED, checkbox.getChecked());

  // Enter for example doesn't work
  goog.testing.events.fireKeySequence(normalSpan, goog.events.KeyCodes.ENTER);
  assertEquals(
      'Enter leaves checkbox unchecked', goog.ui.Checkbox.State.UNCHECKED,
      checkbox.getChecked());
}

function testSpaceKeyFiresEvents() {
  var normalSpan = goog.dom.getElement('normal');

  checkbox.decorate(normalSpan);
  var events = [];
  goog.events.listen(
      checkbox,
      [
        goog.ui.Component.EventType.ACTION, goog.ui.Component.EventType.CHECK,
        goog.ui.Component.EventType.UNCHECK, goog.ui.Component.EventType.CHANGE
      ],
      function(e) { events.push(e.type); });

  assertEquals(
      'Unexpected default state.', goog.ui.Checkbox.State.UNCHECKED,
      checkbox.getChecked());
  goog.testing.events.fireKeySequence(normalSpan, goog.events.KeyCodes.SPACE);
  assertArrayEquals(
      'Unexpected events fired when checking with spacebar.',
      [
        goog.ui.Component.EventType.ACTION, goog.ui.Component.EventType.CHECK,
        goog.ui.Component.EventType.CHANGE
      ],
      events);
  assertEquals(
      'Unexpected state after checking.', goog.ui.Checkbox.State.CHECKED,
      checkbox.getChecked());

  events = [];
  goog.testing.events.fireKeySequence(normalSpan, goog.events.KeyCodes.SPACE);
  assertArrayEquals(
      'Unexpected events fired when unchecking with spacebar.',
      [
        goog.ui.Component.EventType.ACTION, goog.ui.Component.EventType.UNCHECK,
        goog.ui.Component.EventType.CHANGE
      ],
      events);
  assertEquals(
      'Unexpected state after unchecking.', goog.ui.Checkbox.State.UNCHECKED,
      checkbox.getChecked());

  events = [];
  goog.events.listenOnce(
      checkbox, goog.ui.Component.EventType.CHECK,
      function(e) { e.preventDefault(); });
  goog.testing.events.fireKeySequence(normalSpan, goog.events.KeyCodes.SPACE);
  assertArrayEquals(
      'Unexpected events fired when checking with spacebar and ' +
          'the check event is cancelled.',
      [goog.ui.Component.EventType.ACTION, goog.ui.Component.EventType.CHECK],
      events);
  assertEquals(
      'Unexpected state after check event is cancelled.',
      goog.ui.Checkbox.State.UNCHECKED, checkbox.getChecked());
}

function testDecorate() {
  var normalSpan = goog.dom.getElement('normal');
  var checkedSpan = goog.dom.getElement('checked');
  var uncheckedSpan = goog.dom.getElement('unchecked');
  var undeterminedSpan = goog.dom.getElement('undetermined');
  var disabledSpan = goog.dom.getElement('disabled');

  validateCheckBox(normalSpan, goog.ui.Checkbox.State.UNCHECKED);
  validateCheckBox(checkedSpan, goog.ui.Checkbox.State.CHECKED);
  validateCheckBox(uncheckedSpan, goog.ui.Checkbox.State.UNCHECKED);
  validateCheckBox(undeterminedSpan, goog.ui.Checkbox.State.UNDETERMINED);
  validateCheckBox(disabledSpan, goog.ui.Checkbox.State.UNCHECKED, true);
}

function validateCheckBox(span, state, opt_disabled) {
  var testCheckbox = goog.ui.decorate(span);
  assertNotNull('checkbox created', testCheckbox);
  assertEquals(
      'decorate was successful', goog.ui.Checkbox, testCheckbox.constructor);
  assertEquals(
      'checkbox state should be: ' + state, state, testCheckbox.getChecked());
  assertEquals(
      'checkbox is ' + (!opt_disabled ? 'enabled' : 'disabled'), !opt_disabled,
      testCheckbox.isEnabled());
  testCheckbox.dispose();
}

function testSetAriaLabel() {
  assertNull(
      'Checkbox must not have aria label by default', checkbox.getAriaLabel());
  checkbox.setAriaLabel('Checkbox 1');
  checkbox.render();
  var el = checkbox.getElementStrict();
  assertEquals(
      'Checkbox element must have expected aria-label', 'Checkbox 1',
      el.getAttribute('aria-label'));
  assertEquals(
      'Checkbox element must have expected aria-role', 'checkbox',
      el.getAttribute('role'));
  checkbox.setAriaLabel('Checkbox 2');
  assertEquals(
      'Checkbox element must have updated aria-label', 'Checkbox 2',
      el.getAttribute('aria-label'));
  assertEquals(
      'Checkbox element must have expected aria-role', 'checkbox',
      el.getAttribute('role'));
}
