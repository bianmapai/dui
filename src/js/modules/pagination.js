dui.define(['jquery','form'],function($,form){
    "use strict";
    var pagination = {
        v:'1.0.0',
        render:function(options){
            var o = new Class(options);
            return o.index;
        },
        index:0
    },
    NOD_NAME = 'dui-pagination',
    config = {
        class:'',//样式
        el:'',//存放pagination的dom
        total:'',//数据总量
        size:10,//每页显示数量
        sizes:[10, 20, 30, 40, 50],//每页条数的选择项
        current:1,//当前页
        pagerNum:5,//页数显示个数
        prev:'上一页',//上一页显示字
        next:'下一页',//下一页显示字
        first:1,//第一页显示字
        last:'',//最后一页字体
        layout:'total, sizes, prev, pager, next, jumper',//布局样式
        jump:'',//当前页切换事件
        background:false,
    },
    Class = function(options){
        var that = this;
        that.config = $.extend({},config,options);
        that.index = ++pagination.index;
        config.current = that.config.current;
        that.render();
    };
    /**
     * 渲染
     */
    Class.prototype.render = function(){
        var that = this,config = that.config,
            views = that.view();
        that.parent = $(config.el)[0] ? $(config.el) : dui.error('没有获取到dom');
        that.dom = $(views);
        that.parent.html(that.dom);
        //渲染
        form.render(that.dom[0]);
        //设置事件
        that.setEvent();
    }
    /**
     * 获取视图
     */
    Class.prototype.view = function(){
        var that = this,config = that.config,res = {},
        pagerNum = config.pagerNum = 'pagerNum' in config ? (config.pagerNum|0) : 5;
        config.Allpage = Math.ceil(parseInt(config.total)/parseInt(config.size));
        res['total'] = '<span class="dui-pagination__total">共 '+config.total+' 条</span>',
        res['sizes'] = ['<span class="dui-pagination__sizes">',
            function(){
                var html = '<select dui-select size="mini" id="dui-pagination-'+that.index+'-size">';
                $.each(config.sizes,function(i,size){
                    html += '<option value="'+size+'" '+(size==config.size ? 'selected="selected"' : '')+'>'+size+'条/页</option>';
                })
                return html+'</select>';
            }(),
        '</span>'].join(''),
        res['prev'] = '<button type="button" class="btn-prev"'+function(){
            if(config.current==1){
                return 'disabled="disabled"';
            }
        }()+'>'+config.prev+'</button>',
        res['pager'] = ['<ul class="dui-pager">',
            function(){
                var pagerDom = [];

                //数据量为0时，不输出页码
                if(config.total < 1){
                    return '';
                }
                //连续分页个数不能低于0且不能大于总页数
                if(pagerNum < 0){
                    pagerNum = 1;
                } else if (pagerNum > config.Allpage){
                    pagerNum = config.Allpage;
                }
                
                //计算当前组
                var index = config.Allpage > pagerNum 
                    ? Math.ceil( (config.current + (pagerNum > 1 ? 1 : 0)) / (pagerNum > 0 ? pagerNum : 1) )
                : 1;

                //首页
                if(index>1 && pagerNum>0){
                    pagerDom.push('<li class="number" data-page="1">'+config.first+'</li>');
                }

                //计算当前页码组的起始页
                var halve = Math.floor((pagerNum-1)/2) //页码数等分
                ,start = index > 1 ? config.current - halve : 1
                ,end = index > 1 ? (function(){
                var max = config.current + (pagerNum - halve - 1);
                return max > config.Allpage ? config.Allpage : max;
                }()) : pagerNum;

                //防止最后一组出现“不规定”的连续页码数
                if(end - start < pagerNum - 1){
                    start = end - pagerNum + 1;
                }
                
                //输出左快捷跳转
                if(config.first !== false && start > 2){
                    pagerDom.push('<li class="number left-more">…</li>')
                }

                //输出连续页
                for (; start <= end; start++) {
                    if(config.current==start){
                        pagerDom.push('<li class="number active">'+start+'</li>');
                    }else{
                        pagerDom.push('<li class="number" data-page="'+start+'">'+start+'</li>');
                    }
                }
                //输出输出右分隔符 & 末页
                if(config.Allpage > pagerNum && config.Allpage > end && config.last !== false){
                    if(end + 1 < config.Allpage){
                        pagerDom.push('<li class="number right-more">…</li>');
                    }
                    if(pagerNum !== 0){
                        pagerDom.push('<li class="number" data-page="'+config.Allpage+'">'+(config.last?config.last:config.Allpage)+'</li>');
                    }
                }
                return pagerDom.join('');

            }(),
        '</ul>'].join(''),
        res['next'] = '<button type="button" class="btn-next"'+function(){
            if(config.current==config.Allpage){
                return 'disabled="disabled"';
            }
        }()+'>'+config.next+'</button>',
        res['jumper'] = ['<span class="dui-pagination__jump">前往<div class="dui-input dui-pagination__editor is-in-pagination">',
                        '<input type="number" class="dui-input__inner" name="pager-jump" value="'+config.current+'">',
                    '</div>页</span>'].join('');
        var views = '<div class="dui-pagination'+(config.small?' dui-pagination__small':'')+(config.background ? ' is-background':'')+'">';
        $.each(config.layout.split(','),function(i,key){
            views += res[key.trim()];
        })
        return views+'</div>';
    }
    /**
     * 设置事件
     */
    Class.prototype.setEvent= function(){
        var that = this,config = that.config;
        //按钮切换事件
        that.dom.on('click','.dui-pager .number',function(e){
            var othis = $(this),page = othis.data('page');
            if(othis.hasClass('active')){
                return false;
            }
            that.jump(page);
        })
        //上一页点击事件
        that.dom.on('click','.btn-prev',function(e){
            that.jump(config.current-1);
        })
        //下一页点击事件
        that.dom.on('click','.btn-next',function(e){
            that.jump(config.current+1);
        })
        //页面size切换事件
        that.dom.on('change','#dui-pagination-'+that.index+'-size',function(e){
            var size = $(this).val();
            that.jump(null,size);
        })
        //跳转页面事件
        that.dom.on('keydown','input[name="pager-jump"]',function(e){
            e = e || window.event;
            var key = e.keyCode || e.which || e.charCode,
            page = $(this).val();
            if(key == 13){
                that.jump(page);
            }
        })
    }
    /**
     * 跳转方法
     */
    Class.prototype.jump = function(page,size){
        var that = this,config = that.config;
        page = parseInt(page ? page : config.current);
        size = parseInt(size ? size : config.size);
        if(page-1<0){
            return false;
        }
        //重新赋值
        config.size = size;
        config.current = page;
        //渲染第一次
        that.render();
        if(page>config.Allpage){
            //当当前页大于总页则赋值为最大页
            config.current = config.Allpage;
            //然后再渲染
            that.render();
        }
        //设置按钮能不能点击
        if(config.current<=1){
            that.dom.find('.btn-prev').attr('disabled','disabled');
        }
        if(config.current>=config.Allpage){
            that.dom.find('.btn-next').attr('disabled','disabled');
        }
        //如果配置了jump回调函数
        if(config.jump && typeof config.jump ==="function"){
            config.jump.call(this,{page:config.current,size:config.size});
        }
    }
    return pagination;
})