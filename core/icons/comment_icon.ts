/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Block} from '../block.js';
import {BlockSvg} from '../block_svg.js';
import {COMMENT_TYPE} from './icon_types.js';
import {Coordinate} from '../utils.js';
import * as dom from '../utils/dom.js';
import * as eventUtils from '../events/utils.js';
import {Icon} from './icon.js';
import {IHasBubble} from '../interfaces/i_has_bubble.js';
import {ISerializable} from '../interfaces/i_serializable.js';
import {Rect} from '../utils/rect.js';
import * as registry from './registry.js';
import {Size} from '../utils/size.js';
import {Svg} from '../utils/svg.js';
import {TextBubble} from '../bubbles/text_bubble.js';
import {TextInputBubble} from '../bubbles/textinput_bubble.js';
import {WorkspaceSvg} from '../workspace_svg.js';

export class CommentIcon extends Icon implements IHasBubble, ISerializable {
  static readonly TYPE = COMMENT_TYPE;

  static readonly WEIGHT = 3;

  private readonly SIZE = 17;

  private readonly DEFAULT_BUBBLE_WIDTH = 160;

  private readonly DEFAULT_BUBBLE_HEIGHT = 80;

  private textInputBubble: TextInputBubble | null = null;

  private textBubble: TextBubble | null = null;

  private text = '';

  private bubbleSize = new Size(
    this.DEFAULT_BUBBLE_WIDTH,
    this.DEFAULT_BUBBLE_HEIGHT
  );

  private bubbleVisiblity = false;

  constructor(protected readonly sourceBlock: Block) {
    super(sourceBlock);
  }

  getType(): string {
    return CommentIcon.TYPE;
  }

  initView(pointerdownListener: (e: PointerEvent) => void): void {
    if (this.svgRoot) return; // Already initialized.

    super.initView(pointerdownListener);
    // Circle.
    dom.createSvgElement(
      Svg.CIRCLE,
      {'class': 'blocklyIconShape', 'r': '8', 'cx': '8', 'cy': '8'},
      this.svgRoot
    );
    // Can't use a real '?' text character since different browsers and
    // operating systems render it differently. Body of question mark.
    dom.createSvgElement(
      Svg.PATH,
      {
        'class': 'blocklyIconSymbol',
        'd':
          'm6.8,10h2c0.003,-0.617 0.271,-0.962 0.633,-1.266 2.875,-2.405' +
          '0.607,-5.534 -3.765,-3.874v1.7c3.12,-1.657 3.698,0.118 2.336,1.25' +
          '-1.201,0.998 -1.201,1.528 -1.204,2.19z',
      },
      this.svgRoot
    );
    // Dot of question mark.
    dom.createSvgElement(
      Svg.RECT,
      {
        'class': 'blocklyIconSymbol',
        'x': '6.8',
        'y': '10.78',
        'height': '2',
        'width': '2',
      },
      this.svgRoot
    );
  }

  dispose() {
    super.dispose();
    this.textInputBubble?.dispose();
    this.textBubble?.dispose();
  }

  getWeight(): number {
    return CommentIcon.WEIGHT;
  }

  getSize(): Size {
    return new Size(this.SIZE, this.SIZE);
  }

  applyColour(): void {
    super.applyColour();
    const colour = (this.sourceBlock as BlockSvg).style.colourPrimary;
    this.textInputBubble?.setColour(colour);
    this.textBubble?.setColour(colour);
  }

  updateEditable(): void {
    if (this.bubbleIsVisible()) {
      // Close and reopen the bubble to display the correct UI.
      this.setBubbleVisible(false);
      this.setBubbleVisible(true);
    }
  }

  onLocationChange(blockOrigin: Coordinate): void {
    super.onLocationChange(blockOrigin);
    const anchorLocation = this.getAnchorLocation();
    this.textInputBubble?.setAnchorLocation(anchorLocation);
    this.textBubble?.setAnchorLocation(anchorLocation);
  }

  setText(text: string) {
    this.text = text;
    this.textInputBubble?.setText(this.text);
    this.textBubble?.setText(this.text);
  }

  getText(): string {
    return this.text;
  }

  setBubbleSize(size: Size) {
    this.bubbleSize = size;
    this.textInputBubble?.setSize(this.bubbleSize, true);
  }

  getBubbleSize(): Size {
    return this.bubbleSize;
  }

  saveState(): CommentState | null {
    if (this.text) {
      return {
        'text': this.text,
        'pinned': this.bubbleIsVisible(),
        'height': this.bubbleSize.height,
        'width': this.bubbleSize.width,
      };
    }
    return null;
  }

  loadState(state: CommentState) {
    this.text = state['text'] ?? '';
    this.bubbleSize = new Size(
      state['width'] ?? this.DEFAULT_BUBBLE_WIDTH,
      state['height'] ?? this.DEFAULT_BUBBLE_HEIGHT
    );
    this.bubbleVisiblity = state['pinned'] ?? false;
    // Give the block a chance to be positioned and rendered before showing.
    setTimeout(() => this.setBubbleVisible(this.bubbleVisiblity), 1);
  }

  onClick(): void {
    this.setBubbleVisible(!this.bubbleIsVisible());
  }

  onTextChange(): void {
    if (this.textInputBubble) {
      this.text = this.textInputBubble.getText();
    }
  }

  onSizeChange(): void {
    if (this.textInputBubble) {
      this.bubbleSize = this.textInputBubble.getSize();
    }
  }

  bubbleIsVisible(): boolean {
    return this.bubbleVisiblity;
  }

  setBubbleVisible(visible: boolean): void {
    if (visible && (this.textBubble || this.textInputBubble)) return;
    if (!visible && !(this.textBubble || this.textInputBubble)) return;

    this.bubbleVisiblity = visible;

    if (!this.sourceBlock.rendered || this.sourceBlock.isInFlyout) return;

    if (visible) {
      if (this.sourceBlock.isEditable()) {
        this.showEditableBubble();
      } else {
        this.showNonEditableBubble();
      }
      this.applyColour();
    } else {
      this.hideBubble();
    }

    eventUtils.fire(
      new (eventUtils.get(eventUtils.BUBBLE_OPEN))(
        this.sourceBlock,
        visible,
        'comment'
      )
    );
  }

  private showEditableBubble() {
    this.textInputBubble = new TextInputBubble(
      this.sourceBlock.workspace as WorkspaceSvg,
      this.getAnchorLocation(),
      this.getBubbleOwnerRect()
    );
    this.textInputBubble.setText(this.getText());
    this.textInputBubble.setSize(this.bubbleSize, true);
    this.textInputBubble.addTextChangeListener(() => this.onTextChange());
    this.textInputBubble.addSizeChangeListener(() => this.onSizeChange());
  }

  private showNonEditableBubble() {
    this.textBubble = new TextBubble(
      this.getText(),
      this.sourceBlock.workspace as WorkspaceSvg,
      this.getAnchorLocation(),
      this.getBubbleOwnerRect()
    );
  }

  private hideBubble() {
    this.textInputBubble?.dispose();
    this.textInputBubble = null;
    this.textBubble?.dispose();
    this.textBubble = null;
  }

  private getAnchorLocation(): Coordinate {
    const midIcon = this.SIZE / 2;
    return Coordinate.sum(
      this.workspaceLocation,
      new Coordinate(midIcon, midIcon)
    );
  }

  private getBubbleOwnerRect(): Rect {
    const bbox = (this.sourceBlock as BlockSvg).getSvgRoot().getBBox();
    return new Rect(bbox.y, bbox.y + bbox.height, bbox.x, bbox.x + bbox.width);
  }
}

export interface CommentState {
  text?: string;
  pinned?: boolean;
  height?: number;
  width?: number;
}

registry.register(CommentIcon.TYPE, CommentIcon);
