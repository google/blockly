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

Blockly.Arduino['leaphy_rgb_read_sensor'] = function (block){
    Blockly.Arduino.definitions_['define_leaphy_rgb'] = '#include "Adafruit_TCS34725.h"'
    Blockly.Arduino.definitions_['define_leaphy_rgb_var'] = 'Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_24MS, TCS34725_GAIN_16X);\n uint16_t RawColor_Red, RawColor_Green, RawColor_Blue, RawColor_Clear;\n byte Color_Red, Color_Green, Color_Blue, Color_Clear;\n';
    var code = 'if (tcs.begin()) {\n    Serial.println("RGB-sensor gevonden!");\n } else {\n    Serial.println("Geen RGB-sensor gevonden... check je verbindingen...");\n }\n tcs.getRawData(&RawColor_Red, &RawColor_Green, &RawColor_Blue, &RawColor_Clear);\n Color_Red = min(RawColor_Red/5,255); Color_Green = min(RawColor_Green/5,255); Color_Blue = min(RawColor_Blue/5,255);';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_rgb_color_red'] = function (block){
    Blockly.Arduino.definitions_['define_leaphy_rgb'] = '#include "Adafruit_TCS34725.h"'
    Blockly.Arduino.definitions_['define_leaphy_rgb_var'] = 'Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_24MS, TCS34725_GAIN_16X);\n uint16_t RawColor_Red, RawColor_Green, RawColor_Blue, RawColor_Clear;\n byte Color_Red, Color_Green, Color_Blue, Color_Clear;\n';
    var code = 'Color_Red';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_rgb_color_green'] = function (block){
    Blockly.Arduino.definitions_['define_leaphy_rgb'] = '#include "Adafruit_TCS34725.h"'
    Blockly.Arduino.definitions_['define_leaphy_rgb_var'] = 'Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_24MS, TCS34725_GAIN_16X);\n uint16_t RawColor_Red, RawColor_Green, RawColor_Blue, RawColor_Clear;\n byte Color_Red, Color_Green, Color_Blue, Color_Clear;\n';
    var code = 'Color_Green';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_rgb_color_blue'] = function (block){
    Blockly.Arduino.definitions_['define_leaphy_rgb'] = '#include "Adafruit_TCS34725.h"'
    Blockly.Arduino.definitions_['define_leaphy_rgb_var'] = 'Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_24MS, TCS34725_GAIN_16X);\n uint16_t RawColor_Red, RawColor_Green, RawColor_Blue, RawColor_Clear;\n byte Color_Red, Color_Green, Color_Blue, Color_Clear;\n';
    var code = 'Color_Blue';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_rgb_raw_color_red'] = function (block){
    Blockly.Arduino.definitions_['define_leaphy_rgb'] = '#include "Adafruit_TCS34725.h"'
    Blockly.Arduino.definitions_['define_leaphy_rgb_var'] = 'Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_24MS, TCS34725_GAIN_16X);\n uint16_t RawColor_Red, RawColor_Green, RawColor_Blue, RawColor_Clear;\n byte Color_Red, Color_Green, Color_Blue, Color_Clear;\n';
    var code = 'RawColor_Red';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_rgb_raw_color_green'] = function (block){
    Blockly.Arduino.definitions_['define_leaphy_rgb'] = '#include "Adafruit_TCS34725.h"'
    Blockly.Arduino.definitions_['define_leaphy_rgb_var'] = 'Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_24MS, TCS34725_GAIN_16X);\n uint16_t RawColor_Red, RawColor_Green, RawColor_Blue, RawColor_Clear;\n byte Color_Red, Color_Green, Color_Blue, Color_Clear;\n';
    var code = 'RawColor_Green';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['leaphy_rgb_raw_color_blue'] = function (block){
    Blockly.Arduino.definitions_['define_leaphy_rgb'] = '#include "Adafruit_TCS34725.h"'
    Blockly.Arduino.definitions_['define_leaphy_rgb_var'] = 'Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_24MS, TCS34725_GAIN_16X);\n uint16_t RawColor_Red, RawColor_Green, RawColor_Blue, RawColor_Clear;\n byte Color_Red, Color_Green, Color_Blue, Color_Clear;\n';
    var code = 'RawColor_Blue';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

