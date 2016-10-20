/** Override Blockly.alert() with custom implementation. */
Blockly.alert = function(message, callback) {
	showDialog('Alert', message, {
		okay: callback
	});
}

/** Override Blockly.confirm() with custom implementation. */
Blockly.confirm = function(message, callback) {
	showDialog('Confirm', message, {
		showOkay: true,
		okay: function() {
			callback(true)
		},
		showCancel: true,
		cancel: function() {
			callback(false)
		}
	});
}

/** Override Blockly.prompt() with custom implementation. */
Blockly.prompt = function(message, defaultValue, callback) {
	showDialog('Prompt', message, {
		showInput: true,
		showOkay: true,
		okay: function() {
			callback(dialogInput.value)
		},
		showCancel: true,
		cancel: function() {
			callback(null)
		}
	});
	dialogInput.value = defaultValue
}

// Implementation details below...
var backdropDiv, dialogDiv, dialogInput

function hideDialog() {
	backdropDiv.style.display = 'none'
	dialogDiv.style.display = 'none'
}

function showDialog(title, message, options) {
	if (!backdropDiv) {
		// Generate HTML
		var body = document.getElementsByTagName('body')[0]
		backdropDiv = document.createElement('div')
		backdropDiv.setAttribute('id', 'backdrop')
		body.appendChild(backdropDiv)

		dialogDiv = document.createElement('div')
		dialogDiv.setAttribute('id', 'dialog')
		backdropDiv.appendChild(dialogDiv)
		dialogDiv.onclick = function(event) {
			event.stopPropagation()
		}

	}
	backdropDiv.style.display = 'block'
	dialogDiv.style.display = 'block'

	dialogDiv.innerHTML = '<div id="dialogTitle"><strong>' + title + '</strong></div>'
			+ '<p>' + message + '</p>'
			+ (options.showInput? '<div><input id="dialogInput"></div>' : '')
			+ '<div class="buttons">'
			+ (options.showCancel ? '<button id="dialogCancel">Cancel</button>': '')
			+ (options.showOkay ? '<button id="dialogOkay">OK</button>': '')
			+ '</div>'
	dialogInput = document.getElementById('dialogInput')

	document.getElementById('dialogOkay').onclick = function(event) {
		hideDialog()
		if (options.okay) {
			options.okay()
		}
		event.stopPropagation()
	}
	document.getElementById('dialogCancel').onclick = function(event) {
		hideDialog()
		if (options.cancel) {
			options.cancel()
		}
		event.stopPropagation()
	}

	backdropDiv.onclick = function(event) {
		hideDialog()
		if (options.cancel) {
			options.cancel();
		} else if (options.okay) {
			options.okay();
		}
		event.stopPropagation()
	}	
}



