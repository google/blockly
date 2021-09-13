/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Core JavaScript library for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * The top level namespace used to access the Blockly library.
 * @namespace Blockly
 */
goog.provide('Blockly');

goog.require('Blockly.browserEvents');
goog.require('Blockly.clipboard');
goog.require('Blockly.common');
goog.require('Blockly.ComponentManager');
goog.require('Blockly.connectionTypes');
goog.require('Blockly.constants');
goog.require('Blockly.dialog');
goog.require('Blockly.DropDownDiv');
goog.require('Blockly.Events');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockCreate');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.FinishedLoading');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.Ui');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.UiBase');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.VarCreate');
/** @suppress {extraRequire} */
goog.require('Blockly.inject');
goog.require('Blockly.inputTypes');
goog.require('Blockly.internalConstants');
/** @suppress {extraRequire} */
goog.require('Blockly.Procedures');
goog.require('Blockly.ShortcutRegistry');
goog.require('Blockly.Tooltip');
/** @suppress {extraRequire} */
goog.require('Blockly.Touch');
goog.require('Blockly.utils');
goog.require('Blockly.utils.colour');
goog.require('Blockly.utils.deprecation');
goog.require('Blockly.utils.Size');
goog.require('Blockly.utils.toolbox');
/** @suppress {extraRequire} */
goog.require('Blockly.Variables');
goog.require('Blockly.WidgetDiv');
goog.require('Blockly.WorkspaceSvg');
/** @suppress {extraRequire} */
goog.require('Blockly.Xml');

goog.requireType('Blockly.BlockSvg');
goog.requireType('Blockly.ICopyable');
goog.requireType('Blockly.Workspace');


/**
 * Blockly core version.
 * This constant is overridden by the build script (npm run build) to the value
 * of the version in package.json. This is done by the Closure Compiler in the
 * buildCompressed gulp task.
 * For local builds, you can pass --define='Blockly.VERSION=X.Y.Z' to the
 * compiler to override this constant.
 * @define {string}
 */
Blockly.VERSION = 'uncompiled';

// Add a getter and setter pair for Blockly.mainWorkspace, for legacy reasons.
Object.defineProperty(Blockly, 'mainWorkspace', {
  set: function(x) {
    Blockly.utils.deprecation.warn(
        'Blockly.mainWorkspace', 'September 2021', 'September 2022');
    Blockly.common.setMainWorkspace(x);
  },
  get: function() {
    Blockly.utils.deprecation.warn(
        'Blockly.mainWorkspace', 'September 2021', 'September 2022',
        'Blockly.getMainWorkspace()');
    return Blockly.common.getMainWorkspace();
  }
});

/**
 * Currently selected block.
 * @type {?Blockly.ICopyable}
 */
Blockly.selected = null;

/**
 * Returns the dimensions of the specified SVG image.
 * @param {!SVGElement} svg SVG image.
 * @return {!Blockly.utils.Size} Contains width and height properties.
 * @deprecated Use workspace.setCachedParentSvgSize. (2021 March 5)
 */
Blockly.svgSize = function(svg) {
  // When removing this function, remove svg.cachedWidth_ and svg.cachedHeight_
  // from setCachedParentSvgSize.
  Blockly.utils.deprecation.warn(
      'Blockly.svgSize', 'March 2021', 'March 2022',
      'workspace.getCachedParentSvgSize');
  svg = /** @type {?} */ (svg);
  return new Blockly.utils.Size(svg.cachedWidth_, svg.cachedHeight_);
};

/**
 * Size the workspace when the contents change.  This also updates
 * scrollbars accordingly.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to resize.
 */
Blockly.resizeSvgContents = function(workspace) {
  workspace.resizeContents();
};

/**
 * Size the SVG image to completely fill its container. Call this when the view
 * actually changes sizes (e.g. on a window resize/device orientation change).
 * See Blockly.resizeSvgContents to resize the workspace when the contents
 * change (e.g. when a block is added or removed).
 * Record the height/width of the SVG image.
 * @param {!Blockly.WorkspaceSvg} workspace Any workspace in the SVG.
 */
Blockly.svgResize = function(workspace) {
  var mainWorkspace = workspace;
  while (mainWorkspace.options.parentWorkspace) {
    mainWorkspace = mainWorkspace.options.parentWorkspace;
  }
  var svg = mainWorkspace.getParentSvg();
  var cachedSize = mainWorkspace.getCachedParentSvgSize();
  var div = svg.parentNode;
  if (!div) {
    // Workspace deleted, or something.
    return;
  }
  var width = div.offsetWidth;
  var height = div.offsetHeight;
  if (cachedSize.width != width) {
    svg.setAttribute('width', width + 'px');
    mainWorkspace.setCachedParentSvgSize(width, null);
  }
  if (cachedSize.height != height) {
    svg.setAttribute('height', height + 'px');
    mainWorkspace.setCachedParentSvgSize(null, height);
  }
  mainWorkspace.resize();
};

/**
 * Handle a key-down on SVG drawing surface. Does nothing if the main workspace
 * is not visible.
 * @param {!KeyboardEvent} e Key down event.
 * @package
 */
// TODO (https://github.com/google/blockly/issues/1998) handle cases where there
// are multiple workspaces and non-main workspaces are able to accept input.
Blockly.onKeyDown = function(e) {
  var mainWorkspace = Blockly.common.getMainWorkspace();
  if (!mainWorkspace) {
    return;
  }

  if (Blockly.utils.isTargetInput(e) ||
      (mainWorkspace.rendered && !mainWorkspace.isVisible())) {
    // When focused on an HTML text input widget, don't trap any keys.
    // Ignore keypresses on rendered workspaces that have been explicitly
    // hidden.
    return;
  }
  Blockly.ShortcutRegistry.registry.onKeyDown(mainWorkspace, e);
};

/**
 * Delete the given block.
 * @param {!Blockly.BlockSvg} selected The block to delete.
 * @package
 */
Blockly.deleteBlock = function(selected) {
  if (!selected.workspace.isFlyout) {
    Blockly.Events.setGroup(true);
    Blockly.hideChaff();
    if (selected.outputConnection) {
      // Do not attempt to heal rows
      // (https://github.com/google/blockly/issues/4832)
      selected.dispose(false, true);
    } else {
      selected.dispose(/* heal */ true, true);
    }
    Blockly.Events.setGroup(false);
  }
};

/**
 * Copy a block or workspace comment onto the local clipboard.
 * @param {!Blockly.ICopyable} toCopy Block or Workspace Comment to be copied.
 * @package
 */
Blockly.copy = Blockly.clipboard.copy;

/**
 * Paste a block or workspace comment on to the main workspace.
 * @return {boolean} True if the paste was successful, false otherwise.
 * @package
 */
Blockly.paste = Blockly.clipboard.paste;

/**
 * Duplicate this block and its children, or a workspace comment.
 * @param {!Blockly.ICopyable} toDuplicate Block or Workspace Comment to be
 *     copied.
 * @package
 */
Blockly.duplicate = Blockly.clipboard.duplicate;

/**
 * Cancel the native context menu, unless the focus is on an HTML input widget.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.onContextMenu_ = function(e) {
  if (!Blockly.utils.isTargetInput(e)) {
    // When focused on an HTML text input widget, don't cancel the context menu.
    e.preventDefault();
  }
};

/**
 * Close tooltips, context menus, dropdown selections, etc.
 * @param {boolean=} opt_onlyClosePopups Whether only popups should be closed.
 */
Blockly.hideChaff = function(opt_onlyClosePopups) {
  Blockly.Tooltip.hide();
  Blockly.WidgetDiv.hide();
  Blockly.DropDownDiv.hideWithoutAnimation();

  var onlyClosePopups = !!opt_onlyClosePopups;
  var workspace = Blockly.common.getMainWorkspace();
  var autoHideables = workspace.getComponentManager().getComponents(
      Blockly.ComponentManager.Capability.AUTOHIDEABLE, true);
  autoHideables.forEach(function(autoHideable) {
    autoHideable.autoHide(onlyClosePopups);
  });
};

/**
 * Returns the main workspace.  Returns the last used main workspace (based on
 * focus).  Try not to use this function, particularly if there are multiple
 * Blockly instances on a page.
 * @return {!Blockly.Workspace} The main workspace.
 */
Blockly.getMainWorkspace = Blockly.common.getMainWorkspace;

// Add a getter and setter pair for Blockly.alert, for legacy reasons.
Object.defineProperty(Blockly, 'alert', {
  set: function(newAlert) {
    Blockly.utils.deprecation.warn(
        'Blockly.alert', 'September 2021', 'September 2022');
    Blockly.dialog.setAlert(newAlert);
  },
  get: function() {
    Blockly.utils.deprecation.warn(
        'Blockly.alert', 'September 2021', 'September 2022',
        'Blockly.dialog.alert()');
    return Blockly.dialog.alert;
  }
});

// Add a getter and setter pair for Blockly.confirm, for legacy reasons.
Object.defineProperty(Blockly, 'confirm', {
  set: function(newConfirm) {
    Blockly.utils.deprecation.warn(
        'Blockly.confirm', 'September 2021', 'September 2022');
    Blockly.dialog.setConfirm(newConfirm);
  },
  get: function() {
    Blockly.utils.deprecation.warn(
        'Blockly.confirm', 'September 2021', 'September 2022',
        'Blockly.dialog.confirm()');
    return Blockly.dialog.confirm;
  }
});

// Add a getter and setter pair for Blockly.prompt, for legacy reasons.
Object.defineProperty(Blockly, 'prompt', {
  set: function(newPrompt) {
    Blockly.utils.deprecation.warn(
        'Blockly.prompt', 'September 2021', 'September 2022');
    Blockly.dialog.setPrompt(newPrompt);
  },
  get: function() {
    Blockly.utils.deprecation.warn(
        'Blockly.prompy', 'September 2021', 'September 2022',
        'Blockly.dialog.prompt()');
    return Blockly.dialog.prompt;
  }
});

/**
 * Wrapper to window.prompt() that app developers may override to provide
 * alternatives to the modal browser window. Built-in browser prompts are
 * often used for better text input experience on mobile device. We strongly
 * recommend testing mobile when overriding this.
 * @param {string} message The message to display to the user.
 * @param {string} defaultValue The value to initialize the prompt with.
 * @param {!function(?string)} callback The callback for handling user response.
 */
Blockly.prompt = Blockly.dialog.prompt;

/**
 * Helper function for defining a block from JSON.  The resulting function has
 * the correct value of jsonDef at the point in code where jsonInit is called.
 * @param {!Object} jsonDef The JSON definition of a block.
 * @return {function()} A function that calls jsonInit with the correct value
 *     of jsonDef.
 * @private
 */
Blockly.jsonInitFactory_ = function(jsonDef) {
  return function() {
    this.jsonInit(jsonDef);
  };
};

/**
 * Define blocks from an array of JSON block definitions, as might be generated
 * by the Blockly Developer Tools.
 * @param {!Array<!Object>} jsonArray An array of JSON block definitions.
 */
Blockly.defineBlocksWithJsonArray = function(jsonArray) {
  for (var i = 0; i < jsonArray.length; i++) {
    var elem = jsonArray[i];
    if (!elem) {
      console.warn(
          'Block definition #' + i + ' in JSON array is ' + elem + '. ' +
          'Skipping.');
    } else {
      var typename = elem.type;
      if (typename == null || typename === '') {
        console.warn(
            'Block definition #' + i +
            ' in JSON array is missing a type attribute. Skipping.');
      } else {
        if (Blockly.Blocks[typename]) {
          console.warn(
              'Block definition #' + i + ' in JSON array' +
              ' overwrites prior definition of "' + typename + '".');
        }
        Blockly.Blocks[typename] = {init: Blockly.jsonInitFactory_(elem)};
      }
    }
  }
};

/**
 * Is the given string a number (includes negative and decimals).
 * @param {string} str Input string.
 * @return {boolean} True if number, false otherwise.
 */
Blockly.isNumber = function(str) {
  return /^\s*-?\d+(\.\d+)?\s*$/.test(str);
};

/**
 * Convert a hue (HSV model) into an RGB hex triplet.
 * @param {number} hue Hue on a colour wheel (0-360).
 * @return {string} RGB code, e.g. '#5ba65b'.
 */
Blockly.hueToHex = function(hue) {
  return Blockly.utils.colour.hsvToHex(
      hue, Blockly.internalConstants.HSV_SATURATION,
      Blockly.internalConstants.HSV_VALUE * 255);
};

/**
 * Set the parent container.  This is the container element that the WidgetDiv,
 * DropDownDiv, and Tooltip are rendered into the first time `Blockly.inject`
 * is called.
 * This method is a NOP if called after the first ``Blockly.inject``.
 * @param {!Element} container The container element.
 */
Blockly.setParentContainer = Blockly.common.setParentContainer;

/** Aliases. */

/**
 * @see Blockly.browserEvents.bind
 */
Blockly.bindEvent_ = Blockly.browserEvents.bind;

/**
 * @see Blockly.browserEvents.unbind
 */
Blockly.unbindEvent_ = Blockly.browserEvents.unbind;

/**
 * @see Blockly.browserEvents.conditionalBind
 */
Blockly.bindEventWithChecks_ = Blockly.browserEvents.conditionalBind;

/**
 * @see Blockly.constants.ALIGN.LEFT
 */
Blockly.ALIGN_LEFT = Blockly.constants.ALIGN.LEFT;

/**
 * @see Blockly.constants.ALIGN.CENTRE
 */
Blockly.ALIGN_CENTRE = Blockly.constants.ALIGN.CENTRE;

/**
 * @see Blockly.constants.ALIGN.RIGHT
 */
Blockly.ALIGN_RIGHT = Blockly.constants.ALIGN.RIGHT;


/**
 * Aliases for constants used for connection and input types.
 */

/**
 * @see Blockly.connectionTypes.INPUT_VALUE
 */
Blockly.INPUT_VALUE = Blockly.connectionTypes.INPUT_VALUE;

/**
 * @see Blockly.connectionTypes.OUTPUT_VALUE
 */
Blockly.OUTPUT_VALUE = Blockly.connectionTypes.OUTPUT_VALUE;

/**
 * @see Blockly.connectionTypes.NEXT_STATEMENT
 */
Blockly.NEXT_STATEMENT = Blockly.connectionTypes.NEXT_STATEMENT;

/**
 * @see Blockly.connectionTypes.PREVIOUS_STATEMENT
 */
Blockly.PREVIOUS_STATEMENT = Blockly.connectionTypes.PREVIOUS_STATEMENT;

/**
 * @see Blockly.inputTypes.DUMMY_INPUT
 */
Blockly.DUMMY_INPUT = Blockly.inputTypes.DUMMY;

/**
 * Aliases for toolbox positions.
 */

/**
 * @see Blockly.utils.toolbox.Position.TOP
 */
Blockly.TOOLBOX_AT_TOP = Blockly.utils.toolbox.Position.TOP;

/**
 * @see Blockly.utils.toolbox.Position.BOTTOM
 */
Blockly.TOOLBOX_AT_BOTTOM = Blockly.utils.toolbox.Position.BOTTOM;

/**
 * @see Blockly.utils.toolbox.Position.LEFT
 */
Blockly.TOOLBOX_AT_LEFT = Blockly.utils.toolbox.Position.LEFT;

/**
 * @see Blockly.utils.toolbox.Position.RIGHT
 */
Blockly.TOOLBOX_AT_RIGHT = Blockly.utils.toolbox.Position.RIGHT;

// Aliases to allow external code to access these values for legacy reasons.
Blockly.LINE_MODE_MULTIPLIER = Blockly.internalConstants.LINE_MODE_MULTIPLIER;
Blockly.PAGE_MODE_MULTIPLIER = Blockly.internalConstants.PAGE_MODE_MULTIPLIER;
Blockly.DRAG_RADIUS = Blockly.internalConstants.DRAG_RADIUS;
Blockly.FLYOUT_DRAG_RADIUS = Blockly.internalConstants.FLYOUT_DRAG_RADIUS;
Blockly.SNAP_RADIUS = Blockly.internalConstants.SNAP_RADIUS;
Blockly.CONNECTING_SNAP_RADIUS =
    Blockly.internalConstants.CONNECTING_SNAP_RADIUS;
Blockly.CURRENT_CONNECTION_PREFERENCE =
    Blockly.internalConstants.CURRENT_CONNECTION_PREFERENCE;
Blockly.BUMP_DELAY = Blockly.internalConstants.BUMP_DELAY;
Blockly.BUMP_RANDOMNESS = Blockly.internalConstants.BUMP_RANDOMNESS;
Blockly.COLLAPSE_CHARS = Blockly.internalConstants.COLLAPSE_CHARS;
Blockly.LONGPRESS = Blockly.internalConstants.LONGPRESS;
Blockly.SOUND_LIMIT = Blockly.internalConstants.SOUND_LIMIT;
Blockly.DRAG_STACK = Blockly.internalConstants.DRAG_STACK;
Blockly.HSV_SATURATION = Blockly.internalConstants.HSV_SATURATION;
Blockly.HSV_VALUE = Blockly.internalConstants.HSV_VALUE;
Blockly.SPRITE = Blockly.internalConstants.SPRITE;
Blockly.DRAG_NONE = Blockly.internalConstants.DRAG_NONE;
Blockly.DRAG_STICKY = Blockly.internalConstants.DRAG_STICKY;
Blockly.DRAG_BEGIN = Blockly.internalConstants.DRAG_BEGIN;
Blockly.DRAG_FREE = Blockly.internalConstants.DRAG_FREE;
Blockly.OPPOSITE_TYPE = Blockly.internalConstants.OPPOSITE_TYPE;
Blockly.VARIABLE_CATEGORY_NAME =
    Blockly.internalConstants.VARIABLE_CATEGORY_NAME;
Blockly.VARIABLE_DYNAMIC_CATEGORY_NAME =
    Blockly.internalConstants.VARIABLE_DYNAMIC_CATEGORY_NAME;
Blockly.PROCEDURE_CATEGORY_NAME =
    Blockly.internalConstants.PROCEDURE_CATEGORY_NAME;
Blockly.RENAME_VARIABLE_ID = Blockly.internalConstants.RENAME_VARIABLE_ID;
Blockly.DELETE_VARIABLE_ID = Blockly.internalConstants.DELETE_VARIABLE_ID;
Blockly.COLLAPSED_INPUT_NAME = Blockly.constants.COLLAPSED_INPUT_NAME;
Blockly.COLLAPSED_FIELD_NAME = Blockly.constants.COLLAPSED_FIELD_NAME;
