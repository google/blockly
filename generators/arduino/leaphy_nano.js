/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Arduino for Leaphy Nano blocks.
 */
'use strict';

goog.module('Blockly.Arduino.leaphyNano');
 
const { arduinoGenerator: Arduino } = goog.require('Blockly.Arduino');
 
 
Arduino['leaphy_original_set_motor_nano'] = function (block) {
    var dropdown_Type = block.getFieldValue('MOTOR_TYPE');
    var speed = Arduino.valueToCode(this, 'MOTOR_SPEED', Arduino.ORDER_ATOMIC) || '100'
    Arduino.definitions_['define_leaphy_original'] = '#include "Leaphyoriginal1.h"\n';
    var code = 'setMotor(' + dropdown_Type + ', ' + speed + ');\n';
    return code;
};

Arduino['leaphy_click_set_motor_nano'] = Arduino['leaphy_original_set_motor_nano'];

Arduino['leaphy_click_rgb_digitalwrite_nano'] = function (block) {
    var pin1 = block.getFieldValue('PIN1');
    var state1Output = Arduino.valueToCode(
        block, 'STATE1', Arduino.ORDER_ATOMIC) || 'LOW';

    Arduino.reservePin(
        block, pin1, Arduino.PinTypes.OUTPUT, 'Digital Write');

    var pin1SetupCode = 'pinMode(' + pin1 + ', OUTPUT);';
    Arduino.addSetup('io_' + pin1, pin1SetupCode, false);

    var pin2 = block.getFieldValue('PIN2');
    var state2Output = Arduino.valueToCode(
        block, 'STATE2', Arduino.ORDER_ATOMIC) || 'LOW';

    Arduino.reservePin(
        block, pin2, Arduino.PinTypes.OUTPUT, 'Digital Write');

    var pin2SetupCode = 'pinMode(' + pin2 + ', OUTPUT);';
    Arduino.addSetup('io_' + pin2, pin2SetupCode, false);

    var pin3 = block.getFieldValue('PIN3');
    var state3Output = Arduino.valueToCode(
        block, 'STATE3', Arduino.ORDER_ATOMIC) || 'LOW';

    Arduino.reservePin(
        block, pin3, Arduino.PinTypes.OUTPUT, 'Digital Write');

    var pin3SetupCode = 'pinMode(' + pin3 + ', OUTPUT);';
    Arduino.addSetup('io_' + pin3, pin3SetupCode, false);

    var code = 'digitalWrite(' + pin1 + ', ' + state1Output + ');\n'
                     + 'digitalWrite(' + pin2 + ', ' + state2Output + ');\n'
                     + 'digitalWrite(' + pin3 + ', ' + state3Output + ');\n';
                     
    return code;
};

Arduino['leaphy_servo_write_nano'] = function (block) {
    var pinKey = block.getFieldValue('SERVO_PIN');
    var servoAngle = Arduino.valueToCode(
        block, 'SERVO_ANGLE', Arduino.ORDER_ATOMIC) || '90';
    var servoName = 'myServo' + pinKey;

    Arduino.reservePin(
        block, pinKey, Arduino.PinTypes.SERVO, 'Servo Write');

    Arduino.addInclude('servo', '#include <Servo.h>');
    Arduino.addDeclaration('servo_' + pinKey, 'Servo ' + servoName + ';');

    var setupCode = servoName + '.attach(' + pinKey + ');';
    Arduino.addSetup('servo_' + pinKey, setupCode, true);

    var code = servoName + '.write(' + servoAngle + ');\n';
    return code;
};

Arduino['leaphy_servo_read_nano'] = function (block) {
    var pinKey = block.getFieldValue('SERVO_PIN');
    var servoName = 'myServo' + pinKey;

    Arduino.reservePin(
        block, pinKey, Arduino.PinTypes.SERVO, 'Servo Read');

    Arduino.addInclude('servo', '#include <Servo.h>');
    Arduino.addDeclaration('servo_' + pinKey, 'Servo ' + servoName + ';');

    var setupCode = servoName + '.attach(' + pinKey + ');';
    Arduino.addSetup('servo_' + pinKey, setupCode, true);

    var code = servoName + '.read()';
    return [code, Arduino.ORDER_ATOMIC];
};

Arduino['leaphy_io_digitalwrite_nano'] = function (block) {
    var pin = block.getFieldValue('PIN');
    var stateOutput = Arduino.valueToCode(
        block, 'STATE', Arduino.ORDER_ATOMIC) || 'LOW';

    Arduino.reservePin(
        block, pin, Arduino.PinTypes.OUTPUT, 'Digital Write');

    var pinSetupCode = 'pinMode(' + pin + ', OUTPUT);';
    Arduino.addSetup('io_' + pin, pinSetupCode, false);

    var code = 'digitalWrite(' + pin + ', ' + stateOutput + ');\n';
    return code;
};

Arduino['leaphy_io_analogwrite_nano'] = function (block) {
    var pin = block.getFieldValue('PIN');
    var stateOutput = Arduino.valueToCode(
        block, 'NUM', Arduino.ORDER_ATOMIC) || '0';

    Arduino.reservePin(
        block, pin, Arduino.PinTypes.OUTPUT, 'Analogue Write');

    var pinSetupCode = 'pinMode(' + pin + ', OUTPUT);';
    Arduino.addSetup('io_' + pin, pinSetupCode, false);

    // Warn if the input value is out of range
    if ((stateOutput < 0) || (stateOutput > 255)) {
        block.setWarningText('The analogue value set must be between 0 and 255',
            'pwm_value');
    } else {
        block.setWarningText(null, 'pwm_value');
    }

    var code = 'analogWrite(' + pin + ', ' + stateOutput + ');\n';
    return code;
};

Arduino['leaphy_sonar_read_nano'] = function (block) {
    Arduino.addInclude('leaphy_extra', '#include "Leaphy_Extra.h"');
    var trigPin = block.getFieldValue('TRIG_PIN');
    var echoPin = block.getFieldValue('ECHO_PIN');
    var code = 'getDistanceSonar(' + trigPin + ', ' + echoPin + ')';
    return [code, Arduino.ORDER_ATOMIC];
};

Arduino['leaphy_original_digital_read_nano'] = function (block) {
    var dropdown_pin = block.getFieldValue('PIN');
    Arduino.setups_['setup_input_' + dropdown_pin] = 'pinMode(' + dropdown_pin + ', INPUT);';
    var code = 'digitalRead(' + dropdown_pin + ')';
    return [code, Arduino.ORDER_ATOMIC];
};

Arduino['leaphy_original_analog_read_nano'] = function (block) {
    var dropdown_pin = block.getFieldValue('PIN');
    //Arduino.setups_['setup_input_'+dropdown_pin] = 'pinMode('+dropdown_pin+', INPUT);';
    var code = 'analogRead(' + dropdown_pin + ')';
    return [code, Arduino.ORDER_ATOMIC];
};