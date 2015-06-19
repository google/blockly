'use strict';

/**
*Copyright [2015] [Rachael Bosley, Luna Meier]
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

var map = [];
var keyboardState = 'hotkeyMode';

/**
 * When a mouseup event happens, update the XML selection
 */
document.onmouseup = function(e){
	console.log('Mouse Up');
	updateXmlSelection();
};

/**
 * Take care of keypresses for accessibility
 */
document.onkeydown = document.onkeyup = function(e){
	
	e = e || event;
	map[e.keyCode] = e.type == 'keydown';	
	
	if(keyboardState=='typingMode'){ //if you are typing, hotkeys disabled
		return;
	}	

	if(keyboardState=='menuMode'){ //within the category select menu
		if(map[49]){ //1 
			console.log("Within A menu, 1 key pressed.");
			//Enter the first list
			keyboardState='menuKeyOne';
		}
		if(map[50]){ //2
			console.log("Within A menu, 1 key pressed.");
			//Enter the second list
			keyboardState='menuKeyTwo';
		}
		if(map[51]){ //3
			console.log("Within A menu, 1 key pressed.");
			//Enter the third list
			keyboardState='menuKeyThree';
		}
		if(map[52]){ //4
			console.log("Within A menu, 1 key pressed.");
			//Enter the fourth list
			keyboardState='menuKeyFour';
		}
		if(map[53]){ //5
			console.log("Within A menu, 1 key pressed.");
			//Enter the fifth list
			keyboardState='menuKeyFive';
		}
		if(map[54]){ //6
			console.log("Within A menu, 1 key pressed.");
			//Enter the sixth list
			keyboardState='menuKeySix';
		}
		if(map[55]){ //7
			console.log("Within A menu, 1 key pressed.");
			//Enter the seventh list
			keyboardState='menuKeySeven';
		}
		//If another block category is added, add it down here
	}

	if(keyboardState=='hotkeyMode'){	
		if (map[17] && map[90]){ //Ctrl Z
			console.log("Control Z pressed.");
		    //Need to implement Undo
			undo();
			e.preventDefault();
		}
		
		else if(map[17] && map[89]){ //Ctrl Y
			console.log("Control Y pressed.");
		    //Need to implement Redo
			redo();
			e.preventDefault();
		}
		
		else if(map[9] && map[16]){ //Tab Shift
			console.log("Tab Shift pressed.");
			e.preventDefault();
			//Go backwards through the same level of code
		}
		
		else if(map[9]){ //Tab
			console.log("Tab key pressed.");
			//Go through the same level of code
		}
			
		else if(map[188]){ //Comma
			console.log("Comma key pressed.");
			//Traverse forward within a block with fields
		}
		
		else if(map[190]){ //Period
			console.log("Period key pressed.");
			//Traverse backward within a block with fields
		}
		
		else if(map[46]){ //Delete
			console.log("Delete key pressed.");
			//Delete the currently selected item
			updateXmlSelection();
			e.preventDefault();
		}
		
		else if(map[27]){ //Escape
			console.log("Escape key pressed.");
			//Get out of the current menu
			e.preventDefault();
		}
		
		else if(map[77]){ //M
			console.log("M key pressed.");
			//This should initiate menu mode
			//This should initiate a menu to add a block using hotkeys
			keyboardState='menuMode';	
		}
		
		else if(map[67]){ //C
			console.log("C key pressed.");
			keyboardState= 'typingMode';
			e.preventDefault;
			keyboardState= 'hotkeyMode'; //This needs to be at the end of the comment function
		}
		
		else if(map[69]){ //E
			console.log("E key pressed.");
			//Edit block of code or edit comment
		}
		
		else if(map[71]){ //G
			console.log("G key pressed.");
			commentOrBlockJump();
			//Goto the block the comment that is currently selected is from
			//Alternatively goto the comment that is connected to the currently selected block
		}
		
		else if(map[78]){ //N
			console.log("N key pressed.");
			//Initiate a navigate search function
		}
		
		else if(map[82]){ //R
			console.log("R key pressed.");
			getImportantBlocks();
			//Return to top of the code
		}
		
		else if(map[13]){ //Enter
			console.log('Enter key pressed.');
			updateXmlSelection();
		}
		
		//Arrow keys for development purposes.  Switch as needed for proper usage.
		
		else if(map[37] || map[65]){ //left arrow or A
			traverseOut();
		}
		
		else if(map[38] || map[87]){ //up arrow or W
			traverseUp();
		}
		
		else if(map[39] || map[68]){ //right arrow or D
			traverseIn();
		}
		
		else if(map[40] || map[83]){ //down arrow or S
			traverseDown();
		}
		//End of development block
	}
};
