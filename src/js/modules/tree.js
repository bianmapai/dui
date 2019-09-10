dui.define('tree',['jquery','form'],function($,form){
    var Class = function(options){
        var that = this,
        // 根据参数得到配置配置信息
        config = that.config = $.extend(true,{
            el:'',//指定元素
            name:'',//指定checkbox提交的表单名
            idName:'id',//用来指定数据的主键
            childName:'children',//子节点名称
            showCheckbox:false,//是否显示
            accordion:false,//是否每次只打开一个同级树节点展开
            indent:16,//相邻级节点间的水平缩进，单位为像素
            iconClass:'',//自定义图标显示
            showLine:false,//是否显示连接线
            checkeds:[],//选中的数据行
            expandeds:[],//展开的数据行
            expandAll:false,//全部展开
            checkedAll:false,//全部选中
            data:[],//显示数据
        },options);
        // 记录参数
        that.options = options;
        // 用来装树形结构的容器
        that.el = $(config.el);
        // 根据数据源的类型加载数据
        if($.isArray(config.data)){
            that.data = $.extend(true,[],config.data);
            that.render();
        }else if(config.data && config.data.url){

        }else{
            console.error('数据源类型错误！');
            return;
        }
    },
    TREE_NODE='dui-tree-node',EXPAND_ICON='dui-tree-node__expand-icon',
    TREE_CHILD='dui-tree-node__children',TREE_CONTENT='dui-tree-node__content',
    tree = function(options){
        if(!options.el || !$(options.el)[0]){
            throw new Error('初始化失败:没有获取到初始化元素');
        }
        var inst = new Class(options);
        return thisTree.call(inst);
    },
    thisTree = function(){
        var that = this,config = that.config;
        return {
            config:config,

        }
    }
    /**
     * 渲染
     */
    Class.prototype.render = function(){
        var that = this,data = that.data,
        config = that.config,view = that.view(data,1);
        that.el.html('').addClass('dui-tree');
        that.inner = $(view);
        that.el.append(that.inner);
        // 渲染页面
        form.render(that.el[0],'checkbox');
        // 设置当前选中
        that.checkeds = $.extend(true,[],config.checkeds);
        // 层级数据转列表数据
        that.dataList = that.layerToList(data);
        console.log(that.dataList);
        // 设置事件
        that.evens();
    }
    /**
     * 层级数据转列表数据
     */
    Class.prototype.layerToList = function(data,pid){
        var config=this.config;pid=pid || 0;
        var digui = function(thisData,thisPid){
            var res = {};
            thisData = JSON.parse(JSON.stringify(thisData));
            $.each(thisData,function(i,item){
                item.pid = thisPid
                res[item[config.idName]] = item;
                if(item[config.childName] && $.isArray(item[config.childName])){
                    Object.assign(res,digui(item[config.childName],item[config.idName]));
                }
            })
            return res;
        }
        return digui(data,pid);
    }
    /**
     * 获取显示元素
     */
    Class.prototype.view = function(data,level){
        var that = this,config=that.config,res='';
        $.each(data,function(i,item){
            var temp = ['<div class="dui-tree-node'+function(){
                if(item.expanded || $.inArray(item[config.idName],config.expanded)!=-1 || config.expandAll){
                    return ' is-expanded'
                }else{
                    return '';
                }
            }()+'">',
                '<div class="dui-tree-node__content" data-key="'+item[config.idName]+'" style="padding-left:'+((level-1)*config.indent)+'px">',
                    '<i class="dui-tree-node__expand-icon dui-icon-arrow-right'+function(){ 
                        if(!item[config.childName]){
                            return ' is-leaf';
                        }
                        return '';
                    }()+'"></i>',
                    function(){
                        if(config.showCheckbox){
                            return ['<input type="checkbox"'+(config.name?' value="'+item[config.idName]+'" name="'+config.name+'[]"':'')+' dui-checkbox'+function(){
                                if(item.checked || $.inArray(item[config.idName],config.checkeds)!=-1 || config.checkedAll){
                                    return ' checked="checked"';
                                }
                                return '';
                            }(),
                            function(){
                                if(item.disabled){
                                    return ' disabled="disabled"';
                                }else{
                                    return '';
                                }
                            }(),
                            '>'].join('');
                        }
                    }(),
                    '<span class="dui-tree-node__label">'+item.label+'</span>',
                '</div>',
                function(){
                    if(item[config.childName] && $.isArray(item[config.childName])){
                        return '<div class="dui-tree-node__children" '+function(){
                            if(item.expanded || $.inArray(item[config.idName],config.expandeds)!=-1 || config.expandAll){
                                return 'style="display:block"';
                            }else{
                                return 'style="display:none"';
                            }
                        }()+'>'+that.view(item[config.childName],level+1)+'</div>';
                    }
                    return '';
                }(),
            '</div>'].join('');
            res += temp;
        })
        return res;
    }
    /**
     * 事件设置
     */
    Class.prototype.evens = function(){
        var that = this,config = that.config;
        //设置点击事件
        that.el.find('.'+TREE_NODE).on('click',function(e){
            e.stopPropagation();
            var othis = $(this),isExpand = othis.hasClass('is-expanded'),
            expandIcon = othis.children('.'+TREE_CONTENT).find('.'+EXPAND_ICON),
            childs = othis.children('.'+TREE_CHILD);
            if(isExpand){
                childs.hide(300);
                expandIcon.removeClass('expanded');
                othis.removeClass('is-expanded');
            }else{
                childs.show(300);
                expandIcon.addClass('expanded');
                othis.addClass('is-expanded');
            }
        })
        //选择框事件
        .find('.dui-checkbox').on('click',function(e){
            e.stopPropagation();
            var othis = $(this),treeNode = othis.parent(),
            id = treeNode.data('key'),thisData = that.dataList[id],
            childs = thisData[config.childName] || [],checkbox = othis.find('input[dui-checkbox]'),
            currCheckedAll = [],checked = checkbox[0].checked,
            checkedIds = [].concat(getDownIds(childs)).concat(getUpIds(thisData));
            that.el.find('input[dui-checkbox]:checked').parents('.dui-checkbox').parent().each(function(i,oNone){
                currCheckedAll.push($(oNone).data('key'));
            })
            // 获取所有的下级id
            function getUpIds(thisData){
                var res = [];
                var item = that.dataList[thisData.pid],
                isInArray = false;
                if(item){
                    // 如果是取消的是
                    if(checked==false){
                        // 获取当前item的子数据
                        var tempChild = $.extend(true,{},item[config.childName]);
                        // 删除当前子节点
                        $.each(tempChild,function(i,cd){
                            if(cd[config.idName]==thisData[config.idName]){
                                delete tempChild[i];
                            }
                        })
                        $.each(tempChild,function(i,cd){
                            if($.inArray(cd[config.idName],currCheckedAll)!==-1){
                                isInArray = true;
                                return [];
                            }
                        })
                        if(isInArray){
                            return [];
                        }
                    }
                    res.push(item[config.idName]);
                    // 如果有父节点
                    if(item.pid){
                        res = res.concat(getUpIds(item));
                    }
                }
                return res;
            }
            function getDownIds(child){
                var res = [];
                $.each(child,function(key,item){
                    if(!item.disabled){
                        res.push(item[config.idName]);
                        if(item[config.childName]){
                            res = res.concat(getDownIds(item[config.childName]))
                        }
                    }
                })
                return res;
            }
            that.el.find('.'+TREE_CONTENT).each(function(i,tnode){
                var tothis = $(this),id=tothis.data('key'),
                tcheckbox = tothis.children('.dui-checkbox').find('input[dui-checkbox]');
                if($.inArray(id,checkedIds)!==-1){
                    if(tcheckbox[0].checkboxClass){
                        tcheckbox[0].checkboxClass.setChecked(checked);
                    }else{
                        if(checked){
                            $(checkbox).attr('checked','checked');
                            $(tcheckbox).attr('checked','checked');
                        }else{
                            $(tcheckbox).removeAttr('checked');
                            $(checkbox).removeAttr('checked');
                        }
                        form.render(that.el[0],'checkbox');
                    }
                }
            })


            
        });
    }
    /**
     * 渲染方法
     */
    tree.render = function(options){
        return tree(options);
    }
    return tree;
})