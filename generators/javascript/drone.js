/**
 * @fileoverview Generating JavaScript for drone blocks.
 * @author ETA
 */
'use strict';

goog.require('Blockly.JavaScript');

Blockly.JavaScript['take_off'] = function (block) {
  var code = 'd.flatTrim();\n';
    code += 'd.startPing();\n';
    code += 'd.flatTrim();\n';
    code += 'd.takeOff();\n';
    code += 'd.flatTrim()\n';
  return code;
};

Blockly.JavaScript['land'] = function (block) {
  return 'd.land();\n';
};

Blockly.JavaScript['go_forward'] = function (block) {
  return 'd.forward({steps: 50});\n';
};

Blockly.JavaScript['go_backward'] = function (block) {
  return 'd.forward({steps: 50});\n';
};

Blockly.JavaScript['turn_left'] = function (block) {
  return 'd.turnLeft({steps: 20});\n';
};

Blockly.JavaScript['turn_right'] = function (block) {
  return 'd.turnRight({steps: 20});\n';
};

Blockly.JavaScript['tilt_left'] = function (block) {
  return 'd.tiltLeft({steps: 20});\n';
};

Blockly.JavaScript['tilt_right'] = function (block) {
  return 'd.tiltRight({steps: 20});\n';
};

Blockly.JavaScript['go_up'] = function (block) {
  return 'd.up();\n';
};

Blockly.JavaScript['go_down'] = function (block) {
  return 'd.down();\n';
};

Blockly.JavaScript['flip'] = function (block) {
  return 'd.frontFlip();\n';
};
