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
goog.module('Blockly');
goog.module.declareLegacyNamespace();

const Blocks = goog.require('Blockly.Blocks');
/* eslint-disable-next-line no-unused-vars */
const ICopyable = goog.requireType('Blockly.ICopyable');
const Marker = goog.require('Blockly.Marker');
const Size = goog.require('Blockly.utils.Size');
const TabNavigateCursor = goog.require('Blockly.TabNavigateCursor');
/* eslint-disable-next-line no-unused-vars */
const Workspace = goog.requireType('Blockly.Workspace');
/* eslint-disable-next-line no-unused-vars */
const WorkspaceSvg = goog.requireType('Blockly.WorkspaceSvg');
const browserEvents = goog.require('Blockly.browserEvents');
const clipboard = goog.require('Blockly.clipboard');
const colour = goog.require('Blockly.utils.colour');
const common = goog.require('Blockly.common');
const connectionTypes = goog.require('Blockly.connectionTypes');
const constants = goog.require('Blockly.constants');
const deprecation = goog.require('Blockly.utils.deprecation');
const dialog = goog.require('Blockly.dialog');
const Events = goog.require('Blockly.Events');
const inputTypes = goog.require('Blockly.inputTypes');
const internalConstants = goog.require('Blockly.internalConstants');
const toolbox = goog.require('Blockly.utils.toolbox');
const {Block} = goog.require('Blockly.Block');
const {BlockDragger} = goog.require('Blockly.BlockDragger');
const {BlockDragSurfaceSvg} = goog.require('Blockly.BlockDragSurfaceSvg');
const {BlockSvg} = goog.require('Blockly.BlockSvg');
const {ASTNode} = goog.require('Blockly.ASTNode');
const {BasicCursor} = goog.require('Blockly.BasicCursor');
const {Cursor} = goog.require('Blockly.Cursor');
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
/** @suppress {extraRequire} */
goog.require('Blockly.Procedures');
/** @suppress {extraRequire} */
goog.require('Blockly.Touch');
/** @suppress {extraRequire} */
goog.require('Blockly.Variables');
/** @suppress {extraRequire} */
goog.require('Blockly.Xml');


/**
 * Blockly core version.
 * This constant is overridden by the build script (npm run build) to the value
 * of the version in package.json. This is done by the Closure Compiler in the
 * buildCompressed gulp task.
 * For local builds, you can pass --define='Blockly.VERSION=X.Y.Z' to the
 * compiler to override this constant.
 * @define {string}
 * @alias Blockly.VERSION
 */
exports.VERSION = 'uncompiled';

// Add a getter and setter pair for Blockly.alert, Blockly.confirm,
// Blockly.mainWorkspace, Blockly.prompt and Blockly.selected for backwards
// compatibility.
Object.defineProperties(exports, {
  alert: {
    set: function(newAlert) {
      deprecation.warn('Blockly.alert', 'September 2021', 'September 2022');
      dialog.setAlert(newAlert);
    },
    get: function() {
      deprecation.warn(
          'Blockly.alert', 'September 2021', 'September 2022',
          'Blockly.dialog.alert()');
      return dialog.alert;
    }
  },
  confirm: {
    set: function(newConfirm) {
      deprecation.warn('Blockly.confirm', 'September 2021', 'September 2022');
      dialog.setConfirm(newConfirm);
    },
    get: function() {
      deprecation.warn(
          'Blockly.confirm', 'September 2021', 'September 2022',
          'Blockly.dialog.confirm()');
      return dialog.confirm;
    }
  },
  mainWorkspace: {
    set: function(x) {
      deprecation.warn(
          'Blockly.mainWorkspace', 'September 2021', 'September 2022');
      common.setMainWorkspace(x);
    },
    get: function() {
      deprecation.warn(
          'Blockly.mainWorkspace', 'September 2021', 'September 2022',
          'Blockly.getMainWorkspace()');
      return common.getMainWorkspace();
    }
  },
  prompt: {
    set: function(newPrompt) {
      deprecation.warn('Blockly.prompt', 'September 2021', 'September 2022');
      dialog.setPrompt(newPrompt);
    },
    get: function() {
      deprecation.warn(
          'Blockly.prompt', 'September 2021', 'September 2022',
          'Blockly.dialog.prompt()');
      return dialog.prompt;
    }
  },
  selected: {
    get: function() {
      deprecation.warn(
          'Blockly.selected', 'September 2021', 'September 2022',
          'Blockly.common.getSelected()');
      return common.getSelected();
    },
    set: function(newSelection) {
      deprecation.warn(
          'Blockly.selected', 'September 2021', 'September 2022',
          'Blockly.common.setSelected()');
      common.setSelected(newSelection);
    }
  },
});

/**
 * Returns the dimensions of the specified SVG image.
 * @param {!SVGElement} svg SVG image.
 * @return {!Size} Contains width and height properties.
 * @deprecated Use workspace.setCachedParentSvgSize. (2021 March 5)
 * @alias Blockly.svgSize
 */
const svgSize = function(svg) {
  // When removing this function, remove svg.cachedWidth_ and svg.cachedHeight_
  // from setCachedParentSvgSize.
  deprecation.warn(
      'Blockly.svgSize', 'March 2021', 'March 2022',
      'workspace.getCachedParentSvgSize');
  svg = /** @type {?} */ (svg);
  return new Size(svg.cachedWidth_, svg.cachedHeight_);
};
exports.svgSize = svgSize;

/**
 * Size the workspace when the contents change.  This also updates
 * scrollbars accordingly.
 * @param {!WorkspaceSvg} workspace The workspace to resize.
 * @alias Blockly.resizeSvgContents
 */
const resizeSvgContents = function(workspace) {
  workspace.resizeContents();
};
exports.resizeSvgContents = resizeSvgContents;

/**
 * Copy a block or workspace comment onto the local clipboard.
 * @param {!ICopyable} toCopy Block or Workspace Comment to be copied.
 * @package
 * @alias Blockly.copy
 */
exports.copy = clipboard.copy;

/**
 * Paste a block or workspace comment on to the main workspace.
 * @return {boolean} True if the paste was successful, false otherwise.
 * @package
 * @alias Blockly.paste
 */
exports.paste = clipboard.paste;

/**
 * Duplicate this block and its children, or a workspace comment.
 * @param {!ICopyable} toDuplicate Block or Workspace Comment to be
 *     copied.
 * @package
 * @alias Blockly.duplicate
 */
exports.duplicate = clipboard.duplicate;

/**
 * Close tooltips, context menus, dropdown selections, etc.
 * @deprecated Use Blockly.common.getMainWorkspace().hideChaff()
 * @param {boolean=} opt_onlyClosePopups Whether only popups should be closed.
 * @alias Blockly.hideChaff
 */
const hideChaff = function(opt_onlyClosePopups) {
  deprecation.warn('Blockly.hideChaff', 'September 2021', 'September 2022');
  common.getMainWorkspace().hideChaff(opt_onlyClosePopups);
};
exports.hideChaff = hideChaff;

/**
 * Returns the main workspace.  Returns the last used main workspace (based on
 * focus).  Try not to use this function, particularly if there are multiple
 * Blockly instances on a page.
 * @return {!Workspace} The main workspace.
 * @alias Blockly.getMainWorkspace
 */
exports.getMainWorkspace = common.getMainWorkspace;

/**
 * Helper function for defining a block from JSON.  The resulting function has
 * the correct value of jsonDef at the point in code where jsonInit is called.
 * @param {!Object} jsonDef The JSON definition of a block.
 * @return {function()} A function that calls jsonInit with the correct value
 *     of jsonDef.
 */
const jsonInitFactory = function(jsonDef) {
  return function() {
    this.jsonInit(jsonDef);
  };
};

/**
 * Define blocks from an array of JSON block definitions, as might be generated
 * by the Blockly Developer Tools.
 * @param {!Array<!Object>} jsonArray An array of JSON block definitions.
 * @alias Blockly.defineBlocksWithJsonArray
 */
const defineBlocksWithJsonArray = function(jsonArray) {
  for (let i = 0; i < jsonArray.length; i++) {
    const elem = jsonArray[i];
    if (!elem) {
      console.warn(
          'Block definition #' + i + ' in JSON array is ' + elem + '. ' +
          'Skipping.');
    } else {
      const typename = elem.type;
      if (typename == null || typename === '') {
        console.warn(
            'Block definition #' + i +
            ' in JSON array is missing a type attribute. Skipping.');
      } else {
        if (Blocks[typename]) {
          console.warn(
              'Block definition #' + i + ' in JSON array' +
              ' overwrites prior definition of "' + typename + '".');
        }
        Blocks[typename] = {init: jsonInitFactory(elem)};
      }
    }
  }
};
exports.defineBlocksWithJsonArray = defineBlocksWithJsonArray;

/**
 * Is the given string a number (includes negative and decimals).
 * @param {string} str Input string.
 * @return {boolean} True if number, false otherwise.
 * @alias Blockly.isNumber
 */
const isNumber = function(str) {
  return /^\s*-?\d+(\.\d+)?\s*$/.test(str);
};
exports.isNumber = isNumber;


/**
 * Set the parent container.  This is the container element that the WidgetDiv,
 * DropDownDiv, and Tooltip are rendered into the first time `Blockly.inject`
 * is called.
 * This method is a NOP if called after the first ``Blockly.inject``.
 * @param {!Element} container The container element.
 * @alias Blockly.setParentContainer
 */
exports.setParentContainer = common.setParentContainer;

/** Aliases. */

/**
 * @see colour.hueToHex
 * @deprecated Use Blockly.utils.colour.hueToHex (September 2021).
 * @alias Blockly.hueToHex
 */
 exports.hueToHex = colour.hueToHex;

/**
 * @see browserEvents.bind
 */
exports.bindEvent_ = browserEvents.bind;

/**
 * @see browserEvents.unbind
 */
exports.unbindEvent_ = browserEvents.unbind;

/**
 * @see browserEvents.conditionalBind
 */
exports.bindEventWithChecks_ = browserEvents.conditionalBind;

/**
 * @see constants.ALIGN.LEFT
 */
exports.ALIGN_LEFT = constants.ALIGN.LEFT;

/**
 * @see constants.ALIGN.CENTRE
 */
exports.ALIGN_CENTRE = constants.ALIGN.CENTRE;

/**
 * @see constants.ALIGN.RIGHT
 */
exports.ALIGN_RIGHT = constants.ALIGN.RIGHT;

/**
 * @see common.svgResize
 */
 exports.svgResize = common.svgResize;

/**
 * Aliases for constants used for connection and input types.
 */

/**
 * @see connectionTypes.INPUT_VALUE
 */
exports.INPUT_VALUE = connectionTypes.INPUT_VALUE;

/**
 * @see connectionTypes.OUTPUT_VALUE
 */
exports.OUTPUT_VALUE = connectionTypes.OUTPUT_VALUE;

/**
 * @see connectionTypes.NEXT_STATEMENT
 */
exports.NEXT_STATEMENT = connectionTypes.NEXT_STATEMENT;

/**
 * @see connectionTypes.PREVIOUS_STATEMENT
 */
exports.PREVIOUS_STATEMENT = connectionTypes.PREVIOUS_STATEMENT;

/**
 * @see inputTypes.DUMMY_INPUT
 */
exports.DUMMY_INPUT = inputTypes.DUMMY;

/**
 * Aliases for toolbox positions.
 */

/**
 * @see toolbox.Position.TOP
 */
exports.TOOLBOX_AT_TOP = toolbox.Position.TOP;

/**
 * @see toolbox.Position.BOTTOM
 */
exports.TOOLBOX_AT_BOTTOM = toolbox.Position.BOTTOM;

/**
 * @see toolbox.Position.LEFT
 */
exports.TOOLBOX_AT_LEFT = toolbox.Position.LEFT;

/**
 * @see toolbox.Position.RIGHT
 */
exports.TOOLBOX_AT_RIGHT = toolbox.Position.RIGHT;

// Aliases to allow external code to access these values for legacy reasons.
exports.LINE_MODE_MULTIPLIER = internalConstants.LINE_MODE_MULTIPLIER;
exports.PAGE_MODE_MULTIPLIER = internalConstants.PAGE_MODE_MULTIPLIER;
exports.DRAG_RADIUS = internalConstants.DRAG_RADIUS;
exports.FLYOUT_DRAG_RADIUS = internalConstants.FLYOUT_DRAG_RADIUS;
exports.SNAP_RADIUS = internalConstants.SNAP_RADIUS;
exports.CONNECTING_SNAP_RADIUS = internalConstants.CONNECTING_SNAP_RADIUS;
exports.CURRENT_CONNECTION_PREFERENCE =
    internalConstants.CURRENT_CONNECTION_PREFERENCE;
exports.BUMP_DELAY = internalConstants.BUMP_DELAY;
exports.BUMP_RANDOMNESS = internalConstants.BUMP_RANDOMNESS;
exports.COLLAPSE_CHARS = internalConstants.COLLAPSE_CHARS;
exports.LONGPRESS = internalConstants.LONGPRESS;
exports.SOUND_LIMIT = internalConstants.SOUND_LIMIT;
exports.DRAG_STACK = internalConstants.DRAG_STACK;
exports.HSV_SATURATION = internalConstants.HSV_SATURATION;
exports.HSV_VALUE = internalConstants.HSV_VALUE;
exports.SPRITE = internalConstants.SPRITE;
exports.DRAG_NONE = internalConstants.DRAG_NONE;
exports.DRAG_STICKY = internalConstants.DRAG_STICKY;
exports.DRAG_BEGIN = internalConstants.DRAG_BEGIN;
exports.DRAG_FREE = internalConstants.DRAG_FREE;
exports.OPPOSITE_TYPE = internalConstants.OPPOSITE_TYPE;
exports.VARIABLE_CATEGORY_NAME = internalConstants.VARIABLE_CATEGORY_NAME;
exports.VARIABLE_DYNAMIC_CATEGORY_NAME =
    internalConstants.VARIABLE_DYNAMIC_CATEGORY_NAME;
exports.PROCEDURE_CATEGORY_NAME = internalConstants.PROCEDURE_CATEGORY_NAME;
exports.RENAME_VARIABLE_ID = internalConstants.RENAME_VARIABLE_ID;
exports.DELETE_VARIABLE_ID = internalConstants.DELETE_VARIABLE_ID;
exports.COLLAPSED_INPUT_NAME = constants.COLLAPSED_INPUT_NAME;
exports.COLLAPSED_FIELD_NAME = constants.COLLAPSED_FIELD_NAME;

exports.ASTNode = ASTNode;
exports.BasicCursor = BasicCursor;
exports.Block = Block;
exports.BlockDragger = BlockDragger;
exports.BlockDragSurfaceSvg = BlockDragSurfaceSvg;
exports.BlockSvg = BlockSvg;
exports.Cursor = Cursor;
exports.Events = Events;
exports.Marker = Marker;
exports.TabNavigateCursor = TabNavigateCursor;
