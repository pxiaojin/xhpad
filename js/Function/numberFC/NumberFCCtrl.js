define(['Controller/DataFormat',
    'Function/numberFC/DrawTypeBuilder',
    'Function/numberFC/WindDrawer',
    'Function/numberFC/ECWindDrawer',
    'Function/numberFC/MixedGraph',
    'Function/numberFC/MixedGraph',
    'Function/numberFC/MixedGraph',
    'Function/numberFC/MixedGraph',
    'Function/point/Airport'
    ], function(format, chartBuilder, gfsWindDrawder, ecWindDrawder, mixedGraph, realMixedGraph,seaMixedGraph,posMixedGraph, airport) {
    
    const items = {
        'real_mixedGraph': {'elem': 'mixedGraph', 'name': '实况综合图', 'options': 'real_mixedGraph_level', 'methodOnLoad': 'click'},
        'numberFC_mixedGraph': {'elem': 'mixedGraph', 'name': '预报综合图', 'options': 'numberFC_mixedGraph_level', 'methodOnLoad': 'click'},
        'sea_mixedGraph': {'elem': 'mixedGraph', 'name': '海洋综合图', 'options': 'sea_mixedGraph_level', 'methodOnLoad': 'click'},
        'pos_mixedGraph': {'elem': 'mixedGraph', 'name': '位置天气综合图', 'options': 'pos_mixedGraph_level', 'methodOnLoad': 'click'},
        'numberFC_tt': {'elem': 'TT', 'name': '气温', 'options': 'numberFC_tt_level', 'methodOnLoad': 'click', 'drawType': 'Isolines'},
        'numberFC_rh': {'elem': 'RH', 'name': '湿度', 'options': 'numberFC_rh_level', 'methodOnLoad': 'click'},
        'numberFC_wind': {'elem': 'WIND', 'name': '风场', 'options': 'numberFC_wind_level', 'methodOnLoad': 'click'},
        'numberFC_pr': {'elem': 'PR', 'name': '海平面气压', 'methodOnLoad': 'click', 'drawType': 'Isolines'},
        'numberFC_hh': {'elem': 'HH', 'name': '位势高度', 'options': 'numberFC_hh_level', 'methodOnLoad': 'click', 'drawType': 'Isolines'},
        'numberFC_vis': {'elem': 'VIS', 'name': '能见度', 'methodOnLoad': 'click'},
        'numberFC_rn': {'elem': 'RN', 'name': '降水', 'options': 'numberFC_rn_type', 'methodOnLoad': 'click'},
        'numberFC_cloud': {'elem': 'CLOUD', 'name': '云', 'options': 'numberFC_cloud_type', 'methodOnLoad': 'click'},
        'numberFC_ice': {'elem': 'ICE', 'name': '积冰', 'options': 'numberFC_ice_level', 'methodOnLoad': 'click'},
        'numberFC_turb': {'elem': 'TURB', 'name': '颠簸', 'options': 'numberFC_turb_level', 'methodOnLoad': 'click'},
        'numberFC_cii': {'elem': 'CII', 'name': '对流不稳定指数', 'options': 'numberFC_cii_type', 'methodOnLoad': 'click'},
        'numberFC_ts': {'elem': 'TS', 'name': '雷暴落区', 'methodOnLoad': 'click'},
    };

    function init(){
        update();
        // airport.open();
        timeBar.addCallback(function(){
            update();
            // airport.open()
        });
    }

    const layerMap = {};

    function trigger(funcId) {
        if (funcId == 'numberFC_mixedGraph') {
            // $('#moShiQieHuang').show();
            mixedGraph.open('numberFC_mixedGraph', getOption(funcId), function(){
                console.log(funcId)
                let item = items[funcId];
                let button =  $('#' + funcId);
                //---------取消按钮选中样式
                button.parent().removeClass('currenterJiBtn');
                button.prev().attr('src',button.prev().attr('mysrcpri'));
                XHW.C.layout.judgeWhetherSelect(button);
                if (item && item.hasOwnProperty('options')) {
                    $('#' + item.options).hide();
                }
            });
        } else if (funcId == 'sea_mixedGraph') {
            seaMixedGraph.open('sea_mixedGraph', getOption(funcId), function(){
                let item = items[funcId];
                let button =  $('#' + funcId);
                //---------取消按钮选中样式
                button.parent().removeClass('currenterJiBtn');
                button.prev().attr('src',button.prev().attr('mysrcpri'));
                XHW.C.layout.judgeWhetherSelect(button);
            });
        } else if (funcId == 'pos_mixedGraph') {
            posMixedGraph.open('pos_mixedGraph', getOption(funcId), function(){
                let item = items[funcId];
                let button =  $('#' + funcId);
                //---------取消按钮选中样式
                button.parent().removeClass('currenterJiBtn');
                button.prev().attr('src',button.prev().attr('mysrcpri'));
                XHW.C.layout.judgeWhetherSelect(button);
                if (item && item.hasOwnProperty('options')) {
                    // $('#' + item.options).hide();
                }
            });
        } else if (funcId == 'real_mixedGraph') {
            realMixedGraph.open('real', getOption(funcId), function(){
                let item = items[funcId];
                let button =  $('#' + funcId);
                //---------取消按钮选中样式
                button.parent().removeClass('currenterJiBtn');
                button.prev().attr('src',button.prev().attr('mysrcpri'));
                XHW.C.layout.judgeWhetherSelect(button);
                if (item && item.hasOwnProperty('options')) {
                    // $('#' + item.options).hide();
                }
            });
        } else if (funcId == 'numberFC_wind') {
            // $('#moShiQieHuang').show();
            if (XHW.config.datasource == 'GFS') {
                if (ecWindDrawder){
                    ecWindDrawder.close();
                }
                gfsWindDrawder.open(funcId, getOption(funcId), getOptionDesc(funcId), function () {
                    closeItem(funcId);
                });
            } else {
                if (gfsWindDrawder){
                    gfsWindDrawder.close();
                }
                ecWindDrawder.open(funcId, getOption(funcId), getOptionDesc(funcId), function () {
                    closeItem(funcId);
                });
            }
            $('#haiLang').show();
        } else {
            // $('#moShiQieHuang').show();
            requestData(funcId, function(imgUrl, data, title) {
                draw(funcId, imgUrl, data, title);
            });
        }
    }

    function draw(funcId, imgUrl, data, layerOptions) {
        let layer = layerMap[funcId];
        let drawType = items[funcId].drawType;
        if (drawType == null && data) {
            if (data.lines) {
                drawType = 'Isolines';
            } else if(data.files) {
                drawType = 'MultiImage';
            } else if(data.url) {
                drawType = 'Image';
            }
        }
        let source = buildSource(funcId, imgUrl, drawType, data);
        let layerItem = XHW.C.layerC.createItem(layerOptions.htmlLayer, layerOptions.htmlLegend, function(){
            closeItem(funcId);
        });
        XHW.C.layerC.addLayer(funcId, layerItem);
        if (!source) {
            removeLayer(funcId);
            return;
        }
        if (drawType == 'MultiImage') {
            if (Object.prototype.toString.call(layer) != '[object Array]') {
                removeLayer(funcId);
            }
            if (layer == null) {
                layer = [];
                layerMap[funcId] = layer;
            }
            for (let i = 0; i < source.length; i++) {
                if (layer.length <= i) {
                    let subLayer = new ol.layer.Image();
                    subLayer.setZIndex(chartBuilder.getZIndexOf(items[funcId].elem));
                    if(funcId == 'numberFC_rh'){
                        subLayer.setOpacity(0.5);
                    }else if(funcId == 'numberFC_rn' || funcId == 'numberFC_cii'){
                        subLayer.setOpacity(0.7);
                    }else{

                    };
                    subLayer.id = funcId;
                    XHW.map.addLayer(subLayer);
                    layer.push(subLayer);
                }
                layer[i].setSource(source[i]);
            }
        } else {
            if (Object.prototype.toString.call(layer) == '[object Array]') {
                removeLayer(funcId);
            }
            if (layer == null) {
                if (drawType == 'Isolines') {
                    layer = new ol.layer.Vector();
                } else {
                    layer = new ol.layer.Image();
                }
                layer.setZIndex(chartBuilder.getZIndexOf(items[funcId].elem));
                layer.id = funcId;
                XHW.map.addLayer(layer);
                layerMap[funcId] = layer;
            }
            layer.setSource(source);
        }
    }

    function buildSource(funcId, imgUrl, drawType, data) {
        if (!data)
            return;
        let item = items[funcId];
        if (drawType == 'Isolines') {
            return chartBuilder.buildIsolinesSource(item.elem, data);
        } else if (drawType == 'MultiImage') {
            return chartBuilder.buildImagesSource(imgUrl, item.elem, data);
        } else if (drawType == 'Image') {
            return chartBuilder.buildImageSource(imgUrl, item.elem, data);
        }
    }

    function buildLayerOptions(legend, title) {
        let layerOptions = {};
        layerOptions.htmlLayer = title;
        layerOptions.htmlLegend = legend;
        return layerOptions;
    }
    function getOptionDesc(funcId) {
        let item = items[funcId];
        let currentBlue = $('#' + item.options).children('.currentBlue');
        currentBlue = currentBlue ? currentBlue[0] : undefined;
        if (!currentBlue) {
            currentBlue = $('#' + item.options).children();
            currentBlue = currentBlue ? currentBlue[0] : undefined;
        }
        return currentBlue ? currentBlue.innerText : undefined;
    }

    function getOption(funcId) {
        let item = items[funcId];
        let currentBlue = $('#' + item.options).children('.active');
        currentBlue = currentBlue ? currentBlue[0] : undefined;
        if (!currentBlue) {
            currentBlue = $('#' + item.options).children();
            currentBlue = currentBlue ? currentBlue[0] : undefined;
        }
        // console.log(currentBlue.getAttribute("data-value"))
        return currentBlue ? currentBlue.getAttribute("data-value") : undefined;
    }

    // var test_state;
    // var vti_val = '024';
    // $('#tog_vti').click(function(){
    //     if(!test_state){
    //         test_state =true;
    //         vti_val = '072';
    //     }else{
    //         test_state =false;
    //         vti_val = '024';
    //     }
    //     $(this).html(vti_val);
    // })

    function requestData(funcId, call) {
        let item = items[funcId];
        let elem = item.elem;
        let option = getOption(funcId);
        let datatype = XHW.config.datasource;
        let level = option;

        let host = XHW.C.http.weatherUrl;
        if (datatype != 'GFS') {
            host = XHW.C.http.ecmfUrl;
            // host = 'http://58.213.127.51:9082/xhweatherfcsys';
        }

        let imgUrl = XHW.C.http.imgUrl;
        if (datatype != 'GFS') {
            imgUrl = XHW.C.http.ecmfImgUrl;
        }
        let dataTypeUri = datatype.toLowerCase();
        let uri = '/' + dataTypeUri + '/' + getURIOfElem(elem, option);
        if (datatype == 'ECMF') {
            dataTypeUri = 'ecmf';
            uri = '/' + dataTypeUri + '/' + getURIOfElem(elem, option);
        }      
        let params = {};
        // params['year'] = XHW.silderTime.year;
        // params['month'] = XHW.silderTime.month;       
        // params['day'] = XHW.silderTime.day;
        // if(vti_val == '024'){
        //     params['day'] = XHW.silderTime.day -1;
        // }else{
        //     params['day'] = XHW.silderTime.day -3;
        // }
        // params['hour'] = XHW.silderTime.hour;
        // params['hour'] = '08';
        // params['vti'] = vti_val;
        params['time'] = timeBar.getRequestTime;
        let elemName = item.name;
        let levelDesc = getOptionDesc(funcId);
        if (elem == 'CLOUD' || elem == 'CII' || elem == 'RN'){
            params['elem'] = level;
            params['level'] = '9999';
            elemName = levelDesc;
            levelDesc = '';
        } else if(elem == 'PR'|| elem == 'VIS'|| elem == 'TS') {
            params['elem'] = elem;
            params['level'] = '9999';
            levelDesc = '';
        }else {
            params['elem'] = elem;
            if (level)
                params['level'] = level;
        }
        let legend;
        if(elem == 'TT' || elem == 'HH'){
            legend = '';
        }else{
            legend = chartBuilder.buildLegendHtml(params.elem, elemName);
        }

        XHW.C.http.get(host, uri, params, function(data) {
            var vti = data.time.split('_')[1];
                vti = Number(vti);

            // if(elem == 'RN'){
            //     if(vti <= 72){
            //         elemName = '3h累积降水';
            //     }else{
            //         elemName = '6h累积降水';
            //     }
            // }
            if(option == 'RN'){
                elemName = '3h累积降水';
            }else if(option == 'RN6'){
                elemName = '6h累积降水';
            }else if(option == 'RN12'){
                elemName = '12h累积降水';
            }else if(option == 'RN24'){
                elemName = '24h累积降水';
            }
            let time = format.jsonDate(data.time);
            let title = time[1] + ' ' + (levelDesc?levelDesc:'') + '' + elemName;
            let layerOptions = buildLayerOptions(legend, title);
            if (call) {
                call(imgUrl, data.data, layerOptions);
            }
        }, function() {
            let title = Number(params['month']) + '月' + Number(params['day']) + '日 ' + params['hour'] + ':00 ' + (levelDesc?levelDesc:'') + '' + elemName + '(无数据)';
            let layerOptions = buildLayerOptions(legend, title);
            if (call) {
                call(imgUrl, undefined, layerOptions);
            }
        });

        XHW.map.getView().animate(
            {center: ol.proj.transform([103.68, 32.85], 'EPSG:4326', 'EPSG:3857'), zoom: 4});                
    }

    function closeItem(funcId){
        let item = items[funcId];
        let button =  $('#' + funcId);
        //---------取消按钮选中样式
        button.parent().removeClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrcpri'));
        XHW.C.layout.judgeWhetherSelect(button);
        if (item && item.hasOwnProperty('options')) {
            // $('#' + item.options).hide();
        }

        if (funcId == 'numberFC_mixedGraph') {
            mixedGraph.close();
        } else if (funcId == 'real_mixedGraph') {
            realMixedGraph.close();
        } else if (funcId == 'sea_mixedGraph') {
            seaMixedGraph.close();
        } else if (funcId == 'pos_mixedGraph') {
            posMixedGraph.close();
        }else if (funcId == 'numberFC_wind') {
            if (XHW.config.datasource == 'GFS')
                gfsWindDrawder.close();
            else {
                ecWindDrawder.close();
            }
             // 海浪、海风、预报风都关闭，粒子动态样式隐藏
            // if(!$('#seaWave').parent().hasClass('currenterJiBtn') && !$('#seaWind').parent().hasClass('currenterJiBtn') && !$('#numberFC_wind').parent().hasClass('currenterJiBtn'))
            // $('#haiLang').hide();
        } else {
            //---------删除图层控制
            XHW.C.layerC.removeLayer(funcId);
            removeLayer(funcId);
        }
    }

    function removeLayer(funcId) {
        let layer = layerMap[funcId];
        if (isArray(layer)) {
            layer.forEach(subLayer => {
                XHW.map.removeLayer(subLayer);
            })
        } else {
            XHW.map.removeLayer(layer);
        }
        layerMap[funcId] = null;
        layer = null;
    }

    function isArray(obj) {
        return Object.prototype.toString.call(obj) == '[object Array]';
    }

    function openItem(funcId) {
        let funcModule = items[funcId];
        //---------添加图层控制
        funcModule.item = {};
        funcModule.item.htmlLayer = funcModule.name;
        let button =  $('#' + funcId);
        //---------添加按钮选中样式
        button.parent().addClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrc'));
        XHW.C.layout.judgeWhetherSelect(button);
        trigger(funcId);
    }

    function getURIOfElem(elem, option) {
        switch (elem) {
            case 'HH':
            case 'TT':
            case 'PR':
                return 'isolinedata';
        }
        return 'isosurfacedata';
    }
    // JW 资料使用的接口
    function getEcmfURIOfElem(elem, option) {
        switch (elem) {
            case 'HH':
            case 'TT':
            case 'PR':
                return 'isolinedata/glb';
        }
        return 'isosurfacedata';
    }

    for (let key in items) {
        let element = items[key];
        if (element.methodOnLoad) {
            $('#' + key).on(element.methodOnLoad, function(){
                if ($('#' + key).parent().hasClass('currenterJiBtn')) {                   
                    if(key == 'real_mixedGraph'){
                        closeItem(key);
                    }else{
                        closeItem(key);                                      
                        // if(!$('#multi_select li').hasClass('currenterJiBtn') && !$('#meteo_station').parent().hasClass('current') && !$('#meteo_airport').parent().hasClass('current') && !$('#shuzhiyubao li').hasClass('currenterJiBtn')){
                        //     $('#moShiQieHuang').hide();
                        // }else{
                        //     $('#moShiQieHuang').show();
                        // }
                    } 
                } else {                    
                    if(key == 'real_mixedGraph'){
                        openItem(key);
                    }else{
                        openItem(key);
                        // $('#moShiQieHuang').show();
                    }                    
                }
            });
        } else {
            openItem(key);
        }
        if(element.options) {
            //三级点击
            $('#' + element.options + ' li').on('click', function(event) {
                openItem(key);
            });
        }
    }

    function update() {
        for (let key in items) {
            let button =  $('#' + key);
            //---------添加按钮选中样式
            if (button.hasClass('active')) {
                // console.log(button)
                trigger(key);
            }
        }
    }

    function close() {
        for (let key in items) {
            closeItem(key);
        }
    }

    init();

    return {
        close: close,
        updateSource: update,
        update: update
    }
});