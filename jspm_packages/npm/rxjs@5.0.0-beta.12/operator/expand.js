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
var tryCatch_1 = require('../util/tryCatch');
var errorObject_1 = require('../util/errorObject');
var OuterSubscriber_1 = require('../OuterSubscriber');
var subscribeToResult_1 = require('../util/subscribeToResult');
function expand(project, concurrent, scheduler) {
  if (concurrent === void 0) {
    concurrent = Number.POSITIVE_INFINITY;
  }
  if (scheduler === void 0) {
    scheduler = undefined;
  }
  concurrent = (concurrent || 0) < 1 ? Number.POSITIVE_INFINITY : concurrent;
  return this.lift(new ExpandOperator(project, concurrent, scheduler));
}
exports.expand = expand;
var ExpandOperator = (function() {
  function ExpandOperator(project, concurrent, scheduler) {
    this.project = project;
    this.concurrent = concurrent;
    this.scheduler = scheduler;
  }
  ExpandOperator.prototype.call = function(subscriber, source) {
    return source._subscribe(new ExpandSubscriber(subscriber, this.project, this.concurrent, this.scheduler));
  };
  return ExpandOperator;
}());
exports.ExpandOperator = ExpandOperator;
var ExpandSubscriber = (function(_super) {
  __extends(ExpandSubscriber, _super);
  function ExpandSubscriber(destination, project, concurrent, scheduler) {
    _super.call(this, destination);
    this.project = project;
    this.concurrent = concurrent;
    this.scheduler = scheduler;
    this.index = 0;
    this.active = 0;
    this.hasCompleted = false;
    if (concurrent < Number.POSITIVE_INFINITY) {
      this.buffer = [];
    }
  }
  ExpandSubscriber.dispatch = function(arg) {
    var subscriber = arg.subscriber,
        result = arg.result,
        value = arg.value,
        index = arg.index;
    subscriber.subscribeToProjection(result, value, index);
  };
  ExpandSubscriber.prototype._next = function(value) {
    var destination = this.destination;
    if (destination.closed) {
      this._complete();
      return;
    }
    var index = this.index++;
    if (this.active < this.concurrent) {
      destination.next(value);
      var result = tryCatch_1.tryCatch(this.project)(value, index);
      if (result === errorObject_1.errorObject) {
        destination.error(errorObject_1.errorObject.e);
      } else if (!this.scheduler) {
        this.subscribeToProjection(result, value, index);
      } else {
        var state = {
          subscriber: this,
          result: result,
          value: value,
          index: index
        };
        this.add(this.scheduler.schedule(ExpandSubscriber.dispatch, 0, state));
      }
    } else {
      this.buffer.push(value);
    }
  };
  ExpandSubscriber.prototype.subscribeToProjection = function(result, value, index) {
    this.active++;
    this.add(subscribeToResult_1.subscribeToResult(this, result, value, index));
  };
  ExpandSubscriber.prototype._complete = function() {
    this.hasCompleted = true;
    if (this.hasCompleted && this.active === 0) {
      this.destination.complete();
    }
  };
  ExpandSubscriber.prototype.notifyNext = function(outerValue, innerValue, outerIndex, innerIndex, innerSub) {
    this._next(innerValue);
  };
  ExpandSubscriber.prototype.notifyComplete = function(innerSub) {
    var buffer = this.buffer;
    this.remove(innerSub);
    this.active--;
    if (buffer && buffer.length > 0) {
      this._next(buffer.shift());
    }
    if (this.hasCompleted && this.active === 0) {
      this.destination.complete();
    }
  };
  return ExpandSubscriber;
}(OuterSubscriber_1.OuterSubscriber));
exports.ExpandSubscriber = ExpandSubscriber;
