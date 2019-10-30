define('buildtable',['jquery','popup','form'],function($,popup,form){
    var thisTable,thisSearch;
    SELECTOR={
        search:'.dui-admin__search',
        searchField:'.dui-search__field',
        searchPopver:'.dui-search__field-popper',
        searchPopverItem:'.dui-dropdown-menu__item',

    },
    BuildTable={
        render:function(tableParam){
            // 设置当前table实例
            thisTable = tableParam;
            // 初始化搜索框
            thisSearch = new searchInput();
        }
    },
    searchInput = function(){
        var that = this;that.data={};
        var x = {top:'bottom','bottom':'top'};
        var ref = $(SELECTOR.search).find(SELECTOR.searchField);
        var pop = $(SELECTOR.search).find(SELECTOR.searchPopver);
        if(!pop[0]) return;
        that.popver = dui.addPopper(ref[0],pop[0],{
            onCreate:function(data){
                that.transition = dui.transition(pop[0],{
                    name:'dui-zoom-in-'+x[data._options.placement],
                    enter:function(el,done){
                        that.popver.updatePopper();
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
        that.visible = pop.css('display')=='none' ? true : false;
        var show = function(){
            that.visible =false;
            that.transition.show();
        };
        var hide = function(){
            that.visible =true;
            that.transition.hide();
        };
        ref.on('click',function(e){
            if(that.visible){
                show();
            }else{
                hide();
            }
        })
        // 关闭
        $(document).on('click',function(e){
            if(ref.find(e.target)[0] || pop.find(e.target)[0] || pop[0]==e.target || ref[0]==e.target){
                return;
            }
            hide();
        })
        // 选项点击事件
        pop.on('click',SELECTOR.searchPopverItem,function(e){
            var othis = $(this),field=othis.data('field'),
            placeholder = othis.data('placeholder'),
            title = othis.text();
            // 设置当前显示
            ref.find('span').text(title);
            // 设置字段
            $(SELECTOR.search).find('input[name="field"]').attr('value',field).val(field);
            // 设置提示
            $(SELECTOR.search).find('input[name="keyword"]').attr('placeholder',placeholder);
            // 关闭显示
            hide();
        })
        // 点击搜索按钮的时候
        $(SELECTOR.search).find('#search_btn').on('click',function(e){
            var field = $(SELECTOR.search).find('input[name="field"]').val();
            var value = $(SELECTOR.search).find('input[name="keyword"]').val();
            var where = {
                field:field,
                value:value
            }
            thisTable.search(where);
        })

    }
    return BuildTable;
})