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
var Observable_1 = require('./Observable');
var Subscriber_1 = require('./Subscriber');
var Subscription_1 = require('./Subscription');
var ObjectUnsubscribedError_1 = require('./util/ObjectUnsubscribedError');
var SubjectSubscription_1 = require('./SubjectSubscription');
var rxSubscriber_1 = require('./symbol/rxSubscriber');
var SubjectSubscriber = (function(_super) {
  __extends(SubjectSubscriber, _super);
  function SubjectSubscriber(destination) {
    _super.call(this, destination);
    this.destination = destination;
  }
  return SubjectSubscriber;
}(Subscriber_1.Subscriber));
exports.SubjectSubscriber = SubjectSubscriber;
var Subject = (function(_super) {
  __extends(Subject, _super);
  function Subject() {
    _super.call(this);
    this.observers = [];
    this.closed = false;
    this.isStopped = false;
    this.hasError = false;
    this.thrownError = null;
  }
  Subject.prototype[rxSubscriber_1.$$rxSubscriber] = function() {
    return new SubjectSubscriber(this);
  };
  Subject.prototype.lift = function(operator) {
    var subject = new AnonymousSubject(this, this);
    subject.operator = operator;
    return subject;
  };
  Subject.prototype.next = function(value) {
    if (this.closed) {
      throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
    }
    if (!this.isStopped) {
      var observers = this.observers;
      var len = observers.length;
      var copy = observers.slice();
      for (var i = 0; i < len; i++) {
        copy[i].next(value);
      }
    }
  };
  Subject.prototype.error = function(err) {
    if (this.closed) {
      throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
    }
    this.hasError = true;
    this.thrownError = err;
    this.isStopped = true;
    var observers = this.observers;
    var len = observers.length;
    var copy = observers.slice();
    for (var i = 0; i < len; i++) {
      copy[i].error(err);
    }
    this.observers.length = 0;
  };
  Subject.prototype.complete = function() {
    if (this.closed) {
      throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
    }
    this.isStopped = true;
    var observers = this.observers;
    var len = observers.length;
    var copy = observers.slice();
    for (var i = 0; i < len; i++) {
      copy[i].complete();
    }
    this.observers.length = 0;
  };
  Subject.prototype.unsubscribe = function() {
    this.isStopped = true;
    this.closed = true;
    this.observers = null;
  };
  Subject.prototype._subscribe = function(subscriber) {
    if (this.closed) {
      throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
    } else if (this.hasError) {
      subscriber.error(this.thrownError);
      return Subscription_1.Subscription.EMPTY;
    } else if (this.isStopped) {
      subscriber.complete();
      return Subscription_1.Subscription.EMPTY;
    } else {
      this.observers.push(subscriber);
      return new SubjectSubscription_1.SubjectSubscription(this, subscriber);
    }
  };
  Subject.prototype.asObservable = function() {
    var observable = new Observable_1.Observable();
    observable.source = this;
    return observable;
  };
  Subject.create = function(destination, source) {
    return new AnonymousSubject(destination, source);
  };
  return Subject;
}(Observable_1.Observable));
exports.Subject = Subject;
var AnonymousSubject = (function(_super) {
  __extends(AnonymousSubject, _super);
  function AnonymousSubject(destination, source) {
    _super.call(this);
    this.destination = destination;
    this.source = source;
  }
  AnonymousSubject.prototype.next = function(value) {
    var destination = this.destination;
    if (destination && destination.next) {
      destination.next(value);
    }
  };
  AnonymousSubject.prototype.error = function(err) {
    var destination = this.destination;
    if (destination && destination.error) {
      this.destination.error(err);
    }
  };
  AnonymousSubject.prototype.complete = function() {
    var destination = this.destination;
    if (destination && destination.complete) {
      this.destination.complete();
    }
  };
  AnonymousSubject.prototype._subscribe = function(subscriber) {
    var source = this.source;
    if (source) {
      return this.source.subscribe(subscriber);
    } else {
      return Subscription_1.Subscription.EMPTY;
    }
  };
  return AnonymousSubject;
}(Subject));
exports.AnonymousSubject = AnonymousSubject;
