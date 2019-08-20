
goog.provide('Blockly.blockRendering.Input');
goog.provide('Blockly.blockRendering.InRowSpacer');

goog.require('Blockly.blockRendering.constants');
goog.require('Blockly.blockRendering.Measurable');


/**
 * The base class to represent an input that takes up space on a block
 * during rendering
 * @param {!Blockly.Input} input The input to measure and store information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.Input = function(input) {
  Blockly.blockRendering.Input.superClass_.constructor.call(this);

  this.isInput = true;
  this.input = input;
  this.align = input.align;
  this.connectedBlock = input.connection && input.connection.targetBlock() ?
      input.connection.targetBlock() : null;

  if (this.connectedBlock) {
    var bBox = this.connectedBlock.getHeightWidth();
    this.connectedBlockWidth = bBox.width;
    this.connectedBlockHeight = bBox.height;
  } else {
    this.connectedBlockWidth = 0;
    this.connectedBlockHeight = 0;
  }

  this.connection = input.connection;
  this.connectionOffsetX = 0;
  this.connectionOffsetY = 0;
};
goog.inherits(Blockly.blockRendering.Input, Blockly.blockRendering.Measurable);


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
  this.type = 'icon';

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
  this.type = 'jagged edge';
  this.height = Blockly.blockRendering.constants.JAGGED_TEETH.height;
  this.width = Blockly.blockRendering.constants.JAGGED_TEETH.width;
};
goog.inherits(Blockly.blockRendering.JaggedEdge, Blockly.blockRendering.Measurable);


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
  this.type = 'field';

  var size = this.field.getSize();
  this.height = size.height;
  this.width = size.width;
  this.parentInput = parentInput;
};
goog.inherits(Blockly.blockRendering.Field, Blockly.blockRendering.Measurable);

/**
 * An object containing information about the space an inline input takes up
 * during rendering
 * @param {!Blockly.Input} input The inline input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Input}
 */
Blockly.blockRendering.InlineInput = function(input) {
  Blockly.blockRendering.InlineInput.superClass_.constructor.call(this, input);
  this.type = 'inline input';

  if (!this.connectedBlock) {
    this.height = Blockly.blockRendering.constants.EMPTY_INLINE_INPUT_HEIGHT;
    this.width = this.connectionShape.width +
        Blockly.blockRendering.constants.EMPTY_INLINE_INPUT_PADDING;
  } else {
    // We allow the dark path to show on the parent block so that the child
    // block looks embossed.  This takes up an extra pixel in both x and y.
    this.width = this.connectedBlockWidth +
        Blockly.blockRendering.constants.DARK_PATH_OFFSET;
    this.height = this.connectedBlockHeight + Blockly.blockRendering.constants.DARK_PATH_OFFSET;
  }

  this.connectionOffsetY = Blockly.blockRendering.constants.TAB_OFFSET_FROM_TOP;
  this.connectionHeight = this.connectionShape.height;
  this.connectionWidth = this.connectionShape.width;
};
goog.inherits(Blockly.blockRendering.InlineInput, Blockly.blockRendering.Input);

/**
 * An object containing information about the space a statement input takes up
 * during rendering
 * @param {!Blockly.Input} input The statement input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Input}
 */
Blockly.blockRendering.StatementInput = function(input) {
  Blockly.blockRendering.StatementInput.superClass_.constructor.call(this, input);
  this.type = 'statement input';

  if (!this.connectedBlock) {
    this.height = Blockly.blockRendering.constants.EMPTY_STATEMENT_INPUT_HEIGHT;
  } else {
    this.height =
        this.connectedBlockHeight + Blockly.blockRendering.constants.STATEMENT_BOTTOM_SPACER;
    if (this.connectedBlock.nextConnection) {
      this.height -= this.notchShape.height;
    }
  }
  this.width = Blockly.blockRendering.constants.NOTCH_OFFSET_LEFT +
      this.notchShape.width;
};
goog.inherits(Blockly.blockRendering.StatementInput,
    Blockly.blockRendering.Input);

/**
 * An object containing information about the space an external value input
 * takes up during rendering
 * @param {!Blockly.Input} input The external value input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Input}
 */
Blockly.blockRendering.ExternalValueInput = function(input) {
  Blockly.blockRendering.ExternalValueInput.superClass_.constructor.call(this, input);
  this.type = 'external value input';

  if (!this.connectedBlock) {
    this.height = this.connectionShape.height;
  } else {
    this.height =
        this.connectedBlockHeight - 2 * Blockly.blockRendering.constants.TAB_OFFSET_FROM_TOP;
  }
  this.width = this.connectionShape.width +
      Blockly.blockRendering.constants.EXTERNAL_VALUE_INPUT_PADDING;

  this.connectionOffsetY = Blockly.blockRendering.constants.TAB_OFFSET_FROM_TOP;
  this.connectionHeight = this.connectionShape.height;
  this.connectionWidth = this.connectionShape.width;
};
goog.inherits(Blockly.blockRendering.ExternalValueInput,
    Blockly.blockRendering.Input);

/**
 * An object containing information about the space a hat takes up during
 * rendering.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.Hat = function() {
  Blockly.blockRendering.Hat.superClass_.constructor.call(this);
  this.type = 'hat';
  this.height = Blockly.blockRendering.constants.START_HAT.height;
  this.width = Blockly.blockRendering.constants.START_HAT.width;
  this.startY = this.height;

};
goog.inherits(Blockly.blockRendering.Hat, Blockly.blockRendering.Measurable);

/**
 * An object containing information about the space a square corner takes up
 * during rendering.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.SquareCorner = function() {
  Blockly.blockRendering.SquareCorner.superClass_.constructor.call(this);
  this.type = 'square corner';
  this.height = this.notchShape.height;
  this.width = Blockly.blockRendering.constants.NO_PADDING;

};
goog.inherits(Blockly.blockRendering.SquareCorner, Blockly.blockRendering.Measurable);

/**
 * An object containing information about the space a rounded corner takes up
 * during rendering.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.RoundCorner = function() {
  Blockly.blockRendering.RoundCorner.superClass_.constructor.call(this);
  this.type = 'round corner';
  this.width = Blockly.blockRendering.constants.CORNER_RADIUS;
  // The rounded corner extends into the next row by 4 so we only take the
  // height that is aligned with this row.
  this.height = this.notchShape.height;

};
goog.inherits(Blockly.blockRendering.RoundCorner, Blockly.blockRendering.Measurable);

/**
 * An object containing information about a spacer between two elements on a
 * row.
 * @param {number} width The width of the spacer.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.InRowSpacer = function(width) {
  this.type = 'in-row spacer';
  this.width = width;
  this.height = Blockly.blockRendering.constants.SPACER_DEFAULT_HEIGHT;
};
goog.inherits(Blockly.blockRendering.InRowSpacer,
    Blockly.blockRendering.Measurable);

