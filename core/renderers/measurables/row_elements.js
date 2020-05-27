/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing elements in a row of a rendered
 * block.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.provide('Blockly.blockRendering.Field');
goog.provide('Blockly.blockRendering.Hat');
goog.provide('Blockly.blockRendering.Icon');
goog.provide('Blockly.blockRendering.InRowSpacer');
goog.provide('Blockly.blockRendering.JaggedEdge');
goog.provide('Blockly.blockRendering.RoundCorner');
goog.provide('Blockly.blockRendering.SquareCorner');

goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');


/**
 * An object containing information about the space an icon takes up during
 * rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.Icon} icon The icon to measure and store information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.Icon = function(constants, icon) {
  Blockly.blockRendering.Icon.superClass_.constructor.call(this, constants);
  this.icon = icon;
  this.isVisible = icon.isVisible();
  this.type |= Blockly.blockRendering.Types.ICON;

  var size = icon.getCorrectedSize();
  this.height = size.height;
  this.width = size.width;
};
Blockly.utils.object.inherits(Blockly.blockRendering.Icon,
    Blockly.blockRendering.Measurable);

/**
 * An object containing information about the jagged edge of a collapsed block
 * takes up during rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.JaggedEdge = function(constants) {
  Blockly.blockRendering.JaggedEdge.superClass_.constructor.call(
      this, constants);
  this.type |= Blockly.blockRendering.Types.JAGGED_EDGE;
  this.height = this.constants_.JAGGED_TEETH.height;
  this.width = this.constants_.JAGGED_TEETH.width;
};
Blockly.utils.object.inherits(Blockly.blockRendering.JaggedEdge,
    Blockly.blockRendering.Measurable);


/**
 * An object containing information about the space a field takes up during
 * rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.Field} field The field to measure and store information for.
 * @param {!Blockly.Input} parentInput The parent input for the field.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.Field = function(constants, field, parentInput) {
  Blockly.blockRendering.Field.superClass_.constructor.call(this, constants);
  this.field = field;
  this.isEditable = field.EDITABLE;
  this.flipRtl = field.getFlipRtl();
  this.type |= Blockly.blockRendering.Types.FIELD;

  var size = this.field.getSize();
  this.height = size.height;
  this.width = size.width;
  this.parentInput = parentInput;
};
Blockly.utils.object.inherits(Blockly.blockRendering.Field,
    Blockly.blockRendering.Measurable);

/**
 * An object containing information about the space a hat takes up during
 * rendering.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.Hat = function(constants) {
  Blockly.blockRendering.Hat.superClass_.constructor.call(this, constants);
  this.type |= Blockly.blockRendering.Types.HAT;
  this.height = this.constants_.START_HAT.height;
  this.width = this.constants_.START_HAT.width;
  this.ascenderHeight = this.height;

};
Blockly.utils.object.inherits(Blockly.blockRendering.Hat,
    Blockly.blockRendering.Measurable);

/**
 * An object containing information about the space a square corner takes up
 * during rendering.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {string=} opt_position The position of this corner.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.SquareCorner = function(constants, opt_position) {
  Blockly.blockRendering.SquareCorner.superClass_.constructor.call(this,
      constants);
  this.type = ((!opt_position || opt_position == 'left') ?
      Blockly.blockRendering.Types.LEFT_SQUARE_CORNER :
      Blockly.blockRendering.Types.RIGHT_SQUARE_CORNER) |
          Blockly.blockRendering.Types.CORNER;
  this.height = this.constants_.NO_PADDING;
  this.width = this.constants_.NO_PADDING;

};
Blockly.utils.object.inherits(Blockly.blockRendering.SquareCorner,
    Blockly.blockRendering.Measurable);

/**
 * An object containing information about the space a rounded corner takes up
 * during rendering.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {string=} opt_position The position of this corner.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.RoundCorner = function(constants, opt_position) {
  Blockly.blockRendering.RoundCorner.superClass_.constructor.call(this,
      constants);
  this.type = ((!opt_position || opt_position == 'left') ?
      Blockly.blockRendering.Types.LEFT_ROUND_CORNER :
      Blockly.blockRendering.Types.RIGHT_ROUND_CORNER) |
          Blockly.blockRendering.Types.CORNER;
  this.width = this.constants_.CORNER_RADIUS;
  // The rounded corner extends into the next row by 4 so we only take the
  // height that is aligned with this row.
  this.height = this.constants_.CORNER_RADIUS / 2;

};
Blockly.utils.object.inherits(Blockly.blockRendering.RoundCorner,
    Blockly.blockRendering.Measurable);

/**
 * An object containing information about a spacer between two elements on a
 * row.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {number} width The width of the spacer.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.InRowSpacer = function(constants, width) {
  Blockly.blockRendering.InRowSpacer.superClass_.constructor.call(this,
      constants);
  this.type |= Blockly.blockRendering.Types.SPACER |
      Blockly.blockRendering.Types.IN_ROW_SPACER;
  this.width = width;
  this.height = this.constants_.SPACER_DEFAULT_HEIGHT;
};
Blockly.utils.object.inherits(Blockly.blockRendering.InRowSpacer,
    Blockly.blockRendering.Measurable);

