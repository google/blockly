/* eslint-disable */

// JS block def.
Blockly.Blocks['test1'] = {
  mutationToDom: function() {

  },
  saveExtraState: function() {
    return Blockly.Xml.domToText(this.mutationToDom());
  },
  domToMutation: function(mutation) {

  },
  loadExtraState: function(state) {
    return this.domToMutation(Blockly.Xml.textToDom(state));
  },
}

// JS block def with string keys.
Blockly.Blocks['test3'] = {
  'mutationToDom': function() {

  },
  'saveExtraState': function() {
    return Blockly.Xml.domToText(this.mutationToDom());
  },
  'domToMutation': function(mutation) {

  },
  'loadExtraState': function(state) {
    return this.domToMutation(Blockly.Xml.textToDom(state));
  },
};

      // Weird indentation.
     Blockly.Blocks['test4'] = {
       'mutationToDom': function() {

       },
       'saveExtraState': function() {
         return Blockly.Xml.domToText(this.mutationToDom());
       },
       'domToMutation': function(mutation) {

       },
       'loadExtraState': function(state) {
         return this.domToMutation(Blockly.Xml.textToDom(state));
       },
     };

// JS mutator def.
const mutator = {
  mutationToDom: function() {

  },
  saveExtraState: function() {
    return Blockly.Xml.domToText(this.mutationToDom());
  },
  domToMutation: function(mutation) {

  },
  loadExtraState: function(state) {
    return this.domToMutation(Blockly.Xml.textToDom(state));
  },
};

// JS mutator def with string keys.
const mutator2 = {
  'mutationToDom': function() {

  },
  'saveExtraState': function() {
    return Blockly.Xml.domToText(this.mutationToDom());
  },
  'domToMutation': function(mutation) {

  },
  'loadExtraState': function(state) {
    return this.domToMutation(Blockly.Xml.textToDom(state));
  },
};

// JS block-class def.
class Es6Class {
  constructor() {}

  mutationToDom() {

  }
  saveExtraState() {
    return Blockly.Xml.domToText(this.mutationToDom());
  }

  domToMutation(mutation) {

  }
  loadExtraState(state) {
    return this.domToMutation(Blockly.Xml.textToDom(state));
  }
}

// Typescript block-class def.
class TypeScriptClass {
  mutationToDom(): Element {

  }
  saveExtraState(): string {
    return Blockly.Xml.domToText(this.mutationToDom());
  }

  domToMutation(el: Element) {

  }
  loadExtraState(state: string) {
    return this.domToMutation(Blockly.Xml.textToDom(state));
  }
}

// Typescript object literal def.
Blockly.Blocks['typescript_obj_literal']: Whatever = {
  mutationToDom: function(this: Whatever): Element {

  },
  saveExtraState: function(this: Whatever): string {
    return Blockly.Xml.domToText(this.mutationToDom());
  },
  domToMutation: function(this: Whatever, el: Element): {

  }
  loadExtraState: function(this: Whatever, state: string) {
    return this.domToMutation(Blockly.Xml.textToDom(state));
  }
}

// Prototype based field def
Blockly.CustomField.prototype.toXml = function(fieldElement) {

};
Blockly.CustomField.prototype.saveState = function() {
  var elem = Blockly.utils.xml.createElement("field");
  elem.setAttribute("name", this.name || '');
  return Blockly.Xml.domToText(this.toXml(elem));
};

Blockly.CustomField.prototype.fromXml = function(fieldElement) {

};
Blockly.CustomField.prototype.loadState = function(state) {
  this.fromXml(Blockly.Xml.textToDom(state));
};

// Class based field def
class CustomField extends Field {
  constructor() {}

  toXml(fieldElement) {

  }
  saveState() {
    var elem = Blockly.utils.xml.createElement("field");
    elem.setAttribute("name", this.name || '');
    return Blockly.Xml.domToText(this.toXml(elem));
  }

  fromXml(fieldElement) {

  }
  loadState(state) {
    this.fromXml(Blockly.Xml.textToDom(state));
  }
}

// Typescript field def
class CustomField extends Field {
  constructor() {}

  toXml(fieldElement: Element): Element {

  }
  saveState(): string {
    var elem = Blockly.utils.xml.createElement("field");
    elem.setAttribute("name", this.name || '');
    return Blockly.Xml.domToText(this.toXml(elem));
  }

  fromXml(fieldElement: Element) {

  }
  loadState(state: string) {
    this.fromXml(Blockly.Xml.textToDom(state));
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