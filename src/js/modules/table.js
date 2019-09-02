dui.define('table',['jquery','template','form'],function($,template,form){
    /**
     * 初始化入口
     */
    var _WIN = $(window),
    _DOC = $(document),
    // 常量定义
    ELEM = '.dui-table',HEADER='.dui-table__header-wrapper',BODYER='.dui-table__body-wrapper',
    FIXED = '.dui-table__fixed',FIXED_LEFT='.dui-table__fixed-left',FIXED_RIGHT='.dui-table__fixed-right',
    PAGE = '.diu-table__page',PATCH = '.dui-table__fixed-right-patch',FIXED_WRAP='.dui-table__fixed-body-wrapper',
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
                        '<th {{if item2.unresize || item2.colspan>1}}unresize="{{item2.unresize}}"{{/if}}',
                        '{{if item2.field}} data-field="{{item2.field}}"{{/if}}',
                        ' data-key="{{item2.key}}" colspan="{{item2.colspan}}" rowspan="{{item2.rowspan}}"',
                        ' class="{{if item2.sort && item2.colspan==1}}is-sortable{{/if}}">',
                            '<div class="cell dui-table-{{if item2.colGroup}}group{{else}}{{index}}-{{item2.key}}{{/if}}{{if item2.type!=="normal"}}{{if item2.align}} align="{{item2.align}}"{{/if}} dui-table_cell-{{item2.type}}{{/if}}">',
                                '{{if item2.type=="checkbox"}}',
                                    '<input type="checkbox" dui-checkbox indeterminate="true"{{if checkAll}} checked="checked"{{/if}} id="dui-table-{{index}}-checkbox">',
                                '{{else}}',
                                    '{{item2.title}}',
                                '{{/if}}',
                                // 排序
                                '{{if item2.sort && item2.colspan==1 && item2.type!=="checkbox" && item2.type!=="numbers"}}',
                                '<span class="caret-wrapper">',
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
        ' style="width:{{clientWidth}}px;{{if height}}height:{{height}}px{{/if}}">',
            '<div class="dui-table__header-wrapper">',
                TMPL_HEAD(),
            '</div>',
            '<div class="dui-table__body-wrapper{{if initScroll}} {{initScroll}}{{/if}}" style="height:{{bodyHeight}}px;">',
                // 显示内容，暂不设置
            '</div>',
            '<div class="dui-table__fixed dui-table__fixed-left">',
                '<div class="dui-table__fixed-header-wrapper">',
                    TMPL_HEAD({fixed:'left'}),
                '</div>',
                '<div class="dui-table__fixed-body-wrapper" style="height:{{bodyHeight}}px;">',
                '</div>',
            '</div>',
            '<div class="dui-table__fixed dui-table__fixed-right">',
                '<div class="dui-table__fixed-header-wrapper">',
                    TMPL_HEAD({fixed:'right'}),
                '</div>',
                '<div class="dui-table__fixed-body-wrapper" style="height:{{bodyHeight}} px;">',
                '</div>',
            '</div>',
            '{{if page.show}}',
            '<div class="diu-table__page">',
            '</div>',
            '{{/if}}',
            // 补丁
            '<div class="dui-table__fixed-right-patch"></div>',
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

        }
    },
    /**
     * 表格渲染主要类
     */
    Class = function(options){
        var that = this,
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
            loading:'',//是否有加载条
            title:'',//导出时的标题
            minColumnWidth:60,//全局设置的列最小宽度
            data:'',//数据或者ajax请求对象
            done:'',//渲染完毕的回调
            text:'',//一些操作提示语言
            request:'',//请求参数配置
            response:'',//响应参数配置
        },options);
        config.where = config.where || {};
        config.el  = $(config.el);
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
            limit:10,
            curr:1,
            limits:[10,20,30,40,50],
        },options.page);
        // 配置请求参数
        config.request = $.extend({
            pageName: 'page'
            ,limitName: 'size'
        },options.request)
        // 配置响应数据格式
        config.response = $.extend({
            statusName: 'code'
            ,statusCode: 1
            ,msgName: 'msg'
            ,dataName: 'data'
            ,countName: 'count'
        },options.response);
        // 设置当前页面
        that.currPage = parseInt(config.page.curr) || 1;
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
        duiHeader     = that.duiHeader     = reElem.find(HEADER),
        duiBodyer     = that.duiBodyer     = reElem.find(BODYER),
        duiFixed      = that.duiFixed      = reElem.find(FIXED),
        duiFixedL     = that.duiFixedL     = reElem.find(FIXED_LEFT),
        duiFixedLWrap = that.duiFixedLWrap = duiFixedL.find(FIXED_WRAP),
        duiFixedR     = that.duiFixedR     = reElem.find(FIXED_RIGHT),
        duiFixedRWrap = that.duiFixedRWrap = duiFixedR.find(FIXED_WRAP),
        duiPage       = that.duiPage       = reElem.find(PAGE),
        duiGutter     = that.duiGutter     = $('<th class="gutter"></th>'),
        duiPatch      = that.duiPatch      = reElem.find(PATCH);
        // 如果已经渲染过了则移除
        hasRender[0] && hasRender.remove();
        el.after(reElem);
        // 设置表格大小样式
        that.fullSize();
        // 同步header高度
        duiHeader.find('th').each(function(i,item){
            var key = $(item).data('key');
            duiFixedL.find('th[data-key="'+key+'"]').css('height',$(item).outerHeight());
            duiFixedR.find('th[data-key="'+key+'"]').css('height',$(item).outerHeight());
        })
        // 渲染form
        that.renderForm();
        // 获取数据
        that.pullData();
        // 设置事件
        that.setEvent();
    }
    /**
     * 初始化列
     */
    Class.prototype.initColumns = function(){
        var that = this,config = that.config,
        columns = config.columns,
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
                initColWidthWithType(col);
            })
        })
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
        height = options.height, bodyHeight;
        if(that.fullHeightGap){
            height = _WIN.height() - that.fullHeightGap;
            if(height < 135) height = 135;
            that.reElem.css('height', height-1);
        }
        if(!height) return;
        bodyHeight = parseFloat(height) - (that.duiHeader.outerHeight() || 48);
        // //减去分页栏的高度
        // if(options.page.show){
        //     bodyHeight = that.bodyHeight = (bodyHeight - (that.duiPage.outerHeight() || 41) - 2);
        // }
        // 设置bodyWrap高度
        that.duiBodyer.css('height',bodyHeight);
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
        ,totalWidth = 0;//叠加所有列最小宽度
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
        // 记录自动分配列的个数
        options.autoColNums = autoColNums;
        // 设置列宽
        that.eachColumns(function(index,col){
            var minWidth = col.minWidth || options.minColumnWidth;
            if(col.colGroup || col.hide) return;
            if(col.width === 0){
                col.initWidth = Math.floor(autoWidth >= minWidth ? autoWidth : minWidth);
                // 设置当前列为自动分配宽度列
                col.autoColumn = true;
            }else if(/\d+%$/.test(col.width)){
                col.initWidth = Math.floor((parseFloat(col.width) / 100) * clientWidth);
            }else{
                col.initWidth = col.width;
            }
        },true);
    }
    /**
     * 设置列宽，根据是否有滚动条调整
     */
    Class.prototype.setColumnsWidth = function(){
        var that = this,options=that.config,
        clientWidth = that.getClientWidth(),
        colNums = 0,//列个数
        countWidth = 0,//已经有宽度的列总宽度 
        scrollWidth = (that.duiBodyer[0].offsetWidth-that.duiBodyer[0].clientWidth);
        // 获取根据最小宽度得到的总宽度
        that.eachColumns(function(i,col){
            col.hide || colNums++
        })
        // 修正滚动条
        clientWidth = clientWidth-function(){
            return options.border ? colNums+1 : 0;
        }()-(scrollWidth>0?(dui.getScrollWidth()+2):0);
        // 获取剩余宽度
        var getAutoAllWidth = function(){
            that.eachColumns(function(i,col){
                var width = 0
                , minWidth = col.minWidth || options.minColumnWidth; //最小宽度
                if (col.colGroup || col.hide) return;
                width = col.width || 0;
                if (/\d+%$/.test(width)) { //列宽为百分比
                    width = Math.floor((parseFloat(width) / 100) * clientWidth);
                    width < minWidth && (width = minWidth);
                }
                countWidth += width;
            })
            return (clientWidth-countWidth);
        }(),autoWidth = (getAutoAllWidth/options.autoColNums);
        // 设置样式
        that.eachColumns(function(i,col){
            var minWidth = col.minWidth || options.minColumnWidth;
            if(col.colGroup || col.hide) return;
            // 给自动分配列宽的列分配宽度
            if(col.autoColumn){
                that.getCssRule(col.key,function(rule){
                    rule.style.width = Math.floor(autoWidth >= minWidth ? autoWidth : minWidth) + 'px';
                })
            }
            // 给宽度为百分比的宽设置宽度
            else if(/\d+%$/.test(col.width)){
                that.getCssRule(col.key,function(rule){
                    rule.style.width = Math.floor((parseFloat(col.width) / 100) * clientWidth) + 'px';
                })
            }
        })
        // 判断是否有纵向滚动条
        if(that.duiBodyer[0].offsetHeight==that.duiBodyer[0].clientHeight){
            that.duiBodyer.removeClass('is-scrolling-right').removeClass('is-scrolling-left').addClass('is-scrolling-none');
        }else{
            that.duiBodyer.removeClass('is-scrolling-right').removeClass('is-scrolling-none').addClass('is-scrolling-left');
        }
    }
    /**
     * 设置滚动条补丁
     */
    Class.prototype.setScrollPatch = function(){
        var that = this,options = that.config,
        duiMainTable = that.duiBodyer.children('table');
        scrollWidth = that.duiBodyer.prop('offsetWidth') - that.duiBodyer.prop('clientWidth'),//大于0则右侧有滚动条
        scrollHeight= that.duiBodyer.prop('offsetHeight') - that.duiBodyer.prop('clientHeight');//大于0则底部有滚动条
        


        // 如果有右侧滚动条
        if(scrollWidth>0){
            // 设置补丁
            that.duiGutter.css('width',(scrollWidth+1));
            that.duiGutter.css('display','');
            that.duiHeader.find('thead>tr').eq(0).append(that.duiGutter);
            // 如果是多级表头
            if(options.columns.length>1){
                that.gutter.attr('rowspan',options.columns.length);
            }
            that.duiFixedR.css({
                'right':(scrollWidth-1),//减1是为了遮住滚动条的边框
            });
        }else{
            that.duiFixedR.css({
                'right':'',
            });
            that.duiGutter.css('display','none');
        }
        // 设置浮动的高度
        that.duiFixed.find(FIXED_WRAP).css('height',that.duiBodyer.prop('clientHeight'));
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
        form.render(that.reElem,'checkbox');
    }
    /**
     * 获取数据
     */
    Class.prototype.pullData = function(curr,params={}){
        var that = this,options=that.config,
        request = options.request,
        response = options.response,
        ajaxOpt = options.data;
        that.startTime = new Date().getTime()
        //如果需要显示加载条
        // options.loading &&
        // 如果是数组
        if(ajaxOpt.url){
            // 说明是请求远程数据
            // 如果是treetable则不需要分页
            if(!options.treeTable){
                //如果不是treeTable则需要分页
                params[request.pageName] = curr;
                params[request.limitName] = options.page.limit;
            }
            params = $.extend(true,{where:options.where},params);
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
                }
            })

        }else if(options.data && options.data.constructor === Array){

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
        var that = this,options = that.config;
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
                '<td dui-field="{{field}}" dui-key="{{key}}"{{if style}} style="{{style}}"{{/if}}>',
                    '<div class="cell dui-table-{{stylekey}}"{{if align}} align="{{align}}"{{/if}}>',
                    // 如果是模板
                    '{{if template}}{{@ template}}',
                    '{{else}}',
                        // 如果是选择框
                        '{{if type=="checkbox"}}',
                        '<input type="checkbox" value="{{@ fieldName}}" dui-checkbox name="{{field}}[]">',//如果是选择框
                        '{{else if type=="numbers"}}',//如果是序号
                        '{{@ duiIndex}}',
                        '{{else}}',
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
                var temp = template.render(tdTmpl,column);
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
                row.duiIndex = ((curr?curr:1)-1)*options.page.limit+index+1;
                var tr_left =tds_lef.length>0 ? $('<tr >'+template.render(tds_lef.join(''),row)+'</tr>'):'',
                    tr_right =tds_right.length>0 ? $('<tr >'+template.render(tds_right.join(''),row)+'</tr>'):'',
                    tr = tds.length>0 ? $('<tr >'+template.render(tds.join(''),row)+'</tr>'):'';
                // 设置数据
                tr_left[0].data = tr_right[0].data = tr[0].data = row;
                // 放置元素
                bodyTable.append(tr),bodyLeftTable.append(tr_left),bodyRightTable.append(tr_right);
            })
            that.duiBodyer.scrollTop(0);
            that.duiBodyer.html(''),that.duiBodyer.append(bodyTable);
            that.duiFixedLWrap.html(''),that.duiFixedLWrap.append(bodyLeftTable);
            that.duiFixedRWrap.html(''),that.duiFixedRWrap.append(bodyRightTable);
            // 渲染form
            that.renderForm();
            // 重新设置列宽
            that.setColumnsWidth();
            // 设置补丁
            that.setScrollPatch();
            
        };
        // 设置body
        setBody();
    }
    /**
     * 设置事件
     */
    Class.prototype.setEvent = function(){
        var that = this,options = that.config;
        


        _WIN.on('resize',function(e){
            that.resize();
        })
    }
    /**
     * 重新制定表格大小
     */
    Class.prototype.resize = function(){
        this.fullSize();
        this.setColumnsWidth();
        this.setScrollPatch();
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
    return table;
})