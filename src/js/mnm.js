/**
 * Created by jonathan on 9/16/15.
 * Consumes "modified node modules" on the client side.
 * See: https://github.com/joneit/nmn
 */

'use strict';

/* eslint-env browser */

window.module = {
    exports: {},
    modules: {},
    cache: function (moduleName) {
        window.module.modules[moduleName] = window.module.exports;
        window.module.exports = {};
    }
};

window.require = function (moduleName) {
    return window.module.modules[moduleName];
};
