define([], function() {
    var ecmf = {};

    function init() {

        //高空风功能加载
        require(['Function/ecmf/Wind'], function(wind){
            ecmf.wind = wind;
        })

        //气温等值线
        require(['Function/ecmf/Temperature'], function(tt){
            ecmf.tt = tt;
        })

        //海平面气压等值线
        require(['Function/ecmf/Pressure'], function(pr){
            ecmf.pr = pr;
        })

        //位势高度等值线
        require(['Function/ecmf/Geopotentialheight'], function(hh){
            ecmf.hh = hh;
        })

        //湿度等值面
        require(['Function/ecmf/Humidity'], function(rh){
            ecmf.rh = rh;
        })

        //降水等值面
        require(['Function/ecmf/Rain'], function(rain){
            ecmf.rn = rain;
        })

        //能见度
        require(['Function/ecmf/Visibility'], function(vis){
            ecmf.vis = vis;
        })


        //积冰
        require(['Function/ecmf/Ice'], function(ice){
            ecmf.ice = ice;
        })

        //颠簸
        require(['Function/ecmf/Turb'], function(turb){
            ecmf.turb = turb;
        })

        //云
        require(['Function/ecmf/Cloud'], function(cloud){
            ecmf.cloud = cloud;
        })


        //雷暴
        require(['Function/ecmf/Thunderstorm'], function(ts){
            ecmf.ts = ts;
        })
        //对流不稳定指数
        require(['Function/ecmf/CII'], function(cii){
            ecmf.cii = cii;
        })
        
    }

    /**
     * 开启某一功能
     * @param {*} type 功能类型（null时指全部）
     */
    function open(type){
        if(type) {
            if(ecmf[type])
            ecmf[type].open ? ecmf[type].open() : null;
        } else {
            for(var key in ecmf) {
                ecmf[key].open ? ecmf[key].open() : null;
            }
        }
    }

    /**
     * 关闭某一功能
     * @param {*} type 功能类型（null时指全部）
     */
    function close(type){
        if(type) {
            if(ecmf[type])
            ecmf[type].close ? ecmf[type].close() : null;
        } else {
            for(var key in ecmf) {
                ecmf[key].close ? ecmf[key].close() : null;
            }
        }
    }

    /**
     * 更新某一功能
     * @param {*} type 功能类型（null时指全部）
     */
    function update(type){
        if(type) {
            if(ecmf[type])
            ecmf[type].update ? ecmf[type].update() : null;
        } else {
            for(var key in ecmf) {
                ecmf[key].update ? ecmf[key].update() : null;
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