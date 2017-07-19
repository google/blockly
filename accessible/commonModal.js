goog.provide('Blockly.CommonModal');


Blockly.CommonModal = function() {};

Blockly.CommonModal.setupKeyboardOverrides = function(component) {
  component.keyboardInputService.setOverride({
    // Tab key: navigates to the previous or next item in the list.
    '9': function(evt) {
      evt.preventDefault();
      evt.stopPropagation();

      if (evt.shiftKey) {
        // Move to the previous item in the list.
        if (component.activeButtonIndex <= 0) {
          component.activeActionButtonIndex = 0;
          component.audioService.playOopsSound();
        } else {
          component.activeButtonIndex--;
        }
      } else {
        // Move to the next item in the list.
        if (component.activeButtonIndex == component.numInteractiveElements(component) - 1) {
          component.audioService.playOopsSound();
        } else {
          component.activeButtonIndex++;
        }
      }

      component.focusOnOption(component.activeButtonIndex, component);
    },
    // Escape key: closes the modal.
    '27': function() {
      component.dismissModal();
    },
    // Up key: no-op.
    '38': function(evt) {
      evt.preventDefault();
    },
    // Down key: no-op.
    '40': function(evt) {
      evt.preventDefault();
    }
  });
}

Blockly.CommonModal.getInteractiveElements = function(component) {
  return Array.prototype.filter.call(
    component.getInteractiveContainer().elements, function(element) {
    if (element.type === 'hidden') {
      return false;
    }
    if (element.disabled) {
      return false;
    }
    if (element.tabIndex < 0) {
      return false;
    }
    return true;
  });
};

Blockly.CommonModal.numInteractiveElements = function(component) {
  var elements = this.getInteractiveElements(component);
  return elements.length;
};

Blockly.CommonModal.focusOnOption = function(index, component) {
  var elements = this.getInteractiveElements(component);
  var button = elements[index];
  button.focus();
};

Blockly.CommonModal.hideModal = function() {
  this.modalIsVisible = false;
  this.keyboardInputService.clearOverride();
};