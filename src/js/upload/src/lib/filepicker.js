/**
 * @fileOverview 错误信息
 */
import {Base} from "../base";
import RuntimeClient from "../runtime/client";
import File from "./file";
import $ from "jquery";

function FilePicker( opts ) {
    opts = this.options = $.extend({}, FilePicker.options, opts );

    opts.container = $( opts.id );

    
    if ( !opts.container.length ) {
        throw new Error('按钮指定错误');
    }

    opts.innerHTML = opts.innerHTML || opts.label ||
            opts.container.html() || '';

    opts.button = $( opts.button || document.createElement('div') );
    opts.button.html( opts.innerHTML );
    opts.container.html( opts.button );
    RuntimeClient.call( this, 'FilePicker', true );
}

FilePicker.options = {
    button: null,
    container: null,
    label: null,
    innerHTML: null,
    multiple: true,
    accept: null,
    name: 'file',
    style: 'dui-upload__pick'   //pick element class attribute, default is "dui-upload__pick"
};

Base.inherits( RuntimeClient, {
    constructor: FilePicker,

    init: function() {
        var me = this,
            opts = me.options,
            button = opts.button,
            style = opts.style;

        if (style)
            button.addClass(style);

        me.on( 'all', function( type ) {
            var files;

            switch ( type ) {
                case 'mouseenter':
                    if (style)
                        button.addClass('is-hover');
                    break;

                case 'mouseleave':
                    if (style)
                        button.removeClass('is-hover');
                    break;

                case 'change':
                    files = me.exec('getFiles');
                    me.trigger( 'select', $.map( files, function( file ) {
                        file = new File( me.getRuid(), file );

                        // 记录来源。
                        file._refer = opts.container;
                        return file;
                    }), opts.container );
                    break;
            }
        });

        me.connectRuntime( opts, function() {
            me.refresh();
            me.exec( 'init', opts );
            me.trigger('ready');
        });

        this._resizeHandler = Base.bindFn( this.refresh, this );
        $( window ).on( 'resize', this._resizeHandler );
    },

    refresh: function() {
        var shimContainer = this.getRuntime().getContainer(),
            button = this.options.button,
            /*
            width = button.outerWidth ?
                    button.outerWidth() : button.width(),

            height = button.outerHeight ?
                    button.outerHeight() : button.height(),
            */
            width = button[0] && button[0].offsetWidth || button.outerWidth() || button.width(),
            height = button[0] && button[0].offsetHeight || button.outerHeight() || button.height(),
            pos = button.offset();

        width && height && shimContainer.css({
            bottom: 'auto',
            right: 'auto',
            width: width + 'px',
            height: height + 'px'
        }).offset( pos );
    },

    enable: function() {
        var btn = this.options.button;

        btn.removeClass('is-disable');
        this.refresh();
    },

    disable: function() {
        var btn = this.options.button;

        this.getRuntime().getContainer().css({
            top: '-99999px'
        });

        btn.addClass('is-disable');
    },

    destroy: function() {
        var btn = this.options.button;
        $( window ).off( 'resize', this._resizeHandler );
        btn.removeClass('is-disable is-hover ' +
            this.options.style);
    }
});

export default FilePicker;