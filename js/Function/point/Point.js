//-------------------单点及多点数据功能
define(['Function/point/Station',
        'Function/point/Airport',
        'Function/point/SinglePoint',
        'Function/point/MultiPoint',
        'Function/point/custom_route',
        'Function/point/civil_route',
        'Function/point/weather_warn',
        // 'Function/point/real_halfHour'], function(station, airport, sp, mp, ww, rhh) {
        'Function/point/real_halfHour'], function(station, airport, sp, mp, cr, ci, ww, rhh) {
    var point = {};

    function init(){
        
        //------------------地面站及城镇
        point.station = station;

        //------------------机场信息
        point.airport = airport;

        // ------------------地图单点鼠标操作
        point.single = sp;

        //------------------地图多点鼠标操作
        point.multi = mp;

        // -------------------自定义航线信息
        point.cr = cr;
        point.cr.init();

        // ------------------固定航线
        point.ci = ci;
        point.ci.init();
        //----------------地面实况半小时
        point.rhh = rhh;

        //----------------实况预警
        point.ww = ww;
        
        //------------------单点及多点鼠标操作(不使用的交互方式)
        // require(['Function/point/MouseOperation'], function(mo){
        //     point.mo = mo;
        // })
        
        $('#pos_mixedGraph').click(function(){   
            open('rhh');
            open('ww');          
        })
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