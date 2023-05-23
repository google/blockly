/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Mutator');

import {Abstract} from '../events/events_abstract.js';
import {BlockChange} from '../events/events_block_change.js';
import {BlocklyOptions} from '../blockly_options.js';
import {BlockSvg} from '../block_svg.js';
import {Coordinate} from '../utils/coordinate.js';
import * as dom from '../utils/dom.js';
import * as eventUtils from '../events/utils.js';
import {IHasBubble} from '../interfaces/i_has_bubble.js';
import {Icon} from './icon.js';
import {MiniWorkspaceBubble} from '../bubbles/mini_workspace_bubble.js';
import {Rect} from '../utils/rect.js';
import {Size} from '../utils/size.js';
import {Svg} from '../utils/svg.js';

export class MutatorIcon extends Icon implements IHasBubble {
  static readonly TYPE = 'mutator';

  static readonly WEIGHT = 1;

  static readonly SIZE = 17;

  private readonly MARGIN = 16;

  private miniWorkspaceBubble: MiniWorkspaceBubble | null = null;

  private rootBlock: BlockSvg | null = null;

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
    return new Size(MutatorIcon.SIZE, MutatorIcon.SIZE);
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

  private getAnchorLocation(): Coordinate {
    const midIcon = MutatorIcon.SIZE / 2;
    return Coordinate.sum(
      this.workspaceLocation,
      new Coordinate(midIcon, midIcon)
    );
  }

  private getBubbleOwnerRect(): Rect {
    const bbox = this.sourceBlock.getSvgRoot().getBBox();
    return new Rect(bbox.y, bbox.y + bbox.height, bbox.x, bbox.x + bbox.width);
  }

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

  private addSaveConnectionsListener() {
    if (!this.sourceBlock.saveConnections || !this.rootBlock) return;
    const saveConnectionsListener = () => {
      if (!this.sourceBlock.saveConnections || !this.rootBlock) return;
      this.sourceBlock.saveConnections(this.rootBlock);
    };
    saveConnectionsListener();
    this.sourceBlock.workspace.addChangeListener(saveConnectionsListener);
  }

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

  private shouldIgnoreMutatorEvent(e: Abstract) {
    return (
      e.isUiEvent ||
      e.type === eventUtils.CREATE ||
      (e.type === eventUtils.CHANGE &&
        (e as BlockChange).element === 'disabled')
    );
  }

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
}
