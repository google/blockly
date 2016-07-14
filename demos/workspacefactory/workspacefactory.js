/**
 * @fileoverview Implements functionality of workspace factory, allowing a
 * user to dynamically create the xml for a toolbox or flyout. Automatically
 * detects if in "simple" mode (1 flyout), or needs a toolbox for multiple
 * categories. Generates a preview on clicking the "preview workspace" button,
 * downloads the xml to a file on clicking the "export config" button, and
 * prints  the xml to the console on clicking the "print config" button
 * (currently for debugging purposes). "Simple" mode (1 flyout), is when
 * selected = null and hasCategories = false. Starts in "simple".
 *
 * @author edauterman
 */

/**
 * namespace for workspace factory code
 * @namespace WorkspaceFactory
 */
var WorkspaceFactory = {};

//automatic category when no categories/tabs exist
WorkspaceFactory.selected = null;
//stores XML to load blocks in each category, for switching between
WorkspaceFactory.categoryXmlMap = new Map();
//stores corresponding DOM element for each category so can easily toggle tabs
WorkspaceFactory.categoryTabMap = new Map();
//stores top blocks for each category, allows for quickly XML generation
WorkspaceFactory.categoryTopBlocksMap = new Map();
//false if in "simple" mode, true if has at least 1 category
WorkspaceFactory.hasCategories = false;

/**
 * Attached to "Add Category" button. Currently prompts the user for a name,
 * checking that it's valid (not used before), and then creates a tab and
 * switches to it.
 *
 * Might make more sophisticated than an alert box in the future.
 */
WorkspaceFactory.addCategory = function() {
    do {
      var name = prompt('Enter the name of your new category: ');
    } while (WorkspaceFactory.categoryXmlMap.has(name))
    if (name == null) return;   //if cancelled
    WorkspaceFactory.hasCategories = true;
    WorkspaceFactory.addCategoryRow(name);
};

/**
 * Attached to "Remove Category" button. Prompts the user for a name, and
 * removes the specified category. Alerts the user and exits immediately if
 * the user tries to remove a nonexistent category. If currently on the category
 * being removed, switches to the first category added.
 *
 * TODO(edauterman): make case insensitive, have it switch to a more logical
 * category (e.g. most recently added category)
 */
WorkspaceFactory.removeCategory = function() {
    var name = prompt('Enter the name of your category to remove: ');
    if (!WorkspaceFactory.categoryXmlMap.has(name)) {
      alert('No such category to delete.');
      return;
    }
    WorkspaceFactory.removeCategoryByName(name);
};

/**
 * Helper for addCategory. Takes a name of a category to be created and adds
 * a correponding tab for an empty category. Switches to that category. Updates
 * corresponding data structures.
 *
 * @param name The name of the category to be created
 */
WorkspaceFactory.addCategoryRow = function(name) {
    var table = document.getElementById('categoryTable');
    var count = table.rows.length;
    var row = table.insertRow(count);
    var nextEntry = row.insertCell(0);
    //initialize to empty category
    WorkspaceFactory.categoryXmlMap.set
        (name,Blockly.Xml.textToDom('<xml></xml>'));
    WorkspaceFactory.categoryTabMap.set(name, table.rows[count].cells[0]);
    WorkspaceFactory.toggleTabs(name);
    nextEntry.id = "tab_" + name;
    nextEntry.textContent = name;
    //when click the tab with that name, switch to that tab
    WorkspaceFactory.bindClick(nextEntry, function(name) {return function ()
        {WorkspaceFactory.toggleTabs(name)};}(name));
};

/**
 * Used in removeCategoryByName to find the next open category to switch to.
 * Used when deleting the current tab and need to switch to another tab.
 * Assumes the category to be deleted has already been removed from
 * categoryTabMap. Returns null if no categories left to switch to, and
 * updates hasCategories to be false.
 * TODO(edauterman): Find a better tab than just the first tab in the map.
 *
 * @return {String} name of next category to switch to
 */
WorkspaceFactory.getNextOpenCategory = function(){
    for (var key of WorkspaceFactory.categoryTabMap.keys()) {
      return key;
    }
    WorkspaceFactory.hasCategories = false;  //no category left to switch to
    return null;
};

/**
 * Helper method for removeCategory. Given a name (guaranteed to be a valid
 * category by caller), updates corresponding data structures, deletes tab
 * DOM elements, and if the deleted tab was selected, switches to another
 * tab.
 *
 * @param {String} name Name of category, guaranteed by caller to be a valid
 * category to remove.
 */
WorkspaceFactory.removeCategoryByName = function(name) {
    var table = document.getElementById('categoryTable');
    var count = table.rows.length;
    WorkspaceFactory.categoryTabMap.delete(name);
    if (name == WorkspaceFactory.selected) {
      var newTabOpen = WorkspaceFactory.getNextOpenCategory();
      WorkspaceFactory.toggleTabs(newTabOpen);
    }
    WorkspaceFactory.categoryXmlMap.delete(name);
    WorkspaceFactory.categoryTopBlocksMap.delete(name);
    for (var i=0; i<count; i++) {
      var row = table.rows[i];
      if (row.cells[0].childNodes[0].textContent == name) {
        table.deleteRow(i);
        return;
      }
    }
};

/**
 * Used to bind a click to a certain DOM element (used for category tabs).
 * Taken directly from code.js
 *
 * @param {String|!Element} e1 tab element or corresponding id string
 * @param {!Function} func Function to be executed on click
 */
WorkspaceFactory.bindClick = function(el, func) {
  if (typeof el == 'string') {
    el = document.getElementById(el);
  }
  el.addEventListener('click', func, true);
  el.addEventListener('touchend', func, true);
};

/**
 * Toggles to a new tab for the category given by name. Stores XML and blocks
 * to reload later, updates selected accordingly, and clears the workspace
 * and clears undo, then loads the new category. Special case if selected =
 * null, meaning it's the first category so category information doesn't need
 * to be stored.
 * TODO(edauterman): If they've put blocks in a "simple" flyout, give the user
 * the option to put these blocks in a category so they don't lose all their
 * work.
 *
 * @param {String} name name of tab to be opened, must be valid category name
 */
WorkspaceFactory.toggleTabs = function(name) {
    if (name == null) {
      toolboxWorkspace.clear();
      toolboxWorkspace.clearUndo();
      WorkspaceFactory.selected = null;
      return;
    }
    var table = document.getElementById('categoryTable');
    //caches information to reload or generate xml if switching from category
    if (WorkspaceFactory.selected != null) {
      WorkspaceFactory.categoryTabMap.get(WorkspaceFactory.selected).className =
          'taboff';
      WorkspaceFactory.categoryXmlMap.set(WorkspaceFactory.selected,
          Blockly.Xml.workspaceToDom(toolboxWorkspace));
      WorkspaceFactory.categoryTopBlocksMap.set(WorkspaceFactory.selected,
          toolboxWorkspace.getTopBlocks());
    }
    WorkspaceFactory.selected = name;
        WorkspaceFactory.categoryTabMap.get(name).className = 'tabon';
    toolboxWorkspace.clear();
    toolboxWorkspace.clearUndo();
    Blockly.Xml.domToWorkspace(WorkspaceFactory.categoryXmlMap.get(name),
        toolboxWorkspace);
};

/**
 * Copied almost directly from blockToDom from xml.js, but without setting
 * id attribute, making it usable for generating toolbox or flyout xml.
 *
 * @param {!Blockly.Block} block The root block to encode.
 * @return {!Element} Tree of XML elements.
 */
WorkspaceFactory.blockToDomSimple = function(block) {
  var element = goog.dom.createDom(block.isShadow() ? 'shadow' : 'block');
  element.setAttribute('type', block.type);
  if (block.mutationToDom) {
    // Custom data for an advanced block.
    var mutation = block.mutationToDom();
    if (mutation && (mutation.hasChildNodes() || mutation.hasAttributes())) {
      element.appendChild(mutation);
    }
  }
  function fieldToDom(field) {
    if (field.name && field.EDITABLE) {
      var container = goog.dom.createDom('field', null, field.getValue());
      container.setAttribute('name', field.name);
      element.appendChild(container);
    }
  }
  for (var i = 0, input; input = block.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      fieldToDom(field);
    }
  }

  var commentText = block.getCommentText();
  if (commentText) {
    var commentElement = goog.dom.createDom('comment', null, commentText);
    if (typeof block.comment == 'object') {
      commentElement.setAttribute('pinned', block.comment.isVisible());
      var hw = block.comment.getBubbleSize();
      commentElement.setAttribute('h', hw.height);
      commentElement.setAttribute('w', hw.width);
    }
    element.appendChild(commentElement);
  }

  if (block.data) {
    var dataElement = goog.dom.createDom('data', null, block.data);
    element.appendChild(dataElement);
  }

  for (var i = 0, input; input = block.inputList[i]; i++) {
    var container;
    var empty = true;
    if (input.type == Blockly.DUMMY_INPUT) {
      continue;
    } else {
      var childBlock = input.connection.targetBlock();
      if (input.type == Blockly.INPUT_VALUE) {
        container = goog.dom.createDom('value');
      } else if (input.type == Blockly.NEXT_STATEMENT) {
        container = goog.dom.createDom('statement');
      }
      var shadow = input.connection.getShadowDom();
      if (shadow && (!childBlock || !childBlock.isShadow())) {
        container.appendChild(Blockly.Xml.cloneShadow_(shadow));
      }
      if (childBlock) {
        container.appendChild(Blockly.Xml.blockToDom(childBlock));
        empty = false;
      }
    }
    container.setAttribute('name', input.name);
    if (!empty) {
      element.appendChild(container);
    }
  }
  if (block.inputsInlineDefault != block.inputsInline) {
    element.setAttribute('inline', block.inputsInline);
  }
  if (block.isCollapsed()) {
    element.setAttribute('collapsed', true);
  }
  if (block.disabled) {
    element.setAttribute('disabled', true);
  }
  if (!block.isDeletable() && !block.isShadow()) {
    element.setAttribute('deletable', false);
  }
  if (!block.isMovable() && !block.isShadow()) {
    element.setAttribute('movable', false);
  }
  if (!block.isEditable()) {
    element.setAttribute('editable', false);
  }

  var nextBlock = block.getNextBlock();
  if (nextBlock) {
    var container = goog.dom.createDom('next', null,
        Blockly.Xml.blockToDom(nextBlock));
    element.appendChild(container);
  }
  var shadow = block.nextConnection && block.nextConnection.getShadowDom();
  if (shadow && (!nextBlock || !nextBlock.isShadow())) {
    container.appendChild(Blockly.Xml.cloneShadow_(shadow));
  }

  return element;
};

/**
 * Adaped from workspaceToDom, encodes workspace for a particular category
 * in an xml dom
 *
 * @param {!Element} xmlDom Tree of XML elements to be appended to.
 * @param {!Array.<!Blockly.Block>} topBlocks top level blocks to add to xmlDom
 */
WorkspaceFactory.categoryWorkspaceToDom = function(xmlDom, topBlocks) {
    for (var i=0, block; block=topBlocks[i]; i++) {
        xmlDom.appendChild(WorkspaceFactory.blockToDomSimple(block));
    }
};

/**
 * Creates a file and downloads it. Copied almost directly from picklesrus pull
 * request for block factory. In some browsers downloads, and in other browsers,
 * opens new tab with contents.
 *
 * @param {!String} contents material to be written to file
 * @param {!String} filename Name of file
 * @param {!String} fileType Type of file to be downloaded
 */
WorkspaceFactory.createAndDownloadFile = function(contents, filename,
    fileType) {
   var data = new Blob([contents], {type: 'text/' + fileType});
   var clickEvent = new MouseEvent("click", {
     "view": window,
     "bubbles": true,
     "cancelable": false
   });
   var a = document.createElement('a');
   a.href = window.URL.createObjectURL(data);
   a.download = filename;
   a.textContent = 'Download file!';
   a.dispatchEvent(clickEvent);
 };


/**
 * Generates the xml for the toolbox or flyout. If there is only a flyout,
 * only the current blocks are needed, and these are included without
 * a category. If there are categories, then the top blocks from each category
 * are used to generate the xml for that category.
 *
 * @return {!Element} XML element representing toolbox or flyout corresponding
 * to toolbox workspace.
 */
 WorkspaceFactory.generateConfigXml = function() {
  var xmlDom = goog.dom.createDom('xml',
        {
            'id' : 'toolbox',
            'style' : 'display:none'
        });
  if (!WorkspaceFactory.hasCategories) {
    WorkspaceFactory.categoryWorkspaceToDom(xmlDom,
        toolboxWorkspace.getTopBlocks());
  }
  else {
    WorkspaceFactory.categoryTopBlocksMap.set(WorkspaceFactory.selected,
        toolboxWorkspace.getTopBlocks());
    for (var category of WorkspaceFactory.categoryTopBlocksMap.keys()) {
      var categoryElement = goog.dom.createDom('category');
      categoryElement.setAttribute('name',category);
      WorkspaceFactory.categoryWorkspaceToDom(categoryElement,
          WorkspaceFactory.categoryTopBlocksMap.get(category));
      xmlDom.appendChild(categoryElement);
    }
  }
   return xmlDom;
 }

/**
 * Tied to "Export Config" button. Gets a file name from the user and downloads
 * the corresponding configuration xml to that file.
 */
WorkspaceFactory.exportConfig = function() {
   var configXml = Blockly.Xml.domToPrettyText
      (WorkspaceFactory.generateConfigXml());
   var fileName = prompt("File Name: ");
   WorkspaceFactory.createAndDownloadFile(configXml, fileName, 'xml');
 };

/**
 * Tied to "Print Config" button. Mainly used for debugging purposes. Prints
 * the configuration XML to the console.
 */
WorkspaceFactory.printConfig = function() {
  window.console.log(Blockly.Xml.domToPrettyText
      (WorkspaceFactory.generateConfigXml()));
}

/**
 * Tied to "Update Preview" button. Updates the preview workspace based on
 * the toolbox workspace. If no categories, creates a simple flyout. If
 * switching from no categories to categories or categories to no categories,
 * reinjects Blockly with reinjectPreview (more expensive, but shows automatic
 * creation of trashcan, scrollbar, etc.). If updating simple or category
 * display, just updates without reinjecting.
 */
WorkspaceFactory.updatePreview = function() {
  var tree = Blockly.Options.parseToolboxTree
      (WorkspaceFactory.generateConfigXml());
  if (tree.getElementsByTagName('category').length==0) {
    if (previewWorkspace.toolbox_){
      WorkspaceFactory.reinjectPreview(tree);
    } else {
    previewWorkspace.flyout_.show(tree.childNodes);
    }
  } else {
    if (!previewWorkspace.toolbox_) {
      WorkspaceFactory.reinjectPreview(tree);
    } else {
      previewWorkspace.toolbox_.populate_(tree);
    }
  }
};

/**
 * Used to completely reinject the preview workspace. Done when switching from
 * simple flyout to categories, or categories to simple flyout. More expensive.
 *
 * @param {!Element} tree of xml elements
 */
WorkspaceFactory.reinjectPreview = function(tree) {
  previewWorkspace.dispose();
  previewToolbox = Blockly.Xml.domToPrettyText(tree);
  previewWorkspace = Blockly.inject('preview_blocks',
    {grid:
      {spacing: 25,
       length: 3,
       colour: '#ccc',
       snap: true},
     media: '../../media/',
     toolbox: previewToolbox,
     zoom:
       {controls: true,
        wheel: true}
    });
}
