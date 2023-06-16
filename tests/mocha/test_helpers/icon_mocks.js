/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export class MockIcon {
  getType() {
    return new Blockly.icons.IconType('mock icon');
  }

  initView() {}

  dispose() {}

  getWeight() {}

  getSize() {
    return new Blockly.utils.Size(0, 0);
  }

  applyColour() {}

  hideForInsertionMarker() {}

  updateEditable() {}

  updateCollapsed() {}

  isShownWhenCollapsed() {}

  setOffsetInBlock() {}

  onLocationChange() {}

  onClick() {}
}

export class MockSerializableIcon extends MockIcon {
  constructor() {
    super();
    this.state = '';
  }

  getType() {
    return new Blockly.icons.IconType('serializable icon');
  }

  getWeight() {
    return 1;
  }

  saveState() {
    return 'some state';
  }

  loadState(state) {
    this.state = state;
  }
}

export class MockBubbleIcon extends MockIcon {
  constructor() {
    super();
    this.visible = false;
  }

  getType() {
    return new Blockly.icons.IconType('bubble icon');
  }

  updateCollapsed() {}

  bubbleIsVisible() {
    return this.visible;
  }

  setBubbleVisible(visible) {
    this.visible = visible;
  }
}
