dui.define(['jquery'],function(){
    var element = function(type,el,options){
        return  new element.Items[type](el,options);
    },
    Selector = {
        //navMenu
        navMenus:"[dui-menubar]",
        menus:".dui-menu",
        submenus:".dui-submenu",
        submenusTitles:".dui-submenu__title",
        jump:'.dui-menu-item',
        //dropDown
        dropDown:"[dui-dropdown]",
        dropDownToggle:".dui-dropdown-toggle",
        dropDownMenu:".dui-dropdown-menu",
    },
    className={
        isOpen:'is-open',
        isActive:'is-active',
    };
    element.Items = element.prototype = {
        navMenu:function(el,options){
            var that = this;
            that.elem = el;
            dui.setData(el,'navMenu',options);
            var submenus = $(that.elem).children(Selector.submenus),
            $jump = $(that.elem).find(Selector.jump),
            itemClick = function(e){
                $(that.elem).find(Selector.jump).removeClass(className.isActive);
                $(this).addClass(className.isActive);
            }
            data = el.vnode.data.navMenu;
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
                    $title[0].transition = dui.collapseTransition(nextMenu[0],{
                        show:show
                    })
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
            
        },
        dropDown:function(el,options){
            var that = this;that.options = $.extend(true,{},options);
            dui.setData(el,'dropDown',{},{});
            var data = el.vnode.data.dropDown;
            var x = {top:'bottom','bottom':'top'};
            var ref = $(el).find(Selector.dropDownToggle);
            var pop = $(el).find(Selector.dropDownMenu);
            that.popper = dui.popper(ref[0],pop[0])
            that.popper.onCreate(function(data){
                that.transition = dui.transition(pop[0],{
                    name:'dui-zoom-in-'+x[data._options.placement]
                });
            })
            that.popper.onUpdate(function(data){
                pop[0].vnode.data.transition.name = 'dui-zoom-in-'+x[data.placement];
            })
            ref.on('click',function(e){
                if(pop.css('display')=='none'){
                    that.transition.show();
                }else{
                    that.transition.hide();
                }
            })
        }
        
    }
    element.render = function(type,filter){
        var filter = function(){
            return filter ? ('[dui-filter="' + filter +'"]') : '';
        }(),
        Items = {
            navMenu:function(){
                $(Selector.navMenus+filter).each(function(i,el){
                    element('navMenu',el,{
                        openonly:(typeof $(el).attr('openonly')==="undefined"?false:true)
                    });
                })
            },
            dropDown:function(){
                $(Selector.dropDown+filter).each(function(i,el){
                    element('dropDown',el,{
                        
                    });
                })
            }
        }
        Items[type] ? Items[type]() : dui.each(Items,function(key,fn){
            fn();
        })
    }
    element.render();
    return element;
})