/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating JavaScript for audio blocks.
 * @author lunalovecraft@gmail.com (Luna Meier)
 */
'use strict';

goog.provide('Blockly.JavaScript.audio');

goog.require('Blockly.JavaScript');


Blockly.JavaScript['beep'] = function(block) {
  var value_frequency = Blockly.JavaScript.valueToCode(block, 'FREQUENCY', Blockly.JavaScript.ORDER_ATOMIC);
  var value_duration = Blockly.JavaScript.valueToCode(block, 'DURATION', Blockly.JavaScript.ORDER_ATOMIC);
  var value_timeout = Blockly.JavaScript.valueToCode(block, 'TIMEOUT', Blockly.JavaScript.ORDER_ATOMIC);
  
  var functionName = Blockly.JavaScript.provideFunction_(
      'beepIt',
      [ '//if you have another AudioContext class use that one, as some browsers have a limit',
		'var audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);',
		'var frequency;',
		'',
		'//All arguments are optional:',
		'',
		'//duration of the tone in milliseconds. Default is 500',
		'//frequency of the tone in hertz. default is 440',
		'//volume of the tone. Default is 1, off is 0.',
		'//type of tone. Possible values are sine, square, sawtooth, triangle, and custom. Default is sine.',
		'//callback to use on end of tone',
		'function ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ +
		'(duration, volume, type, callback) {',
		'	var oscillator = audioCtx.createOscillator();',
		'	var gainNode = audioCtx.createGain();',
		'	',
		'	oscillator.connect(gainNode);',
		'	gainNode.connect(audioCtx.destination);',
		'	',
		'	if (volume){gainNode.gain.value = volume;};',
		'	if (frequency){oscillator.frequency.value = frequency;}',
		'	if (type){oscillator.type = type;}',
		'	if (callback){oscillator.onended = callback;}',
		'	',
		'	oscillator.start();',
		'	setTimeout(function(){oscillator.stop()}, (duration ? duration : 500));',
        '}']);
		
	
	var code = '(function(freq){setTimeout(function(){ frequency = freq; beepIt(' + value_duration + ', 0.1, \'sine\');}, ' + value_timeout + ');})(' + value_frequency + ');';
			 
	return code;
};
