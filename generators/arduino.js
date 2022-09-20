/**
 * @license
 * Visual Blocks Language
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
 * @fileoverview Helper functions for generating Arduino for blocks.
 * @author gasolin@gmail.com (Fred Lin)
 * reboot scanet@libreduc.cc (SebCanet)
 */
'use strict';

goog.module('Blockly.Arduino');
goog.module.declareLegacyNamespace();

goog.require('Blockly.Generator');
goog.require('Blockly.StaticTyping');
const {Names, NameType} = goog.require('Blockly.Names');

/**
 * Arduino code generator.
 * @type {!Blockly.Generator}
 */
const Arduino = new Blockly.Generator('Arduino');
const StaticTyping = new Blockly.StaticTyping();

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * Arduino specific keywords defined in: http://arduino.cc/en/Reference/HomePage
 * @private
 */
Arduino.addReservedWords(
  'Blockly,' +  // In case JS is evaled in the current window.
  'setup,loop,if,else,for,switch,case,while,do,break,continue,return,goto,' +
  'define,include,HIGH,LOW,INPUT,OUTPUT,INPUT_PULLUP,true,false,integer,' +
  'constants,floating,point,void,boolean,char,unsigned,byte,int,word,long,' +
  'float,double,string,String,array,static,volatile,const,sizeof,pinMode,' +
  'digitalWrite,digitalRead,analogReference,analogRead,analogWrite,tone,' +
  'noTone,shiftOut,shitIn,pulseIn,millis,micros,delay,delayMicroseconds,' +
  'min,max,abs,constrain,map,pow,sqrt,sin,cos,tan,randomSeed,random,' +
  'lowByte,highByte,bitRead,bitWrite,bitSet,bitClear,bit,attachInterrupt,' +
  'detachInterrupt,interrupts,noInterrupts');

/** Order of operation ENUMs. */
Arduino.ORDER_ATOMIC = 0;         // 0 "" ...
Arduino.ORDER_UNARY_POSTFIX = 1;  // expr++ expr-- () [] .
Arduino.ORDER_UNARY_PREFIX = 2;   // -expr !expr ~expr ++expr --expr
Arduino.ORDER_MULTIPLICATIVE = 3; // * / % ~/
Arduino.ORDER_ADDITIVE = 4;       // + -
Arduino.ORDER_SHIFT = 5;          // << >>
Arduino.ORDER_RELATIONAL = 6;     // is is! >= > <= <
Arduino.ORDER_EQUALITY = 7;       // == != === !==
Arduino.ORDER_BITWISE_AND = 8;    // &
Arduino.ORDER_BITWISE_XOR = 9;    // ^
Arduino.ORDER_BITWISE_OR = 10;    // |
Arduino.ORDER_LOGICAL_AND = 11;   // &&
Arduino.ORDER_LOGICAL_OR = 12;    // ||
Arduino.ORDER_CONDITIONAL = 13;   // expr ? expr : expr
Arduino.ORDER_ASSIGNMENT = 14;    // = *= /= ~/= %= += -= <<= >>= &= ^= |=
Arduino.ORDER_COMMA = 15;    // ,
Arduino.ORDER_UNARY_NEGATION = 16;
Arduino.ORDER_MEMBER = 17;
Arduino.ORDER_NONE = 99;          // (...)

/**
 * A list of types tasks that the pins can be assigned. Used to track usage and
 * warn if the same pin has been assigned to more than one task.
 */
Arduino.PinTypes = {
  INPUT: 'INPUT',
  OUTPUT: 'OUTPUT',
  PWM: 'PWM',
  SERVO: 'SERVO',
  STEPPER: 'STEPPER',
  SERIAL: 'SERIAL',
  I2C: 'I2C/TWI',
  SPI: 'SPI'
};
Arduino.ORDER_OVERRIDES = [
  // (foo()).bar -> foo().bar
  // (foo())[0] -> foo()[0]
  [Arduino.ORDER_FUNCTION_CALL, Arduino.ORDER_MEMBER],
  // (foo())() -> foo()()
  [Arduino.ORDER_FUNCTION_CALL, Arduino.ORDER_FUNCTION_CALL],
  // (foo.bar).baz -> foo.bar.baz
  // (foo.bar)[0] -> foo.bar[0]
  // (foo[0]).bar -> foo[0].bar
  // (foo[0])[1] -> foo[0][1]
  [Arduino.ORDER_MEMBER, Arduino.ORDER_MEMBER],
  // (foo.bar)() -> foo.bar()
  // (foo[0])() -> foo[0]()
  [Arduino.ORDER_MEMBER, Arduino.ORDER_FUNCTION_CALL],
  // !(!foo) -> !!foo
  [Arduino.ORDER_LOGICAL_NOT, Arduino.ORDER_LOGICAL_NOT],
  // a * (b * c) -> a * b * c
  [Arduino.ORDER_MULTIPLICATION, Arduino.ORDER_MULTIPLICATION],
  // a + (b + c) -> a + b + c
  [Arduino.ORDER_ADDITION, Arduino.ORDER_ADDITION],
  // a && (b && c) -> a && b && c
  [Arduino.ORDER_LOGICAL_AND, Arduino.ORDER_LOGICAL_AND],
  // a || (b || c) -> a || b || c
  [Arduino.ORDER_LOGICAL_OR, Arduino.ORDER_LOGICAL_OR]
];

/**
 * Arduino generator short name for
 * Blockly.Generator.prototype.FUNCTION_NAME_PLACEHOLDER_
 * @type {!string}
 */
Arduino.DEF_FUNC_NAME = Arduino.FUNCTION_NAME_PLACEHOLDER_;

/**
 * Initialises the database of global definitions, the setup function, function
 * names, and variable names.
 * @param {Blockly.Workspace} workspace Workspace to generate code from.
 */
Arduino.init = function (workspace) {

  // Call Blockly.Generator's init.
  Object.getPrototypeOf(this).init.call(this);

  if (!this.nameDB_) {
    this.nameDB_ = new Names(this.RESERVED_WORDS_);
  } else {
    this.nameDB_.reset();
  }

  Arduino.nameDB_.setVariableMap(workspace.getVariableMap());

  // Create a dictionary of definitions to be printed at the top of the sketch
  Arduino.includes_ = Object.create(null);
  // Create a dictionary of global definitions to be printed after variables
  Arduino.definitions_ = Object.create(null);
  // Create a dictionary of variables
  Arduino.variables_ = Object.create(null);
  // Create a dictionary of functions from the code generator
  Arduino.codeFunctions_ = Object.create(null);
  // Create a dictionary of functions created by the user
  Arduino.userFunctions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions)
  Arduino.functionNames_ = Object.create(null);
  // Create a dictionary of setups to be printed in the setup() function
  Arduino.setups_ = Object.create(null);
  // Create a dictionary of pins to check if their use conflicts
  Arduino.pins_ = Object.create(null);

  // Iterate through to capture all blocks types and set the function arguments
  var varsWithTypes = StaticTyping.collectVarsWithTypes(workspace);
  StaticTyping.setProcedureArgs(workspace, varsWithTypes);

  // Set variable declarations with their Arduino type in the defines dictionary
  for (var varName in varsWithTypes) {
    if (varsWithTypes[varName]) {
      if (varsWithTypes[varName].arrayType) {
        var varType = Arduino.recurseArrayType(varName, varsWithTypes);
        Arduino.addVariable(varName,
          varType
          + ' '
          + this.nameDB_.getName(varName, NameType.VARIABLE)
          + ';');
      } else {
        Arduino.addVariable(varName,
          Arduino.getArduinoType_(varsWithTypes[varName])
          + ' '
          + this.nameDB_.getName(varName, NameType.VARIABLE)
          + ';');
      }
    } else {
      Arduino.addVariable(varName,
        'undefined '
        + this.nameDB_.getName(varName, NameType.VARIABLE)
        + ';');
    }
  }
};

/**
 * Recurse array construction to determine Arduino type and dimension
 * 
 * @param {string} var name
 * @param {array} All vars collected
 * @return {string} Array type, in a string format (varName[x]).
 */
Arduino.recurseArrayType = function (varName, varsWithTypes) {
  if (!varsWithTypes[varName].arrayType
    || varsWithTypes[varName].arrayType instanceof Blockly.Type) {
    // The var is directly defined by an array block with childblock
    var arrayDimension = '';
    if (varsWithTypes[varName].arrayType) {
      // if array block is constructed with array blocks
      var subArray = varsWithTypes[varName].arrayType;
      // build array dimension(s)
      arrayDimension = '[' + varsWithTypes[varName].arraySize + ']';
      while (subArray.arrayType) {
        arrayDimension += '[' + subArray.arraySize + ']';
        subArray = subArray.arrayType;
      }
      // if the final block is a variable
      if (!(subArray instanceof Blockly.Type)) {
        varName = subArray[1];
        if (varsWithTypes[varName].arrayType) {
          var varType = Arduino.recurseArrayType(varName, varsWithTypes);
          // if the var is an array
          // 1- get the type
          // 2- apply the dimensions already built
          // 3- add the dimension of this array
          return varType.substr(0, varType.indexOf('['))
            + arrayDimension
            + varType.substr(varType.indexOf('['));
        }
      }
    }

    return Arduino.getArduinoType_(varsWithTypes[varName]) + arrayDimension;
  } else {
    // the var is inderectly defined by an array block with variable on
    // input
    var varTab = varsWithTypes[varName].arrayType[1];
    if (varTab == varName || !varsWithTypes[varTab]) {
      // prevent direct recursive calls
      // don't prevent undirect use of the same variable
      return 'undefined';
    } else {
      var varType = Arduino.recurseArrayType(varTab, varsWithTypes);
      return Arduino.insertParentArraySize(varType, varsWithTypes[varName].arraySize);
    }
  }
};

/**
 * Insert parent array dimension in the current array type
 * 
 * @param {string} var type (like varName[x])
 * @param {array} All vars collected
 * @return {string} Array type, in a string format (varName[y][x]).
 */
Arduino.insertParentArraySize = function (varType, parentArraySize) {
  if (varType.indexOf('[') >= 0) {
    return varType.substr(0, varType.indexOf('[')) + '[' + parentArraySize + ']' + varType.substr(varType.indexOf('['));
  } else {
    return varType + '[' + parentArraySize + ']';
  }
};

/**
 * Prepare all generated code to be placed in the sketch specific locations.
 * @param {string} code Generated main program (loop function) code.
 * @return {string} Completed sketch code.
 */
Arduino.finish = function (code) {
  // Convert the includes, definitions, and functions dictionaries into lists
  var includes = [], definitions = [], variables = [], functions = [];
  for (var name in Arduino.includes_) {
    includes.push(Arduino.includes_[name]);
  }
  if (includes.length) {
    includes.push('\n');
  }
  for (var name in Arduino.definitions_) {
    definitions.push(Arduino.definitions_[name]);
  }
  if (definitions.length) {
    definitions.push('\n');
  }
  for (var name in Arduino.variables_) {
    variables.push(Arduino.variables_[name]);
  }
  if (variables.length) {
    variables.push('\n');
  }
  for (var name in Arduino.codeFunctions_) {
    functions.push(Arduino.codeFunctions_[name]);
  }
  for (var name in Arduino.userFunctions_) {
    functions.push(Arduino.userFunctions_[name]);
  }
  if (functions.length) {
    functions.push('\n');
  }

  // userSetupCode added at the end of the setup function without leading spaces
  var setups = [''], userSetupCode = '';
  if (Arduino.setups_['userSetupCode'] !== undefined) {
    userSetupCode = '\n' + Arduino.setups_['userSetupCode'];
    delete Arduino.setups_['userSetupCode'];
  }
  for (var name in Arduino.setups_) {
    setups.push(Arduino.setups_[name]);
  }
  if (userSetupCode) {
    setups.push(userSetupCode);
  }

  // Clean up temporary data
  delete Arduino.includes_;
  delete Arduino.definitions_;
  delete Arduino.codeFunctions_;
  delete Arduino.userFunctions_;
  delete Arduino.functionNames_;
  delete Arduino.setups_;
  delete Arduino.pins_;
  this.nameDB_.reset();

  var allDefs = includes.join('\n') + definitions.join('\n') + variables.join('\n') + functions.join('\n\n');
  var setup = 'void setup() {' + setups.join('\n  ') + '\n}\n\n';
  var loop = 'void loop() {\n  ' + code.replace(/\n/g, '\n  ') + '\n}';
  return allDefs + setup + loop;
};

/**
 * Adds a string of "include" code to be added to the sketch.
 * Once a include is added it will not get overwritten with new code.
 * @param {!string} includeTag Identifier for this include code.
 * @param {!string} code Code to be included at the very top of the sketch.
 */
Arduino.addInclude = function (includeTag, code) {
  if (Arduino.includes_[includeTag] === undefined) {
    Arduino.includes_[includeTag] = code;
  }
};

/**
 * Adds a string of code to be declared globally to the sketch.
 * Once it is added it will not get overwritten with new code.
 * @param {!string} declarationTag Identifier for this declaration code.
 * @param {!string} code Code to be added below the includes.
 */
Arduino.addDeclaration = function (declarationTag, code) {
  if (Arduino.definitions_[declarationTag] === undefined) {
    Arduino.definitions_[declarationTag] = code;
  }
};

/**
 * Adds a string of code to declare a variable globally to the sketch.
 * Only if overwrite option is set to true it will overwrite whatever
 * value the identifier held before.
 * @param {!string} varName The name of the variable to declare.
 * @param {!string} code Code to be added for the declaration.
 * @param {boolean=} overwrite Flag to ignore previously set value.
 * @return {!boolean} Indicates if the declaration overwrote a previous one.
 */
Arduino.addVariable = function (varName, code, overwrite) {
  var overwritten = false;
  if (overwrite || (Arduino.variables_[varName] === undefined)) {
    Arduino.variables_[varName] = code;
    overwritten = true;
  }
  return overwritten;
};

/**
 * Adds a string of code into the Arduino setup() function. It takes an
 * identifier to not repeat the same kind of initialisation code from several
 * blocks. If overwrite option is set to true it will overwrite whatever
 * value the identifier held before.
 * @param {!string} setupTag Identifier for the type of set up code.
 * @param {!string} code Code to be included in the setup() function.
 * @param {boolean=} overwrite Flag to ignore previously set value.
 * @return {!boolean} Indicates if the new setup code overwrote a previous one.
 */
Arduino.addSetup = function (setupTag, code, overwrite) {
  var overwritten = false;
  if (overwrite || (Arduino.setups_[setupTag] === undefined)) {
    Arduino.setups_[setupTag] = code;
    overwritten = true;
  }
  return overwritten;
};

/**
 * Adds a string of code as a function. It takes an identifier (meant to be the
 * function name) to only keep a single copy even if multiple blocks might
 * request this function to be created.
 * A function (and its code) will only be added on first request.
 * @param {!string} preferedName Identifier for the function.
 * @param {!string} code Code to be included in the setup() function.
 * @return {!string} A unique function name based on input name.
 */
Arduino.addFunction = function (preferedName, code) {
  if (Arduino.codeFunctions_[preferedName] === undefined) {
    var uniqueName = this.nameDB_.getDistinctName(
      preferedName, Blockly.Generator.NAME_TYPE);
    Arduino.codeFunctions_[preferedName] =
      code.replace(Arduino.DEF_FUNC_NAME, uniqueName);
    Arduino.functionNames_[preferedName] = uniqueName;
  }
  return Arduino.functionNames_[preferedName];
};

/**
 * Description.
 * @param {!Blockly.Block} block Description.
 * @param {!string} pin Description.
 * @param {!string} pinType Description.
 * @param {!string} warningTag Description.
 */
Arduino.reservePin = function (block, pin, pinType, warningTag) {
  if (Arduino.pins_[pin] !== undefined) {
    if (Arduino.pins_[pin] != pinType) {
      block.setWarningText(Blockly.Msg.ARD_PIN_WARN1.replace('%1', pin)
        .replace('%2', warningTag).replace('%3', pinType)
        .replace('%4', Arduino.pins_[pin]), warningTag);
    } else {
      block.setWarningText(null, warningTag);
    }
  } else {
    Arduino.pins_[pin] = pinType;
    block.setWarningText(null, warningTag);
  }
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything. A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Arduino.scrubNakedValue = function (line) {
  return line + ';\n';
};

/**
 * Encode a string as a properly escaped Arduino string, complete with quotes.
 * @param {string} string Text to encode.
 * @return {string} Arduino string.
 * @private
 */
Arduino.quote_ = function (string) {
  // TODO: This is a quick hack.  Replace with goog.string.quote
  string = string.replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\\n')
    .replace(/\$/g, '\\$')
    .replace(/'/g, '\\\'');
  return '\"' + string + '\"';
};

/**
 * Common tasks for generating Arduino from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Arduino code created for this block.
 * @return {string} Arduino code with comments and subsequent blocks added.
 * @this {Blockly.CodeGenerator}
 * @private
 */
Arduino.scrub_ = function (block, code) {
  if (code === null) {
    // Block has handled code generation itself.
    return '';
  }
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      commentCode += this.prefixLines(comment, '// ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var x = 0; x < block.inputList.length; x++) {
      if (block.inputList[x].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[x].connection.targetBlock();
        if (childBlock) {
          var comment = this.allNestedComments(childBlock);
          if (comment) {
            commentCode += this.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = this.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};

/**
 * Generates Arduino Types from a Blockly Type.
 * @param {!Blockly.Type} typeBlockly The Blockly type to be converted.
 * @return {string} Arduino type for the respective Blockly input type, in a
 *     string format.
 * @private
 */
Arduino.getArduinoType_ = function (typeBlockly) {
  switch (typeBlockly.typeId) {
    case Blockly.Types.VOLATIL_NUMBER.typeId:
      return 'volatile int';
    case Blockly.Types.SHORT_NUMBER.typeId:
      return 'byte';
    case Blockly.Types.NUMBER.typeId:
      return 'int';
    case Blockly.Types.UNS_NUMBER.typeId:
      return 'unsigned int';
    case Blockly.Types.LARGE_NUMBER.typeId:
      return 'long';
    case Blockly.Types.LARGE_UNS_NUMBER.typeId:
      return 'unsigned long';
    case Blockly.Types.DECIMAL.typeId:
      return 'float';
    case Blockly.Types.TEXT.typeId:
      return 'String';
    case Blockly.Types.CHARACTER.typeId:
      return 'char';
    case Blockly.Types.ARRAY_CHAR.typeId:
      return 'char*';
    case Blockly.Types.BOOLEAN.typeId:
      return 'boolean';
    case Blockly.Types.NULL.typeId:
      //return 'void';
      // TODO: Find a more elegant way to default to double type
      // This could be by removing StaticTyping completely from Leaphy Blockly
      return 'double';
    case Blockly.Types.ARRAY.typeId:
      return Arduino.getArduinoType_(typeBlockly.arrayType);
    case Blockly.Types.UNDEF.typeId:
      return 'undefined';
    case Blockly.Types.CHILD_BLOCK_MISSING.typeId:
      // If no block connected default to int, change for easier debugging
      //return 'ChildBlockMissing';
      return 'int';
    default:
      return 'Invalid Blockly Type';
  }
};

/** Used for not-yet-implemented block code generators */
Arduino.noGeneratorCodeInline = function () {
  return ['', Arduino.ORDER_ATOMIC];
};

Arduino.noGeneratorCodeLine = function () {
  return '';
};

exports = Arduino;