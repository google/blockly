var webdriverio = require('webdriverio');
var options = {
    desiredCapabilities: {
        browserName: 'firefox'
    }
};

var path = process.cwd();
console.log("path is " + path);
//TODO: change pause to waitunitl
var browser = webdriverio
    .remote(options)
    .init()
    .url("file://" + path + "/tests/jsunit/index.html").pause(3000);


browser
.getHTML('#closureTestRunnerLog')
.then(function(result) {
     // result is the html of div#closureTestRunnerLog
     console.log(result);
     // call js to parse html
     var regex = /[\d]+\spassed,\s([\d]+)\sfailed./i;
     var numOfFailure = regex.exec(result)[1];
     //console.log("number of failure is " + numOfFailure);
     if ( parseInt(numOfFailure) !== 0) {
         process.exit(1);
     }
})
.catch(function(err) { console.log(err); process.exit(1); });
