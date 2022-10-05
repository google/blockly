/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Arduino for Leaphy Original blocks.
 */
 'use strict';

goog.module('Blockly.Arduino.leaphyOriginal');
 
const { arduinoGenerator: Arduino } = goog.require('Blockly.Arduino');
 
 
Arduino['leaphy_original_set_led'] = function (block) {
    var red = Arduino.valueToCode(this, 'LED_RED', Arduino.ORDER_ATOMIC) || '0'
    var green = Arduino.valueToCode(this, 'LED_GREEN', Arduino.ORDER_ATOMIC) || '0'
    var blue = Arduino.valueToCode(this, 'LED_BLUE', Arduino.ORDER_ATOMIC) || '0'
    Arduino.definitions_['define_leaphy_original'] = '#include "Leaphyoriginal1.h"\n';
    var code = 'setLed(' + red + ', ' + green + ', ' + blue + ');\n';
    return code;
};

Arduino['leaphy_original_set_motor'] = function (block) {
    var dropdown_Type = block.getFieldValue('MOTOR_TYPE');
    var speed = Arduino.valueToCode(this, 'MOTOR_SPEED', Arduino.ORDER_ATOMIC) || '100'
    Arduino.definitions_['define_leaphy_original'] = '#include "Leaphyoriginal1.h"\n';
    var code = 'setMotor(' + dropdown_Type + ', ' + speed + ');\n';
    return code;
};

Arduino['leaphy_click_set_motor'] = Arduino['leaphy_original_set_motor'];

Arduino['leaphy_original_get_distance'] = function (block) {
    Arduino.definitions_['define_leaphy_original'] = '#include "Leaphyoriginal1.h"\n';
    var code = 'getDistance()';
    return [code, Arduino.ORDER_ATOMIC];
};

Arduino['leaphy_original_move_motors'] = function (block) {
    var dropdown_Type = block.getFieldValue('MOTOR_DIRECTION');
    var speed = Arduino.valueToCode(this, 'MOTOR_SPEED', Arduino.ORDER_ATOMIC) || '100'
    Arduino.definitions_['define_leaphy_original'] = '#include "Leaphyoriginal1.h"\n';
    var code = 'moveMotors(' + dropdown_Type + ', ' + speed + ');\n';
    return code;
}

Arduino['leaphy_original_digital_read'] = function (block) {
    var dropdown_pin = block.getFieldValue('PIN');
    Arduino.setups_['setup_input_' + dropdown_pin] = 'pinMode(' + dropdown_pin + ', INPUT);';
    var code = 'digitalRead(' + dropdown_pin + ')';
    return [code, Arduino.ORDER_ATOMIC];
};

Arduino['leaphy_original_analog_read'] = function (block) {
    var dropdown_pin = block.getFieldValue('PIN');
    //Arduino.setups_['setup_input_'+dropdown_pin] = 'pinMode('+dropdown_pin+', INPUT);';
    var code = 'analogRead(' + dropdown_pin + ')';
    return [code, Arduino.ORDER_ATOMIC];
};

Arduino['leaphy_original_buzz'] = function(block) {
    Arduino.addInclude('arduino', '#include <Arduino.h>');
    Arduino.addSetup('tone', 'pinMode(4, OUTPUT);', false);
    var frequency = Arduino.valueToCode(this, 'FREQUENCY', Arduino.ORDER_ATOMIC) || '0';
    var duration = Arduino.valueToCode(this, 'DURATION', Arduino.ORDER_ATOMIC) || '0';
    var code = 'tone(4, ' + frequency + ', ' + duration + ');\n';
    return code;
};
