/* */ 
"format cjs";
(function(process) {
  (function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common'), require('@angular/core')) : typeof define === 'function' && define.amd ? define(['exports', '@angular/common', '@angular/core'], factory) : (factory((global.ng = global.ng || {}, global.ng.platformBrowser = global.ng.platformBrowser || {}), global.ng.common, global.ng.core));
  }(this, function(exports, _angular_common, _angular_core) {
    'use strict';
    var DebugDomRootRenderer = _angular_core.__core_private__.DebugDomRootRenderer;
    var NoOpAnimationPlayer = _angular_core.__core_private__.NoOpAnimationPlayer;
    var _NoOpAnimationDriver = (function() {
      function _NoOpAnimationDriver() {}
      _NoOpAnimationDriver.prototype.animate = function(element, startingStyles, keyframes, duration, delay, easing) {
        return new NoOpAnimationPlayer();
      };
      return _NoOpAnimationDriver;
    }());
    var AnimationDriver = (function() {
      function AnimationDriver() {}
      AnimationDriver.NOOP = new _NoOpAnimationDriver();
      return AnimationDriver;
    }());
    var globalScope;
    if (typeof window === 'undefined') {
      if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
        globalScope = self;
      } else {
        globalScope = global;
      }
    } else {
      globalScope = window;
    }
    var global$1 = globalScope;
    global$1.assert = function assert(condition) {};
    function isPresent(obj) {
      return obj != null;
    }
    function isBlank(obj) {
      return obj == null;
    }
    function stringify(token) {
      if (typeof token === 'string') {
        return token;
      }
      if (token == null) {
        return '' + token;
      }
      if (token.overriddenName) {
        return token.overriddenName;
      }
      if (token.name) {
        return token.name;
      }
      var res = token.toString();
      var newLineIndex = res.indexOf('\n');
      return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
    }
    function setValueOnPath(global, path, value) {
      var parts = path.split('.');
      var obj = global;
      while (parts.length > 1) {
        var name_1 = parts.shift();
        if (obj.hasOwnProperty(name_1) && obj[name_1] != null) {
          obj = obj[name_1];
        } else {
          obj = obj[name_1] = {};
        }
      }
      if (obj === undefined || obj === null) {
        obj = {};
      }
      obj[parts.shift()] = value;
    }
    var _DOM = null;
    function getDOM() {
      return _DOM;
    }
    function setRootDomAdapter(adapter) {
      if (!_DOM) {
        _DOM = adapter;
      }
    }
    var DomAdapter = (function() {
      function DomAdapter() {
        this.resourceLoaderType = null;
      }
      Object.defineProperty(DomAdapter.prototype, "attrToPropMap", {
        get: function() {
          return this._attrToPropMap;
        },
        set: function(value) {
          this._attrToPropMap = value;
        },
        enumerable: true,
        configurable: true
      });
      ;
      ;
      return DomAdapter;
    }());
    var WebAnimationsPlayer = (function() {
      function WebAnimationsPlayer(element, keyframes, options) {
        this.element = element;
        this.keyframes = keyframes;
        this.options = options;
        this._onDoneFns = [];
        this._onStartFns = [];
        this._initialized = false;
        this._finished = false;
        this._started = false;
        this._destroyed = false;
        this.parentPlayer = null;
        this._duration = options['duration'];
      }
      WebAnimationsPlayer.prototype._onFinish = function() {
        if (!this._finished) {
          this._finished = true;
          this._onDoneFns.forEach(function(fn) {
            return fn();
          });
          this._onDoneFns = [];
        }
      };
      WebAnimationsPlayer.prototype.init = function() {
        var _this = this;
        if (this._initialized)
          return;
        this._initialized = true;
        var keyframes = this.keyframes.map(function(styles) {
          var formattedKeyframe = {};
          Object.keys(styles).forEach(function(prop) {
            var value = styles[prop];
            formattedKeyframe[prop] = value == _angular_core.AUTO_STYLE ? _computeStyle(_this.element, prop) : value;
          });
          return formattedKeyframe;
        });
        this._player = this._triggerWebAnimation(this.element, keyframes, this.options);
        this._resetDomPlayerState();
        this._player.addEventListener('finish', function() {
          return _this._onFinish();
        });
      };
      WebAnimationsPlayer.prototype._triggerWebAnimation = function(element, keyframes, options) {
        return element.animate(keyframes, options);
      };
      Object.defineProperty(WebAnimationsPlayer.prototype, "domPlayer", {
        get: function() {
          return this._player;
        },
        enumerable: true,
        configurable: true
      });
      WebAnimationsPlayer.prototype.onStart = function(fn) {
        this._onStartFns.push(fn);
      };
      WebAnimationsPlayer.prototype.onDone = function(fn) {
        this._onDoneFns.push(fn);
      };
      WebAnimationsPlayer.prototype.play = function() {
        this.init();
        if (!this.hasStarted()) {
          this._onStartFns.forEach(function(fn) {
            return fn();
          });
          this._onStartFns = [];
          this._started = true;
        }
        this._player.play();
      };
      WebAnimationsPlayer.prototype.pause = function() {
        this.init();
        this._player.pause();
      };
      WebAnimationsPlayer.prototype.finish = function() {
        this.init();
        this._onFinish();
        this._player.finish();
      };
      WebAnimationsPlayer.prototype.reset = function() {
        this._resetDomPlayerState();
        this._destroyed = false;
        this._finished = false;
        this._started = false;
      };
      WebAnimationsPlayer.prototype._resetDomPlayerState = function() {
        this._player.cancel();
      };
      WebAnimationsPlayer.prototype.restart = function() {
        this.reset();
        this.play();
      };
      WebAnimationsPlayer.prototype.hasStarted = function() {
        return this._started;
      };
      WebAnimationsPlayer.prototype.destroy = function() {
        if (!this._destroyed) {
          this._resetDomPlayerState();
          this._onFinish();
          this._destroyed = true;
        }
      };
      Object.defineProperty(WebAnimationsPlayer.prototype, "totalTime", {
        get: function() {
          return this._duration;
        },
        enumerable: true,
        configurable: true
      });
      WebAnimationsPlayer.prototype.setPosition = function(p) {
        this._player.currentTime = p * this.totalTime;
      };
      WebAnimationsPlayer.prototype.getPosition = function() {
        return this._player.currentTime / this.totalTime;
      };
      return WebAnimationsPlayer;
    }());
    function _computeStyle(element, prop) {
      return getDOM().getComputedStyle(element)[prop];
    }
    var WebAnimationsDriver = (function() {
      function WebAnimationsDriver() {}
      WebAnimationsDriver.prototype.animate = function(element, startingStyles, keyframes, duration, delay, easing) {
        var formattedSteps = [];
        var startingStyleLookup = {};
        if (isPresent(startingStyles) && startingStyles.styles.length > 0) {
          startingStyleLookup = _populateStyles(element, startingStyles, {});
          startingStyleLookup['offset'] = 0;
          formattedSteps.push(startingStyleLookup);
        }
        keyframes.forEach(function(keyframe) {
          var data = _populateStyles(element, keyframe.styles, startingStyleLookup);
          data['offset'] = keyframe.offset;
          formattedSteps.push(data);
        });
        if (formattedSteps.length == 1) {
          var start = formattedSteps[0];
          start['offset'] = null;
          formattedSteps = [start, start];
        }
        var playerOptions = {
          'duration': duration,
          'delay': delay,
          'fill': 'both'
        };
        if (easing) {
          playerOptions['easing'] = easing;
        }
        return new WebAnimationsPlayer(element, formattedSteps, playerOptions);
      };
      return WebAnimationsDriver;
    }());
    function _populateStyles(element, styles, defaultStyles) {
      var data = {};
      styles.styles.forEach(function(entry) {
        Object.keys(entry).forEach(function(prop) {
          data[prop] = entry[prop];
        });
      });
      Object.keys(defaultStyles).forEach(function(prop) {
        if (!isPresent(data[prop])) {
          data[prop] = defaultStyles[prop];
        }
      });
      return data;
    }
    var __extends$1 = (this && this.__extends) || function(d, b) {
      for (var p in b)
        if (b.hasOwnProperty(p))
          d[p] = b[p];
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var GenericBrowserDomAdapter = (function(_super) {
      __extends$1(GenericBrowserDomAdapter, _super);
      function GenericBrowserDomAdapter() {
        var _this = this;
        _super.call(this);
        this._animationPrefix = null;
        this._transitionEnd = null;
        try {
          var element_1 = this.createElement('div', this.defaultDoc());
          if (isPresent(this.getStyle(element_1, 'animationName'))) {
            this._animationPrefix = '';
          } else {
            var domPrefixes = ['Webkit', 'Moz', 'O', 'ms'];
            for (var i = 0; i < domPrefixes.length; i++) {
              if (isPresent(this.getStyle(element_1, domPrefixes[i] + 'AnimationName'))) {
                this._animationPrefix = '-' + domPrefixes[i].toLowerCase() + '-';
                break;
              }
            }
          }
          var transEndEventNames_1 = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
          };
          Object.keys(transEndEventNames_1).forEach(function(key) {
            if (isPresent(_this.getStyle(element_1, key))) {
              _this._transitionEnd = transEndEventNames_1[key];
            }
          });
        } catch (e) {
          this._animationPrefix = null;
          this._transitionEnd = null;
        }
      }
      GenericBrowserDomAdapter.prototype.getDistributedNodes = function(el) {
        return el.getDistributedNodes();
      };
      GenericBrowserDomAdapter.prototype.resolveAndSetHref = function(el, baseUrl, href) {
        el.href = href == null ? baseUrl : baseUrl + '/../' + href;
      };
      GenericBrowserDomAdapter.prototype.supportsDOMEvents = function() {
        return true;
      };
      GenericBrowserDomAdapter.prototype.supportsNativeShadowDOM = function() {
        return typeof this.defaultDoc().body.createShadowRoot === 'function';
      };
      GenericBrowserDomAdapter.prototype.getAnimationPrefix = function() {
        return this._animationPrefix ? this._animationPrefix : '';
      };
      GenericBrowserDomAdapter.prototype.getTransitionEnd = function() {
        return this._transitionEnd ? this._transitionEnd : '';
      };
      GenericBrowserDomAdapter.prototype.supportsAnimation = function() {
        return isPresent(this._animationPrefix) && isPresent(this._transitionEnd);
      };
      return GenericBrowserDomAdapter;
    }(DomAdapter));
    var __extends = (this && this.__extends) || function(d, b) {
      for (var p in b)
        if (b.hasOwnProperty(p))
          d[p] = b[p];
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var _attrToPropMap = {
      'class': 'className',
      'innerHtml': 'innerHTML',
      'readonly': 'readOnly',
      'tabindex': 'tabIndex'
    };
    var DOM_KEY_LOCATION_NUMPAD = 3;
    var _keyMap = {
      '\b': 'Backspace',
      '\t': 'Tab',
      '\x7F': 'Delete',
      '\x1B': 'Escape',
      'Del': 'Delete',
      'Esc': 'Escape',
      'Left': 'ArrowLeft',
      'Right': 'ArrowRight',
      'Up': 'ArrowUp',
      'Down': 'ArrowDown',
      'Menu': 'ContextMenu',
      'Scroll': 'ScrollLock',
      'Win': 'OS'
    };
    var _chromeNumKeyPadMap = {
      'A': '1',
      'B': '2',
      'C': '3',
      'D': '4',
      'E': '5',
      'F': '6',
      'G': '7',
      'H': '8',
      'I': '9',
      'J': '*',
      'K': '+',
      'M': '-',
      'N': '.',
      'O': '/',
      '\x60': '0',
      '\x90': 'NumLock'
    };
    var BrowserDomAdapter = (function(_super) {
      __extends(BrowserDomAdapter, _super);
      function BrowserDomAdapter() {
        _super.apply(this, arguments);
      }
      BrowserDomAdapter.prototype.parse = function(templateHtml) {
        throw new Error('parse not implemented');
      };
      BrowserDomAdapter.makeCurrent = function() {
        setRootDomAdapter(new BrowserDomAdapter());
      };
      BrowserDomAdapter.prototype.hasProperty = function(element, name) {
        return name in element;
      };
      BrowserDomAdapter.prototype.setProperty = function(el, name, value) {
        el[name] = value;
      };
      BrowserDomAdapter.prototype.getProperty = function(el, name) {
        return el[name];
      };
      BrowserDomAdapter.prototype.invoke = function(el, methodName, args) {
        (_a = el)[methodName].apply(_a, args);
        var _a;
      };
      BrowserDomAdapter.prototype.logError = function(error) {
        if (window.console) {
          (window.console.error || window.console.log)(error);
        }
      };
      BrowserDomAdapter.prototype.log = function(error) {
        if (window.console) {
          window.console.log && window.console.log(error);
        }
      };
      BrowserDomAdapter.prototype.logGroup = function(error) {
        if (window.console) {
          window.console.group && window.console.group(error);
          this.logError(error);
        }
      };
      BrowserDomAdapter.prototype.logGroupEnd = function() {
        if (window.console) {
          window.console.groupEnd && window.console.groupEnd();
        }
      };
      Object.defineProperty(BrowserDomAdapter.prototype, "attrToPropMap", {
        get: function() {
          return _attrToPropMap;
        },
        enumerable: true,
        configurable: true
      });
      BrowserDomAdapter.prototype.query = function(selector) {
        return document.querySelector(selector);
      };
      BrowserDomAdapter.prototype.querySelector = function(el, selector) {
        return el.querySelector(selector);
      };
      BrowserDomAdapter.prototype.querySelectorAll = function(el, selector) {
        return el.querySelectorAll(selector);
      };
      BrowserDomAdapter.prototype.on = function(el, evt, listener) {
        el.addEventListener(evt, listener, false);
      };
      BrowserDomAdapter.prototype.onAndCancel = function(el, evt, listener) {
        el.addEventListener(evt, listener, false);
        return function() {
          el.removeEventListener(evt, listener, false);
        };
      };
      BrowserDomAdapter.prototype.dispatchEvent = function(el, evt) {
        el.dispatchEvent(evt);
      };
      BrowserDomAdapter.prototype.createMouseEvent = function(eventType) {
        var evt = document.createEvent('MouseEvent');
        evt.initEvent(eventType, true, true);
        return evt;
      };
      BrowserDomAdapter.prototype.createEvent = function(eventType) {
        var evt = document.createEvent('Event');
        evt.initEvent(eventType, true, true);
        return evt;
      };
      BrowserDomAdapter.prototype.preventDefault = function(evt) {
        evt.preventDefault();
        evt.returnValue = false;
      };
      BrowserDomAdapter.prototype.isPrevented = function(evt) {
        return evt.defaultPrevented || isPresent(evt.returnValue) && !evt.returnValue;
      };
      BrowserDomAdapter.prototype.getInnerHTML = function(el) {
        return el.innerHTML;
      };
      BrowserDomAdapter.prototype.getTemplateContent = function(el) {
        return 'content' in el && el instanceof HTMLTemplateElement ? el.content : null;
      };
      BrowserDomAdapter.prototype.getOuterHTML = function(el) {
        return el.outerHTML;
      };
      BrowserDomAdapter.prototype.nodeName = function(node) {
        return node.nodeName;
      };
      BrowserDomAdapter.prototype.nodeValue = function(node) {
        return node.nodeValue;
      };
      BrowserDomAdapter.prototype.type = function(node) {
        return node.type;
      };
      BrowserDomAdapter.prototype.content = function(node) {
        if (this.hasProperty(node, 'content')) {
          return node.content;
        } else {
          return node;
        }
      };
      BrowserDomAdapter.prototype.firstChild = function(el) {
        return el.firstChild;
      };
      BrowserDomAdapter.prototype.nextSibling = function(el) {
        return el.nextSibling;
      };
      BrowserDomAdapter.prototype.parentElement = function(el) {
        return el.parentNode;
      };
      BrowserDomAdapter.prototype.childNodes = function(el) {
        return el.childNodes;
      };
      BrowserDomAdapter.prototype.childNodesAsList = function(el) {
        var childNodes = el.childNodes;
        var res = new Array(childNodes.length);
        for (var i = 0; i < childNodes.length; i++) {
          res[i] = childNodes[i];
        }
        return res;
      };
      BrowserDomAdapter.prototype.clearNodes = function(el) {
        while (el.firstChild) {
          el.removeChild(el.firstChild);
        }
      };
      BrowserDomAdapter.prototype.appendChild = function(el, node) {
        el.appendChild(node);
      };
      BrowserDomAdapter.prototype.removeChild = function(el, node) {
        el.removeChild(node);
      };
      BrowserDomAdapter.prototype.replaceChild = function(el, newChild, oldChild) {
        el.replaceChild(newChild, oldChild);
      };
      BrowserDomAdapter.prototype.remove = function(node) {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
        return node;
      };
      BrowserDomAdapter.prototype.insertBefore = function(el, node) {
        el.parentNode.insertBefore(node, el);
      };
      BrowserDomAdapter.prototype.insertAllBefore = function(el, nodes) {
        nodes.forEach(function(n) {
          return el.parentNode.insertBefore(n, el);
        });
      };
      BrowserDomAdapter.prototype.insertAfter = function(el, node) {
        el.parentNode.insertBefore(node, el.nextSibling);
      };
      BrowserDomAdapter.prototype.setInnerHTML = function(el, value) {
        el.innerHTML = value;
      };
      BrowserDomAdapter.prototype.getText = function(el) {
        return el.textContent;
      };
      BrowserDomAdapter.prototype.setText = function(el, value) {
        el.textContent = value;
      };
      BrowserDomAdapter.prototype.getValue = function(el) {
        return el.value;
      };
      BrowserDomAdapter.prototype.setValue = function(el, value) {
        el.value = value;
      };
      BrowserDomAdapter.prototype.getChecked = function(el) {
        return el.checked;
      };
      BrowserDomAdapter.prototype.setChecked = function(el, value) {
        el.checked = value;
      };
      BrowserDomAdapter.prototype.createComment = function(text) {
        return document.createComment(text);
      };
      BrowserDomAdapter.prototype.createTemplate = function(html) {
        var t = document.createElement('template');
        t.innerHTML = html;
        return t;
      };
      BrowserDomAdapter.prototype.createElement = function(tagName, doc) {
        if (doc === void 0) {
          doc = document;
        }
        return doc.createElement(tagName);
      };
      BrowserDomAdapter.prototype.createElementNS = function(ns, tagName, doc) {
        if (doc === void 0) {
          doc = document;
        }
        return doc.createElementNS(ns, tagName);
      };
      BrowserDomAdapter.prototype.createTextNode = function(text, doc) {
        if (doc === void 0) {
          doc = document;
        }
        return doc.createTextNode(text);
      };
      BrowserDomAdapter.prototype.createScriptTag = function(attrName, attrValue, doc) {
        if (doc === void 0) {
          doc = document;
        }
        var el = doc.createElement('SCRIPT');
        el.setAttribute(attrName, attrValue);
        return el;
      };
      BrowserDomAdapter.prototype.createStyleElement = function(css, doc) {
        if (doc === void 0) {
          doc = document;
        }
        var style = doc.createElement('style');
        this.appendChild(style, this.createTextNode(css));
        return style;
      };
      BrowserDomAdapter.prototype.createShadowRoot = function(el) {
        return el.createShadowRoot();
      };
      BrowserDomAdapter.prototype.getShadowRoot = function(el) {
        return el.shadowRoot;
      };
      BrowserDomAdapter.prototype.getHost = function(el) {
        return el.host;
      };
      BrowserDomAdapter.prototype.clone = function(node) {
        return node.cloneNode(true);
      };
      BrowserDomAdapter.prototype.getElementsByClassName = function(element, name) {
        return element.getElementsByClassName(name);
      };
      BrowserDomAdapter.prototype.getElementsByTagName = function(element, name) {
        return element.getElementsByTagName(name);
      };
      BrowserDomAdapter.prototype.classList = function(element) {
        return Array.prototype.slice.call(element.classList, 0);
      };
      BrowserDomAdapter.prototype.addClass = function(element, className) {
        element.classList.add(className);
      };
      BrowserDomAdapter.prototype.removeClass = function(element, className) {
        element.classList.remove(className);
      };
      BrowserDomAdapter.prototype.hasClass = function(element, className) {
        return element.classList.contains(className);
      };
      BrowserDomAdapter.prototype.setStyle = function(element, styleName, styleValue) {
        element.style[styleName] = styleValue;
      };
      BrowserDomAdapter.prototype.removeStyle = function(element, stylename) {
        element.style[stylename] = '';
      };
      BrowserDomAdapter.prototype.getStyle = function(element, stylename) {
        return element.style[stylename];
      };
      BrowserDomAdapter.prototype.hasStyle = function(element, styleName, styleValue) {
        if (styleValue === void 0) {
          styleValue = null;
        }
        var value = this.getStyle(element, styleName) || '';
        return styleValue ? value == styleValue : value.length > 0;
      };
      BrowserDomAdapter.prototype.tagName = function(element) {
        return element.tagName;
      };
      BrowserDomAdapter.prototype.attributeMap = function(element) {
        var res = new Map();
        var elAttrs = element.attributes;
        for (var i = 0; i < elAttrs.length; i++) {
          var attrib = elAttrs[i];
          res.set(attrib.name, attrib.value);
        }
        return res;
      };
      BrowserDomAdapter.prototype.hasAttribute = function(element, attribute) {
        return element.hasAttribute(attribute);
      };
      BrowserDomAdapter.prototype.hasAttributeNS = function(element, ns, attribute) {
        return element.hasAttributeNS(ns, attribute);
      };
      BrowserDomAdapter.prototype.getAttribute = function(element, attribute) {
        return element.getAttribute(attribute);
      };
      BrowserDomAdapter.prototype.getAttributeNS = function(element, ns, name) {
        return element.getAttributeNS(ns, name);
      };
      BrowserDomAdapter.prototype.setAttribute = function(element, name, value) {
        element.setAttribute(name, value);
      };
      BrowserDomAdapter.prototype.setAttributeNS = function(element, ns, name, value) {
        element.setAttributeNS(ns, name, value);
      };
      BrowserDomAdapter.prototype.removeAttribute = function(element, attribute) {
        element.removeAttribute(attribute);
      };
      BrowserDomAdapter.prototype.removeAttributeNS = function(element, ns, name) {
        element.removeAttributeNS(ns, name);
      };
      BrowserDomAdapter.prototype.templateAwareRoot = function(el) {
        return this.isTemplateElement(el) ? this.content(el) : el;
      };
      BrowserDomAdapter.prototype.createHtmlDocument = function() {
        return document.implementation.createHTMLDocument('fakeTitle');
      };
      BrowserDomAdapter.prototype.defaultDoc = function() {
        return document;
      };
      BrowserDomAdapter.prototype.getBoundingClientRect = function(el) {
        try {
          return el.getBoundingClientRect();
        } catch (e) {
          return {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            width: 0,
            height: 0
          };
        }
      };
      BrowserDomAdapter.prototype.getTitle = function() {
        return document.title;
      };
      BrowserDomAdapter.prototype.setTitle = function(newTitle) {
        document.title = newTitle || '';
      };
      BrowserDomAdapter.prototype.elementMatches = function(n, selector) {
        if (n instanceof HTMLElement) {
          return n.matches && n.matches(selector) || n.msMatchesSelector && n.msMatchesSelector(selector) || n.webkitMatchesSelector && n.webkitMatchesSelector(selector);
        }
        return false;
      };
      BrowserDomAdapter.prototype.isTemplateElement = function(el) {
        return el instanceof HTMLElement && el.nodeName == 'TEMPLATE';
      };
      BrowserDomAdapter.prototype.isTextNode = function(node) {
        return node.nodeType === Node.TEXT_NODE;
      };
      BrowserDomAdapter.prototype.isCommentNode = function(node) {
        return node.nodeType === Node.COMMENT_NODE;
      };
      BrowserDomAdapter.prototype.isElementNode = function(node) {
        return node.nodeType === Node.ELEMENT_NODE;
      };
      BrowserDomAdapter.prototype.hasShadowRoot = function(node) {
        return isPresent(node.shadowRoot) && node instanceof HTMLElement;
      };
      BrowserDomAdapter.prototype.isShadowRoot = function(node) {
        return node instanceof DocumentFragment;
      };
      BrowserDomAdapter.prototype.importIntoDoc = function(node) {
        return document.importNode(this.templateAwareRoot(node), true);
      };
      BrowserDomAdapter.prototype.adoptNode = function(node) {
        return document.adoptNode(node);
      };
      BrowserDomAdapter.prototype.getHref = function(el) {
        return el.href;
      };
      BrowserDomAdapter.prototype.getEventKey = function(event) {
        var key = event.key;
        if (isBlank(key)) {
          key = event.keyIdentifier;
          if (isBlank(key)) {
            return 'Unidentified';
          }
          if (key.startsWith('U+')) {
            key = String.fromCharCode(parseInt(key.substring(2), 16));
            if (event.location === DOM_KEY_LOCATION_NUMPAD && _chromeNumKeyPadMap.hasOwnProperty(key)) {
              key = _chromeNumKeyPadMap[key];
            }
          }
        }
        return _keyMap[key] || key;
      };
      BrowserDomAdapter.prototype.getGlobalEventTarget = function(target) {
        if (target === 'window') {
          return window;
        }
        if (target === 'document') {
          return document;
        }
        if (target === 'body') {
          return document.body;
        }
      };
      BrowserDomAdapter.prototype.getHistory = function() {
        return window.history;
      };
      BrowserDomAdapter.prototype.getLocation = function() {
        return window.location;
      };
      BrowserDomAdapter.prototype.getBaseHref = function() {
        var href = getBaseElementHref();
        return isBlank(href) ? null : relativePath(href);
      };
      BrowserDomAdapter.prototype.resetBaseElement = function() {
        baseElement = null;
      };
      BrowserDomAdapter.prototype.getUserAgent = function() {
        return window.navigator.userAgent;
      };
      BrowserDomAdapter.prototype.setData = function(element, name, value) {
        this.setAttribute(element, 'data-' + name, value);
      };
      BrowserDomAdapter.prototype.getData = function(element, name) {
        return this.getAttribute(element, 'data-' + name);
      };
      BrowserDomAdapter.prototype.getComputedStyle = function(element) {
        return getComputedStyle(element);
      };
      BrowserDomAdapter.prototype.setGlobalVar = function(path, value) {
        setValueOnPath(global$1, path, value);
      };
      BrowserDomAdapter.prototype.supportsWebAnimation = function() {
        return typeof Element.prototype['animate'] === 'function';
      };
      BrowserDomAdapter.prototype.performanceNow = function() {
        return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
      };
      BrowserDomAdapter.prototype.supportsCookies = function() {
        return true;
      };
      BrowserDomAdapter.prototype.getCookie = function(name) {
        return parseCookieValue(document.cookie, name);
      };
      BrowserDomAdapter.prototype.setCookie = function(name, value) {
        document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
      };
      return BrowserDomAdapter;
    }(GenericBrowserDomAdapter));
    var baseElement = null;
    function getBaseElementHref() {
      if (!baseElement) {
        baseElement = document.querySelector('base');
        if (!baseElement) {
          return null;
        }
      }
      return baseElement.getAttribute('href');
    }
    var urlParsingNode;
    function relativePath(url) {
      if (!urlParsingNode) {
        urlParsingNode = document.createElement('a');
      }
      urlParsingNode.setAttribute('href', url);
      return (urlParsingNode.pathname.charAt(0) === '/') ? urlParsingNode.pathname : '/' + urlParsingNode.pathname;
    }
    function parseCookieValue(cookieStr, name) {
      name = encodeURIComponent(name);
      for (var _i = 0,
          _a = cookieStr.split(';'); _i < _a.length; _i++) {
        var cookie = _a[_i];
        var eqIndex = cookie.indexOf('=');
        var _b = eqIndex == -1 ? [cookie, ''] : [cookie.slice(0, eqIndex), cookie.slice(eqIndex + 1)],
            cookieName = _b[0],
            cookieValue = _b[1];
        if (cookieName.trim() === name) {
          return decodeURIComponent(cookieValue);
        }
      }
      return null;
    }
    function supportsState() {
      return !!window.history.pushState;
    }
    var __extends$2 = (this && this.__extends) || function(d, b) {
      for (var p in b)
        if (b.hasOwnProperty(p))
          d[p] = b[p];
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var BrowserPlatformLocation = (function(_super) {
      __extends$2(BrowserPlatformLocation, _super);
      function BrowserPlatformLocation() {
        _super.call(this);
        this._init();
      }
      BrowserPlatformLocation.prototype._init = function() {
        this._location = getDOM().getLocation();
        this._history = getDOM().getHistory();
      };
      Object.defineProperty(BrowserPlatformLocation.prototype, "location", {
        get: function() {
          return this._location;
        },
        enumerable: true,
        configurable: true
      });
      BrowserPlatformLocation.prototype.getBaseHrefFromDOM = function() {
        return getDOM().getBaseHref();
      };
      BrowserPlatformLocation.prototype.onPopState = function(fn) {
        getDOM().getGlobalEventTarget('window').addEventListener('popstate', fn, false);
      };
      BrowserPlatformLocation.prototype.onHashChange = function(fn) {
        getDOM().getGlobalEventTarget('window').addEventListener('hashchange', fn, false);
      };
      Object.defineProperty(BrowserPlatformLocation.prototype, "pathname", {
        get: function() {
          return this._location.pathname;
        },
        set: function(newPath) {
          this._location.pathname = newPath;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(BrowserPlatformLocation.prototype, "search", {
        get: function() {
          return this._location.search;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(BrowserPlatformLocation.prototype, "hash", {
        get: function() {
          return this._location.hash;
        },
        enumerable: true,
        configurable: true
      });
      BrowserPlatformLocation.prototype.pushState = function(state, title, url) {
        if (supportsState()) {
          this._history.pushState(state, title, url);
        } else {
          this._location.hash = url;
        }
      };
      BrowserPlatformLocation.prototype.replaceState = function(state, title, url) {
        if (supportsState()) {
          this._history.replaceState(state, title, url);
        } else {
          this._location.hash = url;
        }
      };
      BrowserPlatformLocation.prototype.forward = function() {
        this._history.forward();
      };
      BrowserPlatformLocation.prototype.back = function() {
        this._history.back();
      };
      BrowserPlatformLocation.decorators = [{type: _angular_core.Injectable}];
      BrowserPlatformLocation.ctorParameters = [];
      return BrowserPlatformLocation;
    }(_angular_common.PlatformLocation));
    var BrowserGetTestability = (function() {
      function BrowserGetTestability() {}
      BrowserGetTestability.init = function() {
        _angular_core.setTestabilityGetter(new BrowserGetTestability());
      };
      BrowserGetTestability.prototype.addToWindow = function(registry) {
        global$1.getAngularTestability = function(elem, findInAncestors) {
          if (findInAncestors === void 0) {
            findInAncestors = true;
          }
          var testability = registry.findTestabilityInTree(elem, findInAncestors);
          if (testability == null) {
            throw new Error('Could not find testability for element.');
          }
          return testability;
        };
        global$1.getAllAngularTestabilities = function() {
          return registry.getAllTestabilities();
        };
        global$1.getAllAngularRootElements = function() {
          return registry.getAllRootElements();
        };
        var whenAllStable = function(callback) {
          var testabilities = global$1.getAllAngularTestabilities();
          var count = testabilities.length;
          var didWork = false;
          var decrement = function(didWork_) {
            didWork = didWork || didWork_;
            count--;
            if (count == 0) {
              callback(didWork);
            }
          };
          testabilities.forEach(function(testability) {
            testability.whenStable(decrement);
          });
        };
        if (!global$1['frameworkStabilizers']) {
          global$1['frameworkStabilizers'] = [];
        }
        global$1['frameworkStabilizers'].push(whenAllStable);
      };
      BrowserGetTestability.prototype.findTestabilityInTree = function(registry, elem, findInAncestors) {
        if (elem == null) {
          return null;
        }
        var t = registry.getTestability(elem);
        if (isPresent(t)) {
          return t;
        } else if (!findInAncestors) {
          return null;
        }
        if (getDOM().isShadowRoot(elem)) {
          return this.findTestabilityInTree(registry, getDOM().getHost(elem), true);
        }
        return this.findTestabilityInTree(registry, getDOM().parentElement(elem), true);
      };
      return BrowserGetTestability;
    }());
    var Title = (function() {
      function Title() {}
      Title.prototype.getTitle = function() {
        return getDOM().getTitle();
      };
      Title.prototype.setTitle = function(newTitle) {
        getDOM().setTitle(newTitle);
      };
      return Title;
    }());
    var StringMapWrapper = (function() {
      function StringMapWrapper() {}
      StringMapWrapper.merge = function(m1, m2) {
        var m = {};
        for (var _i = 0,
            _a = Object.keys(m1); _i < _a.length; _i++) {
          var k = _a[_i];
          m[k] = m1[k];
        }
        for (var _b = 0,
            _c = Object.keys(m2); _b < _c.length; _b++) {
          var k = _c[_b];
          m[k] = m2[k];
        }
        return m;
      };
      StringMapWrapper.equals = function(m1, m2) {
        var k1 = Object.keys(m1);
        var k2 = Object.keys(m2);
        if (k1.length != k2.length) {
          return false;
        }
        for (var i = 0; i < k1.length; i++) {
          var key = k1[i];
          if (m1[key] !== m2[key]) {
            return false;
          }
        }
        return true;
      };
      return StringMapWrapper;
    }());
    var DOCUMENT = new _angular_core.OpaqueToken('DocumentToken');
    var EVENT_MANAGER_PLUGINS = new _angular_core.OpaqueToken('EventManagerPlugins');
    var EventManager = (function() {
      function EventManager(plugins, _zone) {
        var _this = this;
        this._zone = _zone;
        this._eventNameToPlugin = new Map();
        plugins.forEach(function(p) {
          return p.manager = _this;
        });
        this._plugins = plugins.slice().reverse();
      }
      EventManager.prototype.addEventListener = function(element, eventName, handler) {
        var plugin = this._findPluginFor(eventName);
        return plugin.addEventListener(element, eventName, handler);
      };
      EventManager.prototype.addGlobalEventListener = function(target, eventName, handler) {
        var plugin = this._findPluginFor(eventName);
        return plugin.addGlobalEventListener(target, eventName, handler);
      };
      EventManager.prototype.getZone = function() {
        return this._zone;
      };
      EventManager.prototype._findPluginFor = function(eventName) {
        var plugin = this._eventNameToPlugin.get(eventName);
        if (plugin) {
          return plugin;
        }
        var plugins = this._plugins;
        for (var i = 0; i < plugins.length; i++) {
          var plugin_1 = plugins[i];
          if (plugin_1.supports(eventName)) {
            this._eventNameToPlugin.set(eventName, plugin_1);
            return plugin_1;
          }
        }
        throw new Error("No event manager plugin found for event " + eventName);
      };
      EventManager.decorators = [{type: _angular_core.Injectable}];
      EventManager.ctorParameters = [{
        type: Array,
        decorators: [{
          type: _angular_core.Inject,
          args: [EVENT_MANAGER_PLUGINS]
        }]
      }, {type: _angular_core.NgZone}];
      return EventManager;
    }());
    var EventManagerPlugin = (function() {
      function EventManagerPlugin() {}
      EventManagerPlugin.prototype.addGlobalEventListener = function(element, eventName, handler) {
        var target = getDOM().getGlobalEventTarget(element);
        if (!target) {
          throw new Error("Unsupported event target " + target + " for event " + eventName);
        }
        return this.addEventListener(target, eventName, handler);
      };
      ;
      return EventManagerPlugin;
    }());
    var __extends$4 = (this && this.__extends) || function(d, b) {
      for (var p in b)
        if (b.hasOwnProperty(p))
          d[p] = b[p];
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var SharedStylesHost = (function() {
      function SharedStylesHost() {
        this._styles = [];
        this._stylesSet = new Set();
      }
      SharedStylesHost.prototype.addStyles = function(styles) {
        var _this = this;
        var additions = [];
        styles.forEach(function(style) {
          if (!_this._stylesSet.has(style)) {
            _this._stylesSet.add(style);
            _this._styles.push(style);
            additions.push(style);
          }
        });
        this.onStylesAdded(additions);
      };
      SharedStylesHost.prototype.onStylesAdded = function(additions) {};
      SharedStylesHost.prototype.getAllStyles = function() {
        return this._styles;
      };
      SharedStylesHost.decorators = [{type: _angular_core.Injectable}];
      SharedStylesHost.ctorParameters = [];
      return SharedStylesHost;
    }());
    var DomSharedStylesHost = (function(_super) {
      __extends$4(DomSharedStylesHost, _super);
      function DomSharedStylesHost(doc) {
        _super.call(this);
        this._hostNodes = new Set();
        this._hostNodes.add(doc.head);
      }
      DomSharedStylesHost.prototype._addStylesToHost = function(styles, host) {
        for (var i = 0; i < styles.length; i++) {
          var styleEl = document.createElement('style');
          styleEl.textContent = styles[i];
          host.appendChild(styleEl);
        }
      };
      DomSharedStylesHost.prototype.addHost = function(hostNode) {
        this._addStylesToHost(this._styles, hostNode);
        this._hostNodes.add(hostNode);
      };
      DomSharedStylesHost.prototype.removeHost = function(hostNode) {
        this._hostNodes.delete(hostNode);
      };
      DomSharedStylesHost.prototype.onStylesAdded = function(additions) {
        var _this = this;
        this._hostNodes.forEach(function(hostNode) {
          _this._addStylesToHost(additions, hostNode);
        });
      };
      DomSharedStylesHost.decorators = [{type: _angular_core.Injectable}];
      DomSharedStylesHost.ctorParameters = [{
        type: undefined,
        decorators: [{
          type: _angular_core.Inject,
          args: [DOCUMENT]
        }]
      }];
      return DomSharedStylesHost;
    }(SharedStylesHost));
    var __extends$3 = (this && this.__extends) || function(d, b) {
      for (var p in b)
        if (b.hasOwnProperty(p))
          d[p] = b[p];
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var NAMESPACE_URIS = {
      'xlink': 'http://www.w3.org/1999/xlink',
      'svg': 'http://www.w3.org/2000/svg',
      'xhtml': 'http://www.w3.org/1999/xhtml'
    };
    var TEMPLATE_COMMENT_TEXT = 'template bindings={}';
    var TEMPLATE_BINDINGS_EXP = /^template bindings=(.*)$/;
    var DomRootRenderer = (function() {
      function DomRootRenderer(document, eventManager, sharedStylesHost, animationDriver, appId) {
        this.document = document;
        this.eventManager = eventManager;
        this.sharedStylesHost = sharedStylesHost;
        this.animationDriver = animationDriver;
        this.appId = appId;
        this.registeredComponents = new Map();
      }
      DomRootRenderer.prototype.renderComponent = function(componentProto) {
        var renderer = this.registeredComponents.get(componentProto.id);
        if (!renderer) {
          renderer = new DomRenderer(this, componentProto, this.animationDriver, this.appId + "-" + componentProto.id);
          this.registeredComponents.set(componentProto.id, renderer);
        }
        return renderer;
      };
      return DomRootRenderer;
    }());
    var DomRootRenderer_ = (function(_super) {
      __extends$3(DomRootRenderer_, _super);
      function DomRootRenderer_(_document, _eventManager, sharedStylesHost, animationDriver, appId) {
        _super.call(this, _document, _eventManager, sharedStylesHost, animationDriver, appId);
      }
      DomRootRenderer_.decorators = [{type: _angular_core.Injectable}];
      DomRootRenderer_.ctorParameters = [{
        type: undefined,
        decorators: [{
          type: _angular_core.Inject,
          args: [DOCUMENT]
        }]
      }, {type: EventManager}, {type: DomSharedStylesHost}, {type: AnimationDriver}, {
        type: undefined,
        decorators: [{
          type: _angular_core.Inject,
          args: [_angular_core.APP_ID]
        }]
      }];
      return DomRootRenderer_;
    }(DomRootRenderer));
    var DIRECT_DOM_RENDERER = {
      remove: function(node) {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      },
      appendChild: function(node, parent) {
        parent.appendChild(node);
      },
      insertBefore: function(node, refNode) {
        refNode.parentNode.insertBefore(node, refNode);
      },
      nextSibling: function(node) {
        return node.nextSibling;
      },
      parentElement: function(node) {
        return node.parentNode;
      }
    };
    var DomRenderer = (function() {
      function DomRenderer(_rootRenderer, componentProto, _animationDriver, styleShimId) {
        this._rootRenderer = _rootRenderer;
        this.componentProto = componentProto;
        this._animationDriver = _animationDriver;
        this.directRenderer = DIRECT_DOM_RENDERER;
        this._styles = flattenStyles(styleShimId, componentProto.styles, []);
        if (componentProto.encapsulation !== _angular_core.ViewEncapsulation.Native) {
          this._rootRenderer.sharedStylesHost.addStyles(this._styles);
        }
        if (this.componentProto.encapsulation === _angular_core.ViewEncapsulation.Emulated) {
          this._contentAttr = shimContentAttribute(styleShimId);
          this._hostAttr = shimHostAttribute(styleShimId);
        } else {
          this._contentAttr = null;
          this._hostAttr = null;
        }
      }
      DomRenderer.prototype.selectRootElement = function(selectorOrNode, debugInfo) {
        var el;
        if (typeof selectorOrNode === 'string') {
          el = this._rootRenderer.document.querySelector(selectorOrNode);
          if (!el) {
            throw new Error("The selector \"" + selectorOrNode + "\" did not match any elements");
          }
        } else {
          el = selectorOrNode;
        }
        while (el.firstChild) {
          el.removeChild(el.firstChild);
        }
        return el;
      };
      DomRenderer.prototype.createElement = function(parent, name, debugInfo) {
        var el;
        if (isNamespaced(name)) {
          var nsAndName = splitNamespace(name);
          el = document.createElementNS((NAMESPACE_URIS)[nsAndName[0]], nsAndName[1]);
        } else {
          el = document.createElement(name);
        }
        if (this._contentAttr) {
          el.setAttribute(this._contentAttr, '');
        }
        if (parent) {
          parent.appendChild(el);
        }
        return el;
      };
      DomRenderer.prototype.createViewRoot = function(hostElement) {
        var nodesParent;
        if (this.componentProto.encapsulation === _angular_core.ViewEncapsulation.Native) {
          nodesParent = hostElement.createShadowRoot();
          this._rootRenderer.sharedStylesHost.addHost(nodesParent);
          for (var i = 0; i < this._styles.length; i++) {
            var styleEl = document.createElement('style');
            styleEl.textContent = this._styles[i];
            nodesParent.appendChild(styleEl);
          }
        } else {
          if (this._hostAttr) {
            hostElement.setAttribute(this._hostAttr, '');
          }
          nodesParent = hostElement;
        }
        return nodesParent;
      };
      DomRenderer.prototype.createTemplateAnchor = function(parentElement, debugInfo) {
        var comment = document.createComment(TEMPLATE_COMMENT_TEXT);
        if (parentElement) {
          parentElement.appendChild(comment);
        }
        return comment;
      };
      DomRenderer.prototype.createText = function(parentElement, value, debugInfo) {
        var node = document.createTextNode(value);
        if (parentElement) {
          parentElement.appendChild(node);
        }
        return node;
      };
      DomRenderer.prototype.projectNodes = function(parentElement, nodes) {
        if (!parentElement)
          return;
        appendNodes(parentElement, nodes);
      };
      DomRenderer.prototype.attachViewAfter = function(node, viewRootNodes) {
        moveNodesAfterSibling(node, viewRootNodes);
      };
      DomRenderer.prototype.detachView = function(viewRootNodes) {
        for (var i = 0; i < viewRootNodes.length; i++) {
          var node = viewRootNodes[i];
          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
        }
      };
      DomRenderer.prototype.destroyView = function(hostElement, viewAllNodes) {
        if (this.componentProto.encapsulation === _angular_core.ViewEncapsulation.Native && hostElement) {
          this._rootRenderer.sharedStylesHost.removeHost(hostElement.shadowRoot);
        }
      };
      DomRenderer.prototype.listen = function(renderElement, name, callback) {
        return this._rootRenderer.eventManager.addEventListener(renderElement, name, decoratePreventDefault(callback));
      };
      DomRenderer.prototype.listenGlobal = function(target, name, callback) {
        return this._rootRenderer.eventManager.addGlobalEventListener(target, name, decoratePreventDefault(callback));
      };
      DomRenderer.prototype.setElementProperty = function(renderElement, propertyName, propertyValue) {
        renderElement[propertyName] = propertyValue;
      };
      DomRenderer.prototype.setElementAttribute = function(renderElement, attributeName, attributeValue) {
        var attrNs;
        var attrNameWithoutNs = attributeName;
        if (isNamespaced(attributeName)) {
          var nsAndName = splitNamespace(attributeName);
          attrNameWithoutNs = nsAndName[1];
          attributeName = nsAndName[0] + ':' + nsAndName[1];
          attrNs = NAMESPACE_URIS[nsAndName[0]];
        }
        if (isPresent(attributeValue)) {
          if (attrNs) {
            renderElement.setAttributeNS(attrNs, attributeName, attributeValue);
          } else {
            renderElement.setAttribute(attributeName, attributeValue);
          }
        } else {
          if (isPresent(attrNs)) {
            renderElement.removeAttributeNS(attrNs, attrNameWithoutNs);
          } else {
            renderElement.removeAttribute(attributeName);
          }
        }
      };
      DomRenderer.prototype.setBindingDebugInfo = function(renderElement, propertyName, propertyValue) {
        if (renderElement.nodeType === Node.COMMENT_NODE) {
          var existingBindings = renderElement.nodeValue.replace(/\n/g, '').match(TEMPLATE_BINDINGS_EXP);
          var parsedBindings = JSON.parse(existingBindings[1]);
          parsedBindings[propertyName] = propertyValue;
          renderElement.nodeValue = TEMPLATE_COMMENT_TEXT.replace('{}', JSON.stringify(parsedBindings, null, 2));
        } else {
          this.setElementAttribute(renderElement, propertyName, propertyValue);
        }
      };
      DomRenderer.prototype.setElementClass = function(renderElement, className, isAdd) {
        if (isAdd) {
          renderElement.classList.add(className);
        } else {
          renderElement.classList.remove(className);
        }
      };
      DomRenderer.prototype.setElementStyle = function(renderElement, styleName, styleValue) {
        if (isPresent(styleValue)) {
          renderElement.style[styleName] = stringify(styleValue);
        } else {
          renderElement.style[styleName] = '';
        }
      };
      DomRenderer.prototype.invokeElementMethod = function(renderElement, methodName, args) {
        renderElement[methodName].apply(renderElement, args);
      };
      DomRenderer.prototype.setText = function(renderNode, text) {
        renderNode.nodeValue = text;
      };
      DomRenderer.prototype.animate = function(element, startingStyles, keyframes, duration, delay, easing) {
        return this._animationDriver.animate(element, startingStyles, keyframes, duration, delay, easing);
      };
      return DomRenderer;
    }());
    function moveNodesAfterSibling(sibling, nodes) {
      var parent = sibling.parentNode;
      if (nodes.length > 0 && parent) {
        var nextSibling = sibling.nextSibling;
        if (nextSibling) {
          for (var i = 0; i < nodes.length; i++) {
            parent.insertBefore(nodes[i], nextSibling);
          }
        } else {
          for (var i = 0; i < nodes.length; i++) {
            parent.appendChild(nodes[i]);
          }
        }
      }
    }
    function appendNodes(parent, nodes) {
      for (var i = 0; i < nodes.length; i++) {
        parent.appendChild(nodes[i]);
      }
    }
    function decoratePreventDefault(eventHandler) {
      return function(event) {
        var allowDefaultBehavior = eventHandler(event);
        if (allowDefaultBehavior === false) {
          event.preventDefault();
          event.returnValue = false;
        }
      };
    }
    var COMPONENT_REGEX = /%COMP%/g;
    var COMPONENT_VARIABLE = '%COMP%';
    var HOST_ATTR = "_nghost-" + COMPONENT_VARIABLE;
    var CONTENT_ATTR = "_ngcontent-" + COMPONENT_VARIABLE;
    function shimContentAttribute(componentShortId) {
      return CONTENT_ATTR.replace(COMPONENT_REGEX, componentShortId);
    }
    function shimHostAttribute(componentShortId) {
      return HOST_ATTR.replace(COMPONENT_REGEX, componentShortId);
    }
    function flattenStyles(compId, styles, target) {
      for (var i = 0; i < styles.length; i++) {
        var style = styles[i];
        if (Array.isArray(style)) {
          flattenStyles(compId, style, target);
        } else {
          style = style.replace(COMPONENT_REGEX, compId);
          target.push(style);
        }
      }
      return target;
    }
    var NS_PREFIX_RE = /^:([^:]+):(.+)$/;
    function isNamespaced(name) {
      return name[0] === ':';
    }
    function splitNamespace(name) {
      var match = name.match(NS_PREFIX_RE);
      return [match[1], match[2]];
    }
    var CORE_TOKENS = {
      'ApplicationRef': _angular_core.ApplicationRef,
      'NgZone': _angular_core.NgZone
    };
    var INSPECT_GLOBAL_NAME = 'ng.probe';
    var CORE_TOKENS_GLOBAL_NAME = 'ng.coreTokens';
    function inspectNativeElement(element) {
      return _angular_core.getDebugNode(element);
    }
    var NgProbeToken = (function() {
      function NgProbeToken(name, token) {
        this.name = name;
        this.token = token;
      }
      return NgProbeToken;
    }());
    function _createConditionalRootRenderer(rootRenderer, extraTokens) {
      if (_angular_core.isDevMode()) {
        return _createRootRenderer(rootRenderer, extraTokens);
      }
      return rootRenderer;
    }
    function _createRootRenderer(rootRenderer, extraTokens) {
      getDOM().setGlobalVar(INSPECT_GLOBAL_NAME, inspectNativeElement);
      getDOM().setGlobalVar(CORE_TOKENS_GLOBAL_NAME, StringMapWrapper.merge(CORE_TOKENS, _ngProbeTokensToMap(extraTokens || [])));
      return new DebugDomRootRenderer(rootRenderer);
    }
    function _ngProbeTokensToMap(tokens) {
      return tokens.reduce(function(prev, t) {
        return (prev[t.name] = t.token, prev);
      }, {});
    }
    var ELEMENT_PROBE_PROVIDERS = [{
      provide: _angular_core.RootRenderer,
      useFactory: _createConditionalRootRenderer,
      deps: [DomRootRenderer, [NgProbeToken, new _angular_core.Optional()]]
    }];
    var ELEMENT_PROBE_PROVIDERS_PROD_MODE = [{
      provide: _angular_core.RootRenderer,
      useFactory: _createRootRenderer,
      deps: [DomRootRenderer, [NgProbeToken, new _angular_core.Optional()]]
    }];
    var __extends$5 = (this && this.__extends) || function(d, b) {
      for (var p in b)
        if (b.hasOwnProperty(p))
          d[p] = b[p];
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var DomEventsPlugin = (function(_super) {
      __extends$5(DomEventsPlugin, _super);
      function DomEventsPlugin() {
        _super.apply(this, arguments);
      }
      DomEventsPlugin.prototype.supports = function(eventName) {
        return true;
      };
      DomEventsPlugin.prototype.addEventListener = function(element, eventName, handler) {
        element.addEventListener(eventName, handler, false);
        return function() {
          return element.removeEventListener(eventName, handler, false);
        };
      };
      DomEventsPlugin.decorators = [{type: _angular_core.Injectable}];
      DomEventsPlugin.ctorParameters = [];
      return DomEventsPlugin;
    }(EventManagerPlugin));
    var __extends$6 = (this && this.__extends) || function(d, b) {
      for (var p in b)
        if (b.hasOwnProperty(p))
          d[p] = b[p];
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var EVENT_NAMES = {
      'pan': true,
      'panstart': true,
      'panmove': true,
      'panend': true,
      'pancancel': true,
      'panleft': true,
      'panright': true,
      'panup': true,
      'pandown': true,
      'pinch': true,
      'pinchstart': true,
      'pinchmove': true,
      'pinchend': true,
      'pinchcancel': true,
      'pinchin': true,
      'pinchout': true,
      'press': true,
      'pressup': true,
      'rotate': true,
      'rotatestart': true,
      'rotatemove': true,
      'rotateend': true,
      'rotatecancel': true,
      'swipe': true,
      'swipeleft': true,
      'swiperight': true,
      'swipeup': true,
      'swipedown': true,
      'tap': true
    };
    var HAMMER_GESTURE_CONFIG = new _angular_core.OpaqueToken('HammerGestureConfig');
    var HammerGestureConfig = (function() {
      function HammerGestureConfig() {
        this.events = [];
        this.overrides = {};
      }
      HammerGestureConfig.prototype.buildHammer = function(element) {
        var mc = new Hammer(element);
        mc.get('pinch').set({enable: true});
        mc.get('rotate').set({enable: true});
        for (var eventName in this.overrides) {
          mc.get(eventName).set(this.overrides[eventName]);
        }
        return mc;
      };
      HammerGestureConfig.decorators = [{type: _angular_core.Injectable}];
      HammerGestureConfig.ctorParameters = [];
      return HammerGestureConfig;
    }());
    var HammerGesturesPlugin = (function(_super) {
      __extends$6(HammerGesturesPlugin, _super);
      function HammerGesturesPlugin(_config) {
        _super.call(this);
        this._config = _config;
      }
      HammerGesturesPlugin.prototype.supports = function(eventName) {
        if (!EVENT_NAMES.hasOwnProperty(eventName.toLowerCase()) && !this.isCustomEvent(eventName)) {
          return false;
        }
        if (!window.Hammer) {
          throw new Error("Hammer.js is not loaded, can not bind " + eventName + " event");
        }
        return true;
      };
      HammerGesturesPlugin.prototype.addEventListener = function(element, eventName, handler) {
        var _this = this;
        var zone = this.manager.getZone();
        eventName = eventName.toLowerCase();
        return zone.runOutsideAngular(function() {
          var mc = _this._config.buildHammer(element);
          var callback = function(eventObj) {
            zone.runGuarded(function() {
              handler(eventObj);
            });
          };
          mc.on(eventName, callback);
          return function() {
            return mc.off(eventName, callback);
          };
        });
      };
      HammerGesturesPlugin.prototype.isCustomEvent = function(eventName) {
        return this._config.events.indexOf(eventName) > -1;
      };
      HammerGesturesPlugin.decorators = [{type: _angular_core.Injectable}];
      HammerGesturesPlugin.ctorParameters = [{
        type: HammerGestureConfig,
        decorators: [{
          type: _angular_core.Inject,
          args: [HAMMER_GESTURE_CONFIG]
        }]
      }];
      return HammerGesturesPlugin;
    }(EventManagerPlugin));
    var __extends$7 = (this && this.__extends) || function(d, b) {
      for (var p in b)
        if (b.hasOwnProperty(p))
          d[p] = b[p];
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var MODIFIER_KEYS = ['alt', 'control', 'meta', 'shift'];
    var MODIFIER_KEY_GETTERS = {
      'alt': function(event) {
        return event.altKey;
      },
      'control': function(event) {
        return event.ctrlKey;
      },
      'meta': function(event) {
        return event.metaKey;
      },
      'shift': function(event) {
        return event.shiftKey;
      }
    };
    var KeyEventsPlugin = (function(_super) {
      __extends$7(KeyEventsPlugin, _super);
      function KeyEventsPlugin() {
        _super.call(this);
      }
      KeyEventsPlugin.prototype.supports = function(eventName) {
        return KeyEventsPlugin.parseEventName(eventName) != null;
      };
      KeyEventsPlugin.prototype.addEventListener = function(element, eventName, handler) {
        var parsedEvent = KeyEventsPlugin.parseEventName(eventName);
        var outsideHandler = KeyEventsPlugin.eventCallback(parsedEvent['fullKey'], handler, this.manager.getZone());
        return this.manager.getZone().runOutsideAngular(function() {
          return getDOM().onAndCancel(element, parsedEvent['domEventName'], outsideHandler);
        });
      };
      KeyEventsPlugin.parseEventName = function(eventName) {
        var parts = eventName.toLowerCase().split('.');
        var domEventName = parts.shift();
        if ((parts.length === 0) || !(domEventName === 'keydown' || domEventName === 'keyup')) {
          return null;
        }
        var key = KeyEventsPlugin._normalizeKey(parts.pop());
        var fullKey = '';
        MODIFIER_KEYS.forEach(function(modifierName) {
          var index = parts.indexOf(modifierName);
          if (index > -1) {
            parts.splice(index, 1);
            fullKey += modifierName + '.';
          }
        });
        fullKey += key;
        if (parts.length != 0 || key.length === 0) {
          return null;
        }
        var result = {};
        result['domEventName'] = domEventName;
        result['fullKey'] = fullKey;
        return result;
      };
      KeyEventsPlugin.getEventFullKey = function(event) {
        var fullKey = '';
        var key = getDOM().getEventKey(event);
        key = key.toLowerCase();
        if (key === ' ') {
          key = 'space';
        } else if (key === '.') {
          key = 'dot';
        }
        MODIFIER_KEYS.forEach(function(modifierName) {
          if (modifierName != key) {
            var modifierGetter = MODIFIER_KEY_GETTERS[modifierName];
            if (modifierGetter(event)) {
              fullKey += modifierName + '.';
            }
          }
        });
        fullKey += key;
        return fullKey;
      };
      KeyEventsPlugin.eventCallback = function(fullKey, handler, zone) {
        return function(event) {
          if (KeyEventsPlugin.getEventFullKey(event) === fullKey) {
            zone.runGuarded(function() {
              return handler(event);
            });
          }
        };
      };
      KeyEventsPlugin._normalizeKey = function(keyName) {
        switch (keyName) {
          case 'esc':
            return 'escape';
          default:
            return keyName;
        }
      };
      KeyEventsPlugin.decorators = [{type: _angular_core.Injectable}];
      KeyEventsPlugin.ctorParameters = [];
      return KeyEventsPlugin;
    }(EventManagerPlugin));
    var SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi;
    var DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+\/]+=*$/i;
    function sanitizeUrl(url) {
      url = String(url);
      if (url.match(SAFE_URL_PATTERN) || url.match(DATA_URL_PATTERN))
        return url;
      if (_angular_core.isDevMode()) {
        getDOM().log("WARNING: sanitizing unsafe URL value " + url + " (see http://g.co/ng/security#xss)");
      }
      return 'unsafe:' + url;
    }
    function sanitizeSrcset(srcset) {
      srcset = String(srcset);
      return srcset.split(',').map(function(srcset) {
        return sanitizeUrl(srcset.trim());
      }).join(', ');
    }
    var inertElement = null;
    var DOM = null;
    function getInertElement() {
      if (inertElement)
        return inertElement;
      DOM = getDOM();
      var templateEl = DOM.createElement('template');
      if ('content' in templateEl)
        return templateEl;
      var doc = DOM.createHtmlDocument();
      inertElement = DOM.querySelector(doc, 'body');
      if (inertElement == null) {
        var html = DOM.createElement('html', doc);
        inertElement = DOM.createElement('body', doc);
        DOM.appendChild(html, inertElement);
        DOM.appendChild(doc, html);
      }
      return inertElement;
    }
    function tagSet(tags) {
      var res = {};
      for (var _i = 0,
          _a = tags.split(','); _i < _a.length; _i++) {
        var t = _a[_i];
        res[t] = true;
      }
      return res;
    }
    function merge() {
      var sets = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        sets[_i - 0] = arguments[_i];
      }
      var res = {};
      for (var _a = 0,
          sets_1 = sets; _a < sets_1.length; _a++) {
        var s = sets_1[_a];
        for (var v in s) {
          if (s.hasOwnProperty(v))
            res[v] = true;
        }
      }
      return res;
    }
    var VOID_ELEMENTS = tagSet('area,br,col,hr,img,wbr');
    var OPTIONAL_END_TAG_BLOCK_ELEMENTS = tagSet('colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr');
    var OPTIONAL_END_TAG_INLINE_ELEMENTS = tagSet('rp,rt');
    var OPTIONAL_END_TAG_ELEMENTS = merge(OPTIONAL_END_TAG_INLINE_ELEMENTS, OPTIONAL_END_TAG_BLOCK_ELEMENTS);
    var BLOCK_ELEMENTS = merge(OPTIONAL_END_TAG_BLOCK_ELEMENTS, tagSet('address,article,' + 'aside,blockquote,caption,center,del,details,dialog,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,' + 'h6,header,hgroup,hr,ins,main,map,menu,nav,ol,pre,section,summary,table,ul'));
    var INLINE_ELEMENTS = merge(OPTIONAL_END_TAG_INLINE_ELEMENTS, tagSet('a,abbr,acronym,audio,b,' + 'bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,picture,q,ruby,rp,rt,s,' + 'samp,small,source,span,strike,strong,sub,sup,time,track,tt,u,var,video'));
    var VALID_ELEMENTS = merge(VOID_ELEMENTS, BLOCK_ELEMENTS, INLINE_ELEMENTS, OPTIONAL_END_TAG_ELEMENTS);
    var URI_ATTRS = tagSet('background,cite,href,itemtype,longdesc,poster,src,xlink:href');
    var SRCSET_ATTRS = tagSet('srcset');
    var HTML_ATTRS = tagSet('abbr,accesskey,align,alt,autoplay,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,' + 'compact,controls,coords,datetime,default,dir,download,face,headers,height,hidden,hreflang,hspace,' + 'ismap,itemscope,itemprop,kind,label,lang,language,loop,media,muted,nohref,nowrap,open,preload,rel,rev,role,rows,rowspan,rules,' + 'scope,scrolling,shape,size,sizes,span,srclang,start,summary,tabindex,target,title,translate,type,usemap,' + 'valign,value,vspace,width');
    var VALID_ATTRS = merge(URI_ATTRS, SRCSET_ATTRS, HTML_ATTRS);
    var SanitizingHtmlSerializer = (function() {
      function SanitizingHtmlSerializer() {
        this.sanitizedSomething = false;
        this.buf = [];
      }
      SanitizingHtmlSerializer.prototype.sanitizeChildren = function(el) {
        var current = el.firstChild;
        while (current) {
          if (DOM.isElementNode(current)) {
            this.startElement(current);
          } else if (DOM.isTextNode(current)) {
            this.chars(DOM.nodeValue(current));
          } else {
            this.sanitizedSomething = true;
          }
          if (DOM.firstChild(current)) {
            current = DOM.firstChild(current);
            continue;
          }
          while (current) {
            if (DOM.isElementNode(current)) {
              this.endElement(current);
            }
            if (DOM.nextSibling(current)) {
              current = DOM.nextSibling(current);
              break;
            }
            current = DOM.parentElement(current);
          }
        }
        return this.buf.join('');
      };
      SanitizingHtmlSerializer.prototype.startElement = function(element) {
        var _this = this;
        var tagName = DOM.nodeName(element).toLowerCase();
        if (!VALID_ELEMENTS.hasOwnProperty(tagName)) {
          this.sanitizedSomething = true;
          return;
        }
        this.buf.push('<');
        this.buf.push(tagName);
        DOM.attributeMap(element).forEach(function(value, attrName) {
          var lower = attrName.toLowerCase();
          if (!VALID_ATTRS.hasOwnProperty(lower)) {
            _this.sanitizedSomething = true;
            return;
          }
          if (URI_ATTRS[lower])
            value = sanitizeUrl(value);
          if (SRCSET_ATTRS[lower])
            value = sanitizeSrcset(value);
          _this.buf.push(' ');
          _this.buf.push(attrName);
          _this.buf.push('="');
          _this.buf.push(encodeEntities(value));
          _this.buf.push('"');
        });
        this.buf.push('>');
      };
      SanitizingHtmlSerializer.prototype.endElement = function(current) {
        var tagName = DOM.nodeName(current).toLowerCase();
        if (VALID_ELEMENTS.hasOwnProperty(tagName) && !VOID_ELEMENTS.hasOwnProperty(tagName)) {
          this.buf.push('</');
          this.buf.push(tagName);
          this.buf.push('>');
        }
      };
      SanitizingHtmlSerializer.prototype.chars = function(chars) {
        this.buf.push(encodeEntities(chars));
      };
      return SanitizingHtmlSerializer;
    }());
    var SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    var NON_ALPHANUMERIC_REGEXP = /([^\#-~ |!])/g;
    function encodeEntities(value) {
      return value.replace(/&/g, '&amp;').replace(SURROGATE_PAIR_REGEXP, function(match) {
        var hi = match.charCodeAt(0);
        var low = match.charCodeAt(1);
        return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';';
      }).replace(NON_ALPHANUMERIC_REGEXP, function(match) {
        return '&#' + match.charCodeAt(0) + ';';
      }).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function stripCustomNsAttrs(el) {
      DOM.attributeMap(el).forEach(function(_, attrName) {
        if (attrName === 'xmlns:ns1' || attrName.indexOf('ns1:') === 0) {
          DOM.removeAttribute(el, attrName);
        }
      });
      for (var _i = 0,
          _a = DOM.childNodesAsList(el); _i < _a.length; _i++) {
        var n = _a[_i];
        if (DOM.isElementNode(n))
          stripCustomNsAttrs(n);
      }
    }
    function sanitizeHtml(unsafeHtmlInput) {
      try {
        var containerEl = getInertElement();
        var unsafeHtml = unsafeHtmlInput ? String(unsafeHtmlInput) : '';
        var mXSSAttempts = 5;
        var parsedHtml = unsafeHtml;
        do {
          if (mXSSAttempts === 0) {
            throw new Error('Failed to sanitize html because the input is unstable');
          }
          mXSSAttempts--;
          unsafeHtml = parsedHtml;
          DOM.setInnerHTML(containerEl, unsafeHtml);
          if (DOM.defaultDoc().documentMode) {
            stripCustomNsAttrs(containerEl);
          }
          parsedHtml = DOM.getInnerHTML(containerEl);
        } while (unsafeHtml !== parsedHtml);
        var sanitizer = new SanitizingHtmlSerializer();
        var safeHtml = sanitizer.sanitizeChildren(DOM.getTemplateContent(containerEl) || containerEl);
        var parent_1 = DOM.getTemplateContent(containerEl) || containerEl;
        for (var _i = 0,
            _a = DOM.childNodesAsList(parent_1); _i < _a.length; _i++) {
          var child = _a[_i];
          DOM.removeChild(parent_1, child);
        }
        if (_angular_core.isDevMode() && sanitizer.sanitizedSomething) {
          DOM.log('WARNING: sanitizing HTML stripped some content (see http://g.co/ng/security#xss).');
        }
        return safeHtml;
      } catch (e) {
        inertElement = null;
        throw e;
      }
    }
    var VALUES = '[-,."\'%_!# a-zA-Z0-9]+';
    var TRANSFORMATION_FNS = '(?:matrix|translate|scale|rotate|skew|perspective)(?:X|Y|3d)?';
    var COLOR_FNS = '(?:rgb|hsl)a?';
    var FN_ARGS = '\\([-0-9.%, a-zA-Z]+\\)';
    var SAFE_STYLE_VALUE = new RegExp("^(" + VALUES + "|(?:" + TRANSFORMATION_FNS + "|" + COLOR_FNS + ")" + FN_ARGS + ")$", 'g');
    var URL_RE = /^url\(([^)]+)\)$/;
    function hasBalancedQuotes(value) {
      var outsideSingle = true;
      var outsideDouble = true;
      for (var i = 0; i < value.length; i++) {
        var c = value.charAt(i);
        if (c === '\'' && outsideDouble) {
          outsideSingle = !outsideSingle;
        } else if (c === '"' && outsideSingle) {
          outsideDouble = !outsideDouble;
        }
      }
      return outsideSingle && outsideDouble;
    }
    function sanitizeStyle(value) {
      value = String(value).trim();
      if (!value)
        return '';
      var urlMatch = value.match(URL_RE);
      if ((urlMatch && sanitizeUrl(urlMatch[1]) === urlMatch[1]) || value.match(SAFE_STYLE_VALUE) && hasBalancedQuotes(value)) {
        return value;
      }
      if (_angular_core.isDevMode()) {
        getDOM().log("WARNING: sanitizing unsafe style value " + value + " (see http://g.co/ng/security#xss).");
      }
      return 'unsafe';
    }
    var __extends$8 = (this && this.__extends) || function(d, b) {
      for (var p in b)
        if (b.hasOwnProperty(p))
          d[p] = b[p];
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var DomSanitizer = (function() {
      function DomSanitizer() {}
      return DomSanitizer;
    }());
    var DomSanitizerImpl = (function(_super) {
      __extends$8(DomSanitizerImpl, _super);
      function DomSanitizerImpl() {
        _super.apply(this, arguments);
      }
      DomSanitizerImpl.prototype.sanitize = function(ctx, value) {
        if (value == null)
          return null;
        switch (ctx) {
          case _angular_core.SecurityContext.NONE:
            return value;
          case _angular_core.SecurityContext.HTML:
            if (value instanceof SafeHtmlImpl)
              return value.changingThisBreaksApplicationSecurity;
            this.checkNotSafeValue(value, 'HTML');
            return sanitizeHtml(String(value));
          case _angular_core.SecurityContext.STYLE:
            if (value instanceof SafeStyleImpl)
              return value.changingThisBreaksApplicationSecurity;
            this.checkNotSafeValue(value, 'Style');
            return sanitizeStyle(value);
          case _angular_core.SecurityContext.SCRIPT:
            if (value instanceof SafeScriptImpl)
              return value.changingThisBreaksApplicationSecurity;
            this.checkNotSafeValue(value, 'Script');
            throw new Error('unsafe value used in a script context');
          case _angular_core.SecurityContext.URL:
            if (value instanceof SafeResourceUrlImpl || value instanceof SafeUrlImpl) {
              return value.changingThisBreaksApplicationSecurity;
            }
            this.checkNotSafeValue(value, 'URL');
            return sanitizeUrl(String(value));
          case _angular_core.SecurityContext.RESOURCE_URL:
            if (value instanceof SafeResourceUrlImpl) {
              return value.changingThisBreaksApplicationSecurity;
            }
            this.checkNotSafeValue(value, 'ResourceURL');
            throw new Error('unsafe value used in a resource URL context (see http://g.co/ng/security#xss)');
          default:
            throw new Error("Unexpected SecurityContext " + ctx + " (see http://g.co/ng/security#xss)");
        }
      };
      DomSanitizerImpl.prototype.checkNotSafeValue = function(value, expectedType) {
        if (value instanceof SafeValueImpl) {
          throw new Error(("Required a safe " + expectedType + ", got a " + value.getTypeName() + " ") + "(see http://g.co/ng/security#xss)");
        }
      };
      DomSanitizerImpl.prototype.bypassSecurityTrustHtml = function(value) {
        return new SafeHtmlImpl(value);
      };
      DomSanitizerImpl.prototype.bypassSecurityTrustStyle = function(value) {
        return new SafeStyleImpl(value);
      };
      DomSanitizerImpl.prototype.bypassSecurityTrustScript = function(value) {
        return new SafeScriptImpl(value);
      };
      DomSanitizerImpl.prototype.bypassSecurityTrustUrl = function(value) {
        return new SafeUrlImpl(value);
      };
      DomSanitizerImpl.prototype.bypassSecurityTrustResourceUrl = function(value) {
        return new SafeResourceUrlImpl(value);
      };
      DomSanitizerImpl.decorators = [{type: _angular_core.Injectable}];
      DomSanitizerImpl.ctorParameters = [];
      return DomSanitizerImpl;
    }(DomSanitizer));
    var SafeValueImpl = (function() {
      function SafeValueImpl(changingThisBreaksApplicationSecurity) {
        this.changingThisBreaksApplicationSecurity = changingThisBreaksApplicationSecurity;
      }
      SafeValueImpl.prototype.toString = function() {
        return ("SafeValue must use [property]=binding: " + this.changingThisBreaksApplicationSecurity) + " (see http://g.co/ng/security#xss)";
      };
      return SafeValueImpl;
    }());
    var SafeHtmlImpl = (function(_super) {
      __extends$8(SafeHtmlImpl, _super);
      function SafeHtmlImpl() {
        _super.apply(this, arguments);
      }
      SafeHtmlImpl.prototype.getTypeName = function() {
        return 'HTML';
      };
      return SafeHtmlImpl;
    }(SafeValueImpl));
    var SafeStyleImpl = (function(_super) {
      __extends$8(SafeStyleImpl, _super);
      function SafeStyleImpl() {
        _super.apply(this, arguments);
      }
      SafeStyleImpl.prototype.getTypeName = function() {
        return 'Style';
      };
      return SafeStyleImpl;
    }(SafeValueImpl));
    var SafeScriptImpl = (function(_super) {
      __extends$8(SafeScriptImpl, _super);
      function SafeScriptImpl() {
        _super.apply(this, arguments);
      }
      SafeScriptImpl.prototype.getTypeName = function() {
        return 'Script';
      };
      return SafeScriptImpl;
    }(SafeValueImpl));
    var SafeUrlImpl = (function(_super) {
      __extends$8(SafeUrlImpl, _super);
      function SafeUrlImpl() {
        _super.apply(this, arguments);
      }
      SafeUrlImpl.prototype.getTypeName = function() {
        return 'URL';
      };
      return SafeUrlImpl;
    }(SafeValueImpl));
    var SafeResourceUrlImpl = (function(_super) {
      __extends$8(SafeResourceUrlImpl, _super);
      function SafeResourceUrlImpl() {
        _super.apply(this, arguments);
      }
      SafeResourceUrlImpl.prototype.getTypeName = function() {
        return 'ResourceURL';
      };
      return SafeResourceUrlImpl;
    }(SafeValueImpl));
    var INTERNAL_BROWSER_PLATFORM_PROVIDERS = [{
      provide: _angular_core.PLATFORM_INITIALIZER,
      useValue: initDomAdapter,
      multi: true
    }, {
      provide: _angular_common.PlatformLocation,
      useClass: BrowserPlatformLocation
    }];
    var BROWSER_SANITIZATION_PROVIDERS = [{
      provide: _angular_core.Sanitizer,
      useExisting: DomSanitizer
    }, {
      provide: DomSanitizer,
      useClass: DomSanitizerImpl
    }];
    var platformBrowser = _angular_core.createPlatformFactory(_angular_core.platformCore, 'browser', INTERNAL_BROWSER_PLATFORM_PROVIDERS);
    function initDomAdapter() {
      BrowserDomAdapter.makeCurrent();
      BrowserGetTestability.init();
    }
    function errorHandler() {
      return new _angular_core.ErrorHandler();
    }
    function _document() {
      return getDOM().defaultDoc();
    }
    function _resolveDefaultAnimationDriver() {
      if (getDOM().supportsWebAnimation()) {
        return new WebAnimationsDriver();
      }
      return AnimationDriver.NOOP;
    }
    var BrowserModule = (function() {
      function BrowserModule(parentModule) {
        if (parentModule) {
          throw new Error("BrowserModule has already been loaded. If you need access to common directives such as NgIf and NgFor from a lazy loaded module, import CommonModule instead.");
        }
      }
      BrowserModule.decorators = [{
        type: _angular_core.NgModule,
        args: [{
          providers: [BROWSER_SANITIZATION_PROVIDERS, {
            provide: _angular_core.ErrorHandler,
            useFactory: errorHandler,
            deps: []
          }, {
            provide: DOCUMENT,
            useFactory: _document,
            deps: []
          }, {
            provide: EVENT_MANAGER_PLUGINS,
            useClass: DomEventsPlugin,
            multi: true
          }, {
            provide: EVENT_MANAGER_PLUGINS,
            useClass: KeyEventsPlugin,
            multi: true
          }, {
            provide: EVENT_MANAGER_PLUGINS,
            useClass: HammerGesturesPlugin,
            multi: true
          }, {
            provide: HAMMER_GESTURE_CONFIG,
            useClass: HammerGestureConfig
          }, {
            provide: DomRootRenderer,
            useClass: DomRootRenderer_
          }, {
            provide: _angular_core.RootRenderer,
            useExisting: DomRootRenderer
          }, {
            provide: SharedStylesHost,
            useExisting: DomSharedStylesHost
          }, {
            provide: AnimationDriver,
            useFactory: _resolveDefaultAnimationDriver
          }, DomSharedStylesHost, _angular_core.Testability, EventManager, ELEMENT_PROBE_PROVIDERS, Title],
          exports: [_angular_common.CommonModule, _angular_core.ApplicationModule]
        }]
      }];
      BrowserModule.ctorParameters = [{
        type: BrowserModule,
        decorators: [{type: _angular_core.Optional}, {type: _angular_core.SkipSelf}]
      }];
      return BrowserModule;
    }());
    var win = typeof window !== 'undefined' && window || {};
    var ChangeDetectionPerfRecord = (function() {
      function ChangeDetectionPerfRecord(msPerTick, numTicks) {
        this.msPerTick = msPerTick;
        this.numTicks = numTicks;
      }
      return ChangeDetectionPerfRecord;
    }());
    var AngularTools = (function() {
      function AngularTools(ref) {
        this.profiler = new AngularProfiler(ref);
      }
      return AngularTools;
    }());
    var AngularProfiler = (function() {
      function AngularProfiler(ref) {
        this.appRef = ref.injector.get(_angular_core.ApplicationRef);
      }
      AngularProfiler.prototype.timeChangeDetection = function(config) {
        var record = config && config['record'];
        var profileName = 'Change Detection';
        var isProfilerAvailable = isPresent(win.console.profile);
        if (record && isProfilerAvailable) {
          win.console.profile(profileName);
        }
        var start = getDOM().performanceNow();
        var numTicks = 0;
        while (numTicks < 5 || (getDOM().performanceNow() - start) < 500) {
          this.appRef.tick();
          numTicks++;
        }
        var end = getDOM().performanceNow();
        if (record && isProfilerAvailable) {
          win.console.profileEnd(profileName);
        }
        var msPerTick = (end - start) / numTicks;
        win.console.log("ran " + numTicks + " change detection cycles");
        win.console.log(msPerTick.toFixed(2) + " ms per check");
        return new ChangeDetectionPerfRecord(msPerTick, numTicks);
      };
      return AngularProfiler;
    }());
    var context = global$1;
    function enableDebugTools(ref) {
      Object.assign(context.ng, new AngularTools(ref));
      return ref;
    }
    function disableDebugTools() {
      delete context.ng.profiler;
    }
    var By = (function() {
      function By() {}
      By.all = function() {
        return function(debugElement) {
          return true;
        };
      };
      By.css = function(selector) {
        return function(debugElement) {
          return isPresent(debugElement.nativeElement) ? getDOM().elementMatches(debugElement.nativeElement, selector) : false;
        };
      };
      By.directive = function(type) {
        return function(debugElement) {
          return debugElement.providerTokens.indexOf(type) !== -1;
        };
      };
      return By;
    }());
    var __platform_browser_private__ = {
      BrowserPlatformLocation: BrowserPlatformLocation,
      DomAdapter: DomAdapter,
      BrowserDomAdapter: BrowserDomAdapter,
      BrowserGetTestability: BrowserGetTestability,
      getDOM: getDOM,
      setRootDomAdapter: setRootDomAdapter,
      DomRootRenderer_: DomRootRenderer_,
      DomRootRenderer: DomRootRenderer,
      NAMESPACE_URIS: NAMESPACE_URIS,
      shimContentAttribute: shimContentAttribute,
      shimHostAttribute: shimHostAttribute,
      flattenStyles: flattenStyles,
      splitNamespace: splitNamespace,
      isNamespaced: isNamespaced,
      DomSharedStylesHost: DomSharedStylesHost,
      SharedStylesHost: SharedStylesHost,
      ELEMENT_PROBE_PROVIDERS: ELEMENT_PROBE_PROVIDERS,
      DomEventsPlugin: DomEventsPlugin,
      KeyEventsPlugin: KeyEventsPlugin,
      HammerGesturesPlugin: HammerGesturesPlugin,
      initDomAdapter: initDomAdapter,
      INTERNAL_BROWSER_PLATFORM_PROVIDERS: INTERNAL_BROWSER_PLATFORM_PROVIDERS,
      BROWSER_SANITIZATION_PROVIDERS: BROWSER_SANITIZATION_PROVIDERS,
      WebAnimationsDriver: WebAnimationsDriver
    };
    exports.BrowserModule = BrowserModule;
    exports.platformBrowser = platformBrowser;
    exports.Title = Title;
    exports.disableDebugTools = disableDebugTools;
    exports.enableDebugTools = enableDebugTools;
    exports.AnimationDriver = AnimationDriver;
    exports.By = By;
    exports.NgProbeToken = NgProbeToken;
    exports.DOCUMENT = DOCUMENT;
    exports.EVENT_MANAGER_PLUGINS = EVENT_MANAGER_PLUGINS;
    exports.EventManager = EventManager;
    exports.HAMMER_GESTURE_CONFIG = HAMMER_GESTURE_CONFIG;
    exports.HammerGestureConfig = HammerGestureConfig;
    exports.DomSanitizer = DomSanitizer;
    exports.__platform_browser_private__ = __platform_browser_private__;
  }));
})(require('process'));
