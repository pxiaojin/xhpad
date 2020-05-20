//风 功能
define(['Controller/DataFormat','Function/numberFC/XHJsonVectorFactory'], function(format,VectorFactory) {
    
    // 说明 ECMF 返回的顺序 时从左上角开始，rowNum相当于ny，colNum相当于nx
    var key;
    var level;
    var levelDesc;
    var callBack;
    var plotType;

    var legend;
    var item;

    var data;   //方向数据（要根据图层缩放重新绘制，需要记录数据）
    var dataS;  //速度数据

    var layerW; //图层（需要随地图移动重新绘制
    var layerSL;    //流线对象
    var initialFinished = true;

    function init(){
        
        XHW.C.MapMove.addZoomCallback(function(){
            if(layerW || layerSL){
                var staW = layerW.getVisible();
                var stasl = layerSL.getVisible();
                if(staW == true || stasl == true)
                updateZ();
            }
        });
        // 地图区域变化，增加根据区域筛选风羽功能后使用
        XHW.C.MapMove.addMoveCallback(function(){
            if(layerW || layerSL){
                var staW = layerW.getVisible();
                var stasl = layerSL.getVisible();
                if(staW == true || stasl == true)
                mapMove();
            }
        });
        
        $('#haiLang .liZi').on('touchstart', function(event) {
            var layers = XHW.map.getLayers();
            var liziId = 'real_'+level+'_'+level+'_'+key;
            var pos_liziId = 'pos_'+level+'_'+level+'_'+key;
            if(layerW.getVisible() == false && layerSL.getVisible() == false){return;}
            layers.forEach((layer) => {
                if(layer.id == liziId || layer.id == 'WSS' || layer.id == pos_liziId){
                    if ($('#haiLang .liZi').hasClass('current')) {
                        layer.setVisible(true);                 
                        $('#showTuLi #WSS').show();
                        layerW.setVisible(false);
                    } else {
                        layer.setVisible(false); 
                        $('#showTuLi #WSS').hide();
                        layerW.setVisible(true);
                    }
                }          
            })
        });

        $('.tuCeng_ul').on('click', '.eye', function (e) {
            var layers = XHW.map.getLayers();
            var keyValue = $(this).attr('key');
            if ($(this).parent().attr('class')) {
                layers.forEach((layer) => {
                    if (layer.id == $(this).parent().attr('class')) {
                        if ($(this).hasClass('current')) {                  
                            if($('#haiLang .liZi').hasClass('current') && $(this).html() == '风场'){
                                if(layerW){
                                    layerW.setVisible(false);
                                }
                                layer.setVisible(true);                 
                                $('#showTuLi #' + keyValue).css('display','block');
                            }else if(!$('#haiLang .liZi').hasClass('current') && $(this).html() == '风场'){
                                if(layerW){
                                    layerW.setVisible(true);
                                }
                                layer.setVisible(false); 
                                $('#showTuLi #' + keyValue).hide();
                            }else{
                                layer.setVisible(true);                 
                                $('#showTuLi #' + keyValue).css('display','block');
                            }
                        } else {
                            layer.setVisible(false); 
                            $('#showTuLi #' + keyValue).hide();
                            if(layerW && $(this).html() == '风场'){
                                layerW.setVisible(false);
                            }
                        }     
                    }
                })
            }
            // $('#showTuLi').css('bottom','2.65rem');
        })

        item = XHW.C.layerC.createItem('', buildLegend(), function(){
            close();
            if (callBack) {
                callBack();
            }
        })
    }

    function buildLegend(){
        return '<p class="tuCengP">风场</p>' +
            '<img src="img/legend/ws.png" alt="" />' +
            '<p>' +
            '<span>单位</span>' +
            '<span>m/s</span>' +
            '</p>';
    }

    function getData(){    //TODO, 之后更改写法（传递时间，elem固定
        data = null;
        dataS = null;
        daraArea = null;

        let param = '&level=' + level + '&time=' + timeBar.getRequestTime().split('-').join('') + '&type=array';
        initialFinished = false;
        
        // var date = new Date();
        // var nowTime = {};
        // nowTime['year'] = date.getFullYear();
        // nowTime['month'] = date.getMonth() + 1 < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
        // nowTime['day'] = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        // nowTime['hour'] = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        // var now_time = nowTime['year']+'-'+nowTime['month']+'-'+nowTime['day']+' '+nowTime['hour']+':00:00';
        //     now_time = new Date(now_time).getTime();
        // var cur_time = new Date(timeBar.year + '-' + timeBar.month + '-' + timeBar.day+' '+timeBar.hour+':00:00').getTime();
        // var dataTypeUri = cur_time < now_time ? 'real' : XHW.config.datasource.toLowerCase();
        if($('.swiper-wrapper>div.cur').parent().parent().hasClass('swiper-containerReal')){
            dataTypeUri = 'real';
        }else{
            if (XHW.config.datasource == 'GFS') {
                dataTypeUri = 'gfs';
            } else {
                dataTypeUri = 'ecmf';
            } 
        }
        XHW.C.http.Http(XHW.C.http.ecmfUrlNew, '/' + dataTypeUri +'/areadata?elem=UU' + param, function(json, time){
            time = format.jsonDate(time);
            item.htmlLayer = // time[0] + ' 发布 ' + 
                time[1] + ' ' + levelDesc + '风场';
            XHW.C.layerC.updateLayerData(key, item);
            data = json;

            // XHW.C.http.Http(XHW.C.http.ecmfUrl, '/ecmf/areadata?elem=VV' + param, function(json){
            XHW.C.http.Http(XHW.C.http.ecmfUrlNew, '/' + dataTypeUri +'/areadata?elem=VV' + param, function(json){
                dataS = json.vals;
                drawSeaWind();
            })
        });
    }

    /**
     * 绘制海浪方向 箭头形式
     * @param {} data 
     */
    function drawSeaWind(){
        //step*---------------查看两组数据是否齐全
        if(!data || !dataS) {
            return;
        }
        windPlume();
        windStream();
        
        if($('#pos_mixedGraph').hasClass('active') && $('.pos_9999_9999_WSS').children().hasClass('current')){
            if ($('#haiLang .liZi').hasClass('current')) {
                layerW.setVisible(false);
                layerSL.setVisible(true);
            }else{
                layerW.setVisible(true);
                layerSL.setVisible(false);
            }
        }else if($('#real_mixedGraph').hasClass('active')){
            var elem = 'real_'+level+'_'+level+'_WSS';
            if($('.'+elem).children('span').hasClass('current') && $('#real_mixedGraph_level li.active').attr('data-value') == level){
                if ($('#haiLang .liZi').hasClass('current')) {
                    layerW.setVisible(false);
                    layerSL.setVisible(true);
                }else{
                    layerW.setVisible(true);
                    layerSL.setVisible(false);
                }
            }else{
                layerW.setVisible(false);
                layerSL.setVisible(false);
            }
        }else{
            layerW.setVisible(false);
            layerSL.setVisible(false);
        }
        
        initialFinished = true;
    }

    //========================================================================风羽图部分
    function windPlume(){
        //step1---------------箭头所在数组
        var markers = [];
        //step2---------------获取屏幕显示范围(地图本身疑似做过优化)
        //step3---------------根据屏幕显示范围获取循环起始结束位置

        //step4---------------根据地图层级决定箭头疏密程度
        var zoom = XHW.map.getView().getZoom();
        var extent = XHW.map.getView().calculateExtent();
        extent = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
        var boundIndexs = calcBoundIndexs(extent, data.delta, data.slat, data.elat, data.slng, data.elng, data.rowNum, data.colNum);
        if (boundIndexs[0] == -1 || boundIndexs[1] == -1
            || boundIndexs[2] == -1 || boundIndexs[3] == -1)
            return;
        var delta = getDelta(zoom, data.delta);     //数据间隔为0.2经纬度 乘5转为1经纬度
        //step5---------------循环绘制箭头

        let rowStartIndex = boundIndexs[0];
        let rowEndIndex = boundIndexs[2];
        let colStartIndex = boundIndexs[1];
        let colEndIndex = boundIndexs[3];
        if (data.slat > data.elat) {
            let temp = rowStartIndex;
            let count = (rowEndIndex - rowStartIndex)
            rowStartIndex = data.rowNum - rowEndIndex - 1;
            rowEndIndex = rowStartIndex + count;
        }
        var uu = data.vals;
        var vv = dataS;
        for(var i = rowStartIndex; i <= rowEndIndex; i += delta) {  //row循环 lng+
            // var lng = parseInt(data.slng) + i * data.delta;
            for(var j = colStartIndex; j <= colEndIndex; j += delta) { //col循环 lat+
                if(!uu[i][j] && uu[i][j] != 0) {    //如果值为空并且值不为0，则不绘制（无数据） 
                    continue;
                }
                var lng = Math.round(data.slng) + j * data.delta;
                var lat = Math.round(data.slat) + i * data.delta;
                var marker = new ol.Feature({
                    geometry:new ol.geom.Point(ol.proj.fromLonLat([lng,lat])), 
                });

                var ws = uvToWs(Math.round(uu[i][j]),Math.round(vv[i][j]));
                var wd = uvToWd(Math.round(uu[i][j]),Math.round(vv[i][j]));

                marker.setStyle(getEcmfWindStyle(ws, wd));
                // var imgSrc = getImage(ws);
                // marker.setStyle(new ol.style.Style({       
                //     image: new ol.style.Icon({
                //         rotation: wd * Math.PI / 180,    //旋转（弧度？ wd * Math.PI / 180
                //         // anchor: 'anonymous',
                //         // duration: 2000,
                //         src: imgSrc
                //     })
                // }));
                markers.push(marker);
            }
        }
        
        //step6------------------将所有marker加入同一个图层

        let source = new ol.source.Vector({
            features: markers
        });

        if (!layerW) {
            layerW = new ol.layer.Vector({
                
            });
            layerW.setZIndex(101);
            layerW.id = key;
        }
        layerW.setSource(source);
        
        if ($.inArray(layerW, XHW.map.getLayers().getArray()) == -1)
        XHW.map.addLayer(layerW);
        //step3------------------判断是否功能是否已经关闭，已关闭则删除图层（防止延时导致功能关闭图层保留现象
        // if(!isOpen) {
        //     close();
        // }
        // var layer = new ol.layer.Vector({
        //     source: new ol.source.Vector({
        //         features: markers
        //     })
        // });
        // layer.id = key;
        // layer.setZIndex(101);
        // XHW.map.addLayer(layer);
        // //step2------------------判断当前是否有旧图层，有则替换
        // if(layerW){
        //     XHW.map.removeLayer(layerW);
        // }
        // layerW = layer;
    }

    function calcBoundIndexs(extent, delta, slat, elat, slng, elng, rowNum, colNum) {
        let rowStartIndex = 0;
        let rowEndIndex = rowNum-1;
        let colStartIndex = 0;
        let colEndIndex = colNum - 1;

        if (slat > elat) {
            let temp = slat;
            slat = elat;
            elat = temp;
        }

        if (slng > elng) {
            let temp = slng;
            slng = elng;
            elng = temp;
        }
        while (extent[0] > 180) {
            extent[0] -= 360;
        }
        while (extent[2] > 180) {
            extent[2] -= 360;
        }
        while (extent[0] < -180) {
            extent[0] += 360;
        }
        while (extent[2] < -180) {
            extent[2] += 360;
        }
        if (extent[0] > extent[2]) {
            extent[2] += 360;
        }
        if (extent[1] > slat && extent[1] < elat) {
            rowStartIndex = parseInt((extent[1] - slat) / delta);
        } else if(extent[1] >= elat) {
            rowStartIndex = -1;
        }
        if (extent[3] > slat && extent[3] < elat) {
            rowEndIndex = parseInt((extent[3] - slat) / delta);
        } else if(extent[3] <= slat) {
            rowEndIndex = -1;
        }
        if (extent[0] > slng && extent[0] < elng) {
            colStartIndex = parseInt((extent[0] - slng) / delta);
        } else if(extent[0] >= elng) {
            colStartIndex = -1;
        }
        if (extent[2] > slng && extent[2] < elng) {
            colEndIndex = parseInt((extent[2] - slng) / delta);
        } else if(extent[2] <= slng) {
            colEndIndex = -1;
        }
        return [rowStartIndex, colStartIndex, rowEndIndex, colEndIndex];
    }

    let ecmfWindStyleMap = {};
    function getEcmfWindStyle(ws_, wd_) {
        let wd = wd_ | 0;
        var imgSrc = getImage(ws_);
        var styleKey = wd + "-" + imgSrc;
        if (ecmfWindStyleMap.hasOwnProperty(styleKey))
            return ecmfWindStyleMap[styleKey];
        let iconStyle = new ol.style.Style({
            image: new ol.style.Icon({
                rotation: wd * Math.PI / 180,    //旋转（弧度？ wd * Math.PI / 180
                // anchor: 'anonymous',
                // duration: 2000,
                src: imgSrc
            })
        });
        ecmfWindStyleMap[styleKey] = iconStyle;
        return iconStyle;
    }

    /**
     * 根据zoom获取间距
     * @param {} zoom 
     */
    function getDelta(zoom, dataDelta){
        let delta = zoom > 7 ? 1 :
                    zoom > 6 ? 2 :
                    zoom > 5 ? 4 :
                    zoom > 4 ? 8 : 16;
        if (dataDelta < 0.2) {
            delta = zoom > 9 ? 1 :
                    zoom > 8 ? 2 :
                    zoom > 7 ? 4 :
                    zoom > 6 ? 8 :
                    zoom > 5 ? 16 : 32;
        }
        return delta;
    }

    /**
     * 获取图片地址
     * @param {*} ws 
     */
    function getImage(ws) {
        ws = (ws / 2) >> 0;
        ws = ws * 2;
       
        ws = ws > 72 ? 72 : ws;
        ws = ws < 1 ? 1 : ws;
        ws = ws < 10 ? '0' + ws : ws;
        return 'img/imgs/icon_ws' + ws + '@2x.png';
    }
    //===========================================================风羽结束

    //===========================================================风流线部分
    function windStream(){
        // var Wdata = [];
        // Wdata[0] = TDtoOD(dataS);
        // Wdata[1] = TDtoOD(dataS);
        // windHead = data;
        // Wdata[2] = TDtoOD(data.vals);
        var wd = [];
        var ws = [];
        var uu = TDtoODForECMF(data.vals);
        var vv = TDtoODForECMF(dataS);
        for(var i = 0; i < uu.length; i++){
            var fs = uvToWs(uu[i],vv[i]);
            // uvToWd(uu[i],vv[i]);
            // wd.push(fx);
            ws.push(fs);
        };
        var Wdata = [];
        Wdata[0] = ws;            // 风速
        Wdata[1] = uu;            // 矢量uu
        Wdata[2] = vv;            // 矢量vv
        windHead = data;

        showWindStream(Wdata);
    }

    /**
     * 二维数组转一维（并且调换顺序）
     */
    function TDtoODForECMF(array){
        var arr = [];
        var length = array[0].length;
        // for(var i = 0; i < array.length; i++) {
        for(var i = array.length - 1; i >= 0; i--) {
            for(var j = 0; j < array[0].length; j++) {
                arr.push(Math.round(array[i][j]));
            }
        }
        return arr;
    }

    /**
     * 
     */
    function showWindStream(Wdata){
        //step1 创建数据对象，设置各组数据配置
        var data = [{
            header: getWindHeader(windHead.slng, windHead.elat, windHead.delta,
                windHead.delta, windHead.colNum, windHead.rowNum, 0, 0), //0,0表示气温
            data:[]
        },{
            header: getWindHeader(windHead.slng, windHead.elat, windHead.delta,
                windHead.delta, windHead.colNum, windHead.rowNum, 2, 2),  //2,2表示u分量
            data:[]
        },{
            header: getWindHeader(windHead.slng, windHead.elat, windHead.delta,
                windHead.delta, windHead.colNum, windHead.rowNum, 2, 3),  //2,3表示v分量
            data:[]
        }];

        // data[0].header = getWindHeader(60, 60, 0.25, 0.25, 361, 281,0,0);
        // data[1].header = getWindHeader(60, 60, 0.25, 0.25, 361, 281,2,2);
        // data[2].header = getWindHeader(60, 60, 0.25, 0.25, 361, 281,2,3);

        //step2 填充数据
        for(let i = 0; i < Wdata[1].length; i++) {
            data[0].data[i] = Wdata[0][i];
            data[1].data[i] = Wdata[1][i];
            data[2].data[i] = Wdata[2][i];
        }

        //step3 创建风流线对象
        var layer = new WindLayer(data, {
            projection: 'EPSG:3857',
            ratio: 1
        });
        layer.id = 'real_'+level+'_'+level+'_'+key;
        layer.setZIndex(1000);
        layer.appendTo(XHW.map);
        //step2------------------判断当前是否有旧图层，有则替换
        if(layerSL){
            layerSL.clearWind();
        }
        layerSL = layer;
    }

    /**
     * 获取各组数据相关配置
     * @param {*} lo1   起始经度
     * @param {*} la1   起始纬度
     * @param {*} dx    经度差值
     * @param {*} dy    纬度差值
     * @param {*} nx    经度差值次数
     * @param {*} ny    纬度差值次数
     * @param {*} parameC   参数类别
     * @param {*} parameN   参数标记 
     */
    function getWindHeader(lo1, la1, dx, dy, nx, ny, parameC, parameN){
        return {
            lo1: lo1,    
            la1: la1,     
            dx: dx,      
            dy: dy,      
            nx: nx,      
            ny: ny,      
            refTime: '',             
            forecastTime: 0,
            parameterCategory: parameC,   
            parameterNumber: parameN,     
        };
    }

    //  矢量UV转风向
    function uvToWd(u, v){
        var fx;
        if (u > 0 & v > 0) {
            fx = 270 - Math.atan(v / u) * 180 / Math.PI;
        }else if (u < 0 & v > 0) {
            fx = 90 - Math.atan(v / u) * 180 / Math.PI;
        }else if (u < 0 & v < 0) {
            fx = 90 - Math.atan(v / u) * 180 / Math.PI;
        }else if (u > 0 & v < 0) {
            fx = 270 - Math.atan(v / u) * 180 / Math.PI;
        }else if (u == 0 & v > 0) {
            fx = 180;
        }else if (u == 0 & v < 0) {
            fx = 0;
        }else if (u > 0 & v == 0) {
            fx = 270;
        }else if (u < 0 & v == 0) {
        　　fx = 90;
        }else if (u == 0 & v == 0) {
        　　fx = 999.9;
        }
        return fx;
    }

    //  矢量UV转风速
    function uvToWs(u,v){
        return  Math.sqrt(u*u + v*v);
    }

    //========================================================================风流线结束

    function remove(){
        if(layerW) {
            XHW.map.removeLayer(layerW);
            // layerW.setVisible(false);     
            layerW = null;
        }
        if(layerSL) {
            layerSL.clearWind();
            // layerSL.setVisible(false);     
            layerSL = null;
        }
        // var liziId = 'real_'+level+'_'+level+'_'+key;
        // var layers = XHW.map.getLayers();
        // layers.forEach((layer) => {
        //     if(layer.id == liziId || layer.id == 'WSS'){
        //         layer.setVisible(false);                 
        //         $('#showTuLi #WSS').hide();
        //         layerW.setVisible(false);            
        //     }          
        // })
    }

    function open(key_, level_, levelDesc_, callBack_, plotType_){
        key = key_;
        level = level_;
        levelDesc = levelDesc_;
        callBack = callBack_;
        plotType = plotType_;
        //---------添加图层控制
        item.htmlLayer = '风场';
        let b = XHW.C.layerC.addLayer(key, item);
        if(!b) {
            close();
            return;
        }
        getData();
    }

    function close(){
        //---------删除图层控制
        XHW.C.layerC.removeLayer(key);
        remove();
    }

    function update(){
        if(!layerW && !layerSL) return;
        remove();
        drawSeaWind();
    }

    /**
     * 当层次发生变化时
     * 
     */
    function updateZ(){
        if(!layerW && !layerSL) return;
        // remove();
            drawSeaWind();
    }

    function mapMove() {
        if(!layerW && !layerSL) return;
        // remove();
            drawSeaWind();
    }

    init();

    return {
        updateZ: updateZ,
        open: open,
        close: close,
        update: update,
    }
});