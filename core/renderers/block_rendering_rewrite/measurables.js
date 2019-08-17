goog.provide('Blockly.blockRendering.Measurable');

goog.require('Blockly.blockRendering.constants');

/**
 * The base class to represent a part of a block that takes up space during
 * rendering.  The constructor for each non-spacer Measurable records the size
 * of the block element (e.g. field, statement input).
 * @package
 * @constructor
 */
Blockly.blockRendering.Measurable = function() {
  this.isInput = false;
  this.width = 0;
  this.height = 0;
  this.type = null;

  this.xPos = 0;
  this.centerline = 0;
};

/**
 * The shape object to use when drawing input and output connections.
 * TODO (#2803): Formalize type annotations for these objects.
 * @type {Object}
 */
Blockly.blockRendering.Measurable.prototype.connectionShape =
    Blockly.blockRendering.constants.PUZZLE_TAB;

/**
 * The shape object to use when drawing previous and next connections.
 * TODO (#2803): Formalize type annotations for these objects.
 * @type {Object}
 */
Blockly.blockRendering.Measurable.prototype.notchShape =
    Blockly.blockRendering.constants.NOTCH;

// TODO: We may remove these helper functions if all of them end up being direct
// checks against types.

/**
 * Whether this stores information about a field.
 * @return {boolean} True if this object stores information about a field.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isField = function() {
  return this.type == 'field';
};

/**
 * Whether this stores information about a hat.
 * @return {boolean} True if this object stores information about a hat.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isHat = function() {
  return this.type == 'hat';
};

/**
 * Whether this stores information about an icon.
 * @return {boolean} True if this object stores information about an icon.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isIcon = function() {
  return this.type == 'icon';
};

/**
 * Whether this stores information about a spacer.
 * @return {boolean} True if this object stores information about a spacer.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isSpacer = function() {
  return this.type == 'between-row spacer' || this.type == 'in-row spacer';
};

/**
 * Whether this stores information about an external input.
 * @return {boolean} True if this object stores information about an external
 * input.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isExternalInput = function() {
  return this.type == 'external value input';
};

/**
 * Whether this stores information about a inline input.
 * @return {boolean} True if this object stores information about a inline
 * input.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isInlineInput = function() {
  return this.type == 'inline input';
};

/**
 * Whether this stores information about a statement input.
 * @return {boolean} True if this object stores information about a statement
 * input.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isStatementInput = function() {
  return this.type == 'statement input';
};

/**
 * Whether this stores information about a previous connection.
 * @return {boolean} True if this object stores information about a previous
 * connection.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isPreviousConnection = function() {
  return this.type == 'previous connection';
};

/**
 * Whether this stores information about a next connection.
 * @return {boolean} True if this object stores information about an next
 * connection.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isNextConnection = function() {
  return this.type == 'next connection';
};

/**
 * Whether this stores information about a rounded corner.
 * @return {boolean} True if this object stores information about an rounded
 * corner.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isRoundedCorner = function() {
  return this.type == 'round corner';
};

/**
 * Whether this stores information about a square corner.
 * @return {boolean} True if this object stores information about an square
 * corner.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isSquareCorner = function() {
  return this.type == 'square corner';
};

/**
 * Whether this stores information about a jagged edge.
 * @return {boolean} True if this object stores information about a jagged edge.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isJaggedEdge = function() {
  return this.type == 'jagged edge';
};

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
 * An object containing information about the space an output connection takes
 * up during rendering.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.OutputConnection = function() {
  Blockly.blockRendering.OutputConnection.superClass_.constructor.call(this);
  this.type = 'output connection';
  this.height = this.connectionShape.height;
  this.width = this.connectionShape.width;
  this.connectionOffsetY = Blockly.blockRendering.constants.TAB_OFFSET_FROM_TOP;
  this.startX = this.width;
};
goog.inherits(Blockly.blockRendering.OutputConnection, Blockly.blockRendering.Measurable);

/**
 * An object containing information about the space a previous connection takes
 * up during rendering.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.PreviousConnection = function() {
  Blockly.blockRendering.PreviousConnection.superClass_.constructor.call(this);
  this.type = 'previous connection';
  this.height = this.notchShape.height;
  this.width = this.notchShape.width;

};
goog.inherits(Blockly.blockRendering.PreviousConnection, Blockly.blockRendering.Measurable);

/**
 * An object containing information about the space a next connection takes
 * up during rendering.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.NextConnection = function() {
  Blockly.blockRendering.NextConnection.superClass_.constructor.call(this);
  this.type = 'next connection';
  this.height = this.notchShape.height;
  this.width = this.notchShape.width;
};
goog.inherits(Blockly.blockRendering.NextConnection, Blockly.blockRendering.Measurable);

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


Blockly.blockRendering.Row = function() {
  this.type = 'row';
  this.yPos = 0;
  this.elements = [];
  this.width = 0;
  this.height = 0;
  this.widthWithConnectedBlocks = 0;

  this.hasExternalInput = false;
  this.hasStatement = false;
  this.hasInlineInput = false;
  this.hasDummyInput = false;
  this.hasJaggedEdge = false;
};

/**
 * The shape object to use when drawing previous and next connections.
 * TODO (#2803): Formalize type annotations for these objects.
 * @type {Object}
 */
Blockly.blockRendering.Row.prototype.notchShape =
    Blockly.blockRendering.constants.NOTCH;

Blockly.blockRendering.Row.prototype.isSpacer = function() {
  return false;
};

Blockly.blockRendering.Row.prototype.measure = function() {
  var connectedBlockWidths = 0;
  for (var e = 0; e < this.elements.length; e++) {
    var elem = this.elements[e];
    this.width += elem.width;
    if (elem.isInput) {
      if (elem.type == 'statement input') {
        connectedBlockWidths += elem.connectedBlockWidth;
      } else if (elem.type == 'external value input' &&
          elem.connectedBlockWidth != 0) {
        connectedBlockWidths += (elem.connectedBlockWidth - elem.connectionWidth);
      }
    }
    if (!(elem.isSpacer())) {
      this.height = Math.max(this.height, elem.height);
    }
  }
  this.widthWithConnectedBlocks = this.width + connectedBlockWidths;
};

Blockly.blockRendering.Row.prototype.getLastInput = function() {
  for (var i = this.elements.length - 1; i >= 0; i--) {
    var elem = this.elements[i];
    if (elem.isSpacer()) {
      continue;
    }
    if (elem.isInput) {
      return elem;
    } else if (elem.isField()) {
      return elem.parentInput;
    }
  }
  // Return null if there are no inputs.
  return null;
};

Blockly.blockRendering.Row.prototype.getFirstSpacer = function() {
  return this.elements[0];
};

Blockly.blockRendering.Row.prototype.getLastSpacer = function() {
  return this.elements[this.elements.length - 1];
};

Blockly.blockRendering.BetweenRowSpacer = function(height, width) {
  this.type = 'between-row spacer';
  this.width = width;
  this.height = height;
  this.followsStatement = false;
  this.widthWithConnectedBlocks = 0;
};
goog.inherits(Blockly.blockRendering.BetweenRowSpacer,
    Blockly.blockRendering.Measurable);

Blockly.blockRendering.InRowSpacer = function(width) {
  this.type = 'in-row spacer';
  this.width = width;
  this.height = Blockly.blockRendering.constants.SPACER_DEFAULT_HEIGHT;
};
goog.inherits(Blockly.blockRendering.InRowSpacer,
    Blockly.blockRendering.Measurable);

/**
 * An object containing information about what elements are in the top row of a
 * block as well as spacing information for the top row.
 * Elements in a top row can consist of corners, hats and previous connections.
 * @param {[type]} block [description]
 * @package
 */
Blockly.blockRendering.TopRow = function(block) {
  Blockly.blockRendering.TopRow.superClass_.constructor.call(this);

  this.elements = [];
  this.type = 'top row';
  this.startY = 0;

  this.hasPreviousConnection = !!block.previousConnection;
  this.connection = block.previousConnection;

  var precedesStatement = block.inputList.length &&
      block.inputList[0].type == Blockly.NEXT_STATEMENT;

  // This is the minimum height for the row. If one of its elements has a greater
  // height it will be overwritten in the compute pass.
  if (precedesStatement && !block.isCollapsed()) {
    this.height = Blockly.blockRendering.constants.LARGE_PADDING;
  } else {
    this.height = Blockly.blockRendering.constants.MEDIUM_PADDING;
  }
};
goog.inherits(Blockly.blockRendering.TopRow, Blockly.blockRendering.Row);


Blockly.blockRendering.TopRow.prototype.getPreviousConnection = function() {
  if (this.hasPreviousConnection) {
    return this.elements[2];
  }
  return null;
};

Blockly.blockRendering.TopRow.prototype.measure = function() {
  for (var e = 0; e < this.elements.length; e++) {
    var elem = this.elements[e];
    this.width += elem.width;
    if (!(elem.isSpacer())) {
      if (elem.type == 'hat') {
        this.startY = elem.startY;
        this.height = this.height + elem.height;
      }
      this.height = Math.max(this.height, elem.height);
    }
  }
  this.widthWithConnectedBlocks = this.width;
};

Blockly.blockRendering.BottomRow = function(block) {
  Blockly.blockRendering.BottomRow.superClass_.constructor.call(this);
  this.type = 'bottom row';
  this.hasNextConnection = !!block.nextConnection;
  this.connection = block.nextConnection;
  this.overhangY = 0;

  var followsStatement =
      block.inputList.length &&
      block.inputList[block.inputList.length - 1].type == Blockly.NEXT_STATEMENT;
  this.hasFixedWidth = followsStatement && block.getInputsInline();

  // This is the minimum height for the row. If one of its elements has a greater
  // height it will be overwritten in the compute pass.
  if (followsStatement) {
    this.height = Blockly.blockRendering.constants.LARGE_PADDING;
  } else {
    this.height = this.notchShape.height;
  }
};
goog.inherits(Blockly.blockRendering.BottomRow,
    Blockly.blockRendering.Row);

Blockly.blockRendering.BottomRow.prototype.getNextConnection = function() {
  if (this.hasNextConnection) {
    return this.elements[2];
  }
  return null;
};

Blockly.blockRendering.BottomRow.prototype.measure = function() {
  for (var e = 0; e < this.elements.length; e++) {
    var elem = this.elements[e];
    this.width += elem.width;
    if (!(elem.isSpacer())) {
      if (elem.type == 'next connection') {
        this.height = this.height + elem.height;
        this.overhangY = elem.height;
      }
      this.height = Math.max(this.height, elem.height);
    }
  }
  this.widthWithConnectedBlocks = this.width;
};
