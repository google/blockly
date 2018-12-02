
goog.require('Blockly.Blocks');
goog.require('Blockly');

goog.provide('Blockly.Blocks.arduino');  // Deprecated
goog.provide('Blockly.Constants.arduino');  // deprecated, 2018 April 5


Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
    {
        "type": "arduino_start",
        "message0": "Setup (Runs Once) %1 %2 Loops Forever %3 %4",
        "args0": [
            {
                "type": "input_dummy"
            },
            {
                "type": "input_statement",
                "name": "setup"
            },
            {
                "type": "input_dummy"
            },
            {
                "type": "input_statement",
                "name": "loop"
            }
        ],
        "colour": 135,
        "tooltip": "",
        "helpUrl": ""
    }
]);