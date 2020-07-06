/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A toolbox category used to organize blocks in the toolbox.
 * @author aschmiedt@google.com (Abby Schmiedt)
 * @author maribethb@google.com (Maribeth Bottorff)
 */
'use strict';

goog.provide('Blockly.ToolboxCategory');

/**
 * Class for a category in a toolbox.
 * @param {!Blockly.utils.toolbox.Category} categoryDef The information needed
 *     to create a category in the toolbox.
 * @param {!Blockly.IToolbox} toolbox The parent toolbox for the category.
 */
Blockly.ToolboxCategory = function(categoryDef, toolbox) {

  /**
   * The name that will be displayed on the category.
   * @type {string}
   * @protected
   */
  this.name_ = categoryDef['name'];

  /**
   * The toolbox this category belongs to.
   * @type {!Blockly.IToolbox}
   * @protected
   */
  this.parentToolbox_ = toolbox;

  /**
   * The workspace of the parent toolbox.
   * TODO: This should not be accessing a private variable.
   * @type {!Blockly.WorkspaceSvg}
   * @protected
   */
  this.workspace_ = this.parentToolbox_.workspace_;

  /**
   * The contents of the category.
   * TODO: Figure out where we should be parsing this. Seems like it shouldn't
   * TODO: have to happen every time someone opens the flyout.
   * TODO: This would ideally be just IToolboxItem.
   * @type {Array<Blockly.utils.toolbox.Block|
   *     Blockly.utils.toolbox.Separator|
   *     Blockly.utils.toolbox.Button|
   *     Blockly.utils.toolbox.Label|
   *     Blockly.utils.toolbox.Category>}
   */
  this.contents = categoryDef['contents'];
  // TODO: Add dynamic category type
  if (categoryDef['custom']) {
    this.contents = categoryDef['custom'];
  }

  /**
   * The colour of the category.
   * @type {string}
   * @protected
   */
  this.colour_ = this.getColour_(categoryDef);

  /**
   * The html container for the category.
   * @type {HTMLDivElement}
   */
  this.HtmlDiv = null;
};

/**
 * Creates the dom for a toolbox category.
 * @return {HTMLDivElement} The div for the category.
 */
Blockly.ToolboxCategory.prototype.createDom = function() {
  var toolboxCategory = document.createElement('div');
  toolboxCategory.classList.add('blocklyToolboxCategory');

  var toolboxCategoryRow = document.createElement('div');
  toolboxCategoryRow.classList.add('blocklyTreeRow');
  toolboxCategory.appendChild(toolboxCategoryRow);

  if (this.parentToolbox_.isHorizontal()) {
    // TODO: Could we use flexbox to more easily accomplish this?
    var horizontalClass = this.parentToolbox_.isRtl() ?
        'blocklyHorizontalTreeRtl' : 'blocklyHorizontalTree';
    toolboxCategory.classList.add(horizontalClass);
  }
  var toolboxIcon = this.createIconSpan_();
  toolboxCategoryRow.appendChild(toolboxIcon);

  var toolboxLabel = this.createLabelSpan_();
  toolboxCategoryRow.appendChild(toolboxLabel);

  if (this.hasCategories()) {
    var subCategoriesContainer = this.createSubCategories_(this.contents);
    toolboxCategory.appendChild(subCategoriesContainer);
  }

  Blockly.bindEvent_(
      toolboxCategoryRow, 'mouseup', this, this.onClick_);
  this.HtmlDiv = toolboxCategory;
  return toolboxCategory;
};

/**
 * Create the dom for all sub categories.
 * @param {Blockly.utils.toolbox.Toolbox} contents The contents of the category.
 * @return {HTMLDivElement} The div holding all the subcategories.
 * @private
 */
Blockly.ToolboxCategory.prototype.createSubCategories_ = function(contents) {
  var contentsContainer = document.createElement('div');
  contentsContainer.classList.add('blocklyToolboxContents');
  for (var i = 0; i < contents.length; i++) {
    // TODO: This should check the type of toolbox item before creating.
    var child = this.contents[i];
    var newCategory = new Blockly.ToolboxCategory(child, this.parentToolbox_);
    var dom = newCategory.createDom();
    contentsContainer.appendChild(dom);
  }
  return contentsContainer;
};

/**
 * Creates the span that holds the category icon.
 * @return {HTMLSpanElement} The span that holds the category icon.
 * @protected
 */
Blockly.ToolboxCategory.prototype.createIconSpan_ = function() {
  var toolboxIcon = document.createElement('span');
  // TODO: Should get the class name from the config.
  toolboxIcon.classList.add('blocklyTreeIcon');
  return toolboxIcon;
};

/**
 * Creates the span that holds the category label.
 * @return {HTMLSpanElement} The span that holds the category label.
 * @protected
 */
Blockly.ToolboxCategory.prototype.createLabelSpan_ = function() {
  var toolboxLabel = document.createElement('span');
  toolboxLabel.textContent = this.name_;
  // TODO: Should get the class name from the config.
  toolboxLabel.classList.add('blocklyTreeLabel');
  return toolboxLabel;
};


/**
 * Add either the colour or the style for a category.
 * @param {!Blockly.utils.toolbox.Category} categoryInfo The object holding
 *    information on the category.
 * @return {string} The hex color for the category.
 * @private
 */
Blockly.ToolboxCategory.prototype.getColour_ = function(categoryInfo) {
  var styleName = categoryInfo['categorystyle'];
  var colour = categoryInfo['colour'];

  if (colour && styleName) {
    console.warn('Toolbox category "' + this.name_ +
        '" must not have both a style and a colour');
  } else if (styleName) {
    return this.getColourfromStyle_(styleName);
  } else {
    return this.parseColour_(colour);
  }
};

/**
 * Retrieves and sets the colour for the category using the style name.
 * The category colour is set from the colour style attribute.
 * @param {string} styleName Name of the style.
 * @return {string} The hex color for the category.
 * @private
 */
Blockly.ToolboxCategory.prototype.getColourfromStyle_ = function(styleName) {
  var theme = this.workspace_.getTheme();
  if (styleName && theme) {
    var style = theme.categoryStyles[styleName];
    if (style && style.colour) {
      return this.parseColour_(style.colour);
    } else {
      console.warn('Style "' + styleName +
          '" must exist and contain a colour value');
    }
  }
};

/**
 * Sets the colour on the category.
 * @param {number|string} colourValue HSV hue value (0 to 360), #RRGGBB string,
 *     or a message reference string pointing to one of those two values.
 * @return {string} The hex color for the category.
 * @private
 */
Blockly.ToolboxCategory.prototype.parseColour_ = function(colourValue) {
  // Decode the colour for any potential message references
  // (eg. `%{BKY_MATH_HUE}`).
  var colour = Blockly.utils.replaceMessageReferences(colourValue);
  if (colour == null || colour === '') {
    // No attribute. No colour.
    return '';
  } else {
    var hue = Number(colour);
    if (!isNaN(hue)) {
      return Blockly.hueToHex(hue);
    } else {
      var hex = Blockly.utils.colour.parse(colour);
      if (hex) {
        return Blockly.utils.colour.parse(colour);
      } else {
        console.warn('Toolbox category "' + this.name_ +
            '" has unrecognized colour attribute: ' + colour);
        return '';
      }
    }
  }
};

/**
 * Whether or not this category has sub categories.
 * @return {boolean} True if this category has sub categories, false otherwise.
 */
Blockly.ToolboxCategory.prototype.hasCategories = function() {
  return this.contents && this.contents.length &&
    typeof this.contents != 'string' &&
    this.contents[0].kind.toUpperCase() == 'CATEGORY';
};

/**
 * Set the current category as selected.
 * @param {boolean} isSelected True if this category is selected, false otherwise.
 */
Blockly.ToolboxCategory.prototype.setSelected = function(isSelected) {
  console.log("Setting selected for category");
  if (isSelected) {
    // TODO: This should store correct html div.
    this.HtmlDiv.children[0].style.backgroundColor = this.colour_;
  } else {
    this.HtmlDiv.children[0].style.backgroundColor = '';
  }
};

/**
 * Event listener for when the category is clicked.
 * @param {Event} e Click event to handle.
 * @protected
 */
Blockly.ToolboxCategory.prototype.onClick_ = function(e) {
  this.parentToolbox_.setSelectedItem(this);
};

/**
 * Dispose of this category.
 */
Blockly.ToolboxCategory.prototype.dispose = function() {
  // TODO: Dispose of the toolbox category.
};
