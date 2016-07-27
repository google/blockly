/**
 * @fileoverview Generates the configuration xml used to update the preview
 * workspace or print to the console or download to a file. Leverages
 * Blockly.Xml and depends on information in the model (holds a reference).
 * Depends on a hidden workspace created in the generator to load saved XML in
 * order to generate toolbox XML.
 *
 * @author Emma Dauterman (evd2014)
 */

/**
 * Class for a FactoryGenerator
 * @constructor
 */
FactoryGenerator = function(model) {
  // Model to share information about categories and shadow blocks.
  this.model = model;
  // Create hidden workspace to load saved XML to generate toolbox XML.
  var hiddenBlocks = document.createElement('div');
  // Generate a globally unique ID for the hidden div element to avoid
  // collisions.
  var hiddenBlocksId = Blockly.genUid();
  hiddenBlocks.id = hiddenBlocksId;
  hiddenBlocks.style.display = 'none';
  document.body.appendChild(hiddenBlocks);
  this.hiddenWorkspace = Blockly.inject(hiddenBlocksId);
};

/**
 * Generates the xml for the toolbox or flyout. If there is only a flyout,
 * only the current blocks are needed, and these are included without
 * a category. If there are categories, then each category is briefly loaded
 * to the hidden workspace, the user-generated shadow blocks are set as real
 * shadow blocks, and the top blocks are used to generate the xml for the flyout
 * for that category.
 *
 * @param {!Blockly.workspace} toolboxWorkspace Toolbox editing workspace where
 * blocks are added by user to be part of the toolbox.
 * @return {!Element} XML element representing toolbox or flyout corresponding
 * to toolbox workspace.
 */
FactoryGenerator.prototype.generateConfigXml = function(toolboxWorkspace) {
  // Create DOM for XML.
  var xmlDom = goog.dom.createDom('xml',
      {
        'id' : 'toolbox',
        'style' : 'display:none'
      });
  if (!this.model.hasToolbox()) {
    // Toolbox has no categories. Use XML directly from workspace.
    this.loadToHiddenWorkspaceAndSave_
        (Blockly.Xml.workspaceToDom(toolboxWorkspace), xmlDom);
  } else {
    // Toolbox has categories.
    // Assert that selected != null
    if (!this.model.getSelected()) {
      throw new Error('Selected is null when the toolbox is empty.');
    }

    // Capture any changes made by user before generating XML.
    this.model.getSelected().saveFromWorkspace(toolboxWorkspace);
    var xml = this.model.getSelectedXml();
    var toolboxList = this.model.getToolboxList();

    // Iterate through each category to generate XML for each using the
    // hidden workspace. Load each category to the hidden workspace to make sure
    // that all the blocks that are not top blocks are also captured as block
    // groups in the flyout.
    for (var i = 0; i < toolboxList.length; i++) {
      var element = toolboxList[i];
      if (element.type == ListElement.SEPARATOR) {
        // If the next element is a separator.
        var nextElement = goog.dom.createDom('sep');
        xmlDom.appendChild(sepElement);
      } else {
        // If the next element is a category.
        var nextElement = goog.dom.createDom('category');
        nextElement.setAttribute('name', element.name);
        // Add a colour attribute if one exists.
        if (element.color != null) {
          nextElement.setAttribute('colour', element.color);
        }
        // Add a custom attribute if one exists.
        if (element.custom != null) {
          nextElement.setAttribute('custom', element.custom);
        }
        // Load that category to hidden workspace, setting user-generated shadow
        // blocks as real shadow blocks.
        this.loadToHiddenWorkspaceAndSave_(element.xml, nextElement);
      }
      xmlDom.appendChild(nextElement);
    }
  }
  return xmlDom;
 };

/**
 * Load the given XML to the hidden workspace, set any user-generated shadow
 * blocks to be actual shadow blocks, then append the XML from the workspace
 * to the DOM element passed in.
 * @private
 *
 * @param {!Element} xml The XML to be loaded to the hidden workspace.
 * @param {!Element} dom The DOM element to append the generated XML to.
 */
FactoryGenerator.prototype.loadToHiddenWorkspaceAndSave_ = function(xml, dom) {
  this.hiddenWorkspace.clear();
  Blockly.Xml.domToWorkspace(xml, this.hiddenWorkspace);
  this.setShadowBlocksInHiddenWorkspace_();
  this.appendHiddenWorkspaceToDom_(dom);
}

 /**
 * Encodes blocks in the hidden workspace in a XML DOM element. Very
 * similar to workspaceToDom, but doesn't capture IDs. Uses the top-level
 * blocks loaded in hiddenWorkspace.
 * @private
 *
 * @param {!Element} xmlDom Tree of XML elements to be appended to.
 */
FactoryGenerator.prototype.appendHiddenWorkspaceToDom_ = function(xmlDom) {
  var blocks = this.hiddenWorkspace.getTopBlocks();
  for (var i = 0, block; block = blocks[i]; i++) {
    var blockChild = Blockly.Xml.blockToDom(block);
    blockChild.removeAttribute('id');
    xmlDom.appendChild(blockChild);
  }
};

/**
 * Sets the user-generated shadow blocks loaded into hiddenWorkspace to be
 * actual shadow blocks. This is done so that blockToDom records them as
 * shadow blocks instead of regular blocks.
 * @private
 *
 */
FactoryGenerator.prototype.setShadowBlocksInHiddenWorkspace_ = function() {
  var blocks = this.hiddenWorkspace.getAllBlocks();
  for (var i = 0; i < blocks.length; i++) {
    if (this.model.isShadowBlock(blocks[i].id)) {
      blocks[i].setShadow(true);
    }
  }
};
