'use strict';

goog.provide('Blockly.FlyoutNav');




/*
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

/*
* File overview: this file handles using the keyboard to navigate the flyout
*/



/*
 * class to handle menu navigation
 * @constructor
 */
Blockly.FlyoutNav = function(){

};

/*
*   Variables for flyout navigation
*   flyoutArr: everytime the flyout opens the blocks in it are added to this array
*   oldLengh : size of the array before a new tab opened 
*   currIndex: index of currently selected block
*   prevIndex: index of last selected block
*   opened   : keep track of when the flyout opens and closes 
*             (needed for selecting blocks when a new category opens)
*   currentFlyoutArr: array containing all currently shown blocks
*/
 var flyoutNav = {
    flyoutArr: [],   
    oldLength: 0,    
    currIndex: 0,    
    prevIndex: 0,
    opened: false, 
    currentFlyoutArr: []
};
 
/*
* Handles Keyboard input in the toolbox/flyout
* @param {event}
*/
Blockly.Toolbox.TreeNode.prototype.onKeyDown = function(e) {

  var handled = true; //used for preventing the screen from scrolling

  switch (e.keyCode) {

    case goog.events.KeyCodes.UP:

      //select previous block
      if(this.getExpanded()){
        Blockly.FlyoutNav.prototype.flyoutNavUp();
      }

      //select previous category
      else{
        var previousSibling = this.getPreviousSibling(this.selected);

        //if not the top category
        if(previousSibling != null){
           previousSibling.select();
        }

      }
      break;

    case goog.events.KeyCodes.DOWN:

      //select next block
      if(this.getExpanded()){
            Blockly.FlyoutNav.prototype.flyoutNavDown();
      }

      //select next category
      else{
        var nextSibling = this.getNextSibling(this.selected);

        //if not the bottome category
        if(nextSibling != null){
             nextSibling.select();
        }
       
      }
      break;

    //exit flyout to select categories 
    case goog.events.KeyCodes.LEFT:

      if(this.getExpanded()){
          this.setExpanded(false);
          flyoutNav.flyoutArr[flyoutNav.prevIndex].removeSelect();
      }
    break;

    //move inside the flyout to select blocks
    case goog.events.KeyCodes.RIGHT:
        this.select();
        this.setExpanded(true);
        Blockly.FlyoutNav.prototype.flyoutNavDown();
    break;

    default:
      handled = false;
    break;
  }

// clear type ahead buffer as user navigates with arrow keys
  if (handled) {
    e.preventDefault();
    var t = this.getTree();
    if (t) {
      t.clearTypeAhead();
    }
    this.updateRow();
  }
  return handled;
};




/**
 * Hide and empty the flyout.
 */
Blockly.Flyout.prototype.hide = function() {
flyoutNav.opened = false;

  if (!this.isVisible()) {
    return;
  }
  this.svgGroup_.style.display = 'none';
  // Delete all the event listeners.
  for (var x = 0, listen; listen = this.listeners_[x]; x++) {
    Blockly.unbindEvent_(listen);
  }
  this.listeners_.length = 0;
  if (this.reflowWrapper_) {
    Blockly.unbindEvent_(this.reflowWrapper_);
    this.reflowWrapper_ = null;
  }
  // Do NOT delete the blocks here.  Wait until Flyout.show.
  // https://neil.fraser.name/news/2014/08/09/
};



/*
*   Traverse to the next block in the flyout 
*/
Blockly.FlyoutNav.prototype.flyoutNavDown = function(){


    //prevent this from being called when the flyout is closed
    if(!flyoutNav.opened){
        return;
    }

    //remove last select if not the first and the new flyout has more than 2 blocks
    if(flyoutNav.currIndex-1 >= 0 && !(flyoutNav.currIndex <= flyoutNav.oldLength) && flyoutNav.flyoutArr.length - flyoutNav.oldLength != 2 ){

        flyoutNav.flyoutArr[flyoutNav.currIndex-1].removeSelect();
    }

    //handle looping through menu
    // if on top block               ||  switching directions at the bottom of the menu                    && in variables menu 
    if(flyoutNav.currIndex >= flyoutNav.flyoutArr.length ||  (flyoutNav.prevIndex == flyoutNav.currIndex + 1 && flyoutNav.currIndex + 2 >= flyoutNav.flyoutArr.length) && !(flyoutNav.flyoutArr.length - flyoutNav.oldLength == 2)){
        
        flyoutNav.currIndex = flyoutNav.oldLength;
        flyoutNav.prevIndex = flyoutNav.flyoutArr.length-1; 

        flyoutNav.flyoutArr[flyoutNav.prevIndex].removeSelect();
    }

    //handle flyouts with only 2 blocks
    if(flyoutNav.flyoutArr.length - flyoutNav.oldLength == 2){

        //if bottom block is selected
        if(flyoutNav.currIndex >= flyoutNav.flyoutArr.length-1){

            flyoutNav.currIndex = flyoutNav.oldLength;
            flyoutNav.prevIndex = flyoutNav.flyoutArr.length-1;

            flyoutNav.flyoutArr[flyoutNav.currIndex].addSelect();
            flyoutNav.flyoutArr[flyoutNav.prevIndex].removeSelect();

            flyoutNav.prevIndex = flyoutNav.oldLength;
        }

        //if top block is selected
        else if(flyoutNav.currIndex <= flyoutNav.oldLength){

            flyoutNav.currIndex = flyoutNav.flyoutArr.length-1;
            flyoutNav.prevIndex = flyoutNav.oldLength;

            flyoutNav.flyoutArr[flyoutNav.currIndex].addSelect();
            flyoutNav.flyoutArr[flyoutNav.prevIndex].removeSelect();

            flyoutNav.prevIndex = flyoutNav.flyoutArr.length-1;

        }
    }

   //handle switching directions && more than two blocks in flyout
   if( flyoutNav.prevIndex == flyoutNav.currIndex+1  && flyoutNav.flyoutArr.length - flyoutNav.oldLength !=2){

        flyoutNav.flyoutArr[flyoutNav.prevIndex].removeSelect();
        flyoutNav.currIndex+=2;
    }

    //Update count for flyouts with more than 2 blocks
    //select next -> save last -> increase count 
    if(flyoutNav.flyoutArr.length - flyoutNav.oldLength != 2){

        flyoutNav.flyoutArr[flyoutNav.currIndex].addSelect(); 

        flyoutNav.prevIndex = flyoutNav.currIndex; 
        flyoutNav.currIndex++;
    }
};




/*
*   Traverse to the previous block in the flyout 
*/
Blockly.FlyoutNav.prototype.flyoutNavUp = function(){
    if(!flyoutNav.opened){
        return;
    }
    //flyout has more than 2 blocks    &&  not first selected   || not second item on list
    if(flyoutNav.flyoutArr.length-flyoutNav.oldLength != 2 &&  flyoutNav.currIndex != flyoutNav.oldLength || flyoutNav.prevIndex == flyoutNav.oldLength+1)
    {
        flyoutNav.flyoutArr[flyoutNav.prevIndex].removeSelect();
    }

    //handle loops 
    //top block selected                          || In audio menu (only 1 block)                               || trying to switch directions at the top of the flyout && In flyout with only 2 blocks   
    if(flyoutNav.currIndex <= flyoutNav.oldLength-1  || (flyoutNav.flyoutArr.length - flyoutNav.oldLength == 1) || (flyoutNav.prevIndex == flyoutNav.currIndex-1 && flyoutNav.currIndex-2 < flyoutNav.oldLength && (flyoutNav.flyoutArr.length - flyoutNav.oldLength != 2))){
        
        flyoutNav.prevIndex = flyoutNav.oldLength;
        flyoutNav.currIndex = flyoutNav.flyoutArr.length-1;

        flyoutNav.flyoutArr[flyoutNav.prevIndex].removeSelect();
    }

    //if flyout has only 2 blocks
    if(flyoutNav.flyoutArr.length - flyoutNav.oldLength == 2){

        //Otherwise switch blocks
        //bottom block
        if(flyoutNav.currIndex == flyoutNav.flyoutArr.length-1){

            flyoutNav.currIndex = flyoutNav.oldLength;
            flyoutNav.prevIndex = flyoutNav.oldLength;

            flyoutNav.flyoutArr[flyoutNav.currIndex].addSelect();
            flyoutNav.flyoutArr[flyoutNav.flyoutArr.length-1].removeSelect();
        }

        //top block
        else if(flyoutNav.currIndex == flyoutNav.oldLength){

            flyoutNav.currIndex = flyoutNav.flyoutArr.length-1;
            flyoutNav.prevIndex = flyoutNav.flyoutArr.length-1;

            flyoutNav.flyoutArr[flyoutNav.currIndex].addSelect();
            flyoutNav.flyoutArr[flyoutNav.oldLength].removeSelect();
        }

    }

    //handle switching from down to up
    //normal switch scenario     && not the first block   && flyout has more than 2 blocks
    if(flyoutNav.prevIndex == flyoutNav.currIndex-1  && flyoutNav.currIndex!=flyoutNav.oldLength  && (flyoutNav.flyoutArr.length-flyoutNav.oldLength!=2)){

        flyoutNav.flyoutArr[flyoutNav.prevIndex].removeSelect();
        flyoutNav.currIndex-=2;
    }

    //flyout has more than 2 blocks
    if(flyoutNav.flyoutArr.length - flyoutNav.oldLength != 2){

        //select next -> save last -> decrease count 
        flyoutNav.flyoutArr[flyoutNav.currIndex].addSelect();

        flyoutNav.prevIndex = flyoutNav.currIndex;
        flyoutNav.currIndex--; 
    }
};


//============The following are minor overwrites of existing blockly functions to enable flyout navigation======================


// *
//  * {OVERWRITE} adds blocks to separate array for traversing the flyout
//  * Construct the blocks required by the flyout for the procedure category.
//  * @param {!Array.<!Blockly.Block>} blocks List of blocks to show.
//  * @param {!Array.<number>} gaps List of widths between blocks.
//  * @param {number} margin Standard margin width for calculating gaps.
//  * @param {!Blockly.Workspace} workspace The flyout's workspace.
 
Blockly.Procedures.flyoutCategory = function (blocks, gaps, margin, workspace) {
    flyoutNav.opened    = true;

    if (Blockly.Blocks['procedures_defnoreturn']) {
        var block = Blockly.Block.obtain(workspace, 'procedures_defnoreturn');
        block.initSvg();
        blocks.push(block);
        flyoutNav.flyoutArr.push(block);//added for blockly navigation.js
        gaps.push(margin * 2);
    }
    if (Blockly.Blocks['procedures_defreturn']) {
        var block = Blockly.Block.obtain(workspace, 'procedures_defreturn');
        block.initSvg();
        blocks.push(block);
        flyoutNav.flyoutArr.push(block);//added for blockly navigation.js
        gaps.push(margin * 2);
    }
    if (Blockly.Blocks['procedures_ifreturn']) {
        var block = Blockly.Block.obtain(workspace, 'procedures_ifreturn');
        block.initSvg();
        blocks.push(block);
        flyoutNav.flyoutArr.push(block);//added for blockly navigation.js
        gaps.push(margin * 2);
    }
    if (gaps.length) {
        // Add slightly larger gap between system blocks and user calls.
        gaps[gaps.length - 1] = margin * 3;
    }

    function populateProcedures(procedureList, templateName) {
        for (var x = 0; x < procedureList.length; x++) {
            var block = Blockly.Block.obtain(workspace, templateName);
            block.setFieldValue(procedureList[x][0], 'NAME');
            var tempIds = [];
            for (var t = 0; t < procedureList[x][1].length; t++) {
                tempIds[t] = 'ARG' + t;
            }
            block.setProcedureParameters(procedureList[x][1], tempIds);
            block.initSvg();
            blocks.push(block);
            flyoutNav.flyoutArr.push(block);//added for blockly navigation.js

            gaps.push(margin * 2);
        }
    }

    var tuple = Blockly.Procedures.allProcedures(workspace.targetWorkspace);
    populateProcedures(tuple[0], 'procedures_callnoreturn');
    populateProcedures(tuple[1], 'procedures_callreturn');
};

/**
 * {Overwrite} tracks status of flyout and updates the array of current blocks.
 * Show and populate the flyout.
 * @param {!Array|string} xmlList List of blocks to show.
 *     Variables and procedures have a custom set of blocks.
 */
Blockly.Flyout.prototype.show = function(xmlList){
    flyoutNav.opened    = true;
    flyoutNav.oldLength = flyoutNav.flyoutArr.length; //update the length of the last array 


    if(flyoutNav.oldLength > 0){ //ignore first time opening
        flyoutNav.currIndex  = flyoutNav.oldLength;
    }

    // Delete any blocks from a previous showing.
    var blocks = this.workspace_.getTopBlocks(false);
    for (var x = 0, block; block = blocks[x]; x++) {
        if (block.workspace == this.workspace_) {
            block.dispose(false, false);
        }
    }
    // Delete any background buttons from a previous showing.
    for (var x = 0, rect; rect = this.buttons_[x]; x++) {
        goog.dom.removeNode(rect);
    }
    this.buttons_.length = 0;

    var margin = this.CORNER_RADIUS;
    this.svgGroup_.style.display = 'block';

    // Create the blocks to be shown in this flyout.
    var blocks = [];
    var gaps = [];
    if (xmlList == Blockly.Variables.NAME_TYPE) {
        // Special category for variables.
        Blockly.Variables.flyoutCategory(blocks, gaps, margin,
            /** @type {!Blockly.Workspace} */ (this.workspace_));
    } else if (xmlList == Blockly.Procedures.NAME_TYPE) {
        // Special category for procedures.
        Blockly.Procedures.flyoutCategory(blocks, gaps, margin,
            /** @type {!Blockly.Workspace} */ (this.workspace_));
    } else {
        for (var i = 0, xml; xml = xmlList[i]; i++) {
            if (xml.tagName && xml.tagName.toUpperCase() == 'BLOCK') {
                var block = Blockly.Xml.domToBlock(
                    /** @type {!Blockly.Workspace} */(this.workspace_), xml);
                blocks.push(block);
                flyoutNav.flyoutArr.push(block);
                gaps.push(margin * 3);
            }
        }
    }
    // Lay out the blocks vertically.
    var cursorY = margin;
    for (var i = 0, block; block = blocks[i]; i++) {
        var allBlocks = block.getDescendants();
        for (var j = 0, child; child = allBlocks[j]; j++) {
            // Mark blocks as being inside a flyout.  This is used to detect and
            // prevent the closure of the flyout if the user right-clicks on such a
            // block.
            child.isInFlyout = true;
            // There is no good way to handle comment bubbles inside the flyout.
            // Blocks shouldn't come with predefined comments, but someone will
            // try this, I'm sure.  Kill the comment.
            child.setCommentText(null);
        }
        block.render();
        var root = block.getSvgRoot();
        var blockHW = block.getHeightWidth();
        var x = this.RTL ? 0 : margin + Blockly.BlockSvg.TAB_WIDTH;
        block.moveBy(x, cursorY);
        cursorY += blockHW.height + gaps[i];

        // Create an invisible rectangle under the block to act as a button.  Just
        // using the block as a button is poor, since blocks have holes in them.
        var rect = Blockly.createSvgElement('rect', { 'fill-opacity': 0 }, null);
        // Add the rectangles under the blocks, so that the blocks' tooltips work.
        this.workspace_.getCanvas().insertBefore(rect, block.getSvgRoot());
        block.flyoutRect_ = rect;
        this.buttons_[i] = rect;

        if (this.autoClose) {
            this.listeners_.push(Blockly.bindEvent_(root, 'mousedown', null,
                this.createBlockFunc_(block)));
        } else {
            this.listeners_.push(Blockly.bindEvent_(root, 'mousedown', null,
                this.blockMouseDown_(block)));
        }
        this.listeners_.push(Blockly.bindEvent_(root, 'mouseover', block,
            block.addSelect));
        this.listeners_.push(Blockly.bindEvent_(root, 'mouseout', block,
            block.removeSelect));
        this.listeners_.push(Blockly.bindEvent_(rect, 'mousedown', null,
            this.createBlockFunc_(block)));
        this.listeners_.push(Blockly.bindEvent_(rect, 'mouseover', block,
            block.addSelect));
        this.listeners_.push(Blockly.bindEvent_(rect, 'mouseout', block,
            block.removeSelect));
    }



    // IE 11 is an incompetant browser that fails to fire mouseout events.
    // When the mouse is over the background, deselect all blocks.
    var deselectAll = function (e) {
        var blocks = this.workspace_.getTopBlocks(false);
        for (var i = 0, block; block = blocks[i]; i++) {
            block.removeSelect();
        }
    };
    this.listeners_.push(Blockly.bindEvent_(this.svgBackground_, 'mouseover',
        this, deselectAll));

    this.width_ = 0;
    this.reflow();

    this.filterForCapacity_();

    // Fire a resize event to update the flyout's scrollbar.
    Blockly.fireUiEventNow(window, 'resize');
    this.reflowWrapper_ = Blockly.bindEvent_(this.workspace_.getCanvas(),
    'blocklyWorkspaceChange', this, this.reflow);
    this.workspace_.fireChangeEvent();

};

/**
 * {OVERWRITE} tracks status of flyout and updates the array of current blocks.
 * Construct the blocks required by the flyout for the variable category.
 * @param {!Array.<!Blockly.Block>} blocks List of blocks to show.
 * @param {!Array.<number>} gaps List of widths between blocks.
 * @param {number} margin Standard margin width for calculating gaps.
 * @param {!Blockly.Workspace} workspace The flyout's workspace.
 */
Blockly.Variables.flyoutCategory = function (blocks, gaps, margin, workspace) {
    flyoutNav.opened    = true;
    var variableList = Blockly.Variables.allVariables(workspace.targetWorkspace);
    variableList.sort(goog.string.caseInsensitiveCompare);
    // In addition to the user's variables, we also want to display the default
    // variable name at the top.  We also don't want this duplicated if the
    // user has created a variable of the same name.
    variableList.unshift(null);
    var defaultVariable = undefined;
    for (var i = 0; i < variableList.length; i++) {
        if (variableList[i] === defaultVariable) {
            continue;
        }
        var getBlock = Blockly.Blocks['variables_get'] ?
            Blockly.Block.obtain(workspace, 'variables_get') : null;
        getBlock && getBlock.initSvg();
        var setBlock = Blockly.Blocks['variables_set'] ?
            Blockly.Block.obtain(workspace, 'variables_set') : null;
        setBlock && setBlock.initSvg();
        if (variableList[i] === null) {
            defaultVariable = (getBlock || setBlock).getVars()[0];
        } else {
            getBlock && getBlock.setFieldValue(variableList[i], 'VAR');
            setBlock && setBlock.setFieldValue(variableList[i], 'VAR');
        }
        setBlock && blocks.push(setBlock);
        flyoutNav.flyoutArr.push(setBlock);//added for blockly navigation.js
        getBlock && blocks.push(getBlock);
        flyoutNav.flyoutArr.push(getBlock);//added for blockly navigation.js
        if (getBlock && setBlock) {
            gaps.push(margin, margin * 3);
        } else {
            gaps.push(margin * 2);
        }
    }
};


