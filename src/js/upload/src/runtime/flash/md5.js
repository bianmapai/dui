/**
 * @fileOverview  Md5 flash实现
 */
import FlashRuntime from "./runtime";
export default FlashRuntime.register( 'Md5', {
    init: function() {
        // do nothing.
    },
    loadFromBlob: function( blob ) {
        return this.flashExec( 'Md5', 'loadFromBlob', blob.uid );
    }
});