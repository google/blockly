'use strict';

goog.provide('Blockly.Styles.HighContrast');

goog.require('Blockly.Style');

var defaultBlockStyles = {
  "colour":{
    "primaryColour": "#a52714",
    "secondaryColour":"#FBE1DD",
    "tertiaryColour":"#FBE1DD"
  },
  "lists": {
    "primaryColour": "#4a148c",
    "secondaryColour":"#CDB6E9",
    "tertiaryColour":"#CDB6E9"
  },
  "logic": {
    "primaryColour": "#01579b",
    "secondaryColour":"#C5EAFF",
    "tertiaryColour":"#C5EAFF"
  },
  "loops": {
    "primaryColour": "#33691e",
    "secondaryColour":"#E1FFD7",
    "tertiaryColour":"#E1FFD7"
  },
  "math": {
    "primaryColour": "#1a237e",
    "secondaryColour":"#DCE2FF",
    "tertiaryColour":"#DCE2FF"
  },
  "procedure": {
    "primaryColour": "#006064",
    "secondaryColour":"#CFECEE",
    "tertiaryColour":"#CFECEE"
  },
  "text": {
    "primaryColour": "#004d40",
    "secondaryColour":"#D2FFDD",
    "tertiaryColour":"#D2FFDD"
  },
  "variables": {
    "primaryColour": "#880e4f",
    "secondaryColour":"#FFD4EB",
    "tertiaryColour":"#FFD4EB"
  },
  "variables_dynamic": {
    "primaryColour": "#880e4f",
    "secondaryColour":"#FFD4EB",
    "tertiaryColour":"#FFD4EB"
  }
};



Blockly.Styles.HighContrast = new Blockly.Style(defaultBlockStyles);
