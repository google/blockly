'use strict';

goog.provide('Blockly.Styles.Classic');

goog.require('Blockly.Style');

var defaultBlockStyles = {
  "colour":{
    "primaryColour": "20"
  },
  "lists": {
    "primaryColour": "260"
  },
  "logic": {
    "primaryColour": "210"
  },
  "loops": {
    "primaryColour": "120"
  },
  "math": {
    "primaryColour": "230"
  },
  "procedures": {
    "primaryColour": "290"
  },
  "text": {
    "primaryColour": "160"
  },
  "variables": {
    "primaryColour": "330"
  },
  "variables_dynamic":{
    "primaryColour": "310"
  }
};

Blockly.Styles.Classic = new Blockly.Style(defaultBlockStyles);
