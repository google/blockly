/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
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
 * @fileoverview JavaScript for Blockly's Block Factory application through
 * which users can build blocks using a visual interface and dynamically
 * generate a preview block and starter code for the block (block definition and
 * generator stub. Uses the Block Factory namespace. Depends on the FactoryUtils
 * for its code generation functions.
 *
 * @author fraser@google.com (Neil Fraser), quachtina96 (Tina Quach)
 */
'use strict';

/**
 * Namespace for Block Factory.
 */
goog.provide('BlockFactory');

goog.require('FactoryUtils');
goog.require('StandardCategories');


/**
 * Workspace for user to build block.
 * @type {Blockly.Workspace}
 */
BlockFactory.mainWorkspace = null;

/**
 * Workspace for preview of block.
 * @type {Blockly.Workspace}
 */
BlockFactory.previewWorkspace = null;

/**
 * Name of block if not named.
 */
BlockFactory.UNNAMED = 'unnamed';

/**
 * Existing direction ('ltr' vs 'rtl') of preview.
 */
BlockFactory.oldDir = null;

/*
 * The starting xml for the Block Factory main workspace. Contains the
 * unmovable, undeletable factory_base block.
 */
BlockFactory.STARTER_BLOCK_XML_TEXT = '<xml><block type="factory_base" ' +
    'deletable="false" movable="false"></block></xml>';

/**
 * Change the language code format.
 */
BlockFactory.formatChange = function() {
  var mask = document.getElementById('blocklyMask');
  var languagePre = document.getElementById('languagePre');
  var languageTA = document.getElementById('languageTA');
  if (document.getElementById('format').value == 'Manual') {
    Blockly.hideChaff();
    mask.style.display = 'block';
    languagePre.style.display = 'none';
    languageTA.style.display = 'block';
    var code = languagePre.textContent.trim();
    languageTA.value = code;
    languageTA.focus();
    BlockFactory.updatePreview();
  } else {
    mask.style.display = 'none';
    languageTA.style.display = 'none';
    languagePre.style.display = 'block';
    BlockFactory.updateLanguage();
  }
  BlockFactory.disableEnableLink();
};

/**
 * Update the language code based on constructs made in Blockly.
 */
BlockFactory.updateLanguage = function() {
  var rootBlock = FactoryUtils.getRootBlock(BlockFactory.mainWorkspace);
  if (!rootBlock) {
    return;
  }
  var blockType = rootBlock.getFieldValue('NAME').trim().toLowerCase();
  if (!blockType) {
    blockType = BlockFactory.UNNAMED;
  }
  var format = document.getElementById('format').value;
  var code = FactoryUtils.getBlockDefinition(blockType, rootBlock, format,
      BlockFactory.mainWorkspace);
  FactoryUtils.injectCode(code, 'languagePre');
  BlockFactory.updatePreview();
};

/**
 * Update the generator code.
 * @param {!Blockly.Block} block Rendered block in preview workspace.
 */
BlockFactory.updateGenerator = function(block) {
  var language = document.getElementById('language').value;
  var generatorStub = FactoryUtils.getGeneratorStub(block, language);
  FactoryUtils.injectCode(generatorStub, 'generatorPre');
};

/**
 * Update the preview display.
 */
BlockFactory.updatePreview = function() {
  // Toggle between LTR/RTL if needed (also used in first display).
  var newDir = document.getElementById('direction').value;
  if (BlockFactory.oldDir != newDir) {
    if (BlockFactory.previewWorkspace) {
      BlockFactory.previewWorkspace.dispose();
    }
    var rtl = newDir == 'rtl';
    BlockFactory.previewWorkspace = Blockly.inject('preview',
        {rtl: rtl,
         media: '../../media/',
         scrollbars: true});
    BlockFactory.oldDir = newDir;
  }
  BlockFactory.previewWorkspace.clear();

  // Fetch the code and determine its format (JSON or JavaScript).
  var format = document.getElementById('format').value;
  if (format == 'Manual') {
    var code = document.getElementById('languageTA').value;
    // If the code is JSON, it will parse, otherwise treat as JS.
    try {
      JSON.parse(code);
      format = 'JSON';
    } catch (e) {
      format = 'JavaScript';
    }
  } else {
    var code = document.getElementById('languagePre').textContent;
  }
  if (!code.trim()) {
    // Nothing to render.  Happens while cloud storage is loading.
    return;
  }

  // Backup Blockly.Blocks object so that main workspace and preview don't
  // collide if user creates a 'factory_base' block, for instance.
  var backupBlocks = Blockly.Blocks;
  try {
    // Make a shallow copy.
    Blockly.Blocks = Object.create(null);
    for (var prop in backupBlocks) {
      Blockly.Blocks[prop] = backupBlocks[prop];
    }

    if (format == 'JSON') {
      var json = JSON.parse(code);
      Blockly.Blocks[json.type || BlockFactory.UNNAMED] = {
        init: function() {
          this.jsonInit(json);
        }
      };
    } else if (format == 'JavaScript') {
      eval(code);
    } else {
      throw 'Unknown format: ' + format;
    }

    // Look for a block on Blockly.Blocks that does not match the backup.
    var blockType = null;
    for (var type in Blockly.Blocks) {
      if (typeof Blockly.Blocks[type].init == 'function' &&
          Blockly.Blocks[type] != backupBlocks[type]) {
        blockType = type;
        break;
      }
    }
    if (!blockType) {
      return;
    }

    // Create the preview block.
    var previewBlock = BlockFactory.previewWorkspace.newBlock(blockType);
    previewBlock.initSvg();
    previewBlock.render();
    previewBlock.setMovable(false);
    previewBlock.setDeletable(false);
    previewBlock.moveBy(15, 10);
    BlockFactory.previewWorkspace.clearUndo();
    BlockFactory.updateGenerator(previewBlock);

    // Warn user only if their block type is already exists in Blockly's
    // standard library.
    var rootBlock = FactoryUtils.getRootBlock(BlockFactory.mainWorkspace);
    if (StandardCategories.coreBlockTypes.indexOf(blockType) != -1) {
      rootBlock.setWarningText('A core Blockly block already exists ' +
          'under this name.');

    } else if (blockType == 'block_type') {
      // Warn user to let them know they can't save a block under the default
      // name 'block_type'
      rootBlock.setWarningText('You cannot save a block with the default ' +
          'name, "block_type"');

    } else {
      rootBlock.setWarningText(null);
    }

  } finally {
    Blockly.Blocks = backupBlocks;
  }
};

/**
 * Disable link and save buttons if the format is 'Manual', enable otherwise.
 */
BlockFactory.disableEnableLink = function() {
  var linkButton = document.getElementById('linkButton');
  var saveBlockButton = document.getElementById('localSaveButton');
  var saveToLibButton = document.getElementById('saveToBlockLibraryButton');
  var disabled = document.getElementById('format').value == 'Manual';
  linkButton.disabled = disabled;
  saveBlockButton.disabled = disabled;
  saveToLibButton.disabled = disabled;
};

/**
 * Render starter block (factory_base).
 */
BlockFactory.showStarterBlock = function() {
  BlockFactory.mainWorkspace.clear();
  var xml = Blockly.Xml.textToDom(BlockFactory.STARTER_BLOCK_XML_TEXT);
  Blockly.Xml.domToWorkspace(xml, BlockFactory.mainWorkspace);
};

/**
 * Returns whether or not the current block open is the starter block.
 */
BlockFactory.isStarterBlock = function() {
  var rootBlock = FactoryUtils.getRootBlock(BlockFactory.mainWorkspace);
  // The starter block does not have blocks nested into the factory_base block.
  return !(rootBlock.getChildren().length > 0 ||
    // The starter block's name is the default, 'block_type'.
    rootBlock.getFieldValue('NAME').trim().toLowerCase() != 'block_type' ||
    // The starter block has no connections.
    rootBlock.getFieldValue('CONNECTIONS') != 'NONE' ||
    // The starter block has automatic inputs.
    rootBlock.getFieldValue('INLINE') != 'AUTO');
};
