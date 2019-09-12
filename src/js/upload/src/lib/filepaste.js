/**
 * @fileOverview 错误信息
 */
import {Base} from "../base";
import Mediator from "../mediator";
import RuntimeClent from "../runtime/client";
import $ from "jquery";

function FilePaste( opts ) {
    opts = this.options = $.extend({}, opts );
    opts.container = $( opts.container || document.body );
    RuntimeClent.call( this, 'FilePaste' );
}

Base.inherits( RuntimeClent, {
    constructor: FilePaste,

    init: function() {
        var me = this;

        me.connectRuntime( me.options, function() {
            me.exec('init');
            me.trigger('ready');
        });
    }
});

Mediator.installTo( FilePaste.prototype );

export default FilePaste;