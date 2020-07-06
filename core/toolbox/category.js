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
  this.name = categoryDef['name'];
  this.parentToolbox = toolbox;
  // TODO: Fix this.
  this.workspace_ = this.parentToolbox.workspace_;
  this.className = categoryDef['className'];
  this.contents = categoryDef['contents'];
  // TODO: Add dynamic category type
  if (categoryDef['custom']) {
    this.contents = categoryDef['custom'];
  }

  this.colour_ = this.getColour_(categoryDef);
  this.HtmlDiv = null;
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
    console.warn('Toolbox category "' + this.name +
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
      // this.hasColours_ = true;
    } else {
      var hex = Blockly.utils.colour.parse(colour);
      if (hex) {
        return Blockly.utils.colour.parse(colour);
        // this.hasColours_ = true;
      } else {
        console.warn('Toolbox category "' + this.name +
            '" has unrecognized colour attribute: ' + colour);
        return '';
      }
    }
  }
};

Blockly.ToolboxCategory.prototype.hasCategories = function() {
  return this.contents && this.contents.length &&
    typeof this.contents != 'string' &&
    this.contents[0].kind.toUpperCase() == 'CATEGORY';
};

Blockly.ToolboxCategory.prototype.show = function() {
};

Blockly.ToolboxCategory.prototype.hide = function() {
};

/**
 * Create the dom for the category. If a category has children then update the
 * indentation.
 * TODO: This can have control of adding itself to the toolbox, or the toolbox can have control. Same with the binding the click event.
 * TODO: Could instead do something where the toolbox checks if there is an onClick event, and if there is one then they can add themself.
 * @return {HTMLDivElement} The element for the category.
 */
Blockly.ToolboxCategory.prototype.createDom = function() {
  var toolboxCategory = document.createElement('div');
  toolboxCategory.classList.add('blocklyToolboxCategory');

  var toolboxCategoryRow = document.createElement('div');
  toolboxCategoryRow.classList.add('blocklyTreeRow');
  toolboxCategory.appendChild(toolboxCategoryRow);

  if (this.parentToolbox.isHorizontal()) {
    // TODO: Figure out if there is a better way to be doing this.
    var horizontalClass = this.parentToolbox.isRtl() ?
        'blocklyHorizontalTreeRtl' : 'blocklyHorizontalTree';
    toolboxCategory.classList.add(horizontalClass);
  }
  var toolboxIcon = document.createElement('span');
  toolboxIcon.classList.add('blocklyTreeIcon');
  toolboxCategoryRow.appendChild(toolboxIcon);

  var toolboxLabel = document.createElement('span');
  toolboxLabel.textContent = this.name;
  toolboxLabel.classList.add('blocklyTreeLabel');
  toolboxCategoryRow.appendChild(toolboxLabel);


  if (this.hasCategories()) {
    for (var i = 0; i < this.contents.length; i++) {
      var child = this.contents[i];
      var newCategory = new Blockly.ToolboxCategory(child, this.parentToolbox);
      var dom = newCategory.createDom();
      toolboxCategory.appendChild(dom);
    }
  }

  Blockly.bindEvent_(
      toolboxCategoryRow, 'mouseup', this, this.onClick);
  this.HtmlDiv = toolboxCategory;
  return toolboxCategory;
};



Blockly.ToolboxCategory.prototype.setSelected = function(isSelected) {
  console.log("Setting selected for category");
  if (isSelected) {
    // TODO: DO not do this. Should be storing the correct htmldiv.
    this.HtmlDiv.children[0].style.backgroundColor = this.colour_;
  } else {
    this.HtmlDiv.children[0].style.backgroundColor = '';
  }


};

Blockly.ToolboxCategory.prototype.onClick = function() {
  this.parentToolbox.setSelectedItem(this);
};

/**
 * Dispose of this category.
 */
Blockly.ToolboxCategory.prototype.dispose = function() {
  // TODO: Dispose of the toolbox category.
};
