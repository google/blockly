/**
 * @fileoverview Robot blocks for Blockly.
 * @author jstn@cs.washington.edu (Justin Huang)
 */
'use strict';

goog.provide('Blockly.Blocks.robot');

goog.require('Blockly.Blocks');

Blockly.robot = Blockly.robot || {};

Blockly.Blocks['robot_display_message_h2'] = {
  init: function() {
    this.appendValueInput("TEXT")
        .setCheck("String")
        .appendField("display message");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip('Displays a message on the robot\'s screen.');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_display_message_h1h2_no_timeout'] = {
  init: function() {
    this.appendValueInput("H1_TEXT")
        .setCheck("String")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("display big text");
    this.appendValueInput("H2_TEXT")
        .setCheck("String")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("regular text");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip('Displays a message with both big and regular size text.');
    this.setHelpUrl('');
  }
};

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
    this.setColour(230);
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
        .setCheck("SceneObject")
        .appendField(new Blockly.FieldDropdown([["x of object", "X"], ["y of object", "Y"], ["z of object", "Z"], ["long side length of object", "LONGSIDELENGTH"], ["short side length of object", "SHORTSIDELENGTH"], ["height of object", "HEIGHT"]]), "ATTRIBUTE");
    this.setOutput(true);
    this.setColour(230);
    this.setTooltip('Gets an attribute about the given object.');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_perception_find_custom_landmark'] = {
  init: function() {
    this.appendValueInput("LANDMARK")
        .setCheck("Custom landmark ID")
        .appendField("find custom landmark");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(new Blockly.FieldCheckbox("TRUE"), "IS_TABLETOP")
        .appendField("on tabletop");
    this.setInputsInline(false);
    this.setOutput(true, "Array");
    this.setColour(230);
    this.setTooltip('Searches for a custom landmark. More than one may be found. Check "on tabletop" if you know the landmark is in a tabletop scene.');
    this.setHelpUrl('');
  }
};

Blockly.robot.customLandmarks = [['<No landmarks yet>', '<No landmarks yet>']];
Blockly.robot.getCustomLandmarkOptions = function() {
  var options = [];
  var client = new ROSLIB.Service({
    ros: ROS,
    name: '/mongo_msg_db/list',
    serviceType : 'mongo_msg_db_msgs/List'
  });

  var request = new ROSLIB.ServiceRequest({
    collection: {
      db: 'object_search',
      collection: 'objects'
    }
  });
  client.callService(request, function(result) {
    for (var i=0; i<result.messages.length; ++i) {
      var message = result.messages[i];
      var landmark = JSON.parse(message.json);
      options.push([landmark.name, message.id]);
    }
    Blockly.robot.customLandmarks = options;
  });
};

Blockly.robot.getCustomLandmarkOptions();

Blockly.Blocks['robot_perception_custom_landmarks'] = {
  init: function() {
    var that = this;
    Blockly.robot.getCustomLandmarkOptions();
    this.appendDummyInput("DROPDOWN")
        .appendField(new Blockly.FieldDropdown(Blockly.robot.customLandmarks), "LANDMARK");
    this.setOutput(true, "Custom landmark ID");
    this.setColour(230);
    this.setTooltip('Select a custom landmark from the list');
    this.setHelpUrl('');
  },

  onchange: function() {
    if (this.getFieldValue('LANDMARK') === '<No landmarks yet>') {
      if (Blockly.robot.customLandmarks.length === 1) {
        this.setWarningText('No custom landmarks are available to search for.');
      } else {
        this.setWarningText('Select a custom landmark from the list.');
      }
    } else {
      this.setWarningText(null);
    }
  },
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

Blockly.Blocks['robot_manipulation_pick_default'] = {
  init: function() {
    this.appendValueInput("OBJ")
        .setCheck("SceneObject")
        .appendField("pick up object");
    this.setOutput(true, "Boolean");
    this.setColour(20);
    this.setTooltip('Picks up the given object.');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_manipulation_place_default'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("place object on table");
    this.setOutput(true, "Boolean");
    this.setColour(20);
    this.setTooltip('Places the held object onto the nearest table.');
    this.setHelpUrl('');
  }
};

Blockly.robot.pbdActions = [['<Select an action>', '<Select an action>']];
Blockly.robot.getPbdActions = function() {
  var options = [];
  var client = new ROSLIB.Service({
    ros: ROS,
    name: '/mongo_msg_db/list',
    serviceType : 'mongo_msg_db_msgs/List'
  });

  var request = new ROSLIB.ServiceRequest({
    collection: {
      db: 'pr2_pbd',
      collection: 'actions'
    }
  });
  client.callService(request, function(result) {
    for (var i=0; i<result.messages.length; ++i) {
      var message = result.messages[i];
      var program = JSON.parse(message.json);
      options.push([program.name, message.id]);
    }
    Blockly.robot.pbdActions = options;
  });
};

Blockly.robot.getPbdActions();

Blockly.Blocks['robot_manipulation_pbd_actions'] = {
  init: function() {
    Blockly.robot.getPbdActions();
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(Blockly.robot.pbdActions), "ACTION_ID");
    this.setOutput(true, "PbD action ID");
    this.setColour(20);
    this.setTooltip('The Programming by Demonstration actions the robot knows.');
    this.setHelpUrl('');
  },

  onchange: function() {
    if (this.getFieldValue('ACTION_ID') === '<Select an action>') {
      if (Blockly.robot.pbdActions.length === 1) {
        this.setWarningText('No programming by demonstration actions have been created yet.');
      } else {
        this.setWarningText('Select an action from the list.');
      }
    } else {
      this.setWarningText(null);
    }
  },
};

Blockly.Blocks['robot_manipulation_pbd_preregistered_landmarks'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("pre-registered landmarks");
    this.appendStatementInput("STACK")
        .setCheck(null);
    this.setColour(20);
    this.setTooltip('Drag landmarks you would like to use in this action here.');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_manipulation_pbd_landmark'] = {
  init: function() {
    this.appendDummyInput("DROPDOWN")
        .appendField("landmark")
        .appendField(new Blockly.FieldDropdown([["<Drag this to the right>", "<Drag this to the right>"]]), "LANDMARK_ID");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(20);
    this.setTooltip('A landmark you would like to use in this action.');
    this.setHelpUrl('');
    this.landmarks_ = [];
  },

  areLandmarksSame_: function(a, b) {
    if (a.length != b.length) {
      return false;
    }
    var id_names = {};
    for (var i=0; i<a.length; i++) {
      var name = a[i][0];
      var id = a[i][1];
      id_names[id] = name;
    }
    for (var i=0; i<b.length; i++) {
      var name = b[i][0];
      var id = b[i][1];
      if (id_names[id] === undefined) {
        return false;
      }
      if (id_names[id] !== name) {
        return false;
      }
    }
    return true;
  },

  setPossibleLandmarks: function(landmarks) {
    // This check is important to avoid an infinite recursion. This causes the
    // mutator's workspace to change, which causes setPossibleLandmarks to be
    // called, etc.
    if (!this.areLandmarksSame_(this.landmarks_, landmarks)) {
      this.landmarks_ = landmarks;
      this.removeInput('DROPDOWN');
      this.appendDummyInput("DROPDOWN")
          .appendField("landmark")
          .appendField(new Blockly.FieldDropdown(landmarks), "LANDMARK_ID");
    }
  },
};

Blockly.Blocks['robot_manipulation_run_pbd_action'] = {
  init: function() {
    this.appendValueInput("ACTION_ID")
        .setCheck("PbD action ID")
        .appendField("run PbD action");
    this.setOutput(true, "Boolean");
    this.setColour(20);
    this.setTooltip('Executes an action created using the Programming by Demonstration interface.');
    this.setHelpUrl('');
    this.setMutator(new Blockly.Mutator(['robot_manipulation_pbd_landmark']));
    this.possibleLandmarks_ = [];
    this.landmarks_ = []; // Names and IDs of pre-registered landmarks.
  },

  // Given the ID of a PbD action, returns a list of landmark names and IDs
  // used in the action. The value is returned as the argument of the callback.
  // E.g., [['bowl rim', 'id1234'], ['box', 'id2345']]
  getLandmarksForAction_: function(action_id, callback) {
    var options = [];
    var client = new ROSLIB.Service({
      ros: ROS,
      name: '/pr2_pbd/landmarks_for_action',
      serviceType : 'pr2_pbd_interaction/GetLandmarksForAction'
    });

    var request = new ROSLIB.ServiceRequest({
      action_id: action_id
    });
    client.callService(request, function(result) {
      for (var i=0; i<result.landmarks.length; ++i) {
        var landmark = result.landmarks[i];
        options.push([landmark.name, landmark.db_id]);
      }
      callback(options);
    });
  },

  onchange: function(evt) {
    var inputBlock = this.getInput('ACTION_ID');
    if (!inputBlock || !inputBlock.connection.targetConnection) {
      return;
    }
    var actionIdBlock = inputBlock.connection.targetConnection.sourceBlock_;
    // onchange gets called when *any* change happens in the workspace, not just for
    // changes in this block. As a result, this could call the GetLandmarksForAction
    // service really quickly and cause it to fail.
    // Filter out those events.
    if (evt.blockId !== actionIdBlock.id) {
      return;
    }

    var actionInput = this.getInputTargetBlock('ACTION_ID');
    var action_id = actionInput.getFieldValue('ACTION_ID');
    if (action_id) {
      var that = this;
      this.getLandmarksForAction_(action_id, function(landmarks) {
        that.possibleLandmarks_ = landmarks;
      });
    }
  },

  // Update the display of landmarks for this PbD action.
  // @private
  // @this Blockly.Block
  updateLandmarks_: function() {
    // Check for duplicate landmarks.
    var badArg = false;
    var hash = {};
    for (var i = 0; i < this.landmarks_.length; i++) {
      if (hash['landmark_' + this.landmarks_[i][0]]) {
        badArg = true;
        break;
      }
      hash['landmark_' + this.landmarks_[i][0]] = true;
    }
    if (badArg) {
      this.setWarningText('This block should not have duplicate landmarks.');
    } else {
      this.setWarningText(null);
    }
    
    for (var i=0; i<this.landmarks_.length; i++) {
      this.appendValueInput("LANDMARK" + i)
          .setCheck("String")
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(this.landmarks_[i][0]);
    }
  },

  // Write to XML
  mutationToDom: function() {
    var container = document.createElement('mutation');
    for (var i=0; i<this.landmarks_.length; ++i) {
      var landmark = document.createElement('landmark');
      landmark.setAttribute('name', this.landmarks_[i][0]);
      landmark.setAttribute('id', this.landmarks_[i][1]);
      container.appendChild(landmark);
    }
    return container;
  },

  // Load from XML
  domToMutation: function(xmlElement) {
    this.landmarks_ = [];
    for (var i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
      if (childNode.nodeName.toLowerCase() == 'landmark') {
        this.landmarks_.push([childNode.getAttribute('name'), childNode.getAttribute('id')]);
      }
    }

    this.updateLandmarks_();
  },

  // Show the mini-editor
  decompose: function(workspace) {
    var topBlock = workspace.newBlock('robot_manipulation_pbd_preregistered_landmarks');
    topBlock.initSvg();

    var connection = topBlock.getInput('STACK').connection
    for (var i = 0; i < this.landmarks_.length; i++) {
      var paramBlock = workspace.newBlock('robot_manipulation_pbd_landmark');
      paramBlock.setPossibleLandmarks(this.possibleLandmarks_);
      paramBlock.initSvg();
      paramBlock.setFieldValue(this.landmarks_[i][1], 'LANDMARK_ID');
      // Store the old location.
      paramBlock.oldLocation = i;
      connection.connect(paramBlock.previousConnection);
      connection = paramBlock.nextConnection;
    }
    return topBlock;
  },

  // Update the block when the mini-editor changes
  compose: function(topBlock) {
    for (var i = 0; i < this.landmarks_.length; i++) {
      this.removeInput('LANDMARK' + i);
    }
    this.landmarks_ = [];
    var paramBlock = topBlock.getInputTargetBlock('STACK');
    while (paramBlock) {
      paramBlock.setPossibleLandmarks(this.possibleLandmarks_);
      var dropdown = paramBlock.getField('LANDMARK_ID');
      this.landmarks_.push([dropdown.text_, dropdown.getValue()]);
      paramBlock = paramBlock.nextConnection &&
          paramBlock.nextConnection.targetBlock();
    }
    this.updateLandmarks_();
  },
};

Blockly.Blocks['robot_manipulation_set_gripper'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["open", "OPEN"], ["close", "CLOSE"]]), "ACTION")
        .appendField(new Blockly.FieldDropdown([["left", "LEFT"], ["right", "RIGHT"]]), "SIDE")
        .appendField("gripper");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(20);
    this.setTooltip('Opens or closes the gripper.');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_manipulation_is_gripper_open'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["is left gripper", "LEFT"], ["is right gripper", "RIGHT"]]), "GRIPPER")
        .appendField(new Blockly.FieldDropdown([["open", "OPEN"], ["closed", "CLOSED"]]), "STATE");
    this.setOutput(true, "Boolean");
    this.setColour(20);
    this.setTooltip('Checks if the gripper is open or closed.');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_wait_for_seconds'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("wait for");
    this.appendValueInput("SECONDS")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField("seconds");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('Makes the robot pause and wait for some time.');
    this.setHelpUrl('');
  }
};
