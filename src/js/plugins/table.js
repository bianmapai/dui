import $ from "jquery";
import template from "template";
import form from "form";
import popup from "popup";
import pagination from "pagination";
/**
 * 初始化入口
 */
var _WIN = $(window),
_DOC = $(document),
Allcondition = {
    eq:'等于',
    neq:'不等于',
    gt:'大于',
    gte:'大于等于',
    lt:'小于',
    lte:'小于等于',
    contain:'包含',
    notContain:'不包含',
    between:'介于'
},
// 根据类型设置对应拥有的权限
condition = {
    'integer':['eq','neq','gt','gte','lt','lte','contain','notContain','between'],
    'float':['eq','neq','gt','gte','lt','lte','contain','notContain','between'],
    'timestamp':['gt','gte','lt','lte','between'],
    'boolean':['eq','neq'],
    'string':['contain','notContain','eq','neq'],
    'enum':['eq','neq'],
},
// 常量定义
ELEM = '.dui-table',TABLEBOX='.dui-table__box',HEADER='.dui-table__header-wrapper',BODYER='.dui-table__body-wrapper',
FIXED = '.dui-table__fixed',FIXED_LEFT='.dui-table__fixed-left',FIXED_RIGHT='.dui-table__fixed-right',
PAGE = '.dui-table__page',CONDITION='.dui-table__condition',PATCH = '.dui-table__fixed-right-patch',FIXED_WRAP='.dui-table__fixed-body-wrapper',
TABLEBODY='.dui-table__body',ROWHOVER='.dui-table__body tr',FIXED_HEAD='.dui-table__fixed-header-wrapper',
TABLEHEADER = '.dui-table__header',HEADER_TH = TABLEHEADER+' th',HEADER_SORT='.caret-wrapper',TREETABLE_EXPAND='dui-table__expand-icon',
TREETABLE_EXPANDED='dui-table__expand-icon--expanded',
// 列模板
TMPL_HEAD=function(options){
    options = options || {};
    return [
        '<table cellspacing="0" cellpadding="0" border="0" class="dui-table__header">',
            '<thead>',
                '{{each columns  item1 i1}}',
                    '<tr>',
                    //如果有fixed，则只要一次就可以找出来，否则需要三次
                    !options.fixed ? '<% for(var i = 0; i < 3; i++){ %>':'',
                    '{{each item1 item2 i2}}',
                    function(){
                        if(options.fixed && options.fixed!=='right'){
                            // 找出左侧浮动
                            return '<% if(item2.fixed && item2.fixed !== "right" && item2.colspan==1 && !item2.HAS_PARENT){ %>'
                        }else if(options.fixed && options.fixed === 'right'){
                            // 找出右侧浮动
                            return '<% if(item2.fixed && item2.fixed === "right" && item2.colspan==1 && !item2.HAS_PARENT){ %>';
                        }else{
                            // 找出没有浮动
                            return '<% if ((i==0 && item2.fixed && item2.fixed !== "right" && item2.colspan==1 && !item2.HAS_PARENT) || (i==1 && !item2.fixed) || (i==2 && item2.fixed && item2.fixed === "right" && item2.colspan==1 && !item2.HAS_PARENT)) { %>';
                        }
                    }(),
                    //如果有子节点
                    '<th{{if item2.minWidth}} data-minWidth="{{item2.minWidth}}"{{/if}}{{if item2.unresize || item2.colspan>1}} unresize="{{item2.unresize}}"{{/if}}',
                    '{{if item2.field}} data-field="{{item2.field}}"{{/if}}',
                    ' data-key="{{item2.key}}" colspan="{{item2.colspan}}" rowspan="{{item2.rowspan}}"',
                    ' class="{{if item2.sort && item2.colspan==1}}is-sortable{{/if}}{{if item2.type!=="normal"}} dui-table__cell-{{item2.type}}{{/if}}{{if item2.align}} is-{{item2.align}}{{/if}}">',
                        '<div class="cell dui-table-{{if item2.colGroup}}group{{else}}{{index}}-{{item2.key}}{{/if}}">',
                            '{{if item2.type=="checkbox"}}',
                                '<input type="checkbox" dui-checkbox indeterminate="true"{{if checkAll}} checked="checked"{{/if}} dui-filter="checkAll">',
                            '{{else}}',
                                '{{item2.title||item2.field}}',
                            '{{/if}}',
                            // 排序
                            '{{if item2.sort && item2.colspan==1 && item2.type!=="checkbox" && item2.type!=="numbers"}}',
                            '<span class="caret-wrapper{{if initSort && initSort.field==item2.field && initSort.sort=="desc"}} descending{{/if}}{{if initSort && initSort.field==item2.field && initSort.sort && initSort.sort!=="desc"}} ascending{{/if}}">',
                                '<i class="sort-caret ascending"></i>',
                                '<i class="sort-caret descending"></i>',
                            '</span>',
                            '{{/if}}',
                            // 
                        '</div>',
                    '</th>',
                    '<% } %>',
                    '{{/each}}',
                    !options.fixed ? '<% } %>':'',
                    '</tr>',   
                '{{/each}}',
            '</thead>',
        '</table>'
    ].join('')
},
TMPL_MAIN = function(){
    return ['<div class="dui-table',
    // 有边框
    '{{if border}} dui-table--border{{/if}}',
    // 行高亮
    '{{if highlight}} dui-table--enable-row-hover{{/if}}"',
    // table过滤
    ' dui-filter="dui-table-{{index}}-form"',
    // 设置table的宽高
    ' style="{{if height}}height:{{height}}px{{/if}}">',
        '<div class="dui-table__box">',
        '<div class="dui-table__header-wrapper">',
            TMPL_HEAD(),
        '</div>',
        '<div class="dui-table__body-wrapper{{if initScroll}} {{initScroll}}{{/if}}" style="height:{{bodyHeight}}px;">',
            // 显示内容，暂不设置
        '</div>',
        '{{if fixedLCoumnsNum>0}}',
        '<div class="dui-table__fixed dui-table__fixed-left">',
            '<div class="dui-table__fixed-header-wrapper">',
                TMPL_HEAD({fixed:'left'}),
            '</div>',
            '<div class="dui-table__fixed-body-wrapper" style="height:{{bodyHeight}}px;">',
            '</div>',
        '</div>',
        '{{/if}}',
        '{{if fixedRCoumnsNum>0}}',
        '<div class="dui-table__fixed dui-table__fixed-right">',
            '<div class="dui-table__fixed-header-wrapper">',
                TMPL_HEAD({fixed:'right'}),
            '</div>',
            '<div class="dui-table__fixed-body-wrapper" style="height:{{bodyHeight}} px;">',
            '</div>',
        '</div>',
        '{{/if}}',
        // 补丁
        '<div class="dui-table__fixed-right-patch"></div>',
        '</div>',
        '{{if page.show}}',
        '<div class="dui-table__page">',
        '</div>',
        '{{/if}}',
        '{{if filterArr.length>0}}',
        '<div class="dui-table__condition">',
            '<div class="dui-table__condition-label">高级查询</div>',
            '<div class="dui-table__condition-body">',
                '<div class="dui-table__condition-body-inner">',
                    '<div class="dui-table__condition-items"></div>',
                '</div>',
            '</div>',
        '</div>',
        '{{/if}}',
        // 设置样式
        '<style>',
            '{{each columns  item1 i1}}',
                '{{each item1 item2 i2}}',
                    '{{if item2.initWidth}}',
                        '.dui-table-{{index}}-{{item2.key}}{',
                            'width:{{item2.initWidth}}px;',
                        '}',
                    '{{/if}}',
                '{{/each}}',
            '{{/each}}',
        '</style>',
    '</div>'].join('')
},
TMPL_TIP = '<div class="dui-table__empty-block"><div class="dui-table__empty-text">{{text}}</div></div>',
tableIndex=1,//唯一编号，自增形
table = function(options){
    if(!options.el || !$(options.el)[0]){
        throw new Error('初始化失败:没有获取到初始化元素');
    }
    var inst = new Class(options);
    return thisTable.call(inst);
},
/**
 * 暴露接口方法
 */
thisTable = function(){
    var that=this,
    config = this.config;
    that.id = config.id || config.index;
    return {
        config:config,
        getCheckedData:function(){
            return that.checkedData;
        },
        search:function($where){
            return that.search($where);
        },
        showFilterForm:function(){
            that.filterForm.show();
        },
        hideFilterForm:function(){
            that.filterForm.hide();
        }
    }
},
/**
 * 表格渲染主要类
 */
Class = function(options){
    var that = this,
    state = that.state = {init:true},
    options = that.options = options,
    config = that.config = $.extend(true,{
        el:'',//指定的table元素
        columns:'',//列集合，是一个二维数组
        height:'',//table的高度
        width:'',//table的宽度
        stripe:false,//是否为斑马纹 table
        border:true,//是否带有纵向边框
        initSort:'',//初始化的排序
        autoSort:false,//是否仅前端排序
        highlight:true,//当前行高亮
        loading:true,//是否有加载条
        title:'',//导出时的标题
        minColumnWidth:60,//全局设置的列最小宽度
        treeTable:'',//treeTable配置
        data:'',//数据或者ajax请求对象
        done:'',//渲染完毕的回调
        text:'',//一些操作提示语言
        request:'',//请求参数配置
        response:'',//响应参数配置
    },options);
    that.where = config.where || {};
    config.el  = $(config.el);
    config.original = $(config.el);
    // 如果没有原始元素
    if(!config.el[0]) return that;
    //高度铺满：full-差距值
    if(config.height && /^full-\d+$/.test(config.height)){
        that.fullHeightGap = config.height.split('-')[1];
        config.height = _WIN.height() - that.fullHeightGap;
    }
    // 操作过后显示的一些文本如加载失败
    config.text = $.extend({},{
        empty:'暂无数据',
        loadError:'ajax请求失败，请重试',
        loading:'数据加载中',
        notDataOrUrl:'没有设置数据或者url'
    },options.text);
    // 填补默认配置
    config.page = $.extend({},{
        show:false,
        size:10,
        current:1,
        sizes:[10,20,30,40,50],
    },options.page);
    // 配置请求参数
    config.request = $.extend({
        pageName: 'page'
        ,limitName: 'size',
        sortName:'sort',
        whereName:'where',
        filterDataName:'filterData',
    },options.request);
    // 配置响应数据格式
    config.response = $.extend({
        statusName: 'code'
        ,statusCode: 1
        ,msgName: 'msg'
        ,dataName: 'data'
        ,countName: 'count'
    },options.response);
    // 树形表格配置
    config.treeTable = config.treeTable ? ($.extend(true,{
        children:'children',//子节点名称
        keyColumn:'id',//主键
        parentColumn:'pid',//上级编号
        expandColumn:'',//展开图标显示的列
        expandAll:false,//是否全部展开
    },config.treeTable)) : false; 
    // 设置当前页面
    that.currPage = parseInt(config.page.curr) || 1;
    // 设置初始化排序列
    config.initSort ? (that.sortKey = $.extend(true,{},config.initSort)) : (that.sortKey={});
    // 初始化
    that.init();
}
/**
 * 初始化方法
 */
Class.prototype.init = function(){
    var that = this,config=that.config,
    el = config.el,
    hasRender = el.next(ELEM),
    columns = config.columns,
    // 每次都加1，保证唯一性
    index = that.index = config.index = tableIndex++;;
    // 初始化columns
    that.initColumns();
    // 插入显示元素
    var str = template.render(TMPL_MAIN(),config),
    reElem = that.reElem = $(str),
    duiTableBox   = that.duiTableBox   = reElem.find(TABLEBOX),
    duiHeader     = that.duiHeader     = reElem.find(HEADER),
    duiBodyer     = that.duiBodyer     = reElem.find(BODYER),
    duiFixed      = that.duiFixed      = reElem.find(FIXED),
    duiFixedL     = that.duiFixedL     = reElem.find(FIXED_LEFT),
    duiFixedLWrap = that.duiFixedLWrap = duiFixedL.find(FIXED_WRAP),
    duiFixedR     = that.duiFixedR     = reElem.find(FIXED_RIGHT),
    duiFixedRWrap = that.duiFixedRWrap = duiFixedR.find(FIXED_WRAP),
    duiPage       = that.duiPage       = reElem.find(PAGE),
    duiGutter     = that.duiGutter     = $('<th class="gutter"><div class="cell"></div></th>'),
    duiPatch      = that.duiPatch      = reElem.find(PATCH),
    duiLoading    = that.duiLoading    = popup.loading({target:reElem[0]}),
    duiCondition  = that.duiCondition  = reElem.find(CONDITION);
    // 如果有条件显示元素则初始化
    duiCondition[0] && that.initFilter();
    // 如果已经渲染过了则移除
    hasRender[0] && hasRender.remove();
    el.after(reElem);
    // 设置表格大小样式
    that.fullSize();
    // 同步header高度
    duiHeader.find('th').each(function(i,item){
        var key = $(item).data('key');
        duiFixedL.find('th[data-key="'+key+'"]').css('height',($(item).outerHeight()+1));
        duiFixedR.find('th[data-key="'+key+'"]').css('height',($(item).outerHeight()+1));
    })
    // 渲染form
    that.renderForm();
    // 获取数据
    that.pullData(that.currPage);
    // 设置事件
    that.setEvent();
    // 设置当前状态已经初始化完毕，因为可能会有ajax请求，所以确保ajax请求完毕
    var interval = setInterval(function(){
        if(that.duiBodyer.children().length>0){
            clearInterval(interval);
            that.state.init = false;
        }
    }, 50);
}
/**
 * 初始化筛选器
 */
Class.prototype.initFilter = function(){
    var theTable = this,theOption = theTable.config,
    dataId=1,filterArr = theOption.filterArr,filterObj=theOption.filterObj;
    // 定义条件
    var frist = filterArr[0];
    var SELECTOR={
        toolbar:'.dui-table__filterForm-toolbar',
        itemContent:'.dui-table__filter-item-content',
        itemField:'.dui-table__filter-item-field',
        itemCondition:'.dui-table__filter-item-condition',
        itemValue:'.dui-table__filter-item-value',
    }
    var filterForm = function(){
        var that = this;that.events={
            // 添加一个条件
            addCondition:function(e){
                var othis = $(this),ul;
                // 顶部的按钮
                if(othis.parents(SELECTOR.toolbar)[0]){
                    ul = othis.parents(SELECTOR.toolbar).next().children('ul');
                }else{
                    ul = othis.parents(SELECTOR.itemContent).next('ul');
                }
                var itemDom = $(['<li class="dui-table__filter-item" data-id="'+(dataId++)+'" data-prefix="and" data-field="'+frist.field+'" data-mod="condition" data-type="'+frist.type+'" data-condition="'+condition[frist.type][0]+'" data-value="">',
                    '<div class="dui-table__filter-item-content">',
                        '<div class="dui-table__filter-item-prefix">',
                            '<input type="checkbox" dui-switch value="and" active-value="and" inactive-value="or" active-text="且" inactive-text="或" skin="label-in" width="43" inactive-color="#67c23a">',
                        '</div>',
                        '<div class="dui-table__filter-item-field">',
                            '<label filter-event="fieldChange" class="dui-firebrick">'+frist.title+'</label>',
                        '</div>',
                        '<div class="dui-table__filter-item-condition">',
                            '<label filter-event="conditionChange" class="dui-deeppink">'+Allcondition[condition[frist.type][0]]+'</label>',
                        '</div>',
                        '<div class="dui-table__filter-item-value">',
                            '<label filter-event="valueChange" class="dui-blueviolet">'+((frist.type=='enum')?'请选择...':'请输入...')+'</label>',
                        '</div>',
                        '<div class="dui-table__filter-item-delete">',
                            '<label filter-event="deletItem"><i class="dui-icon-circle-close"></i></label>',
                        '</div>',
                    '</div>',
                '</li>'].join(''));
                itemDom.find('input[type="checkbox"]')[0].onchange=function(e){
                    var value = $(this).val();
                    itemDom.attr('data-prefix',value);
                    // 同步table表格底部条件
                    theTable.sysFilterForm();
                };
                // 渲染dom
                form.render(itemDom);
                // 添加元素
                ul.append(itemDom);
                // 同步table表格底部条件
                theTable.sysFilterForm();
            },
            // 添加一个条件组
            addGroup:function(e){
                var othis = $(this),ul;
                // 顶部的按钮
                if(othis.parents(SELECTOR.toolbar)[0]){
                    ul = othis.parents(SELECTOR.toolbar).next().children('ul');
                }else{
                    ul = othis.parents(SELECTOR.itemContent).next('ul');
                }
                var itemDom = $(['<li class="dui-table__filter-item"  data-id="'+(dataId++)+'" data-mod="group" data-prefix="and">',
                    '<div class="dui-table__filter-item-content">',
                        '<div class="dui-table__filter-item-prefix">',
                            '<input type="checkbox" dui-switch value="and" active-value="and" inactive-value="or" active-text="且" inactive-text="或" skin="label-in" width="43" inactive-color="#67c23a">',
                        '</div>',
                        '<div class="dui-table__filter-item-field">',
                            '<label class="dui-firebrick">分组</label>',
                        '</div>',
                        '<div class="dui-table__filter-item-operation">',
                            '<div class="dui-button-group">',
                                '<button class="dui-button dui-button--primary dui-button--mini" filter-event="addCondition">添加条件</button>',
                                '<button class="dui-button dui-button--primary dui-button--mini" filter-event="addGroup">添加分组</button>',
                            '</div>',
                        '</div>',
                        '<div class="dui-table__filter-item-delete">',
                            '<label filter-event="deletItem"><i class="dui-icon-circle-close"></i></label>',
                        '</div>',
                    '</div>',
                    '<ul class="dui-table__filter-item-group">',                    
                    '</ul>',
                '</li>'].join(''));
                itemDom.find('input[type="checkbox"]')[0].onchange=function(e){
                    var value = $(this).val();
                    itemDom.attr('data-prefix',value);
                    // 同步table表格底部条件
                    theTable.sysFilterForm();
                };
                // 渲染dom
                form.render(itemDom);
                // 添加元素
                ul.append(itemDom);
                // 同步table表格底部条件
                theTable.sysFilterForm();
            },
            // 删除一个条件或者条件组
            deletItem:function(e){
                var othis = $(this),li=othis.parents(SELECTOR.itemContent).parent();
                li.remove();
                // 同步table表格底部条件
                theTable.sysFilterForm();
            },
            // 字段切换事件
            fieldChange:function(e){
                var othis = $(this),dataDom=othis.parents(SELECTOR.itemContent).parent('li');
                if(this.popverDom && $(this.popverDom).css('display')!=='none'){
                    this.hide();
                }else{
                    var currField = dataDom.attr('data-field');
                    var content = $(['<ul class="dui-select-dropdown__list">',
                        function(){
                            var res = '';
                            $.each(theOption.filterArr,function(i,item){
                                res  += '<li class="dui-select-dropdown__item'+(currField==item.field ? ' selected':'')+'" dui-field="'+item.field+'"><span>'+item.title+'</span></li>';
                            })
                            return res;
                        }(),
                    '</ul>'].join(''));
                    content.on('click','.dui-select-dropdown__item',function(e){
                        var $item = $(this)
                        // 如果当前没有选中
                        if(!$item.hasClass('selected')){
                            var ofield = $item.attr('dui-field');
                            var ofieldTitle= filterObj[ofield].title;
                            var otype  = filterObj[ofield].type;
                            var fristCondition = condition[otype][0];
                            var fristConditionTitle = Allcondition[fristCondition];
                            // 设置当前选中
                            $item.addClass('selected').siblings().removeClass('selected');
                            // 设置dataDom属性
                            dataDom.attr('data-field',ofield);//设置字段
                            dataDom.attr('data-type',otype);//设置类型
                            dataDom.attr('data-condition',fristCondition);//设置条件
                            dataDom.attr('data-value','');//设置值
                            // 设置field的显示属性
                            dataDom.children().find(SELECTOR.itemField+'>label').text(ofieldTitle);
                            // 设置condition的title
                            dataDom.children().find(SELECTOR.itemCondition+'>label').text(fristConditionTitle);
                            // 设置值的显示
                            var value = $.inArray(otype,['enum','timestamp'])!=-1 ? '请选择...':'请输入...';
                            dataDom.children().find(SELECTOR.itemValue+'>label').text(value);
                            // 关闭弹窗
                            othis[0].hide();
                            // 同步table表格底部条件
                            theTable.sysFilterForm();
                        }
                    })
                    // 内容显示
                    that.events.showPopover(this,content[0]);
                }
            },
            // 条件切换事件
            conditionChange:function(e){
                var othis = $(this),dataDom=othis.parents(SELECTOR.itemContent).parent('li');
                if(this.popverDom && $(this.popverDom).css('display')!=='none'){
                    this.hide();
                }else{
                    var currType = dataDom.attr('data-type');
                    var currCondition =dataDom.attr('data-condition');
                    var conditions = condition[currType];
                    var content = $(['<ul class="dui-select-dropdown__list">',
                        function(){
                            var res = '';
                            $.each(conditions,function(i,item){
                                res  += '<li class="dui-select-dropdown__item'+(currCondition==item ? ' selected':'')+'" dui-condition="'+item+'"><span>'+Allcondition[item]+'</span></li>';
                            })
                            return res;
                        }(),
                    '</ul>'].join(''))
                    content.on('click','.dui-select-dropdown__item',function(e){
                        var $item = $(this);
                        if(!$item.hasClass('selected')){
                            var currCondition = $item.attr('dui-condition');
                            // 设置当前选中
                            $item.addClass('selected').siblings().removeClass('selected');
                            // 设置dataDom属性
                            dataDom.attr('data-condition',currCondition);//设置条件
                            dataDom.attr('data-value','');//设置值
                            // 设置显示值
                            dataDom.children().find(SELECTOR.itemCondition+'>label').text(Allcondition[currCondition]);
                            // 设置值的显示
                            var value = $.inArray(currType,['enum','timestamp'])!=-1 ? '请选择...':'请输入...';
                            dataDom.children().find(SELECTOR.itemValue+'>label').text(value);
                            // 关闭弹窗
                            othis[0].hide();
                            // 同步table表格底部条件
                            theTable.sysFilterForm();
                        }
                    })
                    // 内容显示
                    that.events.showPopover(this,content[0]);
                }
            },
            // 更换value的方法
            valueChange:function(e){
                var othis = $(this),dataDom=othis.parents(SELECTOR.itemContent).parent('li');
                if(this.popverDom && $(this.popverDom).css('display')!=='none'){
                    this.hide && this.hide();
                }else{
                    var currField = dataDom.attr('data-field');
                    var currType = dataDom.attr('data-type');
                    var currCondition =dataDom.attr('data-condition');
                    var currValue = dataDom.attr('data-value');
                    // 如果是枚举类型
                    if(currType=='enum' || currType=='boolean'){
                        // 获取枚举数据
                        var options = currType=='boolean'?{true:'true',false:'false'}:filterObj[currField].options;
                        var content = $(['<ul class="dui-select-dropdown__list">',
                            function(){
                                    var res = '';
                                    $.each(options,function(val,title){
                                        res  += '<li class="dui-select-dropdown__item'+(currValue==val && options[currValue] ? ' selected':'')+'" dui-value="'+val+'"><span>'+title+'</span></li>';
                                    })
                                    return res;
                                }(),
                        '</ul>'].join(''))
                        content.on('click','.dui-select-dropdown__item',function(e){
                            var $item = $(this);
                            if(!$item.hasClass('selected')){
                                var value = $item.attr('dui-value');
                                // 设置当前选中
                                $item.addClass('selected').siblings().removeClass('selected');
                                // 修改dataDom属性
                                dataDom.attr('data-value',value);//设置值
                                // 设置值的显示
                                dataDom.children().find(SELECTOR.itemValue+'>label').text(options[value]);
                                // 关闭弹窗
                                othis[0].hide();
                                // 同步table表格底部条件
                                theTable.sysFilterForm();
                            }
                        })
                        // 内容显示
                        that.events.showPopover(this,content[0]);
                    }else if(currType=='timestamp'){
                        // 事件类型

                    }else{
                        // 如果是介于
                        if(currCondition=='between'){
                            var content = $(['<div class="dui-range-editor dui-input__inner dui-range-editor--mini">',
                                '<input autocomplete="off" placeholder="开始值" name="" class="dui-range-input" value="'+function(){
                                    var arr = currValue.split(',');
                                    if(arr.length==2){
                                        return arr[0];
                                    }
                                    return '';
                                }()+'">',
                                '<span class="dui-range-separator">到</span>',
                                '<input autocomplete="off" placeholder="结束值" name="" class="dui-range-input" value="'+function(){
                                    var arr = currValue.split(',');
                                    if(arr.length==2){
                                        return arr[1];
                                    }
                                    return '';
                                }()+'">',
                            '</div>'].join(''));
                            othis.hide();
                            othis.after(content);
                            // 设置交单
                            content.find('input').eq(0).focus();
                            content.find('input').on('blur',function(e){
                                // 防止该事件在检测是否有焦点的事件之前发生
                                setTimeout(function(){
                                    var inputs = content.find('input');
                                    //当2个文本框都没有焦点的时候
                                    if(!content.find('input').is(':focus')){
                                        if(!inputs.eq(0).val()){
                                            popup.message('请输入开始值',{
                                                type:'error',
                                            });
                                            inputs.eq(0).focus();
                                            return;
                                        }
                                        if(!inputs.eq(1).val()){
                                            popup.message('请输入结束值',{
                                                type:'error',
                                            });
                                            inputs.eq(1).focus();
                                            return;
                                        }
                                        var value = [inputs.eq(0).val(),inputs.eq(1).val()];
                                        // 修改dataDom属性
                                        dataDom.attr('data-value',value.join(','));//设置值
                                        // 设置值的显示
                                        dataDom.children().find(SELECTOR.itemValue+'>label').text(((value?value.join(' 到 '):'请输入...')));
                                        othis.show();
                                        content.remove();
                                        // 同步table表格底部条件
                                        theTable.sysFilterForm();
                                    }
                                },30)
                            })
                        }else{
                            var content = $(['<div class="dui-input dui-input--mini">',
                            '<input type="text" class="dui-input__inner" placeholder="请输入..." value="'+currValue+'">',
                            '</div>'].join(''));
                            othis.hide();
                            othis.after(content);
                            content.children('input').focus().on('blur',function(e){
                                var value = $(this).val();
                                // 修改dataDom属性
                                dataDom.attr('data-value',value);//设置值
                                // 设置值的显示
                                dataDom.children().find(SELECTOR.itemValue+'>label').text(value||'请输入...');
                                othis.show();
                                content.remove();
                                // 同步table表格底部条件
                                theTable.sysFilterForm();
                            });
                        }
                    }
                }
            },
            showPopover:function(ref,content){
                var popverDom = $(['<div class="dui-popper dui-popver dui-table__popver" style="display:none">',
                    '<div x-arrow="" class="popper__arrow"></div>',
                '</div>'].join(''));
                popverDom.prepend(content);
                var x = {top:'bottom','bottom':'top'};
                ref.popverDom = popverDom[0];
                $('body').append(popverDom);
                popverDom[0].visible = popverDom.css('display')=='none' ? true : false;
                popverDom[0].popver = dui.addPopper(ref,popverDom[0],{
                    placement:'bottom-center',
                    onCreate:function(data){
                        popverDom[0].transition = dui.transition(popverDom[0],{
                            name:'dui-zoom-in-'+x[data._options.placement.split('-')[0]],
                            enter:function(){
                                popverDom[0].popver.updatePopper();
                            },
                            afterLeave:function(){
                                popverDom.remove();
                                ref.hide =undefined;
                                ref.popverDom = undefined;
                            }
                        });
                    },
                    onUpdate:function(data){
                        popverDom[0].transition.data.name = 'dui-zoom-in-'+x[data.placement.split('-')[0]];
                    }
                })
                popverDom[0].show = function(){
                    $('body').append(popverDom);
                    popverDom[0].visible =false;
                    popverDom[0].transition.show();
                }
                popverDom[0].hide = ref.hide = function(){
                    popverDom[0].visible =true;
                    popverDom[0].transition.hide();
                }
                popverDom[0].show();
            }
        };
        that.Allcondition = Allcondition;
        that.condition =condition;
        var formDom = that.formDom = $(['<div class="dui-table__filterForm">',
            '<div class="dui-table__filterForm-toolbar">',
                '<div class="dui-button-group dui-col-xs6">',
                    '<button class="dui-button dui-button--primary dui-button--small" filter-event="addCondition">添加条件</button>',
                    '<button class="dui-button dui-button--primary dui-button--small" filter-event="addGroup">添加分组</button>',
                '</div>',
                '<div class="dui-col-xs6 dui-table__filterFrom-toolbar-op">',
                    '<input type="checkbox" dui-checkbox="" id="auto_search" bordered="true" label="实时更新">',
                    '<button class="dui-button dui-button--primary dui-button--small" id="filter_search">查询</button>',
                '</div>',
            '</div>',
            '<div class="dui-table__filterForm-body">',
                '<ul></ul>',
            '</div>',
        '</div>'].join(''));
        formDom.find('#auto_search')[0].onchange = function(e){
            theTable.sysFilterForm(true);
        }
        dui.on(formDom.find('#filter_search')[0],'click',function(e){
            theTable.sysFilterForm(true);
        })
        form.render(formDom[0]);
    }
    /**
     * 显示filterFrom的方法
     */
    filterForm.prototype.show = function(options){
        var that =this;
        // 设置事件
        $(that.formDom).on('click','[filter-event]',function(e){
            var othis = $(this),oEnvent = othis.attr('filter-event');
            that.events && that.events[oEnvent] && that.events[oEnvent].call(this,e);
        })
        that.popup = popup.dialog({
            title:'高级查询',
            content:that.formDom[0],
            showFooter:false,
            width:460,
            height:400,
        })
    }
    filterForm.prototype.hide = function(){
        this.popup && this.popup.close();
    }
    // 初始化filterForm并加入到class类
    theTable.filterForm = new filterForm();
}
/**
 * 同步筛选form
 */
Class.prototype.sysFilterForm= function(genxin){
    var that = this,options = that.config,
    filterFormIns = that.filterForm,formDom = filterFormIns.formDom,
    filterArr = options.filterArr,filterObj=options.filterObj,
    prefixs ={'and':'且','or':'或'},
    SELECTOR = {
        toolbar:'.dui-table__filterForm-toolbar',
        fristUl:'.dui-table__filterForm-body>ul',
        valueTitleDom:'.dui-table__filter-item-value>label',
        conditionItems:'.dui-table__condition-body-inner',
    },
    getSysHtml = function(ul){
        var lis = ul.children('li');
        var res = '';
        lis.each(function(i,li){
            var $li = $(li),
            id = $li.attr('data-id'),
            mod=$li.attr('data-mod'),
            prefix=$li.attr('data-prefix'),
            field = $li.attr('data-field'),
            type = $li.attr('data-type'),
            condition = $li.attr('data-condition'),
            value = $li.attr('data-value'),
            valueTitle = $li.find(SELECTOR.valueTitleDom).text();
            if($li.attr('data-mod')=='group'){
                var temUl = $li.children('ul');
                if(temUl.children('li').length>0){
                    res += ['<div class="dui-table__condition-item" data-id="'+id+'" data-prefix="'+prefix+'">',
                        (res!='' ? '<div class="dui-table__condition-prefix dui-red">'+prefixs[prefix]+'</div>':''),
                        getSysHtml(temUl),
                    '</div>'].join('');
                }
            }else{
                res += ['<div class="dui-table__condition-item" data-id="'+id+'" data-prefix="'+prefix+'" data-field="'+field+'" ',
                'data-mod="'+mod+'" data-type="'+type+'" data-condition="'+condition+'" data-value="'+value+'">',
                    (res!='' ? '<div class="dui-table__condition-prefix dui-red">'+prefixs[prefix]+'</div>':''),
                    '<div class="dui-table__condition-field dui-firebrick">'+filterObj[field].title+'</div>',
                    '<div class="dui-table__condition-condition dui-deeppink">'+Allcondition[condition]+'</div>',
                    '<div class="dui-table__condition-value dui-blueviolet">'+valueTitle+'</div>',
                '</div>'].join('');
            }
        })
        return res;
    },
    getSysData = function(ul){
        var lis = ul.children('li');
        var res = [];
        lis.each(function(i,li){
            var $li = $(li),
            id = $li.attr('data-id'),
            mod=$li.attr('data-mod'),
            prefix=$li.attr('data-prefix'),
            field = $li.attr('data-field'),
            type = $li.attr('data-type'),
            condition = $li.attr('data-condition'),
            value = $li.attr('data-value');
            if($li.attr('data-mod')=='group'){
                var tempUl = $li.children('ul');
                if(tempUl.children('li').length>0){
                    var temp = {};
                    if(res.length>0){
                        temp.prefix = prefix;
                    }
                    temp.mod = mod;
                    temp.children = getSysData(tempUl);
                    res.push(temp);
                }
            }else{
                var temp = {};
                if(res.length>0){
                    temp.prefix = prefix;
                }
                temp.mod = mod;
                temp.field = field;
                temp.condition = condition;
                temp.type = type;
                temp.value = value;
                res.push(temp);
            }
        })
        return res;
    };
    var shishi = formDom.find(SELECTOR.toolbar).find('#auto_search').is(':checked');
    // 判断是否实时跟新
    if(shishi || genxin){
        var ul = formDom.find(SELECTOR.fristUl);
        // 则同步腾讯
        var template = getSysHtml(ul);
        var filterData = that.filterData = getSysData(ul);
        // 设置显示信息
        $(that.reElem).find(SELECTOR.conditionItems).children('div').html(template);
        // 拉取数据
        if(filterData.length>0){
            that.pullData(1);
        }
    }
}
/**
 * 初始化列
 */
Class.prototype.initColumns = function(){
    var that = this,config = that.config,
    columns = config.columns,filterObj={},filterArr=[],
    initColWidthWithType = function(item){
        var initWidth = {
            checkbox: 48
            ,space: 15
            ,numbers: 40
        };
        // 如果没有type或者类型目前不支持则赋值为normal
        if(!item.type && !initWidth[item.type]) item.type = "normal";
        if(item.type !== "normal"){
            item.unresize = true;
            item.width = item.width || initWidth[item.type];
        }
    };
    $.each(columns,function(i1,row){
        $.each(row,function(i2,col){
            if(!col){
                row.splice(i2, 1);
                return;
            }
            col.colspan = parseInt(col.colspan)>0 ? parseInt(col.colspan) : 1;
            col.rowspan = parseInt(col.rowspan)>0 ? parseInt(col.rowspan) : 1;
            col.key = 'row'+i1+'-col'+i2;
            //复杂表头处理
            if(col.IsGroup || col.colspan>1){
                var childIndex = 0;
                $.each(columns[i1+1],function(i22,col22){
                    if(col22.HAS_PARENT || (childIndex > 1 && childIndex == col22.colspan)) return;
                    col22.HAS_PARENT = true;
                    col22.parentKey = 'row'+i1+'-col'+i2;
                    childIndex = childIndex + parseInt(col22.colspan > 1 ? col22.colspan : 1);
                })
                col.colGroup = true; //标注是组合列
            }
            // 初始化筛选列
            if(col.filter){
                var temp = $.extend(true,{},col.filter);
                if(!temp.type) temp.type='string';
                if(!temp.title) temp.title = col.title || col.field;
                temp.field = col.field;
                filterObj[col.field] = temp,filterArr.push(temp);
            }
            initColWidthWithType(col);
        })
    })
    // 设置过滤条件
    config.filterObj = filterObj,config.filterArr = filterArr;
    // 初始化列宽度
    that.initColumnsWidth();
}
/**
 * 获取table的总宽度
 */
Class.prototype.getClientWidth = function(){
    var that = this,options = that.config;
    options.clientWidth = options.width || function(){ //获取容器宽度
        //如果父元素宽度为0（一般为隐藏元素），则继续查找上层元素，直到找到真实宽度为止
        var getWidth = function(parent){
            var width, isNone;
            parent = parent || options.el.parent();
            width = parent.width();
            try {
            isNone = parent.css('display') === 'none';
            } catch(e){}
            if(parent[0] && (!width || isNone)) return getWidth(parent.parent());
            return width;
        };
        return getWidth();
    }();
    return options.clientWidth;
}
/**
 * 设置表格样式
 */
Class.prototype.fullSize = function(){
    var that = this,options = that.config,
    height = options.height, bodyHeight,
    headerHeight = that.duiHeader.height();
    if(that.fullHeightGap){
        height = _WIN.height() - that.fullHeightGap;
        if(height < 135) height = 135;
        that.reElem.css('height', height);
    }
    that.fixedHeight = that.duiTableBox.height();
    if(!height) return;
    bodyHeight = parseFloat(height) - (that.duiHeader.outerHeight() || 48);
    //减去分页栏的高度
    if(options.page.show){
        bodyHeight = that.bodyHeight = (bodyHeight - (that.duiPage.outerHeight() || 41) - 2);
    }
    // 如果有过滤条件,在减去过滤条件的高度
    if(options.filterArr.length>0){
        bodyHeight = that.bodyHeight = (bodyHeight - (that.duiPage.outerHeight() || 41) - 2);
    }
    //设置bodyWrap高度
    that.duiBodyer.css('height',bodyHeight);
    
}
/**
 * 设置浮动列效果
 */
Class.prototype.setFixedStyle = function(){
    var that = this,bodyHeight = that.duiBodyer.height(),
    scrollHeight = that.getScrollHeight(that.duiBodyer[0]),
    scrollWidth = that.getScrollWidth(that.duiBodyer[0]),
    fixedLWidth = that.duiFixedL.find(FIXED_HEAD).width(),
    fixedRWidth = that.duiFixedR.find(FIXED_HEAD).width(),
    headerHeight = that.duiHeader.height();
    // 设置浮动的高要考虑1px的boarder
    that.duiFixed.css('height',(that.fixedHeight-(scrollHeight?scrollHeight:1)));
    // 设置左侧浮动的宽
    that.duiFixedL.css('width',fixedLWidth)
    // 设置左侧浮动的宽
    that.duiFixedR.css('width',fixedRWidth)
    // 设置浮动内容的高度和距离header的高度
    that.duiFixed.find(FIXED_WRAP).css({
        height:(bodyHeight-scrollHeight),
        top:(headerHeight+1)
    });
    // 如果没有横向滚动条则隐藏
    if(scrollHeight==0){
        that.duiFixed.css('display','none');
    }else{
        that.duiFixed.css('display','');
    }
    // 去除补丁
    
}
/**
 * 设置初始化列宽
 */
Class.prototype.initColumnsWidth=function(){
    // 初始化的时候是没有横向滚动条
    var that = this,options=that.config
    ,colNums = 0 //列个数
    ,autoColNums = 0 //自动列宽的列个数
    ,autoWidth = 0 //自动列分配的宽度
    ,countWidth = 0 //所有列总宽度和
    ,clientWidth = that.getClientWidth()
    ,fixedLCoumnsNum = options.fixedLCoumnsNum = 0,//左侧浮动列个数
    fixedRCoumnsNum = options.fixedRCoumnsNum = 0,//右侧浮动列个数
    totalWidth = 0;//叠加所有列最小宽度
    that.eachColumns(function(i,col){
        col.hide || function(){
            var width = 0
            , minWidth = col.minWidth || options.minColumnWidth;
            width = col.width || minWidth;
            if (/\d+%$/.test(width)) { //列宽为百分比
                width = Math.floor((parseFloat(width) / 100) * clientWidth);
                width < minWidth && (width = minWidth);
            }
            totalWidth += width;
        }()
        col.hide || colNums++
    })
    if(totalWidth>clientWidth){
        options.initScroll = 'is-scrolling-left';
    }else{
        options.initScroll = 'is-scrolling-none';
    }
    // 初始化的时候是不需要减去滚动条
    clientWidth = clientWidth-function(){
        return options.border ? colNums+1 : 0;
    }();
    // 获取自动分配列的宽度
    var getAutoWidth = function(back){
        that.eachColumns(function(i,col){
            var width = 0
            , minWidth = col.minWidth || options.minColumnWidth; //最小宽度
            if (col.colGroup || col.hide) return;
            if (!back) {
                width = col.width || 0;
                if (/\d+%$/.test(width)) { //列宽为百分比
                    width = Math.floor((parseFloat(width) / 100) * clientWidth);
                    width < minWidth && (width = minWidth);
                } else if (!width) { //列宽未填写
                    col.width = width = 0;
                    autoColNums++;
                    
                }
            } else if (autoWidth && autoWidth < minWidth) {
                autoColNums--;
                width = minWidth;
            }
            if (col.hide) width = 0;
            countWidth = countWidth + width;
            //如果未填充满，则将剩余宽度平分
            (clientWidth > countWidth && autoColNums) && (
                autoWidth = (clientWidth - countWidth) / autoColNums
            );
        },true);
    }
    getAutoWidth();
    getAutoWidth(true);
    // 设置列宽
    autoColNums = 0;
    that.eachColumns(function(index,col){
        var minWidth = col.minWidth || options.minColumnWidth;
        col.minWidth = minWidth;
        if(col.colGroup || col.hide) return;
        if(col.width === 0){
            col.initWidth = Math.floor(autoWidth >= minWidth ? autoWidth : minWidth);
            // 设置当前列为自动分配宽度列
            col.autoColumn = true;
            autoColNums++;
        }else if(/\d+%$/.test(col.width)){
            col.initWidth = Math.floor((parseFloat(col.width) / 100) * clientWidth);
        }else{
            col.initWidth = col.width;
        }
        if(col.fixed && col.fixed!=='right'){
            options.fixedLCoumnsNum++;
        }else if(col.fixed && col.fixed==='right'){
            options.fixedRCoumnsNum++;
        }
    },true);
    options.autoColNums = autoColNums;
}
/**
 * 根据有没有滚动条确定自动分割列的宽
 */
Class.prototype.resColumnsWidth = function(){
    var that = this,options = that.config,
    scrollWidth = that.getScrollWidth(that.duiBodyer[0]),
    autoColNums = options.autoColNums,
    allCols = 0,
    subtractWidth = parseFloat(scrollWidth/autoColNums);//大于0则右侧有滚动条;
    // 给自动分配列宽的列减去滚动条宽度
    that.eachColumns(function(i,col){
        if(col.colGroup || col.hide) return;
        allCols ++ ;
        if(col.autoColumn){
            if(col.subtract && scrollWidth==0){
                col.subtract = false;
                that.getCssRule(col.key,function(rule){
                    rule.style.width = (parseFloat(rule.style.width)+col.subtractWidth)+'px';
                })
            }else if(!col.subtract && scrollWidth>0){
                col.subtract = true;
                col.subtractWidth = subtractWidth;
                that.getCssRule(col.key,function(rule){
                    rule.style.width = (parseFloat(rule.style.width)-subtractWidth)+'px';
                })
            }
        }
    },true);
    //填补 Math.floor 造成的数差
    var patchNums = that.duiBodyer.width() - that.getScrollWidth(that.duiBodyer[0])
    - that.duiBodyer.children('table').outerWidth();
    if(autoColNums && patchNums >= -allCols && patchNums <= allCols){
        var getEndTh = function (th) {
            var field;
            th = th || that.duiHeader.eq(0).find('thead th:last-child')
            field = th.data('field');
            if (!field && th.prev()[0]) {
                return getEndTh(th.prev())
            }
            return th
        }
        , th = getEndTh()
        , key = th.data('key');
        that.getCssRule(key, function (item) {
            var width = item.style.width || th.outerWidth();
            item.style.width = (parseFloat(width) + patchNums) + 'px';
            //二次校验，如果仍然出现横向滚动条（通常是 1px 的误差导致）
            if(that.duiBodyer.height() - that.duiBodyer.prop('clientHeight') > 0) {
                item.style.width = (parseFloat(item.style.width) - 1) + 'px';
            }
        });
    }
}
/**
 * 获取元素滚动条宽度
 */
Class.prototype.getScrollWidth = function(elem){
    var width = 0;
    if(elem){
        width = elem.offsetWidth - elem.clientWidth;
    } else {
        elem = document.createElement('div');
        elem.style.width = '100px';
        elem.style.height = '100px';
        elem.style.overflowY = 'scroll';
        document.body.appendChild(elem);
        width = elem.offsetWidth - elem.clientWidth;
        document.body.removeChild(elem);
    }
    return width;
}
/**
 * 获取横向滚动条
 */
Class.prototype.getScrollHeight = function(elem){
    var height = 0;
    if(elem){
        height = elem.offsetHeight - elem.clientHeight;
    } else {
        elem = document.createElement('div');
        elem.style.width = '100px';
        elem.style.height = '100px';
        elem.style.overflowX = 'scroll';
        document.body.appendChild(elem);
        height = elem.offsetHeight - elem.clientHeight;
        document.body.removeChild(elem);
    }
    return height;
}
/**
 * 设置滚动条补丁
 */
Class.prototype.setScrollPatch = function(){
    var that = this,options = that.config,
    duiMainTable = that.duiBodyer.children('table'),
    scrollWidth = that.getScrollWidth(that.duiBodyer[0]),//大于0则右侧有滚动条
    scrollHeight= that.getScrollHeight(that.duiBodyer[0]),//大于0则底部有滚动条
    Surplus = that.duiBodyer.prop('offsetWidth')-duiMainTable.outerWidth(),
    patchWidth = Surplus >scrollWidth ? Surplus : scrollWidth;
    // 如果有右侧滚动条
    if(scrollWidth>0){
        that.duiHeader.find('thead>tr').eq(0).append(that.duiGutter);
        // 如果是多级表头
        if(options.columns.length>1){
            that.gutter.attr('rowspan',options.columns.length);
        }
        that.duiFixedR.css({
            'right':(scrollWidth),//减1是为了遮住滚动条的边框
        });
        that.duiPatch.css({
            width:scrollWidth,
            height:(that.duiHeader.height())
        })
    }else{
        that.duiFixedR.css({
            'right':'',
        });
    }
    if(scrollHeight>0 || patchWidth){
        // 设置移动补丁
        that.duiGutter.css("width",patchWidth);
        that.duiGutter.css('display','block');
    }else{
        that.duiGutter.css('display','none');
    }
}
/**
 * 循环列
 * @param {Function} callback 回调函数
 * @param {Array} columns 要循环的二维列
 */
Class.prototype.eachColumns = function(callback,oldItem){
    var that=this,options = that.config,
    columns = $.extend(true, [], options.columns),arrs=[],index = 0;
    //重新整理表头结构
    $.each(columns, function (i1, item1) {
        $.each(item1, function (i2, item2) {
            //如果是组合列，则捕获对应的子列
            if (item2.colGroup) {
                var childIndex = 0;
                index++
                item2.CHILD_COLS = [];
                $.each(columns[i1 + 1], function (i22, item22) {
                    //如果子列已经被标注为{PARENT_COL_INDEX}，或者子列累计 colspan 数等于父列定义的 colspan，则跳出当前子列循环
                    if (item22.PARENT_COL_INDEX || (childIndex > 1 && childIndex == item2.colspan)) return
                    item22.PARENT_COL_INDEX = index
                    item2.CHILD_COLS.push(item22);
                    childIndex = childIndex + parseInt(item22.colspan > 1 ? item22.colspan : 1);
                });
            }
            if (item2.PARENT_COL_INDEX) return; //如果是子列，则不进行追加，因为已经存储在父列中
            arrs.push(item2)
        });
    });
    //重新遍历列，如果有子列，则进入递归
    var eachArrs = function(obj){
        $.each(obj || arrs, function(i, item){
            if(item.CHILD_COLS) return eachArrs(item.CHILD_COLS);
            item = oldItem ? getOldItem(item) : item;
            typeof callback === 'function' && callback(i, item);
        });
    },
    getOldItem = function(item){
        var res;
        $.each(options.columns,function(i,row){
            $.each(row,function(i1,col){
                if(col.key==item.key){
                    res = col;
                    return;    
                }
            })
        })
        return res;
    };
    eachArrs();
}
/**
 * 设置table的列宽规则
 * @param {String} key 规则键
 * @param {Function} callback 回调方法
 */
Class.prototype.getCssRule = function(key,callback){
    var that = this
    ,style = that.reElem.find('style')[0]
    ,sheet = style.sheet || style.styleSheet || {}
    ,rules = sheet.cssRules || sheet.rules;
    $.each(rules,function(i,item){
        if(item.selectorText === ('.dui-table-'+that.index+'-'+ key)){
            return callback(item), true;
        }
    })
}
/**
 * 渲染form
 */
Class.prototype.renderForm = function(){
    var that = this;
    form.render(that.reElem);
}
/**
 * 获取数据
 */
Class.prototype.pullData = function(curr){
    var that = this,options=that.config,
    request = options.request,
    response = options.response,
    ajaxOpt = options.data,
    params = that.buildRequest();
    that.startTime = new Date().getTime()
    //如果需要显示加载条
    options.loading && that.duiLoading.show();
    // 如果是数组
    if(ajaxOpt.url){
        // 说明是请求远程数据
        // 如果是treetable则不需要分页
        if(!options.treeTable){
            //如果不是treeTable则需要分页
            params[request.pageName] = curr;
            params[request.limitName] = options.page.size;
        }
        // 以json提交
        if(ajaxOpt.contentType && ajaxOpt.contentType.indexOf("application/json") == 0){ //提交 json 格式
            params = JSON.stringify(params);
        }
        $.ajax({
            url:ajaxOpt.url,
            type: ajaxOpt.type || 'get',
            contentType: ajaxOpt.contentType,
            data: params,
            dataType: 'json',
            headers: options.data.headers || {},
            success:function(res){
                if(res[response.statusName] === response.statusCode){
                    that.renderData(res,params[request.pageName],res[response.countName]);
                    that.consumingTime = new Date().getTime() -  that.startTime;
                }else{
                    that.duiBodyer.html(template.render(TMPL_TIP,{text:options.text.loadError}));
                }
            },
            error:function(){
                that.duiBodyer.html(template.render(TMPL_TIP,{text:options.text.loadError}));
                // 关闭加载框
                that.duiLoading.close();
            }
        })

    }else if(options.data && options.data.constructor === Array){
        var res = {},limit= options.page.limit
        ,startLimit = curr*limit - limit,
        data = JSON.parse(JSON.stringify(options.data))||[];
        if(params.sort && params.sort.field){
            data = dui.sort(data,params.sort.field,params.sort.sort?params.sort.sort:'asc')
        }
        res[response.dataName] = data.concat().splice(startLimit, limit);
        res[response.countName] = data.length;
        that.renderData(res, curr, data.length);
    }else{
        that.duiBodyer.html(template.render(TMPL_TIP,{text:options.text.notDataOrUrl}));
    }
}
/**
 * 渲染
 * @param {Object} res 返回数据
 * @param {number} curr 当前页
 * @param {number} count 总条数
 */
Class.prototype.renderData = function(res,curr,count){
    var that = this,options = that.config,
    columns = options.columns,
    resData = res[options.response.dataName] || [],
    bodytemplate = '<table cellspacing="0" cellpadding="0" border="0" class="dui-table__body"><tbody></tbody></table>',
    // 设置body方法
    setBody = function(){
        var tds_lef = [],tds=[],tds_right=[],
        bodyTable = $(bodytemplate),
        bodyLeftTable  = $(bodytemplate),
        bodyRightTable = $(bodytemplate),
        tdTmpl = [
            '<td dui-field="{{field}}" class="{{if align}} is-{{align}}{{/if}}{{if type!=="normal"}} dui-table__cell-{{type}}{{/if}}" dui-key="{{key}}"{{if style}} style="{{style}}"{{/if}}>',
                '<div class="cell dui-table-{{stylekey}}">',
                // 如果是模板
                '{{if template}}{{@ template}}',
                '{{else}}',
                    // 如果是选择框
                    '{{if type=="checkbox"}}',
                    '<input type="checkbox" value="{{@ fieldName}}"{{if checkAll}} checked="checked"{{/if}} dui-checkbox>',//如果是选择框
                    '{{else if type=="numbers"}}',//如果是序号
                    '{{@ duiIndex}}',
                    '{{else}}',
                    function(){
                        if(options.treeTable){
                            return ['{{if field=="'+options.treeTable.expandColumn+'"}}',
                            '<span class="dui-table__row--level_#{#level#}#" style="padding-left:#{#(level-1)*16#}#px">',
                                '#{#if hasChild#}#',
                                '<span class="dui-table__expand-icon#{#if '+options.treeTable.expandAll+' || expand #}# dui-table__expand-icon--expanded#{#/if#}#">',
                                    '<i class="'+(options.treeTable.expandIcon ? options.treeTable.expandIcon:' dui-icon-arrow-right')+'"></i>',
                                '</span>',
                                '#{#else#}#',
                                '<span class="dui-table__placeholder"></span>',
                                '#{#/if#}#',
                            '</span>',
                            '{{/if}}',].join('');
                        }
                    }(),
                    '{{@ fieldName}}',
                    '{{/if}}',
                '{{/if}}',
                '</div>',
            '</td>'
        ].join('');
        that.eachColumns(function(i,column){
            column.stylekey = options.index+'-'+column.key;
            column.fieldName = '{{'+column.field+'}}';
            column.duiIndex = '{{duiIndex}}';
            var temp = template.render(tdTmpl,column).replace(/#{#/g,"{{").replace(/#}#/g,"}}");
            if(column.fixed && column.fixed!=='right'){
                tds_lef.push(temp);
            }else if(column.fixed && column.fixed==='right'){
                tds_right.push(temp);
            }else{
                tds.push(temp);
            }
        })
        tds = tds_lef.concat(tds).concat(tds_right);
        // 循环数据
        $.each(resData,function(index,row){
            row.duiIndex = ((curr?curr:1)-1)*options.page.size+index+1;
            var tr_left =tds_lef.length>0 ? $('<tr >'+template.render(tds_lef.join(''),row)+'</tr>'):'',
                tr_right =tds_right.length>0 ? $('<tr >'+template.render(tds_right.join(''),row)+'</tr>'):'',
                tr = tds.length>0 ? $('<tr >'+template.render(tds.join(''),row)+'</tr>'):'';
            // 设置数据
            tr_left[0] ? tr_left[0].data = row:'';
            tr_right[0]? tr_right[0].data = row:'';
            tr[0] ? tr[0].data = row:'';
            // 如果是树形表格则判断是否显示该列
            if(options.treeTable){
                // 两个都不显示
                if((options.treeTable.expandAll || row.expand) || row[options.treeTable.parentColumn]==0){
                    tr.css('display','');
                    tr_left.css('display','');
                    tr_right.css('display','');
                }else{
                    tr.css('display','none');
                    tr_left.css('display','none');
                    tr_right.css('display','none');
                }
            }
            // 放置元素
            bodyTable.append(tr),bodyLeftTable.append(tr_left),bodyRightTable.append(tr_right);
        })
        that.duiBodyer.scrollTop(0);
        that.duiBodyer.html(''),that.duiBodyer.append(bodyTable);
        that.duiFixedLWrap.html(''),that.duiFixedLWrap.append(bodyLeftTable);
        that.duiFixedRWrap.html(''),that.duiFixedRWrap.append(bodyRightTable);
        // 渲染form
        that.renderForm();
        // 重新设置浮动高度
        that.fullSize();
        // 重新设置列宽
        that.resColumnsWidth();
        // 重新设置浮动样式
        that.setFixedStyle();
        // 设置补丁
        that.setScrollPatch();
    };
    // 如果是树形table
    if(options.treeTable){
        // 不显示分页
        options.page.show=false;
        // 设置数据
        var treeUtils =  new dui.jsTree({
            child:options.treeTable.children,
            id:options.treeTable.keyColumn,
            pid:options.treeTable.parentColumn,
        });
        resData = treeUtils.toList(resData);
    }
    // 如果需要显示分页
    if(options.page.show===true){
        pagination.render($.extend(true,{},options,{
            el:that.duiPage[0],
            total:count,
            size:options.page.size,
            current:that.currPage,
            jump:function(data){
                that.currPage = data.page,options.page.size = data.size;
                that.pullData(that.currPage);
            }
        }))
    }
    if(resData.length==0){
        that.renderForm();
        that.duiFixedLWrap.html('');
        that.duiFixedRWrap.html('');
        that.duiBodyer.html('');
        that.duiBodyer.html(template.render(TMPL_TIP,{text:options.text.empty}));
        that.duiPage.hide();
    }else{
        // 设置body
        setBody();
        that.duiPage.show();
    }
    // 关闭加载条
    that.duiLoading.close();
}
/**
 * 设置事件
 */
Class.prototype.setEvent = function(){
    var that = this,options = that.config,
    th = that.reElem.find(HEADER_TH),
    _BODY = $('body'),
    dict = {},resizing;
    // 排序事件
    th.on('click',function(e){
        var othis = $(this),
        sortWrap = othis.find(HEADER_SORT),
        field = othis.data('field'),
        sortType = that.sortKey.sort,
        type;
        if(!sortWrap[0] || resizing === 1) return resizing = 2;
        if(sortType==='desc'){
            type = null;
        }else if(sortType==='asc'){
            type = 'desc';
        }else{
            type = 'asc';
        }
        that.sort(field,type);
    }).find(HEADER_SORT+' .sort-caret').on('click',function(e){
        var othis = $(this),
        index = othis.index(),
        field = othis.parents('th').eq(0).data('field');
        e.stopPropagation();
        if(index===0){
            that.sort(field, 'asc');
        }else{
            that.sort(field, 'desc');
        }
    })
    // 复选框选择事件
    that.reElem.on('click','.dui-checkbox',function(e){
        var othis=$(this),
        checkbox = othis.find('input[dui-checkbox]'),
        data = checkbox.parents('tr')[0].data;
        var childs = that.reElem.find(TABLEBODY).find('input[dui-checkbox]');
        var checked = checkbox[0].checked;
        var isAll = typeof checkbox.attr('indeterminate') !== "undefined" ? true : false;
        if(isAll){
            // 首先设置元素选中
            // 获得当前选中状态
            if(othis.hasClass('is-checked')){
                checked = true;
            }else if(othis.hasClass('is-indeterminate')){
                checked = true;
            }else{
                checked = false;
            }
            // 设置其他选择框的选中
            childs.each(function(i,item){
                if(item.checkboxClass){
                    item.checkboxClass.setChecked(checked);
                }else{
                    if(checked){
                        $(item).attr('checked','checked');
                    }else{
                        $(item).removeAttr('checked');
                    }
                    that.renderForm();
                }
            })
            //2.同步是不是全选
            that.synCheckedAll();
        }else{
            //单选
            //1.设置当前选中
            // 找到与这个相同的数据
            that.reElem.find(TABLEBODY).find('tr').each(function(i,tr){
                if(tr.data.duiIndex==data.duiIndex){
                    var duibi =$(tr).find('input[dui-checkbox]');
                    duibi.each(function(i,item){
                        if(item && item!=checkbox[0]){
                            if(item.checkboxClass){
                                item.checkboxClass.setChecked(checked);
                            }else{
                                if(checked){
                                    $(item).attr('checked','checked');
                                }else{
                                    $(item).removeAttr('checked');
                                }
                                that.renderForm();
                            }
                        }
                    })
                }
            })
            // 如果是树形table，还需要同步上下级选中
            if(options.treeTable){
                var //获取所有选中的角标
                checkIndexs = [];
                that.duiBodyer.find(TABLEBODY).find('input[dui-checkbox]:checked').parents('tr').each(function(key,value){
                    checkIndexs.push(value.data.duiIndex);
                }),
                AllSyn = [].concat(getUpIndex(data)).concat(getDownIndex(data));
                function getUpIndex(trData){
                    var upData = [],trs=that.duiBodyer.find(TABLEBODY).find('tr');
                    trs.each(function(i,item){
                        if(item.data && item.data[options.treeTable.keyColumn] == trData[options.treeTable.parentColumn]){
                            if(checked==false){
                                var tempdata = $.extend(true,{},item.data[options.treeTable.children]),
                                isInArray = false;
                                $.each(tempdata,function(i1,old){
                                    if(trData[options.treeTable.keyColumn]==old[options.treeTable.keyColumn]){
                                        delete tempdata[i1];
                                    }
                                })
                                $.each(tempdata,function(i1,old){
                                    $.each(trs,function(i3,newTr){
                                        if(old[options.treeTable.keyColumn]==newTr.data[options.treeTable.keyColumn]){
                                            old = newTr.data;
                                            if($.inArray(old.duiIndex,checkIndexs)!=-1){
                                                isInArray = true;
                                                return;
                                            }
                                        }
                                    })
                                    if(isInArray){
                                        return;
                                    }
                                })
                                if(isInArray){
                                    return;
                                }
                            }
                            if($.inArray(item.data.duiIndex,upData)==-1){
                                upData.push(item.data.duiIndex);
                            }
                            if(item.data[options.treeTable.parentColumn]){
                                upData = upData.concat(getUpIndex(item.data));
                            }
                        }
                    })
                    return upData;
                }
                function getDownIndex(trData){
                    var downData = [],trs=that.duiBodyer.find(TABLEBODY).find('tr'),
                    childrens = (trData[options.treeTable.children]||[]).map(function(value,key){
                        return value[options.treeTable.keyColumn];
                    });
                    trs.each(function(i,item){
                        if(item.data && $.inArray(item.data[options.treeTable.keyColumn],childrens)!=-1){
                            downData.push(item.data.duiIndex);
                            if(item.data.hasChild){
                                downData = downData.concat(getDownIndex(item.data));
                            }
                        }
                    })
                    return downData;
                }
                that.reElem.find(TABLEBODY).find('tr').each(function(i,tr){
                    if($.inArray(tr.data.duiIndex,AllSyn)!=-1){
                        var duibi =$(tr).find('input[dui-checkbox]');
                        duibi.each(function(i,item){
                            if(item && item!=checkbox[0]){
                                if(item.checkboxClass){
                                    item.checkboxClass.setChecked(checked);
                                }else{
                                    if(checked){
                                        $(item).attr('checked','checked');
                                    }else{
                                        $(item).removeAttr('checked');
                                    }
                                    that.renderForm();
                                }
                            }
                        })
                    }
                })
            }
            //2.同步是不是全选
            that.synCheckedAll();
        }
    })
    // 同步滚动条
    that.duiBodyer.on('scroll', function(){
        that.synScroll();
    });
    // table大小发生变化事件
    _WIN.on('resize',function(e){
        that.resize();
    })
    // 行事件
    that.reElem.on('mouseenter',ROWHOVER,function(){
        var othis = $(this),
        index = othis.index();
        that.reElem.find(TABLEBODY).find('tr:eq('+index+')').addClass('hover-row');
    }).on('mouseleave',ROWHOVER,function(){
        var othis = $(this),
        index = othis.index();
        that.reElem.find(TABLEBODY).find('tr:eq('+index+')').removeClass('hover-row');
    });
    // 拖拽事件
    th.on('mousemove',function(e){
        var othis = $(this),
        oLeft = othis.offset().left,
        pLeft = e.clientX - oLeft;
        // 不允许拖拽
        if(othis.attr('unresize')==='true' || dict.resizeStart) return;
        // 是否处于拖拽允许区域
        dict.allowResize = othis.width() - pLeft <= 10;
        // 如果处于允许移动范围则修改指针样式
        othis.css('cursor', (dict.allowResize ? 'col-resize' : ''));
    }).on('mouseleave',function(e){
        var othis = $(this);
        if(dict.resizeStart) return;
        othis.css('cursor', '');
    }).on('mousedown',function(e){
        var othis = $(this);
        if(dict.allowResize){
            var key = othis.data('key');
            e.preventDefault();
            // 开始拖拽
            dict.resizeStart = true;
            // 记录初始坐标
            dict.offset = [e.clientX, e.clientY];
            // 获取当前列的样式规则
            that.getCssRule(key, function(item){
                var width = item.style.width || othis.outerWidth();
                dict.rule = item;
                dict.ruleWidth = parseFloat(width);
                dict.minWidth = othis.data('minwidth') || options.minColumnWidth;
            });
            _BODY.css('cursor', 'col-resize');
        }
    })
    // 拖拽中
    _BODY.on('mousemove',function(e){
        if(dict.resizeStart){
            e.preventDefault();
            if(dict.rule){
                var setWidth = dict.ruleWidth + e.clientX - dict.offset[0];
                if(setWidth < dict.minWidth) setWidth = dict.minWidth;
                dict.rule.style.width = setWidth + 'px';
            }
            resizing = 1;
            that.setFixedStyle();
            that.setScrollPatch();
            that.renderFixedShadow();
        }
    }).on('mouseup',function(e){
        if(dict.resizeStart){
            dict = {};
            _BODY.css('cursor', '');
        }
        if(resizing === 2){
            resizing = null;
        }
    })
    // treeTable事件
    that.reElem.on('click','.'+TREETABLE_EXPAND,function(e){
        var othis = $(this),tr = othis.parents('tr'),
        isExpand = othis.hasClass(TREETABLE_EXPANDED) ? true : false,
        childs=tr[0].data.hasChild ? tr[0].data[options.treeTable.children] : [],
        allTrs = that.reElem.find(TABLEBODY+' tbody>tr');
        if(isExpand){
            othis.removeClass(TREETABLE_EXPANDED);
        }else{
            othis.addClass(TREETABLE_EXPANDED);
        }
        allTrs.each(function(i,item){
            updateShow(item,childs);
        })
        // 重新设置列宽
        that.resColumnsWidth();
        /**
         * 修改当前table行显示或者不显示
         * @param {Element} curr 当前点击元素的所在的tr
         * @param {Object} child 判断条件
         */
        function updateShow(curr,child){
            $.each(child,function(i,item){
                if(curr.data[options.treeTable.keyColumn]==item[options.treeTable.keyColumn]){
                    if(isExpand){
                        $(curr).css('display','none');
                        if(curr.data.hasChild){
                            $(curr).find('.'+TREETABLE_EXPAND).removeClass(TREETABLE_EXPANDED);
                        }
                    }else{
                        $(curr).css('display','');
                    }
                }else{
                    if(isExpand){
                        if(item.hasChild){
                            updateShow(curr,item[options.treeTable.children]);
                        } 
                    }
                }
            })
        }
    })
    // 编辑高级筛选
    that.reElem.on('click','.dui-table__condition-label',function(e){
        that.filterForm.show();
    })
    // 增加统一关闭popver事件
    $(document).on('click',function(e){
        // 获取所有的popver
        $('body').find('.dui-table__popver').each(function(i,popver){
            var $popver = $(popver),$target = $(e.target);
            if($popver[0]==$target[0] || $popver.find(e.target)[0]){
                return;
            }
            $popver.css('display')!=='none' && $popver[0].hide && $popver[0].hide()
        })
    })
}
/**
 * 排序方法
 */
Class.prototype.sort = function(field,type){
    var that = this,options = that.config,
    th = that.reElem.find(HEADER_TH+'[data-field="'+field+'"]'),
    ClassName;
    if(th.length==0) return;
    // 如果已经在状态中
    if(that.sortKey.field==field && that.sortKey.sort==type) return;
    // 如果当前选中字段和已经有的字段不一致
    if(field && that.sortKey.field!=field){
        type = 'asc';
    }
    // 设置排序
    that.sortKey = {
        field:field,
        sort:type
    }
    // 如果类型为空则删除掉sort
    if(type===null){
        that.sortKey = {};
    }
    // 设置排序样式
    th.siblings().find(HEADER_SORT).attr('class','caret-wrapper');
    // 设置当前样式
    if(type=='asc'){
        ClassName = 'caret-wrapper ascending';
    }else if(type=='desc'){
        ClassName = 'caret-wrapper descending';
    }else{
        ClassName = 'caret-wrapper'
    }
    th.find(HEADER_SORT).attr('class',ClassName);
    // 执行排序请求
    that.pullData(that.currPage);
}
/**
 * 重新制定表格大小
 */
Class.prototype.resize = function(){
    this.fullSize();
    this.resColumnsWidth();
    this.setFixedStyle();
    this.setScrollPatch();
    this.renderFixedShadow();
}
/**
 * 初始化浮动的阴影显示效果
 */
Class.prototype.renderFixedShadow = function(){
    var that = this,othis = that.duiBodyer,
    scrollBarWidth = that.getScrollWidth(othis[0]),
    scrollBarHeight = othis.prop('offsetHeight') - othis.prop('clientHeight'),
    scrollAll = othis.find('table').width(),
    clientWidth = othis.width(),
    allScrollWidth = (scrollAll-clientWidth)
    ,scrollLeft = othis.scrollLeft();
    if(scrollBarHeight==0){
        othis.attr('class',BODYER.slice(1,BODYER.length)+' is-scrolling-none');
    }else{
        //如果滚动横向
        if(scrollLeft == (allScrollWidth+scrollBarWidth)){
            othis.attr('class',BODYER.slice(1,BODYER.length)+' is-scrolling-right');
        }else if(scrollLeft>0 && scrollLeft<(allScrollWidth+scrollBarWidth)){
            othis.attr('class',BODYER.slice(1,BODYER.length)+' is-scrolling-middle');
        }else if(scrollLeft==0){
            othis.attr('class',BODYER.slice(1,BODYER.length)+' is-scrolling-left');
        }
    }
}
/**
 * 同步全选
 */
Class.prototype.synCheckedAll = function(){
    var that = this,options = that.config,
    // 获取选择框的个数，只充body获取
    checkboxAll = that.duiBodyer.find('input[dui-checkbox]'),
    // 获取当前选中个数
    checkedCheckbox = that.duiBodyer.find('input[dui-checkbox]:checked'),
    // 获取全选按钮
    checkAll = that.reElem.find(TABLEHEADER).find('input[dui-checkbox][dui-filter="checkAll"]'),
    // 默认当前状态
    checkAllState = false;
    // 如果所有个数等于选中个数则是全选
    if(checkboxAll.length==checkedCheckbox.length){
        checkAllState = true;
    }
    // 如果选中个数为0则为不选中
    else if(checkedCheckbox.length==0){
        checkAllState = false;
    }else{
        checkAllState = 'indeterminate';
    }
    checkAll.each(function(i,item){
        if(item.checkboxClass){
            item.checkboxClass.setChecked(checkAllState);
        }else{
            $(item).attr('state','indeterminate');
            that.renderForm();
        }
    })
    // 设置选中数据
    that.checkedData = [];
    // 获取数据
    checkedCheckbox.parents('tr').each(function(i,tr){
        var data = $.extend(true,{},tr.data);
        delete data.duiIndex;
        that.checkedData.push(data);
    })
}
/**
 * 同步滚动条
 */
Class.prototype.synScroll = function(){
    var that = this,othis = that.duiBodyer
    ,scrollLeft = othis.scrollLeft()
    ,scrollTop = othis.scrollTop();
    that.duiHeader.scrollLeft(scrollLeft);
    that.duiFixed.find(FIXED_WRAP).scrollTop(scrollTop);
    // 渲染shown
    that.renderFixedShadow();
}
/**
 * 搜索方法
 */
Class.prototype.search = function(where){
    var that = this;
    that.where = where;
    that.pullData(1);
}
/**
 * 刷新数据
 */
Class.prototype.refreshresData = function(){
    var that = this;
    that.pullData(that.currPage);
}
/**
 * 组装请求参数
 */
Class.prototype.buildRequest = function(){
    var that = this,config = that.config,
    request = config.request,
    where = that.where,sort = that.sortKey,
    filterData = that.filterData,
    params = {};
    // 如果有sort
    sort && (params[request.sortName] = sort);
    // 如果有where
    where && (params[request.whereName] = where);
    // 如果有filterData
    filterData && (params[request.filterDataName] = JSON.stringify(filterData));
    return params;
}
/**
 * 渲染方法
 */
table.render = function(options){
    return table(options);
}
/**
 * 自动初始化
 */
table.init = function(){

}
export default table;