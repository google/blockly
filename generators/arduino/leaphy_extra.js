/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Arduino for Leaphy Extra blocks.
 */
 'use strict';

goog.module('Blockly.Arduino.leaphyExtra');
 
const { arduinoGenerator: Arduino } = goog.require('Blockly.Arduino');

var includeDefinition = '#include "Adafruit_TCS34725.h"';
var variablesDefinition = 'Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_24MS, TCS34725_GAIN_16X);\nuint16_t RawColor_Red, RawColor_Green, RawColor_Blue, RawColor_Clear;\nbyte Color_Red, Color_Green, Color_Blue, Color_Clear;\n';
var getColorDefinition = 'double getColor(int colorCode, bool isRaw) {\n'
                            + '  tcs.getRawData(&RawColor_Red, &RawColor_Green, &RawColor_Blue, &RawColor_Clear);\n'
                            + '  Color_Red = min(RawColor_Red/5,255); Color_Green = min(RawColor_Green/5,255); Color_Blue = min(RawColor_Blue/5,255);\n'
                            + '  switch(colorCode) {\n'
                            + '    case 0:\n'
                            + '      return (isRaw) ? RawColor_Red : Color_Red;\n'
                            + '    case 1:\n'
                            + '      return (isRaw) ? RawColor_Green : Color_Green;\n'
                            + '    case 2:\n'
                            + '      return (isRaw) ? RawColor_Blue : Color_Blue;\n'
                            + '  }\n'
                            + '}\n';

var rgbColorSetupCode = 'if (tcs.begin()) {\n    Serial.println("RGB-sensor gevonden!");\n  } else {\n    Serial.println("Geen RGB-sensor gevonden... check je verbindingen...");\n  }';

Arduino['leaphy_rgb_color'] = function (block) {
    Arduino.definitions_['define_leaphy_rgb'] = includeDefinition;
    Arduino.definitions_['define_leaphy_rgb_var'] = variablesDefinition;
    Arduino.definitions_['define_get_color'] = getColorDefinition;
    Arduino.addSetup('rgb_color_setup', rgbColorSetupCode, false);

    var colorType = block.getFieldValue('COLOR_TYPE');
    var code = 'getColor(' + colorType + ', false)';
    return [code, Arduino.ORDER_ATOMIC];
};

Arduino['leaphy_rgb_color_raw'] = function (block) {
    Arduino.definitions_['define_leaphy_rgb'] = includeDefinition;
    Arduino.definitions_['define_leaphy_rgb_var'] = variablesDefinition;
    Arduino.definitions_['define_get_color'] = getColorDefinition;
    Arduino.addSetup('rgb_color_setup', rgbColorSetupCode, false);

    var colorType = block.getFieldValue('COLOR_TYPE_RAW');
    var code = 'getColor(' + colorType + ', true)';
    return [code, Arduino.ORDER_ATOMIC];
};

Arduino['leaphy_rgb_raw_color_red'] = function (block) {
    Arduino.definitions_['define_leaphy_rgb'] = includeDefinition;
    Arduino.definitions_['define_leaphy_rgb_var'] = variablesDefinition;
    var code = 'RawColor_Red';
    return [code, Arduino.ORDER_ATOMIC];
};

Arduino['leaphy_rgb_raw_color_green'] = function (block) {
    Arduino.definitions_['define_leaphy_rgb'] = includeDefinition;
    Arduino.definitions_['define_leaphy_rgb_var'] = variablesDefinition;
    var code = 'RawColor_Green';
    return [code, Arduino.ORDER_ATOMIC];
};

Arduino['leaphy_rgb_raw_color_blue'] = function (block) {
    Arduino.definitions_['define_leaphy_rgb'] = includeDefinition;
    Arduino.definitions_['define_leaphy_rgb_var'] = variablesDefinition;
    var code = 'RawColor_Blue';
    return [code, Arduino.ORDER_ATOMIC];
};

Arduino['leaphy_led_set_strip'] = function (block) {
    var pin = Arduino.valueToCode(this, 'LED_SET_PIN', Arduino.ORDER_ATOMIC) || '0'
    var leds = Arduino.valueToCode(this, 'LED_SET_LEDS', Arduino.ORDER_ATOMIC) || '0'
    Arduino.definitions_['define_led_lib'] = '#include "ledstrip.h"';
    Arduino.definitions_['define_leds_pins'] = 'LEDSTRIP ledstrip(' + pin + ', ' + leds + ');';
    var code = '';
    return code;
};

Arduino['leaphy_led_set_basic'] = function (block) {
    var led = Arduino.valueToCode(this, 'LED_BASIC_LED', Arduino.ORDER_ATOMIC) || '0'
    var red = Arduino.valueToCode(this, 'LED_BASIC_RED', Arduino.ORDER_ATOMIC) || '0'
    var green = Arduino.valueToCode(this, 'LED_BASIC_GREEN', Arduino.ORDER_ATOMIC) || '0'
    var blue = Arduino.valueToCode(this, 'LED_BASIC_BLUE', Arduino.ORDER_ATOMIC) || '0'
    var code = 'ledstrip.basis(' + led + ', ' + red + ', ' + green + ', ' + blue + ');\n';
    return code;
};

Arduino['leaphy_led_set_speed'] = function (block) {
    var speedValue = Arduino.valueToCode(this, 'LED_SET_SPEEDVALUE', Arduino.ORDER_ATOMIC) || '0'
    var code = '_snelHeid = ' + speedValue + ';\n';
    return code;
};

Arduino['leaphy_led_strip_demo'] = function (block) {
    var dropdownType = block.getFieldValue('DEMO_TYPE');
    var red = Arduino.valueToCode(this, 'LED_STRIP_DEMO_RED', Arduino.ORDER_ATOMIC) || '0'
    var green = Arduino.valueToCode(this, 'LED_STRIP_DEMO_GREEN', Arduino.ORDER_ATOMIC) || '0'
    var blue = Arduino.valueToCode(this, 'LED_STRIP_DEMO_BLUE', Arduino.ORDER_ATOMIC) || '0'
    var code = 'ledstrip.runFunction(' + dropdownType + ', ' + red + ', ' + green + ', ' + blue + ');\n';
    return code;
};

Arduino['leaphy_servo_write'] = function (block) {
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

/**
 * Code generator to read an angle value from a servo pin (X).
 * Arduino code: #include <Servo.h>
 *               Servo myServoX;
 *               setup { myServoX.attach(X); }
 *               loop  { myServoX.read();    }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Completed code with order of operation.
 */

Arduino['leaphy_servo_read'] = function (block) {
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

Arduino['leaphy_io_digitalwrite'] = function (block) {
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

Arduino['leaphy_io_analogwrite'] = function (block) {
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

Arduino['leaphy_sonar_read'] = function (block) {
    Arduino.addInclude('leaphy_extra', '#include "Leaphy_Extra.h"');
    var trigPin = block.getFieldValue('TRIG_PIN');
    var echoPin = block.getFieldValue('ECHO_PIN');
    var code = 'getDistanceSonar(' + trigPin + ', ' + echoPin + ')';
    return [code, Arduino.ORDER_ATOMIC];
};

var displayInclude = '#include "OLED_Display.h"';
var displayDefinition = 'OLEDDISPLAY display;';
var displaySetup = 'if(!display.begin())\n  {\n    Serial.println(F("Contact with the display failed: Check the connections"));\n  }\n';
var displaySerialSetup = 'Serial.begin(115200);';

var addDisplaySetupCode = function(){
    Arduino.addInclude('include_display', displayInclude);
    Arduino.definitions_['define_display'] = displayDefinition;
    Arduino.addSetup('serial', displaySerialSetup, false);
    Arduino.addSetup('oled', displaySetup, false);
}

Arduino['leaphy_display_clear'] = function(block) {
    addDisplaySetupCode();
    var code = 'display.clearDisplay();\n';
    return code;
};

Arduino['leaphy_display_print_line'] = function(block) {
    addDisplaySetupCode();

    var value = Arduino.valueToCode(this, 'VALUE', Arduino.ORDER_ATOMIC) || '0';
    var row = Arduino.valueToCode(this, 'DISPLAY_ROW', Arduino.ORDER_ATOMIC) || '0';
    var row = block.getFieldValue('DISPLAY_ROW');
    var cursorHeight = row * 12;
    var code = 'display.setCursor(0,' + cursorHeight + ');\ndisplay.println(' + value + ');\n';
    return code;
};

Arduino['leaphy_display_print_value'] = function(block) {
    addDisplaySetupCode();

    var name = Arduino.valueToCode(this, 'NAME', Arduino.ORDER_ATOMIC) || '0';
    var value = Arduino.valueToCode(this, 'VALUE', Arduino.ORDER_ATOMIC) || '0';
    var row = block.getFieldValue('DISPLAY_ROW');
    var cursorHeight = row * 12;
    var code = 'display.setCursor(0,' + cursorHeight + ');\ndisplay.print(' + name + ');\ndisplay.print(" = ");\ndisplay.println(' + value + ');\n';
    return code;
};

Arduino['leaphy_display_display'] = function(block) {
    addDisplaySetupCode();
    var code = 'display.display();\n';
    return code;
};

Arduino['leaphy_update_lsm9ds1'] = function(block) {
    return "  lsm.read();  /* ask it to read in the data */  \n \n  /* Get a new sensor event */  \n  sensors_event_t a, m, g, temp; \n \n  lsm.getEvent(&a, &m, &g, &temp);"
}

Arduino['leaphy_use_lsm9ds1'] = function(block) {
    var sensor = block.getFieldValue('SENSOR');
    var axis = block.getFieldValue('AXIS');
    Arduino.addInclude('adafruit_lsm9ds1', '#include <Adafruit_LSM9DS1.h>');
    Arduino.addDeclaration('lsm9ds1_declaration', 'Adafruit_LSM9DS1 lsm = Adafruit_LSM9DS1();\n');
    Arduino.addFunction('lsm9ds1_setttings', 'void setupSettings()\n{\n    lsm.setupAccel(lsm.LSM9DS1_ACCELRANGE_2G);\n    lsm.setupMag(lsm.LSM9DS1_MAGGAIN_4GAUSS);\n    lsm.setupGyro(lsm.LSM9DS1_GYROSCALE_245DPS);\n}\n');
    Arduino.addSetup("lsm9ds1_setup', 'void setup()  \n{ \n  Serial.begin(115200); \n \n  while (!Serial) { \n    delay(1); // will pause Zero, Leonardo, etc until serial console opens \n  } \n   \n  Serial.println('LSM9DS1 data read demo'); \n   \n  // Try to initialise and warn if we couldn't detect the chip \n  if (!lsm.begin()) \n  { \n    Serial.println('Oops ... unable to initialize the LSM9DS1. Check your wiring!'); \n    while (1); \n  } \n  Serial.println('Found LSM9DS1 9DOF'); \n \n  // helper to just set the default scaling we want, see above! \n  setupSensor(); \n}");
    return [sensor + axis, Arduino.ORDER_ATOMIC]
}