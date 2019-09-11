/**
 * @fileOverview Promise/A+
 */
import $ from "jquery";
export var promise = {
    Deferred: $.Deferred,
    when: $.when,
    isPromise: function( anything ) {
        return anything && typeof anything.then === 'function';
    }
};