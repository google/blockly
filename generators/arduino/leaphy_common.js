/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Code generator for Leaphy Common Blocks.
 */
'use strict';

goog.provide('Blockly.Arduino.LeaphyCommon');

goog.require('Blockly.Arduino');

Blockly.Arduino['leaphy_start'] = function (block) {
    // Define the Start procedure
    var funcName = 'leaphyProgram';
    var branch = Blockly.Arduino.statementToCode(block, 'STACK');
    if (Blockly.Arduino.STATEMENT_PREFIX) {
        var id = block.id.replace(/\$/g, '$$$$');  // Issue 251.
        branch = Blockly.Arduino.prefixLines(
            Blockly.Arduino.STATEMENT_PREFIX.replace(/%1/g,
                '\'' + id + '\''), Blockly.Arduino.INDENT) + branch;
    }
    if (Blockly.Arduino.INFINITE_LOOP_TRAP) {
        branch = Blockly.Arduino.INFINITE_LOOP_TRAP.replace(/%1/g,
            '\'' + block.id + '\'') + branch;
    }
    var returnType = 'void';
    var code = returnType + ' ' + funcName + '() {\n' + branch + '}\n';

    code = Blockly.Arduino.scrub_(block, code);
    // Add % so as not to collide with helper functions in definitions list.
    Blockly.Arduino.definitions_['%' + funcName] = code;
    Blockly.Arduino.setups_['setup_leaphy_start'] = funcName + '();';
    return null;
};


Blockly.Arduino['leaphy_serial_print_line'] = function(block) {
    Blockly.Arduino.addSetup('serial', 'Serial.begin(115200);', false);
    var value = Blockly.Arduino.valueToCode(this, 'VALUE', Blockly.Arduino.ORDER_ATOMIC) || '0';
    var code = 'Serial.println(' + value + ');\n';
    return code;
};

Blockly.Arduino['leaphy_serial_print_value'] = function(block) {
    Blockly.Arduino.addSetup('serial', 'Serial.begin(115200);', false);
    var name = Blockly.Arduino.valueToCode(this, 'NAME', Blockly.Arduino.ORDER_ATOMIC) || '0';
    var value = Blockly.Arduino.valueToCode(this, 'VALUE', Blockly.Arduino.ORDER_ATOMIC) || '0';
    var code = 'Serial.print(' + name + '); Serial.print(" = "); Serial.println(' + value + ');\n';
    return code;
};
