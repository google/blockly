/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Saving and restoring the state of a JS-Intepreter.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';


// Constructors for objects within Acorn.
var NODE_CONSTRUCTOR;
var NODE_LOC_CONSTRUCTOR;
var LINE_LOC_CONSTRUCTOR;

function recordAcornConstructons(interpreter) {
  // Constructors for objects within Acorn.
  NODE_CONSTRUCTOR = interpreter.ast.constructor;
  NODE_LOC_CONSTRUCTOR = interpreter.ast.loc &&
      interpreter.ast.loc.constructor;
  LINE_LOC_CONSTRUCTOR = interpreter.ast.loc &&
      interpreter.ast.loc.end.constructor;
}

function deserialize(json, interpreter) {
  function decodeValue(value) {
    if (value && typeof value === 'object') {
      var data;
      if ((data = value['#'])) {
       // Object reference: {'#': 42}
       value = objectList[data];
        if (!value) {
          throw ReferenceError('Object reference not found: ' + data);
        }
        return value;
      }
      if ((data = value['Number'])) {
        // Special number: {'Number': 'Infinity'}
        return Number(data);
      }
      if ((data = value['Value'])) {
        // Special value: {'Value': 'undefined'}
        if (value['Value'] === 'undefined') {
          return undefined;
        }
      }
    }
    return value;
  }
  var stack = interpreter.getStateStack();
  if (!Array.isArray(json)) {
    throw TypeError('Top-level JSON is not a list.');
  }
  if (!stack.length) {
    // Require native functions to be present.
    throw Error('Interpreter must be initialized prior to deserialization.');
  }
  recordAcornConstructons(interpreter);
  var LOC_REGEX = /^(\d*):(\d*)-(\d*):(\d*) ?(.*)$/;
  // Find all native functions in existing interpreter.
  var objectList = [];
  objectHunt_(stack, objectList);
  var functionHash = Object.create(null);
  for (var i = 0; i < objectList.length; i++) {
    if (typeof objectList[i] === 'function') {
      functionHash[objectList[i].id] = objectList[i];
    }
  }
  // First pass: Create object stubs for every object.
  objectList = [];
  for (var i = 0; i < json.length; i++) {
    var jsonObj = json[i];
    var obj;
    switch (jsonObj['type']) {
      case 'Map':
        obj = Object.create(null);
        break;
      case 'Object':
        obj = {};
        break;
      case 'ScopeReference':
        obj = Interpreter.SCOPE_REFERENCE;
        break;
      case 'Function':
        obj = functionHash[jsonObj['id']];
        if (!obj) {
          throw RangeError('Function ID not found: ' + jsonObj['id']);
        }
        break;
      case 'Array':
        // Currently we assume that Arrays are not sparse.
        obj = [];
        break;
      case 'Date':
        obj = new Date(jsonObj['data']);
        if (isNaN(obj)) {
          throw TypeError('Invalid date: ' + jsonObj['data']);
        }
        break;
      case 'RegExp':
        obj = RegExp(jsonObj['source'], jsonObj['flags']);
        break;
      case 'PseudoObject':
        obj = new Interpreter.Object(null);
        break;
      case 'Scope':
        obj = new Interpreter.Scope(undefined, undefined, undefined);
        break;
      case 'State':
        obj = new Interpreter.State(undefined, undefined);
        break;
      case 'Node':
        obj = new NODE_CONSTRUCTOR();
        delete obj.start;
        delete obj.end;
        var locText = jsonObj['loc'];
        if (locText) {
          var loc = new NODE_LOC_CONSTRUCTOR();
          var m = locText.match(LOC_REGEX);
          var locStart = null;
          if (m[1] || m[2]) {
            locStart = new LINE_LOC_CONSTRUCTOR();
            locStart.line = Number(m[1]);
            locStart.column = Number(m[2]);
          }
          loc.start = locStart;
          var locEnd = null;
          if (m[3] || m[4]) {
            locEnd = new LINE_LOC_CONSTRUCTOR();
            locEnd.line = Number(m[3]);
            locEnd.column = Number(m[4]);
          }
          loc.end = locEnd;
          if (m[5]) {
            loc.source = decodeURI(m[5]);
          } else {
            delete loc.source;
          }
          obj.loc = loc;
        }
        break;
      default:
        throw TypeError('Unknown type: ' + jsonObj['type']);
    }
    objectList[i] = obj;
  }
  // Second pass: Populate properties for every object.
  for (var i = 0; i < json.length; i++) {
    var jsonObj = json[i];
    var obj = objectList[i];
    // Repopulate objects.
    var props = jsonObj['props'];
    if (props) {
      var nonConfigurable = jsonObj['nonConfigurable'] || [];
      var nonEnumerable = jsonObj['nonEnumerable'] || [];
      var nonWritable = jsonObj['nonWritable'] || [];
      var getter = jsonObj['getter'] || [];
      var setter = jsonObj['setter'] || [];
      var names = Object.getOwnPropertyNames(props);
      for (var j = 0; j < names.length; j++) {
        var name = names[j];
        var descriptor = {
          configurable: nonConfigurable.indexOf(name) === -1,
          enumerable: nonEnumerable.indexOf(name) === -1
        };
        var hasGetter = getter.indexOf(name) !== -1;
        var hasSetter = setter.indexOf(name) !== -1;
        if (hasGetter || hasSetter) {
          if (hasGetter) {
            descriptor.get = interpreter.setProperty.placeholderGet_;
          }
          if (hasSetter) {
            descriptor.set = interpreter.setProperty.placeholderSet_;
          }
        } else {
          descriptor.value = decodeValue(props[name]);
          descriptor.writable = nonWritable.indexOf(name) === -1;
        }
        Object.defineProperty(obj, name, descriptor);
      }
    }
    // Repopulate arrays.
    if (Array.isArray(obj)) {
      var data = jsonObj['data'];
      if (data) {
        for (var j = 0; j < data.length; j++) {
          obj.push(decodeValue(data[j]));
        }
      }
    }
  }
  // First object is the interpreter.
  var root = objectList[0];
  for (var prop in root) {
    interpreter[prop] = root[prop];
  }
}

function serialize(interpreter) {
  function encodeValue(value) {
    if (value && (typeof value === 'object' || typeof value === 'function')) {
      var ref = objectList.indexOf(value);
      if (ref === -1) {
        throw RangeError('Object not found in table.');
      }
      return {'#': ref};
    }
    if (value === undefined) {
      return {'Value': 'undefined'};
    }
    if (typeof value === 'number') {
      if (value === Infinity) {
        return {'Number': 'Infinity'};
      } else if (value === -Infinity) {
        return {'Number': '-Infinity'};
      } else if (isNaN(value)) {
        return {'Number': 'NaN'};
      } else if (1 / value === -Infinity) {
        return {'Number': '-0'};
      }
    }
    return value;
  }
  // Shallow-copy all properties of interest onto a root object.
  var properties = [
    'OBJECT', 'OBJECT_PROTO',
    'FUNCTION', 'FUNCTION_PROTO',
    'ARRAY', 'ARRAY_PROTO',
    'REGEXP', 'REGEXP_PROTO',
    'BOOLEAN',
    'DATE',
    'NUMBER',
    'STRING',
    'ERROR',
    'EVAL_ERROR',
    'RANGE_ERROR',
    'REFERENCE_ERROR',
    'SYNTAX_ERROR',
    'TYPE_ERROR',
    'URI_ERROR',
    'globalScope',
    'globalObject',
    'stateStack'
  ];
  var root = Object.create(null);
  for (var i = 0; i < properties.length; i++) {
    root[properties[i]] = interpreter[properties[i]];
  }

  recordAcornConstructons(interpreter);
  // Find all objects.
  var objectList = [];
  objectHunt_(root, objectList);
  // Serialize every object.
  var json = [];
  for (var i = 0; i < objectList.length; i++) {
    var jsonObj = Object.create(null);
    json.push(jsonObj);
    var obj = objectList[i];
    // Uncomment this line for a debugging label.
    //jsonObj['#'] = i;
    switch (Object.getPrototypeOf(obj)) {
      case null:
        jsonObj['type'] = 'Map';
        break;
      case Object.prototype:
        if (obj === Interpreter.SCOPE_REFERENCE) {
          jsonObj['type'] = 'ScopeReference';
          continue;  // No need to index properties.
        } else {
          jsonObj['type'] = 'Object';
        }
        break;
      case Function.prototype:
        jsonObj['type'] = 'Function';
        jsonObj['id'] = obj.id;
        if (obj.id === undefined) {
          throw Error('Native function has no ID: ' + obj);
        }
        continue;  // No need to index properties.
      case Array.prototype:
        // Currently we assume that Arrays are not sparse.
        jsonObj['type'] = 'Array';
        if (obj.length) {
          jsonObj['data'] = obj.map(encodeValue);
        }
        continue;  // No need to index properties.
      case Date.prototype:
        jsonObj['type'] = 'Date';
        jsonObj['data'] = obj.toJSON();
        continue;  // No need to index properties.
      case RegExp.prototype:
        jsonObj['type'] = 'RegExp';
        jsonObj['source'] = obj.source;
        jsonObj['flags'] = obj.flags;
        continue;  // No need to index properties.
      case Interpreter.Object.prototype:
        jsonObj['type'] = 'PseudoObject';
        break;
      case Interpreter.Scope.prototype:
        jsonObj['type'] = 'Scope';
        break;
      case Interpreter.State.prototype:
        jsonObj['type'] = 'State';
        break;
      case NODE_CONSTRUCTOR.prototype:
        jsonObj['type'] = 'Node';
        break;
      default:
        throw TypeError('Unknown type: ' + obj);
    }
    var props = Object.create(null);
    var nonConfigurable = [];
    var nonEnumerable = [];
    var nonWritable = [];
    var getter = [];
    var setter = [];
    var names = Object.getOwnPropertyNames(obj);
    for (var j = 0; j < names.length; j++) {
      var name = names[j];
      if (jsonObj['type'] === 'Node' && name === 'loc') {
        // Compactly serialize the location objects on a Node.
        var loc = obj.loc;
        var locText = '';
        if (loc.start) {
          locText += loc.start.line + ':' + loc.start.column;
        } else {
          locText += ':';
        }
        locText += '-';
        if (loc.end) {
          locText += loc.end.line + ':' + loc.end.column;
        } else {
          locText += ':';
        }
        if (loc.source !== undefined) {
          locText += ' ' + encodeURI(loc.source);
        }
        jsonObj['loc'] = locText;
      } else {
        var descriptor = Object.getOwnPropertyDescriptor(obj, name);
        props[name] = encodeValue(descriptor.value);
        if (!descriptor.configurable) {
          nonConfigurable.push(name);
        }
        if (!descriptor.enumerable) {
          nonEnumerable.push(name);
        }
        if (!descriptor.writable) {
          nonWritable.push(name);
        }
        if (descriptor.get) {
          getter.push(name);
        }
        if (descriptor.set) {
          setter.push(name);
        }
      }
    }
    if (names.length) {
      jsonObj['props'] = props;
    }
    if (nonConfigurable.length) {
      jsonObj['nonConfigurable'] = nonConfigurable;
    }
    if (nonEnumerable.length) {
      jsonObj['nonEnumerable'] = nonEnumerable;
    }
    if (nonWritable.length) {
      jsonObj['nonWritable'] = nonWritable;
    }
    if (getter.length) {
      jsonObj['getter'] = getter;
    }
    if (setter.length) {
      jsonObj['setter'] = setter;
    }
  }
  return json;
}

// Recursively search the stack to find all non-primitives.
function objectHunt_(node, objectList) {
  if (node && (typeof node === 'object' || typeof node === 'function')) {
    if (objectList.indexOf(node) !== -1) {
      return;
    }
    objectList.push(node);
    if (typeof node === 'object') {  // Recurse.
      var isAcornNode = Object.getPrototypeOf(node) === NODE_CONSTRUCTOR.prototype;
      var names = Object.getOwnPropertyNames(node);
      for (var i = 0; i < names.length; i++) {
        if (isAcornNode && names[i] === 'loc') {
          continue;  // Skip over node locations, they are specially handled.
        }
        try {
          objectHunt_(node[names[i]], objectList);
        } catch (e) {
          // Accessing some properties may trigger a placeholder getter.
          // Squelch this error, but re-throw any others.
          if (e.message !== 'Placeholder getter') {
            throw e;
          }
        }
      }
    }
  }
}
