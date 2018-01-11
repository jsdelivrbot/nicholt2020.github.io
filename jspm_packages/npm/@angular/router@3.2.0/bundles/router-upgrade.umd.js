/* */ 
"format cjs";
(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('./router.umd'), require('@angular/upgrade/static')) : typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/router', '@angular/upgrade/static'], factory) : (factory((global.ng = global.ng || {}, global.ng.router = global.ng.router || {}, global.ng.router.upgrade = global.ng.router.upgrade || {}), global.ng.core, global.ng.router, global.ng.upgrade.static));
}(this, function(exports, _angular_core, _angular_router, _angular_upgrade_static) {
  'use strict';
  var RouterUpgradeInitializer = {
    provide: _angular_router.ROUTER_INITIALIZER,
    useFactory: initialRouterNavigation,
    deps: [_angular_upgrade_static.UpgradeModule, _angular_core.ApplicationRef, _angular_router.RouterPreloader, _angular_router.ROUTER_CONFIGURATION]
  };
  function initialRouterNavigation(ngUpgrade, ref, preloader, opts) {
    return function() {
      var router = ngUpgrade.injector.get(_angular_router.Router);
      var ref = ngUpgrade.injector.get(_angular_core.ApplicationRef);
      router.resetRootComponentType(ref.componentTypes[0]);
      preloader.setUpPreloading();
      if (opts.initialNavigation === false) {
        router.setUpLocationChangeListener();
      } else {
        setTimeout(function() {
          router.initialNavigation();
        }, 0);
      }
      ngUpgrade.$injector.get('$rootScope').$on('$locationChangeStart', function(_, next, __) {
        var url = document.createElement('a');
        url.href = next;
        router.navigateByUrl(url.pathname);
      });
    };
  }
  exports.RouterUpgradeInitializer = RouterUpgradeInitializer;
  exports.initialRouterNavigation = initialRouterNavigation;
}));
