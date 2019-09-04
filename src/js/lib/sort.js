export default function(obj, key, desc){
    var clone = JSON.parse(
      JSON.stringify(obj || [])
    );
    if(!key) return clone;
    //如果是数字，按大小排序，如果是非数字，按字典序排序
    clone.sort(function(o1, o2){
      var isNum = /^-?\d+$/
      ,v1 = o1[key]
      ,v2 = o2[key];
      
      if(isNum.test(v1)) v1 = parseFloat(v1);
      if(isNum.test(v2)) v2 = parseFloat(v2);
      
      if(v1 && !v2){
        return 1;
      } else if(!v1 && v2){
        return -1;
      }
        
      if(v1 > v2){
        return 1;
      } else if (v1 < v2) {
        return -1;
      } else {
        return 0;
      }
    });
    desc && clone.reverse(); //倒序
    return clone;
  };