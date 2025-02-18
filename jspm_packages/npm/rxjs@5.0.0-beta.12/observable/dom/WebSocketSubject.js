/* */ 
"use strict";
var __extends = (this && this.__extends) || function(d, b) {
  for (var p in b)
    if (b.hasOwnProperty(p))
      d[p] = b[p];
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subject_1 = require('../../Subject');
var Subscriber_1 = require('../../Subscriber');
var Observable_1 = require('../../Observable');
var Subscription_1 = require('../../Subscription');
var root_1 = require('../../util/root');
var ReplaySubject_1 = require('../../ReplaySubject');
var tryCatch_1 = require('../../util/tryCatch');
var errorObject_1 = require('../../util/errorObject');
var assign_1 = require('../../util/assign');
var WebSocketSubject = (function(_super) {
  __extends(WebSocketSubject, _super);
  function WebSocketSubject(urlConfigOrSource, destination) {
    if (urlConfigOrSource instanceof Observable_1.Observable) {
      _super.call(this, destination, urlConfigOrSource);
    } else {
      _super.call(this);
      this.WebSocketCtor = root_1.root.WebSocket;
      this._output = new Subject_1.Subject();
      if (typeof urlConfigOrSource === 'string') {
        this.url = urlConfigOrSource;
      } else {
        assign_1.assign(this, urlConfigOrSource);
      }
      if (!this.WebSocketCtor) {
        throw new Error('no WebSocket constructor can be found');
      }
      this.destination = new ReplaySubject_1.ReplaySubject();
    }
  }
  WebSocketSubject.prototype.resultSelector = function(e) {
    return JSON.parse(e.data);
  };
  WebSocketSubject.create = function(urlConfigOrSource) {
    return new WebSocketSubject(urlConfigOrSource);
  };
  WebSocketSubject.prototype.lift = function(operator) {
    var sock = new WebSocketSubject(this, this.destination);
    sock.operator = operator;
    return sock;
  };
  WebSocketSubject.prototype.multiplex = function(subMsg, unsubMsg, messageFilter) {
    var self = this;
    return new Observable_1.Observable(function(observer) {
      var result = tryCatch_1.tryCatch(subMsg)();
      if (result === errorObject_1.errorObject) {
        observer.error(errorObject_1.errorObject.e);
      } else {
        self.next(result);
      }
      var subscription = self.subscribe(function(x) {
        var result = tryCatch_1.tryCatch(messageFilter)(x);
        if (result === errorObject_1.errorObject) {
          observer.error(errorObject_1.errorObject.e);
        } else if (result) {
          observer.next(x);
        }
      }, function(err) {
        return observer.error(err);
      }, function() {
        return observer.complete();
      });
      return function() {
        var result = tryCatch_1.tryCatch(unsubMsg)();
        if (result === errorObject_1.errorObject) {
          observer.error(errorObject_1.errorObject.e);
        } else {
          self.next(result);
        }
        subscription.unsubscribe();
      };
    });
  };
  WebSocketSubject.prototype._connectSocket = function() {
    var _this = this;
    var WebSocketCtor = this.WebSocketCtor;
    var observer = this._output;
    var socket = null;
    try {
      socket = this.protocol ? new WebSocketCtor(this.url, this.protocol) : new WebSocketCtor(this.url);
      this.socket = socket;
    } catch (e) {
      observer.error(e);
      return;
    }
    var subscription = new Subscription_1.Subscription(function() {
      _this.socket = null;
      if (socket && socket.readyState === 1) {
        socket.close();
      }
    });
    socket.onopen = function(e) {
      var openObserver = _this.openObserver;
      if (openObserver) {
        openObserver.next(e);
      }
      var queue = _this.destination;
      _this.destination = Subscriber_1.Subscriber.create(function(x) {
        return socket.readyState === 1 && socket.send(x);
      }, function(e) {
        var closingObserver = _this.closingObserver;
        if (closingObserver) {
          closingObserver.next(undefined);
        }
        if (e && e.code) {
          socket.close(e.code, e.reason);
        } else {
          observer.error(new TypeError('WebSocketSubject.error must be called with an object with an error code, ' + 'and an optional reason: { code: number, reason: string }'));
        }
        _this.destination = new ReplaySubject_1.ReplaySubject();
        _this.socket = null;
      }, function() {
        var closingObserver = _this.closingObserver;
        if (closingObserver) {
          closingObserver.next(undefined);
        }
        socket.close();
        _this.destination = new ReplaySubject_1.ReplaySubject();
        _this.socket = null;
      });
      if (queue && queue instanceof ReplaySubject_1.ReplaySubject) {
        subscription.add(queue.subscribe(_this.destination));
      }
    };
    socket.onerror = function(e) {
      return observer.error(e);
    };
    socket.onclose = function(e) {
      var closeObserver = _this.closeObserver;
      if (closeObserver) {
        closeObserver.next(e);
      }
      if (e.wasClean) {
        observer.complete();
      } else {
        observer.error(e);
      }
    };
    socket.onmessage = function(e) {
      var result = tryCatch_1.tryCatch(_this.resultSelector)(e);
      if (result === errorObject_1.errorObject) {
        observer.error(errorObject_1.errorObject.e);
      } else {
        observer.next(result);
      }
    };
  };
  WebSocketSubject.prototype._subscribe = function(subscriber) {
    var _this = this;
    var source = this.source;
    if (source) {
      return source.subscribe(subscriber);
    }
    if (!this.socket) {
      this._connectSocket();
    }
    var subscription = new Subscription_1.Subscription();
    subscription.add(this._output.subscribe(subscriber));
    subscription.add(function() {
      var socket = _this.socket;
      if (_this._output.observers.length === 0 && socket && socket.readyState === 1) {
        socket.close();
        _this.socket = null;
      }
    });
    return subscription;
  };
  WebSocketSubject.prototype.unsubscribe = function() {
    var _a = this,
        source = _a.source,
        socket = _a.socket;
    if (socket && socket.readyState === 1) {
      socket.close();
      this.socket = null;
    }
    _super.prototype.unsubscribe.call(this);
    if (!source) {
      this.destination = new ReplaySubject_1.ReplaySubject();
    }
  };
  return WebSocketSubject;
}(Subject_1.AnonymousSubject));
exports.WebSocketSubject = WebSocketSubject;
