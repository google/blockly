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
goog.require('Blockly.Drawer');

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
 *   - No dropdowns:   this.typeblock: [{ translatedName: Blockly.LANG_VAR }]
 *   - With dropdowns: this.typeblock: [{ translatedName: Blockly.LANG_VAR },
 *                                        dropdown: {
 *                                          titleName: 'TITLE', value: 'value'
 *                                        }]
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
  if (e.altKey || e.ctrlKey || e.metaKey || e.keycode === 9) { // 9 is tab
    return;
  }

  // A way to know if the user is editing a block or trying to type a new one
//  if (e.target.id === '') return;
  if (goog.style.isElementShown(Blockly.TypeBlock.typeBlockDiv_)) {
    // Pressing esc closes the context menu.
    if (e.keyCode == 27) {
      Blockly.TypeBlock.hide();
    }
    // Enter in the panel makes it select an option
    if (e.keyCode === 13) {
      Blockly.TypeBlock.hide();
    }
  } else if (isCharacterKey(e.charCode)) {
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
        }
        createOption(typeblockArray, name);
      }
    }

    function createOption(tb, canonicName){
      if (tb){
        goog.array.forEach(tb, function(dd){
          var dropDownValues = {};
          var mutatorAttributes = {};
          if (dd.dropDown){
            if (dd.dropDown.titleName && dd.dropDown.value){
              dropDownValues.titleName = dd.dropDown.titleName;
              dropDownValues.value = dd.dropDown.value;
            }
            else {
              throw new Error('TypeBlock not correctly set up for ' + canonicName);
            }
          }
          if(dd.mutatorAttributes) {
            mutatorAttributes = dd.mutatorAttributes;
          }
          listOfOptions[dd.translatedName] = {
            canonicName: canonicName,
            dropDown: dropDownValues,
            mutatorAttributes: mutatorAttributes
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
Blockly.TypeBlock.reloadOptionsAfterChanges_ = function () {
  Blockly.TypeBlock.TBOptionsNames_ = goog.object.getKeys(Blockly.TypeBlock.TBOptions_);
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
Blockly.TypeBlock.loadProcedures_ = function(){
  // Clean up any previous procedures in the list.
  Blockly.TypeBlock.TBOptions_ = goog.object.filter(Blockly.TypeBlock.TBOptions_,
      function(opti){ return !opti.isProcedure;});

  var procsNoReturn = createTypeBlockForProcedures_(false);
  goog.array.forEach(procsNoReturn, function(pro){
    Blockly.TypeBlock.TBOptions_[pro.translatedName] = {
      canonicName: 'procedures_callnoreturn',
      dropDown: pro.dropDown,
      isProcedure: true // this attribute is used to clean up before reloading
    };
  });

  var procsReturn = createTypeBlockForProcedures_(true);
  goog.array.forEach(procsReturn, function(pro){
    Blockly.TypeBlock.TBOptions_[pro.translatedName] = {
      canonicName: 'procedures_callreturn',
      dropDown: pro.dropDown,
      isProcedure: true
    };
  });

  /**
   * Procedure names can be collected for both 'with return' and 'no return'
   * varieties from getProcedureNames()
   * @param {boolean} withReturn indicates if the query us for 'with':true
   *                  or 'no':false return
   * @returns {Array} array of the procedures requested
   * @private
   */
  function createTypeBlockForProcedures_(withReturn) {
    var options = [];
    var procNamesArray = Blockly.Procedures.allProcedures(Blockly.mainWorkspace);
    var procNames;
    if (withReturn) {
      procNames = procNamesArray[0];
    } else {
      procNames = procNamesArray[1];
    }
    goog.array.forEach(procNames, function(proc){
      options.push(
          {
            translatedName: Blockly.Msg.LANG_PROCEDURES_CALLNORETURN_CALL + ' ' + proc[0],
            dropDown: {
              titleName: 'PROCNAME',
              value: proc[0]
            }
          }
      );
    });
    return options;
  }
};

/**
 * Loads all global variable names as options for TypeBlocking. It is used
 * lazily from show().
 * Call 'reloadOptionsAfterChanges_' after calling this one. The function
 * lazyLoadOfOptions_ is an example of how to call this function.
 */
Blockly.TypeBlock.loadGlobalVariables_ = function () {
  //clean up any previous procedures in the list
  Blockly.TypeBlock.TBOptions_ = goog.object.filter(Blockly.TypeBlock.TBOptions_,
      function(opti){ return !opti.isGlobalvar;});

  var globalVarNames = createTypeBlockForVariables_();
  goog.array.forEach(globalVarNames, function(varName){
    var canonicalN;
    if (varName.translatedName.substring(0,3) === 'get')
      canonicalN = 'lexical_variable_get';
    else
      canonicalN = 'lexical_variable_set';
    Blockly.TypeBlock.TBOptions_[varName.translatedName] = {
      canonicName: canonicalN,
      dropDown: varName.dropDown,
      isGlobalvar: true
    };
  });

  /**
   * Create TypeBlock options for global variables (a setter and a getter for each).
   * @returns {Array} array of global var options
   */
  function createTypeBlockForVariables_() {
    var options = [];
//    var varNames = Blockly.FieldLexicalVariable.getGlobalNames();
    var varNames = Blockly.Variables.allVariables(Blockly.mainWorkspace);
    // Make a setter and a getter for each of the names
    goog.array.forEach(varNames, function(varName){
      options.push(
          {
            translatedName: 'get global ' + varName,
            dropDown: {
              titleName: 'VAR',
              value: 'global ' + varName
            }
          }
      );
      options.push(
          {
            translatedName: 'set global ' + varName,
            dropDown: {
              titleName: 'VAR',
              value: 'global ' + varName
            }
          }
      );
    });
    return options;
  }
};

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
        dropDown: {
          titleName: 'NUM',
          value: blockName
        }
      };
    }
    else if (textMatch && textMatch.length === 1){
      blockToCreate = {
        canonicName: 'text',
        dropDown: {
          titleName: 'TEXT',
          value: blockName.substring(1)
        }
      };
    }
    else
      return; // block does not exist: return
  }

  var blockToCreateName = '';
  var block;
  if (blockToCreate.dropDown){
    //All blocks should have a dropDown property, even if empty
    blockToCreateName = blockToCreate.canonicName;
    // components have mutator attributes we need to deal with.
    // We can also add these for special blocks
    //   e.g., this is done for create empty list
    var xmlString = Blockly.Drawer.getDefaultXMLString(
                                               blockToCreate.canonicName,
                                               blockToCreate.mutatorAttributes);
    var xml;
    if (xmlString === null) {
      var blockType = blockToCreate.canonicName;
      if (blockType == 'procedures_callnoreturn' ||
          blockType == 'procedures_callreturn') {
        xmlString = Blockly.Drawer.procedureCallersXMLString(
                                      blockType == 'procedures_callreturn');
      } else {
        xmlString = '<xml><block type="' + blockType + '">';
        if(!goog.object.isEmpty(blockToCreate.mutatorAttributes)) {
          xmlString += Blockly.Drawer.mutatorAttributesToXMLString(
                                              blockToCreate.mutatorAttributes);
        }
        xmlString += '</block></xml>';
      }
    }
    xml = Blockly.Xml.textToDom(xmlString);
    var xmlBlock = xml.firstChild;
    if (xml.childNodes.length > 1 &&
        Blockly.TypeBlock.inputText_.value === 'make a list')
      xmlBlock = xml.childNodes[1];
    block = Blockly.Xml.domToBlock(Blockly.mainWorkspace, xmlBlock);

    if (blockToCreate.dropDown.titleName && blockToCreate.dropDown.value){
      block.setFieldValue(blockToCreate.dropDown.value,
                          blockToCreate.dropDown.titleName);
      // change type checking for split blocks
      if(blockToCreate.dropDown.value == 'SPLITATFIRST' ||
         blockToCreate.dropDown.value == 'SPLIT') {
        block.getInput("AT").setCheck('String');
      } else if(blockToCreate.dropDown.value == 'SPLITATFIRSTOFANY' ||
                blockToCreate.dropDown.value == 'SPLITATANY') {
        block.getInput("AT").setCheck('Array');
      }
    }
  } else {
    throw new Error('Type Block not correctly set up for: ' + blockToCreateName);
  }
  //   Blockly.WarningHandler.checkAllBlocksForWarningsAndErrors();
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
  if (blockSelected.outputConnection == null &&
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

var isCharacterKey = function(charCode) {
  // NOTE: The following regex was generated from http://apps.timwhitlock.info/js/regex#
  var regex = new RegExp("[\"\'$+0-9<->A-Za-z|~¢-¥ª¬±-³µ¹-º¼-¾À-ˁˆ-ˑˠ-ˤˬˮ\u0300-ʹͶ-ͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ҁ\u0483-ԣԱ-Ֆՙա-և\u0591-\u05bd\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05c7א-תװ-ײ؆-؈؋\u0610-\u061aء-\u065e٠-٩ٮ-ۓە-\u06dc\u06de-\u06e8\u06ea-ۼۿܐ-\u074aݍ-ޱ߀-ߵߺ\u0901-ह\u093c-\u094dॐ-\u0954क़-\u0963०-९ॱ-ॲॻ-ॿ\u0981-\u0983অ-ঌএ-ঐও-নপ-রলশ-হ\u09bc-\u09c4\u09c7-\u09c8\u09cb-ৎ\u09d7ড়-ঢ়য়-\u09e3০-৹\u0a01-\u0a03ਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹ\u0a3c\u0a3e-\u0a42\u0a47-\u0a48\u0a4b-\u0a4d\u0a51ਖ਼-ੜਫ਼੦-\u0a75\u0a81-\u0a83અ-ઍએ-ઑઓ-નપ-રલ-ળવ-હ\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acdૐૠ-\u0ae3૦-૯૱\u0b01-\u0b03ଅ-ଌଏ-ଐଓ-ନପ-ରଲ-ଳଵ-ହ\u0b3c-\u0b44\u0b47-\u0b48\u0b4b-\u0b4d\u0b56-\u0b57ଡ଼-ଢ଼ୟ-\u0b63୦-୯ୱ\u0b82-ஃஅ-ஊஎ-ஐஒ-கங-சஜஞ-டண-தந-பம-ஹ\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcdௐ\u0bd7௦-௲௹\u0c01-\u0c03అ-ఌఎ-ఐఒ-నప-ళవ-హఽ-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55-\u0c56ౘ-ౙౠ-\u0c63౦-౯౸-౾\u0c82-\u0c83ಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹ\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5-\u0cd6ೞೠ-\u0ce3೦-೯\u0d02-\u0d03അ-ഌഎ-ഐഒ-നപ-ഹഽ-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57ൠ-\u0d63൦-൵ൺ-ൿ\u0d82-\u0d83අ-ඖක-නඳ-රලව-ෆ\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2-\u0df3ก-\u0e3a฿-\u0e4e๐-๙ກ-ຂຄງ-ຈຊຍດ-ທນ-ຟມ-ຣລວສ-ຫອ-\u0eb9\u0ebb-ຽເ-ໄໆ\u0ec8-\u0ecd໐-໙ໜ-ໝༀ\u0f18-\u0f19༠-༳\u0f35\u0f37\u0f39\u0f3e-ཇཉ-ཬ\u0f71-\u0f84\u0f86-ྋ\u0f90-\u0f97\u0f99-\u0fbc\u0fc6က-၉ၐ-႙Ⴀ-Ⴥა-ჺჼᄀ-ᅙᅟ-ᆢᆨ-ᇹሀ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ\u135f፩-፼ᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙶᚁ-ᚚᚠ-ᛪ\u16ee-\u16f0ᜀ-ᜌᜎ-\u1714ᜠ-\u1734ᝀ-\u1753ᝠ-ᝬᝮ-ᝰ\u1772-\u1773ក-ឳ\u17b6-\u17d3ៗ៛-\u17dd០-៩៰-៹\u180b-\u180d᠐-᠙ᠠ-ᡷᢀ-ᢪᤀ-ᤜ\u1920-\u192b\u1930-\u193b᥆-ᥭᥰ-ᥴᦀ-ᦩ\u19b0-\u19c9᧐-᧙ᨀ-\u1a1b\u1b00-ᭋ᭐-᭙\u1b6b-\u1b73\u1b80-\u1baaᮮ-᮹ᰀ-\u1c37᱀-᱉ᱍ-ᱽᴀ-\u1de6\u1dfe-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ\u2000-\u206e⁰-ⁱ⁴-⁼ⁿ-₌ₐ-ₔ₠-₵\u20d0-\u20f0ℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ⅉ⅋ⅎ⅓-\u2188←-↔↚-↛↠↣↦↮⇎-⇏⇒⇔⇴-⋿⌈-⌋⌠-⌡⍼⎛-⎳⏜-⏡①-⒛⓪-⓿▷◁◸-◿♯❶-➓⟀-⟄⟇-⟊⟌⟐-⟥⟰-⟿⤀-⦂⦙-⧗⧜-⧻⧾-⫿⬰-⭄⭇-⭌Ⰰ-Ⱞⰰ-ⱞⱠ-Ɐⱱ-ⱽⲀ-ⳤ⳽ⴀ-ⴥⴰ-ⵥⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ\u2de0-\u2dffⸯ々-\u3007\u3021-\u302f〱-〵\u3038-〼ぁ-ゖ\u3099-\u309aゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎ㆒-㆕ㆠ-ㆷㇰ-ㇿ㈠-㈩㉑-㉟㊀-㊉㊱-㊿㐀-䶵一-鿃ꀀ-ꒌꔀ-ꘌꘐ-ꘫꙀ-ꙟꙢ-\ua672\ua67c-\ua67dꙿ-ꚗꜗ-ꜟꜢ-ꞈꞋ-ꞌꟻ-\ua827ꡀ-ꡳ\ua880-\ua8c4꣐-꣙꤀-\ua92dꤰ-\ua953ꨀ-\uaa36ꩀ-\uaa4d꩐-꩙가-힣豈-鶴侮-頻並-龎ﬀ-ﬆﬓ-ﬗיִ-זּטּ-לּמּנּ-סּףּ-פּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-﷼\ufe00-\ufe0f\ufe20-\ufe26﹢﹤-﹦﹩ﹰ-ﹴﹶ-ﻼ＄＋０-９＜-＞Ａ-Ｚａ-ｚ｜～ｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ￠-￢￥-￦￩-￬]|[\ud840-\ud868][\udc00-\udfff]|\ud800[\udc00-\udc0b\udc0d-\udc26\udc28-\udc3a\udc3c-\udc3d\udc3f-\udc4d\udc50-\udc5d\udc80-\udcfa\udd07-\udd33\udd40-\udd78\udd8a\uddfd\ude80-\ude9c\udea0-\uded0\udf00-\udf1e\udf20-\udf23\udf30-\udf4a\udf80-\udf9d\udfa0-\udfc3\udfc8-\udfcf\udfd1-\udfd5]|\ud801[\udc00-\udc9d\udca0-\udca9]|\ud802[\udc00-\udc05\udc08\udc0a-\udc35\udc37-\udc38\udc3c\udc3f\udd00-\udd19\udd20-\udd39\ude00-\ude03\ude05-\ude06\ude0c-\ude13\ude15-\ude17\ude19-\ude33\ude38-\ude3a\ude3f-\ude47]|\ud808[\udc00-\udf6e]|\ud809[\udc00-\udc62]|\ud834[\udd65-\udd69\udd6d-\udd72\udd7b-\udd82\udd85-\udd8b\uddaa-\uddad\ude42-\ude44\udf60-\udf71]|\ud835[\udc00-\udc54\udc56-\udc9c\udc9e-\udc9f\udca2\udca5-\udca6\udca9-\udcac\udcae-\udcb9\udcbb\udcbd-\udcc3\udcc5-\udd05\udd07-\udd0a\udd0d-\udd14\udd16-\udd1c\udd1e-\udd39\udd3b-\udd3e\udd40-\udd44\udd46\udd4a-\udd50\udd52-\udea5\udea8-\udfcb\udfce-\udfff]|\ud869[\udc00-\uded6]|\ud87e[\udc00-\ude1d]|\udb40[\udd00-\uddef]");

  //var regex = new RegExp("

//");



  // NOTE: if the regex above ever gives trouble, we can use the simpler one.
  //var regex = new RegExp("[0-9A-Za-z]");

  if (regex.test(String.fromCharCode(charCode))) {
      return true;
  } else {
      return false;
  }
};
