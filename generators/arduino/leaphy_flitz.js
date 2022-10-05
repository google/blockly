/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Arduino for Leaphy Flitz blocks.
 */
 'use strict';

goog.module('Blockly.Arduino.leaphyFlitz');
 
const { arduinoGenerator: Arduino } = goog.require('Blockly.Arduino');
 

Arduino['leaphy_flitz_read_stomach_sensor'] = function (block){
    var sensorType = block.getFieldValue('SENSOR_TYPE');
    var code = '';
    var setup = '';
    if(sensorType == "1"){
        setup = 'pinMode(8, OUTPUT);\n  pinMode(9, OUTPUT);\n  pinMode(10, INPUT);\n  digitalWrite(8, LOW);\n  digitalWrite(9, HIGH);\n'    
        code = 'digitalRead(10)'
    } else if(sensorType == "2"){
        setup = 'pinMode(8, INPUT);\n  pinMode(9, OUTPUT);\n  pinMode(10, OUTPUT);\n  digitalWrite(8, LOW);\n  digitalWrite(9, HIGH);\n'
        code = 'digitalRead(8)'
    }
    Arduino.setups_['setup_flitz_stomach'] = setup;    
    return [code, Arduino.ORDER_ATOMIC];
};

Arduino['leaphy_flitz_read_hand_sensor'] = function (block){
    Arduino.setups_['setup_flitz_stomach'] = 'pinMode(14, OUTPUT);\n pinMode(15, OUTPUT);\n pinMode(2, INPUT);\n digitalWrite(14, HIGH);\n digitalWrite(15, LOW);\n'
    var code = 'analogRead(2)'
    return [code, Arduino.ORDER_ATOMIC];
};

Arduino['leaphy_flitz_led'] = function (block){
    Arduino.setups_['setup_flitz_led'] = ''
    var flitz_red = Arduino.valueToCode(this, 'FLITZ_LED_R', Arduino.ORDER_ATOMIC) || '0'
    var flitz_green = Arduino.valueToCode(this, 'FLITZ_LED_G', Arduino.ORDER_ATOMIC) || '0'
    var flitz_blue = Arduino.valueToCode(this, 'FLITZ_LED_B', Arduino.ORDER_ATOMIC) || '0' 
    //var code = 'setLedd(' + flitz_red + ', ' + flitz_green + ', ' + flitz_blue + ');\n';
    var code = 'analogWrite(3, ' + flitz_red + ');\nanalogWrite(5, ' + flitz_green + ');\nanalogWrite(6, ' + flitz_blue + ');\n';
    return code;
};
