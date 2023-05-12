/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Bubble} from './bubble.js';
import {Coordinate} from '../utils/coordinate.js';
import * as dom from '../utils/dom.js';
import {Rect} from '../utils/rect.js';
import {Size} from '../utils/size.js';
import {Svg} from '../utils/svg.js';
import * as touch from '../touch.js';
import {WorkspaceSvg} from '../workspace_svg.js';
import {browserEvents} from '../utils.js';

export class TextInputBubble extends Bubble {
  private inputRoot: SVGForeignObjectElement;
  private textArea: HTMLTextAreaElement;
  private resizeGroup: SVGGElement;
  private resizePointerUpListener: browserEvents.Data | null = null;
  private resizePointerMoveListener: browserEvents.Data | null = null;
  private textChangeListeners: (() => void)[] = [];
  private text = '';

  private readonly DEFAULT_SIZE = new Size(
    160 + Bubble.DOUBLE_BORDER,
    80 + Bubble.DOUBLE_BORDER
  );

  private readonly MIN_SIZE = new Size(
    45 + Bubble.DOUBLE_BORDER,
    20 + Bubble.DOUBLE_BORDER
  );

  constructor(
    protected readonly workspace: WorkspaceSvg,
    protected anchor: Coordinate,
    protected ownerRect?: Rect
  ) {
    super(workspace, anchor, ownerRect);
    ({inputRoot: this.inputRoot, textArea: this.textArea} = this.createEditor(
      this.contentContainer
    ));
    this.resizeGroup = this.createResizeHandle(this.svgRoot);
    this.setSize(this.DEFAULT_SIZE, true);
  }

  getText(): string {
    return this.text;
  }

  setText(text: string) {
    this.text = text;
    this.textArea.value = text;
  }

  addTextChangeListener(listener: () => void) {
    this.textChangeListeners.push(listener);
  }

  private createEditor(container: SVGGElement): {
    inputRoot: SVGForeignObjectElement;
    textArea: HTMLTextAreaElement;
  } {
    const inputRoot = dom.createSvgElement(
      Svg.FOREIGNOBJECT,
      {
        'x': Bubble.BORDER_WIDTH,
        'y': Bubble.BORDER_WIDTH,
      },
      container
    );

    const body = document.createElementNS(dom.HTML_NS, 'body');
    body.setAttribute('xmlns', dom.HTML_NS);
    body.className = 'blocklyMinimalBody';

    const textArea = document.createElementNS(
      dom.HTML_NS,
      'textarea'
    ) as HTMLTextAreaElement;
    textArea.className = 'blocklyCommentTextarea';
    textArea.setAttribute('dir', this.workspace.RTL ? 'RTL' : 'LTR');

    body.appendChild(textArea);
    inputRoot.appendChild(body);

    this.bindTextAreaEvents(textArea);
    setTimeout(() => {
      textArea.focus();
    }, 0);

    return {inputRoot, textArea};
  }

  private bindTextAreaEvents(textArea: HTMLTextAreaElement) {
    // Don't zoom with mousewheel.
    browserEvents.conditionalBind(textArea, 'wheel', this, (e: Event) => {
      e.stopPropagation();
    });

    browserEvents.conditionalBind(
      textArea,
      'focus',
      this,
      this.onStartEdit,
      true
    );
    browserEvents.conditionalBind(textArea, 'change', this, this.onTextChange);
  }

  private createResizeHandle(container: SVGGElement): SVGGElement {
    const resizeGroup = dom.createSvgElement(
      Svg.G,
      {
        'class': this.workspace.RTL ? 'blocklyResizeSW' : 'blocklyResizeSE',
      },
      container
    );
    const size = 2 * Bubble.BORDER_WIDTH;
    dom.createSvgElement(
      Svg.POLYGON,
      {'points': `0,${size} ${size},${size} ${size},0`},
      resizeGroup
    );
    dom.createSvgElement(
      Svg.LINE,
      {
        'class': 'blocklyResizeLine',
        'x1': size / 3,
        'y1': size - 1,
        'x2': size - 1,
        'y2': size / 3,
      },
      resizeGroup
    );
    dom.createSvgElement(
      Svg.LINE,
      {
        'class': 'blocklyResizeLine',
        'x1': (size * 2) / 3,
        'y1': size - 1,
        'x2': size - 1,
        'y2': (size * 2) / 3,
      },
      resizeGroup
    );

    browserEvents.conditionalBind(
      resizeGroup,
      'pointerdown',
      this,
      this.onResizeMouseDown
    );

    return resizeGroup;
  }

  setSize(size: Size, relayout = false) {
    size.width = Math.max(size.width, this.MIN_SIZE.width);
    size.height = Math.max(size.height, this.MIN_SIZE.height);

    const widthMinusBorder = size.width - Bubble.DOUBLE_BORDER;
    const heightMinusBorder = size.height - Bubble.DOUBLE_BORDER;
    this.inputRoot.setAttribute('width', `${widthMinusBorder}`);
    this.inputRoot.setAttribute('height', `${heightMinusBorder}`);
    this.textArea.style.width = `${widthMinusBorder - 4}px`;
    this.textArea.style.height = `${heightMinusBorder - 4}px`;

    if (this.workspace.RTL) {
      this.resizeGroup.setAttribute(
        'transform',
        `translate(${Bubble.DOUBLE_BORDER}, ${heightMinusBorder}) scale(-1 1)`
      );
    } else {
      this.resizeGroup.setAttribute(
        'transform',
        `translate(${widthMinusBorder}, ${heightMinusBorder})`
      );
    }

    super.setSize(size, relayout);
  }

  getSize(): Size {
    // Overriden to be public.
    return super.getSize();
  }

  private onResizeMouseDown(e: PointerEvent) {
    this.bringToFront();
    if (browserEvents.isRightButton(e)) {
      e.stopPropagation();
      return;
    }

    this.workspace.startDrag(
      e,
      new Coordinate(
        this.workspace.RTL ? -this.getSize().width : this.getSize().width,
        this.getSize().height
      )
    );

    this.resizePointerUpListener = browserEvents.conditionalBind(
      document,
      'pointerup',
      this,
      this.onResizeMouseUp
    );
    this.resizePointerMoveListener = browserEvents.conditionalBind(
      document,
      'pointermove',
      this,
      this.onResizeMouseMove
    );
    this.workspace.hideChaff();
    // This event has been handled.  No need to bubble up to the document.
    e.stopPropagation();
  }

  private onResizeMouseUp(_e: PointerEvent) {
    touch.clearTouchIdentifier();
    if (this.resizePointerUpListener) {
      browserEvents.unbind(this.resizePointerUpListener);
      this.resizePointerUpListener = null;
    }
    if (this.resizePointerMoveListener) {
      browserEvents.unbind(this.resizePointerMoveListener);
      this.resizePointerMoveListener = null;
    }
  }

  private onResizeMouseMove(e: PointerEvent) {
    const delta = this.workspace.moveDrag(e);
    this.setSize(
      new Size(this.workspace.RTL ? -delta.x : delta.x, delta.y),
      false
    );
  }

  private onStartEdit() {
    if (this.bringToFront()) {
      // Since the act of moving this node within the DOM causes a loss of
      // focus, we need to reapply the focus.
      this.textArea.focus();
    }
  }

  private onTextChange() {
    this.text = this.textArea.value;
    for (const listener of this.textChangeListeners) {
      listener();
    }
  }
}
