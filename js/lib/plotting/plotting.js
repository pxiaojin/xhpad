    var projection = ol.proj.get("EPSG:4326");
// var projection = ol.proj.get("EPSG:3857");//墨卡托
    var coordinateFormat = ol.coordinate.createStringXY(2);
    var himawariOverlay;
    var drawFeatures = new ol.Collection();
    var ff;
    var iconType = [];
    var iconName = [];
    var legend;

//军标绘制
    var drawType = "drawToolLayer";//默认
    var drawToolLayer;
    var drawToolLayerItem=null;
    var drawTool;
    var drawToolFlag = false;
    var drawToolFeatures = new ol.Collection();
    var drawIndex = 0;
    var boxSelectTool; //用于修改军标
// var drawToolLayers = [];
    var milStdType = null;
//风场展示
    var windShow = false;
    var wdData, wsData;

    var wrapX = true;
    var selectClick, airPopupMovie = true;

    var stateTypes = ["state_weather", "state_wind_wave", "state_lines", "state_fc"];
    var stateTypesCH = ["天气区", "风浪区", "天气形势", "预警区"]
    var items = [];
    var isOpen = [true, false, true, false];

    var  selectStrokeColor = null;
    var selectStrokeWidth = 2;
    var selectFeature = null;
    var selectFeatureName = null;


//        * 降水 RAIN   +:0,-:1,2 正常
//        * 烟尘 SOOT
//        * 雷电 THUNDER
//        * 风沙 SAND
//        * 风暴 STORM
//        * 地面凝结 CLOTTED GROUND
//        * 吹雪 PUFF SNOW
//        * 积雪 FIRN SNOW
//        * 降雪 SNOW
//        * 雾   FOG
    var clotteds = ["clotted_ground_ascend.png", "clotted_ground_descend.png", "clotted_ground_normal.png"];
    var firnsonws = ["firn_snow_ascend.png", "firn_snow_descend.png", "firn_snow_normal.png"];
    var fogs = ["fog_ascend.png", "fog_descend.png", "fog_normal.png"];
    var puffsnows = ["puff_snow_ascend.png", "puff_snow_descend.png", "puff_snow_normal.png"];
    var rains = ["rain_ascend.png", "rain_descend.png", "rain_normal.png"];
    var sands = ["sand_ascend.png", "sand_descend.png", "sand_normal.png"];
    var snows = ["snow_ascend.png", "snow_descend.png", "snow_normal.png"];
    var soots = ["soot_ascend.png", "soot_descend.png", "soot_normal.png"];
    var storms = ["storm_ascend.png", "storm_descend.png", "storm_normal.png"];
    var thunders = ["thunder_ascend.png", "thunder_descend.png", "thunder_normal.png"];



    function init() {

        // sliderBar.addCallback(function () {
        //     for (var i = 0; i < isOpen.length; i++) {
        //         if (isOpen[i]) {
        //             delLayer(stateTypes[i])
        //             xf_drawStateByType(stateTypes[i]);
        //         }
        //     }         
        // });      
    }

    init();

    function uniq(array){  // 数组去重
        var temp = []; 
        for(var i = 0; i < array.length; i++){
            if(temp.indexOf(array[i]) == -1){
                temp.push(array[i]);
            }
        }
        return temp;
    }

// $(function () {
    function initEvent(id) {
        $('#' + id).click(function () {
            if ($('#' + id).parent().hasClass('currenterJiBtn')) {
                $('#' + id).parent().removeClass('currenterJiBtn');
                $('#' + id).prev().attr('src', $('#' + id).prev().attr('mysrcpri'));
                XHW.C.layout.judgeWhetherSelect($('#' + id));
                delLayer(id);
                //---------删除图层控制
                XHW.C.layerC.removeLayer(id);

                isOpen.splice(stateTypes.indexOf(id), 1, false);
            } else {
                $('#' + id).parent().addClass('currenterJiBtn');
                XHW.C.layout.judgeWhetherSelect($('#' + id));
                $('#' + id).prev().attr('src', $('#' + id).prev().attr('mysrc'));
                XHW.C.layerC.addLayer(id, items[stateTypes.indexOf(id)]);
                xf_drawStateByType(id);
                $("#plotMenu").hide();
                isOpen.splice(stateTypes.indexOf(id), 1, true);

            }
        });
    }
    function initFCEvent(id) {
        $('#' + id).click(function () {
            if ($('#' + id).parent().hasClass('current')) {
                $('#' + id).parent().removeClass('current');
                delLayer(id);
                //---------删除图层控制
                XHW.C.layerC.removeLayer(id);

                isOpen.splice(stateTypes.indexOf(id), 1, false);
            } else {
                $('#' + id).parent().addClass('current');
                XHW.C.layerC.addLayer(id, items[stateTypes.indexOf(id)]);
                xf_drawStateByType(id);
                $("#plotMenu").hide();
                isOpen.splice(stateTypes.indexOf(id), 1, true);

            }
        });
    }

    // 20190603 合并为”天气态势“
    $('#weather_state').on('click', function(){
        let button = $('#weather_state');
        if (button.parent().hasClass('currenterJiBtn')) {
            button.parent().removeClass('currenterJiBtn');
            button.prev().attr('src', button.prev().attr('mysrcpri'));
            XHW.C.layout.judgeWhetherSelect(button);

            // delLayer('state_wind_wave');
            // //---------删除图层控制
            // XHW.C.layerC.removeLayer('state_wind_wave');
            // isOpen.splice(stateTypes.indexOf('state_wind_wave'), 1, false);

            delLayer('state_weather');
            //---------删除图层控制
            XHW.C.layerC.removeLayer('state_weather');
            isOpen.splice(stateTypes.indexOf('state_weather'), 1, false);

            // delLayer('state_lines');
            // //---------删除图层控制
            // XHW.C.layerC.removeLayer('state_lines');
            // isOpen.splice(stateTypes.indexOf('state_lines'), 1, false);
        } else {
            button.parent().addClass('currenterJiBtn');
            XHW.C.layout.judgeWhetherSelect(button);
            button.prev().attr('src', button.prev().attr('mysrc'));

            xf_drawStateByType('state_weather');
            // XHW.C.layerC.addLayer('state_weather', items[stateTypes.indexOf('state_weather')]);
            isOpen.splice(stateTypes.indexOf('state_weather'), 1, true);

            
            // xf_drawStateByType('state_wind_wave');
            // // XHW.C.layerC.addLayer('state_wind_wave', items[stateTypes.indexOf('state_wind_wave')]);
            // isOpen.splice(stateTypes.indexOf('state_wind_wave'), 1, true);

            
            // xf_drawStateByType('state_lines');
            // // XHW.C.layerC.addLayer('state_lines', items[stateTypes.indexOf('state_lines')]);
            // isOpen.splice(stateTypes.indexOf('state_lines'), 1, true);
            $("#plotMenu").hide();
        }
    });
    $('#real_mixedGraph_level li').on('click', function(){
        if($(this).html() == '地面' && $('#weather_state').hasClass('current')){
            xf_drawStateByType('state_weather');
            isOpen.splice(stateTypes.indexOf('state_weather'), 1, true);
            $("#plotMenu").hide();
        }else{
            delLayer('state_weather');
            isOpen.splice(stateTypes.indexOf('state_weather'), 1, false);
        }       
    })


    initEvent('state_weather');
    initEvent('state_wind_wave');
    // initEvent('state_wave');
    initEvent('state_lines');
    initFCEvent('state_fc');
    //九段线
    var nineLineSource = new ol.source.Vector({
        wrapX: wrapX,
        url: "./static/data/nine-line.geojson",
        format: new ol.format.GeoJSON()
    });
    var nineStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'red',
            width: 2
        })
    });
    var nineLineLayer = new ol.layer.Vector({
        name: "九段线",
        source: nineLineSource,
        style: nineStyle
    });


    /**
     *军标绘制
     */
    $("#showJunBiao").click(function () {
            $("#plotMenu").show();
            if (drawTool==null){
                drawTool = new MilStd.tool.MilStdDrawTool(XHW.map);
            }
            drawTool.on(MilStd.event.MilStdDrawEvent.DRAW_END, onDrawToolEnd, false, this);

    });


    //绘制军标
    $(".drawToolArrow").on('click', function drawToolArrow() {


        //退出军标移除功能
        if (boxSelectTool != null && boxSelectTool != "") {
            XHW.map.removeInteraction(boxSelectTool);
        }

        drawIndex++;
        var type = $(this).attr("id");
        switch (type) {
            case "SimpleArrow":
                var milParam = new MilStd.MilstdParams({
                    headHeightFactor: 0.15,
                    headWidthFactor: 0.4,
                    neckHeightFactor: 0.75,
                    neckWidthFactor: 0.1,
                    tailWidthFactor: 0.1,
                    hasSwallowTail: true,
                    swallowTailFactor: 0.5
                });
                drawTool.activate(MilStd.EnumMilstdType.SimpleArrow, milParam, "drawSimpleArrow", drawIndex);
                break;
            case "DoubleArrow":
                var milParam = new MilStd.MilstdParams({
                    headHeightFactor: 0.15,
                    headWidthFactor: 0.8,
                    neckHeightFactor: 0.7,
                    neckWidthFactor: 0.4
                });
                drawTool.activate(MilStd.EnumMilstdType.DoubleArrow, milParam, "drawDoubleArrow", drawIndex);
                break;
            case "StraightArrow":
                var milParam = new MilStd.MilstdParams({
                    headHeightFactor: 0.1,
                    headWidthFactor: 1.3,
                    neckHeightFactor: 1.0,
                    neckWidthFactor: 0.7,
                    tailWidthFactor: 0.07,
                    hasSwallowTail: false,
                    swallowTailFactor: 0
                });
                drawTool.activate(MilStd.EnumMilstdType.StraightArrow, milParam, "drawStraightArrow", drawIndex);
                break;
            case "SingleLineArrow":
                var milParam = new MilStd.MilstdParams({
                    headHeightFactor: 0.1,
                    headWidthFactor: 1.3
                });
                drawTool.activate(MilStd.EnumMilstdType.SingleLineArrow, milParam, "drawSingleLineArrow", drawIndex);
                break;
            case "TriangleFlag":
            case "RectFlag":
            case "CurveFlag":
                drawTool.activate(type, null, "drawFlag", drawIndex);
                break;
            case "ArrowCross":                  //十字箭头指北针
            case "CircleClosedangle":           //圆形尖角指北针
            case "Circle":
            case "Closedangle":                 //尖角指北针
            case "DoubleClosedangle":           //双向尖角指北针
            case "Fourstar":                    //四角指北针
            case "Rhombus":                     //菱形指北针
            case "SameDirectionClosedangle":    //同向尖角指北针
            case "Triangle":                    //三角指北针
            case "Vane":                        //风向标指北针
                drawTool.activate(type, null, "drawCompass", drawIndex);
                break;
            case "Bezier":                      //贝塞尔曲线成区
            case "BezierLine":                  //贝塞尔曲线
            case "BezierCold":                  //冷锋
            case "BezierHot":                  //冷锋
            case "BezierStatic":                  //冷锋
            case "AssemblyArea":                  //集结区
                drawTool.activate(type, null, "drawBazier", drawIndex);
                break;
            default:
        }
    });

    //绘制完成后的回调
    function onDrawToolEnd(event) {

        drawType = 'drawToolLayer';
        var drawToolStyle;
        var type = event.target.milStdType;
        if (type == "BezierCold") {
            var feature = event.feature;
            var featureName = feature.name;
            var geometries = feature.getGeometry().geometries_;
            setBezierColdFeatures(featureName, geometries);

            return;
        } else if (type == "BezierHot") {
            var feature = event.feature;
            var featureName = feature.name;
            var geometries = feature.getGeometry().geometries_;
            setBezierHotFeatures(featureName, geometries);

            return;
        } else if (type == "BezierStatic") {
            //从新对feature进行分析
            var feature = event.feature;
            var featureName = feature.name;
            var geometries = feature.getGeometry().geometries_;
            setBezierStaticFeatures(featureName, geometries);

            return;
        } else {
            drawToolStyle = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(200,40,50,0.4)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'blue',
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({
                        color: 'red'
                    })
                })
            });
        }


        var feature = event.feature;

        //将feature 放入容器中
        // drawToolFeatures.push(feature);
        feature.setStyle(drawToolStyle);
        //判断是否有drawToolLayer
        drawToolLayer = getToollayer('drawToolLayer');
        if (drawToolLayer && drawToolLayer != null && drawToolLayer != '') {
            drawToolLayer.getSource().addFeature(feature);
        } else {
            var drawToolSource = new ol.source.Vector({wrapX: false});
            drawToolLayer = new ol.layer.Vector({
                name: 'drawToolLayer',
                source: drawToolSource,
            });
            drawToolLayer.setZIndex(5);
            XHW.map.addLayer(drawToolLayer);

            drawToolLayer.getSource().addFeature(feature);
        }

        if (drawToolLayerItem==null){
            var drawlegend = '<p>' + '手工分析' + '</p>';
            drawToolLayerItem = XHW.C.layerC.createItem('手工分析', '', function () {
                $('#showJunBiao').parent().removeClass('current');
                delLayer('drawToolLayer');
                drawToolLayerItem = null;
            });

            XHW.C.layerC.addLayer('drawToolLayer', drawToolLayerItem);
        }

    }

    function getToollayer(name) {
        var layers = XHW.map.getLayers();
        for (var i = 0; i < layers.getLength(); i++) {
            if (layers.item(i).get("name") == name) {
                return layers.item(i);
            }
        }
        return null;
    }

    function setBezierAreaFeatures(featureName, geometries) {
        if (geometries == null || geometries == "" || typeof(geometries) == 'undefined') {
            return;
        }
        var features = [];
        for (var i = 0; i < geometries.length; i++) {
            var geometry = geometries[i];
            var name = geometry.getProperties().name;
            var hotFeature = new ol.Feature({
                name: name,
                geometry: geometry
            });
            var hotFeatureStyle = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255,0,0,1)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#FF0000',
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({
                        color: 'red'
                    })
                })
            });

            hotFeature.setStyle(hotFeatureStyle);
            features.push(hotFeature);
        }

        if (drawToolLayer && drawToolLayer != null && drawToolLayer != '') {
            drawToolLayer.getSource().addFeatures(features);
        } else {
            var layers = XHW.map.getLayers();
            for (var i = 0; i < layers.getLength(); i++) {

                if (typeof(layers.item(i))!=undefined &&layers.item(i).get("name") == drawType) {
                    layers.item(i).getSource().addFeatures(features);
                    break;
                }
            }
        }
    }

    function setBezierLineFeatures(featureName, geometries, color) {
        if (geometries == null || geometries == "" || typeof(geometries) == 'undefined') {
            return;
        }
        var features = [];
        for (var i = 0; i < geometries.length; i++) {
            var geometry = geometries[i];
            var name = geometry.getProperties().name;
            var hotFeature = new ol.Feature({
                name: name,
                geometry: geometry
            });
            var hotFeatureStyle = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255,0,0,1)'
                }),
                stroke: new ol.style.Stroke({
                    color: color,// '#FF0000',
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({
                        color: 'red'
                    })
                })
            });

            hotFeature.setStyle(hotFeatureStyle);
            features.push(hotFeature);
        }

        if (drawToolLayer && drawToolLayer != null && drawToolLayer != '') {
            drawToolLayer.getSource().addFeatures(features);
        } else {
            var layers = XHW.map.getLayers();
            for (var i = 0; i < layers.getLength(); i++) {
                if (layers.item(i).get("name") == drawType) {
                    layers.item(i).getSource().addFeatures(features);
                    break;
                }
            }
        }
    }


    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    var pixelRatio = window.devicePixelRatio;

    var gradient = (function() {
        var grad = context.createLinearGradient(0, 0, 512 * pixelRatio, 0);
        grad.addColorStop(0, 'rgba(255,255,255,0.2)');
        grad.addColorStop(1, 'rgba(0,0,255,0.8)');
        return grad;
    })();

    function setArrowFeatures(featureName, geometries) {
        if (geometries == null || geometries == "" || typeof(geometries) == 'undefined') {
            return;
        }
        var features = [];
        for (var i = 0; i < geometries.length; i++) {
            var geometry = geometries[i];
            var name = geometry.getProperties().name;
            var arrowFeature = new ol.Feature({
                name: name,
                geometry: geometry
            });
            var arrowFeatureStyle = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: gradient
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0,0,255,0.5)',
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({
                        color: 'red'
                    })
                })
            });
            arrowFeature.setStyle(arrowFeatureStyle);
            features.push(arrowFeature);
        }

        drawToolLayer = getToollayer(drawType);
        if (drawToolLayer && drawToolLayer != null && drawToolLayer != '') {
            drawToolLayer.getSource().addFeatures(features);
        } else {
            var drawToolSource = new ol.source.Vector({wrapX: false});
            drawToolLayer = new ol.layer.Vector({
                name: drawType,
                source: drawToolSource,
            });
            XHW.map.addLayer(drawToolLayer);
            drawToolLayer.getSource().addFeatures(features);
        }
    }

    function setBezierColdFeatures(featureName, geometries, styleText) {
        if (geometries == null || geometries == "" || typeof(geometries) == 'undefined') {
            return;
        }
        var features = [];
        for (var i = 0; i < geometries.length; i++) {
            var geometry = geometries[i];
            var name = geometry.getProperties().name;
            var coldFeature = new ol.Feature({
                name: name,
                geometry: geometry
            });
            var coldFeatureStyle = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(0,0,255,1)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#0000FF',
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({
                        color: 'red'
                    })
                })
            });

            if (styleText && coldFeatureStyle.setText) {
                styleText.getStroke().setColor('#0000FF');
                coldFeatureStyle.setText(styleText);
            }

            coldFeature.setStyle(coldFeatureStyle);
            features.push(coldFeature);
        }

        drawToolLayer = getToollayer(drawType);
        if (drawToolLayer && drawToolLayer != null && drawToolLayer != '') {
            drawToolLayer.getSource().addFeatures(features);
        } else {
            var drawToolSource = new ol.source.Vector({wrapX: false});
            drawToolLayer = new ol.layer.Vector({
                name: drawType,
                source: drawToolSource,
            });
            drawToolLayer.setZIndex(5);
            XHW.map.addLayer(drawToolLayer);
            drawToolLayer.getSource().addFeatures(features);
        }
    }


    function setBezierHotFeatures(featureName, geometries, styleText) {
        if (geometries == null || geometries == "" || typeof(geometries) == 'undefined') {
            return;
        }
        var features = [];
        for (var i = 0; i < geometries.length; i++) {
            var geometry = geometries[i];
            var name = geometry.getProperties().name;
            var hotFeature = new ol.Feature({
                name: name,
                geometry: geometry
            });
            var hotFeatureStyle = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255,0,0,1)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#FF0000',
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({
                        color: 'red'
                    })
                })
            });

            if (styleText && hotFeatureStyle.setText){
                styleText.getStroke().setColor('#FF0000');
                hotFeatureStyle.setText(styleText);
            }
            hotFeature.setStyle(hotFeatureStyle);
            features.push(hotFeature);
        }

        drawToolLayer = getToollayer(drawType);
        if (drawToolLayer && drawToolLayer != null && drawToolLayer != '') {
            drawToolLayer.getSource().addFeatures(features);
        } else {
            var drawToolSource = new ol.source.Vector({wrapX: false});
            drawToolLayer = new ol.layer.Vector({
                name: drawType,
                source: drawToolSource,
            });
            drawToolLayer.setZIndex(5);
            XHW.map.addLayer(drawToolLayer);
            drawToolLayer.getSource().addFeatures(features);
        }
    }

    function setBezierStaticFeatures(featureName, geometries, styleText) {
        if (geometries == null || geometries == "" || typeof(geometries) == 'undefined') {
            return;
        }
        var features = [];
        for (var i = 0; i < geometries.length; i++) {
            var geometry = geometries[i];
            var name = geometry.getProperties().name;
            if (name && name != null && name != '' && name != 'undefined') {
                if (name == "circleStatic") {
                    var circleFeature = new ol.Feature({
                        name: name,
                        geometry: geometry
                    });
                    var circleFeatureStyle = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(255,0,0,1)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#FF0000',
                            width: 2
                        })
                    });
                    if (styleText && circleFeatureStyle.setText){
                        styleText.getStroke().setColor('#FF0000');
                        circleFeatureStyle.setText(styleText);
                    }
                    circleFeature.setStyle(circleFeatureStyle);
                    features.push(circleFeature);

                } else if (name == "triangleStatic") {
                    var triangleFeature = new ol.Feature({
                        name: name,
                        geometry: geometry
                    });
                    var triangleFeatureStyle = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(0,0,255,1)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#0000FF',
                            width: 2
                        })
                    });
                    if (styleText && triangleFeature.setText){
                        styleText.getStroke().setColor('#0000FF');
                        triangleFeature.setText(styleText);
                    }
                    triangleFeature.setStyle(triangleFeatureStyle);
                    features.push(triangleFeature);
                } else if (name == "lineStringStatic") {
                    var lineStringFeature = new ol.Feature({
                        name: name,
                        geometry: geometry
                    });
                    var lineStringFeatureStyle = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(0,0,255,1)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#0000FF',
                            width: 2
                        })
                    });
                    if (styleText && lineStringFeatureStyle.setText){
                        styleText.getStroke().setColor('#0000FF');
                        lineStringFeatureStyle.setText(styleText);
                    }
                    lineStringFeature.setStyle(lineStringFeatureStyle);
                    features.push(lineStringFeature);
                } else if (name == "mulPointsStatic") {
                    var mulPointsFeature = new ol.Feature({
                        name: name,
                        geometry: geometry
                    });
                    var mulPointsFeatureStyle = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(0,255,0,1)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#309630',
                            width: 7
                        }),
                        image: new ol.style.Circle({
                            radius: 5,
                            fill: new ol.style.Fill({
                                color: '#ffcc33'
                            })
                        })
                    });
                    mulPointsFeature.setStyle(mulPointsFeatureStyle);
                    drawToolFeatures.push(mulPointsFeature);
                    features.push(mulPointsFeature);
                }
                else if (name == "delPointStatic") {
                    var delFeature = new ol.Feature({
                        name: name,
                        geometry: geometry
                    })
                    var delStyle = new ol.style.Style({
                        Image: new ol.style.Icon({
                            crossOrigin: 'anonymous',
                            scale: 0.4,
                            // rotation: url[1],
                            src: 'img/weathersymbol/delete.png'
                        })
                    });
                    delFeature.setStyle(delStyle);
                    drawToolFeatures.push(delFeature);
                    features.push(delFeature);


                } else {
                    var staticFeature = new ol.Feature({
                        name: name,
                        geometry: geometry
                    });
                    var staticFeatureStyle = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(0,0,255,1)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#0000FF',
                            width: 2
                        })
                    });
                    if (styleText && staticFeature.setText){
                        styleText.getStroke().setColor('#0000FF');
                        staticFeature.setText(styleText);
                    }
                    staticFeature.setStyle(staticFeatureStyle);
                    features.push(staticFeature);
                }
            }
        }

        drawToolLayer = getToollayer(drawType);
        if (drawToolLayer && drawToolLayer != null && drawToolLayer != '') {
            drawToolLayer.getSource().addFeatures(features);
        } else {
            var drawToolSource = new ol.source.Vector({wrapX: false});
            drawToolLayer = new ol.layer.Vector({
                name: drawType,
                source: drawToolSource,
            });
            drawToolLayer.setZIndex(5);
            XHW.map.addLayer(drawToolLayer);

            drawToolLayer.getSource().addFeatures(features);
        }
    }

    // 修改图标
    var drawToolModify = new ol.interaction.Modify({
        features: drawToolFeatures,

        deleteCondition: function (event) {
            return ol.events.condition.shiftKeyOnly(event) &&
                ol.events.condition.singleClick(event);
        }
    });
    XHW.map.addInteraction(drawToolModify);


    var delClick = new ol.interaction.Select({
        multi: false,
        layers: function (layer) {
            return layer.get('name') == 'drawToolLayer';
        }
    });

    delClick.on("select", function (e) {

        var features1 = e.deselected;
        if (features1 == null || features1.length == 0 || selectStrokeColor == null) {

        }
        else {
        var deseletcFeature = features1[0];
        deseletcFeature.getStyle().getStroke().setColor(selectStrokeColor);
        deseletcFeature.getStyle().getStroke().setWidth(selectStrokeWidth);
        }

        var features = e.selected;
        if (features == null || features.length == 0) {
            selectFeature = null;
            return;
        }
        var feature = features[0];
        selectFeatureName = feature.get("name");
        selectFeature = feature;
        selectStrokeColor = feature.getStyle().getStroke().getColor();
        selectStrokeWidth = feature.getStyle().getStroke().getWidth();
        feature.getStyle().getStroke().setColor('#309630');
        feature.getStyle().getStroke().setWidth(4);

        var layers = XHW.map.getLayers();
        for (var i = 0; i < layers.getLength(); i++) {
            var somelayer =layers.item(i);
            if (somelayer.get("name") == 'drawToolLayer') {
                var someSource = layers.item(i).getSource();

                var features = someSource.getFeatures();
                var  index = features.indexOf(selectFeature);
                if (selectFeatureName=="triangleCold"){
                    features[index+1].getStyle().getStroke().setColor('#309630');
                }
                else if(selectFeatureName=="lineStringCold"){
                    features[index-1].getStyle().getStroke().setColor('#309630');
                }
                else if(selectFeatureName=="circleHot"){
                    features[index+1].getStyle().getStroke().setColor('#309630');
                }
                else if(selectFeatureName=="lineStringHot"){
                    features[index-1].getStyle().getStroke().setColor('#309630');
                }
                else if(selectFeatureName=="circleStatic"){
                    features[index+1].getStyle().getStroke().setColor('#309630');
                    features[index+2].getStyle().getStroke().setColor('#309630');
                }
                else if(selectFeatureName=="triangleStatic"){
                    features[index+1].getStyle().getStroke().setColor('#309630');
                    features[index-1].getStyle().getStroke().setColor('#309630');
                }
                else if(selectFeatureName=="lineStringStatic"){
                    features[index-1].getStyle().getStroke().setColor('#309630');
                    features[index-2].getStyle().getStroke().setColor('#309630');
                }
                break;
            }
        }

    });

    XHW.map.addInteraction(delClick);

    document.onkeydown=function(event){
        if ((event.keyCode == 46 || event.keyCode == 8) &&selectFeature) {
            console.log("delete");
            if (selectFeature==null){
                return;
            }
            var layers = XHW.map.getLayers();

            delClick.getFeatures().clear();
            for (var i = 0; i < layers.getLength(); i++) {
                var somelayer =layers.item(i);
                if (somelayer.get("name") == 'drawToolLayer') {
                    var someSource = layers.item(i).getSource();

                    var features = someSource.getFeatures();
                    var  index = features.indexOf(selectFeature);
                    if (selectFeatureName=="triangleCold"){
                        someSource.removeFeature(features[index+1]);
                    }
                    else if(selectFeatureName=="lineStringCold"){
                        someSource.removeFeature(features[index-1]);
                    }
                    else if(selectFeatureName=="circleHot"){
                        someSource.removeFeature(features[index+1]);
                    }
                    else if(selectFeatureName=="lineStringHot"){
                        someSource.removeFeature(features[index-1]);
                    }
                    else if(selectFeatureName=="circleStatic"){
                        someSource.removeFeature(features[index+1]);
                        someSource.removeFeature(features[index+2]);
                    }
                    else if(selectFeatureName=="triangleStatic"){
                        someSource.removeFeature(features[index+1]);
                        someSource.removeFeature(features[index-1]);
                    }
                    else if(selectFeatureName=="lineStringStatic"){
                        someSource.removeFeature(features[index-1]);
                        someSource.removeFeature(features[index-2]);
                    }
                    someSource.removeFeature(selectFeature);
                    // layers.item(i).getSource().clear();
                    break;
                }
            }
            selectFeature = null;
        }
    };



    drawToolModify.on("modifyend", function (e) {
        console.info(e);
        var point = e.mapBrowserEvent.coordinate;
        var features = e.features.array_;
        for (var i = 0; i < features.length; i++) {
            var isHas = false;
            var feature = e.features.array_[i];
            var geom = feature.getGeometry();
            var name = feature.values_.name;
            // var points = geom.getCoordinates();
            var points = geom.getCoordinates();
            for (var j = 0; j < points.length; j++) {
                if (points[j][0] == point[0] && points[j][1] == point[1]) {
                    isHas = true;
                    break;
                }
            }
            if (isHas) {
                if (name.indexOf("BezierStatic") > -1) {//静止锋
                    drawNewHanderDraw(name, geom, "BezierStatic");
                }
                if (name.indexOf("BezierCold") > -1) {//冷锋
                    drawNewHanderDraw(name, geom, "BezierCold");
                }
                if (name.indexOf("BezierHot") > -1) {//暖锋
                    drawNewHanderDraw(name, geom, "BezierHot");
                }
                e.features.remove(feature);
            }
        }
    });


    function drawNewHanderDraw(name, geom, type, styleText) {
        var layers = XHW.map.getLayers();
        for (var i = 0; i < layers.getLength(); i++) {
            if (layers.item(i).get("name") == drawType) {
                var drawFeatures = layers.item(i).getSource().getFeatures();
                if (drawFeatures && drawFeatures.length > 0) {
                    for (var j = 0; j < drawFeatures.length; j++) {
                        var featureName = drawFeatures[j].values_.name;
                        if (featureName == name) {
                            layers.item(i).getSource().removeFeature(drawFeatures[j]);
                        }
                    }
                }
                var points = geom.getCoordinates();
                var geometryArr;
                if (type.indexOf("BezierStatic")!=-1) {//冷锋
                    geometryArr = MilStd.commonFun.getBezierStaticPoints(points, 2);
                    setBezierStaticFeatures(name, geometryArr, styleText);
                }
                else if (type.indexOf("BezierCold")!=-1) {//暖锋
                    geometryArr = MilStd.commonFun.getBezierColdPoints(points, 2);
                    setBezierColdFeatures(name, geometryArr, styleText);
                }
                else if (type.indexOf("BezierHot")!=-1) {//静止锋
                    geometryArr = MilStd.commonFun.getBezierHotPoints(points, 2);
                    setBezierHotFeatures(name, geometryArr, styleText);
                }
                else if(type.indexOf('JETSTREAM')!=-1){

                    var milParam = new MilStd.MilstdParams({
                        headHeightFactor: 0.1,
                        headWidthFactor: 0.5,
                        neckHeightFactor: 0.7,
                        neckWidthFactor: 0.1,
                        tailWidthFactor: 0.07,
                        hasSwallowTail: true,
                        swallowTailFactor: 1,
                        maxVertices:points.length
                    });
                    drawTool.activate(MilStd.EnumMilstdType.SimpleArrow, milParam, "drawStraightArrow", drawIndex+56);



                    //以下代码用于抽析给定箭头后部的点，保证箭头末端绘制正常（末端点太密，箭头绘制很小）
                    var lastpoint = points[points.length-1];
                    var sourcelength = points.length;
                    var arrowlength = 150000;
                    var dist = 0;
                    while ((dist < arrowlength*arrowlength) && (points.length > sourcelength*0.66)){
                        var onePoint = points[points.length-2];
                        dist = (lastpoint[0] - onePoint[0])*(lastpoint[0] - onePoint[0]) +
                            (lastpoint[1] - onePoint[1])*(lastpoint[1] - onePoint[1]);
                        points.splice(points.length-2, 1);
                    }


                    geometryArr =[ MilStd.Arrow.getArrowFromVert(points,'StraightArrow',drawTool.milStdParams)];
                    setArrowFeatures(name, geometryArr);
                    drawTool.deactivate();
                }else if(type.indexOf('GROOVE')!=-1){
                    geometryArr = MilStd.commonFun.getBezierHotPoints(points, 2);
                    setBezierHotFeatures(name, geometryArr, styleText);
                }

            }
        }
    }



    //移除选中的军标
    $("#removeArrow").on('click', function removeArrow() {
        boxSelectTool = new ol.interaction.DragBox({
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: [0, 0, 255, 1]
                })
            })
        });
        XHW.map.addInteraction(boxSelectTool);
        boxSelectTool.on('boxend', function (e) {
            var selectedFeatures = new Array();
            var extent = boxSelectTool.getGeometry().getExtent();
            var source;
            if (drawToolLayer && drawToolLayer != null && drawToolLayer != '') {
                source = drawToolLayer.getSource();
            } else {
                var layers = XHW.map.getLayers();
                for (var i = 0; i < layers.getLength(); i++) {
                    if (layers.item(i).get("name") == drawType) {
                        source = layers.item(i).getSource();
                        break;
                    }
                }
            }
            if (source != null && source != '' && typeof(source) != 'undefined') {
                source.forEachFeatureIntersectingExtent(extent, function (feature) {
                    selectedFeatures.push(feature);
                });
            }
            if (selectedFeatures && selectedFeatures.length > 0) {
                for (var i = 0; i < selectedFeatures.length; i++) {
                    source.removeFeature(selectedFeatures[i]);
                }
            }
        });
    });


    XHW.map.on('dblclick', function (e) {
        if (drawToolFlag) {
        } else {
            return false;
        }
    });

    var zoomTimeOut = null;
    var view = XHW.map.getView();
    view.on('propertychange', function (e) {
        if (zoomTimeOut != null) {
            clearTimeout(zoomTimeOut);
        }
        zoomTimeOut = setTimeout(function () {
            if (e.key == "resolution") {

                var zoom = view.getZoom();
                if (windShow) {
                    delLayer("windLayer");
                    drawWindLayer(wdData, wsData, zoom);
                }
            }
        }, 600);
    });


    selectClick = new ol.interaction.Select({
        // condition: ol.events.condition.click,
        condition: ol.events.condition.pointerMove,
        /* toggleCondition: function (e) {
         return true;
         },*/
        filter: function (feature, layer) {
            if (layer && layer.get('name') == 'airPortLayers') {
                return true;
            }
        },
        layers: function (layer) {
            if (layer != undefined && layer.get('name') == 'airPortLayers') {
                return true;
            }
        },
        style: function () {
            return null;
        }
    });

    //保存手绘图形
    $("#saveHanderDraw").click(function () {
        $("#plotMenu").hide();
        var handerDrawName = $("#handerDrawName").val();
        if (handerDrawName == null || handerDrawName == ""
            || typeof(handerDrawName) == "undefined") {
            alert("请输入保存文件名称！");
            return;
        }

        var nowDate = new Date();
        var year = nowDate.getFullYear();
        var month = nowDate.getMonth() + 1;
        var day = nowDate.getDate();
        $.ajax({
            data: {
                year: year,
                month: month,
                day: day
            },
            url: 'fileController/getFileList',
            type: 'post',
            success: function (obj) {
                console.info(obj);
                if (obj && obj.length > 0) {
                    var isSave = true;
                    for (var i = 0; i < obj.length; i++) {
                        var fileName = obj[i].key.split(".")[0];
                        if (fileName == handerDrawName) {
                            isSave = false;
                            var title = obj[i].key + '已存在，是否覆盖？';
                            var con = confirm(title); //在页面上弹出对话框
                            if (con == true) {
                                // delLayer("drawToolLayer");
                                saveHanderFile(handerDrawName);
                                return;
                            } else {
                                return;
                            }
                        }
                    }
                    if (isSave) {
                        saveHanderFile(handerDrawName);
                        return;
                    }
                }
                saveHanderFile(handerDrawName);
            }
        });
    });

    function saveHanderFile(handerDrawName) {
        //需要弹框输入文件名才能保存 目前单纯的保存
        var layers = XHW.map.getLayers();
        var layerVector = [];
        var index = 0;
        for (var i = 0; i < layers.getLength(); i++) {
            if (layers.item(i).get("name") != 'undefined' &&
                layers.item(i).get("name").indexOf(drawType) > -1) {

                var vectorName = layers.item(i).get("name");

                var features = layers.item(i).getSource().getFeatures();
                var geoms = [];
                for (var j = 0; j < features.length; j++) {
                    var fillColor;
                    var strokeColor;
                    var strokeWidth;
                    var geometryType;
                    var fillStyle;
                    var strokeStyle;

                    var style = features[j].getStyle();
                    if (style && style != 'undefined') {
                        if (style.getFill()) {
                            var fill = style.getFill();
                            fillColor = fill.getColor();
                            fillStyle = {
                                color: fillColor
                            }
                        }
                        if (style.getStroke()) {
                            var stroke = style.getStroke();
                            strokeColor = stroke.getColor();
                            strokeWidth = stroke.getWidth();
                            strokeStyle = {
                                color: strokeColor,
                                width: strokeWidth
                            }
                        }
                    }
                    var geometry = features[j].getGeometry();
                    if (typeof(geometry.milStdType) == "undefined") {
                        geometryType = geometry.getType();
                        if (geometry.getCoordinates()) {
                            var coordinates = geometry.getCoordinates();
                            var geom = {
                                geometry: {
                                    geometryType: geometryType,
                                    coordinates: coordinates
                                },
                                style: {
                                    fill: fillStyle,
                                    stroke: strokeStyle
                                }
                            }
                            geoms.push(geom);
                        }
                    } else {
                        var geomertries = geometry.getGeometries();
                        if (geomertries) {
                            for (var k = 0; k < geomertries.length; k++) {
                                geometryType = geomertries[k].getType();

                                if (geomertries[k].getCoordinates()) {
                                    var coordinates = geomertries[k].getCoordinates();
                                    var geom = {
                                        geometry: {
                                            geometryType: geometryType,
                                            coordinates: coordinates
                                        },
                                        style: {
                                            fill: fillStyle,
                                            stroke: strokeStyle
                                        }
                                    }
                                    geoms.push(geom);
                                }
                            }
                        }
                    }
                }
                layerVector[index] = {
                    name: vectorName,
                    features: geoms
                    // features: vectorFeature
                }
                index++;
            }
        }
        var HanderDraw = {
            layerVector: layerVector
        }
        $.ajax({
            data: {
                handerDraw: JSON.stringify(HanderDraw),
                fileName: handerDrawName
            },
            url: 'fileController/saveHanderDraw',
            type: 'post',
            success: function (obj) {
                if (obj.success) {
                    alert("保存成功！");
                }
            }
        });
    }

    // //清除手绘图层
    $("#deleteHanderDraw").click(function () {
        delLayer(drawType);
        //还原手绘的参数
        drawIndex = 0;
        drawToolFlag = false;
        $("#plotMenu").hide();
    });



    function drawFeaturesByData(data,layerName, date) {
        //删除之前的手绘
        // delLayer("drawToolLayer");
        var features = [];
        for (let i= 0;i<data.length;i++){  
            iconType = [];
            iconName = [];
            for (var j=0;j<data[i].features.length;j++){
                features.push(data[i].features[j]);
            }
        }
        var newFeatures = [];
        for (var j = 0; j < features.length; j++) {
            var geometry = features[j].geometry;
            var geometryType = geometry.type;
            var subtype = features[j].properties.type;
            var subname = features[j].properties.name;

            iconType.push(subtype);
            iconName.push(subname);
            var coordinates = geometry.coordinates;
            if (!coordinates || coordinates.length <= 0)
                continue;

            //将经纬度坐标转化为大地坐标
            var lnglats = [];
            for (var i = 0; i < coordinates.length; i++) {
                lnglats.push(ol.proj.fromLonLat(coordinates[i]));
            }
            var milStdType = null;
            if (subtype == 'FRONTCOLD') {//冷锋
                milStdType = "BezierCold";

            }
            else if (subtype == 'FRONTWARM') {//暖锋
                milStdType = "BezierHot";
            }
            else if (subtype == 'FRONTSTATIONARY') {//静止锋
                milStdType = "BezierStatic";
            }
            else {
                milStdType = subtype;
            }

            var newGeometry;
            if (geometryType == 'Circle') {
                newGeometry = new ol.geom.Circle(lnglats);
            } else if (geometryType == 'Polygon') {
                newGeometry = new ol.geom.Polygon([lnglats]);
            } else if (geometryType == 'MultiPolygon') {
                newGeometry = new ol.geom.MultiPolygon(lnglats);
            } else if (geometryType == 'LineString') {
                newGeometry = new ol.geom.LineString(lnglats);
            } else if (geometryType == 'MultiLineString') {
                newGeometry = new ol.geom.MultiLineString(lnglats);
            } else if (geometryType == 'LinearRing') {
                newGeometry = new ol.geom.LinearRing(lnglats);
            } else if (geometryType == 'Point') {
                newGeometry = new ol.geom.Point(lnglats[0]);
            } else if (geometryType == 'MultiPoint') {
                newGeometry = new ol.geom.MultiPoint([lnglats]);
            }

            if(date){
                if(subtype == 'GROOVE'){
                    styleText = buildPlottingText(date+'   700hPa', 'white', lineColor);
                }else{
                    styleText = buildPlottingText(date, 'white', lineColor);
                }
            }            
            
            if (milStdType == 'BezierCold' || milStdType == 'BezierHot' || milStdType == 'BezierStatic'||milStdType=='MF850_JETSTREAM') {
                drawType = layerName;

                var  lineslayer = getToollayer(drawType);
                if (lineslayer==null){
                    var drawToolSource = new ol.source.Vector({wrapX: false});
                    lineslayer = new ol.layer.Vector({
                        name: drawType,
                        source: drawToolSource,
                    });
                    lineslayer.setZIndex(10);
                    XHW.map.addLayer(lineslayer);                }
                drawNewHanderDraw('auto_' + milStdType + j, newGeometry, milStdType, styleText);
            }
            else {
                var newFeature = new ol.Feature({
                    geometry: newGeometry,
                    name: 'auto_' + milStdType + j
                });
                var fillColor = 'rgba(255,255,255,0.0)';//区域填充色
                var lineWidth = 2.5;//线条宽
                var lineColor = '#C56321';//线条颜色

                // var strokeOpacity = 1.0;
                // var strokeLinecap = 'butt';//“butt”, “round”, or “square”
                // var strokeDashstyle = 'solid'; //“dot”, “dash”, “dashdot”, “longdash”, “longdashdot”, or “solid”
                var display = null;//中文名
                var imgSrc = 'img/weathersymbol/' + subtype + '.png';

                var cnv = document.createElement('canvas');
                var ctx = cnv.getContext('2d');
                var img = new Image();


                switch (subtype) {
                    case 'AREARAINSNOW':
                        lineColor = 'rgba(0,204,0,1)';
                        fillColor = 'rgba(0,204,0,0.2)';
                        display = "雨雪区";
                        lineWidth = 1;
                        // img.onload = function(){
                        //     var pattern = ctx.createPattern(img, 'repeat');
                        //     fillColor = pattern;
                        // }
                        // img.src = 'img/weathersymbol/'+subtype+'.';

                        break;
                    case 'GROOVE':
                        lineColor = '#C56321';
                        break;
                    case 'AREACLOUD':
                        lineColor = 'gray';
                        break;
                    case 'AREARAINSNOW1':
                        lineColor = 'rgba(0,204,0,1)';
                        fillColor = 'rgba(0,204,0,0.8)';
                        display = "雨区(中雨以下)";

                        lineWidth = 2.5;
                        img.src = 'img/weathersymbol/' + subtype + '.png';
                        var pattern = ctx.createPattern(img, 'repeat');
                        fillColor = pattern;
                        break;
                    case 'AREAWIND':
                        lineColor = 'rgba(148,51,0,1)';
                        fillColor = 'rgba(148,51,0,0)';
                        lineWidth = 2.0;
                        display = "大风区";
                        break;
                    case 'AREAWAVE':
                        fillColor = features[j].properties.fillColor;
                        lineColor = features[j].properties.lineColor;
                        lineWidth = 1.0;
                        display = "大浪区";
                        break;
                    case 'AREASTORMTIDE':
                        lineColor = 'rgba((51, 51, 26,1)';
                        fillColor = 'rgba((0, 128, 255,0.5)';
                        display = "风暴潮区";
                        break;
                    case 'AREAOCEANICE':
                        lineColor = 'rgba(216, 26, 13,1)';
                        fillColor = 'rgba(250, 250, 250,0.5)';
//				lineWidth = 3.0f;
                        lineWidth = 2.5;
                        display = "海冰区 ";
                        break;
                    case 'AREAFOG':
                        lineColor = 'rgba(217, 217, 26,1)';
                        fillColor = 'rgba(230, 230, 26,0.3)';
                        display = "雾区";
                        break;
                    case 'AREALOWVIS':
                        lineColor = 'rgba(217, 217, 26,1)';
                        fillColor = 'rgba(230, 230, 26,0)';
                        display = "低能见度区";
                        break;
                    case 'AREATHUNDER':
                        lineColor = 'rgba(255, 0, 0,1)';
                        fillColor = lineColor;
                        display = "雷暴、暴雨雪区";
                        break;
                    case 'AREATHUNDER_FRAG':
                        /** 零散雷暴区 */
                        lineColor = '#FF0000';
                        lineWidth = 2.0;
                        fillColor = 'rgba(0,0,255,0)';
                        break;
                    case 'AREATHUNDER_COMP':
                        /** 成片雷暴区 */
                        lineColor = '#FF0000';
                        fillColor = 'rgba(255,0,0,0.1)';
                        break;
                    default:
                        lineColor = '#C56321';
                        break;
                }

                //polygon图片填充代码
                // 具体访问 https://www.jianshu.com/p/64760ca3bb3e
                // var cnv = document.createElement('canvas');
                // var ctx = cnv.getContext('2d');
                // var img = new Image();
                // img.src = './css/fill.png';
                // img.onload = function () {
                //     var pattern = ctx.createPattern(img, 'repeat');
                //     vector.setStyle(new ol.style.Style({
                //         stroke: new ol.style.Stroke({
                //             color: 'red',
                //             lineDash: [5],
                //             width: 2
                //         }),
                //         fill: new ol.style.Fill({
                //             color: pattern
                //         })
                //     }));
                // };

                // var vector = new ol.layer.Vector({
                //     renderMode: "image", //image, vector
                //     source: vectorSource
                // });

                var newFeatureStyle = new ol.style.Style();
                if (geometryType == 'Point') {
                    // newFeatureStyle.setImage(new ol.style.Icon({
                    //     crossOrigin: 'anonymous',
                    //     scale: 0.4,
                    //     src: imgSrc
                    // }));
                    if(subtype == "WINDVANE" && features[j].properties && features[j].properties.info){
                        var windSpeed = features[j].properties.info['WS'];
                        var windDeg = features[j].properties.info['WD'];
                            windDeg = Math.round(windDeg);
                            windSpeed = Math.round(windSpeed);
                        var imgWindSrc = getImage(windSpeed);
                        newFeatureStyle.setImage(new ol.style.Icon({
                            crossOrigin: 'anonymous',
                            scale: 1,
                            rotation: windDeg * Math.PI / 180,
                            src: imgWindSrc
                        }));
                    }else{
                        newFeatureStyle.setImage(new ol.style.Icon({
                            crossOrigin: 'anonymous',
                            scale: 0.4,
                            src: imgSrc
                        }));
                    }
                }
                else {
                    newFeatureStyle.setFill(new ol.style.Fill({
                        color: fillColor
                    }));
                    newFeatureStyle.setStroke(new ol.style.Stroke({
                        color: lineColor,
                        width: lineWidth,
                        // strokeOpacity:strokeOpacity,
                        // strokeLinecap:strokeLinecap,
                        // strokeDasharray:,
                        // strokeDashoffset
                    }))
                    if (styleText) {
                        styleText.getStroke().setColor(lineColor);
                        newFeatureStyle.setText(styleText);
                    }
                }
                newFeature.setStyle(newFeatureStyle);

                newFeatures.push(newFeature);
                newFeature.type = drawType;
                newFeature.geometryType = geometryType;
                newFeature.value = newFeature;
                // TODO 
                if (geometryType == 'Point') {
                    // 以下符号闪烁
                    let flashPointTypes = ['SYMBOLFOG2', 'SYMBOLHAIL', 'SYMBOLICERAIN2', 'SYMBOLICERAIN3', 
                                'SYMBOLICERAIN4', 'SYMBOLICERAIN5', 'SYMBOLSNOW3', 'SYMBOLSNOW4', 'SYMBOLSNOW5', 'SYMBOLSNOW3INTERIM'
                                , 'SYMBOLSQUALL', 'SYMBOLTHUNDER', 'SYMBOLTYPHOON', 'SYMBOLTYPHOON1', 'SYMBOLTYPHOONUNDER', 'SYMBOLTYPHOONUNDER1'
                                , 'SYMBOLSAND1', 'SYMBOLSAND2', 'SYMBOLSAND3', 'SYMBOLCB', 'SYMBOLBUMP3', 'SYMBOLICE3'];
                    if (flashPointTypes.indexOf(subtype) != -1)
                        flashFeature(XHW.map, newFeature);
                } else{
                    let flashAreaType = ['AREATHUNDER', 'AREATHUNDER_FRAG', 'AREATHUNDER_COMP'];
                    if (flashAreaType.indexOf(subtype) != -1)
                        flashFeature(XHW.map, newFeature);
                    if ('AREAWAVE' == subtype) {
                        let arr = fillColor.match(/[+-]?(0|([1-9]\d*))(\.\d+)?/g);
                        let vlen = arr.length;
                        let colorArr = [];
                        for (let i=0; i < vlen; i++) {
                            let value = parseFloat(arr[i]);
                            colorArr.push(value);
                        }
                        if (colorArr[0] > 220 && colorArr[1] < 210)
                            flashFeature(XHW.map, newFeature);
                    }
                }
            }
        }
        drawToolLayer = getToollayer(layerName);
        if (drawToolLayer && drawToolLayer != null && drawToolLayer != '') {
            drawToolLayer.getSource().addFeatures(newFeatures);
        } else {
            var drawToolSource = new ol.source.Vector({wrapX: false});
            drawToolLayer = new ol.layer.Vector({
                    name: layerName,
                    source: drawToolSource,
                });
            drawToolLayer.setZIndex(5);
            XHW.map.addLayer(drawToolLayer);
            drawToolLayer.getSource().addFeatures(newFeatures);
            //test git
        }
    }


    // 天气现象区、不适航机场、大风区、大浪区、10米风场、天气系统（显示冷锋、暖锋、槽线）
    //按种类绘制


    function xf_drawStateByType(stateType) {
        if (drawTool == null) {
            drawTool = new MilStd.tool.MilStdDrawTool(XHW.map);
        }
        drawTool.on(MilStd.event.MilStdDrawEvent.DRAW_END, onDrawToolEnd, false, this);

        // var time = XHW.silderTime;
        var time = timeBar.getRequestTime().split('-');
        var year = time[0];
        var month = time[1];
        var day = time[2];
        var hour = time[3];
        // https://weather.xinhong.net/xhweatherfcsys/prognostics/data?elem=GROOVE&level=9999&year=2019&month=02&day=13&hour=02
        var elemStr = '';//槽线 雷暴区 雨区  锋面   能见度   大风 大浪

        if (stateType == "state_weather") {
            elemStr = "ALL";
            // elemStr = "RAIN,VIS,CONVECT";
        }
        else if (stateType == "state_wind_wave") {
            elemStr = "WIND,WAVE";
        }
        else if (stateType == "state_fc") {
            elemStr = "ALL";
        }
        else {
            elemStr = "GROOVE,FRONT,JETSTREAM";
        }

            var param = {
                elem: elemStr,
                level: '9999',
                year: year,
                month: month,
                day: day,
                hour: hour
            }
            var paramUrl = '/prognostics/realData';
            if (stateType == "state_fc"){
                paramUrl = '/prognostics/fcData';
                param.level = '9999';
            }
            XHW.C.http.get(XHW.C.http.weatherUrl, paramUrl, param, function (result) {
                var data = result.data;
                var paramType = result.elem;
                if (paramType == "ALL"){ //天气态势
                    paramType = 'state_weather';
                    legend = '<p class="oneLi">天气区</p><ul class="weatherStateUl">';
                }
                // if (paramType == "RAIN,VIS,CONVECT"){ //天气态势
                //     paramType = 'state_weather';
                //     legend = '<p class="oneLi">天气区</p><ul class="weatherStateUl">';
                // }
                else if (paramType=="WIND,WAVE"){ //风浪
                    paramType = 'state_wind_wave';
                    legend = '<p class="oneLi">风浪区</p><ul class="weatherStateUl">';
                }
                else if (paramType=="GROOVE,FRONT,JETSTREAM"){ // 冷暖风 槽线
                    paramType = 'state_lines';
                    legend = '<p class="oneLi">天气形势</p><ul class="weatherStateUl clearfix">';
                }
                // else if (paramType=="ALL"){
                //     paramType = 'state_fc';
                // }
                if (data == null && data == "" && typeof(data) == "undefined") {

                    var index = stateTypes.indexOf(paramType);
                    var item = items[index];
                    item.htmlLayer = stateTypesCH[index];
                    XHW.C.layerC.updateLayerData(paramType, item);
                }
                else {

                    var time = result.time;
                    var date = new Date(time.substring(0, 4), parseInt(time.substring(4, 6)) -1,
                        time.substring(6, 8), time.substring(8, 10));
                    if (time.length > 11) {
                        let vti = time.substring(11);
                        var Ntime = new Date(date.getTime() + 
                            (parseInt(vti) * 60 *60 *1000));
                        date = Ntime;
                    }
                    //世界时转北京时加8小时
                    var date1 = new Date(date.getTime() + 8 * 60 * 60 * 1000);
                    var layerDate1 = (date1.getMonth() + 1) + '月' + date1.getDate() + '日 ' +
                        (date1.getHours() < 10 ? '0' + date1.getHours() : date1.getHours())
                        + ':' +
                        (date1.getMinutes() < 10 ? '0' + date1.getMinutes() : date1.getMinutes());

                    var markDate = date1.getDate() + '日' +
                        (date1.getHours() < 10 ? '0' + date1.getHours() : date1.getHours()) + '时';
                    var index = stateTypes.indexOf(paramType);
                    drawFeaturesByData(data,paramType, markDate);
                    // splice()的前两参数指定了需要删除的数组元素，紧随其后任意多个参数指定需要插入到数组的元素，以至于splice可以实现添加、删除和修改功能。实际上不是修改，只是先删除一个元素再把后面插入的元素插入到那个位置。
                    // timeArr.splice(index,1,time);
                    // var item = items[index];
                    // item.htmlLayer = layerDate1 + '  ' + stateTypesCH[index]; 
                    var iconTypes = uniq(iconType);
                    var iconNames = uniq(iconName);
                    for(var i = 0; i < iconTypes.length; i++){
                        if(iconNames[i] == '风向杆') iconTypes[i] = 'SYMBOLWIND5';
                        legend += '<li><img src="img/weatherState/'+ iconTypes[i]+'.png" width="25" alt="" /><span>'+iconNames[i]+' </span></li>';
                    };
                    legend += '</ul>';
                    var item = XHW.C.layerC.createItem(layerDate1 + '  ' + stateTypesCH[index], legend, function () {
                        $('#' + stateTypes[index]).parent().removeClass('currenterJiBtn');
                        $('#' + stateTypes[index]).prev().attr('src', $('#' + stateTypes[index]).prev().attr('mysrcpri'));
                        delLayer(stateTypes[index]);                       
                    })
                    items.push(item);
                    XHW.C.layerC.addLayer(paramType, item);
                    // XHW.C.layerC.updateLayerData(paramType, item);
                }
            })

    }


    $("#bt_drawState").click(function () {
        // if(!$(this).parent().hasClass('current')) {
        //     open();
        // } else {
        //     close();
        // }
    });
    setTimeout(() => {
        $("#bt_drawState").click();
    }, 500);
    //根据文件名获取具体的js 并绘制
    $("#getHanderDraw").on('click', function () {
        var filePath = $(this).attr('tid');//获取绝对路径
        $.ajax({
            data: {filePath: filePath},
            url: 'fileController/getHanderDraw',
            type: 'post',
            success: function (obj) {
                if (obj.HanderDraw == null && obj.HanderDraw == ""
                    && typeof(obj.HanderDraw) == "undefined") {
                    return;
                }
                //删除之前的手绘
                delLayer(drawType);
                var drawData = JSON.parse(obj.HanderDraw);
                var layerVector = drawData.layerVector;
                for (var i = 0; i < layerVector.length; i++) {
                    var vector = layerVector[i];
                    var vectorName = vector.name;
                    var features = vector.features;
                    var newFeatures = [];
                    for (var j = 0; j < features.length; j++) {
                        var geometry = features[j].geometry;
                        var geometryType = geometry.geometryType;
                        var coordinates = geometry.coordinates;


                        var newGeometry;
                        if (geometryType == 'Circle') {
                            newGeometry = new ol.geom.Circle(coordinates);
                        } else if (geometryType == 'Polygon') {
                            newGeometry = new ol.geom.Polygon(coordinates);
                        } else if (geometryType == 'MultiPolygon') {
                            newGeometry = new ol.geom.MultiPolygon(coordinates);
                        } else if (geometryType == 'LineString') {
                            newGeometry = new ol.geom.LineString(coordinates);
                        } else if (geometryType == 'MultiLineString') {
                            newGeometry = new ol.geom.MultiLineString(coordinates);
                        } else if (geometryType == 'LinearRing') {
                            newGeometry = new ol.geom.LinearRing(coordinates);
                        } else if (geometryType == 'Point') {
                            newGeometry = new ol.geom.Point(coordinates);
                        } else if (geometryType == 'MultiPoint') {
                            newGeometry = new ol.geom.MultiPoint([coordinates]);
                        }
                        var newFeature = new ol.Feature({
                            geometry: newGeometry
                        });

                        var newFeatureStyle = new ol.style.Style();
                        var featureStyle = features[j].style;
                        var fill = featureStyle.fill;
                        if (fill) {
                            var fillColor = fill.color;
                            var fill = new ol.style.Fill({
                                color: fillColor
                            });
                            newFeatureStyle.setFill(fill);
                        }

                        var stroke = featureStyle.stroke;
                        if (stroke) {
                            var strokeColor = stroke.color;
                            var strokeWidth = stroke.width;
                            var stroke = new ol.style.Stroke({
                                color: strokeColor,
                                width: strokeWidth
                            });
                            newFeatureStyle.setStroke(stroke);
                        }

                        newFeature.setStyle(newFeatureStyle);
                        // var feature = new ol.Feature();

                        newFeatures.push(newFeature);
                    }

                    var layer = new ol.layer.Vector({
                        name: vectorName,
                        source: new ol.source.Vector({
                            features: newFeatures
                        })
                    })
                    layer.setZIndex(5);
                    XHW.map.addLayer(layer);
                }
            }
        });
    })


// });


    function sectionInfo(event, elem, type) {
        if (type) {
            $('#sectionType').val(type);
        } else {
            type = $('#sectionType').val();
        }

        var yscaleCanvas = document.getElementById('yscaleCanvas');
        var contextCanvas = document.getElementById('contextCanvas');
        var yaxisCtx = yscaleCanvas.getContext("2d");
        var contextCtx = contextCanvas.getContext("2d");

        var xscale = 50, yscale = 30, offset = 5;
        var yAxisData = ["0100", "0200", "0300", "0400", "0500", "0600", "0650", "0700", "0750", "0800", "0850", "0900", "0925", "0950", "0975"];
        //yscale*2 上下留空
        var height = yscale * yAxisData.length + yscale * 2;
        yscaleCanvas.height = height;
        contextCanvas.height = height;
        if (type == 'space') {
            var lngArray = $("[name='pointLng']");
            var latArray = $("[name='pointLat']");
            var lats = "";
            var lngs = "";
            var flag = true;
            $.each(lngArray, function (i, item) {
                var tmpLng = $(item).val();
                var tmpLat = $(latArray[i]).val();
                if (checkLatRange(tmpLat) && checkLngRange(tmpLng)) {
                    if (i < lngArray.length - 1) {
                        lats += tmpLat + ",";
                        lngs += tmpLng + ",";
                    } else {
                        lats += tmpLat;
                        lngs += tmpLng;
                    }
                } else {
                    alert("经纬度格式不正确！");
                    flag = false;
                    return false;
                }
            });
            if (!flag) {
                return false;
            }
            $.ajax(appendInfoToURL(server_url + "gfs/spaceprofiledata"),
                {
                    cache: false,
                    dataType: 'json',
                    timeout: 10000,
                    data: {
                        dataType: 'json',
                        lat: lats,
                        lng: lngs
                    },
                    success: function (data) {
                        if (data.status_code == 0) {
                            var timeArray = data.time.split('_');
                            var slatlng = convertLatLng($(latArray[0]).val(), $(latArray[0]).val());
                            var elatlng = convertLatLng($(latArray[latArray.length - 1]).val(), $(lngArray[lngArray.length - 1]).val());
                            $('#profil_title').html(slatlng + "~" + elatlng + moment(timeArray[0], 'YYYYMMDDHHmm').add(parseInt(timeArray[1]), 'hour').format('DD日HH时') + '未来24小时剖面图');
                            var latlngs = data.data.latlngs;
                            var profileDatas = data.data.profiledatas;
                            drawYAxis();
                            drawSpaceXAxis(latlngs);
                            // drawGribLine(latlngs);
                            drawData(latlngs, profileDatas, elem);
                            $('.profil').stop().fadeIn(300);
                            winResize();
                        } else {
                            alert(data.status_msg);
                        }
                    },
                    error: function () {
                        alert("请求服务失败！");
                    }
                });
        } else if (type == 'time') {
            var dotLat = $('#dotLat').val();
            var dotLng = $('#dotLng').val();
            if (checkLatRange(dotLat) && checkLngRange(dotLng)) {
                $.ajax(appendInfoToURL(server_url + "gfs/timeprofiledata"),
                    {
                        cache: false,
                        dataType: 'json',
                        timeout: 10000,
                        data: {
                            dataType: 'json',
                            lat: dotLat,
                            lng: dotLng
                        },
                        success: function (data) {
                            if (data.status_code == 0) {
                                var timeArray = data.time.split('_');
                                $('#profil_title').html(convertLatLng(dotLat, dotLng) + moment(timeArray[0], 'YYYYMMDDHHmm').add(parseInt(timeArray[1]), 'hours').format('DD日HH时') + '未来24小时剖面图');
                                var times = data.data.times;
                                var profileDatas = data.data.profiledatas;
                                drawYAxis();
                                drawTimesXAxis(times);
                                // drawGribLine(latlngs);
                                drawData(times, profileDatas, elem);
                                $('.profil').stop().fadeIn(300);
                                winResize();
                            } else {
                                alert(data.status_msg);
                            }
                        },
                        error: function () {
                            alert("请求服务失败！");
                        }
                    });
            }
        }


        function drawYAxis() {
            yscaleCanvas.width = 40;
            yaxisCtx.beginPath();
            yaxisCtx.fillStyle = '#FFF';
            yaxisCtx.strokeStyle = '#FFF';
            yaxisCtx.lineWidth = 2;
            yaxisCtx.moveTo(yscaleCanvas.width, yscale * 0.5);
            $.each(yAxisData, function (i, item) {
                yaxisCtx.fillText(item, offset, yscale * (i + 1.5));//字体垂直居中
                yaxisCtx.lineTo(yscaleCanvas.width, yscale * (i + 2));

            });
            yaxisCtx.stroke();
            yaxisCtx.closePath();
        }

        function drawGribLine(latlngs) {
            contextCtx.restore();
            contextCtx.strokeStyle = 'black';
            contextCtx.fillStyle = 'black';
            contextCtx.lineWidth = 1;
            $.each(yAxisData, function (i, item) {
                contextCtx.beginPath();
                contextCtx.moveTo(0, yscale * (i + 1));
                $.each(latlngs, function (n, item1) {
                    contextCtx.lineTo(xscale * n + xscale, yscale * (i + 1));
                });
                contextCtx.stroke();
                contextCtx.closePath();
            });
        }

        function drawSpaceXAxis(latlngs) {
            contextCanvas.width = 40;
            contextCanvas.width = xscale * latlngs.length;
            contextCtx.beginPath();
            contextCtx.fillStyle = '#FFF';
            contextCtx.strokeStyle = '#FFF';
            contextCtx.lineTo(0, height - yscale);
            $.each(latlngs, function (i, item) {
                contextCtx.fillText(item.split(',')[0], xscale * i + offset, height - offset * 0.8);
                contextCtx.fillText(item.split(',')[1], xscale * i + offset, height - offset * 3);
                contextCtx.lineTo(xscale * i + xscale, height - yscale);
            });
            contextCtx.stroke();
            contextCtx.closePath();
        }

        function drawTimesXAxis(times) {
            contextCanvas.width = 40;
            contextCanvas.width = xscale * times.length;
            contextCtx.beginPath();
            contextCtx.fillStyle = '#FFF';
            contextCtx.strokeStyle = '#FFF';
            contextCtx.lineTo(0, height - yscale);
            $.each(times, function (i, item) {
                contextCtx.fillText(moment(item, "YYYYMMDDHH").format('MM/DD'), xscale * i + offset, height - offset * 0.8);
                contextCtx.fillText(moment(item, "YYYYMMDDHH").format('HH时'), xscale * i + offset + 4, height - offset * 3);
                contextCtx.lineTo(xscale * i + xscale, height - yscale);
            });
            contextCtx.stroke();
            contextCtx.closePath();
        }

        function drawData(latlngs, data, type) {
            if (type == 'RH') {
                drawRH();
            } else if (type == 'TRUB') {
                drawTurb();
            } else {
                drawIce();
            }
            drawHH(latlngs);
            drawWind(latlngs);
            drawTT();

            function drawTurb() {
                contextCtx.beginPath();
                $.each(yAxisData, function (n, item1) {
                    $.each(latlngs, function (i, item2) {
                        var dangerData = data[i].DANGER;
                        if (dangerData) {
                            var levelData = dangerData[yAxisData[n]];
                            if (levelData) {
                                var turb = levelData.TURB;
                                var color = getFillColor("TURB", turb);
                                var x = xscale * i;
                                var y = yscale * (n + 1);
                                contextCtx.fillStyle = color;
                                contextCtx.fillRect(x, y, xscale, yscale);
                            }
                            contextCtx.closePath();
                        }
                    });
                });
            }


            function drawWind(latlngs) {
                contextCtx.beginPath();
                $.each(yAxisData, function (n, item1) {
                    $.each(latlngs, function (i, item2) {
                        var gfsData = data[i].GFS;
                        if (gfsData) {
                            var wswd = gfsData[yAxisData[n]];
                            if (wswd.UU && wswd.VV) {
                                var x = xscale * i;
                                var y = yscale * n + yscale;
                                var wind = WindUtil.getWsAndWd(wswd.UU, wswd.VV);
                                var image = new Image();
                                image.src = crateWindCanvas(wind.ws, wind.wd, '#AB7A49').toDataURL("image/png");
                                contextCtx.drawImage(image, x, y, yscale, yscale);
                            }
                        }
                    });
                });
                contextCtx.closePath();
            }

            function drawHH(latlngs) {
                contextCtx.strokeStyle = '#FFF';
                contextCtx.fillStyle = '#FFF';
                contextCtx.lineWidth = 1;
                var position = calPosition(latlngs);
                $.each(position, function (i, item) {
                    contextCtx.beginPath();
                    for (var l = 0; l < item.length; l++) {
                        if (l == 0) {
                            contextCtx.moveTo(item[0].x, item[0].y);
                            contextCtx.fillText(item[l].label, 5, item[l].y)
                        } else {
                            contextCtx.lineTo(item[l].x, item[l].y);
                        }
                    }
                    contextCtx.stroke();
                    contextCtx.closePath();
                });

            }


            function calPosition(latlngs) {
                var heigtLevels = [10000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1000, 500];
                var resData = [];
                for (var i = 0; i < heigtLevels.length; i++) {
                    var position = [];
                    for (var m = 0; m < latlngs.length; m++) {
                        for (var n = 0; n < yAxisData.length; n++) {
                            var gfsData1 = data[m].GFS;
                            if (gfsData1) {
                                var hhData1 = gfsData1[yAxisData[n]];
                                var hh1 = Math.round(hhData1.HH);
                                if (n < yAxisData.length - 1) {
                                    var hhData2 = gfsData1[yAxisData[n + 1]];
                                    var hh2 = Math.round(hhData2.HH);
                                    if (heigtLevels[i] <= hh1 && heigtLevels[i] >= hh2) {
                                        var x = xscale * m + xscale * 0.5;
                                        var y = (1 - ((heigtLevels[i] - hh2) / (hh1 - hh2)) + n) * yscale + yscale * 1.5;
                                        var point = {'x': x, 'y': y, 'label': heigtLevels[i] + '米'};
                                        position.push(point);
                                        break;
                                    }
                                } else {
                                    var x = xscale * m;
                                    var y = ((1 - heigtLevels[i] / hh1) + n) * yscale + yscale * 1.5 /*+ yscale * 0.5 - offset*/;
                                    var point = {'x': x, 'y': y, 'label': heigtLevels[i] + '米'};
                                    position.push(point);
                                }
                            }
                        }
                    }
                    resData.push(position);
                }
                return resData;
            }

            function drawIce() {
                contextCtx.beginPath();
                $.each(yAxisData, function (n, item1) {
                    $.each(latlngs, function (i, item2) {
                        var dangerData = data[i].DANGER;
                        if (dangerData) {
                            var levelData = dangerData[yAxisData[n]];
                            if (levelData) {
                                var ice = levelData.ICE;
                                var color = getFillColor("ICE", ice);
                                // var numReg = /^[0-9]+.?[0-9]*$/;
                                /* var numReg = /^(-?\d+)(\.\d+)?$/;
                                 if (numReg.test(tt)) {*/
                                // var x = xscale * i + offset + xscale * 0.5 - contextCtx.measureText(tt).width;
                                var x = xscale * i  /*+ xscale * 0.5 - contextCtx.measureText(tt).width*/;
                                // var y = yscale * n + yscale * 0.5 - offset;
                                var y = yscale * (n + 1);
                                contextCtx.fillStyle = color;
                                contextCtx.fillRect(x, y, xscale, yscale);
                                //   contextCtx.fillText(tt, x, y);
                                //  }
                            }
                            contextCtx.closePath();
                        }
                    });
                });
            }

            function drawRH() {
                contextCtx.beginPath();
                $.each(yAxisData, function (n, item1) {
                    $.each(latlngs, function (i, item2) {
                        var gfsData = data[i].GFS;
                        if (gfsData) {
                            var levelData = gfsData[yAxisData[n]];
                            if (levelData) {
                                var rh = levelData.RH;
                                var color = getFillColor("RH", rh);
                                // var numReg = /^[0-9]+.?[0-9]*$/;
                                /* var numReg = /^(-?\d+)(\.\d+)?$/;
                                 if (numReg.test(tt)) {*/
                                // var x = xscale * i + offset + xscale * 0.5 - contextCtx.measureText(tt).width;
                                var x = xscale * i  /*+ xscale * 0.5 - contextCtx.measureText(tt).width*/;
                                // var y = yscale * n + yscale * 0.5 - offset;
                                var y = yscale * (n + 1);
                                contextCtx.fillStyle = color;
                                contextCtx.fillRect(x, y, xscale, yscale);
                                //   contextCtx.fillText(tt, x, y);
                                //  }
                            }
                            contextCtx.closePath();
                        }
                    });
                });
            }

            function drawTT() {
                contextCtx.beginPath();
                contextCtx.fillStyle = "#C21514";
                $.each(yAxisData, function (n, item1) {
                    $.each(latlngs, function (i, item2) {
                        var gfsData = data[i].GFS;
                        // var levelData = gfsData[yAxisData[n]];
                        var levelData = typeof(gfsData) != 'undefined' ? gfsData[yAxisData[n]] : '';
                        if (levelData) {
                            var tt = Math.round(levelData.TT);
                            // var numReg = /^[0-9]+.?[0-9]*$/;
                            /* var numReg = /^(-?\d+)(\.\d+)?$/;
                             if (numReg.test(tt)) {*/
                            var x = xscale * i + offset + xscale * 0.5 - contextCtx.measureText(tt).width;
                            // var y = yscale * (n + 1);
                            var y = yscale * (n + 1.5);
                            contextCtx.fillText(tt, x, y);
                            //  }
                        }
                        contextCtx.closePath();
                    });
                });
            }
        }
    }


    function dotSection(type) {
        // $('#dotSection').addClass('clickColor');
//时间
        sectionInfo(event, 'RH', 'time')
    }

    function modifyLine() {
        var lngArray = $("[name='pointLng']");
        var latArray = $("[name='pointLat']");
        var list = [];
        var flag = true;
        $.each(lngArray, function (i, lng) {
            if (checkLatRange($(latArray[i]).val()) && checkLngRange($(lng).val())) {
                list.push([parseFloat($(lng).val()), parseFloat($(latArray[i]).val())]);
            } else {
                //  alert('经纬度格式不正确！');
                flag = false;
                return false;
            }
        });
        if (!flag) {
            return false;
        }
        ff = drawFeatures.item(0);
        // list = smoothLine(list, 0.1, 0.24);
        if (ff)
            ff.getGeometry().setCoordinates(list);
    }

    var stationradarmapKey = 0;
    var stationradarmapCity;
    var stationradarmapLatLng;
    var stationradarmapData;
    var stationradarmapLayerName;
    var stationradarmapZindex;

//单站雷达图显示
    function addStationradarmap(city, latlng, data, layerName, zIndex) {
        zIndex = zIndex ? zIndex : 50;
        stationradarmapCity = city;
        stationradarmapLatLng = latlng;
        stationradarmapData = data;
        stationradarmapLayerName = layerName;
        stationradarmapZindex = zIndex;

        var date = data[stationradarmapKey].date;
        var month = date.substring(4, 6);
        var day = date.substring(6, 8);
        var hour = date.substring(8, 10);
        var minute = date.substring(10, 12);
        var show = '<li>' + city + "  " + month + "月" + day + "日" + hour + ":" + minute + "   单站雷达图" + '</li>' + "<li onclick='upperStationradarmap()'>" + "上一张" + "</li>" + "<li onclick='lowerStationradarmap()'>" + "下一张" + "</li>";
        var url = server_url + data[stationradarmapKey].url;
        var extent = [data[stationradarmapKey].slng.toFixed(2), data[stationradarmapKey].slat.toFixed(2),
            data[stationradarmapKey].elng.toFixed(2), data[stationradarmapKey].elat.toFixed(2)];
        var layers = [];
        layers.push(createHimawariLayer(extent, zIndex, url));
        var himawariLayer = new ol.layer.Group({
            //层次渲染的z-index。在渲染时，层将被排序，首先由Z-index然后按位置。默认的Z-index为0
            zIndex: zIndex,
            name: layerName,
            layers: layers
        });
        var latlngs = [];
        latlngs = latlng.split(",");
        var lng = parseFloat(latlngs[1]);
        var lat = parseFloat(latlngs[0]);
        var view = XHW.map.getView();
        view.setZoom(7);
        view.setCenter([lng, lat]);
        himawariLayer.setZIndex(5);
        XHW.map.addLayer(himawariLayer);
        $('#mapTitle').show();
        $('#mapTitle').html(show);
    }

//单站雷达上一张
    function upperStationradarmap() {
        if (stationradarmapKey == 0) {
            alert("当前为第一张单站雷达图");
        } else {
            stationradarmapKey = stationradarmapKey - 1;
            delLayer('himawariLevel2Layer');
            addStationradarmap(stationradarmapCity, stationradarmapLatLng, stationradarmapData, stationradarmapLayerName, stationradarmapZindex);
        }

    }

//单站雷达下一张
    function lowerStationradarmap() {
        if (stationradarmapKey == stationradarmapData.length - 1) {
            alert("当前为最后一张单站雷达图");
        } else {
            stationradarmapKey = stationradarmapKey + 1;
            delLayer('himawariLevel2Layer');
            addStationradarmap(stationradarmapCity, stationradarmapLatLng, stationradarmapData, stationradarmapLayerName, stationradarmapZindex);
        }
    }

    var radarmapKey = 0;
    var radarmapData;
    var radarmapLayerName;
    var radarmapZindex;

//区域雷达
    function addRadarmap(data, layerName, zIndex) {
        radarmapData = data;
        radarmapLayerName = layerName;
        radarmapZindex = zIndex;
        var date = data[radarmapKey].date;
        var month = date.substring(4, 6);
        var day = date.substring(6, 8);
        var hour = date.substring(8, 10);
        var minute = date.substring(10, 12);
        var show = '<li>' + month + "月" + day + "日" + hour + ":" + minute + "   全国雷达图" + '</li>' + "<li onclick='upperRadarmap()'>" + "上一张" + "</li>" + "<li onclick='lowerRadarmap()'>" + "下一张" + "</li>";
        var url = server_url + data[radarmapKey].url;
        var extent = [data[radarmapKey].slng.toFixed(2), data[radarmapKey].slat.toFixed(2), data[radarmapKey].elng.toFixed(2), data[radarmapKey].elat.toFixed(2)];
        var layers = [];
        layers.push(createHimawariLayer(extent, zIndex, url));
        var himawariLayer = new ol.layer.Group({
            //层次渲染的z-index。在渲染时，层将被排序，首先由Z-index然后按位置。默认的Z-index为0
            zIndex: zIndex,
            name: layerName,
            layers: layers
        });
        var view = XHW.map.getView();
        view.setZoom(4);
        himawariLayer.setZIndex(5);
        XHW.map.addLayer(himawariLayer);
        $('#mapTitle').show();
        $('#mapTitle').html(show);
    }

//区域雷达上一张
    function upperRadarmap() {
        if (radarmapKey == 0) {
            alert("当前为第一张全国雷达图");
        } else {
            radarmapKey = radarmapKey - 1;
            delLayer('himawariLevel2Layer');
            addRadarmap(radarmapData, radarmapLayerName, radarmapZindex);
        }
    }

//区域雷达下一张
    function lowerRadarmap() {
        if (radarmapKey == radarmapData.length - 1) {
            alert("当前为最后一张全国雷达图");
        } else {
            radarmapKey = radarmapKey + 1;
            delLayer('himawariLevel2Layer');
            addRadarmap(radarmapData, radarmapLayerName, radarmapZindex);
        }
    }

    var cloudmapKey = 0;
    var cloudmapData;
    var cloudmaplayerName;
    var cloudmapZindex;

//云图
    function addCloudmap(data, layerName, zIndex) {
        cloudmapData = data;
        cloudmaplayerName = layerName;
        cloudmapZindex = zIndex;
        var date = data[cloudmapKey].date;
        var month = date.substring(4, 6);
        var day = date.substring(6, 8);
        var hour = date.substring(8, 10);
        var minute = date.substring(10, 12);
        var show = '<li>' + month + "月" + day + "日" + hour + ":" + minute + "   云图" + '</li>' + "<li onclick='upperCloudmap()'>" + "上一张" + "</li>" + "<li onclick='lowerCloudmap()'>" + "下一张" + "</li>";
        var url = server_url + data[cloudmapKey].url;
        var extent = [data[cloudmapKey].slng.toFixed(2), data[cloudmapKey].slat.toFixed(2), data[cloudmapKey].elng.toFixed(2), data[cloudmapKey].elat.toFixed(2)];
        var layers = [];
        layers.push(createHimawariLayer(extent, zIndex, url));
        var himawariLayer = new ol.layer.Group({
            //层次渲染的z-index。在渲染时，层将被排序，首先由Z-index然后按位置。默认的Z-index为0
            zIndex: zIndex,
            name: layerName,
            layers: layers
        });
        var view = XHW.map.getView();
        view.setZoom(3);
        himawariLayer.setZIndex(5);
        XHW.map.addLayer(himawariLayer);

        $('#mapTitle').show();
        $('#mapTitle').html(show);
    }

//云图上一张
    function upperCloudmap() {
        if (cloudmapKey == 0) {
            alert("当前为第一张云图")
        } else {
            cloudmapKey = cloudmapKey - 1;
            delLayer('himawariLevel2Layer');
            addCloudmap(cloudmapData, cloudmaplayerName, cloudmapZindex);
        }
    }

//云图下一张
    function lowerCloudmap() {
        if (cloudmapKey == cloudmapData.length - 1) {
            alert("当前为最后一张云图");
        } else {
            cloudmapKey = cloudmapKey + 1;
            delLayer('himawariLevel2Layer');
            addCloudmap(cloudmapData, cloudmaplayerName, cloudmapZindex);
        }
    }

//台风路径
    function typhoonRoute(array) {
        var aa = [[110.81, 25.87], [114.17, 26.79], [112.52, 28.22], [115.20, 29.43], [112.70, 31.69]];
        var coldLineString = new ol.geom.LineString();
        for (var i = 0; i < aa.length; i++) {
            coldLineString.appendCoordinate(aa[i]);
        }
        var coldFeature = new ol.Feature({
            name: '台风',
            geometry: coldLineString
        });
        coldFeature.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(200,50,50,0.3)'
            }),
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 2
            })
        }));

        var coldLayers = new ol.layer.Vector({
            zIndex: 105,
            wrapX: true,
            name: "coldLayers",
            source: new ol.source.Vector({
                features: [coldFeature]
            })
        });
        coldLayers.setZIndex(10);
        XHW.map.addLayer(coldLayers);
    }

    function createHimawariLayer(extent, zIndex, url) {
        //'http://weather.xinhong.net/images/radarmap//2017/20170309/xhradar_ebref_achn_l88_pi_20170309062400001.png',
        var layer = new ol.layer.Image({
            //层的Z指数
            zIndex: zIndex,
            // name: layerName,
            //这一层的来源
            source: new ol.source.ImageStatic({
                //  wrapX: wrapX,
                url: url,
                //投影
                projection: projection,
                //地图坐标中的图像范围。图像的[左，底，右，上]地图坐标
                imageExtent: extent
            })
        });
        return layer;
    }

    function addStaticImage(data, layerName, zIndex) {
        zIndex = zIndex ? zIndex : 50;

        var files = data.url;
        var latScale = Math.abs(data.elat - data.slat);
        var lngScale = Math.abs(data.elng - data.slng);
        var layers = [];
        //var extent = [lngScale + data.slng, data.elat - latScale - latScale, lngScale + data.slng + lngScale, data.elat - latScale];
        var extent = [105, 16, 135, 32];
        layers.push(createHimawariLayer(extent, zIndex, server_url + files));
        var himawariLayer = new ol.layer.Group({
            //层次渲染的z-index。在渲染时，层将被排序，首先由Z-index然后按位置。默认的Z-index为0
            zIndex: zIndex,
            name: layerName,
            layers: layers
        });
        himawariLayer.setZIndex(5);
        XHW.map.addLayer(himawariLayer);

    }


    function drawIsolinesLayer1(obj, elem) {
        var datas = obj.data.lines;
        var labelBaseVal = obj.data.labelBaseVal;
        var labelInterVal = obj.data.labelInterVal;

        if (datas || datas.length > 0) {
            var isoLineFeatures = [];
            for (var i = 0; i < datas.length; i++) {
                var data = datas[i];
                var lng = data.lng;
                var points;
                if (lng && lng.length > 0) {
                    points = [lng.length];
                    for (var j = 0; j < lng.length; j++) {
                        var point = [lng[j], data.lat[j]];
                        points[j] = point;
                    }
                }
                var isClose = data.isClose;
                var val = data.val;
                var lineColor = data.lineColor;
                var lineWidth = data.lineWidth;
                if (lineColor) {
                    var color = [lineColor.r, lineColor.g, lineColor.b, 0.9];
                }

                var lineFeatures = new ol.Feature(
                    new ol.geom.LineString(points)
                );
                var lineStyle = new ol.style.Style({
                    // fill:new ol.style.Fill({
                    //     color:color
                    // }),
                    stroke: new ol.style.Stroke({
                        color: color,
                        width: lineWidth
                    })
                });
                lineFeatures.setStyle(lineStyle);
                isoLineFeatures.push(lineFeatures);

                //绘制等值线数值
                if ((labelBaseVal - val) % labelInterVal == 0 && points.length > 5) {
                    var valPoints = [];
                    if (isClose) {
                        var num = parseInt(lng.length * 3 / 4);
                        var point = points[num];
                        valPoints.push(point);
                    } else {
                        valPoints.push(points[0]);
                        valPoints.push(points[points.length - 1]);
                    }
                    for (var k = 0; k < valPoints.length; k++) {
                        var valueFeature = new ol.Feature(
                            new ol.geom.Point(valPoints[k])
                        );
                        var valueStyle = new ol.style.Style({
                            text: new ol.style.Text({
                                text: val.toString(),
                                font: '20px Calibri',
                                fill: new ol.style.Fill({
                                    color: color,

                                })
                                ,
                                stroke: new ol.style.Stroke({
                                    color: color,
                                    width: 1.5
                                })
                            })
                        });
                        valueFeature.setStyle(valueStyle);
                        isoLineFeatures.push(valueFeature);
                    }
                }

                //绘制高低冷暖
                if (data.clng && data.clat) {
                    var clng = data.clng;
                    var clat = data.clat;
                    var ctype = data.ctype;
                    var cColor;
                    var typeName;
                    if (elem == "PR" || elem == "HH") {
                        if (ctype == "L") {
                            typeName = '低';
                            cColor = 'red';
                        } else if (ctype == "H") {
                            typeName = '高';
                            cColor = 'blue';
                        }
                    } else if (elem == "TT") {
                        if (ctype == "L") {
                            typeName = '冷';
                            cColor = 'red';
                        } else if (ctype == "H") {
                            typeName = '暖';
                            cColor = 'blue';
                        }
                    }
                    var pointFeature = new ol.Feature(
                        new ol.geom.Point([clng, clat])
                    );
                    var pointStyle = new ol.style.Style({
                        text: new ol.style.Text({
                            text: typeName,
                            font: '25px Calibri',
                            fill: new ol.style.Fill({
                                color: cColor,

                            })
                            ,
                            stroke: new ol.style.Stroke({
                                color: cColor,
                                width: 1.5
                            })
                        })
                    });
                    pointFeature.setStyle(pointStyle);
                    isoLineFeatures.push(pointFeature);
                }
            }
            var isolineLayer = new ol.layer.Vector({
                name: "isolineLayer",
                source: new ol.source.Vector({
                    features: isoLineFeatures
                })
            });
            isolineLayer.setZIndex(10);
            XHW.map.addLayer(isolineLayer);

        }
    }

    function flyTo(location, done) {
        var view = XHW.map.getView();
        var duration = 2000;
        var zoom = 6;//view.getZoom();
        var parts = 2;
        var called = false;

        function callback(complete) {
            --parts;
            if (called) {
                return;
            }
            if (parts === 0 || !complete) {
                called = true;
                done(complete);
            }
        }

        view.animate({
            center: location,
            duration: duration
        }, callback);
        view.animate({
            zoom: zoom - 1,
            duration: duration / 2
        }, {
            zoom: zoom,
            duration: duration / 2
        }, callback);
    }

//绘制机场
    function addAirPortOverlay(data) {
        var airPortFeatures = [];
        if (data && data['status_code'] == 0) {
            $.each(data.data, function (i, item) {
                var tmpArr = item.split("_");
                if (tmpArr.length == 6) {
                    var imgData = getImgName(tmpArr[2], tmpArr[0]);
                    var geometry = new ol.geom.Point([tmpArr[3], tmpArr[4]]);

                    var airPortFeature = new ol.Feature({
                        code4: tmpArr[0],
                        date: tmpArr[1],
                        type: tmpArr[2],
                        lng: tmpArr[3],
                        lat: tmpArr[4],
                        airName: tmpArr[5],
                        geometry: geometry
                    });
                    var image = new ol.style.Icon(({
                        // color: '#8959A8',
                        rotation: imgData.angle,//图片旋转弧度。
                        src: 'static/image/weather/runway/' + imgData.imgName,
                        scale: 0.3
                    }));
                    airPortFeature.setStyle(new ol.style.Style({
                        image: image
                    }));
                    airPortFeatures.push(airPortFeature);
                }
            });
            if (airPortFeatures.length > 0) {
                var airPortLayers = new ol.layer.Vector({
                    zIndex: 102,
                    wrapX: wrapX,
                    name: "airPortLayers",
                    source: new ol.source.Vector({
                        features: airPortFeatures
                    })
                });
                airPortLayers.setZIndex(14);
                XHW.map.addLayer(airPortLayers);
            }
        }


        function getImgName(action, code4) {
            var imgName;
            var angle = airPortRunway[code4];
            if (angle == 999) {
                if (action.indexOf("RAIN") > -1 || action.indexOf("CLOTTED GROUND") > -1
                    || action.indexOf("PUFF SNOW") > -1 || action.indexOf("FIRN SNOW") > -1
                    || action.indexOf("SNOW") > -1) {
                    imgName = 'airport_green.png';
                } else if (action.indexOf("SOOT") > -1 || action.indexOf("SAND") > -1 || action.indexOf("STORM") > -1) {
                    imgName = 'airport_brown.png';
                } else if (action.indexOf("THUNDER") > -1) {
                    imgName = 'airport_red.png';
                } /*else if (action.indexOf("SAND")>-1) {
             imgName = R.drawable.airport_brown;
             } else if (action.indexOf("STORM")>-1) {
             imgName = R.drawable.airport_brown;
             }*//* else if (action.indexOf("CLOTTED GROUND")>-1) {
             imgName = R.drawable.airport_green;
             } else if (action.indexOf("PUFF SNOW")>-1) {
             imgName = R.drawable.airport_green;
             } else if (action.indexOf("FIRN SNOW")>-1) {
             imgName = R.drawable.airport_green;
             } else if (action.indexOf("SNOW")>-1) {
             imgName = R.drawable.airport_green;
             } */ else if (action.indexOf("FOG") > -1) {
                    imgName = 'airport_yellow.png';
                } else if (action.indexOf("NONE") > -1) {
                    imgName = 'airport_grey.png';
                }
                angle = 0;
            } else {
                if (action.indexOf("RAIN") > -1 || action.indexOf("CLOTTED GROUND") > -1
                    || action.indexOf("PUFF SNOW") > -1 || action.indexOf("FIRN SNOW") > -1
                    || action.indexOf("SNOW") > -1 || action.indexOf("FOG") > -1) {
                    imgName = 'airport_runway_green.png';
                } else if (action.indexOf("SOOT") > -1 || action.indexOf("SAND") > -1 || action.indexOf("STORM") > -1) {
                    imgName = 'airport_runway_brown.png';
                } else if (action.indexOf("THUNDER") > -1) {
                    imgName = 'airport_runway_red.png';
                } /*else if (action.indexOf("SAND")>-1) {
             imgName = R.drawable.airport_runway_brown;
             } else if (action.indexOf("STORM")>-1) {
             imgName = R.drawable.airport_runway_brown;
             } *//*else if (action.indexOf("CLOTTED GROUND")>-1) {
             imgName = R.drawable.airport_runway_green;
             } else if (action.indexOf("PUFF SNOW")>-1) {
             imgName = R.drawable.airport_runway_green;
             } else if (action.indexOf("FIRN SNOW")>-1) {
             imgName = R.drawable.airport_runway_green;
             } else if (action.indexOf("SNOW")>-1) {
             imgName = R.drawable.airport_runway_green;
             } */ else if (action.indexOf("FOG") > -1) {
                    imgName = 'airport_runway_yellow.png';
                } else if (action.indexOf("NONE") > -1) {
                    imgName = 'airport_runway_gray.png';
                }
                if (angle)
                    angle = Math.PI / 180 * parseInt(angle);
                else
                    angle = 0;

            }
            return {'imgName': imgName, 'angle': angle};
        }
    }

//删除图层
    function delLayer(layerName) {
        if (layerName) {
            var layers = XHW.map.getLayers();
            selectClick.getFeatures().clear();
            for (var i = 0; i < layers.getLength(); i++) {
                if (layers.item(i).get("name") == layerName) {
                    XHW.map.removeLayer(layers.item(i));
                }
            }
        }
    }

// 风速
function getImage(ws) {
    ws = (ws / 2) >> 0;
    ws = ws * 2;
    
    ws = ws > 72 ? 72 : ws;
    ws = ws < 1 ? 1 : ws;
    ws = ws < 10 ? '0' + ws : ws;
    return 'img/imgs/icon_ws' + ws + '@2x.png';
}

    //重置态势
function resetState() {
    for (let i=0;i<stateTypes.length;i++){
        reset(stateTypes[i]);
    }
    isOpen = [false, false, false, false];
    $('#bt_drawState').parent().removeClass('current');
    $('#weather_state').parent().removeClass('currenterJiBtn');
    $('#weather_state').prev().attr('src', $('#weather_state').prev().attr('mysrcpri'));
    XHW.C.layout.judgeWhetherSelect($('#weather_state'));
}
//重置绘制
function resetHuizhi() {
    delLayer('drawToolLayer');
    //---------删除图层控制
    XHW.C.layerC.removeLayer('drawToolLayer');
    $('.huiZhi').stop().fadeOut(200);
    $('#showJunBiao').parent().removeClass('current');
}

function reset(name) {
    if (name == 'state_fc') {
        $('#' + name).parent().removeClass('current');
    } else {
        //恢复按钮
        $('#' + name).parent().removeClass('currenterJiBtn');
        $('#' + name).prev().attr('src', $('#' + name).prev().attr('mysrcpri'));
    }
    //删除图层
    delLayer(name);
    //---------删除图层控制
    XHW.C.layerC.removeLayer(name);
}

