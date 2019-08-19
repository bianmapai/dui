import { dui } from "./loadjs";
function transition(elem,options){
    return transition.fn.init(elem,options);
}
transition.prototype = transition.fn =  {
    init:function(elem,options){
        var that = this,
        /**
         * 显示方法
         */
        showFunction = function(){

        },
        /**
         * 隐藏方法
         */
        hideFunction = function(){

        };
        that.config = dui.extend(true,{},{
            name:'face',
            beforeEnter:'',//进入前
            enter:'',//当与 CSS 结合使用时
            afterEnter:'',//过渡后回调
            enterCancelled:'',//取消过渡回调
            beforeLeave:'',//离开前回调
            leave:'',//当与 CSS 结合使用时
            afterLeave:'',//离开之后回调
            leaveCancelled:'',//取消的时候回调
            show:false,//默认是否显示
        },options);
        that.status = dui.extend(true,{},that.config).show;
        //如果当前状态
        if(that.config.show===false){
            dui.setStyle(elem,'display','none');
        }
        //设置样式
        





        //显示或者隐藏监听
        dui.watch(that,'status',function(pop,action,newData){
            if(newData===true){
                showFunction();
            }else{
                hideFunction();
            }
        },1,true);
        //监听名字发生变化
        dui.watch(that.config,'name',function(pop,action,newData){
            
        },1,true);
        return that;
    },
    show:function(){
        that.config.show = true;
    },
    hide:function(){
        that.config.show = false;
    }
}
export default transition;