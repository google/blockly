/* eslint-disable */

// JS block def.
Blockly.Blocks['test1'] = {
  mutationToDom: function() {

  },
  domToMutation: function(mutation) {

  },
}

// JS block def with string keys.
Blockly.Blocks['test3'] = {
  'mutationToDom': function() {

  },
  'domToMutation': function(mutation) {

  },
};

      // Weird indentation.
     Blockly.Blocks['test4'] = {
       'mutationToDom': function() {

       },
       'domToMutation': function(mutation) {

       },
     };

// JS mutator def.
const mutator = {
  mutationToDom: function() {

  },
  domToMutation: function(mutation) {

  },
};

// JS mutator def with string keys.
const mutator2 = {
  'mutationToDom': function() {

  },
  'domToMutation': function(mutation) {

  },
};

// JS block-class def.
class Es6Class {
  constructor() {}

  mutationToDom() {

  }

  domToMutation(mutation) {

  }
}

// Typescript block-class def.
class TypeScriptClass {
  mutationToDom(): Element {

  }

  domToMutation(el: Element) {

  }
}

// Typescript object literal def.
Blockly.Blocks['typescript_obj_literal']: Whatever = {
  mutationToDom: function(this: Whatever): Element {

  },
  domToMutation: function(this: Whatever, el: Element): {

  }
}

// Prototype based field def
Blockly.CustomField.prototype.toXml = function(fieldElement) {

};

Blockly.CustomField.prototype.fromXml = function(fieldElement) {

};

// Class based field def
class CustomField extends Field {
  constructor() {}

  toXml(fieldElement) {

  }

  fromXml(fieldElement) {

  }
}

// Typescript field def
class CustomField extends Field {
  constructor() {}

  toXml(fieldElement: Element): Element {

  }

  fromXml(fieldElement: Element) {

  }
}


/**** Missed Cases ****/

// JS Block def that points to other def.
Blockly.Bocks['test2'] = {
  mutationToDom: Blockly.Blocks['text_prompt_ext'].mutationToDom,
  domToMutation: Blockly.Blocks['text_prompt_ext'].domToMutation
}

// Typescript interface definition.
interface Whatever {
  mutationToDom(this: Whatever): () => Element,
  domtoMutation(this: Whatever): (Element) => void,
}