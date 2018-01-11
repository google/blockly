'use strict';

goog.provide('Blockly.Blocks.oxocard');

goog.require('Blockly.Blocks');
goog.require('Blockly');


Blockly.Blocks['oxocard_button_ispressed'] = {
  helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.OXOCARD_BUTTON_PRESSED_TITLE)
        .appendField(new Blockly.FieldDropdown([["L1", "L1"],
                      ["L2", "L2"],  ["L3", "L3"], ["R1", "R1"], ["R2", "R2"],
                      ["R3", "R3"]]), "BUTTON");
	this.setOutput(true, 'Boolean');
    this.setTooltip(Blockly.Msg.OXOCARD_BUTTON_PRESSED_TIP);
    this.setColour('#000000');
  },
  getBlockType: function() {
    return Blockly.Types.BOOLEAN;
  }
};

Blockly.Blocks.oxocard_turn_off = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.OXOCARD_TURN_OXOCARD_OFF_TITLE);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_TURN_OXOCARD_OFF_TIP);
		this.setColour('#000000');
	}
};

Blockly.Blocks['oxocard_turn_off_with_buttons'] = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
	this.appendDummyInput()
	  .appendField(Blockly.Msg.OXOCARD_TURN_OXOCARD_OFF_TITLE)
	this.appendDummyInput()
		.appendField(Blockly.Msg.OXOCARD_TURN_OXOCARD_OFF_TITLE2)
	this.appendDummyInput()
		.appendField(Blockly.Msg.OXOCARD_TURN_OXOCARD_OFF_TITLE3)
	this.appendDummyInput()
		.appendField(new Blockly.FieldButton(35,35,"L1"),"L1")
		.appendField(new Blockly.FieldPlaceholder(200,50))
		.appendField(new Blockly.FieldButton(35,35,"R1"),"R1")
	this.appendDummyInput()
		.appendField(new Blockly.FieldButton(35,35,"L2"),"L2")
		.appendField(new Blockly.FieldButton(35,35,"L3"),"L3")
		.appendField(new Blockly.FieldPlaceholder(104,60))
		.appendField(new Blockly.FieldButton(35,35,"R3"),"R3")
		.appendField(new Blockly.FieldButton(35,35,"R2"),"R2")
		// this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_TURN_OXOCARD_OFF_TIP2);
		this.setColour('#000000');
	}
};

Blockly.Blocks.oxocard_handle_autoturnoff = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.OXOCARD_AUTO_TURNOFF_TITLE);
		this.appendValueInput("TIMEOUT", 'Timeout')
			.appendField(Blockly.Msg.OXOCARD_AUTO_TURNOFF_TIMEOUT_FIELD)
			.setCheck('Number');
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_AUTO_TURNOFF_TIP);
		this.setColour('#000000');
	}
};

Blockly.Blocks.oxocard_disable_auto_turnoff = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.OXOCARD_NO_AUTO_TURNOFF_TITLE);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_NO_AUTO_TURNOFF_TIP);
		this.setColour('#000000');
	}
};

Blockly.Blocks.oxocard_connect_to_internet = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.OXOCARD_CONNECT_TO_INTERNET_TITLE);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_CONNECT_TO_INTERNET_TIP);
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


/* ---------- Accelerometer ---------- */
Blockly.Blocks.oxocard_get_acceleration = {
  helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.OXOCARD_GET_ACCELERATION_TITLE)
        .appendField(new Blockly.FieldDropdown([["X", "X"], ["Y", "Y"], ["Z", "Z"]]), "AXIS")
    this.setOutput(true, 'Number');
    this.setTooltip(Blockly.Msg.OXOCARD_GET_ACCELERATION_TIP);
    this.setColour('#000000');
  },
  getBlockType: function() {
    return Blockly.Types.NUMBER;
  }
};

Blockly.Blocks['oxocard_is_orientation'] = {
  helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.OXOCARD_IS_ORIENTATION_TITLE)
        .appendField(new Blockly.FieldDropdown([[Blockly.Msg.OXOCARD_IS_ORIENTATION_UP_FIELD, "UP"],
                      [Blockly.Msg.OXOCARD_IS_ORIENTATION_DOWN_FIELD, "DOWN"],
                      [Blockly.Msg.OXOCARD_IS_ORIENTATION_HORIZONTALLY_FIELD, "HORIZONTALLY"],
                      [Blockly.Msg.OXOCARD_IS_ORIENTATION_VERTICALLY_FIELD, "VERTICALLY"]]), "DIRECTION")
    this.setOutput(true, 'Boolean');
    this.setTooltip(Blockly.Msg.OXOCARD_IS_ORIENTATION_TIP);
    this.setColour('#000000');
  },
  getBlockType: function() {
    return Blockly.Types.BOOLEAN;
  }
};

Blockly.Blocks.oxocard_set_cursor = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.OXOCARD_SET_CURSOR_TITLE);
		this.appendValueInput('X')
			.appendField('x')
			.setCheck('Number')
			.setAlign(Blockly.ALIGN_RIGHT);
		this.appendValueInput('Y')
			.appendField('y')
			.setCheck('Number')
			.setAlign(Blockly.ALIGN_RIGHT);
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_SET_CURSOR_TIP);
		this.setColour('#000000');
	}
};



/* ---------- Weather ---------- */
Blockly.Blocks.oxocard_get_weather = {
  helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.OXOCARD_WEATHER_GET_FROM_TITLE)
        .appendField(new Blockly.FieldDropdown([["Adelboden", "67350"],
					["Basel", "66010"], ["Bern", "66310"], ["Chasseral", "66050"],
					["Chur", "67860"], ["Genf", "67000"], ["Interlaken", "67340"],
					["Jungfraujoch", "67300"], ["Lugano", "67700"], ["Luzern", "66500"],
					["Schaffhausen", "66200"], ["Sion", "67200"], ["StGallen", "66810"],
					["Zuerich", "66700"]]), "CITY")
	this.setPreviousStatement(true, null);
	this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.OXOCARD_WEATHER_GET_FROM_TIP);
    this.setColour('#000000');
  }
};

Blockly.Blocks.oxocard_weather_get_value = {
  helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.OXOCARD_WEATHER_GET_VALUE_TITLE)
        .appendField(new Blockly.FieldDropdown([[Blockly.Msg.OXOCARD_WEATHER_GET_VALUE_TEMP, "Temparature"],
					[Blockly.Msg.OXOCARD_WEATHER_GET_VALUE_DEWPOINT, "DewPoint"],
					[Blockly.Msg.OXOCARD_WEATHER_GET_VALUE_HUMIDITY, "Humidity"],
					[Blockly.Msg.OXOCARD_WEATHER_GET_VALUE_WIND, "Wind"],
					[Blockly.Msg.OXOCARD_WEATHER_GET_VALUE_PRECIPITATION, "Precipitation"]]), "TYPE")
    this.setOutput(true, 'Number');
    this.setTooltip(Blockly.Msg.OXOCARD_WEATHER_GET_VALUE_TIP);
    this.setColour('#000000');
  },
  getBlockType: function() {
    return Blockly.Types.DECIMAL;
  }
};

Blockly.Blocks.oxocard_weather_get_city = {
  helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.OXOCARD_WEATHER_GET_CITY_TITLE)
    this.setOutput(true, 'Text');
    this.setTooltip(Blockly.Msg.OXOCARD_WEATHER_GET_CITY_TIP);
    this.setColour('#000000');
  },
  getBlockType: function() {
    return Blockly.Types.TEXT;
  }
};

Blockly.Blocks.oxocard_weather_get_icon = {
  helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.OXOCARD_WEATHER_GET_ICON_TITLE)
    this.setOutput(true, 'Number');
    this.setTooltip(Blockly.Msg.OXOCARD_WEATHER_GET_ICON_TIP);
    this.setColour('#000000');
  },
  getBlockType: function() {
    return Blockly.Types.NUMBER;
  }
};


/* ---------- Communication ---------- */
Blockly.Blocks.oxocard_comm_enable = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendValueInput('NAME')
			.appendField(Blockly.Msg.OXOCARD_COMM_ENABLE_TITLE).setCheck('Text').setAlign(Blockly.ALIGN_RIGHT);
		// this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_COMM_ENABLE_TIP);
		this.setColour('#000000');
	}
};

Blockly.Blocks.oxocard_comm_disable = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.OXOCARD_COMM_DISABLE_TITLE);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_COMM_DISABLE_TIP);
		this.setColour('#000000');
	}
};

Blockly.Blocks.oxocard_comm_wait_for_message = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.OXOCARD_COMM_WAIT_FOR_MESSAGE_TITLE);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_COMM_WAIT_FOR_MESSAGE_TIP);
		this.setColour('#000000');
	}
};

Blockly.Blocks.oxocard_comm_wait_for_message_timeout = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.OXOCARD_COMM_WAIT_FOR_MESSAGE_TITLE);
		this.appendValueInput("TIMEOUT", 'Timeout')
			.appendField(Blockly.Msg.OXOCARD_COMM_WAIT_FOR_MESSAGE_TIMEOUT_FIELD)
			.setCheck('Number');
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_COMM_WAIT_FOR_MESSAGE_TIMEOUT_TIP);
		this.setColour('#000000');
	}
};

Blockly.Blocks.oxocard_comm_send_broadcast_message = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendValueInput('MSG')
			.appendField(Blockly.Msg.OXOCARD_COMM_SEND_BROADCAST_MESSAGE_TITLE).setCheck('Text').setAlign(Blockly.ALIGN_RIGHT);
		// this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_COMM_SEND_BROADCAST_MESSAGE_TIP);
		this.setColour('#000000');
	}
};

Blockly.Blocks.oxocard_comm_send_broadcast_number = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendValueInput('NUM')
			.appendField(Blockly.Msg.OXOCARD_COMM_SEND_BROADCAST_NUMBER_TITLE).setCheck('Number').setAlign(Blockly.ALIGN_RIGHT);
		// this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_COMM_SEND_BROADCAST_NUMBER_TIP);
		this.setColour('#000000');
	}
};

Blockly.Blocks.oxocard_comm_send_broadcast_messageand_number = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendValueInput('MSG')
			.appendField(Blockly.Msg.OXOCARD_COMM_SEND_BROADCAST_MESSAGE_TITLE).setCheck('Text').setAlign(Blockly.ALIGN_RIGHT);
		this.appendValueInput('NUM')
			.appendField(Blockly.Msg.OXOCARD_COMM_SEND_BROADCAST_NUMBER_FIELD).setCheck('Number').setAlign(Blockly.ALIGN_RIGHT);
		// this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_COMM_SEND_BROADCAST_MESSAGE_AND_NUMBER_TIP);
		this.setColour('#000000');
	}
};

Blockly.Blocks.oxocard_comm_check_for_broadcast = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.OXOCARD_COMM_CHECK_FOR_BROADCAST_TITLE);
		this.setOutput(true, 'Boolean');
		this.setTooltip(Blockly.Msg.OXOCARD_COMM_CHECK_FOR_BROADCAST_TIP);
		this.setColour('#000000');
	},
    getBlockType: function() {
      return Blockly.Types.BOOLEAN;
    }
};

Blockly.Blocks.oxocard_comm_compare_broadcast_message = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendValueInput('MSG')
			.appendField(Blockly.Msg.OXOCARD_COMM_COMPARE_BROADCAST_MESSAGE_TITLE).setCheck('Text').setAlign(Blockly.ALIGN_RIGHT);
		// this.setInputsInline(true);
		this.setOutput(true, 'Boolean');
		this.setTooltip(Blockly.Msg.OXOCARD_COMM_COMPARE_BROADCAST_MESSAGE_TIP);
		this.setColour('#000000');
	},
    getBlockType: function() {
      return Blockly.Types.BOOLEAN;
    }
};

Blockly.Blocks.oxocard_comm_compare_broadcast_number = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendValueInput('NUM')
			.appendField(Blockly.Msg.OXOCARD_COMM_COMPARE_BROADCAST_NUMBER_TITLE).setCheck('Number').setAlign(Blockly.ALIGN_RIGHT);
		// this.setInputsInline(true);
		this.setOutput(true, 'Boolean');
		this.setTooltip(Blockly.Msg.OXOCARD_COMM_COMPARE_BROADCAST_NUMBER_TIP);
		this.setColour('#000000');
	},
    getBlockType: function() {
      return Blockly.Types.BOOLEAN;
    }
};

Blockly.Blocks.oxocard_comm_get_broadcast_number = {
  helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.OXOCARD_COMM_GET_BROADCAST_NUMBER_TITLE)
    this.setOutput(true, 'Number');
    this.setTooltip(Blockly.Msg.OXOCARD_COMM_GET_BROADCAST_NUMBER_TIP);
    this.setColour('#000000');
  },
  getBlockType: function() {
    return Blockly.Types.NUMBER;
  }
};
