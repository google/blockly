goog.provide('Blockly.BlockRendering');

Blockly.BlockRendering.Measurable = function() {
  this.isInput = false;
  this.isSpacer = false;
  this.width = 0;
  this.height = 0;
  this.type = null;

  this.xPos = 0;
  this.centerline = 0;
};

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
};
goog.inherits(Blockly.BlockRendering.Input, Blockly.BlockRendering.Measurable);

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

Blockly.BlockRendering.InlineInput = function(input) {
  Blockly.BlockRendering.InlineInput.superClass_.constructor.call(this, input);
  this.type = 'inline input';

  if (!this.connectedBlock) {
    this.height = 26;
    this.width = 22;
  } else {
    this.width = this.connectedBlockWidth;
    this.height = this.connectedBlockHeight;
  }
};
goog.inherits(Blockly.BlockRendering.InlineInput, Blockly.BlockRendering.Input);

Blockly.BlockRendering.StatementInput = function(input) {
  Blockly.BlockRendering.StatementInput.superClass_.constructor.call(this, input);
  this.type = 'statement input';

  if (!this.connectedBlock) {
    this.height = 24;
    this.width = 32;
  } else {
    this.width = 25;
    this.height = this.connectedBlockHeight;
  }
};
goog.inherits(Blockly.BlockRendering.StatementInput,
    Blockly.BlockRendering.Input);

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

Blockly.BlockRendering.Row = function() {
  this.yPos = 0;
  this.elements = [];
  this.width = 0;
  this.height = 0;

  this.hasExternalInput = false;
  this.hasStatement = false;
  this.hasInlineInput = false;
};

Blockly.BlockRendering.Row.prototype.measure = function() {
  var connectedBlockWidths = 0;
  for (var e = 0; e < this.elements.length; e++) {
    var elem = this.elements[e];
    this.width += elem.width;
    if (elem.isInput) {
      connectedBlockWidths += elem.connectedBlockWidth;
    }
    if (!(elem.isSpacer)) {
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

Blockly.BlockRendering.Spacer = function(height, width) {
  this.isSpacer = true;
  this.width = width;
  this.height = height;
};
goog.inherits(Blockly.BlockRendering.Spacer,
    Blockly.BlockRendering.Measurable);

Blockly.BlockRendering.SPACER_DEFAULT_HEIGHT = 15;
