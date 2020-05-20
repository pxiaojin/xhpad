/**
 * 风流线功能
 */
define([], function() {
    var isOpen = false;

    var Wdata = [];
    var count = 0;  //记录数据获取是否完整

    var windHead = [];  //记录数据相关配置（起始经纬度......）

    /**
     * 
     */
    function init(){
        $('#seaWave2').click(function(){
            if(!isOpen) {
                getWindData();
            } else {
                close();
            }
        });
    }
    init();

    /**
     * 获取相关气象数据（uv分量，温度）
     */
    function getWindData() {
        Wdata = [];
        count = 0;

        var param3 = '?elem=MWH';
        XHW.C.http.oceanHttp('/hy1Suo/areadata/', param3, function(data){
            Wdata[0] = TDtoOD(data.vals);
            windHead = data;
            count++;
            showWindStream();
        })

        var param2 = '?elem=MWD';
        XHW.C.http.oceanHttp('/hy1Suo/areadata/', param2, function(data){
            Wdata[1] = TDtoOD(data.vals);
            count++;
            showWindStream();
        })
        
        isOpen = true;
    }

    /**
     * 二维数组转一维
     */
    function TDtoOD(array){
        var arr = [];
        var length = array[0].length;
        for(var j = length - 1; j >= 0; j--) {
            for(var i = 0; i < array.length; i++) {
                arr.push(array[i][j]);
            }
        }
        // for(var i = 0; i < array.length; i++) {
        //     for(var j = 0; j < array[i].length; j++) {
        //         arr.push(array[i][j]);
        //     }
        // }
        return arr;
    }

    /**
     * 
     */
    function showWindStream(){
        //step1 判断数据是否全部获取
        if(count < 2) {
            return;
        }

        var uv = getUV(Wdata[1]);
        if(!uv) return;

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
        for(var i = 0; i < Wdata[0].length; i++) {
            var x = i%10;
            data[0].data[i] = Wdata[0][i];
            data[1].data[i] = uv[0][i];
            data[2].data[i] = uv[1][i];
        }

        //step3 创建风流线对象并且添加到地图
        if (data) {
            wind = new WindLayer(data, {
                projection: 'EPSG:3857',
                ratio: 1
            })
            wind.appendTo(XHW.map)
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
    function getUV(s) {
        var uv = [[], []];
        for(var i = 0; i < s.length; i++) {
            var val = SDToUV(s[i], 1);
            uv[0][i] = val[0];  //u
            uv[1][i] = val[1];  //v
        }

        return uv;
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

    function close(){
        XHW.map.removeLayer(wind);
        isOpen = false;
    }

    return {
        getWindData: getWindData
    }
    
});