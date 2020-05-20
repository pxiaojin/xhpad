//-------------------单点及多点数据功能
define(['Function/point/Station',
        'Function/point/YXAirport',
        'Function/point/SinglePoint',
        'Function/point/MultiPoint'], function(station, airport, sp, mp) {
    var point = {};

    function init(){
        
        //------------------地面站及城镇
        point.station = station;

        //------------------机场信息
        point.airport = airport;

        //------------------地图单点鼠标操作
        point.single = sp;

        //------------------地图多点鼠标操作
        point.multi = mp;
        
        //------------------单点及多点鼠标操作(不使用的交互方式)
        // require(['Function/point/MouseOperation'], function(mo){
        //     point.mo = mo;
        // })
        
    }

    /**
     * 开启某一功能
     * @param {*} type 功能类型（null时指全部）
     */
    function open(type){
        if(type) {
            if(point[type])
            point[type].open ? point[type].open() : null;
        } else {
            for(var key in point) {
                point[key].open ? point[key].open() : null;
            }
        }
    }

    /**
     * 关闭某一功能
     * @param {*} type 功能类型（null时指全部）
     */
    function close(type){
        if(type) {
            if(point[type])
            point[type].close ? point[type].close() : null;
        } else {
            for(var key in point) {
                point[key].close ? point[key].close() : null;
            }
        }
    }

    return {
        init: init,
        open: open,
        close: close,
        sub: function(){
            return point;
        }
    }
});