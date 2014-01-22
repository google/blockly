/**
 * This file contains functions used by any Blockly app that wants to provide
 * realtime collaboration functionality.
 *
 * Note that it depends on the existence of particularly named UI elements.
 *
 * TODO: Inject the UI element names
 */

/**
 * @fileoverview Common support code for Blockly apps using realtime
 * collaboration.
 * Note that to use this you must set up a project via the Google Developers
 * Console. Instructions on how to do that can be found in the Blockly wiki page
 * at https://code.google.com/p/blockly/wiki/RealtimeCollaboration
 * Once you do that you can set the clientId in
 * Blockly.Realtime.realtimeOptions_
 * @author markf@google.com (Mark Friedman)
 */
'use strict';

goog.provide('Blockly.Realtime');

goog.require('goog.array');

/**
 * Is realtime collaboration enabled?
 * @type {boolean}
 * @private
 */
Blockly.Realtime.enabled_ = false;

/**
 * The Realtime model of this doc.
 * @type {gapi.drive.realtime.Model}
 * @private
 */
Blockly.Realtime.model_ = null;

/**
 * The function used to initialize the UI after realtime is initialized.
 * @type {Function()}
 * @private
 */
Blockly.Realtime.initUi_ = null;

/**
 * A map from block id to blocks.
 * @type {gapi.drive.realtime.CollaborativeMap}
 * @private
 */
Blockly.Realtime.blocksMap_ = null;

/**
 * Are currently syncing from another instance of this realtime doc.
 * @type {boolean}
 */
Blockly.Realtime.withinSync = false;

/**
 * The current instance of the realtime loader client
 * @type {rtclient.RealtimeLoader}
 * @private
 */
Blockly.Realtime.realtimeLoader_ = null;

/**
 * Returns whether realtime collaboration is enabled.
 * @returns {boolean}
 */
Blockly.Realtime.isEnabled = function() {
  return Blockly.Realtime.enabled_;
};

/**
 * This function is called the first time that the Realtime model is created
 * for a file. This function should be used to initialize any values of the
 * model.
 * @param model {gapi.drive.realtime.Model} model The Realtime root model
 *     object.
 */
Blockly.Realtime.initializeModel_ = function(model) {
  Blockly.Realtime.model_ = model;
  var blocksMap = model.createMap();
  model.getRoot().set('blocks', blocksMap);
  var topBlocks = model.createList();
  model.getRoot().set('topBlocks', topBlocks);
  var string =
      model.createString('Chat with your collaborator by typing in this box!');
  model.getRoot().set('text', string);
};

/**
 * Delete a block from the realtime blocks map.
 * @param {!Blockly.Block} block The block to remove.
 */
Blockly.Realtime.removeBlock = function(block) {
  Blockly.Realtime.blocksMap_.delete(block.id.toString());
};

/**
 * Add to the list of top-level blocks.
 * @param {!Blockly.Block} block The block to add.
 */
Blockly.Realtime.addTopBlock = function(block) {
  if (Blockly.Realtime.topBlocks_.indexOf(block) == -1) {
    Blockly.Realtime.topBlocks_.push(block);
  }
};

/**
 * Delete a block from the list of top-level blocks.
 * @param {!Blockly.Block} block The block to remove.
 */
Blockly.Realtime.removeTopBlock = function(block) {
  Blockly.Realtime.topBlocks_.removeValue(block);
};

/**
 * Obtain a newly created block known by the Realtime API.
 * @param {!Blockly.Workspace} workspace The workspace to put the block in.
 * @param {string} prototypeName The name of the prototype for the block
 * @return {!Blockly.Block}
 */
Blockly.Realtime.obtainBlock = function(workspace, prototypeName) {
  var newBlock =
      Blockly.Realtime.model_.create(Blockly.Block, workspace, prototypeName);
  return newBlock;
};

/**
 * Get an existing block by id.
 * @param {string} id The block's id.
 * @return {Blockly.Block} The found block.
 */
Blockly.Realtime.getBlockById = function(id) {
  return Blockly.Realtime.blocksMap_.get(id);
};

/**
 * Event handler to call when a block is changed.
 * @param {gapi.drive.realtime.ObjectChangedEvent} evt The event that occurred.
 * @private
 */
Blockly.Realtime.onObjectChange_ = function(evt) {
  var events = evt.events;
  var eventCount = evt.events.length;
  for (var i = 0; i < eventCount; i++) {
    var event = events[i];
    if (!event.isLocal) {
      if (event.type == 'value_changed') {
        if (event.property == 'xmlDom') {
          var block = event.target;
          Blockly.Realtime.doWithinSync_(function(){
            Blockly.Realtime.placeBlockOnWorkspace_(block, false);
            Blockly.Realtime.moveBlock_(block);
          });
        } else if (event.property == 'relativeX' ||
                   event.property == 'relativeY') {
          var block2 = event.target;
          Blockly.Realtime.doWithinSync_(function () {
            if (!block2.svg_) {
              // If this is a move of a newly disconnected (i.e newly top level)
              // block it will not have any svg (because it has been disposed of
              // by it's parent), so we need to handle that here.
              Blockly.Realtime.placeBlockOnWorkspace_(block2, false);
            }
            Blockly.Realtime.moveBlock_(block2);
          });
         }
      }
    }
  }
};

/**
 * Event handler to call when there is a change to the realtime blocks map.
 * @param {gapi.drive.realtime.ValueChangedEvent} evt The event that occurred.
 * @private
 */
Blockly.Realtime.onBlocksMapChange_ = function(evt) {
  console.log('Blocks Map event:');
  console.log('  id: ' + evt.property);
  if (!evt.isLocal) {
    var block = evt.newValue;
    if (block) {
      Blockly.Realtime.placeBlockOnWorkspace_(block, !(evt.oldValue));
    } else {
      block = evt.oldValue;
      Blockly.Realtime.deleteBlock(block);
    }
  }
};

/**
 * A convenient wrapper around code that synchronizes the local model being
 * edited with changes from another non-local model.
 * @param {!Function()} thunk A thunk of code to call.
 * @private
 */
Blockly.Realtime.doWithinSync_ = function(thunk) {
  if (Blockly.Realtime.withinSync) {
    thunk();
  } else {
    try {
      Blockly.Realtime.withinSync = true;
      thunk();
    } finally {
      Blockly.Realtime.withinSync = false;
    }
  }
};

/**
 * Places a block to be synced on this docs main workspace.  The block might
 * already exist on this doc, in which case it is updated and/or moved.
 * @param {!Blockly.Block} block The block.
 * @param {boolean} addToTop Whether to add the block to the workspace/s list of
 *     top-level blocks.
 * @private
 */
Blockly.Realtime.placeBlockOnWorkspace_ = function(block, addToTop) {
  Blockly.Realtime.doWithinSync_(function() {
    var blockDom = Blockly.Xml.textToDom(block.xmlDom).firstChild;
    var newBlock =
        Blockly.Xml.domToBlock(Blockly.mainWorkspace, blockDom, true);
    // TODO: The following is for debugging.  It should never actually happen.
    if (!newBlock) {
      return;
    }
    // Since Blockly.Xml.blockDomToBlock() purposely won't add blocks to
    // workspace.topBlocks_ we sometimes need to do it explicitly here.
    if (addToTop) {
      newBlock.workspace.addTopBlock(newBlock);
    }
    if (addToTop ||
        goog.array.contains(Blockly.Realtime.topBlocks_, newBlock)) {
      Blockly.Realtime.moveBlock_(newBlock);
    }
  });
};

/**
 * Move a block
 * @param {Blockly.Block} block The block to move.
 * @private
 */
Blockly.Realtime.moveBlock_ = function(block) {
  if (!isNaN(block.relativeX) && !isNaN(block.relativeY)) {
    var width = Blockly.svgSize().width;
    var curPos = block.getRelativeToSurfaceXY();
    var dx = block.relativeX - curPos.x;
    var dy = block.relativeY - curPos.y;
    block.moveBy(Blockly.RTL ? width - dx : dx, dy);
  }
};

/**
 * Delete a block.
 * @param {!Blockly.Block} block The block to delete.
 * @private
 */
Blockly.Realtime.deleteBlock = function(block) {
  Blockly.Realtime.doWithinSync_(function() {
    block.dispose(true, true, true);
  });
};

/**
 * Load all the blocks from the realtime model's blocks map and place them
 * appropriately on the main Blockly workspace.
 * @private
 */
Blockly.Realtime.loadBlocks_ = function() {
  var blocks = Blockly.Realtime.blocksMap_.values();
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    // Since we now have blocks with already existing ids, we have to make sure
    // that new blocks don't get any of the existing ids.
    var blockIdNum = parseInt(block.id, 10);
    if (blockIdNum > Blockly.getUidCounter()) {
      Blockly.setUidCounter(blockIdNum + 1);
    }
  }
  var topBlocks = Blockly.Realtime.topBlocks_;
  for (var j = 0; j < topBlocks.length; j++) {
    var topBlock = topBlocks.get(j);
    Blockly.Realtime.placeBlockOnWorkspace_(topBlock, true);
  }
};

/**
 * Cause a changed block to update the realtime model, and therefore to be
 * synced with other apps editing this same doc.
 * @param {!Blockly.Block} block The block that changed.
 */
Blockly.Realtime.blockChanged = function(block) {
  if (block.workspace == Blockly.mainWorkspace) {
    var rootBlock = block.getRootBlock();
    var xy = rootBlock.getRelativeToSurfaceXY();
    var changed = false;
    var xml = Blockly.Xml.blockToDom_(rootBlock);
    xml.setAttribute('id', rootBlock.id);
    var topXml = goog.dom.createDom('xml');
    topXml.appendChild(xml);
    var newXml = Blockly.Xml.domToText(topXml);
    if (newXml != rootBlock.xmlDom) {
      changed = true;
      rootBlock.xmlDom = newXml;
    }
    if (rootBlock.relativeX != xy.x || rootBlock.relativeY != xy.y){
      rootBlock.relativeX = xy.x;
      rootBlock.relativeY = xy.y;
      changed = true;
    }
    if (changed) {
      var blockId = rootBlock.id.toString();
      Blockly.Realtime.blocksMap_.set(blockId, rootBlock);
    }
  }
};

/**
 * This function is called when the Realtime file has been loaded. It should
 * be used to initialize any user interface components and event handlers
 * depending on the Realtime model. In this case, create a text control binder
 * and bind it to our string model that we created in initializeModel.
 * @param {!gapi.drive.realtime.Document} doc The Realtime document.
 * @private
 */
Blockly.Realtime.onFileLoaded_ = function(doc) {
  Blockly.Realtime.model_ = doc.getModel();
  Blockly.Realtime.blocksMap_ =
      Blockly.Realtime.model_.getRoot().get('blocks');
  Blockly.Realtime.topBlocks_ =
      Blockly.Realtime.model_.getRoot().get('topBlocks');

  Blockly.Realtime.model_.getRoot().addEventListener(
      gapi.drive.realtime.EventType.OBJECT_CHANGED,
      Blockly.Realtime.onObjectChange_);
  Blockly.Realtime.blocksMap_.addEventListener(
      gapi.drive.realtime.EventType.VALUE_CHANGED,
      Blockly.Realtime.onBlocksMapChange_);

  var string = Blockly.Realtime.model_.getRoot().get('text');

  // Keeping one box updated with a String binder.
  var textArea1 = document.getElementById('chatbox');
  gapi.drive.realtime.databinding.bindString(string, textArea1);

  // Enabling UI Elements.
  textArea1.disabled = false;
  Blockly.Realtime.initUi_();

  Blockly.Realtime.loadBlocks_();

  // Add logic for undo button.
  // TODO: Uncomment this when undo/redo are fixed.
/*
  var undoButton = document.getElementById('undoButton');
  var redoButton = document.getElementById('redoButton');

  undoButton.onclick = function(e) {
    Blockly.Realtime.model_.undo();
  };
  redoButton.onclick = function(e) {
    Blockly.Realtime.model_.redo();
  };

  // Add event handler for UndoRedoStateChanged events.
  var onUndoRedoStateChanged = function(e) {
    undoButton.disabled = !e.canUndo;
    redoButton.disabled = !e.canRedo;
  };
  Blockly.Realtime.model_.addEventListener(
      gapi.drive.realtime.EventType.UNDO_REDO_STATE_CHANGED,
      onUndoRedoStateChanged);
 */
};

/**
 * Register the Blockly types and attributes that are reflected in the realtime
 * model.
 * @private
 */
Blockly.Realtime.registerTypes_ = function() {
  var custom = gapi.drive.realtime.custom;

  custom.registerType(Blockly.Block, 'Block');
  Blockly.Block.prototype.id = custom.collaborativeField('id');
  Blockly.Block.prototype.type = custom.collaborativeField('type');
  Blockly.Block.prototype.xmlDom = custom.collaborativeField('xmlDom');
  Blockly.Block.prototype.relativeX = custom.collaborativeField('relativeX');
  Blockly.Block.prototype.relativeY = custom.collaborativeField('relativeY');

  custom.setInitializer(Blockly.Block, Blockly.Block.prototype.initialize);
};

Blockly.Realtime.REAUTH_INTERVAL_IN_MILLISECONDS_ = 30 * 60 * 1000;

/**
 * What to do after Realtime authorization.
 * @private
 */
Blockly.Realtime.afterAuth_ = function() {
  // This is a workaround for the fact that the code in realtime-client-utils.js
  // doesn't deal with auth timeouts correctly.  So we explicitly reauthorize at
  // regular intervals.
  window.setTimeout(
      function() {
        Blockly.Realtime.realtimeLoader_.authorizer.authorize(
            Blockly.Realtime.afterAuth_);
      },
      Blockly.Realtime.REAUTH_INTERVAL_IN_MILLISECONDS_);
};

/**
 * Options for the Realtime loader.
 */
Blockly.Realtime.realtimeOptions_ = {
  /**
   * Client ID from the console.
   */
  clientId: 'INSERT YOUR CLIENT ID HERE',

  /**
   * The ID of the button to click to authorize. Must be a DOM element ID.
   */
  authButtonElementId: 'authorizeButton',

  /**
   * Function to be called when a Realtime model is first created.
   */
  initializeModel: Blockly.Realtime.initializeModel_,

  /**
   * Autocreate files right after auth automatically.
   */
  autoCreate: true,

  /**
   * The name of newly created Drive files.
   */
  defaultTitle: 'New Realtime Blockly File',

  /**
   * The MIME type of newly created Drive Files. By default the application
   * specific MIME type will be used:
   *     application/vnd.google-apps.drive-sdk.
   */
  newFileMimeType: null, // Using default.

  /**
   * Function to be called every time a Realtime file is loaded.
   */
  onFileLoaded: Blockly.Realtime.onFileLoaded_,

  /**
   * Function to be called to initialize custom Collaborative Objects types.
   */
  registerTypes: Blockly.Realtime.registerTypes_,

  /**
   * Function to be called after authorization and before loading files.
   */
  afterAuth: Blockly.Realtime.afterAuth_
};

/**
 * Start the Realtime loader with the options.
 */
Blockly.Realtime.startRealtime = function (uiInitialize) {
  Blockly.Realtime.enabled_ = true;
  Blockly.Realtime.initUi_ = uiInitialize;
  Blockly.Realtime.realtimeLoader_ =
      new rtclient.RealtimeLoader(Blockly.Realtime.realtimeOptions_);
  Blockly.Realtime.realtimeLoader_.start();
};
