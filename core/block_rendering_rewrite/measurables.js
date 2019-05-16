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

/**
 * Whether this stores information about a field.
 * @return {boolean} True if this object stores information about a field.
 * @package
 */
Blockly.BlockRendering.Measurable.prototype.isField = function() {
  return this.type == 'field';
};

/**
 * Whether this stores information about an icon.
 * @return {boolean} True if this object stores information about an icon.
 * @package
 */
Blockly.BlockRendering.Measurable.prototype.isIcon = function() {
  return this.type == 'icon';
};

Blockly.BlockRendering.Measurable.prototype.isSpacer = function() {
  return this.type == 'between-row spacer' || this.type == 'in-row spacer';
};

/**
 * Whether this stores information about an icon.
 * @return {boolean} True if this object stores information about an icon.
 * @package
 */
Blockly.BlockRendering.Measurable.prototype.isExternalInput = function() {
  return this.type == 'external value input';
};

/**
 * Whether this stores information about an icon.
 * @return {boolean} True if this object stores information about an icon.
 * @package
 */
Blockly.BlockRendering.Measurable.prototype.isInlineInput = function() {
  return this.type == 'inline input';
};

/**
 * Whether this stores information about an icon.
 * @return {boolean} True if this object stores information about an icon.
 * @package
 */
Blockly.BlockRendering.Measurable.prototype.isStatementInput = function() {
  return this.type == 'statement input';
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
  this.renderRect = null;
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
  this.renderRect = null;
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

Blockly.BlockRendering.PreviousConnection = function(width) {
  Blockly.BlockRendering.Icon.superClass_.constructor.call(this);
  this.renderRect = null;
  this.type = 'previous connection';
  //TODO: this could be changed by the precedes statement
  this.height = BRC.MEDIUM_PADDING;
  this.width = BRC.NOTCH_WIDTH;

};
goog.inherits(Blockly.BlockRendering.PreviousConnection, Blockly.BlockRendering.Measurable);

Blockly.BlockRendering.NextConnection = function(width) {
  Blockly.BlockRendering.Icon.superClass_.constructor.call(this);
  this.renderRect = null;
  this.type = 'next connection';
  //TODO: this could be changed by the precedes statement
  this.height = BRC.MEDIUM_PADDING;
  this.width = width;
};
goog.inherits(Blockly.BlockRendering.NextConnection, Blockly.BlockRendering.Measurable);

Blockly.BlockRendering.Hat = function(width, height) {
  Blockly.BlockRendering.Icon.superClass_.constructor.call(this);
  this.renderRect = null;
  this.type = 'hat';
  //TODO: this could be changed by the precedes statement
  this.height = BRC.MEDIUM_PADDING;

};
goog.inherits(Blockly.BlockRendering.Hat, Blockly.BlockRendering.Measurable);

Blockly.BlockRendering.SquareCorner = function(width, height) {
  Blockly.BlockRendering.Icon.superClass_.constructor.call(this);
  this.renderRect = null;
  this.type = 'square corner';
  //TODO: this could be changed by the precedes statement
  this.height = BRC.MEDIUM_PADDING;

};
goog.inherits(Blockly.BlockRendering.SquareCorner, Blockly.BlockRendering.Measurable);

Blockly.BlockRendering.RoundCorner = function(width, height) {
  Blockly.BlockRendering.Icon.superClass_.constructor.call(this);
  this.renderRect = null;
  this.type = 'round corner';
  //TODO: this could be changed by the precedes statement
  this.height = BRC.MEDIUM_PADDING;

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

Blockly.BlockRendering.TopRow = function(block) {
  this.elements = [];
  this.type = 'top row';
  /**
   *
   * @type {boolean}
   */
  this.startHat = block.hat ? block.hat === 'cap' : Blockly.BlockSvg.START_HAT;

  this.hasPreviousConnection = !!block.previousConnection;
  this.connection = block.previousConnection;

  var prevBlock = block.getPreviousBlock();
  /**
   * True if the top left corner of the block should be squared.
   * @type {boolean}
   */
  //Can get rid of
  this.squareCorner = !!block.outputConnection ||
      this.startHat || (prevBlock && prevBlock.getNextBlock() == block);

  this.precedesStatement =
      block.inputList.length &&
      block.inputList[0].type == Blockly.NEXT_STATEMENT;

  if (this.precedesStatement) {
    this.height = BRC.LARGE_PADDING;
  } else {
    this.height = BRC.MEDIUM_PADDING;
  }
};
goog.inherits(Blockly.BlockRendering.TopRow,
    Blockly.BlockRendering.Measurable);


Blockly.BlockRendering.TopRow.prototype.isSpacer = function() {
  return true;
};

Blockly.BlockRendering.BottomRow = function(block, width) {

  this.hasNextConnection = !!block.nextConnection;
  this.connection = block.nextConnection;
  /**
   * True if the bottom left corner of the block should be squared.
   * @type {boolean}
   */
  this.squareCorner = !!block.outputConnection || !!block.getNextBlock();

  this.followsStatement =
      block.inputList.length &&
      block.inputList[block.inputList.length - 1].type == Blockly.NEXT_STATEMENT;

  if (this.followsStatement) {
    this.height = BRC.LARGE_PADDING;
  } else {
    this.height = BRC.MEDIUM_PADDING;
  }

  this.width = width;
};
goog.inherits(Blockly.BlockRendering.BottomRow,
    Blockly.BlockRendering.Measurable);

Blockly.BlockRendering.BottomRow.prototype.isSpacer = function() {
  return true;
};
