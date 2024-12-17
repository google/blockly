/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Object representing a workspace rendered as SVG.
 *
 * @class
 */
// Former goog.module ID: Blockly.WorkspaceSvg

// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_block_create.js';
// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_theme_change.js';
// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_viewport.js';

import type {Block} from './block.js';
import type {BlockSvg} from './block_svg.js';
import type {BlocklyOptions} from './blockly_options.js';
import * as browserEvents from './browser_events.js';
import {RenderedWorkspaceComment} from './comments/rendered_workspace_comment.js';
import {WorkspaceComment} from './comments/workspace_comment.js';
import * as common from './common.js';
import {ComponentManager} from './component_manager.js';
import {ConnectionDB} from './connection_db.js';
import * as ContextMenu from './contextmenu.js';
import {
  ContextMenuOption,
  ContextMenuRegistry,
} from './contextmenu_registry.js';
import * as dropDownDiv from './dropdowndiv.js';
import {EventType} from './events/type.js';
import * as eventUtils from './events/utils.js';
import type {FlyoutButton} from './flyout_button.js';
import {Gesture} from './gesture.js';
import {Grid} from './grid.js';
import type {IASTNodeLocationSvg} from './interfaces/i_ast_node_location_svg.js';
import type {IBoundedElement} from './interfaces/i_bounded_element.js';
import type {IDragTarget} from './interfaces/i_drag_target.js';
import type {IFlyout} from './interfaces/i_flyout.js';
import type {IMetricsManager} from './interfaces/i_metrics_manager.js';
import type {IToolbox} from './interfaces/i_toolbox.js';
import type {Cursor} from './keyboard_nav/cursor.js';
import type {Marker} from './keyboard_nav/marker.js';
import {LayerManager} from './layer_manager.js';
import {MarkerManager} from './marker_manager.js';
import {Options} from './options.js';
import * as Procedures from './procedures.js';
import * as registry from './registry.js';
import * as renderManagement from './render_management.js';
import * as blockRendering from './renderers/common/block_rendering.js';
import type {Renderer} from './renderers/common/renderer.js';
import type {ScrollbarPair} from './scrollbar_pair.js';
import type {Theme} from './theme.js';
import {Classic} from './theme/classic.js';
import {ThemeManager} from './theme_manager.js';
import * as Tooltip from './tooltip.js';
import type {Trashcan} from './trashcan.js';
import * as arrayUtils from './utils/array.js';
import {Coordinate} from './utils/coordinate.js';
import * as dom from './utils/dom.js';
import * as drag from './utils/drag.js';
import type {Metrics} from './utils/metrics.js';
import {Rect} from './utils/rect.js';
import {Size} from './utils/size.js';
import {Svg} from './utils/svg.js';
import * as svgMath from './utils/svg_math.js';
import * as toolbox from './utils/toolbox.js';
import * as userAgent from './utils/useragent.js';
import type {VariableModel} from './variable_model.js';
import * as Variables from './variables.js';
import * as VariablesDynamic from './variables_dynamic.js';
import * as WidgetDiv from './widgetdiv.js';
import {Workspace} from './workspace.js';
import {WorkspaceAudio} from './workspace_audio.js';
import {ZoomControls} from './zoom_controls.js';

/** Margin around the top/bottom/left/right after a zoomToFit call. */
const ZOOM_TO_FIT_MARGIN = 20;

/**
 * Class for a workspace.  This is an onscreen area with optional trashcan,
 * scrollbars, bubbles, and dragging.
 */
export class WorkspaceSvg extends Workspace implements IASTNodeLocationSvg {
  /**
   * A wrapper function called when a resize event occurs.
   * You can pass the result to `eventHandling.unbind`.
   */
  private resizeHandlerWrapper: browserEvents.Data | null = null;

  /**
   * The render status of an SVG workspace.
   * Returns `false` for headless workspaces and true for instances of
   * `WorkspaceSvg`.
   */
  override rendered = true;

  /**
   * Whether the workspace is visible.  False if the workspace has been hidden
   * by calling `setVisible(false)`.
   */
  private visible = true;

  /**
   * Whether this workspace has resizes enabled.
   * Disable during batch operations for a performance improvement.
   */
  private resizesEnabled = true;

  /**
   * Current horizontal scrolling offset in pixel units, relative to the
   * workspace origin.
   *
   * It is useful to think about a view, and a canvas moving beneath that
   * view. As the canvas moves right, this value becomes more positive, and
   * the view is now "seeing" the left side of the canvas. As the canvas moves
   * left, this value becomes more negative, and the view is now "seeing" the
   * right side of the canvas.
   *
   * The confusing thing about this value is that it does not, and must not
   * include the absoluteLeft offset. This is because it is used to calculate
   * the viewLeft value.
   *
   * The viewLeft is relative to the workspace origin (although in pixel
   * units). The workspace origin is the top-left corner of the workspace (at
   * least when it is enabled). It is shifted from the top-left of the
   * blocklyDiv so as not to be beneath the toolbox.
   *
   * When the workspace is enabled the viewLeft and workspace origin are at
   * the same X location. As the canvas slides towards the right beneath the
   * view this value (scrollX) becomes more positive, and the viewLeft becomes
   * more negative relative to the workspace origin (imagine the workspace
   * origin as a dot on the canvas sliding to the right as the canvas moves).
   *
   * So if the scrollX were to include the absoluteLeft this would in a way
   * "unshift" the workspace origin. This means that the viewLeft would be
   * representing the left edge of the blocklyDiv, rather than the left edge
   * of the workspace.
   */
  scrollX = 0;

  /**
   * Current vertical scrolling offset in pixel units, relative to the
   * workspace origin.
   *
   * It is useful to think about a view, and a canvas moving beneath that
   * view. As the canvas moves down, this value becomes more positive, and the
   * view is now "seeing" the upper part of the canvas. As the canvas moves
   * up, this value becomes more negative, and the view is "seeing" the lower
   * part of the canvas.
   *
   * This confusing thing about this value is that it does not, and must not
   * include the absoluteTop offset. This is because it is used to calculate
   * the viewTop value.
   *
   * The viewTop is relative to the workspace origin (although in pixel
   * units). The workspace origin is the top-left corner of the workspace (at
   * least when it is enabled). It is shifted from the top-left of the
   * blocklyDiv so as not to be beneath the toolbox.
   *
   * When the workspace is enabled the viewTop and workspace origin are at the
   * same Y location. As the canvas slides towards the bottom this value
   * (scrollY) becomes more positive, and the viewTop becomes more negative
   * relative to the workspace origin (image in the workspace origin as a dot
   * on the canvas sliding downwards as the canvas moves).
   *
   * So if the scrollY were to include the absoluteTop this would in a way
   * "unshift" the workspace origin. This means that the viewTop would be
   * representing the top edge of the blocklyDiv, rather than the top edge of
   * the workspace.
   */
  scrollY = 0;

  /** Horizontal scroll value when scrolling started in pixel units. */
  startScrollX = 0;

  /** Vertical scroll value when scrolling started in pixel units. */
  startScrollY = 0;

  /** Current scale. */
  scale = 1;

  /** Cached scale value. Used to detect changes in viewport. */
  private oldScale = 1;

  /** Cached viewport top value. Used to detect changes in viewport. */
  private oldTop = 0;

  /** Cached viewport left value. Used to detect changes in viewport. */
  private oldLeft = 0;

  /** The workspace's trashcan (if any). */
  trashcan: Trashcan | null = null;

  /** This workspace's scrollbars, if they exist. */
  scrollbar: ScrollbarPair | null = null;

  /**
   * Fixed flyout providing blocks which may be dragged into this workspace.
   */
  private flyout: IFlyout | null = null;

  /**
   * Category-based toolbox providing blocks which may be dragged into this
   * workspace.
   */
  private toolbox: IToolbox | null = null;

  /**
   * The current gesture in progress on this workspace, if any.
   *
   * @internal
   */
  currentGesture_: Gesture | null = null;

  /**
   * The first parent div with 'injectionDiv' in the name, or null if not set.
   * Access this with getInjectionDiv.
   */
  private injectionDiv: Element | null = null;

  /**
   * Last known position of the page scroll.
   * This is used to determine whether we have recalculated screen coordinate
   * stuff since the page scrolled.
   */
  private lastRecordedPageScroll: Coordinate | null = null;

  /**
   * Developers may define this function to add custom menu options to the
   * workspace's context menu or edit the workspace-created set of menu
   * options.
   *
   * @param options List of menu options to add to.
   * @param e The right-click event that triggered the context menu.
   */
  configureContextMenu:
    | ((menuOptions: ContextMenuOption[], e: Event) => void)
    | null = null;

  /**
   * A dummy wheel event listener used as a workaround for a Safari scrolling issue.
   * Set in createDom and used for removal in dispose to ensure proper cleanup.
   */
  private dummyWheelListener: (() => void) | null = null;

  /**
   * In a flyout, the target workspace where blocks should be placed after a
   * drag. Otherwise null.
   *
   * @internal
   */
  targetWorkspace: WorkspaceSvg | null = null;

  /** Inverted screen CTM, for use in mouseToSvg. */
  private inverseScreenCTM: SVGMatrix | null = null;

  /** Inverted screen CTM is dirty, recalculate it. */
  private inverseScreenCTMDirty = true;
  private metricsManager: IMetricsManager;
  /** @internal */
  getMetrics: () => Metrics;
  /** @internal */
  setMetrics: (p1: {x?: number; y?: number}) => void;
  private readonly componentManager: ComponentManager;

  /**
   * List of currently highlighted blocks.  Block highlighting is often used
   * to visually mark blocks currently being executed.
   */
  private readonly highlightedBlocks: BlockSvg[] = [];
  private audioManager: WorkspaceAudio;
  private grid: Grid | null;
  private markerManager: MarkerManager;

  /**
   * Map from function names to callbacks, for deciding what to do when a
   * custom toolbox category is opened.
   */
  private toolboxCategoryCallbacks = new Map<
    string,
    (p1: WorkspaceSvg) => toolbox.FlyoutDefinition
  >();

  /**
   * Map from function names to callbacks, for deciding what to do when a
   * button is clicked.
   */
  private flyoutButtonCallbacks = new Map<string, (p1: FlyoutButton) => void>();
  protected themeManager_: ThemeManager;
  private readonly renderer: Renderer;

  /** Cached parent SVG. */
  private cachedParentSvg: SVGElement | null = null;

  /** True if keyboard accessibility mode is on, false otherwise. */
  keyboardAccessibilityMode = false;

  /** The list of top-level bounded elements on the workspace. */
  private topBoundedElements: IBoundedElement[] = [];

  /** The recorded drag targets. */
  private dragTargetAreas: Array<{component: IDragTarget; clientRect: Rect}> =
    [];
  private readonly cachedParentSvgSize: Size;
  private layerManager: LayerManager | null = null;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  svgGroup_!: SVGElement;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  svgBackground_!: SVGElement;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  svgBlockCanvas_!: SVGElement;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  svgBubbleCanvas_!: SVGElement;
  zoomControls_: ZoomControls | null = null;

  /**
   * @param options Dictionary of options.
   */
  constructor(options: Options) {
    super(options);

    const MetricsManagerClass = registry.getClassFromOptions(
      registry.Type.METRICS_MANAGER,
      options,
      true,
    );
    /** Object in charge of calculating metrics for the workspace. */
    this.metricsManager = new MetricsManagerClass!(this);

    /** Method to get all the metrics that have to do with a workspace. */
    this.getMetrics =
      options.getMetrics ||
      this.metricsManager.getMetrics.bind(this.metricsManager);

    /** Translates the workspace. */
    this.setMetrics =
      options.setMetrics || WorkspaceSvg.setTopLevelWorkspaceMetrics;

    this.componentManager = new ComponentManager();

    this.connectionDBList = ConnectionDB.init(this.connectionChecker);

    /**
     * Object in charge of loading, storing, and playing audio for a workspace.
     */
    this.audioManager = new WorkspaceAudio(
      options.parentWorkspace as WorkspaceSvg,
    );

    /** This workspace's grid object or null. */
    this.grid = this.options.gridPattern
      ? new Grid(this.options.gridPattern, options.gridOptions)
      : null;

    /** Manager in charge of markers and cursors. */
    this.markerManager = new MarkerManager(this);

    if (Variables && Variables.flyoutCategory) {
      this.registerToolboxCategoryCallback(
        Variables.CATEGORY_NAME,
        Variables.flyoutCategory,
      );
    }

    if (VariablesDynamic && VariablesDynamic.flyoutCategory) {
      this.registerToolboxCategoryCallback(
        VariablesDynamic.CATEGORY_NAME,
        VariablesDynamic.flyoutCategory,
      );
    }

    if (Procedures && Procedures.flyoutCategory) {
      this.registerToolboxCategoryCallback(
        Procedures.CATEGORY_NAME,
        Procedures.flyoutCategory,
      );
      this.addChangeListener(Procedures.mutatorOpenListener);
    }

    /** Object in charge of storing and updating the workspace theme. */
    this.themeManager_ = this.options.parentWorkspace
      ? this.options.parentWorkspace.getThemeManager()
      : new ThemeManager(this, this.options.theme || Classic);
    this.themeManager_.subscribeWorkspace(this);

    /** The block renderer used for rendering blocks on this workspace. */
    this.renderer = blockRendering.init(
      this.options.renderer || 'geras',
      this.getTheme(),
      this.options.rendererOverrides ?? undefined,
    );

    /**
     * The cached size of the parent svg element.
     * Used to compute svg metrics.
     */
    this.cachedParentSvgSize = new Size(0, 0);
  }

  /**
   * Get the marker manager for this workspace.
   *
   * @returns The marker manager.
   */
  getMarkerManager(): MarkerManager {
    return this.markerManager;
  }

  /**
   * Gets the metrics manager for this workspace.
   *
   * @returns The metrics manager.
   */
  getMetricsManager(): IMetricsManager {
    return this.metricsManager;
  }

  /**
   * Sets the metrics manager for the workspace.
   *
   * @param metricsManager The metrics manager.
   * @internal
   */
  setMetricsManager(metricsManager: IMetricsManager) {
    this.metricsManager = metricsManager;
    this.getMetrics = this.metricsManager.getMetrics.bind(this.metricsManager);
  }

  /**
   * Gets the component manager for this workspace.
   *
   * @returns The component manager.
   */
  getComponentManager(): ComponentManager {
    return this.componentManager;
  }

  /**
   * Add the cursor SVG to this workspaces SVG group.
   *
   * @param cursorSvg The SVG root of the cursor to be added to the workspace
   *     SVG group.
   * @internal
   */
  setCursorSvg(cursorSvg: SVGElement) {
    this.markerManager.setCursorSvg(cursorSvg);
  }

  /**
   * Add the marker SVG to this workspaces SVG group.
   *
   * @param markerSvg The SVG root of the marker to be added to the workspace
   *     SVG group.
   * @internal
   */
  setMarkerSvg(markerSvg: SVGElement) {
    this.markerManager.setMarkerSvg(markerSvg);
  }

  /**
   * Get the marker with the given ID.
   *
   * @param id The ID of the marker.
   * @returns The marker with the given ID or null if no marker with the given
   *     ID exists.
   * @internal
   */
  getMarker(id: string): Marker | null {
    if (this.markerManager) {
      return this.markerManager.getMarker(id);
    }
    return null;
  }

  /**
   * The cursor for this workspace.
   *
   * @returns The cursor for the workspace.
   */
  getCursor(): Cursor | null {
    if (this.markerManager) {
      return this.markerManager.getCursor();
    }
    return null;
  }

  /**
   * Get the block renderer attached to this workspace.
   *
   * @returns The renderer attached to this workspace.
   */
  getRenderer(): Renderer {
    return this.renderer;
  }

  /**
   * Get the theme manager for this workspace.
   *
   * @returns The theme manager for this workspace.
   * @internal
   */
  getThemeManager(): ThemeManager {
    return this.themeManager_;
  }

  /**
   * Get the workspace theme object.
   *
   * @returns The workspace theme object.
   */
  getTheme(): Theme {
    return this.themeManager_.getTheme();
  }

  /**
   * Set the workspace theme object.
   * If no theme is passed, default to the `Classic` theme.
   *
   * @param theme The workspace theme object.
   */
  setTheme(theme: Theme) {
    if (!theme) {
      theme = Classic as Theme;
    }
    this.themeManager_.setTheme(theme);
  }

  /**
   * Refresh all blocks on the workspace after a theme update.
   */
  refreshTheme() {
    if (this.svgGroup_) {
      this.renderer.refreshDom(this.svgGroup_, this.getTheme());
    }

    // Update all blocks in workspace that have a style name.
    this.updateBlockStyles(
      this.getAllBlocks(false).filter((block) => !!block.getStyleName()),
    );

    // Update current toolbox selection.
    this.refreshToolboxSelection();
    if (this.toolbox) {
      this.toolbox.refreshTheme();
    }

    // Re-render if workspace is visible
    if (this.isVisible()) {
      this.setVisible(true);
    }

    const event = new (eventUtils.get(EventType.THEME_CHANGE))(
      this.getTheme().name,
      this.id,
    );
    eventUtils.fire(event);
  }

  /**
   * Updates all the blocks with new style.
   *
   * @param blocks List of blocks to update the style on.
   */
  private updateBlockStyles(blocks: Block[]) {
    for (let i = 0, block; (block = blocks[i]); i++) {
      const blockStyleName = block.getStyleName();
      if (blockStyleName) {
        const blockSvg = block as BlockSvg;
        blockSvg.setStyle(blockStyleName);
      }
    }
  }

  /**
   * Getter for the inverted screen CTM.
   *
   * @returns The matrix to use in mouseToSvg
   */
  getInverseScreenCTM(): SVGMatrix | null {
    // Defer getting the screen CTM until we actually need it, this should
    // avoid forced reflows from any calls to updateInverseScreenCTM.
    if (this.inverseScreenCTMDirty) {
      const ctm = this.getParentSvg().getScreenCTM();
      if (ctm) {
        this.inverseScreenCTM = ctm.inverse();
        this.inverseScreenCTMDirty = false;
      }
    }

    return this.inverseScreenCTM;
  }

  /** Mark the inverse screen CTM as dirty. */
  updateInverseScreenCTM() {
    this.inverseScreenCTMDirty = true;
  }

  /**
   * Getter for isVisible
   *
   * @returns Whether the workspace is visible.
   *     False if the workspace has been hidden by calling `setVisible(false)`.
   */
  isVisible(): boolean {
    return this.visible;
  }

  /**
   * Return the absolute coordinates of the top-left corner of this element,
   * scales that after canvas SVG element, if it's a descendant.
   * The origin (0,0) is the top-left corner of the Blockly SVG.
   *
   * @param element SVG element to find the coordinates of.
   * @returns Object with .x and .y properties.
   * @internal
   */
  getSvgXY(element: SVGElement): Coordinate {
    let x = 0;
    let y = 0;
    let scale = 1;
    if (
      this.getCanvas().contains(element) ||
      this.getBubbleCanvas().contains(element)
    ) {
      // Before the SVG canvas, scale the coordinates.
      scale = this.scale;
    }
    do {
      // Loop through this block and every parent.
      const xy = svgMath.getRelativeXY(element);
      if (element === this.getCanvas() || element === this.getBubbleCanvas()) {
        // After the SVG canvas, don't scale the coordinates.
        scale = 1;
      }
      x += xy.x * scale;
      y += xy.y * scale;
      element = element.parentNode as SVGElement;
    } while (
      element &&
      element !== this.getParentSvg() &&
      element !== this.getInjectionDiv()
    );
    return new Coordinate(x, y);
  }

  /**
   * Gets the size of the workspace's parent SVG element.
   *
   * @returns The cached width and height of the workspace's parent SVG element.
   * @internal
   */
  getCachedParentSvgSize(): Size {
    const size = this.cachedParentSvgSize;
    return new Size(size.width, size.height);
  }

  /**
   * Return the position of the workspace origin relative to the injection div
   * origin in pixels.
   * The workspace origin is where a block would render at position (0, 0).
   * It is not the upper left corner of the workspace SVG.
   *
   * @returns Offset in pixels.
   * @internal
   */
  getOriginOffsetInPixels(): Coordinate {
    return svgMath.getInjectionDivXY(this.getCanvas());
  }

  /**
   * Return the injection div that is a parent of this workspace.
   * Walks the DOM the first time it's called, then returns a cached value.
   * Note: We assume this is only called after the workspace has been injected
   * into the DOM.
   *
   * @returns The first parent div with 'injectionDiv' in the name.
   * @internal
   */
  getInjectionDiv(): Element {
    // NB: it would be better to pass this in at createDom, but is more likely
    // to break existing uses of Blockly.
    if (!this.injectionDiv) {
      let element: Element = this.svgGroup_;
      while (element) {
        const classes = element.getAttribute('class') || '';
        if ((' ' + classes + ' ').includes(' injectionDiv ')) {
          this.injectionDiv = element;
          break;
        }
        element = element.parentNode as Element;
      }
    }
    return this.injectionDiv!;
  }

  /**
   * Returns the SVG group for the workspace.
   *
   * @returns The SVG group for the workspace.
   */
  getSvgGroup(): Element {
    return this.svgGroup_;
  }

  /**
   * Get the SVG block canvas for the workspace.
   *
   * @returns The SVG group for the workspace.
   * @internal
   */
  getBlockCanvas(): SVGElement | null {
    return this.getCanvas();
  }

  /**
   * Save resize handler data so we can delete it later in dispose.
   *
   * @param handler Data that can be passed to eventHandling.unbind.
   */
  setResizeHandlerWrapper(handler: browserEvents.Data) {
    this.resizeHandlerWrapper = handler;
  }

  /**
   * Create the workspace DOM elements.
   *
   * @param opt_backgroundClass Either 'blocklyMainBackground' or
   *     'blocklyMutatorBackground'.
   * @returns The workspace's SVG group.
   */
  createDom(opt_backgroundClass?: string, injectionDiv?: Element): Element {
    if (!this.injectionDiv) {
      this.injectionDiv = injectionDiv ?? null;
    }

    /**
     * <g class="blocklyWorkspace">
     *   <rect class="blocklyMainBackground" height="100%" width="100%"></rect>
     *   [Trashcan and/or flyout may go here]
     *   <g class="blocklyBlockCanvas"></g>
     *   <g class="blocklyBubbleCanvas"></g>
     * </g>
     */
    this.svgGroup_ = dom.createSvgElement(Svg.G, {'class': 'blocklyWorkspace'});

    // Note that a <g> alone does not receive mouse events--it must have a
    // valid target inside it.  If no background class is specified, as in the
    // flyout, the workspace will not receive mouse events.
    if (opt_backgroundClass) {
      this.svgBackground_ = dom.createSvgElement(
        Svg.RECT,
        {'height': '100%', 'width': '100%', 'class': opt_backgroundClass},
        this.svgGroup_,
      );

      if (opt_backgroundClass === 'blocklyMainBackground' && this.grid) {
        this.svgBackground_.style.fill =
          'url(#' + this.grid.getPatternId() + ')';
      } else {
        this.themeManager_.subscribe(
          this.svgBackground_,
          'workspaceBackgroundColour',
          'fill',
        );
      }
    }

    this.layerManager = new LayerManager(this);
    // Assign the canvases for backwards compatibility.
    this.svgBlockCanvas_ = this.layerManager.getBlockLayer();
    this.svgBubbleCanvas_ = this.layerManager.getBubbleLayer();

    if (!this.isFlyout) {
      browserEvents.conditionalBind(
        this.svgGroup_,
        'pointerdown',
        this,
        this.onMouseDown,
        false,
      );
      // This no-op works around https://bugs.webkit.org/show_bug.cgi?id=226683,
      // which otherwise prevents zoom/scroll events from being observed in
      // Safari. Once that bug is fixed it should be removed.
      this.dummyWheelListener = () => {};
      document.body.addEventListener('wheel', this.dummyWheelListener);
      browserEvents.conditionalBind(
        this.svgGroup_,
        'wheel',
        this,
        this.onMouseWheel,
      );
    }

    // Determine if there needs to be a category tree, or a simple list of
    // blocks.  This cannot be changed later, since the UI is very different.
    if (this.options.hasCategories) {
      const ToolboxClass = registry.getClassFromOptions(
        registry.Type.TOOLBOX,
        this.options,
        true,
      );
      this.toolbox = new ToolboxClass!(this);
    }
    if (this.grid) {
      this.grid.update(this.scale);
    }
    this.recordDragTargets();
    const CursorClass = registry.getClassFromOptions(
      registry.Type.CURSOR,
      this.options,
    );

    if (CursorClass) this.markerManager.setCursor(new CursorClass());

    this.renderer.createDom(this.svgGroup_, this.getTheme());
    return this.svgGroup_;
  }

  /**
   * Dispose of this workspace.
   * Unlink from all DOM elements to prevent memory leaks.
   */
  override dispose() {
    // Stop rerendering.
    this.rendered = false;
    if (this.currentGesture_) {
      this.currentGesture_.cancel();
    }
    if (this.svgGroup_) {
      dom.removeNode(this.svgGroup_);
    }
    if (this.toolbox) {
      this.toolbox.dispose();
      this.toolbox = null;
    }
    if (this.flyout) {
      this.flyout.dispose();
      this.flyout = null;
    }
    if (this.trashcan) {
      this.trashcan.dispose();
      this.trashcan = null;
    }
    if (this.scrollbar) {
      this.scrollbar.dispose();
      this.scrollbar = null;
    }
    if (this.zoomControls_) {
      this.zoomControls_.dispose();
    }

    if (this.audioManager) {
      this.audioManager.dispose();
    }

    if (this.grid) {
      this.grid = null;
    }

    this.renderer.dispose();

    if (this.markerManager) {
      this.markerManager.dispose();
    }

    super.dispose();

    // Dispose of theme manager after all blocks and mutators are disposed of.
    if (this.themeManager_) {
      this.themeManager_.unsubscribeWorkspace(this);
      this.themeManager_.unsubscribe(this.svgBackground_);
      if (!this.options.parentWorkspace) {
        this.themeManager_.dispose();
      }
    }

    this.connectionDBList.length = 0;

    this.toolboxCategoryCallbacks.clear();
    this.flyoutButtonCallbacks.clear();

    if (!this.options.parentWorkspace) {
      // Top-most workspace.  Dispose of the div that the
      // SVG is injected into (i.e. injectionDiv).
      const parentSvg = this.getParentSvg();
      if (parentSvg && parentSvg.parentNode) {
        dom.removeNode(parentSvg.parentNode);
      }
    }
    if (this.resizeHandlerWrapper) {
      browserEvents.unbind(this.resizeHandlerWrapper);
      this.resizeHandlerWrapper = null;
    }

    // Remove the dummy wheel listener
    if (this.dummyWheelListener) {
      document.body.removeEventListener('wheel', this.dummyWheelListener);
      this.dummyWheelListener = null;
    }
  }

  /**
   * Add a trashcan.
   *
   * @internal
   */
  addTrashcan() {
    this.trashcan = WorkspaceSvg.newTrashcan(this);
    const svgTrashcan = this.trashcan.createDom();
    this.svgGroup_.insertBefore(svgTrashcan, this.getCanvas());
  }

  /**
   * @param _workspace
   * @internal
   */
  static newTrashcan(_workspace: WorkspaceSvg): Trashcan {
    throw new Error(
      'The implementation of newTrashcan should be ' +
        'monkey-patched in by blockly.ts',
    );
  }

  /**
   * Add zoom controls.
   *
   * @internal
   */
  addZoomControls() {
    this.zoomControls_ = new ZoomControls(this);
    const svgZoomControls = this.zoomControls_.createDom();
    this.svgGroup_.appendChild(svgZoomControls);
  }

  /**
   * Add a flyout element in an element with the given tag name.
   *
   * @param tagName What type of tag the flyout belongs in.
   * @returns The element containing the flyout DOM.
   * @internal
   */
  addFlyout(tagName: string | Svg<SVGSVGElement> | Svg<SVGGElement>): Element {
    const workspaceOptions = new Options({
      'parentWorkspace': this,
      'rtl': this.RTL,
      'oneBasedIndex': this.options.oneBasedIndex,
      'horizontalLayout': this.horizontalLayout,
      'renderer': this.options.renderer,
      'rendererOverrides': this.options.rendererOverrides,
      'move': {
        'scrollbars': true,
      },
    } as BlocklyOptions);
    workspaceOptions.toolboxPosition = this.options.toolboxPosition;
    if (this.horizontalLayout) {
      const HorizontalFlyout = registry.getClassFromOptions(
        registry.Type.FLYOUTS_HORIZONTAL_TOOLBOX,
        this.options,
        true,
      );
      this.flyout = new HorizontalFlyout!(workspaceOptions);
    } else {
      const VerticalFlyout = registry.getClassFromOptions(
        registry.Type.FLYOUTS_VERTICAL_TOOLBOX,
        this.options,
        true,
      );
      this.flyout = new VerticalFlyout!(workspaceOptions);
    }
    this.flyout.autoClose = false;
    this.flyout.getWorkspace().setVisible(true);

    // Return the element so that callers can place it in their desired
    // spot in the DOM.  For example, mutator flyouts do not go in the same
    // place as main workspace flyouts.
    return this.flyout.createDom(tagName);
  }

  /**
   * Getter for the flyout associated with this workspace.  This flyout may be
   * owned by either the toolbox or the workspace, depending on toolbox
   * configuration.  It will be null if there is no flyout.
   *
   * @param opt_own Whether to only return the workspace's own flyout.
   * @returns The flyout on this workspace.
   */
  getFlyout(opt_own?: boolean): IFlyout | null {
    if (this.flyout || opt_own) {
      return this.flyout;
    }
    if (this.toolbox) {
      return this.toolbox.getFlyout();
    }
    return null;
  }

  /**
   * Getter for the toolbox associated with this workspace, if one exists.
   *
   * @returns The toolbox on this workspace.
   */
  getToolbox(): IToolbox | null {
    return this.toolbox;
  }

  /**
   * Update items that use screen coordinate calculations
   * because something has changed (e.g. scroll position, window size).
   */
  private updateScreenCalculations() {
    this.updateInverseScreenCTM();
    this.recordDragTargets();
  }

  /**
   * If enabled, resize the parts of the workspace that change when the
   * workspace contents (e.g. block positions) change.  This will also scroll
   * the workspace contents if needed.
   *
   * @internal
   */
  resizeContents() {
    if (!this.resizesEnabled || !this.rendered) {
      return;
    }
    if (this.scrollbar) {
      this.scrollbar.resize();
    }
    this.updateInverseScreenCTM();
  }

  /**
   * Resize and reposition all of the workspace chrome (toolbox,
   * trash, scrollbars etc.)
   * This should be called when something changes that
   * requires recalculating dimensions and positions of the
   * trash, zoom, toolbox, etc. (e.g. window resize).
   */
  resize() {
    if (this.toolbox) {
      this.toolbox.position();
    }
    if (this.flyout) {
      this.flyout.position();
    }

    const positionables = this.componentManager.getComponents(
      ComponentManager.Capability.POSITIONABLE,
      true,
    );
    const metrics = this.getMetricsManager().getUiMetrics();
    const savedPositions = [];
    for (let i = 0, positionable; (positionable = positionables[i]); i++) {
      positionable.position(metrics, savedPositions);
      const boundingRect = positionable.getBoundingRectangle();
      if (boundingRect) {
        savedPositions.push(boundingRect);
      }
    }

    if (this.scrollbar) {
      this.scrollbar.resize();
    }
    this.updateScreenCalculations();
  }

  /**
   * Resizes and repositions workspace chrome if the page has a new
   * scroll position.
   *
   * @internal
   */
  updateScreenCalculationsIfScrolled() {
    const currScroll = svgMath.getDocumentScroll();
    if (!Coordinate.equals(this.lastRecordedPageScroll, currScroll)) {
      this.lastRecordedPageScroll = currScroll;
      this.updateScreenCalculations();
    }
  }

  /**
   * @returns The layer manager for this workspace.
   */
  getLayerManager(): LayerManager | null {
    return this.layerManager;
  }

  /**
   * Get the SVG element that forms the drawing surface.
   *
   * @returns SVG group element.
   */
  getCanvas(): SVGGElement {
    return this.layerManager!.getBlockLayer();
  }

  /**
   * Caches the width and height of the workspace's parent SVG element for use
   * with getSvgMetrics.
   *
   * @param width The width of the parent SVG element.
   * @param height The height of the parent SVG element
   * @internal
   */
  setCachedParentSvgSize(width: number | null, height: number | null) {
    const svg = this.getParentSvg();
    if (width != null) {
      this.cachedParentSvgSize.width = width;
      // This is set to support the public (but deprecated) Blockly.svgSize
      // method.
      svg.setAttribute('data-cached-width', `${width}`);
    }
    if (height != null) {
      this.cachedParentSvgSize.height = height;
      // This is set to support the public (but deprecated) Blockly.svgSize
      // method.
      svg.setAttribute('data-cached-height', `${height}`);
    }
  }

  /**
   * Get the SVG element that forms the bubble surface.
   *
   * @returns SVG group element.
   */
  getBubbleCanvas(): SVGGElement {
    return this.layerManager!.getBubbleLayer();
  }

  /**
   * Get the SVG element that contains this workspace.
   * Note: We assume this is only called after the workspace has been injected
   * into the DOM.
   *
   * @returns SVG element.
   */
  getParentSvg(): SVGSVGElement {
    if (!this.cachedParentSvg) {
      let element = this.svgGroup_;
      while (element) {
        if (element.tagName === 'svg') {
          this.cachedParentSvg = element;
          break;
        }
        element = element.parentNode as SVGSVGElement;
      }
    }
    return this.cachedParentSvg as SVGSVGElement;
  }

  /**
   * Fires a viewport event if events are enabled and there is a change in
   * viewport values.
   *
   * @internal
   */
  maybeFireViewportChangeEvent() {
    if (!eventUtils.isEnabled()) {
      return;
    }
    const scale = this.scale;
    const top = -this.scrollY;
    const left = -this.scrollX;
    if (
      scale === this.oldScale &&
      Math.abs(top - this.oldTop) < 1 &&
      Math.abs(left - this.oldLeft) < 1
    ) {
      // Ignore sub-pixel changes in top and left. Due to #4192 there are a lot
      // of negligible changes in viewport top/left.
      return;
    }
    const event = new (eventUtils.get(EventType.VIEWPORT_CHANGE))(
      top,
      left,
      scale,
      this.id,
      this.oldScale,
    );
    this.oldScale = scale;
    this.oldTop = top;
    this.oldLeft = left;
    eventUtils.fire(event);
  }

  /**
   * Translate this workspace to new coordinates.
   *
   * @param x Horizontal translation, in pixel units relative to the top left of
   *     the Blockly div.
   * @param y Vertical translation, in pixel units relative to the top left of
   *     the Blockly div.
   */
  translate(x: number, y: number) {
    this.layerManager?.translateLayers(new Coordinate(x, y), this.scale);
    this.grid?.moveTo(x, y);
    this.maybeFireViewportChangeEvent();
  }

  /**
   * Returns the horizontal offset of the workspace.
   * Intended for LTR/RTL compatibility in XML.
   *
   * @returns Width.
   */
  override getWidth(): number {
    const metrics = this.getMetrics();
    return metrics ? metrics.viewWidth / this.scale : 0;
  }

  /**
   * Toggles the visibility of the workspace.
   * Currently only intended for main workspace.
   *
   * @param isVisible True if workspace should be visible.
   */
  setVisible(isVisible: boolean) {
    this.visible = isVisible;
    if (!this.svgGroup_) {
      return;
    }

    // Tell the scrollbar whether its container is visible so it can
    // tell when to hide itself.
    if (this.scrollbar) {
      this.scrollbar.setContainerVisible(isVisible);
    }

    // Tell the flyout whether its container is visible so it can
    // tell when to hide itself.
    if (this.getFlyout()) {
      this.getFlyout()!.setContainerVisible(isVisible);
    }

    this.getParentSvg().style.display = isVisible ? 'block' : 'none';
    if (this.toolbox) {
      // Currently does not support toolboxes in mutators.
      this.toolbox.setVisible(isVisible);
    }
    if (!isVisible) {
      this.hideChaff(true);
    }
  }

  /**
   * Render all blocks in workspace.
   */
  render() {
    // Generate list of all blocks.
    const blocks = this.getAllBlocks(false);
    // Render each block.
    for (let i = blocks.length - 1; i >= 0; i--) {
      blocks[i].queueRender();
    }

    this.getTopBlocks()
      .flatMap((block) => block.getDescendants(false))
      .filter((block) => block.isInsertionMarker())
      .forEach((block) => block.queueRender());

    renderManagement
      .finishQueuedRenders()
      .then(() => void this.markerManager.updateMarkers());
  }

  /**
   * Highlight or unhighlight a block in the workspace.  Block highlighting is
   * often used to visually mark blocks currently being executed.
   *
   * @param id ID of block to highlight/unhighlight, or null for no block (used
   *     to unhighlight all blocks).
   * @param opt_state If undefined, highlight specified block and automatically
   *     unhighlight all others.  If true or false, manually
   *     highlight/unhighlight the specified block.
   */
  highlightBlock(id: string | null, opt_state?: boolean) {
    if (opt_state === undefined) {
      // Unhighlight all blocks.
      for (let i = 0, block; (block = this.highlightedBlocks[i]); i++) {
        block.setHighlighted(false);
      }
      this.highlightedBlocks.length = 0;
    }
    // Highlight/unhighlight the specified block.
    const block = id ? this.getBlockById(id) : null;
    if (block) {
      const state = opt_state === undefined || opt_state;
      // Using Set here would be great, but at the cost of IE10 support.
      if (!state) {
        arrayUtils.removeElem(this.highlightedBlocks, block);
      } else if (!this.highlightedBlocks.includes(block)) {
        this.highlightedBlocks.push(block);
      }
      block.setHighlighted(state);
    }
  }

  /**
   * Refresh the toolbox unless there's a drag in progress.
   *
   * @internal
   */
  refreshToolboxSelection() {
    const ws = this.isFlyout ? this.targetWorkspace : this;
    if (ws && !ws.currentGesture_ && ws.toolbox && ws.toolbox.getFlyout()) {
      ws.toolbox.refreshSelection();
    }
  }

  /**
   * Rename a variable by updating its name in the variable map.  Update the
   *     flyout to show the renamed variable immediately.
   *
   * @param id ID of the variable to rename.
   * @param newName New variable name.
   */
  override renameVariableById(id: string, newName: string) {
    super.renameVariableById(id, newName);
    this.refreshToolboxSelection();
  }

  /**
   * Delete a variable by the passed in ID.   Update the flyout to show
   *     immediately that the variable is deleted.
   *
   * @param id ID of variable to delete.
   */
  override deleteVariableById(id: string) {
    super.deleteVariableById(id);
    this.refreshToolboxSelection();
  }

  /**
   * Create a new variable with the given name.  Update the flyout to show the
   *     new variable immediately.
   *
   * @param name The new variable's name.
   * @param opt_type The type of the variable like 'int' or 'string'.
   *     Does not need to be unique. Field_variable can filter variables based
   * on their type. This will default to '' which is a specific type.
   * @param opt_id The unique ID of the variable. This will default to a UUID.
   * @returns The newly created variable.
   */
  override createVariable(
    name: string,
    opt_type?: string | null,
    opt_id?: string | null,
  ): VariableModel {
    const newVar = super.createVariable(name, opt_type, opt_id);
    this.refreshToolboxSelection();
    return newVar;
  }

  /** Make a list of all the delete areas for this workspace. */
  recordDragTargets() {
    const dragTargets = this.componentManager.getComponents(
      ComponentManager.Capability.DRAG_TARGET,
      true,
    );

    this.dragTargetAreas = [];
    for (let i = 0, targetArea; (targetArea = dragTargets[i]); i++) {
      const rect = targetArea.getClientRect();
      if (rect) {
        this.dragTargetAreas.push({
          component: targetArea,
          clientRect: rect,
        });
      }
    }
  }
  /* eslint-disable jsdoc/require-returns-check */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  /**
   * Obtain a newly created block.
   *
   * @param prototypeName Name of the language object containing type-specific
   *     functions for this block.
   * @param opt_id Optional ID.  Use this ID if provided, otherwise create a new
   *     ID.
   * @returns The created block.
   */
  override newBlock(prototypeName: string, opt_id?: string): BlockSvg {
    throw new Error(
      'The implementation of newBlock should be ' +
        'monkey-patched in by blockly.ts',
    );
  }

  /**
   * Obtain a newly created comment.
   *
   * @param id Optional ID.  Use this ID if provided, otherwise create a new
   *     ID.
   * @returns The created comment.
   */
  newComment(id?: string): WorkspaceComment {
    throw new Error(
      'The implementation of newComment should be ' +
        'monkey-patched in by blockly.ts',
    );
  }
  /* eslint-enable */

  /**
   * Returns the drag target the pointer event is over.
   *
   * @param e Pointer move event.
   * @returns Null if not over a drag target, or the drag target the event is
   *     over.
   */
  getDragTarget(e: PointerEvent): IDragTarget | null {
    for (let i = 0, targetArea; (targetArea = this.dragTargetAreas[i]); i++) {
      if (targetArea.clientRect.contains(e.clientX, e.clientY)) {
        return targetArea.component;
      }
    }
    return null;
  }

  /**
   * Handle a pointerdown on SVG drawing surface.
   *
   * @param e Pointer down event.
   */
  private onMouseDown(e: PointerEvent) {
    const gesture = this.getGesture(e);
    if (gesture) {
      gesture.handleWsStart(e, this);
    }
  }

  /**
   * Start tracking a drag of an object on this workspace.
   *
   * @param e Pointer down event.
   * @param xy Starting location of object.
   */
  startDrag(e: PointerEvent, xy: Coordinate) {
    drag.start(this, e, xy);
  }

  /**
   * Track a drag of an object on this workspace.
   *
   * @param e Pointer move event.
   * @returns New location of object.
   */
  moveDrag(e: PointerEvent): Coordinate {
    return drag.move(this, e);
  }

  /**
   * Is the user currently dragging a block or scrolling the flyout/workspace?
   *
   * @returns True if currently dragging or scrolling.
   */
  isDragging(): boolean {
    return this.currentGesture_ !== null && this.currentGesture_.isDragging();
  }

  /**
   * Is this workspace draggable?
   *
   * @returns True if this workspace may be dragged.
   */
  isDraggable(): boolean {
    return this.options.moveOptions && this.options.moveOptions.drag;
  }

  /**
   * Is this workspace movable?
   *
   * This means the user can reposition the X Y coordinates of the workspace
   * through input. This can be through scrollbars, scroll wheel, dragging, or
   * through zooming with the scroll wheel or pinch (since the zoom is centered
   * on the mouse position). This does not include zooming with the zoom
   * controls since the X Y coordinates are decided programmatically.
   *
   * @returns True if the workspace is movable, false otherwise.
   */
  isMovable(): boolean {
    return (
      (this.options.moveOptions && !!this.options.moveOptions.scrollbars) ||
      (this.options.moveOptions && this.options.moveOptions.wheel) ||
      (this.options.moveOptions && this.options.moveOptions.drag) ||
      (this.options.zoomOptions && this.options.zoomOptions.wheel) ||
      (this.options.zoomOptions && this.options.zoomOptions.pinch)
    );
  }

  /**
   * Is this workspace movable horizontally?
   *
   * @returns True if the workspace is movable horizontally, false otherwise.
   */
  isMovableHorizontally(): boolean {
    const hasScrollbars = !!this.scrollbar;
    return (
      this.isMovable() &&
      (!hasScrollbars ||
        (hasScrollbars && this.scrollbar!.canScrollHorizontally()))
    );
  }

  /**
   * Is this workspace movable vertically?
   *
   * @returns True if the workspace is movable vertically, false otherwise.
   */
  isMovableVertically(): boolean {
    const hasScrollbars = !!this.scrollbar;
    return (
      this.isMovable() &&
      (!hasScrollbars ||
        (hasScrollbars && this.scrollbar!.canScrollVertically()))
    );
  }

  /**
   * Handle a mouse-wheel on SVG drawing surface.
   *
   * @param e Mouse wheel event.
   */
  private onMouseWheel(e: WheelEvent) {
    // Don't scroll or zoom anything if drag is in progress.
    if (Gesture.inProgress()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const canWheelZoom =
      this.options.zoomOptions && this.options.zoomOptions.wheel;
    const canWheelMove =
      this.options.moveOptions && this.options.moveOptions.wheel;
    if (!canWheelZoom && !canWheelMove) {
      return;
    }

    const scrollDelta = browserEvents.getScrollDeltaPixels(e);

    // Zoom should also be enabled by the command key on Mac devices,
    // but not super on Unix.
    let commandKey;
    if (userAgent.MAC) {
      commandKey = e.metaKey;
    }

    if (canWheelZoom && (e.ctrlKey || commandKey || !canWheelMove)) {
      // Zoom.
      // The vertical scroll distance that corresponds to a click of a zoom
      // button.
      const PIXELS_PER_ZOOM_STEP = 50;
      const delta = -scrollDelta.y / PIXELS_PER_ZOOM_STEP;
      const position = browserEvents.mouseToSvg(
        e,
        this.getParentSvg(),
        this.getInverseScreenCTM(),
      );
      this.zoom(position.x, position.y, delta);
    } else {
      // Scroll.
      let x = this.scrollX - scrollDelta.x;
      let y = this.scrollY - scrollDelta.y;

      if (e.shiftKey && !scrollDelta.x) {
        // Scroll horizontally (based on vertical scroll delta).
        // This is needed as for some browser/system combinations which do not
        // set deltaX.
        x = this.scrollX - scrollDelta.y;
        y = this.scrollY; // Don't scroll vertically.
      }
      this.scroll(x, y);
    }
    e.preventDefault();
  }

  /**
   * Calculate the bounding box for the blocks on the workspace.
   * Coordinate system: workspace coordinates.
   *
   * @returns Contains the position and size of the bounding box containing the
   *     blocks on the workspace.
   */
  getBlocksBoundingBox(): Rect {
    const topElements = this.getTopBoundedElements();
    // There are no blocks, return empty rectangle.
    if (!topElements.length) {
      return new Rect(0, 0, 0, 0);
    }

    // Initialize boundary using the first block.
    const boundary = topElements[0].getBoundingRectangle();

    // Start at 1 since the 0th block was used for initialization.
    for (let i = 1; i < topElements.length; i++) {
      const topElement = topElements[i];
      if (
        (topElement as any).isInsertionMarker &&
        (topElement as any).isInsertionMarker()
      ) {
        continue;
      }
      const blockBoundary = topElement.getBoundingRectangle();
      if (blockBoundary.top < boundary.top) {
        boundary.top = blockBoundary.top;
      }
      if (blockBoundary.bottom > boundary.bottom) {
        boundary.bottom = blockBoundary.bottom;
      }
      if (blockBoundary.left < boundary.left) {
        boundary.left = blockBoundary.left;
      }
      if (blockBoundary.right > boundary.right) {
        boundary.right = blockBoundary.right;
      }
    }
    return boundary;
  }

  /** Clean up the workspace by ordering all the blocks in a column such that none overlap. */
  cleanUp() {
    this.setResizesEnabled(false);
    eventUtils.setGroup(true);

    const topBlocks = this.getTopBlocks(true);
    const movableBlocks = topBlocks.filter((block) => block.isMovable());
    const immovableBlocks = topBlocks.filter((block) => !block.isMovable());

    const immovableBlockBounds = immovableBlocks.map((block) =>
      block.getBoundingRectangle(),
    );

    const getNextIntersectingImmovableBlock = function (
      rect: Rect,
    ): Rect | null {
      for (const immovableRect of immovableBlockBounds) {
        if (rect.intersects(immovableRect)) {
          return immovableRect;
        }
      }
      return null;
    };

    let cursorY = 0;
    const minBlockHeight = this.renderer.getConstants().MIN_BLOCK_HEIGHT;
    for (const block of movableBlocks) {
      // Make the initial movement of shifting the block to its best possible position.
      let boundingRect = block.getBoundingRectangle();
      block.moveBy(-boundingRect.left, cursorY - boundingRect.top, ['cleanup']);
      block.snapToGrid();

      boundingRect = block.getBoundingRectangle();
      let conflictingRect = getNextIntersectingImmovableBlock(boundingRect);
      while (conflictingRect != null) {
        // If the block intersects with an immovable block, move it down past that immovable block.
        cursorY =
          conflictingRect.top + conflictingRect.getHeight() + minBlockHeight;
        block.moveBy(0, cursorY - boundingRect.top, ['cleanup']);
        block.snapToGrid();
        boundingRect = block.getBoundingRectangle();
        conflictingRect = getNextIntersectingImmovableBlock(boundingRect);
      }

      // Ensure all next blocks start past the most recent (which will also put them past all
      // previously intersecting immovable blocks).
      cursorY =
        block.getRelativeToSurfaceXY().y +
        block.getHeightWidth().height +
        minBlockHeight;
    }
    eventUtils.setGroup(false);
    this.setResizesEnabled(true);
  }

  /**
   * Show the context menu for the workspace.
   *
   * @param e Mouse event.
   * @internal
   */
  showContextMenu(e: PointerEvent) {
    if (this.options.readOnly || this.isFlyout) {
      return;
    }
    const menuOptions = ContextMenuRegistry.registry.getContextMenuOptions(
      ContextMenuRegistry.ScopeType.WORKSPACE,
      {workspace: this},
    );

    // Allow the developer to add or modify menuOptions.
    if (this.configureContextMenu) {
      this.configureContextMenu(menuOptions, e);
    }

    ContextMenu.show(e, menuOptions, this.RTL, this);
  }

  /**
   * Modify the block tree on the existing toolbox.
   *
   * @param toolboxDef DOM tree of toolbox contents, string of toolbox contents,
   *     or JSON representing toolbox definition.
   */
  updateToolbox(toolboxDef: toolbox.ToolboxDefinition | null) {
    const parsedToolboxDef = toolbox.convertToolboxDefToJson(toolboxDef);

    if (!parsedToolboxDef) {
      if (this.options.languageTree) {
        throw Error("Can't nullify an existing toolbox.");
      }
      return; // No change (null to null).
    }
    if (!this.options.languageTree) {
      throw Error("Existing toolbox is null.  Can't create new toolbox.");
    }

    if (toolbox.hasCategories(parsedToolboxDef)) {
      if (!this.toolbox) {
        throw Error("Existing toolbox has no categories.  Can't change mode.");
      }
      this.options.languageTree = parsedToolboxDef;
      this.toolbox.render(parsedToolboxDef);
    } else {
      if (!this.flyout) {
        throw Error("Existing toolbox has categories.  Can't change mode.");
      }
      this.options.languageTree = parsedToolboxDef;
      this.flyout.show(parsedToolboxDef);
    }
  }

  /** Mark this workspace as the currently focused main workspace. */
  markFocused() {
    if (this.options.parentWorkspace) {
      this.options.parentWorkspace.markFocused();
    } else {
      common.setMainWorkspace(this);
      // We call e.preventDefault in many event handlers which means we
      // need to explicitly grab focus (e.g from a textarea) because
      // the browser will not do it for us.
      this.getParentSvg().focus({preventScroll: true});
    }
  }

  /**
   * Zooms the workspace in or out relative to/centered on the given (x, y)
   * coordinate.
   *
   * @param x X coordinate of center, in pixel units relative to the top-left
   *     corner of the parentSVG.
   * @param y Y coordinate of center, in pixel units relative to the top-left
   *     corner of the parentSVG.
   * @param amount Amount of zooming. The formula for the new scale is newScale
   *     = currentScale * (scaleSpeed^amount). scaleSpeed is set in the
   *     workspace options. Negative amount values zoom out, and positive amount
   *     values zoom in.
   */
  zoom(x: number, y: number, amount: number) {
    // Scale factor.
    const speed = this.options.zoomOptions.scaleSpeed;
    let scaleChange = Math.pow(speed, amount);
    const newScale = this.scale * scaleChange;
    if (this.scale === newScale) {
      return; // No change in zoom.
    }

    // Clamp scale within valid range.
    if (newScale > this.options.zoomOptions.maxScale) {
      scaleChange = this.options.zoomOptions.maxScale / this.scale;
    } else if (newScale < this.options.zoomOptions.minScale) {
      scaleChange = this.options.zoomOptions.minScale / this.scale;
    }

    // Transform the x/y coordinates from the parentSVG's space into the
    // canvas' space, so that they are in workspace units relative to the top
    // left of the visible portion of the workspace.
    let matrix = this.getCanvas().getCTM();
    let center = this.getParentSvg().createSVGPoint();
    center.x = x;
    center.y = y;
    center = center.matrixTransform(matrix!.inverse());
    x = center.x;
    y = center.y;

    // Find the new scrollX/scrollY so that the center remains in the same
    // position (relative to the center) after we zoom.
    // newScale and matrix.a should be identical (within a rounding error).
    matrix = matrix!
      .translate(x * (1 - scaleChange), y * (1 - scaleChange))
      .scale(scaleChange);
    // scrollX and scrollY are in pixels.
    // The scrollX and scrollY still need to have absoluteLeft and absoluteTop
    // subtracted from them, but we'll leave that for setScale so that they're
    // correctly updated for the new flyout size if we have a simple toolbox.
    this.scrollX = matrix.e;
    this.scrollY = matrix.f;
    this.setScale(newScale);
  }

  /**
   * Zooming the blocks centered in the center of view with zooming in or out.
   *
   * @param type Type of zooming (-1 zooming out and 1 zooming in).
   */
  zoomCenter(type: number) {
    const metrics = this.getMetrics();
    let x;
    let y;
    if (this.flyout) {
      // If you want blocks in the center of the view (visible portion of the
      // workspace) to stay centered when the size of the view decreases (i.e.
      // when the size of the flyout increases) you need the center of the
      // *blockly div* to stay in the same pixel-position.
      // Note: This only works because of how scrollCenter positions blocks.
      x = metrics.svgWidth ? metrics.svgWidth / 2 : 0;
      y = metrics.svgHeight ? metrics.svgHeight / 2 : 0;
    } else {
      x = metrics.viewWidth / 2 + metrics.absoluteLeft;
      y = metrics.viewHeight / 2 + metrics.absoluteTop;
    }
    this.zoom(x, y, type);
  }

  /** Zoom the blocks to fit in the workspace if possible. */
  zoomToFit() {
    if (!this.isMovable()) {
      console.warn(
        'Tried to move a non-movable workspace. This could result' +
          ' in blocks becoming inaccessible.',
      );
      return;
    }

    const metrics = this.getMetrics();
    let workspaceWidth = metrics.viewWidth;
    let workspaceHeight = metrics.viewHeight;
    const blocksBox = this.getBlocksBoundingBox();
    const doubleMargin = ZOOM_TO_FIT_MARGIN * 2;
    let blocksWidth = blocksBox.right - blocksBox.left + doubleMargin;
    let blocksHeight = blocksBox.bottom - blocksBox.top + doubleMargin;
    if (!blocksWidth) {
      return; // Prevents zooming to infinity.
    }
    if (this.flyout) {
      // We have to add the flyout size to both the workspace size and the
      // block size because the blocks we want to resize include the blocks in
      // the flyout, and the area we want to fit them includes the portion of
      // the workspace that is behind the flyout.
      if (this.horizontalLayout) {
        workspaceHeight += this.flyout.getHeight();
        // Convert from pixels to workspace coordinates.
        blocksHeight += this.flyout.getHeight() / this.scale;
      } else {
        workspaceWidth += this.flyout.getWidth();
        // Convert from pixels to workspace coordinates.
        blocksWidth += this.flyout.getWidth() / this.scale;
      }
    }

    // Scale Units: (pixels / workspaceUnit)
    const ratioX = workspaceWidth / blocksWidth;
    const ratioY = workspaceHeight / blocksHeight;
    eventUtils.disable();
    try {
      this.setScale(Math.min(ratioX, ratioY));
      this.scrollCenter();
    } finally {
      eventUtils.enable();
    }
    this.maybeFireViewportChangeEvent();
  }

  /**
   * Add a transition class to the block and bubble canvas, to animate any
   * transform changes.
   *
   * @internal
   */
  beginCanvasTransition() {
    dom.addClass(this.getCanvas(), 'blocklyCanvasTransitioning');
    dom.addClass(this.getBubbleCanvas(), 'blocklyCanvasTransitioning');
  }

  /**
   * Remove transition class from the block and bubble canvas.
   *
   * @internal
   */
  endCanvasTransition() {
    dom.removeClass(this.getCanvas(), 'blocklyCanvasTransitioning');
    dom.removeClass(this.getBubbleCanvas(), 'blocklyCanvasTransitioning');
  }

  /** Center the workspace. */
  scrollCenter() {
    if (!this.isMovable()) {
      console.warn(
        'Tried to move a non-movable workspace. This could result' +
          ' in blocks becoming inaccessible.',
      );
      return;
    }

    const metrics = this.getMetrics();
    let x = (metrics.scrollWidth - metrics.viewWidth) / 2;
    let y = (metrics.scrollHeight - metrics.viewHeight) / 2;

    // Convert from workspace directions to canvas directions.
    x = -x - metrics.scrollLeft;
    y = -y - metrics.scrollTop;
    this.scroll(x, y);
  }

  /**
   * Scroll the workspace to center on the given block. If the block has other
   * blocks stacked below it, the workspace will be centered on the stack,
   * unless blockOnly is true.
   *
   * @param id ID of block center on.
   * @param blockOnly True to center only on the block itself, not its stack.
   */
  centerOnBlock(id: string | null, blockOnly?: boolean) {
    if (!this.isMovable()) {
      console.warn(
        'Tried to move a non-movable workspace. This could result' +
          ' in blocks becoming inaccessible.',
      );
      return;
    }

    const block = id ? this.getBlockById(id) : null;
    if (!block) {
      return;
    }

    // XY is in workspace coordinates.
    const xy = block.getRelativeToSurfaceXY();
    // Height/width is in workspace units.
    const heightWidth = blockOnly
      ? {height: block.height, width: block.width}
      : block.getHeightWidth();

    // Find the enter of the block in workspace units.
    const blockCenterY = xy.y + heightWidth.height / 2;

    // In RTL the block's position is the top right of the block, not top left.
    const multiplier = this.RTL ? -1 : 1;
    const blockCenterX = xy.x + (multiplier * heightWidth.width) / 2;

    // Workspace scale, used to convert from workspace coordinates to pixels.
    const scale = this.scale;

    // Center of block in pixels, relative to workspace origin (center 0,0).
    // Scrolling to here would put the block in the top-left corner of the
    // visible workspace.
    const pixelX = blockCenterX * scale;
    const pixelY = blockCenterY * scale;

    const metrics = this.getMetrics();

    // viewHeight and viewWidth are in pixels.
    const halfViewWidth = metrics.viewWidth / 2;
    const halfViewHeight = metrics.viewHeight / 2;

    // Put the block in the center of the visible workspace instead.
    const scrollToCenterX = pixelX - halfViewWidth;
    const scrollToCenterY = pixelY - halfViewHeight;

    // Convert from workspace directions to canvas directions.
    const x = -scrollToCenterX;
    const y = -scrollToCenterY;

    this.scroll(x, y);
  }

  /**
   * Set the workspace's zoom factor.
   *
   * @param newScale Zoom factor. Units: (pixels / workspaceUnit).
   */
  setScale(newScale: number) {
    if (
      this.options.zoomOptions.maxScale &&
      newScale > this.options.zoomOptions.maxScale
    ) {
      newScale = this.options.zoomOptions.maxScale;
    } else if (
      this.options.zoomOptions.minScale &&
      newScale < this.options.zoomOptions.minScale
    ) {
      newScale = this.options.zoomOptions.minScale;
    }
    this.scale = newScale;

    this.hideChaff(false);
    // Get the flyout, if any, whether our own or owned by the toolbox.
    const flyout = this.getFlyout(false);
    if (flyout && flyout.isVisible()) {
      flyout.reflow();
      this.recordDragTargets();
    }
    if (this.grid) {
      this.grid.update(this.scale);
    }

    // We call scroll instead of scrollbar.resize() so that we can center the
    // zoom correctly without scrollbars, but scroll does not resize the
    // scrollbars so we have to call resizeView/resizeContent as well.
    const metrics = this.getMetrics();

    this.scrollX -= metrics.absoluteLeft;
    this.scrollY -= metrics.absoluteTop;
    // The scroll values and the view values are additive inverses of
    // each other, so when we subtract from one we have to add to the other.
    metrics.viewLeft += metrics.absoluteLeft;
    metrics.viewTop += metrics.absoluteTop;

    this.scroll(this.scrollX, this.scrollY);
    if (this.scrollbar) {
      if (this.flyout) {
        this.scrollbar.resizeView(metrics);
      } else {
        this.scrollbar.resizeContent(metrics);
      }
    }
  }

  /**
   * Get the workspace's zoom factor.  If the workspace has a parent, we call
   * into the parent to get the workspace scale.
   *
   * @returns The workspace zoom factor. Units: (pixels / workspaceUnit).
   */
  getScale(): number {
    if (this.options.parentWorkspace) {
      return this.options.parentWorkspace.getScale();
    }
    return this.scale;
  }

  /**
   * Scroll the workspace to a specified offset (in pixels), keeping in the
   * workspace bounds. See comment on workspaceSvg.scrollX for more detail on
   * the meaning of these values.
   *
   * @param x Target X to scroll to.
   * @param y Target Y to scroll to.
   */
  scroll(x: number, y: number) {
    this.hideChaff(/* opt_onlyClosePopups= */ true);

    // Keep scrolling within the bounds of the content.
    const metrics = this.getMetrics();
    // Canvas coordinates (aka scroll coordinates) have inverse directionality
    // to workspace coordinates so we have to inverse them.
    x = Math.min(x, -metrics.scrollLeft);
    y = Math.min(y, -metrics.scrollTop);
    const maxXDisplacement = Math.max(
      0,
      metrics.scrollWidth - metrics.viewWidth,
    );
    const maxXScroll = metrics.scrollLeft + maxXDisplacement;
    const maxYDisplacement = Math.max(
      0,
      metrics.scrollHeight - metrics.viewHeight,
    );
    const maxYScroll = metrics.scrollTop + maxYDisplacement;
    x = Math.max(x, -maxXScroll);
    y = Math.max(y, -maxYScroll);
    this.scrollX = x;
    this.scrollY = y;

    if (this.scrollbar) {
      // The content position (displacement from the content's top-left to the
      // origin) plus the scroll position (displacement from the view's top-left
      // to the origin) gives us the distance from the view's top-left to the
      // content's top-left. Then we negate this so we get the displacement from
      // the content's top-left to the view's top-left, matching the
      // directionality of the scrollbars.
      this.scrollbar.set(
        -(x + metrics.scrollLeft),
        -(y + metrics.scrollTop),
        false,
      );
    }
    // We have to shift the translation so that when the canvas is at 0, 0 the
    // workspace origin is not underneath the toolbox.
    x += metrics.absoluteLeft;
    y += metrics.absoluteTop;
    this.translate(x, y);
  }

  /**
   * Find the block on this workspace with the specified ID.
   *
   * @param id ID of block to find.
   * @returns The sought after block, or null if not found.
   */
  override getBlockById(id: string): BlockSvg | null {
    return super.getBlockById(id) as BlockSvg;
  }

  /**
   * Find all blocks in workspace.  Blocks are optionally sorted
   * by position; top to bottom (with slight LTR or RTL bias).
   *
   * @param ordered Sort the list if true.
   * @returns Array of blocks.
   */
  override getAllBlocks(ordered = false): BlockSvg[] {
    return super.getAllBlocks(ordered) as BlockSvg[];
  }

  /**
   * Finds the top-level blocks and returns them.  Blocks are optionally sorted
   * by position; top to bottom (with slight LTR or RTL bias).
   *
   * @param ordered Sort the list if true.
   * @returns The top-level block objects.
   */
  override getTopBlocks(ordered = false): BlockSvg[] {
    return super.getTopBlocks(ordered) as BlockSvg[];
  }

  /**
   * Adds a block to the list of top blocks.
   *
   * @param block Block to add.
   */
  override addTopBlock(block: Block) {
    this.addTopBoundedElement(block as BlockSvg);
    super.addTopBlock(block);
  }

  /**
   * Removes a block from the list of top blocks.
   *
   * @param block Block to remove.
   */
  override removeTopBlock(block: Block) {
    this.removeTopBoundedElement(block as BlockSvg);
    super.removeTopBlock(block);
  }

  /**
   * Adds a comment to the list of top comments.
   *
   * @param comment comment to add.
   */
  override addTopComment(comment: WorkspaceComment) {
    this.addTopBoundedElement(comment as RenderedWorkspaceComment);
    super.addTopComment(comment);
  }

  /**
   * Removes a comment from the list of top comments.
   *
   * @param comment comment to remove.
   */
  override removeTopComment(comment: WorkspaceComment) {
    this.removeTopBoundedElement(comment as RenderedWorkspaceComment);
    super.removeTopComment(comment);
  }

  override getRootWorkspace(): WorkspaceSvg | null {
    return super.getRootWorkspace() as WorkspaceSvg | null;
  }

  /**
   * Adds a bounded element to the list of top bounded elements.
   *
   * @param element Bounded element to add.
   */
  addTopBoundedElement(element: IBoundedElement) {
    this.topBoundedElements.push(element);
  }

  /**
   * Removes a bounded element from the list of top bounded elements.
   *
   * @param element Bounded element to remove.
   */
  removeTopBoundedElement(element: IBoundedElement) {
    arrayUtils.removeElem(this.topBoundedElements, element);
  }

  /**
   * Finds the top-level bounded elements and returns them.
   *
   * @returns The top-level bounded elements.
   */
  getTopBoundedElements(): IBoundedElement[] {
    return new Array<IBoundedElement>().concat(this.topBoundedElements);
  }

  /**
   * Update whether this workspace has resizes enabled.
   * If enabled, workspace will resize when appropriate.
   * If disabled, workspace will not resize until re-enabled.
   * Use to avoid resizing during a batch operation, for performance.
   *
   * @param enabled Whether resizes should be enabled.
   */
  setResizesEnabled(enabled: boolean) {
    const reenabled = !this.resizesEnabled && enabled;
    this.resizesEnabled = enabled;
    if (reenabled) {
      // Newly enabled.  Trigger a resize.
      this.resizeContents();
    }
  }

  /**
   * Dispose of all blocks in workspace, with an optimization to prevent
   * resizes.
   */
  override clear() {
    this.setResizesEnabled(false);
    super.clear();
    this.topBoundedElements = [];
    this.setResizesEnabled(true);
  }

  /**
   * Register a callback function associated with a given key, for clicks on
   * buttons and labels in the flyout.
   * For instance, a button specified by the XML
   * <button text="create variable" callbackKey="CREATE_VARIABLE"></button>
   * should be matched by a call to
   * registerButtonCallback("CREATE_VARIABLE", yourCallbackFunction).
   *
   * @param key The name to use to look up this function.
   * @param func The function to call when the given button is clicked.
   */
  registerButtonCallback(key: string, func: (p1: FlyoutButton) => void) {
    if (typeof func !== 'function') {
      throw TypeError('Button callbacks must be functions.');
    }
    this.flyoutButtonCallbacks.set(key, func);
  }

  /**
   * Get the callback function associated with a given key, for clicks on
   * buttons and labels in the flyout.
   *
   * @param key The name to use to look up the function.
   * @returns The function corresponding to the given key for this workspace;
   *     null if no callback is registered.
   */
  getButtonCallback(key: string): ((p1: FlyoutButton) => void) | null {
    return this.flyoutButtonCallbacks.get(key) ?? null;
  }

  /**
   * Remove a callback for a click on a button in the flyout.
   *
   * @param key The name associated with the callback function.
   */
  removeButtonCallback(key: string) {
    this.flyoutButtonCallbacks.delete(key);
  }

  /**
   * Register a callback function associated with a given key, for populating
   * custom toolbox categories in this workspace.  See the variable and
   * procedure categories as an example.
   *
   * @param key The name to use to look up this function.
   * @param func The function to call when the given toolbox category is opened.
   */
  registerToolboxCategoryCallback(
    key: string,
    func: (p1: WorkspaceSvg) => toolbox.FlyoutDefinition,
  ) {
    if (typeof func !== 'function') {
      throw TypeError('Toolbox category callbacks must be functions.');
    }
    this.toolboxCategoryCallbacks.set(key, func);
  }

  /**
   * Get the callback function associated with a given key, for populating
   * custom toolbox categories in this workspace.
   *
   * @param key The name to use to look up the function.
   * @returns The function corresponding to the given key for this workspace, or
   *     null if no function is registered.
   */
  getToolboxCategoryCallback(
    key: string,
  ): ((p1: WorkspaceSvg) => toolbox.FlyoutDefinition) | null {
    return this.toolboxCategoryCallbacks.get(key) || null;
  }

  /**
   * Remove a callback for a click on a custom category's name in the toolbox.
   *
   * @param key The name associated with the callback function.
   */
  removeToolboxCategoryCallback(key: string) {
    this.toolboxCategoryCallbacks.delete(key);
  }

  /**
   * Look up the gesture that is tracking this touch stream on this workspace.
   * May create a new gesture.
   *
   * @param e Pointer event.
   * @returns The gesture that is tracking this touch stream, or null if no
   *     valid gesture exists.
   * @internal
   */
  getGesture(e: PointerEvent): Gesture | null {
    const isStart = e.type === 'pointerdown';

    const gesture = this.currentGesture_;
    if (gesture) {
      if (isStart && gesture.hasStarted()) {
        console.warn('Tried to start the same gesture twice.');
        // That's funny.  We must have missed a mouse up.
        // Cancel it, rather than try to retrieve all of the state we need.
        gesture.cancel();
        return null;
      }
      return gesture;
    }

    // No gesture existed on this workspace, but this looks like the start of a
    // new gesture.
    if (isStart) {
      this.currentGesture_ = new Gesture(e, this);
      return this.currentGesture_;
    }
    // No gesture existed and this event couldn't be the start of a new gesture.
    return null;
  }

  /**
   * Clear the reference to the current gesture.
   *
   * @internal
   */
  clearGesture() {
    this.currentGesture_ = null;
  }

  /**
   * Cancel the current gesture, if one exists.
   *
   * @internal
   */
  cancelCurrentGesture() {
    if (this.currentGesture_) {
      this.currentGesture_.cancel();
    }
  }

  /**
   * Get the audio manager for this workspace.
   *
   * @returns The audio manager for this workspace.
   */
  getAudioManager(): WorkspaceAudio {
    return this.audioManager;
  }

  /**
   * Get the grid object for this workspace, or null if there is none.
   *
   * @returns The grid object for this workspace.
   */
  getGrid(): Grid | null {
    return this.grid;
  }

  /**
   * Close tooltips, context menus, dropdown selections, etc.
   *
   * @param onlyClosePopups Whether only popups should be closed. Defaults to
   *     false.
   */
  hideChaff(onlyClosePopups = false) {
    Tooltip.hide();
    WidgetDiv.hideIfOwnerIsInWorkspace(this);
    dropDownDiv.hideWithoutAnimation();

    this.hideComponents(onlyClosePopups);
  }

  /**
   * Hide any autohideable components (like flyout, trashcan, and any
   * user-registered components).
   *
   * @param onlyClosePopups Whether only popups should be closed. Defaults to
   *     false.
   */
  hideComponents(onlyClosePopups = false) {
    const autoHideables = this.getComponentManager().getComponents(
      ComponentManager.Capability.AUTOHIDEABLE,
      true,
    );
    autoHideables.forEach((autoHideable) =>
      autoHideable.autoHide(onlyClosePopups),
    );
  }

  /**
   * Sets the X/Y translations of a top level workspace.
   *
   * @param xyRatio Contains an x and/or y property which is a float between 0
   *     and 1 specifying the degree of scrolling.
   */
  private static setTopLevelWorkspaceMetrics(
    this: WorkspaceSvg,
    xyRatio: {x?: number; y?: number},
  ) {
    const metrics = this.getMetrics();

    if (typeof xyRatio.x === 'number') {
      this.scrollX = -(
        metrics.scrollLeft +
        (metrics.scrollWidth - metrics.viewWidth) * xyRatio.x
      );
    }
    if (typeof xyRatio.y === 'number') {
      this.scrollY = -(
        metrics.scrollTop +
        (metrics.scrollHeight - metrics.viewHeight) * xyRatio.y
      );
    }
    // We have to shift the translation so that when the canvas is at 0, 0 the
    // workspace origin is not underneath the toolbox.
    const x = this.scrollX + metrics.absoluteLeft;
    const y = this.scrollY + metrics.absoluteTop;
    // We could call scroll here, but that has extra checks we don't need to do.
    this.translate(x, y);
  }
}

/**
 * Size the workspace when the contents change.  This also updates
 * scrollbars accordingly.
 *
 * @param workspace The workspace to resize.
 * @internal
 */
export function resizeSvgContents(workspace: WorkspaceSvg) {
  workspace.resizeContents();
}
