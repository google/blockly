/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The entrypoint for blockly_compressed.js.  Provides
 *     various backwards-compatibility hacks.  Not used when loading
 *     in uncompiled (uncompressed) mode via bootstrap.js.
 */
'use strict';

goog.module('Blockly.main');

const Blockly = goog.require('Blockly');
const ContextMenu = goog.require('Blockly.ContextMenu');
const Events = goog.require('Blockly.Events');
const Msg = goog.require('Blockly.Msg');
const Tooltip = goog.require('Blockly.Tooltip');
const WidgetDiv = goog.require('Blockly.WidgetDiv');
const colour = goog.require('Blockly.utils.colour');
const common = goog.require('Blockly.common');
const deprecation = goog.require('Blockly.utils.deprecation');
const dialog = goog.require('Blockly.dialog');
const eventUtils = goog.require('Blockly.Events.utils');

/*
 * Aliased functions and properties that used to be on the Blockly namespace.
 * Everything in this section is deprecated. Both external and internal code
 * should avoid using these functions and use the designated replacements.
 * Everything in this section will be removed in a future version of Blockly.
 */

// Add accessors for properties on Blockly that have now been deprecated.
Object.defineProperties(Blockly, {
  /**
   * Wrapper to window.alert() that app developers may override to
   * provide alternatives to the modal browser window.
   * @name Blockly.alert
   * @type {!function(string, function()=)}
   * @deprecated Use Blockly.dialog.alert / .setAlert() instead.
   *     (December 2021)
   * @suppress {checkTypes}
   */
  alert: {
    set: function(newAlert) {
      deprecation.warn(
          'Blockly.alert', 'version 9', 'version 10',
          'Blockly.dialog.setAlert');
      dialog.setAlert(newAlert);
    },
    get: function() {
      deprecation.warn(
          'Blockly.alert', 'version 9', 'version 10', 'Blockly.dialog.alert');
      return dialog.alert;
    },
  },
  /**
   * Wrapper to window.confirm() that app developers may override to
   * provide alternatives to the modal browser window.
   * @name Blockly.confirm
   * @type {!function(string, function()=)}
   * @deprecated Use Blockly.dialog.confirm / .setConfirm() instead.
   *     (December 2021)
   * @suppress {checkTypes}
   */
  confirm: {
    set: function(newConfirm) {
      deprecation.warn(
          'Blockly.confirm', 'version 9', 'version 10',
          'Blockly.dialog.setConfirm');
      dialog.setConfirm(newConfirm);
    },
    get: function() {
      deprecation.warn(
          'Blockly.confirm', 'version 9', 'version 10',
          'Blockly.dialog.confirm');
      return dialog.confirm;
    },
  },
  /**
   * The main workspace most recently used.
   * Set by Blockly.WorkspaceSvg.prototype.markFocused
   * @name Blockly.mainWorkspace
   * @type {Workspace}
   * @suppress {checkTypes}
   */
  mainWorkspace: {
    set: function(x) {
      deprecation.warn(
          'Blockly.mainWorkspace', 'version 9', 'version 10',
          'Blockly.getMainWorkspace');
      common.setMainWorkspace(x);
    },
    get: function() {
      deprecation.warn(
          'Blockly.mainWorkspace', 'version 9', 'version 10',
          'Blockly.getMainWorkspace');
      return common.getMainWorkspace();
    },
  },
  /**
   * Wrapper to window.prompt() that app developers may override to
   * provide alternatives to the modal browser window. Built-in
   * browser prompts are often used for better text input experience
   * on mobile device. We strongly recommend testing mobile when
   * overriding this.
   * @name Blockly.prompt
   * @type {!function(string, string, function()=)}
   * @deprecated Use Blockly.dialog.prompt / .setPrompt() instead.
   *     (December 2021)
   * @suppress {checkTypes}
   */
  prompt: {
    set: function(newPrompt) {
      deprecation.warn(
          'Blockly.prompt', 'version 9', 'version 10',
          'Blockly.dialog.setPrompt');
      dialog.setPrompt(newPrompt);
    },
    get: function() {
      deprecation.warn(
          'Blockly.prompt', 'version 9', 'version 10', 'Blockly.dialog.prompt');
      return dialog.prompt;
    },
  },
  /**
   * Currently selected block.
   * @name Blockly.selected
   * @type {?ICopyable}
   * @suppress {checkTypes}
   */
  selected: {
    get: function() {
      deprecation.warn(
          'Blockly.selected', 'version 9', 'version 10', 'Blockly.getSelected');
      return common.getSelected();
    },
    set: function(newSelection) {
      deprecation.warn(
          'Blockly.selected', 'version 9', 'version 10', 'Blockly.getSelected');
      common.setSelected(newSelection);
    },
  },
  /**
   * The richness of block colours, regardless of the hue.
   * Must be in the range of 0 (inclusive) to 1 (exclusive).
   * @name Blockly.HSV_SATURATION
   * @type {number}
   * @suppress {checkTypes}
   */
  HSV_SATURATION: {
    get: function() {
      return colour.getHsvSaturation();
    },
    set: function(newValue) {
      colour.setHsvSaturation(newValue);
    },
  },
  /**
   * The intensity of block colours, regardless of the hue.
   * Must be in the range of 0 (inclusive) to 1 (exclusive).
   * @name Blockly.HSV_VALUE
   * @type {number}
   * @suppress {checkTypes}
   */
  HSV_VALUE: {
    get: function() {
      return colour.getHsvValue();
    },
    set: function(newValue) {
      colour.setHsvValue(newValue);
    },
  },
});

// Add accessors for properties on Blockly.ContextMenu that have now
// been deprecated.
Object.defineProperties(ContextMenu, {
  /**
   * Which block is the context menu attached to?
   * @name Blockly.ContextMenu.currentBlock
   * @type {Block}
   * @deprecated Use Blockly.Tooltip.getCurrentBlock() /
   *     .setCurrentBlock() instead.  (September 2021)
   * @suppress {checkTypes}
   */
  currentBlock: {
    get: function() {
      deprecation.warn(
          'Blockly.ContextMenu.currentBlock', 'September 2021',
          'September 2022', 'Blockly.Tooltip.getCurrentBlock()');
      return ContextMenu.getCurrentBlock();
    },
    set: function(block) {
      deprecation.warn(
          'Blockly.ContextMenu.currentBlock', 'September 2021',
          'September 2022', 'Blockly.Tooltip.setCurrentBlock(block)');
      ContextMenu.setCurrentBlock(block);
    },
  },
});

// Add accessors for properties on Blockly.Events that have now been
// deprecated.
Object.defineProperties(Events, {
  /**
   * Sets whether the next event should be added to the undo stack.
   * @name Blockly.Evenents.recordUndo
   * @type {boolean}
   * @deprecated Use Blockly.Events.getRecordUndo() and
   *     .setRecordUndo().  (September 2021)
   * @suppress {checkTypes}
   */
  recordUndo: {
    get: function() {
      deprecation.warn(
          'Blockly.Events.recordUndo', 'September 2021', 'September 2022',
          'Blockly.Events.getRecordUndo()');
      return eventUtils.getRecordUndo();
    },
    set: function(record) {
      deprecation.warn(
          'Blockly.Events.recordUndo', 'September 2021', 'September 2022',
          'Blockly.Events.setRecordUndo()');
      eventUtils.setRecordUndo(record);
    },
  },
});


// Add accessors for properties on Blockly.Tooltip that have now been
// deprecated.
Object.defineProperties(Tooltip, {
  /**
   * Is a tooltip currently showing?
   * @name Blockly.Tooltip.visible
   * @type {boolean}
   * @deprecated Use Blockly.Tooltip.isVisible() instead.  (September
   *     2021)
   * @suppress {checkTypes}
   */
  visible: {
    get: function() {
      deprecation.warn(
          'Blockly.Tooltip.visible', 'September 2021', 'September 2022',
          'Blockly.Tooltip.isVisible()');
      return Tooltip.isVisible();
    },
  },
  /**
   * The HTML container.  Set once by createDom.
   * @name Blockly.Tooltip.DIV
   * @type {HTMLDivElement}
   * @deprecated Use Blockly.Tooltip.getDiv() and .setDiv().
   *     (September 2021)
   * @suppress {checkTypes}
   */
  DIV: {
    get: function() {
      deprecation.warn(
          'Blockly.Tooltip.DIV', 'September 2021', 'September 2022',
          'Blockly.Tooltip.getDiv()');
      return Tooltip.getDiv();
    },
  },
});

// Add accessors for properties on Blockly.WidgetDiv that have now been
// deprecated.
Object.defineProperties(WidgetDiv, {
  /**
   * The HTML container for popup overlays (e.g. editor widgets).
   * @name Blockly.WidgetDiv.DIV
   * @type {?Element}
   * @deprecated Use Blockly.WidgetDiv.getDiv() and .setDiv().
   *     (September 2021)
   * @suppress {checkTypes}
   */
  DIV: {
    get: function() {
      deprecation.warn(
          'Blockly.WidgetDiv.DIV', 'September 2021', 'September 2022',
          'Blockly.WidgetDiv.getDiv()');
      return WidgetDiv.getDiv();
    },
  },
});

// If Blockly is compiled with ADVANCED_COMPILATION and/or loaded as a
// CJS or ES module there will not be a Blockly global variable
// created.  This can cause problems because a very common way of
// loading translations is to use a <script> tag to load one of
// the generated msg/*.js files, which consists of lines like:
//
// Blockly.Msg["ADD_COMMENT"] = "Add Comment";
// Blockly.Msg["CLEAN_UP"] = "Clean up Blocks";
//
// This obviously only works if Blockly.Msg is the Msg export from the
// Blockly.Msg module - so make sure it is, but only if there is not
// yet a Blockly global variable.
if (!('Blockly' in globalThis)) {
  globalThis['Blockly'] = {'Msg': Msg};
}
