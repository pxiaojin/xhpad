//风 功能
define(['Controller/DataFormat'], function(format) {
    
    var key;
    var level;
    var levelDesc;
    var callBack;
    var plotType;

    var item;

    var data;   //方向数据（要根据图层缩放重新绘制，需要记录数据）
    var dataS;  //速度数据

    var layerW; //图层（需要随地图移动重新绘制
    var layerSL;    //流线对象

    var initialFinished = true;

    function init(){
        XHW.C.MapMove.addZoomCallback(function(){
            updateZ();
        });
        key = 'gfs_wind';

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
        let time = XHW.silderTime;

        let param = '&level=' + level + '&year=' + time.year
        + '&month=' + time.month + '&day=' + time.day +'&hour=' + time.hour;

        initialFinished = false;
        XHW.C.http.http('/gfs/areadata', '?elem=WD' + param, function(json, time){
            time = format.jsonDate(time);
            item.htmlLayer = // time[0] + ' 发布 ' +
                 time[1] + ' ' + levelDesc + '风场';
            XHW.C.layerC.updateLayerData(key, item);
            data = json;

            XHW.C.http.http('/gfs/areadata', '?elem=WS' + param, function(json){
                dataS = json.vals;
                drawSeaWind();
            });
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

        if(plotType != '风羽' && $('#haiLang .liZi').hasClass('current')) {
            if(layerW) {
                XHW.map.removeLayer(layerW);
                layerW = null;
            }
            windStream();
            if($('#lc_numberFC_wind').siblings($('.tuLiEye')).hasClass('current')){
                layerSL.setVisible(false);
            }else{
                layerSL.setVisible(true);
            }
        } else {
            if(layerSL) {
                layerSL.clearWind();
                layerSL = null;
            }
            windPlume();
        }
        // if($('#haiLang .liZi').hasClass('current')) {
        //     windStream();
        // } else {
        //     windPlume();
        // }
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
        var delta = getDelta(zoom);     //数据间隔为0.2经纬度 乘5转为1经纬度
        //step5---------------循环绘制箭头
        var vals = data.vals;
        for(var i = 0; i < vals.length; i += delta) {  //row循环 lng+
            var lng = data.slng + i * data.delta;
            for(var j = 0; j < vals[i].length; j += delta) { //col循环 lat+
                if(!vals[i][j] && vals[i][j] != 0) {    //如果值为空并且值不为0，则不绘制（无数据） 
                    continue;
                }
                var lat = data.slat + j * data.delta;
                var marker = new ol.Feature({
                    geometry:new ol.geom.Point(ol.proj.fromLonLat([lng, lat])), 
                })

                var imgSrc = getImage(dataS[i][j]);
                marker.setStyle(new ol.style.Style({       
                    image: new ol.style.Icon({
                        rotation: vals[i][j] * Math.PI / 180,    //旋转（弧度？ wd * Math.PI / 180
                        // anchor: 'anonymous',
                        // duration: 2000,
                        src: imgSrc
                    })
                }));
                markers.push(marker);
            }
        }
        
        //step6------------------将所有marker加入同一个图层
        // let layer = new ol.layer.Vector({
        //     source: new ol.source.Vector({
        //         features: markers
        //     })
        // });
        // layer.id = key;
        // layer.setZIndex(10);
        // XHW.map.addLayer(layer);
        // //step2------------------判断当前是否有旧图层，有则替换
        // if(layerW){
        //     XHW.map.removeLayer(layerW);
        // }
        // layerW = layer;
        //step6------------------将所有marker加入同一个图层
        let source = new ol.source.Vector({
            features: markers
        });

        if (!layerW) {
            layerW = new ol.layer.Vector({
                
            });
            layerW.setZIndex(15);
            layerW.id = key;
        }
        layerW.setSource(source);
        
        if ($.inArray(layerW, XHW.map.getLayers().getArray()) == -1)
        XHW.map.addLayer(layerW);
        //step3------------------判断是否功能是否已经关闭，已关闭则删除图层（防止延时导致功能关闭图层保留现象
        if(!isOpen) {
            close();
        }
    }

    /**
     * 根据zoom获取间距
     * @param {} zoom 
     */
    function getDelta(zoom){
        var delta = zoom > 6 ? 1 :
                    zoom > 5 ? 2 :
                    zoom > 4 ? 4 : 6;
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
        var Wdata = [];
        Wdata[0] = TDtoOD(dataS);
        Wdata[1] = TDtoOD(dataS);
        windHead = data;
        Wdata[2] = TDtoOD(data.vals);
        getUV(Wdata);
    }

    /**
     * 二维数组转一维（并且调换顺序）
     */
    function TDtoOD(array){
        var arr = [];
        var length = array[0].length;
        for(var j = length - 1; j >= 0; j--) {
            for(var i = 0; i < array.length; i++) {
                arr.push(array[i][j]);
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
                windHead.delta, windHead.rowNum, windHead.colNum, 0, 0), //0,0表示气温
            data:[]
        },{
            header: getWindHeader(windHead.slng, windHead.elat, windHead.delta,
                windHead.delta, windHead.rowNum, windHead.colNum, 2, 2),  //2,2表示u分量
            data:[]
        },{
            header: getWindHeader(windHead.slng, windHead.elat, windHead.delta,
                windHead.delta, windHead.rowNum, windHead.colNum, 2, 3),  //2,3表示v分量
            data:[]
        }];

        // data[0].header = getWindHeader(0, 90, 0.5, 0.5, 361, 180,0,0);
        // data[1].header = getWindHeader(0, 90, 0.5, 0.5, 361, 180,2,2);
        // data[2].header = getWindHeader(0, 90, 0.5, 0.5, 361, 180,2,3);

        //step2 填充数据
        for(var i = 0; i < Wdata[1].length; i++) {
            data[0].data[i] = Wdata[0][i];
            data[1].data[i] = Wdata[1][i];
            data[2].data[i] = Wdata[2][i];
        }

        //step3 创建风流线对象
        var layer = new WindLayer(data, {
            projection: 'EPSG:3857',
            ratio: 1
        })
        
        layer.id = key;
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

    /**
     * 数据全部获取后，将风向、风速数组转为uv数组
     */
    function getUV(Wdata) {
        for(var i = 0; i < Wdata[1].length; i++) {
            var ws = Wdata[1][i];
            var wd = Wdata[2][i];
            var val = SDToUV(ws, wd);
            Wdata[1][i] = val[0];  //u
            Wdata[2][i] = val[1];  //v
        }
        showWindStream(Wdata)
    }

    /**
     * 将方向、速度转为uv分量
     * @param {*} ws 
     * @param {*} wd 
     */
    function SDToUV(ws, wd){
        // if(Math.abs(ws-9999)<1e-6||Math.abs(wd-9999)<1e-6)return [0,0];
        var seta = 0;
        if (isDoubleEqual(wd, 0)) return [0, 0];
        if ((wd < 180 && wd > 0) || isDoubleEqual(wd, 360.))
            seta = wd + 180.;
        else if ((wd < 360 && wd >= 180))
            seta = wd - 180.;
        var u = ws * Math.sin(seta * Math.PI / 180.);
        var v = ws * Math.cos(seta * Math.PI / 180.);
        return [u, v];
    }

    function isDoubleEqual(a, b){
         return Math.abs(a-b)<1e-12?true:false;
    }

    //========================================================================风流线结束

    function remove(){
        if(layerW) {
            XHW.map.removeLayer(layerW);
            layerW = null;
        }
        if(layerSL) {
            layerSL.clearWind();
            layerSL = null;
        }
    }

    function open(key_, level_, levelDesc_, callBack_, plotType_){
        key = key_;
        level = level_;
        levelDesc = levelDesc_;
        callBack = callBack_;
        plotType = plotType_;
        //---------添加图层控制
        item.htmlLayer = '风场';
        var b = XHW.C.layerC.addLayer(key, item);
        if(!b) {
            close();
            return;
        }
        getData();;
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