/**
 * Blockly Demos: Custom Dialogs
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CustomDialog = {}

/** Override Blockly.alert() with custom implementation. */
Blockly.alert = function(message, callback) {
    console.log('Alert: ' + message);
    CustomDialog.show('Alert', message, {
        onCancel: callback
    });
};

/** Override Blockly.confirm() with custom implementation. */
Blockly.confirm = function(message, callback) {
    console.log('Confirm: ' + message);
    CustomDialog.show('Confirm', message, {
        showOkay: true,
        onOkay: function() {
            callback(true)
        },
        showCancel: true,
        onCancel: function() {
            callback(false)
        }
    });
};

/** Override Blockly.prompt() with custom implementation. */
Blockly.prompt = function(message, defaultValue, callback) {
    console.log('Prompt: ' + message);
    CustomDialog.show('Prompt', message, {
        showInput: true,
        showOkay: true,
        onOkay: function() {
            callback(CustomDialog.inputField.value)
        },
        showCancel: true,
        onCancel: function() {
            callback(null)
        }
    });
    CustomDialog.inputField.value = defaultValue;
};


CustomDialog.hide = function() {
    if (CustomDialog.backdropDiv_) {
        CustomDialog.backdropDiv_.style.display = 'none'
        CustomDialog.dialogDiv_.style.display = 'none'
    }
}

/**
 * Shows the dialog.
 * Allowed options:
 *  - showOkay: Whether to show the OK button.
 *  - showCancel: Whether to show the Cancel button.
 *  - showInput: Whether to show the text input field.
 *  - onOkay: Callback to handle the okay button.
 *  - onCancel: Callback to handle the cancel button.
 */
CustomDialog.show = function(title, message, options) {
    var backdropDiv = CustomDialog.backdropDiv_;
    var dialogDiv = CustomDialog.dialogDiv_;
    if (!dialogDiv) {
        // Generate HTML
        var body = document.getElementsByTagName('body')[0];
        backdropDiv = document.createElement('div');
        backdropDiv.setAttribute('id', 'backdrop');
        backdropDiv.style.cssText =
              'position: absolute;'
              + 'top: 0px;'
              + 'left: 0px;'
              + 'right: 0px;'
              + 'bottom: 0px;'
              + 'background-color: rgba(0, 0, 0, 0.7);';
        body.appendChild(backdropDiv);

        dialogDiv = document.createElement('div');
        dialogDiv.setAttribute('id', 'dialog');
        dialogDiv.style.cssText =
                'background-color: white;'
                + 'width: 400px;'
                + 'margin: 20px auto 0;'
                + 'padding: 10px;';
        backdropDiv.appendChild(dialogDiv);

        dialogDiv.onclick = function(event) {
            event.stopPropagation();
        };

        CustomDialog.backdropDiv_ = backdropDiv;
        CustomDialog.dialogDiv_ = dialogDiv;
    }
    backdropDiv.style.display = 'block';
    dialogDiv.style.display = 'block';

    dialogDiv.innerHTML = '<div id="dialogTitle"><strong>' + title + '</strong></div>'
            + '<p>' + message + '</p>'
            + (options.showInput? '<div><input id="dialogInput"></div>' : '')
            + '<div class="buttons">'
            + (options.showCancel ? '<button id="dialogCancel">Cancel</button>': '')
            + (options.showOkay ? '<button id="dialogOkay">OK</button>': '')
            + '</div>';

    var onOkay = function(event) {
        CustomDialog.hide();
        options.onOkay && options.onOkay();
        event && event.stopPropagation();
    };
    var onCancel = function(event) {
        CustomDialog.hide();
        options.onCancel && options.onCancel();
        event && event.stopPropagation();
    };

    var dialogInput = document.getElementById('dialogInput');
    CustomDialog.inputField = dialogInput;
    if (dialogInput) {
        dialogInput.focus();

        dialogInput.onkeyup = function(event) {
            if (event.keyCode == 13) {
                // Process as OK when user hits enter.
                onOkay();
                return false;
            } else if (event.keyCode == 27)  {
                // Process as cancel when user hits esc.
                onCancel();
                return false;
            }
        };
    } else {
        var okay = document.getElementById('dialogOkay');
        okay && okay.focus();
    }

    if (options.showOkay) {
        document.getElementById('dialogOkay').onclick = onOkay;
    }
    if (options.showCancel) {
        document.getElementById('dialogCancel').onclick = onCancel;
    }

    backdropDiv.onclick = onCancel;
}
