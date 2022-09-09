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

Blockly.Arduino['leaphy_rgb_color'] = function (block) {
    Blockly.Arduino.definitions_['define_leaphy_rgb'] = includeDefinition;
    Blockly.Arduino.definitions_['define_leaphy_rgb_var'] = variablesDefinition;
    Blockly.Arduino.definitions_['define_get_color'] = getColorDefinition;
    Blockly.Arduino.addSetup('rgb_color_setup', rgbColorSetupCode, false);

    var colorType = block.getFieldValue('COLOR_TYPE');
    var code = 'getColor(' + colorType + ', false)';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_rgb_color_raw'] = function (block) {
    Blockly.Arduino.definitions_['define_leaphy_rgb'] = includeDefinition;
    Blockly.Arduino.definitions_['define_leaphy_rgb_var'] = variablesDefinition;
    Blockly.Arduino.definitions_['define_get_color'] = getColorDefinition;
    Blockly.Arduino.addSetup('rgb_color_setup', rgbColorSetupCode, false);

    var colorType = block.getFieldValue('COLOR_TYPE_RAW');
    var code = 'getColor(' + colorType + ', true)';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_rgb_raw_color_red'] = function (block) {
    Blockly.Arduino.definitions_['define_leaphy_rgb'] = includeDefinition;
    Blockly.Arduino.definitions_['define_leaphy_rgb_var'] = variablesDefinition;
    var code = 'RawColor_Red';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_rgb_raw_color_green'] = function (block) {
    Blockly.Arduino.definitions_['define_leaphy_rgb'] = includeDefinition;
    Blockly.Arduino.definitions_['define_leaphy_rgb_var'] = variablesDefinition;
    var code = 'RawColor_Green';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_rgb_raw_color_blue'] = function (block) {
    Blockly.Arduino.definitions_['define_leaphy_rgb'] = includeDefinition;
    Blockly.Arduino.definitions_['define_leaphy_rgb_var'] = variablesDefinition;
    var code = 'RawColor_Blue';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_led_set_strip'] = function (block) {
    var pin = Blockly.Arduino.valueToCode(this, 'LED_SET_PIN', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var leds = Blockly.Arduino.valueToCode(this, 'LED_SET_LEDS', Blockly.Arduino.ORDER_ATOMIC) || '0'
    Blockly.Arduino.definitions_['define_led_lib'] = '#include "ledstrip.h"';
    Blockly.Arduino.definitions_['define_leds_pins'] = 'LEDSTRIP ledstrip(' + pin + ', ' + leds + ');';
    var code = '';
    return code;
};

Blockly.Arduino['leaphy_led_set_basic'] = function (block) {
    var led = Blockly.Arduino.valueToCode(this, 'LED_BASIC_LED', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var red = Blockly.Arduino.valueToCode(this, 'LED_BASIC_RED', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var green = Blockly.Arduino.valueToCode(this, 'LED_BASIC_GREEN', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var blue = Blockly.Arduino.valueToCode(this, 'LED_BASIC_BLUE', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var code = 'ledstrip.basis(' + led + ', ' + red + ', ' + green + ', ' + blue + ');\n';
    return code;
};

Blockly.Arduino['leaphy_led_set_speed'] = function (block) {
    var speedValue = Blockly.Arduino.valueToCode(this, 'LED_SET_SPEEDVALUE', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var code = '_snelHeid = ' + speedValue + ';\n';
    return code;
};

Blockly.Arduino['leaphy_led_strip_demo'] = function (block) {
    var dropdownType = block.getFieldValue('DEMO_TYPE');
    var red = Blockly.Arduino.valueToCode(this, 'LED_STRIP_DEMO_RED', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var green = Blockly.Arduino.valueToCode(this, 'LED_STRIP_DEMO_GREEN', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var blue = Blockly.Arduino.valueToCode(this, 'LED_STRIP_DEMO_BLUE', Blockly.Arduino.ORDER_ATOMIC) || '0'
    var code = 'ledstrip.runFunction(' + dropdownType + ', ' + red + ', ' + green + ', ' + blue + ');\n';
    return code;
};

Blockly.Arduino['leaphy_servo_write'] = function (block) {
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

Blockly.Arduino['leaphy_servo_read'] = function (block) {
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

Blockly.Arduino['leaphy_io_digitalwrite'] = function (block) {
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

Blockly.Arduino['leaphy_io_analogwrite'] = function (block) {
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

Blockly.Arduino['leaphy_sonar_read'] = function (block) {
    Blockly.Arduino.addInclude('leaphy_extra', '#include "Leaphy_Extra.h"');
    var trigPin = block.getFieldValue('TRIG_PIN');
    var echoPin = block.getFieldValue('ECHO_PIN');
    var code = 'getDistanceSonar(' + trigPin + ', ' + echoPin + ')';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

var displayInclude = '#include "OLED_Display.h"';
var displayDefinition = 'OLEDDISPLAY display;';
var displaySetup = 'if(!display.begin())\n  {\n    Serial.println(F("Contact with the display failed: Check the connections"));\n  }\n';
var displaySerialSetup = 'Serial.begin(115200);';

var addDisplaySetupCode = function(){
    Blockly.Arduino.addInclude('include_display', displayInclude);
    Blockly.Arduino.definitions_['define_display'] = displayDefinition;
    Blockly.Arduino.addSetup('serial', displaySerialSetup, false);
    Blockly.Arduino.addSetup('oled', displaySetup, false);
}

Blockly.Arduino['leaphy_display_clear'] = function(block) {
    addDisplaySetupCode();
    var code = 'display.clearDisplay();\n';
    return code;
};

Blockly.Arduino['leaphy_display_print_line'] = function(block) {
    addDisplaySetupCode();

    var value = Blockly.Arduino.valueToCode(this, 'VALUE', Blockly.Arduino.ORDER_ATOMIC) || '0';
    var row = Blockly.Arduino.valueToCode(this, 'DISPLAY_ROW', Blockly.Arduino.ORDER_ATOMIC) || '0';
    var row = block.getFieldValue('DISPLAY_ROW');
    var cursorHeight = row * 12;
    var code = 'display.setCursor(0,' + cursorHeight + ');\ndisplay.println(' + value + ');\n';
    return code;
};

Blockly.Arduino['leaphy_display_print_value'] = function(block) {
    addDisplaySetupCode();

    var name = Blockly.Arduino.valueToCode(this, 'NAME', Blockly.Arduino.ORDER_ATOMIC) || '0';
    var value = Blockly.Arduino.valueToCode(this, 'VALUE', Blockly.Arduino.ORDER_ATOMIC) || '0';
    var row = block.getFieldValue('DISPLAY_ROW');
    var cursorHeight = row * 12;
    var code = 'display.setCursor(0,' + cursorHeight + ');\ndisplay.print(' + name + ');\ndisplay.print(" = ");\ndisplay.println(' + value + ');\n';
    return code;
};

Blockly.Arduino['leaphy_display_display'] = function(block) {
    addDisplaySetupCode();
    var code = 'display.display();\n';
    return code;
};

Blockly.Arduino['leaphy_update_lsm9ds1'] = function(block) {
    return "  lsm.read();  /* ask it to read in the data */  \n \n  /* Get a new sensor event */  \n  sensors_event_t a, m, g, temp; \n \n  lsm.getEvent(&a, &m, &g, &temp);"
}

Blockly.Arduino['leaphy_use_lsm9ds1'] = function(block) {
    var sensor = block.getFieldValue('SENSOR');
    var axis = block.getFieldValue('AXIS');
    Blockly.Arduino.addInclude('adafruit_lsm9ds1', '#include <Adafruit_LSM9DS1.h>');
    Blockly.Arduino.addDeclaration('lsm9ds1_declaration', 'Adafruit_LSM9DS1 lsm = Adafruit_LSM9DS1();\n');
    Blockly.Arduino.addFunction('lsm9ds1_setttings', 'void setupSettings()\n{\n    lsm.setupAccel(lsm.LSM9DS1_ACCELRANGE_2G);\n    lsm.setupMag(lsm.LSM9DS1_MAGGAIN_4GAUSS);\n    lsm.setupGyro(lsm.LSM9DS1_GYROSCALE_245DPS);\n}\n');
    Blockly.Arduino.addSetup("lsm9ds1_setup', 'void setup()  \n{ \n  Serial.begin(115200); \n \n  while (!Serial) { \n    delay(1); // will pause Zero, Leonardo, etc until serial console opens \n  } \n   \n  Serial.println('LSM9DS1 data read demo'); \n   \n  // Try to initialise and warn if we couldn't detect the chip \n  if (!lsm.begin()) \n  { \n    Serial.println('Oops ... unable to initialize the LSM9DS1. Check your wiring!'); \n    while (1); \n  } \n  Serial.println('Found LSM9DS1 9DOF'); \n \n  // helper to just set the default scaling we want, see above! \n  setupSensor(); \n}");
    return [sensor + axis, Blockly.Arduino.ORDER_ATOMIC]
}