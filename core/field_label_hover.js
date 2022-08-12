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
 * @fileoverview Serialized label field.  Behaves like a normal label but is
 *     always serialized to XML.  It may only be edited programmatically.
 * @author fenichel@google.com (Rachel Fenichel)
 */
"use strict";

goog.module("Blockly.FieldLabelHover");

const fieldRegistry = goog.require("Blockly.fieldRegistry");
const dom = goog.require("Blockly.utils.dom");
const {FieldLabel} = goog.require("Blockly.FieldLabel");
const Xml = goog.require("Blockly.Xml");
/**
 * Non-editable, serializable text field. Behaves like a
 *    normal label but is serialized to XML. It may only be
 *    edited programmatically.
 * @extends {Blockly.FieldLabel}
 * @alias Blockly.FieldLabelHover
 */
class FieldLabelHover extends FieldLabel {
  /**
   * Class for a variable getter field.
   * @param {string} text The initial content of the field.
   * @param {string} opt_class Optional CSS class for the field's text.
   */
  constructor(text, opt_class) {
    super(text, opt_class);

    // Used in base field rendering, but we don't need it.
    this.arrowWidth_ = 0;

    /**
     * Editable fields usually show some sort of UI for the user to change them.
     * This field should be serialized, but only edited programmatically.
     * @type {boolean}
     * @public
     */
    this.EDITABLE = false;

    /**
     * Serializable fields are saved by the XML renderer, non-serializable fields
     * are not.  This field should be serialized, but only edited programmatically.
     * @type {boolean}
     * @public
     */
    this.SERIALIZABLE = true;
  }
  /**
   * Install this field on a block.
   */
  initView() {
    this.createTextElement_();
    if (this.sourceBlock_.isEditable()) {
      this.mouseOverWrapper_ = Blockly.browserEvents.bind(
        this.getClickTarget_(),
        "mouseover",
        this,
        this.onMouseOver_
      );
      this.mouseOutWrapper_ = Blockly.browserEvents.bind(
        this.getClickTarget_(),
        "mouseout",
        this,
        this.onMouseOut_
      );
    }
  }

  /**
   * Handle a mouse over event on a input field.
   * @param {!Event} e Mouse over event.
   * @private
   */
  onMouseOver_(e) {
    if (this.sourceBlock_.isInFlyout || !this.sourceBlock_.isShadow()) return;
    const gesture = this.sourceBlock_.workspace.getGesture(e);
    if (gesture && gesture.isDragging()) return;
    if (this.sourceBlock_.pathObject.svgPath) {
      dom.addClass(this.sourceBlock_.pathObject.svgPath, "editing");
      this.sourceBlock_.pathObject.svgPath.style.strokeDasharray = "2";
    }
  }

  /**
   * Clear hover effect on the block
   * @param {!Event} e Clear hover effect
   */
  clearHover() {
    if (this.sourceBlock_.pathObject.svgPath) {
      dom.removeClass(this.sourceBlock_.pathObject.svgPath, "editing");
      this.sourceBlock_.pathObject.svgPath.style.strokeDasharray = "";
    }
  }

  /**
   * Get the text from this field, which is the selected name.
   * @return {string} The selected name, or value.
   */
  getText() {
    return this.name_ || this.getValue();
  }

  /**
   * Set the new text on field, which is the selected name.
   * @param {string} text New text.
   */
  setText(text) {
    if (typeof text !== "string") {
      return;
    }
    this.name_ = text;
    this.render_();
  }

  /**
   * Handle a mouse out event on a input field.
   * @param {!Event} e Mouse out event.
   * @private
   */
  onMouseOut_(e) {
    if (this.sourceBlock_.isInFlyout || !this.sourceBlock_.isShadow()) return;
    const gesture = this.sourceBlock_.workspace.getGesture(e);
    if (gesture && gesture.isDragging()) return;
    this.clearHover();
  }

  /**
   * Serialize this field to XML.
   * @param {!Element} fieldElement The element to populate with info about the
   *    field's state.
   * @return {!Element} The element containing info about the field's state.
   */
  toXml(fieldElement) {
    const value = this.getValue();
    fieldElement.setAttribute("value", value);
    fieldElement.textContent = this.getText();
    return fieldElement;
  }

  /**
   * Initialize this field based on the given XML.
   * @param {!Element} fieldElement The element containing information about the
   *    field's state.
   */
  fromXml(fieldElement) {
    const value = fieldElement.getAttribute("value");
    const name = fieldElement.textContent;

    // This should never happen :)
    if (!value) {
      throw Error(
        "Serialized value is not set." + Xml.domToText(fieldElement) + "."
      );
    }

    this.name_ = name;
    this.setValue(value);
  }

  /**
   * Dispose of this field.
   * @public
   */
  dispose() {
    if (this.mouseOverWrapper_) {
      Blockly.browserEvents.unbind(this.mouseOverWrapper_);
      this.mouseOverWrapper_ = null;
    }
    if (this.mouseOutWrapper_) {
      Blockly.browserEvents.unbind(this.mouseOutWrapper_);
      this.mouseOutWrapper_ = null;
    }
    FieldLabelHover.superClass_.dispose.call(this);
    this.workspace_ = null;
  }

  /**
   * Updates text field to match the colour/style of the block.
   * @package
   */
  applyColour() {
    const renderer = this.sourceBlock_.workspace.getRenderer();
    this.sourceBlock_.pathObject.svgPath.setAttribute(
      "fill",
      this.sourceBlock_.style.colourPrimary
    );
    if (renderer.name === "geras") {
      this.sourceBlock_.pathObject.svgPathLight.setAttribute(
        "stroke",
        this.sourceBlock_.style.colourTertiary
      );
      this.sourceBlock_.pathObject.svgPathDark.setAttribute(
        "fill",
        this.sourceBlock_.style.colourTertiary
      );
      this.sourceBlock_.pathObject.svgPathLight.style.display = "inline";
    }
  }
}

fieldRegistry.register("field_label_hover", FieldLabelHover);

exports.FieldLabelHover = FieldLabelHover;
