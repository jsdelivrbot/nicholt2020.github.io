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
var Subscriber_1 = require('../Subscriber');
var Subscription_1 = require('../Subscription');
var Observable_1 = require('../Observable');
var Subject_1 = require('../Subject');
var Map_1 = require('../util/Map');
var FastMap_1 = require('../util/FastMap');
function groupBy(keySelector, elementSelector, durationSelector) {
  return this.lift(new GroupByOperator(this, keySelector, elementSelector, durationSelector));
}
exports.groupBy = groupBy;
var GroupByOperator = (function() {
  function GroupByOperator(source, keySelector, elementSelector, durationSelector) {
    this.source = source;
    this.keySelector = keySelector;
    this.elementSelector = elementSelector;
    this.durationSelector = durationSelector;
  }
  GroupByOperator.prototype.call = function(subscriber, source) {
    return source._subscribe(new GroupBySubscriber(subscriber, this.keySelector, this.elementSelector, this.durationSelector));
  };
  return GroupByOperator;
}());
var GroupBySubscriber = (function(_super) {
  __extends(GroupBySubscriber, _super);
  function GroupBySubscriber(destination, keySelector, elementSelector, durationSelector) {
    _super.call(this, destination);
    this.keySelector = keySelector;
    this.elementSelector = elementSelector;
    this.durationSelector = durationSelector;
    this.groups = null;
    this.attemptedToUnsubscribe = false;
    this.count = 0;
  }
  GroupBySubscriber.prototype._next = function(value) {
    var key;
    try {
      key = this.keySelector(value);
    } catch (err) {
      this.error(err);
      return;
    }
    this._group(value, key);
  };
  GroupBySubscriber.prototype._group = function(value, key) {
    var groups = this.groups;
    if (!groups) {
      groups = this.groups = typeof key === 'string' ? new FastMap_1.FastMap() : new Map_1.Map();
    }
    var group = groups.get(key);
    var element;
    if (this.elementSelector) {
      try {
        element = this.elementSelector(value);
      } catch (err) {
        this.error(err);
      }
    } else {
      element = value;
    }
    if (!group) {
      groups.set(key, group = new Subject_1.Subject());
      var groupedObservable = new GroupedObservable(key, group, this);
      this.destination.next(groupedObservable);
      if (this.durationSelector) {
        var duration = void 0;
        try {
          duration = this.durationSelector(new GroupedObservable(key, group));
        } catch (err) {
          this.error(err);
          return;
        }
        this.add(duration.subscribe(new GroupDurationSubscriber(key, group, this)));
      }
    }
    if (!group.closed) {
      group.next(element);
    }
  };
  GroupBySubscriber.prototype._error = function(err) {
    var groups = this.groups;
    if (groups) {
      groups.forEach(function(group, key) {
        group.error(err);
      });
      groups.clear();
    }
    this.destination.error(err);
  };
  GroupBySubscriber.prototype._complete = function() {
    var groups = this.groups;
    if (groups) {
      groups.forEach(function(group, key) {
        group.complete();
      });
      groups.clear();
    }
    this.destination.complete();
  };
  GroupBySubscriber.prototype.removeGroup = function(key) {
    this.groups.delete(key);
  };
  GroupBySubscriber.prototype.unsubscribe = function() {
    if (!this.closed && !this.attemptedToUnsubscribe) {
      this.attemptedToUnsubscribe = true;
      if (this.count === 0) {
        _super.prototype.unsubscribe.call(this);
      }
    }
  };
  return GroupBySubscriber;
}(Subscriber_1.Subscriber));
var GroupDurationSubscriber = (function(_super) {
  __extends(GroupDurationSubscriber, _super);
  function GroupDurationSubscriber(key, group, parent) {
    _super.call(this);
    this.key = key;
    this.group = group;
    this.parent = parent;
  }
  GroupDurationSubscriber.prototype._next = function(value) {
    this._complete();
  };
  GroupDurationSubscriber.prototype._error = function(err) {
    var group = this.group;
    if (!group.closed) {
      group.error(err);
    }
    this.parent.removeGroup(this.key);
  };
  GroupDurationSubscriber.prototype._complete = function() {
    var group = this.group;
    if (!group.closed) {
      group.complete();
    }
    this.parent.removeGroup(this.key);
  };
  return GroupDurationSubscriber;
}(Subscriber_1.Subscriber));
var GroupedObservable = (function(_super) {
  __extends(GroupedObservable, _super);
  function GroupedObservable(key, groupSubject, refCountSubscription) {
    _super.call(this);
    this.key = key;
    this.groupSubject = groupSubject;
    this.refCountSubscription = refCountSubscription;
  }
  GroupedObservable.prototype._subscribe = function(subscriber) {
    var subscription = new Subscription_1.Subscription();
    var _a = this,
        refCountSubscription = _a.refCountSubscription,
        groupSubject = _a.groupSubject;
    if (refCountSubscription && !refCountSubscription.closed) {
      subscription.add(new InnerRefCountSubscription(refCountSubscription));
    }
    subscription.add(groupSubject.subscribe(subscriber));
    return subscription;
  };
  return GroupedObservable;
}(Observable_1.Observable));
exports.GroupedObservable = GroupedObservable;
var InnerRefCountSubscription = (function(_super) {
  __extends(InnerRefCountSubscription, _super);
  function InnerRefCountSubscription(parent) {
    _super.call(this);
    this.parent = parent;
    parent.count++;
  }
  InnerRefCountSubscription.prototype.unsubscribe = function() {
    var parent = this.parent;
    if (!parent.closed && !this.closed) {
      _super.prototype.unsubscribe.call(this);
      parent.count -= 1;
      if (parent.count === 0 && parent.attemptedToUnsubscribe) {
        parent.unsubscribe();
      }
    }
  };
  return InnerRefCountSubscription;
}(Subscription_1.Subscription));
