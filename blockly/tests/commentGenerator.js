/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview object that retrieves an array of blocks in the workspace and generates comments.
 * @author Alex Bowen
 */

goog.provide('Blockly.Workspace');
goog.require('goog.math');

/**
* function that retrieves the array of blocks within the workspace
*/
Blockly.CommentGenerator.prototype.getArray = function() {
	var allBlocks = Blockly.Workspace.prototype.getAllBlocks;
	return allBlocks;
};

/**
* function that generates the comment structure
*/
Blockly.CommentGenerator.prototype.generateComments = function() {
	var blockArray = getArray;
	var allComments = null;
	for (var i = 0; i <= blockArray; i++) {
		var currentComment = blockArray[i].getCommentFromXML();
		if(blockArray[i].hasComment == True) {
			//ask luna how to identify if the block is nested or not.
			if(blockArray[i].isTopBlock(id) == True) {
				//pass block to comment area with <ul> or <span>
				//ex.) allComments.add("<ul>"This is the comment in the block"</ul>")
			};
			else {
				//check for how deeply nested the index is and then give it an <li> or <p>
				//to match up with their <ul> or <span>
			};
		};
	};
	return allComments;
};

/**
* function that will return true if the block at the given id has a comment or false if it doesn't
*/
Blockly.CommentGenerator.prototype.hasComment = function(id) {
	if(block.getID(id).comment != null) {
		return true;
	};
	else {
		return false;
	};
};