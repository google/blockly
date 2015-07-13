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