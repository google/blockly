var Blockly = require('./blockly_uncompressed.js');
// var blocks = require('./blocks_compressed.js');
// var python = require('./python_compressed.js');
// var en = require('./msg/js/en.js');

var fs = require('fs');
fs.readFile('./input.xml', function (err, data) {
	if (err) throw err;

	var xmlText = data.toString()
	try {
		var xml = Blockly.Xml.textToDom(xmlText)
	} catch (e) {
		console.log(e);
	return;
	}
	// Create a headless workspace.
	var workspace = new Blockly.Workspace();
	Blockly.Xml.domToWorkspace(workspace, xml);
	var code = Blockly.Python.workspaceToCode(workspace);
	console.log(code);
});

// var xmlText = document.getElementById('xml_input').value;
