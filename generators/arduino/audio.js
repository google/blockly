'use strict';

goog.require('Blockly.Arduino');


Blockly.Arduino.oxocard_audio_wait_for_tone = function(block) {
	return 'oxocard.audio->setToneBlocking(true);\n';
};

Blockly.Arduino.oxocard_audio_wait_not_for_tone = function(block) {
	return 'oxocard.audio->setToneBlocking(false);\n';
};

Blockly.Arduino.oxocard_audio_set_octave = function() {
  var octave = this.getFieldValue('OCTAVE');
  return 'oxocard.audio->setGlobalOctave(Octave::' +octave +');\n';
};

Blockly.Arduino.oxocard_audio_set_waveform = function() {
  var waveform = this.getFieldValue('WAVEFORM');
  return 'oxocard.audio->setGlobalWaveForm(WaveFormGenerator::' +waveform +');\n';
};

Blockly.Arduino.oxocard_audio_set_bpm = function() {
	var bpm = Blockly.Arduino.valueToCode(this, 'BPM', Blockly.Arduino.ORDER_ATOMIC) || 0;
	return 'oxocard.audio->setGlobalBPM(' + bpm + ');\n';
};

Blockly.Arduino.oxocard_audio_wait = function() {
  var duration = this.getFieldValue('DUR');
  return 'delay(oxocard.audio->noteToMs(' +duration +'));\n';
};

Blockly.Arduino.oxocard_audio_stop_tone = function(block) {
	return 'oxocard.audio->noTone();\n';
};

Blockly.Arduino.oxocard_audio_play_tone = function() {
  var note = this.getFieldValue('NOTE');
  return 'oxocard.audio->tone(Note::' +note +');\n';
};

Blockly.Arduino.oxocard_audio_play_tone_dur_ms = function() {
  var note = this.getFieldValue('NOTE');
  var duration = Blockly.Arduino.valueToCode(this, 'DUR', Blockly.Arduino.ORDER_ATOMIC) || 0;
  return 'oxocard.audio->tone(Note::' +note +', ' +duration +');\n';
};

Blockly.Arduino.oxocard_audio_play_tone_dur = function() {
  var note = this.getFieldValue('NOTE');
  var duration = this.getFieldValue('DUR');
  return 'oxocard.audio->tone(Note::' +note +', oxocard.audio->noteToMs(' +duration +'));\n';
};

Blockly.Arduino.oxocard_audio_play_tone_hz = function() {
  var note = Blockly.Arduino.valueToCode(this, 'FRQ', Blockly.Arduino.ORDER_ATOMIC) || 0;
  return 'oxocard.audio->tone(' +note +');\n';
};

Blockly.Arduino.oxocard_audio_play_tone_hz_dur_ms = function() {
  var note = Blockly.Arduino.valueToCode(this, 'FRQ', Blockly.Arduino.ORDER_ATOMIC) || 0;
  var duration = Blockly.Arduino.valueToCode(this, 'DUR', Blockly.Arduino.ORDER_ATOMIC) || 0;
  return 'oxocard.audio->tone(' +note +', ' +duration +');\n';
};

Blockly.Arduino.oxocard_audio_play_tone_hz_dur = function() {
  var note = Blockly.Arduino.valueToCode(this, 'FRQ', Blockly.Arduino.ORDER_ATOMIC) || 0;
  var duration = this.getFieldValue('DUR');
  return 'oxocard.audio->tone(' +note +', oxocard.audio->noteToMs(' +duration +'));\n';
};
