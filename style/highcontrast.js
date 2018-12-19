'use strict';

goog.provide('Blockly.Styles.HighContrast');

goog.require('Blockly.Style');

var defaultBlockStyles = {
  "colour":{
    "primaryColour": "#a52714",
    "secondaryColour":"#FB9B8C",
    "tertiaryColour":"#FBE1DD"
  },
  "lists": {
    "primaryColour": "#4a148c",
    "secondaryColour":"#AD7BE9",
    "tertiaryColour":"#CDB6E9"
  },
  "logic": {
    "primaryColour": "#01579b",
    "secondaryColour":"#64C7FF",
    "tertiaryColour":"#C5EAFF"
  },
  "loops": {
    "primaryColour": "#33691e",
    "secondaryColour":"#9AFF78",
    "tertiaryColour":"#E1FFD7"
  },
  "math": {
    "primaryColour": "#1a237e",
    "secondaryColour":"#8A9EFF",
    "tertiaryColour":"#DCE2FF"
  },
  "procedure": {
    "primaryColour": "#006064",
    "secondaryColour":"#77E6EE",
    "tertiaryColour":"#CFECEE"
  },
  "text": {
    "primaryColour": "#004d40",
    "secondaryColour":"#5ae27c",
    "tertiaryColour":"#D2FFDD"
  },
  "variables": {
    "primaryColour": "#880e4f",
    "secondaryColour":"#FF73BE",
    "tertiaryColour":"#FFD4EB"
  },
  "variables_dynamic": {
    "primaryColour": "#880e4f",
    "secondaryColour":"#FF73BE",
    "tertiaryColour":"#FFD4EB"
  }
};



Blockly.Styles.HighContrast = new Blockly.Style(defaultBlockStyles);
