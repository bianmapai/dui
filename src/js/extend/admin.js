define('admin',['jquery','element','pjax','nprogress','popup'],function($,element,pjax,nprogress,popup){
    var _BODY=$('body'),
    _WIN = $(window),
    moreAppDialog='',
    SELECTOR={
        adminbox:'.dui-admin',
        aside:'.dui-admin__aside',
        header:'.dui-admin__header',
        popper:'.dui-popper',
        menuItem:'.dui-menu-item',
        moreappContent:'.dui-admin__moreapps-content',
        moreappItem:'.dui-admin__moreapps-item',
        moreappCard:'.dui-card',
        pjax_container:'#pjax-container'
    },
    CLASS={
        open:'is-open',
        shrink:'is-shrink',
        active:'is-active',
    },
    ADMIN = {
        /**
         * 初始化后台js
         */
        render:function(){
            var that = this;
            //初始化事件管理
            $(document).delegate('*[dui-event]','click',function(e){
                var name = $(this).attr('dui-event');
                that.events[name]  && that.events[name].call(this, e)
                return false;
            })
            // 初始化url跳转事件
            $(document).delegate('[jump]','click',function(e){
                var othis       = $(this),
                    url         = othis.attr('href') || othis.attr('jump-url'),
                    type        = othis.attr('type'),//检测是否是提交
                    target      = othis.attr('jump-target') || '_pjax',//跳转方式
                    form_name   = othis.attr('jump-form'),//form名称
                    text        = othis.attr('jump-text'),//跳转提示信息
                    title       = othis.attr('jump-title'),//跳转提示标题
                    form        = $('form[name="'+form_name+'"]');//表单
                if(type=='submit'){// 表单提交
    
                }else if(url){//其他跳转方式
                    if(target=='_pjax'){//pjax方式
                        if(location.pathname==url) return false;
                        $.pjax({url:url,container: SELECTOR.pjax_container});
                    }    
                }
                return false;
            })
            // 设置pjax开始监听
            $(document).on('pjax:start', function(e){ 
                nprogress.start();
                var goUrl = location.pathname;
                that.custonEvent.changeUrlHander.call(this,goUrl);
            });
            // 设置pjax结束监听
            $(document).on('pjax:end',   function() { nprogress.done();  });
            // 窗口大小发生变化事件
            $(window).on('resize',function(e){
                $(SELECTOR.adminbox).removeClass(CLASS.open).removeClass(CLASS.shrink);
            })
        },
        /**
         * 添加事件
         * @param {String} event 事件名称
         * @param {Function} fn 回调函数
         */
        on:function(event,fn){
            this.events[event] = fn;
        },
        /**
         * 事件管理
         */
        events:{
            // 切换app菜单
            changeApp:function(e){
                var othis = $(this),
                id = othis.data('id'),
                menus=$(SELECTOR.aside).find('[dui-menubar][data-id="'+id+'"]');
                // 判断当前是弹窗的模块还是页面的模块点击
                if(othis.parents(SELECTOR.moreappContent)[0]){//弹窗出来的
                    // 如果当前app已经选中直接返回
                    if(othis.hasClass(CLASS.active)) return;
                    // 当前App选中
                    othis.addClass(CLASS.active).parents(SELECTOR.moreappItem).siblings().find(SELECTOR.moreappCard).removeClass(CLASS.active);
                    // 找到顶部菜单
                    var topMenu = $(SELECTOR.header).find(SELECTOR.menuItem+'[data-id="'+id+'"]');
                    topMenu.addClass(CLASS.active).siblings().removeClass(CLASS.active);
                    // 隐藏其他应用菜单，显示当前选中菜单
                    menus.siblings('[dui-menubar]').hide();
                    menus.show();
                }else{//页面的按钮
                    // 如果当前app已经选中直接返回
                    if(othis.hasClass('is-active')) return;
                    // 当前应用选中，其他应用不选中
                    othis.addClass('is-active').siblings().removeClass('is-active');
                    // 更多app里面更改样式
                    var currenCard = $(SELECTOR.moreappContent).find(SELECTOR.moreappCard+'[data-id="'+id+'"]');
                    currenCard.addClass(CLASS.active).parents(SELECTOR.moreappItem).siblings().find(SELECTOR.moreappCard).removeClass(CLASS.active);
                    // 隐藏其他应用菜单，显示当前选中菜单
                    menus.siblings('[dui-menubar]').hide();
                    menus.show();
                }
            },
            // 伸缩菜单
            flexible:function(e){
                //如果当前是手机
                var adminbox=$(SELECTOR.adminbox),winWidth = $(window).width();
                // 手机访问
                if(winWidth<=768){
                    // 如果当前是打开则关闭
                    if(adminbox.hasClass(CLASS.open)){
                        adminbox.removeClass(CLASS.open);
                    }else{
                        adminbox.addClass(CLASS.open);
                    }
                }else{
                    if(adminbox.hasClass(CLASS.shrink)){
                        adminbox.removeClass(CLASS.shrink);
                    }else{
                        adminbox.addClass(CLASS.shrink);
                    }
                }
            },
            // 跟多应用
            moreapp:function(e){
                // 获取当前宽度
                var winWidth=$(window).width(),width,content,stance;
                // 手机界面
                if(winWidth<=768){
                    width='90%';
                }else{
                    width=600;
                }
                stance = $('<div class="dui-dialog__stance"></div>');
                content = $(SELECTOR.moreappContent);
                content.after(stance);
                // 打开多应用界面
                moreAppDialog=popup.dialog({
                    title:'更多应用',
                    customClass:'dui-admin__moreapps',
                    modalClose:true,
                    content:content[0],
                    move:false,
                    width:width,
                    height:'auto',
                    showFooter:false,
                    offset:0,
                    closed:function(){
                        stance.after(content);
                        stance.remove();
                    }
                })
            }
        },
        custonEvent:{
            changeUrlHander:function(url){
                // 找到url所属的侧边栏元素
                var currentAsideMenu = $(SELECTOR.aside).find(SELECTOR.menuItem+'[href="'+url+'"]');
                // 如果当前元素有class为is-active，则直接返回
                if(currentAsideMenu.hasClass(CLASS.active)) return;
            }
        }
    }
    // 设置pjax请求超时时间
    $.pjax.defaults.timeout = 10000;
    ADMIN.render();
    return ADMIN;
})