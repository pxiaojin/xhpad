//海洋总功能类
define([], function() {
    var sea = {};

    function init(){
        require(['Function/Sea/Pressure'], function(pr){
            sea.pr = pr;  //海平面气压
        })

        require(['Function/Sea/SeaT'], function(SeaT){
            sea.seat = SeaT;  //海温
        })

        require(['Function/Sea/SeaWave'], function(wave){
            sea.wave = wave;  //海浪方向及高度
        })

        require(['Function/Sea/SeaWind'], function(wind){
            sea.wind = wind;   //海面风场
        })

        require(['Function/Sea/SeaFlow'], function(flow){
            sea.flow = flow;   //海流
        })

        require(['Function/Sea/CoastRegionFC'], function(coastFC){
            sea.coastFC = coastFC;   //海区预报
        })

        //------------潮汐
        require(['Function/Sea/tideshtml'], function(tide){
            sea.tide = tide;   //浮标
        });
        require(['Function/Sea/water'], function(water){
            sea.water = water;   //陆地水文
        });
        // require(['Function/Sea/SeaWave2'], function(wave){
        //     sea.waveXX = wave;      //海浪方向及高度（非正式，测试流线类型
        // })
        require(['Function/Sea/Buoys'], function(buoys){
            sea.buoys = buoys;   //浮标
        });

        require(['Function/Sea/ShipMessage'], function(shipMessage){
            sea.shipMessage = shipMessage;  //船舶报
        });

        $('#sea_mixedGraph').click(function(){
            XHW.map.getView().animate(
                {center: ol.proj.transform([121.87,28.48], 'EPSG:4326', 'EPSG:3857'), zoom: 5});
        })
    }

    /**
     * 开启某一功能
     * @param {*} type 功能类型（null时指全部）
     */
    function open(type){
        if(type) {
            if(sea[type])
            sea[type].open ? sea[type].open() : null;
        } else {
            for(var key in sea) {
                sea[key].open ? sea[key].open() : null;
            }
        }
    }

    /**
     * 关闭某一功能
     * @param {*} type 功能类型（null时指全部）
     */
    function close(type){
        if(type) {
            if(sea[type])
            sea[type].close ? sea[type].close() : null;
        } else {
            for(var key in sea) {
                sea[key].close ? sea[key].close() : null;
            }
        }
    }

    /**
     * 更新某一功能
     * @param {*} type 功能类型（null时指全部）
     */
    function update(type){
        if(type) {
            if(sea[type])
            sea[type].update ? sea[type].update() : null;
        } else {
            for(var key in sea) {
                sea[key].update ? sea[key].update() : null;
            }
        }
    }

    
    return {
        init: init,
        open: open,
        close: close,
        update: update
    }
});