/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.inject

import type {BlocklyOptions} from './blockly_options.js';
import * as browserEvents from './browser_events.js';
import * as bumpObjects from './bump_objects.js';
import * as common from './common.js';
import * as Css from './css.js';
import * as dropDownDiv from './dropdowndiv.js';
import {Grid} from './grid.js';
import {Msg} from './msg.js';
import {Options} from './options.js';
import {ScrollbarPair} from './scrollbar_pair.js';
import {ShortcutRegistry} from './shortcut_registry.js';
import * as Tooltip from './tooltip.js';
import * as Touch from './touch.js';
import * as aria from './utils/aria.js';
import * as dom from './utils/dom.js';
import {Svg} from './utils/svg.js';
import * as userAgent from './utils/useragent.js';
import * as WidgetDiv from './widgetdiv.js';
import {WorkspaceSvg} from './workspace_svg.js';

/**
 * Inject a Blockly editor into the specified container element (usually a div).
 *
 * @param container Containing element, or its ID, or a CSS selector.
 * @param opt_options Optional dictionary of options.
 * @returns Newly created main workspace.
 */
export function inject(
  container: Element | string,
  opt_options?: BlocklyOptions,
): WorkspaceSvg {
  let containerElement: Element | null = null;
  if (typeof container === 'string') {
    containerElement =
      document.getElementById(container) || document.querySelector(container);
  } else {
    containerElement = container;
  }
  // Verify that the container is in document.
  if (
    !document.contains(containerElement) &&
    document !== containerElement?.ownerDocument
  ) {
    throw Error('Error: container is not in current document');
  }
  const options = new Options(opt_options || ({} as BlocklyOptions));
  const subContainer = document.createElement('div');
  subContainer.className = 'injectionDiv';
  subContainer.tabIndex = 0;
  aria.setState(subContainer, aria.State.LABEL, Msg['WORKSPACE_ARIA_LABEL']);

  containerElement!.appendChild(subContainer);
  const svg = createDom(subContainer, options);

  const workspace = createMainWorkspace(subContainer, svg, options);

  init(workspace);

  // Keep focus on the first workspace so entering keyboard navigation looks
  // correct.
  common.setMainWorkspace(workspace);

  common.svgResize(workspace);

  subContainer.addEventListener('focusin', function () {
    common.setMainWorkspace(workspace);
  });

  return workspace;
}

/**
 * Create the SVG image.
 *
 * @param container Containing element.
 * @param options Dictionary of options.
 * @returns Newly created SVG image.
 */
function createDom(container: Element, options: Options): SVGElement {
  // Sadly browsers (Chrome vs Firefox) are currently inconsistent in laying
  // out content in RTL mode.  Therefore Blockly forces the use of LTR,
  // then manually positions content in RTL as needed.
  container.setAttribute('dir', 'LTR');

  // Load CSS.
  Css.inject(options.hasCss, options.pathToMedia);

  // Build the SVG DOM.
  /*
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:html="http://www.w3.org/1999/xhtml"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      version="1.1"
      class="blocklySvg">
      ...
    </svg>
    */
  const svg = dom.createSvgElement(
    Svg.SVG,
    {
      'xmlns': dom.SVG_NS,
      'xmlns:html': dom.HTML_NS,
      'xmlns:xlink': dom.XLINK_NS,
      'version': '1.1',
      'class': 'blocklySvg',
      'tabindex': '0',
    },
    container,
  );
  /*
    <defs>
      ... filters go here ...
    </defs>
    */
  const defs = dom.createSvgElement(Svg.DEFS, {}, svg);
  // Each filter/pattern needs a unique ID for the case of multiple Blockly
  // instances on a page.  Browser behaviour becomes undefined otherwise.
  // https://neil.fraser.name/news/2015/11/01/
  const rnd = String(Math.random()).substring(2);

  options.gridPattern = Grid.createDom(rnd, options.gridOptions, defs);
  return svg;
}

/**
 * Create a main workspace and add it to the SVG.
 *
 * @param svg SVG element with pattern defined.
 * @param options Dictionary of options.
 * @returns Newly created main workspace.
 */
function createMainWorkspace(
  injectionDiv: Element,
  svg: SVGElement,
  options: Options,
): WorkspaceSvg {
  options.parentWorkspace = null;
  const mainWorkspace = new WorkspaceSvg(options);
  const wsOptions = mainWorkspace.options;
  mainWorkspace.scale = wsOptions.zoomOptions.startScale;
  svg.appendChild(
    mainWorkspace.createDom('blocklyMainBackground', injectionDiv),
  );

  // Set the theme name and renderer name onto the injection div.
  const rendererClassName = mainWorkspace.getRenderer().getClassName();
  if (rendererClassName) {
    dom.addClass(injectionDiv, rendererClassName);
  }
  const themeClassName = mainWorkspace.getTheme().getClassName();
  if (themeClassName) {
    dom.addClass(injectionDiv, themeClassName);
  }

  if (!wsOptions.hasCategories && wsOptions.languageTree) {
    // Add flyout as an <svg> that is a sibling of the workspace SVG.
    const flyout = mainWorkspace.addFlyout(Svg.SVG);
    dom.insertAfter(flyout, svg);
  }
  if (wsOptions.hasTrashcan) {
    mainWorkspace.addTrashcan();
  }
  if (wsOptions.zoomOptions && wsOptions.zoomOptions.controls) {
    mainWorkspace.addZoomControls();
  }
  // Register the workspace svg as a UI component.
  mainWorkspace
    .getThemeManager()
    .subscribe(svg, 'workspaceBackgroundColour', 'background-color');

  // A null translation will also apply the correct initial scale.
  mainWorkspace.translate(0, 0);

  mainWorkspace.addChangeListener(
    bumpObjects.bumpIntoBoundsHandler(mainWorkspace),
  );

  // The SVG is now fully assembled.
  common.svgResize(mainWorkspace);
  WidgetDiv.createDom();
  dropDownDiv.createDom();
  Tooltip.createDom();
  return mainWorkspace;
}

/**
 * Initialize Blockly with various handlers.
 *
 * @param mainWorkspace Newly created main workspace.
 */
function init(mainWorkspace: WorkspaceSvg) {
  const options = mainWorkspace.options;
  const svg = mainWorkspace.getParentSvg();

  // Suppress the browser's context menu.
  browserEvents.conditionalBind(
    svg.parentNode as Element,
    'contextmenu',
    null,
    function (e: Event) {
      if (!browserEvents.isTargetInput(e)) {
        e.preventDefault();
      }
    },
  );

  const workspaceResizeHandler = browserEvents.conditionalBind(
    window,
    'resize',
    null,
    function () {
      // Don't hide all the chaff. Leave the dropdown and widget divs open if
      // possible.
      Tooltip.hide();
      mainWorkspace.hideComponents(true);
      dropDownDiv.repositionForWindowResize();
      WidgetDiv.repositionForWindowResize();
      common.svgResize(mainWorkspace);
      bumpObjects.bumpTopObjectsIntoBounds(mainWorkspace);
    },
  );
  mainWorkspace.setResizeHandlerWrapper(workspaceResizeHandler);

  bindDocumentEvents();

  if (options.languageTree) {
    const toolbox = mainWorkspace.getToolbox();
    const flyout = mainWorkspace.getFlyout(true);
    if (toolbox) {
      toolbox.init();
    } else if (flyout) {
      // Build a fixed flyout with the root blocks.
      flyout.init(mainWorkspace);
      flyout.show(options.languageTree);
      if (typeof flyout.scrollToStart === 'function') {
        flyout.scrollToStart();
      }
    }
  }

  if (options.hasTrashcan) {
    mainWorkspace.trashcan!.init();
  }
  if (options.zoomOptions && options.zoomOptions.controls) {
    mainWorkspace.zoomControls_!.init();
  }

  if (options.moveOptions && options.moveOptions.scrollbars) {
    const horizontalScroll =
      options.moveOptions.scrollbars === true ||
      !!options.moveOptions.scrollbars.horizontal;
    const verticalScroll =
      options.moveOptions.scrollbars === true ||
      !!options.moveOptions.scrollbars.vertical;
    mainWorkspace.scrollbar = new ScrollbarPair(
      mainWorkspace,
      horizontalScroll,
      verticalScroll,
      'blocklyMainWorkspaceScrollbar',
    );
    mainWorkspace.scrollbar.resize();
  } else {
    mainWorkspace.setMetrics({x: 0.5, y: 0.5});
  }

  // Load the sounds.
  if (options.hasSounds) {
    loadSounds(options.pathToMedia, mainWorkspace);
  }
}

/**
 * Handle a key-down on SVG drawing surface. Does nothing if the main workspace
 * is not visible.
 *
 * @param e Key down event.
 */
// TODO (https://github.com/google/blockly/issues/1998) handle cases where there
// are multiple workspaces and non-main workspaces are able to accept input.
function onKeyDown(e: KeyboardEvent) {
  const mainWorkspace = common.getMainWorkspace() as WorkspaceSvg;
  if (!mainWorkspace) {
    return;
  }

  if (
    browserEvents.isTargetInput(e) ||
    (mainWorkspace.rendered && !mainWorkspace.isVisible())
  ) {
    // When focused on an HTML text input widget, don't trap any keys.
    // Ignore keypresses on rendered workspaces that have been explicitly
    // hidden.
    return;
  }
  ShortcutRegistry.registry.onKeyDown(mainWorkspace, e);
}

/**
 * Whether event handlers have been bound. Document event handlers will only
 * be bound once, even if Blockly is destroyed and reinjected.
 */
let documentEventsBound = false;

/**
 * Bind document events, but only once.  Destroying and reinjecting Blockly
 * should not bind again.
 * Bind events for scrolling the workspace.
 * Most of these events should be bound to the SVG's surface.
 * However, 'mouseup' has to be on the whole document so that a block dragged
 * out of bounds and released will know that it has been released.
 * Also, 'keydown' has to be on the whole document since the browser doesn't
 * understand a concept of focus on the SVG image.
 */
function bindDocumentEvents() {
  if (!documentEventsBound) {
    browserEvents.conditionalBind(document, 'scroll', null, function () {
      const workspaces = common.getAllWorkspaces();
      for (let i = 0, workspace; (workspace = workspaces[i]); i++) {
        if (workspace instanceof WorkspaceSvg) {
          workspace.updateInverseScreenCTM();
        }
      }
    });
    browserEvents.conditionalBind(document, 'keydown', null, onKeyDown);
    // longStop needs to run to stop the context menu from showing up.  It
    // should run regardless of what other touch event handlers have run.
    browserEvents.bind(document, 'touchend', null, Touch.longStop);
    browserEvents.bind(document, 'touchcancel', null, Touch.longStop);
    // Some iPad versions don't fire resize after portrait to landscape change.
    if (userAgent.IPAD) {
      browserEvents.conditionalBind(
        window,
        'orientationchange',
        document,
        function () {
          // TODO (#397): Fix for multiple Blockly workspaces.
          common.svgResize(common.getMainWorkspace() as WorkspaceSvg);
        },
      );
    }
  }
  documentEventsBound = true;
}

/**
 * Load sounds for the given workspace.
 *
 * @param pathToMedia The path to the media directory.
 * @param workspace The workspace to load sounds for.
 */
function loadSounds(pathToMedia: string, workspace: WorkspaceSvg) {
  const audioMgr = workspace.getAudioManager();
  audioMgr.load(
    [
      pathToMedia + 'click.mp3',
      pathToMedia + 'click.wav',
      pathToMedia + 'click.ogg',
    ],
    'click',
  );
  audioMgr.load(
    [
      pathToMedia + 'disconnect.wav',
      pathToMedia + 'disconnect.mp3',
      pathToMedia + 'disconnect.ogg',
    ],
    'disconnect',
  );
  audioMgr.load(
    [
      pathToMedia + 'delete.mp3',
      pathToMedia + 'delete.ogg',
      pathToMedia + 'delete.wav',
    ],
    'delete',
  );

  // Bind temporary hooks that preload the sounds.
  const soundBinds: browserEvents.Data[] = [];
  /**
   *
   */
  function unbindSounds() {
    while (soundBinds.length) {
      const oldSoundBinding = soundBinds.pop();
      if (oldSoundBinding) {
        browserEvents.unbind(oldSoundBinding);
      }
    }
    audioMgr.preload();
  }

  // These are bound on mouse/touch events with
  // Blockly.browserEvents.conditionalBind, so they restrict the touch
  // identifier that will be recognized.  But this is really something that
  // happens on a click, not a drag, so that's not necessary.

  // Android ignores any sound not loaded as a result of a user action.
  soundBinds.push(
    browserEvents.conditionalBind(
      document,
      'pointermove',
      null,
      unbindSounds,
      true,
    ),
  );
  soundBinds.push(
    browserEvents.conditionalBind(
      document,
      'touchstart',
      null,
      unbindSounds,
      true,
    ),
  );
}
