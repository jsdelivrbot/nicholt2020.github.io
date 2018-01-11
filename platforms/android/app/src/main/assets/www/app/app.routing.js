"use strict";
var router_1 = require('@angular/router');
var device_component_1 = require('./device/device.component');
var about_component_1 = require('./about/about.component');
exports.routes = [
    { path: '', component: about_component_1.AboutComponent },
    { path: 'device', component: device_component_1.DeviceComponent },
];
exports.routing = router_1.RouterModule.forRoot(exports.routes);
//# sourceMappingURL=app.routing.js.map