import $ from "jquery";
var DROPDOWN='[dui-dropdown]',
MENU='[dui-menubar]',
$doc = $(document);
function element(type,only){
    return element.render(type,only);
}
/**
 * 手动渲染
 */
element.render = function(type,only){
    var items = {
        dorpDown:function(){
            if(only && only.nodeType){
                only.DropDown = new DropDown(only);
            }else{
                $doc.find(DROPDOWN).each(function(i,drp){
                    drp.DropDown = new DropDown(drp);
                })
            }
        },
        NavMenu:function(){
            if(only && only.nodeType){
                only.NavMenu = new NavMenu(only);
            }else{
                $doc.find(MENU).each(function(i,menu){
                    menu.NavMenu = new NavMenu(menu);
                })
            }
        }
    };
    type ? (items[type] && items[type]()) :
    ($.each(items,function(i,item){
        item();  
    }))
}
/**
 * dorpdown渲染方法
 */
element.dropdown = function(el,options){
    return new DropDown(el,options);
};
element.navmenu = function(el,options){
    return new NavMenu(el,options);
}
/**
 * 初始化一个DropDown
 * @param {Element} el 初始化元素
 * @param {Object} options 初始化参数
 */
function DropDown(el,options){
    var that = this;
    if(el.dorpInit) return;
    var TOGGLE='.dui-dropdown-toggle',//触发按钮
    DROPMENU='.dui-dropdown-menu';//显示的菜单
    var config = that.config = $.extend(true,{},options);
    var x = {top:'bottom','bottom':'top'};
    var ref = $(el).find(TOGGLE);
    var pop = $(el).find(DROPMENU);
    // 创建popper
    that.popper = dui.addPopper(ref[0],pop[0],{
        onCreate:function(data){
            that.transition = dui.transition(pop[0],{
                name:'dui-zoom-in-'+x[data._options.placement],
                enter:function(TCLASS,done){
                    that.popper.updatePopper();
                    setTimeout(function(){
                        done();
                    }, 300);
                }
            });
        },
        onUpdate:function(data){
            that.transition.config.name = 'dui-zoom-in-'+x[data.placement];
        }
    })
    that.toggle  = ref.attr('toggle')=='hover' ? 'hover' : 'click';
    that.showTimeout = config.showTimeout || 0;
    that.hideTimeout = config.hideTimeout || 150;
    that.timerout=0;
    // 显示方法
    var show = function(e){
        clearTimeout(that.timerout);
        if(pop.css('display')!=='none'){
            return;
        }else{
            that.timerout = setTimeout(function(){
                that.visible =false;
                that.transition.show();
            },(that.toggle==='hover'?that.showTimeout:0))
        }
    };
    // 隐藏方法
    var hide = function(e){
        clearTimeout(that.timerout);
        that.timerout = setTimeout(function(){
            that.visible =true;
            that.transition.hide();
        },(that.toggle==='hover'?that.hideTimeout:0))
    };
    if(that.toggle==='hover'){
        ref.hover(show,hide);
        pop.hover(show,hide);
    }else{
        ref.on('click',function(e){
            if(pop.css('display')==='none'){
                show();
            }else{
                hide();
            }
        })
    }
    // 设置初始化标识
    el.dorpInit = true;
    // 设置点击关闭事件
    $doc.on('click',function(e){
        var othis = e.target;
        if(!(el==othis || $(el).find(othis)[0] || pop.css('display')==='none')){
            hide();
        }
    })
}
/**
 * 初始化一个DropDown
 * @param {Element} el 初始化元素
 * @param {Object} options 初始化参数
 */
function NavMenu(el,options){
    if(el.menuInit) return;
    var that = this,
    SUBMENU = '.dui-submenu',
    MENUCLASS ='.dui-menu',
    SUBTITLE = '.dui-submenu__title',
    ISOPEN='is-opened',
    MENUITEM='.dui-menu-item',
    ISACTIVE='is-active',
    // 配置信息
    config = that.config =$.extend(true,{},options),
    // 下级菜单
    $submenus = $(el).children(SUBMENU),
    // 是否是只打开一个
    openOnly = typeof $(el).attr('openonly') !=="undefined" ? true : false;
    // 添加过渡动画
    renderTransition($submenus);
    /**
     * 检查openOnly方法
     * @param {ELement} list 子菜单集合
     */
    function renderTransition(list){
        var open = false;
        $.each(list,function(i,item){
            var $menu = $(item).children(MENUCLASS);
            // 如果配置了只能打开一个菜单
            if(openOnly){
                if(open && $menu.css('display')!=='none'){
                    $menu.css('display','none');
                    if($(item).hasClass(ISOPEN)){
                        $(item).removeClass(ISOPEN);
                    }
                }else{
                    if($menu.css('display')!=='none'){
                        open = true;
                        if(!$(item).hasClass(ISOPEN)){
                            $(item).addClass(ISOPEN);
                        }
                    }else{
                        if($(item).hasClass(ISOPEN)){
                            $(item).removeClass(ISOPEN);
                        }
                    }
                }
            }else{
                // 如果菜单显示，但是没有is-opened样式则添加该样式
                if($menu.css('display')!=='none' && !$(item).hasClass(ISOPEN)){
                    $(item).addClass(ISOPEN)
                }
                if($menu.css('display')=='none' && $(item).hasClass(ISOPEN)){
                    $(item).removeClass(ISOPEN)
                }
            }
            if($(item).children(SUBMENU).length>0){
                checkOpen($(item).children(SUBMENU));
            }
            // 添加过渡
            $menu[0].transition = dui.collapseTransition($menu[0]);
        })
    }
    // 给子菜单添加点击事件
    $(el).find(SUBTITLE).on('click',function(e){
        var othis = $(this);
        if(el.events && el.events.beforeOpen){
            dui.trigger.call(this,'beforeOpen',done);
        }else{
            done();
        }
        function done(){
            var $nextMenu = othis.next(MENUCLASS),
            transition = $nextMenu[0].transition,
            others = othis.parent().siblings().children(MENUCLASS);
            if($nextMenu.css('display')==='none'){
                transition.show();
                if(openOnly){
                    others.each(function(i,m){
                        if($(m).css('display')!=='none'){
                            m.transition.hide();
                        }
                    })
                }
            }else{
                transition.hide();
            }
        }
    })
    // 连接被点击
    $(el).find(MENUITEM).on('click',function(e){
        var othis = $(this);
        if(el.events && el.events.beforeJump){
            dui.trigger.call(this,'beforeJump',done);
        }else{
            done();
        }
        function done(){
            othis.addClass(ISACTIVE).siblings().removeClass(ISACTIVE);
            othis.parents(MENUCLASS).prev(SUBTITLE).addClass(ISACTIVE);
            othis.parents(SUBMENU).siblings().children(SUBTITLE).removeClass(ISACTIVE);
            othis.parents(SUBMENU).siblings().find(MENUITEM).removeClass(ISACTIVE);
        }
    })
    // 设置初始化状态
    el.menuInit = true;
}
// 触发渲染
element.render();
export default element;