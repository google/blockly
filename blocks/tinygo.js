/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Code generator for the test 2 blocks.
 */
'use strict';

goog.provide('Blockly.TinyGo');

goog.require('Blockly.Go');
goog.require('Blockly.Types');

Blockly.TinyGo.init = function(workspace) {
    Blockly.TinyGo.variables_ = [];
    Blockly.TinyGo.pins_ = [];
    Blockly.TinyGo.imports_ = [];
};

Blockly.TinyGo.addImport = function(id, path) {
    Blockly.TinyGo.imports_[id] = path;
};

Blockly.TinyGo.addVariable = function(id, variable) {
    Blockly.TinyGo.variables_[id] = variable;
};

Blockly.TinyGo.addDeclaration = function(id, data) {
    Blockly.TinyGo.pins_[id] = data;
};

Blockly.TinyGo.configurePin = function(id, pinNumber, mode) {
    Blockly.TinyGo.variables_[id] = 'const ' + id + ' = machine.Pin(' + pinNumber + ')';
    Blockly.TinyGo.pins_[id] = id + '.Configure(machine.PinConfig{Mode: machine.Pin' + mode + '})';
    Blockly.TinyGo.imports_['machine'] = 'machine';
};

Blockly.Blocks['tinygo_led'] = {
    /**
     * Grove LED module block definition.
     * @this Blockly.Block
     */
    init: function() {

        var connectorIo = [];
        for (var i = 0; i < 14; i++) {
            connectorIo.push(['D' + i.toString(), i.toString()]);
        }

        this.setHelpUrl('http://www.seeedstudio.com/wiki/Grove_-_LED');
        this.setColour(180);
        this.appendValueInput('STATE')
            .appendField(new Blockly.FieldImage(
                '../blocks/img/led.png', 32, 32))
            .appendField("LED on pin")
            .appendField(new Blockly.FieldDropdown(connectorIo), 'PINNUMBER')
            .setCheck(Blockly.Types.LEDSTATE.checkList);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip("Tooltip LED");
    },
    /**
     * Updates the content of the the pin related fields.
     * @this Blockly.Block
     */
    updateFields: function() {
        Blockly.Arduino.Boards.refreshBlockFieldDropdown(
            this, 'PINNUMBER', 'groveDigital');
    },
    /**
     * Returns a list with the connector used pins. For this block just the first.
     * @this Blockly.Block
     * @return {!Array<string>} List of used pins by this block.
     */
    connectorPinUsage: function() {
        return [this.getFieldValue('PINNUMBER')];
    }
};

Blockly.Go['tinygo_led'] = function(block) {
    var pins = block.connectorPinUsage();
    var stateOutput = Blockly.Go.valueToCode(
        block, 'STATE', Blockly.Go.ORDER_ATOMIC) || false;

    //Blockly.Go.reservePin(
    //  block, pins[0], Blockly.Go.PinTypes.GROVE_LED, 'this Grove module');

    Blockly.TinyGo.configurePin('ledPin' + pins[0], pins[0], 'Output');
    if (stateOutput == 'true') {
        return 'ledPin' + pins[0] + '.High()\n';
    }
    return 'ledPin' + pins[0] + '.Low()\n';
};


Blockly.Types.LEDSTATE = new Blockly.Type({
    typeId: 'LedState',
    typeMsgName: 'ARD_TYPE_BOOL',
    compatibleTypes: []
});


Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
    // Block for boolean data type: true and false.
    {
        "type": "tinygo_led_state",
        "message0": "%1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "BOOL",
                "options": [
                    ["HIGH", "TRUE"],
                    ["LOW", "FALSE"]
                ]
            }
        ],
        "output": "LedState",
        "style": "logic_blocks",
        "tooltip": "tooltip",
        "helpUrl": "helpurl"
    },
    {
        "type": "tinygo_led_complete",
        "message0": "%3 set LED %1 to %2",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "PIN",
                "options": [
                    [
                        "D0",
                        "0"
                    ],
                    [
                        "D1",
                        "1"
                    ],
                    [
                        "D2",
                        "2"
                    ],
                    [
                        "D3",
                        "3"
                    ],
                    [
                        "D4",
                        "4"
                    ],
                    [
                        "D5",
                        "5"
                    ],
                    [
                        "D6",
                        "6"
                    ],
                    [
                        "D7",
                        "7"
                    ],
                    [
                        "D8",
                        "8"
                    ],
                    [
                        "D9",
                        "9"
                    ],
                    [
                        "D10",
                        "10"
                    ],
                    [
                        "D11",
                        "11"
                    ],
                    [
                        "D12",
                        "12"
                    ],
                    [
                        "D13",
                        "13",
                        "machine.D13"
                    ]
                ]
            },
            {
                "type": "field_dropdown",
                "name": "STATE",
                "options": [
                    [
                        "HIGH",
                        "High"
                    ],
                    [
                        "LOW",
                        "Low"
                    ]
                ]
            },
            {
                "type": "field_image",
                "src": "../blocks/img/led.png",
                "width": 32,
                "height": 32
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 180,
        "tooltip": "",
        "helpUrl": ""
    },
    {
        "type": "tinygo_goroutine",
        "message0": "go routine %1",
        "args0": [
            {
                "type": "input_statement",
                "name": "GR0",
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "logic_blocks",
        "helpUrl": "%{BKY_CONTROLS_IF_HELPURL}",
        "extensions": ["controls_if_tooltip"]
    },
    {
        "type": "tinygo_time_sleep",
        "message0": "sleep %1 %2",
        "args0": [
            {
                "type": "field_number",
                "name": "AMOUNT",
                "value": 500,
                "min": 0
            },
            {
                "type": "field_dropdown",
                "name": "UNIT",
                "options": [
                    [
                        "Milliseconds",
                        "time.Millisecond"
                    ],
                    [
                        "Microseconds",
                        "time.Microseconds"
                    ],
                    [
                        "Seconds",
                        "time.Second"
                    ]
                ]
            }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "",
        "helpUrl": ""
    }
]);

Blockly.Go['tinygo_led_state'] = function(block) {
    var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
    return [code, Blockly.Go.ORDER_ATOMIC];
};


Blockly.Go['tinygo_goroutine'] = function(block) {
    var inputDo = this.getInput('GR');

    var code = '', branchCode, conditionCode;
    branchCode = Blockly.Go.statementToCode(block, 'GR0');

    let lines = branchCode.split('\n');
    if (lines.length > 2) {
        code = 'go func() {\n' + branchCode + '}()\n';
    } else {
        code = 'go ' + branchCode;
    }
    ;


    return code;
};

Blockly.Go['tinygo_time_sleep'] = function(block) {
    Blockly.TinyGo.imports_['time'] = 'time';
    var amount = block.getFieldValue('AMOUNT');
    var unit = block.getFieldValue('UNIT');
    var code = 'time.Sleep(' + amount + ' * ' + unit + ')\n';
    return code;
};

Blockly.Go['tinygo_led_complete'] = function(block) {
    var state = block.getFieldValue('STATE');
    var pin = block.getFieldValue('PIN');
    Blockly.TinyGo.configurePin('ledPin' + pin, 'machine.D'+pin, 'Output');

    return 'ledPin' + pin + '.' + state + '()\n';
};
