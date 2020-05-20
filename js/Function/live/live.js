define([], function() {
    var live = {};

    function init() {

        //气温等值线
        require(['Function/live/Temperature'], function(tt){
            live.tt = tt;
        })
        
        // //高空风功能加载
        // require(['Function/live/Wind'], function(wind){
        //     live.wind = wind;
        // })
        
        //海平面气压等值线
        require(['Function/live/Pressure'], function(pr){
            live.pr = pr;
        })
        
        //海平面气压等值线
        require(['Function/live/GeoPotentialheight'], function(hh){
            live.hh = hh;
        })

        //湿度等值面
        require(['Function/live/Humidity'], function(rh){
            live.rh = rh;
        })

        //降水等值面
        require(['Function/live/Rain'], function(rain){
            live.rn = rain;
        })

        require(['Function/live/StationLabelDrawer'], function(stationLabel){
            live.stationLabel = stationLabel;
            stationLabel.init();
        })

        require(['Function/live/AirQualityIndex'], function(aqi){
            live.aqi = aqi;
        })

        require(['Function/live/lighting_position'], function(lighting){
            live.lighting = lighting;
        })
    }

    /**
     * 开启某一功能
     * @param {*} type 功能类型（null时指全部）
     */
    function open(type){
        if(type) {
            if(live[type])
            live[type].open ? live[type].open() : null;
        } else {
            for(var key in live) {
                live[key].open ? live[key].open() : null;
            }
        }
    }

    /**
     * 关闭某一功能
     * @param {*} type 功能类型（null时指全部）
     */
    function close(type){
        if(type) {
            if(live[type])
            live[type].close ? live[type].close() : null;
        } else {
            for(var key in live) {
                live[key].close ? live[key].close() : null;
            }
        }
    }

    /**
     * 更新某一功能
     * @param {*} type 功能类型（null时指全部）
     */
    function update(type){
        if(type) {
            if(live[type])
            live[type].update ? live[type].update() : null;
        } else {
            for(var key in live) {
                live[key].update ? live[key].update() : null;
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