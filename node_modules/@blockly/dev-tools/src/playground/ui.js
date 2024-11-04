/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Playground UI.
 * @author samelh@google.com (Sam El-Husseini)
 */

/**
 * Render the playground layout.
 * @param {HTMLElement} container The container to render the playground in.
 * @returns {{
 *     blocklyDiv: HTMLElement,
 *     minimizeButton: HTMLElement,
 *     monacoDiv: HTMLElement,
 *     guiContainer: HTMLElement,
 *     playgroundDiv: HTMLElement,
 *     tabsDiv: HTMLElement,
 *     tabButtons: HTMLElement
 * }} An object with the various playground components.
 */
export function renderPlayground(container) {
  container.style.display = 'flex';
  container.style.overflow = 'hidden';
  container.style.height = '100vh';
  container.style.width = '100vw';
  container.style.userSelect = 'none';
  container.style.background = '#E4E4E4';

  // Blockly area.

  const blocklyArea = document.createElement('div');
  blocklyArea.style.flex = '2 1 0';
  container.appendChild(blocklyArea);

  const blocklyDiv = document.createElement('div');
  blocklyDiv.style.height = '100%';
  blocklyDiv.style.width = '100%';
  blocklyDiv.style.maxHeight = '100%';
  blocklyArea.appendChild(blocklyDiv);

  // Playground area.

  // Minimize button
  const minimizeButton = document.createElement('div');
  minimizeButton.style.width = '18px';
  minimizeButton.style.background = 'black';
  minimizeButton.style.color = 'white';
  minimizeButton.style.font = `12px 'Lucida Grande', sans-serif`;
  minimizeButton.style.writingMode = 'vertical-lr';
  minimizeButton.style.textOrientation = 'mixed';
  minimizeButton.style.textAlign = 'center';
  minimizeButton.textContent = 'Collapse';
  container.appendChild(minimizeButton);

  const playgroundDiv = document.createElement('div');
  playgroundDiv.style.flex = '1 1 1';
  playgroundDiv.style.maxWidth = '40vw';
  playgroundDiv.style.width = '100%';
  playgroundDiv.style.height = '100%';
  playgroundDiv.style.display = 'flex';
  playgroundDiv.style.background = 'grey';
  playgroundDiv.style.flexDirection = 'column';
  playgroundDiv.style.color = '#bbb';
  playgroundDiv.style.font = `11px 'Lucida Grande', sans-serif`;
  container.appendChild(playgroundDiv);

  const playgroundTitle = document.createElement('span');
  playgroundTitle.textContent = 'Blockly Playground';
  playgroundTitle.style.background = '#3C3C3C';
  playgroundTitle.style.fontSize = '12px';
  playgroundTitle.style.padding = '7px';
  playgroundDiv.appendChild(playgroundTitle);

  // GUI controls area.

  const guiContainer = document.createElement('div');
  guiContainer.style.maxHeight = '50%';
  guiContainer.style.flex = '1';
  guiContainer.style.background = '#000';
  guiContainer.style.overflow = 'auto';
  playgroundDiv.appendChild(guiContainer);

  // Code area.

  const codeWrapper = document.createElement('div');
  codeWrapper.style.maxHeight = '50%';
  codeWrapper.style.background = '#1E1E1E';
  codeWrapper.style.flex = '1';
  playgroundDiv.appendChild(codeWrapper);

  // Code editor tabs.
  const tabContainer = document.createElement('div');
  tabContainer.style.background = '#252526';
  tabContainer.style.height = '30px';
  tabContainer.style.lineHeight = '30px';
  tabContainer.style.position = 'relative';
  codeWrapper.appendChild(tabContainer);

  const tabsDiv = document.createElement('div');
  tabsDiv.style.overflow = 'auto hidden';
  tabsDiv.style.width = 'calc(100% - 50px)';
  tabContainer.appendChild(tabsDiv);

  // Code editor tab buttons.
  const tabButtons = document.createElement('div');
  tabButtons.style.position = 'absolute';
  tabButtons.style.height = '30px';
  tabButtons.style.width = '50px';
  tabButtons.style.top = '0';
  tabButtons.style.right = '0';
  tabButtons.style.display = 'flex';
  tabButtons.style.justifyContent = 'center';
  tabButtons.style.alignItems = 'center';
  tabButtons.style.background = '#252526';
  tabContainer.appendChild(tabButtons);

  // Code editor.
  const editorContainer = document.createElement('div');
  editorContainer.style.height = 'calc(100% - 30px)';
  codeWrapper.appendChild(editorContainer);

  return {
    blocklyDiv,
    minimizeButton,
    monacoDiv: editorContainer,
    guiContainer,
    playgroundDiv,
    tabsDiv,
    tabButtons,
  };
}

/**
 * Render a code tab.
 * @param {string} name Name of the tab.
 * @returns {HTMLElement} The tab <span> element.
 */
export function renderCodeTab(name) {
  const tab = document.createElement('span');
  tab.style.background = '#2D2D2D';
  tab.style.color = '#969696';
  tab.style.padding = '10px 20px';
  tab.style.lineHeight = '30px';
  tab.style.cursor = 'pointer';
  tab.textContent = name;
  return tab;
}

/**
 * Render a checkbox.
 * @param {string} id Id to use for the checkbox element.
 * @param {string} label The label string to use.
 * @returns {Array<HTMLElement>} A tuple of the checkbox input element, and the
 * checkbox label element.
 */
export function renderCheckbox(id, label) {
  const checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', id);
  const checkboxLabel = document.createElement('label');
  checkboxLabel.textContent = label;
  checkboxLabel.setAttribute('for', id);
  return [checkbox, checkboxLabel];
}
