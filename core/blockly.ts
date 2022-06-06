/** @fileoverview The top level namespace used to access the Blockly library. */

/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * The top level namespace used to access the Blockly library.
 * @namespace Blockly
 */
// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_block_create';
// Unused import preserved for side-effects. Remove if unneeded.
import './events/workspace_events';
// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_ui';
// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_ui_base';
// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_var_create';

import { Block } from './block';
import * as blockAnimations from './block_animations';
import { BlockDragSurfaceSvg } from './block_drag_surface';
import { BlockDragger } from './block_dragger';
import { BlockSvg } from './block_svg';
import { BlocklyOptions } from './blockly_options';
import { Blocks } from './blocks';
import * as browserEvents from './browser_events';
import { Bubble } from './bubble';
import { BubbleDragger } from './bubble_dragger';
import * as bumpObjects from './bump_objects';
import * as clipboard from './clipboard';
import { Comment } from './comment';
import * as common from './common';
import { ComponentManager } from './component_manager';
import { config } from './config';
import { Connection } from './connection';
import { ConnectionChecker } from './connection_checker';
import { ConnectionDB } from './connection_db';
import { ConnectionType } from './connection_type';
import * as ContextMenu from './contextmenu';
import * as ContextMenuItems from './contextmenu_items';
import { ContextMenuRegistry } from './contextmenu_registry';
import * as Css from './css';
import { DeleteArea } from './delete_area';
import * as dialog from './dialog';
import { DragTarget } from './drag_target';
import * as dropDownDiv from './dropdowndiv';
import * as Events from './events/events';
import * as Extensions from './extensions';
import { Field } from './field';
import { FieldAngle } from './field_angle';
import { FieldCheckbox } from './field_checkbox';
import { FieldColour } from './field_colour';
import { FieldDropdown } from './field_dropdown';
import { FieldImage } from './field_image';
import { FieldLabel } from './field_label';
import { FieldLabelSerializable } from './field_label_serializable';
import { FieldMultilineInput } from './field_multilineinput';
import { FieldNumber } from './field_number';
import * as fieldRegistry from './field_registry';
import { FieldTextInput } from './field_textinput';
import { FieldVariable } from './field_variable';
import { Flyout } from './flyout_base';
import { FlyoutButton } from './flyout_button';
import { HorizontalFlyout } from './flyout_horizontal';
import { FlyoutMetricsManager } from './flyout_metrics_manager';
import { VerticalFlyout } from './flyout_vertical';
import { Generator } from './generator';
import { Gesture } from './gesture';
import { Grid } from './grid';
import { Icon } from './icon';
import { inject } from './inject';
import { Align, Input } from './input';
import { inputTypes } from './input_types';
import { InsertionMarkerManager } from './insertion_marker_manager';
import { IASTNodeLocation } from './interfaces/i_ast_node_location';
import { IASTNodeLocationSvg } from './interfaces/i_ast_node_location_svg';
import { IASTNodeLocationWithBlock } from './interfaces/i_ast_node_location_with_block';
import { IAutoHideable } from './interfaces/i_autohideable';
import { IBlockDragger } from './interfaces/i_block_dragger';
import { IBoundedElement } from './interfaces/i_bounded_element';
import { IBubble } from './interfaces/i_bubble';
import { ICollapsibleToolboxItem } from './interfaces/i_collapsible_toolbox_item';
import { IComponent } from './interfaces/i_component';
import { IConnectionChecker } from './interfaces/i_connection_checker';
import { IContextMenu } from './interfaces/i_contextmenu';
import { ICopyable } from './interfaces/i_copyable';
import { IDeletable } from './interfaces/i_deletable';
import { IDeleteArea } from './interfaces/i_delete_area';
import { IDragTarget } from './interfaces/i_drag_target';
import { IDraggable } from './interfaces/i_draggable';
import { IFlyout } from './interfaces/i_flyout';
import { IKeyboardAccessible } from './interfaces/i_keyboard_accessible';
import { IMetricsManager } from './interfaces/i_metrics_manager';
import { IMovable } from './interfaces/i_movable';
import { IPositionable } from './interfaces/i_positionable';
import { IRegistrable } from './interfaces/i_registrable';
import { IRegistrableField } from './interfaces/i_registrable_field';
import { ISelectable } from './interfaces/i_selectable';
import { ISelectableToolboxItem } from './interfaces/i_selectable_toolbox_item';
import { ISerializer as SerializerInterface } from './interfaces/i_serializer';
import { IStyleable } from './interfaces/i_styleable';
import { IToolbox } from './interfaces/i_toolbox';
import { IToolboxItem } from './interfaces/i_toolbox_item';
import * as internalConstants from './internal_constants';
import { ASTNode } from './keyboard_nav/ast_node';
import { BasicCursor } from './keyboard_nav/basic_cursor';
import { Cursor } from './keyboard_nav/cursor';
import { Marker } from './keyboard_nav/marker';
import { TabNavigateCursor } from './keyboard_nav/tab_navigate_cursor';
import { MarkerManager } from './marker_manager';
import { Menu } from './menu';
import { MenuItem } from './menuitem';
import { MetricsManager } from './metrics_manager';
import { Msg } from './msg';
import { Mutator } from './mutator';
import { Names } from './names';
import { Options } from './options';
import * as uiPosition from './positionable_helpers';
import * as Procedures from './procedures';
import * as registry from './registry';
import { RenderedConnection } from './rendered_connection';
import * as blockRendering from './renderers/common/block_rendering';
import * as constants from './renderers/common/constants';
import * as geras from './renderers/geras/geras';
import * as minimalist from './renderers/minimalist/minimalist';
import * as thrasos from './renderers/thrasos/thrasos';
import * as zelos from './renderers/zelos/zelos';
import { Scrollbar } from './scrollbar';
import { ScrollbarPair } from './scrollbar_pair';
import * as serializationBlocks from './serialization/blocks';
import * as serializationExceptions from './serialization/exceptions';
import * as serializationPriorities from './serialization/priorities';
import * as serializationRegistry from './serialization/registry';
import * as serializationVariables from './serialization/variables';
import * as serializationWorkspaces from './serialization/workspaces';
import * as ShortcutItems from './shortcut_items';
import { ShortcutRegistry } from './shortcut_registry';
import { Theme } from './theme';
import * as Themes from './theme/themes';
import { ThemeManager } from './theme_manager';
import { ToolboxCategory } from './toolbox/category';
import { CollapsibleToolboxCategory } from './toolbox/collapsible_category';
import { ToolboxSeparator } from './toolbox/separator';
import { Toolbox } from './toolbox/toolbox';
import { ToolboxItem } from './toolbox/toolbox_item';
import * as Tooltip from './tooltip';
import * as Touch from './touch';
import { TouchGesture } from './touch_gesture';
import { Trashcan } from './trashcan';
import * as utils from './utils';
import * as colour from './utils/colour';
import * as deprecation from './utils/deprecation';
import * as svgMath from './utils/svg_math';
import * as toolbox from './utils/toolbox';
import { VariableMap } from './variable_map';
import { VariableModel } from './variable_model';
import * as Variables from './variables';
import * as VariablesDynamic from './variables_dynamic';
import { Warning } from './warning';
import * as WidgetDiv from './widgetdiv';
import { Workspace } from './workspace';
import { WorkspaceAudio } from './workspace_audio';
import { WorkspaceComment } from './workspace_comment';
import { WorkspaceCommentSvg } from './workspace_comment_svg';
import { WorkspaceDragSurfaceSvg } from './workspace_drag_surface_svg';
import { WorkspaceDragger } from './workspace_dragger';
import { resizeSvgContents as realResizeSvgContents, WorkspaceSvg } from './workspace_svg';
import * as Xml from './xml';
import { ZoomControls } from './zoom_controls';


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
export const VERSION = 'uncompiled';

/*
 * Top-level functions and properties on the Blockly namespace.
 * These are used only in external code. Do not reference these
 * from internal code as importing from this file can cause circular
 * dependencies. Do not add new functions here. There is probably a better
 * namespace to put new functions on.
 */

/*
 * Aliases for input alignments used in block defintions.
 */

/**
 * @see Blockly.Input.Align.LEFT
 * @alias Blockly.ALIGN_LEFT
 */
export const ALIGN_LEFT = Align.LEFT;

/**
 * @see Blockly.Input.Align.CENTRE
 * @alias Blockly.ALIGN_CENTRE
 */
export const ALIGN_CENTRE = Align.CENTRE;

/**
 * @see Blockly.Input.Align.RIGHT
 * @alias Blockly.ALIGN_RIGHT
 */
export const ALIGN_RIGHT = Align.RIGHT;
/*
 * Aliases for constants used for connection and input types.
 */

/**
 * @see ConnectionType.INPUT_VALUE
 * @alias Blockly.INPUT_VALUE
 */
export const INPUT_VALUE = ConnectionType.INPUT_VALUE;

/**
 * @see ConnectionType.OUTPUT_VALUE
 * @alias Blockly.OUTPUT_VALUE
 */
export const OUTPUT_VALUE = ConnectionType.OUTPUT_VALUE;

/**
 * @see ConnectionType.NEXT_STATEMENT
 * @alias Blockly.NEXT_STATEMENT
 */
export const NEXT_STATEMENT = ConnectionType.NEXT_STATEMENT;

/**
 * @see ConnectionType.PREVIOUS_STATEMENT
 * @alias Blockly.PREVIOUS_STATEMENT
 */
export const PREVIOUS_STATEMENT = ConnectionType.PREVIOUS_STATEMENT;

/**
 * @see inputTypes.DUMMY_INPUT
 * @alias Blockly.DUMMY_INPUT
 */
export const DUMMY_INPUT = inputTypes.DUMMY;

/** Aliases for toolbox positions. */

/**
 * @see toolbox.Position.TOP
 * @alias Blockly.TOOLBOX_AT_TOP
 */
export const TOOLBOX_AT_TOP = toolbox.Position.TOP;

/**
 * @see toolbox.Position.BOTTOM
 * @alias Blockly.TOOLBOX_AT_BOTTOM
 */
export const TOOLBOX_AT_BOTTOM = toolbox.Position.BOTTOM;

/**
 * @see toolbox.Position.LEFT
 * @alias Blockly.TOOLBOX_AT_LEFT
 */
export const TOOLBOX_AT_LEFT = toolbox.Position.LEFT;

/**
 * @see toolbox.Position.RIGHT
 * @alias Blockly.TOOLBOX_AT_RIGHT
 */
export const TOOLBOX_AT_RIGHT = toolbox.Position.RIGHT;

/*
 * Other aliased functions.
 */

/**
 * Size the SVG image to completely fill its container. Call this when the view
 * actually changes sizes (e.g. on a window resize/device orientation change).
 * See workspace.resizeContents to resize the workspace when the contents
 * change (e.g. when a block is added or removed).
 * Record the height/width of the SVG image.
 * @param workspace Any workspace in the SVG.
 * @see Blockly.common.svgResize
 * @alias Blockly.svgResize
 */
// AnyDuringMigration because:  Property 'svgResize' does not exist on type
// 'void'.
export const svgResize = (common as AnyDuringMigration).svgResize;

/**
 * Close tooltips, context menus, dropdown selections, etc.
 * @param opt_onlyClosePopups Whether only popups should be closed.
 * @see Blockly.WorkspaceSvg.hideChaff
 * @alias Blockly.hideChaff
 */
export function hideChaff(opt_onlyClosePopups?: boolean) {
  // AnyDuringMigration because:  Property 'getMainWorkspace' does not exist on
  // type 'void'.
  ((common as AnyDuringMigration).getMainWorkspace() as WorkspaceSvg)
    .hideChaff(opt_onlyClosePopups);
}

/**
 * Returns the main workspace.  Returns the last used main workspace (based on
 * focus).  Try not to use this function, particularly if there are multiple
 * Blockly instances on a page.
 * @return The main workspace.
 * @see Blockly.common.getMainWorkspace
 * @alias Blockly.getMainWorkspace
 */
// AnyDuringMigration because:  Property 'getMainWorkspace' does not exist on
// type 'void'.
export const getMainWorkspace = (common as AnyDuringMigration).getMainWorkspace;

/**
 * Define blocks from an array of JSON block definitions, as might be generated
 * by the Blockly Developer Tools.
 * @param jsonArray An array of JSON block definitions.
 * @see Blockly.common.defineBlocksWithJsonArray
 * @alias Blockly.defineBlocksWithJsonArray
 */
// AnyDuringMigration because:  Property 'defineBlocksWithJsonArray' does not
// exist on type 'void'.
export const defineBlocksWithJsonArray =
  (common as AnyDuringMigration).defineBlocksWithJsonArray;
/**
 * Set the parent container.  This is the container element that the WidgetDiv,
 * dropDownDiv, and Tooltip are rendered into the first time `Blockly.inject`
 * is called.
 * This method is a NOP if called after the first ``Blockly.inject``.
 * @param container The container element.
 * @see Blockly.common.setParentContainer
 * @alias Blockly.setParentContainer
 */
// AnyDuringMigration because:  Property 'setParentContainer' does not exist on
// type 'void'.
export const setParentContainer =
  (common as AnyDuringMigration).setParentContainer;


/**
 * Returns the dimensions of the specified SVG image.
 * @param svg SVG image.
 * @return Contains width and height properties.
 * @deprecated Use workspace.setCachedParentSvgSize. (2021 March 5)
 * @see Blockly.WorkspaceSvg.setCachedParentSvgSize
 * @alias Blockly.svgSize
 */
export const svgSize = svgMath.svgSize;

/**
 * Size the workspace when the contents change.  This also updates
 * scrollbars accordingly.
 * @param workspace The workspace to resize.
 * @deprecated Use workspace.resizeContents. (2021 December)
 * @see Blockly.WorkspaceSvg.resizeContents
 * @alias Blockly.resizeSvgContents
 */
function resizeSvgContentsLocal(workspace: WorkspaceSvg) {
  deprecation.warn(
    'Blockly.resizeSvgContents', 'December 2021', 'December 2022',
    'Blockly.WorkspaceSvg.resizeSvgContents');
  realResizeSvgContents(workspace);
}
export const resizeSvgContents = resizeSvgContentsLocal;

/**
 * Copy a block or workspace comment onto the local clipboard.
 * @param toCopy Block or Workspace Comment to be copied.
 * @deprecated Use Blockly.clipboard.copy(). (2021 December)
 * @see Blockly.clipboard.copy
 * @alias Blockly.copy
 */
export function copy(toCopy: ICopyable) {
  deprecation.warn(
    'Blockly.copy', 'December 2021', 'December 2022',
    'Blockly.clipboard.copy');
  // AnyDuringMigration because:  Property 'copy' does not exist on type 'void'.
  (clipboard as AnyDuringMigration).copy(toCopy);
}

/**
 * Paste a block or workspace comment on to the main workspace.
 * @return True if the paste was successful, false otherwise.
 * @deprecated Use Blockly.clipboard.paste(). (2021 December)
 * @see Blockly.clipboard.paste
 * @alias Blockly.paste
 */
export function paste(): boolean {
  deprecation.warn(
    'Blockly.paste', 'December 2021', 'December 2022',
    'Blockly.clipboard.paste');
  // AnyDuringMigration because:  Property 'paste' does not exist on type
  // 'void'.
  return !!(clipboard as AnyDuringMigration).paste();
}

/**
 * Duplicate this block and its children, or a workspace comment.
 * @param toDuplicate Block or Workspace Comment to be copied.
 * @deprecated Use Blockly.clipboard.duplicate(). (2021 December)
 * @see Blockly.clipboard.duplicate
 * @alias Blockly.duplicate
 */
export function duplicate(toDuplicate: ICopyable) {
  deprecation.warn(
    'Blockly.duplicate', 'December 2021', 'December 2022',
    'Blockly.clipboard.duplicate');
  // AnyDuringMigration because:  Property 'duplicate' does not exist on type
  // 'void'.
  (clipboard as AnyDuringMigration).duplicate(toDuplicate);
}

/**
 * Is the given string a number (includes negative and decimals).
 * @param str Input string.
 * @return True if number, false otherwise.
 * @deprecated Use Blockly.utils.string.isNumber(str). (2021 December)
 * @see Blockly.utils.string.isNumber
 * @alias Blockly.isNumber
 */
export function isNumber(str: string): boolean {
  deprecation.warn(
    'Blockly.isNumber', 'December 2021', 'December 2022',
    'Blockly.utils.string.isNumber');
  // AnyDuringMigration because:  Property 'string' does not exist on type
  // 'void'.
  return (utils as AnyDuringMigration).string.isNumber(str);
}

/**
 * Convert a hue (HSV model) into an RGB hex triplet.
 * @param hue Hue on a colour wheel (0-360).
 * @return RGB code, e.g. '#5ba65b'.
 * @deprecated Use Blockly.utils.colour.hueToHex(). (2021 December)
 * @see Blockly.utils.colour.hueToHex
 * @alias Blockly.hueToHex
 */
export function hueToHex(hue: number): string {
  deprecation.warn(
    'Blockly.hueToHex', 'December 2021', 'December 2022',
    'Blockly.utils.colour.hueToHex');
  return colour.hueToHex(hue);
}

/**
 * Bind an event handler that should be called regardless of whether it is part
 * of the active touch stream.
 * Use this for events that are not part of a multi-part gesture (e.g.
 * mouseover for tooltips).
 * @param node Node upon which to listen.
 * @param name Event name to listen to (e.g. 'mousedown').
 * @param thisObject The value of 'this' in the function.
 * @param func Function to call when event is triggered.
 * @return Opaque data that can be passed to unbindEvent_.
 * @deprecated Use Blockly.browserEvents.bind(). (December 2021)
 * @see Blockly.browserEvents.bind
 * @alias Blockly.bindEvent_
 */
export function bindEvent_(
  node: EventTarget, name: string, thisObject: AnyDuringMigration | null,
  func: Function): browserEvents.Data {
  deprecation.warn(
    'Blockly.bindEvent_', 'December 2021', 'December 2022',
    'Blockly.browserEvents.bind');
  return browserEvents.bind(node, name, thisObject, func);
}

/**
 * Unbind one or more events event from a function call.
 * @param bindData Opaque data from bindEvent_.
 *     This list is emptied during the course of calling this function.
 * @return The function call.
 * @deprecated Use Blockly.browserEvents.unbind(). (December 2021)
 * @see browserEvents.unbind
 * @alias Blockly.unbindEvent_
 */
export function unbindEvent_(bindData: browserEvents.Data): Function {
  deprecation.warn(
    'Blockly.unbindEvent_', 'December 2021', 'December 2022',
    'Blockly.browserEvents.unbind');
  return browserEvents.unbind(bindData);
}

/**
 * Bind an event handler that can be ignored if it is not part of the active
 * touch stream.
 * Use this for events that either start or continue a multi-part gesture (e.g.
 * mousedown or mousemove, which may be part of a drag or click).
 * @param node Node upon which to listen.
 * @param name Event name to listen to (e.g. 'mousedown').
 * @param thisObject The value of 'this' in the function.
 * @param func Function to call when event is triggered.
 * @param opt_noCaptureIdentifier True if triggering on this event should not
 *     block execution of other event handlers on this touch or other
 *     simultaneous touches.  False by default.
 * @param opt_noPreventDefault True if triggering on this event should prevent
 *     the default handler.  False by default.  If opt_noPreventDefault is
 *     provided, opt_noCaptureIdentifier must also be provided.
 * @return Opaque data that can be passed to unbindEvent_.
 * @deprecated Use Blockly.browserEvents.conditionalBind(). (December 2021)
 * @see browserEvents.conditionalBind
 * @alias Blockly.bindEventWithChecks_
 */
export function bindEventWithChecks_(
  node: EventTarget, name: string, thisObject: AnyDuringMigration | null,
  func: Function, opt_noCaptureIdentifier?: boolean,
  opt_noPreventDefault?: boolean): browserEvents.Data {
  deprecation.warn(
    'Blockly.bindEventWithChecks_', 'December 2021', 'December 2022',
    'Blockly.browserEvents.conditionalBind');
  return browserEvents.conditionalBind(
    node, name, thisObject, func, opt_noCaptureIdentifier,
    opt_noPreventDefault);
}

// Aliases to allow external code to access these values for legacy reasons.
export const COLLAPSE_CHARS = internalConstants.COLLAPSE_CHARS;
export const DRAG_STACK = internalConstants.DRAG_STACK;
export const OPPOSITE_TYPE = internalConstants.OPPOSITE_TYPE;
export const RENAME_VARIABLE_ID = internalConstants.RENAME_VARIABLE_ID;
export const DELETE_VARIABLE_ID = internalConstants.DELETE_VARIABLE_ID;
// AnyDuringMigration because:  Property 'COLLAPSED_INPUT_NAME' does not exist
// on type 'void'.
export const COLLAPSED_INPUT_NAME =
  (constants as AnyDuringMigration).COLLAPSED_INPUT_NAME;
// AnyDuringMigration because:  Property 'COLLAPSED_FIELD_NAME' does not exist
// on type 'void'.
export const COLLAPSED_FIELD_NAME =
  (constants as AnyDuringMigration).COLLAPSED_FIELD_NAME;

/**
 * String for use in the "custom" attribute of a category in toolbox XML.
 * This string indicates that the category should be dynamically populated with
 * variable blocks.
 * @alias Blockly.VARIABLE_CATEGORY_NAME
 */
// AnyDuringMigration because:  Property 'CATEGORY_NAME' does not exist on type
// 'void'.
export const VARIABLE_CATEGORY_NAME: string =
  (Variables as AnyDuringMigration).CATEGORY_NAME;

/**
 * String for use in the "custom" attribute of a category in toolbox XML.
 * This string indicates that the category should be dynamically populated with
 * variable blocks.
 * @alias Blockly.VARIABLE_DYNAMIC_CATEGORY_NAME
 */
// AnyDuringMigration because:  Property 'CATEGORY_NAME' does not exist on type
// 'void'.
export const VARIABLE_DYNAMIC_CATEGORY_NAME: string =
  (VariablesDynamic as AnyDuringMigration).CATEGORY_NAME;
/**
 * String for use in the "custom" attribute of a category in toolbox XML.
 * This string indicates that the category should be dynamically populated with
 * procedure blocks.
 * @alias Blockly.PROCEDURE_CATEGORY_NAME
 */
// AnyDuringMigration because:  Property 'CATEGORY_NAME' does not exist on type
// 'void'.
export const PROCEDURE_CATEGORY_NAME: string =
  (Procedures as AnyDuringMigration).CATEGORY_NAME;

// Re-export submodules that no longer declareLegacyNamespace.
export { browserEvents };
export { ContextMenu };
export { ContextMenuItems };
export { Css };
export { Events };
export { Extensions };
export { Procedures };
export { ShortcutItems };
export { Themes };
export { Tooltip };
export { Touch };
export { Variables };
export { VariablesDynamic };
export { WidgetDiv };
export { Xml };
export { blockAnimations };
export { blockRendering };
export { bumpObjects };
export { clipboard };
export { common };
export { constants };
export { dialog };
export { fieldRegistry };
export { geras };
export { minimalist };
export { registry };
export { thrasos };
export { uiPosition };
export { utils };
export { zelos };
export { ASTNode };
export { BasicCursor };
export { Block };
export { BlocklyOptions };
export { BlockDragger };
export { BlockDragSurfaceSvg };
export { BlockSvg };
export { Blocks };
export { Bubble };
export { BubbleDragger };
export { CollapsibleToolboxCategory };
export { Comment };
export { ComponentManager };
export { Connection };
export { ConnectionType };
export { ConnectionChecker };
export { ConnectionDB };
export { ContextMenuRegistry };
export { Cursor };
export { DeleteArea };
export { DragTarget };
export const DropDownDiv = dropDownDiv;
export { Field };
export { FieldAngle };
export { FieldCheckbox };
export { FieldColour };
export { FieldDropdown };
export { FieldImage };
export { FieldLabel };
export { FieldLabelSerializable };
export { FieldMultilineInput };
export { FieldNumber };
export { FieldTextInput };
export { FieldVariable };
export { Flyout };
export { FlyoutButton };
export { FlyoutMetricsManager };
export { Generator };
export { Gesture };
export { Grid };
export { HorizontalFlyout };
export { IASTNodeLocation };
export { IASTNodeLocationSvg };
export { IASTNodeLocationWithBlock };
export { IAutoHideable };
export { IBlockDragger };
export { IBoundedElement };
export { IBubble };
export { ICollapsibleToolboxItem };
export { IComponent };
export { IConnectionChecker };
export { IContextMenu };
export { Icon };
export { ICopyable };
export { IDeletable };
export { IDeleteArea };
export { IDragTarget };
export { IDraggable };
export { IFlyout };
export { IKeyboardAccessible };
export { IMetricsManager };
export { IMovable };
export { Input };
export { InsertionMarkerManager };
export { IPositionable };
export { IRegistrable };
export { IRegistrableField };
export { ISelectable };
export { ISelectableToolboxItem };
export { IStyleable };
export { IToolbox };
export { IToolboxItem };
export { Marker };
export { MarkerManager };
export { Menu };
export { MenuItem };
export { MetricsManager };
export { Mutator };
export { Msg };
export { Names };
export { Options };
export { RenderedConnection };
export { Scrollbar };
export { ScrollbarPair };
export { ShortcutRegistry };
export { TabNavigateCursor };
export { Theme };
export { ThemeManager };
export { Toolbox };
export { ToolboxCategory };
export { ToolboxItem };
export { ToolboxSeparator };
export { TouchGesture };
export { Trashcan };
export { VariableMap };
export { VariableModel };
export { VerticalFlyout };
export { Warning };
export { Workspace };
export { WorkspaceAudio };
export { WorkspaceComment };
export { WorkspaceCommentSvg };
export { WorkspaceDragSurfaceSvg };
export { WorkspaceDragger };
export { WorkspaceSvg };
export { ZoomControls };
export { config };
/** @deprecated Use Blockly.ConnectionType instead. */
export const connectionTypes = ConnectionType;
export { inject };
export { inputTypes };
export namespace serialization {
  export const blocks = serializationBlocks;
  export const exceptions = serializationExceptions;
  export const priorities = serializationPriorities;
  export const registry = serializationRegistry;
  export const variables = serializationVariables;
  export const workspaces = serializationWorkspaces;
  export type ISerializer = SerializerInterface;
};

// If Blockly is compiled with ADVANCED_COMPILATION and/or loaded as a
// CJS or ES module there will not be a Blockly global variable
// created.  This can cause problems because a very common way of
// loading translations is to use a <script> tag to load one of
// msg/js/*.js, which consists of lines like:
// Blockly.Msg["ADD_COMMENT"] = "Add Comment";
// Blockly.Msg["CLEAN_UP"] = "Clean up Blocks";
// This obviously only works if Blockly.Msg is the Msg export from the
// Blockly.Msg module - so make sure it is, but only if there is not
// yet a Blockly global variable.
if (!('Blockly' in globalThis)) {
  (globalThis as AnyDuringMigration)['Blockly'] = { 'Msg': Msg };
}
