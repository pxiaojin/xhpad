define(['Controller/DataFormat',
    'Function/numberFC/DrawTypeBuilder',
    'Function/numberFC/WindDrawer',
    'Function/numberFC/ECWindDrawer',
    'Function/Sea/SeaFlow',
    'Function/Sea/SeaWind',
    'Function/Sea/SeaWave',
    // 'Function/live/StationLabelDrawer'], function(format, chartBuilder, gfsWindDrawder, ecWindDrawder, ktWindDrawder, stationLabelDrawer) {
    'Function/live/StationLabelDrawer',
    'Function/numberFC/XHJsonVectorFactory'
], function (format, chartBuilder, gfsWindDrawder, ecWindDrawder, seaflow, seawind, seaWave, stationLabelDrawer, VectorFactory) {
    const numberFC_t1279_elems = {
        '': { 'name': '', 'items': { '': '' } }
    }

    const isobaric_presses = [{ 'name': '1000hPa', 'val': '1000' },
    { 'name': '925hPa', 'val': '0925' }];
    const numberFC_items = {
        'numberFC_9999': {
            'name': '地面综合图', 'options': [
                { 'name': '3H变温', 'elem': 'DT03', 'level': '9999', 'levelDesc': '地面' },
                { 'name': '24H变温', 'elem': 'DT24', 'level': '9999', 'levelDesc': '地面', 'visible': true },
                { 'name': '3H变压', 'elem': 'DP03', 'level': '9999', 'levelDesc': '' },
                { 'name': '24H变压', 'elem': 'DP24', 'level': '9999', 'levelDesc': '' },
                { 'name': '2m温度', 'elem': 'T2', 'level': '9999', 'levelDesc': '' },
                { 'name': '2m露点温度', 'elem': 'D2', 'level': '9999', 'levelDesc': '', 'visible': true },
                { 'name': '海平面气压', 'elem': 'PR', 'level': '9999', 'levelDesc': '', 'visible': true },
                { 'name': '10风场', 'elem': 'WIND', 'level': '9999', 'levelDesc': '' }]
        },
        'numberFC_0925': {
            'name': '925hpa综合图', 'options': [
                { 'name': '温度露点差', 'elem': 'TH', 'level': '0925', 'levelDesc': '925hPa', 'visible': true },
                { 'name': '温度', 'elem': 'TT', 'level': '0925', 'levelDesc': '925hPa', 'visible': true },
                { 'name': '位势高度', 'elem': 'HH', 'level': '0925', 'levelDesc': '925hPa', 'visible': true },
                { 'name': '24H变温', 'elem': 'DT24', 'level': '0925', 'levelDesc': '925hPa', 'visible': true },
                { 'name': '散度', 'elem': 'DI', 'level': '0925', 'levelDesc': '925hPa' },
                { 'name': '假相当位温', 'elem': 'TB', 'level': '0925', 'levelDesc': '925hPa' },
                { 'name': '温度露点', 'elem': 'TD', 'level': '0925', 'levelDesc': '925hPa' },
                { 'name': '温度平流', 'elem': 'TC', 'level': '0925', 'levelDesc': '925hPa' },
                { 'name': '风场', 'elem': 'WIND', 'level': '0925', 'levelDesc': '925hPa' }]
        },
        'numberFC_0850': {
            'name': '850hpa综合图', 'options': [
                { 'name': '温度露点差', 'elem': 'TH', 'level': '0850', 'levelDesc': '850hPa', 'visible': true },
                { 'name': '温度', 'elem': 'TT', 'level': '0850', 'levelDesc': '850hPa', 'visible': true },
                { 'name': '位势高度', 'elem': 'HH', 'level': '0850', 'levelDesc': '850hPa', 'visible': true },
                { 'name': '24H变温', 'elem': 'DT24', 'level': '0850', 'levelDesc': '850hPa', 'visible': true },
                { 'name': '散度', 'elem': 'DI', 'level': '0850', 'levelDesc': '850hPa' },
                { 'name': '假相当位温', 'elem': 'TB', 'level': '0850', 'levelDesc': '850hPa' },
                { 'name': '温度露点', 'elem': 'TD', 'level': '0850', 'levelDesc': '850hPa' },
                { 'name': '温度平流', 'elem': 'TC', 'level': '0850', 'levelDesc': '850hPa' },
                { 'name': '风场', 'elem': 'WIND', 'level': '0850', 'levelDesc': '850hPa' }]
        },
        'numberFC_0700': {
            'name': '700hpa综合图', 'options': [
                { 'name': '温度露点差', 'elem': 'TH', 'level': '0700', 'levelDesc': '700hPa', 'visible': true },
                { 'name': '温度', 'elem': 'TT', 'level': '0700', 'levelDesc': '700hPa', 'visible': true },
                { 'name': '位势高度', 'elem': 'HH', 'level': '0700', 'levelDesc': '700hPa', 'visible': true },
                { 'name': '散度', 'elem': 'DI', 'level': '0700', 'levelDesc': '700hPa' },
                { 'name': '垂直速度', 'elem': 'WW', 'level': '0700', 'levelDesc': '700hPa', 'visible': true },
                { 'name': '风场', 'elem': 'WIND', 'level': '0700', 'levelDesc': '700hPa' }]
        },
        'numberFC_0500': {
            'name': '500hpa综合图', 'options': [
                { 'name': '温度露点差', 'elem': 'TH', 'level': '0500', 'levelDesc': '500hPa' },
                { 'name': '温度', 'elem': 'TT', 'level': '0500', 'levelDesc': '500hPa' },
                { 'name': '位势高度', 'elem': 'HH', 'level': '0500', 'levelDesc': '500hPa', 'visible': true },
                { 'name': '24H变高', 'elem': 'DH24', 'level': '0500', 'levelDesc': '500hPa', 'visible': true },
                { 'name': '涡度', 'elem': 'VO', 'level': '0500', 'levelDesc': '500hPa', 'visible': true },
                { 'name': '假相当位温', 'elem': 'TB', 'level': '0500', 'levelDesc': '500hPa' },
                { 'name': '温度露点', 'elem': 'TD', 'level': '0500', 'levelDesc': '500hPa' },
                { 'name': '风场', 'elem': 'WIND', 'level': '0500', 'levelDesc': '500hPa', 'visible': true }]
        },
        'numberFC_0200': {
            'name': '200hpa综合图', 'options': [
                { 'name': '温度', 'elem': 'TT', 'level': '0200', 'levelDesc': '200hPa' },
                { 'name': '位势高度', 'elem': 'HH', 'level': '0200', 'levelDesc': '200hPa', 'visible': true },
                { 'name': '散度', 'elem': 'DI', 'level': '0200', 'levelDesc': '200hPa' },
                { 'name': '风场', 'elem': 'WIND', 'level': '0200', 'levelDesc': '200hPa', 'visible': true }]
        },
        'numberFC_NLT': {
            'name': 'NLT综合图', 'options': [
                { 'name': 'K指数', 'elem': 'KI', 'level': '0500', 'type': 'area', 'levelDesc': '', 'visible': true },
                { 'name': '威胁指数', 'elem': 'TI', 'level': '0500', 'type': 'line', 'levelDesc': '' },
                { 'name': '沙氏指数', 'elem': 'SI', 'level': '0500', 'type': 'line', 'levelDesc': '' },
                { 'name': '对流有效位能', 'elem': 'CAPE', 'level': '9999', 'type': 'line', 'levelDesc': '' },
                // { 'name': '位势稳定度', 'elem': 'PS', 'level': '9999', 'type': 'area', 'levelDesc': '' },
                { 'name': '风切变', 'elem': 'VWS500', 'level': '0500', 'type': 'area', 'levelDesc': '500_300hPa' },
                { 'name': '风切变', 'elem': 'VWS700', 'level': '0700', 'type': 'area', 'levelDesc': '700_300hPa' }]
        }
    };
    const sea_items = {  //U V 海流  WINDX WINDY 海面风  HS 海浪等值线  HS2D浪高二维数组 TH 海浪流向   TEMP 海温
        'sea_9999': {
            'name': '海平面综合图', 'options': [
                { 'name': '海浪', 'elem': 'HS', 'level': '9999', 'type': 'line', 'levelDesc': '', 'visible': true },
                { 'name': '海面风', 'elem': 'SEAWIND', 'level': '9999', 'type': 'point', 'levelDesc': '' },
                // { 'name': '潮汐', 'elem': 'SI', 'level': '0500', 'type': 'line', 'levelDesc': '' },
                // { 'name': '海区预报', 'elem': 'CAPE', 'level': '9999', 'type': 'line', 'levelDesc': '' }
            ]
        },
        'sea_0001':{
            'name': '1m综合图', 'options': [
                { 'name': '海温', 'elem': 'TEMP', 'level': '0001', 'type': 'area', 'levelDesc': '', 'visible': true },
                { 'name': '海流', 'elem': 'SEAFLOW', 'level': '0001', 'type': 'point', 'levelDesc': '' }
            ]
        },
        'sea_0010':{
            'name': '10m综合图', 'options': [
                { 'name': '海温', 'elem': 'TEMP', 'level': '0010', 'type': 'area', 'levelDesc': '', 'visible': true },
                { 'name': '海流', 'elem': 'SEAFLOW', 'level': '0010', 'type': 'point', 'levelDesc': '' }
            ]
        },
        'sea_0020':{
            'name': '20m综合图', 'options': [
                { 'name': '海温', 'elem': 'TEMP', 'level': '0020', 'type': 'area', 'levelDesc': '', 'visible': true },
                { 'name': '海流', 'elem': 'SEAFLOW', 'level': '0020', 'type': 'point', 'levelDesc': '' }
            ]
        },
        'sea_0030':{
            'name': '30m综合图', 'options': [
                { 'name': '海温', 'elem': 'TEMP', 'level': '0030', 'type': 'area', 'levelDesc': '', 'visible': true },
                { 'name': '海流', 'elem': 'SEAFLOW', 'level': '0030', 'type': 'point', 'levelDesc': '' }
            ]
        },
        'sea_0050':{
            'name': '50综合图', 'options': [
                { 'name': '海温', 'elem': 'TEMP', 'level': '0050', 'type': 'area', 'levelDesc': '', 'visible': true },
                { 'name': '海流', 'elem': 'SEAFLOW', 'level': '0050', 'type': 'point', 'levelDesc': '' }
            ]
        },
    };
    const pos_items = {
        'pos_9999': {   //人工分析   暂时没有 
            'name': '地面综合图', 'options': [
                // {'name': '风场', 'elem': 'WSS', 'level': '9999', 'levelDesc': '地面', 'type': 'area', 'visible': true},              
                { 'name': '气压', 'elem': 'PR', 'level': '9999', 'levelDesc': '', 'type': 'line', 'visible': true },
                { 'name': '降水', 'elem': 'RAIN01', 'level': '9999', 'levelDesc': '地面', 'type': 'area', 'visible': false },
                // { 'name': '填图', 'elem': 'Syno', 'level': '9999', 'levelDesc': '地面', 'type': '', 'visible': false },
            ]
        }
    };
    const real_items = {
        'real_9999': {   //人工分析   暂时没有 
            'name': '地面综合图', 'options': [
                {'name': '风场', 'elem': 'WSS', 'level': '9999', 'levelDesc': '地面', 'type': 'area', 'visible': true},              
                { 'name': '气压', 'elem': 'PR', 'level': '9999', 'levelDesc': '', 'type': 'line', 'visible': true },
                { 'name': '相对湿度', 'elem': 'RH', 'level': '9999', 'levelDesc': '地面', 'type': 'area', 'visible': true },
                // {'name': '温度露点差', 'elem': 'WDLDC', 'level': '0500', 'levelDesc': '', 'visible': true},
                { 'name': '气温', 'elem': 'TT', 'level': '9999', 'levelDesc': '地面', 'type': 'line', 'visible': true },
                { 'name': '能见度', 'elem': 'VIS', 'level': '9999', 'levelDesc': '地面', 'type': 'area', 'visible': false },
            ]
        },
        'real_0850': { // 积冰、颠簸、槽线、温度平流 暂时没有
            'name': '850hpa综合图', 'options': [
                {'name': '风场', 'elem': 'WSS', 'level': '0850', 'levelDesc': '', 'type': 'area', 'visible': true},
                { 'name': '温度', 'elem': 'TT', 'level': '0850', 'levelDesc': '850hPa', 'type': 'line', 'visible': false },
                { 'name': '温度平流', 'elem': 'TA', 'level': '0850', 'levelDesc': '850hPa', 'type': 'line', 'visible': false },
                { 'name': '积冰', 'elem': 'JB', 'level': '0850', 'levelDesc': '850hPa', 'type': 'area', 'visible': false },
                { 'name': '颠簸', 'elem': 'DB', 'level': '0850', 'levelDesc': '850hPa', 'type': 'area', 'visible': false },
                { 'name': '湿度', 'elem': 'RH', 'level': '0850', 'levelDesc': '850hPa', 'type': 'area', 'visible': false },
                { 'name': '位势高度', 'elem': 'HH', 'level': '0850', 'levelDesc': '850hPa', 'type': 'line', 'visible': false },
                { 'name': '24H变温', 'elem': 'CT24H', 'level': '0850', 'levelDesc': '850hPa', 'type': 'line', 'visible': false },
                { 'name': '散度', 'elem': 'DI', 'level': '0850', 'levelDesc': '850hPa', 'type': 'area', 'visible': false },
                { 'name': '假相当温度', 'elem': 'JXDWW', 'level': '0850', 'levelDesc': '850hPa',  'type': 'line','visible': false },
            ]
        },
        'real_0700': {//积冰、颠簸、槽线
            'name': '700hpa综合图', 'options': [
                { 'name': '温度', 'elem': 'TT', 'level': '0700', 'levelDesc': '700hPa', 'type': 'line', 'visible': false },
                { 'name': '位势高度', 'elem': 'HH', 'level': '0700', 'levelDesc': '700hPa', 'type': 'line', 'visible': false },
                { 'name': '积冰', 'elem': 'JB', 'level': '0700', 'levelDesc': '850hPa', 'type': 'area', 'visible': false },
                { 'name': '颠簸', 'elem': 'DB', 'level': '0700', 'levelDesc': '850hPa', 'type': 'area', 'visible': false },
                { 'name': '风场', 'elem': 'WSS', 'level': '0700', 'levelDesc': '700hPa', 'type': 'area', 'visible': true },
                { 'name': '散度', 'elem': 'DI', 'level': '0700', 'levelDesc': '700hPa', 'type': 'area', 'visible': false },
                { 'name': '垂直速度', 'elem': 'VS', 'level': '0700', 'levelDesc': '700hPa', 'type': 'area', 'visible': false },
                { 'name': '湿度', 'elem': 'RH', 'level': '0700', 'levelDesc': '700hPa', 'type': 'area', 'visible': true },
            ]
        },
        'real_0500': { // 积冰、颠簸、槽线
            'name': '500hpa综合图', 'options': [
                { 'name': '温度', 'elem': 'TT', 'level': '0500', 'levelDesc': '500hPa', 'type': 'line', 'visible': false },
                { 'name': '位势高度', 'elem': 'HH', 'level': '0500', 'levelDesc': '500hPa', 'type': 'line', 'visible': false },
                { 'name': '积冰', 'elem': 'JB', 'level': '0500', 'levelDesc': '850hPa', 'type': 'area', 'visible': false },
                { 'name': '颠簸', 'elem': 'DB', 'level': '0500', 'levelDesc': '850hPa', 'type': 'area', 'visible': false },
                { 'name': '风场', 'elem': 'WSS', 'level': '0500', 'levelDesc': '500hPa', 'type': 'area', 'visible': true },
                { 'name': '24H变高', 'elem': 'CH24H', 'level': '0500', 'levelDesc': '500hPa', 'type': 'line', 'visible': false },
                { 'name': '假相当温度', 'elem': 'JXDWW', 'level': '0500', 'levelDesc': '500hPa', 'type': 'line', 'visible': false },
                { 'name': '涡度', 'elem': 'VO', 'level': '0500', 'levelDesc': '500hPa', 'type': 'area', 'visible': false },
                { 'name': '湿度', 'elem': 'RH', 'level': '0500', 'levelDesc': '200hPa', 'type': 'area', 'visible': false },
            ]
        },
        'real_0300': { //积冰、颠簸、槽线
            'name': '300hpa综合图', 'options': [
                { 'name': '位势高度', 'elem': 'HH', 'level': '0300', 'levelDesc': '300hPa', 'type': 'line', 'visible': false },
                { 'name': '温度', 'elem': 'TT', 'level': '0300', 'levelDesc': '300hPa', 'type': 'line', 'visible': false },
                { 'name': '积冰', 'elem': 'JB', 'level': '0300', 'levelDesc': '300hPa', 'type': 'area', 'visible': false },
                { 'name': '颠簸', 'elem': 'DB', 'level': '0300', 'levelDesc': '300hPa', 'type': 'area', 'visible': false },
                { 'name': '风场', 'elem': 'WSS', 'level': '0300', 'levelDesc': '300hPa', 'type': 'area', 'visible': true },
                { 'name': '散度', 'elem': 'DI', 'level': '0300', 'levelDesc': '300hPa', 'type': 'area', 'visible': false },
                { 'name': '湿度', 'elem': 'RH', 'level': '0300', 'levelDesc': '200hPa', 'type': 'area', 'visible': false },
            ]
        },
        'real_0200': { // 颠簸、槽线
            'name': '200hpa综合图', 'options': [
                { 'name': '位势高度', 'elem': 'HH', 'level': '0200', 'levelDesc': '200hPa', 'type': 'line', 'visible': false },
                { 'name': '温度', 'elem': 'TT', 'level': '0200', 'levelDesc': '200hPa', 'type': 'line', 'visible': false },
                { 'name': '颠簸', 'elem': 'DB', 'level': '0200', 'levelDesc': '850hPa', 'type': 'area', 'visible': false },
                { 'name': '风场', 'elem': 'WSS', 'level': '0200', 'levelDesc': '200hPa', 'type': 'area', 'visible': true },
                { 'name': '散度', 'elem': 'DI', 'level': '0200', 'levelDesc': '200hPa', 'type': 'area', 'visible': false },
                { 'name': '湿度', 'elem': 'RH', 'level': '0200', 'levelDesc': '200hPa', 'type': 'area', 'visible': false },
            ]
        },
    }

    function init() {

    }

    var allCloseCallBack;

    const layerMap = {};
    const statusMap = {};

    function trigger(option, type) {
        statusMap[option.id] = false;
        if (option.elem == 'WSS') {
            if (XHW.config.datasource == 'kt1279') {
                if (ktWindDrawder) {
                    ktWindDrawder.close();
                }
                ktWindDrawder.open(option.elem, option.level, option.levelDesc, function () {
                    closeItem(option.id);
                }, '风羽');
            } else {
                if (ecWindDrawder) {
                    ecWindDrawder.close();
                }
                ecWindDrawder.open(option.elem, option.level, option.levelDesc, function () {
                    closeItem(option.id);
                }, '风羽');
                let datatype = XHW.config.datasource;
                option.datatype = datatype;
                if (type == 'real') {
                    option.datatype = 'real';
                }
                requestData(option, function (imgUrl, data, title) {
                    draw(option, imgUrl, data, title);
                });
            }
        } else if (option.elem == 'Syno' && !$('.pos_9999_9999_Syno span').hasClass('current')) {
            // stationLabelDrawer.open(option.level, option.levelDesc, function () {
            //     closeItem(option.id);
            // });
        } else if (option.elem == 'SEAFLOW') {
            seaflow.open(option.elem, option.level, option.levelDesc, function () {
                closeItem(option.id);
            });
        } else if (option.elem == 'SEAWIND') {
            seawind.open(option.elem, option.level, option.levelDesc, function () {
                closeItem(option.id);
            });
        } else if (option.elem == 'HS') {
            seaWave.open(option.elem, option.level, option.levelDesc, function () {
                closeItem(option.id);
            });
            let datatype = XHW.config.datasource;
            option.datatype = datatype;
            if (type == 'real') {
                option.datatype = 'real';
            }else if(type == 'sea_mixedGraph'){
                option.datatype = 'fio';
            }
            requestData(option, function (imgUrl, data, title) {
                draw(option, imgUrl, data, title);
            });
        } else {
            let datatype = XHW.config.datasource;
            option.datatype = datatype;
            if (type == 'real') {
                option.datatype = 'real';
            }else if(type == 'sea_mixedGraph'){
                option.datatype = 'fio';
            }
            requestData(option, function (imgUrl, data, title) {
                draw(option, imgUrl, data, title);
            });
        }
    }

    function draw(option, imgUrl, data, layerOptions) {
        
        let layer = layerMap[option.id];
        let drawType = null;
        if (drawType == null && data) {
            if (data.lines) {
                drawType = 'Isolines';
            } else if (data.files) {
                drawType = 'MultiImage';
            } else if (data.url) {
                drawType = 'Image';
            } else {
                drawType = 'geojson';
            }
        }
        let source = buildSource(option, imgUrl, drawType, data);
        let layerItem = XHW.C.layerC.createItem(layerOptions.htmlLayer, layerOptions.htmlLegend, function () {
            closeItem(option.id);
        });
        XHW.C.layerC.addLayer(option.id, layerItem);
        if (!source) {
            removeLayer(option.id);
            return;
        }
        if (drawType == 'MultiImage') {
            if (Object.prototype.toString.call(layer) != '[object Array]') {
                removeLayer(option.id);
            }
            if (layer == null) {
                layer = [];
                layerMap[option.id] = layer;
            }
            for (let i = 0; i < source.length; i++) {
                if (layer.length <= i) {
                    let subLayer = new ol.layer.Image();
                    subLayer.id = option.id;
                    subLayer.setZIndex(chartBuilder.getZIndexOf(option.elem));
                    XHW.map.addLayer(subLayer);
                    layer.push(subLayer);
                }
                layer[i].setSource(source[i]);
            }
        } else {
            if (Object.prototype.toString.call(layer) == '[object Array]') {
                removeLayer(option.id);
            }
            if (layer == null) {
                if (drawType == 'Isolines' || drawType == 'geojson') {
                    layer = new ol.layer.Vector();
                    if (drawType == 'geojson')
                        layer.setStyle(VectorFactory.styleFunction);
                } else {
                    layer = new ol.layer.Image();
                }
                layer.id = option.id;
                if($('.tuCeng_ul li.'+option.id+' .eye').hasClass('current')){                               
                    if (!$('#haiLang .liZi').hasClass('current') && (option.elem == 'WSS')) {
                        layer.setVisible(false);
                        $('#' + option.elem).hide();
                    }else{
                        layer.setVisible(true);
                        $('#'+option.elem).show();  
                        // $('#'+option.elem).attr('display','block')
                    }
                }else{
                    layer.setVisible(false);
                    $('#' + option.elem).hide();
                }
                // layer.setVisible(option.visible ? option.visible : false);
                layer.setZIndex(chartBuilder.getZIndexOf(option.elem));
                if(option.type == 'area'){
                    layer.setZIndex(5);
                }else if(option.type == 'line'){
                    layer.setZIndex(10);
                }else if(option.type == 'point'){
                    layer.setZIndex(15);
                }else{
                    
                }
                XHW.map.addLayer(layer);
                XHW.C.layerC.updateLayerData(option.id, layerItem)
                layerMap[option.id] = layer;
            }
            layer.setSource(source);
        }
    }

    function buildSource(option, imgUrl, drawType, data) {
        if (!data)
            return;
        if (drawType == 'Isolines') {
            return chartBuilder.buildIsolinesSource(option.elem, data);
        } else if (drawType == 'MultiImage') {
            return chartBuilder.buildImagesSource(imgUrl, option.elem, data);
        } else if (drawType == 'Image') {
            return chartBuilder.buildImageSource(imgUrl, option.elem, data);
        } else {
            return VectorFactory.buildSource(data,option);
        }
    }

    function buildLayerOptions(legend, title) {
        let layerOptions = {};
        layerOptions.htmlLayer = title;
        layerOptions.htmlLegend = legend;
        return layerOptions;
    }

    function requestData(option, call) {
        let elem = option.elem;
        let level = option.level;
        let datatype = option.datatype;

        let host = XHW.C.http.ecmfUrlNew;
        // if (datatype == 'ECMF') {
        //     host = XHW.C.http.ecmfUrl;
        // }
        let imgUrl = XHW.C.http.imgUrl;
        if (datatype == 'ECMF') {
            imgUrl = XHW.C.http.ecmfImgUrl;
        }
        let dataTypeUri = "fc";
        // if (datatype == 'ECMF') {
        //     dataTypeUri = 'ecmf';
        // } else if (datatype == 'real') {
        //     if(XHW.config.datasource == 'GFS'){
        //         dataTypeUri = 'gfs';
        //     }else{
        //         dataTypeUri = 'ecmf';
        //     }           
        // }else{
        //     // dataTypeUri = datatype;
        //     if (XHW.config.datasource == 'GFS') {
        //         dataTypeUri = 'gfs';
        //     } else {
        //         dataTypeUri = 'ecmf';
        //     } 
        // }

        // var date = new Date();
        // var nowTime = {};
        // nowTime['year'] = date.getFullYear();
        // nowTime['month'] = date.getMonth() + 1 < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
        // nowTime['day'] = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        // nowTime['hour'] = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        // var now_time = nowTime['year']+'-'+nowTime['month']+'-'+nowTime['day']+' '+nowTime['hour']+':00:00';
        //     now_time = new Date(now_time).getTime();
            
        // var cur_time = new Date(timeBar.year + '-' + timeBar.month + '-' + timeBar.day+' '+timeBar.hour+':00:00').getTime();

        if($('.swiper-wrapper>div.cur').parent().parent().hasClass('swiper-containerReal') || $('#pos_mixedGraph').hasClass('active')){
            dataTypeUri = 'real';
        }else{
            if (XHW.config.datasource == 'GFS') {
                dataTypeUri = 'gfs';
            }else{
                dataTypeUri = 'ecmf';
            }
        }

        if($('#sea_mixedGraph').hasClass('active')){
            dataTypeUri = 'fio';
        }

        let uri = '/' + dataTypeUri + '/' + getURIOfElem(elem, datatype);

        // 位置天气等压线
        if(option.id == "pos_9999_9999_PR" || option.id == "pos_9999_9999_RAIN01"){
            uri = '/real/halfdata';
        }else{
            params['time'] = timeBar.getRequestTime().split('-').join('');
        }

        // let utcRequestTime = toUTC(XHW.silderTime);
        let utcRequestTime = toUTC(XHW.time);

        let params = {};
        params['elem'] = elem;
        if (level)
            params['level'] = level;

        // params['time'] = timeBar.getRequestTime().split('-').join('');
        // params['time'] = utcRequestTime.year + utcRequestTime.month + utcRequestTime.day + utcRequestTime.hour;
        // params['year'] = utcRequestTime.year;
        // params['month'] = utcRequestTime.month;
        // params['day'] = utcRequestTime.day;
        // params['hour'] = utcRequestTime.hour;
        // params['vti'] = utcRequestTime.vti;

        // params['dataType'] = datatype.toLowerCase();
        if(option.type == 'area'){
            params['type'] = 'area';
        }else if(option.type == 'line'){
            params['type'] = 'line';
        }else if(option.type == 'point'){
            params['type'] = 'array';
        }
        let elemName = option.name;

        let legend;
        if (elem == 'TT') {
            legend = '';
        } else {
            legend = chartBuilder.buildLegendHtml(params.elem, elemName);
        }

        

        // 请求数据
        XHW.C.http.get(host, uri, params, function (data) {
            if (!data || !data.data) {
                // getFromCache();
                nodataCall();
            } else {
                hasDataCall(data);
            }
        }, function () {
            // getFromCache();
            nodataCall();
        });

        function getFromCache() {
            let cacheURI = imgUrl + '/geojson/' + datatype.toUpperCase() + '/'
                + params['year'] + params['month'] + params['day'] + params['hour'] + "/"
                // + datatype + "_" + params['year'] + params['month'] + params['day'] + params['hour'] + "_" + params['vti'] + '_' + params['elem'] + '_' + params['level'] + '.json';
                + datatype + "_" + params['year'] + params['month'] + params['day'] + params['hour'] + '_' + params['elem'] + '_' + params['level'] + '.json';
            $.ajax({
                url: cacheURI,
                type: 'GET',
                success: function (res) {
                    if (!res) {
                        nodataCall();
                    } else {
                        hasDataCall(res);
                    }
                },
                error: function (error) {
                    nodataCall();
                }
            });
        }

        function hasDataCall(data) {
            let time = data.time ? format.jsonDate(data.time) : undefined;
            let title = time ? time[1] : toRealDateStr(utcRequestTime, 'MM月dd日 HH时') + ' ' + (option.levelDesc ? option.levelDesc : '') + '' + elemName;
            if (datatype == 'real') {
                title = time ? time[0] : toRealDateStr(utcRequestTime, 'MM月dd日 HH时') + ' ' + (option.levelDesc ? option.levelDesc : '') + '' + elemName;
            }
            let layerOptions = buildLayerOptions(legend, title);
            if (call) {
                // console.log(imgUrl,data.data?data.data:data, layerOptions)
                call(imgUrl, data.data ? data.data : data, layerOptions);
            }
        }
        function nodataCall() {
            let title = toRealDateStr(utcRequestTime, 'MM月dd日 HH时') + (option.levelDesc ? option.levelDesc : '') + '' + elemName + '(无数据)';
            let layerOptions = buildLayerOptions(legend, title);
            if (call) {
                call(imgUrl, undefined, layerOptions);
            }
        }
    }



    var windClose = true;
    var labelClose = true;
    function closeItem(optionId) {
        if (optionId == undefined)
            return;
        if (optionId.endsWith('WIND')) {
            // if (ktWindDrawder) {
            //     ktWindDrawder.close();
            // }
            if (gfsWindDrawder) {
                gfsWindDrawder.close();
            }
            if (ecWindDrawder) {
                ecWindDrawder.close();
            }
            windClose = true;
        } else if (optionId.endsWith('Label')) {
            stationLabelDrawer.close();
            labelClose = true;
        } else {
            //---------删除图层控制
            XHW.C.layerC.removeLayer(optionId);
            removeLayer(optionId);
        }
        statusMap[optionId] = false;
        delete statusMap[optionId];
        if ((!statusMap || Object.getOwnPropertyNames(statusMap) == 0)) {
            if (allCloseCallBack)
                allCloseCallBack();
        }
    }

    function removeLayer(funcId) {
        if (funcId == undefined)
            return;
        let layer = layerMap[funcId];
        if (isArray(layer)) {
            layer.forEach(subLayer => {
                XHW.map.removeLayer(subLayer);
            })
        } else {
            XHW.map.removeLayer(layer);
        }
        layerMap[funcId] = null;
        delete layerMap[funcId];
        layer = null;
    }

    function isArray(obj) {
        return Object.prototype.toString.call(obj) == '[object Array]';
    }

    function openItem(option, type) {
        //---------添加图层控制
        trigger(option, type);
    }

    function getURIOfElem(elem, datatype) {
        // if (datatype == 'real') {
        //     switch (elem) {
        //         case 'RAIN06':
        //             return 'isosurfacedata';
        //     }
            return 'areadata';
        // } else {
        //     switch (elem) {
        //         case 'HH':
        //         case 'TT':
        //         case 'PR':
        //             return 'isolinedata';
        //     }
        //     return 'isosurfacedata';
        // }
    }

    var curItem;
    function open(type, level, allCloseCallBack_) {
        allCloseCallBack = allCloseCallBack_;
        let mixedType = '';
        let items = undefined;
        if (type == 'real') {
            mixedType = 'real_' + level;
            items = real_items;
        } else if(type == 'numberFC_mixedGraph'){
            mixedType = 'numberFC_NLT';
            items = numberFC_items;
        }else if(type == 'sea_mixedGraph'){
            mixedType = 'sea_' + level;
            items = sea_items;
        }else if(type == 'pos_mixedGraph'){
            mixedType = 'pos_' + level;
            items = pos_items;
        }
        curItem = items[mixedType];
        if (curItem && curItem.options) {
            for (let key in layerMap) {
                let isFind = false;
                curItem.options.forEach(option => {
                    if (option.id == key) {
                        isFind = true;
                    }
                });
                if (!isFind) {
                    closeItem(key)
                }
            }
            curItem.options.forEach(option => {

                if (!option.id) {
                    option.id = mixedType + '_' + option.level + '_' + option.elem;
                }
                openItem(option, type);
            });
        }
    }

    function close() {
        if (curItem && curItem.options) {
            curItem.options.forEach(option => {
                closeItem(option.id);
            });
        }
    }

    return {
        open: open,
        close: close
    }
});