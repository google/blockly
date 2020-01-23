/**
 * @license
 * Copyright 2011 Google LLC
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
 * @fileoverview Toolbox from whence to create blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Toolbox');

goog.require('Blockly.Css');
goog.require('Blockly.Events');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.navigation');
goog.require('Blockly.Touch');
goog.require('Blockly.tree.TreeControl');
goog.require('Blockly.tree.TreeNode');
goog.require('Blockly.utils');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.colour');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Rect');


/**
 * Class for a Toolbox.
 * Creates the toolbox's DOM.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace in which to create new
 *     blocks.
 * @constructor
 */
Blockly.Toolbox = function(workspace) {
  /**
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * Is RTL vs LTR.
   * @type {boolean}
   */
  this.RTL = workspace.options.RTL;

  /**
   * Whether the toolbox should be laid out horizontally.
   * @type {boolean}
   * @private
   */
  this.horizontalLayout_ = workspace.options.horizontalLayout;

  /**
   * Position of the toolbox and flyout relative to the workspace.
   * @type {number}
   */
  this.toolboxPosition = workspace.options.toolboxPosition;

  /**
   * Configuration constants for Closure's tree UI.
   * @type {!Object.<string,*>}
   * @private
   */
  this.config_ = {
    indentWidth: 19,
    cssRoot: 'blocklyTreeRoot',
    cssHideRoot: 'blocklyHidden',
    cssTreeRow: 'blocklyTreeRow',
    cssItemLabel: 'blocklyTreeLabel',
    cssTreeIcon: 'blocklyTreeIcon',
    cssExpandedFolderIcon: 'blocklyTreeIconOpen',
    cssFileIcon: 'blocklyTreeIconNone',
    cssSelectedRow: 'blocklyTreeSelected'
  };


  /**
   * Configuration constants for tree separator.
   * @type {!Object.<string,*>}
   * @private
   */
  this.treeSeparatorConfig_ = {
    cssTreeRow: 'blocklyTreeSeparator'
  };

  if (this.horizontalLayout_) {
    this.config_['cssTreeRow'] =
        this.config_['cssTreeRow'] +
        (workspace.RTL ?
        ' blocklyHorizontalTreeRtl' : ' blocklyHorizontalTree');

    this.treeSeparatorConfig_['cssTreeRow'] =
        'blocklyTreeSeparatorHorizontal ' +
        (workspace.RTL ?
        'blocklyHorizontalTreeRtl' : 'blocklyHorizontalTree');
    this.config_['cssTreeIcon'] = '';
  }

  /**
   * The toolbox flyout.
   * @type {Blockly.Flyout}
   * @private
   */
  this.flyout_ = null;
};

/**
 * Width of the toolbox, which changes only in vertical layout.
 * @type {number}
 */
Blockly.Toolbox.prototype.width = 0;

/**
 * Height of the toolbox, which changes only in horizontal layout.
 * @type {number}
 */
Blockly.Toolbox.prototype.height = 0;

/**
 * The SVG group currently selected.
 * @type {SVGGElement}
 * @private
 */
Blockly.Toolbox.prototype.selectedOption_ = null;

/**
 * The tree node most recently selected.
 * @type {Blockly.tree.BaseNode}
 * @private
 */
Blockly.Toolbox.prototype.lastCategory_ = null;

/**
 * Initializes the toolbox.
 * @throws {Error} If missing a require for both `Blockly.HorizontalFlyout` and
 *     `Blockly.VerticalFlyout`.
 */
Blockly.Toolbox.prototype.init = function() {
  var workspace = this.workspace_;
  var svg = this.workspace_.getParentSvg();

  /**
   * HTML container for the Toolbox menu.
   * @type {Element}
   */
  this.HtmlDiv = document.createElement('div');
  this.HtmlDiv.className = 'blocklyToolboxDiv blocklyNonSelectable';
  this.HtmlDiv.setAttribute('dir', workspace.RTL ? 'RTL' : 'LTR');
  svg.parentNode.insertBefore(this.HtmlDiv, svg);
  var themeManager = workspace.getThemeManager();
  themeManager.subscribe(this.HtmlDiv, 'toolboxBackgroundColour',
      'background-color');
  themeManager.subscribe(this.HtmlDiv, 'toolboxForegroundColour', 'color');

  // Clicking on toolbox closes popups.
  Blockly.bindEventWithChecks_(this.HtmlDiv, 'mousedown', this,
      function(e) {
        if (Blockly.utils.isRightButton(e) || e.target == this.HtmlDiv) {
          // Close flyout.
          Blockly.hideChaff(false);
        } else {
          // Just close popups.
          Blockly.hideChaff(true);
        }
        Blockly.Touch.clearTouchIdentifier();  // Don't block future drags.
      }, /* opt_noCaptureIdentifier */ false, /* opt_noPreventDefault */ true);
  var workspaceOptions = new Blockly.Options(
      /** @type {!Blockly.BlocklyOptions} */
      ({
        'parentWorkspace': workspace,
        'rtl': workspace.RTL,
        'oneBasedIndex': workspace.options.oneBasedIndex,
        'horizontalLayout': workspace.horizontalLayout,
        'renderer': workspace.options.renderer
      }));
  workspaceOptions.toolboxPosition = workspace.options.toolboxPosition;
  
  if (workspace.horizontalLayout) {
    if (!Blockly.HorizontalFlyout) {
      throw Error('Missing require for Blockly.HorizontalFlyout');
    }
    this.flyout_ = new Blockly.HorizontalFlyout(workspaceOptions);
  } else {
    if (!Blockly.VerticalFlyout) {
      throw Error('Missing require for Blockly.VerticalFlyout');
    }
    this.flyout_ = new Blockly.VerticalFlyout(workspaceOptions);
  }
  if (!this.flyout_) {
    throw Error('One of Blockly.VerticalFlyout or Blockly.Horizontal must be' +
        'required.');
  }
  
  // Insert the flyout after the workspace.
  Blockly.utils.dom.insertAfter(this.flyout_.createDom('svg'), svg);
  this.flyout_.init(workspace);

  this.config_['cleardotPath'] = workspace.options.pathToMedia + '1x1.gif';
  this.config_['cssCollapsedFolderIcon'] =
      'blocklyTreeIconClosed' + (workspace.RTL ? 'Rtl' : 'Ltr');
  this.renderTree(workspace.options.languageTree);
};

/**
 * Fill the toolbox with categories and blocks.
 * @param {Node} languageTree DOM tree of blocks.
 * @package
 */
Blockly.Toolbox.prototype.renderTree = function(languageTree) {
  if (this.tree_) {
    this.tree_.dispose();  // Delete any existing content.
    this.lastCategory_ = null;
  }
  var tree = new Blockly.tree.TreeControl(this,
      /** @type {!Blockly.tree.BaseNode.Config} */ (this.config_));
  this.tree_ = tree;
  tree.setSelectedItem(null);
  tree.onBeforeSelected(this.handleBeforeTreeSelected_);
  tree.onAfterSelected(this.handleAfterTreeSelected_);
  var openNode = null;
  if (languageTree) {
    this.tree_.blocks = [];
    this.hasColours_ = false;
    openNode = this.syncTrees_(
        languageTree, this.tree_, this.workspace_.options.pathToMedia);

    if (this.tree_.blocks.length) {
      throw Error('Toolbox cannot have both blocks and categories ' +
          'in the root level.');
    }
    // Fire a resize event since the toolbox may have changed width and height.
    this.workspace_.resizeContents();
  }
  tree.render(this.HtmlDiv);
  if (openNode) {
    tree.setSelectedItem(openNode);
  }
  this.addColour_();
  this.position();

  // Trees have an implicit orientation of vertical, so we only need to set this
  // when the toolbox is in horizontal mode.
  if (this.horizontalLayout_) {
    Blockly.utils.aria.setState(
        /** @type {!Element} */ (this.tree_.getElement()),
        Blockly.utils.aria.State.ORIENTATION, 'horizontal');
  }
};

/**
 * Handle the before tree item selected action.
 * @param {Blockly.tree.BaseNode} node The newly selected node.
 * @return {boolean} Whether or not to cancel selecting the node.
 * @private
 */
Blockly.Toolbox.prototype.handleBeforeTreeSelected_ = function(node) {
  if (node == this.tree_) {
    return false;
  }
  if (this.lastCategory_) {
    this.lastCategory_.getRowElement().style.backgroundColor = '';
  }
  if (node) {
    var hexColour = node.hexColour || '#57e';
    node.getRowElement().style.backgroundColor = hexColour;
    // Add colours to child nodes which may have been collapsed and thus
    // not rendered.
    this.addColour_(node);
  }
  return true;
};

/**
 * Handle the after tree item selected action.
 * @param {Blockly.tree.BaseNode} oldNode The previously selected node.
 * @param {Blockly.tree.BaseNode} newNode The newly selected node.
 * @private
 */
Blockly.Toolbox.prototype.handleAfterTreeSelected_ = function(
    oldNode, newNode) {
  if (newNode && newNode.blocks && newNode.blocks.length) {
    this.flyout_.show(newNode.blocks);
    // Scroll the flyout to the top if the category has changed.
    if (this.lastCategory_ != newNode) {
      this.flyout_.scrollToStart();
    }
    if (this.workspace_.keyboardAccessibilityMode) {
      Blockly.navigation.setState(Blockly.navigation.STATE_TOOLBOX);
    }
  } else {
    // Hide the flyout.
    this.flyout_.hide();
    if (this.workspace_.keyboardAccessibilityMode &&
        !(newNode instanceof Blockly.Toolbox.TreeSeparator)) {
      Blockly.navigation.setState(Blockly.navigation.STATE_WS);
    }
  }
  if (oldNode != newNode && oldNode != this) {
    var event = new Blockly.Events.Ui(null, 'category',
        oldNode && oldNode.getText(), newNode && newNode.getText());
    event.workspaceId = this.workspace_.id;
    Blockly.Events.fire(event);
  }
  if (newNode) {
    this.lastCategory_ = newNode;
  }
};

/**
 * Handle a node sized changed event.
 * @private
 */
Blockly.Toolbox.prototype.handleNodeSizeChanged_ = function() {
  // Even though the div hasn't changed size, the visible workspace
  // surface of the workspace has, so we may need to reposition everything.
  Blockly.svgResize(this.workspace_);
};

/**
 * Handles the given Blockly action on a toolbox.
 * This is only triggered when keyboard accessibility mode is enabled.
 * @param {!Blockly.Action} action The action to be handled.
 * @return {boolean} True if the field handled the action, false otherwise.
 * @package
 */
Blockly.Toolbox.prototype.onBlocklyAction = function(action) {
  var selected = this.tree_.getSelectedItem();
  if (!selected) {
    return false;
  }
  switch (action.name) {
    case Blockly.navigation.actionNames.PREVIOUS:
      return selected.selectPrevious();
    case Blockly.navigation.actionNames.OUT:
      return selected.selectParent();
    case Blockly.navigation.actionNames.NEXT:
      return selected.selectNext();
    case Blockly.navigation.actionNames.IN:
      return selected.selectChild();
    default:
      return false;
  }
};

/**
 * Dispose of this toolbox.
 */
Blockly.Toolbox.prototype.dispose = function() {
  this.flyout_.dispose();
  this.tree_.dispose();
  this.workspace_.getThemeManager().unsubscribe(this.HtmlDiv);
  Blockly.utils.dom.removeNode(this.HtmlDiv);
  this.lastCategory_ = null;
};

/**
 * Get the width of the toolbox.
 * @return {number} The width of the toolbox.
 */
Blockly.Toolbox.prototype.getWidth = function() {
  return this.width;
};

/**
 * Get the height of the toolbox.
 * @return {number} The width of the toolbox.
 */
Blockly.Toolbox.prototype.getHeight = function() {
  return this.height;
};

/**
 * Get the toolbox flyout.
 * @return {Blockly.Flyout} The toolbox flyout.
 */
Blockly.Toolbox.prototype.getFlyout = function() {
  return this.flyout_;
};

/**
 * Move the toolbox to the edge.
 */
Blockly.Toolbox.prototype.position = function() {
  var treeDiv = this.HtmlDiv;
  if (!treeDiv) {
    // Not initialized yet.
    return;
  }
  var svgSize = Blockly.svgSize(this.workspace_.getParentSvg());
  if (this.horizontalLayout_) {
    treeDiv.style.left = '0';
    treeDiv.style.height = 'auto';
    treeDiv.style.width = svgSize.width + 'px';
    this.height = treeDiv.offsetHeight;
    if (this.toolboxPosition == Blockly.TOOLBOX_AT_TOP) {  // Top
      treeDiv.style.top = '0';
    } else {  // Bottom
      treeDiv.style.bottom = '0';
    }
  } else {
    if (this.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {  // Right
      treeDiv.style.right = '0';
    } else {  // Left
      treeDiv.style.left = '0';
    }
    treeDiv.style.height = svgSize.height + 'px';
    this.width = treeDiv.offsetWidth;
  }
  this.flyout_.position();
};

/**
 * Sync trees of the toolbox.
 * @param {!Node} treeIn DOM tree of blocks.
 * @param {!Blockly.tree.BaseNode} treeOut The TreeControl or TreeNode
 *     object built from treeIn.
 * @param {string} pathToMedia The path to the Blockly media directory.
 * @return {Blockly.tree.BaseNode} Tree node to open at startup (or null).
 * @private
 */
Blockly.Toolbox.prototype.syncTrees_ = function(treeIn, treeOut, pathToMedia) {
  var openNode = null;
  var lastElement = null;
  for (var i = 0, childIn; (childIn = treeIn.childNodes[i]); i++) {
    if (!childIn.tagName) {
      // Skip over text.
      continue;
    }
    switch (childIn.tagName.toUpperCase()) {
      case 'CATEGORY':
        // Decode the category name for any potential message references
        // (eg. `%{BKY_CATEGORY_NAME_LOGIC}`).
        var categoryName = Blockly.utils.replaceMessageReferences(
            childIn.getAttribute('name'));
        var childOut = this.tree_.createNode(categoryName);
        childOut.onSizeChanged(this.handleNodeSizeChanged_);
        childOut.blocks = [];
        treeOut.add(childOut);
        var custom = childIn.getAttribute('custom');
        if (custom) {
          // Variables and procedures are special dynamic categories.
          childOut.blocks = custom;
        } else {
          var newOpenNode = this.syncTrees_(childIn, childOut, pathToMedia);
          if (newOpenNode) {
            openNode = newOpenNode;
          }
        }

        var styleName = childIn.getAttribute('categorystyle');
        var colour = childIn.getAttribute('colour');

        if (colour && styleName) {
          childOut.hexColour = '';
          console.warn('Toolbox category "' + categoryName +
              '" can not have both a style and a colour');
        } else if (styleName) {
          this.setColourFromStyle_(styleName, childOut, categoryName);
        } else {
          this.setColour_(colour, childOut, categoryName);
        }

        if (childIn.getAttribute('expanded') == 'true') {
          if (childOut.blocks.length) {
            // This is a category that directly contains blocks.
            // After the tree is rendered, open this category and show flyout.
            openNode = childOut;
          }
          childOut.setExpanded(true);
        } else {
          childOut.setExpanded(false);
        }
        lastElement = childIn;
        break;
      case 'SEP':
        if (lastElement && lastElement.tagName.toUpperCase() == 'CATEGORY') {
          // Separator between two categories.
          // <sep></sep>
          treeOut.add(new Blockly.Toolbox.TreeSeparator(
              /** @type {!Blockly.tree.BaseNode.Config} */
              (this.treeSeparatorConfig_)));
          break;
        }
        // Otherwise falls through.
      case 'BLOCK':
      case 'SHADOW':
      case 'LABEL':
      case 'BUTTON':
        treeOut.blocks.push(childIn);
        lastElement = childIn;
        break;
    }
  }
  return openNode;
};

/**
 * Sets the colour on the category.
 * @param {number|string} colourValue HSV hue value (0 to 360), #RRGGBB string,
 *     or a message reference string pointing to one of those two values.
 * @param {Blockly.tree.TreeNode} childOut The child to set the hexColour on.
 * @param {string} categoryName Name of the toolbox category.
 * @private
 */
Blockly.Toolbox.prototype.setColour_ = function(colourValue, childOut,
    categoryName) {
  // Decode the colour for any potential message references
  // (eg. `%{BKY_MATH_HUE}`).
  var colour = Blockly.utils.replaceMessageReferences(colourValue);
  if (colour === null || colour === '') {
    // No attribute. No colour.
    childOut.hexColour = '';
  } else {
    var hue = Number(colour);
    if (!isNaN(hue)) {
      childOut.hexColour = Blockly.hueToHex(hue);
      this.hasColours_ = true;
    } else {
      var hex = Blockly.utils.colour.parse(colour);
      if (hex) {
        childOut.hexColour = hex;
        this.hasColours_ = true;
      } else {
        childOut.hexColour = '';
        console.warn('Toolbox category "' + categoryName +
            '" has unrecognized colour attribute: ' + colour);
      }
    }
  }
};

/**
 * Retrieves and sets the colour for the category using the style name.
 * The category colour is set from the colour style attribute.
 * @param {string} styleName Name of the style.
 * @param {!Blockly.tree.TreeNode} childOut The child to set the hexColour on.
 * @param {string} categoryName Name of the toolbox category.
 * @private
 */
Blockly.Toolbox.prototype.setColourFromStyle_ = function(
    styleName, childOut, categoryName) {
  childOut.styleName = styleName;
  var theme = this.workspace_.getTheme();
  if (styleName && theme) {
    var style = theme.categoryStyles[styleName];
    if (style && style.colour) {
      this.setColour_(style.colour, childOut, categoryName);
    } else {
      console.warn('Style "' + styleName +
          '" must exist and contain a colour value');
    }
  }
};

/**
 * Recursively updates all the category colours using the category style name.
 * @param {Blockly.tree.BaseNode=} opt_tree Starting point of tree.
 *     Defaults to the root node.
 * @private
 */
Blockly.Toolbox.prototype.updateColourFromTheme_ = function(opt_tree) {
  var tree = opt_tree || this.tree_;
  if (tree) {
    var children = tree.getChildren(false);
    for (var i = 0, child; (child = children[i]); i++) {
      if (child.styleName) {
        this.setColourFromStyle_(child.styleName, child, '');
        this.addColour_();
      }
      this.updateColourFromTheme_(child);
    }
  }
};

/**
 * Updates the category colours and background colour of selected categories.
 * @package
 */
Blockly.Toolbox.prototype.updateColourFromTheme = function() {
  var tree = this.tree_;
  if (tree) {
    this.updateColourFromTheme_(tree);
    this.updateSelectedItemColour_(tree);
  }
};

/**
 * Updates the background colour of the selected category.
 * @param {!Blockly.tree.BaseNode} tree Starting point of tree.
 *     Defaults to the root node.
 * @private
 */
Blockly.Toolbox.prototype.updateSelectedItemColour_ = function(tree) {
  var selectedItem = tree.getSelectedItem();
  if (selectedItem) {
    var hexColour = selectedItem.hexColour || '#57e';
    selectedItem.getRowElement().style.backgroundColor = hexColour;
    this.addColour_(selectedItem);
  }
};


/**
 * Recursively add colours to this toolbox.
 * @param {Blockly.tree.BaseNode=} opt_tree Starting point of tree.
 *     Defaults to the root node.
 * @private
 */
Blockly.Toolbox.prototype.addColour_ = function(opt_tree) {
  var tree = opt_tree || this.tree_;
  var children = tree.getChildren(false);
  for (var i = 0, child; (child = children[i]); i++) {
    var element = child.getRowElement();
    if (element) {
      if (this.hasColours_) {
        var border = '8px solid ' + (child.hexColour || '#ddd');
      } else {
        var border = 'none';
      }
      if (this.workspace_.RTL) {
        element.style.borderRight = border;
      } else {
        element.style.borderLeft = border;
      }
    }
    this.addColour_(child);
  }
};

/**
 * Unhighlight any previously specified option.
 */
Blockly.Toolbox.prototype.clearSelection = function() {
  this.tree_.setSelectedItem(null);
};

/**
 * Adds a style on the toolbox. Usually used to change the cursor.
 * @param {string} style The name of the class to add.
 * @package
 */
Blockly.Toolbox.prototype.addStyle = function(style) {
  Blockly.utils.dom.addClass(/** @type {!Element} */ (this.HtmlDiv), style);
};

/**
 * Removes a style from the toolbox. Usually used to change the cursor.
 * @param {string} style The name of the class to remove.
 * @package
 */
Blockly.Toolbox.prototype.removeStyle = function(style) {
  Blockly.utils.dom.removeClass(/** @type {!Element} */ (this.HtmlDiv), style);
};

/**
 * Return the deletion rectangle for this toolbox.
 * @return {Blockly.utils.Rect} Rectangle in which to delete.
 */
Blockly.Toolbox.prototype.getClientRect = function() {
  if (!this.HtmlDiv) {
    return null;
  }

  // BIG_NUM is offscreen padding so that blocks dragged beyond the toolbox
  // area are still deleted.  Must be smaller than Infinity, but larger than
  // the largest screen size.
  var BIG_NUM = 10000000;
  var toolboxRect = this.HtmlDiv.getBoundingClientRect();

  var top = toolboxRect.top;
  var bottom = top + toolboxRect.height;
  var left = toolboxRect.left;
  var right = left + toolboxRect.width;

  // Assumes that the toolbox is on the SVG edge.  If this changes
  // (e.g. toolboxes in mutators) then this code will need to be more complex.
  if (this.toolboxPosition == Blockly.TOOLBOX_AT_TOP) {
    return new Blockly.utils.Rect(-BIG_NUM, bottom, -BIG_NUM, BIG_NUM);
  } else if (this.toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
    return new Blockly.utils.Rect(top, BIG_NUM, -BIG_NUM, BIG_NUM);
  } else if (this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT) {
    return new Blockly.utils.Rect(-BIG_NUM, BIG_NUM, -BIG_NUM, right);
  } else {  // Right
    return new Blockly.utils.Rect(-BIG_NUM, BIG_NUM, left, BIG_NUM);
  }
};

/**
 * Update the flyout's contents without closing it.  Should be used in response
 * to a change in one of the dynamic categories, such as variables or
 * procedures.
 */
Blockly.Toolbox.prototype.refreshSelection = function() {
  var selectedItem = this.tree_.getSelectedItem();
  if (selectedItem && selectedItem.blocks) {
    this.flyout_.show(selectedItem.blocks);
  }
};

/**
 * Select the first toolbox category if no category is selected.
 * @package
 */
Blockly.Toolbox.prototype.selectFirstCategory = function() {
  var selectedItem = this.tree_.getSelectedItem();
  if (!selectedItem) {
    this.tree_.selectFirst();
  }
};

/**
 * A blank separator node in the tree.
 * @param {!Blockly.tree.BaseNode.Config} config The configuration for the tree.
 * @constructor
 * @extends {Blockly.tree.TreeNode}
 */
Blockly.Toolbox.TreeSeparator = function(config) {
  Blockly.tree.TreeNode.call(this, null, '', config);
};
Blockly.utils.object.inherits(Blockly.Toolbox.TreeSeparator,
    Blockly.tree.TreeNode);

/**
 * CSS for Toolbox.  See css.js for use.
 */
Blockly.Css.register([
  /* eslint-disable indent */
  '.blocklyToolboxDelete {',
    'cursor: url("<<<PATH>>>/handdelete.cur"), auto;',
  '}',

  '.blocklyToolboxGrab {',
    'cursor: url("<<<PATH>>>/handclosed.cur"), auto;',
    'cursor: grabbing;',
    'cursor: -webkit-grabbing;',
  '}',

  /* Category tree in Toolbox. */
  '.blocklyToolboxDiv {',
    'background-color: #ddd;',
    'overflow-x: visible;',
    'overflow-y: auto;',
    'position: absolute;',
    'z-index: 70;', /* so blocks go under toolbox when dragging */
    '-webkit-tap-highlight-color: transparent;', /* issue #1345 */
  '}',

  '.blocklyTreeRoot {',
    'padding: 4px 0;',
  '}',

  '.blocklyTreeRoot:focus {',
    'outline: none;',
  '}',

  '.blocklyTreeRow {',
    'height: 22px;',
    'line-height: 22px;',
    'margin-bottom: 3px;',
    'padding-right: 8px;',
    'white-space: nowrap;',
  '}',

  '.blocklyHorizontalTree {',
    'float: left;',
    'margin: 1px 5px 8px 0;',
  '}',

  '.blocklyHorizontalTreeRtl {',
    'float: right;',
    'margin: 1px 0 8px 5px;',
  '}',

  '.blocklyToolboxDiv[dir="RTL"] .blocklyTreeRow {',
    'margin-left: 8px;',
  '}',

  '.blocklyTreeRow:not(.blocklyTreeSelected):hover {',
    'background-color: #e4e4e4;',
  '}',

  '.blocklyTreeSeparator {',
    'border-bottom: solid #e5e5e5 1px;',
    'height: 0;',
    'margin: 5px 0;',
  '}',

  '.blocklyTreeSeparatorHorizontal {',
    'border-right: solid #e5e5e5 1px;',
    'width: 0;',
    'padding: 5px 0;',
    'margin: 0 5px;',
  '}',

  '.blocklyTreeIcon {',
    'background-image: url(<<<PATH>>>/sprites.png);',
    'height: 16px;',
    'vertical-align: middle;',
    'width: 16px;',
  '}',

  '.blocklyTreeIconClosedLtr {',
    'background-position: -32px -1px;',
  '}',

  '.blocklyTreeIconClosedRtl {',
    'background-position: 0 -1px;',
  '}',

  '.blocklyTreeIconOpen {',
    'background-position: -16px -1px;',
  '}',

  '.blocklyTreeSelected>.blocklyTreeIconClosedLtr {',
    'background-position: -32px -17px;',
  '}',

  '.blocklyTreeSelected>.blocklyTreeIconClosedRtl {',
    'background-position: 0 -17px;',
  '}',

  '.blocklyTreeSelected>.blocklyTreeIconOpen {',
    'background-position: -16px -17px;',
  '}',

  '.blocklyTreeIconNone,',
  '.blocklyTreeSelected>.blocklyTreeIconNone {',
    'background-position: -48px -1px;',
  '}',

  '.blocklyTreeLabel {',
    'cursor: default;',
    'font-family: sans-serif;',
    'font-size: 16px;',
    'padding: 0 3px;',
    'vertical-align: middle;',
  '}',

  '.blocklyToolboxDelete .blocklyTreeLabel {',
    'cursor: url("<<<PATH>>>/handdelete.cur"), auto;',
  '}',

  '.blocklyTreeSelected .blocklyTreeLabel {',
    'color: #fff;',
  '}'
  /* eslint-enable indent */
]);
