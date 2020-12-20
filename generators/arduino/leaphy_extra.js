/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Code generator for Leaphy RGB.
 */
'use strict';

goog.provide('Blockly.Arduino.LeaphyExtra');

goog.require('Blockly.Arduino');

var includeDefinition = '#include "Adafruit_TCS34725.h"';
var variablesDefinition = 'Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_24MS, TCS34725_GAIN_16X);\nuint16_t RawColor_Red, RawColor_Green, RawColor_Blue, RawColor_Clear;\nbyte Color_Red, Color_Green, Color_Blue, Color_Clear;';

Blockly.Arduino['leaphy_rgb_read_sensor'] = function (block){
    Blockly.Arduino.definitions_['define_leaphy_rgb'] = includeDefinition;
    Blockly.Arduino.definitions_['define_leaphy_rgb_var'] = variablesDefinition;
    var code = 'if (tcs.begin()) {\n  Serial.println("RGB-sensor gevonden!");\n} else {\n  Serial.println("Geen RGB-sensor gevonden... check je verbindingen...");\n}\ntcs.getRawData(&RawColor_Red, &RawColor_Green, &RawColor_Blue, &RawColor_Clear);\nColor_Red = min(RawColor_Red/5,255); Color_Green = min(RawColor_Green/5,255); Color_Blue = min(RawColor_Blue/5,255);\n';
    return code;
};

Blockly.Arduino['leaphy_rgb_color_red'] = function (block){
    Blockly.Arduino.definitions_['define_leaphy_rgb'] = includeDefinition;
    Blockly.Arduino.definitions_['define_leaphy_rgb_var'] = variablesDefinition;
    var code = 'Color_Red';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_rgb_color_green'] = function (block){
    Blockly.Arduino.definitions_['define_leaphy_rgb'] = includeDefinition;
    Blockly.Arduino.definitions_['define_leaphy_rgb_var'] = variablesDefinition;
    var code = 'Color_Green';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_rgb_color_blue'] = function (block){
    Blockly.Arduino.definitions_['define_leaphy_rgb'] = includeDefinition;
    Blockly.Arduino.definitions_['define_leaphy_rgb_var'] = variablesDefinition;
    var code = 'Color_Blue';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_rgb_raw_color_red'] = function (block){
    Blockly.Arduino.definitions_['define_leaphy_rgb'] = includeDefinition;
    Blockly.Arduino.definitions_['define_leaphy_rgb_var'] = variablesDefinition;
    var code = 'RawColor_Red';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_rgb_raw_color_green'] = function (block){
    Blockly.Arduino.definitions_['define_leaphy_rgb'] = includeDefinition;
    Blockly.Arduino.definitions_['define_leaphy_rgb_var'] = variablesDefinition;
    var code = 'RawColor_Green';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_rgb_raw_color_blue'] = function (block){
    Blockly.Arduino.definitions_['define_leaphy_rgb'] = includeDefinition;
    Blockly.Arduino.definitions_['define_leaphy_rgb_var'] = variablesDefinition;
    var code = 'RawColor_Blue';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_led_set_strip'] = function (block){
    var pin = Blockly.Arduino.valueToCode(this, 'LED_SET_PIN', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var leds = Blockly.Arduino.valueToCode(this, 'LED_SET_LEDS', Blockly.Arduino.ORDER_ATOMIC) || '0'
    Blockly.Arduino.definitions_['define_led_lib'] = '#include "ledstrip.h"';
    Blockly.Arduino.definitions_['define_leds_pins'] = 'LEDSTRIP ledstrip(' + pin + ', ' + leds + ');';
    var code = '';
    return code;
};

Blockly.Arduino['leaphy_led_set_basic'] = function (block){
    var led = Blockly.Arduino.valueToCode(this, 'LED_BASIC_LED', Blockly.Arduino.ORDER_ATOMIC) || '0'    
    var red = Blockly.Arduino.valueToCode(this, 'LED_BASIC_RED', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var green = Blockly.Arduino.valueToCode(this, 'LED_BASIC_GREEN', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var blue = Blockly.Arduino.valueToCode(this, 'LED_BASIC_BLUE', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var code = 'ledstrip.basis('+ led + ', ' + red + ', ' + green + ', ' + blue + ');\n';
    return code;
};

Blockly.Arduino['leaphy_led_set_speed'] = function (block){
    var speedValue = Blockly.Arduino.valueToCode(this, 'LED_SET_SPEEDVALUE', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var code = '_snelHeid = ' + speedValue + ';\n';
    return code;
};

Blockly.Arduino['leaphy_led_strip_demo'] = function (block){
    var dropdownType = block.getFieldValue('DEMO_TYPE');
    var red = Blockly.Arduino.valueToCode(this, 'LED_STRIP_DEMO_RED', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var green = Blockly.Arduino.valueToCode(this, 'LED_STRIP_DEMO_GREEN', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var blue = Blockly.Arduino.valueToCode(this, 'LED_STRIP_DEMO_BLUE', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var code = 'ledstrip.runFunction(' + dropdownType + ', ' + red + ', ' + green + ', ' + blue + ');\n';
    return code;
};

Blockly.Arduino['leaphy_servo_write'] = function(block) {
    var pinKey = block.getFieldValue('SERVO_PIN');
    var servoAngle = Blockly.Arduino.valueToCode(
        block, 'SERVO_ANGLE', Blockly.Arduino.ORDER_ATOMIC) || '90';
    var servoName = 'myServo' + pinKey;
  
    Blockly.Arduino.reservePin(
        block, pinKey, Blockly.Arduino.PinTypes.SERVO, 'Servo Write');
  
    Blockly.Arduino.addInclude('servo', '#include <Servo.h>');
    Blockly.Arduino.addDeclaration('servo_' + pinKey, 'Servo ' + servoName + ';');
  
    var setupCode = servoName + '.attach(' + pinKey + ');';
    Blockly.Arduino.addSetup('servo_' + pinKey, setupCode, true);
  
    var code = servoName + '.write(' + servoAngle + ');\n';
    return code;
  };
  
  /**
   * Code generator to read an angle value from a servo pin (X).
   * Arduino code: #include <Servo.h>
   *               Servo myServoX;
   *               setup { myServoX.attach(X); }
   *               loop  { myServoX.read();    }
   * @param {!Blockly.Block} block Block to generate the code from.
   * @return {array} Completed code with order of operation.
   */
  
  Blockly.Arduino['leaphy_servo_read'] = function(block) {
    var pinKey = block.getFieldValue('SERVO_PIN');
    var servoName = 'myServo' + pinKey;
  
    Blockly.Arduino.reservePin(
        block, pinKey, Blockly.Arduino.PinTypes.SERVO, 'Servo Read');
  
    Blockly.Arduino.addInclude('servo', '#include <Servo.h>');
    Blockly.Arduino.addDeclaration('servo_' + pinKey, 'Servo ' + servoName + ';');
  
    var setupCode = servoName + '.attach(' + pinKey + ');';
    Blockly.Arduino.addSetup('servo_' + pinKey, setupCode, true);
  
    var code = servoName + '.read()';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
  };

  Blockly.Arduino['leaphy_io_digitalwrite'] = function(block) {
    var pin = block.getFieldValue('PIN');
    var stateOutput = Blockly.Arduino.valueToCode(
        block, 'STATE', Blockly.Arduino.ORDER_ATOMIC) || 'LOW';
  
    Blockly.Arduino.reservePin(
        block, pin, Blockly.Arduino.PinTypes.OUTPUT, 'Digital Write');
  
    var pinSetupCode = 'pinMode(' + pin + ', OUTPUT);';
    Blockly.Arduino.addSetup('io_' + pin, pinSetupCode, false);
  
    var code = 'digitalWrite(' + pin + ', ' + stateOutput + ');\n';
    return code;
  };
  
  Blockly.Arduino['leaphy_io_analogwrite'] = function(block) {
    var pin = block.getFieldValue('PIN');
    var stateOutput = Blockly.Arduino.valueToCode(
        block, 'NUM', Blockly.Arduino.ORDER_ATOMIC) || '0';
  
    Blockly.Arduino.reservePin(
        block, pin, Blockly.Arduino.PinTypes.OUTPUT, 'Analogue Write');
  
    var pinSetupCode = 'pinMode(' + pin + ', OUTPUT);';
    Blockly.Arduino.addSetup('io_' + pin, pinSetupCode, false);
  
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
  