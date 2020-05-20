//站点 城市 气象数据
define(['Function/point/StationInfo', 'Controller/DataFormat'], function (info, format) {
    var key;
    var type;
    var item;

    var button;     //功能开关按钮
    var isOpen = false;
    var layer;      //功能图层
    var data;       //城镇气象数据（按分级记录，站点、站名、经纬度、天气信息）

    function init() {
        button = $('#city_station');
        button.click(function () {
            if (!isOpen) {
                open();
                // $('#moShiQieHuang').show();
                XHW.C.layout.judgeWhetherSelect(button);
            } else {
                close();
                // if (!$('#multi_select li').hasClass('currenterJiBtn') && !$('#meteo_airport').parent().hasClass('current') && !$('#shuzhiyubao li').hasClass('currenterJiBtn')) {
                //     $('#moShiQieHuang').hide();
                // } else {
                //     $('#moShiQieHuang').show();
                // }
                XHW.C.layout.judgeWhetherSelect(button);
            }
        });
        if (XHW.stationManager && XHW.stationManager.callbacks) {
            XHW.stationManager.callbacks.push(function () {
                if (isOpen)
                    getData();
            })
        }
        $('.city_station .panelCancel').click(function(){
            $('.city_station').hide();
        })
        //层级缩放监听
        XHW.C.MapMove.addZoomCallback(function () {
            if (isOpen) getData();
        });

        //时间轴变化监听
        timeBar.addCallback(function () {
            if (button.parent().hasClass('current'))
                getData();
        });

        type = key = 'station';
        item = XHW.C.layerC.createItem('', '', function () {
            close();
        })

        //------------鼠标指向marker的监听
        // XHW.C.mouse.addCallback(type, function (value) {
        //     return getPopupHtml(value);
        // });

        XHW.C.mapclick.addCallback(type, function (value) {
            // search.queryStation(value.code, value.name);
            console.log(value.name)
            info.queryStationInfo(value.code, value.name);
            var features = layer.getSource().getFeatures();
            for (var i = 0, ii = features.length; i < ii; i++) {
                if (value.name && features[i].value.name == value.name) {
                    
                    features[i].setStyle(features[i].highlight);
                    // console.log(features[i].getStyle().getImage())
                    // features[i].getStyle().getImage().setScale(0.32)
                }else{
                    features[i].setStyle(features[i].default);
                    // features[i].getStyle().getImage().setScale(0.16)
                }
            }
        })
    }

    init();

    function getData() {
        //https://weather.xinhong.net/stationdata_surf/datafromselectedstationsbylevel?level=2&year=2019&month=02&day=21&hour=01
        var zoom = XHW.map.getView().getZoom();
        // var param = 'level=' + (zoom - 2);
        // XHW.C.http.http('/stationdata_surf/datafromselectedstationsbylevel', '?' + param, function(data, time){
        //     time = format.jsonDate(time);
        //     item.htmlLayer = time[0] + ' 城镇天气实况';
        //     XHW.C.layerC.updateLayerData(key, item);
        //     collating(data)
        // })
        // 小于10前面加'0'
        var time = timeBar.getRequestTime().split('-');
        var year = time[0];
        var month = time[1];
        var day = time[2];
        var hour = time[3];

        var param = {
            level: zoom - 2,
            year: year,
            month: month,
            day: day,
            hour: hour
        }
        // XHW.C.http.get(XHW.C.http.weatherUrl, '/stationdata_surf/datafromselectedstationsbylevel', param, function(json){
        //     time = format.jsonDate(json.time);
        //     item.htmlLayer = time[0] + ' 城镇天气实况';
        //     XHW.C.layerC.updateLayerData(key, item);
        //     collating(json.data);
        // }, function(){});

        if (XHW.stationManager
            && XHW.stationManager.choosedata
            && XHW.stationManager.choosedata.length > 0) {
            time = format.jsonDate(XHW.stationManager['time']);
            item.htmlLayer = time[0] + ' 城镇天气实况';
            XHW.C.layerC.updateLayerData(key, item);
            data = XHW.stationManager['choosedata'];
            drawStationMarkers();
        } else {
            XHW.C.http.get(XHW.C.http.weatherUrl, '/stationdata_surf/datafromselectedstationsbylevel', param, function (json) {
                time = format.jsonDate(json.time);
                item.htmlLayer = time[0] + ' 城镇天气实况';
                XHW.C.layerC.updateLayerData(key, item);
                collating(json.data);

                configlib = json.data;
            }, function () {
                item.htmlLayer = Number(param.month) + '月' + Number(param.day) + '日 ' + param.hour + ':00 ' + ' 城镇天气实况' + '(无数据)';
                XHW.C.layerC.updateLayerData(key, item);
            });
        }
    }

    /**
     * 整理数据
     * @param {*} rawData 原始数据
     */
    function collating(rawData) {
        data = [];
        for (var key in rawData) {
            var keys = key.split('_');
            data.push({
                code: keys[0],
                name: keys[1],
                lng: keys[2],
                lat: keys[3],
                wth: rawData[key].WTH,
                cn: rawData[key].CN,
            })
        }
        drawStationMarkers();
    }

    /**
     * 显示城镇气象信息
     */
    function drawStationMarkers() {
        var markers = [];
        for (var i = 0; i < data.length; i++) {
            var marker = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(data[i].lng), parseFloat(data[i].lat)]))
            })

            marker.type = type;
            marker.value = {
                code: data[i].code,
                name: data[i].name,
                lng: data[i].lng,
                lat: data[i].lat,
                wth: data[i].wth,
                cn: data[i].cn
            }

            
            marker.default = new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                    crossOrigin: 'anonymous',
                    src: getImg(data[i].wth, data[i].cn),
                    scale: 0.25
                })),
                text: new ol.style.Text({
                    text: data[i].name,
                    font: '14px Calibri,sans-serif',
                    fill: new ol.style.Fill({
                        color: '#000'
                    }),
                    offsetY: 20
                })
            })
            marker.highlight = new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                    crossOrigin: 'anonymous',
                    src: getImg(data[i].wth, data[i].cn),
                    scale: 0.5
                })),
                text: new ol.style.Text({
                    text: data[i].name,
                    font: '18px Calibri,sans-serif',
                    fill: new ol.style.Fill({
                        color: '#000'
                    }),
                    offsetY: 20
                })
            });
            marker.setStyle(marker.default);

            markers.push(marker);
        }

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
    }

    /**
     * 获取图片
     * @param {*} wth 天气现象
     * @param {*} cn  云量
     */
    function getImg(wth, cn) {
        var arr = [0, 1, 2, 3, 25, 26, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90];
        var imgs;
        var time = new Date();
        var h = time.getHours();
        if (h >= 8 && h <= 19) {
            imgs = 'img/weatherIcons/cww' + toTwo(wth) + '.png';
            h = '';
        } else {
            for (var i = 0; i < arr.length; i++) {
                if (wth == 0 || wth == 1 || wth == 2 || wth == 3 || wth == 25 || wth == 26 || wth == 80
                    || wth == 81 || wth == 82 || wth == 83 || wth == 84 || wth == 85 || wth == 86
                    || wth == 87 || wth == 88 || wth == 89 || wth == 90) {
                    imgs = 'img/weatherIcons/cww' + toTwo(wth) + 'n.png';
                } else {
                    imgs = 'img/weatherIcons/cww' + toTwo(wth) + '.png';
                }
            }
            h = 'n';
        };
        if (wth == 0 || wth == 1 || wth == 2 || wth == 3) {
            if (cn || cn == 0) {
                imgs = cn <= 3 ? 'img/weatherIcons/cww00' + h + '.png' : //云量4成及以下 为晴 //白天h为空字符串，夜间h为‘n’
                    cn <= 8 ? 'img/weatherIcons/cww01' + h + '.png' : //云量9成及以下 为多云
                        'img/weatherIcons/cww02_yin.png';                  //云量10成 为阴
            } else {
                imgs = wth < 2 ? 'img/weatherIcons/cww00' + h + '.png'
                    : 'img/weatherIcons/cww01' + h + '.png';
            }
        }
        return imgs;
    };
    // //0- 没有观测到云的发展,或者没有观测
    // //1- 基本上云逐渐消散或者发展缓慢
    // //2- 天空状态无变化
    // //3- 基本上云在形成或发展
    // if (code == 0 || code == 1 || code == 2 || code == 3){
    //     if (CN != null && !CN.isEmpty()){
    //         int cnCode = Integer.parseInt(CN);
    //         if (cnCode <= 8){
    //             if (cnCode <= 3) // 4成及以下为晴
    //                 return "晴";
    //             else if (cnCode <= 7) //9成及以下为多云
    //                 return "多云";
    //             else if (cnCode == 8) //10成为阴
    //                 return "阴";
    //         } else {
    //             if (code == 0 || code == 1)
    //                 return "晴";
    //             if (code == 2 || code == 3)
    //                 return "多云";
    //         }
    //     } else {
    //         if (code == 0 || code == 1)
    //             return "晴";
    //         if (code == 2 || code == 3)
    //             return "多云";
    //     }
    // }

    function toTwo(num) {
        num = parseInt(num);
        return num >= 10 ? num : '0' + num;
    }

    /**
     * 根据值返回浮动框
     * @param {*} value 
     */
    function getPopupHtml(value) {
        var lng = value['lng'];
        var lat = value['lat'];
        var name = value['name'];
        var station = value['code'];
        var html = '<div style="position:absolute;left:-30px;bottom:12px;'
            + 'background:rgba(0,0,0,0.5);padding:2px;border-radius:2px;color:#ffffff;width: max-content">'
            + '<h1 style="font-size:12px;margin:5px 0;">' + name + "(" + station + ")" + '</h1>'
            + '<h2 style="font-size:12px;margin:5px 0;">' + format.lnglat(lng, lat) + '</h2>'
            + '</div>';
        return html;
    }

    /**
     * 删除图层
     */
    function remove() {
        XHW.map.removeLayer(layer);
    }

    function open() {
        item.htmlLayer = '城镇天气实况';
        var b = XHW.C.layerC.addLayer(key, item);
        if (!b) {
            close();
            return;
        }
        button.parent().addClass('currenterJiBtn');
        button.parent().parent().addClass('current2');
        button.prev().attr('src', button.prev().attr('mysrc'));
        getData();
        $('.sub_station').click(function () {
            if (isOpen) {
                getData();
            }
        })
        isOpen = true;
    }

    function close() {
        button.parent().removeClass('currenterJiBtn');
        button.parent().parent().removeClass('current2');
        button.prev().attr('src', button.prev().attr('mysrcpri'));
        remove();
        isOpen = false;
        XHW.C.layerC.removeLayer(key);
    }

    return {
        close: close
    }

});