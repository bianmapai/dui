aiui.define('element',['jquery'],function($){
    "use strict"; 
    var FilterName = 'aiui-filter',
    body = $('body'),
    className={
        NavMenu:'.aiui-sidebar-menu',
        ClickTitle:'.aiui-submenu-title',
        jumpLi:'.aiui-menu-item',
        jumpTitle:'.aiui-menu-item-title',
        Menu:'.aiui-menu',
        Submenu:'.aiui-submenu',
        menuActive:'is-active',
        menuOpen:'is-open',
        Dropdown:'.aiui-dropdown',
        DropdownTrigger:'[trigger]',
        DropdownArrow:'.aiui-dropdown-icon',
        DropdownPopper:'.aiui-dropdown-menu',
        DropdownItem:'.aiui-dropdown-menu-item',
    },
    element = {
        /**
         * 版本号
         */
        v:'1.0.0',
        /**
         * 渲染方法
         * @param {String} type 渲染的类型
         * @param {String} filter 过滤器
         */
        render:function(type,filter){
            var that = this,filter = function(){
                return filter ? ('[aiui-filter="' + filter +'"]') : '';
              }(),
            Items = {
                menu:function(){
                    var menus = $(className.NavMenu+filter);
                    menus.each(function(index,menu){
                        menu.MenuClass = new MenuClass(that,menu);
                    })
                },
                dropdown:function(){
                    var dropdowns = $(className.Dropdown+filter);
                    dropdowns.each(function(index,dropdown){
                        dropdown.DropdownClass = new DropdownClass(that,dropdown);
                    })
                }
            };
            if(type){
                Items[type] ? Items[type]() : aiui.error('不支持'+type+'表单渲染');
            }else{
                Object.keys(Items).forEach(function(key){
                    Items[key]();
                })
            }
        },
        /**
         * 添加回调函数
         * @param {string} name 事件名称
         * @param {Function} callback 回调函数
         */
        on:function(name,callback){
            this.event[name] =  callback;
        },
        /**
         * 事件管理器
         */
        event:{},
    },
    /**
     * 初始化一个Menu
     * @param {element} element element对象
     * @param {Document} dom dom对象
     */
    MenuClass = function(element,dom){
        var that = this;
        that.element = element;
        that.dom = dom;
        that.render();
    },
    /**
     * 初始化一个下拉框
     * @param {element} element element对象
     * @param {Document} dom dom对象
     */
    DropdownClass = function(element,dom){
        var that = this;
        that.element = element;
        that.dom = dom;
        that.trigger = $(dom).find(className.DropdownTrigger)[0];
        that.popper = $(dom).find(className.DropdownPopper)[0];
        that.arrow = $('<div class="aiui-popper-arrow"><div>')[0];
        that.render();
    };
    /**
     * 渲染
     */
    MenuClass.prototype.render = function(){
        var that = this,openonly = typeof $(that.dom).attr('openonly')!=="undefined" ? true : false,
        submenus = $(that.dom).children(className.Submenu),
        /**
         * 初始化菜单
         * @param {JuqeryDom} list 要初始化的dom集合
         * @param {Integer} level 层级
         * @param {Boolean} openonly 是否是只打开一个
         */
        menuRender = function(list,level,openonly=false){
            var isopen = false;
            $.each(list,function(index,item){
                var $item = $(item),ClickTitle=$item.children(className.ClickTitle),//可点击的标题
                menu = $item.children(className.Menu),//子菜单
                jumpTitles = menu.children(className.jumpLi).children(className.jumpTitle),
                open = $item.hasClass(className.menuOpen) ? true : false;//是否是打开
                ClickTitle[0].isopen = open;
                ClickTitle[0].oldheight = menu.outerHeight();
                ClickTitle[0].menu = menu[0];
                ClickTitle[0].show = function(){
                    var that = this,$li = $(that).parent(),$menu = $(that.menu);
                    $li.addClass(className.menuOpen),that.isopen = true;
                    $menu.css('height',0);
                    cancelAnimationFrame(that.frist);
                    cancelAnimationFrame(that.second);
                    clearTimeout(that.timer);
                    that.frist = requestAnimationFrame(function(){
                        $menu.css('overflow','hidden');
                        $menu.css('display','block');
                        $menu.css('height',0);
                        $menu.addClass('collapse-transition');
                        that.second = requestAnimationFrame(function(){
                            $menu.css('height',that.menu.scrollHeight);
                            that.timer = setTimeout(function(){
                                $menu.css('display','block');
                                $menu.css('height','');
                                $menu.css('overflow','');
                                $menu.removeClass('collapse-transition');
                            },300);
                        })
                    })
                };
                ClickTitle[0].hide = function(){
                    var that = this,$li = $(that).parent(),$menu = $(that.menu);
                    $li.removeClass(className.menuOpen),that.isopen = false;
                    $menu.css('height',that.menu.scrollHeight);
                    cancelAnimationFrame(that.frist);
                    cancelAnimationFrame(that.second);
                    clearTimeout(that.timer);
                    that.frist = requestAnimationFrame(function(){
                        $menu.addClass('collapse-transition');
                        that.second = requestAnimationFrame(function(){
                            $menu.css('overflow','hidden');
                            $menu.css('display','block');
                            $menu.css('height',0);
                            that.timer = setTimeout(function(){
                                $menu.css('display','none');
                                $menu.css('height','');
                                $menu.css('overflow','');
                                $menu.removeClass('collapse-transition');
                            },300);
                        })
                    })

                }
                if(open){//如果是打开
                    if(openonly && !isopen){
                        menu.css('display','block');
                        isopen = true;
                    }else if(!openonly){
                        menu.css('display','block');
                    }else{
                        menu.css('display','none');
                        $item.removeClass(className.menuOpen);
                        ClickTitle[0].isopen = false;
                    }
                }else{//如果是关闭
                    menu.css('display','none');
                    ClickTitle[0].isopen = false;
                }
                //设置点击事件
                ClickTitle.off('click').on('click',function(e){
                    e.stopPropagation();
                    var that = this,open = that.isopen,
                    Others = $(that).parent().siblings().find(className.ClickTitle);
                    if(open){
                        //关闭
                        that.hide();
                    }else{
                        //打开
                        that.show();
                        if(openonly){
                            Others.each(function(index,other){
                                other.hide();
                            })
                        }
                    }
                })
                //设置跳转事件
                jumpTitles.each(function(index,jumpTitle){
                    $(jumpTitle).on('click',function(e){
                        var $jumTitle = $(this),
                        $parent = $jumTitle.parent();
                        if($parent.hasClass(className.menuActive)) return false;
                        //移除当前菜单下的所有选中
                        $(that.dom).find(className.jumpLi).removeClass(className.menuActive);
                        $(that.dom).find(className.Submenu).removeClass(className.menuActive);
                        //依次选中父节点
                        addClassParent($parent)
                    })
                })
                var children = menu.children(className.Submenu);
                if(children){
                    menuRender(children,level+1,openonly);
                }
            })
        },
        /**
         * 
         * @param {Document} $dom dom对象
         */
        addClassParent=function($dom){
            if($dom.hasClass('aiui-menu-item')){
                $dom.addClass(className.menuActive);
            }else if($dom.hasClass('aiui-submenu')){
                $dom.addClass(className.menuActive);
            }
            if($(that.dom).find($dom[0])[0]){
                addClassParent($dom.parent());
            }
        };
        menuRender(submenus,1,openonly);//初始化
    }
    DropdownClass.prototype.render = function(){
        var that = this,type = $(that.trigger).attr('trigger');
        if(!that.dom || !that.trigger || !that.popper) return;
        $(that.popper).css('display','block');
        $(that.popper).addClass('aiui-popper');
        $(that.popper).append(that.arrow);
        that.$popper = aiui.popper(that.trigger,that.popper,{
            placement: 'bottom',
            arrowElement: 'aiui-popper-arrow',
            onCreate:function(data){
                $(that.popper).css('display','');
                that.transition = aiui.transition(that.popper,{
                    name:'aiui-zoom-in-top',
                    duration:300,
                    onenteractive:function(){
                        that.$popper.update();
                    }
                });
                that.setting(data);
            },
            onUpdate:function(data){
                that.setting(data);
            }
        });
        //设置事件
        if(type=='click'){//1.点击
            $(that.trigger).off('click').on('click',function(e){
                e.stopPropagation;
                if(that.transition.isShow){
                    hide();
                }else{
                    show();
                }
            })
        }else if(type=='hover'){//1.hover
            $(that.trigger).off('mouseover').on('mouseover',function(e){
                if(that.hideTimer){
                    clearTimeout(that.hideTimer);
                }else{
                    show();
                }
            }).off('mouseout').on('mouseout',function(e){
                that.hideTimer = setTimeout(function(){
                    hide();
                    that.hideTimer = null;
                },100);
            })
            $(that.popper).off('mouseover').on('mouseover',function(e){
                clearTimeout(that.hideTimer);
            }).off('mouseout').on('mouseout',function(e){
                that.hideTimer = setTimeout(function(){
                    hide();
                    that.hideTimer =null;
                },100);
            })
        }
        $(className.DropdownItem).on('click',function(e){
            hide();
        })
        /**
         * 显示
         */
        function show(){
            $(that.dom).find(className.DropdownArrow).addClass('is-show');
            that.transition.show();
        }
        /**
         * 隐藏
         */
        function hide(){
            that.transition.hide();
            $(that.dom).find(className.DropdownArrow).removeClass('is-show');
        }

        //设置点击关闭事件
        $('body').on('click',function(e){
            if($(that.dom).find(e.target)[0]){
                return;
            }
            if(that.dom == e.target){
                return;
            }
            if(that.transition.expectedState){
                hide();
            }
        })
    }
    DropdownClass.prototype.setting = function(data){
        var that = this;
        var x = {top:'bottom','bottom':'top'};
        that.transition.config.name = 'aiui-zoom-in-'+x[data.placement];
    }
    element.render();
    return element;
})