goog.provide('Blockly.BlockRendering');

Blockly.BlockRendering.Measurable = function() {
  this.isInput = false;
  this.width = 0;
  this.height = 0;
  this.type = null;

  this.xPos = 0;
  this.centerline = 0;
};

Blockly.BlockRendering.RenderableInputElement = function(input) {
  Blockly.BlockRendering.RenderableInputElement.superClass_.constructor.call(this);

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
goog.inherits(Blockly.BlockRendering.RenderableInputElement,
    Blockly.BlockRendering.Measurable);

Blockly.BlockRendering.IconElement = function(icon) {
  Blockly.BlockRendering.IconElement.superClass_.constructor.call(this);
  this.icon = icon;
  this.isVisible = icon.isVisible();
  this.renderRect = null;
  this.type = 'icon';

  this.height = 16;
  this.width = 16;
};
goog.inherits(Blockly.BlockRendering.IconElement,
    Blockly.BlockRendering.Measurable);

Blockly.BlockRendering.FieldElement = function(field) {
  Blockly.BlockRendering.FieldElement.superClass_.constructor.call(this);
  this.field = field;
  this.renderRect = null;
  this.isEditable = field.isCurrentlyEditable();
  this.type = 'field';

  var size = this.field.getCorrectedSize();
  this.height = size.height;
  this.width = size.width;
};
goog.inherits(Blockly.BlockRendering.FieldElement,
    Blockly.BlockRendering.Measurable);

Blockly.BlockRendering.InlineInputElement = function(input) {
  Blockly.BlockRendering.InlineInputElement.superClass_.constructor.call(this, input);
  this.type = 'inline input';

  if (!this.connectedBlock) {
    this.height = 26;
    this.width = 22;
  } else {
    this.width = this.connectedBlockWidth;
    this.height = this.connectedBlockHeight;
  }
};
goog.inherits(Blockly.BlockRendering.InlineInputElement,
    Blockly.BlockRendering.RenderableInputElement);

Blockly.BlockRendering.StatementInputElement = function(input) {
  Blockly.BlockRendering.StatementInputElement.superClass_.constructor.call(this, input);
  this.type = 'statement input';

  if (!this.connectedBlock) {
    this.height = 24;
    this.width = 32;
  } else {
    this.width = 25;
    this.height = this.connectedBlockHeight;
  }
};
goog.inherits(Blockly.BlockRendering.StatementInputElement,
    Blockly.BlockRendering.RenderableInputElement);

Blockly.BlockRendering.ExternalValueInputElement = function(input) {
  Blockly.BlockRendering.ExternalValueInputElement.superClass_.constructor.call(this, input);
  this.type = 'external value input';

  if (!this.connectedBlock) {
    this.height = 15;
  } else {
    this.height = this.connectedBlockHeight - 2 * BRC.TAB_OFFSET_FROM_TOP;
  }
  this.width = 10;
};
goog.inherits(Blockly.BlockRendering.ExternalValueInputElement,
    Blockly.BlockRendering.RenderableInputElement);

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
    if (!(elem instanceof Blockly.BlockRendering.ElemSpacer)) {
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

Blockly.BlockRendering.RowSpacer = function(height, width) {
  this.height = height;
  this.rect = null;
  this.width = width;
};

Blockly.BlockRendering.ElemSpacer = function(width) {
  this.height = 15; // Only for visible rendering during debugging.
  this.width = width;
  this.rect = null;
};
