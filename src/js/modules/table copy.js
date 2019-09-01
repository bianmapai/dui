aiui.define(['jquery','form'],function($,form){
    var _WIN = $(window),
    _DOC = $(document),
    className = {
        table:".aiui-table",
        Main:".aiui-table-wrapper",
        HeaderWrapper:".aiui-table-header-wrapper",
        BodyWrapper:'.aiui-table-body-wrapper',
        Fixed:".aiui-table-fixed",
        FixedWrapper:".aiui-table-fixed-body-wrapper",
        FixedRight:".aiui-table-fixed-right",
        FixedRightWrapper:".aiui-table-fixed-body-wrapper",
        SortSpan:'.caret-wrapper',
        TotalWrapper:".aiui-table-total",
        PageWrapper:".aiui-table-page",
    },
    TMPL_HEADER = function(options){
        options = options || {};
        return ['<table cellspacing="0" cellpadding="0" border="0" class="aiui-table-header" ',
            function(){
                if(!options.fixed){
                    // return 'style="width:{{tablewidth}}px"';
                }
            }(),
            '>',
            '<thead class="{{if is_group}}is-group{{/if}}">',
            ,'{{each columns item1 i1}}'
            ,'<tr>'
                ,function(){
                    if(!(options.fixed && options.fixed !== 'right') && !(options.fixed && options.fixed === 'right')){
                        return '<% for(var i = 0; i < 3; i++){ %>';
                    }
                }()
                ,'{{each item1 item2 i2}}'
                ,function(){
                    if(options.fixed && options.fixed !== 'right'){
                        return '<% if(item2.fixed && item2.fixed !== "right" && item2.colspan==1 && !item2.HAS_PARENT){ %>';
                    }else if(options.fixed && options.fixed === 'right'){
                        return '<% if(item2.fixed && item2.fixed === "right" && item2.colspan==1 && !item2.HAS_PARENT){ %>';
                    }else{
                        return '<% if ((i==0 && item2.fixed && item2.fixed !== "right" && item2.colspan==1 && !item2.HAS_PARENT) || (i==1 && !item2.fixed) || (i==2 && item2.fixed && item2.fixed === "right" && item2.colspan==1 && !item2.HAS_PARENT)) { %>';
                    }
                }()
                    ,'<th {{if item2.unresize}}unresize="{{item2.unresize}}"{{/if}} data-field="{{item2.field}}" '
                    ,'{{if item2.field}}data-field="{{item2.field}}"{{/if}} '
                    ,'data-key="{{item2.key}}" colspan="{{item2.colspan}}" '
                    ,'rowspan="{{item2.rowspan}}" class="{{if item2.align}}is-{{item2.align}} {{/if}}{{if item2.sort && item2.colspan==1}}is-sortable{{/if}}">',
                    ,'<div class="cell aiui-table{{index}}-{{item2.key}}">'
                    ,'{{if item2.type=="checkbox"}}'
                    ,'<input type="checkbox" aiui-checkbox indeterminate="true" {{if item2.checked}}checked="checked"{{/if}} name="checkall" value="all">'
                    ,'{{else}}'
                    ,'{{item2.title}}'
                    ,'{{/if}}'
                    ,'{{if item2.sort && item2.colspan==1}}'
                    ,'<span class="caret-wrapper">'
                        ,'<i class="sort-caret ascending"></i>'
                        ,'<i class="sort-caret descending"></i>'
                    ,'</span>'
                    ,'{{/if}}'
                    ,'{{if item2.filter && item2.colspan==1}}'
                    ,'<span class="column-filter-trigger">'
                        ,'<i class="baui-icon baui-icon-filter"></i>'
                    ,'</span>'
                    ,'{{/if}}'
                    ,'</div>'
                    ,'</th>'    
                ,'<% } %>'
                ,'{{/each}}'
                ,function(){
                    if(!(options.fixed && options.fixed !== 'right') && !(options.fixed && options.fixed === 'right')){
                        return '<% } %>';
                    }
                }()
            ,'</tr>'
            ,'{{/each}}',
            '</thead>',
        '</table>'].join('')
    },
    TMPL_MAIN = ['<div class="aiui-form aiui-table{{if is_group}} aiui-table-group {{/if}}{{if border}}  aiui-table-border{{/if}}" aiui-filter="aiui-table-{{index}}-form" style="{{if height}}height:{{height}}px;{{/if}}{{if width}}width:{{width}};{{/if}}">',
            '<div class="aiui-table-wrapper">',
                '<div class="aiui-table-header-wrapper">',
                TMPL_HEADER(),
                '</div>',
                '<div class="aiui-table-body-wrapper">',
                '</div>',
                '<div class="aiui-table-fixed">',
                    '<div class="aiui-table-fixed-header-wrapper">',
                    TMPL_HEADER({fixed:'left'}),
                    '</div>',
                    '<div class="aiui-table-fixed-body-wrapper">',
                    '</div>',
                '</div>',
                '<div class="aiui-table-fixed-right">',
                '   <div class="aiui-table-fixed-header-wrapper">',
                    TMPL_HEADER({fixed:'right'}),
                    '</div>',
                    '<div class="aiui-table-fixed-body-wrapper">',
                    '</div>',
                '</div>',
            '</div>',
            '<div class="aiui-table-total">',
            '</div>',
            '<div class="aiui-table-page">',
            '</div>',
            '<style>',
                '{{each aloneColumns col i1}}',
                    '.aiui-table{{index}}-{{col.key}}{',
                        'width:{{col.width}}px;',
                    '}',
                '{{/each}}',
            '</style>',
    '</div>'].join(''),
    TMPL_TIP = '<div class="aiui-table-empty-block"><div class="aiui-table-empty-text">{{text}}</div></div>'
    ,
    thisTable = function(){
        var that = this,
        options = that.options;
        that.id = options.id || options.index;
        return {
            reload:function(options){
                that.reload.call(that,options);
            },
            search:function(where){
                that.search.call(that,where);
            },
            options:options
        };
    },
    table = {
        /**
         * 版本号
         */
        v:'1.0.0',
        index:0,
        /**
         * 自定渲染
         */
        init:function(filter,options){
            
        },
        /**
         * 单独渲染
         */
        render:function(options){
            var original = $(options.elem)[0];
            if(!original){
                aiui.error('没有找到指定元素')
                return;
            }
            var inst = new TableClass(options);
            return thisTable.call(inst);
        },
        /**
         * 设置当前table的回调函数
         * @param {String} name 回调名称
         * @param {Function} callbank 回调函数
         */
        on:function(name,callbank){
            this.event[name] = callbank;
        },
        /**
         * 事件管理器
         */
        event:{},
    }
    /**
     * 创建table
     * @param {Object} options 参数
     */
    ,TableClass = function(options){
        var that=this;
        that.options = $.extend({},{
            elem:"",
            treeTable:{},
            columns:[],//列集合
            stripe:true,//是否有横向border
            border:true,//是否有竖线
            data:{},//当前table的数据可以是数组，也可以是ajax对象
            width:'',//当前table的宽度
            height:'',//当前table高度
            columnMinWidth:'40',//最小宽度
            loading:true,//是否显示加载条
            sort:'id',//排序字段
            //可传入一个对象或者使用默认
            where:{},
        },options);
        //操作过后显示的一些文本如加载失败
        that.options.text = $.extend({},{
                empty:'暂无数据',
                loadError:'ajax请求失败，请重试',
                loading:'数据加载中',
                notDataOrUrl:'没有设置数据或者url'
        },that.options.text);
        //提示框设置
        that.options.Tooltip = $.extend({},{
            show:true,
            effect:'dark',
        },that.options.Tooltip);
        //page配置
        that.options.page = $.extend({},{
            show:false,
            limit:10,
            curr:1,
            limits:[10,20,30,40,50],
        },that.options.page);
        //配置请求参数
        that.options.request = $.extend({
            pageName: 'page'
            ,limitName: 'size'
        }, that.options.request)
        //配置响应数据格式
        that.options.response = $.extend({
            statusName: 'code'
            ,statusCode: 1
            ,msgName: 'msg'
            ,dataName: 'data'
            ,countName: 'count'
        },that.options.response);
        //如果传入的page.show为true
        if(that.options.page.show){
            that.page = that.options.page.curr ? that.options.page.curr : 1;
        }
        //如果是treeTable
        if(!$.isEmptyObject(that.options.treeTable)){
            that.options.treeTable = $.extend({
                iconColumn:'',
                keyColumn:'id',
                parentColumn:'pid',
                expandIcon:'aiui-icon-caret-right',
                expand:false
            },that.options.treeTable)
        }
        that.render();
    };
    /**
     * 渲染table
     */
    TableClass.prototype.render = function(){
        var that = this,options = that.options,
        hasRender = $(options.elem).next(className.table);
        that.$original = $(options.elem);
        options.aloneColumns = [];
        that.index= options.index = ++table.index;
        //如果存在
        hasRender[0] && hasRender.remove();
        //高度铺满：full-差距值
        if(options.height && /^full-\d+$/.test(options.height)){
            that.fullHeightGap = options.height.split('-')[1];
            options.height = _WIN.height() - that.fullHeightGap;
        }
        //初始化参数
        that.setInit();
        //设置表格列宽度
        that.setColsWidth();
        //插入元素
        that.tabledom = $(aiui.render(TMPL_MAIN,options));
        that.$original.after(that.tabledom);
        //设置容器
        that.Mian = that.tabledom.find(className.Main);
        that.HeaderWrapper = that.tabledom.find(className.HeaderWrapper);
        that.BodyWrapper = that.tabledom.find(className.BodyWrapper);
        that.Fixed = that.tabledom.find(className.Fixed);
        that.FixedWrapper = that.Fixed.find(className.FixedWrapper);
        that.FixedRight = that.tabledom.find(className.FixedRight);
        that.FixedRightWrapper = that.FixedRight.find(className.FixedRightWrapper);
        that.TotalWrapper = that.tabledom.find(className.TotalWrapper);
        that.PageWrapper = that.tabledom.find(className.PageWrapper);
        that.loading = aiui.loading(that.tabledom[0])
        that.gutter = $('<th class="gutter"></th>');
        that.patch = $('<div class="aiui-table-fixed-right-patch"></div>');
        //设置表格大小
        that.fullSize();
        //如果是多级表头
        if(options.columns.length>1){
            var ths = that.Fixed.find('th');
            $.each(ths,function(index,th){
                $(th).css('height',that.HeaderWrapper.find('[data-key="'+$(th).data('key')+'"]').outerHeight());
            })
            var ths = that.FixedRight.find('th');
            $.each(ths,function(index,th){
                $(th).css('height',that.HeaderWrapper.find('[data-key="'+$(th).data('key')+'"]').outerHeight());
            })
        }
        //刷新表单
        that.renderForm();
        //拉取数据
        that.Pulldata(that.page);
        //设置事件
        that.setEvent();
        //初始化浮动列
        that.InitFixed();
    }
    /**
     * 初始化参数配置
     */
    TableClass.prototype.setInit = function(type){
        var that = this,options=that.options;
        options.clientWidth = options.width || function(){ //获取容器宽度
            //如果父元素宽度为0（一般为隐藏元素），则继续查找上层元素，直到找到真实宽度为止
            var getWidth = function(parent){
              var width, isNone;
              parent = parent || that.$original.parent()
              width = parent.width();
              try {
                isNone = parent.css('display') === 'none';
              } catch(e){}
              if(parent[0] && (!width || isNone)) return getWidth(parent.parent());
              return width;
            };
            return getWidth();
        }();
        if(type=='width') return options.clientWidth;

        $.each(options.columns,function(i1,row){
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
                    $.each(options.columns[i1+1],function(i22,col22){
                        if(col22.HAS_PARENT || (childIndex > 1 && childIndex == col22.colspan)) return;
                        col22.HAS_PARENT = true;
                        col22.parentKey = 'row'+i1+'-col'+i2;
                        childIndex = childIndex + parseInt(col22.colspan > 1 ? col22.colspan : 1);
                    })
                    col.colGroup = true; //标注是组合列
                    that.options.is_group = true;
                }
                //初始化列默认数据
                that.initColumn(col);
            })                      
        })
    }
    /**
     * 初始化类型列
     */
    TableClass.prototype.initColumn=function(col){
        var widthConfig={
            checkbox:40
            ,radio: 40
            ,numbers: 40
            ,icon:100
        }
        if(!col.type) col.type = "normal";
        if(col.type !== "normal"){
            col.unresize = true;//禁止拖动
            col.width = col.width || widthConfig[col.type];
        }
    }  
    /**
     * 表格样式设置
     */
    TableClass.prototype.fullSize= function(){
        var that = this,options = that.options,
        height = options.height, bodyHeight;
        if(that.fullHeightGap){
            height = _WIN.height() - that.fullHeightGap;
            if(height < 135) height = 135;
            that.tabledom.css('height', height-1);
        }
        if(!height) return;
        bodyHeight = parseFloat(height) - (that.HeaderWrapper.outerHeight() || 38);
        // //减去分页栏的高度
        // if(options.page){
        //     bodyHeight = bodyHeight - (that.PageWrapper.outerHeight() || 41) - 2;
        // }
        that.BodyWrapper.css('height', bodyHeight);
        that.FixedWrapper.css('height',bodyHeight);
        that.FixedRightWrapper.css('height',bodyHeight);
    }
    /**
     * 设置列宽度
     */
    TableClass.prototype.setColsWidth=function(){
        var that = this,options = that.options,
        hasRender = that.tabledom && that.tabledom[0] ? true : false,
        colNums = 0, //列个数
        autoColNums = 0, //自动列宽的列个数
        autoWidth = 0, //自动列分配的宽度
        countWidth = 0, //所有列总宽度和
        cntrWidth = that.setInit('width');
        options.aloneColumns =[];//用来装所有列宽
        //统计列个数
        that.eachColumn(function(i,col){
            col.hide || colNums++;
        })
        //获取当前table的宽度
        cntrWidth = cntrWidth - function(){
            return (options.border) ? colNums + 1 : 2;
        }() - aiui.scrollWidth() - 1;
        /**
         * 获取自动分配列宽
         * @param {Boolean} back 是否检测
         */
        var getAutoWidth = function(back){
            //遍历所有列
            $.each(options.columns, function (i1, row) {
                $.each(row, function (i2, col) {
                    var width = 0
                    , minWidth = col.minWidth || options.columnMinWidth; //最小宽度
                    if (!col) {
                        row.splice(i2, 1);
                        return;
                    }
                    if (col.colGroup || col.hide) return;

                    if (!back) {
                        width = col.width || 0;
                        if (/\d+%$/.test(width)) { //列宽为百分比
                            width = Math.floor((parseFloat(width) / 100) * cntrWidth);
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
                });
            });
            //如果未填充满，则将剩余宽度平分
            (cntrWidth > countWidth && autoColNums) && (
                autoWidth = (cntrWidth - countWidth) / autoColNums
            );
        }
        getAutoWidth();
        getAutoWidth(true); //重新检测分配的宽度是否低于最小列宽
        //自动分配列个数
        that.autoColNums = autoColNums;
        //设置列宽
        that.eachColumn(function(index,col){
            var minWidth = col.minWidth || options.columnMinWidth;
            if(col.colGroup || col.hide) return;
            //给位分配宽的列平均分配宽
            if(col.width === 0) {
                if(hasRender){
                    that.setCssRule(col.key, function (item) {
                        item.style.width = Math.floor(autoWidth >= minWidth ? autoWidth : minWidth) + 'px';
                    });
                }else{
                    col.width = Math.floor(autoWidth >= minWidth ? autoWidth : minWidth);
                }
            }else if(/\d+%$/.test(col.width)){
                if(hasRender){
                    that.setCssRule(col.key, function(item){
                        item.style.width = Math.floor((parseFloat(col.width) / 100) * cntrWidth) + 'px';
                    });
                }else{
                    col.width = Math.floor((parseFloat(col.width) / 100) * cntrWidth);
                }
            }
            options.aloneColumns.push(col);
        })
    }
    /**
     * 初始化浮动列的显示隐藏
     */
    TableClass.prototype.InitFixed = function(){
        var that = this,bodyWidth=that.HeaderWrapper.find('table').outerWidth(),
        tableWidth = that.tabledom.width();
        if(tableWidth>=bodyWidth){
            that.Fixed.css('display','none');
            that.FixedRight.css('display','none');
        }else{
            that.Fixed.css('display','');
            that.FixedRight.css('display','');
        }
        that.setScollPatch();
        that.synScroll();
    }
    /**
     * 设置table的列宽规则
     * @param {String} key 规则键
     * @param {Function} callback 回调方法
     */
    TableClass.prototype.setCssRule = function(key,callback){
        var that = this
        ,style = that.tabledom.find('style')[0]
        ,sheet = style.sheet || style.styleSheet || {}
        ,rules = sheet.cssRules || sheet.rules;
        $.each(rules,function(i,item){
            if(item.selectorText === ('.aiui-table'+that.index+'-'+ key)){
                return callback(item), true;
            }
        })
    }
    /**
     * 循环列操作
     * @param {Function} callback 回调方法啊
     */
    TableClass.prototype.eachColumn = function(callback,columns){
        var that=this,options = that.options,
        columns = $.extend(true, [], columns || options.columns),arrs=[],index = 0;
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
                typeof callback === 'function' && callback(i, item);
            });
        };
        eachArrs();
    }
    /**
     * 刷新表单
     */
    TableClass.prototype.renderForm = function(){
        var that = this;
        form.render(that.tabledom[0]);
    }
    /**
     * 拉取数据
     * @param {number} curr 获取页数
     * @param {Object} param 请求参数
     */
    TableClass.prototype.Pulldata = function(curr,params={}){
        var that = this,options = that.options,
        request = options.request,
        response = options.response;
        that.startTime = new Date().getTime();
        options.loading && that.loading.show();
        if(options.data.url){
            //如果是url
            if(!options.treeTable.iconColumn){
                //如果不是treeTable则需要分页
                params[request.pageName] = curr;
                params[request.limitName] = options.page.limit;
            }
            var data = $.extend(params, {where:options.where});
            if(options.data.contentType && options.data.contentType.indexOf("application/json") == 0){ //提交 json 格式
                data = JSON.stringify(data);
            }
            $.ajax({
                type: options.data.method || 'get',
                url: options.data.url,
                contentType: options.data.contentType,
                data: params,
                dataType: 'json',
                headers: options.data.headers || {},
                success:function(res){
                    if(res[response.statusName] === response.statusCode){
                        that.renderData(res,params[request.pageName],res[response.countName]);
                        that.consumingTime = new Date().getTime() -  that.startTime;
                    }else{
                        that.renderForm();
                        that.BodyWrapper.html(aiui.render(TMPL_TIP,{text:res.msg || options.text.loadError
                        }));
                    }
                },
                error:function(){
                    that.BodyWrapper.html(aiui.render(TMPL_TIP,{text:options.text.loadError}));
                    that.loading.close();
                }
            })
        }else if(options.data && options.data.constructor === Array){//如果是已知数据
            var res = {},limit= options.page.limit
            ,startLimit = curr*limit - limit,
            data = JSON.parse(JSON.stringify(options.data))||[];
            if(params.sort && params.sort.field){
                data = aiui.sort(data,params.sort.field,params.sort.sort?params.sort.sort:'asc')
            }
            res[response.dataName] = (!options.treeTable.iconColumn)?(data.concat().splice(startLimit, limit)):data;
            res[response.countName] = data.length;
            that.renderData(res, curr, data.length);
        }else{
            that.BodyWrapper.html(aiui.render(TMPL_TIP,{text:options.text.notDataOrUrl}));
        }
    }
    /**
     * 填充数据
     * @param {Object} res 返回数据
     * @param {number} curr 当前页
     * @param {number} count 总条数
     */
    TableClass.prototype.renderData = function(res,curr,count){
        aiui.defaults.imports.log = console.log;
        var that = this
        ,options = that.options;
        var data = res[options.response.dataName] || [],
        isTreeTable = options.treeTable.iconColumn ? true : false,
        bodytemplate = '<table cellspacing="0" cellpadding="0" border="0" class="aiui-table-body"><tbody></tbody></table>',
        setBody = function(opt){
            //如果是排序
            var tds_lef = [],tds=[],tds_right=[];
            var tdtemplate = ['<td aiui-field="{{field}}" data-key="{{key}}" class="{{if align}}is-{{align}}{{/if}} {{if hidden}} is-hidden{{/if}}"',
                    '{{if style}} style="{{style}}"{{/if}} aiui-type="{{if type}}{{type}}{{else}}text{{/if}}"',
                    '>',
                    '<div class="cell aiui-table{{stylekey}}">',
                    '{{if field=="'+options.treeTable.iconColumn+'"}}',
                    '<span style="padding-left:#{#(level-1)*16#}#px">',
                    '<i class="aiui-table-expand-icon '+options.treeTable.expandIcon+'" #{#if !hasChild#}#style="visibility: hidden;"#{#/if#}#></i>',
                    '</span>',
                    '{{/if}}',
                    '{{if template}}{{@ template}}',
                    '{{else}}',
                        '{{if type=="checkbox"}}',//多选框
                        '<input type="checkbox" value="{{if alias}}#{#{{alias}}#}#{{else}}#{#{{field}}#}#{{/if}}" aiui-checkbox name="{{if alias}}{{alias}}{{else}}{{field}}{{/if}}[]">',//如果是选择框
                        '{{else if type=="status"}}',//如果是单选框
                        '<input type="checkbox" value="{{if alias}}#{#{{alias}}#}#{{else}}#{#{{field}}#}#{{/if}}" truevalue="1" falsevalue="0" aiui-switch name="{{if alias}}{{alias}}{{else}}{{field}}{{/if}}[]">',
                        '{{else if type=="numbers"}}',//如果是序号
                        '#{#aiui_index#}#',
                        '{{else}}',
                        '{{if alias}}#{#{{alias}}#}#{{else}}{{if field}}#{#{{field}}#}#{{/if}}{{/if}}',//如果是文本
                        '{{/if}}',
                    '{{/if}}</div>',
                '</td>'].join('');
            var body = $(aiui.render(bodytemplate,options))
            var body_left = $(aiui.render(bodytemplate))
            var body_right = $(aiui.render(bodytemplate))
            that.eachColumn(function(i4,column){
                column.stylekey = options.index+'-'+column.key;
                var temp = aiui.render(tdtemplate,column).replace(/#{#/g,"{{").replace(/#}#/g,"}}");
                if(column.fixed && column.fixed!='right'){
                    tds_lef.push(temp);
                }else if(column.fixed && column.fixed=='right'){
                    tds_right.push(temp);
                }else{
                    tds.push(temp);
                }
            })

            tds = tds_lef.concat(tds).concat(tds_right);
            $.each(data,function(index,row){
                row.aiui_index=((curr?curr:1)-1)*options.page.limit+index+1;
                var trCache = {
                    aiui_index:((curr?curr:1)-1)*options.page.limit+index+1,
                    index:index,
                    fixed:'center',
                    oldData:row
                },tr = tds.length>0 ? $('<tr class="aiui-table-row'+(options.treeTable.expand || row.expand ? ' is-open' : '')+'">'+aiui.render(tds.join(''),row)+'</tr>') : '',
                tr_left = tds_lef.length>0 ? $('<tr class="aiui-table-row'+(options.treeTable.expand || row.expand ? ' is-open' : '')+'">'+aiui.render(tds_lef.join(''),row)+'</tr>') : '',
                tr_right =tds_right.length>0 ? $('<tr class="aiui-table-row'+(options.treeTable.expand || row.expand ? ' is-open' : '')+'">'+aiui.render(tds_right.join(''),row)+'</tr>') :'',
                leftData = JSON.parse(JSON.stringify(trCache)),centerData=JSON.parse(JSON.stringify(trCache)),rightData=JSON.parse(JSON.stringify(trCache));
                tr[0]? (centerData.fixed='center',tr[0].data = centerData) : '';
                tr_left[0] ? (leftData.fixed='left',tr_left[0].data = leftData) : '';
                tr_right[0] ? (rightData.fixed='right',tr_right[0].data = rightData) : '';
                if(!$.isEmptyObject(options.treeTable)){
                    that.treeTableSetHidden(data,row,function(){
                        tr.css('display','none');
                        tr_left.css('display','none');
                        tr_right.css('display','none');
                    });
                }
                body.append(tr);
                body_left.append(tr_left);
                body_right.append(tr_right);
            })
            that.BodyWrapper.scrollTop(0);
            that.BodyWrapper.html(''),that.BodyWrapper.append(body);
            that.FixedWrapper.html(''),that.FixedWrapper.append(body_left);
            that.FixedRightWrapper.html(''),that.FixedRightWrapper.append(body_right);
            //设置同高
            that.FixedWrapper.find('td').each(function(index,td){
                $(td).css('height',that.BodyWrapper.find('td[data-key="'+$(td).data('key')+'"]').outerHeight())
            })
            that.FixedRightWrapper.find('td').each(function(index,td){
                $(td).css('height',that.BodyWrapper.find('td[data-key="'+$(td).data('key')+'"]').outerHeight())
            })
            that.renderForm();
            //设置滚动条补
            that.hasInit ? that.setScollPatch() : setTimeout(function(){
                that.setScollPatch();
            }, 100);
            that.hasInit = true;
            //关闭加载
            that.loading.close();
        }
        if(data.length==0){
            that.renderForm();
            that.FixedWrapper.html('');
            that.FixedRightWrapper.html('');
            that.BodyWrapper.html('');
            that.BodyWrapper.html(aiui.render(TMPL_TIP,{text:options.text.empty}));
            that.loading.close();
            return;
        }
        //如果是treeTable
        if(isTreeTable){
            var tree = new aiui.jsTree();
            data = tree.toList(data);
        }
        setBody();
        that.setColsWidth();
        //同步选中
        that.synChecked(true);
    }
    /**
     * 设置treeTable的隐藏列
     */
    TableClass.prototype.treeTableSetHidden = function(data,row,callback){
        var that=this,options=that.options;
        aiui.each(data,function(index,item){
            if(row[options.treeTable.parentColumn]==item[options.treeTable.keyColumn] && !item.expand && !options.treeTable.expand){
                callback();
            }
        })
    }
    /**
     * treeTable的数据处理
     */
    TableClass.prototype.treeTableDataHandle=function(data){
        var that = this,options=that.options,
        treeTable = options.treeTable,clone = JSON.parse(JSON.stringify(data));
        /**
         * 整理成树形结构数据
         * @param {Object} clone 需要整理的数据
         * @param {String} key 数据主键名称
         * @param {String} parentKey 数据的pid名称
         * @param {Srting} pid 父级id
         * @param {number} level 层级别
         */
        function makeTree(clone,key,parentKey,pid,level){
            var $trees = [];
            $.each(clone,function(index,item){
                if(item[parentKey]==pid){
                    item['level'] = level + 1;
                    $trees.push(item);
                    $trees=$trees.concat(makeTree(clone,treeTable.keyColumn,treeTable.parentColumn,item[key],level+1))
                }
            })
            return $trees;
        }
        return makeTree(clone,treeTable.keyColumn,treeTable.parentColumn,0,0);
    }
    /**
     * table滚动条补丁
     */
    TableClass.prototype.setScollPatch = function(){
        var that = this,options=that.options
        ,scrollbarwidth = aiui.scrollWidth(),
        bodyHeight = that.BodyWrapper.height();
        scollwidth = that.BodyWrapper.find('table').width()-that.BodyWrapper.width();
        scollheight = that.BodyWrapper.find('table').height()-that.BodyWrapper.height();
        if(scollheight>0){//有纵向滚动条
            that.patch.css('width',scrollbarwidth);
            that.patch.css('height',that.HeaderWrapper.outerHeight());
            that.Mian.append(that.patch);
            that.FixedRight.css('right',scrollbarwidth);
            that.FixedRightWrapper.css('height',bodyHeight-scrollbarwidth);
            that.FixedWrapper.css('height',bodyHeight-scrollbarwidth);
        }else{
            that.patch.remove();
            that.FixedRight.css('right','');
            that.FixedRightWrapper.css('height','');
            that.FixedWrapper.css('height','');
        }
        if(scollwidth>0){
            that.gutter.css('width',scrollbarwidth).css('display','block');
            that.HeaderWrapper.find('thead>tr').eq(0).append(that.gutter);
            //如果是多表头
            if(options.columns.length>1){
                that.gutter.attr('rowspan',options.columns.length);
            }
        }else{
            that.gutter.remove();
        }
    }
    /**
     * 设置事件
     */
    TableClass.prototype.setEvent = function(){
        var that = this
        ,options = that.options
        ,_BODY = $('body')
        ,dict = {}
        ,th = that.HeaderWrapper.find('th')
        ,resizing;
        /**
         * 列宽拖拽
         */
        th.on('mousemove', function(e){
            var othis = $(this)
            ,oLeft = othis.offset().left
            ,pLeft = e.clientX - oLeft;
            if(othis.attr('colspan') > 1 || othis.attr('unresize')=='true' || dict.resizeStart){
                return;
            }
            dict.allowResize = othis.width() - pLeft <= 10;
            _BODY.css('cursor', (dict.allowResize ? 'col-resize' : ''));
        }).on('mouseleave', function(){
            if(dict.resizeStart) return;
            _BODY.css('cursor', '');
        }).on('mousedown', function(e){
            e.preventDefault();
            var othis = $(this);
            if(dict.allowResize){
                var field = othis.data('key');
                e.preventDefault();
                dict.resizeStart = true; //开始拖拽
                dict.offset = [e.clientX, e.clientY]; //记录初始坐标
                that.getCssRule(field, function(item){
                    var width = item.style.width || othis.outerWidth();
                    dict.rule = item;
                    dict.ruleWidth = parseFloat(width);
                    dict.minWidth = othis.data('minwidth') || options.cellMinWidth;
                });
            }
        })
        //拖拽中
        _DOC.on('mousemove', function(e){
            if(dict.resizeStart){
                e.preventDefault();
                if(dict.rule){
                    var setWidth = dict.ruleWidth + e.clientX - dict.offset[0];
                    if(setWidth < dict.minWidth) setWidth = dict.minWidth;
                    dict.rule.style.width = setWidth + 'px';
                    //重新判断是否能浮动
                    that.InitFixed();
                }
                resizing = 1
            }
        }).on('mouseup', function(e){
            e.preventDefault();
            if(dict.resizeStart){
                dict = {};
                _BODY.css('cursor', '');
                that.setScollPatch();
            }
            if(resizing === 2){
                resizing = null;
            }
        });
        /**
         * 大小发生变化事件
         */
        $(window).on('resize',function(){ //自适应
            that.resize();
        });
        /**
         * 同步滚动条
         */
        that.BodyWrapper.on('scroll', function(){
            that.synScroll();
        });
        /**
         * 排序
         */
        th.on('click','.caret-wrapper',function(e){
            e.preventDefault();
            var thatth = $(this).parents('th'),
            field = thatth.data('field'),
            cansort = thatth.find(className.SortSpan)[0]? true : false,
            oldsort = thatth.hasClass('ascending') ? 'asc' : (thatth.hasClass('descending')?'desc':false),
            sort,sortClass;
            if(!cansort) return;
            if(!oldsort){
                sort = 'asc';
                sortClass = 'ascending';
            }else if(oldsort=='asc'){
                sort = 'desc';
                sortClass = 'descending';
            }else if(oldsort=='desc'){
                sort = 'clear';
                sortClass = '';
            }
            that.sort = {
                field:field,
                sort:sort
            }
            if(sort=='clear'){
                that.sort = undefined;
            }
            clearOtherSort(thatth);
            thatth.removeClass('ascending').removeClass('descending').addClass(sortClass);
            that.Pulldata(that.page,{sort:that.sort});
        })
        th.on('click','.ascending',function(e){
            e.stopPropagation();
            var thatClick = $(this),
            thatth = thatClick.parents('th'),
            field = thatth.data('field'),
            cansort = thatth.find(className.SortSpan)[0]? true : false;
            if(!cansort) return;
            clearOtherSort(thatth);
            thatth.removeClass('descending')
            if(thatth.hasClass('ascending')){
                that.sort = undefined;
                thatth.removeClass('ascending');
            }else{
                thatth.addClass('ascending');
                that.sort = {
                    field:field,
                    sort:'asc'
                }
            }
            that.Pulldata(that.page,{sort:that.sort});
        })
        th.on('click','.descending',function(e){
            e.stopPropagation();
            var thatClick = $(this),
            thatth = thatClick.parents('th'),
            field = thatth.data('field'),
            cansort = thatth.find(className.SortSpan)[0]? true : false;
            if(!cansort) return;
            clearOtherSort(thatth);
            thatth.removeClass('ascending')
            if(thatth.hasClass('descending')){
                that.sort = undefined;
                thatth.removeClass('descending');
            }else{
                thatth.addClass('descending');
                that.sort = {
                    field:field,
                    sort:'desc'
                }
            }
            that.Pulldata(that.page,{sort:that.sort});
        })
        function clearOtherSort(thisTh){
            thisTh.siblings().removeClass('ascending').removeClass('descending');
        }
        /**
         * 复选框点击事件
         */
        that.tabledom.on('click','input[aiui-checkbox]+',function(e){
            var thatClick = $(this),checkbox = thatClick.prev(),
            tr = thatClick.parents('tr')[0],trData=tr.data,thisTd = thatClick.parents('td'),
            isFixed = thatClick.parents('.aiui-table-fixed')[0] ? true :false,
            dom = thatClick.parents('td');
            if(!trData){//全选
                var key = thatClick.parents('th').data('key');
                $.each(that.options.columns,function(i1,row){
                    $.each(row,function(i2,col){
                        if(col.key==key){
                            col.checked = checkbox.attr('checked') ? true : false;
                        }
                    })
                })
                //同步选项
                that.synChecked(true);
            }else{//单选
                console.log($(checkbox).attr('checked'));
                var tr = undefined,td=undefined;
                if(!isFixed){//如果当前点击的是浮动
                    tr = that.FixedWrapper.find('tr').eq(trData.index);
                }else{
                    tr = that.BodyWrapper.find('tr').eq(trData.index);
                }
                td = tr.find('td[data-key="'+thisTd.data('key')+'"]');
                if(checkbox.attr('checked')!==undefined){
                    td.find('input[aiui-checkbox]').attr('checked','checked');
                }else{
                    td.find('input[aiui-checkbox]').removeAttr('checked');
                }
                that.renderForm();
                //同步选项
                that.synChecked();
            }
        })
        /**
         * treeTable的打开关闭事件
         */
        that.tabledom.on('click','.aiui-table-expand-icon',function(e){
            var thatClick = $(this),tr = thatClick.parents('tr'),show='',
            isOpen = tr.hasClass('is-open')?true:false,childs=tr[0].data.oldData.hasChild ? tr[0].data.oldData.child : [],
            allTrs = that.tabledom.find('tbody>tr');
            isOpen ? tr.removeClass('is-open') : tr.addClass('is-open');
            $.each(allTrs,function(i,item){
                update(item,childs)
            })
            /**
             * 修改子节点属性
             * @param {Document} dom 当前动
             * @param {object} tempchilds 判断条件，即为子节点
             */
            function update(dom,tempchilds){
                aiui.each(tempchilds,function(i,child){
                    if(dom.data.oldData[options.treeTable.keyColumn]==child[options.treeTable.keyColumn]){
                        if(isOpen){
                            $(dom).css('display','none');
                            if(dom.data.oldData.hasChild){
                                $(dom).removeClass('is-open');
                            }
                        }else{
                            $(dom).css('display','');
                        }
                    }else{
                        if(isOpen){
                            if(child.hasChild){
                                update(dom,child.child);
                            } 
                        }
                    }
                })
            }
        })
    }
    /**
     * 同步滚动条
     */
    TableClass.prototype.synScroll = function(){
        var that = this,othis = that.BodyWrapper
        ,scrollLeft = othis.scrollLeft()
        ,scrollTop = othis.scrollTop();
        that.HeaderWrapper.scrollLeft(scrollLeft);
        that.FixedWrapper.scrollTop(scrollTop);
        that.FixedRightWrapper.scrollTop(scrollTop);
    }
    //获取样式规则
    TableClass.prototype.getCssRule = function(field,callback){
        var that = this
        ,style = that.tabledom.find('style')[0];
        var sheet = style.sheet || style.styleSheet || {}
        ,rules = sheet.cssRules || sheet.rules;
        $.each(rules, function (i, item) {
            if(item.selectorText === ('.aiui-table'+that.index+'-'+ field)){
                return callback(item), true;
            }
        });
    }
    /**
     * 同步选中
     */
    TableClass.prototype.synChecked=function(init){
        var that = this;options = that.options;
        that.eachColumn(function(i1,thiscolumn){
            //定义总的个数，选中个数
            var total,checked = 0;
            if(init){
                if(thiscolumn.type!='checkbox') return;
                //如果当前这个列，类型是checkbox，并且默认选中则处理
                if(thiscolumn.checked){
                    that.tabledom.find('td[data-key="'+thiscolumn.key+'"]').find('input[aiui-checkbox]').attr('checked','checked');
                }else{
                    that.tabledom.find('td[data-key="'+thiscolumn.key+'"]').find('input[aiui-checkbox]').removeAttr('checked');
                }
            }else{
                if(thiscolumn.type=='checkbox'){
                    total = that.BodyWrapper.find('td[data-key="'+thiscolumn.key+'"]').length;
                    checked = that.BodyWrapper.find('td[data-key="'+thiscolumn.key+'"]').find('input[checked="checked"]').length;
                    if(total==checked){
                        that.tabledom.find('th[data-key="'+thiscolumn.key+'"]').find('input[aiui-checkbox]').attr('checked','checked')
                    }else{
                        that.tabledom.find('th[data-key="'+thiscolumn.key+'"]').find('input[aiui-checkbox]').removeAttr('checked')
                    }
                }
            }
        })
        that.renderForm();
    }
    /**
     * 搜索方法
     */
    TableClass.prototype.search = function(where){
        var that = this,options = that.options;
        options.where = where;
        $param = {
            where:where
        }
        this.Pulldata(1,$param);
    }
    /**
     * 重置table大小
     */
    TableClass.prototype.resize= function(){
        this.fullSize();
        this.setColsWidth();
        this.InitFixed();
    }
    return table;
});