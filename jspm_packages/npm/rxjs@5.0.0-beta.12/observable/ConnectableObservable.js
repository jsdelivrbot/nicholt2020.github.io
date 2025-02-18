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
var Subject_1 = require('../Subject');
var Observable_1 = require('../Observable');
var Subscriber_1 = require('../Subscriber');
var Subscription_1 = require('../Subscription');
var ConnectableObservable = (function(_super) {
  __extends(ConnectableObservable, _super);
  function ConnectableObservable(source, subjectFactory) {
    _super.call(this);
    this.source = source;
    this.subjectFactory = subjectFactory;
    this._refCount = 0;
  }
  ConnectableObservable.prototype._subscribe = function(subscriber) {
    return this.getSubject().subscribe(subscriber);
  };
  ConnectableObservable.prototype.getSubject = function() {
    var subject = this._subject;
    if (!subject || subject.isStopped) {
      this._subject = this.subjectFactory();
    }
    return this._subject;
  };
  ConnectableObservable.prototype.connect = function() {
    var connection = this._connection;
    if (!connection) {
      connection = this._connection = new Subscription_1.Subscription();
      connection.add(this.source.subscribe(new ConnectableSubscriber(this.getSubject(), this)));
      if (connection.closed) {
        this._connection = null;
        connection = Subscription_1.Subscription.EMPTY;
      } else {
        this._connection = connection;
      }
    }
    return connection;
  };
  ConnectableObservable.prototype.refCount = function() {
    return this.lift(new RefCountOperator(this));
  };
  return ConnectableObservable;
}(Observable_1.Observable));
exports.ConnectableObservable = ConnectableObservable;
var ConnectableSubscriber = (function(_super) {
  __extends(ConnectableSubscriber, _super);
  function ConnectableSubscriber(destination, connectable) {
    _super.call(this, destination);
    this.connectable = connectable;
  }
  ConnectableSubscriber.prototype._error = function(err) {
    this._unsubscribe();
    _super.prototype._error.call(this, err);
  };
  ConnectableSubscriber.prototype._complete = function() {
    this._unsubscribe();
    _super.prototype._complete.call(this);
  };
  ConnectableSubscriber.prototype._unsubscribe = function() {
    var connectable = this.connectable;
    if (connectable) {
      this.connectable = null;
      var connection = connectable._connection;
      connectable._refCount = 0;
      connectable._subject = null;
      connectable._connection = null;
      if (connection) {
        connection.unsubscribe();
      }
    }
  };
  return ConnectableSubscriber;
}(Subject_1.SubjectSubscriber));
var RefCountOperator = (function() {
  function RefCountOperator(connectable) {
    this.connectable = connectable;
  }
  RefCountOperator.prototype.call = function(subscriber, source) {
    var connectable = this.connectable;
    connectable._refCount++;
    var refCounter = new RefCountSubscriber(subscriber, connectable);
    var subscription = source._subscribe(refCounter);
    if (!refCounter.closed) {
      refCounter.connection = connectable.connect();
    }
    return subscription;
  };
  return RefCountOperator;
}());
var RefCountSubscriber = (function(_super) {
  __extends(RefCountSubscriber, _super);
  function RefCountSubscriber(destination, connectable) {
    _super.call(this, destination);
    this.connectable = connectable;
  }
  RefCountSubscriber.prototype._unsubscribe = function() {
    var connectable = this.connectable;
    if (!connectable) {
      this.connection = null;
      return;
    }
    this.connectable = null;
    var refCount = connectable._refCount;
    if (refCount <= 0) {
      this.connection = null;
      return;
    }
    connectable._refCount = refCount - 1;
    if (refCount > 1) {
      this.connection = null;
      return;
    }
    var connection = this.connection;
    var sharedConnection = connectable._connection;
    this.connection = null;
    if (sharedConnection && (!connection || sharedConnection === connection)) {
      sharedConnection.unsubscribe();
    }
  };
  return RefCountSubscriber;
}(Subscriber_1.Subscriber));
