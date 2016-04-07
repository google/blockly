/**
 * @license
 * Visual Blocks Editor
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
 * @fileoverview Robot blocks for Blockly.
 * @author jstn@cs.washington.edu (Justin Huang)
 */
'use strict';

goog.provide('Blockly.Blocks.robot');

goog.require('Blockly.Blocks');

Blockly.Blocks['robot_display_message_h1h2'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("display message");
    this.appendValueInput("H1TEXT")
        .setCheck("String")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("big text");
    this.appendValueInput("H2TEXT")
        .setCheck("String")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("regular text");
    this.appendValueInput("TIMEOUT")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("timeout (s)");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(260);
    this.setTooltip('Displays a message with both big and regular size text.');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_display_ask_multiple_choice'] = {
  init: function() {
    this.appendValueInput("QUESTION")
        .setCheck("String")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("ask multiple choice question");
    this.appendValueInput("CHOICES")
        .setCheck("Array")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("list of choices");
    this.appendValueInput("TIMEOUT")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("timeout (seconds)");
    this.setOutput(true, "String");
    this.setColour(260);
    this.setTooltip('Asks a multiple choice question. The user\'s choice is returned.');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_movement_go_to'] = {
  init: function() {
    this.appendValueInput("LOCATION")
        .setCheck("String")
        .appendField("go to");
    this.setOutput(true, "Boolean");
    this.setColour(160);
    this.setTooltip('Makes the robot go to a named location.');
    this.setHelpUrl('');
  }
};

Blockly.robot = Blockly.robot || {};
Blockly.robot.locations = [['<Select a location>', '<Select a location>']];
Blockly.robot.getLocations = function() {
  var options = [];
  var client = new ROSLIB.Service({
    ros: ROS,
    name: '/location_db/list',
    serviceType : 'location_server/ListPoses'
  });

  var request = new ROSLIB.ServiceRequest({});
  client.callService(request, function(result) {
    for (var i=0; i<result.names.length; ++i) {
      var name = result.names[i];
      options.push([name, name]);
    }
    Blockly.robot.locations = options;
    return options;
  });
};

Blockly.robot.getLocations();

Blockly.Blocks['robot_movement_locations'] = {
  init: function() {
    Blockly.robot.getLocations();
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(Blockly.robot.locations), "NAME");
    this.setOutput(true, "String");
    this.setColour(160);
    this.setTooltip('The list of locations the robot knows about.');
    this.setHelpUrl('');
  },

  onchange: function() {
    if (this.getFieldValue('NAME') === '<Select a location>') {
      this.setWarningText('Select a location from the list.');
    } else {
      this.setWarningText(null);
    }
  },
};

Blockly.Blocks['robot_movement_go_to_dock'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("go to dock");
    this.setOutput(true, "Boolean");
    this.setColour(160);
    this.setTooltip('Makes the robot go to its dock and charge.');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_sound_say'] = {
  init: function() {
    this.appendValueInput("TEXT")
        .setCheck("String")
        .appendField("say");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(65);
    this.setTooltip('Makes the robot say something.');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_head_look_angles'] = {
  init: function() {
    Blockly.FieldAngle.CLOCKWISE = false;
    Blockly.FieldAngle.OFFSET = 90;
    this.appendDummyInput()
        .appendField("look up")
        .appendField(new Blockly.FieldAngle('0'), "UP")
        .appendField("and left")
        .appendField(new Blockly.FieldAngle('0'), "LEFT");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(230);
    this.setTooltip('Look some number of degrees up and/or to the left.');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_head_look_at'] = {
  init: function() {
    this.appendValueInput("OBJECT_OR_PERSON")
        .setCheck(["SceneObject", "Person"])
        .appendField("look at");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(160);
    this.setTooltip('Look at an object.');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_perception_find_objects'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("look for objects");
    this.setOutput(true, "Array");
    this.setColour(230);
    this.setTooltip('Makes the robot look for objects where it\'s looking.');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_perception_object_attributes'] = {
  init: function() {
    this.appendValueInput("OBJECT")
        .appendField(new Blockly.FieldDropdown([["x of object", "X"], ["y of object", "Y"], ["z of object", "Z"], ["long side length of object", "LONGSIDELENGTH"], ["short side length of object", "SHORTSIDELENGTH"], ["height of object", "HEIGHT"]]), "ATTRIBUTE");
    this.setOutput(true);
    this.setColour(230);
    this.setTooltip('Gets an attribute about the given object.');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_movement_tuck_arms'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["tuck", "TUCK"], ["deploy", "DEPLOY"]]), "LEFT_ACTION")
        .appendField("left arm and")
        .appendField(new Blockly.FieldDropdown([["tuck", "TUCK"], ["deploy", "DEPLOY"]]), "RIGHT_ACTION")
        .appendField("right arm");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(20);
    this.setTooltip('Tucks or deploys the robot\'s arms.');
    this.setHelpUrl('');
  }
};
