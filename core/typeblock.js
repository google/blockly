//Copyright 2013 Massachusetts Institute of Technology. All rights reserved.

/**
 * @fileoverview File to handle 'Type Blocking'. When the user starts typing the
 * name of a Block in the workspace, a series of suggestions will appear. Upon
 * selecting one (enter key), the chosen block will be created in the workspace
 * This file needs additional configuration through the inject method.
 * @author josmasflores@gmail.com (Jose Dominguez)
 */
'use strict';

goog.provide('Blockly.TypeBlock');
goog.require('Blockly.Xml');

goog.require('goog.events');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.ui.ac');
goog.require('goog.style');
goog.require('goog.string');

goog.require('goog.ui.ac.ArrayMatcher');
goog.require('goog.ui.ac.AutoComplete');
goog.require('goog.ui.ac.InputHandler');
goog.require('goog.ui.ac.Renderer');

/**
 * Main Type Block function for configuration.
 * @param {Object} htmlConfig an object of the type:
     {
       typeBlockDiv: 'ai_type_block',
       inputText: 'ac_input_text'
     }
 * stating the ids of the attributes to be used in the html enclosing page
 * create a new block
 */
Blockly.TypeBlock = function( htmlConfig ){
  Blockly.TypeBlock.typeBlockDiv_ =
                              goog.dom.getElement(htmlConfig['typeBlockDiv']);
  Blockly.TypeBlock.inputText_ =
                              goog.dom.getElement(htmlConfig['inputText']);
  Blockly.TypeBlock.createAutoComplete_();
};

/**
 * DOM Element for the Div where the type block panel will be rendered
 * @private
 */
Blockly.TypeBlock.typeBlockDiv_ = null;

/**
 * DOM Element for the input text contained in the type block panel
 * @private
 */
Blockly.TypeBlock.inputText_ = null;

/**
 * Is the Type Block panel currently showing?
 */
Blockly.TypeBlock.visible = false;

/**
 * Mapping of options to show in the auto-complete panel. This maps the
 * canonical name of the block, needed to create a new Blockly.Block, with the
 * internationalised word or sentence used in typeblocks. Certain blocks do not
 * only need the canonical block representation, but also values for dropdowns
 * (name and value)
 *   - No dropdowns:   this.typeblock: [{ entry: Blockly.LANG_VAR }]
 *   - With dropdowns: this.typeblock: [{ entry: Blockly.LANG_VAR },
 *                                        fields: { TITLE: 'value'}]
 *   - Additional types can be used to mark a block as isProcedure or
 *     isGlobalVar. These are only used to manage the loading of options in the
 *     auto-complete matcher.
 * @private
 */
Blockly.TypeBlock.TBOptions_ = {};

/**
 * This array contains only the Keys of Blockly.TypeBlock.TBOptions_ to be used
 * as options in the autocomplete widget.
 * @private
 */
Blockly.TypeBlock.TBOptionsNames_ = [];

/**
 * pointer to the automcomplete widget to be able to change its contents when
 * the Language tree is modified (additions, renaming, or deletions)
 * @private
 */
Blockly.TypeBlock.ac_ = null;

/**
 * We keep a listener pointer in case of needing to unlisten to it. We only want
 * one listener at a time, and a reload could create a second one, so we
 * unlisten first and then listen back
 * @private
 */
Blockly.TypeBlock.currentListener_ = null;

Blockly.TypeBlock.onKeyDown_ = function(e){
  if (!Blockly.TypeBlock.typeBlockDiv_) {
    return;
  }
  if (e.altKey || e.ctrlKey || e.metaKey ||
      e.keycode === goog.events.KeyCodes.TAB) {
    return;
  }

  // A way to know if the user is editing a block or trying to type a new one
//  if (e.target.id === '') return;
  if (goog.style.isElementShown(Blockly.TypeBlock.typeBlockDiv_)) {
    // Pressing esc closes the context menu.
    if (e.keyCode == goog.events.KeyCodes.ESC) {
      Blockly.TypeBlock.hide();
    }
    // Enter in the panel makes it select an option
    if (e.keyCode === goog.events.KeyCodes.ENTER) {
      Blockly.TypeBlock.hide();
    }
//  } else if (goog.events.KeyCodes.isTextModifyingKeyEvent(e)) {
  } else if (goog.events.KeyCodes.isCharacterKey(e.keyCode)) {
      if (Blockly.latestClick.x == 0 && Blockly.latestClick.y == 0)
      {
          Blockly.latestClick.x = 300;
          Blockly.latestClick.y = 250;
      }
    Blockly.TypeBlock.show();
    // Can't seem to make Firefox display first character, so keep all browsers
    // from automatically displaying the first character and add it manually.
    e.preventDefault();
    if (typeof e.key === 'undefined' || e.key  === 'MozPrintableKey') {
      Blockly.TypeBlock.inputText_.value =
        String.fromCharCode(e.charCode !== 0 ? e.charCode : e.keyCode);
//                              goog.events.KeyCodes.normalizeKeyCode(e.keyCode));
    } else {
      Blockly.TypeBlock.inputText_.value = e.key;
    }
  }
};

/**
 * function to hide the autocomplete panel. Also used from hideChaff in
 * Blockly.js
 */
Blockly.TypeBlock.hide = function(){
  if (Blockly.TypeBlock.visible) {
    Blockly.TypeBlock.visible = false;
    Blockly.TypeBlock.ac_.dismiss();
    goog.style.showElement(Blockly.TypeBlock.typeBlockDiv_, false);
  }
};

/**
 * function to show the auto-complete panel to start typing block names
 */
Blockly.TypeBlock.show = function(){
  if (!Blockly.TypeBlock.visible) {
    Blockly.TypeBlock.lazyLoadOfOptions_();

    var inputHandler = Blockly.TypeBlock.ac_.getSelectionHandler();
    var svg = Blockly.getMainWorkspace().options.svg;
    var svgPosition = goog.style.getPageOffset(svg);

    var x = Blockly.latestClick.x - svgPosition.x;
    var y = Blockly.latestClick.y - svgPosition.y;

    /*
     * If there have not been any clicks yet, set (x,y) explicitly.
     */
    if (x <= 0) {
        x = 300;
    }
    if (y <= 0) {
        y = 150;
    }

    goog.style.setPosition(Blockly.TypeBlock.typeBlockDiv_, x, y);
    goog.style.showElement(Blockly.TypeBlock.typeBlockDiv_, true);
    Blockly.TypeBlock.inputText_.value = '';
    Blockly.TypeBlock.inputText_.focus();
    inputHandler.processFocus(Blockly.TypeBlock.inputText_);
    Blockly.TypeBlock.visible = true;
  }
};

/**
 * Used as an optimisation trick to avoid reloading components and built-ins
 * unless there is a real need to do so. needsReload.components can be set to
 * true when a component changes.
 * Defaults to true so that it loads the first time (set to null after loading
 * in lazyLoadOfOptions_())
 * @type {{components: boolean}}
 */
Blockly.TypeBlock.needsReload = {
  components: true
};

/**
 * Lazily loading options because some of them are not available during
 * bootstrapping, and some users will never use this functionality, so we avoid
 * having to deal with changes such as handling renaming of variables and
 * procedures (leaving it until the moment they are used, if ever).
 * @private
 */
Blockly.TypeBlock.lazyLoadOfOptions_ = function () {

  // Optimisation to avoid reloading all components and built-in objects unless
  // it is needed.
  // needsReload.components is setup when adding/renaming/removing a component
  // in components.js
  if (this.needsReload.components){
    Blockly.TypeBlock.generateOptions();
    this.needsReload.components = null;
  }
  Blockly.TypeBlock.loadGlobalVariables_();
  Blockly.TypeBlock.loadProcedures_();
  this.reloadOptionsAfterChanges_();
};

/**
 * This function traverses the Language tree and re-creates all the options
 * available for type blocking. It's needed in the case of modifying the
 * Language tree after its creation (adding or renaming components, for instance).
 * It also loads all the built-in blocks.
 *
 * call 'reloadOptionsAfterChanges_' after calling this. The function
 * lazyLoadOfOptions_ is an example of how to call this function.
 */
Blockly.TypeBlock.generateOptions = function() {

  var buildListOfOptions = function() {
    var listOfOptions = {};
    var typeblockArray;
    for (var name in Blockly.Blocks) {
      var block = Blockly.Blocks[name];
      if(block.typeblock){
        typeblockArray = block.typeblock;
        if(typeof block.typeblock == "function") {
          typeblockArray = block.typeblock();
        } else if (typeof block.typeblock === 'string') {
          // If they just give us a string, build up the single level array
          // from that string.  This is the most common case for blocks
          typeblockArray = [{entry: block.typeblock}];
        }
        createOption(typeblockArray, name);
      }
    }

    function createOption(tb, canonicName){
      if (tb){
        goog.array.forEach(tb, function(dd){
          var fields = {};
          var mutatorAttributes = {};
          var values = {};
          if (dd.fields) {
            fields = dd.fields;
          }
          if (dd.values) {
            values = dd.values;
          }
          if(dd.mutatorAttributes) {
            mutatorAttributes = dd.mutatorAttributes;
          }
          listOfOptions[dd.entry] = {
            canonicName: canonicName,
            mutatorAttributes: mutatorAttributes,
            fields: fields,
            values: values
          };
        });
      }
    }

    return listOfOptions;
  };

  // This is called once on startup, and it will contain all built-in blocks.
  // After that, it can  be called on demand
  // (for instance in the function lazyLoadOfOptions_)
  Blockly.TypeBlock.TBOptions_ = buildListOfOptions();
};

/**
 * This function reloads all the latest changes that might have occurred in the
 * language tree or the structures containing procedures and variables. It only
 * needs to be called once even if different sources are being updated at the
 * same time (call on load proc, load vars, and generate options, only needs
 * one call of this function; and example of that is lazyLoadOfOptions_
 * @private
 */
Blockly.TypeBlock.reloadOptionsAfterChanges_ = function() {
  Blockly.TypeBlock.TBOptionsNames_ =
                          goog.object.getKeys(Blockly.TypeBlock.TBOptions_);
  goog.array.sort(Blockly.TypeBlock.TBOptionsNames_);
  Blockly.TypeBlock.ac_.matcher_.setRows(Blockly.TypeBlock.TBOptionsNames_);
};

/**
 * Loads all procedure names as options for TypeBlocking. It is used lazily
 * from show().
 * Call 'reloadOptionsAfterChanges_' after calling this one. The function
 * lazyLoadOfOptions_ is an example of how to call this function.
 * @private
 */
Blockly.TypeBlock.loadProcedures_ = function() {
  // Clean up any previous procedures in the list as we will repopulate them
  Blockly.TypeBlock.TBOptions_ =
      goog.object.filter(Blockly.TypeBlock.TBOptions_,
                         function(opti){ return !opti.isProcedure;});

  // Get all the proceedures in the system
  var procNamesArray = Blockly.Procedures.allProcedures(Blockly.mainWorkspace);

  // Add blocks for the calls with no return
  goog.array.forEach(procNamesArray[0], function(proc){
    var entry = goog.string.trim(Blockly.Msg.PROCEDURES_CALLNORETURN_CALL + ' ')
      + proc[0];
    Blockly.TypeBlock.TBOptions_[entry] = {
      canonicName: 'procedures_callnoreturn',
      fields: {NAME: proc[0] },
      isProcedure: true // this attribute is used to clean up before reloading
    };
  });

  // Add blocks for the calls with a return
  goog.array.forEach(procNamesArray[1], function(proc){
    var entry = goog.string.trim(Blockly.Msg.PROCEDURES_CALLRETURN_CALL + ' ')
       + proc[0];
    Blockly.TypeBlock.TBOptions_[entry] = {
      canonicName: 'procedures_callreturn',
      fields: {NAME: proc[0] },
      isProcedure: true // this attribute is used to clean up before reloading
    };
  });
};

/**
 * Loads all global variable names as options for TypeBlocking. It is used
 * lazily from show().
 * Call 'reloadOptionsAfterChanges_' after calling this one. The function
 * lazyLoadOfOptions_ is an example of how to call this function.
 */
Blockly.TypeBlock.loadGlobalVariables_ = function () {
  //clean up any previous procedures in the list
  Blockly.TypeBlock.TBOptions_ =
    goog.object.filter(Blockly.TypeBlock.TBOptions_,
                       function(opti){ return !opti.isGlobalvar;});

  var varNames = Blockly.Variables.allVariables(Blockly.mainWorkspace);
  // Make a setter and a getter for each of the names
  goog.array.forEach(varNames,
    function(varName) {
      Blockly.TypeBlock.TBOptions_['get '+varName] = {
        canonicName: 'variables_get',
        fields: {VAR: varName},
        isGlobalvar: true
      };
      Blockly.TypeBlock.TBOptions_['set '+varName] = {
        canonicName: 'variables_set',
        fields: {VAR: varName},
        isGlobalvar: true
      };
    });
};

Blockly.TypeBlock.mutatorToXMLString = function(attributes) {
  var xmlString = '';
  if (typeof attributes === 'object' && !goog.object.isEmpty(attributes)) {
    var extra = '<mutation ';
    for(var name in attributes) {
      if (attributes.hasOwnProperty(name)) {
        xmlString += extra + name + '="' + attributes[name] + '"';
        extra = ' ';
      }
    }
    xmlString += '></mutation>';
  }
  return xmlString;
}

Blockly.TypeBlock.sectionToXMLString = function(section,attributes) {
  var xmlString = '';
  if (typeof attributes === 'object') {
    for (var key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        var val = attributes[key];
        // Handle short cut for number values.
        if (section === 'value' && goog.isNumber(val)) {
          val = '<shadow type="math_number">'+
                    '<field name="NUM">' + val + '</field></shadow>';
        }
        xmlString += '<' + section +
                     ' name="' + key + '">' + val + '</' + section + '>';
      }
    }
  }
  return xmlString;
}

Blockly.TypeBlock.autoCompleteSelected = function() {
  var blockName = Blockly.TypeBlock.inputText_.value;
  var blockToCreate = goog.object.get(Blockly.TypeBlock.TBOptions_, blockName);
  if (!blockToCreate) {
    //If the input passed is not a block, check if it is a number
    // or a pre-populated text block
    var numberReg = new RegExp('^-?[0-9]\\d*(\.\\d+)?$', 'g');
    var numberMatch = numberReg.exec(blockName);
    var textReg = new RegExp('^[\"|\']+', 'g');
    var textMatch = textReg.exec(blockName);
    if (numberMatch && numberMatch.length > 0){
      blockToCreate = {
        canonicName: 'math_number',
        fields: { NUM: blockName }
      };
    }
    else if (textMatch && textMatch.length === 1){
      blockToCreate = {
        canonicName: 'text',
        fields: { TEXT: blockName.substring(1) }
      };
    }
    else
      return; // block does not exist: return
  }

  // components have mutator attributes we need to deal with.
  var blockType = blockToCreate.canonicName;
  var xmlString =
    '<xml><block type="' + blockType + '">'+
        Blockly.TypeBlock.mutatorToXMLString(blockToCreate.mutatorAttributes) +
        Blockly.TypeBlock.sectionToXMLString('field', blockToCreate.fields) +
        Blockly.TypeBlock.sectionToXMLString('value', blockToCreate.values) +
    '</block></xml>';

  var xml = Blockly.Xml.textToDom(xmlString);
  var xmlBlock = xml.firstChild;
  var block = Blockly.Xml.domToBlock(Blockly.mainWorkspace, xmlBlock);

  block.render();
  var blockSelected = Blockly.selected;
  var selectedX, selectedY, selectedXY;
  if (blockSelected) {
    selectedXY = blockSelected.getRelativeToSurfaceXY();
    selectedX = selectedXY.x;
    selectedY = selectedXY.y;
    Blockly.TypeBlock.connectIfPossible(blockSelected, block);
    if(!block.parentBlock_){
      //Place it close but a bit out of the way from the one we created.
      block.moveBy(Blockly.selected.getRelativeToSurfaceXY().x + 110,
          Blockly.selected.getRelativeToSurfaceXY().y + 50);
    }
    block.select();
  }
  else {
    //calculate positions relative to the view and the latest click
    var svg = Blockly.getMainWorkspace().options.svg;
    var svgPosition = goog.style.getPageOffset(svg);
    var tbwidth = Blockly.getMainWorkspace().toolbox_.width;

    var left = Blockly.mainWorkspace.getMetrics().viewLeft +
        Blockly.latestClick.x - svgPosition.x - tbwidth;
    var top = Blockly.mainWorkspace.getMetrics().viewTop +
        Blockly.latestClick.y - svgPosition.y;
    block.moveBy(left, top);
    block.select();
  }
  Blockly.TypeBlock.hide();
}

/**
 * Creates the auto-complete panel, powered by Google Closure's ac widget
 * @private
 */
Blockly.TypeBlock.createAutoComplete_ = function(){
  Blockly.TypeBlock.TBOptionsNames_ =
                          goog.object.getKeys( Blockly.TypeBlock.TBOptions_ );
  goog.array.sort(Blockly.TypeBlock.TBOptionsNames_);
  //if there is a key, unlisten
  goog.events.unlistenByKey(Blockly.TypeBlock.currentListener_);
  if (Blockly.TypeBlock.ac_) {
    Blockly.TypeBlock.ac_.dispose(); //Make sure we only have 1 at a time
  }

  // 3 objects needed to create a goog.ui.ac.AutoComplete instance
  var matcher = new Blockly.TypeBlock.ac.AIArrayMatcher(
                                    Blockly.TypeBlock.TBOptionsNames_, false);
  var renderer = new goog.ui.ac.Renderer();
  var inputHandler = new goog.ui.ac.InputHandler(null, null, false);

  Blockly.TypeBlock.ac_ = new goog.ui.ac.AutoComplete(matcher, renderer,
                                                      inputHandler);
  Blockly.TypeBlock.ac_.setMaxMatches(100);
  inputHandler.attachAutoComplete(Blockly.TypeBlock.ac_);
  inputHandler.attachInputs(Blockly.TypeBlock.inputText_);

  Blockly.TypeBlock.currentListener_ =
          goog.events.listen(Blockly.TypeBlock.ac_,
                             goog.ui.ac.AutoComplete.EventType.UPDATE,
                             Blockly.TypeBlock.autoCompleteSelected
  );
  goog.events.listen(Blockly.TypeBlock.ac_,
                     goog.ui.ac.AutoComplete.EventType.DISMISS,
                     Blockly.TypeBlock.hide);
};

/**
 * Blocks connect in different ways; a block with an outputConnection such as
 * a number will connect in one of its parent's input connection (inputLis).                          .
 * A block with no outputConnection could be connected to its parent's next
 * connection.
 */
Blockly.TypeBlock.connectIfPossible = function(blockSelected, createdBlock) {
  var i = 0,
  inputList = blockSelected.inputList,
  ilLength = inputList.length;

  //If createdBlock has an output connection, we need to:
  //  connect to parent (eg: connect equals into if)
  //else we need to:
  //  connect its previousConnection to parent (eg: connect if to if)
  for (i = 0; i < ilLength; i++) {
    try {
      if (createdBlock.outputConnection != null) {
        //Check for type validity (connect does not do it)
        if (inputList[i].connection &&
            inputList[i].connection.checkType_(createdBlock.outputConnection)) {
          // is connection empty?
          if (!inputList[i].connection.targetConnection){
            createdBlock.outputConnection.connect(inputList[i].connection);
            break;
          }
        }
      } else {
        createdBlock.previousConnection.connect(inputList[i].connection);
      }
    } catch(e) {
      // We can ignore these exceptions; they happen when connecting two blocks
      // that should not be connected.
    }
  }
  if (createdBlock.parentBlock_ !== null) return; //Already connected --> return

  // Are both blocks statement blocks?
  // If so, connect created block below the selected block
  if (createdBlock.previousConnection &&
      blockSelected.nextConnection &&
      blockSelected.outputConnection == null &&
      createdBlock.outputConnection == null) {
    createdBlock.previousConnection.connect(blockSelected.nextConnection);
    return;
  }

  // No connections? Try the parent (if it exists)
  if (blockSelected.parentBlock_) {
    //Is the parent block a statement?
    if (blockSelected.parentBlock_.outputConnection == null) {
      // Is the created block a statment?
      // If so, connect it below the parent block, which is a statement
      if(createdBlock.outputConnection == null) {
        blockSelected.parentBlock_.nextConnection.connect(
                                              createdBlock.previousConnection);
        return;
      //If it's not, no connections should be made
      } else return;
    } else {
      // try the parent for other connections
      Blockly.TypeBlock.connectIfPossible(blockSelected.parentBlock_,
                                          createdBlock);
      // recursive call: creates the inner functions again,
      // but should not be much overhead; if it is, optimise!
    }
  }
};

//--------------------------------------
// A custom matcher for the auto-complete widget that can handle numbers as well
// as the default functionality of goog.ui.ac.ArrayMatcher
goog.provide('Blockly.TypeBlock.ac.AIArrayMatcher');

goog.require('goog.iter');
goog.require('goog.string');

/**
 * Extension of goog.ui.ac.ArrayMatcher so that it can handle
 * any number or string typed in.
 * @constructor
 * @param {Array} rows Dictionary of items to match.  Can be objects if they
 * have a toString method that returns the value to match against.
 * @param {boolean=} opt_noSimilar if true, do not do similarity matches for the
 * input token against the dictionary.
 * @extends {goog.ui.ac.ArrayMatcher}
 */
Blockly.TypeBlock.ac.AIArrayMatcher = function(rows, opt_noSimilar) {
  goog.ui.ac.ArrayMatcher.call(rows, opt_noSimilar);
  this.rows_ = rows;
  this.useSimilar_ = !opt_noSimilar;
};
goog.inherits(Blockly.TypeBlock.ac.AIArrayMatcher, goog.ui.ac.ArrayMatcher);

/**
 * @inheritDoc
 */
Blockly.TypeBlock.ac.AIArrayMatcher.prototype.requestMatchingRows = function(
                              token, maxMatches, matchHandler, opt_fullString) {

  var matches = this.getPrefixMatches(token, maxMatches);

  // Because we allow for similar matches, Button.Text will always appear
  // before Text.  So we handle the 'text' case as a special case here
  if (token === 'text' || token === 'Text'){
    goog.array.remove(matches, 'Text');
    goog.array.insertAt(matches, 'Text', 0);
  }

  // Added code to handle any number typed in the widget
  //  (including negatives and decimals)
  var reg = new RegExp('^-?[0-9]\\d*(\.\\d+)?$', 'g');
  var match = reg.exec(token);
  if (match && match.length > 0){
    matches.push(token);
  }

  // Added code to handle default values for text fields (they start with " or ')
  var textReg = new RegExp('^[\"|\']+', 'g');
  var textMatch = textReg.exec(token);
  if (textMatch && textMatch.length === 1){
    matches.push(token);
  }

  if (matches.length === 0 && this.useSimilar_) {
    matches = this.getSimilarRows(token, maxMatches);
  }

  matchHandler(token, matches);
};
