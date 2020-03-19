/**
 * @fileoverview Actions/Face blocks for Fable Blockly.
 *
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Blocks.actionFace'); // Deprecated
goog.provide('Blockly.Constants.ActionFace');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Blocks.Definitions');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.Mutator');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldLabel');

Blockly.Blocks.fable_set_face_focus = {
  /**
     * Block for setting the direction at which the eyes of Fable Face look towards.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.eyeIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_FACE_SET_FOCUS);

    this.appendValueInput('POS_X')
      .appendField('X: ')
      .setCheck('Number');

    this.appendValueInput('POS_Y')
      .appendField('Y: ')
      .setCheck('Number');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_FACE_SET_FOCUS_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_FACE_SET_FOCUS,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_FACE}'
    ];

    var toolboxKeywords = [

    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_face_focus', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_set_face_emotion = {
  /**
     * Block for setting face emotion.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.eyeIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image)
      .appendField(Blockly.Msg.FABLE_FACE_SET_EMOTION);

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.EMOTION_NEUTRAL, '\'Neutral\''],
        [Blockly.Msg.EMOTION_HAPPY, '\'Happy\''],
        [Blockly.Msg.EMOTION_SAD, '\'Sad\''],
        [Blockly.Msg.EMOTION_ANGRY, '\'Angry\''],
        [Blockly.Msg.EMOTION_TIRED, '\'Tired\''],
        [Blockly.Msg.EMOTION_SURPRISED, '\'Surprised\''],
        [Blockly.Msg.EMOTION_FEAR, '\'Fear\''],
        [Blockly.Msg.EMOTION_DISGUST, '\'Disgust\'']]),
      'EMOTION_ID');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_FACE_SET_EMOTION_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_FACE_SET_EMOTION,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_FACE}'
    ];

    var toolboxKeywords = [
      Blockly.Msg.EMOTION_NEUTRAL,
      Blockly.Msg.EMOTION_HAPPY,
      Blockly.Msg.EMOTION_SAD,
      Blockly.Msg.EMOTION_ANGRY,
      Blockly.Msg.EMOTION_TIRED,
      Blockly.Msg.EMOTION_SURPRISED,
      Blockly.Msg.EMOTION_FEAR,
      Blockly.Msg.EMOTION_DISGUST
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_face_emotion', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_set_face_animation = {
  /**
     * Block for setting face animation.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.eyeIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image)
      .appendField(Blockly.Msg.FABLE_FACE_SET_ANIMATION);

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.EMOTION_LAUGH, '\'Laugh\''],
        [Blockly.Msg.EMOTION_TALK, '\'Talk\''],
        [Blockly.Msg.EMOTION_HAPPY_SURPRISED, '\'HappySurprised\''],
        [Blockly.Msg.EMOTION_SHOCK_CRY, '\'ShockCry\''],
        [Blockly.Msg.EMOTION_RAGE, '\'Rage\''],
        [Blockly.Msg.EMOTION_SLEEP, '\'Sleep\'']]),
      'EMOTION_ID');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_FACE_SET_ANIMATION_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_FACE_SET_ANIMATION,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_FACE}'
    ];

    var toolboxKeywords = [
      Blockly.Msg.EMOTION_LAUGH,
      Blockly.Msg.EMOTION_TALK,
      Blockly.Msg.EMOTION_HAPPY_SURPRISED,
      Blockly.Msg.EMOTION_SHOCK_CRY,
      Blockly.Msg.EMOTION_RAGE,
      Blockly.Msg.EMOTION_SLEEP
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_face_animation', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_blend_face_emotion = {
  /**
     * Block for blending two face expressions.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.eyeIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image)
      .appendField(Blockly.Msg.FABLE_FACE_BLEND_EMOTION);

    var second = Blockly.Msg.FABLE_FACE_BLEND_SECOND;
    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.EMOTION_NEUTRAL, '\'Neutral\''],
        [Blockly.Msg.EMOTION_HAPPY, '\'Happy\''],
        [Blockly.Msg.EMOTION_SAD, '\'Sad\''],
        [Blockly.Msg.EMOTION_ANGRY, '\'Angry\''],
        [Blockly.Msg.EMOTION_TIRED, '\'Tired\''],
        [Blockly.Msg.EMOTION_SURPRISED, '\'Surprised\''],
        [Blockly.Msg.EMOTION_FEAR, '\'Fear\''],
        [Blockly.Msg.EMOTION_DISGUST, '\'Disgust\''],
        [Blockly.Msg.EMOTION_LAUGH, '\'Laugh\''],
        [Blockly.Msg.EMOTION_TALK, '\'Talk\''],
        [Blockly.Msg.EMOTION_HAPPY_SURPRISED, '\'HappySurprised\''],
        [Blockly.Msg.EMOTION_SHOCK_CRY, '\'ShockCry\''],
        [Blockly.Msg.EMOTION_RAGE, '\'Rage\''],
        [Blockly.Msg.EMOTION_SLEEP, '\'Sleep\'']]),
      'FIRST_ID');

    this.appendDummyInput()
      .appendField(second)
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.EMOTION_NEUTRAL, '\'Neutral\''],
        [Blockly.Msg.EMOTION_HAPPY, '\'Happy\''],
        [Blockly.Msg.EMOTION_SAD, '\'Sad\''],
        [Blockly.Msg.EMOTION_ANGRY, '\'Angry\''],
        [Blockly.Msg.EMOTION_TIRED, '\'Tired\''],
        [Blockly.Msg.EMOTION_SURPRISED, '\'Surprised\''],
        [Blockly.Msg.EMOTION_FEAR, '\'Fear\''],
        [Blockly.Msg.EMOTION_DISGUST, '\'Disgust\''],
        [Blockly.Msg.EMOTION_LAUGH, '\'Laugh\''],
        [Blockly.Msg.EMOTION_TALK, '\'Talk\''],
        [Blockly.Msg.EMOTION_HAPPY_SURPRISED, '\'HappySurprised\''],
        [Blockly.Msg.EMOTION_SHOCK_CRY, '\'ShockCry\''],
        [Blockly.Msg.EMOTION_RAGE, '\'Rage\''],
        [Blockly.Msg.EMOTION_SLEEP, '\'Sleep\'']]),
      'SECOND_ID');

    this.appendValueInput('RATIO')
      .appendField(Blockly.Msg.FABLE_COLOR_RATIO)
      .setCheck('Number');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_FACE_BLEND_EMOTION_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_FACE_BLEND_EMOTION,
      Blockly.Msg.FABLE_FACE_BLEND_SECOND,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_FACE}'
    ];

    var toolboxKeywords = [
      Blockly.Msg.EMOTION_NEUTRAL,
      Blockly.Msg.EMOTION_HAPPY,
      Blockly.Msg.EMOTION_SAD,
      Blockly.Msg.EMOTION_ANGRY,
      Blockly.Msg.EMOTION_TIRED,
      Blockly.Msg.EMOTION_SURPRISED,
      Blockly.Msg.EMOTION_FEAR,
      Blockly.Msg.EMOTION_DISGUST,
      Blockly.Msg.EMOTION_LAUGH,
      Blockly.Msg.EMOTION_TALK,
      Blockly.Msg.EMOTION_HAPPY_SURPRISED,
      Blockly.Msg.EMOTION_SHOCK_CRY,
      Blockly.Msg.EMOTION_RAGE,
      Blockly.Msg.EMOTION_SLEEP
    ];

    Blockly.Search.preprocessSearchKeywords('fable_blend_face_emotion', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_set_eyes_color = {
  /**
     * Block for setting eye color. Conjoint block for iris and eyelids.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.eyeIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image)
      .appendField(Blockly.Msg.FABLE_FACE_SET_EYES_COLOR);

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.FABLE_FACE_SET_IRIS_COLOR, '\'Iris\''],
        [Blockly.Msg.FABLE_FACE_SET_EYELID_COLOR, '\'Eyelid\'']]),
      'TARGET');

    this.appendValueInput('COLOUR')
      .setCheck('Colour');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_FACE_SET_EYES_COLOR_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_FACE_SET_EYES_COLOR,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_FACE}'
    ];

    var toolboxKeywords = [
      Blockly.Msg.FABLE_FACE_SET_IRIS_COLOR,
      Blockly.Msg.FABLE_FACE_SET_EYELID_COLOR,
      '%{BKY_COLORS}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_eyes_color', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_face_vibrate = {
  /**
     * Block for making phone vibrate.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.eyeIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image)
      .appendField(Blockly.Msg.FABLE_FACE_VIBRATE);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_FACE_VIBRATE_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_FACE_VIBRATE,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_FACE}'
    ];

    var toolboxKeywords = [

    ];

    Blockly.Search.preprocessSearchKeywords('fable_face_vibrate', keywords, toolboxKeywords);
  }
};
