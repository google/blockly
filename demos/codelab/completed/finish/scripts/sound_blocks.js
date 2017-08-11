Blockly.Blocks['play_sound'] = {
  init: function() {
    this.jsonInit({
      "message0": "Play %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "VALUE",
          "options": [
            ["C4", "sounds/c4.m4a"],
            ["D4", "sounds/d4.m4a"],
            ["E4", "sounds/e4.m4a"],
            ["F4", "sounds/f4.m4a"],
            ["G4", "sounds/g4.m4a"],
            ["A4", "sounds/a4.m4a"],
            ["B4", "sounds/b4.m4a"],
            ["C5", "sounds/c5.m4a"]
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 355,
      "tooltip": "",
      "helpUrl": ""
    });
  }
};

Blockly.JavaScript['play_sound'] = function(block) {
  var value = '\'' + block.getFieldValue('VALUE') + '\'';
  return 'MusicMaker.queueSound(' + value + ');\n';
};
