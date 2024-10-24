/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file ModuleBar from whence to create blocks.
 * @author dev@varwin.com (Varwin Developers)
 *
 * @class
 */

// Former goog.module("Blockly.ModuleBar");

import * as ContextMenu from './contextmenu.js';
import * as Css from './css.js';
import * as dialog from './dialog.js';
import {Msg} from './msg.js';
import {ShortcutRegistry} from './shortcut_registry.js';
import {Workspace} from './workspace.js';
import {WorkspaceSvg} from './workspace_svg.js';
import * as Events from './events/events.js';
import * as dom from './utils/dom.js';
import * as browserEvents from './browser_events.js';
import * as eventUtils from './events/utils.js';
import {Svg} from './utils/svg.js';
import {KeyCodes} from './utils/keycodes.js';
import {Data} from './browser_events.js';
import {ModuleModel} from './module_model.js';
import * as xmlUtils from '../core/utils/xml.js';

/**
 * Class for a module bar.
 * Creates the moduleBar's DOM.
 */
export class ModuleBar {
  private dragDropModuleEl_: Element | null = null;
  private dragDropTargetModuleEl_: Element | null = null;
  private htmlContainer_: HTMLElement | null = null;
  private ulContainer_: Element | null = null;
  private onClickWrapper_: Data | null = null;
  private onWorkspaceChangeWrapper_: Function | null = null;
  private onMouseDownWrapper_: Data | null = null;
  private onMouseMoveWrapper_: Data | null = null;
  private onMouseWheelWrapper_: Data | null = null;
  private onMouseUpWrapper_: Data | null = null;
  private isFinishedLoading_: boolean = true;
  private ulWrapper_: HTMLDivElement | null = null;
  private readonly numberKeyCodes_: (
    | KeyCodes.ONE
    | KeyCodes.TWO
    | KeyCodes.THREE
    | KeyCodes.FOUR
    | KeyCodes.FIVE
    | KeyCodes.SIX
    | KeyCodes.SEVEN
    | KeyCodes.EIGHT
    | KeyCodes.NINE
  )[];

  constructor(private workspace: WorkspaceSvg) {
    this.workspace = workspace;

    this.dragDropModuleEl_ = null;
    this.dragDropTargetModuleEl_ = null;
    this.htmlContainer_ = null;
    this.ulContainer_ = null;
    this.onClickWrapper_ = null;
    this.onWorkspaceChangeWrapper_ = null;
    this.onMouseDownWrapper_ = null;
    this.onMouseMoveWrapper_ = null;
    this.onMouseWheelWrapper_ = null;
    this.onMouseUpWrapper_ = null;
    this.isFinishedLoading_ = true;
    this.ulWrapper_ = null;
    this.numberKeyCodes_ = [
      KeyCodes.ONE,
      KeyCodes.TWO,
      KeyCodes.THREE,
      KeyCodes.FOUR,
      KeyCodes.FIVE,
      KeyCodes.SIX,
      KeyCodes.SEVEN,
      KeyCodes.EIGHT,
      KeyCodes.NINE,
    ];
  }

  init() {
    const injectionContainer = this.workspace.getInjectionDiv();

    /**
     * HTML container for the ModuleBar.
     *
     * @type {Element}
     */
    this.htmlContainer_ = document.createElement('div');
    this.htmlContainer_.id = 'module-bar-container';
    this.htmlContainer_.className =
      'blocklyModuleBarContainer blocklyNonSelectable'; // cursorNotAllowed

    this.ulContainer_ = document.createElement('ul');
    this.ulContainer_.className = 'blocklyModuleBarUl';

    this.ulWrapper_ = document.createElement('div');
    this.ulWrapper_.className = 'blocklyModuleBarUlWrapper';
    this.ulWrapper_.appendChild(this.ulContainer_);

    this.htmlContainer_.appendChild(this.ulWrapper_);
    injectionContainer.parentNode?.insertBefore(
      this.htmlContainer_,
      injectionContainer,
    );

    if (this.workspace.RTL) {
      this.htmlContainer_.setAttribute('dir', 'rtl');
    }

    // create tab
    const newTab = document.createElement('div');
    newTab.className = 'blocklyModuleBarTab blocklyModuleBarTabCreate';
    newTab.setAttribute('role', 'create-module-control');

    const newLink = document.createElement('a');
    newLink.className = 'blocklyModuleBarLink';
    newLink.setAttribute('role', 'create-module-control');
    newTab.appendChild(newLink);
    this.htmlContainer_.appendChild(newTab);

    /**
     <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
     <rect x="6.5" width="1" height="14" fill="white"/>
     <rect y="7.5" width="1" height="14" transform="rotate(-90 0 7.5)" fill="white"/>
     </svg>
     */
    const svgElem = dom.createSvgElement(
      Svg.SVG,
      {
        'xmlns': dom.SVG_NS,
        'viewBox': '0 0 14 14',
        'width': '14',
        'height': '14',
        'fill': 'none',
        'role': 'create-module-control',
      },
      newLink,
    );

    dom.createSvgElement(
      Svg.RECT,
      {
        'x': '6.5',
        'width': '1',
        'height': '14',
        'fill': 'white',
      },
      svgElem,
    );

    dom.createSvgElement(
      Svg.RECT,
      {
        'y': '7.5',
        'width': '1',
        'height': '14',
        'fill': 'white',
        'transform': 'rotate(-90 0 7.5)',
      },
      svgElem,
    );

    this.attachEvents_();
    this.render();
  }

  /**
   * Register hot key for activate module.
   *
   * @param {ModuleModel} module Module to hotkey register.
   * @param {number} index Module index in modules array.
   * @private
   */
  registerKey(module: ModuleModel, index: number) {
    /** @type {!ShortcutRegistry.KeyboardShortcut} */
    const activateModule = {
      name: module.getId(),
      preconditionFn: function (workspace: Workspace) {
        const activeModule = workspace.getModuleManager().getActiveModule();
        return module.getId() !== activeModule.getId();
      },
      callback: function (workspace: Workspace, e: Event) {
        e.preventDefault();
        workspace.getModuleManager().activateModule(module);
        return true;
      },
    };

    const codeKeyNumber = this.numberKeyCodes_[index];
    const ctrlI = ShortcutRegistry.registry.createSerializedKey(codeKeyNumber, [
      KeyCodes.CTRL,
    ]);

    if (
      ShortcutRegistry.registry.getKeyCodesByShortcutName(module.getId()).length
    ) {
      ShortcutRegistry.registry.unregister(module.getId());
    }

    ShortcutRegistry.registry.register(activateModule, true);
    ShortcutRegistry.registry.addKeyMapping(ctrlI, activateModule.name, true);
  }

  /**
   * Fill the module Bar.
   *
   * @package
   */
  render() {
    if (!this.ulContainer_) {
      return;
    }

    this.ulContainer_.innerHTML = '';

    const modules = this.workspace.getModuleManager().getAllModules();

    for (let i = 0, module; (module = modules[i]); i++) {
      const tab = document.createElement('li');

      tab.className = 'blocklyModuleBarTab';
      tab.setAttribute('data-module-id', module.getId());
      tab.setAttribute('ondragstart', 'return false;');

      const link = document.createElement('a');
      const name = document.createElement('span');

      name.className = 'blocklyModuleName';
      name.appendChild(xmlUtils.createTextNode(module.getName()));
      link.appendChild(name);
      link.className = 'blocklyModuleBarLink';

      const activeModule = this.workspace.getModuleManager().getActiveModule();

      if (activeModule && module.getId() === activeModule.getId()) {
        link.className += ' blocklyModuleBarLinkActive';

        const menuIcon = document.createElement('span');

        menuIcon.className =
          'blocklyModuleBarTabIcon blocklyModuleBarTabMenuIcon';
        menuIcon.setAttribute('role', 'module-menu-control');
        link.appendChild(menuIcon);
      }

      tab.appendChild(link);

      if (i < this.numberKeyCodes_.length) {
        this.registerKey(module, i);
      }

      this.ulContainer_.appendChild(tab);
    }

    // Hack wait when the elements rendered in document and scroll to active tab.
    setTimeout(() => {
      const activeTab = document.querySelector('.blocklyModuleBarLinkActive');
      if (!activeTab) return;
      activeTab.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
        inline: 'center',
      });
      this.needShowShadow_();
    }, 0);
  }

  /**
   * Set whether this module bar's container is visible.
   *
   * @param {boolean} visible Whether the container is visible.
   */
  setContainerVisible(visible: boolean) {
    this.htmlContainer_?.setAttribute(
      'style',
      'display: ' + (visible ? '' : 'none'),
    );
  }

  /**
   * Adds the event listeners.
   *
   * @private
   */
  attachEvents_() {
    this.onClickWrapper_ = browserEvents.conditionalBind(
      this.htmlContainer_ as EventTarget,
      'click',
      this,
      this.onMouseClick_,
    );
    this.onMouseDownWrapper_ = browserEvents.conditionalBind(
      this.htmlContainer_ as EventTarget,
      'mousedown',
      this,
      this.onMouseDown_,
    );
    this.onMouseUpWrapper_ = browserEvents.conditionalBind(
      document,
      'mouseup',
      this,
      this.onMouseUp_,
    );
    this.onMouseMoveWrapper_ = browserEvents.conditionalBind(
      document,
      'mousemove',
      this,
      this.onMouseMove_,
    );
    this.onMouseWheelWrapper_ = browserEvents.conditionalBind(
      this.htmlContainer_ as EventTarget,
      'wheel',
      this,
      this.onMouseWheel_,
    );
    this.onWorkspaceChangeWrapper_ = this.workspace.addChangeListener(
      // @ts-expect-error:next-line
      this.onWorkspaceChange_.bind(this),
    );
  }

  /**
   * Removes the event listeners.
   *
   * @private
   */
  detachEvents_() {
    if (this.onClickWrapper_) {
      browserEvents.unbind(this.onClickWrapper_);
      this.onClickWrapper_ = null;
    }

    if (this.onMouseDownWrapper_) {
      browserEvents.unbind(this.onMouseDownWrapper_);
      this.onMouseDownWrapper_ = null;
    }

    if (this.onMouseUpWrapper_) {
      browserEvents.unbind(this.onMouseUpWrapper_);
      this.onMouseUpWrapper_ = null;
    }

    if (this.onMouseMoveWrapper_) {
      browserEvents.unbind(this.onMouseMoveWrapper_);
      this.onMouseMoveWrapper_ = null;
    }

    if (this.onMouseWheelWrapper_) {
      browserEvents.unbind(this.onMouseWheelWrapper_);
      this.onMouseWheelWrapper_ = null;
    }

    if (this.onWorkspaceChangeWrapper_) {
      this.workspace.removeChangeListener(this.onWorkspaceChangeWrapper_);
    }
  }

  /**
   * Mouse click handler.
   *
   * @param {!PointerEvent} e The browser event.
   * @private
   */
  onMouseClick_(e: PointerEvent) {
    if (!this.isFinishedLoading_) {
      return;
    }

    // @ts-expect-error:next-line
    const role = e.target.getAttribute('role');

    switch (role) {
      case 'module-menu-control':
        this.handleShowModuleMenu_(e);
        return;
      case 'create-module-control':
        this.handleCreateModule_();
        return;
    }

    this.handleActivateModule_(e);
  }

  /**
   * Mouse down handler.
   *
   * @param {!Event} e The browser event.
   * @private
   */
  onMouseDown_(e: Event) {
    // @ts-expect-error:next-line
    const role = e.target.getAttribute('role');
    if (role === 'module-menu-control') {
      return;
    }

    if (this.workspace.getModuleManager().getAllModules().length < 2) {
      return;
    }

    const moduleEl = this.getModuleElementFromEvent_(e);
    if (!moduleEl) {
      return;
    }

    const module = this.workspace
      .getModuleManager()
      .getModuleById(moduleEl.getAttribute('data-module-id')!);
    if (!module) {
      return;
    }

    if (
      module.getId() !==
      this.workspace.getModuleManager().getActiveModule().getId()
    ) {
      return;
    }

    this.dragDropModuleEl_ = moduleEl;
    ContextMenu.hide();
  }

  /**
   * Mouse up handler.
   *
   * @private
   */
  onMouseUp_() {
    if (!this.dragDropModuleEl_) {
      return;
    }

    const module = this.workspace
      .getModuleManager()
      .getModuleById(this.dragDropModuleEl_.getAttribute('data-module-id')!);
    this.dragDropModuleEl_ = null;
    if (!this.dragDropTargetModuleEl_) {
      return;
    }

    const targetModule = this.workspace
      .getModuleManager()
      .getModuleById(
        this.dragDropTargetModuleEl_.getAttribute('data-module-id')!,
      );
    this.dragDropTargetModuleEl_ = null;

    const oldPosition = this.workspace
      .getModuleManager()
      .getModuleOrder(module?.getId()!);
    let newPosition = this.workspace
      .getModuleManager()
      .getModuleOrder(targetModule?.getId()!);

    if (oldPosition > newPosition) {
      newPosition++;
    }

    this.workspace.getModuleManager().moveModule(module!, newPosition);
  }

  /**
   * Mouse up handler.
   *
   * @param {!Event} e The browser event.
   * @private
   */
  onMouseMove_(e: Event) {
    if (!this.dragDropModuleEl_) {
      return;
    }

    const targetModuleEl = this.getModuleElementFromEvent_(e);
    if (!targetModuleEl || targetModuleEl === this.dragDropModuleEl_) {
      if (this.dragDropTargetModuleEl_) {
        this.dragDropTargetModuleEl_.classList.remove(
          'blocklyModuleBarTabDropZone',
        );
        this.dragDropTargetModuleEl_ = null;
      }

      return;
    }

    if (targetModuleEl === this.dragDropTargetModuleEl_) {
      return;
    }

    if (this.dragDropTargetModuleEl_) {
      this.dragDropTargetModuleEl_.classList.remove(
        'blocklyModuleBarTabDropZone',
      );
    }

    this.dragDropTargetModuleEl_ = targetModuleEl;
    this.dragDropTargetModuleEl_.classList.add('blocklyModuleBarTabDropZone');
  }

  /**
   * Mouse wheel handler.
   *
   * @param {!Event} e The browser event.
   * @private
   */
  onMouseWheel_(e: Event) {
    e.preventDefault();

    if (!this.ulContainer_) {
      return;
    }

    if ('scrollBy' in this.ulContainer_) {
      this.ulContainer_.scrollBy({
        // @ts-expect-error:next-line
        left: e.deltaY < 0 ? -30 : 30,
      });
    }

    this.needShowShadow_();
  }

  needShowShadow_() {
    if (!this.ulWrapper_) {
      return;
    }
    const ulElem = document.querySelector('.blocklyModuleBarUl');

    if (!ulElem) {
      return;
    }

    const DEAD_ZONE = 10;

    if (ulElem.scrollLeft > 0) {
      this.ulWrapper_.classList.add('visibleLeft');
    } else {
      this.ulWrapper_.classList.remove('visibleLeft');
    }

    if (
      // @ts-expect-error:next-line
      ulElem.offsetWidth + Math.round(ulElem.scrollLeft) + DEAD_ZONE <=
      ulElem.scrollWidth
    ) {
      this.ulWrapper_.classList.add('visibleRight');
    } else {
      this.ulWrapper_.classList.remove('visibleRight');
    }
  }

  /**
   * Workspace listener on change.
   *
   * @param {!Event} e The browser event.
   * @private
   */
  onWorkspaceChange_(e: Event) {
    if (e.type === eventUtils.FINISHED_LOADING) {
      this.isFinishedLoading_ = true;

      // this.htmlContainer_?.classList.remove('cursorNotAllowed'); // TODO: uncomment it before release
    }
  }

  /**
   * Activate module control handler.
   *
   * @param {!PointerEvent} e The browser event.
   * @private
   */
  handleShowModuleMenu_(e: PointerEvent) {
    const menuOptions = [
      {
        text: Msg['RENAME_MODULE'],
        enabled: true,
        callback: () => {
          this.handleRenameModule_();
        },
      },
      {
        text: Msg['DELETE_MODULE'],
        enabled: true,
        callback: () => {
          this.handleDeleteModule_();
        },
      },
    ];

    ContextMenu.show(e, menuOptions, this.workspace.RTL);
  }

  /**
   * Activate module control handler.
   *
   * @param {!Event} e The browser event.
   * @private
   */
  handleActivateModule_(e: Event) {
    const moduleEl = this.getModuleElementFromEvent_(e);
    if (!moduleEl) {
      return;
    }

    const module = this.workspace
      .getModuleManager()
      .getModuleById(moduleEl.getAttribute('data-module-id')!);

    if (!module) {
      return;
    }

    this.workspace.getModuleManager().activateModule(module);
    setTimeout(() => {
      this.needShowShadow_();
    }, 0);
  }

  /**
   * Finds the containing module element given an event.
   *
   * @param {!Event} e The browser event.
   * @returns {?Element} The module element or null if no module element is
   *     found.
   * @private
   */
  getModuleElementFromEvent_(e: Event) {
    let target = e.target;
    while (target instanceof Element) {
      const moduleId = target.getAttribute('data-module-id');
      if (moduleId) {
        return target;
      }

      if (target === this.htmlContainer_) {
        return null;
      }

      target = target.parentNode;
    }
    return null;
  }

  /**
   * Create module control handler.
   *
   * @private
   */
  handleCreateModule_() {
    const workspace = this.workspace;

    dialog.prompt(Msg['NEW_MODULE_TITLE'], '', function (moduleName) {
      if (moduleName) {
        moduleName = moduleName.replace(/[\s\xa0]+/g, ' ').trim();

        const existingGroup = Events.getGroup();
        if (!existingGroup) {
          Events.setGroup(true);
        }
        try {
          const module = workspace.getModuleManager().createModule(moduleName);
          workspace.getModuleManager().activateModule(module!);
        } finally {
          Events.setGroup(false);
        }
      }
    });
  }

  /**
   * Rename module control handler.
   *
   * @private
   */
  handleRenameModule_() {
    const workspace = this.workspace;
    const activeModule = workspace.getModuleManager().getActiveModule();
    dialog.prompt(
      Msg['RENAME_MODULE_TITLE'],
      activeModule.getName(),
      function (moduleName) {
        if (moduleName) {
          moduleName = moduleName.replace(/[\s\xa0]+/g, ' ').trim();

          workspace.getModuleManager().renameModule(activeModule, moduleName);
        }
      },
    );
  }

  /**
   * Delete module control handler.
   *
   * @private
   */
  handleDeleteModule_() {
    const workspace = this.workspace;
    const activeModule = workspace.getModuleManager().getActiveModule();

    if (workspace.getModuleManager().getAllModules().length <= 1) {
      dialog.alert(Msg['LAST_MODULE_DELETE_RESTRICTION']);
      return;
    }

    if (workspace.getTopBlocks(false, true).length > 0) {
      dialog.alert(Msg['NOT_EMPTY_MODULE_DELETE_RESTRICTION']);
      return;
    }

    const existingGroup = Events.getGroup();
    if (!existingGroup) {
      Events.setGroup(true);
    }
    try {
      const previousModule = workspace
        .getModuleManager()
        .deleteModule(activeModule);
      ShortcutRegistry.registry.unregister(activeModule.getId()!);
      workspace.getModuleManager().activateModule(previousModule!);
    } finally {
      Events.setGroup(false);
    }
  }

  /**
   * Updates module bar colors from theme.
   *
   * @package
   */
  updateColourFromTheme() {
    // TODO: theme
  }

  getUlWrapElement() {
    return this.ulWrapper_;
  }

  /**
   * Dispose of this moduleBar.
   */
  dispose() {
    this.detachEvents_();

    this.workspace.getThemeManager().unsubscribe(this.htmlContainer_!);
    dom.removeNode(this.htmlContainer_);
  }
}

/**
 * CSS for ModuleBar. See css.js for use.
 */
Css.register(
  `
  .blocklyModuleBarContainer {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
  }

  .blocklyModuleBarUlWrapper,
  .blocklyModuleBarUl {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    white-space: nowrap;
    list-style: none;
    padding: 0;
    margin: 0;
    height: 40px;
    overflow-x: overlay;
    position: relative;
  }

  .blocklyModuleBarUl:hover::-webkit-scrollbar { display: initial; height: 5px; }
  .blocklyModuleBarUl::-webkit-scrollbar { display: none; }

  .blocklyModuleBarUl {
    overflow-y: hidden;
    overflow-x: overlay;
  }

  .blocklyModuleBarUl::-webkit-scrollbar-track {
      background-color: transparent;
      opacity:0.2;
      border-width: 0;
  }

  .blocklyModuleBarUl::-webkit-scrollbar-button,
  .blocklyModuleBarUl::-webkit-scrollbar-track-piece,
  .blocklyModuleBarUl::-webkit-scrollbar-corner,
  .blocklyModuleBarUl::-webkit-resizer { display: none; }

  .blocklyModuleBarUl::-webkit-scrollbar {
    height: 0px;
  }

  .blocklyModuleBarUl::-webkit-scrollbar-thumb {
    height: 0px;
    background-color: #ccc;
    border: none;
  }

  // .cursorNotAllowed {
  //   cursor: not-allowed;
  // }

  .blocklyModuleBarTab {
    margin: 0 5px;
  }

  .blocklyModuleBarTabDropZone {
    border-right: 5px solid #ccc;
    cursor: grab;
  }

  .blocklyModuleBarLink {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding: 10px;
    text-decoration: none;
    border-radius: 8px 8px 0px 0px;
    font-family: sans-serif;
    font-size: 14px;
    height: 40px;
    background-color: #eee;
    border-color: #eee;
  }

  .blocklyModuleName {
    margin: 0px 5px;
  }

  .blocklyModuleBarLinkActive {
    background-color: #5867dd;
    cursor: grab;
    border-color: #5867dd;
    color: #fff !important;
  }

  .blocklyModuleBarTabMenuIcon {
    background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='iso-8859-1'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='10' height='7' viewBox='0 0 10 7' style='enable-background:new 255 255 255 255;' xml:space='preserve'%3E%3Cg%3E%3Cg id='arrow-drop-down'%3E%3Cpath d='M10 1.40446L5 6.5L0 1.40446L0.8875 0.5L5 4.69108L9.1125 0.5L10 1.40446Z' fill='white' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A");
  }

  .blocklyModuleBarTabCreate {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    background-color: #08976d;
    height: 40px;
  }

  .blocklyModuleBarTabCreate:hover > .blocklyModuleBarLink {
    background-color: #5867dd;
    transition 0.15s ease-in-out;
  }

  .blocklyModuleBarTabCreate > .blocklyModuleBarLink {
    background-color: #08976d;
    transition 0.15s ease-in-out;
  }

  .blocklyModuleBarTabCreate:hover {
    cursor: pointer;
    background-color: #5867dd;
    transition 0.15s ease-in-out;
  }

  .visibleRight.blocklyModuleBarUlWrapper::after {
    content: '';
    position: absolute;
    z-index: 1;
    right: 0;
    height: 40px;
    width: 40px;
    background: linear-gradient( to left, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%);
  }

  .visibleLeft.blocklyModuleBarUlWrapper::before {
    content: '';
    position: absolute;
    z-index: 1;
    left: 0;
    height: 40px;
    width: 40px;
    margin-left: inherit;
    background: linear-gradient( to right, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%);
  }

  .blocklyModuleBarTabIcon {
    opacity: 0.5;
    cursor: default;
    background-repeat: no-repeat;
    background-size: contain;
    display: inline-block;
    width: 12px;
    height: 12px;
    margin: 0px 2px;
  }

  .blocklyModuleBarTabIcon:hover {
    opacity: 1;
  }
  `,
);
