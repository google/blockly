var app = app || {};

document.addEventListener('DOMContentLoaded', function() {
    ng.platform.browser.bootstrap(app.ToolboxView);
    ng.platform.browser.bootstrap(app.WorkspaceView);
  });

var option = document.getElementById("selected");
// (function(app) {
//   document.addEventListener('DOMContentLoaded', function() {
//     ng.platform.browser.bootstrap(app.AppComponent);
//   });
// })(window.app || (window.app = {}));
