define('buildtable',['jquery','popup','form'],function($,popup,form){
    var thisTable,tableFilter={},dataId=0,
    Selector={
        search:'.dui-admin__search',
        searchField:'.dui-search__field',
        searchPopper:'.dui-search__field-popper',
        searchFieldShow:'.dui-search__field-show',
        searchPopperItem:'.dui-dropdown-menu__item',
        query:'.dui-query',
        queryToolbar:'.dui-query__toolbar',
        queryItem:'.dui-query__item',
        queryItemContent:'.dui-query__item-content',
        queryFieldPopper:'.dui-query__field-popper',
    },
    CLASS={
        open:'is-open',
    },
    TEXT={
        'qingshuru':'请输入...',
        'qingxuanze':'请选择...',
    },
    initSearchArea=function(){
        var that = this,thisTableFilter={},frist;//id必须不能重复
        // 设置点击事件
        tableFilter = [
            {
                field:'name',
                type:'string',
                title:'配置名称',
            },
            {
                field:'title',
                type:'string',
                title:'配置标题',
            },
            {
                field:'state',
                type:'enum',
                title:'状态',
                options:{
                    1:'启用',
                    0:'禁用'
                }
            },
            {
                field:'id',
                type:'integer',
                title:'ID',
            },
            {
                field:'create_time',
                type:'timestamp',
                title:'创建时间'
            }
        ];
        // 定义条件
        var Allcondition = {
            eq:'等于',
            neq:'不等于',
            gt:'大于',
            gte:'大于等于',
            lt:'小于',
            lte:'小于等于',
            contain:'包含',
            notContain:'不包含',
            between:'介于'
        }
        // 根据类型设置对应拥有的权限
        var condition = {
            'integer':['eq','neq','gt','gte','lt','lte','contain','notContain','between'],
            'float':['eq','neq','gt','gte','lt','lte','contain','notContain','between'],
            'timestamp':['gt','gte','lt','lte','between'],
            'boolean':['eq','neq'],
            'string':['contain','notContain'],
            'enum':['eq','neq'],
        }
        frist = tableFilter[0];
        // 初始化过滤信息
        initFilter();
        // 初始化设置和表格条件展开事件
        $(Selector.query).on('click','.show-parent',function(e){
            var parent = $(this).parent();
            if(parent.hasClass(CLASS.open)){
                parent.removeClass(CLASS.open);
            }else{
                parent.addClass(CLASS.open);
            }
        })
        // 初始化事件管理
        $(Selector.query).on('click','[query-event]',function(e){
            var name = $(this).attr('query-event');
            that.events[name]  && that.events[name].call(this, e)
        })
        // 所有的事件管理
        that.events = {
            /**
             * 添加一个条件
             */
            addCondition:function(e){
                var othis = $(this),ul;
                // 顶部的按钮
                if(othis.parents(Selector.queryToolbar)[0]){
                    ul = othis.parents(Selector.queryToolbar).next().children('ul');
                }else{
                    ul = othis.parents('.dui-query__item-content').next('ul');
                }
                // 给ul添加元素
                var template = $(function(){
                    return ['<li class="dui-query__item" data-id="'+(dataId++)+'" data-field="'+frist.field+'" data-mod="condition" data-type="'+frist.type+'" data-condition="'+condition[frist.type][0]+'" data-value="">',
                        '<div class="dui-query__item-content">',
                            '<div class="dui-query__item-prefix">',
                                '<input type="checkbox" dui-switch value="1" active-value="1" inactive-value="0" active-text="且" inactive-text="或" skin="label-in" width="43" inactive-color="#67c23a">',
                            '</div>',
                            '<div class="dui-query__item-field dui-firebrick" data-type="'+frist.type+'">',
                                '<label query-event="fieldChange">'+frist.title+'</label>',
                                '<ul class="dui-query__field-popper dui-popper dui-dropdown-menu" style="display: none;">',
                                    function(){
                                        var res = '';
                                        $.each(thisTableFilter,function(field,item){
                                            res += '<li class="dui-dropdown-menu__item" data-type="'+item.type+'" data-field="'+field+'"'+(field==frist.field?' is-select':'')+'>'+item.title+'</li>';
                                        })
                                        return res;
                                    }(),
                                    '<div x-arrow="" class="popper__arrow"></div>',
                                '</ul>',
                            '</div>',
                            '<div class="dui-query__item-condition dui-deeppink">',
                                '<label query-event="conditionChange">'+Allcondition[condition[frist.type][0]]+'</label>',
                                '<ul class="dui-query__condition-popper dui-popper dui-dropdown-menu" style="display: none;">',
                                '</ul>',
                            '</div>',
                            '<div class="dui-query__item-value dui-blueviolet">',
                                '<label query-event="valueClick">'+((frist.type=='enum')?TEXT.qingxuanze:TEXT.qingshuru)+'</label>',
                                '<div class="dui-query__item-value-form" style="display:nnone;">'+'</div>',
                            '</div>',
                            '<div class="dui-query__item-delete" query-event="deleteItem">',
                                '<i class="dui-icon-circle-close"></i>',
                            '</div>',
                        '</div>',
                    '</li>'].join('')
                }());
                ul.append(template);
                form.render(template[0]);
            },
            /**
             * 添加一个分组条件
             */
            addGroup:function(e){
                var othis = $(this),ul;
                // 顶部的按钮
                if(othis.parents(Selector.queryToolbar)[0]){
                    ul = othis.parents(Selector.queryToolbar).next().children('ul');
                }else{
                    ul = othis.parents('.dui-query__item-content').next('ul');
                }
                var template = $(['<li class="dui-query__item">',
                    '<div class="dui-query__item-content">',
                        '<div class="dui-query__item-prefix">',
                            '<input type="checkbox" dui-switch value="1" active-value="1" inactive-value="0" active-text="且" inactive-text="或" skin="label-in" width="43" inactive-color="#67c23a">',
                        '</div>',
                        '<div class="dui-firebrick">',
                            '分组',
                        '</div>',
                        '<div class="dui-query__item-op">',
                            '<div class="dui-button-group">',
                                '<button class="dui-button dui-button--primary dui-button--mini" query-event="addCondition">添加条件</button>',
                                '<button class="dui-button dui-button--primary dui-button--mini" query-event="addGroup">添加分组</button>',
                            '</div>',
                        '</div>',
                        '<div class="dui-query__item-delete" query-event="deleteItem">',
                            '<i class="dui-icon-circle-close"></i>',
                        '</div>',
                    '</div>',
                    '<ul class="dui-query__group">',                    
                    '</ul>',
                '</li>'].join(''))
                ul.append(template);
                form.render(template[0]);
            },
            /**
             * 删除一个事件
             */
            deleteItem:function(e){
                var othis = $(this),li=othis.parent().parent('li'),
                id=li.attr('data-id');

                // 删除当前节点
                li.remove();
            },
            /**
             * 字段切换事件
             */
            fieldChange:function(e){
                var othis = $(this),li=othis.parents(Selector.queryItemContent).parent(),othat = this;
                if(othat.pop && othat.pop.children('.dui-dropdown-menu__item').length<=1){
                    return;
                }
                // 表示已经初始化过
                if(othat.transition){
                    if(othat.visible===false){
                        othat.pop[0].hide();
                    }else{
                        othat.pop[0].show();
                    }
                    return;
                }
                var x = {top:'bottom','bottom':'top'};
                var ref = othis;
                var pop = othat.pop = othis.next('.dui-popper')
                othat.visible = pop.css('display')=='none' ? true : false;
                othat.popper = dui.addPopper(ref[0],pop[0],{
                    onCreate:function(data){
                        othat.transition = dui.transition(pop[0],{
                            name:'dui-zoom-in-'+x[data._options.placement]
                        });
                    },
                    onUpdate:function(data){
                        othat.transition.data.name = 'dui-zoom-in-'+x[data.placement];
                    }
                })
                pop[0].show = function(){
                    // 移动元素到body层
                    $('body').append(pop);
                    othat.visible =false;
                    othat.popper.updatePopper();
                    othat.transition.show();
                };
                pop[0].hide=function(){
                    othat.visible =true;
                    othat.transition.hide();
                };
                // 选项点击事件
                pop.on('click','.dui-dropdown-menu__item',function(e){
                    // 获取值
                    var oothis = $(this),field = oothis.attr('data-field'),li = othis.parents(Selector.queryItemContent).parent(),
                    type = oothis.attr('data-type'),text=oothis.text().trim();
                    // 设置当前选中 其他选项不选中
                    oothis.attr('is-select','').siblings().removeAttr('is-select');
                    // 设置当前选中类型
                    othis.attr('data-type',type),othis.attr('data-field',field),othis.text(text);
                    // 设置行数据
                    li.attr('data-field',field),li.attr('data-type',type);
                    // 设置下一级的选项和默认
                    var currenFieldCfg = thisTableFilter[field];
                    var conditionList = condition[currenFieldCfg.type];
                    othis.parent().next().find('label').text(Allcondition[conditionList[0]]);
                    li.attr('data-condition',conditionList[0])
                    // 重置
                    li.attr('data-value','')
                    // 判断第三个应该显示的提示
                    if(type=='enum'){
                        li.children(Selector.queryItemContent).find('.dui-query__item-value>label').text(TEXT.qingxuanze);
                    }else{
                        li.children(Selector.queryItemContent).find('.dui-query__item-value>label').text(TEXT.qingshuru);
                    }
                    // 关闭显示
                    pop[0].hide();
                })
                pop[0].show();
            },
            /**
             * 条件切换事件
             */
            conditionChange:function(e){
                var othis = $(this),li=othis.parents(Selector.queryItemContent).parent(),othat = this;
                var type = li.attr('data-type'),currenCondition=li.attr('data-condition'),conditionList = condition[type];
                // 设置选项
                var template = function(){
                    var res = '';
                    $.each(conditionList,function(index,key){
                        res += '<li class="dui-dropdown-menu__item" data-condition="'+key+'"'+(currenCondition==key?' is-select':'')+'>'+Allcondition[key]+'</li>'
                    })
                    res += '<div x-arrow="" class="popper__arrow"></div>';
                    return res;
                }();
                // 获取个数
                if(conditionList.length<=1){
                    return;
                }
                // 表示已经初始化过
                if(othat.transition){
                    othat.pop.html(template);
                    if(othat.visible===false){
                        othat.pop[0].hide();
                    }else{
                        othat.pop[0].show();
                    }
                    return;
                }else{
                    var x = {top:'bottom','bottom':'top'};
                    var ref = othis;
                    var pop = othat.pop = othis.next('.dui-popper')
                    pop.html(template);
                    othat.popper = dui.addPopper(ref[0],pop[0],{
                        onCreate:function(data){
                            othat.transition = dui.transition(pop[0],{
                                name:'dui-zoom-in-'+x[data._options.placement]
                            });
                        },
                        onUpdate:function(data){
                            othat.transition.data.name = 'dui-zoom-in-'+x[data.placement];
                        }
                    })
                    pop.on('click',Selector.searchPopperItem,function(e){
                        // 获取值
                        var oothis = $(this),li = othis.parents(Selector.queryItemContent).parent(),
                        condition = oothis.attr('data-condition'),text=oothis.text().trim();
                        // 设置当前选中 其他选项不选中
                        oothis.attr('is-select','').siblings().removeAttr('is-select');
                        // 设置行数据
                        li.attr('data-condition',condition)
                        // 设置显示
                        othis.text(text);
                        // 隐藏popper
                        pop[0].hide();
                    })
                    othat.pop[0].show=function(){
                        // 移动元素到body层
                        $('body').append(pop);
                        othat.visible =false;
                        othat.popper.updatePopper();
                        othat.transition.show();
                    };
                    othat.pop[0].hide=function(){
                        othat.visible =true;
                        othat.transition.hide();
                    };
                }
                othat.pop[0].show();
            },
            /**
             * 值选项点击事件
             */
            valueClick:function(e){
                var othis = $(this),li=othis.parents(Selector.queryItemContent).parent();
                var field = li.attr('data-field');
                var type = li.attr('data-type');
                var condition = li.attr('data-condition');
                var value = li.attr('data-value');
                var formDom = othis.next();
                var template = '';
                // 如果是枚举类型
                if(type=='enum'){
                    var options = thisTableFilter[field]['options']
                    template = $(['<select dui-select size="mini" clearable="true" placeholder="'+TEXT.qingxuanze+'">',
                        function(){
                            var res = '';
                            $.each(options,function(key,option){
                                res += '<option value="'+key+'"'+(value==key ? ' selected="selected"':'')+'>'+option+'</option>'                                        
                            })
                            return res;
                        }(),
                    '</select>'].join(''))
                    othis.hide();
                    othis.next().show();
                    template.on('change',function(e){
                        var thisSelect = $(this);
                        if(thisSelect.val()){
                            othis.text(options[thisSelect.val()]);
                            li.attr('data-value',thisSelect.val());
                            othis.attr('data-value',thisSelect.val());
                        }else{
                            othis.text(TEXT.qingxuanze);
                            li.attr('data-value','');
                            othis.attr('data-value','');
                        }
                        othis.show();
                        othis.next().hide();
                    })
                }else{
                    if(condition=='between'){
                        if(type=='timestamp'){

                        }else{

                        }
                    }else{
                        template = $(['<div class="dui-input dui-input--mini">',
                            '<input type="text" class="dui-input__inner " placeholder="'+TEXT.qingshuru+'" value="'+(value||'')+'">',
                        '</div>'].join(''))
                        othis.hide();
                        othis.next().show();
                        template.find('input').blur(function(e){
                            var val = $(this).val();
                            if(val){
                                othis.text(val);
                                li.attr('data-value',val);
                            }else{
                                othis.text(TEXT.qingshuru);
                                li.attr('data-value','');
                            }
                            othis.show();
                            othis.next().hide();
                        });
                    }
                }
                formDom.html('').append(template).trigger('click').find('input').focus();
                if(type=='timestamp'){
                    
                }else if(type=='enum'){
                    form.render(formDom[0]);
                }
            }
        }
        function initFilter(){
           $.each(tableFilter,function(index,item){
                thisTableFilter[item.field] = item;
           })
        }
        // 关闭选项统一事件
        $(document).on('click',function(e){
            var othis = $(e.target);
            $('body').find('.dui-popper').each(function(index,item){
                var $item = $(item);
                if(!($item.find(othis)[0] || $item[0]== othis[0])){
                    item.hide && $item.css('display')!='none' && item.hide();
                }
            })
        })
    },
    initSearch =function(){
        var that = this;that.data={};
        var x = {top:'bottom','bottom':'top'};
        var ref = $(Selector.search).find(Selector.searchField);
        var pop = $(Selector.search).find(Selector.searchPopper);
        if(!pop[0]){
            return;
        }
        that.popper = dui.addPopper(ref[0],pop[0],{
            onCreate:function(data){
                that.transition = dui.transition(pop[0],{
                    name:'dui-zoom-in-'+x[data._options.placement]
                });
            },
            onUpdate:function(data){
                that.transition.data.name = 'dui-zoom-in-'+x[data.placement];
            }
        })
        that.visible = pop.css('display')=='none' ? true : false;
        var show = function(){
            that.visible =false;
            that.popper.updatePopper();
            that.transition.show();
        };
        var hide = function(){
            that.visible =true;
            that.transition.hide();
        };
        ref.on('click',function(e){
            e.stopPropagation();
            if(that.visible){
                show();
            }else{
                hide();
            }
        })
        // 关闭
        $(document).on('click',function(e){
            var othis = $(e.target);
            //不是当前元素
            if(pop.find(othis)[0] || pop[0]==othis[0] || ref[0]==othis[0]){
                return false;
            }
            hide();
        })
        // 获取原始的数据
        pop.find(Selector.searchPopperItem).each(function(i,item){
            var othis = $(this);
            if(othis.text().trim().indexOf('不限')!=-1){
                that.data[othis.attr('data-field')] = $(Selector.search).find('[name="keyword"]').attr('placeholder');
            }else{
                that.data[othis.attr('data-field')] = '请输入'+othis.text().trim();
            }
        })
        // 添加选项事件
        pop.find(Selector.searchPopperItem).on('click',function(e){
            var othis = $(this),field=othis.attr('data-field');
            // 隐藏字段
            $(Selector.search).find('[name="field"]').val(field);
            // 显示信息
            $(Selector.search).find(Selector.searchFieldShow).text(othis.text().trim());
            // 设置提示信息
            $(Selector.search).find('[name="keyword"]').attr('placeholder',that.data[field]);
            // 隐藏popper
            hide();
        })
    },
    BuildTable = {
        render:function(table,filter){
            // 设置当前table，一切操作都是居于这个表格
            thisTable = table;
            // 表格筛选字段
            tableFilter = filter;
            // 重置id，避免重复
            dataId = 1;
            // 初始化简单搜索
            var search = new initMethod.initSearch();
            // 初始化高级查询
            var searchArea = new initMethod.initSearchArea();
        }
    },
    initMethod={
        // 初始化基础搜索
        initSearch:initSearch,
        // 初始化高级查询
        initSearchArea:initSearchArea,
    };
    return BuildTable;
})