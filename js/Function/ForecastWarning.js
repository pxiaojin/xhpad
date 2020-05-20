define(['Controller/Http'], function(http){

    var keys;
    var legend;
    var item;
    function open() {
        requestDataAndDraw();
        XHW.C.layerC.addLayer(keys, item); 
    }

    function requestDataAndDraw() {

        let urls = [
            // {elem: 'VIS', level: 9999, uri: '/warning/ecmf?elem=VIS&level=9999'},
            // {elem: 'MXT', level: 9999, uri: '/warning/ecmf?elem=MXT&level=9999'},
            // {elem: 'WH', level: 9999, uri: '/warning/fio?elem=WH&level=9999'}];
            {elem: 'WH', level: 9999, uri: '/hy1Suo/geoareadatabylevels/?elem=WH'}];
        for (let i = 0; i< urls.length; i++) {
            requestElemAndDraw(urls[i]);
        }
    }

    function requestElemAndDraw(elemInfo) {

        var time = timeBar.getRequestTime().split('-');
        var timeparam = '&year=' + time[0]
            + '&month=' + time[1]
            + '&day=' + time[2]
            + '&hour=' + time[3];

        keys = 'bigWave';
        legend = '<p class="tuCengP">大浪区</p>' + 
                '<img src="img/warn_legend/bWave.png" alt="" />' +
                '<p>' +
                    '<span>单位</span>' +
                    '<span>m</span>' +
                '</p>';
        item = XHW.C.layerC.createItem('大浪区', legend, function(){
            close();
        });

        var yjLevel;
        if(XHW.config.wave_lev != undefined){
            var wave_lev;
            if(XHW.config.wave_lev.indexOf(',') == 0){
                wave_lev = XHW.config.wave_lev.substring(1);
            }else{
                wave_lev = XHW.config.wave_lev;
            }
            yjLevel = '&YJLevel=' + wave_lev + ',100';
            if(yjLevel == '&YJLevel=,100'){yjLevel = ''}
        }else{
            yjLevel = '';
        }

        $.ajax({
            url: appendInfoToURL('http://ocean.xinhong.net' + elemInfo.uri + timeparam + yjLevel),
            dataType:'json',
            success:function(json){
                if(json.status_code != 0){
                    item.htmlLayer =' 大浪区' + '(无数据)';
                    XHW.C.layerC.addLayer(keys, item);
                    return;
                }
                let data = json.data;
                // if (data && elemInfo.elem in data) {
                //     let datas = data[elemInfo.elem].data;
                //     for (let i = 0; i < datas.length; i++) {
                //         let timeStr = datas[i].date.substring(0,4) + '-'
                //             + datas[i].date.substring(4,6) + '-'
                //             + datas[i].date.substring(6,8) + ' '
                //             + datas[i].date.substring(8,10) + ':'
                //             + datas[i].date.substring(10,12);
                //         datas[i].desc = timeStr;
                //         datas[i].elem = elemInfo.elem;
                //         if (datas[i].data) {
                //             draw(datas[i]);
                //         }
                //     };
                //     item.htmlLayer = datas[0].date.substring(4,6) + '月' + datas[0].date.substring(6,8) + '日 ' + datas[0].date.substring(8,10) + ':00 ' + ' 大浪区';
                //     XHW.C.layerC.updateLayerData(keys, item);
                // }
                if (data) {
                    let datas = data;
                    for (let i = 0; i < datas.length; i++) {
                        let timeStr = datas[i].date.substring(0,4) + '-'
                            + datas[i].date.substring(4,6) + '-'
                            + datas[i].date.substring(6,8) + ' '
                            + datas[i].date.substring(8,10) + ':'
                            + datas[i].date.substring(10,12);
                        datas[i].desc = timeStr;
                        datas[i].elem = elemInfo.elem;
                        if (datas[i].data) {
                            draw(datas[i]);
                        }
                    };
                    item.htmlLayer = Number(datas[0].date.substring(4,6)) + '月' + Number(datas[0].date.substring(6,8)) + '日 ' + datas[0].date.substring(8,10) + ':00 ' + ' 大浪区';
                    XHW.C.layerC.updateLayerData(keys, item);
                }
            },
            error: function(error){
                // time = XHW.silderTime;
                // item.htmlLayer = Number(time.month) + '月' + Number(time.day) + '日 ' + time.hour + ':00 ' + ' 大浪区' + '(无数据)';
                // XHW.C.layerC.updateLayerData(keys, item);
                close();
            }
        });
    }

    function close() {
        XHW.C.layerC.removeLayer(keys, item); 
        for (let key in layerMap) {
            let geoJsonLayer = layerMap[key];
            if (geoJsonLayer) {
                XHW.map.removeLayer(geoJsonLayer);
                geoJsonLayer = null;
            }
        }
        layerMap = {};
    }

    function draw(data) {
        drawGeoJsonInfo(data.elem, data.data)
    }

    var layerMap = {};
    /**
     * 绘制geojson中内容
     */
    function drawGeoJsonInfo(key, resultgeojson) {

        if (!resultgeojson)
            return;
        var resfeatures = buildFeatures(key, resultgeojson);
        if (!resfeatures){
            return;
        }
        let source = new ol.source.Vector({
            // format: new ol.format.GeoJSON(),
            features: resfeatures,
            // style: styleFunction
            ////strategy: bbox
            //features: (new ol.format.GeoJSON()).readFeatures(resultgeojson, { //另一种方式生成features
            //  dataProjection: 'EPSG:3857',   //4326, 3857
            //  featureProjection: 'EPSG:3857'
            //})
        });
        let geoJsonLayer = layerMap[key];
        if (!geoJsonLayer) {
            geoJsonLayer = new ol.layer.Vector({
                title: '预报区域预警',
                source: source,
                //minResolution: minResolution,
                //maxResolution: maxResolution
            });
            layerMap[key] = geoJsonLayer;
            XHW.map.addLayer(geoJsonLayer);
            geoJsonLayer.id = keys;
        } else {
            geoJsonLayer.setSource(source);
        }

        //绘制geojson数据
        //var minResolution = XHW.map.getView().getResolutionForZoom(50);
        //var maxResolution = XHW.map.getView().getResolutionForZoom(8);
    }
    var styles = {
        'LineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'green',
                width: 1
            })
        }),
        'MultiLineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'green',
                width: 1
            })
        }),
        'MultiPolygon': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 0, 0.1)'
            })
        }),
        'Polygon': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'blue',
                lineDash: [4],
                width: 3
            }),
            fill: new ol.style.Fill({
                color: 'rgba(0, 0, 255, 0.1)'
            })
        }),
        'GeometryCollection': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'magenta',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'magenta'
            }),
            image: new ol.style.Circle({
                radius: 10,
                fill: null,
                stroke: new ol.style.Stroke({
                    color: 'magenta'
                })
            })
        }),
        'Circle': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255,0,0,0.2)'
            })
        })
    };

    var styleFunction = function(feature) {
        return styles[feature.getGeometry().getType()];
    };
    function buildFeatures(type, resultgeojson) {
        var resfeatures = [];
        var features = resultgeojson.features;
        if (!features) {
            return;
        }
        for (var i = 0; i < features.length; i++){
            var feature = features[i];
            var properties = feature.properties;
            var coordinates = feature.geometry.coordinates[0];
            let polygonArr = [];
            var lnglats = [];
            for(var j = 0; j < coordinates.length; j++) {
                if (coordinates[j].length > 2){
                    for(var k = 0; k < coordinates[j].length; k++) {
                        lnglats.push(ol.proj.fromLonLat([coordinates[j][k][0], coordinates[j][k][1]]));
                    }
                    polygonArr.push(lnglats);
                    lnglats = [];
                } else {
                    lnglats.push(ol.proj.fromLonLat([coordinates[j][0], coordinates[j][1]]));
                }
            }
            if (lnglats && lnglats.length > 0){
                polygonArr.push(lnglats);
            }
            var resfeature = new ol.Feature({
                geometry: new ol.geom.Polygon(polygonArr),
                //geometry: new ol.geom.LineString(lnglats),
            });
            var style;
            if(properties){
                style = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        width: 1,
                        color: properties.lineColor
                    }),
                    fill:new ol.style.Fill({
                        color: properties.fillColor
                    }),
                    // text: buildWarningText(getTypeDesc(type) + ":" + getTypeValueDesc(type, properties.val), properties.lineColor)
                    text: buildWarningText(getTypeDesc(type) + ":" + getTypeValueDesc(type, properties.sLevel),properties.linecolor)
                });
            }else{
                style = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        width: 1,
                        color: 'rgba(0, 0, 0,0.1)'
                    }),
                    fill:new ol.style.Fill({
                        color: 'rgba(0, 0, 0,0.1)'
                    }),
                    // text: buildWarningText(getTypeDesc(type) + ":" + getTypeValueDesc(type, properties.val), properties.lineColor ? properties.lineColor : 'rgba(0, 0, 0,0.1)')
                });
            }
            // let style = new ol.style.Style({
            //     stroke: new ol.style.Stroke({
            //         width: 1,
            //         color: properties ? properties.lineColor : 'rgba(0, 0, 0,0.1)'
            //     }),
            //     fill:new ol.style.Fill({
            //         color: properties ? properties.fillColor : 'rgba(0, 0, 0,0.1)'
            //     }),
            //     text: buildWarningText(getTypeDesc(type) + ":" + getTypeValueDesc(type, properties.val), properties.lineColor ? properties.lineColor : 'rgba(0, 0, 0,0.1)')
            // });
            resfeature.setStyle(style);
            resfeatures.push(resfeature);
        }
        return resfeatures;
    }

    function getTypeDesc(type) {
        switch(type){
            case 'VIS': return '能见度'; 
            case 'MXT': return '温度';
            case 'WH': return '浪高';
        }
        return '';
    }

    // function getTypeValueDesc(type, value) {
    //     if (type && value) {
            
    //     switch(type){
    //         case 'VIS': return (value / 1000.) + '公里'; 
    //         case 'MXT': return value + '℃';
    //         case 'WH': return  value + 'm';
    //     }
    //     }
    // }

    function getTypeValueDesc(type, svalue) {
        if (type && svalue) {
            
            switch(type){
                case 'WH': return '≥' + svalue + 'm';
            }
        }
    }

    function buildWarningText(text, backrground) {
        let textColor = 'black';
        return new ol.style.Text({
            font: 'BOLD 8px 微软雅黑',
            text: text,
            fill: new ol.style.Fill({    //文字填充色
                color: textColor,
            }),
            placement:'line',
            // stroke: new ol.style.Stroke({
            //     color: backrground,
            //     lineCap: 'round',
            //     lineJoin: 'round',
            //     width: 4,
            // }),
            rotation:0,
            scale: 0.8,
            maxAngle: Math.PI / 12,
            textBaseline: 'middle',
        });
    }

    function getColorStr(type, alarmlevel) {
        if (type == 'VIS') {
            if (alarmlevel < 1) {
                return 'rgba(25, 255, 25, 0.2)';
            } else if (alarmlevel < 2) {
                return 'rgba(254, 251, 158, 0.35)';
            } else if (alarmlevel < 3) {
                return 'rgba(229, 223, 109, 0.6)';
            } else if (alarmlevel < 34) {
                return 'rgba(204, 197, 81, 0.6)';
            }  else {
                return 'rgba(170, 162, 51, 0.6)';
            }
        } else if(type == 'MXT') {
            if (alarmlevel < 1) {
                return 'rgba(25, 255, 25, 0.2)';
            } else if (alarmlevel < 2) {
                return 'rgba(255, 130, 130, 0.35)';
            } else if (alarmlevel < 3) {
                return 'rgba(255, 81, 81, 0.6)';
            } else {
                return 'rgba(255, 25, 25, 0.6)';
            }
        } else {
            if (alarmlevel <= 1) {
                return 'rgba(25, 255, 25, 0.2)';
            } else if (alarmlevel <= 2) {
                return 'rgba(255, 235, 25, 0.35)';
            } else if (alarmlevel <= 3) {
                return 'rgba(255, 127, 39, 0.6)';
            } else {
                return 'rgba(255, 25, 25, 0.6)';
            }
        }
    }

    return {
        open: open,
        close: close
    }
});