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
var tryCatch_1 = require('../util/tryCatch');
var errorObject_1 = require('../util/errorObject');
var OuterSubscriber_1 = require('../OuterSubscriber');
var subscribeToResult_1 = require('../util/subscribeToResult');
function retryWhen(notifier) {
  return this.lift(new RetryWhenOperator(notifier, this));
}
exports.retryWhen = retryWhen;
var RetryWhenOperator = (function() {
  function RetryWhenOperator(notifier, source) {
    this.notifier = notifier;
    this.source = source;
  }
  RetryWhenOperator.prototype.call = function(subscriber, source) {
    return source._subscribe(new RetryWhenSubscriber(subscriber, this.notifier, this.source));
  };
  return RetryWhenOperator;
}());
var RetryWhenSubscriber = (function(_super) {
  __extends(RetryWhenSubscriber, _super);
  function RetryWhenSubscriber(destination, notifier, source) {
    _super.call(this, destination);
    this.notifier = notifier;
    this.source = source;
  }
  RetryWhenSubscriber.prototype.error = function(err) {
    if (!this.isStopped) {
      var errors = this.errors;
      var retries = this.retries;
      var retriesSubscription = this.retriesSubscription;
      if (!retries) {
        errors = new Subject_1.Subject();
        retries = tryCatch_1.tryCatch(this.notifier)(errors);
        if (retries === errorObject_1.errorObject) {
          return _super.prototype.error.call(this, errorObject_1.errorObject.e);
        }
        retriesSubscription = subscribeToResult_1.subscribeToResult(this, retries);
      } else {
        this.errors = null;
        this.retriesSubscription = null;
      }
      this.unsubscribe();
      this.closed = false;
      this.errors = errors;
      this.retries = retries;
      this.retriesSubscription = retriesSubscription;
      errors.next(err);
    }
  };
  RetryWhenSubscriber.prototype._unsubscribe = function() {
    var _a = this,
        errors = _a.errors,
        retriesSubscription = _a.retriesSubscription;
    if (errors) {
      errors.unsubscribe();
      this.errors = null;
    }
    if (retriesSubscription) {
      retriesSubscription.unsubscribe();
      this.retriesSubscription = null;
    }
    this.retries = null;
  };
  RetryWhenSubscriber.prototype.notifyNext = function(outerValue, innerValue, outerIndex, innerIndex, innerSub) {
    var _a = this,
        errors = _a.errors,
        retries = _a.retries,
        retriesSubscription = _a.retriesSubscription;
    this.errors = null;
    this.retries = null;
    this.retriesSubscription = null;
    this.unsubscribe();
    this.isStopped = false;
    this.closed = false;
    this.errors = errors;
    this.retries = retries;
    this.retriesSubscription = retriesSubscription;
    this.source.subscribe(this);
  };
  return RetryWhenSubscriber;
}(OuterSubscriber_1.OuterSubscriber));
