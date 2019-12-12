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
 * @fileoverview Utility functions for handling the most used category.
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

/**
 * @name Blockly.MostUsed
 * @namespace
 */
goog.provide('Blockly.MostUsed');

goog.require('Blockly.Blocks');
goog.require('Blockly.constants');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Field');
goog.require('Blockly.Names');
goog.require('Blockly.Workspace');
goog.require('Blockly.Xml');
goog.require('Blockly.Xml.utils');

/**
 * Constant that determines the maximum number of 
 * blocks that will be shown in the category.
 */
Blockly.MostUsed.MAX_BLOCKS_TO_DISPLAY = 10;

/**
 * Defines a list of blocks that will not be tracked for the Most Used category.
 * Usually includes blocks that are only available in a mutator (i.e. the if/else block's mutator).
 */
Blockly.MostUsed.UntrackedBlocks = ["lists_create_with_item", "controls_if_elseif", "controls_if_else"];

/**
 * Initializes the most used category logic by retrieving the block 
 * counter and block definition JSONs that are saved in localStorage.
 * 
 * The block counter contains a dictionary of type {key: block type, 
 * value: block count} where the block count is the number of times 
 * this block was used (total, entire lifetime).
 * 
 * The block definition dict contains a dictionary of type {key: block type,
 * value: block XML} where the block XML is used to create the actual block when
 * loading the Most Used category.
 */
Blockly.MostUsed.init = function()  {
    let blockFrequency = localStorage.getItem("blockFrequency");
    let blockDefinition = localStorage.getItem("blockDefinition");

    //Keeps a counter for the used blocks.
    if (blockFrequency) {
        Blockly.MostUsed.blockCounterDict = JSON.parse(blockFrequency);
    }
    else {
        Blockly.MostUsed.blockCounterDict = {};
    }

    //Keeps the XML definition of blocks
    if (blockDefinition) {
        Blockly.MostUsed.blockDefinitionDict = JSON.parse(blockDefinition);
    }
    else {
        Blockly.MostUsed.blockDefinitionDict = {};
    }
};

/**
 * Orders the dictionary of most used blocks by 
 * utilizing the blocks frequency (i.e. a block counter).
 * 
 * @param {Number} howMany  The amount of ordered-by-frequency blocks that will be returned.
 * 
 * @returns {Array<Array<String>>}  Ordered bi-dimensional array of id-frequency values.
 */
Blockly.MostUsed.getMostFrequentBlocks = function(howMany) {
    let items = Object.keys(Blockly.MostUsed.blockCounterDict).map(function (key) {
        return [key, Blockly.MostUsed.blockCounterDict[key]];
    });

    items.sort(function (first, second) {
        return second[1] - first[1];
    });

    return items.slice(0, howMany);
};

/**
 * Generates the XML of the Most Used category.
 * 
 * If no blocks were used (ever), an XML label is returned that says "No blocks used yet".
 * 
 * If any blocks are available, a list of XML objects is returned.
 */
Blockly.MostUsed.flyoutCategory = function() {
    var xmlList = [];

    //If the Most used dictionary is empty, add a placeholder label
    if (!Blockly.MostUsed.blockCounterDict || Object.keys(Blockly.MostUsed.blockCounterDict).length === 0) {
        let noBlocksLabel = 
            '<xml><label text="' +
            Blockly.Msg.FABLE_EMPTY_PLACEHOLDER_1 +
            '" web-class="subcategoryClass"></label><label text="' +
            Blockly.Msg.FABLE_EMPTY_PLACEHOLDER_2 +
            '" web-class="subcategoryClass"></label></xml>';

        noBlocksLabel = Blockly.Xml.textToDom(noBlocksLabel);
        xmlList.push(noBlocksLabel.children[0]);
        xmlList.push(noBlocksLabel.children[1]);

        return xmlList;
    }

    //Get the most used blocks
    let orderedByFreq = Blockly.MostUsed.getMostFrequentBlocks(Blockly.MostUsed.MAX_BLOCKS_TO_DISPLAY);

    //Generate an XML for the first MAX_BLOCKS_TO_DISPLAY number of blocks
    for (let i = 0; i < Blockly.MostUsed.MAX_BLOCKS_TO_DISPLAY; i++) {
        if (i >= orderedByFreq.length) {
            break;
        }

        let blockDefinition = Blockly.MostUsed.blockDefinitionDict[orderedByFreq[i][0]];
        let definitionXML = new DOMParser().parseFromString(blockDefinition, 'text/xml');

        xmlList.push(definitionXML.getElementsByTagName('block')[0]);
    }

    return xmlList;
};

/**
 * Event handler for tracking the number of times a block was used (added to the main workspace or duplicated).
 *  
 * @param {Blockly.Block} clickedBlock The block that was just created (or duplicated).
 */
Blockly.MostUsed.incrementCounter = function (clickedBlock) {
    let blockType = clickedBlock.type;

    //Do not track blocks THESE blocks.
    if (Blockly.MostUsed.UntrackedBlocks.includes(blockType)) {
        return;
    }

    //If the block was used before, just increment its counter
    if (blockType in Blockly.MostUsed.blockCounterDict) {
        Blockly.MostUsed.blockCounterDict[blockType] += 1;
    }
    else {
        //If the block was never used before, initialize its counter
        Blockly.MostUsed.blockCounterDict[blockType] = 1;

        //...and retrieve the block's XML so it can be saved.
        let blockDefinition = Blockly.Xml.blockToDom(clickedBlock, true);

        let definitionString = (new XMLSerializer()).serializeToString(blockDefinition);
        definitionString = definitionString.replace(/xmlns=\"(.*?)\" /g, '');
        Blockly.MostUsed.blockDefinitionDict[blockType] = definitionString;

        localStorage.setItem('blockDefinition', JSON.stringify(Blockly.MostUsed.blockDefinitionDict));
    }

    localStorage.setItem('blockFrequency', JSON.stringify(Blockly.MostUsed.blockCounterDict));
}; 