/**
 * 鼠标指针指向地图对象(现在以实现功能为打开弹窗)
 */
define(['Controller/DataFormat'], function(format) {
    var moveAtFeature;//记录现在指针所在feature，在地图上为null
    var callbacks;
    var popup;           //弹窗布局
    var overlay;        //地图弹窗对象

    function init(){
        popup = '<div id="popup_mouseMove"></div>';
        callbacks = {};

        XHW.map.on('pointermove', function(e) {
            if (e.dragging) { //指针拖动地图
                return;
            };
            var pixel = XHW.map.getEventPixel(e.originalEvent);
            var feature = XHW.map.forEachFeatureAtPixel(pixel, function(feature){
                    return feature;
            })
            if(feature != moveAtFeature){   //判断鼠标是否指向了新的feature
                if(feature) {               //鼠标指向目标
                    moveOnFeature(feature, e.coordinate);
                } else {                    //鼠标指向地图
                    moveOutFeature();
                }
            }

            //----------------ol地图坐标转换为经纬度
            // var lnglat = ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');   // lnglat 为 [lng, lat] 格式
            // var hdms = ol.coordinate.toStringHDMS(lnglat);                          // hdms 为（27° 15′ 17″ N 111° 10′ 54″ E）格式
            var lonlat = ol.proj.transform( e.coordinate ,'EPSG:3857' ,'EPSG:4326');
            let lnglat = format.lnglat(lonlat[0], lonlat[1]);  
            $('#jingWeiDuXinXi .jingWeiDuXinXiText').html(lnglat);
        });
    }

    init();

    /**
     * 鼠标指向新的feature
     * @param {*} feature 
     */
    function moveOnFeature(feature, coordinate){
        moveOutFeature();
        moveAtFeature = feature;
        if(feature.type) {
            //-------填充数据
            var html = callbacks[feature.type] ? callbacks[feature.type](feature.value) : '';
            //--------创建弹窗布局
            $('body').append(popup);
            //--------创建地图弹窗对象
            var container = document.getElementById('popup_mouseMove');
            container.innerHTML = html;
            if (!overlay) {
                overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
                    element: container,
                    autoPan: true,
                    position: feature.values_.geometry.flatCoordinates,     //--------设置弹窗位置  值为marker位置
                    positioning: 'bottom-left',         //--------默认左下角（设置下方居中无效，依靠样式自己设置）
                    autoPanAnimation: {
                        duration: 250   //当Popup超出地图边界时，为了Popup全部可见，地图移动的速度. 单位为毫秒（ms）
                    }
                }));
            }
            overlay.setElement(container);
            // overlay.setPosition(feature.values_.geometry.flatCoordinates);
            overlay.setPosition(coordinate);             
            //-------打开弹窗
            XHW.map.addOverlay(overlay);
        }
    }

    /**
     * 鼠标移出旧的feature
     */
    function moveOutFeature(){
        moveAtFeature = null;
        //-------------关闭弹窗
        XHW.map.removeOverlay(overlay);
    }

    function addCallback(key, callback){
        callbacks[key] = callback;
    }

    return {
        init: init,
        addCallback: addCallback,
        moveOnFeature: moveOnFeature,
        moveOutFeature:moveOutFeature
    }
});