'use strict';

// Test variable for use 
var xmlDoc = loadXMLDoc("test.xml");
var currentNode = xmlDoc.getElementsByTagName("block")[0];

// Loads the xmldoc based on the current blockly setting.
function updateXMLSelection() {
    // If you currently have a node, make sure that if all block id's change you are still selecting the same block.
    if (currentNode){
        var pastId = parseInt(currentNode.getAttribute('id'));
        var idDifference = parseInt(findContainers()[0].getAttribute('id'));

        xmlDoc = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);

        idDifference = parseInt(findContainers()[0].getAttribute('id')) - idDifference;
        jumpToID(pastId + idDifference);
    }
    // Otherwise this is a non-issue
    else {
        xmlDoc = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
        if (!xmlDoc.getElementsByTagName("block")) {
            currentNode = xmlDoc.getElementsByTagName("block")[0];
        }
    }
};

// Import the xml into the file, and update the xml in case of id changes.
function updateBlockSelection() {
    Blockly.Workspace.prototype.clear();
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xmlDoc);
    updateXMLSelection();
}

//#container JUMP_FUNCTIONS

// Sets the current node to the one at the top of this section of blocks
function jumpToTopOfSection() {
    Console.log("Jumping to top of section.");
    currentNode = findTop(currentNode);
    console.log("Going to " + currentNode.nodeName + " with id " + currentNode.getAttribute('id') + " via cycle.");
    updateSelection();
}

// Sets the current node to the one at the bottom of this section of blocks
function jumpToBottompOfSection() {
    Console.log("Jumping to bottom of section.");
    currentNode = findTop(currentNode);
    console.log("Going to " + currentNode.nodeName + " with id " + currentNode.getAttribute('id') + " via cycle.");
    updateSelection();
}

// Jumps between containers.
function jumpToContainer(containerNumber) {
    
    Console.log("Jumping to container " + containerNumber);
    var containers = findContainers();

    // Jump to the appropriate section.
    if (containers[containerNumber]) {
        currentNode = containers[containerNumber];
        console.log("Going to " + currentNode.nodeName + " with id " + currentNode.getAttribute('id'));
        updateSelection();
        return;
    }

    console.log("Container does not exist.");
}

// Jump to a specific id.
function jumpToID(id) {
    Console.log("Jumping to block with id " + id);
    var jumpTo = getBlockNodeById(id);
    if (jumpTo)
    {
        currentNode = jumpTo;
        console.log("Going to " + currentNode.nodeName + " with id " + currentNode.getAttribute('id'));
        updateSelection();
        return;
    }

    console.log("Block with id " + id + " not found.");
}

//#endcontainer

//#container TRAVERSAL_FUNCTIONS

// Goes out of a block
function traverseOut() {
    console.log("traverseOut called.");
    console.log("Attempting to leave " + currentNode.nodeName + " with id " + currentNode.getAttribute('id'));

    // If this is within other blocks, then its parent will be a statement.
    if (findTop(currentNode).parentNode.nodeName == "statement")
    {
        currentNode = findTop(currentNode).parentNode.parentNode;
        console.log("Going to " + currentNode.nodeName + " with id " + currentNode.getAttribute('id'));
        updateSelection();
        return;
    }
    // If it's not, then do nothing, you cannot go in.
    console.log("Cannot traverse outwards from here.");
}

// Goes inside of one block.
function traverseIn(){
    console.log("traverseIn called.");
    console.log("Attempting to leave " + currentNode.nodeName + " with id " + currentNode.getAttribute('id'));

    // Grab the children nodes of the current node, and see if any of them are a statement.
    var children = currentNode.childNodes;
    for (var i = 0; i < children.length; i++) {
        // If you do find a statement, then we're moving straight to that node's child, which is a block.
        if (children[i].nodeName == 'statement') {
            currentNode = children[i].getElementsByTagName("block")[0];
            console.log("Going to " + currentNode.nodeName + " with id " + currentNode.getAttribute('id'));
            updateSelection();
            return;
        } 
    }
    // If you don't, then do nothing, you cannot go in.
    console.log("Cannot traverse inwards from here.");
}

// Goes from one block to the next above it.
function traverseUp(){
    console.log("traverseUp called.");
    console.log("Attempting to leave " + currentNode.nodeName + " with id " + currentNode.getAttribute('id'));

    // If your parent is a next, then its parent must be a block.  So move to it. 
    if (currentNode.parentNode.nodeName == "next") {
        currentNode = currentNode.parentNode.parentNode;
        console.log("Going to " + currentNode.nodeName + " with id " + currentNode.getAttribute('id'));
        updateSelection();
        return;
    }

    // If it's not you're at the top, so then...

    // If cycle is enabled go to the bottom
    if (doCycle)
    {
        currentNode = findBottom(currentNode);
        console.log("Going to " + currentNode.nodeName + " with id " + currentNode.getAttribute('id') + " via cycle.");
        updateSelection();
        return;
    }

    // Otherwise just end.
    //  Otherwise just report that you've hit the bottom.
    console.log("Cannot traverse up, top of list");
}

// Goes from one block to the next below it.
function traverseDown(){
    console.log("traverseDown called.");
    console.log("Attempting to leave " + currentNode.nodeName + " with id " + currentNode.getAttribute('id'));

    // Grab the children nodes of the current node, and see if any of them are a next.
    var children = currentNode.childNodes;
    for (var i = 0; i < children.length; i++)
    {
        // If you do find a next, then we're moving straight to that node.
        if(children[i].nodeName == 'next')
        {
            currentNode = children[i].getElementsByTagName("block")[0];
            console.log("Going to " + currentNode.nodeName + " with id " + currentNode.getAttribute('id'));
            updateSelection();
            return;
        }
    }
    // If you don't find a next then...

    // Cycle back to the top node if cycle is enabled
    if (doCycle)
    {
        currentNode = findTop(currentNode);
        console.log("Going to " + currentNode.nodeName + " with id " + currentNode.getAttribute('id') + " via cycle.");
        updateSelection();
        return;
    }

    //  Otherwise just report that you've hit the bottom.
    console.log("Cannot traverse down, end of list");
}

//#endcontainer

//#container HELPER_FUNCTIONS

// Navigates up to the top of a current section of blocks.
function findTop(myNode) {

    // If the block's parent is a next node, that means it's below another.  Recursively go up.
    if (myNode.parentNode.nodeName == "next")
    {
        myNode = myNode.parentNode.parentNode;
        return findTop(myNode);
    }

    // If it's not the child of a next node, then it's the top node.
    return myNode;
}

// Navigates to the bottom of a section of blocks.
function findBottom(myNode) {

    // Grab the children nodes of the current node, and see if any of them are a next.
    var children = myNode.childNodes;
    for (var i = 0; i < children.length; i++) {
        // If you do find a next, then we're moving straight to the block under.
        if (children[i].nodeName == 'next') {
            myNode = children[i].getElementsByTagName("block")[0];
            return findBottom(myNode);
        }
    }
    // If you can't find a next, you're at the bottom.
    return myNode;

}

// Finds all of the containers in the current xmlstring and returns them.
function findContainers() {

    // Grab all possible containers
    var containers = xmlDoc.documentElement.childNodes;

    // Need to remove parts that aren't blocks in case of #text's appearing for some reason.  we only want to deal with blocks.
    for (var i = containers.length - 1; i >= 0; i--) {
        if (containers[i].nodeName != 'block') {
            containers.splice(i, 1);
        }
    }

    return containers;
}

// Selects the current selected blockly block.
function updateSelection() {
    Blockly.Block.getById(parseInt(currentNode.getAttribute('id')),workspace).select()
}

// Gets a specific node based on the block id.
function getBlockNodeById(id) {
    // Go through every block until you find the one with the right id
    var myBlocks = xmlDoc.getElementsByTagName('block');
    for (var i = 0; i < myBlocks.length; i++) {
        if (parseInt(myBlocks[i].getAttribute('id')) == id) {
            return myBlocks[i];
        }
    }
    // If you don't hit it return null.
    return null;
}

//#endcontainer