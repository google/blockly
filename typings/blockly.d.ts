/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Type definitions for Blockly.
 * @author samelh@google.com (Sam El-Husseini)
 */

export = Blockly;

declare module Blockly {

  interface BlocklyOptions {
    toolbox?: Blockly.utils.toolbox.ToolboxDefinition;
    readOnly?: boolean;
    trashcan?: boolean;
    maxInstances?: {[type: string]: number;};
    maxTrashcanContents?: number;
    collapse?: boolean;
    comments?: boolean;
    disable?: boolean;
    sounds?: boolean;
    rtl?: boolean;
    horizontalLayout?: boolean;
    toolboxPosition?: string;
    css?: boolean;
    oneBasedIndex?: boolean;
    media?: string;
    theme?: Blockly.Theme | BlocklyThemeOptions;
    move?: {
      scrollbars?: boolean;
      drag?: boolean;
      wheel?: boolean;
    };
    grid?: {
      spacing?: number;
      colour?: string;
      length?: number;
      snap?: boolean;
    };
    zoom?: {
      controls?: boolean;
      wheel?: boolean;
      startScale?: number;
      maxScale?: number;
      minScale?: number;
      scaleSpeed?: number;
      pinch?: boolean;
    };
    renderer?: string;
    parentWorkspace?: Blockly.WorkspaceSvg;
  }

  interface BlocklyThemeOptions {
    base?: string;
    blockStyles?: {[blocks: string]: Blockly.Theme.BlockStyle;};
    categoryStyles?: {[category: string]: Blockly.Theme.CategoryStyle;};
    componentStyles?: {[component: string]: any;};
    fontStyle?: Blockly.Theme.FontStyle;
    startHats?: boolean;
  }

  /**
   * Set the Blockly locale.
   * Note: this method is only available in the npm release of Blockly.
   * @param {!Object} msg An object of Blockly message strings in the desired
   *     language.
   */
  function setLocale(msg: {[key: string]: string;}): void;
}

declare module Blockly.utils {
  interface Metrics {
    viewHeight: number;
    viewWidth: number;
    contentHeight: number;
    contentWidth: number;
    viewTop: number;
    viewLeft: number;
    contentTop: number;
    contentLeft: number;
    absoluteTop: number;
    absoluteLeft: number;
    svgHeight?: number;
    svgWidth?: number;
    toolboxWidth?: number;
    toolboxHeight?: number;
    flyoutWidth?: number;
    flyoutHeight?: number;
    toolboxPosition?: number;
  }
}


declare module Block {

    /**
     * @typedef {{
     *            text:?string,
     *            pinned:boolean,
     *            size:Size
     *          }}
     */
    interface CommentModel {
        text: string;
        pinned: boolean;
        size: Size
    }

    /**
     * The language-neutral ID given to the collapsed input.
     * @const {string}
     */
    var COLLAPSED_INPUT_NAME: any /*missing*/;

    /**
     * The language-neutral ID given to the collapsed field.
     * @const {string}
     */
    var COLLAPSED_FIELD_NAME: any /*missing*/;
}





declare module BlockSvg {

    /**
     * Constant for identifying rows that are to be rendered inline.
     * Don't collide with Blockly.inputTypes.
     * @const
     */
    var INLINE: any /*missing*/;

    /**
     * ID to give the "collapsed warnings" warning. Allows us to remove the
     * "collapsed warnings" warning without removing any warnings that belong to
     * the block.
     * @type {string}
     * @const
     */
    var COLLAPSED_WARNING_ID: string;
}


declare module exports {

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
    var VERSION: any /*missing*/;

    /**
     * Copy a block or workspace comment onto the local clipboard.
     * @param {!ICopyable} toCopy Block or Workspace Comment to be copied.
     * @package
     * @alias Blockly.copy
     */
    function copy(toCopy: ICopyable): void;

    /**
     * Paste a block or workspace comment on to the main workspace.
     * @return {boolean} True if the paste was successful, false otherwise.
     * @package
     * @alias Blockly.paste
     */
    function paste(): boolean;

    /**
     * Duplicate this block and its children, or a workspace comment.
     * @param {!ICopyable} toDuplicate Block or Workspace Comment to be
     *     copied.
     * @package
     * @alias Blockly.duplicate
     */
    function duplicate(toDuplicate: ICopyable): void;

    /**
     * Returns the main workspace.  Returns the last used main workspace (based on
     * focus).  Try not to use this function, particularly if there are multiple
     * Blockly instances on a page.
     * @return {!Workspace} The main workspace.
     * @alias Blockly.getMainWorkspace
     */
    function getMainWorkspace(): Workspace;

    /**
     * Set the parent container.  This is the container element that the WidgetDiv,
     * DropDownDiv, and Tooltip are rendered into the first time `Blockly.inject`
     * is called.
     * This method is a NOP if called after the first ``Blockly.inject``.
     * @param {!Element} container The container element.
     * @alias Blockly.setParentContainer
     */
    function setParentContainer(container: Element): void;

    /**
     * @see colour.hueToHex
     * @deprecated Use Blockly.utils.colour.hueToHex (September 2021).
     * @alias Blockly.hueToHex
     */
    var hueToHex: any /*missing*/;

    /**
     * @see browserEvents.bind
     * @alias Blockly.bindEvent_
     */
    var bindEvent_: any /*missing*/;

    /**
     * @see browserEvents.unbind
     * @alias Blockly.unbindEvent_
     */
    var unbindEvent_: any /*missing*/;

    /**
     * @see browserEvents.conditionalBind
     * @alias Blockly.bindEventWithChecks_
     */
    var bindEventWithChecks_: any /*missing*/;

    /**
     * @see constants.ALIGN.LEFT
     * @alias Blockly.ALIGN_LEFT
     */
    var ALIGN_LEFT: any /*missing*/;

    /**
     * @see constants.ALIGN.CENTRE
     * @alias Blockly.ALIGN_CENTRE
     */
    var ALIGN_CENTRE: any /*missing*/;

    /**
     * @see constants.ALIGN.RIGHT
     * @alias Blockly.ALIGN_RIGHT
     */
    var ALIGN_RIGHT: any /*missing*/;

    /**
     * @see common.svgResize
     */
    var svgResize: any /*missing*/;

    /**
     * @see ConnectionType.INPUT_VALUE
     * @alias Blockly.INPUT_VALUE
     */
    var INPUT_VALUE: any /*missing*/;

    /**
     * @see ConnectionType.OUTPUT_VALUE
     * @alias Blockly.OUTPUT_VALUE
     */
    var OUTPUT_VALUE: any /*missing*/;

    /**
     * @see ConnectionType.NEXT_STATEMENT
     * @alias Blockly.NEXT_STATEMENT
     */
    var NEXT_STATEMENT: any /*missing*/;

    /**
     * @see ConnectionType.PREVIOUS_STATEMENT
     * @alias Blockly.PREVIOUS_STATEMENT
     */
    var PREVIOUS_STATEMENT: any /*missing*/;

    /**
     * @see inputTypes.DUMMY_INPUT
     * @alias Blockly.DUMMY_INPUT
     */
    var DUMMY_INPUT: any /*missing*/;

    /**
     * @see toolbox.Position.TOP
     * @alias Blockly.TOOLBOX_AT_TOP
     */
    var TOOLBOX_AT_TOP: any /*missing*/;

    /**
     * @see toolbox.Position.BOTTOM
     * @alias Blockly.TOOLBOX_AT_BOTTOM
     */
    var TOOLBOX_AT_BOTTOM: any /*missing*/;

    /**
     * @see toolbox.Position.LEFT
     * @alias Blockly.TOOLBOX_AT_LEFT
     */
    var TOOLBOX_AT_LEFT: any /*missing*/;

    /**
     * @see toolbox.Position.RIGHT
     * @alias Blockly.TOOLBOX_AT_RIGHT
     */
    var TOOLBOX_AT_RIGHT: any /*missing*/;

    /** @deprecated Use Blockly.ConnectionType instead. */
    var connectionTypes: any /*missing*/;
}





declare module Bubble {

    /**
     * Width of the border around the bubble.
     */
    var BORDER_WIDTH: any /*missing*/;

    /**
     * Determines the thickness of the base of the arrow in relation to the size
     * of the bubble.  Higher numbers result in thinner arrows.
     */
    var ARROW_THICKNESS: any /*missing*/;

    /**
     * The number of degrees that the arrow bends counter-clockwise.
     */
    var ARROW_ANGLE: any /*missing*/;

    /**
     * The sharpness of the arrow's bend.  Higher numbers result in smoother arrows.
     */
    var ARROW_BEND: any /*missing*/;

    /**
     * Distance between arrow point and anchor point.
     */
    var ANCHOR_RADIUS: any /*missing*/;

    /**
     * Create the text for a non editable bubble.
     * @param {string} text The text to display.
     * @return {!SVGTextElement} The top-level node of the text.
     * @package
     */
    function textToDom(text: string): SVGTextElement;

    /**
     * Creates a bubble that can not be edited.
     * @param {!SVGTextElement} paragraphElement The text element for the non
     *     editable bubble.
     * @param {!BlockSvg} block The block that the bubble is attached to.
     * @param {!Coordinate} iconXY The coordinate of the icon.
     * @return {!Bubble} The non editable bubble.
     * @package
     */
    function createNonEditableBubble(paragraphElement: SVGTextElement, block: BlockSvg, iconXY: Coordinate): Bubble;
}






declare module exports {

    /**
     * All of the connections on blocks that are currently being dragged.
     * @type {!Array<!Connection>}
     */
    var draggingConnections: Connection[];
}


declare module ComponentManager {

    class Capability<T> extends Capability__Class<T> { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Capability__Class<T>  { 
    
            /**
             * A name with the capability of the element stored in the generic.
             * @param {string} name The name of the component capability.
             * @constructor
             * @template T
             */
            constructor(name: string);
    } 
    

    /**
     * An object storing component information.
     * @typedef {{
     *    component: !IComponent,
     *    capabilities: (
     *     !Array<string|!ComponentManager.Capability<!IComponent>>
     *       ),
     *    weight: number
     *  }}
     */
    interface ComponentDatum {
        component: IComponent;
        capabilities: string|ComponentManager.Capability<IComponent>[];
        weight: number
    }
}

declare module ComponentManager.Capability {

    /** @type {!ComponentManager.Capability<!IPositionable>} */
    var POSITIONABLE: ComponentManager.Capability<IPositionable>;

    /** @type {!ComponentManager.Capability<!IDragTarget>} */
    var DRAG_TARGET: ComponentManager.Capability<IDragTarget>;

    /** @type {!ComponentManager.Capability<!IDeleteArea>} */
    var DELETE_AREA: ComponentManager.Capability<IDeleteArea>;

    /** @type {!ComponentManager.Capability<!IAutoHideable>} */
    var AUTOHIDEABLE: ComponentManager.Capability<IAutoHideable>;
}


declare module Connection {

    /**
     * Constants for checking whether two connections are compatible.
     */
    var CAN_CONNECT: any /*missing*/;

    /**
     * Returns the connection (starting at the startBlock) which will accept
     * the given connection. This includes compatible connection types and
     * connection checks.
     * @param {!Block} startBlock The block on which to start the search.
     * @param {!Connection} orphanConnection The connection that is looking
     *     for a home.
     * @return {?Connection} The suitable connection point on the chain of
     *     blocks, or null.
     */
    function getConnectionForOrphanedConnection(startBlock: Block, orphanConnection: Connection): Connection;
}



declare module ConnectionDB {

    /**
     * Initialize a set of connection DBs for a workspace.
     * @param {!IConnectionChecker} checker The workspace's
     *     connection checker, used to decide if connections are valid during a
     *     drag.
     * @return {!Array<!ConnectionDB>} Array of databases.
     */
    function init(checker: IConnectionChecker): ConnectionDB[];
}






declare module ContextMenuRegistry {

    /**
     * Where this menu item should be rendered. If the menu item should be rendered
     * in multiple scopes, e.g. on both a block and a workspace, it should be
     * registered for each scope.
     * @enum {string}
     */
    enum ScopeType { BLOCK, WORKSPACE } 

    /**
     * The actual workspace/block where the menu is being rendered. This is passed
     * to callback and displayText functions that depend on this information.
     * @typedef {{
     *    block: (BlockSvg|undefined),
     *    workspace: (WorkspaceSvg|undefined)
     * }}
     */
    interface Scope {
        block: BlockSvg|any /*undefined*/;
        workspace: WorkspaceSvg|any /*undefined*/
    }

    /**
     * A menu item as entered in the registry.
     * @typedef {{
     *    callback: function(!ContextMenuRegistry.Scope),
     *    scopeType: !ContextMenuRegistry.ScopeType,
     *    displayText: ((function(!ContextMenuRegistry.Scope):string)|string),
     *    preconditionFn: function(!ContextMenuRegistry.Scope):string,
     *    weight: number,
     *    id: string
     * }}
     */
    interface RegistryItem {
        callback: { (_0: ContextMenuRegistry.Scope): any /*missing*/ };
        scopeType: ContextMenuRegistry.ScopeType;
        displayText: { (_0: ContextMenuRegistry.Scope): string }|string;
        preconditionFn: { (_0: ContextMenuRegistry.Scope): string };
        weight: number;
        id: string
    }

    /**
     * A menu item as presented to contextmenu.js.
     * @typedef {{
     *    text: string,
     *    enabled: boolean,
     *    callback: function(!ContextMenuRegistry.Scope),
     *    scope: !ContextMenuRegistry.Scope,
     *    weight: number
     * }}
     */
    interface ContextMenuOption {
        text: string;
        enabled: boolean;
        callback: { (_0: ContextMenuRegistry.Scope): any /*missing*/ };
        scope: ContextMenuRegistry.Scope;
        weight: number
    }

    /**
     * Singleton instance of this class. All interactions with this class should be
     * done on this object.
     * @type {?ContextMenuRegistry}
     */
    var registry: ContextMenuRegistry;
}






declare module DropDownDiv {

    /**
     * Arrow size in px. Should match the value in CSS
     * (need to position pre-render).
     * @type {number}
     * @const
     */
    var ARROW_SIZE: number;

    /**
     * Drop-down border size in px. Should match the value in CSS (need to position
     * the arrow).
     * @type {number}
     * @const
     */
    var BORDER_SIZE: number;

    /**
     * Amount the arrow must be kept away from the edges of the main drop-down div,
     * in px.
     * @type {number}
     * @const
     */
    var ARROW_HORIZONTAL_PADDING: number;

    /**
     * Amount drop-downs should be padded away from the source, in px.
     * @type {number}
     * @const
     */
    var PADDING_Y: number;

    /**
     * Length of animations in seconds.
     * @type {number}
     * @const
     */
    var ANIMATION_TIME: number;

    /**
     * Dropdown bounds info object used to encapsulate sizing information about a
     * bounding element (bounding box and width/height).
     * @typedef {{
     *        top:number,
     *        left:number,
     *        bottom:number,
     *        right:number,
     *        width:number,
     *        height:number
     * }}
     */
    interface BoundsInfo {
        top: number;
        left: number;
        bottom: number;
        right: number;
        width: number;
        height: number
    }

    /**
     * Dropdown position metrics.
     * @typedef {{
     *        initialX:number,
     *        initialY:number,
     *        finalX:number,
     *        finalY:number,
     *        arrowX:?number,
     *        arrowY:?number,
     *        arrowAtTop:?boolean,
     *        arrowVisible:boolean
     * }}
     */
    interface PositionMetrics {
        initialX: number;
        initialY: number;
        finalX: number;
        finalY: number;
        arrowX: number;
        arrowY: number;
        arrowAtTop: boolean;
        arrowVisible: boolean
    }

    /**
     * Create and insert the DOM element for this div.
     * @package
     */
    function createDom(): void;

    /**
     * Set an element to maintain bounds within. Drop-downs will appear
     * within the box of this element if possible.
     * @param {?Element} boundsElement Element to bind drop-down to.
     */
    function setBoundsElement(boundsElement: Element): void;

    /**
     * Provide the div for inserting content into the drop-down.
     * @return {!Element} Div to populate with content.
     */
    function getContentDiv(): Element;

    /**
     * Clear the content of the drop-down.
     */
    function clearContent(): void;

    /**
     * Set the colour for the drop-down.
     * @param {string} backgroundColour Any CSS colour for the background.
     * @param {string} borderColour Any CSS colour for the border.
     */
    function setColour(backgroundColour: string, borderColour: string): void;

    /**
     * Shortcut to show and place the drop-down with positioning determined
     * by a particular block. The primary position will be below the block,
     * and the secondary position above the block. Drop-down will be
     * constrained to the block's workspace.
     * @param {!Field} field The field showing the drop-down.
     * @param {!BlockSvg} block Block to position the drop-down around.
     * @param {Function=} opt_onHide Optional callback for when the drop-down is
     *   hidden.
     * @param {number=} opt_secondaryYOffset Optional Y offset for above-block
     *   positioning.
     * @return {boolean} True if the menu rendered below block; false if above.
     */
    function showPositionedByBlock(field: Field, block: BlockSvg, opt_onHide?: Function, opt_secondaryYOffset?: number): boolean;

    /**
     * Shortcut to show and place the drop-down with positioning determined
     * by a particular field. The primary position will be below the field,
     * and the secondary position above the field. Drop-down will be
     * constrained to the block's workspace.
     * @param {!Field} field The field to position the dropdown against.
     * @param {Function=} opt_onHide Optional callback for when the drop-down is
     *   hidden.
     * @param {number=} opt_secondaryYOffset Optional Y offset for above-block
     *   positioning.
     * @return {boolean} True if the menu rendered below block; false if above.
     */
    function showPositionedByField(field: Field, opt_onHide?: Function, opt_secondaryYOffset?: number): boolean;

    /**
     * Show and place the drop-down.
     * The drop-down is placed with an absolute "origin point" (x, y) - i.e.,
     * the arrow will point at this origin and box will positioned below or above
     * it.  If we can maintain the container bounds at the primary point, the arrow
     * will point there, and the container will be positioned below it.
     * If we can't maintain the container bounds at the primary point, fall-back to
     * the secondary point and position above.
     * @param {?Object} owner The object showing the drop-down
     * @param {boolean} rtl Right-to-left (true) or left-to-right (false).
     * @param {number} primaryX Desired origin point x, in absolute px.
     * @param {number} primaryY Desired origin point y, in absolute px.
     * @param {number} secondaryX Secondary/alternative origin point x, in absolute
     *     px.
     * @param {number} secondaryY Secondary/alternative origin point y, in absolute
     *     px.
     * @param {Function=} opt_onHide Optional callback for when the drop-down is
     *     hidden.
     * @return {boolean} True if the menu rendered at the primary origin point.
     * @package
     */
    function show(owner: Object, rtl: boolean, primaryX: number, primaryY: number, secondaryX: number, secondaryY: number, opt_onHide?: Function): boolean;

    /**
     * Get the x positions for the left side of the DropDownDiv and the arrow,
     * accounting for the bounds of the workspace.
     * @param {number} sourceX Desired origin point x, in absolute px.
     * @param {number} boundsLeft The left edge of the bounding element, in
     *    absolute px.
     * @param {number} boundsRight The right edge of the bounding element, in
     *    absolute px.
     * @param {number} divWidth The width of the div in px.
     * @return {{divX: number, arrowX: number}} An object containing metrics for
     *    the x positions of the left side of the DropDownDiv and the arrow.
     * @package
     */
    function getPositionX(sourceX: number, boundsLeft: number, boundsRight: number, divWidth: number): { divX: number; arrowX: number };

    /**
     * Is the container visible?
     * @return {boolean} True if visible.
     */
    function isVisible(): boolean;

    /**
     * Hide the menu only if it is owned by the provided object.
     * @param {?Object} owner Object which must be owning the drop-down to hide.
     * @param {boolean=} opt_withoutAnimation True if we should hide the dropdown
     *     without animating.
     * @return {boolean} True if hidden.
     */
    function hideIfOwner(owner: Object, opt_withoutAnimation?: boolean): boolean;

    /**
     * Hide the menu, triggering animation.
     */
    function hide(): void;

    /**
     * Hide the menu, without animation.
     */
    function hideWithoutAnimation(): void;

    /**
     * Repositions the dropdownDiv on window resize. If it doesn't know how to
     * calculate the new position, it will just hide it instead.
     * @package
     */
    function repositionForWindowResize(): void;
}

declare module internal {

    /**
     * Get sizing info about the bounding element.
     * @return {!DropDownDiv.BoundsInfo} An object containing size
     *     information about the bounding element (bounding box and width/height).
     */
    function getBoundsInfo(): DropDownDiv.BoundsInfo;

    /**
     * Helper to position the drop-down and the arrow, maintaining bounds.
     * See explanation of origin points in DropDownDiv.show.
     * @param {number} primaryX Desired origin point x, in absolute px.
     * @param {number} primaryY Desired origin point y, in absolute px.
     * @param {number} secondaryX Secondary/alternative origin point x,
     *     in absolute px.
     * @param {number} secondaryY Secondary/alternative origin point y,
     *     in absolute px.
     * @return {!DropDownDiv.PositionMetrics} Various final metrics,
     *     including rendered positions for drop-down and arrow.
     */
    function getPositionMetrics(primaryX: number, primaryY: number, secondaryX: number, secondaryY: number): DropDownDiv.PositionMetrics;
}



declare module Field {

    /**
     * Non-breaking space.
     * @const
     */
    var NBSP: any /*missing*/;
}


declare module FieldAngle {

    /**
     * Construct a FieldAngle from a JSON arg object.
     * @param {!Object} options A JSON object with options (angle).
     * @return {!FieldAngle} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): FieldAngle;

    /**
     * The default amount to round angles to when using a mouse or keyboard nav
     * input. Must be a positive integer to support keyboard navigation.
     * @const {number}
     */
    var ROUND: any /*missing*/;

    /**
     * Half the width of protractor image.
     * @const {number}
     */
    var HALF: any /*missing*/;

    /**
     * Default property describing which direction makes an angle field's value
     * increase. Angle increases clockwise (true) or counterclockwise (false).
     * @const {boolean}
     */
    var CLOCKWISE: any /*missing*/;

    /**
     * The default offset of 0 degrees (and all angles). Always offsets in the
     * counterclockwise direction, regardless of the field's clockwise property.
     * Usually either 0 (0 = right) or 90 (0 = up).
     * @const {number}
     */
    var OFFSET: any /*missing*/;

    /**
     * The default maximum angle to allow before wrapping.
     * Usually either 360 (for 0 to 359.9) or 180 (for -179.9 to 180).
     * @const {number}
     */
    var WRAP: any /*missing*/;

    /**
     * Radius of protractor circle.  Slightly smaller than protractor size since
     * otherwise SVG crops off half the border at the edges.
     * @const {number}
     */
    var RADIUS: any /*missing*/;
}


declare module FieldCheckbox {

    /**
     * Construct a FieldCheckbox from a JSON arg object.
     * @param {!Object} options A JSON object with options (checked).
     * @return {!FieldCheckbox} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): FieldCheckbox;

    /**
     * Default character for the checkmark.
     * @type {string}
     * @const
     */
    var CHECK_CHAR: string;
}


declare module FieldColour {

    /**
     * Construct a FieldColour from a JSON arg object.
     * @param {!Object} options A JSON object with options (colour).
     * @return {!FieldColour} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): FieldColour;

    /**
     * An array of colour strings for the palette.
     * Copied from goog.ui.ColorPicker.SIMPLE_GRID_COLORS
     * All colour pickers use this unless overridden with setColours.
     * @type {!Array<string>}
     */
    var COLOURS: string[];

    /**
     * An array of tooltip strings for the palette.  If not the same length as
     * COLOURS, the colour's hex code will be used for any missing titles.
     * All colour pickers use this unless overridden with setColours.
     * @type {!Array<string>}
     */
    var TITLES: string[];

    /**
     * Number of columns in the palette.
     * All colour pickers use this unless overridden with setColumns.
     */
    var COLUMNS: any /*missing*/;
}


declare module FieldDropdown {

    /**
     * Dropdown image properties.
     * @typedef {{
     *            src:string,
     *            alt:string,
     *            width:number,
     *            height:number
     *          }}
     */
    interface ImageProperties {
        src: string;
        alt: string;
        width: number;
        height: number
    }

    /**
     * Construct a FieldDropdown from a JSON arg object.
     * @param {!Object} options A JSON object with options (options).
     * @return {!FieldDropdown} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): FieldDropdown;

    /**
     * Horizontal distance that a checkmark overhangs the dropdown.
     */
    var CHECKMARK_OVERHANG: any /*missing*/;

    /**
     * Maximum height of the dropdown menu, as a percentage of the viewport height.
     */
    var MAX_MENU_HEIGHT_VH: any /*missing*/;

    /**
     * Android can't (in 2014) display "▾", so use "▼" instead.
     */
    var ARROW_CHAR: any /*missing*/;

    /**
     * Use the calculated prefix and suffix lengths to trim all of the options in
     * the given array.
     * @param {!Array<!Array>} options Array of option tuples:
     *     (human-readable text or image, language-neutral name).
     * @param {number} prefixLength The length of the common prefix.
     * @param {number} suffixLength The length of the common suffix
     * @return {!Array<!Array>} A new array with all of the option text trimmed.
     */
    function applyTrim_(options: any[][], prefixLength: number, suffixLength: number): any[][];
}


declare module FieldImage {

    /**
     * Construct a FieldImage from a JSON arg object,
     * dereferencing any string table references.
     * @param {!Object} options A JSON object with options (src, width, height,
     *    alt, and flipRtl).
     * @return {!FieldImage} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): FieldImage;
}


declare module FieldLabel {

    /**
     * Construct a FieldLabel from a JSON arg object,
     * dereferencing any string table references.
     * @param {!Object} options A JSON object with options (text, and class).
     * @return {!FieldLabel} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): FieldLabel;
}


declare module FieldLabelSerializable {

    /**
     * Construct a FieldLabelSerializable from a JSON arg object,
     * dereferencing any string table references.
     * @param {!Object} options A JSON object with options (text, and class).
     * @return {!FieldLabelSerializable} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): FieldLabelSerializable;
}


declare module FieldMultilineInput {

    /**
     * Construct a FieldMultilineInput from a JSON arg object,
     * dereferencing any string table references.
     * @param {!Object} options A JSON object with options (text, and spellcheck).
     * @return {!FieldMultilineInput} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): FieldMultilineInput;
}


declare module FieldNumber {

    /**
     * Construct a FieldNumber from a JSON arg object.
     * @param {!Object} options A JSON object with options (value, min, max, and
     *                          precision).
     * @return {!FieldNumber} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): FieldNumber;
}



declare module FieldTextInput {

    /**
     * Construct a FieldTextInput from a JSON arg object,
     * dereferencing any string table references.
     * @param {!Object} options A JSON object with options (text, and spellcheck).
     * @return {!FieldTextInput} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): FieldTextInput;

    /**
     * Pixel size of input border radius.
     * Should match blocklyText's border-radius in CSS.
     */
    var BORDERRADIUS: any /*missing*/;
}


declare module FieldVariable {

    /**
     * Construct a FieldVariable from a JSON arg object,
     * dereferencing any string table references.
     * @param {!Object} options A JSON object with options (variable,
     *                          variableTypes, and defaultType).
     * @return {!FieldVariable} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): FieldVariable;

    /**
     * Return a sorted list of variable names for variable dropdown menus.
     * Include a special option at the end for creating a new variable name.
     * @return {!Array<!Array>} Array of variable names/id tuples.
     * @this {FieldVariable}
     */
    function dropdownCreate(): any[][];
}



declare module FlyoutButton {

    /**
     * The horizontal margin around the text in the button.
     */
    var MARGIN_X: any /*missing*/;

    /**
     * The vertical margin around the text in the button.
     */
    var MARGIN_Y: any /*missing*/;
}




declare module VerticalFlyout {

    /**
     * The name of the vertical flyout in the registry.
     * @type {string}
     */
    var registryName: string;
}



declare module Gesture {

    /**
     * Is a drag or other gesture currently in progress on any workspace?
     * @return {boolean} True if gesture is occurring.
     */
    function inProgress(): boolean;
}


declare module Grid {

    /**
     * Create the DOM for the grid described by options.
     * @param {string} rnd A random ID to append to the pattern's ID.
     * @param {!Object} gridOptions The object containing grid configuration.
     * @param {!SVGElement} defs The root SVG element for this workspace's defs.
     * @return {!SVGElement} The SVG element for the grid pattern.
     * @package
     */
    function createDom(rnd: string, gridOptions: Object, defs: SVGElement): SVGElement;
}






declare module InsertionMarkerManager {

    /**
     * An enum describing different kinds of previews the InsertionMarkerManager
     * could display.
     * @enum {number}
     */
    enum PREVIEW_TYPE { INSERTION_MARKER, INPUT_OUTLINE, REPLACEMENT_FADE } 

    /**
     * An error message to throw if the block created by createMarkerBlock_ is
     * missing any components.
     * @type {string}
     * @const
     */
    var DUPLICATE_BLOCK_ERROR: string;
}



declare module MarkerManager {

    /**
     * The name of the local marker.
     * @type {string}
     * @const
     */
    var LOCAL_MARKER: string;
}




declare module MetricsManager {

    /**
     * Describes the width, height and location of the toolbox on the main
     * workspace.
     * @typedef {{
     *            width: number,
     *            height: number,
     *            position: !toolboxUtils.Position
     *          }}
     */
    interface ToolboxMetrics {
        width: number;
        height: number;
        position: toolboxUtils.Position
    }

    /**
     * Describes where the viewport starts in relation to the workspace SVG.
     * @typedef {{
     *            left: number,
     *            top: number
     *          }}
     */
    interface AbsoluteMetrics {
        left: number;
        top: number
    }

    /**
     * All the measurements needed to describe the size and location of a container.
     * @typedef {{
     *            height: number,
     *            width: number,
     *            top: number,
     *            left: number
     *          }}
     */
    interface ContainerRegion {
        height: number;
        width: number;
        top: number;
        left: number
    }

    /**
     * Describes fixed edges of the workspace.
     * @typedef {{
     *            top: (number|undefined),
     *            bottom: (number|undefined),
     *            left: (number|undefined),
     *            right: (number|undefined)
     *          }}
     */
    interface FixedEdges {
        top: number|any /*undefined*/;
        bottom: number|any /*undefined*/;
        left: number|any /*undefined*/;
        right: number|any /*undefined*/
    }

    /**
     * Common metrics used for UI elements.
     * @typedef {{
     *            viewMetrics: !MetricsManager.ContainerRegion,
     *            absoluteMetrics: !MetricsManager.AbsoluteMetrics,
     *            toolboxMetrics: !MetricsManager.ToolboxMetrics
     *          }}
     */
    interface UiMetrics {
        viewMetrics: MetricsManager.ContainerRegion;
        absoluteMetrics: MetricsManager.AbsoluteMetrics;
        toolboxMetrics: MetricsManager.ToolboxMetrics
    }
}


declare module Mutator {

    /**
     * Reconnect an block to a mutated input.
     * @param {Connection} connectionChild Connection on child block.
     * @param {!Block} block Parent block.
     * @param {string} inputName Name of input on parent block.
     * @return {boolean} True iff a reconnection was made, false otherwise.
     */
    function reconnect(connectionChild: Connection, block: Block, inputName: string): boolean;

    /**
     * Get the parent workspace of a workspace that is inside a mutator, taking into
     * account whether it is a flyout.
     * @param {Workspace} workspace The workspace that is inside a mutator.
     * @return {?Workspace} The mutator's parent workspace or null.
     * @public
     */
    function findParentWs(workspace: Workspace): Workspace;
}


declare module Names {

    /**
     * Constant to separate developer variable names from user-defined variable
     * names when running generators.
     * A developer variable will be declared as a global in the generated code, but
     * will never be shown to the user in the workspace or stored in the variable
     * map.
     */
    var DEVELOPER_VARIABLE_TYPE: any /*missing*/;

    /**
     * Do the given two entity names refer to the same entity?
     * Blockly names are case-insensitive.
     * @param {string} name1 First name.
     * @param {string} name2 Second name.
     * @return {boolean} True if names are the same.
     */
    function equals(name1: string, name2: string): boolean;
}


declare module Options {

    /**
     * Grid Options.
     * @typedef {{
     *     colour: string,
     *     length: number,
     *     snap: boolean,
     *     spacing: number
     * }}
     */
    interface GridOptions {
        colour: string;
        length: number;
        snap: boolean;
        spacing: number
    }

    /**
     * Move Options.
     * @typedef {{
     *     drag: boolean,
     *     scrollbars: (boolean | !Options.ScrollbarOptions),
     *     wheel: boolean
     * }}
     */
    interface MoveOptions {
        drag: boolean;
        scrollbars: boolean|Options.ScrollbarOptions;
        wheel: boolean
    }

    /**
     * Scrollbar Options.
     * @typedef {{
     *     horizontal: boolean,
     *     vertical: boolean
     * }}
     */
    interface ScrollbarOptions {
        horizontal: boolean;
        vertical: boolean
    }

    /**
     * Zoom Options.
     * @typedef {{
     *     controls: boolean,
     *     maxScale: number,
     *     minScale: number,
     *     pinch: boolean,
     *     scaleSpeed: number,
     *     startScale: number,
     *     wheel: boolean
     * }}
     */
    interface ZoomOptions {
        controls: boolean;
        maxScale: number;
        minScale: number;
        pinch: boolean;
        scaleSpeed: number;
        startScale: number;
        wheel: boolean
    }
}




declare module Type {

    /** @type {!Type<IConnectionChecker>} */
    var CONNECTION_CHECKER: Type<IConnectionChecker>;

    /** @type {!Type<Cursor>} */
    var CURSOR: Type<Cursor>;

    /** @type {!Type<Abstract>} */
    var EVENT: Type<Abstract>;

    /** @type {!Type<Field>} */
    var FIELD: Type<Field>;

    /** @type {!Type<Renderer>} */
    var RENDERER: Type<Renderer>;

    /** @type {!Type<IToolbox>} */
    var TOOLBOX: Type<IToolbox>;

    /** @type {!Type<Theme>} */
    var THEME: Type<Theme>;

    /** @type {!Type<ToolboxItem>} */
    var TOOLBOX_ITEM: Type<ToolboxItem>;

    /** @type {!Type<IFlyout>} */
    var FLYOUTS_VERTICAL_TOOLBOX: Type<IFlyout>;

    /** @type {!Type<IFlyout>} */
    var FLYOUTS_HORIZONTAL_TOOLBOX: Type<IFlyout>;

    /** @type {!Type<IMetricsManager>} */
    var METRICS_MANAGER: Type<IMetricsManager>;

    /** @type {!Type<IBlockDragger>} */
    var BLOCK_DRAGGER: Type<IBlockDragger>;

    /**
     * @type {!Type<ISerializer>}
     * @package
     */
    var SERIALIZER: Type<ISerializer>;
}


declare module RenderedConnection {

    /**
     * Enum for different kinds of tracked states.
     *
     * WILL_TRACK means that this connection will add itself to
     * the db on the next moveTo call it receives.
     *
     * UNTRACKED means that this connection will not add
     * itself to the database until setTracking(true) is explicitly called.
     *
     * TRACKED means that this connection is currently being tracked.
     * @enum {number}
     */
    enum TrackedState { WILL_TRACK, UNTRACKED, TRACKED } 
}



declare module Scrollbar {

    /**
     * Width of vertical scrollbar or height of horizontal scrollbar in CSS pixels.
     * Scrollbars should be larger on touch devices.
     */
    var scrollbarThickness: any /*missing*/;

    /**
     * Default margin around the scrollbar (between the scrollbar and the edge of
     * the viewport in pixels).
     * @type {number}
     * @const
     * @package
     */
    var DEFAULT_SCROLLBAR_MARGIN: number;
}




declare module ShortcutRegistry {

    /**
     * Enum of valid modifiers.
     * @enum {!KeyCodes<number>}
     */
    enum modifierKeys { Shift, Control, Alt, Meta } 

    /**
     * A keyboard shortcut.
     * @typedef {{
     *    callback: ((function(!Workspace, Event,
     * !ShortcutRegistry.KeyboardShortcut):boolean)|undefined),
     *    name: string,
     *    preconditionFn: ((function(!Workspace):boolean)|undefined),
     *    metadata: (Object|undefined)
     * }}
     */
    interface KeyboardShortcut {
        callback: { (_0: Workspace, _1: Event, _2: ShortcutRegistry.KeyboardShortcut): boolean }|any /*undefined*/;
        name: string;
        preconditionFn: { (_0: Workspace): boolean }|any /*undefined*/;
        metadata: Object|any /*undefined*/
    }
}


declare module Theme {

    /**
     * A block style.
     * @typedef {{
     *            colourPrimary:string,
     *            colourSecondary:string,
     *            colourTertiary:string,
     *            hat:string
     *          }}
     */
    interface BlockStyle {
        colourPrimary: string;
        colourSecondary: string;
        colourTertiary: string;
        hat: string
    }

    /**
     * A category style.
     * @typedef {{
     *            colour:string
     *          }}
     */
    interface CategoryStyle {
        colour: string
    }

    /**
     * A component style.
     * @typedef {{
     *            workspaceBackgroundColour:?string,
     *            toolboxBackgroundColour:?string,
     *            toolboxForegroundColour:?string,
     *            flyoutBackgroundColour:?string,
     *            flyoutForegroundColour:?string,
     *            flyoutOpacity:?number,
     *            scrollbarColour:?string,
     *            scrollbarOpacity:?number,
     *            insertionMarkerColour:?string,
     *            insertionMarkerOpacity:?number,
     *            markerColour:?string,
     *            cursorColour:?string,
     *            selectedGlowColour:?string,
     *            selectedGlowOpacity:?number,
     *            replacementGlowColour:?string,
     *            replacementGlowOpacity:?number
     *          }}
     */
    interface ComponentStyle {
        workspaceBackgroundColour: string;
        toolboxBackgroundColour: string;
        toolboxForegroundColour: string;
        flyoutBackgroundColour: string;
        flyoutForegroundColour: string;
        flyoutOpacity: number;
        scrollbarColour: string;
        scrollbarOpacity: number;
        insertionMarkerColour: string;
        insertionMarkerOpacity: number;
        markerColour: string;
        cursorColour: string;
        selectedGlowColour: string;
        selectedGlowOpacity: number;
        replacementGlowColour: string;
        replacementGlowOpacity: number
    }

    /**
     * A font style.
     * @typedef {{
     *            family:?string,
     *            weight:?string,
     *            size:?number
     *          }}
     */
    interface FontStyle {
        family: string;
        weight: string;
        size: number
    }

    /**
     * Define a new Blockly theme.
     * @param {string} name The name of the theme.
     * @param {!Object} themeObj An object containing theme properties.
     * @return {!Theme} A new Blockly theme.
     */
    function defineTheme(name: string, themeObj: Object): Theme;
}


declare module ThemeManager {

    /**
     * A Blockly UI component type.
     * @typedef {{
     *            element:!Element,
     *            propertyName:string
     *          }}
     */
    interface Component {
        element: Element;
        propertyName: string
    }
}




declare module TouchGesture {

    /**
     * A multiplier used to convert the gesture scale to a zoom in delta.
     * @const
     */
    var ZOOM_IN_MULTIPLIER: any /*missing*/;

    /**
     * A multiplier used to convert the gesture scale to a zoom out delta.
     * @const
     */
    var ZOOM_OUT_MULTIPLIER: any /*missing*/;
}





declare module VariableModel {

    /**
     * A custom compare function for the VariableModel objects.
     * @param {VariableModel} var1 First variable to compare.
     * @param {VariableModel} var2 Second variable to compare.
     * @return {number} -1 if name of var1 is less than name of var2, 0 if equal,
     *     and 1 if greater.
     * @package
     */
    function compareByName(var1: VariableModel, var2: VariableModel): number;
}






declare module Workspace {

    /**
     * Angle away from the horizontal to sweep for blocks.  Order of execution is
     * generally top to bottom, but a small angle changes the scan to give a bit of
     * a left to right bias (reversed in RTL).  Units are in degrees.
     * See: https://tvtropes.org/pmwiki/pmwiki.php/Main/DiagonalBilling
     */
    var SCAN_ANGLE: any /*missing*/;

    /**
     * Find the workspace with the specified ID.
     * @param {string} id ID of workspace to find.
     * @return {?Workspace} The sought after workspace or null if not found.
     */
    function getById(id: string): Workspace;

    /**
     * Find all workspaces.
     * @return {!Array<!Workspace>} Array of workspaces.
     */
    function getAll(): Workspace[];
}



declare module WorkspaceComment {

    /**
     * Fire a create event for the given workspace comment, if comments are enabled.
     * @param {!WorkspaceComment} comment The comment that was just created.
     * @package
     */
    function fireCreateEvent(comment: WorkspaceComment): void;

    /**
     * Decode an XML comment tag and create a comment on the workspace.
     * @param {!Element} xmlComment XML comment element.
     * @param {!Workspace} workspace The workspace.
     * @return {!WorkspaceComment} The created workspace comment.
     * @package
     */
    function fromXml(xmlComment: Element, workspace: Workspace): WorkspaceComment;

    /**
     * Decode an XML comment tag and return the results in an object.
     * @param {!Element} xml XML comment element.
     * @return {{w: number, h: number, x: number, y: number, content: string}} An
     *     object containing the id, size, position, and comment string.
     * @package
     */
    function parseAttributes(xml: Element): { w: number; h: number; x: number; y: number; content: string };
}


declare module WorkspaceCommentSvg {

    /**
     * The width and height to use to size a workspace comment when it is first
     * added, before it has been edited by the user.
     * @type {number}
     * @package
     */
    var DEFAULT_SIZE: number;

    /**
     * Decode an XML comment tag and create a rendered comment on the workspace.
     * @param {!Element} xmlComment XML comment element.
     * @param {!WorkspaceSvg} workspace The workspace.
     * @param {number=} opt_wsWidth The width of the workspace, which is used to
     *     position comments correctly in RTL.
     * @return {!WorkspaceCommentSvg} The created workspace comment.
     * @package
     */
    function fromXml(xmlComment: Element, workspace: WorkspaceSvg, opt_wsWidth?: number): WorkspaceCommentSvg;
}










declare module BlockChange {

    /**
     * Returns the extra state of the given block (either as XML or a JSO, depending
     * on the block's definition).
     * @param {!BlockSvg} block The block to get the extra state of.
     * @return {string} A stringified version of the extra state of the given block.
     * @package
     */
    function getExtraBlockState_(block: BlockSvg): string;
}








declare module CommentBase {

    /**
     * Helper function for Comment[Create|Delete]
     * @param {!CommentCreate|!CommentDelete} event
     *     The event to run.
     * @param {boolean} create if True then Create, if False then Delete
     */
    function CommentCreateDeleteHelper(event: CommentCreate|CommentDelete, create: boolean): void;
}




























declare module IComponent {

    /**
     * The unique id for this component that is used to register with the
     * ComponentManager.
     * @type {string}
     */
    var id: string;
}




declare module ICopyable {

    /**
     * Copy Metadata.
     * @typedef {{
     *            saveInfo:(!Object|!Element),
     *            source:WorkspaceSvg,
     *            typeCounts:?Object
     *          }}
     */
    interface CopyData {
        saveInfo: Object|Element;
        source: WorkspaceSvg;
        typeCounts: Object
    }
}












declare module IRegistrableField {

    /**
     * @typedef {function(!Object): Field}
     */
    interface fromJson {
        (_0: Object): Field
    }
}








declare module ASTNode {

    /**
     * @typedef {{
     *     wsCoordinate: Coordinate
     * }}
     */
    interface Params {
        wsCoordinate: Coordinate
    }

    /**
     * Object holding different types for an AST node.
     * @enum {string}
     */
    enum types { FIELD, BLOCK, INPUT, OUTPUT, NEXT, PREVIOUS, STACK, WORKSPACE } 

    /**
     * True to navigate to all fields. False to only navigate to clickable fields.
     * @type {boolean}
     */
    var NAVIGATE_ALL_FIELDS: boolean;

    /**
     * Create an AST node pointing to a field.
     * @param {Field} field The location of the AST node.
     * @return {ASTNode} An AST node pointing to a field.
     */
    function createFieldNode(field: Field): ASTNode;

    /**
     * Creates an AST node pointing to a connection. If the connection has a parent
     * input then create an AST node of type input that will hold the connection.
     * @param {Connection} connection This is the connection the node will
     *     point to.
     * @return {ASTNode} An AST node pointing to a connection.
     */
    function createConnectionNode(connection: Connection): ASTNode;

    /**
     * Creates an AST node pointing to an input. Stores the input connection as the
     *     location.
     * @param {Input} input The input used to create an AST node.
     * @return {ASTNode} An AST node pointing to a input.
     */
    function createInputNode(input: Input): ASTNode;

    /**
     * Creates an AST node pointing to a block.
     * @param {Block} block The block used to create an AST node.
     * @return {ASTNode} An AST node pointing to a block.
     */
    function createBlockNode(block: Block): ASTNode;

    /**
     * Create an AST node of type stack. A stack, represented by its top block, is
     *     the set of all blocks connected to a top block, including the top block.
     * @param {Block} topBlock A top block has no parent and can be found
     *     in the list returned by workspace.getTopBlocks().
     * @return {ASTNode} An AST node of type stack that points to the top
     *     block on the stack.
     */
    function createStackNode(topBlock: Block): ASTNode;

    /**
     * Creates an AST node pointing to a workspace.
     * @param {!Workspace} workspace The workspace that we are on.
     * @param {Coordinate} wsCoordinate The position on the workspace
     *     for this node.
     * @return {ASTNode} An AST node pointing to a workspace and a position
     *     on the workspace.
     */
    function createWorkspaceNode(workspace: Workspace, wsCoordinate: Coordinate): ASTNode;

    /**
     * Creates an AST node for the top position on a block.
     * This is either an output connection, previous connection, or block.
     * @param {!Block} block The block to find the top most AST node on.
     * @return {ASTNode} The AST node holding the top most position on the
     *     block.
     */
    function createTopNode(block: Block): ASTNode;
}


declare module BasicCursor {

    /**
     * Name used for registering a basic cursor.
     * @const {string}
     */
    var registrationName: any /*missing*/;
}







declare module exports {

    /**
     * The priority for deserializing variables.
     * @type {number}
     * @const
     * @alias Blockly.serialization.priorities.VARIABLES
     */
    var VARIABLES: number;

    /**
     * The priority for deserializing blocks.
     * @type {number}
     * @const
     * @alias Blockly.serialization.priorities.BLOCKS
     */
    var BLOCKS: number;
}








declare module ToolboxCategory {

    /**
     * All the CSS class names that are used to create a category.
     * @typedef {{
     *            container:(string|undefined),
     *            row:(string|undefined),
     *            rowcontentcontainer:(string|undefined),
     *            icon:(string|undefined),
     *            label:(string|undefined),
     *            selected:(string|undefined),
     *            openicon:(string|undefined),
     *            closedicon:(string|undefined)
     *          }}
     */
    interface CssConfig {
        container: string|any /*undefined*/;
        row: string|any /*undefined*/;
        rowcontentcontainer: string|any /*undefined*/;
        icon: string|any /*undefined*/;
        label: string|any /*undefined*/;
        selected: string|any /*undefined*/;
        openicon: string|any /*undefined*/;
        closedicon: string|any /*undefined*/
    }

    /**
     * Name used for registering a toolbox category.
     * @const {string}
     */
    var registrationName: any /*missing*/;

    /**
     * The number of pixels to move the category over at each nested level.
     * @type {number}
     */
    var nestedPadding: number;

    /**
     * The width in pixels of the strip of colour next to each category.
     * @type {number}
     */
    var borderWidth: number;

    /**
     * The default colour of the category. This is used as the background colour of
     * the category when it is selected.
     * @type {string}
     */
    var defaultBackgroundColour: string;
}


declare module CollapsibleToolboxCategory {

    /**
     * All the CSS class names that are used to create a collapsible
     * category. This is all the properties from the regular category plus contents.
     * @typedef {{
     *            container:?string,
     *            row:?string,
     *            rowcontentcontainer:?string,
     *            icon:?string,
     *            label:?string,
     *            selected:?string,
     *            openicon:?string,
     *            closedicon:?string,
     *            contents:?string
     *          }}
     */
    interface CssConfig {
        container: string;
        row: string;
        rowcontentcontainer: string;
        icon: string;
        label: string;
        selected: string;
        openicon: string;
        closedicon: string;
        contents: string
    }

    /**
     * Name used for registering a collapsible toolbox category.
     * @const {string}
     */
    var registrationName: any /*missing*/;
}


declare module ToolboxSeparator {

    /**
     * All the CSS class names that are used to create a separator.
     * @typedef {{
     *            container:(string|undefined)
     *          }}
     */
    interface CssConfig {
        container: string|any /*undefined*/
    }

    /**
     * Name used for registering a toolbox separator.
     * @const {string}
     */
    var registrationName: any /*missing*/;
}






declare module Coordinate {

    /**
     * Compares coordinates for equality.
     * @param {?Coordinate} a A Coordinate.
     * @param {?Coordinate} b A Coordinate.
     * @return {boolean} True iff the coordinates are equal, or if both are null.
     */
    function equals(a: Coordinate, b: Coordinate): boolean;

    /**
     * Returns the distance between two coordinates.
     * @param {!Coordinate} a A Coordinate.
     * @param {!Coordinate} b A Coordinate.
     * @return {number} The distance between `a` and `b`.
     */
    function distance(a: Coordinate, b: Coordinate): number;

    /**
     * Returns the magnitude of a coordinate.
     * @param {!Coordinate} a A Coordinate.
     * @return {number} The distance between the origin and `a`.
     */
    function magnitude(a: Coordinate): number;

    /**
     * Returns the difference between two coordinates as a new
     * Coordinate.
     * @param {!Coordinate|!SVGPoint} a An x/y coordinate.
     * @param {!Coordinate|!SVGPoint} b An x/y coordinate.
     * @return {!Coordinate} A Coordinate representing the difference
     *     between `a` and `b`.
     */
    function difference(a: Coordinate|SVGPoint, b: Coordinate|SVGPoint): Coordinate;

    /**
     * Returns the sum of two coordinates as a new Coordinate.
     * @param {!Coordinate|!SVGPoint} a An x/y coordinate.
     * @param {!Coordinate|!SVGPoint} b An x/y coordinate.
     * @return {!Coordinate} A Coordinate representing the sum of
     *     the two coordinates.
     */
    function sum(a: Coordinate|SVGPoint, b: Coordinate|SVGPoint): Coordinate;
}




declare module exports {

    /**
     * Reference to the global object.
     *
     * More info on this implementation here:
     * https://docs.google.com/document/d/1NAeW4Wk7I7FV0Y2tcUFvQdGMc89k2vdgSXInw8_nvCI
     */
    var globalThis: any /*missing*/;
}


declare module internal {

    /**
     * Generate a random unique ID.  This should be globally unique.
     * 87 characters ^ 20 length > 128 bits (better than a UUID).
     * @return {string} A globally unique ID string.
     */
    function genUid(): string;
}







declare module Size {

    /**
     * Compares sizes for equality.
     * @param {?Size} a A Size.
     * @param {?Size} b A Size.
     * @return {boolean} True iff the sizes have equal widths and equal
     *     heights, or if both are null.
     */
    function equals(a: Size, b: Size): boolean;
}




declare module Svg {

    /**
     * @type {!Svg<!SVGAnimateElement>}
     * @package
     */
    var ANIMATE: Svg<SVGAnimateElement>;

    /**
     * @type {!Svg<!SVGCircleElement>}
     * @package
     */
    var CIRCLE: Svg<SVGCircleElement>;

    /**
     * @type {!Svg<!SVGClipPathElement>}
     * @package
     */
    var CLIPPATH: Svg<SVGClipPathElement>;

    /**
     * @type {!Svg<!SVGDefsElement>}
     * @package
     */
    var DEFS: Svg<SVGDefsElement>;

    /**
     * @type {!Svg<!SVGFECompositeElement>}
     * @package
     */
    var FECOMPOSITE: Svg<SVGFECompositeElement>;

    /**
     * @type {!Svg<!SVGFEComponentTransferElement>}
     * @package
     */
    var FECOMPONENTTRANSFER: Svg<SVGFEComponentTransferElement>;

    /**
     * @type {!Svg<!SVGFEFloodElement>}
     * @package
     */
    var FEFLOOD: Svg<SVGFEFloodElement>;

    /**
     * @type {!Svg<!SVGFEFuncAElement>}
     * @package
     */
    var FEFUNCA: Svg<SVGFEFuncAElement>;

    /**
     * @type {!Svg<!SVGFEGaussianBlurElement>}
     * @package
     */
    var FEGAUSSIANBLUR: Svg<SVGFEGaussianBlurElement>;

    /**
     * @type {!Svg<!SVGFEPointLightElement>}
     * @package
     */
    var FEPOINTLIGHT: Svg<SVGFEPointLightElement>;

    /**
     * @type {!Svg<!SVGFESpecularLightingElement>}
     * @package
     */
    var FESPECULARLIGHTING: Svg<SVGFESpecularLightingElement>;

    /**
     * @type {!Svg<!SVGFilterElement>}
     * @package
     */
    var FILTER: Svg<SVGFilterElement>;

    /**
     * @type {!Svg<!SVGForeignObjectElement>}
     * @package
     */
    var FOREIGNOBJECT: Svg<SVGForeignObjectElement>;

    /**
     * @type {!Svg<!SVGGElement>}
     * @package
     */
    var G: Svg<SVGGElement>;

    /**
     * @type {!Svg<!SVGImageElement>}
     * @package
     */
    var IMAGE: Svg<SVGImageElement>;

    /**
     * @type {!Svg<!SVGLineElement>}
     * @package
     */
    var LINE: Svg<SVGLineElement>;

    /**
     * @type {!Svg<!SVGPathElement>}
     * @package
     */
    var PATH: Svg<SVGPathElement>;

    /**
     * @type {!Svg<!SVGPatternElement>}
     * @package
     */
    var PATTERN: Svg<SVGPatternElement>;

    /**
     * @type {!Svg<!SVGPolygonElement>}
     * @package
     */
    var POLYGON: Svg<SVGPolygonElement>;

    /**
     * @type {!Svg<!SVGRectElement>}
     * @package
     */
    var RECT: Svg<SVGRectElement>;

    /**
     * @type {!Svg<!SVGSVGElement>}
     * @package
     */
    var SVG: Svg<SVGSVGElement>;

    /**
     * @type {!Svg<!SVGTextElement>}
     * @package
     */
    var TEXT: Svg<SVGTextElement>;

    /**
     * @type {!Svg<!SVGTSpanElement>}
     * @package
     */
    var TSPAN: Svg<SVGTSpanElement>;
}




declare module exports {

    /** @const {string}
     * @alias Blockly.utils.userAgent.raw
     */
    var raw: any /*missing*/;

    /** @const {boolean}
     * @alias Blockly.utils.userAgent.IE
     */
    var IE: any /*missing*/;

    /** @const {boolean}
     * @alias Blockly.utils.userAgent.EDGE
     */
    var EDGE: any /*missing*/;

    /** @const {boolean}
     * @alias Blockly.utils.userAgent.JavaFx
     */
    var JavaFx: any /*missing*/;

    /** @const {boolean}
     * @alias Blockly.utils.userAgent.CHROME
     */
    var CHROME: any /*missing*/;

    /** @const {boolean}
     * @alias Blockly.utils.userAgent.WEBKIT
     */
    var WEBKIT: any /*missing*/;

    /** @const {boolean}
     * @alias Blockly.utils.userAgent.GECKO
     */
    var GECKO: any /*missing*/;

    /** @const {boolean}
     * @alias Blockly.utils.userAgent.ANDROID
     */
    var ANDROID: any /*missing*/;

    /** @const {boolean}
     * @alias Blockly.utils.userAgent.IPAD
     */
    var IPAD: any /*missing*/;

    /** @const {boolean}
     * @alias Blockly.utils.userAgent.IPOD
     */
    var IPOD: any /*missing*/;

    /** @const {boolean}
     * @alias Blockly.utils.userAgent.IPHONE
     */
    var IPHONE: any /*missing*/;

    /** @const {boolean}
     * @alias Blockly.utils.userAgent.MAC
     */
    var MAC: any /*missing*/;

    /** @const {boolean}
     * @alias Blockly.utils.userAgent.TABLET
     */
    var TABLET: any /*missing*/;

    /** @const {boolean}
     * @alias Blockly.utils.userAgent.MOBILE
     */
    var MOBILE: any /*missing*/;
}






declare module Debug {

    /**
     * Configuration object containing booleans to enable and disable debug
     * rendering of specific rendering components.
     * @type {!Object<string, boolean>}
     */
    var config: { [key: string]: boolean };
}





























declare module Types {

    /**
     * A Left Corner Union Type.
     * @type {number}
     * @const
     * @package
     */
    var LEFT_CORNER: number;

    /**
     * A Right Corner Union Type.
     * @type {number}
     * @const
     * @package
     */
    var RIGHT_CORNER: number;

    /**
     * Get the enum flag value of an existing type or register a new type.
     * @param {!string} type The name of the type.
     * @return {!number} The enum flag value associated with that type.
     * @package
     */
    function getType(type: string): number;

    /**
     * Whether a measurable stores information about a field.
     * @param {!Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a field.
     * @package
     */
    function isField(elem: Measurable): number;

    /**
     * Whether a measurable stores information about a hat.
     * @param {!Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a hat.
     * @package
     */
    function isHat(elem: Measurable): number;

    /**
     * Whether a measurable stores information about an icon.
     * @param {!Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about an icon.
     * @package
     */
    function isIcon(elem: Measurable): number;

    /**
     * Whether a measurable stores information about a spacer.
     * @param {!Measurable|!Row} elem
     *     The element to check.
     * @return {number} 1 if the object stores information about a spacer.
     * @package
     */
    function isSpacer(elem: Measurable|Row): number;

    /**
     * Whether a measurable stores information about an in-row spacer.
     * @param {!Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about an
     *   in-row spacer.
     * @package
     */
    function isInRowSpacer(elem: Measurable): number;

    /**
     * Whether a measurable stores information about an input.
     * @param {!Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about an input.
     * @package
     */
    function isInput(elem: Measurable): number;

    /**
     * Whether a measurable stores information about an external input.
     * @param {!Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about an
     *   external input.
     * @package
     */
    function isExternalInput(elem: Measurable): number;

    /**
     * Whether a measurable stores information about an inline input.
     * @param {!Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about an
     *   inline input.
     * @package
     */
    function isInlineInput(elem: Measurable): number;

    /**
     * Whether a measurable stores information about a statement input.
     * @param {!Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a
     *   statement input.
     * @package
     */
    function isStatementInput(elem: Measurable): number;

    /**
     * Whether a measurable stores information about a previous connection.
     * @param {!Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a
     *   previous connection.
     * @package
     */
    function isPreviousConnection(elem: Measurable): number;

    /**
     * Whether a measurable stores information about a next connection.
     * @param {!Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a
     *   next connection.
     * @package
     */
    function isNextConnection(elem: Measurable): number;

    /**
     * Whether a measurable stores information about a previous or next connection.
     * @param {!Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a previous or
     *   next connection.
     * @package
     */
    function isPreviousOrNextConnection(elem: Measurable): number;

    /**
     * Whether a measurable stores information about a left round corner.
     * @param {!Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a
     *   left round corner.
     * @package
     */
    function isLeftRoundedCorner(elem: Measurable): number;

    /**
     * Whether a measurable stores information about a right round corner.
     * @param {!Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a
     *   right round corner.
     * @package
     */
    function isRightRoundedCorner(elem: Measurable): number;

    /**
     * Whether a measurable stores information about a left square corner.
     * @param {!Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a
     *   left square corner.
     * @package
     */
    function isLeftSquareCorner(elem: Measurable): number;

    /**
     * Whether a measurable stores information about a right square corner.
     * @param {!Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a
     *   right square corner.
     * @package
     */
    function isRightSquareCorner(elem: Measurable): number;

    /**
     * Whether a measurable stores information about a corner.
     * @param {!Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a
     *   corner.
     * @package
     */
    function isCorner(elem: Measurable): number;

    /**
     * Whether a measurable stores information about a jagged edge.
     * @param {!Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a jagged edge.
     * @package
     */
    function isJaggedEdge(elem: Measurable): number;

    /**
     * Whether a measurable stores information about a row.
     * @param {!Row} row The row to check.
     * @return {number} 1 if the object stores information about a row.
     * @package
     */
    function isRow(row: Row): number;

    /**
     * Whether a measurable stores information about a between-row spacer.
     * @param {!Row} row The row to check.
     * @return {number} 1 if the object stores information about a
     *   between-row spacer.
     * @package
     */
    function isBetweenRowSpacer(row: Row): number;

    /**
     * Whether a measurable stores information about a top row.
     * @param {!Row} row The row to check.
     * @return {number} 1 if the object stores information about a top row.
     * @package
     */
    function isTopRow(row: Row): number;

    /**
     * Whether a measurable stores information about a bottom row.
     * @param {!Row} row The row to check.
     * @return {number} 1 if the object stores information about a bottom row.
     * @package
     */
    function isBottomRow(row: Row): number;

    /**
     * Whether a measurable stores information about a top or bottom row.
     * @param {!Row} row The row to check.
     * @return {number} 1 if the object stores information about a top or
     *   bottom row.
     * @package
     */
    function isTopOrBottomRow(row: Row): number;

    /**
     * Whether a measurable stores information about an input row.
     * @param {!Row} row The row to check.
     * @return {number} 1 if the object stores information about an input row.
     * @package
     */
    function isInputRow(row: Row): number;
}


declare module Blockly.Msg {

    /** @type {string} */
    var LOGIC_HUE: string;

    /** @type {string} */
    var LOOPS_HUE: string;

    /** @type {string} */
    var MATH_HUE: string;

    /** @type {string} */
    var TEXTS_HUE: string;

    /** @type {string} */
    var LISTS_HUE: string;

    /** @type {string} */
    var COLOUR_HUE: string;

    /** @type {string} */
    var VARIABLES_HUE: string;

    /** @type {string} */
    var VARIABLES_DYNAMIC_HUE: string;

    /** @type {string} */
    var PROCEDURES_HUE: string;

    /** @type {string} */
    var VARIABLES_DEFAULT_NAME: string;

    /** @type {string} */
    var UNNAMED_KEY: string;

    /** @type {string} */
    var TODAY: string;

    /** @type {string} */
    var DUPLICATE_BLOCK: string;

    /** @type {string} */
    var ADD_COMMENT: string;

    /** @type {string} */
    var REMOVE_COMMENT: string;

    /** @type {string} */
    var DUPLICATE_COMMENT: string;

    /** @type {string} */
    var EXTERNAL_INPUTS: string;

    /** @type {string} */
    var INLINE_INPUTS: string;

    /** @type {string} */
    var DELETE_BLOCK: string;

    /** @type {string} */
    var DELETE_X_BLOCKS: string;

    /** @type {string} */
    var DELETE_ALL_BLOCKS: string;

    /** @type {string} */
    var CLEAN_UP: string;

    /** @type {string} */
    var COLLAPSE_BLOCK: string;

    /** @type {string} */
    var COLLAPSE_ALL: string;

    /** @type {string} */
    var EXPAND_BLOCK: string;

    /** @type {string} */
    var EXPAND_ALL: string;

    /** @type {string} */
    var DISABLE_BLOCK: string;

    /** @type {string} */
    var ENABLE_BLOCK: string;

    /** @type {string} */
    var HELP: string;

    /** @type {string} */
    var UNDO: string;

    /** @type {string} */
    var REDO: string;

    /** @type {string} */
    var CHANGE_VALUE_TITLE: string;

    /** @type {string} */
    var RENAME_VARIABLE: string;

    /** @type {string} */
    var RENAME_VARIABLE_TITLE: string;

    /** @type {string} */
    var NEW_VARIABLE: string;

    /** @type {string} */
    var NEW_STRING_VARIABLE: string;

    /** @type {string} */
    var NEW_NUMBER_VARIABLE: string;

    /** @type {string} */
    var NEW_COLOUR_VARIABLE: string;

    /** @type {string} */
    var NEW_VARIABLE_TYPE_TITLE: string;

    /** @type {string} */
    var NEW_VARIABLE_TITLE: string;

    /** @type {string} */
    var VARIABLE_ALREADY_EXISTS: string;

    /** @type {string} */
    var VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE: string;

    /** @type {string} */
    var DELETE_VARIABLE_CONFIRMATION: string;

    /** @type {string} */
    var CANNOT_DELETE_VARIABLE_PROCEDURE: string;

    /** @type {string} */
    var DELETE_VARIABLE: string;

    /** @type {string} */
    var COLOUR_PICKER_HELPURL: string;

    /** @type {string} */
    var COLOUR_PICKER_TOOLTIP: string;

    /** @type {string} */
    var COLOUR_RANDOM_HELPURL: string;

    /** @type {string} */
    var COLOUR_RANDOM_TITLE: string;

    /** @type {string} */
    var COLOUR_RANDOM_TOOLTIP: string;

    /** @type {string} */
    var COLOUR_RGB_HELPURL: string;

    /** @type {string} */
    var COLOUR_RGB_TITLE: string;

    /** @type {string} */
    var COLOUR_RGB_RED: string;

    /** @type {string} */
    var COLOUR_RGB_GREEN: string;

    /** @type {string} */
    var COLOUR_RGB_BLUE: string;

    /** @type {string} */
    var COLOUR_RGB_TOOLTIP: string;

    /** @type {string} */
    var COLOUR_BLEND_HELPURL: string;

    /** @type {string} */
    var COLOUR_BLEND_TITLE: string;

    /** @type {string} */
    var COLOUR_BLEND_COLOUR1: string;

    /** @type {string} */
    var COLOUR_BLEND_COLOUR2: string;

    /** @type {string} */
    var COLOUR_BLEND_RATIO: string;

    /** @type {string} */
    var COLOUR_BLEND_TOOLTIP: string;

    /** @type {string} */
    var CONTROLS_REPEAT_HELPURL: string;

    /** @type {string} */
    var CONTROLS_REPEAT_TITLE: string;

    /** @type {string} */
    var CONTROLS_REPEAT_INPUT_DO: string;

    /** @type {string} */
    var CONTROLS_REPEAT_TOOLTIP: string;

    /** @type {string} */
    var CONTROLS_WHILEUNTIL_HELPURL: string;

    /** @type {string} */
    var CONTROLS_WHILEUNTIL_INPUT_DO: string;

    /** @type {string} */
    var CONTROLS_WHILEUNTIL_OPERATOR_WHILE: string;

    /** @type {string} */
    var CONTROLS_WHILEUNTIL_OPERATOR_UNTIL: string;

    /** @type {string} */
    var CONTROLS_WHILEUNTIL_TOOLTIP_WHILE: string;

    /** @type {string} */
    var CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL: string;

    /** @type {string} */
    var CONTROLS_FOR_HELPURL: string;

    /** @type {string} */
    var CONTROLS_FOR_TOOLTIP: string;

    /** @type {string} */
    var CONTROLS_FOR_TITLE: string;

    /** @type {string} */
    var CONTROLS_FOR_INPUT_DO: string;

    /** @type {string} */
    var CONTROLS_FOREACH_HELPURL: string;

    /** @type {string} */
    var CONTROLS_FOREACH_TITLE: string;

    /** @type {string} */
    var CONTROLS_FOREACH_INPUT_DO: string;

    /** @type {string} */
    var CONTROLS_FOREACH_TOOLTIP: string;

    /** @type {string} */
    var CONTROLS_FLOW_STATEMENTS_HELPURL: string;

    /** @type {string} */
    var CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK: string;

    /** @type {string} */
    var CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE: string;

    /** @type {string} */
    var CONTROLS_FLOW_STATEMENTS_TOOLTIP_BREAK: string;

    /** @type {string} */
    var CONTROLS_FLOW_STATEMENTS_TOOLTIP_CONTINUE: string;

    /** @type {string} */
    var CONTROLS_FLOW_STATEMENTS_WARNING: string;

    /** @type {string} */
    var CONTROLS_IF_HELPURL: string;

    /** @type {string} */
    var CONTROLS_IF_TOOLTIP_1: string;

    /** @type {string} */
    var CONTROLS_IF_TOOLTIP_2: string;

    /** @type {string} */
    var CONTROLS_IF_TOOLTIP_3: string;

    /** @type {string} */
    var CONTROLS_IF_TOOLTIP_4: string;

    /** @type {string} */
    var CONTROLS_IF_MSG_IF: string;

    /** @type {string} */
    var CONTROLS_IF_MSG_ELSEIF: string;

    /** @type {string} */
    var CONTROLS_IF_MSG_ELSE: string;

    /** @type {string} */
    var CONTROLS_IF_MSG_THEN: string;

    /** @type {string} */
    var CONTROLS_IF_IF_TITLE_IF: string;

    /** @type {string} */
    var CONTROLS_IF_IF_TOOLTIP: string;

    /** @type {string} */
    var CONTROLS_IF_ELSEIF_TITLE_ELSEIF: string;

    /** @type {string} */
    var CONTROLS_IF_ELSEIF_TOOLTIP: string;

    /** @type {string} */
    var CONTROLS_IF_ELSE_TITLE_ELSE: string;

    /** @type {string} */
    var CONTROLS_IF_ELSE_TOOLTIP: string;

    /** @type {string} */
    var LOGIC_COMPARE_HELPURL: string;

    /** @type {string} */
    var LOGIC_COMPARE_TOOLTIP_EQ: string;

    /** @type {string} */
    var LOGIC_COMPARE_TOOLTIP_NEQ: string;

    /** @type {string} */
    var LOGIC_COMPARE_TOOLTIP_LT: string;

    /** @type {string} */
    var LOGIC_COMPARE_TOOLTIP_LTE: string;

    /** @type {string} */
    var LOGIC_COMPARE_TOOLTIP_GT: string;

    /** @type {string} */
    var LOGIC_COMPARE_TOOLTIP_GTE: string;

    /** @type {string} */
    var LOGIC_OPERATION_HELPURL: string;

    /** @type {string} */
    var LOGIC_OPERATION_TOOLTIP_AND: string;

    /** @type {string} */
    var LOGIC_OPERATION_AND: string;

    /** @type {string} */
    var LOGIC_OPERATION_TOOLTIP_OR: string;

    /** @type {string} */
    var LOGIC_OPERATION_OR: string;

    /** @type {string} */
    var LOGIC_NEGATE_HELPURL: string;

    /** @type {string} */
    var LOGIC_NEGATE_TITLE: string;

    /** @type {string} */
    var LOGIC_NEGATE_TOOLTIP: string;

    /** @type {string} */
    var LOGIC_BOOLEAN_HELPURL: string;

    /** @type {string} */
    var LOGIC_BOOLEAN_TRUE: string;

    /** @type {string} */
    var LOGIC_BOOLEAN_FALSE: string;

    /** @type {string} */
    var LOGIC_BOOLEAN_TOOLTIP: string;

    /** @type {string} */
    var LOGIC_NULL_HELPURL: string;

    /** @type {string} */
    var LOGIC_NULL: string;

    /** @type {string} */
    var LOGIC_NULL_TOOLTIP: string;

    /** @type {string} */
    var LOGIC_TERNARY_HELPURL: string;

    /** @type {string} */
    var LOGIC_TERNARY_CONDITION: string;

    /** @type {string} */
    var LOGIC_TERNARY_IF_TRUE: string;

    /** @type {string} */
    var LOGIC_TERNARY_IF_FALSE: string;

    /** @type {string} */
    var LOGIC_TERNARY_TOOLTIP: string;

    /** @type {string} */
    var MATH_NUMBER_HELPURL: string;

    /** @type {string} */
    var MATH_NUMBER_TOOLTIP: string;

    /** @type {string} */
    var MATH_ADDITION_SYMBOL: string;

    /** @type {string} */
    var MATH_SUBTRACTION_SYMBOL: string;

    /** @type {string} */
    var MATH_DIVISION_SYMBOL: string;

    /** @type {string} */
    var MATH_MULTIPLICATION_SYMBOL: string;

    /** @type {string} */
    var MATH_POWER_SYMBOL: string;

    /** @type {string} */
    var MATH_TRIG_SIN: string;

    /** @type {string} */
    var MATH_TRIG_COS: string;

    /** @type {string} */
    var MATH_TRIG_TAN: string;

    /** @type {string} */
    var MATH_TRIG_ASIN: string;

    /** @type {string} */
    var MATH_TRIG_ACOS: string;

    /** @type {string} */
    var MATH_TRIG_ATAN: string;

    /** @type {string} */
    var MATH_ARITHMETIC_HELPURL: string;

    /** @type {string} */
    var MATH_ARITHMETIC_TOOLTIP_ADD: string;

    /** @type {string} */
    var MATH_ARITHMETIC_TOOLTIP_MINUS: string;

    /** @type {string} */
    var MATH_ARITHMETIC_TOOLTIP_MULTIPLY: string;

    /** @type {string} */
    var MATH_ARITHMETIC_TOOLTIP_DIVIDE: string;

    /** @type {string} */
    var MATH_ARITHMETIC_TOOLTIP_POWER: string;

    /** @type {string} */
    var MATH_SINGLE_HELPURL: string;

    /** @type {string} */
    var MATH_SINGLE_OP_ROOT: string;

    /** @type {string} */
    var MATH_SINGLE_TOOLTIP_ROOT: string;

    /** @type {string} */
    var MATH_SINGLE_OP_ABSOLUTE: string;

    /** @type {string} */
    var MATH_SINGLE_TOOLTIP_ABS: string;

    /** @type {string} */
    var MATH_SINGLE_TOOLTIP_NEG: string;

    /** @type {string} */
    var MATH_SINGLE_TOOLTIP_LN: string;

    /** @type {string} */
    var MATH_SINGLE_TOOLTIP_LOG10: string;

    /** @type {string} */
    var MATH_SINGLE_TOOLTIP_EXP: string;

    /** @type {string} */
    var MATH_SINGLE_TOOLTIP_POW10: string;

    /** @type {string} */
    var MATH_TRIG_HELPURL: string;

    /** @type {string} */
    var MATH_TRIG_TOOLTIP_SIN: string;

    /** @type {string} */
    var MATH_TRIG_TOOLTIP_COS: string;

    /** @type {string} */
    var MATH_TRIG_TOOLTIP_TAN: string;

    /** @type {string} */
    var MATH_TRIG_TOOLTIP_ASIN: string;

    /** @type {string} */
    var MATH_TRIG_TOOLTIP_ACOS: string;

    /** @type {string} */
    var MATH_TRIG_TOOLTIP_ATAN: string;

    /** @type {string} */
    var MATH_CONSTANT_HELPURL: string;

    /** @type {string} */
    var MATH_CONSTANT_TOOLTIP: string;

    /** @type {string} */
    var MATH_IS_EVEN: string;

    /** @type {string} */
    var MATH_IS_ODD: string;

    /** @type {string} */
    var MATH_IS_PRIME: string;

    /** @type {string} */
    var MATH_IS_WHOLE: string;

    /** @type {string} */
    var MATH_IS_POSITIVE: string;

    /** @type {string} */
    var MATH_IS_NEGATIVE: string;

    /** @type {string} */
    var MATH_IS_DIVISIBLE_BY: string;

    /** @type {string} */
    var MATH_IS_TOOLTIP: string;

    /** @type {string} */
    var MATH_CHANGE_HELPURL: string;

    /** @type {string} */
    var MATH_CHANGE_TITLE: string;

    /** @type {string} */
    var MATH_CHANGE_TITLE_ITEM: string;

    /** @type {string} */
    var MATH_CHANGE_TOOLTIP: string;

    /** @type {string} */
    var MATH_ROUND_HELPURL: string;

    /** @type {string} */
    var MATH_ROUND_TOOLTIP: string;

    /** @type {string} */
    var MATH_ROUND_OPERATOR_ROUND: string;

    /** @type {string} */
    var MATH_ROUND_OPERATOR_ROUNDUP: string;

    /** @type {string} */
    var MATH_ROUND_OPERATOR_ROUNDDOWN: string;

    /** @type {string} */
    var MATH_ONLIST_HELPURL: string;

    /** @type {string} */
    var MATH_ONLIST_OPERATOR_SUM: string;

    /** @type {string} */
    var MATH_ONLIST_TOOLTIP_SUM: string;

    /** @type {string} */
    var MATH_ONLIST_OPERATOR_MIN: string;

    /** @type {string} */
    var MATH_ONLIST_TOOLTIP_MIN: string;

    /** @type {string} */
    var MATH_ONLIST_OPERATOR_MAX: string;

    /** @type {string} */
    var MATH_ONLIST_TOOLTIP_MAX: string;

    /** @type {string} */
    var MATH_ONLIST_OPERATOR_AVERAGE: string;

    /** @type {string} */
    var MATH_ONLIST_TOOLTIP_AVERAGE: string;

    /** @type {string} */
    var MATH_ONLIST_OPERATOR_MEDIAN: string;

    /** @type {string} */
    var MATH_ONLIST_TOOLTIP_MEDIAN: string;

    /** @type {string} */
    var MATH_ONLIST_OPERATOR_MODE: string;

    /** @type {string} */
    var MATH_ONLIST_TOOLTIP_MODE: string;

    /** @type {string} */
    var MATH_ONLIST_OPERATOR_STD_DEV: string;

    /** @type {string} */
    var MATH_ONLIST_TOOLTIP_STD_DEV: string;

    /** @type {string} */
    var MATH_ONLIST_OPERATOR_RANDOM: string;

    /** @type {string} */
    var MATH_ONLIST_TOOLTIP_RANDOM: string;

    /** @type {string} */
    var MATH_MODULO_HELPURL: string;

    /** @type {string} */
    var MATH_MODULO_TITLE: string;

    /** @type {string} */
    var MATH_MODULO_TOOLTIP: string;

    /** @type {string} */
    var MATH_CONSTRAIN_HELPURL: string;

    /** @type {string} */
    var MATH_CONSTRAIN_TITLE: string;

    /** @type {string} */
    var MATH_CONSTRAIN_TOOLTIP: string;

    /** @type {string} */
    var MATH_RANDOM_INT_HELPURL: string;

    /** @type {string} */
    var MATH_RANDOM_INT_TITLE: string;

    /** @type {string} */
    var MATH_RANDOM_INT_TOOLTIP: string;

    /** @type {string} */
    var MATH_RANDOM_FLOAT_HELPURL: string;

    /** @type {string} */
    var MATH_RANDOM_FLOAT_TITLE_RANDOM: string;

    /** @type {string} */
    var MATH_RANDOM_FLOAT_TOOLTIP: string;

    /** @type {string} */
    var MATH_ATAN2_HELPURL: string;

    /** @type {string} */
    var MATH_ATAN2_TITLE: string;

    /** @type {string} */
    var MATH_ATAN2_TOOLTIP: string;

    /** @type {string} */
    var TEXT_TEXT_HELPURL: string;

    /** @type {string} */
    var TEXT_TEXT_TOOLTIP: string;

    /** @type {string} */
    var TEXT_JOIN_HELPURL: string;

    /** @type {string} */
    var TEXT_JOIN_TITLE_CREATEWITH: string;

    /** @type {string} */
    var TEXT_JOIN_TOOLTIP: string;

    /** @type {string} */
    var TEXT_CREATE_JOIN_TITLE_JOIN: string;

    /** @type {string} */
    var TEXT_CREATE_JOIN_TOOLTIP: string;

    /** @type {string} */
    var TEXT_CREATE_JOIN_ITEM_TITLE_ITEM: string;

    /** @type {string} */
    var TEXT_CREATE_JOIN_ITEM_TOOLTIP: string;

    /** @type {string} */
    var TEXT_APPEND_HELPURL: string;

    /** @type {string} */
    var TEXT_APPEND_TITLE: string;

    /** @type {string} */
    var TEXT_APPEND_VARIABLE: string;

    /** @type {string} */
    var TEXT_APPEND_TOOLTIP: string;

    /** @type {string} */
    var TEXT_LENGTH_HELPURL: string;

    /** @type {string} */
    var TEXT_LENGTH_TITLE: string;

    /** @type {string} */
    var TEXT_LENGTH_TOOLTIP: string;

    /** @type {string} */
    var TEXT_ISEMPTY_HELPURL: string;

    /** @type {string} */
    var TEXT_ISEMPTY_TITLE: string;

    /** @type {string} */
    var TEXT_ISEMPTY_TOOLTIP: string;

    /** @type {string} */
    var TEXT_INDEXOF_HELPURL: string;

    /** @type {string} */
    var TEXT_INDEXOF_TOOLTIP: string;

    /** @type {string} */
    var TEXT_INDEXOF_TITLE: string;

    /** @type {string} */
    var TEXT_INDEXOF_OPERATOR_FIRST: string;

    /** @type {string} */
    var TEXT_INDEXOF_OPERATOR_LAST: string;

    /** @type {string} */
    var TEXT_CHARAT_HELPURL: string;

    /** @type {string} */
    var TEXT_CHARAT_TITLE: string;

    /** @type {string} */
    var TEXT_CHARAT_FROM_START: string;

    /** @type {string} */
    var TEXT_CHARAT_FROM_END: string;

    /** @type {string} */
    var TEXT_CHARAT_FIRST: string;

    /** @type {string} */
    var TEXT_CHARAT_LAST: string;

    /** @type {string} */
    var TEXT_CHARAT_RANDOM: string;

    /** @type {string} */
    var TEXT_CHARAT_TAIL: string;

    /** @type {string} */
    var TEXT_CHARAT_TOOLTIP: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_TOOLTIP: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_HELPURL: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_INPUT_IN_TEXT: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_START_FROM_START: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_START_FROM_END: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_START_FIRST: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_END_FROM_START: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_END_FROM_END: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_END_LAST: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_TAIL: string;

    /** @type {string} */
    var TEXT_CHANGECASE_HELPURL: string;

    /** @type {string} */
    var TEXT_CHANGECASE_TOOLTIP: string;

    /** @type {string} */
    var TEXT_CHANGECASE_OPERATOR_UPPERCASE: string;

    /** @type {string} */
    var TEXT_CHANGECASE_OPERATOR_LOWERCASE: string;

    /** @type {string} */
    var TEXT_CHANGECASE_OPERATOR_TITLECASE: string;

    /** @type {string} */
    var TEXT_TRIM_HELPURL: string;

    /** @type {string} */
    var TEXT_TRIM_TOOLTIP: string;

    /** @type {string} */
    var TEXT_TRIM_OPERATOR_BOTH: string;

    /** @type {string} */
    var TEXT_TRIM_OPERATOR_LEFT: string;

    /** @type {string} */
    var TEXT_TRIM_OPERATOR_RIGHT: string;

    /** @type {string} */
    var TEXT_PRINT_HELPURL: string;

    /** @type {string} */
    var TEXT_PRINT_TITLE: string;

    /** @type {string} */
    var TEXT_PRINT_TOOLTIP: string;

    /** @type {string} */
    var TEXT_PROMPT_HELPURL: string;

    /** @type {string} */
    var TEXT_PROMPT_TYPE_TEXT: string;

    /** @type {string} */
    var TEXT_PROMPT_TYPE_NUMBER: string;

    /** @type {string} */
    var TEXT_PROMPT_TOOLTIP_NUMBER: string;

    /** @type {string} */
    var TEXT_PROMPT_TOOLTIP_TEXT: string;

    /** @type {string} */
    var TEXT_COUNT_MESSAGE0: string;

    /** @type {string} */
    var TEXT_COUNT_HELPURL: string;

    /** @type {string} */
    var TEXT_COUNT_TOOLTIP: string;

    /** @type {string} */
    var TEXT_REPLACE_MESSAGE0: string;

    /** @type {string} */
    var TEXT_REPLACE_HELPURL: string;

    /** @type {string} */
    var TEXT_REPLACE_TOOLTIP: string;

    /** @type {string} */
    var TEXT_REVERSE_MESSAGE0: string;

    /** @type {string} */
    var TEXT_REVERSE_HELPURL: string;

    /** @type {string} */
    var TEXT_REVERSE_TOOLTIP: string;

    /** @type {string} */
    var LISTS_CREATE_EMPTY_HELPURL: string;

    /** @type {string} */
    var LISTS_CREATE_EMPTY_TITLE: string;

    /** @type {string} */
    var LISTS_CREATE_EMPTY_TOOLTIP: string;

    /** @type {string} */
    var LISTS_CREATE_WITH_HELPURL: string;

    /** @type {string} */
    var LISTS_CREATE_WITH_TOOLTIP: string;

    /** @type {string} */
    var LISTS_CREATE_WITH_INPUT_WITH: string;

    /** @type {string} */
    var LISTS_CREATE_WITH_CONTAINER_TITLE_ADD: string;

    /** @type {string} */
    var LISTS_CREATE_WITH_CONTAINER_TOOLTIP: string;

    /** @type {string} */
    var LISTS_CREATE_WITH_ITEM_TITLE: string;

    /** @type {string} */
    var LISTS_CREATE_WITH_ITEM_TOOLTIP: string;

    /** @type {string} */
    var LISTS_REPEAT_HELPURL: string;

    /** @type {string} */
    var LISTS_REPEAT_TOOLTIP: string;

    /** @type {string} */
    var LISTS_REPEAT_TITLE: string;

    /** @type {string} */
    var LISTS_LENGTH_HELPURL: string;

    /** @type {string} */
    var LISTS_LENGTH_TITLE: string;

    /** @type {string} */
    var LISTS_LENGTH_TOOLTIP: string;

    /** @type {string} */
    var LISTS_ISEMPTY_HELPURL: string;

    /** @type {string} */
    var LISTS_ISEMPTY_TITLE: string;

    /** @type {string} */
    var LISTS_ISEMPTY_TOOLTIP: string;

    /** @type {string} */
    var LISTS_INLIST: string;

    /** @type {string} */
    var LISTS_INDEX_OF_HELPURL: string;

    /** @type {string} */
    var LISTS_INDEX_OF_INPUT_IN_LIST: string;

    /** @type {string} */
    var LISTS_INDEX_OF_FIRST: string;

    /** @type {string} */
    var LISTS_INDEX_OF_LAST: string;

    /** @type {string} */
    var LISTS_INDEX_OF_TOOLTIP: string;

    /** @type {string} */
    var LISTS_GET_INDEX_HELPURL: string;

    /** @type {string} */
    var LISTS_GET_INDEX_GET: string;

    /** @type {string} */
    var LISTS_GET_INDEX_GET_REMOVE: string;

    /** @type {string} */
    var LISTS_GET_INDEX_REMOVE: string;

    /** @type {string} */
    var LISTS_GET_INDEX_FROM_START: string;

    /** @type {string} */
    var LISTS_GET_INDEX_FROM_END: string;

    /** @type {string} */
    var LISTS_GET_INDEX_FIRST: string;

    /** @type {string} */
    var LISTS_GET_INDEX_LAST: string;

    /** @type {string} */
    var LISTS_GET_INDEX_RANDOM: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TAIL: string;

    /** @type {string} */
    var LISTS_GET_INDEX_INPUT_IN_LIST: string;

    /** @type {string} */
    var LISTS_INDEX_FROM_START_TOOLTIP: string;

    /** @type {string} */
    var LISTS_INDEX_FROM_END_TOOLTIP: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_GET_FROM: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_GET_FIRST: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_GET_LAST: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_GET_RANDOM: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FROM: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FIRST: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_LAST: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_RANDOM: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_REMOVE_FROM: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_REMOVE_FIRST: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_REMOVE_LAST: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_REMOVE_RANDOM: string;

    /** @type {string} */
    var LISTS_SET_INDEX_HELPURL: string;

    /** @type {string} */
    var LISTS_SET_INDEX_INPUT_IN_LIST: string;

    /** @type {string} */
    var LISTS_SET_INDEX_SET: string;

    /** @type {string} */
    var LISTS_SET_INDEX_INSERT: string;

    /** @type {string} */
    var LISTS_SET_INDEX_INPUT_TO: string;

    /** @type {string} */
    var LISTS_SET_INDEX_TOOLTIP_SET_FROM: string;

    /** @type {string} */
    var LISTS_SET_INDEX_TOOLTIP_SET_FIRST: string;

    /** @type {string} */
    var LISTS_SET_INDEX_TOOLTIP_SET_LAST: string;

    /** @type {string} */
    var LISTS_SET_INDEX_TOOLTIP_SET_RANDOM: string;

    /** @type {string} */
    var LISTS_SET_INDEX_TOOLTIP_INSERT_FROM: string;

    /** @type {string} */
    var LISTS_SET_INDEX_TOOLTIP_INSERT_FIRST: string;

    /** @type {string} */
    var LISTS_SET_INDEX_TOOLTIP_INSERT_LAST: string;

    /** @type {string} */
    var LISTS_SET_INDEX_TOOLTIP_INSERT_RANDOM: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_HELPURL: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_INPUT_IN_LIST: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_START_FROM_START: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_START_FROM_END: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_START_FIRST: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_END_FROM_START: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_END_FROM_END: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_END_LAST: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_TAIL: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_TOOLTIP: string;

    /** @type {string} */
    var LISTS_SORT_HELPURL: string;

    /** @type {string} */
    var LISTS_SORT_TITLE: string;

    /** @type {string} */
    var LISTS_SORT_TOOLTIP: string;

    /** @type {string} */
    var LISTS_SORT_ORDER_ASCENDING: string;

    /** @type {string} */
    var LISTS_SORT_ORDER_DESCENDING: string;

    /** @type {string} */
    var LISTS_SORT_TYPE_NUMERIC: string;

    /** @type {string} */
    var LISTS_SORT_TYPE_TEXT: string;

    /** @type {string} */
    var LISTS_SORT_TYPE_IGNORECASE: string;

    /** @type {string} */
    var LISTS_SPLIT_HELPURL: string;

    /** @type {string} */
    var LISTS_SPLIT_LIST_FROM_TEXT: string;

    /** @type {string} */
    var LISTS_SPLIT_TEXT_FROM_LIST: string;

    /** @type {string} */
    var LISTS_SPLIT_WITH_DELIMITER: string;

    /** @type {string} */
    var LISTS_SPLIT_TOOLTIP_SPLIT: string;

    /** @type {string} */
    var LISTS_SPLIT_TOOLTIP_JOIN: string;

    /** @type {string} */
    var LISTS_REVERSE_HELPURL: string;

    /** @type {string} */
    var LISTS_REVERSE_MESSAGE0: string;

    /** @type {string} */
    var LISTS_REVERSE_TOOLTIP: string;

    /** @type {string} */
    var ORDINAL_NUMBER_SUFFIX: string;

    /** @type {string} */
    var VARIABLES_GET_HELPURL: string;

    /** @type {string} */
    var VARIABLES_GET_TOOLTIP: string;

    /** @type {string} */
    var VARIABLES_GET_CREATE_SET: string;

    /** @type {string} */
    var VARIABLES_SET_HELPURL: string;

    /** @type {string} */
    var VARIABLES_SET: string;

    /** @type {string} */
    var VARIABLES_SET_TOOLTIP: string;

    /** @type {string} */
    var VARIABLES_SET_CREATE_GET: string;

    /** @type {string} */
    var PROCEDURES_DEFNORETURN_HELPURL: string;

    /** @type {string} */
    var PROCEDURES_DEFNORETURN_TITLE: string;

    /** @type {string} */
    var PROCEDURES_DEFNORETURN_PROCEDURE: string;

    /** @type {string} */
    var PROCEDURES_BEFORE_PARAMS: string;

    /** @type {string} */
    var PROCEDURES_CALL_BEFORE_PARAMS: string;

    /** @type {string} */
    var PROCEDURES_DEFNORETURN_DO: string;

    /** @type {string} */
    var PROCEDURES_DEFNORETURN_TOOLTIP: string;

    /** @type {string} */
    var PROCEDURES_DEFNORETURN_COMMENT: string;

    /** @type {string} */
    var PROCEDURES_DEFRETURN_HELPURL: string;

    /** @type {string} */
    var PROCEDURES_DEFRETURN_TITLE: string;

    /** @type {string} */
    var PROCEDURES_DEFRETURN_PROCEDURE: string;

    /** @type {string} */
    var PROCEDURES_DEFRETURN_DO: string;

    /** @type {string} */
    var PROCEDURES_DEFRETURN_COMMENT: string;

    /** @type {string} */
    var PROCEDURES_DEFRETURN_RETURN: string;

    /** @type {string} */
    var PROCEDURES_DEFRETURN_TOOLTIP: string;

    /** @type {string} */
    var PROCEDURES_ALLOW_STATEMENTS: string;

    /** @type {string} */
    var PROCEDURES_DEF_DUPLICATE_WARNING: string;

    /** @type {string} */
    var PROCEDURES_CALLNORETURN_HELPURL: string;

    /** @type {string} */
    var PROCEDURES_CALLNORETURN_TOOLTIP: string;

    /** @type {string} */
    var PROCEDURES_CALLRETURN_HELPURL: string;

    /** @type {string} */
    var PROCEDURES_CALLRETURN_TOOLTIP: string;

    /** @type {string} */
    var PROCEDURES_MUTATORCONTAINER_TITLE: string;

    /** @type {string} */
    var PROCEDURES_MUTATORCONTAINER_TOOLTIP: string;

    /** @type {string} */
    var PROCEDURES_MUTATORARG_TITLE: string;

    /** @type {string} */
    var PROCEDURES_MUTATORARG_TOOLTIP: string;

    /** @type {string} */
    var PROCEDURES_HIGHLIGHT_DEF: string;

    /** @type {string} */
    var PROCEDURES_CREATE_DO: string;

    /** @type {string} */
    var PROCEDURES_IFRETURN_TOOLTIP: string;

    /** @type {string} */
    var PROCEDURES_IFRETURN_HELPURL: string;

    /** @type {string} */
    var PROCEDURES_IFRETURN_WARNING: string;

    /** @type {string} */
    var WORKSPACE_COMMENT_DEFAULT_TEXT: string;

    /** @type {string} */
    var WORKSPACE_ARIA_LABEL: string;

    /** @type {string} */
    var COLLAPSED_WARNINGS_WARNING: string;

    /** @type {string} */
    var DIALOG_OK: string;

    /** @type {string} */
    var DIALOG_CANCEL: string;
}

























































































































