goog.provide('Blockly.BlockRendering.Measurables');

Blockly.BlockRendering.Measurables.RenderableBlockElement = function() {
  this.isInput = false;
  this.width = 0;
  this.height = 0;
  this.type = null;
};

Blockly.BlockRendering.Measurables.RenderableInputElement = function(input) {
  Blockly.BlockRendering.Measurables.RenderableInputElement.superClass_.constructor.call(this);

  this.isInput = true;
  this.input = input;
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
goog.inherits(Blockly.BlockRendering.Measurables.RenderableInputElement,
    Blockly.BlockRendering.Measurables.RenderableBlockElement);

Blockly.BlockRendering.Measurables.IconElement = function(icon) {
  Blockly.BlockRendering.Measurables.IconElement.superClass_.constructor.call(this);
  this.icon = icon;
  this.isVisible = icon.isVisible();
  this.renderRect = null;
  this.type = 'icon';

  this.height = 16;
  this.width = 16;
};
goog.inherits(Blockly.BlockRendering.Measurables.IconElement,
    Blockly.BlockRendering.Measurables.RenderableBlockElement);

Blockly.BlockRendering.Measurables.FieldElement = function(field) {
  Blockly.BlockRendering.Measurables.FieldElement.superClass_.constructor.call(this);
  this.field = field;
  this.renderRect = null;
  this.isEditable = field.isCurrentlyEditable();
  this.type = 'field';

  var size = this.field.getCorrectedSize();
  this.height = size.height;
  this.width = size.width;
};
goog.inherits(Blockly.BlockRendering.Measurables.FieldElement,
    Blockly.BlockRendering.Measurables.RenderableBlockElement);

Blockly.BlockRendering.Measurables.InlineInputElement = function(input) {
  Blockly.BlockRendering.Measurables.InlineInputElement.superClass_.constructor.call(this, input);
  this.type = 'inline input';

  if (!this.connectedBlock) {
    this.height = 26;
    this.width = 22;
  } else {
    this.width = this.connectedBlockWidth;
    this.height = this.connectedBlockHeight;
  }
};
goog.inherits(Blockly.BlockRendering.Measurables.InlineInputElement,
    Blockly.BlockRendering.Measurables.RenderableInputElement);

Blockly.BlockRendering.Measurables.StatementInputElement = function(input) {
  Blockly.BlockRendering.Measurables.StatementInputElement.superClass_.constructor.call(this, input);
  this.type = 'statement input';

  if (!this.connectedBlock) {
    this.height = 24;
    this.width = 32;
  } else {
    this.width = 25;
    this.height = this.connectedBlockHeight;
  }
};
goog.inherits(Blockly.BlockRendering.Measurables.StatementInputElement,
    Blockly.BlockRendering.Measurables.RenderableInputElement);

Blockly.BlockRendering.Measurables.ExternalValueInputElement = function(input) {
  Blockly.BlockRendering.Measurables.ExternalValueInputElement.superClass_.constructor.call(this, input);
  this.type = 'external value input';

  if (!this.connectedBlock) {
    this.height = 15;
  } else {
    this.height = this.connectedBlockHeight - 2 * BRC.TAB_OFFSET_FROM_TOP;
  }
  this.width = 10;
};
goog.inherits(Blockly.BlockRendering.Measurables.ExternalValueInputElement,
    Blockly.BlockRendering.Measurables.RenderableInputElement);

Blockly.BlockRendering.Measurables.Row = function() {
  this.elements = [];
  this.width = 0;
  this.height = 0;

  this.hasExternalInput = false;
  this.hasStatement = false;
  this.hasInlineInput = false;
};

Blockly.BlockRendering.Measurables.Row.prototype.measure = function() {
  var connectedBlockWidths = 0;
  for (var e = 0; e < this.elements.length; e++) {
    var elem = this.elements[e];
    this.width += elem.width;
    if (elem.isInput) {
      connectedBlockWidths += elem.connectedBlockWidth;
    }
    if (!(elem instanceof Blockly.BlockRendering.Measurables.ElemSpacer)) {
      this.height = Math.max(this.height, elem.height);
    }
  }
  this.widthWithConnectedBlocks = this.width + connectedBlockWidths;
};

Blockly.BlockRendering.Measurables.Row.prototype.getLastInput = function() {
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

Blockly.BlockRendering.Measurables.Row.prototype.getFirstSpacer = function() {
  return this.elements[0];
};

Blockly.BlockRendering.Measurables.Row.prototype.getLastSpacer = function() {
  return this.elements[this.elements.length - 1];
};

Blockly.BlockRendering.Measurables.RowSpacer = function(height, width) {
  this.height = height;
  this.rect = null;
  this.width = width;
};

Blockly.BlockRendering.Measurables.ElemSpacer = function(width) {
  this.height = 15; // Only for visible rendering during debugging.
  this.width = width;
  this.rect = null;
};
