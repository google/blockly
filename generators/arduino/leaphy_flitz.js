/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Code generator for Leaphy Flitz Blocks.
 */
'use strict';

goog.provide('Blockly.Arduino.LeaphyFlitz');

goog.require('Blockly.Arduino');

Blockly.Arduino['leaphy_flitz_read_stomach_sensor'] = function (block){
    Blockly.Arduino.setups_['setup_flitz_stomach'] = 'pinMode(8, OUTPUT);\n pinMode(9, OUTPUT);\n pinMode(10, OUTPUT);\n digitalWrite(8, LOW);\n digitalWrite(9, HIGH);\n'
    var code = 'digitalRead(10)'
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_flitz_read_hand_sensor'] = function (block){
    Blockly.Arduino.setups_['setup_flitz_stomach'] = 'pinMode(14, OUTPUT);\n pinMode(15, OUTPUT);\n pinMode(2, INPUT);\n digitalWrite(14, HIGH);\n digitalWrite(15, LOW);\n'
    var code = 'analogRead(2)'
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_flitz_led'] = function (block){
    Blockly.Arduino.setups_['setup_flitz_led'] = ''
    var flitz_red = Blockly.Arduino.valueToCode(this, 'FLITZ_LED_R', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var flitz_green = Blockly.Arduino.valueToCode(this, 'FLITZ_LED_G', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var flitz_blue = Blockly.Arduino.valueToCode(this, 'FLITZ_LED_B', Blockly.Arduino.ORDER_ATOMIC) || '0' 
    var code = 'setLedd(' + flitz_red + ', ' + flitz_green + ', ' + flitz_blue + ');\n';
    return code;
};
