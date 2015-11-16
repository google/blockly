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
    'abs,divmod,input,open,staticmethod,all,enumerate,int,ord,str,any,eval,isinstance,pow,sum,basestring,execfile,issubclass,print,super,bin,file,iter,property,tuple,bool,filter,len,range,type,bytearray,float,list,raw_input,unichr,callable,format,locals,reduce,unicode,chr,frozenset,long,reload,vars,classmethod,getattr,map,repr,xrange,cmp,globals,max,reversed,zip,compile,hasattr,memoryview,round,__import__,complex,hash,min,set,apply,delattr,help,next,setattr,buffer,dict,hex,object,slice,coerce,dir,id,oct,sorted,intern,equal');

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
 * The method of indenting.  Java prefers four spaces by convention
 */
Blockly.Java.INDENT = '    ';
/**
 * Any extra indent to be added to the currently generating code block
 */
Blockly.Java.EXTRAINDENT = '';
/**
 * List of all known Java variable types.
 *  NOTE: Only valid after a call to workspaceToCode
 */
Blockly.Java.variableTypes_ = {};
/**
 * List of all known Blockly variable types. 
 *  NOTE: Only valid after a call to workspaceToCode
 */
Blockly.Java.blocklyTypes_ = {};
/**
 * Default Name of the application for use by all generated classes
 */
Blockly.Java.AppName_ = 'myApp';
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
Blockly.Java.needImports_ = [];
/**
 * List of interfaces that this class implements
 **/
Blockly.Java.Interfaces_ = [];
/**
 * List of libraries used by the caller's generated java code.  These will
 * be processed by Blockly.Java.addImport
 */
Blockly.Java.ExtraImports_ = null;
/**
 * Specifies that we want to have the Var Class inline instead of external
 */
Blockly.Java.INLINEVARCLASS = true;
/**
 * List of additional classes used globally by the generated java code.
 */
Blockly.Java.classes_ = [];
/**
 * List of global variables to be generated.
 */
Blockly.Java.globals_ = {};
/**
 * Target Blockly type to generate code for (if any) 
 */
Blockly.Java.targetType_ = null;
/**
 *
 */
Blockly.Java.fileHeader =
'/*\n'+
' * Copyright (c) 2015, <<Your Name>>\n'+
' * All rights reserved.\n'+
' *\n'+
' * Redistribution and use in source and binary forms, with or without\n'+
' * modification, are permitted provided that the following conditions are met:\n'+
' *\n'+
' * * Redistributions of source code must retain the above copyright notice, this\n'+
' *   list of conditions and the following disclaimer.\n'+
' * * Redistributions in binary form must reproduce the above copyright notice,\n'+
' *   this list of conditions and the following disclaimer in the documentation\n'+
' *   and/or other materials provided with the distribution.\n'+
' *\n'+
' * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"\n'+
' * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\n'+
' * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE\n'+
' * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE\n'+
' * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR\n'+
' * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF\n'+
' * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS\n'+
' * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN\n'+
' * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)\n'+
' * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE\n'+
' * POSSIBILITY OF SUCH DAMAGE.\n'+
' */\n';
/**
 * Set the application name for generated classes
 * @param {string} name Name for the application for any generated code
 */
Blockly.Java.setAppName = function(name) {
  if (!name || name === '') {
    name = 'MyApp';
  }
  this.AppName_ = name;
};
/**
 * Get the application name for generated classes
 * @return {string} name Name for the application for any generated code
 */
Blockly.Java.getAppName = function() {
  return Blockly.Java.variableDB_.getName(this.AppName_,'CLASS');
};
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


Blockly.Java.forceUpdate = function(root) {
  var blocks;
  if (root.getDescendants) {
    // Root is Block.
    blocks = root.getDescendants();
  } else if (root.getAllBlocks) {
    // Root is Workspace.
    blocks = root.getAllBlocks();
  } else {
    throw 'Not Block or Workspace: ' + root;
  }
  // Iterate through every block and call the onchange function.
  for (var x = 0; x < blocks.length; x++) {
    if (blocks[x].onchange) {
      blocks[x].onchange();
    }
  }
};
/**
 * Get the package for this generated Java code
 * @return {string} package Name of the package this is derived from
 */
Blockly.Java.getPackage = function() {
  return this.Package_;
};
/**
 * Set the base class (if any) for the generated Java code
 * @param {string} baseclass Name of a base class this workspace is derived from
 */
Blockly.Java.setBaseclass = function(baseclass) {
  this.Baseclass_ = baseclass;
};

/**
 * Get the base class (if any) for the generated Java code
 * @return {string} baseclass Name of a base class this workspace is derived from
 */
Blockly.Java.getBaseclass = function() {
  var baseClass = this.Baseclass_;
  if (baseClass != '') {
    baseClass = Blockly.Java.variableDB_.getName(baseClass,'CLASS');
  }
  return baseClass;
};
/**
 * Add an implementaiton (if any) for the generated Java code
 * @param {string} iface Name of a interface that this class provides
 */
Blockly.Java.addInterface = function(iface) {
  if (!goog.array.contains(this.Interfaces_, iface)) {
    this.Interfaces_.push(iface);
  }
};
/**
 * Get the interface list (if any) for the generated Java code
 * @return {Array<string>} baseclass Array of all interfaces that 
 *         this class implements or null if no interfaces
 */
Blockly.Java.getInterfaces = function() {
  if (this.Interfaces_.length === 0) {
    return null;
  }
  return this.Interfaces_;
};
/**
 * Mark a variable as a global for the generated Java code
 * @param {block} block Block that the variable is contained in
 * @param {string} name Name of the global to initialize
 * @param {string} val Initializer value for the gloabl
 */
Blockly.Java.setGlobalVar = function(block,name,val) {
  if (Blockly.Variables.getLocalContext(block,name) == null &&
      (typeof this.globals_[name] === 'undefined' ||
        this.globals_[name] === null)) {
    this.globals_[name] = val;
  }
};
/**
 * Get the Java type of a variable by name
 * @param {string} variable Name of the variable to get the type for
 * @return {string} type Java type for the variable
 */
Blockly.Java.GetVariableType = function(name) {
  var type = this.variableTypes_[name];
  if (!type) {
//    type = 'String';
    type = 'Var';
    Blockly.Java.provideVarClass();
  }
  return type;
};

/**
 * Get the Java type of a variable by name
 * @param {string} variable Name of the variable to get the type for
 * @return {string} type Java type for the variable
 */
Blockly.Java.GetBlocklyType = function(variable) {
  return this.blocklyTypes_[variable];
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
};
/**
 * Specify whether to inline the Var class or reference it externally
 * @param {string} inlineclass Generate the Var class inline
 */
Blockly.Java.setVarClassInline = function(inlineclass) {
  this.INLINEVARCLASS = inlineclass;
}


Blockly.Java.getClasses = function() {
  var code = '';
  for (var name in this.classes_) {
    code += this.classes_[name];
  }
  if (code) {
    code += '\n\n';
  }
  return code;
}

Blockly.Java.setExtraClass = function(name, code) {
  this.classes_[name] = code.join('\n')+'\n';
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
  this.setAppName(workspace.options.appTitle);

  // Generate the code first to get all of the required imports calculated.
  this.forceUpdate(workspace);
  var code = this.workspaceToCode_(workspace,parms);
  var finalcode = this.fileHeader +
                  'package ' + this.getPackage() + ';\n\n' +
                  this.getImports() + '\n\n' +
                  'public class ' + this.getAppName();
  var baseClass = this.getBaseclass();
  if (baseClass != '') {
    finalcode += ' extends ' + baseClass;
  }
  var interfaces = this.getInterfaces();
  if (interfaces) {
    var extra = ' implements ';
    for(var iface = 0; iface < interfaces.length; iface++) {
      finalcode += extra + interfaces[iface];
      extra = ', ';
    }
  }
  finalcode += ' {\n\n' +
               code + '\n' +
               '}\n\n' +
               this.getClasses()
               ;
  return finalcode;
}

Blockly.Java.getValueType = function(block, field) {
  var targetBlock = block.getInputTargetBlock(field);
  if (!targetBlock) {
    return '';
  }

  return targetBlock.outputConnection.check_;
}

Blockly.Java.provideVarClass = function() {
  if (this.INLINEVARCLASS) {
    Blockly.Java.addImport('java.text.DecimalFormat');
    Blockly.Java.addImport('java.text.NumberFormat');
    Blockly.Java.addImport('java.lang.Math');
    Blockly.Java.addImport('java.util.Arrays');
    Blockly.Java.addImport('java.util.Collections');
    Blockly.Java.addImport('java.util.LinkedList');
    Blockly.Java.addImport('java.util.List');
    Blockly.Java.addImport('java.util.HashMap');
    Blockly.Java.addImport('java.util.Map');
    Blockly.Java.addImport('java.util.Objects');

    var VarCode = [
    '/**',
    ' *',
    ' * @author bmoon',
    ' */',
    'final class Var implements Comparable {',
    '',
    '    public enum Type {',
    '',
    '         STRING, INT, DOUBLE, LIST, NULL, UNKNOWN',
    '    };',
    '',
    '    private Type _type;',
    '    private Object _object;',
    '    private static final NumberFormat _formatter = new DecimalFormat("#.#####");',
    '',
    '    /**',
    '     * Construct a Var with an UNKNOWN type',
    '     *',
    '     */',
    '    public Var() {',
    '         _type = Type.UNKNOWN;',
    '    } // end var',
    '',
    '    /**',
    '     * Construct a Var and assign its contained object to that specified.',
    '     *',
    '     * @param object The value to set this object to',
    '     */',
    '    public Var(Object object) {',
    '         setObject(object);',
    '    } // end var',
    '',
    '    /**',
    '     * Construct a Var from a given Var',
    '     *',
    '     * @param var var to construct this one from',
    '     */',
    '    public Var(Var var) {',
    '         setObject(var.getObject());',
    '    } // end var',
    '',
    '    /**',
    '     * Static constructor to make a var from some value.',
    '     *',
    '     * @param val some value to construct a var around',
    '     * @return the Var object',
    '     */',
    '    public static Var valueOf(Object val) {',
    '         return new Var(val);',
    '    } // end valueOf',
    '',
    '    /**',
    '     * Get the type of the underlying object',
    '     *',
    '     * @return Will return the object\'s type as defined by Type',
    '     */',
    '    public Type getType() {',
    '         return _type;',
    '    } // end getType',
    '',
    '    /**',
    '     * Get the contained object',
    '     *',
    '     * @return the object',
    '     */',
    '    public Object getObject() {',
    '         return _object;',
    '    } // end getObject',
    '',
    '    /**',
    '     * Clone Object',
    '     *',
    '     * @return a new object equal to this one',
    '     */',
    '    public Object cloneObject() {',
    '         Var tempVar = new Var(this);',
    '         return tempVar.getObject();',
    '    } // end cloneObject',
    '',
    '    /**',
    '     * Get object as an int. Does not make sense for a "LIST" type object',
    '     *',
    '     * @return an integer whose value equals this object',
    '     */',
    '    public int getObjectAsInt() {',
    '         switch (getType()) {',
    '                case STRING:',
    '                     return Integer.parseInt((String) getObject());',
    '                case INT:',
    '                     return (int) getObject();',
    '                case DOUBLE:',
    '                     return new Double((double) getObject()).intValue();',
    '                case LIST:',
    '                     // has no meaning',
    '                     break;',
    '                default:',
    '                     // has no meaning',
    '                     break;',
    '         }',
    '         return 0;',
    '    } // end getObjectAsInt',
    '',
    '    /**',
    '     * Get object as a double. Does not make sense for a "LIST" type object.',
    '     *',
    '     * @return a double whose value equals this object',
    '     */',
    '    public double getObjectAsDouble() {',
    '         switch (getType()) {',
    '                case STRING:',
    '                     return Double.parseDouble((String) getObject());',
    '                case INT:',
    '                     return new Integer((int) getObject()).doubleValue();',
    '                case DOUBLE:',
    '                     return (double) getObject();',
    '                case LIST:',
    '                     // has no meaning',
    '                     break;',
    '                default:',
    '                     // has no meaning',
    '                     break;',
    '         }',
    '         return 0.0;',
    '    } // end get object as double',
    '',
    '    /**',
    '     * Get object as a string.',
    '     *',
    '     * @return The string value of the object. Note that for lists, this is a',
    '     * comma separated list of the form {x,y,z,...}',
    '     */',
    '    public String getObjectAsString() {',
    '         return this.toString();',
    '    } // end gotObjectAsString',
    '',
    '    /**',
    '     * Get the object as a list.',
    '     *',
    '     * @return a LinkedList whose elements are of type Var',
    '     */',
    '    public LinkedList<Var> getObjectAsList() {',
    '         return (LinkedList<Var>) getObject();',
    '    } // end getObjectAsList',
    '',
    '    /**',
    '     * If this object is a linked list, then calling this method will return the',
    '     * Var at the index indicated',
    '     *',
    '     * @param index the index of the Var to read (0 based)',
    '     * @return the Var at that index',
    '     */',
    '    public Var get(int index) {',
    '         return ((LinkedList<Var>) getObject()).get(index);',
    '    } // end get',
    '',
    '    /**',
    '     * If this object is a linked list, then calling this method will return the',
    '     * size of the linked list.',
    '     *',
    '     * @return size of list',
    '     */',
    '    public int size() {',
    '         return ((LinkedList<Var>) getObject()).size();',
    '    } // end size',
    '',
    '    /**',
    '     * Set the value of of a list at the index specified. Note that this is only',
    '     * value if this object is a list and also note that index must be in',
    '     * bounds.',
    '     *',
    '     * @param index the index into which the Var will be inserted',
    '     * @param var the var to insert',
    '     */',
    '    public void set(int index, Var var) {',
    '         ((LinkedList<Var>) getObject()).add(index, var);',
    '    } // end set',
    '',
    '    /**',
    '     * Add all values from one List to another. Both lists are Var objects that',
    '     * contain linked lists.',
    '     *',
    '     * @param var The list to add',
    '     */',
    '    public void addAll(Var var) {',
    '         ((LinkedList<Var>) getObject()).addAll(var.getObjectAsList());',
    '    } // end addAll',
    '',
    '    /**',
    '     * Set the value of the underlying object. Note that the type of Var will be',
    '     * determined when setObject is called.',
    '     *',
    '     * @param val the value to set this Var to',
    '     */',
    '    public void setObject(Object val) {',
    '         this._object = val;',
    '         inferType();',
    '         // make sure each element of List is Var if type is list',
    '         if (_type.equals(Var.Type.LIST)) {',
    '                LinkedList<Var> myList = new LinkedList<>();',
    '                for (Object obj : this.getObjectAsList()) {',
    '                     myList.add(new Var(obj));',
    '                }',
    '                this._object = myList;',
    '         }',
    '    } // end setObject',
    '',
    '    /**',
    '     * Add a new member to a Var that contains a list. If the Var current is not',
    '     * of type "LIST", then this Var will be converted to a list, its current',
    '     * value will then be stored as the first member and this new member added',
    '     * to it.',
    '     *',
    '     * @param member The new member to add to the list',
    '     */',
    '    public void add(Var member) {',
    '         if (_type.equals(Var.Type.LIST)) {',
    '                // already a list',
    '                ((LinkedList<Var>) _object).add(member);',
    '         } else {',
    '                // not current a list, change it',
    '                LinkedList<Var> temp = new LinkedList<>();',
    '                temp.add(new Var(member));',
    '                setObject(temp);',
    '         }',
    '    } // end add',
    '',
    '    /**',
    '     * Increment Object by some value.',
    '     *',
    '     * @param inc The value to increment by',
    '     */',
    '    public void incrementObject(double inc) {',
    '         switch (getType()) {',
    '                case STRING:',
    '                     // has no meaning',
    '                     break;',
    '                case INT:',
    '                     this.setObject((double) (this.getObjectAsInt() + inc));',
    '                     break;',
    '                case DOUBLE:',
    '                     this.setObject((double) (this.getObjectAsDouble() + inc));',
    '                     break;',
    '                case LIST:',
    '                     for (Var myVar : this.getObjectAsList()) {',
    '                            myVar.incrementObject(inc);',
    '                     }',
    '                     break;',
    '                default:',
    '                     // has no meaning',
    '                     break;',
    '         } // end switch',
    '    } // end incrementObject',
    '',
    '    /**',
    '     * Increment Object by some value',
    '     *',
    '     * @param inc The value to increment by',
    '     */',
    '    public void incrementObject(int inc) {',
    '         switch (getType()) {',
    '                case STRING:',
    '                     // has no meaning',
    '                     break;',
    '                case INT:',
    '                     this.setObject((int) (this.getObjectAsInt() + inc));',
    '                     break;',
    '                case DOUBLE:',
    '                     this.setObject((double) (this.getObjectAsDouble() + inc));',
    '                     break;',
    '                case LIST:',
    '                     for (Var myVar : this.getObjectAsList()) {',
    '                            myVar.incrementObject(inc);',
    '                     }',
    '                     break;',
    '                default:',
    '                     // has no meaning',
    '                     break;',
    '         }// end switch',
    '    } // end incrementObject',
    '',
    '    @Override',
    '    public int hashCode() {',
    '         int hash = 5;',
    '         hash = 43 * hash + Objects.hashCode(this._type);',
    '         hash = 43 * hash + Objects.hashCode(this._object);',
    '         return hash;',
    '    }',
    '',
    '    /**',
    '     * Test to see if this object equals another one. This is done by converting',
    '     * both objects to strings and then doing a string compare.',
    '     *',
    '     * @param obj',
    '     * @return',
    '     */',
    '    @Override',
    '    public boolean equals(Object obj) {',
    '         final Var other = Var.valueOf(obj);',
    '         if (getType() == Var.Type.NULL || other.getType() == Var.Type.NULL) {',
    '                return getType().equals(other.getType());',
    '         }',
    '         return this.toString().equals(other.toString());',
    '    } // end equals',
    '',
    '    /**',
    '     * Check to see if this Var is less than some other var.',
    '     *',
    '     * @param var the var to compare to',
    '     * @return true if it is less than',
    '     */',
    '    public boolean lessThan(Var var) {',
    '         switch (getType()) {',
    '                case STRING:',
    '                     return this.getObjectAsString().compareTo(var.getObjectAsString()) < 0;',
    '                case INT:',
    '                     return this.getObjectAsInt() < var.getObjectAsDouble();',
    '                case DOUBLE:',
    '                     return this.getObjectAsDouble() < var.getObjectAsDouble();',
    '                case LIST:',
    '                     if (size() != var.size()) {',
    '                            return false;',
    '                     }',
    '                     if (!var.getType().equals(Var.Type.LIST)) {',
    '                            return false;',
    '                     }',
    '                     int index = 0;',
    '                     for (Var myVar : this.getObjectAsList()) {',
    '                            if (!myVar.lessThan(var.get(index))) {',
    '                                return false;',
    '                            }',
    '                     }',
    '                     return true;',
    '                default:',
    '                     return false;',
    '         }// end switch',
    '    } // end less than',
    '',
    '    /**',
    '     * Check to see if this var is less than or equal to some other var',
    '     *',
    '     * @param var the var to compare to',
    '     * @return true if this is less than or equal to var',
    '     */',
    '    public boolean lessThanOrEqual(Var var) {',
    '         switch (getType()) {',
    '                case STRING:',
    '                     return this.getObjectAsString().compareTo(var.getObjectAsString()) <= 0;',
    '                case INT:',
    '                     return this.getObjectAsInt() <= var.getObjectAsDouble();',
    '                case DOUBLE:',
    '                     return this.getObjectAsDouble() <= var.getObjectAsDouble();',
    '                case LIST:',
    '                     if (size() != var.size()) {',
    '                            return false;',
    '                     }',
    '                     if (!var.getType().equals(Var.Type.LIST)) {',
    '                            return false;',
    '                     }',
    '                     int index = 0;',
    '                     for (Var myVar : this.getObjectAsList()) {',
    '                            if (!myVar.lessThanOrEqual(var.get(index))) {',
    '                                 return false;',
    '                            }',
    '                     }',
    '                     return true;',
    '                case NULL:',
    '                     return (var.getType() == Var.Type.NULL);',
    '                default:',
    '                     return false;',
    '         }// end switch',
    '    } // end lessThanOrEqual',
    '',
    '    /**',
    '     * Check to see if this var is greater than a given var.',
    '     *',
    '     * @param var the var to compare to.',
    '     * @return true if this object is grater than the given var',
    '     */',
    '    public boolean greaterThan(Var var) {',
    '         return var.lessThan(this);',
    '    } // end greaterThan',
    '',
    '    /**',
    '     * Check to see if this var is greater than or equal to a given var',
    '     *',
    '     * @param var the var to compare to',
    '     * @return true if this var is greater than or equal to the given var',
    '     */',
    '    public boolean greaterThanOrEqual(Var var) {',
    '         return var.lessThanOrEqual(this);',
    '    } // end greaterThanOrEqual',
    '',
    '    /**',
    '     * Compare this object\'s value to another',
    '     *',
    '     * @param val the object to compare to',
    '     * @return the value 0 if this is equal to the argument; a value less than 0',
    '     * if this is numerically less than the argument; and a value greater than 0',
    '     * if this is numerically greater than the argument (signed comparison).',
    '     */',
    '    @Override',
    '    public int compareTo(Object val) {',
    '         // only instantiate if val is not instance of Var',
    '         Var var;',
    '         if (val instanceof Var) {',
    '                var = (Var) val;',
    '         } else {',
    '                var = new Var(val);',
    '         }',
    '         switch (getType()) {',
    '                case STRING:',
    '                     return this.getObjectAsString().compareTo(var.getObjectAsString());',
    '                case INT:',
    '                     if (var.getType().equals(Var.Type.INT)) {',
    '                            return ((Integer) this.getObjectAsInt()).compareTo(var.getObjectAsInt());',
    '                     } else {',
    '                            return ((Double) this.getObjectAsDouble()).compareTo(var.getObjectAsDouble());',
    '                     }',
    '                case DOUBLE:',
    '                     return ((Double) this.getObjectAsDouble()).compareTo(var.getObjectAsDouble());',
    '                case LIST:',
    '                     // doesn\'t make sense',
    '                     return Integer.MAX_VALUE;',
    '                default:',
    '                     // doesn\'t make sense',
    '                     return Integer.MAX_VALUE;',
    '         }// end switch',
    '    } // end compareTo',
    '',
    '    /**',
    '     * Convert this Var to a string format.',
    '     *',
    '     * @return the string format of this var',
    '     */',
    '    @Override',
    '    public String toString() {',
    '         switch (getType()) {',
    '                case STRING:',
    '                     return getObject().toString();',
    '                case INT:',
    '                     Integer i = (int) getObject();',
    '                     return i.toString();',
    '                case DOUBLE:',
    '                     Double d = (double) _object;',
    '                     return _formatter.format(d);',
    '                case LIST:',
    '                     LinkedList<Var> ll = (LinkedList) getObject();',
    '                     StringBuilder sb = new StringBuilder();',
    '                     boolean first = true;',
    '                     for (Var v : ll) {',
    '                            if (first) {',
    '                                 first = false;',
    '                                 sb.append("{");',
    '                            } else {',
    '                                 sb.append(", ");',
    '                            }',
    '                            sb.append(v.toString());',
    '                     } // end for each Var',
    '                     sb.append("}");',
    '                     return sb.toString();',
    '                case NULL:',
    '                     return null;',
    '                default:',
    '                     return getObject().toString();',
    '         }// end switch',
    '    } // end toString',
    '',
    '    /**',
    '     * Internal method for inferring the "object type" of this object. When it',
    '     * is done, it sets the private member value of _type. This will be',
    '     * referenced later on when various method calls are made on this object.',
    '     */',
    '    private void inferType() {',
    '         if (_object == null) {',
    '             _type = Type.NULL;',
    '         } else if (_object instanceof Var) {',
    '            Var oldObj = (Var)_object;',
    '            _type = oldObj.getType();',
    '            _object = oldObj.getObject();',
    '         } else if (_object instanceof String) {',
    '                _type = Type.STRING;',
    '         } else {',
    '         // must be a number or a list',
    '                // try to see if its a double',
    '                try {',
    '                     Double d = (double) _object;',
    '                     // it was a double, so keep going',
    '                     _type = Type.DOUBLE;',
    '                } catch (Exception ex) {',
    '                     // not a double, see if it is an integer',
    '                     try {',
    '                            Integer i = (int) _object;',
    '                            // it was an integer',
    '                            _type = Type.INT;',
    '                     } catch (Exception ex2) {',
    '                            // not a double or integer, might be an array',
    '                            if (_object instanceof LinkedList) {',
    '                                 _type = Type.LIST;',
    '                            } else if (_object instanceof List) {',
    '                                 _type = Type.LIST;',
    '                                 _object = new LinkedList<>((List) _object);',
    '                            } else {',
    '                                 _type = Type.UNKNOWN;',
    '                            }',
    '                     } // end not an integer',
    '                } // end not a double',
    '         } // end else not a string',
    '    } // end inferType',
    '',
    '    static double math_sum(Var myList) {',
    '         double sum = 0;',
    '         LinkedList<Var> ll = myList.getObjectAsList();',
    '         for (Var var : ll) {',
    '                sum += var.getObjectAsDouble();',
    '         }',
    '         return sum;',
    '    }',
    '',
    '    static double math_min(Var myList) {',
    '         double min = Double.MAX_VALUE;',
    '         double d;',
    '         LinkedList<Var> ll = myList.getObjectAsList();',
    '         for (Var var : ll) {',
    '                d = var.getObjectAsDouble();',
    '                if (d < min) {',
    '                     min = d;',
    '                }',
    '         }',
    '         return min;',
    '    }',
    '',
    '    static double math_max(Var myList) {',
    '         double max = Double.MIN_VALUE;',
    '         double d;',
    '         LinkedList<Var> ll = myList.getObjectAsList();',
    '         for (Var var : ll) {',
    '                d = var.getObjectAsDouble();',
    '                if (d > max) {',
    '                     max = d;',
    '                }',
    '         }',
    '         return max;',
    '    }',
    '',
    '    static double math_mean(Var myList) {',
    '         return Var.math_sum(myList) / myList.size();',
    '    }',
    '',
    '    static double math_median(Var myList) {',
    '         LinkedList<Var> ll = myList.getObjectAsList();',
    '         Collections.sort(ll);',
    '         int length = myList.size();',
    '         int middle = length / 2;',
    '         if (length % 2 == 1) {',
    '                return ll.get(middle).getObjectAsDouble();',
    '         } else {',
    '                double d1 = ll.get(middle - 1).getObjectAsDouble();',
    '                double d2 = ll.get(middle).getObjectAsDouble();',
    '                return (d1 + d2) / 2.0;',
    '         }',
    '    }',
    '',
    '    static Var math_modes(Var myList) {',
    '         final Var modes = new Var();',
    '         final Map<Double, Double> countMap = new HashMap<Double, Double>();',
    '         double max = -1;',
    '         double d;',
    '         LinkedList<Var> ll = myList.getObjectAsList();',
    '         for (Var var : ll) {',
    '                d = var.getObjectAsDouble();',
    '                double count = 0;',
    '                if (countMap.containsKey(d)) {',
    '                     count = countMap.get(d) + 1;',
    '                } else {',
    '                     count = 1;',
    '                }',
    '                countMap.put(d, count);',
    '                if (count > max) {',
    '                     max = count;',
    '                }',
    '         }',
    '         for (final Map.Entry<Double, Double> tuple : countMap.entrySet()) {',
    '                if (tuple.getValue() == max) {',
    '                     modes.add(Var.valueOf(tuple.getKey().doubleValue()));',
    '                }',
    '         }',
    '         return modes;',
    '    }',
    '',
    '    static double math_standard_deviation(Var myList) {',
    '         double mean = math_mean(myList);',
    '         double size = myList.size();',
    '         double temp = 0;',
    '         double d;',
    '         LinkedList<Var> ll = myList.getObjectAsList();',
    '         for (Var var : ll) {',
    '                d = var.getObjectAsDouble();',
    '                temp += (mean - d) * (mean - d);',
    '         }',
    '         double variance = temp / size;',
    '         return Math.sqrt(variance);',
    '    }',
    '',
    '}'
  ];
    this.classes_['Var'] = VarCode.join('\n')+'\n';
  } else {
    Blockly.Java.addImport('com.extreme.platform.application.Var');
  }
};

Blockly.Java.typeMapping = {
  'Object' : 'Object',
  'Array':   'LinkedList',
  'Map':     'HashMap',
  'Var':     'Var',
  'Boolean': 'Boolean',
  'String':  'String',
  'Colour':  'String',
  'Number':  'double'
};

Blockly.Java.subtypeMapping = {
  'Object' : 'Object',
  'Array':   'LinkedList',
  'Map':     'HashMap',
  'Var':     'Var',
  'Boolean': 'Boolean',
  'String':  'String',
  'Colour':  'String',
  'Number':  'Double'
};

/**
 * Compute the Java declaration for an arbitrary type.
 * @param {string} type Blockly extended Type to make to a Java declaration.
 * @return {string} Java declaration best matching the type.
 */
Blockly.Java.mapType = function(type) {
  var mapType_ = function(typeMapping, typeArray) {
    // If they gave us nothing or somehow called us in error then we want to
    // pretend that the type is a Var
    if (!typeArray || typeArray.length === 0) {
      console.log('Empty type. Using Var');
      typeArray = ['Var'];
    }
    var key = typeArray.shift();
    var type = key;
    if (typeMapping[type]) {
      type = typeMapping[type];
    } else if (Blockly.Blocks[type] && Blockly.Blocks[type].GBPClass ) {
      type = Blockly.Blocks[type].GBPClass;
    } else if (Blockly.VariableTypeEquivalence[type]) {
      // We can use the type as is.
    } else {
      console.log('Unknown type for '+key+' using Var for '+type);
      type = 'Var';
    }

    if (type === 'Var') {
      Blockly.Java.provideVarClass();
    }

    // See if we have any sub elements
    if (typeArray.length > 0) {
      var subType = mapType_(Blockly.Java.subtypeMapping, typeArray);
      type += '<'+subType+">";
    }
    return type;
  }

  var typeArray = null;
  if (type) {
    typeArray = type.split(':');
  }

  return mapType_(this.typeMapping, typeArray);

};

Blockly.Java.setTargetType = function(type) {
  var oldType = this.targetType_;
  this.targetType_ = type;
  return oldType;
};

Blockly.Java.getTargetType = function(type) {
  return this.targetType_;
};

/**
 * Compute the Java declaration for an arbitrary type.
 * @param {!Array<String>} types Array of types to consolidate.
 * @return {string} Java declaration best matching the types.
 */
Blockly.Java.computeJavaType = function(types) {
  // Resolve down the types.  Note that we use Intersection because it also
  // does the work of eliminating duplicates and takes lower level array types
  // and uses the most specific type.  Additionally, any type equivalences
  // are substituted for in this.
  var typeArray = Blockly.Variables.Intersection(types,types);
  // Resolve the array of types down to a single type
  var argType0 = Blockly.Variables.resolveTypes(typeArray);
  // Finally convert the type to a Java declaration.
  return Blockly.Java.mapType(argType0);
};

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.Java.init = function(workspace, imports) {
  // Create a dictionary of definitions to be printed before the code.
  this.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  this.functionNames_ = Object.create(null);
  // Create a dictionary of all the libraries which would be needed
  this.imports_ = Object.create(null);
  // Dictionary of any extra classes to output
  this.classes_ = Object.create(null);
  // Dictionary of all the globals
  this.globals_ = Object.create(null);
  // Start with the defaults that all the code depends on
  for(var i = 0; i < this.needImports_.length; i++) {
    this.addImport(this.needImports_[i]);
  }
  if (!this.variableDB_) {
    this.variableDB_ =
        new Blockly.Names(this.RESERVED_WORDS_);
  } else {
    this.variableDB_.reset();
  }

  var defvars = [];
  Blockly.VariableTypeEquivalence['Colour'] = ['String'];
  var variables = Blockly.Variables.allVariables(workspace);
  this.blocklyTypes_ = Blockly.Variables.allVariablesTypes(workspace);
  // Make sure all the type variables are pushed.  This is because we
  // Don't return the special function parameters in the allVariables list
  for(var name in this.blocklyTypes_) {
      variables.push(name);
  }
  for (var x = 0; x < variables.length; x++) {
    var key = variables[x];
    this.variableTypes_[key] = this.mapType(this.blocklyTypes_[key]);
  }
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Java.finish = function(code) {
  // Convert the definitions dictionary into a list.
  var definitions = {};
  var funcs = [[],[]];
  for (var name in this.definitions_) {
    if (name === 'variables') {
      continue;
    }
    var def = this.definitions_[name];
    var slot = 1;
    // If the call back for the definition is a function we will asssume that
    // it is not static
    if (typeof def !== "function") {
      // Since we have the text for the function, let's figure out if it is
      // static and sort it first.  Just look at the first two words of the
      // function and if it has 'static' we are good
      var head = def.split(" ",3);
      if (goog.array.contains(head, 'static')) {
        slot = 0;
      }
    }
    funcs[slot].push(name);
  }

  // We have all the functions broken into two slots.  So go through in order
  // and get the statics and then the non-statics to output.
  var allDefs = '';

  for(var def in this.globals_) {
    var initializer = '';
    var type = this.GetVariableType(def);
    if (this.globals_[def] != null && this.globals_[def] !== '') {
      initializer = ' = ' + this.globals_[def];
    } else if (type === 'Var') {
      initializer = ' = new Var(0)';
    } else if (type === 'Boolean') {
      initializer = ' = false';
    } else if (type === 'String') {
      initializer = ' = ""';
    }
    var varname = Blockly.Java.variableDB_.getName(def,
        Blockly.Variables.NAME_TYPE);
    allDefs += 'protected ' + type + ' ' + varname + initializer + ';\n';
  }

  for(var slot = 0; slot < 2; slot++) {
    var names = funcs[slot].sort();
    for (var pos = 0; pos < names.length; pos++) {
      var def = this.definitions_[names[pos]];
      if (typeof def === "function") {
        def = def.call(this);
      }

      // Figure out the header to put on the function
      var header = '';
      var res1 = def.split("(", 2);
      if ((res1.length >= 2) && (res1[0].indexOf(";") ===-1)) {
        // Figure out the header to put on the function
        var header = '/**\n' +
                     ' * Description goes here\n';
        var extra =  ' *\n';
        var res = res1[0];  // Get everything before the (
        var res2 = res.split(" ");
        var rettype = res2[res2.length-2]; // The next to the last word
        res = res1[1];  // Take the parameters after the (
        res2 = res.split(")",1);
        res = res2[0].trim();
        if (res !== '') {
          var args = res.split(",");
          for (var arg = 0; arg < args.length; arg++) {
            var argline = args[arg].split(" ");
            header += extra + ' * @param ' + argline[argline.length-1] + '\n';
            extra = '';
          }
        }
        if (rettype !== 'void' && rettype !== 'public') {
          header += extra + ' * @return ' + rettype + '\n';
          extra = '';
        }
        header += ' */\n';
      }

      allDefs += header + def + '\n\n';
    }
  }
  // Clean up temporary data.
  delete Blockly.Java.definitions_;
  delete Blockly.Java.functionNames_;
  Blockly.Java.variableDB_.reset();
  return allDefs.replace(/\n\n+/g, '\n\n').replace(/\n*$/, '\n\n\n') + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Java.scrubNakedValue = function(line) {
  return line + ';\n';
};

/**
 * Encode a string as a properly escaped Java string, complete with quotes.
 * @param {string} string Text to encode.
 * @return {string} Java string.
 * @private
 */
Blockly.Java.quote_ = function(string) {
  return goog.string.quote(string);
};

/**
 * Generate code to treat an item as a string.  If it is numeric, quote it
 * if it is a string already, do nothing.  Otherwise use the blocklyToString
 * function at runtime.
 * @param {!Blockly.Block} block The block containing the input.
 * @param {string} name The name of the input.
 * @return {string} Generated Java code or '' if no blocks are connected or the
 *     specified input does not exist.
 */


Blockly.Java.toStringCode = function(block,name) {
  var targetBlock = block.getInputTargetBlock(name);
  if (!targetBlock) {
    return '';
  }
  var item = Blockly.Java.valueToCode(block,name,Blockly.Java.ORDER_NONE);
  item = item.trim();

  // Empty strings and quoted strings are perfectly fine as they are
  if (item !== '' && item.charAt(0) !== '"') {
    if ((targetBlock.type === 'variables_get') &&
      (Blockly.Java.GetVariableType(targetBlock.procedurePrefix_+
      targetBlock.getFieldValue('VAR')) === 'Var')) {
      item += '.toString()';
    } else if (Blockly.isNumber(item)) {
      // Pure numbers get quoted
      item = '"' + item + '"';
    } else if(targetBlock.type !== 'variables_get' &&
      Blockly.Java.GetVariableType(item) === 'Var') {
      item = item + '.toString()';
    } else {
      // It is something else so we need to convert it on the fly
      this.addImport('java.text.DecimalFormat');
      this.addImport('java.text.NumberFormat');

      var functionName = this.provideFunction_(
          'blocklyToString',
         [ 'public static String blocklyToString(Object object) {',
           '    String result;',
           '    if (object instanceof String) {',
           '        result = (String) object;',
           '    } else {',
           '        // must be a number',
           '        // might be a double',
           '        try {',
           '            Double d = (double) object;',
           '            // it was a double, so keep going',
           '            NumberFormat formatter = new DecimalFormat("#.#####");',
           '            result = formatter.format(d);',
           '',
           '        } catch (Exception ex) {',
           '            // not a double, see if it is an integer',
           '            try {',
           '                Integer i = (int) object;',
           '                // format should be number with a decimal point',
           '                result = i.toString();',
           '            } catch (Exception ex2) {',
           '                // not a double or integer',
           '                result = "UNKNOWN";',
           '            }',
           '        }',
           '    }',
           '',
           '  return result;',
           '}'
          ]);
      item = functionName + '(' + item + ')';
    }
  }
  return item;
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
  var postFix = this.POSTFIX;
  this.POSTFIX = '';
  var extraIndent = this.EXTRAINDENT;
  this.EXTRAINDENT = '';
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = this.blockToCode(nextBlock, parms);
  if (extraIndent != '') {
    nextCode = this.prefixLines(nextCode, extraIndent);
  }
  return commentCode + code + nextCode + postFix;
};
