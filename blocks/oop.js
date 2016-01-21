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
 * @fileoverview Object oriented blocks and block variants
 * @author fdohrendorf@outlook.com (Florian Dohrendorf)
 */
'use strict';

goog.provide('Blockly.Blocks.oop');

goog.require('Blockly.Variable');
goog.require('Blockly.Blocks');
goog.require('Blockly.Blocks.variables');
goog.require('Blockly.Blocks.procedures');

/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.oop.HUE = 20;

Blockly.Blocks['new_instance'] = {
    /**
   * Block for creating a new instance
   * @this Blockly.Block
   */
    init: function () {
        this.setColour(Blockly.Blocks.oop.HUE);

        var thisarg = this;

        var fieldType = new Blockly.FieldType(function (e) {
            thisarg.setOutput(true, e);
        });
        this.appendDummyInput()
            .appendField('new', undefined)
            .appendField(fieldType, 'TYPE');

        this.setOutput(true, fieldType.getValue());
    }
};

Blockly.Blocks['field_get'] = {
    /**
   * Block for field getter.
   * @this Blockly.Block
   */
    init: function () {
        this.setColour(Blockly.Blocks.oop.HUE);

        var thisarg = this;

        this.appendValueInput('INSTANCE')
            .appendField('get', undefined)
            .setCheck('Object');

        this.fieldFieldref_ = new Blockly.FieldFieldref(function (e) {
            var fieldName = e;
            var type = this.getType();
            var fields = Blockly.Types.getFields(type.name);
            var field = fields.filter(function (e) { return e.name == fieldName })[0];
            thisarg.setOutput(true, field.type);
        });
        this.appendDummyInput()
            .appendField('.', undefined)
            .appendField(this.fieldFieldref_, 'FIELD');

        this.setInputsInline(true);

        this.setOutput(true);
    },
    /**
   * Called whenever anything on the workspace changes.
   * Prevent mismatched types.
   * @this Blockly.Block
   */
    onchange: function () {
        var blockInstance = this.getInputTargetBlock('INSTANCE');

        // disconnected
        if (!blockInstance) {
            this.fieldFieldref_.setType(null);
            this.setOutput(true);
            return;
        }

        var outputConnection = blockInstance.outputConnection;
        var check = outputConnection.getCheck();

        // we do not support no type or multiple types or primititve types
        if (!check || check.length > 1 || Blockly.Types.isPrimitive(check[0])) {
            this.fieldFieldref_.setType(null);
            this.setOutput(true);
            return;
        }

        // set type
        var type = Blockly.Types.getType(check[0]);
        this.fieldFieldref_.setType(type);

        // set output
        var fieldName = this.fieldFieldref_.getValue();
        var fields = Blockly.Types.getFields(type.name);
        var field = fields.filter(function (e) { return e.name == fieldName })[0];
        this.setOutput(true, field.type);
    }
};


Blockly.Blocks['field_set'] = {
    /**
   * Block for field setter.
   * @this Blockly.Block
   */
    init: function () {
        this.setColour(Blockly.Blocks.oop.HUE);

        var thisarg = this;

        this.appendValueInput('INSTANCE')
            .appendField('set', undefined)
            .setCheck('Object');

        this.fieldFieldref_ = new Blockly.FieldFieldref(function (e) {
            var fieldName = e;
            var type = this.getType();
            var fields = Blockly.Types.getFields(type.name);
            var field = fields.filter(function (e) { return e.name == fieldName })[0];
            thisarg.input_.setCheck(field.type);
        });
        this.appendDummyInput()
            .appendField(".", undefined)
            .appendField(this.fieldFieldref_, 'FIELD');

        this.input_ = this.appendValueInput('VALUE');

        this.setInputsInline(true);
    },
    /**
   * Called whenever anything on the workspace changes.
   * Prevent mismatched types.
   * @this Blockly.Block
   */
    onchange: function () {
        var blockInstance = this.getInputTargetBlock('INSTANCE');

        // disconnected
        if (!blockInstance) {
            this.fieldFieldref_.setType(null);
            this.input_.setCheck(null);
            return;
        }

        var outputConnection = blockInstance.outputConnection;
        var check = outputConnection.getCheck();

        // we do not support no type or multiple types or primititve types
        if (!check || check.length > 1 || Blockly.Types.isPrimitive(check[0])) {
            this.fieldFieldref_.setType(null);
            this.input_.setCheck(null);
            return;
        }

        // set type
        var type = Blockly.Types.getType(check[0]);
        this.fieldFieldref_.setType(type);

        // set input
        var fieldName = this.fieldFieldref_.getValue();
        var fields = Blockly.Types.getFields(type.name);
        var field = fields.filter(function (e) { return e.name == fieldName })[0];
        this.input_.setCheck(field.type);
    }
};

// TODO re-use as much as possible from variables_get
//Blockly.Blocks['oop_variables_get'] = {
//    /**
//     * Block for variable getter.
//     * @this Blockly.Block
//     */
//    init: function () {
//        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
//        this.setColour(Blockly.Blocks.oop.HUE);

//        var thisarg = this;
//        var input = this.appendDummyInput();
//        input.appendField(new Blockly.FieldVariable(
//        { name: Blockly.Msg.VARIABLES_DEFAULT_NAME/*, type: 'String'*/ }, function (e) {
//            // handle new and rename
//            e = Blockly.FieldVariable.dropdownChange.call(this, e) || e;
//            if (e) {
//                // modify the check
//                thisarg.setOutput(true, e.type);
//            }
//            return e;
//        }), 'VAR');
//        this.setOutput(true/*, 'String'*/);
//        this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);

//        this.setMutator(new Blockly.Mutator([]));
//        this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
//    },

//    /**
//     * Return all variables referenced by this block.
//     * @return {!Array.<string>} List of variable names.
//     * @this Blockly.Block
//     */
//    getVars: function () {
//        return [this.getFieldValue('VAR')];
//    },
//    /**
//     * Notification that a variable is renaming.
//     * If the name matches one of this block's variables, rename it.
//     * @param {string} oldName Previous name of variable.
//     * @param {string} newName Renamed variable.
//     * @this Blockly.Block
//     */
//    changeVar: function (oldName, newName) {
//        // TODO see procedures_defnoreturn . changeVar for how to change the mutator
//        var fieldValue = this.getFieldValue('VAR');
//        if (Blockly.Names.equals(oldName.name, fieldValue.name)) {
//            this.setFieldValue(newName, 'VAR');
//            this.setOutput(true, newName.type);
//        }
//    },
//    contextMenuType_: 'oop_variables_set',
//    /**
//     * Add menu option to create getter/setter block for this setter/getter.
//     * @param {!Array} options List of menu options to add to.
//     * @this Blockly.Block
//     */
//    customContextMenu: function (options) {
//        var option = { enabled: true };
//        var name = this.getFieldValue('VAR');
//        option.text = this.contextMenuMsg_.replace('%1', name);
//        var xmlField = goog.dom.createDom('field', null, name);
//        xmlField.setAttribute('name', 'VAR');
//        var xmlBlock = goog.dom.createDom('block', null, xmlField);
//        xmlBlock.setAttribute('type', this.contextMenuType_);
//        option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
//        options.push(option);
//    },

//    decompose: function (workspace) {
//        var containerBlock = workspace.newBlock('oop_variables_mutatortype');
//        containerBlock.initSvg();

//        var variable = this.getFieldValue("VAR");
//        containerBlock.setFieldValue(variable.type, "TYPE");

//        return containerBlock;
//    },

//    compose: function (containerBlock) {
//        var type = containerBlock.getFieldValue("TYPE");
//        var oldVar = this.getFieldValue("VAR");
//        var newVar = { name: oldVar.name, type: type };
//        Blockly.Variables.changeVariable(oldVar, newVar, this.workspace);
//    }
//};

//// TODO re-use as much as possible from variables_set
//Blockly.Blocks["oop_variables_set"] = {
//    /**
//   * Block for variable setter.
//   * @this Blockly.Block
//   */
//    init: function () {
//        var thisarg = this;
//        this.jsonInit({
//            "message0": Blockly.Msg.VARIABLES_SET,
//            "args0": [
//            {
//                "type": "field_variable",
//                "name": "VAR",
//                "variable": {
//                    "name": Blockly.Msg.VARIABLES_DEFAULT_NAME
//                },
//                "change": function (e) {
//                    // handle new and rename
//                    e = Blockly.FieldVariable.dropdownChange.call(this, e) || e;
//                    if (e) {
//                        // modify the check
//                        thisarg.getInput("VALUE").setCheck(e.type);
//                    }
//                    return e;
//                }
//            },
//          {
//              "type": "input_value",
//              "name": "VALUE"
//          }
//            ],
//            "previousStatement": null,
//            "nextStatement": null,
//            "colour": Blockly.Blocks.oop.HUE,
//            "tooltip": Blockly.Msg.VARIABLES_SET_TOOLTIP,
//            "helpUrl": Blockly.Msg.VARIABLES_SET_HELPURL
//        });

//        this.setMutator(new Blockly.Mutator([]));
//        this.contextMenuMsg_ = Blockly.Msg.VARIABLES_SET_CREATE_GET;
//    },
//    /**
//     * Return all variables referenced by this block.
//     * @return {!Array.<string>} List of variable names.
//     * @this Blockly.Block
//     */
//    getVars: function () {
//        return [this.getFieldValue('VAR')];
//    },
//    /**
//     * Notification that a variable is renaming.
//     * If the name matches one of this block's variables, rename it.
//     * @param {string} oldName Previous name of variable.
//     * @param {string} newName Renamed variable.
//     * @this Blockly.Block
//     */
//    changeVar: function (oldName, newName) {
//        // TODO see procedures_defnoreturn . changeVar for how to change the mutator
//        if (Blockly.Names.equals(oldName.name, this.getFieldValue('VAR').name)) {
//            this.setFieldValue(newName, 'VAR');
//            this.getInput('VALUE').setCheck(newName.type);
//        }
//    },
//    contextMenuType_: 'oop_variables_get',
//    customContextMenu: Blockly.Blocks['oop_variables_get'].customContextMenu,
//    decompose: Blockly.Blocks['oop_variables_get'].decompose,
//    compose: Blockly.Blocks['oop_variables_get'].compose
//};


//Blockly.Blocks['oop_variables_mutatortype'] = {
//    init: function () {
//        this.setColour(Blockly.Blocks.oop.HUE);

//        this.appendDummyInput()
//            .appendField(new Blockly.FieldType(), "TYPE");

//        this.setInputsInline(true);
//    },

//    changeVar: function (oldName, newName) {
//        while (false);
//    }
//};

//Blockly.Blocks['var_type'] = {
//    init: function () {
//        this.setColour(Blockly.Blocks.variables.HUE);

//        this.appendDummyInput()
//            .appendField(new Blockly.FieldVariable(
//            { name: Blockly.Msg.VARIABLES_DEFAULT_NAME }))
//            .appendField(' type ');
//        this.appendDummyInput()
//            .appendField(new Blockly.FieldType());

//        this.setInputsInline(true);
//    }
//};


//Blockly.Blocks['oop_variables_get2'] = {
//    init: function () {
//        Blockly.Blocks['variables_get'].init.call(this);
//        this.appendDummyInput().appendField(new Blockly.FieldType(), "TYPE");
//        this.setInputsInline(false);
//    },
//    getVars: Blockly.Blocks['variables_get'].getVars,
//    changeVar: Blockly.Blocks['variables_get'].changeVar,
//    contextMenuType_: 'oop_variables_set2',
//    customContextMenu: Blockly.Blocks['variables_get'].customContextMenu
//};

// TODO re-use as much as possible from variables_set
Blockly.Blocks["oop_variables_set"] = {
    /**
   * Block for variable setter.
   * @this Blockly.Block
   */
    init: function () {
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setColour(Blockly.Blocks.oop.HUE);

        var thisarg = this;
        this.appendValueInput("VALUE")
            .appendField("set")
            .appendField(new Blockly.FieldVariable({
                "name": Blockly.Msg.VARIABLES_DEFAULT_NAME
            }, function (e) {
                // handle new and rename
                e = Blockly.FieldVariable.dropdownChange.call(this, e) || e;
                if (e) {
                    thisarg.setFieldValue(e.type, 'TYPE');
                    // modify the check
                    thisarg.getInput("VALUE").setCheck(e.type);
                }
                return e;
            }), "VAR")
            .appendField("of type")
            .appendField(new Blockly.FieldType(function(type) {
                var oldVar = thisarg.getFieldValue("VAR");
                var newVar = { name: oldVar.name, type: type };
                Blockly.Variables.changeVariable(oldVar, newVar, thisarg.workspace);
            }), "TYPE")
            .appendField("to");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
    },
    getVars: Blockly.Blocks['variables_set'].getVars,
    /**
   * Notification that a variable is changing.
   * If the name matches one of this block's variables, change it.
   * @param {!Blockly.Variable} oldVar Previous variable.
   * @param {!Blockly.Variable} newVar New variable.
   * @this Blockly.Block
   */
    changeVar: function (oldName, newName) {
        if (Blockly.Names.equals(oldName.name, this.getFieldValue('VAR').name)) {
            this.setFieldValue(newName, 'VAR');
            this.setFieldValue(newName.type, 'TYPE')
            this.getInput('VALUE').setCheck(newName.type);
        }
    },
    contextMenuType_: 'variables_get',
    customContextMenu: Blockly.Blocks['variables_get'].customContextMenu,
};

var procedures_defnoreturn = Blockly.Blocks['procedures_defnoreturn'];
Blockly.Blocks['oop_procedures_defnoreturn'] = {
    /**
   * Block for defining a procedure with no return value.
   * @this Blockly.Block
   */
    init: function() {
        procedures_defnoreturn.init.call(this);
        this.setMutator(new Blockly.Mutator(['oop_procedures_mutatorarg']));
    },
    validate: procedures_defnoreturn.validate,
    setStatements_: procedures_defnoreturn.setStatements_,
    updateParams_: procedures_defnoreturn.updateParams_,
    mutationToDom: procedures_defnoreturn.mutationToDom,
    domToMutation: procedures_defnoreturn.domToMutation,
    /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
    decompose: function (workspace) {
        var containerBlock = workspace.newBlock('oop_procedures_mutatorcontainer');
        containerBlock.initSvg();

        // Check/uncheck the allow statement box.
        if (this.getInput('RETURN')) {
            containerBlock.setFieldValue(this.hasStatements_ ? 'TRUE' : 'FALSE',
                                         'STATEMENTS');
            containerBlock.setFieldValue(this.returnType_, "TYPE");
        } else {
            containerBlock.getInput('STATEMENT_INPUT').setVisible(false);
        }

        // Parameter list.
        var connection = containerBlock.getInput('STACK').connection;
        for (var i = 0; i < this.arguments_.length; i++) {
            var paramBlock = workspace.newBlock('oop_procedures_mutatorarg');
            paramBlock.initSvg();
            paramBlock.setFieldValue(this.arguments_[i].name, 'NAME');
            paramBlock.setFieldValue(this.arguments_[i].type, 'TYPE');
            // Store the old location.
            paramBlock.oldLocation = i;
            connection.connect(paramBlock.previousConnection);
            connection = paramBlock.nextConnection;
        }
        // Initialize procedure's callers with blank IDs.
        var names = this.arguments_.map(function (e) { return e.name; });
        Blockly.Procedures.mutateCallers(this.getFieldValue('NAME'),
                                         this.workspace, names, null, undefined);
        return containerBlock;
    },
    /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
    compose: function (containerBlock) {
        // Parameter list.
        this.arguments_ = [];
        this.paramIds_ = [];
        this.returnType_ = containerBlock.getFieldValue("TYPE");
        var paramBlock = containerBlock.getInputTargetBlock('STACK');
        while (paramBlock) {
            this.arguments_.push({
                name: paramBlock.getFieldValue('NAME'),
                type: paramBlock.getFieldValue('TYPE')
            });
            this.paramIds_.push(paramBlock.id);
            paramBlock = paramBlock.nextConnection &&
                paramBlock.nextConnection.targetBlock();
        }
        this.updateParams_();
        //var names = this.arguments_.map(function (e) { return e.name; });
        Blockly.Procedures.mutateCallers(this.getFieldValue('NAME'),
            this.workspace, this.arguments_, this.paramIds_, this.returnType_);

        // Show/hide the statement input.
        var hasStatements = containerBlock.getFieldValue('STATEMENTS');
        if (hasStatements !== null) {
            hasStatements = hasStatements == 'TRUE';
            if (this.hasStatements_ != hasStatements) {
                if (hasStatements) {
                    this.setStatements_(true);
                    // Restore the stack, if one was saved.
                    var stackConnection = this.getInput('STACK').connection;
                    if (stackConnection.targetConnection ||
                        !this.statementConnection_ ||
                        this.statementConnection_.targetConnection ||
                        this.statementConnection_.sourceBlock_.workspace !=
                        this.workspace) {
                        // Block no longer exists or has been attached elsewhere.
                        this.statementConnection_ = null;
                    } else {
                        stackConnection.connect(this.statementConnection_);
                    }
                } else {
                    // Save the stack, then disconnect it.
                    var stackConnection = this.getInput('STACK').connection;
                    this.statementConnection_ = stackConnection.targetConnection;
                    if (this.statementConnection_) {
                        var stackBlock = stackConnection.targetBlock();
                        stackBlock.setParent(null);
                        stackBlock.bumpNeighbours_();
                    }
                    this.setStatements_(false);
                }
            }
        }

        if (this.getInput('RETURN')) {
            this.getInput('RETURN').setCheck(this.returnType_);
        }
    },
    dispose: procedures_defnoreturn.dispose,
    getProcedureDef: procedures_defnoreturn.getProcedureDef,
    getVars: procedures_defnoreturn.getVars,
    /**
   * Notification that a variable is changing.
   * If the name matches one of this block's variables, change it.
   * @param {!Blockly.Variable} oldVar Previous variable.
   * @param {!Blockly.Variable} newVar New variable.
   * @this Blockly.Block
   */
    changeVar: function (oldName, newName) {
        var change = false;
        for (var i = 0; i < this.arguments_.length; i++) {
            if (Blockly.Names.equals(oldName.name, this.arguments_[i].name)) {
                this.arguments_[i] = newName;
                change = true;
            }
        }
        if (change) {
            this.updateParams_();
            // Update the mutator's variables if the mutator is open.
            if (this.mutator.isVisible()) {
                var blocks = this.mutator.workspace_.getAllBlocks();
                for (var i = 0, block; block = blocks[i]; i++) {
                    if (block.type == 'oop_procedures_mutatorarg' &&
                        Blockly.Names.equals(oldName.name, block.getFieldValue('NAME').name)) {
                        block.setFieldValue(newName.name, 'NAME');
                        block.setFieldValue(newName.type, 'TYPE');
                    }
                }
            }
        }
    },
    customContextMenu: procedures_defnoreturn.customContextMenu,
    callType_: procedures_defnoreturn.callType_
};

var procedures_defreturn = Blockly.Blocks['procedures_defreturn'];
Blockly.Blocks['oop_procedures_defreturn'] = {
    /**
     * Block for defining a procedure with a return value.
     * @this Blockly.Block
     */
    init: function () {
        procedures_defreturn.init.call(this);
        this.setMutator(new Blockly.Mutator(['oop_procedures_mutatorarg']));
    },
    setStatements_: Blockly.Blocks['oop_procedures_defnoreturn'].setStatements_,
    validate: Blockly.Blocks['oop_procedures_defnoreturn'].validate,
    updateParams_: Blockly.Blocks['oop_procedures_defnoreturn'].updateParams_,
    mutationToDom: Blockly.Blocks['oop_procedures_defnoreturn'].mutationToDom,
    domToMutation: Blockly.Blocks['oop_procedures_defnoreturn'].domToMutation,
    decompose: Blockly.Blocks['oop_procedures_defnoreturn'].decompose,
    compose: Blockly.Blocks['oop_procedures_defnoreturn'].compose,
    dispose: Blockly.Blocks['oop_procedures_defnoreturn'].dispose,
    /**
     * Return the signature of this procedure definition.
     * @return {!Array} Tuple containing three elements:
     *     - the name of the defined procedure,
     *     - a list of all its arguments,
     *     - that it DOES have a return value.
     * @this Blockly.Block
     */
    getProcedureDef: function () {
        return [this.getFieldValue('NAME'), this.arguments_, true];
    },
    getVars: Blockly.Blocks['oop_procedures_defnoreturn'].getVars,
    changeVar: Blockly.Blocks['oop_procedures_defnoreturn'].changeVar,
    customContextMenu: Blockly.Blocks['oop_procedures_defnoreturn'].customContextMenu,
    callType_: 'procedures_callreturn'
};

var procedures_mutatorcontainer = Blockly.Blocks['procedures_mutatorcontainer'];
Blockly.Blocks['oop_procedures_mutatorcontainer'] = {
    /**
     * Mutator block for procedure container.
     * @this Blockly.Block
     */
    init: function () {
        procedures_mutatorcontainer.init.call(this);
        this.getInput('STATEMENT_INPUT')
            .appendField(new Blockly.FieldType(), "TYPE");
    }
};

var procedures_mutatorarg = Blockly.Blocks['procedures_mutatorarg'];
Blockly.Blocks['oop_procedures_mutatorarg'] = {
    init: function() {
        procedures_mutatorarg.init.call(this);
        this.getInput('').appendField(new Blockly.FieldType(),'TYPE');
    },
    validator_: procedures_mutatorarg.validator_
};