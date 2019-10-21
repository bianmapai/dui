define('buildtable',['jquery','popup','form'],function($,popup,form){
    var thisTable,
    SELECTOR={
        filterContainer:'.dui-tabs__content',
        conditionContainer:'.dui-tabs__content',
    },
    searchArea =function(options){
        var that = this,
        config = that.config = $.extend(true,{},options)
        // 高级搜索条件id不能重复
        var id = 0;
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
        var frist = tableFilter[0];
        // 条件显示元素
        var $conditionDom = that.conditionDom = $(['<div class="dui-query__condition">',
            '<div class="dui-query__condition-label">',
                '筛选条件',
            '</div>',
            '<div class="dui-query__condition-show">',
            '</div>',
        '</div>'].join(''));
        // 条件选择元素
        var $filterDom = that.filterDom = $(['<div class="dui-query">',
            '<div class="dui-query__show show-parent" title="高级查询">',
                '<i class="dui-icon-search"></i>',
            '</div>',
            '<div class="dui-query__header">',
                '<div class="dui-query__title">',
                    '<span>高级查询</span>',
                '</div>',
                '<button type="button" class="dui-query__closebtn"><i class="dui-query__close dui-icon-circle-close"></i></button>',
            '</div>',
            '<div class="dui-query__body" dui-form>',
                '<div class="dui-query__toolbar">',
                    '<div class="dui-col-xs6">',
                        '<div class="dui-button-group">',
                            '<button class="dui-button dui-button--primary dui-button--small" query-event="addCondition">添加条件</button>',
                            '<button class="dui-button dui-button--primary dui-button--small" query-event="addGroup">添加分组</button>',
                        '</div>',
                    '</div>',
                    '<div class="dui-col-xs6" style="text-align: right;">',
                        '<span>',
                            '<input type="checkbox" dui-checkbox id="auto_search" bordered="true" label="实时更新">',
                        '</span>',
                        '<button class="dui-button dui-button--primary dui-button--small" style="float: right;">查询</button>',
                    '</div>',
                '</div>',
                '<div class="dui-query__body-inner">',
                    '<ul>',
                        
                    '</ul>',
                '</div>',
            '</div>',
        '</div>'].join(''));
        // 添加条件显示元素
        $(config.conditionContainer).append($conditionDom);
        // 添加赛选元素
        if(config.filterContainer){
            $(config.filterContainer).append($filterDom);
        }else{
            config.useDialog = true
        }





    },
    BuildTable ={
        render:function(tableParam,filterParam){
            var that = this;
            thisTable = tableParam;tableFilter=filterParam;
            // 假设传入的参数
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
            // 初始化高级搜索
            that.searchArea = new searchArea({
                filterFields:tableFilter,
                conditionContainer:$('.dui-admin__condition')[0],
            });
        }
    },
    customDropDown = function(options){

    }
    return BuildTable;
})