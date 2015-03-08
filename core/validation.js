/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
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
 * @fileoverview This feature check is a workspace is completely filled
 * @author decoretjm@google.com (Jean-Michel DECORET)
 */
'use strict';

goog.provide('Blockly.Validation');

goog.require('Blockly.Workspace');


/**
 * The number of allowed top blocks
 * @type {number}
 * @private
 */
Blockly.Validation.maxTopBlocks_ = 1;

/**
 * Define the currently list of "error validated" blocks
 * @type {Array}
 * @private
 */
Blockly.Validation.listErroneousBlocks_ = [];


/**
 * Define a block as invalid
 * @param block The block to invalidate
 */
Blockly.Validation.setBlockInvalid = function(block) {
    if(block != null && block != undefined && (typeof block.addError === "function")) {
        block.addError();
        Blockly.Validation.listErroneousBlocks_.push(block);
    }
};

/**
 * Clear the invalidated blocks list
 */
Blockly.Validation.clearInvalidBlocks =  function() {
    Blockly.Validation.listErroneousBlocks_.forEach(function(value, index) {
        if(value != null && value != undefined && (typeof value.removeError === "function")) {
            value.removeError();
        }
    });
    //clear the list
    Blockly.Validation.listErroneousBlocks_.splice(0,Blockly.Validation.listErroneousBlocks_.length);
};

/**
 * Check if a block is valid (all visible inputs are filled)
 * @param block The block to check
 * @returns {boolean} true if block is valid, false if invalid
 */
Blockly.Validation.isBlockValid =  function(block) {

    if(block != null && block != undefined) {
        var currentBlockValid = true;
   
        block.inputList.forEach(function(subBlock, index) {
            if(subBlock.connection != null && subBlock.isVisible() ){
                if(subBlock.connection.targetConnection == null || subBlock.connection.targetConnection == undefined) {
                    Blockly.Validation.setBlockInvalid(subBlock.sourceBlock_);
                    return currentBlockValid = false;
                } else {
                    if(!Blockly.Validation.isBlockValid(subBlock.connection.targetConnection.sourceBlock_))
                        return currentBlockValid = false;
                }
            }
        });
        return currentBlockValid;
    }
    return false;
};


/**
 * Initialize the workspace to allow validation
 * @constructor
 */
Blockly.Validation.init = function(maxTopBlocks) {
    Blockly.addChangeListener( function() {
        Blockly.Validation.clearInvalidBlocks();
    });
};

/**
 * Set the maximum topblocks allowed for validation
 * @param maxTopBlocks The maximum number of topblocks allowed
 * @constructor
 */
Blockly.Validation.setMaxTopBlocks = function(maxTopBlocks) {
    if(maxTopBlocks != undefined && Number.isInteger(maxTopBlocks)) {
        Blockly.Validation.maxTopBlocks_ = maxTopBlocks;
        Blockly.Validation.clearInvalidBlocks();
    }
};



/**
 * Start a workspace validation
 * @param workspace The workspace to validate
 * @param callback The callback for the validation result
 */
Blockly.Validation.validate = function(workspace, callback) {
    
    //start to clear previous result
    Blockly.Validation.clearInvalidBlocks();

    if(workspace.topBlocks_.length > Blockly.Validation.maxTopBlocks_) {

        workspace.topBlocks_.forEach(function(value, index) {
            Blockly.Validation.setBlockInvalid(value);
        });
        callback(false, "Only " + Blockly.Validation.maxTopBlocks_ + " max top block is allowed");
    }
    else {
        var result = true;
        workspace.topBlocks_.forEach(function(topBlock, index) {
            if(!Blockly.Validation.isBlockValid(topBlock))
                result = false;
        });

        if(result)
            callback(true, "Workspace is valid");
        else
            callback(false, "Workspace is not valid");
    }
};



/**
 * Start the mainWorkspace validation
 * @param callback The callback for the validation result
 */
Blockly.Validation.validateMainWorkspace = function(callback) {
    Blockly.Validation.validate(Blockly.mainWorkspace, callback);
};


