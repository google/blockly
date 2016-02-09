var app = app || {};

document.addEventListener('DOMContentLoaded', function() {
    ng.platform.browser.bootstrap(app.AppView);
  });

var option = document.getElementById("selected");
// (function(app) {
//   document.addEventListener('DOMContentLoaded', function() {
//     ng.platform.browser.bootstrap(app.AppComponent);
//   });
// })(window.app || (window.app = {}));
