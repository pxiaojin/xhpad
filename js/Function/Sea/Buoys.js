define(['Controller/Http',
    'Controller/layout',
    'Controller/DataFormat',
    'Controller/CrossSection',
    'lib/echarts', 
    'Function/Sea/Buoy'], function(http, layout, format, cross, echarts, buoy){

    var key;
    var type;
    var item;

    var button;     //功能开关按钮
    var isOpen = false;
    var layer;      //功能图层
    var data;       //城镇气象数据（按分级记录，站点、站名、经纬度、天气信息）
    var argodata;

    function init(){
        button = $('#ocean_buoy');
        button.click(function(){
            if(!isOpen) {
                open();
            } else {
                close();
            }
        });

        //层级缩放监听
        XHW.C.MapMove.addZoomCallback(function(){
            if(isOpen) getData();
        });

        //时间轴变化监听
        // sliderBar.addCallback(function(){
        //     if(isOpen) getData();
        // });

        type = key = 'ocean_buoy';
        item = XHW.C.layerC.createItem('浮标资料显示', '', function(){
            close();
        })

        //------------鼠标指向marker的监听
        XHW.C.mouse.addCallback(type, function(value){
            return getPopupHtml(value);
        });

        XHW.C.mapclick.addCallback(type, function(value){
            // search.queryStation(value.code, value.name);
            setVisible(value.cid, false);
            buoy.showBuoyBy(value.cid, new function(){
                setVisible(value.cid, true);
            });
        })
    }

    init();

    function getData(){
        var zoom = XHW.map.getView().getZoom();
        var time = XHW.silderTime;
        var param = '?year=' + time.year 
          + '&month=' + time.month + '&day=' + time.day +'&hour=' + time.hour;
        
        //    http://192.6.1.21:7018/argo/pointdata?year=2019&month=08&day=19
        $.ajax({
            url: XHW.C.http.buoyUrl + '/argo/pointdata' + param,
            dataType: 'json',
            success: function (res) {
                if(res.status_code != 0) {
                    return;
                }
                argodata = res.data; 
            }
        });

        //https://ocean.xinhong.net/gtspp/pointdata
        XHW.C.http.oceanHttp('/gtspp/pointdata', param, function(data, time){
            item.time = time;
            XHW.C.layerC.updateLayerData(key, item);
            collating(data)
        },function(){
            item.htmlLayer = '浮标资料显示(无数据)';
            XHW.C.layerC.updateLayerData(key, item);
            remove();
        })
    }

    function setVisible(cid, visible) {
        if (markers) {
            for (let i = 0; i < markers.length; i++) {
                if (markers[i] && markers[i].value && markers[i].value.cid && markers[i].value.cid == cid) {
                    // markers[i].style == markNoneStyle ? style : markNoneStyle
                }
            }
        }
    }

    /**
     * 整理数据
     * @param {*} rawData 原始数据
     */
    function collating(rawData){
        if (argodata) {
            $.extend(rawData, argodata);
        }
        var buoyMap = {};

        for(let key in rawData){
            let buoyStationData = {};
            buoyStationData.num = key;
            buoyStationData.lng = rawData[key].lng;
            buoyStationData.lat = rawData[key].lat;
            var cid = rawData[key].cid;
            var buoyStationDataList = buoyMap[cid];
            if (!buoyStationDataList) {
                buoyStationDataList = [];
                buoyMap[cid] = buoyStationDataList;
            }
            buoyStationDataList.push(buoyStationData);
        }
        data = buoyMap;
        drawBuoyMarkers();
    }

    var markers = [];
    /**
     * 绘制浮标
     */
    function drawBuoyMarkers(){
        markers = [];
        
        for(var cid in data){  
            var buoyStationDataList = data[cid];
            if(buoyStationDataList && buoyStationDataList.length > 0) {
                let buoyStationData = buoyStationDataList[buoyStationDataList.length-1];
                var lng = buoyStationData.lng;
                var lat = buoyStationData.lat; 
                
                var mark = buildFeature(cid, lng, lat);
                markers.push(mark);
            }
        }

        let source = new ol.source.Vector({
            features: markers
        });

        if (!layer) {
            layer = new ol.layer.Vector({
                
            });
            layer.setZIndex(15);
            layer.id = 'ocean_buoy';
        }
        layer.setSource(source);
        
        if ($.inArray(layer, XHW.map.getLayers().getArray()) == -1)
        XHW.map.addLayer(layer);

        // var tlayer = new ol.layer.Vector({
        //     source: new ol.source.Vector({
        //         features: markers
        //     })
        // });
        // XHW.map.addLayer(tlayer);

        // if(layer) {
        //     remove();
        // }
        // layer = tlayer;
    }
    
    var markStyle = new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 1],
          src: 'img/sea/buoy_label.png',
          scale: 0.8
        })
    });
    var markNoneStyle = new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 1],
          src: 'img/sea/buoy_label.png',
          scale: 0
        })
    });
    function buildFeature(cid, lng, lat) {
        var lonlat = ol.proj.fromLonLat([parseFloat(lng), parseFloat(lat)]);
        var feature = new ol.Feature({
            geometry:new ol.geom.Point(lonlat),
            name: cid
        });
        feature.setStyle(markStyle);
        feature.type = type;
        feature.value = {
            cid: cid,
            lng: lng,
            lat: lat
        }
        return feature;
    }

    /**
     * 根据值返回浮动框
     * @param {*} value 
     */
    function getPopupHtml(value){
        var lng = value['lng'];
        var lat = value['lat'];
        var name = value['cid'];
        var html = '<div style="position:absolute;left:-30px;bottom:12px;' 
                            + 'background:rgba(0,0,0,0.5);padding:2px;border-radius:2px;color:#ffffff;width: max-content">'
                        +'<h1 style="font-size:12px;margin:5px 0;">' + name + '</h1>'
                        +'<h2 style="font-size:12px;margin:5px 0;">' + lat + ", " + lng + '</h2>'
                    +'</div>';
        return html;
    }

    /**
     * 删除图层
     */
    function remove(){
        if (layer) {
            XHW.map.removeLayer(layer);
            layer = null;
        }
    }

    function open(){
        var b = XHW.C.layerC.addLayer(key, item);
        if(!b) {
            close();
            return;
        }
        button.parent().addClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrc'));
		XHW.C.layout.judgeWhetherSelect(button);
        getData();
        isOpen = true;
    }

    function close(){
        button.parent().removeClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrcpri'));
        if (buoy && buoy.close)
            buoy.close();
		XHW.C.layout.judgeWhetherSelect(button);
        remove();
        isOpen = false;
        XHW.C.layerC.removeLayer(key);
    }

    return {
        close: close
    }
});