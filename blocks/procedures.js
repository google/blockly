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
 * @fileoverview Procedure blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.procedures');

goog.require('Blockly.Blocks');


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.procedures.HUE = 290;

Blockly.Blocks['procedures_defnoreturn'] = {
  /**
   * Block for defining a procedure with no return value.
   * @this Blockly.Block
   */
  init: function() {
    var addField = new Blockly.FieldClickImage(this.addPng, 17, 17);
    addField.setPrivate({name: name, pos: 0});
    addField.setChangeHandler(this.doAddField);

    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.setColour(Blockly.Blocks.procedures.HUE);
    var name = Blockly.Procedures.findLegalName(
        Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE, this);
    var nameField = new Blockly.FieldTextInput(name,
        Blockly.Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
        .appendField(Blockly.Msg.PROCEDURES_DEFNORETURN_TITLE)
        .appendField(nameField, 'NAME')
        .appendField(addField);
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP);
    this.setInputsInline(false);
    this.arguments_ = [];
    this.argid = 0;
    this.setStatements_(true);
    this.statementConnection_ = null;
    this.hasReturnValue_ = false;
  },
  /**
   * Add a parameter to the function
   * @param {!Blockly.FieldClickImage} field Field clicked on for the action
   */
  doAddField: function(field) {
    var paramNum = this.arguments_.length;
    var paramName = 'param'+paramNum;
    var nameInUse = true;
    while (nameInUse) {
      nameInUse = false;
      for (var i = 0; i < this.arguments_.length; i++) {
        if (this.arguments_[i]['name'].toLowerCase() === paramName) {
          nameInUse = true;
          paramNum++;
          paramName = 'param'+paramNum;
          break;
        }
      }
    }
    this.arguments_.push({name: paramName,
                          id: this.argid++});
    this.updateParams_();
  },
  /**
   * remove a specific parameter from a function
   * @param {!Blockly.FieldClickImage} field Field clicked on for the action
   */
  doRemoveField: function(field) {
    var privateData = field.getPrivate();
    var pos = privateData.pos;
    this.arguments_.splice(pos,1);
    this.updateParams_();
  },
  /**
   * Update the display of parameters for this procedure definition block.
   * Display a warning if there are duplicately named parameters.
   * @private
   * @this Blockly.Block
   */
  updateParams_: function() {
    // Check for duplicated arguments.
    var msg = null;
    var hash = {};
    for (var i = 0; i < this.arguments_.length; i++) {
      var name = 'arg_' + this.arguments_[i]['name'].toLowerCase();
      if (hash[name]) {
        msg = Blockly.Msg.PROCEDURES_DEF_DUPLICATE_WARNING;
        break;
      }
      hash[name] = true;
    }
    this.setWarningText(msg);
    //
    // Now go through and eliminate any parameters that we have deleted
    //
    var pos = this.arguments_.length;
    while(this.getInput('PARAM'+pos) != null) {
      this.removeInput('PARAM'+pos);
      pos++;
    }
    for (var i = 0; i < this.arguments_.length; i++) {
      var nameFieldText = 'PARAM'+i+'_NAME';
      var typeFieldText = 'PARAM'+i+'_TYPE';
      var subFieldText = 'PARAM'+i+'_SUB';
      if (!this.getInput('PARAM'+i)) {
        this.jsonInit({
          "message0": Blockly.Msg.PROCEDURES_PARAM_NOTYPE,
//        "message0": Blockly.Msg.PROCEDURES_PARAM_WITH_TYPE,
          "args0": [
            {
              "type": "field_input",
              "text": this.arguments_[i]['name'],
              "name" : nameFieldText
            },
//          {
//            "type": "field_scopevariable",
//            "scope": 'types',
//            "name": typeFieldText
//          },
            {
              "type": "field_clickimage",
              "src": this.subPng,
              "width": 17,
              "height": 17,
              "alt": Blockly.Msg.CLICK_REMOVE_TOOLTIP,
              "name" : subFieldText
            },
            {
              "type": "input_dummy",
              "align": "RIGHT",
              "name": 'PARAM'+i
            }
          ],
          "colour": Blockly.Blocks.procedures.HUE
        });

        var nameField = this.getField(nameFieldText);
        nameField.setSpellcheck(false);
        nameField.setSerializable(false);
        nameField.argPos_ = i;
        nameField.setChangeHandler(this.updateParam);

        var subField = this.getField(subFieldText);
        subField.setPrivate({name: 'param', pos: i});
        subField.setSerializable(false);
        subField.setChangeHandler(this.doRemoveField);

//      var typeField = this.getField(typeFieldText);
//      typeField.setSerializable(false);

        this.moveNumberedInputBefore(this.inputList.length-1, i+1);
        // Name the input since interpolateMsg doesn't name them
        this.inputList[i+1].name = 'PARAM'+i;
      } else {
        // We need to update the field
        this.setFieldValue(this.arguments_[i]['name'], nameFieldText);
//      this.setFieldValue(this.arguments_[i]['type'], typeFieldText);
      }
    }
    // Initialize procedure's callers with blank IDs.
    Blockly.Procedures.mutateCallers(this.getFieldValue('NAME'),
                                     this.workspace, this.arguments_);
  },
  /**
   * Modify the string for a parameter
   * @param {!String} newval New value for the particular field
   * @returns {!String} valid string or null for any error
   * @this {!Blockly.FieldText}
   */
  updateParam: function(newval) {
    if (newval === '') {
      // We can't have an empty name, so disallow it
      return null;
    }
    var pos = this.argPos_;
    var sourceblock = this.sourceBlock_;
    if (sourceblock.arguments_[pos]['name'] !== newval) {
      sourceblock.arguments_[pos]['name'] = newval;
      sourceblock.updateParams_();
    }
    return newval;
  },
  /**
   * Add or remove the statement block from this function definition.
   * @param {boolean} hasStatements True if a statement block is needed.
   * @this Blockly.Block
   */
  setStatements_: function(hasStatements) {
    if (this.hasStatements_ === hasStatements) {
      return;
    }
    if (hasStatements) {
      this.appendStatementInput('STACK')
          .appendField(Blockly.Msg.PROCEDURES_DEFNORETURN_DO);
      if (this.getInput('RETURN')) {
        this.moveInputBefore('STACK', 'RETURN');
      }
    } else {
      this.removeInput('STACK', true);
    }
    this.hasStatements_ = hasStatements;
  },
  /**
   * Create XML to represent the argument inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    for (var i = 0; i < this.arguments_.length; i++) {
      var parameter = document.createElement('arg');
      parameter.setAttribute('name', this.arguments_[i]['name']);
//    parameter.setAttribute('type', this.arguments_[i]['type']);
      container.appendChild(parameter);
    }

    // Save whether the statement input is visible.
    if (!this.hasStatements_) {
      container.setAttribute('statements', 'false');
    }
    return container;
  },
  /**
   * Parse XML to restore the argument inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.arguments_ = [];
    for (var i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
      if (childNode.nodeName.toLowerCase() == 'arg') {
        this.arguments_.push({name: childNode.getAttribute('name'),
//                            type: childNode.getAttribute('type'),
                              id:   this.argid++});
      }
    }
    this.updateParams_();

    // Show or hide the statement input.
    this.setStatements_(xmlElement.getAttribute('statements') !== 'false');
  },

  /**
   * Dispose of any callers.
   * @this Blockly.Block
   */
  dispose: function() {
    var name = this.getFieldValue('NAME');
    Blockly.Procedures.disposeCallers(name, this.workspace);
    // Call parent's destructor.
    this.constructor.prototype.dispose.apply(this, arguments);
  },
  /**
   * Return the signature of this procedure definition.
   * @return {!Array} Tuple containing three elements:
   *     - the name of the defined procedure,
   *     - a list of all its arguments,
   *     - Whether or not it has a return value.
   * @this Blockly.Block
   */
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, this.hasReturnValue_];
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array.<string>} List of variable names.
   * @this Blockly.Block
   */
  getVars: function() {
    var varList = [];
    for (var i = 0; i < this.arguments_.length; i++) {
      varList.push(this.arguments_[i]['name']);
    }
    return varList;
  },
  /**
   * Return all types of variables referenced by this block.
   * @return {!Array.<Object>} List of variable names with their types.
   * @this Blockly.Block
   */
  getVarsTypes: function() {
    var vartypes = {};
    for (var i = 0; i < this.arguments_.length; i++) {
      if (this.arguments_[i]['type']) {
        vartypes[this.arguments_[i]['name']] = this.arguments_[i]['type'];
      }
    }
    return vartypes;
  },
  /**
   * Notification that a variable is renaming.
   * If the name matches one of this block's variables, rename it.
   * @param {string} oldName Previous name of variable.
   * @param {string} newName Renamed variable.
   * @this Blockly.Block
   */
  // TODO: In theory you shouldn't be able to rename parameters from outside the
  //       scope of the function.
  renameVar: function(oldName, newName) {
    var change = false;
    for (var i = 0; i < this.arguments_.length; i++) {
      if (Blockly.Names.equals(oldName, this.arguments_[i]['name'])) {
        this.arguments_[i]['name'] = newName;
        change = true;
      }
    }
    if (change) {
      this.updateParams_();
    }
  },
  /**
   * Add custom menu options to this block's context menu.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    // Add option to create caller.
    var option = {enabled: true};
    var name = this.getFieldValue('NAME');
    option.text = Blockly.Msg.PROCEDURES_CREATE_DO.replace('%1', name);
    var xmlMutation = goog.dom.createDom('mutation');
    xmlMutation.setAttribute('name', name);
    for (var i = 0; i < this.arguments_.length; i++) {
      var xmlArg = goog.dom.createDom('arg');
      xmlArg.setAttribute('name', this.arguments_[i]['name']);
      xmlMutation.appendChild(xmlArg);
    }
    var xmlBlock = goog.dom.createDom('block', null, xmlMutation);
    xmlBlock.setAttribute('type', this.callType_);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);

    // Add options to create getters for each parameter.
    if (!this.isCollapsed()) {
      for (var i = 0; i < this.arguments_.length; i++) {
        var option = {enabled: true};
        var name = this.arguments_[i]['name'];
        option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
        var xmlField = goog.dom.createDom('field', null, name);
        xmlField.setAttribute('name', 'VAR');
        var xmlBlock = goog.dom.createDom('block', null, xmlField);
        xmlBlock.setAttribute('type', 'variables_get');
        option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
        options.push(option);
      }
    }
  },
  callType_: 'procedures_callnoreturn'
};

Blockly.Blocks['procedures_defreturn'] = {
  /**
   * Block for defining a procedure with a return value.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFRETURN_HELPURL);
    this.setColour(Blockly.Blocks.procedures.HUE);
    var name = Blockly.Procedures.findLegalName(
        Blockly.Msg.PROCEDURES_DEFRETURN_PROCEDURE, this);
    var nameField = new Blockly.FieldTextInput(name,
        Blockly.Procedures.rename);
    nameField.setSpellcheck(false);
    var addField = new Blockly.FieldClickImage(this.addPng, 17, 17);
    addField.setPrivate({name: name, pos: 0});
    addField.setChangeHandler(this.doAddField);

    this.appendDummyInput()
        .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_TITLE)
        .appendField(nameField, 'NAME')
        .appendField(addField);
    this.appendValueInput('RETURN')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFRETURN_TOOLTIP);
    this.setInputsInline(false);
    this.arguments_ = [];
    this.argid = 0;
    this.setStatements_(true);
    this.statementConnection_ = null;
    this.hasReturnValue_ = true;
  },
  doAddField: Blockly.Blocks['procedures_defnoreturn'].doAddField,
  doRemoveField: Blockly.Blocks['procedures_defnoreturn'].doRemoveField,
  updateParams_: Blockly.Blocks['procedures_defnoreturn'].updateParams_,
  updateParam: Blockly.Blocks['procedures_defnoreturn'].updateParam,
  setStatements_: Blockly.Blocks['procedures_defnoreturn'].setStatements_,
  mutationToDom: Blockly.Blocks['procedures_defnoreturn'].mutationToDom,
  domToMutation: Blockly.Blocks['procedures_defnoreturn'].domToMutation,
  dispose: Blockly.Blocks['procedures_defnoreturn'].dispose,
  getProcedureDef: Blockly.Blocks['procedures_defnoreturn'].getProcedureDef,
  getVars: Blockly.Blocks['procedures_defnoreturn'].getVars,
  getVarsTypes: Blockly.Blocks['procedures_defnoreturn'].getVarsTypes,
  renameVar: Blockly.Blocks['procedures_defnoreturn'].renameVar,
  customContextMenu: Blockly.Blocks['procedures_defnoreturn'].customContextMenu,
  callType_: 'procedures_callreturn'
};

Blockly.Blocks['procedures_callnoreturn'] = {
  /**
   * Block for calling a procedure with no return value.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLNORETURN_HELPURL);
    this.setColour(Blockly.Blocks.procedures.HUE);
    this.appendDummyInput('TOPROW')
        .appendField(Blockly.Msg.PROCEDURES_CALLNORETURN_CALL)
        .appendField('', 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    // Tooltip is set in domToMutation.
    this.arguments_ = [];
    this.quarkConnections_ = {};
  },
  /**
   * Returns the name of the procedure this block calls.
   * @return {string} Procedure name.
   * @this Blockly.Block
   */
  getProcedureCall: function() {
    // The NAME field is guaranteed to exist, null will never be returned.
    return /** @type {string} */ (this.getFieldValue('NAME'));
  },
  /**
   * Notification that a procedure is renaming.
   * If the name matches this block's procedure, rename it.
   * @param {string} oldName Previous name of procedure.
   * @param {string} newName Renamed procedure.
   * @this Blockly.Block
   */
  renameProcedure: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getProcedureCall())) {
      this.setFieldValue(newName, 'NAME');
      this.setTooltip(
          (this.outputConnection ? Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP :
           Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP)
          .replace('%1', newName));
    }
  },
  /**
   * Notification that the procedure's parameters have changed.
   * @param {!Array.<string>} paramNames New param names, e.g. ['x', 'y', 'z'].
   * @param {!Array.<string>} paramIds IDs of params (consistent for each
   *     parameter through the life of a block, regardless of param renaming),
   *     e.g. ['piua', 'f8b_', 'oi.o'].
   * @this Blockly.Block
   */
  setProcedureParameters: function(parameters) {
    // Data structures:
    // this.arguments = [{name: 'x', type: null, id: 1},{name: 'y', id:2}]
    //     Existing param names.
    // this.quarkConnections_ {piua: null, f8b_: Blockly.Connection}
    //     Look-up of paramIds to connections plugged into the call block.
    // Note that quarkConnections_ may include IDs that no longer exist, but
    // which might reappear if a param is recreated.
    if (goog.array.equals(this.arguments_, parameters, goog.object.equals)) {
      return;
    }
    this.setCollapsed(false);
    // Switch off rendering while the block is rebuilt.
    var savedRendered = this.rendered;
    this.rendered = false;
    // Update the quarkConnections_ with existing connections and remove them.
    for (var i = this.arguments_.length - 1; i >= 0; i--) {
      var input = this.getInput('ARG' + i);
      if (input) {
        var connection = input.connection.targetConnection;
        if (connection) {
          connection.sourceBlock_.unplug(true,true);
          this.quarkConnections_[this.arguments_[i]['name']] = connection;
        }
        // Disconnect all argument blocks and remove all inputs.
        this.removeInput('ARG' + i);
      }
    }
    // Rebuild the block's arguments.
    var oldArguments = this.arguments_;
    this.arguments_ = [];
    for ( var i = 0; i < parameters.length; i++) {
      this.arguments_.push({name: parameters[i]['name'],
                            type: parameters[i]['type'],
                            id:   parameters[i]['id']});
    }
    this.renderArgs_();
    // Reconnect any child blocks.
    for (var i = 0; i < this.arguments_.length; i++) {
      var input = this.getInput('ARG' + i);
      // First we want to see if there is an old block with the same ID as
      // this argument.
      var quarkName = this.arguments_[i]['name'];
      var quarkID = this.arguments_[i]['id'];
      if (quarkID != null) {
        for (var j = 0; j < oldArguments.length; j++) {
          if (oldArguments[j]['id'] === quarkID) {
            if (this.quarkConnections_[oldArguments[j]['name']]) {
              quarkName = oldArguments[j]['name'];
            }
            break;
          }
        }
      }

      if (quarkName && this.quarkConnections_[quarkName]) {
        var connection = this.quarkConnections_[quarkName];
        if (connection &&
            !connection.targetConnection &&
            connection.sourceBlock_.workspace == this.workspace) {
          input.connection.connect(connection);
        }
        // This connection is no good or it has already been used
        // Either way we won't use it in the future
        delete this.quarkConnections_[quarkName];
      }
    }
    // Restore rendering and show the changes.
    this.rendered = savedRendered;
    this.bumpNeighbours_();
    if (this.rendered) {
      this.render();
    }
  },
  /**
   * Render the arguments.
   * @this Blockly.Block
   * @private
   */
  renderArgs_: function() {
    for (var i = 0; i < this.arguments_.length; i++) {
      var input = this.appendValueInput('ARG' + i)
                      .setAlign(Blockly.ALIGN_RIGHT)
                      .appendField(this.arguments_[i]['name']);
      input.init();
    }
    // Add 'with:' if there are parameters.
    var input = this.getInput('TOPROW');
    if (input) {
      if (this.arguments_.length) {
        if (!this.getField('WITH')) {
          input.appendField(Blockly.Msg.PROCEDURES_CALL_BEFORE_PARAMS, 'WITH');
          input.init();
        }
      } else {
        if (this.getField('WITH')) {
          input.removeField('WITH');
        }
      }
    }
  },
  /**
   * Create XML to represent the (non-editable) name and arguments.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('name', this.getProcedureCall());
    for (var i = 0; i < this.arguments_.length; i++) {
      var parameter = document.createElement('arg');
      parameter.setAttribute('name', this.arguments_[i]['name']);
      container.appendChild(parameter);
    }
    return container;
  },
  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    var name = xmlElement.getAttribute('name');
    this.setFieldValue(name, 'NAME');
    this.setTooltip(
        (this.outputConnection ? Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP :
         Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP).replace('%1', name));
    var def = Blockly.Procedures.getDefinition(name, this.workspace);
    var args = [];
    if (def) {
      args = def.arguments_;
    } else {
      for (var i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
        if (childNode.nodeName.toLowerCase() == 'arg') {
          args.push({name: childNode.getAttribute('name')});
        }
      }
    }
    this.setProcedureParameters(args);
  },
  /**
   * Notification that a variable is renaming.
   * If the name matches one of this block's variables, rename it.
   * @param {string} oldName Previous name of variable.
   * @param {string} newName Renamed variable.
   * @this Blockly.Block
   */
  renameVar: function(oldName, newName) {
    for (var i = 0; i < this.arguments_.length; i++) {
      if (Blockly.Names.equals(oldName, this.arguments_[i]['name'])) {
        this.arguments_[i]['name'] = newName;
        this.getInput('ARG' + i).fieldRow[0].setText(newName);
      }
    }
  },
  /**
   * Add menu option to find the definition block for this call.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    var option = {enabled: true};
    option.text = Blockly.Msg.PROCEDURES_HIGHLIGHT_DEF;
    var name = this.getProcedureCall();
    var workspace = this.workspace;
    option.callback = function() {
      var def = Blockly.Procedures.getDefinition(name, workspace);
      def && def.select();
    };
    options.push(option);
  }
};

Blockly.Blocks['procedures_callreturn'] = {
  /**
   * Block for calling a procedure with a return value.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLRETURN_HELPURL);
    this.setColour(Blockly.Blocks.procedures.HUE);
    this.appendDummyInput('TOPROW')
        .appendField(Blockly.Msg.PROCEDURES_CALLRETURN_CALL)
        .appendField('', 'NAME');
    this.setOutput(true);
    // Tooltip is set in domToMutation.
    this.arguments_ = [];
    this.quarkConnections_ = {};
    this.quarkArguments_ = null;
  },
  getProcedureCall: Blockly.Blocks['procedures_callnoreturn'].getProcedureCall,
  renameProcedure: Blockly.Blocks['procedures_callnoreturn'].renameProcedure,
  setProcedureParameters:
      Blockly.Blocks['procedures_callnoreturn'].setProcedureParameters,
  renderArgs_: Blockly.Blocks['procedures_callnoreturn'].renderArgs_,
  mutationToDom: Blockly.Blocks['procedures_callnoreturn'].mutationToDom,
  domToMutation: Blockly.Blocks['procedures_callnoreturn'].domToMutation,
  renameVar: Blockly.Blocks['procedures_callnoreturn'].renameVar,
  customContextMenu: Blockly.Blocks['procedures_callnoreturn'].customContextMenu
};

Blockly.Blocks['procedures_ifreturn'] = {
  /**
   * Block for conditionally returning a value from a procedure.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl('http://c2.com/cgi/wiki?GuardClause');
    this.setColour(Blockly.Blocks.procedures.HUE);
    this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField(Blockly.Msg.CONTROLS_IF_MSG_IF);
    this.appendValueInput('VALUE')
        .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.PROCEDURES_IFRETURN_TOOLTIP);
    this.hasReturnValue_ = true;
  },
  /**
   * Create XML to represent whether this block has a return value.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('value', Number(this.hasReturnValue_));
    return container;
  },
  /**
   * Parse XML to restore whether this block has a return value.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    var value = xmlElement.getAttribute('value');
    this.hasReturnValue_ = (value == 1);
    if (!this.hasReturnValue_) {
      this.removeInput('VALUE');
      this.appendDummyInput('VALUE')
        .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
    }
  },
  /**
   * Called whenever anything on the workspace changes.
   * Add warning if this flow block is not nested inside a loop.
   * @this Blockly.Block
   */
  onchange: function() {
    var legal = false;
    // Is the block nested in a procedure?
    var block = this;
    do {
      if (block.type == 'procedures_defnoreturn' ||
          block.type == 'procedures_defreturn') {
        legal = true;
        break;
      }
      block = block.getSurroundParent();
    } while (block);
    if (legal) {
      // If needed, toggle whether this block has a return value.
      if (block.type == 'procedures_defnoreturn' && this.hasReturnValue_) {
        this.removeInput('VALUE');
        this.appendDummyInput('VALUE')
          .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
        this.hasReturnValue_ = false;
      } else if (block.type == 'procedures_defreturn' &&
                 !this.hasReturnValue_) {
        this.removeInput('VALUE');
        this.appendValueInput('VALUE')
          .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
        this.hasReturnValue_ = true;
      }
      this.setWarningText(null);
    } else {
      this.setWarningText(Blockly.Msg.PROCEDURES_IFRETURN_WARNING);
    }
  }
};
