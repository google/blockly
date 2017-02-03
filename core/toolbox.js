/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
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
 * @fileoverview Toolbox from whence to create blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Toolbox');

goog.require('Blockly.Flyout');
goog.require('Blockly.Touch');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.events.BrowserFeature');
goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeStyle');
goog.require('goog.math.Rect');
goog.require('goog.style');
goog.require('goog.ui.tree.TreeControl');
goog.require('goog.ui.tree.TreeNode');


/**
 * Class for a Toolbox.
 * Creates the toolbox's DOM.
 * @param {!Blockly.Workspace} workspace The workspace in which to create new
 *     blocks.
 * @constructor
 */
Blockly.Toolbox = function(workspace) {
  /**
   * @type {!Blockly.Workspace}
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
   * @type {Object.<string,*>}
   * @private
   */
  this.config_ = {
    indentWidth: 19,
    cssRoot: 'blocklyTreeRoot',
    cssHideRoot: 'blocklyHidden',
    cssItem: '',
    cssTreeRow: 'blocklyTreeRow',
    cssItemLabel: 'blocklyTreeLabel',
    cssTreeIcon: 'blocklyTreeIcon',
    cssExpandedFolderIcon: 'blocklyTreeIconOpen',
    cssFileIcon: 'blocklyTreeIconNone',
    cssSelectedRow: 'blocklyTreeSelected'
  };


  /**
   * Configuration constants for tree separator.
   * @type {Object.<string,*>}
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
 * @type {goog.ui.tree.BaseNode}
 * @private
 */
Blockly.Toolbox.prototype.lastCategory_ = null;

/**
 * Initializes the toolbox.
 */
Blockly.Toolbox.prototype.init = function() {
  var workspace = this.workspace_;
  var svg = this.workspace_.getParentSvg();

  /**
   * HTML container for the Toolbox menu.
   * @type {Element}
   */
  this.HtmlDiv =
      goog.dom.createDom(goog.dom.TagName.DIV, 'blocklyToolboxDiv');
  this.HtmlDiv.setAttribute('dir', workspace.RTL ? 'RTL' : 'LTR');
  svg.parentNode.insertBefore(this.HtmlDiv, svg);

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
      });
  var workspaceOptions = {
    disabledPatternId: workspace.options.disabledPatternId,
    parentWorkspace: workspace,
    RTL: workspace.RTL,
    oneBasedIndex: workspace.options.oneBasedIndex,
    horizontalLayout: workspace.horizontalLayout,
    toolboxPosition: workspace.options.toolboxPosition
  };
  /**
   * @type {!Blockly.Flyout}
   * @private
   */
  this.flyout_ = new Blockly.Flyout(workspaceOptions);
  goog.dom.insertSiblingAfter(this.flyout_.createDom('svg'),
                              this.workspace_.getParentSvg());
  this.flyout_.init(workspace);

  this.config_['cleardotPath'] = workspace.options.pathToMedia + '1x1.gif';
  this.config_['cssCollapsedFolderIcon'] =
      'blocklyTreeIconClosed' + (workspace.RTL ? 'Rtl' : 'Ltr');
  var tree = new Blockly.Toolbox.TreeControl(this, this.config_);
  this.tree_ = tree;
  tree.setShowRootNode(false);
  tree.setShowLines(false);
  tree.setShowExpandIcons(false);
  tree.setSelectedItem(null);
  var openNode = this.populate_(workspace.options.languageTree);
  tree.render(this.HtmlDiv);
  if (openNode) {
    tree.setSelectedItem(openNode);
  }
  this.addColour_();
  this.position();
};

/**
 * Dispose of this toolbox.
 */
Blockly.Toolbox.prototype.dispose = function() {
  this.flyout_.dispose();
  this.tree_.dispose();
  goog.dom.removeNode(this.HtmlDiv);
  this.workspace_ = null;
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
 * Move the toolbox to the edge.
 */
Blockly.Toolbox.prototype.position = function() {
  var treeDiv = this.HtmlDiv;
  if (!treeDiv) {
    // Not initialized yet.
    return;
  }
  var svg = this.workspace_.getParentSvg();
  var svgPosition = goog.style.getPageOffset(svg);
  var svgSize = Blockly.svgSize(svg);
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
 * Fill the toolbox with categories and blocks.
 * @param {!Node} newTree DOM tree of blocks.
 * @return {Node} Tree node to open at startup (or null).
 * @private
 */
Blockly.Toolbox.prototype.populate_ = function(newTree) {
  this.tree_.removeChildren();  // Delete any existing content.
  this.tree_.blocks = [];
  this.hasColours_ = false;
  var openNode =
    this.syncTrees_(newTree, this.tree_, this.workspace_.options.pathToMedia);

  if (this.tree_.blocks.length) {
    throw 'Toolbox cannot have both blocks and categories in the root level.';
  }

  // Fire a resize event since the toolbox may have changed width and height.
  this.workspace_.resizeContents();
  return openNode;
};

/**
 * Sync trees of the toolbox.
 * @param {!Node} treeIn DOM tree of blocks.
 * @param {!Blockly.Toolbox.TreeControl} treeOut
 * @param {string} pathToMedia
 * @return {Node} Tree node to open at startup (or null).
 * @private
 */
Blockly.Toolbox.prototype.syncTrees_ = function(treeIn, treeOut, pathToMedia) {
  var openNode = null;
  var lastElement = null;
  for (var i = 0, childIn; childIn = treeIn.childNodes[i]; i++) {
    if (!childIn.tagName) {
      // Skip over text.
      continue;
    }
    switch (childIn.tagName.toUpperCase()) {
      case 'CATEGORY':
        var childOut = this.tree_.createNode(childIn.getAttribute('name'));
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
        var colour = childIn.getAttribute('colour');
        if (goog.isString(colour)) {
          if (colour.match(/^#[0-9a-fA-F]{6}$/)) {
            childOut.hexColour = colour;
          } else {
            childOut.hexColour = Blockly.hueToRgb(colour);
          }
          this.hasColours_ = true;
        } else {
          childOut.hexColour = '';
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
        if (lastElement) {
          if (lastElement.tagName.toUpperCase() == 'CATEGORY') {
            // Separator between two categories.
            // <sep></sep>
            treeOut.add(new Blockly.Toolbox.TreeSeparator(
                this.treeSeparatorConfig_));
          } else {
            // Change the gap between two blocks.
            // <sep gap="36"></sep>
            // The default gap is 24, can be set larger or smaller.
            // Note that a deprecated method is to add a gap to a block.
            // <block type="math_arithmetic" gap="8"></block>
            var newGap = parseFloat(childIn.getAttribute('gap'));
            if (!isNaN(newGap) && lastElement) {
              lastElement.setAttribute('gap', newGap);
            }
          }
        }
        break;
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
 * Recursively add colours to this toolbox.
 * @param {Blockly.Toolbox.TreeNode} opt_tree Starting point of tree.
 *     Defaults to the root node.
 * @private
 */
Blockly.Toolbox.prototype.addColour_ = function(opt_tree) {
  var tree = opt_tree || this.tree_;
  var children = tree.getChildren();
  for (var i = 0, child; child = children[i]; i++) {
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
 * Return the deletion rectangle for this toolbox.
 * @return {goog.math.Rect} Rectangle in which to delete.
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

  var x = toolboxRect.left;
  var y = toolboxRect.top;
  var width = toolboxRect.width;
  var height = toolboxRect.height;

  // Assumes that the toolbox is on the SVG edge.  If this changes
  // (e.g. toolboxes in mutators) then this code will need to be more complex.
  if (this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT) {
    return new goog.math.Rect(-BIG_NUM, -BIG_NUM, BIG_NUM + x + width,
        2 * BIG_NUM);
  } else if (this.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
    return new goog.math.Rect(x, -BIG_NUM, BIG_NUM + width, 2 * BIG_NUM);
  } else if (this.toolboxPosition == Blockly.TOOLBOX_AT_TOP) {
    return new goog.math.Rect(-BIG_NUM, -BIG_NUM, 2 * BIG_NUM,
        BIG_NUM + y + height);
  } else {  // Bottom
    return new goog.math.Rect(0, y, 2 * BIG_NUM, BIG_NUM + width);
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

// Extending Closure's Tree UI.

/**
 * Extension of a TreeControl object that uses a custom tree node.
 * @param {Blockly.Toolbox} toolbox The parent toolbox for this tree.
 * @param {Object} config The configuration for the tree. See
 *    goog.ui.tree.TreeControl.DefaultConfig.
 * @constructor
 * @extends {goog.ui.tree.TreeControl}
 */
Blockly.Toolbox.TreeControl = function(toolbox, config) {
  this.toolbox_ = toolbox;
  goog.ui.tree.TreeControl.call(this, goog.html.SafeHtml.EMPTY, config);
};
goog.inherits(Blockly.Toolbox.TreeControl, goog.ui.tree.TreeControl);

/**
 * Adds touch handling to TreeControl.
 * @override
 */
Blockly.Toolbox.TreeControl.prototype.enterDocument = function() {
  Blockly.Toolbox.TreeControl.superClass_.enterDocument.call(this);

  // Add touch handler.
  if (goog.events.BrowserFeature.TOUCH_ENABLED) {
    var el = this.getElement();
    Blockly.bindEventWithChecks_(el, goog.events.EventType.TOUCHSTART, this,
        this.handleTouchEvent_);
  }
};

/**
 * Handles touch events.
 * @param {!goog.events.BrowserEvent} e The browser event.
 * @private
 */
Blockly.Toolbox.TreeControl.prototype.handleTouchEvent_ = function(e) {
  e.preventDefault();
  var node = this.getNodeFromEvent_(e);
  if (node && e.type === goog.events.EventType.TOUCHSTART) {
    // Fire asynchronously since onMouseDown takes long enough that the browser
    // would fire the default mouse event before this method returns.
    setTimeout(function() {
      node.onMouseDown(e);  // Same behaviour for click and touch.
    }, 1);
  }
};

/**
 * Creates a new tree node using a custom tree node.
 * @param {string=} opt_html The HTML content of the node label.
 * @return {!goog.ui.tree.TreeNode} The new item.
 * @override
 */
Blockly.Toolbox.TreeControl.prototype.createNode = function(opt_html) {
  return new Blockly.Toolbox.TreeNode(this.toolbox_, opt_html ?
      goog.html.SafeHtml.htmlEscape(opt_html) : goog.html.SafeHtml.EMPTY,
      this.getConfig(), this.getDomHelper());
};

/**
 * Display/hide the flyout when an item is selected.
 * @param {goog.ui.tree.BaseNode} node The item to select.
 * @override
 */
Blockly.Toolbox.TreeControl.prototype.setSelectedItem = function(node) {
  var toolbox = this.toolbox_;
  if (node == this.selectedItem_ || node == toolbox.tree_) {
    return;
  }
  if (toolbox.lastCategory_) {
    toolbox.lastCategory_.getRowElement().style.backgroundColor = '';
  }
  if (node) {
    var hexColour = node.hexColour || '#57e';
    node.getRowElement().style.backgroundColor = hexColour;
    // Add colours to child nodes which may have been collapsed and thus
    // not rendered.
    toolbox.addColour_(node);
  }
  var oldNode = this.getSelectedItem();
  goog.ui.tree.TreeControl.prototype.setSelectedItem.call(this, node);
  if (node && node.blocks && node.blocks.length) {
    toolbox.flyout_.show(node.blocks);
    // Scroll the flyout to the top if the category has changed.
    if (toolbox.lastCategory_ != node) {
      toolbox.flyout_.scrollToStart();
    }
  } else {
    // Hide the flyout.
    toolbox.flyout_.hide();
  }
  if (oldNode != node && oldNode != this) {
    var event = new Blockly.Events.Ui(null, 'category',
        oldNode && oldNode.getHtml(), node && node.getHtml());
    event.workspaceId = toolbox.workspace_.id;
    Blockly.Events.fire(event);
  }
  if (node) {
    toolbox.lastCategory_ = node;
  }
};

/**
 * A single node in the tree, customized for Blockly's UI.
 * @param {Blockly.Toolbox} toolbox The parent toolbox for this tree.
 * @param {!goog.html.SafeHtml} html The HTML content of the node label.
 * @param {Object=} opt_config The configuration for the tree. See
 *    goog.ui.tree.TreeControl.DefaultConfig. If not specified, a default config
 *    will be used.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.tree.TreeNode}
 */
Blockly.Toolbox.TreeNode = function(toolbox, html, opt_config, opt_domHelper) {
  goog.ui.tree.TreeNode.call(this, html, opt_config, opt_domHelper);
  if (toolbox) {
    var resize = function() {
      // Even though the div hasn't changed size, the visible workspace
      // surface of the workspace has, so we may need to reposition everything.
      Blockly.svgResize(toolbox.workspace_);
    };
    // Fire a resize event since the toolbox may have changed width.
    goog.events.listen(toolbox.tree_,
        goog.ui.tree.BaseNode.EventType.EXPAND, resize);
    goog.events.listen(toolbox.tree_,
        goog.ui.tree.BaseNode.EventType.COLLAPSE, resize);
  }
};
goog.inherits(Blockly.Toolbox.TreeNode, goog.ui.tree.TreeNode);

/**
 * Suppress population of the +/- icon.
 * @return {!goog.html.SafeHtml} The source for the icon.
 * @override
 */
Blockly.Toolbox.TreeNode.prototype.getExpandIconSafeHtml = function() {
  return goog.html.SafeHtml.create('span');
};

/**
 * Expand or collapse the node on mouse click.
 * @param {!goog.events.BrowserEvent} e The browser event.
 * @override
 */
Blockly.Toolbox.TreeNode.prototype.onMouseDown = function(e) {
  // Expand icon.
  if (this.hasChildren() && this.isUserCollapsible_) {
    this.toggle();
    this.select();
  } else if (this.isSelected()) {
    this.getTree().setSelectedItem(null);
  } else {
    this.select();
  }
  this.updateRow();
};

/**
 * Suppress the inherited double-click behaviour.
 * @param {!goog.events.BrowserEvent} e The browser event.
 * @override
 * @private
 */
Blockly.Toolbox.TreeNode.prototype.onDoubleClick_ = function(e) {
  // NOP.
};

/**
 * Remap event.keyCode in horizontalLayout so that arrow
 * keys work properly and call original onKeyDown handler.
 * @param {!goog.events.BrowserEvent} e The browser event.
 * @return {boolean} The handled value.
 * @override
 * @private
 */
Blockly.Toolbox.TreeNode.prototype.onKeyDown = function(e) {
  if (this.tree.toolbox_.horizontalLayout_) {
    var map = {};
    var next = goog.events.KeyCodes.DOWN
    var prev = goog.events.KeyCodes.UP
    map[goog.events.KeyCodes.RIGHT] = this.rightToLeft_ ? prev : next;
    map[goog.events.KeyCodes.LEFT] = this.rightToLeft_ ? next : prev;
    map[goog.events.KeyCodes.UP] = goog.events.KeyCodes.LEFT;
    map[goog.events.KeyCodes.DOWN] = goog.events.KeyCodes.RIGHT;

    var newKeyCode = map[e.keyCode];
    e.keyCode = newKeyCode || e.keyCode;
  }
  return Blockly.Toolbox.TreeNode.superClass_.onKeyDown.call(this, e);
};

/**
 * A blank separator node in the tree.
 * @param {Object=} config The configuration for the tree. See
 *    goog.ui.tree.TreeControl.DefaultConfig. If not specified, a default config
 *    will be used.
 * @constructor
 * @extends {Blockly.Toolbox.TreeNode}
 */
Blockly.Toolbox.TreeSeparator = function(config) {
  Blockly.Toolbox.TreeNode.call(this, null, '', config);
};
goog.inherits(Blockly.Toolbox.TreeSeparator, Blockly.Toolbox.TreeNode);
