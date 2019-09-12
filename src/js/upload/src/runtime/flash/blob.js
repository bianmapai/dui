/**
 * @fileOverview Blob Html实现
 */
import {FlashRuntime} from "./runtime";
import Blob from "../../lib/blob";
export default FlashRuntime.register( 'Blob', {
    slice: function( start, end ) {
        var blob = this.flashExec( 'Blob', 'slice', start, end );

        return new Blob( this.getRuid(), blob );
    }
});