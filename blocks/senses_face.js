/**
 * @fileoverview Senses/Face blocks for Fable Blockly.
 *
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Blocks.sensesFace'); // Deprecated
goog.provide('Blockly.Constants.SensesFace');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Blocks.Definitions');
goog.require('Blockly.Mutator');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldLabel');

Blockly.Blocks.fable_read_face_sensor = {
  /**
     * Block for getting sensor data from the Face module.
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
      .appendField(Blockly.Msg.FACE_READ_SENSOR);

    // Those were removed per request of the Sales team. Only commenting out, not removing implementation.
    // [Blockly.Msg.FACE_USER_ACCELERATION_X, '\'userAccelerationX\''],
    // [Blockly.Msg.FACE_USER_ACCELERATION_Y, '\'userAccelerationY\''],
    // [Blockly.Msg.FACE_USER_ACCELERATION_Z, '\'userAccelerationZ\''],
    // [Blockly.Msg.FACE_SCREEN_ORIENTATION, '\'screenOrientation\''],

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.FACE_ACCELERATION_X, '\'accelerationX\''],
        [Blockly.Msg.FACE_ACCELERATION_Y, '\'accelerationY\''],
        [Blockly.Msg.FACE_ACCELERATION_Z, '\'accelerationZ\''],
        [Blockly.Msg.FACE_COMPASS, '\'compass\''],
        [Blockly.Msg.FACE_TOUCH_COUNT, '\'touchCount\''],
        [Blockly.Msg.FACE_TOUCH_POSITION_X, '\'touchPositionX\''],
        [Blockly.Msg.FACE_TOUCH_POSITION_Y, '\'touchPositionY\''],
        [Blockly.Msg.FACE_TOUCH_PRESSURE, '\'touchPressure\''],
        [Blockly.Msg.LATITUDE, '\'geolocationLatitude\''],
        [Blockly.Msg.LONGITUDE, '\'geolocationLongitude\''],
        [Blockly.Msg.ALTITUDE, '\'geolocationAltitude\'']]),
      'METRIC');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);

    var thisBlock = this;
    this.setTooltip(function () {
      var sensor = thisBlock.getFieldValue('METRIC');
      var TOOLTIPS = {
        '\'accelerationX\'': Blockly.Msg.FACE_ACCELERATION_X_TOOLTIP,
        '\'accelerationY\'': Blockly.Msg.FACE_ACCELERATION_Y_TOOLTIP,
        '\'accelerationZ\'': Blockly.Msg.FACE_ACCELERATION_Z_TOOLTIP,
        '\'compass\'': Blockly.Msg.FACE_COMPASS_TOOLTIP,
        '\'touchCount\'': Blockly.Msg.FACE_TOUCH_COUNT_TOOLTIP,
        '\'touchPositionX\'': Blockly.Msg.FACE_TOUCH_POSITION_X_TOOLTIP,
        '\'touchPositionY\'': Blockly.Msg.FACE_TOUCH_POSITION_Y_TOOLTIP,
        '\'touchPressure\'': Blockly.Msg.FACE_TOUCH_PRESSURE_TOOLTIP,
        '\'geolocationLatitude\'': Blockly.Msg.LATITTUDE_TOOLTIP,
        '\'geolocationLongitude\'': Blockly.Msg.LONGITUDE_TOOLTIP,
        '\'geolocationAltitude\'': Blockly.Msg.ALTITTUDE_TOOLTIP
      };
      try {
        return TOOLTIPS[sensor];
      } catch (err) {
        return Blockly.Msg.FACE_READ_SENSOR_TOOLTIP;
      }
    });

    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FACE_READ_SENSOR,
      Blockly.Msg.FACE_ACCELERATION_X,
      Blockly.Msg.FACE_ACCELERATION_Y,
      Blockly.Msg.FACE_ACCELERATION_Z,
      Blockly.Msg.FACE_COMPASS,
      Blockly.Msg.FACE_TOUCH_COUNT,
      Blockly.Msg.FACE_TOUCH_POSITION_X,
      Blockly.Msg.FACE_TOUCH_POSITION_Y,
      Blockly.Msg.FACE_TOUCH_PRESSURE,
      Blockly.Msg.LATITUDE,
      Blockly.Msg.LONGITUDE,
      Blockly.Msg.ALTITUDE,
      '%{BKY_INPUT}',
      '%{BKY_LABEL_FACE}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_read_face_sensor', keywords);
  }
};
