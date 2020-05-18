/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class responsible for workspace search.
 * @author aschmiedt@google.com (Abby Schmiedt)
 * @author kozbial@google.com (Monica Kozbial)
 */


/**
 * Class for workspace search.
 * @implements {Blockly.IUIPlugin}
 */
Blockly.WorkspaceSearch = function(workspace) {
    /**
     * The workspace the search bar sits in.
     * @type {!Blockly.WorkspaceSvg}
     * @private
     */
    this.workspace_ = workspace;

    /**
     * HTML container for the search bar.
     * @type {?HTMLElement}
     * @private
     */
    this.htmlDiv_ = null;

    /**
     * The div that holds the search bar actions.
     * @type {?HTMLElement}
     * @protected
     */
    this.actionDiv_ = null;

    /**
     * The text input for the search bar.
     * @type {?HTMLInputElement}
     * @private
     */
    this.inputElement_ = null;

    /**
     * The placeholder text for the search bar input.
     * @type {string}
     * @private
     */
    this.textInputPlaceholder_ = 'Search';

    /**
     * A list of blocks that came up in the search.
     * @type {!Array.<Blockly.BlockSvg>}
     * @protected
     */
    this.blocks_ = [];

    /**
     * Index of the currently "selected" block in the blocks array.
     * @type {number}
     * @protected
     */
    this.currentBlockIndex_ = -1;

    /**
     * The search text.
     * @type {string}
     * @protected
     */
    this.searchText_ = '';

    /**
     * Whether to search as input changes as opposed to on enter.
     * @type {boolean}
     */
    this.searchOnInput = true;

    /**
     * Whether search should be case sensitive.
     * @type {boolean}
     */
    this.caseSensitive = false;

    /**
     * Whether search should preserve the currently selected block by default.
     * @type {boolean}
     */
    this.preserveSelected = true;

    /**
     * Array holding info needed to unbind events.
     * Used for disposing.
     * Ex: [[node, name, func], [node, name, func]].
     * @type {!Array.<Array<?>>}
     * @private
     */
    this.boundEvents_ = [];
  }

  /**
   * Initializes the workspace search bar.
   */
  Blockly.WorkspaceSearch.prototype.init = function() {
    var text = this.createCss().join('\n');
    // Inject CSS tag at start of head.
    var cssNode = document.createElement('style');
    cssNode.id = 'blockly-ws-search-style';
    var cssTextNode = document.createTextNode(text);
    cssNode.appendChild(cssTextNode);
    document.head.insertBefore(cssNode, document.head.firstChild);
    this.createDom_();
    this.setVisible(true);
  }

  /**
   * Disposes of workspace search.
   * Unlink from all DOM elements and remove all event listeners
   * to prevent memory leaks.
   */
  Blockly.WorkspaceSearch.prototype.dispose = function() {
    for (var event of this.boundEvents_) {
      Blockly.unbindEvent_(event);
    }
    this.boundEvents_ = null;
    if (this.htmlDiv_) {
      this.htmlDiv_.remove();
      this.htmlDiv_ = null;
    }
    this.actionDiv_ = null;
    this.inputElement_ = null;
  }

  /**
   * Creates and injects the search bar's DOM.
   * @protected
   */
  Blockly.WorkspaceSearch.prototype.createDom_ = function() {
    /*
     * Creates the search bar. The generated search bar looks like:
     * <div class="ws-search'>
     *   <div class="ws-search-container'>
     *     <div class="ws-search-content'>
     *       <div class="ws-search-input'>
     *         [... text input goes here ...]
     *       </div>
     *       [... actions div goes here ...]
     *     </div>
     *     [... close button goes here ...]
     *   </div>
     * </div>
     */
    var injectionDiv = this.workspace_.getInjectionDiv();
    this.addEvent_(injectionDiv, 'keydown', this, (evt) => this
        .onWorkspaceKeyDown_(/** @type {KeyboardEvent} */ evt));

    this.htmlDiv_ = document.createElement('div');
    Blockly.utils.dom.addClass(this.htmlDiv_, 'blockly-ws-search');
    this.position();

    var searchContainer = document.createElement('div');
    Blockly.utils.dom.addClass(searchContainer, 'blockly-ws-search-container');

    var searchContent = document.createElement('div');
    Blockly.utils.dom.addClass(searchContent, 'blockly-ws-search-content');
    searchContainer.appendChild(searchContent);

    var inputWrapper = document.createElement('div');
    Blockly.utils.dom.addClass(inputWrapper, 'blockly-ws-search-input');
    this.inputElement_ = this.createTextInput_();
    this.addEvent_(this.inputElement_, 'keydown', this, (evt) => this
        .onKeyDown_(/** @type {KeyboardEvent} */ evt));
    this.addEvent_(this.inputElement_, 'input', this, () =>this
        .onInput_());
    this.addEvent_(this.inputElement_, 'click', this, () => this
        .searchAndHighlight(this.searchText_, this.preserveSelected));

    inputWrapper.appendChild(this.inputElement_);
    searchContent.appendChild(inputWrapper);

    this.actionDiv_ = document.createElement('div');
    Blockly.utils.dom.addClass(this.actionDiv_, 'blockly-ws-search-actions');
    searchContent.appendChild(this.actionDiv_);

    var nextBtn = this.createNextBtn_();
    if (nextBtn) {
      this.addActionBtn(nextBtn, () => this.next());
    }

    var previousBtn = this.createPreviousBtn_();
    if (previousBtn) {
      this.addActionBtn(previousBtn, () => this.previous());
    }

    var closeBtn = this.createCloseBtn_();
    if (closeBtn) {
      this.addBtnListener_(closeBtn, () => this.close());
      searchContainer.appendChild(closeBtn);
    }

    this.htmlDiv_.appendChild(searchContainer);

    injectionDiv.insertBefore(this.htmlDiv_, this.workspace_.getParentSvg());
  }

  Blockly.WorkspaceSearch.prototype.position = function() {
    this.htmlDiv_
  };

  /**
   * Helper method for adding an event.
   * @param {!Element} node Node upon which to listen.
   * @param {string} name Event name to listen to (e.g. 'mousedown').
   * @param {Object} thisObject The value of 'this' in the function.
   * @param {!Function} func Function to call when event is triggered.
   * @private
   */
  Blockly.WorkspaceSearch.prototype.addEvent_ = function(node, name, thisObject, func) {
    var event = Blockly.bindEventWithChecks_(node, name, thisObject, func);
    this.boundEvents_.push(event);
  }

  /**
   * Add a button to the action div. This must be called after the init function
   * has been called.
   * @param {!HTMLButtonElement} btn The button to add the event listener to.
   * @param {!Function} onClickFn The function to call when the user clicks on
   *     or hits enter on the button.
   */
  Blockly.WorkspaceSearch.prototype.addActionBtn = function(btn, onClickFn) {
    this.addBtnListener_(btn, onClickFn);
    this.actionDiv_.appendChild(btn);
  }

  /**
   * Creates the text input for the search bar.
   * @return {!HTMLInputElement} A text input for the search bar.
   * @protected
   */
  Blockly.WorkspaceSearch.prototype.createTextInput_ = function() {
    var textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.setAttribute('placeholder', this.textInputPlaceholder_);
    return textInput;
  }

  /**
   * Creates the button used to get the next block in the list.
   * @return {!HTMLButtonElement} The next button.
   * @protected
   */
  Blockly.WorkspaceSearch.prototype.createNextBtn_ = function() {
    return this.createBtn_('blockly-ws-search-next-btn', 'Find next');
  }

  /**
   * Creates the button used to get the previous block in the list.
   * @return {!HTMLButtonElement} The previous button.
   * @protected
   */
  Blockly.WorkspaceSearch.prototype.createPreviousBtn_ = function() {
    return this.createBtn_('blockly-ws-search-previous-btn', 'Find previous');
  }

  /**
   * Creates the button used for closing the search bar.
   * @return {!HTMLButtonElement} A button for closing the search bar.
   * @protected
   */
  Blockly.WorkspaceSearch.prototype.createCloseBtn_ = function() {
    return this.createBtn_('blockly-ws-search-close-btn', 'Close search bar');
  }

  /**
   * Creates a button for the workspace search bar.
   * @param {string} className The class name for the button.
   * @param {string} text The text to display to the screen reader.
   * @return {!HTMLButtonElement} The created button.
   * @private
   */
  Blockly.WorkspaceSearch.prototype.createBtn_ = function(className, text) {
    // Create the button
    var btn = document.createElement('button');
    Blockly.utils.dom.addClass(btn, className);
    btn.setAttribute('aria-label', text);
    return btn;
  }

  /**
   * Add event listener for clicking and keydown on the given button.
   * @param {!HTMLButtonElement} btn The button to add the event listener to.
   * @param {!Function} onClickFn The function to call when the user clicks on
   *      or hits enter on the button.
   * @private
   */
  Blockly.WorkspaceSearch.prototype.addBtnListener_ = function(btn, onClickFn) {
    this.addEvent_(btn, 'click', this, onClickFn);
    // TODO: Review Blockly's key handling to see if there is a way to avoid
    //  needing to call stopPropogation().
    this.addEvent_(btn, 'keydown', this, (e) => {
      if (e.keyCode === Blockly.utils.KeyCodes.ENTER) {
        onClickFn(e);
        e.preventDefault();
      } else if (e.keyCode === Blockly.utils.KeyCodes.ESC) {
        this.close();
      }
      e.stopPropagation();
    });
  }

  /**
   * Positions the search bar based on where the workspace's toolbox is.
   * @protected
   */
  Blockly.WorkspaceSearch.prototype.position = function() {
    // TODO: Handle positioning search bar when window is resized.
    var metrics = this.workspace_.getMetrics();
    if (this.workspace_.RTL) {
      this.htmlDiv_.style.left = metrics.absoluteLeft + 'px';
    } else {
      if (metrics.toolboxPosition === Blockly.TOOLBOX_AT_RIGHT) {
        this.htmlDiv_.style.right = metrics.toolboxWidth + 'px';
      } else {
        this.htmlDiv_.style.right = '0';
      }
    }
    this.htmlDiv_.style.top = metrics.absoluteTop + 'px';
  }

  /**
   * Handles input value change in search bar.
   * @private
   */
  Blockly.WorkspaceSearch.prototype.onInput_ = function() {
    if (this.searchOnInput) {
      var inputValue = this.inputElement_.value.trim();
      if (inputValue !== this.searchText_) {
        this.searchAndHighlight(inputValue, this.preserveSelected);
      }
    }
  }

  /**
   * Handles a key down for the search bar.
   * @param {KeyboardEvent} e The key down event.
   * @private
   */
  Blockly.WorkspaceSearch.prototype.onKeyDown_ = function(e) {
    if (e.keyCode === Blockly.utils.KeyCodes.ESC) {
      this.close();
    } else if (e.keyCode === Blockly.utils.KeyCodes.ENTER) {
      if (this.searchOnInput) {
        this.next();
      } else {
        var inputValue = this.inputElement_.value.trim();
        if (inputValue !== this.searchText_) {
          this.searchAndHighlight(inputValue, this.preserveSelected);
        }
      }
    }
  }

  /**
   * Opens the search bar when Control F or Command F are used on the workspace.
   * @param {KeyboardEvent} e The key down event.
   * @private
   */
  Blockly.WorkspaceSearch.prototype.onWorkspaceKeyDown_ = function(e) {
    // TODO: Look into handling keyboard shortcuts on workspace in Blockly.
    if ((e.ctrlKey || e.metaKey) && e.keyCode === Blockly.utils.KeyCodes.F) {
      this.open();
      e.preventDefault();
      e.stopPropagation();
    }
  }

  /**
   * Selects the previous block.
   */
  Blockly.WorkspaceSearch.prototype.previous = function() {
    this.setCurrentBlock_(this.currentBlockIndex_ - 1);
  }

  /**
   * Selects the next block.
   */
  Blockly.WorkspaceSearch.prototype.next = function() {
    this.setCurrentBlock_(this.currentBlockIndex_ + 1);
  }

  /**
   * Sets the placeholder text for the search bar text input.
   * @param {string} placeholderText The placeholder text.
   */
  Blockly.WorkspaceSearch.prototype.setSearchPlaceholder = function(placeholderText) {
    this.textInputPlaceholder_ = placeholderText;
    if (this.inputElement_) {
      this.inputElement_.setAttribute('placeholder',
          this.textInputPlaceholder_);
    }
  }

  /**
   * Changes the currently "selected" block and adds extra highlight.
   * @param {number} index Index of block to set as current. Number is wrapped.
   * @protected
   */
  Blockly.WorkspaceSearch.prototype.setCurrentBlock_ = function(index) {
    if (!this.blocks_.length) {
      return;
    }
    var currentBlock = this.blocks_[this.currentBlockIndex_];
    if (currentBlock) {
      this.unhighlightCurrentSelection_(currentBlock);
    }
    this.currentBlockIndex_ =
        (index % this.blocks_.length + this.blocks_.length) %
        this.blocks_.length;
    currentBlock = this.blocks_[this.currentBlockIndex_];

    this.highlightCurrentSelection_(currentBlock);
    this.updateCursor_(currentBlock);
    this.scrollToVisible_(currentBlock);
  }

  /**
   * Opens the search bar.
   */
  Blockly.WorkspaceSearch.prototype.open = function() {
    this.setVisible(true);
    this.markCurrentPosition_();
    this.inputElement_.focus();
    if (this.searchText_) {
      this.searchAndHighlight(this.searchText_);
    }
  }

  /**
   * Marks the user's current position when opening the search bar.
   * @private
   */
  Blockly.WorkspaceSearch.prototype.markCurrentPosition_ = function() {
    var marker = this.workspace_.getMarker(Blockly.navigation.MARKER_NAME);
    if (this.workspace_.keyboardAccessibilityMode && marker &&
        !marker.getCurNode()) {
      var curNode = this.workspace_.getCursor().getCurNode();
      marker.setCurNode(curNode);
    }
  }

  /**
   * Closes the search bar.
   */
  Blockly.WorkspaceSearch.prototype.close = function() {
    this.setVisible(false);
    this.workspace_.markFocused();
    this.clearBlocks();
  }

  /**
   * Shows or hides the workspace search bar.
   * @param {boolean} show Whether to set the search bar as visible.
   * @private
   */
  Blockly.WorkspaceSearch.prototype.setVisible = function(show) {
    this.htmlDiv_.style.display = show ? 'flex' : 'none';
  }

  /**
   * Searches the workspace for the current search term and highlights matching
   * blocks.
   * @param {string} searchText The search text.
   * @param {boolean=} preserveCurrent Whether to preserve the current block
   *    if it is included in the new matching blocks.
   */
  Blockly.WorkspaceSearch.prototype.searchAndHighlight = function(searchText, preserveCurrent) {
    var oldCurrentBlock = this.blocks_[this.currentBlockIndex_];
    this.searchText_ = searchText.trim();
    this.clearBlocks();
    this.blocks_ = this.getMatchingBlocks_(
        this.workspace_, this.searchText_, this.caseSensitive);
    this.highlightSearchGroup_(this.blocks_);
    var currentIdx = 0;
    if (preserveCurrent) {
      currentIdx = this.blocks_.indexOf(oldCurrentBlock);
      currentIdx = currentIdx > -1 ? currentIdx : 0;
    }
    this.setCurrentBlock_(currentIdx);
  }

  /**
   * Returns pool of blocks to search from.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to get blocks from.
   * @return {!Array.<!Blockly.BlockSvg>} The search pool of blocks to use.
   * @private
   */
  Blockly.WorkspaceSearch.prototype.getSearchPool_ = function(workspace) {
    var blocks = (
      /** @type {!Array.<!Blockly.BlockSvg>} */
      workspace.getAllBlocks(true));
    return blocks.filter((block) => {
      // Filter out blocks contained inside of another collapsed block.
      var surroundParent = block.getSurroundParent();
      return !surroundParent || !surroundParent.isCollapsed();
    });
  }

  /**
   * Returns whether the given block matches the search text.
   * @param {!Blockly.BlockSvg} block The block to check.
   * @param {string} searchText The search text. Note if the search is case
   *    insensitive, this will be passed already converted to lowercase varters.
   * @param {boolean} caseSensitive Whether the search is caseSensitive.
   * @return {boolean} True if the block is a match, false otherwise.
   * @private
   */
  Blockly.WorkspaceSearch.prototype.isBlockMatch_ = function(block, searchText, caseSensitive) {
    var blockText = '';
    if (block.isCollapsed()) {
      // Search the whole string for collapsed blocks.
      blockText = block.toString();
    } else {
      var topBlockText = [];
      block.inputList.forEach((input) => {
        input.fieldRow.forEach((field) => {
          topBlockText.push(field.getText());
        });
      });
      blockText = topBlockText.join(' ').trim();
    }
    if (!caseSensitive) {
      blockText = blockText.toLowerCase();
    }
    return blockText.indexOf(searchText) > -1;
  }

  /**
   * Returns blocks that match the given search text.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to search.
   * @param {string} searchText The search text.
   * @param {boolean} caseSensitive Whether the search should be case sensitive.
   * @return {!Array.<Blockly.BlockSvg>} The blocks that match the search
   *    text.
   * @protected
   */
  Blockly.WorkspaceSearch.prototype.getMatchingBlocks_ = function(workspace, searchText, caseSensitive) {
    if (!searchText) {
      return [];
    }
    if (!this.caseSensitive) {
      searchText = searchText.toLowerCase();
    }
    var searchGroup = this.getSearchPool_(workspace);
    return searchGroup.filter(
        (block) => this.isBlockMatch_(block, searchText, caseSensitive));
  }

  /**
   * Clears the selection group and current block.
   */
  Blockly.WorkspaceSearch.prototype.clearBlocks = function() {
    this.unhighlightSearchGroup_(this.blocks_);
    var currentBlock = this.blocks_[this.currentBlockIndex_];
    if (currentBlock) {
      this.unhighlightCurrentSelection_(currentBlock);
    }
    this.currentBlockIndex_ = -1;
    this.blocks_ = [];
  }

  /**
   * Updates the location of the cursor if the user is in keyboard accessibility
   * mode.
   * @param {!Blockly.BlockSvg} block The block to set the cursor to.
   * @protected
   */
  Blockly.WorkspaceSearch.prototype.updateCursor_ = function(block) {
    if (this.workspace_.keyboardAccessibilityMode) {
      var currAstNode = Blockly.navigation.getTopNode(block);
      this.workspace_.getCursor().setCurNode(currAstNode);
    }
  }

  /**
   * Adds "current selection" highlight to the provided block.
   * Highlights the provided block as the "current selection".
   * @param {!Blockly.BlockSvg} currentBlock The block to highlight.
   * @protected
   */
  Blockly.WorkspaceSearch.prototype.highlightCurrentSelection_ = function(currentBlock) {
    var path = currentBlock.pathObject.svgPath;
    Blockly.utils.dom.addClass(path, 'blockly-ws-search-current');
  }

  /**
   * Removes "current selection" highlight from provided block.
   * @param {Blockly.BlockSvg} currentBlock The block to unhighlight.
   * @protected
   */
  Blockly.WorkspaceSearch.prototype.unhighlightCurrentSelection_ = function(currentBlock) {
    var path = currentBlock.pathObject.svgPath;
    Blockly.utils.dom.removeClass(path, 'blockly-ws-search-current');
  }

  /**
   * Adds highlight to the provided blocks.
   * @param {!Array.<Blockly.BlockSvg>} blocks The blocks to highlight.
   * @protected
   */
  Blockly.WorkspaceSearch.prototype.highlightSearchGroup_ = function(blocks) {
    blocks.forEach((block) => {
      var blockPath = block.pathObject.svgPath;
      Blockly.utils.dom.addClass(blockPath, 'blockly-ws-search-highlight');
    });
  }

  /**
   * Removes highlight from the provided blocks.
   * @param {!Array.<Blockly.BlockSvg>} blocks The blocks to unhighlight.
   * @protected
   */
  Blockly.WorkspaceSearch.prototype.unhighlightSearchGroup_ = function(blocks) {
    blocks.forEach((block) => {
      var blockPath = block.pathObject.svgPath;
      Blockly.utils.dom.removeClass(blockPath, 'blockly-ws-search-highlight');
    });
  }

  /**
   * Scrolls workspace to bring given block into view.
   * @param {!Blockly.BlockSvg} block The block to bring into view.
   * @protected
   */
  Blockly.WorkspaceSearch.prototype.scrollToVisible_ = function(block) {
    if (!this.workspace_.isMovable()) {
      // Cannot scroll to block in a non-movable workspace.
      return;
    }
    // XY is in workspace coordinates.
    var xy = block.getRelativeToSurfaceXY();
    var scale = this.workspace_.scale;

    // Block bounds in pixels relative to the workspace origin (0,0 is centre).
    var width = block.width * scale;
    var height = block.height * scale;
    var top = xy.y * scale;
    var bottom = (xy.y + block.height) * scale;
    // In RTL the block's position is the top right of the block, not top left.
    var left = this.workspace_.RTL ? xy.x * scale - width : xy.x * scale;
    var right = this.workspace_.RTL ? xy.x * scale : xy.x * scale + width;

    var metrics = this.workspace_.getMetrics();

    var targetLeft = metrics.viewLeft;
    var overflowLeft = left < metrics.viewLeft;
    var overflowRight = right > metrics.viewLeft + metrics.viewWidth;
    var wideBlock = width > metrics.viewWidth;

    if ((!wideBlock && overflowLeft) || (wideBlock && !this.workspace_.RTL)) {
      // Scroll to show left side of block
      targetLeft = left;
    } else if ((!wideBlock && overflowRight) ||
        (wideBlock && this.workspace_.RTL)) {
      // Scroll to show right side of block
      targetLeft = right - metrics.viewWidth;
    }

    var targetTop = metrics.viewTop;
    var overflowTop = top < metrics.viewTop;
    var overflowBottom = bottom > metrics.viewTop + metrics.viewHeight;
    var tallBlock = height > metrics.viewHeight;

    if (overflowTop || (tallBlock && overflowBottom)) {
      // Scroll to show top of block
      targetTop = top;
    } else if (overflowBottom) {
      // Scroll to show bottom of block
      targetTop = bottom - metrics.viewHeight;
    }
    if (targetLeft !== metrics.viewLeft || targetTop !== metrics.viewTop) {
      var activeEl = document.activeElement;
      this.workspace_.scroll(-targetLeft, -targetTop);
      if (activeEl) {
        // Blockly.WidgetDiv.hide called in scroll is taking away focus.
        // TODO: Review setFocused call in Blockly.WidgetDiv.hide.
        activeEl.focus();
      }
    }
  }
  Blockly.WorkspaceSearch.prototype.createCss = function() {
    var CLOSE_SVG_DATAURI =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
    '9zdmciIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjE0Ij48cGF0aC' +
    'BkPSJNMTkgNi40MUwxNy41OSA1IDEyIDEwLjU5IDYuNDEgNSA1IDYuNDEgMTAuNTkgMTIgNS' +
    'AxNy41OSA2LjQxIDE5IDEyIDEzLjQxIDE3LjU5IDE5IDE5IDE3LjU5IDEzLjQxIDEyeiIvPj' +
    'xwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz48L3N2Zz4=';
    var ARROW_DOWN_SVG_DATAURI =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
    '9zdmciIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjE0Ij48cGF0aC' +
    'BkPSJNNy40MSA4LjU5TDEyIDEzLjE3bDQuNTktNC41OEwxOCAxMGwtNiA2LTYtNiAxLjQxLT' +
    'EuNDF6Ii8+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PC9zdmc+';
    var ARROW_UP_ARROW_SVG_DATAURI =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
    '9zdmciIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjE0Ij48cGF0aC' +
    'BkPSJNNy40MSAxNS40MUwxMiAxMC44M2w0LjU5IDQuNThMMTggMTRsLTYtNi02IDZ6Ii8+PH' +
    'BhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==';

    var CSS_CONTENT = [
      /* eslint-disable indent */
      'path.blocklyPath.blockly-ws-search-highlight {',
        'fill: black;',
      '}',
      'path.blocklyPath.blockly-ws-search-highlight.blockly-ws-search-current {',
        'fill: grey;',
      '}',
      '.blockly-ws-search-close-btn {',
        'background: url(' + CLOSE_SVG_DATAURI + ') no-repeat top left;',
      '}',
      '.blockly-ws-search-next-btn {',
        'background: url(' + ARROW_DOWN_SVG_DATAURI + ') no-repeat top left;',
      '}',
      '.blockly-ws-search-previous-btn {',
        'background: url(' +ARROW_UP_ARROW_SVG_DATAURI + ') no-repeat top left;',
      '}',
      '.blockly-ws-search {',
        'background: white;',
        'border: solid lightgrey .5px;',
        'box-shadow: 0px 10px 20px grey;',
        'justify-content: center;',
        'padding: .25em;',
        'position: absolute;',
        'z-index: 70;',
      '}',
      '.blockly-ws-search-input input {',
        'border: none;',
      '}',
      '.blockly-ws-search button {',
        'border: none;',
      '}',
      '.blockly-ws-search-actions {',
        'display: flex;',
      '}',
      '.blockly-ws-search-container {',
        'display: flex;',
      '}',
      '.blockly-ws-search-content {',
        'display: flex;',
      '}',
      /* eslint-enable indent */
    ];
    return CSS_CONTENT;
  }
