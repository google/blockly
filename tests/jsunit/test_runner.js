var webdriverio = require('webdriverio');
var options = {
    desiredCapabilities: {
        browserName: 'chrome'
    }
};

var path = process.cwd();
//TODO: change pause to waitunitl
var browser = webdriverio
    .remote(options)
    .init()
<<<<<<< HEAD
    .url("file://" + path + "/tests/jsunit/index.html").pause(3000);
=======
    .url("file://" + path + "/tests/jsunit/index.html").pause(5000);
>>>>>>> 4c4cc7bb3b11d0a899730ae8135c0e9b01a5868c


browser
.getHTML('#closureTestRunnerLog')
.then(function(result) {
   // call js to parse html
   var regex = /[\d]+\spassed,\s([\d]+)\sfailed./i;
   var numOfFailure = regex.exec(result)[1];
  var regex2 = /Unit Tests for Blockly .*]/;
  var testStatus = regex2.exec(result)[0];
  console.log("============Blockly Unit Test Summary=================");
   console.log(testStatus);
   var regex3 = /\d+ passed,\s\d+ failed/;
   var detail = regex3.exec(result)[0];
   console.log(detail);
  console.log("============Blockly Unit Test Summary=================");
   if ( parseInt(numOfFailure) !== 0) {
     console.log(result);
     process.exit(1);
    }
})
.catch(function(err) { console.log(err); process.exit(1); });
