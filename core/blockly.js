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

const BlocklyOptions = goog.require('Blockly.BlocklyOptions');
const Bubble = goog.require('Blockly.Bubble');
const BubbleDragger = goog.require('Blockly.BubbleDragger');
const CollapsibleToolboxCategory = goog.require('Blockly.CollapsibleToolboxCategory');
const Comment = goog.require('Blockly.Comment');
const ComponentManager = goog.require('Blockly.ComponentManager');
const ConnectionChecker = goog.require('Blockly.ConnectionChecker');
const ConnectionDB = goog.require('Blockly.ConnectionDB');
const Connection = goog.require('Blockly.Connection');
const ContextMenu = goog.require('Blockly.ContextMenu');
const ContextMenuItems = goog.require('Blockly.ContextMenuItems');
const ContextMenuRegistry = goog.require('Blockly.ContextMenuRegistry');
const Css = goog.require('Blockly.Css');
const DeleteArea = goog.require('Blockly.DeleteArea');
const DragTarget = goog.require('Blockly.DragTarget');
const DropDownDiv = goog.require('Blockly.DropDownDiv');
const Events = goog.require('Blockly.Events');
const Extensions = goog.require('Blockly.Extensions');
const Field = goog.require('Blockly.Field');
const FieldAngle = goog.require('Blockly.FieldAngle');
const FieldCheckbox = goog.require('Blockly.FieldCheckbox');
const FieldColour = goog.require('Blockly.FieldColour');
const FieldDropdown = goog.require('Blockly.FieldDropdown');
const FieldImage = goog.require('Blockly.FieldImage');
const FieldLabel = goog.require('Blockly.FieldLabel');
const FieldLabelSerializable = goog.require('Blockly.FieldLabelSerializable');
const FieldMultilineInput = goog.require('Blockly.FieldMultilineInput');
const FieldNumber = goog.require('Blockly.FieldNumber');
const FieldTextInput = goog.require('Blockly.FieldTextInput');
const FieldVariable = goog.require('Blockly.FieldVariable');
const Flyout = goog.require('Blockly.Flyout');
const FlyoutButton = goog.require('Blockly.FlyoutButton');
const FlyoutMetricsManager = goog.require('Blockly.FlyoutMetricsManager');
const Generator = goog.require('Blockly.Generator');
const Gesture = goog.require('Blockly.Gesture');
const Grid = goog.require('Blockly.Grid');
const HorizontalFlyout = goog.require('Blockly.HorizontalFlyout');
const IASTNodeLocation = goog.require('Blockly.IASTNodeLocation');
const IASTNodeLocationSvg = goog.require('Blockly.IASTNodeLocationSvg');
const IASTNodeLocationWithBlock = goog.require('Blockly.IASTNodeLocationWithBlock');
const IAutoHideable = goog.require('Blockly.IAutoHideable');
const IBlockDragger = goog.require('Blockly.IBlockDragger');
const IBoundedElement = goog.require('Blockly.IBoundedElement');
const IBubble = goog.require('Blockly.IBubble');
const ICollapsibleToolboxItem = goog.require('Blockly.ICollapsibleToolboxItem');
const IComponent = goog.require('Blockly.IComponent');
const IConnectionChecker = goog.require('Blockly.IConnectionChecker');
const IContextMenu = goog.require('Blockly.IContextMenu');
const Icon = goog.require('Blockly.Icon');
const ICopyable = goog.require('Blockly.ICopyable');
const IDeletable = goog.require('Blockly.IDeletable');
const IDeleteArea = goog.require('Blockly.IDeleteArea');
const IDragTarget = goog.require('Blockly.IDragTarget');
const IDraggable = goog.require('Blockly.IDraggable');
const IFlyout = goog.require('Blockly.IFlyout');
const IKeyboardAccessible = goog.require('Blockly.IKeyboardAccessible');
const IMetricsManager = goog.require('Blockly.IMetricsManager');
const IMovable = goog.require('Blockly.IMovable');
const Input = goog.require('Blockly.Input');
const InsertionMarkerManager = goog.require('Blockly.InsertionMarkerManager');
const IPositionable = goog.require('Blockly.IPositionable');
const IRegistrable = goog.require('Blockly.IRegistrable');
const IRegistrableField = goog.require('Blockly.IRegistrableField');
const ISelectable = goog.require('Blockly.ISelectable');
const ISelectableToolboxItem = goog.require('Blockly.ISelectableToolboxItem');
const IStyleable = goog.require('Blockly.IStyleable');
const IToolbox = goog.require('Blockly.IToolbox');
const IToolboxItem = goog.require('Blockly.IToolboxItem');
const Marker = goog.require('Blockly.Marker');
const MarkerManager = goog.require('Blockly.MarkerManager');
const Menu = goog.require('Blockly.Menu');
const MenuItem = goog.require('Blockly.MenuItem');
const MetricsManager = goog.require('Blockly.MetricsManager');
const Mutator = goog.require('Blockly.Mutator');
const Names = goog.require('Blockly.Names');
const Options = goog.require('Blockly.Options');
const Procedures = goog.require('Blockly.Procedures');
const RenderedConnection = goog.require('Blockly.RenderedConnection');
const Scrollbar = goog.require('Blockly.Scrollbar');
const ScrollbarPair = goog.require('Blockly.ScrollbarPair');
const ShortcutItems = goog.require('Blockly.ShortcutItems');
const ShortcutRegistry = goog.require('Blockly.ShortcutRegistry');
const Size = goog.require('Blockly.utils.Size');
const TabNavigateCursor = goog.require('Blockly.TabNavigateCursor');
const Theme = goog.require('Blockly.Theme');
const Themes = goog.require('Blockly.Themes');
const ThemeManager = goog.require('Blockly.ThemeManager');
const Toolbox = goog.require('Blockly.Toolbox');
const ToolboxCategory = goog.require('Blockly.ToolboxCategory');
const ToolboxItem = goog.require('Blockly.ToolboxItem');
const ToolboxSeparator = goog.require('Blockly.ToolboxSeparator');
const Tooltip = goog.require('Blockly.Tooltip');
const Touch = goog.require('Blockly.Touch');
const TouchGesture = goog.require('Blockly.TouchGesture');
const Trashcan = goog.require('Blockly.Trashcan');
const VariableMap = goog.require('Blockly.VariableMap');
const VariableModel = goog.require('Blockly.VariableModel');
const Variables = goog.require('Blockly.Variables');
const VariablesDynamic = goog.require('Blockly.VariablesDynamic');
const VerticalFlyout = goog.require('Blockly.VerticalFlyout');
const Warning = goog.require('Blockly.Warning');
const WidgetDiv = goog.require('Blockly.WidgetDiv');
const Workspace = goog.require('Blockly.Workspace');
const WorkspaceAudio = goog.require('Blockly.WorkspaceAudio');
const WorkspaceComment = goog.require('Blockly.WorkspaceComment');
const WorkspaceCommentSvg = goog.require('Blockly.WorkspaceCommentSvg');
const WorkspaceDragSurfaceSvg = goog.require('Blockly.WorkspaceDragSurfaceSvg');
const WorkspaceDragger = goog.require('Blockly.WorkspaceDragger');
const WorkspaceSvg = goog.require('Blockly.WorkspaceSvg');
const Xml = goog.require('Blockly.Xml');
const ZoomControls = goog.require('Blockly.ZoomControls');
const blockAnimations = goog.require('Blockly.blockAnimations');
const blockRendering = goog.require('Blockly.blockRendering');
const browserEvents = goog.require('Blockly.browserEvents');
const bumpObjects = goog.require('Blockly.bumpObjects');
const clipboard = goog.require('Blockly.clipboard');
const colour = goog.require('Blockly.utils.colour');
const common = goog.require('Blockly.common');
const constants = goog.require('Blockly.constants');
const deprecation = goog.require('Blockly.utils.deprecation');
const dialog = goog.require('Blockly.dialog');
const fieldRegistry = goog.require('Blockly.fieldRegistry');
const geras = goog.require('Blockly.geras');
const inject = goog.require('Blockly.inject');
const inputTypes = goog.require('Blockly.inputTypes');
const internalConstants = goog.require('Blockly.internalConstants');
const minimalist = goog.require('Blockly.minimalist');
const registry = goog.require('Blockly.registry');
const serialization = goog.require('Blockly.serialization');
const thrasos = goog.require('Blockly.thrasos');
const toolbox = goog.require('Blockly.utils.toolbox');
const uiPosition = goog.require('Blockly.uiPosition');
const utils = goog.require('Blockly.utils');
const zelos = goog.require('Blockly.zelos');
const {ASTNode} = goog.require('Blockly.ASTNode');
const {BasicCursor} = goog.require('Blockly.BasicCursor');
const {Block} = goog.require('Blockly.Block');
const {BlockDragger} = goog.require('Blockly.BlockDragger');
const {BlockDragSurfaceSvg} = goog.require('Blockly.BlockDragSurfaceSvg');
const {BlockSvg} = goog.require('Blockly.BlockSvg');
const {Blocks} = goog.require('Blockly.blocks');
const {ConnectionType} = goog.require('Blockly.ConnectionType');
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
 * @see ConnectionType.INPUT_VALUE
 */
exports.INPUT_VALUE = ConnectionType.INPUT_VALUE;

/**
 * @see ConnectionType.OUTPUT_VALUE
 */
exports.OUTPUT_VALUE = ConnectionType.OUTPUT_VALUE;

/**
 * @see ConnectionType.NEXT_STATEMENT
 */
exports.NEXT_STATEMENT = ConnectionType.NEXT_STATEMENT;

/**
 * @see ConnectionType.PREVIOUS_STATEMENT
 */
exports.PREVIOUS_STATEMENT = ConnectionType.PREVIOUS_STATEMENT;

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

// Re-export submodules that no longer declareLegacyNamespace.
exports.ASTNode = ASTNode;
exports.BasicCursor = BasicCursor;
exports.Block = Block;
exports.BlocklyOptions = BlocklyOptions;
exports.BlockDragger = BlockDragger;
exports.BlockDragSurfaceSvg = BlockDragSurfaceSvg;
exports.BlockSvg = BlockSvg;
exports.Blocks = Blocks;
exports.Bubble = Bubble;
exports.BubbleDragger = BubbleDragger;
exports.CollapsibleToolboxCategory = CollapsibleToolboxCategory;
exports.Comment = Comment;
exports.ComponentManager = ComponentManager;
exports.Connection = Connection;
exports.ConnectionType = ConnectionType;
exports.ConnectionChecker = ConnectionChecker;
exports.ConnectionDB = ConnectionDB;
exports.ContextMenu = ContextMenu;
exports.ContextMenuItems = ContextMenuItems;
exports.ContextMenuRegistry = ContextMenuRegistry;
exports.Css = Css;
exports.Cursor = Cursor;
exports.DeleteArea = DeleteArea;
exports.DragTarget = DragTarget;
exports.DropDownDiv = DropDownDiv;
exports.Events = Events;
exports.Extensions = Extensions;
exports.Field = Field;
exports.FieldAngle = FieldAngle;
exports.FieldCheckbox = FieldCheckbox;
exports.FieldColour = FieldColour;
exports.FieldDropdown = FieldDropdown;
exports.FieldImage = FieldImage;
exports.FieldLabel = FieldLabel;
exports.FieldLabelSerializable = FieldLabelSerializable;
exports.FieldMultilineInput = FieldMultilineInput;
exports.FieldNumber = FieldNumber;
exports.FieldTextInput = FieldTextInput;
exports.FieldVariable = FieldVariable;
exports.Flyout = Flyout;
exports.FlyoutButton = FlyoutButton;
exports.FlyoutMetricsManager = FlyoutMetricsManager;
exports.Generator = Generator;
exports.Gesture = Gesture;
exports.Grid = Grid;
exports.HorizontalFlyout = HorizontalFlyout;
exports.IASTNodeLocation = IASTNodeLocation;
exports.IASTNodeLocationSvg = IASTNodeLocationSvg;
exports.IASTNodeLocationWithBlock = IASTNodeLocationWithBlock;
exports.IAutoHideable = IAutoHideable;
exports.IBlockDragger = IBlockDragger;
exports.IBoundedElement = IBoundedElement;
exports.IBubble = IBubble;
exports.ICollapsibleToolboxItem = ICollapsibleToolboxItem;
exports.IComponent = IComponent;
exports.IConnectionChecker = IConnectionChecker;
exports.IContextMenu = IContextMenu;
exports.Icon = Icon;
exports.ICopyable = ICopyable;
exports.IDeletable = IDeletable;
exports.IDeleteArea = IDeleteArea;
exports.IDragTarget = IDragTarget;
exports.IDraggable = IDraggable;
exports.IFlyout = IFlyout;
exports.IKeyboardAccessible = IKeyboardAccessible;
exports.IMetricsManager = IMetricsManager;
exports.IMovable = IMovable;
exports.Input = Input;
exports.InsertionMarkerManager = InsertionMarkerManager;
exports.IPositionable = IPositionable;
exports.IRegistrable = IRegistrable;
exports.IRegistrableField = IRegistrableField;
exports.ISelectable = ISelectable;
exports.ISelectableToolboxItem = ISelectableToolboxItem;
exports.IStyleable = IStyleable;
exports.IToolbox = IToolbox;
exports.IToolboxItem = IToolboxItem;
exports.Marker = Marker;
exports.MarkerManager = MarkerManager;
exports.Menu = Menu;
exports.MenuItem = MenuItem;
exports.MetricsManager = MetricsManager;
exports.Mutator = Mutator;
exports.Names = Names;
exports.Options = Options;
exports.Procedures = Procedures;
exports.RenderedConnection = RenderedConnection;
exports.Scrollbar = Scrollbar;
exports.ScrollbarPair = ScrollbarPair;
exports.ShortcutItems = ShortcutItems;
exports.ShortcutRegistry = ShortcutRegistry;
exports.TabNavigateCursor = TabNavigateCursor;
exports.Theme = Theme;
exports.Themes = Themes;
exports.ThemeManager = ThemeManager;
exports.Toolbox = Toolbox;
exports.ToolboxCategory = ToolboxCategory;
exports.ToolboxItem = ToolboxItem;
exports.ToolboxSeparator = ToolboxSeparator;
exports.Tooltip = Tooltip;
exports.Touch = Touch;
exports.TouchGesture = TouchGesture;
exports.Trashcan = Trashcan;
exports.VariableMap = VariableMap;
exports.VariableModel = VariableModel;
exports.Variables = Variables;
exports.VariablesDynamic = VariablesDynamic;
exports.VerticalFlyout = VerticalFlyout;
exports.Warning = Warning;
exports.WidgetDiv = WidgetDiv;
exports.Workspace = Workspace;
exports.WorkspaceAudio = WorkspaceAudio;
exports.WorkspaceComment = WorkspaceComment;
exports.WorkspaceCommentSvg = WorkspaceCommentSvg;
exports.WorkspaceDragSurfaceSvg = WorkspaceDragSurfaceSvg;
exports.WorkspaceDragger = WorkspaceDragger;
exports.WorkspaceSvg = WorkspaceSvg;
exports.Xml = Xml;
exports.ZoomControls = ZoomControls;
exports.blockAnimations = blockAnimations;
exports.blockRendering = blockRendering;
exports.browserEvents = browserEvents;
exports.bumpObjects = bumpObjects;
exports.clipboard = clipboard;
exports.common = common;
/** @deprecated Use Blockly.ConnectionType instead. */
exports.connectionTypes = ConnectionType;
exports.constants = constants;
exports.dialog = dialog;
exports.fieldRegistry = fieldRegistry;
exports.geras = geras;
exports.inject = inject;
exports.inputTypes = inputTypes;
exports.minimalist = minimalist;
exports.registry = registry;
exports.serialization = serialization;
exports.thrasos = thrasos;
exports.uiPosition = uiPosition;
exports.utils = utils;
exports.zelos = zelos;
