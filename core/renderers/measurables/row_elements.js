
goog.provide('Blockly.blockRendering.Field');
goog.provide('Blockly.blockRendering.Hat');
goog.provide('Blockly.blockRendering.Icon');
goog.provide('Blockly.blockRendering.InRowSpacer');
goog.provide('Blockly.blockRendering.JaggedEdge');
goog.provide('Blockly.blockRendering.RoundCorner');
goog.provide('Blockly.blockRendering.SquareCorner');
goog.require('Blockly.blockRendering.Types');

goog.require('Blockly.blockRendering.Measurable');

/**
 * An object containing information about the space an icon takes up during
 * rendering
 * @param {!Blockly.Icon} icon The icon to measure and store information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.Icon = function(icon) {
  Blockly.blockRendering.Icon.superClass_.constructor.call(this);
  this.icon = icon;
  this.isVisible = icon.isVisible();
  this.type = Blockly.blockRendering.Types.ICON;

  var size = icon.getCorrectedSize();
  this.height = size.height;
  this.width = size.width;
};
goog.inherits(Blockly.blockRendering.Icon, Blockly.blockRendering.Measurable);

/**
 * An object containing information about the jagged edge of a collapsed block
 * takes up during rendering
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.JaggedEdge = function() {
  Blockly.blockRendering.JaggedEdge.superClass_.constructor.call(this);
  this.type = Blockly.blockRendering.Types.JAGGED_EDGE;
  this.height = this.constants_.JAGGED_TEETH.height;
  this.width = this.constants_.JAGGED_TEETH.width;
};
goog.inherits(Blockly.blockRendering.JaggedEdge,
    Blockly.blockRendering.Measurable);


/**
 * An object containing information about the space a field takes up during
 * rendering
 * @param {!Blockly.Field} field The field to measure and store information for.
 * @param {!Blockly.Input} parentInput The parent input for the field.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.Field = function(field, parentInput) {
  Blockly.blockRendering.Field.superClass_.constructor.call(this);
  this.field = field;
  this.isEditable = field.isCurrentlyEditable();
  this.flipRtl = field instanceof Blockly.FieldImage && field.getFlipRtl();
  this.type = Blockly.blockRendering.Types.FIELD;

  var size = this.field.getSize();
  this.height = size.height;
  this.width = size.width;
  this.parentInput = parentInput;
};
goog.inherits(Blockly.blockRendering.Field, Blockly.blockRendering.Measurable);

/**
 * An object containing information about the space a hat takes up during
 * rendering.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.Hat = function() {
  Blockly.blockRendering.Hat.superClass_.constructor.call(this);
  this.type = Blockly.blockRendering.Types.HAT;
  this.height = this.constants_.START_HAT.height;
  this.width = this.constants_.START_HAT.width;
  this.startY = this.height;

};
goog.inherits(Blockly.blockRendering.Hat, Blockly.blockRendering.Measurable);

/**
 * An object containing information about the space a square corner takes up
 * during rendering.
 * @param {string=} opt_position The position of this corner.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.SquareCorner = function(opt_position) {
  Blockly.blockRendering.SquareCorner.superClass_.constructor.call(this);
  this.type = ((!opt_position || opt_position == 'left') ?
      Blockly.blockRendering.Types.LEFT_SQUARE_CORNER :
      Blockly.blockRendering.Types.RIGHT_SQUARE_CORNER) |
          Blockly.blockRendering.Types.CORNER;
  this.height = this.constants_.NOTCH.height;
  this.width = this.constants_.NO_PADDING;

};
goog.inherits(Blockly.blockRendering.SquareCorner,
    Blockly.blockRendering.Measurable);

/**
 * An object containing information about the space a rounded corner takes up
 * during rendering.
 * @param {string=} opt_position The position of this corner.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.RoundCorner = function(opt_position) {
  Blockly.blockRendering.RoundCorner.superClass_.constructor.call(this);
  this.type = ((!opt_position || opt_position == 'left') ?
      Blockly.blockRendering.Types.LEFT_ROUND_CORNER :
      Blockly.blockRendering.Types.RIGHT_ROUND_CORNER) |
          Blockly.blockRendering.Types.CORNER;
  this.width = this.constants_.CORNER_RADIUS;
  // The rounded corner extends into the next row by 4 so we only take the
  // height that is aligned with this row.
  this.height = this.constants_.NOTCH.height;

};
goog.inherits(Blockly.blockRendering.RoundCorner,
    Blockly.blockRendering.Measurable);

/**
 * An object containing information about a spacer between two elements on a
 * row.
 * @param {number} width The width of the spacer.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.InRowSpacer = function(width) {
  Blockly.blockRendering.InRowSpacer.superClass_.constructor.call(this);
  this.type = Blockly.blockRendering.Types.SPACER |
      Blockly.blockRendering.Types.IN_ROW_SPACER;
  this.width = width;
  this.height = this.constants_.SPACER_DEFAULT_HEIGHT;
};
goog.inherits(Blockly.blockRendering.InRowSpacer,
    Blockly.blockRendering.Measurable);

