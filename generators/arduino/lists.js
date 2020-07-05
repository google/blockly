/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Generating Arduino code for list blocks.
 *
 * TODO: A lot of this can be converted to arrays code by creating functions to
 *       replicate this kind of behavior.
 */
'use strict';

goog.provide('Blockly.Arduino.lists');

goog.require('Blockly.Arduino');


Blockly.Arduino['lists_create_empty'] = Blockly.Arduino.noGeneratorCodeInline;

Blockly.Arduino['lists_create_with'] = Blockly.Arduino.noGeneratorCodeInline;

Blockly.Arduino['lists_repeat'] = Blockly.Arduino.noGeneratorCodeInline;

Blockly.Arduino['lists_length'] = Blockly.Arduino.noGeneratorCodeInline;

Blockly.Arduino['lists_isEmpty'] = Blockly.Arduino.noGeneratorCodeInline;

Blockly.Arduino['lists_indexOf'] = Blockly.Arduino.noGeneratorCodeInline;

Blockly.Arduino['lists_getIndex'] = Blockly.Arduino.noGeneratorCodeInline;

Blockly.Arduino['lists_setIndex'] = Blockly.Arduino.noGeneratorCodeLine;
