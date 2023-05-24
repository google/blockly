/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Mutator');

import {Abstract} from '../events/events_abstract.js';
import type {Block} from '../block.js';
import {BlockChange} from '../events/events_block_change.js';
import {BlocklyOptions} from '../blockly_options.js';
import {BlockSvg} from '../block_svg.js';
import type {Connection} from '../connection.js';
import {Coordinate} from '../utils/coordinate.js';
import * as dom from '../utils/dom.js';
import * as eventUtils from '../events/utils.js';
import {IHasBubble} from '../interfaces/i_has_bubble.js';
import {Icon} from './icon.js';
import {MiniWorkspaceBubble} from '../bubbles/mini_workspace_bubble.js';
import {MUTATOR_TYPE} from './icon_types.js';
import {Rect} from '../utils/rect.js';
import {Size} from '../utils/size.js';
import {Svg} from '../utils/svg.js';
import type {WorkspaceSvg} from '../workspace_svg.js';

export class MutatorIcon extends Icon implements IHasBubble {
  /** The type string used to identify this icon. */
  static readonly TYPE = MUTATOR_TYPE;

  /**
   * The weight this icon has relative to other icons. Icons with more positive
   * weight values are rendered farther toward the end of the block.
   */
  static readonly WEIGHT = 1;

  /** The size of this icon in workspace-scale units. */
  private readonly SIZE = 17;

  /** The distance between the root block and the workspace edges. */
  private readonly MARGIN = 16;

  /** The bubble used to show the mini workspace to the user. */
  private miniWorkspaceBubble: MiniWorkspaceBubble | null = null;

  /** The root block in the mini workspace. */
  private rootBlock: BlockSvg | null = null;

  /** The PID tracking updating the workkspace in response to user events. */
  private updateWorkspacePid: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly flyoutBlockTypes: string[],
    protected readonly sourceBlock: BlockSvg
  ) {
    super(sourceBlock);
  }

  getType() {
    return MutatorIcon.TYPE;
  }

  initView(pointerdownListener: (e: PointerEvent) => void): void {
    if (this.svgRoot) return; // Already initialized.

    super.initView(pointerdownListener);

    // Square with rounded corners.
    dom.createSvgElement(
      Svg.RECT,
      {
        'class': 'blocklyIconShape',
        'rx': '4',
        'ry': '4',
        'height': '16',
        'width': '16',
      },
      this.svgRoot
    );
    // Gear teeth.
    dom.createSvgElement(
      Svg.PATH,
      {
        'class': 'blocklyIconSymbol',
        'd':
          'm4.203,7.296 0,1.368 -0.92,0.677 -0.11,0.41 0.9,1.559 0.41,' +
          '0.11 1.043,-0.457 1.187,0.683 0.127,1.134 0.3,0.3 1.8,0 0.3,' +
          '-0.299 0.127,-1.138 1.185,-0.682 1.046,0.458 0.409,-0.11 0.9,' +
          '-1.559 -0.11,-0.41 -0.92,-0.677 0,-1.366 0.92,-0.677 0.11,' +
          '-0.41 -0.9,-1.559 -0.409,-0.109 -1.046,0.458 -1.185,-0.682 ' +
          '-0.127,-1.138 -0.3,-0.299 -1.8,0 -0.3,0.3 -0.126,1.135 -1.187,' +
          '0.682 -1.043,-0.457 -0.41,0.11 -0.899,1.559 0.108,0.409z',
      },
      this.svgRoot
    );
    // Axle hole.
    dom.createSvgElement(
      Svg.CIRCLE,
      {'class': 'blocklyIconShape', 'r': '2.7', 'cx': '8', 'cy': '8'},
      this.svgRoot
    );
  }

  dispose(): void {
    if (this.miniWorkspaceBubble) this.miniWorkspaceBubble.dispose();
  }

  getWeight(): number {
    return MutatorIcon.WEIGHT;
  }

  getSize(): Size {
    return new Size(this.SIZE, this.SIZE);
  }

  applyColour(): void {
    this.miniWorkspaceBubble?.setColour(this.sourceBlock.style.colourPrimary);
    this.miniWorkspaceBubble?.updateBlockStyles();
  }

  updateCollapsed(): void {
    super.updateCollapsed();
    if (this.bubbleIsVisible() && this.sourceBlock.isCollapsed()) {
      this.setBubbleVisible(false);
    }
  }

  onLocationChange(blockOrigin: Coordinate): void {
    super.onLocationChange(blockOrigin);
    if (this.bubbleIsVisible()) {
      this.miniWorkspaceBubble?.setAnchorLocation(this.getAnchorLocation());
    }
  }

  onClick(): void {
    this.setBubbleVisible(!this.bubbleIsVisible());
  }

  bubbleIsVisible(): boolean {
    return !!this.miniWorkspaceBubble;
  }

  setBubbleVisible(visible: boolean): void {
    if (this.bubbleIsVisible() === visible) return;

    if (visible) {
      this.miniWorkspaceBubble = new MiniWorkspaceBubble(
        this.getMiniWorkspaceConfig(),
        this.sourceBlock.workspace,
        this.getAnchorLocation(),
        this.getBubbleOwnerRect()
      );
      this.applyColour();
      this.createRootBlock();
      this.addSaveConnectionsListener();
      this.miniWorkspaceBubble?.addWorkspaceChangeListener(
        this.createMiniWorkspaceChangeListener()
      );
    } else {
      this.miniWorkspaceBubble?.dispose();
      this.miniWorkspaceBubble = null;
    }

    eventUtils.fire(
      new (eventUtils.get(eventUtils.BUBBLE_OPEN))(
        this.sourceBlock,
        visible,
        'mutator'
      )
    );
  }

  /** @returns the configuration the mini workspace should have. */
  private getMiniWorkspaceConfig() {
    const options: BlocklyOptions = {
      'disable': false,
      'media': this.sourceBlock.workspace.options.pathToMedia,
      'rtl': this.sourceBlock.RTL,
      'renderer': this.sourceBlock.workspace.options.renderer,
      'rendererOverrides':
        this.sourceBlock.workspace.options.rendererOverrides ?? undefined,
    };

    if (this.flyoutBlockTypes.length) {
      options.toolbox = {
        'kind': 'flyoutToolbox',
        'contents': this.flyoutBlockTypes.map((type) => ({
          'kind': 'block',
          'type': type,
        })),
      };
    }

    return options;
  }

  /**
   * @returns the location the bubble should be anchored to.
   *     I.E. the middle of this icon.
   */
  private getAnchorLocation(): Coordinate {
    const midIcon = this.SIZE / 2;
    return Coordinate.sum(
      this.workspaceLocation,
      new Coordinate(midIcon, midIcon)
    );
  }

  /**
   * @returns the rect the bubble should avoid overlapping.
   *     I.E. the block that owns this icon.
   */
  private getBubbleOwnerRect(): Rect {
    const bbox = this.sourceBlock.getSvgRoot().getBBox();
    return new Rect(bbox.y, bbox.y + bbox.height, bbox.x, bbox.x + bbox.width);
  }

  /** Decomposes the source block to create blocks in the mini workspace. */
  private createRootBlock() {
    this.rootBlock = this.sourceBlock.decompose!(
      this.miniWorkspaceBubble!.getWorkspace()
    )!;

    for (const child of this.rootBlock.getDescendants(false)) {
      child.queueRender();
    }

    this.rootBlock.setMovable(false);
    this.rootBlock.setDeletable(false);

    const flyoutWidth =
      this.miniWorkspaceBubble?.getWorkspace()?.getFlyout()?.getWidth() ?? 0;
    this.rootBlock.moveBy(
      this.rootBlock.RTL ? -(flyoutWidth + this.MARGIN) : this.MARGIN,
      this.MARGIN
    );
  }

  /** Adds a listen to the source block that triggers saving connections. */
  private addSaveConnectionsListener() {
    if (!this.sourceBlock.saveConnections || !this.rootBlock) return;
    const saveConnectionsListener = () => {
      if (!this.sourceBlock.saveConnections || !this.rootBlock) return;
      this.sourceBlock.saveConnections(this.rootBlock);
    };
    saveConnectionsListener();
    this.sourceBlock.workspace.addChangeListener(saveConnectionsListener);
  }

  /**
   * Creates a change listener to add to the mini workspace which recomposes
   * the block.
   */
  private createMiniWorkspaceChangeListener() {
    return (e: Abstract) => {
      if (!this.shouldIgnoreMutatorEvent(e) && !this.updateWorkspacePid) {
        this.updateWorkspacePid = setTimeout(() => {
          this.updateWorkspacePid = null;
          this.recomposeSourceBlock();
        }, 0);
      }
    };
  }

  /**
   * Returns true if the given event is not one the mutator needs to
   * care about.
   */
  private shouldIgnoreMutatorEvent(e: Abstract) {
    return (
      e.isUiEvent ||
      e.type === eventUtils.CREATE ||
      (e.type === eventUtils.CHANGE &&
        (e as BlockChange).element === 'disabled')
    );
  }

  /** Recomposes the source block based on changes to the mini workspace. */
  private recomposeSourceBlock() {
    if (!this.rootBlock) return;

    const existingGroup = eventUtils.getGroup();
    if (!existingGroup) eventUtils.setGroup(true);

    const oldExtraState = BlockChange.getExtraBlockState_(this.sourceBlock);
    this.sourceBlock.compose!(this.rootBlock);
    const newExtraState = BlockChange.getExtraBlockState_(this.sourceBlock);

    if (oldExtraState !== newExtraState) {
      eventUtils.fire(
        new (eventUtils.get(eventUtils.BLOCK_CHANGE))(
          this.sourceBlock,
          'mutation',
          null,
          oldExtraState,
          newExtraState
        )
      );
    }

    eventUtils.setGroup(existingGroup);
  }

  /** @internal */
  getWorkspace(): WorkspaceSvg | undefined {
    return this.miniWorkspaceBubble?.getWorkspace();
  }

  /**
   * Reconnects the given connection to the mutated input on the given block.
   */
  static reconnect(
    connectionChild: Connection,
    block: Block,
    inputName: string
  ): boolean {
    if (!connectionChild || !connectionChild.getSourceBlock().workspace) {
      return false; // No connection or block has been deleted.
    }
    const connectionParent = block.getInput(inputName)!.connection;
    const currentParent = connectionChild.targetBlock();
    if (
      (!currentParent || currentParent === block) &&
      connectionParent &&
      connectionParent.targetConnection !== connectionChild
    ) {
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
   * Returns the parent workspace of a workspace that is inside a mutator,
   * taking into account wither it is a flyout.
   */
  static findParentWs(workspace: WorkspaceSvg): WorkspaceSvg | null {
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
