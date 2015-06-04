"use strict";

// Test variable for use 
var xmlDoc = loadXMLDoc("test.xml");
var currentNode = xmlDoc.getElementsByTagName("block")[0];

//#region TRAVERSAL_FUNCTIONS

// Goes out of a block
function traverseOut() {
	console.log("traverseOut called.");
}

// Goes inside of one block.
function traverseIn(){
	console.log("traverseIn called.");
}

// Goes from one block to the next above it.
function traverseUp(){
    console.log("traverseUp called.");
    console.log("Attempting to leave " + currentNode.nodeName + " with id " + currentNode.getAttribute('id'));

    // If your parent is a next, then its parent must be a block.  So move to it. 
    if (currentNode.parentNode.nodeName == "next") {
        currentNode = currentNode.parentNode.parentNode;
        console.log("Going to " + currentNode.nodeName + " with id " + currentNode.getAttribute('id'));
        return;
    }

    // If it's not you're at the top, so then...

    // If cycle is enabled go to the bottom
    if (doCycle)
    {
        currentNode = findBottom(currentNode);
        console.log("Going to " + currentNode.nodeName + " with id " + currentNode.getAttribute('id') + " via cycle.");
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
            return;
        }
    }
    // If you don't find a next then...

    // Cycle back to the top node if cycle is enabled
    if (doCycle)
    {
        currentNode = findTop(currentNode);
        console.log("Going to " + currentNode.nodeName + " with id " + currentNode.getAttribute('id') + " via cycle.");
        return;
    }

    //  Otherwise just report that you've hit the bottom.
    console.log("Cannot traverse down, end of list");
}

//#endregion

//#region HELPER_FUNCTIONS

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

//#endregion