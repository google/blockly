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
 * @fileoverview Helper functions for generating Java for blocks.
 * @author toebes@extremenetworks.com (John Toebes)
 * Loosely based on Python version by fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Java');

goog.require('Blockly.Generator');


/**
 * Java code generator.
 * @type !Blockly.Generator
 */
Blockly.Java = new Blockly.Generator('Java');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Java.addReservedWords(
    // import keyword
    // print ','.join(keyword.kwlist)
    // http://en.wikipedia.org/wiki/List_of_Java_keywords
    'abstract,assert,boolean,break,case,catch,class,const,continue,default,do,double,else,enum,extends,final,finally,float,for,goto,if,implements,import,instanceof,int,interface,long,native,new,package,private,protected,public,return,short,static,strictfp,super,switch,synchronized,this,throw,throws,transient,try,void,volatile,while,' +
    //http://en.wikipedia.org/wiki/List_of_Java_keywords#Reserved_words_for_literal_values
    'false,null,true,' +
    // http://docs.Java.org/library/functions.html
    'abs,divmod,input,open,staticmethod,all,enumerate,int,ord,str,any,eval,isinstance,pow,sum,basestring,execfile,issubclass,print,super,bin,file,iter,property,tuple,bool,filter,len,range,type,bytearray,float,list,raw_input,unichr,callable,format,locals,reduce,unicode,chr,frozenset,long,reload,vars,classmethod,getattr,map,repr,xrange,cmp,globals,max,reversed,zip,compile,hasattr,memoryview,round,__import__,complex,hash,min,set,apply,delattr,help,next,setattr,buffer,dict,hex,object,slice,coerce,dir,id,oct,sorted,intern');

/**
 * Order of operation ENUMs.
 * https://docs.oracle.com/javase/tutorial/java/nutsandbolts/operators.html
 */
Blockly.Java.ORDER_ATOMIC = 0;            // 0 "" ...
Blockly.Java.ORDER_COLLECTION = 1;        // tuples, lists, dictionaries
Blockly.Java.ORDER_STRING_CONVERSION = 1; // `expression...`

Blockly.Java.ORDER_MEMBER = 2;            // . []
Blockly.Java.ORDER_FUNCTION_CALL = 2;     // ()

Blockly.Java.ORDER_POSTFIX = 3;           // expr++ expr--
Blockly.Java.ORDER_EXPONENTIATION = 3;    // **  TODO: Replace this

Blockly.Java.ORDER_LOGICAL_NOT = 3;       // not
Blockly.Java.ORDER_UNARY_SIGN = 4;        // ++expr --expr +expr -expr ~ !
Blockly.Java.ORDER_MULTIPLICATIVE = 5;    // * / %
Blockly.Java.ORDER_ADDITIVE = 6;          // + -
Blockly.Java.ORDER_BITWISE_SHIFT = 7;     // << >> >>>
Blockly.Java.ORDER_RELATIONAL = 8;        // < > <= >= instanceof
Blockly.Java.ORDER_EQUALITY = 9;          // == !=
Blockly.Java.ORDER_BITWISE_AND = 10;      // &
Blockly.Java.ORDER_BITWISE_XOR = 11;      // ^
Blockly.Java.ORDER_BITWISE_OR = 12;       // |
Blockly.Java.ORDER_LOGICAL_AND = 13;      // &&
Blockly.Java.ORDER_LOGICAL_OR = 14;       // ||
Blockly.Java.ORDER_CONDITIONAL = 15;      // ? :

Blockly.Java.ORDER_ASSIGNMENT = 16;  // = += -= *= /= %= &= ^= |= <<= >>= >>>=

Blockly.Java.ORDER_NONE = 99;             // (...)

/**
 * Empty loops or conditionals are not allowed in Java.
 */
Blockly.Java.PASS = '  {}\n';

/**
 * Closure code for a section
 */
Blockly.Java.POSTFIX = '';
/**
 * Any extra indent to be added to the currently generating code block
 */
Blockly.Java.EXTRAINDENT = '';
/**
 * List of all known variable types.  Only set after a call to workspaceToCode
 */
Blockly.Java.VariableTypes_ = {};
/**
 * Default Name of the application for use by all generated classes
 */
Blockly.Java.AppName_ = 'MyApp';
/**
 * Default Name of the application for use by all generated classes
 */
Blockly.Java.Package_ = 'demo';
/**
 * Base class (if any) for the generated Java code
 */
Blockly.Java.Baseclass_ = '';
/**
 * List of libraries used globally by the generated java code. These are
 * Processed by Blockly.Java.addImport
 */
Blockly.Java.needImports_ = ['javax.json.Json',
                             'javax.json.JsonArray',
                             'javax.json.JsonObject',
                             'javax.json.JsonReader',
                             'javax.json.stream.JsonParsingException',
                             'java.io.IOException',
                             'java.io.StringReader'
                            ];
/**
 * List of libraries used by the caller's generated java code.  These will
 * be processed by Blockly.Java.addImport
 */
Blockly.Java.ExtraImports_ = null;

/**
 * Set the application name for generated classes
 * @param {string} name Name for the application for any generated code
 */
Blockly.Java.setAppName = function(name) {
  if (!name || name === '') {
    name = 'MyApp';
  }
  this.AppName_ = name;
  console.log(this.AppName_+' --- <'+name+ '>');
}

/**
 * Get the application name for generated classes
 * @return {string} name Name for the application for any generated code
 */
Blockly.Java.getAppName = function() {
  return this.AppName_;
}

/**
 * Set the package for this generated Java code
 * @param {string} package Name of the package this is derived from
 */
Blockly.Java.setPackage = function(javaPackage) {
  if (!javaPackage || javaPackage === '') {
    javaPackage = 'demo';
  }
  this.Package_ = javaPackage;
}

/**
 * Get the package for this generated Java code
 * @return {string} package Name of the package this is derived from
 */
Blockly.Java.getPackage = function() {
  return this.Package_;
}

/**
 * Set the base class (if any) for the generated Java code
 * @param {string} baseclass Name of a base class this workspace is derived from
 */
Blockly.Java.setBaseclass = function(baseclass) {
  this.Baseclass_ = baseclass;
}

/**
 * Get the base class (if any) for the generated Java code
 * @return {string} baseclass Name of a base class this workspace is derived from
 */
Blockly.Java.getBaseclass = function() {
  return this.Baseclass_;
}

/**
 * Get the Java type of a variable by name
 * @param {string} variable Name of the variable to get the type for
 * @return {string} type Java type for the variablee
 */
Blockly.Java.GetVariableType = function(variable) {
  var type = Blockly.Java.VariableTypes_[variable];
  if (!type) {
    type = 'string/*UNKNOWN_TYPE*/';
  }
  return type;
};

/**
 * Add a reference to a library to import
 * @param {string} importlib Name of the library to add to the import list
 */
Blockly.Java.addImport = function(importlib) {
  var importStr = 'import ' + importlib + ';';
  this.imports_[importStr] = importStr;
};

/**
 * Get the list of all libraries to import
 * @param {!Array<string>} imports Array of libraries to add to the list
 * @return {string} code Java code for importing all libraries referenced
 */
Blockly.Java.getImports = function() {
  // Add any of the imports that the top level code needs
  if (this.ExtraImports_) {
    for(var i = 0; i < this.ExtraImports_.length; i++) {
      this.addImport(this.ExtraImports_[i]);
    }
  }

  var keys = goog.object.getValues(this.imports_);
  goog.array.sort(keys);
  return (keys.join("\n"));
};

/**
 * Set the base class (if any) for the generated Java code
 * @param {string} baseclass Name of a base class this workspace is derived from
 */
Blockly.Java.setExtraImports = function(extraImports) {
  this.ExtraImports_ = extraImports;
}


/*
 * Save away the base class implementation so we can call it but override it
 * so that we get to modify the generated code.
 */
Blockly.Java.workspaceToCode_ = Blockly.Java.workspaceToCode;
/**
 * Generate code for all blocks in the workspace to the specified language.
 * @param {Blockly.Workspace} workspace Workspace to generate code from.
 * @param {string} parms Any extra parameters to pass to the lower level block
 * @return {string} Generated code.
 */
Blockly.Java.workspaceToCode = function(workspace, parms) {
  // Generate the code first to get all of the required imports calculated.
  var code = this.workspaceToCode_(workspace,parms);
  var finalcode = 'package ' + this.getPackage() + ';\n\n' +
                  this.getImports() + '\n\n' +
                  'public class ' + this.getAppName();
  if (this.getBaseclass()) {
    finalcode += ' extends ' + this.getBaseclass();
  }
  finalcode += ' {\n\n' +
               code + '\n' +
               '}\n';
  return finalcode;
}
/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.Java.init = function(workspace, imports) {
  // Create a dictionary of definitions to be printed before the code.
  Blockly.Java.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.Java.functionNames_ = Object.create(null);
  // Create a dictionary of all the libraries which would be needed
  Blockly.Java.imports_ = Object.create(null);
  // Start with the defaults that all the code depends on
  for(var i = 0; i < Blockly.Java.needImports_.length; i++) {
    Blockly.Java.addImport(Blockly.Java.needImports_[i]);
  }
  if (!Blockly.Java.variableDB_) {
    Blockly.Java.variableDB_ =
        new Blockly.Names(Blockly.Java.RESERVED_WORDS_);
  } else {
    Blockly.Java.variableDB_.reset();
  }

  var defvars = [];
  var variables = Blockly.Variables.allVariables(workspace);
  var vartypes = Blockly.Variables.allVariablesTypes(workspace);

  for (var x = 0; x < variables.length; x++) {
    var key = variables[x];
    var type = vartypes[key];
    if (type === 'JSON') {
      type = 'JsonObject';
    } else if (type === 'Array') {
      type = 'JsonArray';
    } else if (type === 'Boolean') {
      type = 'Boolean';
    } else if (type === 'String') {
      type = 'String';
    } else if (type === 'Number') {
      type = 'int';
    } else if (type !== '') {
      if (Blockly.Blocks[type] && Blockly.Blocks[type].GBPClass ) {
        type = Blockly.Blocks[type].GBPClass;
      } else {
        console.log('Unknown type for '+key+' using String for'+type);
        type = 'Object/*UNKNOWN_TYPE for '+type+'*/';
      }
    } else {
      // Unknown type
      console.log('Unknown type for '+key+' using String');
      type = 'String/*UNKNOWN_TYPE*/';
    }

    Blockly.Java.VariableTypes_[key] = type;

    defvars.push('protected ' +
                 type + ' '+
               Blockly.Java.variableDB_.getName(variables[x],
                                                Blockly.Variables.NAME_TYPE) +
               ';');
  }
  Blockly.Java.definitions_['variables'] = defvars.join('\n');
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Java.finish = function(code) {
  // Convert the definitions dictionary into a list.
  var imports = [];
  var definitions = [];
  for (var name in Blockly.Java.definitions_) {
    var def = Blockly.Java.definitions_[name];
    if (def.match(/^(from\s+\S+\s+)?import\s+\S+/)) {
      imports.push(def);
    } else {
      definitions.push(def);
    }
  }
  var allDefs = imports.join('\n') + '\n\n' + definitions.join('\n\n');
  return allDefs.replace(/\n\n+/g, '\n\n').replace(/\n*$/, '\n\n\n') + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Java.scrubNakedValue = function(line) {
  return line + '\n';
};

/**
 * Encode a string as a properly escaped Java string, complete with quotes.
 * @param {string} string Text to encode.
 * @return {string} Java string.
 * @private
 */
Blockly.Java.quote_ = function(string) {
  // TODO: This is a quick hack.  Replace with goog.string.quote
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/\%/g, '\\%')
                 .replace(/"/g, '\\"');
  return '"' + string + '"';
};

/**
 * Common tasks for generating Java from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Java code created for this block.
 * @return {string} Java code with comments and subsequent blocks added.
 * @private
 */
Blockly.Java.scrub_ = function(block, code, parms) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      commentCode += Blockly.Java.prefixLines(comment, '// ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var x = 0; x < block.inputList.length; x++) {
      if (block.inputList[x].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[x].connection.targetBlock();
        if (childBlock) {
          var comment = Blockly.Java.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.Java.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  var postFix = Blockly.Java.POSTFIX;
  Blockly.Java.POSTFIX = '';
  var extraIndent = Blockly.Java.EXTRAINDENT;
  Blockly.Java.EXTRAINDENT = '';
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = Blockly.Java.blockToCode(nextBlock, parms);
  if (extraIndent != '') {
    nextCode = Blockly.Java.prefixLines(nextCode, extraIndent);
  }
  return commentCode + code + nextCode + postFix;
};
