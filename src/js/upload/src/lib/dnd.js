/**
 * @fileOverview 错误信息
 */
import {Base} from "../base";
import Mediator from "../mediator";
import RuntimeClent from "../runtime/client";
var $ = Base.$;

function DragAndDrop( opts ) {
    opts = this.options = $.extend({}, DragAndDrop.options, opts );

    opts.container = $( opts.container );

    if ( !opts.container.length ) {
        return;
    }

    RuntimeClent.call( this, 'DragAndDrop' );
}

DragAndDrop.options = {
    accept: null,
    disableGlobalDnd: false
};

Base.inherits( RuntimeClent, {
    constructor: DragAndDrop,

    init: function() {
        var me = this;

        me.connectRuntime( me.options, function() {
            me.exec('init');
            me.trigger('ready');
        });
    }
});

Mediator.installTo( DragAndDrop.prototype );
export default DragAndDrop;