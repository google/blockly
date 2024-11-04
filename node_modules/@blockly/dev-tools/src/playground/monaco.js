// Declare external types to make eslint happy.
/* global monaco */

/**
 * Load the monaco editor.
 * @param {!HTMLElement} container The container element.
 * @param {Object} options Monaco editor options.
 * @param {string=} vsEditorPath Optional VS editor path.
 * @returns {Promise} A promise that resolves with the editor.
 */
export function addCodeEditor(container, options, vsEditorPath) {
  return new Promise((resolve, reject) => {
    if (!vsEditorPath) {
      const vsEditorPaths = [
        // monaco-editor is a devDependency of @blockly/dev-tools, look for it
        // there first, otherwise attempt to find it in the local node_modules
        // and finally resort to an online version.
        '../node_modules/@blockly/dev-tools/node_modules/monaco-editor/min/vs',
        '../node_modules/monaco-editor/min/vs',
        'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.19.2/min/vs',
      ];
      // Find the VS loader.
      for (let i = 0; i < vsEditorPaths.length; i++) {
        if (checkFileExists(`${vsEditorPaths[i]}/loader.js`)) {
          vsEditorPath = vsEditorPaths[i];
          break;
        }
      }
    }

    const onLoad = () => {
      const amdRequire = /** @type {?} */ (window.require);
      amdRequire.config({
        paths: {vs: vsEditorPath},
      });

      // Load the monaco editor.
      amdRequire(['vs/editor/editor.main'], () => {
        resolve(createEditor(container, options));
      });
    };

    if (!window.require) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.setAttribute('src', `${vsEditorPath}/loader.js`);
      script.addEventListener('load', onLoad);
      document.body.appendChild(script);
    } else {
      onLoad();
    }
  });
}

/**
 * Create the monaco editor.
 * @param {!HTMLElement} container The container element.
 * @param {Object} options Monaco editor options.
 * @returns {monaco.editor.IStandaloneCodeEditor} A monaco editor.
 */
function createEditor(container, options) {
  const editor = window.monaco.editor.create(container, options);
  editor.layout();
  return editor;
}

/**
 * Check whether or not a JS file exists at the url specified.
 * @param {string} url The url of the file.
 * @returns {boolean} Whether or not the file exists.
 */
function checkFileExists(url) {
  const http = new XMLHttpRequest();
  http.open('HEAD', url, false);
  try {
    http.send();
  } catch (_e) {
    return false;
  }
  return http.status != 404;
}
