// This program is to be used with NodeJS run Blockly headless. It loads 
// Blockly XML from `input.xml` and outputs python code on `stdout`.

global.DOMParser = require('xmldom').DOMParser;

global.Blockly = require('./blockly_uncompressed.js');

require('./blocks_compressed.js');
require('./python_compressed.js');

var fs = require('fs');

//the contents of './input.xml' are passed as the `data` parameter
fs.readFile('./input.xml', function (err, data) {
	if (err) throw err;

	var xmlText = data.toString(); //convert the data buffer to a string
	try {
		var xml = Blockly.Xml.textToDom(xmlText);
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