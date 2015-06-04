// Test variable for use 
var xmlDoc = loadXMLDoc("test.xml");
var currentNode = xmlDoc.getElementsByTagName("block")[0];

// If doCycle is true, then when you at the bottom of a series of blocks you go to the top upon pressing down, and vice versa.
var doCycle = true;


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
    }

    //  Otherwise just report that you've hit the bottom.
    console.log("Cannot traverse down, end of list");
}

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