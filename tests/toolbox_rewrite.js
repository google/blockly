Blockly.NewToolbox = function(workspace) {
  /**
   * The workspace this toolbox is on.
   * @type {!Blockly.WorkspaceSvg}
   * @protected
   */
  this.workspace_ = workspace;

  /**
   * The list of items in the toolbox.
   * TODO: This could be blocks if it is a simple toolbox.
   * @type {Array<Blockly.ToolboxItem>}
   */
  this.toolboxItems = [];

  /**
   * The html container for the toolbox.
   * @type {HTMLDivElement}
   */
  this.HtmlDiv = null;

  /**
   * The width of the toolbox.
   * @type {number}
   */
  this.width = 0;

  /**
   * The height of the toolbox.
   * @type {number}
   */
  this.height = 0;

};

Blockly.NewToolbox.prototype.init = function() {
  var workspace = this.workspace_;
  var svg = this.workspace_.getParentSvg();

  this.HtmlDiv = this.createContainer_(workspace);
  svg.parentNode.insertBefore(this.HtmlDiv, svg);

  var themeManager = workspace.getThemeManager();
  themeManager.subscribe(this.HtmlDiv, 'toolboxBackgroundColour',
      'background-color');
  themeManager.subscribe(this.HtmlDiv, 'toolboxForegroundColour', 'color');

  // Clicking on toolbox closes popups.
  Blockly.bindEventWithChecks_(this.HtmlDiv, 'mousedown', this, this.onClick_,
      /* opt_noCaptureIdentifier */ false, /* opt_noPreventDefault */ true);

  this.setFlyout_();
  // Insert the flyout after the workspace.
  Blockly.utils.dom.insertAfter(this.flyout_.createDom('svg'), svg);
  this.flyout_.init(workspace);

  this.render(workspace.options.languageTree);
};

Blockly.NewToolbox.prototype.createContainer_ = function(workspace) {
  var toolboxContainer = document.createElement('div');
  toolboxContainer.className = 'blocklyToolboxDiv blocklyNonSelectable';
  toolboxContainer.setAttribute('dir', workspace.RTL ? 'RTL' : 'LTR');
  return toolboxContainer;
};

Blockly.NewToolbox.prototype.onClick_ = function(e) {
  if (Blockly.utils.isRightButton(e) || e.target == this.HtmlDiv) {
    // Close flyout.
    Blockly.hideChaff(false);
  } else {
    // Just close popups.
    Blockly.hideChaff(true);
  }
  Blockly.Touch.clearTouchIdentifier();  // Don't block future drags.
};

Blockly.NewToolbox.prototype.setFlyout_ = function() {
  var workspace = this.workspace_;
  var workspaceOptions = new Blockly.Options(
      /** @type {!Blockly.BlocklyOptions} */
      ({
        'parentWorkspace': workspace,
        'rtl': workspace.RTL,
        'oneBasedIndex': workspace.options.oneBasedIndex,
        'horizontalLayout': workspace.horizontalLayout,
        'renderer': workspace.options.renderer,
        'rendererOverrides': workspace.options.rendererOverrides
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
};

Blockly.NewToolbox.prototype.render = function(toolboxDef) {
  for (var i = 0, childIn; (childIn = toolboxDef[i]); i++) {
    switch (childIn['kind'].toUpperCase()) {
      case 'CATEGORY':
        // TODO: This could potentially be separate from where we add categories to the list.
        // TODO: Maybe we could go through and only render based on if something new is in the list?
        var category = new Blockly.Category(childIn, this);
        var categoryDom = category.createDom();
        this.HtmlDiv.appendChild(categoryDom);
        this.toolboxItems.push(category);
        break;
      case 'SEP':
        var separator = new Blockly.ToolboxSeparator(childIn, this);
        var separatorDom = separator.createDom();
        this.HtmlDiv.appendChild(separatorDom);
        this.toolboxItems.push(separator);
        break;
      case 'BLOCK':
      case 'SHADOW':
      case 'LABEL':
      case 'BUTTON':
        break;
        //TODO: How would someone add a different type here?
        // They could register it and then have the kind correspond to the kind in regsitry?
        // They could pass in a different type to the toolboxDef {kind: "button", class: function}
    }
  }
  // using the categories that are set above render the toolbox
  // Should be broken into smaller pieces that can be easily overriden
  // We should also make sure that we have the ability to
};

Blockly.NewToolbox.prototype.getCategories = function() {

};

Blockly.NewToolbox.prototype.setCategories = function() {

};

Blockly.NewToolbox.prototype.addCategory = function() {

};

Blockly.NewToolbox.prototype.removeCategory = function() {

};

Blockly.NewToolbox.prototype.getCategoryByName = function() {

};

/**
 *
 * @param category
 */
Blockly.NewToolbox.prototype.getAllCategories = function() {

};

/**
 * Get all the blocks in all the categories of the flyout.
 */
Blockly.NewToolbox.prototype.getAllBlocks = function() {

};

Blockly.NewToolbox.prototype.dispose = function() {};

Blockly.NewToolbox.prototype.getWidth = function() {
  // Needed for scrollbar things
  return this.width;
};

Blockly.NewToolbox.prototype.getHeight = function() {
  // Needed for scrollbar things
  return this.height;
};

Blockly.NewToolbox.prototype.getFlyout = function() {
  return this.flyout_;
};

Blockly.NewToolbox.prototype.position = function() {
  var toolboxDiv = this.HtmlDiv;
  if (!toolboxDiv) {
    // Not initialized yet.
    return;
  }
  var svgSize = Blockly.svgSize(this.workspace_.getParentSvg());
  if (this.horizontalLayout_) {
    toolboxDiv.style.left = '0';
    toolboxDiv.style.height = 'auto';
    toolboxDiv.style.width = svgSize.width + 'px';
    this.height = treeDiv.offsetHeight;
    if (this.toolboxPosition == Blockly.TOOLBOX_AT_TOP) {  // Top
      toolboxDiv.style.top = '0';
    } else {  // Bottom
      toolboxDiv.style.bottom = '0';
    }
  } else {
    if (this.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {  // Right
      toolboxDiv.style.right = '0';
    } else {  // Left
      toolboxDiv.style.left = '0';
    }
    toolboxDiv.style.height = svgSize.height + 'px';
    this.width = toolboxDiv.offsetWidth;
  }
  this.flyout_.position();
};

Blockly.NewToolbox.prototype.clearSelection = function() {};

Blockly.NewToolbox.prototype.refreshTheme = function() {};

Blockly.NewToolbox.prototype.refreshSelection = function() {};

Blockly.NewToolbox.prototype.setVisible = function() {};

Blockly.NewToolbox.prototype.selectFirstCategory = function() {};

Blockly.Category = function(categoryDef, toolbox) {
  this.name = categoryDef['name'];
  this.parentToolbox = toolbox;
  this.className = categoryDef['className'];
  // if the category has more categories
  this.subCategories = categoryDef['contents'];
  // Then add to the sub categories list
  // If the category only has flyout info add to the flyout part
  this.flyoutContents = categoryDef['contents'];
};

/**
 * Interface for an item in a toolbox.
 * @interface
 */
Blockly.ToolboxItem = function() {};

/**
 * Create the dom for the toolbox item.
 */
Blockly.ToolboxItem.prototype.createDom;

/**
 * ???????
 */
Blockly.ToolboxItem.prototype.udpateClass;

Blockly.Category.prototype.show = function() {
};

Blockly.Category.prototype.hide = function() {
};

/**
 * Create the dom for the category. If a category has children then update the
 * indentation.
 * TODO: This can have control of adding itself to the toolbox, or the toolbox can have control. Same with the binding the click event.
 * TODO: Could instead do something where the toolbox checks if there is an onClick event, and if there is one then they can add themself.
 * @return {HTMLDivElement} The element for the category.
 */
Blockly.Category.prototype.createDom = function() {
  var toolboxCategory = document.createElement('div');
  toolboxCategory.classList.add('blocklyToolboxCategory');

  var toolboxCategoryRow = document.createElement('div');
  toolboxCategoryRow.classList.add('blocklyTreeRow');
  toolboxCategory.appendChild(toolboxCategoryRow);

  var toolboxIcon = document.createElement('span');
  toolboxIcon.classList.add('blocklyTreeIcon');
  toolboxCategoryRow.appendChild(toolboxIcon);

  var toolboxLabel = document.createElement('span');
  toolboxLabel.textContent = this.name;
  toolboxLabel.classList.add('blocklyTreeLabel');
  toolboxCategoryRow.appendChild(toolboxLabel);
  Blockly.bindEvent_(
      toolboxCategory, 'mouseup', this.parentToolbox, this.onClick);

  return toolboxCategory;

  // There is going to be a lot of pain around getting the nesting to be
  // correct
  // return the div that it wants to add to the toolbox.
  // This will have to be some kind of recursive call so that it appends any
  // sub categories to itself.
};


Blockly.Category.prototype.onClick = function() {
  console.log(this);
};

Blockly.ToolboxSeparator = function(toolboxSeparatorDef, toolbox) {
  this.toolbox = toolbox;
  //TODO: Should probably be able to set the class on this.

};

Blockly.ToolboxSeparator.prototype.createDom = function() {
  var treeSeparatorContainer = document.createElement('div');
  treeSeparatorContainer.classList.add('blocklyTreeSeparator');
  // TODO: Figure out what spans and divs are actually necessary for this.
  return treeSeparatorContainer;
};

// TODO: Figure out how nested categories are going to work.
// <div class="blocklyToolboxDiv">
//   <div class="blocklyToolboxCategories">
//     <div class="blocklyToolboxCategory">
//       <div class="blocklyTreeRow">
//         <span class="blocklyTreeIcon"></span>
//         <span class="blocklyTreeLabel"></span>
//       </div>
//     </div>
//     <div class='separator'>
//       <div class='blocklyTreeSeparator'>
//         <span></span>
//       </div>
//     </div>
//   </div>
// </div>

Blockly.registry.register(Blockly.registry.Type.TOOLBOX, 'newToolbox', Blockly.NewToolbox);
