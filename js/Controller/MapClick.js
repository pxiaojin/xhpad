/**
 * 地图点击事件
 */
define(['./layout','./MouseMoveAtFeature'], function(e,move) {
    var clickAtFeature;//记录现在指针所在feature，在地图上为null
    var callbacks;
    var getRightMenu = e.getRightMenu;

    function init(){
        callbacks = {
            map:[],
        };

        XHW.map.on('click', function(e) {
            //----------------ol地图坐标转换为经纬度
            var lnglat = ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');    //lnglat 为 [lng, lat] 格式
            var hdms = ol.coordinate.toStringHDMS(lnglat);                           //hdms 为（27° 15′ 17″ N 111° 10′ 54″ E）格式

            var pixel = XHW.map.getEventPixel(e.originalEvent);
            var feature = XHW.map.forEachFeatureAtPixel(pixel, function(feature){       //获取点击的对象（如果是地图本身，则为空）
                    return feature;
            })

            if(feature) {               //鼠标指向目标
                $('#css_animation').hide();
                if(feature != clickAtFeature || getRightMenu){   //判断鼠标是否指向了新的feature    防止重复点击
                    clickFeature(feature);
                    
                    if(feature.type == 'typhoon' || feature.type == 'danger_routePoint' || feature.type == 'ww_warn'){
                        move.moveOnFeature(feature, e.coordinate);
                    }else{
                        move.moveOutFeature();
                    }
                    // 在位置天气和城镇天气的功能里，点在其他图层上也可以触发任意点的事件 
                    if($('#pos_mixedGraph').hasClass('active') && feature.type != 'guanzhuMark'){
                        clickMap(lnglat);
                    }
                    if($('#city_station').hasClass('active')){
                        clickMap(lnglat);
                    }
                }
            } else {                    //鼠标指向地图
                clickMap(lnglat);
                move.moveOutFeature();
                clickAtFeature = null;
            }
        });
    }

    init();

    /**
     * 鼠标指向新的feature
     * @param {*} feature 
     */
    function clickFeature(feature){
        if(clickAtFeature) {
            clickAtFeature = null;
        }
        clickAtFeature = feature;
        if(feature.type) {
            callbacks[feature.type] ? callbacks[feature.type](feature.value) : null;
        }
    }

    /**
     * 鼠标点击地图
     */
    function clickMap(lnglat){
        if(lnglat) {
            //点击地图并选中地图某点
            for(var key in callbacks.map) {
                callbacks.map[key] ? callbacks.map[key](lnglat) : null;
            }
        } else {
            //点击地图执行取消操作
        }
    }

    function addCallback(key, callback){
        if(key == 'map' || key == 'map' ) {
            callbacks['map'].push(callback);
        } else {
            callbacks[key] = callback;
        }
    }

    return {
        init: init,
        addCallback: addCallback
    }
});