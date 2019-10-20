define('admin',['jquery','element','pjax','nprogress','popup'],function($,element,pjax,nprogress,popup){
    var _BODY=$('body'),
    _WIN = $(window),
    moreAppDialog='',
    SELECTOR={
        adminbox:'.dui-admin',
        aside:'.dui-admin__aside',
        header:'.dui-admin__header',
        popper:'.dui-popper',
        menubar:'[dui-menubar]',
        menus:'.dui-menu',
        submenu:'.dui-submenu',
        submenusTitles:'.dui-submenu__title',
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
                    url         = othis.attr('href') || othis.attr('jump-url'),     //跳转以及
                    type        = othis.attr('type') || othis.attr('jump'),         //检测是否是提交
                    mode        = othis.attr('jump-mode') || '_pjax',               //跳转方式
                    target      = othis.attr('jump-target'),                        //跳转目标
                    method      = othis.attr('jump-method') || 'get',               //提交方式，post还是get
                    form_name   = othis.attr('jump-form'),                          //提交数据所在的form表单
                    text        = othis.attr('jump-text'),                          //跳转提示信息
                    title       = othis.attr('jump-title'),                         //跳转提示标题
                    form        = $('form[name="'+form_name+'"]');                  //表单
                // 不管是什么操作必须得有url
                if(url){
                    if(type=='submit'){// 表单提交
                        
                    }else{//其他链接跳转
                        if(mode=='_pjax'){//pjax方式
                            if(location.pathname==url) return false;
                            $.pjax({url:url,container: SELECTOR.pjax_container});
                        }else if(target=='_ajax'){

                        }
                    }
                }
                return false;
            })
            // 设置pjax开始监听
            $(document).on('pjax:start', function(e){ 
                nprogress.start();
            });
            // 设置pjax结束监听
            $(document).on('pjax:end',   function() { 
                nprogress.done();
                var menuId = window.duiRoute;
                that.custonEvent.changeUrlHander.call(this,menuId);
                window.currenLocation = null;
            });
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
            changeUrlHander:function(id){
                // 找到url所属的侧边栏元素
                var currentAsideMenu = $(SELECTOR.aside).find(SELECTOR.menuItem+'[data-id="'+id+'"]');
                // 如果当前元素有class为is-active，则直接返回
                if(currentAsideMenu.hasClass(CLASS.active)) return;
                // 移除当前菜单跳转高亮
                $(SELECTOR.aside).find(SELECTOR.menuItem).removeClass(CLASS.active);
                // 移除当前菜单的子菜单高亮
                $(SELECTOR.aside).find(SELECTOR.submenusTitles).removeClass(CLASS.active);
                // 添加当前选中高亮
                // 当前菜单高亮
                addCurrenMenuHeight(currentAsideMenu);
                // 如果是弹窗进入
                moreAppDialog && moreAppDialog.close && moreAppDialog.close();
                /**
                 * 根据指定菜单高亮其他父节点
                 * @param {Element} el 菜单元素
                 */
                function addCurrenMenuHeight(el){
                    // 当前节点高亮
                    $(el).addClass(CLASS.active);
                    // 找到所有的父节点
                    var submenus = $(el).parents(SELECTOR.menus).prev(SELECTOR.submenusTitles);
                    // 设置高亮
                    submenus.addClass(CLASS.active);
                    // 循环检测父元素是否打开
                    submenus.each(function(i,item){
                        // 如果父元素是没有打开状态,则手动触发
                        if(!$(item).parent().hasClass('is-opened')){
                            console.log('进来了');
                            $(item).trigger("click");
                        }
                    })
                    var id = $(el).parents(SELECTOR.menubar).data('id');
                    // 显示当前应用下的菜单
                    $(el).parents(SELECTOR.menubar).show().siblings(SELECTOR.menubar).hide();
                    // 找到顶部菜单
                    var topMenu = $(SELECTOR.header).find(SELECTOR.menuItem+'[data-id="'+id+'"]');
                    topMenu.addClass(CLASS.active).siblings().removeClass(CLASS.active);
                    // 找到更多应用
                    var currenCard = $(SELECTOR.moreappContent).find(SELECTOR.moreappCard+'[data-id="'+id+'"]');
                    currenCard.addClass(CLASS.active).parents(SELECTOR.moreappItem).siblings().find(SELECTOR.moreappCard).removeClass(CLASS.active);
                }
            }
        }
    }
    // 设置pjax请求超时时间
    $.pjax.defaults.timeout = 10000;
    ADMIN.render();
    return ADMIN;
})