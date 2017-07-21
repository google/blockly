/**
 * @fileoverview Generating JavaScript for robot blocks.
 * @author jstn@cs.washington.edu (Justin Huang)
 */
'use strict';

goog.provide('Blockly.JavaScript.robot');

goog.require('Blockly.JavaScript');

Blockly.JavaScript['robot_display_message_h2'] = function(block) {
  var value_text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_COMMA);
  var code = 'robot.displayMessage(' + value_text + ', \'\', 0);\n';
  return code;
};

Blockly.JavaScript['robot_display_message_h1h2_no_timeout'] = function(block) {
  var value_h1_text = Blockly.JavaScript.valueToCode(block, 'H1_TEXT', Blockly.JavaScript.ORDER_COMMA) || '\'\'';
  var value_h2_text = Blockly.JavaScript.valueToCode(block, 'H2_TEXT', Blockly.JavaScript.ORDER_COMMA) || '\'\'';
  var code = 'robot.displayMessage(' + value_h1_text + ', ' + value_h2_text + ', 0);\n';
  return code;
};

Blockly.JavaScript['robot_display_message_h1h2'] = function(block) {
  var value_h1text = Blockly.JavaScript.valueToCode(block, 'H1TEXT', Blockly.JavaScript.ORDER_COMMA) || '\'\'';
  var value_h2text = Blockly.JavaScript.valueToCode(block, 'H2TEXT', Blockly.JavaScript.ORDER_COMMA) || '\'\'';
  var value_timeout = Blockly.JavaScript.valueToCode(block, 'TIMEOUT', Blockly.JavaScript.ORDER_COMMA) || 0;
  var code = 'robot.displayMessage(' + value_h1text + ', ' + value_h2text + ', ' + value_timeout + ');\n';
  return code;
};

Blockly.JavaScript['robot_display_ask_multiple_choice'] = function(block) {
  var value_question = Blockly.JavaScript.valueToCode(block, 'QUESTION', Blockly.JavaScript.ORDER_COMMA) || '\'\'';
  var value_choices = Blockly.JavaScript.valueToCode(block, 'CHOICES', Blockly.JavaScript.ORDER_COMMA) || '\'\'';
  var value_timeout = Blockly.JavaScript.valueToCode(block, 'TIMEOUT', Blockly.JavaScript.ORDER_COMMA) || 0;
  var code = 'robot.askMultipleChoice(' + value_question + ', ' + value_choices + ', ' + value_timeout + ')';
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['robot_display_wait_for_button_press'] = function(block) {
  var value_text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_COMMA) || '\'\'';
  var value_button = Blockly.JavaScript.valueToCode(block, 'BUTTON', Blockly.JavaScript.ORDER_COMMA) || '\'\'';
  var value_timeout = Blockly.JavaScript.valueToCode(block, 'TIMEOUT', Blockly.JavaScript.ORDER_COMMA) || 0;
  var code = 'robot.askMultipleChoice(' + value_text + ', [' + value_button + '], ' + value_timeout + ');\n';
  return code;
};

Blockly.JavaScript['robot_movement_go_to'] = function(block) {
  var value_location = Blockly.JavaScript.valueToCode(block, 'LOCATION', Blockly.JavaScript.ORDER_NONE) || '\'\'';
  var code = 'robot.goTo(' + value_location + ')';
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['robot_movement_locations'] = function(block) {
  var dropdown_name = block.getFieldValue('NAME');
  var code = Blockly.JavaScript.quote_(dropdown_name);
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['robot_movement_go_to_dock'] = function(block) {
  var code = 'robot.goToDock()';
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['robot_sound_say'] = function(block) {
  var value_text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_NONE) || '\'\'';
  var code = 'robot.say(' + value_text + ');\n';
  return code;
};

Blockly.JavaScript['robot_head_look_angles'] = function(block) {
  var angle_up = block.getFieldValue('UP') || '0';
  var angle_left = block.getFieldValue('LEFT') || '0';
  var code = 'robot.lookAtDegrees(' + angle_up + ', ' + angle_left + ');\n';
  return code;
};

Blockly.JavaScript['robot_head_look_at'] = function(block) {
  var obj = Blockly.JavaScript.valueToCode(block, 'OBJECT_OR_PERSON', Blockly.JavaScript.NONE) || 'null';
  var code = 'robot.lookAt(' + obj + ');\n';
  return code;
};

Blockly.JavaScript['robot_perception_find_objects'] = function(block) {
  var code = 'robot.findObjects()';
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['robot_perception_object_attributes'] = function(block) {
  var dropdown_attribute = block.getFieldValue('ATTRIBUTE') || '';
  var value_object = Blockly.JavaScript.valueToCode(block, 'OBJECT', Blockly.JavaScript.ORDER_MEMBER) || 'null';
  var code;
  if (dropdown_attribute === 'X') {
    code = value_object + '.pose.pose.position.x';
  } else if (dropdown_attribute === 'Y') {
    code = value_object + '.pose.pose.position.y';
  } else if (dropdown_attribute === 'Z') {
    code = value_object + '.pose.pose.position.z';
  } else if (dropdown_attribute === 'LONGSIDEATTRIBUTE') {
    code = value_object + '.scale.x';
  } else if (dropdown_attribute === 'SHORTSIDEATTRIBUTE') {
    code = value_object + '.scale.y';
  } else if (dropdown_attribute === 'HEIGHT') {
    code = value_object + '.scale.z';
  } else {
    code = 'null';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
  }

  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.JavaScript['robot_perception_custom_landmarks'] = function(block) {
  var dropdown_landmark_id = block.getFieldValue('LANDMARK');
  var code = Blockly.JavaScript.quote_(dropdown_landmark_id);
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['robot_perception_find_custom_landmark'] = function(block) {
  var value_landmark = Blockly.JavaScript.valueToCode(block, 'LANDMARK', Blockly.JavaScript.ORDER_NONE) || '\'\'';
  var checkbox_is_tabletop = block.getFieldValue('IS_TABLETOP') == 'TRUE';
  var code = 'robot.findCustomLandmark(' + value_landmark + ', ' + checkbox_is_tabletop + ')';
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['robot_movement_tuck_arms'] = function(block) {
  var dropdown_left_action = block.getFieldValue('LEFT_ACTION');
  var dropdown_right_action = block.getFieldValue('RIGHT_ACTION');
  var left_action = 'true';
  if (dropdown_left_action === 'DEPLOY') {
    left_action = 'false';
  }
  var right_action = 'true';
  if (dropdown_right_action === 'DEPLOY') {
    right_action = 'false';
  }
  var code = 'robot.tuckArms(' + left_action + ', ' + right_action + ');\n';
  return code;
};

Blockly.JavaScript['robot_manipulation_pick_default'] = function(block) {
  var value_obj = Blockly.JavaScript.valueToCode(block, 'OBJ', Blockly.JavaScript.ORDER_COMMA) || 'null';
  var arm_id = 0; // DEFAULT
  var code = 'robot.pick(' + value_obj + ', ' + arm_id + ')';
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['robot_manipulation_place_default'] = function(block) {
  var arm_id = 0; // DEFAULT
  var code = 'robot.place(' + arm_id + ')';
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['robot_manipulation_open_gripper'] = function(block) {
  var code = 'robot.setGripper(0, 1, 0);\n';
  return code;
};

Blockly.JavaScript['robot_manipulation_close_gripper'] = function(block) {
  var code = 'robot.setGripper(0, 2, 0);\n';
  return code;
};

Blockly.JavaScript['robot_manipulation_set_gripper'] = function(block) {
  var dropdown_action = block.getFieldValue('ACTION') || 'OPEN';
  var dropdown_side = block.getFieldValue('SIDE') || 'LEFT';
  var side = 0;
  if (dropdown_side === 'LEFT') {
    side = 1;
  } else if (dropdown_side === 'RIGHT') {
    side = 2;
  }
  var action = 0;
  if (dropdown_action === 'OPEN') {
    action = 1;
  } else if (dropdown_action === 'CLOSE') {
    action = 2;
  }
  var max_effort = -1;
  var code = 'robot.setGripper(' + side + ', ' + action + ', ' + max_effort + ');\n';
  return code;
};

Blockly.JavaScript['robot_manipulation_set_right_gripper_with_effort'] = function(block) {
  var number_force = block.getFieldValue('FORCE') || -1;
  var side = 2; // Right side
  var action = 2; // Close action
  var code = 'robot.setGripper(' + side + ', ' + action + ', ' + number_force + ');\n';
  return code;
};

Blockly.JavaScript['robot_manipulation_is_gripper_open'] = function(block) {
  var dropdown_gripper = block.getFieldValue('GRIPPER') || '';
  var dropdown_state = block.getFieldValue('STATE') || 'OPEN';
  var code = '';
  var order = Blockly.JavaScript.ORDER_FUNCTION_CALL;
  if (dropdown_state === 'OPEN') {
    code = 'robot.isGripperOpen(' + Blockly.JavaScript.quote_(dropdown_gripper) + ')';
  } else {
    code = '!robot.isGripperOpen(' + Blockly.JavaScript.quote_(dropdown_gripper) + ')';
    order = Blockly.JavaScript.ORDER_LOGICAL_NOT;
  }
  return [code, order];
};

Blockly.JavaScript['robot_manipulation_pbd_actions'] = function(block) {
  var dropdown_action_id = block.getFieldValue('ACTION_ID');
  var code = Blockly.JavaScript.quote_(dropdown_action_id);
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['robot_manipulation_run_pbd_action'] = function(block) {
  var value_action_id = Blockly.JavaScript.valueToCode(block, 'ACTION_ID', Blockly.JavaScript.ORDER_NONE) || '\'\'';
  var preregistered = '{'
  for (var i=0; i<block.landmarks_.length; i++) {
    var id = block.landmarks_[i][1];
    var value_landmark = Blockly.JavaScript.valueToCode(block, 'LANDMARK' + i, Blockly.JavaScript.ORDER_COMMA) || 'null';

    preregistered += Blockly.JavaScript.quote_(id) + ': ' + value_landmark;
    if (i < block.landmarks_.length-1) {
      preregistered += ', ';
    }
  }
  preregistered += '}';
  var code = 'robot.runPbdAction(' + value_action_id + ', ' + preregistered + ')';
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['robot_manipulation_run_pbd_program'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_NONE) || '\'\'';
  var code = 'robot.runPbdProgram(' + value_name + ')';
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['robot_manipulation_pbd_programs'] = function(block) {
  var dropdown_name = block.getFieldValue('NAME');
  var code = Blockly.JavaScript.quote_(dropdown_name);
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['robot_manipulation_set_torso'] = function(block) {
  var value_height = Blockly.JavaScript.valueToCode(block, 'HEIGHT', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'robot.setTorso(' + value_height + ');\n';
  return code;
};

Blockly.JavaScript['robot_wait_for_seconds'] = function(block) {
  var value_seconds = Blockly.JavaScript.valueToCode(block, 'SECONDS', Blockly.JavaScript.ORDER_NONE) || 0;
  var code = 'waitForDuration(' + value_seconds + ');\n';
  return code;
};
