/**
 * 初始化js类
 * @param {Object} options jsTree配置如：{
 * id:"id",
 * pid:"pid",
 * child:"child"
 * }
 */
var JsTree = function(options){
    var that = this;
    that.config = $.extend({
        id:"id",    // id名称
        pid:"pid",   // pid名称
        child:"child", // 子元素键名
    },options);
    return that;
};
/**
 * 获取带层级的数据
 * @param {Array} lists 数据集
 * @param {String} pid 父节点编号
 * @param {number} level 当前层级别
 */
JsTree.prototype.toLayer = function(lists,pid,level){
    var that = this,config= that.config,trees = [],clone=JSON.parse(JSON.stringify(lists));
    pid = pid ? pid : 0,level=level?level:0;
    aiui.each(clone,function(key,value){
        if(value[config.pid]==pid){
            var child = that.toLayer(clone,value[config.id],level+1)
            if(child.length>0){
                value['hasChild'] = true;
                value[config.child] = child;
            }
            trees.push(value);
        }
    })
    return trees;
}
JsTree.prototype.toList = function(lists,pid,level){
    var that = this,config= that.config,trees = [],clone=JSON.parse(JSON.stringify(lists));
    pid = pid ? pid : 0,level=level?level:0;
    aiui.each(clone,function(key,value){
        var temp =JSON.parse(JSON.stringify(clone));
        if(value[config.pid]==pid){
            value['level'] = level + 1;
            var child = that.toLayer(temp,value[config.id],level+1)
            if(child.length>0){//表示有子节点
                value['hasChild'] = true;
                value[config.child] = child;
            }
            trees.push(value);
            trees = trees.concat(that.toList(clone,value[config.id],level+1))
        }
    })
    return trees;
}
export default JsTree;