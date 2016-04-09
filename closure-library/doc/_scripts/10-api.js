// JS to run on API doc pages.

// Replace the "code" links with links directly to github sources.

var url = /https?:\/\/([^.]+)\.github\.io\/([^/]+)\/.*/;
var match = url.exec(window.location.href);
if (match) {
  var repo = 'https://github.com/' + match[1] + '/' + match[2];
  var base = repo + '/blob/master/';
  Array.prototype.forEach.call(
      document.querySelectorAll('a[href]'), function(link) {
        var sourceUrl = /.*\/api\/source\/(.*).src.html(?:#l(.*))?$/;
        var match = sourceUrl.exec(link.href);
        if (match) {
          var newUrl = base + match[1];
          if (match[2]) newUrl += '#L' + match[2];
          link.href = newUrl;
        }
      });
}
