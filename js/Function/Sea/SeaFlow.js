//海流
define(['Controller/DataFormat', 'Function/numberFC/FloatSelector'], function(format, floatSelector) {
    
    var key;
    var legend;
    var item;

    var isOpen;
    var layerW; //图层（需要随地图移动重新绘制
    var data;   //方向数据（要根据图层缩放重新绘制，需要记录数据）
    var dataS;  //速度数据
    var layerSL;    //流线对象
    var button;     //按钮
    // var select;     //选择框

    function init(){
        button = $('#sea_flow');
        // select = $('#sea_flow_select');
        button.click(function(){
            if(!isOpen) {
                open();
            } else {
                close();
            }
        });
        floatSelector.on('sea_flow_select', 'click', function(){
            open();
            $('#sea_flow_select').css('display', 'none');
        });
        // select.change(function(){
        //     if(isOpen) getData();
        // });

        // sliderBar.addCallback(function(){
        //     if(isOpen) getData();
        // });

        XHW.C.MapMove.addZoomCallback(function(){
            updateZ();
        });

        key = 'sea_flow';
        legend = '<p class="tuCengP">海流</p>' + 
                '<img src="img/legend/seaflow.png" alt="" />' +
                '<p>' +
                    '<span>单位</span>' +
                    '<span>m/s</span>' +
                '</p>';
        item = XHW.C.layerC.createItem('', '', function(){
            close();
        })
    }

    function getData(){    //TODO, 之后更改写法（传递时间，elem固定
        data = null;
        dataS = null;

      
        // var level = floatSelector.getValue('sea_flow_select');
        let param = '&level=' + level + '&time=' + timeBar.getRequestTime().split('-').join('') + '&type=array';
        
        XHW.C.http.Http(XHW.C.http.ecmfUrlNew, '/fio/areadata?elem=V' + param, function(json, time){
            time = format.jsonDate(time);
            item.htmlLayer = // time[0] + ' 发布 ' +
                 time[1] + ' ' + floatSelector.getValueDesc('sea_flow_select') + '海流';
            XHW.C.layerC.updateLayerData(key, item);
            data = json;
            drawSeaWind();
        },function(){
            item.htmlLayer = Number(time.month) + '月' + Number(time.day) + '日 ' + time.hour + ':00 ' + ' 海流' + '(无数据)';
            XHW.C.layerC.updateLayerData(key, item);
            remove();
        })
       
        XHW.C.http.Http(XHW.C.http.ecmfUrlNew, '/fio/areadata?elem=U' + param, function(json, time){
            dataS = json.vals;
            drawSeaWind();
        })
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

        // if($('#config_wind p .current').next().html() == '风羽') {
        //     windPlume();
        // } else {
            windStream();
        // }
    }

    //===========================================================风流线部分
    function windStream(){
        var Wdata = [];
        Wdata[0] = TDtoOD(dataS);
        Wdata[1] = TDtoOD(dataS);
        windHead = data;
        Wdata[2] = TDtoOD(data.vals);
        // getUV(Wdata);
        showWindStream(Wdata);
    }

    /**
     * 二维数组转一维（并且调换顺序）
     */
    function TDtoOD(array){
        var arr = [];
        var length = array[0].length;
        // for(var j = length - 1; j >= 0; j--) {
        //     for(var i = 0; i < array.length; i++) {
        for(var i = array.length - 1; i >= 0; i--) {
            for(var j = 0; j < array[0].length; j++) {
                if(array[i][j] == null) {
                    arr.push(0);
                } else {
                    arr.push(array[i][j]);
                }
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

        // data[0].header = getWindHeader(0, 90, 0.5, 0.5, 361, 180,0,0);
        // data[1].header = getWindHeader(0, 90, 0.5, 0.5, 361, 180,2,2);
        // data[2].header = getWindHeader(0, 90, 0.5, 0.5, 361, 180,2,3);

        //step2 填充数据
        for(var i = 0; i < Wdata[1].length; i++) {
            data[0].data[i] = getSpeed(Wdata[1][i], Wdata[2][i]);
            data[1].data[i] = Wdata[1][i];
            data[2].data[i] = Wdata[2][i];
        }

        //step3 创建风流线对象
        var layer = new CurrentLayer(data, {
            projection: 'EPSG:3857',
            ratio: 1
        })

        layer.appendTo(XHW.map);
        layer.id = 'sea_'+level+'_'+level+'_'+key;
        //step2------------------判断当前是否有旧图层，有则替换
        if(layerSL){
            layerSL.clearWind();
        }
        layerSL = layer;

        if($('.'+layer.id).children('span').hasClass('current') && $('.'+layer.id).parent().attr('display') == 'block'){
            layerSL.setVisible(true);
        }else{
            layerSL.setVisible(false);
        }
        // if($('#lc_sea_flow').siblings($('.tuLiEye')).hasClass('current')){
        //     layerSL.setVisible(false);
        // }else{
        //     layerSL.setVisible(true);
        // }
        //step3------------------判断是否功能是否已经关闭，已关闭则删除图层（防止延时导致功能关闭图层保留现象
        if(!isOpen) {
            close();
        }
        
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
     * 根据uv计算速度
     * @param {} u 
     * @param {*} v 
     */
    function getSpeed(u, v){
        if(u == 0 && v == 0) return 0;
        return speed = Math.sqrt(u * u + v * v);
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

        item.htmlLayer = '海流';
        //---------添加图层控制
        var b = XHW.C.layerC.addLayer(key, item);
        if(!b) {
            close();
            return;
        }
        //---------添加按钮选中样式
        button.parent().addClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrc'));
		XHW.C.layout.judgeWhetherSelect(button);
        floatSelector.open('sea_flow_select');
        // select.parent().css('display', 'inline-block');//选中时展示层次选择框
        $('#sea_flow_select').css('display', 'inline-block');

        getData();
        isOpen = true;
    }

    function close(){
        //---------删除图层控制
        XHW.C.layerC.removeLayer(key);

        //---------取消按钮选中样式
        button.parent().removeClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrcpri'));
		XHW.C.layout.judgeWhetherSelect(button);
        // select.parent().hide();
        floatSelector.close('sea_flow_select');
        $('#sea_flow_select').css('display', 'none');

        remove();
        isOpen = false;
    }

    /**
     * 当层次发生变化时
     * 
     */
    function updateZ(){
        if(!isOpen) return; //当前功能未开启则不执行
        if(!layerW) return;  //无风羽图层则不执行
        drawSeaWind();
    }

    init();

    return {
        updateZ: updateZ,
        open: open,
        close: close
    }
});