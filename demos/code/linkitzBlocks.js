Blockly.Blocks['getmotiondata'] = {
  init: function() {
  	this.appendDummyInput()
		.appendField(new Blockly.FieldImage("Petal_Top_Motion_Preview.jpg", 64, 64, "GetMotionData"));
    this.setOutput(true, "Array");
    this.setColour(210);
    this.setTooltip('Get Motion Data');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['getmotiondata'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['getmicdata'] = {
  init: function() {
  	this.appendDummyInput()
		.appendField(new Blockly.FieldImage("Petal_Top_Mic_Preview.jpg", 64, 64, "GetMicData"));
    this.setOutput(true, "Array");
    this.setColour(330);
    this.setTooltip('Get Mic Data');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['getmicdata'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};






Blockly.Blocks['onmotiontrigger'] = {
  init: function() {
  	this.appendDummyInput()
		.appendField(new Blockly.FieldImage("Petal_Top_Motion_Preview.jpg", 64, 64, "GetMotionData"));
	this.appendDummyInput()
		.appendField(new Blockly.FieldDropdown([["tap","tap"],["click","click"],["donemoving","done moving"]]),"interruptModes");	
    this.appendStatementInput("EventCode");
    this.setColour(210);
    this.setTooltip('Motion Trigger');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['onmotiontrigger'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};





Blockly.Blocks['ledoutput'] = {
  init: function() {
    this.appendValueInput("ledcolor")
        .setCheck("Array")
        .appendField(new Blockly.FieldImage("Petal_Top_LED_Preview.jpg", 50, 50, "LEDLink"));
    this.setInputsInline(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(290);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['ledoutput'] = function(block) {
  var value_ledcolor = Blockly.JavaScript.valueToCode(block, 'ledcolor', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};