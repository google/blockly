/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.Comment

import type {Block} from '../block.js';
import type {BlockSvg} from '../block_svg.js';
import {IconType} from './icon_types.js';
import {Coordinate} from '../utils.js';
import * as dom from '../utils/dom.js';
import * as eventUtils from '../events/utils.js';
import {Icon} from './icon.js';
import type {IHasBubble} from '../interfaces/i_has_bubble.js';
import type {ISerializable} from '../interfaces/i_serializable.js';
import {Rect} from '../utils/rect.js';
import * as registry from './registry.js';
import {Size} from '../utils/size.js';
import {Svg} from '../utils/svg.js';
import {TextBubble} from '../bubbles/text_bubble.js';
import {TextInputBubble} from '../bubbles/textinput_bubble.js';
import type {WorkspaceSvg} from '../workspace_svg.js';

/** The size of the comment icon in workspace-scale units. */
const SIZE = 17;

/** The default width in workspace-scale units of the text input bubble. */
const DEFAULT_BUBBLE_WIDTH = 160;

/** The default height in workspace-scale units of the text input bubble. */
const DEFAULT_BUBBLE_HEIGHT = 80;

/**
 * An icon which allows the user to add comment text to a block.
 */
export class CommentIcon extends Icon implements IHasBubble, ISerializable {
  /** The type string used to identify this icon. */
  static readonly TYPE = IconType.COMMENT;

  /**
   * The weight this icon has relative to other icons. Icons with more positive
   * weight values are rendered farther toward the end of the block.
   */
  static readonly WEIGHT = 3;

  /** The bubble used to show editable text to the user. */
  private textInputBubble: TextInputBubble | null = null;

  /** The bubble used to show non-editable text to the user. */
  private textBubble: TextBubble | null = null;

  /** The text of this comment. */
  private text = '';

  /** The size of this comment (which is applied to the editable bubble). */
  private bubbleSize = new Size(DEFAULT_BUBBLE_WIDTH, DEFAULT_BUBBLE_HEIGHT);

  /**
   * The visibility of the bubble for this comment.
   *
   * This is used to track what the visibile state /should/ be, not necessarily
   * what it currently /is/. E.g. sometimes this will be true, but the block
   * hasn't been rendered yet, so the bubble will not currently be visible.
   */
  private bubbleVisiblity = false;

  constructor(protected readonly sourceBlock: Block) {
    super(sourceBlock);
  }

  override getType(): IconType<CommentIcon> {
    return CommentIcon.TYPE;
  }

  override initView(pointerdownListener: (e: PointerEvent) => void): void {
    if (this.svgRoot) return; // Already initialized.

    super.initView(pointerdownListener);

    // Circle.
    dom.createSvgElement(
      Svg.CIRCLE,
      {'class': 'blocklyIconShape', 'r': '8', 'cx': '8', 'cy': '8'},
      this.svgRoot,
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
      this.svgRoot,
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
      this.svgRoot,
    );
  }

  override dispose() {
    super.dispose();
    this.textInputBubble?.dispose();
    this.textBubble?.dispose();
  }

  override getWeight(): number {
    return CommentIcon.WEIGHT;
  }

  override getSize(): Size {
    return new Size(SIZE, SIZE);
  }

  override applyColour(): void {
    super.applyColour();
    const colour = (this.sourceBlock as BlockSvg).style.colourPrimary;
    this.textInputBubble?.setColour(colour);
    this.textBubble?.setColour(colour);
  }

  /**
   * Updates the state of the bubble (editable / noneditable) to reflect the
   * state of the bubble if the bubble is currently shown.
   */
  override updateEditable(): void {
    super.updateEditable();
    if (this.bubbleIsVisible()) {
      // Close and reopen the bubble to display the correct UI.
      this.setBubbleVisible(false);
      this.setBubbleVisible(true);
    }
  }

  override onLocationChange(blockOrigin: Coordinate): void {
    super.onLocationChange(blockOrigin);
    const anchorLocation = this.getAnchorLocation();
    this.textInputBubble?.setAnchorLocation(anchorLocation);
    this.textBubble?.setAnchorLocation(anchorLocation);
  }

  /** Sets the text of this comment. Updates any bubbles if they are visible. */
  setText(text: string) {
    this.text = text;
    this.textInputBubble?.setText(this.text);
    this.textBubble?.setText(this.text);
  }

  /** Returns the text of this comment. */
  getText(): string {
    return this.text;
  }

  /**
   * Sets the size of the editable bubble for this comment. Resizes the
   * bubble if it is visible.
   */
  setBubbleSize(size: Size) {
    this.bubbleSize = size;
    this.textInputBubble?.setSize(this.bubbleSize, true);
  }

  /** @returns the size of the editable bubble for this comment. */
  getBubbleSize(): Size {
    return this.bubbleSize;
  }

  /**
   * @returns the state of the comment as a JSON serializable value if the
   * comment has text. Otherwise returns null.
   */
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

  /** Applies the given state to this comment. */
  loadState(state: CommentState) {
    this.text = state['text'] ?? '';
    this.bubbleSize = new Size(
      state['width'] ?? DEFAULT_BUBBLE_WIDTH,
      state['height'] ?? DEFAULT_BUBBLE_HEIGHT,
    );
    this.bubbleVisiblity = state['pinned'] ?? false;
    // Give the block a chance to be positioned and rendered before showing.
    setTimeout(() => this.setBubbleVisible(this.bubbleVisiblity), 1);
  }

  override onClick(): void {
    super.onClick();
    this.setBubbleVisible(!this.bubbleIsVisible());
  }

  /**
   * Updates the text of this comment in response to changes in the text of
   * the input bubble.
   */
  onTextChange(): void {
    if (this.textInputBubble) {
      this.text = this.textInputBubble.getText();
    }
  }

  /**
   * Updates the size of this icon in response to changes in the size of the
   * input bubble.
   */
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
        'comment',
      ),
    );
  }

  /**
   * Shows the editable text bubble for this comment, and adds change listeners
   * to update the state of this icon in response to changes in the bubble.
   */
  private showEditableBubble() {
    this.textInputBubble = new TextInputBubble(
      this.sourceBlock.workspace as WorkspaceSvg,
      this.getAnchorLocation(),
      this.getBubbleOwnerRect(),
    );
    this.textInputBubble.setText(this.getText());
    this.textInputBubble.setSize(this.bubbleSize, true);
    this.textInputBubble.addTextChangeListener(() => this.onTextChange());
    this.textInputBubble.addSizeChangeListener(() => this.onSizeChange());
  }

  /** Shows the non editable text bubble for this comment. */
  private showNonEditableBubble() {
    this.textBubble = new TextBubble(
      this.getText(),
      this.sourceBlock.workspace as WorkspaceSvg,
      this.getAnchorLocation(),
      this.getBubbleOwnerRect(),
    );
  }

  /** Hides any open bubbles owned by this comment. */
  private hideBubble() {
    this.textInputBubble?.dispose();
    this.textInputBubble = null;
    this.textBubble?.dispose();
    this.textBubble = null;
  }

  /**
   * @returns the location the bubble should be anchored to.
   *     I.E. the middle of this icon.
   */
  private getAnchorLocation(): Coordinate {
    const midIcon = SIZE / 2;
    return Coordinate.sum(
      this.workspaceLocation,
      new Coordinate(midIcon, midIcon),
    );
  }

  /**
   * @returns the rect the bubble should avoid overlapping.
   *     I.E. the block that owns this icon.
   */
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
