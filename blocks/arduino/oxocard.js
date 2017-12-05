'use strict';

goog.provide('Blockly.Blocks.oxocard');

goog.require('Blockly.Blocks');


Blockly.Blocks['oxocard_turn_off_with_buttons'] = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
	this.appendDummyInput()
	  .appendField("OXOcard ausschalten.")
	this.appendDummyInput()
		.appendField("Klicke die Tasten, mit denen du wieder")
	this.appendDummyInput()
		.appendField("einschalten möchtest:")
	this.appendDummyInput()
		.appendField(new Blockly.FieldButton(35,35,"L1"),"L1")
		.appendField(new Blockly.FieldPlaceholder(180,50))
		.appendField(new Blockly.FieldButton(35,35,"R1"),"R1")
	this.appendDummyInput()
		.appendField(new Blockly.FieldButton(35,35,"L2"),"L2")
		.appendField(new Blockly.FieldButton(35,35,"L3"),"L3")
		.appendField(new Blockly.FieldPlaceholder(70,60))
		.appendField(new Blockly.FieldButton(35,35,"R3"),"R3")
		.appendField(new Blockly.FieldButton(35,35,"R2"),"R2")
	// this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip("Tooltip");
		this.setColour('#000000');
	}
};

Blockly.Blocks['oxocard_statemachine'] = {
	init: function() {
		this.setColour('#000000');
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.appendDummyInput().appendField('Statemachine');
		this.setMutator(new Blockly.Mutator(['oxocard_statemachine_state']));
		this.setTooltip('Does something based on state.');
		this.states_ = [];
		//this.stateCount_ = 0;
	},
  
	mutationToDom: function() {
		if(!this.stateCount_) {
			return null;
		}
		var container = document.createElement('mutation');
		if (this.stateCount_) {
			container.setAttribute('state', this.stateCount_);
		}
		return container;
	},
  
	domToMutation: function(xmlElement) {
		this.stateCount_ = parseInt(xmlElement.getAttribute('state'), 10);
		for (var i = 0; i < this.stateCount_; i++) {
			this.appendValueInput('STATE' + i).appendField('state');
		}
	},

	decompose: function(workspace) {
		var containerBlock = Blockly.Block.obtain(workspace, 'oxocard_statemachine_wrapper');
		containerBlock.initSvg();
		var connection = containerBlock.getInput('STACK').connection;
		for (var i = 0; i < this.stateCount_; i++) {
			var stateBlock = Blockly.Block.obtain(workspace, 'oxocard_statemachine_state');
			stateBlock.initSvg();
			connection.connect(stateBlock.previousConnection);
			connection = stateBlock.nextConnection;
		}
		return containerBlock;
	},
  
	compose: function(containerBlock) {
		for(var i=0; i<this.states_.length;i++){
			this.removeInput('STATE' + i);
		}
		this.states_ = [];
		var stateBlock = containerBlock.getInputTargetBlock('STACK');
		while (stateBlock) {
			if(stateBlock.type != 'oxocard_statemachine_state'){
				console.warn('Invalid BlockType.');
				stateBlock = stateBlock.nextConnection && stateBlock.nextConnection.targetBlock();
				continue;
			}
			
			var stateInput = this.appendStatementInput('STATE' + this.states_.length).appendField(stateBlock.getFieldValue('NAME'));
			this.states_.push(stateBlock.getFieldValue('NAME'));
			if (stateBlock.statementConnection_) {
				stateInput.connection.connect(stateBlock.statementConnection_);
			}
			stateBlock = stateBlock.nextConnection && stateBlock.nextConnection.targetBlock();
		}
	},

	saveConnections: function(containerBlock) {
		var stateBlock = containerBlock.getInputTargetBlock('STACK');
		var i = 0;
		while (stateBlock) {
			if(stateBlock.type != 'oxocard_statemachine_state'){
				console.warn('Invalid BlockType');
				stateBlock = stateBlock.nextConnection && stateBlock.nextConnection.targetBlock();
				continue;
			}
			var stateInput = this.getInput('STATE' + i);
			stateBlock.statementConnection_ = stateInput && stateInput.connection.targetConnection;
			i++;
			stateBlock = stateBlock.nextConnection && stateBlock.nextConnection.targetBlock();
		}
	}
};

Blockly.Blocks['oxocard_statemachine_wrapper'] = {
	init: function() {
		this.setColour('#000000');
		this.appendDummyInput()
			.appendField('Statemachine');
		this.appendStatementInput('STACK');
		this.setTooltip('This is the statemachine.');
		this.contextMenu = false;
	}
};

Blockly.Blocks['oxocard_statemachine_state'] = {
	init: function() {
		var field = new Blockly.FieldTextInput('', this.validator_);
		this.setColour('#000000');
		this.appendDummyInput().appendField('State').appendField(field, 'NAME');
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip('This is a state');
		this.contextMenu = false;
	}
};
