//船舶报
define(['Controller/DataFormat'], function(format) {
    var key;
    var type;
    var item;

    var button;     //功能开关按钮
    var layer;      //功能图层
    var data;       //数据列表

    function init(){
        button = $('#sea_ship');
        button.click(function(){
            if(!button.parent().hasClass('currenterJiBtn')) {
                open();
            } else {
                close();
            }
        });

        //层级缩放监听
        XHW.C.MapMove.addZoomCallback(function(){
            // if(button.parent().hasClass('currenterJiBtn')) getData();
        });

        //时间轴变化监听
        // sliderBar.addCallback(function(){
        //     if(button.parent().hasClass('currenterJiBtn')) getData();
        // });

        type = key = 'sea_ship_message';
        item = XHW.C.layerC.createItem('', '', function(){
            close();
        })

        //------------鼠标指向marker的监听
        XHW.C.mouse.addCallback(type, function(value){
            return getPopupHtml(value);
        });

        XHW.C.mapclick.addCallback(type, function(value){
            console.log(value);            
        })
    }

    init();

    function getData(){
        // https://weather.xinhong.net/xhweatherfcsys/shipdata/allData?hour=18  船舶当前时刻资料
        // https://weather.xinhong.net/xhweatherfcsys/shipdata/allStations?hour=18  船舶当前时刻站点
        // https://weather.xinhong.net/xhweatherfcsys/shipdata/datafromcode?code=14905&hour=14 根据站点获取船舶资料
        var time = XHW.silderTime;
        var param = {
            year: time.year,
            month: time.month,
            day: time.day,
            hour: time.hour
        };
        XHW.C.http.get(XHW.C.http.weatherUrl, '/shipdata/allData', param, function(json){
            time = format.jsonDate(json.time);
            item.htmlLayer = time[0] + ' 船舶报';
            XHW.C.layerC.updateLayerData(key, item);
            data = json.data;
            drawShipLocation(time)
        }, function(){
            item.htmlLayer = Number(param['month']) + '月' + Number(param['day']) + '日 ' + param['hour'] + ':00 ' + ' 船舶报' + '(无数据)';
            XHW.C.layerC.updateLayerData(key, item);
            remove();
        });
    }

    /**
     * 显示船舶位置信息
     */
    function drawShipLocation(time){
        var markers = [];
        for(var key in data) {
            data[key] = JSON.parse(data[key])[0];
            var lnglat = ol.proj.fromLonLat([parseFloat(data[key].LON), parseFloat(data[key].LAT)]);
            var marker = new ol.Feature({
                geometry: new ol.geom.Point(lnglat)
            })

            marker.type = type;
            marker.value = {
                time: time[0],
                code: data[key].STATION,
                lng: data[key].LON,
                lat: data[key].LAT,
                wth: data[key].WW,
                station: data[key].STATION,
            }
            
            // var img = getImg(data[key].WW);
            // marker.setStyle(new ol.style.Style({
            //     image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
            //         crossOrigin: 'anonymous',
            //         src: img[1],
            //         scale: img[0],
            //     })),                                          
            // }));
 
            markers.push(marker);

            //----------------------------文字
            var markFeatu = new ol.Feature({
                geometry: new ol.geom.Point(lnglat)
            });
            // markFeatu.setStyle(new ol.style.Style({
            //     text: new ol.style.Text({
            //         textAlign: "center",
            //         text: data[key].STATION,
            //         fill: new ol.style.Fill({    //文字填充色
            //             color: '#980303',
            //         }),
            //         offsetX: 0,
            //         offsetY: 15, 
            //     }),
            // }));
            markers.push(markFeatu);
        }

        let source = new ol.source.Vector({
            features: markers
        });

        let clusterSource = new ol.source.Cluster({
            distance: 30,
            source: source
        });


        if (!layer) {
            layer = new ol.layer.Vector({
                style: styleFunction
            });
            layer.setZIndex(15);
            layer.id = type;
        }
        layer.setSource(clusterSource);
        
        if ($.inArray(layer, XHW.map.getLayers().getArray()) == -1)
        XHW.map.addLayer(layer);
    }

    function createWaterStyle(feature) {
        if(feature.value){
            
            let imgStr = feature.value.wth;
            let station = feature.value.station;
            return new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                    crossOrigin: 'anonymous',
                    src: getImg(imgStr)[1],
                    scale: getImg(imgStr)[0],
                })),
                text: new ol.style.Text({
                    textAlign: "center",
                    text: station,
                    fill: new ol.style.Fill({    //文字填充色
                        color: '#980303',
                    }),
                    offsetX: 0,
                    offsetY: 15, 
                }),
            })
        }
    }
        

    function styleFunction(feature) {      
        feature.type = type;
        let style;
        var size = feature.get('features').length;
        for(var i = 0; i <= size; i++){
            var originalFeature = feature.get('features')[i];
            if(originalFeature.value){    
                feature.value = originalFeature.value;
                style = createWaterStyle(originalFeature);
            }else{
                break;
            }
        }
        return style;
    }
    
    function getImg(wth){
        if(!wth && wth != 0 || wth == "" || wth >= 100)
            return [0.8, 'img/sea/ship_label.png'];
        var arr = [0,1,2,3,25,26,80,81,82,83,84,85,86,87,88,89,90];
        var imgs;
        var time = new Date();
        var h = time.getHours();
        if(h>=8 && h<=19){
              imgs = 'img/weatherIcons/cww' + toTwo(wth) +'.png';
        }else{
            for(var i = 0; i < arr.length; i++){
                if (wth == 0 || wth == 1 || wth == 2 || wth == 3 || wth == 25 || wth == 26 || wth == 80
                     || wth == 81 || wth == 82 || wth == 83 || wth == 84 || wth == 85 || wth == 86 
                     || wth == 87 || wth == 88 || wth == 89 || wth == 90){
                    imgs = 'img/weatherIcons/cww' + toTwo(wth) + 'n.png';
                } else{
                    imgs = 'img/weatherIcons/cww' + toTwo(wth) +'.png';
                }
            }
        };
        return [0.2, imgs];
    };

    function toTwo(num){
        num = parseInt(num);
        return num >= 10 ? num : '0' + num;
    }


    /**
     * 根据值返回浮动框
     * @param {*} value 
     */
    function getPopupHtml(value){
        var lng = value['lng'];
        var lat = value['lat'];
        var station = value['code'];
        var tData = data[station];
        var html = '<div style="background:rgba(0,0,0,0.5);padding:10px;border-radius:3px;color:#ffffff;">'
            + '<h1>' + value['time'] + '</h1>'
            + '<h1>' + format.lnglat(lng, lat) + '</h1>'
            + '<h3 style="font-size:12px;margin:5px 0;">温度：' + format.tt(tData.AT) + '</h3>'
            + '<h3 style="font-size:12px;margin:5px 0;">海平面气压：' + format.pr(tData.SLP) + '</h3>'                                                                               
            + '<h3 style="font-size:12px;margin:5px 0;">湿度：' + format.rh(tData.RH) + '</h3>'
            + '<h3 style="font-size:12px;margin:5px 0;">风：' + format.wind(tData.Wd, tData.WS) + '</h3>'                       
            + '<h3 style="font-size:12px;margin:5px 0;">风浪方向：' + format.data('', tData.WWD, '度') + '</h3>'
            + '<h3 style="font-size:12px;margin:5px 0;">风浪周期：' + format.data('', tData.WWP, '秒') + '</h3>'
            + '<h3 style="font-size:12px;margin:5px 0;">风浪高度：' + format.data('', tData.WWH, '米') + '</h3>'
            + '<h3 style="font-size:12px;margin:5px 0;">涌浪方向：' + format.data('', tData.SWD1, '度') + '</h3>'
            + '<h3 style="font-size:12px;margin:5px 0;">涌浪周期：' + format.data('', tData.SWP1, '秒') + '</h3>'
            + '<h3 style="font-size:12px;margin:5px 0;">涌浪高度：' + format.data('', tData.SWH1, '米') + '</h3>'
            + '</div>';
        return html;
    }

    /**
     * 删除图层
     */
    function remove(){
        XHW.map.removeLayer(layer);
    }

    function open(){
        //---------添加图层控制
        item.htmlLayer = '船舶报';
        var b = XHW.C.layerC.addLayer(key, item);
        if(!b) {
            close();
            return;
        }
        //---------添加按钮选中样式
        button.parent().addClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrc'));
        XHW.C.layout.judgeWhetherSelect(button);
        getData();
    }

    function close(){
        //---------删除图层控制
        XHW.C.layerC.removeLayer(key);

        //---------取消按钮选中样式
        button.parent().removeClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrcpri'));
        XHW.C.layout.judgeWhetherSelect(button);

        remove();
    }

    return {
        close: close
    }

});