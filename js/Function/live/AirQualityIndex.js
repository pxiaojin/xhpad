//实况 空气质量指数 分布图(pm2.5指数)
define(['Controller/DataFormat'], function(format) {
    var key;
    var type;
    var item;
    var legend;

    var button;     //功能开关按钮
    var layer;      //功能图层
    var layerPm;
    var data;       //城镇气象数据（按分级记录，站点、站名、经纬度、天气信息）

    function init(){
        button = $('#city_station');
        button.click(function(){
            if(!button.hasClass('currenterJiBtn')) {
                open();
            } else {
                close();
            }
        });

        //层级缩放监听
        // XHW.C.MapMove.addZoomCallback(function(){
        //     if(button.hasClass('currenterJiBtn')) getData();
        // });

        //时间轴变化监听
        timeBar.addCallback(function(){
            if(button.hasClass('currenterJiBtn')) getData();
        });

        type = key = 'live_aq';
        legend ='<p class="tuCengP">空气质量</p>' + 
                '<img src="img/legend/aq_live.png" alt="" />';
        item = XHW.C.layerC.createItem('', legend, function(){
            close();
        })
    }

    init();

    function getData(){
        // http://weather1.xinhong.net/stationdata_surf/aqidistriblist?dlevel=1
        var zoom = XHW.map.getView().getZoom();
        zoom = zoom < 6 ? 1 :
                zoom < 8 ? 2 : 3;
        // var time = XHW.silderTime;
        // var param = {
        //     year: time.year,
        //     month: time.month,
        //     day: time.day,
        //     hour: time.hour,
        //     dlevel: zoom
        // };
        var time = timeBar.getRequestTime().split('-');
        var year = time[0];
        var month = time[1];
        var day = time[2];
        var hour = time[3];
        var param = {
            year: year,
            month: month,
            day: day,
            hour: hour,
            dlevel: zoom
        }
        XHW.C.http.get(XHW.C.http.weatherUrl, '/stationdata_surf/aqidistriblist', param, function(json){
            time = format.jsonDate(json.time);
            item.htmlLayer = time[0] + ' 空气质量指数';
            XHW.C.layerC.updateLayerData(key, item);
            
            data = json.data.array;
            drawStationMarkers();
        }, function(){
            item.htmlLayer = Number(param['month']) + '月' + Number(param['day']) + '日 ' + param['hour'] + ':00 ' + ' 空气质量指数' + '(无数据)';
            XHW.C.layerC.updateLayerData(key, item);
            remove();
        });


        // 空气质量趋势图
        var curUrl = 'http://weather1.xinhong.net/jppm2dot5fc/info?year=' + year + '&month=' + month + '&day=' + day + '&hour=' + hour;
        $.ajax({
            type: "POST",
            url: curUrl,
            // data: request,
            success: function (data) {
                draw(data);
                $('.tuLiAq').show();
            },
            complete: function (data) {
            },
            dataType: "json"
        });
    }

    //   画空气质量填图
    function draw(data) {
        if (data.status_code != 0) {
            console.log("数据错误");
            return;
        }
        var timepar = timeBar.getRequestTime().split('-').join('')+'00';
        var data = data.data;
        // var hour = XHW.silderTime.hour;
        // var time = year + toTwo(XHW.silderTime.month) + toTwo(XHW.silderTime.day) + toTwo(XHW.silderTime.hour) + '00';
        // var timePrevice = year + toTwo(XHW.silderTime.month) + toTwo(XHW.silderTime.day) + toTwo(XHW.silderTime.hour + 1) + '00';
        // var timeDown = year + toTwo(XHW.silderTime.month) + toTwo(XHW.silderTime.day) + toTwo(XHW.silderTime.hour - 1) + '00';
        for (var i = 0; i < data.length; i++) {

            if (timepar == data[i].date) {
                var imageData = data[i];
                var slat = imageData.slat;
                var slng = imageData.slng;
                var elat = imageData.elat;
                var elng = imageData.elng;
                var start = ol.proj.fromLonLat([slng, slat]);
                var end = ol.proj.fromLonLat([elng, elat]);
                var extent = [start[0], start[1], end[0], end[1]];

                let source = new ol.source.ImageStatic({
                    url: "http://weather1.xinhong.net" + imageData.url,
                    imageExtent: extent
                });

                if (!layerPm) {
                    layerPm = new ol.layer.Image({

                    });
                    layerPm.setZIndex(5);
                    layerPm.id = key;
                }
                layerPm.setSource(source);
                layerPm.setOpacity(0.5);
                if ($.inArray(layerPm, XHW.map.getLayers().getArray()) == -1)
                    XHW.map.addLayer(layerPm);
            }
        }        
    }

    /**
     * 显示空气质量指数
     */
    function drawStationMarkers(){
        var markers = [];
        for(var i = 0; i < data.length; i++) {
            //data : [0: 编号？,1: lat,2: lng,3: 分级,4: 值]
            var marker = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(data[i][2]), parseFloat(data[i][1])]))
            })

            marker.type = type;
            // marker.value = {
            //     code: data[i].code,
            //     name: data[i].name,
            //     lng: data[i].lng,
            //     lat: data[i].lat,
            // }

            marker.setStyle( new ol.style.Style({
                text: new ol.style.Text({ 
                    textAlign: "center",
                    textBaseline: "middle",
                    font: '12px Normal Arial',                               
                    text: data[i][4],
                    fill: new ol.style.Fill({    //文字填充色
                        color: getColorText(data[i][4]),
                    }),
                    backgroundStroke:new ol.style.Stroke({
                        color:getColorStr(data[i][4]),
                        width:1,
                    }),
                    //标签的背景填充
                    backgroundFill:new ol.style.Fill({
                        color:getColorStr(data[i][4]),
                    }),
                }),   
            }));

            markers.push(marker);
        }

        // var tlayer = new ol.layer.Vector({
        //     source: new ol.source.Vector({
        //         features: markers
        //     })
        // });
        // tlayer.setZIndex(15);
        // XHW.map.addLayer(tlayer);

        //step6------------------将所有marker加入同一个图层
        let source = new ol.source.Vector({
            features: markers
        });

        if (!layer) {
            layer = new ol.layer.Vector({
            
            });
            layer.setZIndex(15);
            layer.id = key;
        }
        layer.setSource(source);
        if ($.inArray(layer, XHW.map.getLayers().getArray()) == -1)
        XHW.map.addLayer(layer);

        // if(layer) {
        //     remove();
        // }
        // layer = tlayer;
    }

    function getColorText(value) {
        if (value <= 100) 
            return '#333333';
         else  
            return '#ffffff'; 
    }

    function getColorStr(value) {
        if (value <= 50){
            return '#00E400';
        } else if (value <= 100) {
            return '#FFFF00';
        } else if (value <= 150) {
            return '#FF7E00';
        } else if (value <= 200) {
            return '#FF0000';
        }
         else if (value <= 300) {
            return '#99004C';
        }
         else if (value <= 500) {
            return '#7E0023';
        }
    }

    /**
     * 删除图层
     */
    function remove(){
        XHW.map.removeLayer(layer);
        XHW.map.removeLayer(layerPm);
    }

    function open(){
        item.htmlLayer = '空气质量';
        //---------添加图层控制
        var b = XHW.C.layerC.addLayer(key, item);
        if(!b) {
            close();
            return;
        }
        //---------添加按钮选中样式
        button.addClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrc'));
		XHW.C.layout.judgeWhetherSelect(button);

        getData();
    }

    function close(){
        //---------删除图层控制
        XHW.C.layerC.removeLayer(key);

        //---------取消按钮选中样式
        button.removeClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrcpri'));
		XHW.C.layout.judgeWhetherSelect(button);

        remove();
    }

    return {
        close: close
    }

});