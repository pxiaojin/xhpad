 /*
             [parserColor 颜色转换为rgb格式]
             @param  {[String]} value [需要转换的颜色值]
             @return {[String]}       [返回转换后的颜色值,rgb(255,255,255)形式]
        */
 function parseColorRgb(value) {
     var str = "",
         vlen = value.length,
         rgb1 = "",
         rgb2 = "",
         rgb3 = "",
         colorObj = {
             "black": "rgb(0,0,0)",
             "red": "rgb(255,0,0)",
             "blue": "rgb(0,0,255)",
             "white": "rgb(255,255,255)",
             "yellow": "rgb(255,255,0)",
             "orange": "rgb(255,165,0)"
         };


     //输入的是rgb格式的
     //rgb(0,0,255)
     if (/rgb/.test(value)) {
         return value;
     } else if (/^#/.test(value)) { //输入的是#FFFFFF的格式
         //#00f
         if (vlen == 4) {
             //$&表示匹配到的本身,甚少看到这样的用法,这里可当做$0
             //str = value.replace(/[A-Za-z0-9]/g, "$&$&");
             str = value.replace(/[A-Za-z0-9]/g, "$0$0").substr(1, 6); //substr(1,6)去掉#
             alert(str);
         } else if (vlen == 7) {
             //#FF0000
             str = value.replace(/^#([A-Za-z0-9]*)/, "$1");
         } else {
             str = "FFFFFF";
         }
         //按长度划分后把三个数字取出来
         alert(str.substr(0, 2));
         //alert(parseInt(str.charAt(0), 16));
         rgb1 = parseInt(str.substr(0, 2), 16);
         rgb2 = parseInt(str.substr(2, 2), 16);
         rgb3 = parseInt(str.substr(4, 2), 16);
         return "rgb(" + rgb1 + "," + rgb2 + "," + rgb3 + ")";
     } else {
         //red,orange 
         value = value.toLowerCase();
         return colorObj[value] ? colorObj[value] : "rgb(255,255,255)"; //不匹配默认为白色
     }
 }


 /**
  * [parserColor 颜色转换为十六进制]
  * @param  {[String]} value [需要转换的颜色值]
  * @return {[String]}       [返回转换后的颜色值,#0000FF形式]
  */
 function parserColor(value) {
     var
         str = "",
         arr = [],
         arri = "",
         i = 0,
         vlen = value.length,
         colorObj = {
             "black": "000000",
             "red": "0000FF",
             "blue": "FF0000",
             "white": "FFFFFF",
             "yellow": "FFFF00",
             "orange": "FFA500"
         };


     //rgb(0,0,255)
     if (/rgb/.test(value)) {
         arr = value.match(/\d+/g);
         vlen = arr.length;
         for (; i < vlen; i++) {
             arri = parseInt(arr[i]);
             //转换为十六进制
             str += arri < 10 ? "0" + arri.toString(16) : arri.toString(16);
         }
     } else if (/^#/.test(value)) {
         //#00f
         if (vlen == 4) {
             str = value.replace(/[A-Za-z0-9]/g, "$&$&");
         } else if (vlen == 7) {
             //#FF0000
             str = value.replace(/^#([A-Za-z0-9]*)/, "$1");
         } else {
             str = "FFFFFF";
         }
     } else {
         //red/orange
         value = value.toLowerCase();
         str = colorObj[value] ? colorObj[value] : "FFFFFF"; //不匹配默认为白色
     }
     return "#" + str.toUpperCase();
 }