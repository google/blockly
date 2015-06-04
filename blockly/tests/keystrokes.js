var map = [];

document.onkeydown = document.onkeyup = function(e){
	
	e = e || event;
	map[e.keyCode] = e.type == 'keydown';
	if (map[17] && map[90]){ //Ctrl Z
		console.log("Control Z pressed.");
		//Need to implement Undo
		e.preventDefault();
	}
	
	else if(map[17] && map[82]){ //Ctrl R
		console.log("Control R pressed.");
		//Need to implement Redo
		e.preventDefault();
	}
	
	else if(map[16] && map[188]){ //Shift Comma
		console.log("Shift Comma pressed.");
		//Might be used to traverse individual blocks
		e.preventDefault();
	}
	
	else if(map[16] && map[190]){ //Shift Period
		console.log("Shift Period pressed.");
		//Might be used to traverse individual blocks
		e.preventDefault();
	}
	
	else switch(e.keyCode){
		//Arrow keys for development purposes.  Switch as needed for proper usage.
		
		case 37: //left
			traverseOut();
			break;
		case 38: //up
			traverseUp();
			break;
		case 39: //right
			traverseIn();
			break;
		case 40: //down
			traverseDown();
			break;
		
		//end of development block
		
		
		case 9: //Tab
			console.log("Tab key pressed.");
			e.preventDefault();
			break;
		
		case 65: //A
			console.log("A key pressed.");
			//This should initiate a menu to add a block using hotkeys
			//Hotkey functionality in the menu needs to be determined
			break;
			
		case 78: //N
			console.log("N key pressed.");
			//Initiate a navigate search function
			break;
			
		case 79: //O
			console.log("O key pressed.");
			//Option to initiate open navigation (this might be thrown out)
			break;
		
		case 67: //C
			console.log("C key pressed.");
			//Write a comment on the most recently selected block
			break;
			
		case 71: //G
			console.log("G key pressed.");
			//Goto the block the comment that is currently selected is from
			//Alternatively goto the comment that is connected to the currently selected block
			break;
			
		case 69: //E
			console.log("E key pressed.");
			//Edit block of code or edit comment
			break;
			
		case 188: //comma
			console.log("Comma key pressed.");
			//Traverse farther into the block layers
			break;
		
		case 190: //period
			console.log("Period key pressed.");
			//Traverse up out of block layers
			break;
			
		case 46: //delete
			console.log("Delete key pressed.");
			//Delete the currently selected item
			e.preventDefault();
			break;
			
		case 27: //escape
			console.log("Escape key pressed.");
			//Get out of the current menu
			e.preventDefault();
			break;
	
	}
	

};