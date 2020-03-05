/**
 * @fileoverview Actions/Common blocks for Fable Blockly.
 *
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Blocks.actionsCommon'); // Deprecated
goog.provide('Blockly.Constants.ActionsCommon');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Blocks.Definitions');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.Mutator');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldLabel');

Blockly.Blocks.fable_set_module_rgb = {
  /**
     * Block for rgb value.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.ledIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_SET_COLOR);

    this.appendValueInput('COLOUR')
      .setCheck('Colour');

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_anyNoFace, [['Hub']], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_SET_COLOR_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SET_COLOR,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_COMMON}'
    ];

    var toolboxKeywords = [
      '%{BKY_COLORS}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_module_rgb', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_set_channel_color = {
  /**
     *
     * @this Blockly.Block
     */
  init: function () {
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.ledIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_RECOVER_CHANNEL_COLOR);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_ON_MODULE)
      .appendField(new Blockly.FieldDropdown([['Hub']]), 'MODULE');
    // this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_anyNoFace, [['Hub']], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.FABLE_RECOVER_CHANNEL_COLOR_TOOLTIP);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_RECOVER_CHANNEL_COLOR,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_COMMON}'
    ];

    var toolboxKeywords = [

    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_channel_color', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_speak = {
  /**
     * Block formerly for text-to-speech.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.speakIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_SPEAK);

    this.appendValueInput('INPUT_TEXT');
    // consider a setCheck

    this.getLanguage = function () {
      return localStorage.language; // TODO: Replace with Fable.Data.Local...
    };

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_SPEAK_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPEAK
    ];

    var toolboxKeywords = [
      '%{BKY_FABLE_SEARCH_KEYWORD_TEXT}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_speak', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_speak_lang = {
  /**
     * Block for text-to-speech.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.speakIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_SPEAK);

    this.appendValueInput('INPUT_TEXT');
    // .setCheck('String');

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.LANG_EN, 'en'],
        [Blockly.Msg.LANG_DA, 'da'],
        [Blockly.Msg.LANG_FR, 'fr'],
        [Blockly.Msg.LANG_ES, 'es'],
        [Blockly.Msg.LANG_NL, 'nl'],
        [Blockly.Msg.LANG_IT, 'it'],
        [Blockly.Msg.LANG_DE, 'de'],
        [Blockly.Msg.LANG_RU, 'ru']
      ]), 'LANGUAGE');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_SPEAK_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPEAK,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_COMMON}'
    ];

    var toolboxKeywords = [
      '%{BKY_FABLE_SEARCH_KEYWORD_TEXT}',
      Blockly.Msg.LANG_EN,
      Blockly.Msg.LANG_DA,
      Blockly.Msg.LANG_FR,
      Blockly.Msg.LANG_ES,
      Blockly.Msg.LANG_NL,
      Blockly.Msg.LANG_IT,
      Blockly.Msg.LANG_DE,
      Blockly.Msg.LANG_RU
    ];

    Blockly.Search.preprocessSearchKeywords('fable_speak_lang', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_play_sound = {
  /**
     * Block for playing sounds.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.musicIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    const soundFileDropdown = new Blockly.FieldDropdown(
      [[Blockly.Msg.SOUND_ANGRY, 'angry.wav'],
        ['boing', 'boing.wav'],
        [Blockly.Msg.SOUND_BUZZ, 'buzz.wav'],
        [Blockly.Msg.SOUND_CHIMP, 'chimp.wav'],
        [Blockly.Msg.SOUND_ELEPHANT, 'elephant.wav'],
        [Blockly.Msg.SOUND_DRUM, 'drum.wav'],
        [Blockly.Msg.SOUND_FART_1, 'fart1.wav'],
        [Blockly.Msg.SOUND_FART_2, 'fart2.wav'],
        [Blockly.Msg.SOUND_LAUGH, 'laught.wav'],
        ['pling', 'pling.wav'],
        [Blockly.Msg.SOUND_RUNNING, 'running.wav'],
        [Blockly.Msg.SOUND_THEEND, 'theEnd.wav'],
        [Blockly.Msg.SOUND_TWIRLY, 'twirly.wav'],
        [Blockly.Msg.SOUND_WOOF, 'woof.wav']]);
    soundFileDropdown.setShouldAllowSearch(true);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_PLAY_SOUND)
      .appendField(soundFileDropdown, 'SOUNDFILE');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_ON_MODULE)
      .appendField(new Blockly.FieldDropdown([['PC', 'PC'], ['Face', 'Face']]), 'MODULE');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_PLAY_SOUND_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_PLAY_SOUND,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_COMMON}'
    ];

    var toolboxKeywords = [
      Blockly.Msg.SOUND_ANGRY,
      'boing',
      Blockly.Msg.SOUND_BUZZ,
      Blockly.Msg.SOUND_CHIMP,
      Blockly.Msg.SOUND_ELEPHANT,
      Blockly.Msg.SOUND_DRUM,
      Blockly.Msg.SOUND_FART_1,
      Blockly.Msg.SOUND_FART_2,
      Blockly.Msg.SOUND_LAUGH,
      'pling',
      Blockly.Msg.SOUND_RUNNING,
      Blockly.Msg.SOUND_THEEND,
      Blockly.Msg.SOUND_TWIRLY,
      Blockly.Msg.SOUND_WOOF
    ];

    Blockly.Search.preprocessSearchKeywords('fable_play_sound', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_play_custom_sound = {
  /**
     * Block for playing sounds from the 'My Fable Sounds' folder.
     * @this Blockly.Block
     */
  init: function () {
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.musicIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_PLAY_SOUND_FILE);

    this.appendDynamicFileInput('sound');

    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_PLAY_SOUND_FILE_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_PLAY_SOUND_FILE,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_COMMON}'
    ];

    var toolboxKeywords = [

    ];

    Blockly.Search.preprocessSearchKeywords('fable_play_custom_sound', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_play_note = {
  /**
     * Block for playing a musical note from C4 to C5.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.musicIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_PLAY_NOTE)
      .appendField(new Blockly.FieldDropdown(
        [[Blockly.Msg.FABLE_NOTE_C, 'C4'],
          [Blockly.Msg.FABLE_NOTE_D, 'D4'],
          [Blockly.Msg.FABLE_NOTE_E, 'E4'],
          [Blockly.Msg.FABLE_NOTE_F, 'F4'],
          [Blockly.Msg.FABLE_NOTE_G, 'G4'],
          [Blockly.Msg.FABLE_NOTE_A, 'A5'],
          [Blockly.Msg.FABLE_NOTE_B, 'B5'],
          [Blockly.Msg.FABLE_NOTE_C_HIGH, 'C5']]), 'SOUNDFILE');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_PLAY_NOTE_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_PLAY_NOTE,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_COMMON}'
    ];

    var toolboxKeywords = [
      Blockly.Msg.FABLE_NOTE_C,
      Blockly.Msg.FABLE_NOTE_D,
      Blockly.Msg.FABLE_NOTE_E,
      Blockly.Msg.FABLE_NOTE_F,
      Blockly.Msg.FABLE_NOTE_G,
      Blockly.Msg.FABLE_NOTE_A,
      Blockly.Msg.FABLE_NOTE_B,
      Blockly.Msg.FABLE_NOTE_C_HIGH
    ];

    Blockly.Search.preprocessSearchKeywords('fable_play_note', keywords, toolboxKeywords);
  }
};
