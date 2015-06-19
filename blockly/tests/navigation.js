'use strict';

/**
*Copyright [2015] [Luna Meier]
*
*Licensed under the Apache License, Version 2.0 (the "License");
*you may not use this file except in compliance with the License.
*You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
*Unless required by applicable law or agreed to in writing, software
*distributed under the License is distributed on an "AS IS" BASIS,
*WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*See the License for the specific language governing permissions and
*limitations under the License.
*/

var xmlDoc = null;
var currentNode = null;

var undoStack = [];
var redoStack = [];

//#region XML_UPDATING

// Default functions for our hooks.
Blockly.BlockSvg.prototype.defaultSelect = Blockly.BlockSvg.prototype.select;
Blockly.Block.prototype.defaultInitialize = Blockly.Block.prototype.initialize;
Blockly.BlockSvg.prototype.defaultDispose = Blockly.BlockSvg.prototype.dispose;
Blockly.Connection.prototype.defaultConnect = Blockly.Connection.prototype.connect;
Blockly.Connection.prototype.defaultDisconnect = Blockly.Connection.prototype.disconnect;

/**
 * Select this block.  Highlight it visually.
 */
Blockly.BlockSvg.prototype.select = function () {

    this.defaultSelect();

    console.log(getBlockNodeById(this.id));
    if (getBlockNodeById(this.id)) {
        currentNode = getBlockNodeById(this.id);
        console.log(this.id);
    }
};

/**
 * Initialization for one block.
 * @param {!Blockly.Workspace} workspace The new block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 */
Blockly.Block.prototype.initialize = function (workspace, prototypeName) {
    this.defaultInitialize(workspace, prototypeName);
};

/**
 * Dispose of this block.
 * @param {boolean} healStack If true, then try to heal any gap by connecting
 *     the next statement with the previous statement.  Otherwise, dispose of
 *     all children of this block.
 * @param {boolean} animate If true, show a disposal animation and sound.
 * @param {boolean} opt_dontRemoveFromWorkspace If true, don't remove this
 *     block from the workspace's list of top blocks.
 */
Blockly.BlockSvg.prototype.dispose = function (healStack, animate,
                                              opt_dontRemoveFromWorkspace) {
    this.defaultDispose(healStack, animate, opt_dontRemoveFromWorkspace);

    updateXmlSelection(true);
};

/**
 * Connect this connection to another connection.
 * @param {!Blockly.Connection} otherConnection Connection to connect to.
 */
Blockly.Connection.prototype.connect = function (otherConnection) {
    this.defaultConnect(otherConnection);
}

/**
 * Disconnect this connection.
 */
Blockly.Connection.prototype.disconnect = function () {
    this.defaultDisconnect();
};

Array.prototype.contains = function(element) {
    return this.indexOf(element) > -1;
}

 /**
 * Initialize accessibility properties
 * @override
 */
Blockly.Toolbox.TreeNode.prototype.initAccessibility = function() {
  goog.ui.tree.BaseNode.prototype.initAccessibility.call(this);
  
  var el = this.getElement();
  el.setAttribute('tabIndex', 0);
  
  //Register the onKeyDown handler because nothing else does
  Blockly.bindEvent_(el, 'keydown', this, this.onKeyDown);
};

/**
 * Handles a key down event.
 * @param {!goog.events.BrowserEvent} e The browser event.
 * @return {boolean} The handled value.
 * @override
 */
Blockly.Toolbox.TreeNode.prototype.onKeyDown = function(e) {
  var handled = true;
  switch (e.keyCode) {
    case goog.events.KeyCodes.RIGHT:
      if (e.altKey) {
        break;
      }
      // Expand icon.
      if (this.hasChildren() && this.isUserCollapsible_) {
        this.setExpanded(true);
        this.select();
      } else {
        this.select();
      }
      break;

    case goog.events.KeyCodes.LEFT:
      if (e.altKey) {
        break;
      }
      this.setExpanded(false);
      this.getTree().setSelectedItem(null);
      break;

    default:
      handled = false;
  }

  if (handled) {
    e.preventDefault();
    var t = this.getTree();
    if (t) {
      // clear type ahead buffer as user navigates with arrow keys
      t.clearTypeAhead();
    }
    this.updateRow();
  }

  return handled;
};

//#endregion


/**
 * Loads the xmldoc based on the current blockly setting.
 * @param {boolean} Optional paramater.  If true, then don't select a block after updating the xml.
 */
function updateXmlSelection(noSelect) {
	
    var prevXml = xmlDoc;

	console.log('UpdateXML');
	
    if (noSelect)
    {
        xmlDoc = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
        currentNode = null;
    }


   // console.log('Updating XML.');
    // If you currently have a node, make sure that if all block id's change you are still selecting the same block.
    if (currentNode) {
        //console.log('Maintaining Position');
        var pastId = parseInt(currentNode.getAttribute('id'));
        var idDifference = parseInt(findContainers()[0].getAttribute('id'));

        xmlDoc = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);

        idDifference = parseInt(findContainers()[0].getAttribute('id')) - idDifference;
        jumpToID(pastId + idDifference);
    }
        // Otherwise this is a non-issue
    else {
        //console.log('Finding block.');
        xmlDoc = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
        if (!xmlDoc.getElementsByTagName('BLOCK')) {
            currentNode = xmlDoc.getElementsByTagName('BLOCK')[0];
        }
    }

    // Check to see if we are adding this to the undo/redo stack
    if(xmlDoc != prevXml)
    {
        // If we are, remember the previous xml selection, and clear the redo stack.
        undoStack.push(prevXml);
        redoStack = [];
    }
};

/**
 * Undo the previous action
 */
function undo() {
    if(undoStack.length <= 1)
    {
        return;
    }

    // Go back to the previous, keep track of stuff in case you want to redo, and update the scene.
    redoStack.push(xmlDoc);
    xmlDoc = undoStack.pop();
    updateBlockSelection();
}

/**
 * Undo your undo.
 */
function redo() {
    if (redoStack.length == 0) {
        return;
    }

    // Go back to the previous, keep track of stuff in case you want to redo, and update the scene.
    undoStack.push(xmlDoc);
    xmlDoc = redoStack.pop();
    updateBlockSelection();
}


/**
 * Import the xml into the file, and update the xml in case of id changes.
 */
function updateBlockSelection() {
    Blockly.Workspace.prototype.clear();
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xmlDoc);
    updateXmlSelection();
}

//#region JUMP_FUNCTIONS

/**
 * Sets the current node to the one at the top of this section of blocks
 */
function jumpToTopOfSection() {

    if (!currentNode) {
        console.log('Nothing Selected.')
        return;
    }

    console.log('Jumping to top of section.');
    currentNode = findTop(currentNode);
    console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id') + ' via cycle.');
    updateSelection();
}

/**
 * Sets the current node to the one at the bottom of this section of blocks
 */
function jumpToBottompOfSection() {

    if (!currentNode) {
        console.log('Nothing Selected.')
        return;
    }

    console.log('Jumping to bottom of section.');
    currentNode = findTop(currentNode);
    console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id') + ' via cycle.');
    updateSelection();
}

/**
 * Jumps between containers (the very outside of block groups).
 * @param {int} The container's number that you are jumping to
 */
function jumpToContainer(containerNumber) {

    console.log('Jumping to container ' + containerNumber);
    var containers = findContainers();

    // Jump to the appropriate section.
    if (containers[containerNumber]) {
        currentNode = containers[containerNumber];
        console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));
        updateSelection();
        return;
    }

    console.log('Container does not exist.');
}

/**
 * Jump to a specific id.
 * @param {int} The id of the block that you are jumping to
 */
function jumpToID(id) {
    console.log('Jumping to block with id ' + id);
    var jumpTo = getBlockNodeById(id);
    if (jumpTo) {
        currentNode = jumpTo;
        console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));
        updateSelection();
        return;
    }

    console.log('Block with id ' + id + ' not found.');
}

//#endregion

//#region TRAVERSAL_FUNCTIONS

/**
 * Goes out of a block to go up a level
 */
function traverseOut() {

    if (!currentNode) {
        console.log('Nothing Selected.')
        return;
    }

    console.log('traverseOut called.');
    console.log('Attempting to leave ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));

    // If this is within other blocks, then its parent will be a statement.
    if (findTop(currentNode).parentNode.nodeName.toUpperCase() == 'STATEMENT') {
        currentNode = findTop(currentNode).parentNode.parentNode;
        console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));
        updateSelection();
        return;
    }
    // If it's not, then do nothing, you cannot go in.
    console.log('Cannot traverse outwards from here.');
}

/** 
 * Goes inside of one block to go down a level
 */
function traverseIn() {

    if (!currentNode) {
        console.log('Nothing Selected.')
        return;
    }

    console.log('traverseIn called.');
    console.log('Attempting to leave ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));

    // Grab the children nodes of the current node, and see if any of them are a statement.
    var children = currentNode.childNodes;
    for (var i = 0; i < children.length; i++) {
        // If you do find a statement, then we're moving straight to that node's child, which is a block.
        if (children[i].nodeName.toUpperCase() == 'STATEMENT') {
            currentNode = children[i].getElementsByTagName('BLOCK')[0];
            console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));
            updateSelection();
            return;
        }
    }
    // If you don't, then do nothing, you cannot go in.
    console.log('Cannot traverse inwards from here.');
}

/**
 * Goes from one block to the next above it (no travel between layers)
 */
function traverseUp() {

    if (!currentNode) {
        console.log('Nothing Selected.')
        return;
    }

    console.log('traverseUp called.');
    console.log('Attempting to leave ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));

    // If your parent is a next, then its parent must be a block.  So move to it. 
    if (currentNode.parentNode.nodeName.toUpperCase() == 'NEXT') {
        currentNode = currentNode.parentNode.parentNode;
        console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));
        updateSelection();
        return;
    }

    // If it's not you're at the top, so then...

    // If cycle is enabled go to the bottom
    if (doCycle) {
        currentNode = findBottom(currentNode);
        console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id') + ' via cycle.');
        updateSelection();
        return;
    }

    // Otherwise just end.
    //  Otherwise just report that you've hit the bottom.
    console.log('Cannot traverse up, top of list');
}

/**
 * Goes from one block to the next below it (no travel between layers)
 */
function traverseDown() {

    if (!currentNode) {
        console.log('Nothing Selected.')
        return;
    }

    console.log('traverseDown called.');
    console.log('Attempting to leave ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));

    // Grab the children nodes of the current node, and see if any of them are a next.
    var children = currentNode.childNodes;
    for (var i = 0; i < children.length; i++) {
        // If you do find a next, then we're moving straight to that node.
        if (children[i].nodeName.toUpperCase() == 'NEXT') {
            currentNode = children[i].getElementsByTagName('BLOCK')[0];
            console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));
            updateSelection();
            return;
        }
    }
    // If you don't find a next then...

    // Cycle back to the top node if cycle is enabled
    if (doCycle) {
        currentNode = findTop(currentNode);
        console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id') + ' via cycle.');
        updateSelection();
        return;
    }

    //  Otherwise just report that you've hit the bottom.
    console.log('Cannot traverse down, end of list');
}

//#endregion

//#region HELPER_FUNCTIONS

/**
 * Navigates up to the top of a current section of blocks. Gets
 * to the top of the current indentation.
 * @param {myNode} Any node to be navigated from
 * @return {myNode} The top node in the level
 */
function findTop(myNode) {
    // If the block's parent is a next node, that means it's below another.  Recursively go up.
    if (myNode.parentNode.nodeName.toUpperCase() == 'NEXT') {
        myNode = myNode.parentNode.parentNode;
        return findTop(myNode);
    }
    // If it's not the child of a next node, then it's the top node.
    return myNode;
}

/** 
 * Navigates to the bottom of a section of blocks.
 * @param {node} Any node to be navigated from
 * @return {node} The bottom node in the level
 */
function findBottom(myNode) {

    // Grab the children nodes of the current node, and see if any of them are a next.
    var children = myNode.childNodes;
    for (var i = 0; i < children.length; i++) {
        // If you do find a next, then we're moving straight to the block under.
        if (children[i].nodeName.toUpperCase() == 'NEXT') {
            myNode = children[i].getElementsByTagName('BLOCK')[0];
            return findBottom(myNode);
        }
    }
    // If you can't find a next, you're at the bottom.
    return myNode;

}

/**
 * Finds all of the containers in the current xmlstring and returns them.
 */
function findContainers() {


    // There is something weird going on with the xml parent child relationship.  For some reason I can't directly 
    // grab the XML node, but this seems to work.  Further investigation needed.
    // I know that the first block is always going to be a region, so this should work
    // until a more clean solution is found.
    var containers = xmlDoc.getElementsByTagName('BLOCK')[0].parentNode.childNodes;

    // Need to remove parts that aren't blocks in case of #text's appearing for some reason.  we only want to deal with blocks.
    for (var i = containers.length - 1; i >= 0; i--) {
        if (containers[i].nodeName.toUpperCase() != 'BLOCK') {
            containers.splice(i, 1);
        }
    }

    return containers;
}

/**
 * Selects the block that you are currently on the node of
 */
function updateSelection() {

    if (!currentNode) {
        console.log('Nothing Selected.')
        return;
    }

    Blockly.Block.getById(parseInt(currentNode.getAttribute('id')), workspace).select()
}

/**
 * Gets a specific node based on the block id.
 * @param {int} the block id number 
 * @return {node} the block node
 */
function getBlockNodeById(id) {

    if (!xmlDoc || !xmlDoc.getElementsByTagName('BLOCK')) {
        return null;
    }

    // Go through every block until you find the one with the right id
    var myBlocks = xmlDoc.getElementsByTagName('BLOCK');
    for (var i = 0; i < myBlocks.length; i++) {
        if (parseInt(myBlocks[i].getAttribute('id')) == id) {
            return myBlocks[i];
        }
    }
    // If you don't hit it return null.
    return null;
}

//#endregion