//站点 城市 气象数据
define([
    // 'Function/Search',
    // 'Function/point/StationInfo',
    'Function/point/real_halfHour',
    "Function/tool/wind",
    'Controller/DataFormat'], 
    // function(search, info, WindShape, format) {
    function(real_halfHour, WindShape, format) {

    var _img=require("Function/tool/img");

    var key;
    var type;
    var item;

    var level;
    var levelDesc;
    var callBack;

    var layer;      //功能图层
    var data;       //城镇气象数据（按分级记录，站点、站名、经纬度、天气信息）

    function init(){

        //层级缩放监听
        XHW.C.MapMove.addZoomCallback(function(){
            if(layer) getData();
        });

        XHW.C.mapclick.addCallback('填图', function(value){
            $('.bottompanel').show();
            $('.bottompanel .posi_wea').show();
            real_halfHour.rightRealInfo(value);
        });
        // //时间轴变化监听
        // sliderBar.addCallback(function(){
        //     if(layer) getData();
        // });

        type = key = 'station_label';
        item = XHW.C.layerC.createItem('气象站填图', '', function(){
            close();
            if (callBack) {
                callBack();
            }
        });

        //------------鼠标指向marker的监听
        // XHW.C.mouse.addCallback(type, function(value){
        //     return getPopupHtml(value);
        // });

        // XHW.C.mapclick.addCallback(type, function(value){
        //     info.queryStationInfo(value.code, value.name);
        // })

        $('#stationLabel').click(function(){
            if($(this).children().hasClass('current')){
                getData();
                if(layer)layer.setVisible(true);
            }else{
                if(layer)layer.setVisible(false);
            }
        })
    }

    init();

    function getData(){
        let zoom = XHW.map.getView().getZoom();

        //   如果层级大于6，切已经请求过数据则不再请求
        // if(zoom > 6 && data) return;
        let url = '/stationdata_surf/datafromselectedstationsbylevel?level=' + (zoom - 2) + "&";
        if (level != 9999) {
            url = '/stationdata_high/datafromselectedstations?';
        }
        var time = timeBar.getRequestTime().split('-');
        var param = 'year=' + time[0] 
        + '&month=' + time[1] + '&day=' + time[2] +'&hour=' + time[3];
        // https://weather.xinhong.net/stationdata_surf/datafromselectedstationsbylevel?level=2
        // XHW.C.http.http(url, param, function(data, time){
        //     // item.time = time;
        //     var time = format.jsonDate(time);
        //     item.htmlLayer = time[0] + ' ' + (levelDesc?levelDesc:'')+ ' 气象站填图';
        //     XHW.C.layerC.updateLayerData(key, item);
        //     collating(data)
        // },function(){
        //     item.htmlLayer = time.month + '月' + time.day + '日 ' + time.hour + '时 '+ ' ' + (levelDesc?levelDesc:'')+ ' 气象站填图' + '(无数据)';
        //     XHW.C.layerC.updateLayerData(key, item);
        //     remove();
        // })
       
        // http://ocean.xinhong.net:8000/xhweatherfcsys/halfreal/all?level=2
        if(zoom >= 0 && zoom < 4){
            lev = 1;
        }else if(zoom >= 4 && zoom < 6){
            lev = 1;
        }else if(zoom >= 6 && zoom < 8){
            lev = 2;
        }else{
            lev = 4
        }
        XHW.C.http.Http(XHW.C.http.ecmfUrl, '/halfreal/all?level='+lev, function(data, time){
            collating(data)
        },function(){
            item.htmlLayer = time.month + '月' + time.day + '日 ' + time.hour + '时 '+ ' ' + (levelDesc?levelDesc:'')+ ' 气象站填图' + '(无数据)';
            XHW.C.layerC.updateLayerData(key, item);
            remove();
        })
    }

    /**
     * 整理数据
     * @param {*} rawData 原始数据
     */
    function collating(rawData){
        data = rawData;
        var markers = [];
        // if (level != 9999) {
        //     buildGKStationMarkers(markers);
        // } else {
        //     buildStationMarkers(markers);
        // }
        realhalfStationMarkers(markers);
        let source = new ol.source.Vector({
            features: markers
        });
        if (!layer) {
            layer = new ol.layer.Vector({
            });
            layer.id = key;
        }
        layer.setSource(source);

		if ($.inArray(layer, XHW.map.getLayers().getArray()) == -1) {
            layer.setZIndex(15);
            XHW.map.addLayer(layer);
        }
        
    }

    /**
     * 绘制地面航空实况图
     // |--------|--------|--------|
     // |  DT24  |   CH   |  DP24  |
     // |--------|--------|--------|
     // |   AT   |   CM   |  SLP   |
     // |--------|--------|--------|
     // | WEATHER|  N(WS) |  DP03  |
     // |--------|--------|--------|
     // |  VIS   |   CL   |NH W1 W2|
     // |--------|--------|--------|--------|
     // |   TD   |   H    | RAIN06 | RAIN01 |
     // |--------|--------|--------|--------|
    /**
     * 显示城镇气象信息
     */
    function realhalfStationMarkers(markers){
        data = data.data;
        for(let i = 0; i < data.length; i++){
            var lng = data[i].lng;
            var lat = data[i].lat;

            var lonlat = ol.proj.fromLonLat([parseFloat(lng), parseFloat(lat)]);
            let geometry = new ol.geom.Point(lonlat);
            let colorStr = 'rgba(0,0,0,1)';
            // data.AT = data[i].at;
            // data.WEATHER = data[i].ww;
            // data.SLP = data[i].press;
            

            let cloudFeature = buildCloudFeature('9', lonlat, colorStr,data[i]); // 云量缺测，暂时以图标9代替
            if(cloudFeature)
                markers.push(cloudFeature);
            let windFeature = buildWindFeature(data[i].ws, format.windDeg(data[i].wd), lonlat, colorStr,data[i]);
            if(windFeature)
                markers.push(windFeature);
            let fontsize = 12;
            let padding = 15;

            let labelDatas = formatDatas(data[i]);
            labelDatas.at? markers.push(buildTextFeature(geometry, -padding-5, -padding, labelDatas.at, fontsize, colorStr,labelDatas)):'';
            if (labelDatas.ww) {
                let weatherCode = labelDatas.ww;
                while(weatherCode.length < 3) {
                    weatherCode = '0' + weatherCode;
                }
                if (_img && _img[weatherCode+".png"]) {
                    let weatherSrc = _img[weatherCode + '.png'];
                    markers.push(buildWeatherFeature(lonlat, weatherSrc, 0.5, colorStr, [10, 0]));
                }
            }

            labelDatas.rain06+'' != '' ? markers.push(buildTextFeature(geometry, padding, padding*2, labelDatas.rain06, fontsize, colorStr,labelDatas)):'';
            labelDatas.rain01+'' != '' ? markers.push(buildTextFeature(geometry, padding*2, padding*2, labelDatas.rain01, fontsize, colorStr,labelDatas)):'';
            labelDatas.pr? markers.push(buildTextFeature(geometry, padding, -padding, labelDatas.pr.toFixed(1), fontsize, colorStr,labelDatas)):'';
            labelDatas.vis? markers.push(buildTextFeature(geometry, -padding, padding, labelDatas.vis, fontsize, colorStr,labelDatas)):'';
        }
        // citycode: "101050201",
    }

    function buildStationMarkers(markers){
        for(var key in data){  
            var scode = key.split("_")[0];         
            var cnname = key.split("_")[1];       
            var lng = key.split("_")[2];
            var lat = key.split("_")[3]; 
            adapterDMData(data[key]);
            // var canvas=WindShape.drawDMWind(data[key],5);
            // if (canvas == null || typeof(canvas) == 'undefined')
            //     continue;
            var lonlat = ol.proj.fromLonLat([parseFloat(lng), parseFloat(lat)]);
            let geometry = new ol.geom.Point(lonlat);

            // var mark = buildFeature(lonlat, canvas.toDataURL("image/png"));
            
            let colorStr = 'rgba(0,0,0,1)';
            if (data[key].allColor) {
                colorStr = 'rgba(' + data[key].allColor.r + ',' + data[key].allColor.g + ',' + data[key].allColor.b + ', ' + data[key].allColor.a + ')';
            }
            
            let cloudFeature = buildCloudFeature(data[key].CN, lonlat, colorStr);
            if(cloudFeature)
                markers.push(cloudFeature);
            let windFeature = buildWindFeature(data[key].WS, data[key].WD, lonlat, colorStr);
            if(windFeature)
                markers.push(windFeature);
            let fontsize = 12;
            let padding = 15;
            // "TT":23,"VIS":11000,"PR":1005.9,
            // "CFH":60,"CFL":62,"WTH":2,"CN":7,"CFM":61,
            // "WD":180,"DP03":0,"TD":18.8,
            // "CNML":7,"RH":77.24,"WS":2
            //风的左边要素
            // 左一列

            let labelDatas = formatDatas(data[key]);

            labelDatas.DT24? markers.push(buildTextFeature(geometry, -padding, -padding*2, labelDatas.DT24, fontsize, colorStr)):'';
            labelDatas.AT? markers.push(buildTextFeature(geometry, -padding-5, -padding, labelDatas.AT, fontsize, colorStr)):'';
            if (labelDatas.WEATHER) {
                let weatherCode = labelDatas.WEATHER;
                while(weatherCode.length < 3) {
                    weatherCode = '0' + weatherCode;
                }
                if (_img && _img[weatherCode+".png"]) {
                    let weatherSrc = _img[weatherCode + '.png'];
                    markers.push(buildWeatherFeature(lonlat, weatherSrc, 0.5, colorStr, [10, 0]));
                }
            }
            labelDatas.VIS? markers.push(buildTextFeature(geometry, -padding, padding, labelDatas.VIS, fontsize, colorStr)):'';
            labelDatas.TD? markers.push(buildTextFeature(geometry, -padding, padding*2, labelDatas.TD, fontsize, colorStr)):'';
            //左二列
            //风的中间
            labelDatas.CH? markers.push(buildTextFeature(geometry, 0, -padding*2, labelDatas.CH, fontsize, colorStr)):'';
            labelDatas.CM? markers.push(buildTextFeature(geometry, 0, -padding, labelDatas.CM, fontsize, colorStr)):'';
            labelDatas.N? markers.push(buildTextFeature(geometry, 0, padding, labelDatas.N, fontsize, colorStr)):'';
            labelDatas.CL? markers.push(buildTextFeature(geometry, 0, padding*2, labelDatas.CL, fontsize, colorStr)):'';
            //风的右边要素
            //左三列
            labelDatas.DP24? markers.push(buildTextFeature(geometry, padding, -padding*2, labelDatas.DP24, fontsize, colorStr)):'';
            labelDatas.SLP? markers.push(buildTextFeature(geometry, padding, -padding, labelDatas.SLP, fontsize, colorStr)):'';
            labelDatas.DP03? markers.push(buildTextFeature(geometry, padding, 0, labelDatas.DP03, fontsize, colorStr)):'';
            labelDatas.NH? markers.push(buildTextFeature(geometry, padding, padding, labelDatas.NH, fontsize, colorStr)):'';
            labelDatas.RAIN06? markers.push(buildTextFeature(geometry, padding, padding*2, data[key].RAIN06, fontsize, colorStr)):'';
            // markers.push(mark);
        }
    }
    
    function buildTextFeature(geometry, x, y, val, fontsize, color,value){  //添加图层要素
        var aa = new ol.Feature({
            geometry: geometry,
        });
        aa.type = '填图';
        aa.value = value;
        aa.setStyle(new ol.style.Style({
            text: new ol.style.Text({ 
                textAlign: "center",
                textBaseline: "middle",
                font: fontsize + "px BOLD Arial", 
                text: val+'',
                fill: new ol.style.Fill({    //文字填充色
                    color: color,
                }),                            
                offsetX: x,
                offsetY: y, 
            }),  
        }));
        return aa;
    }

    function buildCloudFeature(cn, lonlat, color,val) {
        let cloudImg = null;
        if(cn){
            cloudImg = './img/CN/'+cn+'.png';
        }
        let cloudMark = null;
        if (cloudImg != null) {
            cloudMark = buildItemFeature(lonlat, cloudImg, 0, 0.5, color,[0.5, 0.5],val);
        }
        return cloudMark;
    }


    function buildWindFeature(ws, wd, lonlat, color,val) {
        let windImg = null;
        if(ws){
            let wsValue = parseInt(ws);
            wsValue = (wsValue/2) * 2 + wsValue%2;
            if (wsValue > 72) {
                wsValue = 72;
            }
            if (wsValue <= 1) {
                wsValue = 1;
            }
            let wsStr = wsValue + '';
            if (wsStr.length < 2) {
                wsStr = '0' + wsStr;
            }
            windImg = './img/imgs/icon_ws'+wsStr+'@2x.png';
        }
        let windMark = null;
        if (windImg != null) {
            windMark = buildItemFeature(lonlat, windImg, wd*Math.PI / 180, 1, color, [0, 1],val);
        }
        return windMark;
    }
    
    function buildItemFeature(lonlat, imageSrc, rotation, scale, color, anchor,val) {
    	var feature = new ol.Feature({
            geometry:new ol.geom.Point(lonlat),
        });
        feature.type = '填图';
        feature.value = val;
    	feature.setStyle(new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                crossOrigin: 'anonymous',
                color: color,
                src: imageSrc,
                scale: scale,
                rotation: rotation,
                anchor: anchor?anchor:[0.5, 0.5]
            })),
        }));
        return feature;
    }
    
    function buildWeatherFeature(lonlat, imageSrc, scale, color, offset) {
    	var feature = new ol.Feature({
            geometry:new ol.geom.Point(lonlat),
        });
    	feature.setStyle(new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                crossOrigin: 'anonymous',
                color: color,
                src: imageSrc,
                scale: scale,
                anchor: [1.5,0.5]
            })),
        }));
        return feature;
    }

    /**
     * 显示城镇气象信息
     */
    function buildGKStationMarkers(markers){
        for(var key in data){ 
            var scode = key.split("_")[0];         
            var lng = key.split("_")[1];
            var lat = key.split("_")[2]; 
            if (data[key][level]) {
                adapterGKData(data[key][level]);
                var canvas=WindShape.drawGKWind(data[key][level],5);
                if (canvas == null || typeof(canvas) == 'undefined')
                    continue;
                var lonlat = ol.proj.fromLonLat([parseFloat(lng), parseFloat(lat)]);
                var mark = buildFeature(lonlat, canvas.toDataURL("image/png"));
                markers.push(mark);
            }
        }
    }

    function adapterDMData(data) {
        if (data == null || typeof(data) == 'undefined')
            return data;
        data.AT = data.TT;
        data.WEATHER = data.WTH;
        data.CH = data.CFH;
        data.CM = data.CFM;
        data.CL = data.CFL;
        // data.N = data.CN;
        data.SLP = data.PR;
        data.RAIN24 = data.RN24;

        let mapType = $('#config_map p .current').next().html();

        data.wwColor = getWWColor(data.WEATHER, mapType);
        if (!data.wwColor) {
            data.allColor = getAllColor(data.VIS, data.WEATHER, mapType);
        } else {
            data.allColor = data.wwColor;
        }
    }

    function getWWColor(weather, mapType) {
        if (weather != null && typeof(weather) != 'undefined' && weather != '') {
            if (weather == 17 || weather == 29 || (weather >= 50 && weather <= 75) || (weather >= 80 && weather <= 99) 
						|| (weather >= 14 && weather <= 16) 
						|| (weather >= 103 && weather <= 105) || weather == 107) {
                var wwColor = {};
                switch(weather) {
                    case 4: case 5: case 6: case 7: case 8: case 9: 
                    case 30: case 31: case 32: case 33: case 34: case 35: {
                        if(mapType && mapType == '影像图') {
                            wwColor.r = 208; wwColor.g = 72; wwColor.b = 72; wwColor.a = 1;
                        } else {
                            wwColor.r = 165; wwColor.g = 42; wwColor.b = 42; wwColor.a = 1;
                        }
                        break;
                    }
                    case 13: case 17: case 18: case 19: 
                    case 29: 
                    case 56: case 57:
                    case 66: case 67:
                    case 75:
                    case 87: case 88: case 89:
                    case 90: case 91: case 92: case 93: case 94: case 95: case 96: case 97: case 98: case 99:
                    case 103: case 104: case 105: case 107: {
                        if(mapType && mapType == '影像图') {
                            wwColor.r = 255; wwColor.g = 0; wwColor.b = 0; wwColor.a = 1;
                        } else {
                            wwColor.r = 255; wwColor.g = 0; wwColor.b = 0; wwColor.a = 1;
                        }
                        break;
                    }
                    case 10: case 11: case 12:
                    case 28:
                    case 40: case 41: case 42: case 43: case 44: case 45: case 46: case 47: case 48: case 49:{
                        if(mapType && mapType == '影像图') {
                            wwColor.r = 215; wwColor.g = 215; wwColor.b = 23; wwColor.a = 1;
                        } else {
                            wwColor.r = 180; wwColor.g = 180; wwColor.b = 20; wwColor.a = 1;
                        }
                        break;
                    }
                    default :{
                        if(mapType && mapType == '影像图') {
                            wwColor.r = 89; wwColor.g = 215; wwColor.b = 89; wwColor.a = 1;
                        } else {
                            wwColor.r = 34; wwColor.g = 139; wwColor.b = 34; wwColor.a = 1;
                        }
                    }
                }
                return wwColor;
            }
        }
    }

    function getAllColor(vis, weather, mapType) {
        if (weather != null && typeof(weather) != 'undefined' && weather != ''
            && vis != null && typeof(vis) != 'undefined' && vis != '') {
                if ((weather == 10 || weather == 11 || weather == 12 || weather == 04 || weather == 05 || (weather >= 40 && weather <= 47)) && vis <= 2000) {
                    let allColor = {};
                    if(mapType && mapType == '影像图') {
                        allColor.r = 188; allColor.g = 188; allColor.b = 27; allColor.a = 1;
                    } else {
                        allColor.r = 140; allColor.g = 140; allColor.b = 20; allColor.a = 1;
                    }
                    return allColor;
                } else if ((weather == 06 || weather == 07 || (weather >= 30 && weather <= 35)) && vis <= 4000) {
                    let allColor = {};
                    if(mapType && mapType == '影像图') {
                        allColor.r = 229; allColor.g = 169; allColor.b = 99; allColor.a = 1;
                    } else {
                        allColor.r = 109; allColor.g = 69; allColor.b = 19; allColor.a = 1;
                    }
                    return allColor;
                }
                return loadSystemDefaultColor(mapType);
        } else{
            return loadSystemDefaultColor(mapType);
        }
    }

    function loadSystemDefaultColor(mapType) {
        let allColor = {};
            
        if(mapType && mapType == '影像图') {
            allColor.r = 255; allColor.g = 255; allColor.b = 255; allColor.a = 1;
        } else {
            allColor.r = 0; allColor.g = 0; allColor.b = 0; allColor.a = 1;
        }
        return allColor;
    }

    function adapterGKData(data) {
        if (data == null || typeof(data) == 'undefined')
            return data;
        data.AT = data.TT;
        data.GPH = data.HH;
    }
    
    function buildFeature(lonlat, imageSrc) {
        let feature = new ol.Feature({
            geometry:new ol.geom.Point(lonlat),
        });
    	feature.setStyle(new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                crossOrigin: 'anonymous',
                src: imageSrc,
                scale: 0.8
            })),
        }));
        return feature;
    }
    
    function toTwo(num){
        num = parseInt(num);
        return num >= 10 ? num : '0' + num;
    }

    /**
     * 根据值返回浮动框
     * @param {*} value 
     */
    function getPopupHtml(value){
        let lng = value['lng'];
        let lat = value['lat'];
        let name = value['name'];
        let station = value['code'];
        let html = '<div style="position:absolute;left:-30px;bottom:12px;'
                            + 'background:rgba(0,0,0,0.5);padding:2px;border-radius:2px;color:#ffffff;width: max-content">'
                        +'<h1 style="font-size:12px;margin:5px 0;">' + name + "(" + station + ")" + '</h1>'
                        +'<h2 style="font-size:12px;margin:5px 0;">' + lat + ", " + lng + '</h2>'
                    +'</div>';
        return html;
    }

    /**
     * 删除图层
     */
    function remove(){
        XHW.map.removeLayer(layer);
        layer = null;
    }

    function startDraw(){
        item.htmlLayer = '气象站填图';
        let b = XHW.C.layerC.addLayer(key, item);
        if(!b) {
            close();
            return;
        }
        getData();
    }

    function close(){
        remove();
        XHW.C.layerC.removeLayer(key);
    }

    function open(level_, levelDesc_, callBack_){
        level = level_;
        levelDesc = levelDesc_;
        callBack = callBack_;
        remove();
        startDraw();
    }

    /**
     * 数据格式化处理
     * @param obj
     * @returns {{}}
     */
    function formatDatas(obj){
        var ss={};
        for(var i in obj){
            if(obj[i]=="") {
                ss[i]=obj[i];
                continue;
            }
            var da=obj[i];
           // console.log(i+" - "+obj[i]);
            switch(i){
                case 'AT':
                case 'at':
                case 'TD':
                // case 'DP03':
                    ss[i]=strSplice(da*10,4);
                    break;
                // case 'SLP':
                //     ss[i]=strFormat(da*10,3);
                //     ss[i]=ss[i].substr(ss[i].length-1,ss[i].length);
                //     break;
                case 'N':
                case 'W1':
                case 'W2':
                    ss[i]=strFormat(da,2)
                    break;
                case 'DP24':
                case 'DT24':
                    ss[i]=strSplice(da,4);
                    break;
                case 'rain':
                case 'RAIN01':
                case 'RAIN02':
                case 'RAIN03':
                case 'RAIN06':
                case 'RAIN09':
                case 'RAIN12':
                case 'RAIN15':
                case 'RAIN24':
                    if(Math.abs(da-0.01)<10e-5){
                        ss[i]="T";
                    }else  if(da<1){
                        ss[i]= strSplice(da,1,1);
                    }else {
                        ss[i]=parseInt(da);
                    }
                    break;
                case 'H':
                    var p=parseInt(da);
                    if(p==16832){
                        break;
                    }
                    if(p>=0&&p<50){
                        ss[i]=0
                    }else if(p>=50&&p<100){
                        ss[i]=50
                    }else if(p>=100&&p<200){
                        ss[i]=100
                    }else if(p>=200&&p<300){
                        ss[i]=200
                    }else if(p>=30&&p<600){
                        ss[i]=300
                    }else if(p>=600&&p<1000){
                        ss[i]=600
                    }else if(p>=1000&&p<1500){
                        ss[i]=1000
                    }else if(p>=1500&&p<2000){
                        ss[i]=1500
                    }else if(p>=2000&&p<2600){
                        ss[i]=2000
                    }else {
                        break;
                    }

                    if(p==0){
                        ss[i]="<30";
                    }
                    break;
                case 'CL':
                case 'CM':
                case 'CH':
                    var CM = parseInt(da);
                    if (CM == 60 || CM == 61 || CM == 62)
                    {
                        break;
                    }
                    else if (CM >= 10 && CM < 20)
                    {
                        CM = CM - 10;
                    }
                    else if (CM >= 20 && CM < 30)
                    {
                        CM = CM - 20;
                    }
                    else if (CM >= 30 && CM < 40)
                    {
                        CM = CM - 30;
                    }
                    else
                    {
                        break;
                    }

                    if (CM != 0){

                        ss[i]=CM
                    }
                    break;
                case 'VIS':
                case 'vis':
                    var VIS = parseFloat(da);
                    VIS = VIS / 1000.0;
                    VIS = Math.round(VIS * 10) / 10.0;
                    if (Math.abs(VIS - parseInt(VIS)) < 10e-5)
                    {
                        if (Math.abs(VIS - 0) < 10e-5)
                        {
                            ss[i] = "<0.1";
                        }
                        else
                        {
                            ss[i] = parseFloat(da)/1000;//strFormat(VIS,1);
                        }
                    }
                    else
                    {
                        ss[i] =  parseFloat(da)/1000;//strFormat(VIS,2,1);
                    }
                    break;
                case 'WEATHER':
                    var d=parseInt(da);
                    if(d<4){
                        break;
                    }else if(d==100||d==102|d==103){
                        break;
                    }else if(d>100){
                        d=d-100;
                    }else if(d<100){
                        //do nothing
                    }else {
                        break;
                    }
                    if(d==93||d==94||d==95||d==97){
                        d=d+10;
                    }
                    ss[i]= strFormat(d,3);
                    break;
                default :
                    ss[i]=da;
            }
           // //console.info(ss[i]);
        }
        return ss;
    }

    //字符串处理
    function strFormat(s,l,f){
        if (!s) return;
        var  v = '';
        if(!f){
            v="0000"+Math.abs(s).toString()
            v= v.substring(v.length-l, v.length);
        }else{
            v= s.toString();
            v= v.substr(v.indexOf(".")-l, v.indexOf(".")+f+1);
        }
        return v;
    }

    function strSplice(s, l) {
        if (!s) return;
        let  v="";
        v = s.toString();
        v = v.substring(0, l <= v.length ? l : v.length);
        return v;
    }

    return {
        close: close,
        open: open,
        init: init
    }

});