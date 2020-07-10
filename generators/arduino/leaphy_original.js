/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Code generator for Leaphy Original Blocks.
 */
'use strict';

goog.provide('Blockly.Arduino.LeaphyOriginal');

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

Blockly.Arduino['leaphy_original_set_led'] = function (block) {
    var red = Blockly.Arduino.valueToCode(this, 'LED_RED', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var green = Blockly.Arduino.valueToCode(this, 'LED_GREEN', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var blue = Blockly.Arduino.valueToCode(this, 'LED_BLUE', Blockly.Arduino.ORDER_ATOMIC) || '0'
    Blockly.Arduino.definitions_['define_leaphy_original'] = '#include "Leaphyoriginal1.h"\n';
    var code = 'setLed(' + red + ', ' + green + ', ' + blue + ');\n';
    return code;
};

Blockly.Arduino['leaphy_original_set_motor'] = function (block) {
    var dropdown_Type = block.getFieldValue('MOTOR_TYPE');
    var speed = Blockly.Arduino.valueToCode(this, 'MOTOR_SPEED', Blockly.Arduino.ORDER_ATOMIC) || '100'
    Blockly.Arduino.definitions_['define_leaphy_original'] = '#include "Leaphyoriginal1.h"\n';
    var code = 'setMotor(' + dropdown_Type + ', ' + speed + ');\n';
    return code;

};

Blockly.Arduino['leaphy_original_get_distance'] = function (block) {
    Blockly.Arduino.definitions_['define_leaphy_original'] = '#include "Leaphyoriginal1.h"\n';
    var code = 'getDistance()';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_original_move_motors'] = function (block) {
    var dropdown_Type = block.getFieldValue('MOTOR_DIRECTION');
    var speed = Blockly.Arduino.valueToCode(this, 'MOTOR_SPEED', Blockly.Arduino.ORDER_ATOMIC) || '100'
    Blockly.Arduino.definitions_['define_leaphy_original'] = '#include "Leaphyoriginal1.h"\n';
    var code = 'moveMotors(' + dropdown_Type + ', ' + speed + ');\n';
    return code;
}

Blockly.Arduino['leaphy_original_digital_read'] = function (block) {
    var dropdown_pin = block.getFieldValue('PIN');
    Blockly.Arduino.setups_['setup_input_' + dropdown_pin] = 'pinMode(' + dropdown_pin + ', INPUT);';
    var code = 'digitalRead(' + dropdown_pin + ')';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_original_analog_read'] = function (block) {
    var dropdown_pin = block.getFieldValue('PIN');
    //Blockly.Arduino.setups_['setup_input_'+dropdown_pin] = 'pinMode('+dropdown_pin+', INPUT);';
    var code = 'analogRead(' + dropdown_pin + ')';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

