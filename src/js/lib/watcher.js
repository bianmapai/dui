import { type, each, isPlainObject, extend } from "./loadjs";
function watch(option){
    this.$data = type(option.data)==="object" ? extend(true,{},option.data) : {};
    this.$watch = type(option.watch)==="object" ? extend(true,{},option.watch) : {};
    this.$deep = type(option.deep)==="boolean" ? extend(true,{},option).deep : false;
    this.defineProx();
}
watch.prototype.defineProx = function(){
    var that = this;
    var defineProperty = function(data,prevKey,deep){
        each(data,function(key,oldVal){
            var fnKey = prevKey ? prevKey+'.'+ key : key;
            if(!isPlainObject(data)){
                return;
            }
            Object.defineProperty(data,key,{
                get:function(){
                    return oldVal;
                },
                set:function(val){
                    var newVal = val;
                    that.$watch[fnKey] && typeof that.$watch[fnKey] === "function" && that.$watch[fnKey](newVal,oldVal);
                }
            })
            if(deep && type(oldVal)==="object"){
                defineProperty(oldVal,fnKey,deep);
            }
        })
    };
    defineProperty(this.$data,null,that.$deep);
}
export default function(option){
    return new watch(option);
};