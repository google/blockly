/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @file Serialized label field.  Behaves like a normal label but is
 *     always serialized to XML.  It may only be edited programmatically.
 * @author fenichel@google.com (Rachel Fenichel)
 */

// goog.module("Blockly.FieldLabelHover");

import * as fieldRegistry from './field_registry.js';
import * as dom from './utils/dom.js';
import {FieldLabel} from './field_label.js';
import * as utilsXml from './utils/xml.js';
import {browserEvents} from './utils.js';
import {WorkspaceSvg} from './workspace_svg';
import {BlockSvg} from './block_svg';

/**
 * Non-editable, serializable text field. Behaves like a
 * normal label but is serialized to XML. It may only be
 * edited programmatically.
 *
 * @augments {Blockly.FieldLabel}
 * @alias Blockly.FieldLabelHover
 */
export class FieldLabelHover extends FieldLabel {
  private arrowWidth_: number;
  private mouseOverWrapper_: browserEvents.Data | null;
  private mouseOutWrapper_: browserEvents.Data | null;
  name_?: string;

  /**
   * Class for a variable getter field.
   *
   * @param {string} text The initial content of the field.
   * @param {string} opt_class Optional CSS class for the field's text.
   */
  constructor(text: string, opt_class: string) {
    super(text, opt_class);

    this.name_ = undefined;

    // Used in base field rendering, but we don't need it.
    this.arrowWidth_ = 0;

    /**
     * Editable fields usually show some sort of UI for the user to change them.
     * This field should be serialized, but only edited programmatically.
     *
     * @type {boolean}
     * @public
     */
    this.EDITABLE = false;

    /**
     * Serializable fields are saved by the XML renderer, non-serializable fields
     * are not.  This field should be serialized, but only edited programmatically.
     *
     * @type {boolean}
     * @public
     */
    this.SERIALIZABLE = true;

    this.mouseOverWrapper_ = null;
    this.mouseOutWrapper_ = null;
  }

  /**
   * Install this field on a block.
   */
  initView() {
    this.createTextElement_();
    if (this.sourceBlock_?.isEditable()) {
      this.mouseOverWrapper_ = browserEvents.bind(
        this.getClickTarget_() as EventTarget,
        'mouseover',
        this,
        this.onMouseOver_,
      );
      this.mouseOutWrapper_ = browserEvents.bind(
        this.getClickTarget_() as EventTarget,
        'mouseout',
        this,
        this.onMouseOut_,
      );
    }
  }

  /**
   * Handle a mouse over event on a input field.
   *
   * @param {!Event} e Mouse over event.
   * @private
   */
  onMouseOver_(e: Event) {
    if (!this.sourceBlock_) return;
    if (this.sourceBlock_?.isInFlyout || !this.sourceBlock_?.isShadow()) return;

    const gesture = (this.sourceBlock_.workspace as WorkspaceSvg).getGesture(
      e as PointerEvent,
    );
    if (gesture && gesture.isDragging()) return;
    // @ts-expect-error:next-line
    if (this.sourceBlock_?.pathObject.svgPath) {
      // @ts-expect-error:next-line
      dom.addClass(this.sourceBlock_?.pathObject.svgPath, 'editing');
      // @ts-expect-error:next-line
      this.sourceBlock_.pathObject.svgPath.style.strokeDasharray = '2';
    }
  }

  /**
   * Clear hover effect on the block
   *
   * @param {!Event} e Clear hover effect
   */
  clearHover() {
    if ((this.sourceBlock_ as BlockSvg).pathObject.svgPath) {
      dom.removeClass(
        (this.sourceBlock_ as BlockSvg).pathObject.svgPath,
        'editing',
      );
      (this.sourceBlock_ as BlockSvg).pathObject.svgPath.style.strokeDasharray =
        '';
    }
  }

  /**
   * Get the text from this field, which is the selected name.
   *
   * @returns {string} The selected name, or value.
   */
  getText(): string {
    return this.name_ || this.getValue() || ' ';
  }

  /**
   * Set the new text on field, which is the selected name.
   *
   * @param {string} text New text.
   */
  setText(text: Text) {
    if (typeof text !== 'string') {
      return;
    }
    this.name_ = text;
    this.render_();
  }

  /**
   * Handle a mouse out event on a input field.
   *
   * @param {!Event} e Mouse out event.
   * @private
   */
  onMouseOut_(e: Event) {
    if (this.sourceBlock_?.isInFlyout || !this.sourceBlock_?.isShadow()) return;
    const gesture = (this.sourceBlock_ as BlockSvg).workspace.getGesture(
      e as PointerEvent,
    );
    if (gesture && gesture.isDragging()) return;
    this.clearHover();
  }

  /**
   * Serialize this field to XML.
   *
   * @param {!Element} fieldElement The element to populate with info about the
   *    field's state.
   * @returns {!Element} The element containing info about the field's state.
   */
  toXml(fieldElement: Element) {
    const value = this.getValue() || '';
    fieldElement.setAttribute('value', value);
    fieldElement.textContent = this.getText();
    return fieldElement;
  }

  /**
   * Initialize this field based on the given XML.
   *
   * @param {!Element} fieldElement The element containing information about the
   *    field's state.
   */
  fromXml(fieldElement: Element) {
    const value = fieldElement.getAttribute('value');
    const name = fieldElement.textContent || undefined;

    // This should never happen :)
    if (!value) {
      throw Error(
        'Serialized value is not set.' + utilsXml.domToText(fieldElement) + '.',
      );
    }

    this.name_ = name;
    this.doValueUpdate_(value);
  }

  /**
   * Dispose of this field.
   *
   * @public
   */
  dispose() {
    if (this.mouseOverWrapper_) {
      browserEvents.unbind(this.mouseOverWrapper_);
      this.mouseOverWrapper_ = null;
    }
    if (this.mouseOutWrapper_) {
      browserEvents.unbind(this.mouseOutWrapper_);
      this.mouseOutWrapper_ = null;
    }
    super.dispose();
  }

  /**
   * Updates text field to match the colour/style of the block.
   *
   * @package
   */
  applyColour() {
    if (!this.sourceBlock_) return;
    const renderer = (
      this.sourceBlock_.workspace as WorkspaceSvg
    ).getRenderer();

    (this.sourceBlock_ as BlockSvg).pathObject.svgPath.setAttribute(
      'fill',
      // @ts-expect-error:next-line
      this.sourceBlock_?.style.colourPrimary,
    );
    if (renderer.name === 'geras') {
      // @ts-expect-error:next-line
      this.sourceBlock_.pathObject.svgPathLight.setAttribute(
        'stroke',
        // @ts-expect-error:next-line
        this.sourceBlock_.style.colourTertiary,
      );
      // @ts-expect-error:next-line
      this.sourceBlock_.pathObject.svgPathDark.setAttribute(
        'fill',
        // @ts-expect-error:next-line
        this.sourceBlock_.style.colourTertiary,
      );
      // @ts-expect-error:next-line
      this.sourceBlock_.pathObject.svgPathLight.style.display = 'inline';
    }
  }
}

fieldRegistry.register('field_label_hover', FieldLabelHover);
