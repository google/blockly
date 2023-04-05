/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Object representing a mutator dialog.  A mutator allows the
 * user to change the shape of a block using a nested blocks editor.
 *
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.Mutator');

// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_bubble_open.js';

import type {Block} from './block.js';
import type {BlockSvg} from './block_svg.js';
import type {BlocklyOptions} from './blockly_options.js';
import {Bubble} from './bubble.js';
import {config} from './config.js';
import type {Connection} from './connection.js';
import type {Abstract} from './events/events_abstract.js';
import {BlockChange} from './events/events_block_change.js';
import * as eventUtils from './events/utils.js';
import {Icon} from './icon.js';
import {Options} from './options.js';
import type {Coordinate} from './utils/coordinate.js';
import * as dom from './utils/dom.js';
import {Svg} from './utils/svg.js';
import * as toolbox from './utils/toolbox.js';
import * as xml from './utils/xml.js';
import * as deprecation from './utils/deprecation.js';
import type {WorkspaceSvg} from './workspace_svg.js';


/**
 * Class for a mutator dialog.
 */
export class Mutator extends Icon {
  private quarkNames: string[];

  /**
   * Workspace in the mutator's bubble.
   * Due to legacy code in procedure block definitions, this name
   * cannot change.
   */
  private workspace_: WorkspaceSvg|null = null;

  /** Width of workspace. */
  private workspaceWidth = 0;

  /** Height of workspace. */
  private workspaceHeight = 0;

  /**
   * The SVG element that is the parent of the mutator workspace, or null if
   * not created.
   */
  private svgDialog: SVGSVGElement|null = null;

  /**
   * The root block of the mutator workspace, created by decomposing the
   * source block.
   */
  private rootBlock: BlockSvg|null = null;

  /**
   * Function registered on the main workspace to update the mutator contents
   * when the main workspace changes.
   */
  private sourceListener: Function|null = null;

  /**
   * The PID associated with the updateWorkpace_ timeout, or null if no timeout
   * is currently running.
   */
  private updateWorkspacePid: ReturnType<typeof setTimeout>|null = null;

  /** @param quarkNames List of names of sub-blocks for flyout. */
  constructor(quarkNames: string[], block?: BlockSvg) {
    if (!block) {
      deprecation.warn(
          'Calling the Mutator constructor without passing the block it is attached to',
          'version 9', 'version 10',
          'the constructor by passing the list of subblocks and the block instance to attach the mutator to');
    }
    super(block ?? null);
    this.quarkNames = quarkNames;
  }

  /**
   * Set the block this mutator is associated with.
   *
   * @param block The block associated with this mutator.
   * @internal
   */
  setBlock(block: BlockSvg) {
    this.block_ = block;
  }

  /**
   * Returns the workspace inside this mutator icon's bubble.
   *
   * @returns The workspace inside this mutator icon's bubble or null if the
   *     mutator isn't open.
   * @internal
   */
  getWorkspace(): WorkspaceSvg|null {
    return this.workspace_;
  }

  /**
   * Draw the mutator icon.
   *
   * @param group The icon group.
   */
  protected override drawIcon_(group: Element) {
    // Square with rounded corners.
    dom.createSvgElement(
        Svg.RECT, {
          'class': 'blocklyIconShape',
          'rx': '4',
          'ry': '4',
          'height': '16',
          'width': '16',
        },
        group);
    // Gear teeth.
    dom.createSvgElement(
        Svg.PATH, {
          'class': 'blocklyIconSymbol',
          'd': 'm4.203,7.296 0,1.368 -0.92,0.677 -0.11,0.41 0.9,1.559 0.41,' +
              '0.11 1.043,-0.457 1.187,0.683 0.127,1.134 0.3,0.3 1.8,0 0.3,' +
              '-0.299 0.127,-1.138 1.185,-0.682 1.046,0.458 0.409,-0.11 0.9,' +
              '-1.559 -0.11,-0.41 -0.92,-0.677 0,-1.366 0.92,-0.677 0.11,' +
              '-0.41 -0.9,-1.559 -0.409,-0.109 -1.046,0.458 -1.185,-0.682 ' +
              '-0.127,-1.138 -0.3,-0.299 -1.8,0 -0.3,0.3 -0.126,1.135 -1.187,' +
              '0.682 -1.043,-0.457 -0.41,0.11 -0.899,1.559 0.108,0.409z',
        },
        group);
    // Axle hole.
    dom.createSvgElement(
        Svg.CIRCLE,
        {'class': 'blocklyIconShape', 'r': '2.7', 'cx': '8', 'cy': '8'}, group);
  }

  /**
   * Clicking on the icon toggles if the mutator bubble is visible.
   * Disable if block is uneditable.
   *
   * @param e Mouse click event.
   */
  protected override iconClick_(e: PointerEvent) {
    if (this.getBlock().isEditable()) {
      super.iconClick_(e);
    }
  }

  /**
   * Create the editor for the mutator's bubble.
   *
   * @returns The top-level node of the editor.
   */
  private createEditor(): SVGSVGElement {
    /* Create the editor.  Here's the markup that will be generated:
        <svg>
          [Workspace]
        </svg>
        */
    this.svgDialog = dom.createSvgElement(
        Svg.SVG, {'x': Bubble.BORDER_WIDTH, 'y': Bubble.BORDER_WIDTH});
    // Convert the list of names into a list of XML objects for the flyout.
    let quarkXml;
    if (this.quarkNames.length) {
      quarkXml = xml.createElement('xml');
      for (let i = 0, quarkName; quarkName = this.quarkNames[i]; i++) {
        const element = xml.createElement('block');
        element.setAttribute('type', quarkName);
        quarkXml.appendChild(element);
      }
    } else {
      quarkXml = null;
    }
    const block = this.getBlock();
    const workspaceOptions = new Options(({
      // If you want to enable disabling, also remove the
      // event filter from workspaceChanged_ .
      'disable': false,
      'parentWorkspace': block.workspace,
      'media': block.workspace.options.pathToMedia,
      'rtl': block.RTL,
      'horizontalLayout': false,
      'renderer': block.workspace.options.renderer,
      'rendererOverrides': block.workspace.options.rendererOverrides,
    } as BlocklyOptions));
    workspaceOptions.toolboxPosition =
        block.RTL ? toolbox.Position.RIGHT : toolbox.Position.LEFT;
    const hasFlyout = !!quarkXml;
    if (hasFlyout) {
      workspaceOptions.languageTree = toolbox.convertToolboxDefToJson(quarkXml);
    }
    this.workspace_ = this.newWorkspaceSvg(workspaceOptions);
    this.workspace_.internalIsMutator = true;
    this.workspace_.addChangeListener(eventUtils.disableOrphans);

    // Mutator flyouts go inside the mutator workspace's <g> rather than in
    // a top level SVG. Instead of handling scale themselves, mutators
    // inherit scale from the parent workspace.
    // To fix this, scale needs to be applied at a different level in the DOM.
    const flyoutSvg = hasFlyout ? this.workspace_.addFlyout(Svg.G) : null;
    const background = this.workspace_.createDom('blocklyMutatorBackground');

    if (flyoutSvg) {
      // Insert the flyout after the <rect> but before the block canvas so that
      // the flyout is underneath in z-order.  This makes blocks layering during
      // dragging work properly.
      background.insertBefore(flyoutSvg, this.workspace_.svgBlockCanvas_);
    }
    this.svgDialog.appendChild(background);

    return this.svgDialog;
  }

  /**
   * @internal
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  newWorkspaceSvg(options: Options): WorkspaceSvg {
    throw new Error(
        'The implementation of newWorkspaceSvg should be ' +
        'monkey-patched in by blockly.ts');
  }

  /** Add or remove the UI indicating if this icon may be clicked or not. */
  override updateEditable() {
    super.updateEditable();
    if (!this.getBlock().isInFlyout) {
      if (this.getBlock().isEditable()) {
        if (this.iconGroup_) {
          dom.removeClass(this.iconGroup_, 'blocklyIconGroupReadonly');
        }
      } else {
        // Close any mutator bubble.  Icon is not clickable.
        this.setVisible(false);
        if (this.iconGroup_) {
          dom.addClass(this.iconGroup_, 'blocklyIconGroupReadonly');
        }
      }
    }
  }

  /** Resize the bubble to match the size of the workspace. */
  private resizeBubble() {
    // If the bubble exists, the workspace also exists.
    if (!this.workspace_) {
      return;
    }
    const doubleBorderWidth = 2 * Bubble.BORDER_WIDTH;
    const canvas = this.workspace_.getCanvas();
    const workspaceSize = canvas.getBBox();
    let width = workspaceSize.width + workspaceSize.x;
    let height = workspaceSize.height + doubleBorderWidth * 3;
    const flyout = this.workspace_.getFlyout();
    if (flyout) {
      const flyoutScrollMetrics =
          flyout.getWorkspace().getMetricsManager().getScrollMetrics();
      height = Math.max(height, flyoutScrollMetrics.height + 20);
      width += flyout.getWidth();
    }
    const isRtl = this.getBlock().RTL;
    if (isRtl) {
      width = -workspaceSize.x;
    }
    width += doubleBorderWidth * 3;
    // Only resize if the size difference is significant.  Eliminates
    // shuddering.
    if (Math.abs(this.workspaceWidth - width) > doubleBorderWidth ||
        Math.abs(this.workspaceHeight - height) > doubleBorderWidth) {
      // Record some layout information for workspace metrics.
      this.workspaceWidth = width;
      this.workspaceHeight = height;
      // Resize the bubble.
      this.bubble_!.setBubbleSize(
          width + doubleBorderWidth, height + doubleBorderWidth);
      this.svgDialog!.setAttribute('width', `${width}`);
      this.svgDialog!.setAttribute('height', `${height}`);
      this.workspace_.setCachedParentSvgSize(width, height);
    }

    if (isRtl) {
      // Scroll the workspace to always left-align.
      canvas.setAttribute('transform', `translate(${this.workspaceWidth}, 0)`);
    }
    this.workspace_.resize();
  }

  /** A method handler for when the bubble is moved. */
  private onBubbleMove() {
    if (this.workspace_) {
      this.workspace_.recordDragTargets();
    }
  }

  /**
   * Show or hide the mutator bubble.
   *
   * @param visible True if the bubble should be visible.
   */
  override setVisible(visible: boolean) {
    if (visible === this.isVisible()) {
      // No change.
      return;
    }
    const block = this.getBlock();
    if (visible) {
      // Create the bubble.
      this.bubble_ = new Bubble(
          block.workspace, this.createEditor(), block.pathObject.svgPath,
          (this.iconXY_ as Coordinate), null, null);
      // The workspace was created in createEditor.
      const ws = this.workspace_!;
      // Expose this mutator's block's ID on its top-level SVG group.
      this.bubble_.setSvgId(block.id);
      this.bubble_.registerMoveEvent(this.onBubbleMove.bind(this));
      const tree = ws.options.languageTree;
      const flyout = ws.getFlyout();
      if (tree) {
        flyout!.init(ws);
        flyout!.show(tree);
      }

      this.rootBlock = block.decompose!(ws)!;
      const blocks = this.rootBlock.getDescendants(false);
      for (let i = 0, child; child = blocks[i]; i++) {
        child.render();
      }
      // The root block should not be draggable or deletable.
      this.rootBlock.setMovable(false);
      this.rootBlock.setDeletable(false);
      let margin;
      let x;
      if (flyout) {
        margin = flyout.CORNER_RADIUS * 2;
        x = this.rootBlock.RTL ? flyout.getWidth() + margin : margin;
      } else {
        margin = 16;
        x = margin;
      }
      if (block.RTL) {
        x = -x;
      }
      this.rootBlock.moveBy(x, margin);
      // Save the initial connections, then listen for further changes.
      if (block.saveConnections) {
        const thisRootBlock = this.rootBlock;
        block.saveConnections(thisRootBlock);
        this.sourceListener = () => {
          const currentBlock = this.getBlock();
          if (currentBlock.saveConnections) {
            currentBlock.saveConnections(thisRootBlock);
          }
        };
        block.workspace.addChangeListener(this.sourceListener);
      }
      this.resizeBubble();
      // When the mutator's workspace changes, update the source block.
      const boundListener = this.workspaceChanged.bind(this);
      ws.addChangeListener(boundListener);
      if (flyout) flyout.getWorkspace().addChangeListener(boundListener);
      // Update the source block immediately after the bubble becomes visible.
      this.updateWorkspace();
      this.applyColour();
    } else {
      // Dispose of the bubble.
      this.svgDialog = null;
      this.workspace_!.dispose();
      this.workspace_ = null;
      this.rootBlock = null;
      this.bubble_?.dispose();
      this.bubble_ = null;
      this.workspaceWidth = 0;
      this.workspaceHeight = 0;
      if (this.sourceListener) {
        block.workspace.removeChangeListener(this.sourceListener);
        this.sourceListener = null;
      }
    }
    eventUtils.fire(new (eventUtils.get(eventUtils.BUBBLE_OPEN))(
        block, visible, 'mutator'));
  }

  /**
   * Fired whenever a change is made to the mutator's workspace.
   *
   * @param e Custom data for event.
   */
  private workspaceChanged(e: Abstract) {
    if (!this.shouldIgnoreMutatorEvent_(e) && !this.updateWorkspacePid) {
      this.updateWorkspacePid = setTimeout(() => {
        this.updateWorkspacePid = null;
        this.updateWorkspace();
      }, 0);
    }
  }

  /**
   * Returns whether the given event in the mutator workspace should be ignored
   * when deciding whether to update the workspace and compose the block or not.
   *
   * @param e The event.
   * @returns Whether to ignore the event or not.
   */
  shouldIgnoreMutatorEvent_(e: Abstract) {
    return e.isUiEvent || e.type === eventUtils.CREATE ||
        e.type === eventUtils.CHANGE &&
        (e as BlockChange).element === 'disabled';
  }

  /**
   * Updates the source block when the mutator's blocks are changed.
   * Bump down any block that's too high.
   */
  private updateWorkspace() {
    if (!this.workspace_!.isDragging()) {
      const blocks = this.workspace_!.getTopBlocks(false);
      const MARGIN = 20;

      for (let b = 0, block; block = blocks[b]; b++) {
        const blockXY = block.getRelativeToSurfaceXY();

        // Bump any block that's above the top back inside.
        if (blockXY.y < MARGIN) {
          block.moveBy(0, MARGIN - blockXY.y);
        }
        // Bump any block overlapping the flyout back inside.
        if (block.RTL) {
          let right = -MARGIN;
          const flyout = this.workspace_!.getFlyout();
          if (flyout) {
            right -= flyout.getWidth();
          }
          if (blockXY.x > right) {
            block.moveBy(right - blockXY.x, 0);
          }
        } else if (blockXY.x < MARGIN) {
          block.moveBy(MARGIN - blockXY.x, 0);
        }
      }
    }

    // When the mutator's workspace changes, update the source block.
    if (this.rootBlock && this.rootBlock.workspace === this.workspace_) {
      const existingGroup = eventUtils.getGroup();
      if (!existingGroup) {
        eventUtils.setGroup(true);
      }
      const block = this.getBlock();
      const oldExtraState = BlockChange.getExtraBlockState_(block);

      block.compose!(this.rootBlock);

      const newExtraState = BlockChange.getExtraBlockState_(block);
      if (oldExtraState !== newExtraState) {
        eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CHANGE))(
            block, 'mutation', null, oldExtraState, newExtraState));
        // Ensure that any bump is part of this mutation's event group.
        const mutationGroup = eventUtils.getGroup();
        setTimeout(function() {
          const oldGroup = eventUtils.getGroup();
          eventUtils.setGroup(mutationGroup);
          block.bumpNeighbours();
          eventUtils.setGroup(oldGroup);
        }, config.bumpDelay);
      }

      // Don't update the bubble until the drag has ended, to avoid moving
      // blocks under the cursor.
      if (!this.workspace_!.isDragging()) {
        setTimeout(() => this.resizeBubble(), 0);
      }
      eventUtils.setGroup(existingGroup);
    }
  }

  /** Dispose of this mutator. */
  override dispose() {
    this.getBlock().mutator = null;
    super.dispose();
  }

  /** Update the styles on all blocks in the mutator. */
  updateBlockStyle() {
    const ws = this.workspace_;

    if (ws && ws.getAllBlocks(false)) {
      const workspaceBlocks = ws.getAllBlocks(false);
      for (let i = 0, block; block = workspaceBlocks[i]; i++) {
        block.setStyle(block.getStyleName());
      }

      const flyout = ws.getFlyout();
      if (flyout) {
        const flyoutBlocks = flyout.getWorkspace().getAllBlocks(false);
        for (let i = 0, block; block = flyoutBlocks[i]; i++) {
          block.setStyle(block.getStyleName());
        }
      }
    }
  }

  /**
   * Reconnect an block to a mutated input.
   *
   * @param connectionChild Connection on child block.
   * @param block Parent block.
   * @param inputName Name of input on parent block.
   * @returns True iff a reconnection was made, false otherwise.
   */
  static reconnect(
      connectionChild: Connection, block: Block, inputName: string): boolean {
    if (!connectionChild || !connectionChild.getSourceBlock().workspace) {
      return false;  // No connection or block has been deleted.
    }
    const connectionParent = block.getInput(inputName)!.connection;
    const currentParent = connectionChild.targetBlock();
    if ((!currentParent || currentParent === block) && connectionParent &&
        connectionParent.targetConnection !== connectionChild) {
      if (connectionParent.isConnected()) {
        // There's already something connected here.  Get rid of it.
        connectionParent.disconnect();
      }
      connectionParent.connect(connectionChild);
      return true;
    }
    return false;
  }

  /**
   * Get the parent workspace of a workspace that is inside a mutator, taking
   * into account whether it is a flyout.
   *
   * @param workspace The workspace that is inside a mutator.
   * @returns The mutator's parent workspace or null.
   */
  static findParentWs(workspace: WorkspaceSvg): WorkspaceSvg|null {
    let outerWs = null;
    if (workspace && workspace.options) {
      const parent = workspace.options.parentWorkspace;
      // If we were in a flyout in a mutator, need to go up two levels to find
      // the actual parent.
      if (workspace.isFlyout) {
        if (parent && parent.options) {
          outerWs = parent.options.parentWorkspace;
        }
      } else if (parent) {
        outerWs = parent;
      }
    }
    return outerWs;
  }
}
