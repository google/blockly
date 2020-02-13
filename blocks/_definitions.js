/**
 * @fileoverview Camera blocks for Fable Blockly.
 *
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Blocks.Definitions');

Blockly.Blocks.Definitions = {};

Blockly.Blocks.Definitions.imageDir = 'media/images/';
Blockly.Blocks.Definitions.iconSize = 27;

Blockly.Blocks.Definitions.cameraIcon = Blockly.Blocks.Definitions.imageDir + 'camera.png';
Blockly.Blocks.Definitions.waitIcon = Blockly.Blocks.Definitions.imageDir + 'hourglass@3x.png';
Blockly.Blocks.Definitions.timeIcon = Blockly.Blocks.Definitions.imageDir + 'clock@3x.png';
Blockly.Blocks.Definitions.keyboardIcon = Blockly.Blocks.Definitions.imageDir + 'keyboard@3x.png';
Blockly.Blocks.Definitions.musicIcon = Blockly.Blocks.Definitions.imageDir + 'music@3x.png';
Blockly.Blocks.Definitions.saveIcon = Blockly.Blocks.Definitions.imageDir + 'save@3x.png';
Blockly.Blocks.Definitions.graphIcon = Blockly.Blocks.Definitions.imageDir + 'data@3x.png';
Blockly.Blocks.Definitions.ledIcon = Blockly.Blocks.Definitions.imageDir + 'lamp@3x.png';
Blockly.Blocks.Definitions.batteryIcon = Blockly.Blocks.Definitions.imageDir + 'battery@3x.png';
Blockly.Blocks.Definitions.jointIcon = Blockly.Blocks.Definitions.imageDir + 'module@3x.png';
Blockly.Blocks.Definitions.spinIcon = Blockly.Blocks.Definitions.imageDir + 'spin@3x.png';
Blockly.Blocks.Definitions.eyeIcon = Blockly.Blocks.Definitions.imageDir + 'eye@3x.png';
Blockly.Blocks.Definitions.micIcon = Blockly.Blocks.Definitions.imageDir + 'mike@3x.png';
Blockly.Blocks.Definitions.consoleIcon = Blockly.Blocks.Definitions.imageDir + 'console.png';
Blockly.Blocks.Definitions.speakIcon = Blockly.Blocks.Definitions.imageDir + 'speak.png';
Blockly.Blocks.Definitions.chromebookIcon = Blockly.Blocks.Definitions.imageDir + 'computer.png';

Blockly.Blocks.Definitions.actionStyle = 'action_blocks';
Blockly.Blocks.Definitions.loopsStyle = 'loop_blocks';
Blockly.Blocks.Definitions.colorsStyle = 'colour_blocks';
Blockly.Blocks.Definitions.sensesStyle = 'sense_blocks';
Blockly.Blocks.Definitions.cameraStyle = 'vision_blocks';
Blockly.Blocks.Definitions.dataStyle = 'data_blocks';
Blockly.Blocks.Definitions.mathStyle = 'math_blocks';

Blockly.Blocks.Definitions.requestedModules_any = ['Joint', 'Face', 'Spin'];
Blockly.Blocks.Definitions.requestedModules_anyNoDongle = ['Joint', 'Face', 'Spin'];
Blockly.Blocks.Definitions.requestedModules_anyNoFace = ['Joint', 'Spin'];
Blockly.Blocks.Definitions.requestedModules_Joint = ['Joint'];
Blockly.Blocks.Definitions.requestedModules_Spin = ['Spin'];
