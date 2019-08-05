declare namespace goog {
  function require(name: string): void;
  function provide(name: string): void;
  function isFunction(f: any): boolean;
  function isString(s: any): boolean;

  class Disposable {
    dispose(): void;
  }

  namespace dom {
    function createDom(tagName: string, opt_attributes?: Object, ...var_args: Object[]): Element;
    function createDom(name: string, ns?: string, children?: any): HTMLElement;
    function removeChildren(el: Element): void;
    function removeNode(node: Node): void;
    function getViewportSize(): any;

    namespace classlist {
      function add(el: Element, className: string): void;
    }

    class DomHelper {
    }
  }

  namespace ui {
    class Control extends Component {
      getChildCount(): number;
      getContent(): string | Node | Array<Node>;
      getContentElement(): Element;
      setChecked(checked: boolean): void;
      setContent(content: string | Node | Array<Node>): void;
      setVisible(visible: boolean, opt_force?: boolean): boolean;
    }
    class Component {
      static EventType: {
        BEFORE_SHOW: string;
        SHOW: string;
        HIDE: string;
        DISABLE: string;
        ENABLE: string;
        HIGHLIGHT: string;
        UNHIGHLIGHT: string;
        ACTIVATE: string;
        DEACTIVATE: string;
        SELECT: string;
        UNSELECT: string;
        CHECK: string;
        UNCHECK: string;
        FOCUS: string;
        BLUR: string;
        OPEN: string;
        CLOSE: string;
        ENTER: string;
        LEAVE: string;
        ACTION: string;
        CHANGE: string;
      };
      getHandler<T>(): events.EventHandler<T>;
      getElement(): Element;
      render(opt_parentElement?: Element): void;
      setId(id: string): void;
      setRightToLeft(rightToLeft: boolean): void;
      addChild(child: Component, opt_render?: boolean): void;
      getChildAt(index: number): Component;
      removeChildren(opt_unrender: boolean): void;
    }
    class Container extends Component {
    }
    class Menu extends Container implements events.Listenable {
      listen: () => events.ListenableKey;
      setAllowAutoFocus(allow: boolean): void;
    }
    class MenuItem extends Control {
      constructor(content: (string | Node));
      setCheckable(checkable: boolean): void;
      setValue(value: any): void;
      getValue(): any;
      addClassName(className: string): void;
    }
    class DatePicker extends Component {

    }
  }

  namespace ui.tree {
    class BaseNode {
    }
    class TreeControl__Class {
    }
    class TreeNode__Class {
    }
  }

  namespace events {
    function listen(eventSource: Element | Listenable, eventType: EventType, listener: any, capturePhase?: boolean, handler?: Object): void;
    function unlistenByKey(key: any): void;
    interface ListenableKey {
      key: number;
    }
    interface Listenable {
      listen: () => ListenableKey;
    }
    type EventType = string;
    let EventType: {
      CLICK: EventType;
      RIGHTCLICK: EventType;
      DBLCLICK: EventType;
      MOUSEDOWN: EventType;
      MOUSEUP: EventType;
      MOUSEOVER: EventType;
      MOUSEOUT: EventType;
      MOUSEMOVE: EventType;
      MOUSEENTER: EventType;
      MOUSELEAVE: EventType;
      SELECTSTART: EventType;
      WHEEL: EventType;
      KEYPRESS: EventType;
      KEYDOWN: EventType;
      KEYUP: EventType;
      BLUR: EventType;
      FOCUS: EventType;
      DEACTIVATE: EventType;
      FOCUSIN: EventType;
      FOCUSOUT: EventType;
      CHANGE: EventType;
      SELECT: EventType;
      SUBMIT: EventType;
      INPUT: EventType;
      PROPERTYCHANGE: EventType;
      DRAGSTART: EventType;
      DRAG: EventType;
      DRAGENTER: EventType;
      DRAGOVER: EventType;
      DRAGLEAVE: EventType;
      DROP: EventType;
      DRAGEND: EventType;
      TOUCHSTART: EventType;
      TOUCHMOVE: EventType;
      TOUCHEND: EventType;
      TOUCHCANCEL: EventType;
      BEFOREUNLOAD: EventType;
      CONSOLEMESSAGE: EventType;
      CONTEXTMENU: EventType;
      DOMCONTENTLOADED: EventType;
      ERROR: EventType;
      HELP: EventType;
      LOAD: EventType;
      LOSECAPTURE: EventType;
      ORIENTATIONCHANGE: EventType;
      READYSTATECHANGE: EventType;
      RESIZE: EventType;
      SCROLL: EventType;
      UNLOAD: EventType;
      HASHCHANGE: EventType;
      PAGEHIDE: EventType;
      PAGESHOW: EventType;
      POPSTATE: EventType;
      COPY: EventType;
      PASTE: EventType;
      CUT: EventType;
      BEFORECOPY: EventType;
      BEFORECUT: EventType;
      BEFOREPASTE: EventType;
      ONLINE: EventType;
      OFFLINE: EventType;
      MESSAGE: EventType;
      CONNECT: EventType;
      ANIMATIONSTART: EventType;
      ANIMATIONEND: EventType;
      ANIMATIONITERATION: EventType;
      TRANSITIONEND: EventType;
      POINTERDOWN: EventType;
      POINTERUP: EventType;
      POINTERCANCEL: EventType;
      POINTERMOVE: EventType;
      POINTEROVER: EventType;
      POINTEROUT: EventType;
      POINTERENTER: EventType;
      POINTERLEAVE: EventType;
      GOTPOINTERCAPTURE: EventType;
      LOSTPOINTERCAPTURE: EventType;
      MSGESTURECHANGE: EventType;
      MSGESTUREEND: EventType;
      MSGESTUREHOLD: EventType;
      MSGESTURESTART: EventType;
      MSGESTURETAP: EventType;
      MSGOTPOINTERCAPTURE: EventType;
      MSINERTIASTART: EventType;
      MSLOSTPOINTERCAPTURE: EventType;
      MSPOINTERCANCEL: EventType;
      MSPOINTERDOWN: EventType;
      MSPOINTERENTER: EventType;
      MSPOINTERHOVER: EventType;
      MSPOINTERLEAVE: EventType;
      MSPOINTERMOVE: EventType;
      MSPOINTEROUT: EventType;
      MSPOINTEROVER: EventType;
      MSPOINTERUP: EventType;
      TEXT: EventType;
      TEXTINPUT: EventType;
      COMPOSITIONSTART: EventType;
      COMPOSITIONUPDATE: EventType;
      COMPOSITIONEND: EventType;
      EXIT: EventType;
      LOADABORT: EventType;
      LOADCOMMIT: EventType;
      LOADREDIRECT: EventType;
      LOADSTART: EventType;
      LOADSTOP: EventType;
      RESPONSIVE: EventType;
      SIZECHANGED: EventType;
      UNRESPONSIVE: EventType;
      VISIBILITYCHANGE: EventType;
      STORAGE: EventType;
      DOMSUBTREEMODIFIED: EventType;
      DOMNODEINSERTED: EventType;
      DOMNODEREMOVED: EventType;
      DOMNODEREMOVEDFROMDOCUMENT: EventType;
      DOMNODEINSERTEDINTODOCUMENT: EventType;
      DOMATTRMODIFIED: EventType;
      DOMCHARACTERDATAMODIFIED: EventType;
    };
    let KeyCodes: {
      A: number,
      ALT: number,
      APOSTROPHE: number,
      AT_SIGN: number,
      B: number,
      BACKSLASH: number,
      BACKSPACE: number,
      C: number,
      CAPS_LOCK: number,
      CLOSE_SQUARE_BRACKET: number,
      COMMA: number,
      CONTEXT_MENU: number,
      CTRL: number,
      D: number,
      DASH: number,
      DELETE: number,
      DOWN: number,
      E: number,
      EIGHT: number,
      END: number,
      ENTER: number,
      EQUALS: number,
      ESC: number,
      F: number,
      F1: number,
      F10: number,
      F11: number,
      F12: number,
      F2: number,
      F3: number,
      F4: number,
      F5: number,
      F6: number,
      F7: number,
      F8: number,
      F9: number,
      FF_DASH: number,
      FF_EQUALS: number,
      FF_SEMICOLON: number,
      FIRST_MEDIA_KEY: number,
      FIVE: number,
      FOUR: number,
      G: number,
      H: number,
      HOME: number,
      I: number,
      INSERT: number,
      J: number,
      K: number,
      L: number,
      LAST_MEDIA_KEY: number,
      LEFT: number,
      M: number,
      MAC_ENTER: number,
      MAC_FF_META: number,
      MAC_WK_CMD_LEFT: number,
      MAC_WK_CMD_RIGHT: number,
      META: number,
      N: number,
      NINE: number,
      NUMLOCK: number,
      NUM_CENTER: number,
      NUM_DIVISION: number,
      NUM_EIGHT: number,
      NUM_FIVE: number,
      NUM_FOUR: number,
      NUM_MINUS: number,
      NUM_MULTIPLY: number,
      NUM_NINE: number,
      NUM_ONE: number,
      NUM_PERIOD: number,
      NUM_PLUS: number,
      NUM_SEVEN: number,
      NUM_SIX: number,
      NUM_THREE: number,
      NUM_TWO: number,
      NUM_ZERO: number,
      O: number,
      ONE: number,
      OPEN_SQUARE_BRACKET: number,
      P: number,
      PAGE_DOWN: number,
      PAGE_UP: number,
      PAUSE: number,
      PERIOD: number,
      PHANTOM: number,
      PLUS_SIGN: number,
      PRINT_SCREEN: number,
      Q: number,
      QUESTION_MARK: number,
      R: number,
      RIGHT: number,
      S: number,
      SCROLL_LOCK: number,
      SEMICOLON: number,
      SEVEN: number,
      SHIFT: number,
      SINGLE_QUOTE: number,
      SIX: number,
      SLASH: number,
      SPACE: number,
      T: number,
      TAB: number,
      THREE: number,
      TILDE: number,
      TWO: number,
      U: number,
      UP: number,
      V: number,
      VK_NONAME: number,
      W: number,
      WIN_IME: number,
      WIN_KEY: number,
      WIN_KEY_FF_LINUX: number,
      WIN_KEY_RIGHT: number,
      X: number,
      Y: number,
      Z: number,
      ZERO: number
    }
    class EventTarget extends Disposable {
    }
    class EventHandler<T> {
      handleEvent(e: any): void;
      listen(src: Element | Listenable, type: string, opt_fn?: any): EventHandler<T>;
    }

    /**
    * Accepts a browser event object and creates a patched, cross browser event
    * object.
    * The content of this object will not be initialized if no event object is
    * provided. If this is the case, init() needs to be invoked separately.
    * @param {Event=} opt_e Browser event object.
    * @param {EventTarget=} opt_currentTarget Current target for event.
    */
    class BrowserEvent {
      constructor(opt_e?: Event, opt_currentTarget?: EventTarget);
    }
  }
  namespace userAgent {
    /**
     * Whether the user agent is running on a mobile device.
     *
     * TODO(nnaze): Consider deprecating MOBILE when labs.userAgent
     *   is promoted as the gecko/webkit logic is likely inaccurate.
     *
     * @type {boolean}
     */
    var MOBILE: boolean;

    /**
     * Whether the user agent is running on Android.
     * @type {boolean}
     */
    var ANDROID: boolean;

    /**
     * Whether the user agent is running on an iPhone.
     * @type {boolean}
     */
    var IPHONE: boolean;

    /**
     * Whether the user agent is running on an iPad.
     * @type {boolean}
     */
    var IPAD: boolean;
  }
  namespace html {
    class SafeHtml {
    }
  }
  namespace positioning {
    class ClientPosition {
      constructor(x: number, y: number);
    }
  }
}