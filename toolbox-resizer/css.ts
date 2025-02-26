/**
 * CSS for toolbox search.
 */
const CSS_CONTENT: string = `
.blockly-toolbox-resizer {
  position: absolute;
  height: 100%;
  width: 8px;
  z-index: 71;
  transition: background-color .1s ease-in;
  background-color: transparent;
  border-right: 2px solid transparent;
}

.blockly-toolbox-resizer::before {
  content: "";
  width: 6px;
  height: 100%;
  background-color: #ddd;
  position: absolute;
}

.blockly-toolbox-resizer::after {
  content: "";
  background-image: url("data:image/svg+xml,%3Csvg width='2' height='14' viewBox='0 0 2 14' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2342526E' fill-rule='evenodd'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3Ccircle cx='1' cy='5' r='1'/%3E%3Ccircle cx='1' cy='9' r='1'/%3E%3Ccircle cx='1' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 10% 50%;
  left: 0;
  width: 14px;
  height: 100%;
  position: absolute;
}

.blockly-toolbox-resizer:hover {
  cursor: col-resize;
  border-right: 2px solid #5867dd;
}

.blocklyToolboxCategory {
  max-width: 100%;
  overflow-x: hidden;
}
`

/**
 * Injects CSS for toolbox resizer.
 */
export const injectResizerCss = (() => {
  let executed = false;

  return function (): void {
    // Only inject the CSS once.
    if (executed) return;

    executed = true;
    // Inject CSS tag at start of head.
    const cssNode: HTMLStyleElement = document.createElement('style');
    cssNode.id = 'blockly-toolbox-resizer-style';

    const cssTextNode: Text = document.createTextNode(CSS_CONTENT);
    cssNode.appendChild(cssTextNode);

    document.head.insertBefore(cssNode, document.head.firstChild);
  };
})();
