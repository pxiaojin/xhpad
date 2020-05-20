/**
 * 风羽绘制类
 */
define([], function() {
   
    /**
     * 绘制风羽
     * @param {*} data 风向数据
     * @param {*} dataS  风速数据
     */
    function drawWindPlume(data, dataS){
        //step*---------------查看两组数据是否齐全
        if(!data || !dataS) {
            return;
        }
        //step1---------------箭头所在数组
        var markers = [];
        //step2---------------获取屏幕显示范围(地图本身疑似做过优化)
        //step3---------------根据屏幕显示范围获取循环起始结束位置

        //step4---------------根据地图层级决定箭头疏密程度
        var zoom = XHW.map.getView().getZoom();
        var delta = getDelta(zoom) * 5;     //数据间隔为0.2经纬度 乘5转为1经纬度
        //step5---------------循环绘制箭头
        var vals = data.vals;
        for(var i = 0; i < vals.length; i += delta) {  //row循环 lng+
            var lng = data.slng + i * data.delta;
            for(var j = 0; j < vals[i].length; j += delta) { //col循环 lat+
                if(!vals[i][j] && vals[i][j] != 0) {    //如果值为空并且值不为0，则不绘制（无数据） 
                    continue;
                }
                var lat = data.slat + j * data.delta;
                var marker = new ol.Feature({
                    geometry:new ol.geom.Point(ol.proj.fromLonLat([lng, lat])), 
                })

                var imgSrc = getImage(dataS[i][j]);
                marker.setStyle(new ol.style.Style({       
                    image: new ol.style.Icon({
                        rotation: vals[i][j] * Math.PI / 180,    //旋转（弧度？ wd * Math.PI / 180
                        // anchor: 'anonymous',
                        // duration: 2000,
                        src: imgSrc
                    })
                }));
                markers.push(marker);
            }
        }
        
        //step6------------------将所有marker加入同一个图层
        var layer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: markers
            })
        });
        
        return layer;
    }

    /**
     * 根据zoom获取间距
     * @param {} zoom 
     */
    function getDelta(zoom){
        var delta = zoom > 6 ? 1 :
                    zoom > 5 ? 2 :
                    zoom > 4 ? 4 : 6;
        return delta;
    }

    /**
     * 获取图片地址
     * @param {*} ws 
     */
    function getImage(ws) {
        ws = (ws / 2) >> 0;
        ws = ws * 2;
       
        ws = ws > 72 ? 72 : ws;
        ws = ws < 1 ? 1 : ws;
        ws = ws < 10 ? '0' + ws : ws;
        return 'img/imgs/icon_ws' + ws + '@2x.png';
    }

    return {
        drawWindPlume : drawWindPlume
    }
});