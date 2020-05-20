//-----------------多点航空数据详情
define(['Controller/Http',
        'Controller/layout',
        'Controller/DataFormat',
        'lib/echarts',
        'Function/tool/ProfileChart'],
    function(http, layout, format, echarts) {
    
    var Img;
    function init(){
        Img = new Image();
        Img.src = './img/wind/windy.png';

        $('input:radio[name="rightInfo_multi_radio"]').change(function(){
            drawCrossSection();
        })
    }
    init();
    
    /**
     * 查询海面单点详细信息
     * @param {*} positions 位置
     */
    function queryAviationInfo(positions){
        //---------------------------标起始结束点
        $('#rightInfo_multi_lnglatS').html('起始经纬度：' + format.lnglat(positions[0][0], positions[0][1]));
        $('#rightInfo_multi_lnglatE').html('结束经纬度：' + format.lnglat(positions[positions.length - 1][0],
                    positions[positions.length - 1][1]));        
        //---------------------------查询数据
        queryAviation(positions);
        //---------------------------显示详情
        layout.showRightMenu();
        $('#right_info_multi').show();
    }

    // [温,盐,流U,流V, 浪向,浪高,浪周期,涌浪周期,风U,风V]

    var timeChart;  //随时间变化的图表
    var lnglats;      //位置列表
    var dataS;      //数据列表
    var gfshPas = ['050', 100,200,300,400,500,600,650,700,750,800,850,900,925,950,975];
    var ecHPas = ['050', 100,200,300,400,500,600,700,800,850,900,925,950,1000];
    var hPas = XHW.config.datasource == 'ECMF' ? ecHPas : gfshPas;
    /**
     * 查询随位置变化的数据
     * @param {*} positions 
     */
    function queryAviation(positions){
        // http://weather.xinhong.net/gfs/spaceprofiledata?lat=35.002,-20.5,37.2,40&lng=128.76,115,122.3,135
        var param = {
            lng: '',
            lat: ''
        }
        for(var i = 0; i < positions.length; i++) {
            param.lng += positions[i][0] + ',';
            param.lat += positions[i][1] + ',';
        }
        
        
        let url = XHW.config.datasource == 'ECMF' ? http.ecmfUrl : http.weatherUrl;
        let paramsURL = XHW.config.datasource == 'ECMF' ? '/ecmf' : '/gfs';
        paramsURL += '/spaceprofiledata';
        hPas = XHW.config.datasource == 'ECMF' ? ecHPas : gfshPas;

        http.get(url, paramsURL, param, function(json){
        //http.get(http.weatherUrl, '/gfs/spaceprofiledata', param, function(json){
            var time = json.time.split('_');
            var date = new Date(time[0].substring(0,4), parseInt(time[0].substring(4, 6)) -1,
                                 time[0].substring(6,8), time[0].substring(8,10));
            time = new Date(date.getTime() + parseInt(time[1]) * 60 * 60 * 1000);
            time = time.getFullYear() + '年' + (time.getMonth() + 1) + '月' + time.getDate()
                        + '日' + time.getHours() + '时';
            $('#rightInfo_multi_time').html('时间:' + time);
            //-----------------------整理数据 
            lnglats = [];
            dataS = {
                //-------------强对流
                TS:[],
                VIS:[],
                CTH:[],
                CBH:[],
                //--------------航空危险天气
                WS:[],
                WD:[],
                TT:[],
                RH:[],
                TURB:[],
                ICE:[],
            };
            var data = json.data;
            let sourceType = XHW.config.datasource;
            if (sourceType == 'ecmf' || sourceType == 'ECMF')
                sourceType = 'EC';
            for(var i = 0; i < data.latlngs.length; i++){
                lnglats.push(data.latlngs[i]);
                var profiledatas = data.profiledatas[i];
                //-----------------------强对流
                if (profiledatas.DANGER && profiledatas.DANGER['9999']) {
                    dataS.TS.push(profiledatas.DANGER['9999']['TS']);
                    dataS.VIS.push(profiledatas.DANGER['9999']['VIS']);
                    dataS.CTH.push(profiledatas.DANGER['9999']['CTH']);
                    dataS.CBH.push(profiledatas.DANGER['9999']['CBH']);
                }
                //-----------------------航空危险天气
                dataS.WS.push([]);
                dataS.WD.push([]);
                dataS.TT.push([]);
                dataS.RH.push([]);
                dataS.TURB.push([]);
                dataS.ICE.push([]);
                for(var j = 0; j < hPas.length; j++) {
                    var key = hPas[j] + '';
                    if (key.length < 4) {
                        key = '0' + key;
                    }
                    if (profiledatas[sourceType] && profiledatas[sourceType][key]) {
                        var u = profiledatas[sourceType][key]['UU'];
                        var v = profiledatas[sourceType][key]['VV'];
                        var ws = Math.sqrt(u * u + v * v);
                        ws = ((ws * 10) >> 0) / 10;
                        var wd = 270.0 - Math.atan2(v, u) * 180.0 / Math.PI;
                        wd = ((wd * 10) >> 0) / 10;
    
                        dataS.WS[i].push(ws);
                        dataS.WD[i].push(wd);
                        dataS.TT[i].push(profiledatas[sourceType][key]['TT']);
                        dataS.RH[i].push(profiledatas[sourceType][key]['RH']);
                    }
                    if (profiledatas.DANGER && profiledatas.DANGER[key]) {
                        dataS.TURB[i].push(profiledatas.DANGER[key]['TURB']);
                        dataS.ICE[i].push(profiledatas.DANGER[key]['ICE']);
                    }
                }
            }
            
            //-------------------------强对流绘制
            timeChart = timeChart ? timeChart.dispose() : '';
            timeChart = echarts.init(document.getElementById('rightInfo_multi_chart'));
            var option = {
                title: {
                    text: ''
                },
                tooltip: {
                    trigger: 'axis'
                },
                color: ['#c23531', '#ff7d00', '#0396a5', '#007eff'],
                legend: {
                    data:['雷暴','能见度','云顶高','云底高']
                },
                grid: {
                    left: 80,
                },
                xAxis: {
                    data: lnglats,
                    boundaryGap : true,
                    axisTick:{alignWithLabel: true},
                    axisLine: {onZero: false, lineStyle:{color: '#13507f'}},
                    axisLabel:{
                        formatter: function(value, index){
                            value = value.split(',');
                            value = format.lnglat(value[1], value[0]).split(' , ');
                            return value[0] + '\n' + value[1];
                        }
                    },
                },
                yAxis: [
                    {
                        name: '雷暴\n(%)',
                        type: 'value',
                        // max: tMax,
                        // min: tMin,
                        splitLine:{show:false},
                        axisLine: {lineStyle:{color: '#13507f'}},
                    },
                    {
                        name: '能见度\n(km)',
                        type: 'value',
                        // max: saMax,
                        // min: saMin,
                        position:'left',
                        offset: 40,
                        splitLine:{show:false},
                        axisLine: {lineStyle:{color: '#13507f'}},
                    },
                    {
                        name: '云高\n(m)',
                        type: 'value',
                        // max: fsMax,
                        // min: fsMin,
                        splitLine:{show:false},
                        axisLine: {lineStyle:{color: '#13507f'}},
                    }
                ],
                dataZoom:[/*{
                    type:'slider',
                    height: 20,
                    bottom: 5,
                },*/{
                    type:'inside'
                }],
                series: [{
                    name: '雷暴',
                    type: 'line',
                    smooth:true,
                    data: dataS.TS
                },{
                    name: '能见度',
                    yAxisIndex: 1,
                    type: 'line',
                    smooth:true,
                    areaStyle: {
                        color:{
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: 'rgba(255,125,0,0.8)' // 0% 处的颜色
                            }, {
                                offset: 1, color: 'rgba(255,125,0,0)' // 100% 处的颜色
                            }],
                            global: false // 缺省为 false
                        }
                    },
                    data: dataS.VIS
                },{
                    name: '云顶高',
                    yAxisIndex: 2,
                    type: 'line',
                    smooth:true,
                    data: dataS.CTH
                },{
                    name: '云底高',
                    yAxisIndex: 2,
                    type: 'line',
                    smooth:true,
                    data: dataS.CBH
                }]
            };
            timeChart.setOption(option);

            //-------------------------航天危险天气绘制
            drawCrossSection();
        })
    }
    var profileChart;
    /**
     * 绘制剖面图
     * @param {*} type 
     */
    function drawCrossSection(){

        let type = $('input:radio[name="rightInfo_multi_radio"]:checked').val();
        let options = {
            xAxis: {
                data: lnglats,
                boundaryGap : true,
                axisTick:{alignWithLabel: true},
                axisLine: {onZero: false, lineStyle:{color: '#13507f'}},
                axisLabel:{
                    formatter: function(value, index){
                        value = value.split(',');
                        value = format.lnglat(value[1], value[0]).split(' , ');
                        return value[0] + '\n' + value[1];
                    }
                },
            },
            yAxis: {
                data: hPas,
                boundaryGap : true,
                axisTick:{alignWithLabel: true},
                axisLine: {onZero: false, lineStyle:{color: '#13507f'}}
            },
            series: [{
                name: '湿度',
                type: 'fill',
                data: dataS.RH,
                visible: type == 'RH',
                fillColorFunc: function(value) {
                    return getRHColor(value);
                }
            },{
                name: '颠簸',
                type: 'fill',
                data: dataS.TURB,
                visible: type == 'TURB',
                fillColorFunc: function(value) {
                    return getTRUBColor(value)
                }
            },{
                name: '积冰',
                type: 'fill',
                data: dataS.ICE,
                visible: type == 'ICE',
                fillColorFunc: function(value) {
                    return getICEColor(value)
                }
            },{
                name: '风羽',
                type: 'windbarb',
                WS: dataS.WS,
                WD: dataS.WD,
                visible: true,
                Img: Img
            },{
                name: '温度',
                type: 'label',
                data: dataS.TT,
                visible: true,
                color: '#c23531'
            }]
        };
        if (!profileChart) {
            profileChart = new tool.ProfileChart({left_axe: 'rightInfo_multi_crossL', right_content: 'rightInfo_multi_crossR'});
        }
        profileChart.resetData(options);
    }

    /**
     * 根据湿度获取填充色
     * @param {*} val
     */
    function getRHColor(val) {
        if (!val || val == "") {
            return 'rgba(0,0,0,0)';
        }
        var r = 0.95;
        var g = 1.0;
        var b = 0.95;
        var a = 0.6;
        var delta = val - 20;
        var maxDeltaRight = 100;
    
        r = r - delta / maxDeltaRight;
        if (r < 0.1) r = 0.1;
        else if (r > 1.0) r = 1.0;
        r = (r * 255) >> 0;
    
        g = g - delta * 0.5 / maxDeltaRight;
        if (g < 0.5) g = 0.5;
        else if (g > 1.0) g = 1.0;
        g = (g * 255) >> 0;
    
        b = b - delta / maxDeltaRight;
        if (b < 0.1) b = 0.1;
        else if (b > 1.0) b = 1.0;
        b = (b * 255) >> 0;
    
        a = a + delta * 2 / maxDeltaRight;
        if (a > 1.0) a = 1.0;
    
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
    }

    /**
     * 根据颠簸获取填充色
     * @param {*} val 
     */
    function getTRUBColor(val) {
        if (!val || val == "") {
            return 'rgba(0,0,0,0)';
        }
        var r = 0;
        var g = 0;
        var b = 0;
        var a = 0;
        if(val <= 0.7) {

        } else if(val <= 2){
            r = 0.996;
            g = 0.788;
            b = 0.349;
            a = 0.35;
        } else if(val <= 3.5){
            r = 0.922;
            g = 0.435;
            b = 0.075;
            a = 0.6;
        } else {
            r = 0.431;
            g = 0.153;
            b = 0.024;
            a = 0.75;
        }
        r = (r * 255) >> 0;
        g = (g * 255) >> 0;
        b = (b * 255) >> 0;
    
        if (a > 1.0) a = 1.0;
    
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
    }

    /**
     * 根据积冰获取填充色
     * @param {*} val 
     */
    function getICEColor(val) {
        if (!val || val == "") {
            return 'rgba(0,0,0,0)';
        }
        var r = 0;
        var g = 0;
        var b = 0;
        var a = 0;
        if(val <= 0.7) {

        } else if(val <= 2){
            r = 0;
            g = 0.925;
            b = 0.925;
            a = 0.25;
        } else if(val <= 3.5){
            r = 0.004;
            g = 0.627;
            b = 0.965;
            a = 0.35;
        } else {
            r = 0;
            g = 0;
            b = 1;
            a = 0.45;
        }
        r = (r * 255) >> 0;
        g = (g * 255) >> 0;
        b = (b * 255) >> 0;
    
        if (a > 1.0) a = 1.0;
    
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
    }
    return {
        queryAviationInfo: queryAviationInfo
    }
});