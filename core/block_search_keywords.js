'use strict';

/**
 * Name space for the Msg singleton.
 * Msg gets populated in the message files.
 */
goog.provide('Blockly.BlockKeywords');

Blockly.BlockKeywords.addBlockKeywords = function(block_type, keyword_list) {
    if (!Blockly.BlockKeywords) {
        Blockly.BlockKeywords = {};
    }

    if (!Blockly.BlockKeywords[block_type]) {
        Blockly.BlockKeywords[block_type] = [];
    }

    for (let i = 0; i < keyword_list.length; i++) {
        let splitText = keyword_list[i].trim().toLowerCase().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi ,'').split(' ');
        
        for (let j = 0; j < splitText.length; j++) {
            let text = splitText[j];
      
            if (text && text != '') {
                Blockly.BlockKeywords[block_type].push(text);
            }
        }
    }
};