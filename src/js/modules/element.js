dui.define(['jquery'],function(){
    var element = function(type,elem){
        return new element.fn[type](elem);
    },
    Selector={
        navMenus:"[dui-menubar]",
        menus:".dui-menu",
        submenus:".dui-submenu",
        submenusTitles:".dui-submenu__title",
        jump:'.dui-menu-item',
        
    },
    className={
        isOpen:'is-open',
        isActive:'is-active',
    };
    element.prototype = element.fn = {
        NavMenu:function(elem){
            var that = this;
            that.elem = elem;
            dui.setVnode(elem);
            dui.setData(elem,'NavMenu',{
                openonly:(typeof $(elem).attr('openonly')==="undefined"?false:true),//是否只打开一个
            },{});
            var submenus = $(that.elem).children(Selector.submenus),
            $jump = $(that.elem).find(Selector.jump),
            itemClick = function(e){
                $(that.elem).find(Selector.jump).removeClass(className.isActive);
                $(this).addClass(className.isActive);
            }
            
            data = elem.vnode.data.NavMenu;
            /**
             * 递归初始化元素的方法
             * @param {Array} list 要初始化的集合
             * @param {Integer} level 当前层级
             * @param {Boolean} openonly 是否只打开一个
             */
            var menuRender = function(list,level,openonly){
                var isOpen = false;//是否已经有一个打开了
                $.each(list,function(i,item){
                    var $item = $(item),$title = $item.children(Selector.submenusTitles),
                    nextMenu = $item.children(Selector.menus),//子菜单
                    open = $item.hasClass(className.isOpen) ? true : false,//是否是打开
                    show = function(){
                        if(open && !isOpen){
                            isOpen = true;
                            return true;
                        }else{
                            $item.removeClass(className.isOpen);
                            return false;
                        }
                    }();//判断是否显示下级菜单
                    $title[0].isOpen = open;
                    $title[0].transition = dui.collapseTransition(nextMenu[0])
                    $title[0].show = function(){
                        $title[0].transition.show();
                        $title[0].isOpen = true;
                        $title.parent().addClass('is-opened');
                    };
                    $title[0].hide = function(){
                        $title[0].transition.hide();
                        $title[0].isOpen = false;
                        $title.parent().removeClass('is-opened');
                    };
                    var titleClick = function(e){
                        e.stopPropagation();
                        var that = this,open = that.isOpen,
                        Others = $(that).parent().siblings().find(Selector.submenusTitles);
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
                    }; 
                    $title.off('click',titleClick).on('click',titleClick);
                    //继续下一级菜单
                    var children = nextMenu.children(Selector.submenus);
                    if(children){
                        menuRender(children,level+1,openonly);
                    }
                })
            };
            menuRender(submenus,1,data.openonly);
            //设置高亮事件
            $jump.off('click',itemClick).on('click',itemClick);
            return that;
        }
    }
    element.render = function(type,filter){
        var filter = function(){
            return filter ? ('[dui-filter="' + filter +'"]') : '';
        }(),
        Items = {
            NavMenu:function(){
                var menus = $(Selector.navMenus+filter);
                menus.each(function(i,menu){
                    menu.MenuObj = element('NavMenu',menu);
                })
            }
        }
        if(type){
            Items[type] ? Items[type]() : dui.error('不支持'+type+'元素渲染');
        }else{
            Object.keys(Items).forEach(function(key){
                Items[key]();
            })
        }
    }
    element.render();
    return element;
})