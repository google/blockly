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
   * @type {!Blockly.WorkspaceSvg}
   * @protected
   */
  this.workspace_ = this.parentToolbox_.getWorkspace();

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
   * @protected
   */
  this.htmlDiv_ = null;

  /**
   * The html element for the category row.
   * @type {HTMLDivElement}
   * @protected
   */
  this.rowDiv_ = null;

  /**
   * The html element for the toolbox icon.
   * @type {HTMLDivElement}
   * @private
   */
  this.iconDiv_ = null;

  /**
   * A handle to use to unbind the click event for this category.
   * Data returned from Blockly.bindEvent_.
   * @type {?Blockly.EventData}
   * @private
   */
  this.clickEvent_ = null;

  /**
   * A handle to use to unbind the key down event for this category.
   * Data returned from Blockly.bindEvent_.
   * @type {?Blockly.EventData}
   * @private
   */
  this.keyDownEvent_ = null;

  /**
   * Whether or not the category should display it's children.
   * @type {boolean}
   * @protected
   */
  this.expanded_ = true;

  /**
   * The config for all the classes in the category.
   * @type {Object}
   * @protected
   */
  this.classConfig_ = {
    'container': 'blocklyToolboxCategory',
    'row': 'blocklyTreeRow',
    'icon': 'blocklyTreeIcon',
    'label': 'blocklyTreeLabel',
    'contents': 'blocklyToolboxContents',
    'selected': 'blocklyTreeSelected',
    'openIcon': ''
  };

  Blockly.utils.object.mixin(this.classConfig_, categoryDef['classConfig']);
};

/**
 * Creates the dom for a toolbox category.
 * @return {HTMLDivElement} The div for the category.
 */
Blockly.ToolboxCategory.prototype.createDom = function() {
  this.htmlDiv_ = document.createElement('div');
  this.htmlDiv_.classList.add(this.classConfig_['container']);

  this.rowDiv_ = document.createElement('div');
  this.rowDiv_.classList.add(this.classConfig_['row']);
  this.htmlDiv_.appendChild(this.rowDiv_);
  // TODO: Should this be on the htmlDiv_ or the rowDiv_?
  this.rowDiv_.tabIndex = 0;

  if (this.parentToolbox_.isHorizontal()) {
    // TODO: All these classes do is add margins. Do we want to keep this?
    var horizontalClass = this.workspace_.RTL ?
        'blocklyHorizontalTreeRtl' : 'blocklyHorizontalTree';
    this.htmlDiv_.classList.add(horizontalClass);
  }
  this.iconDiv_ = this.createIconSpan_();
  this.rowDiv_.appendChild(this.iconDiv_);

  var toolboxLabel = this.createLabelSpan_();
  this.rowDiv_.appendChild(toolboxLabel);

  if (this.hasCategories()) {
    this.subCategoriesDiv_ = this.createSubCategories_(this.contents);
    this.htmlDiv_.appendChild(this.subCategoriesDiv_);
  }

  this.addColour_(this.rowDiv_, this.colour_);

  this.setExpanded(this.expanded_);

  this.clickEvent_ = Blockly.bindEvent_(
      this.rowDiv_, 'mouseup', this, this.onClick_);

  this.keyDownEvent_ = Blockly.bindEvent_(
      this.rowDiv_, 'keydown', this, this.onKeyDown_);

  return this.htmlDiv_;
};

/**
 * Add the strip of colour to the toolbox category.
 * @param {HTMLDivElement} rowDiv The div to add the colour to.
 * @param {string} colour The category colour.
 * @private
 */
Blockly.ToolboxCategory.prototype.addColour_ = function(rowDiv, colour) {
  if (colour) {
    var border = '8px solid ' + (colour || '#ddd');
    if (this.workspace_.RTL) {
      rowDiv.style.borderRight = border;
    } else {
      rowDiv.style.borderLeft = border;
    }
  }
};

/**
 * Create the dom for all sub categories.
 * @param {Blockly.utils.toolbox.Toolbox} contents The contents of the category.
 * @return {HTMLDivElement} The div holding all the subcategories.
 * @private
 */
Blockly.ToolboxCategory.prototype.createSubCategories_ = function(contents) {
  var contentsContainer = document.createElement('div');
  contentsContainer.classList.add(this.classConfig_['contents']);
  if (this.workspace_.RTL) {
    contentsContainer.style.paddingRight = '19px';
  } else {
    contentsContainer.style.paddingLeft = '19px';
  }

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
  if (!this.parentToolbox_.isHorizontal()) {
    toolboxIcon.classList.add(this.classConfig_['icon']);
    if (!this.hasCategories()) {
      // TODO: This is a bit weird. We should only add if we have a category.
      toolboxIcon.classList.add('blocklyTreeIconNone');
    }
  }

  toolboxIcon.style.display = 'inline-block';
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
  toolboxLabel.classList.add(this.classConfig_['label']);
  return toolboxLabel;
};


/**
 * Add either the colour or the style for a category.
 * @param {!Blockly.utils.toolbox.Category} categoryDef The object holding
 *    information on the category.
 * @return {string} The hex color for the category.
 * @private
 */
Blockly.ToolboxCategory.prototype.getColour_ = function(categoryDef) {
  var styleName = categoryDef['categorystyle'];
  var colour = categoryDef['colour'];

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
  // TODO: I think we can store this at the beginning.
  // TODO: Rename to hasChildren?
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
    this.rowDiv_.style.backgroundColor = this.colour_ || '#57e';
    this.rowDiv_.classList.add(this.classConfig_['selected']);
  } else {
    this.rowDiv_.style.backgroundColor = '';
    this.rowDiv_.classList.remove(this.classConfig_['selected']);
  }
};

/**
 * Event listener for when the category is clicked.
 * @param {Event} e Click event to handle.
 * @protected
 */
Blockly.ToolboxCategory.prototype.onClick_ = function(e) {
  this.setExpanded(!this.expanded_);
  this.parentToolbox_.setSelectedItem(this);
};

/**
 * Opens or closes the current category if it has children.
 * @param {boolean} isExpanded True to expand the category, false otherwise.
 */
Blockly.ToolboxCategory.prototype.setExpanded = function(isExpanded) {
  if (!this.hasCategories()) {
    return;
  }
  this.expanded_ = isExpanded;
  if (isExpanded) {
    this.subCategoriesDiv_.style.display = 'block';
    // TODO: All these classes should come from a class config.
    this.iconDiv_.classList.add('blocklyTreeIconOpen');
    // TODO: Is there a better way than always checking the workspace direction?
    // TODO: Get a class config based on the direction?
    // TODO: How does this work for people passing in configs?
    if (this.workspace_.RTL) {
      this.iconDiv_.classList.remove('blocklyTreeIconClosedRtl');
    } else {
      this.iconDiv_.classList.remove('blocklyTreeIconClosedLtr');
    }
  } else {
    this.iconDiv_.classList.add('blocklyTreeIconClosedLtr');
    if (this.workspace_.RTL) {
      this.iconDiv_.classList.add('blocklyTreeIconClosedRtl');
    } else {
      this.iconDiv_.classList.add('blocklyTreeIconClosedLtr');
    }
    this.iconDiv_.classList.remove('blocklyTreeIconOpen');
    this.subCategoriesDiv_.style.display = 'none';
  }
  // TODO: Look into this. We were using Blockly.svgResize(this.workspace_) before.
  // TODO: Look into Blockly.svgResize(this.workspace_) it creates line btwn toolbox and flyout.
  this.parentToolbox_.position();
};

/**
 * Handles key down for the category.
 * @param {Event} e Key down event.
 * @protected
 */
Blockly.ToolboxCategory.prototype.onKeyDown_ = function(e) {
  var handled = true;
  switch (e.keyCode) {
    case Blockly.utils.KeyCodes.DOWN:
      // TODO: Don't love this.
      handled = this.parentToolbox_.selectNext();
      break;
    case Blockly.utils.KeyCodes.UP:
      handled = this.parentToolbox_.selectPrevious();
      break;
    default:
      handled = false;
      break;
  }

  if (handled) {
    e.preventDefault();
  }
};

/**
 * Dispose of this category.
 */
Blockly.ToolboxCategory.prototype.dispose = function() {
  if (this.clickEvent_) {
    Blockly.unbindEvent_(this.clickEvent_);
  }
  if (this.keyDownEvent_) {
    Blockly.unbindEvent_(this.keyDownEvent_);
  }
  Blockly.utils.dom.removeNode(this.htmlDiv_);
};
