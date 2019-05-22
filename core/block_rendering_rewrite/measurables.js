goog.provide('Blockly.BlockRendering.Measurable');

/**
 * The base class to represent a part of a block that takes up space during
 * rendering.  The constructor for each non-spacer Measurable records the size
 * of the block element (e.g. field, statement input).
 * @package
 * @constructor
 */
Blockly.BlockRendering.Measurable = function() {
  this.isInput = false;
  this.width = 0;
  this.height = 0;
  this.type = null;

  this.xPos = 0;
  this.centerline = 0;
};

// TODO: We may remove these helper functions if all of them end up being direct
// checks against types.

/**
 * Whether this stores information about a field.
 * @return {boolean} True if this object stores information about a field.
 * @package
 */
Blockly.BlockRendering.Measurable.prototype.isField = function() {
  return this.type == 'field';
};

/**
 * Whether this stores information about a hat.
 * @return {boolean} True if this object stores information about a hat.
 * @package
 */
Blockly.BlockRendering.Measurable.prototype.isHat = function() {
  return this.type == 'hat';
};

/**
 * Whether this stores information about an icon.
 * @return {boolean} True if this object stores information about an icon.
 * @package
 */
Blockly.BlockRendering.Measurable.prototype.isIcon = function() {
  return this.type == 'icon';
};

/**
 * Whether this stores information about a spacer.
 * @return {boolean} True if this object stores information about a spacer.
 * @package
 */
Blockly.BlockRendering.Measurable.prototype.isSpacer = function() {
  return this.type == 'between-row spacer' || this.type == 'in-row spacer';
};

/**
 * Whether this stores information about an external input.
 * @return {boolean} True if this object stores information about an external
 * input.
 * @package
 */
Blockly.BlockRendering.Measurable.prototype.isExternalInput = function() {
  return this.type == 'external value input';
};

/**
 * Whether this stores information about a inline input.
 * @return {boolean} True if this object stores information about a inline
 * input.
 * @package
 */
Blockly.BlockRendering.Measurable.prototype.isInlineInput = function() {
  return this.type == 'inline input';
};

/**
 * Whether this stores information about a statement input.
 * @return {boolean} True if this object stores information about a statement
 * input.
 * @package
 */
Blockly.BlockRendering.Measurable.prototype.isStatementInput = function() {
  return this.type == 'statement input';
};

/**
 * Whether this stores information about a previous connection.
 * @return {boolean} True if this object stores information about a previous
 * connection.
 * @package
 */
Blockly.BlockRendering.Measurable.prototype.isPreviousConnection = function() {
  return this.type == 'previous connection';
};

/**
 * Whether this stores information about a next connection.
 * @return {boolean} True if this object stores information about an next
 * connection.
 * @package
 */
Blockly.BlockRendering.Measurable.prototype.isNextConnection = function() {
  return this.type == 'next connection';
};

/**
 * Whether this stores information about a rounded corner.
 * @return {boolean} True if this object stores information about an rounded
 * corner.
 * @package
 */
Blockly.BlockRendering.Measurable.prototype.isRoundedCorner = function() {
  return this.type == 'round corner';
};

/**
 * Whether this stores information about a square corner.
 * @return {boolean} True if this object stores information about an square
 * corner.
 * @package
 */
Blockly.BlockRendering.Measurable.prototype.isSquareCorner = function() {
  return this.type == 'square corner';
};
/**
 * The base class to represent an input that takes up space on a block
 * during rendering
 * @param {!Blockly.Input} input The input to measure and store information for.
 * @package
 * @constructor
 */
Blockly.BlockRendering.Input = function(input) {
  Blockly.BlockRendering.Input.superClass_.constructor.call(this);

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
goog.inherits(Blockly.BlockRendering.Input, Blockly.BlockRendering.Measurable);


/**
 * An object containing information about the space an icon takes up during
 * rendering
 * @param {!Blockly.Icon} icon The icon to measure and store information for.
 * @package
 * @constructor
 */
Blockly.BlockRendering.Icon = function(icon) {
  Blockly.BlockRendering.Icon.superClass_.constructor.call(this);
  this.icon = icon;
  this.isVisible = icon.isVisible();
  this.type = 'icon';

  this.height = 16;
  this.width = 16;
};
goog.inherits(Blockly.BlockRendering.Icon, Blockly.BlockRendering.Measurable);

/**
 * An object containing information about the space a field takes up during
 * rendering
 * @param {!Blockly.Field} field The field to measure and store information for.
 * @package
 * @constructor
 */
Blockly.BlockRendering.Field = function(field) {
  Blockly.BlockRendering.Field.superClass_.constructor.call(this);
  this.field = field;
  this.isEditable = field.isCurrentlyEditable();
  this.type = 'field';

  var size = this.field.getCorrectedSize();
  this.height = size.height;
  this.width = size.width;
};
goog.inherits(Blockly.BlockRendering.Field, Blockly.BlockRendering.Measurable);

/**
 * An object containing information about the space an inline input takes up
 * during rendering
 * @param {!Blockly.Input} input The inline input to measure and store
 *     information for.
 * @package
 * @constructor
 */
Blockly.BlockRendering.InlineInput = function(input) {
  Blockly.BlockRendering.InlineInput.superClass_.constructor.call(this, input);
  this.type = 'inline input';

  if (!this.connectedBlock) {
    this.height = 26;
    this.width = 22;
  } else {
    this.width = this.connectedBlockWidth + BRC.TAB_WIDTH + 1;
    this.height = this.connectedBlockHeight + 2;
  }
};
goog.inherits(Blockly.BlockRendering.InlineInput, Blockly.BlockRendering.Input);

/**
 * An object containing information about the space a statement input takes up
 * during rendering
 * @param {!Blockly.Input} input The statement input to measure and store
 *     information for.
 * @package
 * @constructor
 */
Blockly.BlockRendering.StatementInput = function(input) {
  Blockly.BlockRendering.StatementInput.superClass_.constructor.call(this, input);
  this.type = 'statement input';

  if (!this.connectedBlock) {
    this.height = 24;
    this.width = 32;
  } else {
    this.width = 25;
    this.height = this.connectedBlockHeight + BRC.STATEMENT_BOTTOM_SPACER;
    if (this.connectedBlock.nextConnection) {
      this.height -= BRC.NOTCH_HEIGHT;
    }
  }
};
goog.inherits(Blockly.BlockRendering.StatementInput,
    Blockly.BlockRendering.Input);

/**
 * An object containing information about the space an external value input
 * takes up during rendering
 * @param {!Blockly.Input} input The external value input to measure and store
 *     information for.
 * @package
 * @constructor
 */
Blockly.BlockRendering.ExternalValueInput = function(input) {
  Blockly.BlockRendering.ExternalValueInput.superClass_.constructor.call(this, input);
  this.type = 'external value input';

  if (!this.connectedBlock) {
    this.height = 15;
  } else {
    this.height = this.connectedBlockHeight - 2 * BRC.TAB_OFFSET_FROM_TOP;
  }
  this.width = 10;
};
goog.inherits(Blockly.BlockRendering.ExternalValueInput,
    Blockly.BlockRendering.Input);

/**
 * An object containing information about the space a previous connection takes
 * up during rendering.
 * @package
 * @constructor
 */
Blockly.BlockRendering.PreviousConnection = function() {
  Blockly.BlockRendering.PreviousConnection.superClass_.constructor.call(this);
  this.type = 'previous connection';
  this.height = BRC.NOTCH_HEIGHT;
  this.width = BRC.NOTCH_WIDTH;

};
goog.inherits(Blockly.BlockRendering.PreviousConnection, Blockly.BlockRendering.Measurable);

/**
 * An object containing information about the space a next connection takes
 * up during rendering.
 * @package
 * @constructor
 */
Blockly.BlockRendering.NextConnection = function() {
  Blockly.BlockRendering.NextConnection.superClass_.constructor.call(this);
  this.type = 'next connection';
  this.height = BRC.NOTCH_HEIGHT;
  this.width = BRC.NOTCH_WIDTH;
};
goog.inherits(Blockly.BlockRendering.NextConnection, Blockly.BlockRendering.Measurable);

/**
 * An object containing information about the space a hat takes up during
 * rendering.
 * @package
 * @constructor
 */
Blockly.BlockRendering.Hat = function() {
  Blockly.BlockRendering.Hat.superClass_.constructor.call(this);
  this.type = 'hat';
  this.height = BRC.NO_PADDING;
  this.width = BRC.START_HAT_WIDTH;

};
goog.inherits(Blockly.BlockRendering.Hat, Blockly.BlockRendering.Measurable);

/**
 * An object containing information about the space a square corner takes up
 * during rendering.
 * @package
 * @constructor
 */
Blockly.BlockRendering.SquareCorner = function() {
  Blockly.BlockRendering.SquareCorner.superClass_.constructor.call(this);
  this.type = 'square corner';
  this.height = BRC.NOTCH_HEIGHT;
  this.width = BRC.NO_PADDING;

};
goog.inherits(Blockly.BlockRendering.SquareCorner, Blockly.BlockRendering.Measurable);

/**
 * An object containing information about the space a rounded corner takes up
 * during rendering.
 * @package
 * @constructor
 */
Blockly.BlockRendering.RoundCorner = function() {
  Blockly.BlockRendering.RoundCorner.superClass_.constructor.call(this);
  this.type = 'round corner';
  this.width = BRC.CORNER_RADIUS;
  // The rounded corner extends into the next row by 4 so we only take the
  // height that is aligned with this row.
  this.height = BRC.NOTCH_HEIGHT;

};
goog.inherits(Blockly.BlockRendering.RoundCorner, Blockly.BlockRendering.Measurable);


Blockly.BlockRendering.Row = function() {
  this.type = 'row';
  this.yPos = 0;
  this.elements = [];
  this.width = 0;
  this.height = 0;

  this.hasExternalInput = false;
  this.hasStatement = false;
  this.hasInlineInput = false;
};

Blockly.BlockRendering.Row.prototype.isSpacer = function() {
  return false;
};

Blockly.BlockRendering.Row.prototype.measure = function() {
  var connectedBlockWidths = 0;
  for (var e = 0; e < this.elements.length; e++) {
    var elem = this.elements[e];
    this.width += elem.width;
    if (elem.isInput &&
        (elem.type == 'statement input' || elem.type == 'external value input')) {
      connectedBlockWidths += elem.connectedBlockWidth;
    }
    if (!(elem.isSpacer())) {
      this.height = Math.max(this.height, elem.height);
    }
  }
  this.widthWithConnectedBlocks = this.width + connectedBlockWidths;
};

Blockly.BlockRendering.Row.prototype.getLastInput = function() {
  // There's always a spacer after the last input, unless there are no inputs.
  if (this.elements.length > 1) {
    var elem = this.elements[this.elements.length - 2];
    if (!elem.isInput) {
      return null;
    }
    return elem;
  }
  // Return null if there are no inputs.
  return null;
};

Blockly.BlockRendering.Row.prototype.getFirstSpacer = function() {
  return this.elements[0];
};

Blockly.BlockRendering.Row.prototype.getLastSpacer = function() {
  return this.elements[this.elements.length - 1];
};

Blockly.BlockRendering.BetweenRowSpacer = function(height, width) {
  this.type = 'between-row spacer';
  this.width = width;
  this.height = height;
};
goog.inherits(Blockly.BlockRendering.BetweenRowSpacer,
    Blockly.BlockRendering.Measurable);

Blockly.BlockRendering.InRowSpacer = function(width) {
  this.type = 'in-row spacer';
  this.width = width;
  this.height = BRC.SPACER_DEFAULT_HEIGHT;
};
goog.inherits(Blockly.BlockRendering.InRowSpacer,
    Blockly.BlockRendering.Measurable);

/**
 * An object containing information about what elements are in the top row of a
 * block as well as spacing information for the top row.
 * Elements in a top row can consist of corners, hats and previous connections.
 * @param {[type]} block [description]
 * @package
 */
Blockly.BlockRendering.TopRow = function(block) {
  Blockly.BlockRendering.TopRow.superClass_.constructor.call(this);

  this.elements = [];
  this.type = 'top row';

  this.hasPreviousConnection = !!block.previousConnection;
  this.connection = block.previousConnection;

  var precedesStatement = block.inputList.length &&
      block.inputList[0].type == Blockly.NEXT_STATEMENT;

  // This is the minimum height for the row. If one of its elements has a greater
  // height it will be overwritten in the compute pass.
  if (precedesStatement) {
    this.height = BRC.LARGE_PADDING;
  } else {
    this.height = BRC.MEDIUM_PADDING;
  }
};
goog.inherits(Blockly.BlockRendering.TopRow, Blockly.BlockRendering.Row);


Blockly.BlockRendering.TopRow.prototype.isSpacer = function() {
  return true;
};

Blockly.BlockRendering.BottomRow = function(block) {
  Blockly.BlockRendering.BottomRow.superClass_.constructor.call(this);
  this.type = 'bottom row';
  this.hasNextConnection = !!block.nextConnection;
  this.connection = block.nextConnection;

  var followsStatement =
      block.inputList.length &&
      block.inputList[block.inputList.length - 1].type == Blockly.NEXT_STATEMENT;

  // This is the minimum height for the row. If one of it's elements has a greater
  // height it will be overwritten in the compute pass.
  if (followsStatement) {
    this.height = BRC.LARGE_PADDING;
  } else {
    this.height = BRC.NOTCH_HEIGHT;
  }

};
goog.inherits(Blockly.BlockRendering.BottomRow,
    Blockly.BlockRendering.Row);

Blockly.BlockRendering.BottomRow.prototype.isSpacer = function() {
  return true;
};
