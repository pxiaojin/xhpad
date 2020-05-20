//-----------------海面数据详情
define(['Controller/Http',
        'Controller/layout',
        'Controller/DataFormat',
        'lib/echarts'], function(http, layout, format, echarts) {
    
    var select;
    function init(){
        select = $('#bottomInfo_seaBad_select');
        select.change(function(){
            drawTimeChart();
        });
    }
    init();

    /**
     * 查询海面单点详细信息
     * @param {*} lnglat 位置
     */
    function querySeaBadInfo(lnglat){
        //---------------------------显示当前位置
        $('#bottomInfo_seaBad_lnglat').html(format.lnglat(lnglat[0], lnglat[1]));
        //---------------------------查询数据
        querySeaBadTime(lnglat);
        //---------------------------显示详情
        layout.showBottomMenu();
        $('.botPanelShuiXiaPanel').show();
    }

    // [温,盐,流U,流V]
    var timeS;      //时间列表
    var dataS;      //数据列表
    /**
     * 查询海表随时间变化的数据
     * @param {*} lnglat 
     */
    function querySeaBadTime(lnglat){
        // https://ocean.xinhong.net/hy1Suo/timeprofiledata/?lat=30&lng=130
        
        var time = XHW.silderTime;
        var param = {
            lng: lnglat[0],
            lat: lnglat[1],
            year: time.year,
            month: time.month,
            day: time.day,
            hour: time.hour
        }
        http.get(http.oceanUrl, '/hy1Suo/timeprofiledata/', param, function(json){
            //-----------------------整理数据 
            timeS = [];
            dataS = {};
            for(var i = 0; i < json.data.profiledatas.length; i++) {
                for(var key in json.data.profiledatas[i]) {
                    if(key == 1) {
                        var time = json.data.times[i];
                        var year = time.substring(0,4) + '年';
                        var month = time.substring(4,6) + '月';
                        var day = time.substring(6,8) + '日';
                        var hour = time.substring(8,10) + '时';
                        timeS.push(year + month + day + hour);
                    }
                    !dataS[key] ? dataS[key] = {
                        t:[],
                        salinity:[],
                        flowD:[],
                        flowS:[],
                    } : null;
                    
                    var tData = json.data.profiledatas[i][key];
                    var fs = Math.sqrt(tData[2] * tData[2] + tData[3] * tData[3]);
                    fs = ((fs * 10) >> 0) / 10;
                    var fd = 270.0 - Math.atan2(tData[3], tData[2]) * 180.0 / Math.PI;
                    dataS[key].t.push(tData[0]);
                    dataS[key].salinity.push(tData[1]);
                    dataS[key].flowD.push(fd);
                    dataS[key].flowS.push(fs);
                }
            }
            html = '';
            for(var key in dataS) {
                if(key == 1) continue;
                html += '<option value="' + key + '">' + key + 'm</option>';
            }
            select.html(html);
            drawTimeChart();
            showSeaBadOne(timeS[0]);
        })
    }

    var timeChart;  //随时间变化的图表
    var arrowSize = 18;
    /**
     * 层次
     */
    function drawTimeChart(){
        //------------------------------获取要显示的层次
        var level = select.val();
        //------------------------------寻找数据最大/最小值
        var tMax; var tMin;
        var saMax; var saMin;
        var fsMax; var fsMin;
        if (!dataS && !dataS[level])
            return;
        for(var i = 0; i < timeS.length; i++) {
            tMax = tMax && tMax > dataS[level].t[i] ? tMax : dataS[level].t[i];
            tMin = tMin && tMin < dataS[level].t[i] ? tMin : dataS[level].t[i];

            saMax = saMax && saMax > dataS[level].salinity[i] ? saMax : dataS[level].salinity[i];
            saMin = saMin && saMin < dataS[level].salinity[i] ? saMin : dataS[level].salinity[i];

            fsMax = fsMax && fsMax > dataS[level].flowS[i] ? fsMax : dataS[level].flowS[i];
            fsMin = fsMin && fsMin < dataS[level].flowS[i] ? fsMin : dataS[level].flowS[i];
        }
        tMax = Math.ceil(tMax) - 0.5 <= tMax ? Math.ceil(tMax) : Math.ceil(tMax) - 0.5;
        tMin = Math.floor(tMin) + 0.5 >= tMin ? Math.floor(tMin) : Math.floor(tMin) + 0.5;
        saMax = Math.ceil(saMax) - 0.5 <= saMax ? Math.ceil(saMax) : Math.ceil(saMax) - 0.5;
        saMin = Math.floor(saMin) + 0.5 >= saMin ? Math.floor(saMin) : Math.floor(saMin) + 0.5;
        fsMax = Math.ceil(fsMax) - 0.5 <= fsMax ? Math.ceil(fsMax) : Math.ceil(fsMax) - 0.5;
        fsMin = Math.floor(fsMin) + 0.5 >= fsMin ? Math.floor(fsMin) : Math.floor(fsMin) + 0.5;
        //-------------------------------------绘制折线图

        //-------------方向所用数据
        var tmpdata = [timeS,dataS[level].flowS,dataS[level].flowD]; 
        var flowData=  tmpdata[0].map(function(col, i) {
                return tmpdata.map(function(row) {
                return row[i];
                })
            });
        timeChart = timeChart ? timeChart.dispose() : '';
        timeChart = null;
        timeChart = echarts.init(document.getElementById('bottomInfo_seaBad_timeChart'));
        var option = {
            title: {
                text: ''
            },
            tooltip: {
                trigger: 'axis',
                confine: true
            },
            color: ['#dc0909', '#ff7d00', '#0396a5', '#0396a5'],
            legend: {
                data:['海温','海盐','海流', '流向']
            },
            grid: {
                left: 120,
                right: 20,
            },
            xAxis: {
                data: timeS,
                boundaryGap : true,
                axisTick:{alignWithLabel: true},
                axisLine: {onZero: false, lineStyle:{color: '#13507f'}},
                axisLabel:{
                    formatter: function(value, index){
                        value = value.split('月')[1];
                        value = value.split('日');
                        var time = value[1];
                        if(index == 0 || time == '02时') {    //如果是第一条数据或换天的数据
                            time = time + '\n' + value[0] + '日';
                        }
                        return time;
                    }
                },
            },
            yAxis: [
                {
                    name: '海温\n(℃)',
                    type: 'value',
                    max: tMax,
                    min: tMin,
                    splitLine:{show:false},
                    axisLine: {lineStyle:{color: '#13507f'}},
                },
                {
                    name: '海盐\n(%)',
                    type: 'value',
                    max: saMax,
                    min: saMin,
                    position:'left',
                    offset: 40,
                    splitLine:{show:false},
                    axisLine: {lineStyle:{color: '#13507f'}},
                },
                {
                    name: '海流\n(m/s)',
                    type: 'value',
                    max: fsMax,
                    min: fsMin,
                    position:'left',
                    offset: 80,
                    splitLine:{show:false},
                    axisLine: {lineStyle:{color: '#13507f'}},
                },
            ],
            dataZoom:[/*{
                type:'slider',
                height: 20,
                bottom: 5,
            },*/{
                type:'inside'
            }],
            series: [{
                name: '海温',
                type: 'line',
                smooth:true,
                data: dataS[level].t
            },{
                name: '海盐',
                yAxisIndex: 1,
                type: 'line',
                smooth:true,
                data: dataS[level].salinity
            },{
                name: '海流',
                yAxisIndex: 2,
                type: 'line',
                smooth:true,
                data: dataS[level].flowS
            },{
                name: '流向',
                type: 'custom',
                yAxisIndex: 2,
                renderItem: renderArrow,
                data: flowData,
                tooltip: {show: false}
            }]
        };
        timeChart.setOption(option);
        timeChart.on('mouseover', function(event){
            showSeaBadOne(event.name);
        })
    }

    var oneChart;
    /**
     * 显示水下详情右侧单个时次
     * @param {*} time 
     */
    function showSeaBadOne(time){
        //---------------显示时间
        $('#bottomInfo_seaBad_time').html('时间：' + time.split('月')[1]);
        //---------------绘制曲线
        
        var index = timeS.indexOf(time);
        var data = {};
        var keys = [];
        for(var key in dataS) {
            keys.push(key == 1 ? 0 : key);
            for(var key2 in dataS[key]){
                !data[key2] ? data[key2] = [] : null;
                data[key2].push(dataS[key][key2][index]);
            }
        }
        //------------------------------寻找数据最大/最小值
        var tMax; var tMin;
        var saMax; var saMin;
        var fsMax; var fsMin;
        for(var i = 0; i < keys.length; i++) {
            tMax = tMax && tMax > data.t[i] ? tMax : data.t[i];
            tMin = tMin && tMin < data.t[i] ? tMin : data.t[i];

            saMax = saMax && saMax > data.salinity[i] ? saMax : data.salinity[i];
            saMin = saMin && saMin < data.salinity[i] ? saMin : data.salinity[i];

            fsMax = fsMax && fsMax > data.flowS[i] ? fsMax : data.flowS[i];
            fsMin = fsMin && fsMin < data.flowS[i] ? fsMin : data.flowS[i];
        }
        tMax = Math.ceil(tMax) - 0.5 <= tMax ? Math.ceil(tMax) : Math.ceil(tMax) - 0.5;
        tMin = Math.floor(tMin) + 0.5 >= tMin ? Math.floor(tMin) : Math.floor(tMin) + 0.5;
        saMax = Math.ceil(saMax) - 0.5 <= saMax ? Math.ceil(saMax) : Math.ceil(saMax) - 0.5;
        saMin = Math.floor(saMin) + 0.5 >= saMin ? Math.floor(saMin) : Math.floor(saMin) + 0.5;
        fsMax = Math.ceil(fsMax) - 0.5 <= fsMax ? Math.ceil(fsMax) : Math.ceil(fsMax) - 0.5;
        fsMin = Math.floor(fsMin) + 0.5 >= fsMin ? Math.floor(fsMin) : Math.floor(fsMin) + 0.5;

        //-------------方向所用数据
        var tmpdata = [data.flowS,keys,data.flowD]; 
        var flowData=  tmpdata[0].map(function(col, i) {
                return tmpdata.map(function(row) {
                return row[i];
                })
            });

        oneChart = oneChart ? oneChart.dispose() : '';
        oneChart = echarts.init(document.getElementById('bottomInfo_seaBad_oneChart'));
        var option = {
            title: {
                text: ''
            },
            tooltip: {
                trigger: 'axis',
                confine: true
            },
            color: ['#dc0909', '#ff7d00', '#0396a5', '#0396a5'],
            legend: {
                data:['海温','海盐','海流', '流向']
            },
            grid: {
                top: 60,
                bottom: 10,
                right: 60
            },
            xAxis: [
                {
                    name: '海温(℃)',
                    type: 'value',
                    max: tMax,
                    min: tMin,
                    position:'top',
                    nameTextStyle: {padding: [0,0,0,-10]},
                    splitLine:{show:false},
                    axisLine: {lineStyle:{color: '#dc0909'}},
                    axisTick: {inside: true},
                    axisLabel:{show: false},
                },
                {
                    name: '海盐(%)',
                    type: 'value',
                    max: saMax,
                    min: saMin,
                    position:'top',
                    offset: 20,
                    nameTextStyle: {padding: [0,0,0,-10]},
                    splitLine:{show:false},
                    axisLine: {lineStyle:{color: '#ff7d00'}},
                    axisTick: {inside: true},
                    axisLabel:{show: false},
                },
                {
                    name: '海流(m/s)',
                    type: 'value',
                    max: fsMax,
                    min: fsMin,
                    position:'top',
                    offset: 40,
                    nameTextStyle: {padding: [0,0,0,-10]},
                    splitLine:{show:false},
                    axisLine: {lineStyle:{color: '#0396a5'}},
                    axisTick: {inside: true},
                    axisLabel:{show: false},
                },
            ],
            yAxis: {
                data: keys,
                inverse: true,
                boundaryGap:false,
                axisLine: {onZero: false, lineStyle:{color: '#13507f'}},
            },
            series: [{
                name: '海温',
                xAxisIndex: 0,
                type: 'line',
                smooth:true,
                data: data.t
            },{
                name: '海盐',
                xAxisIndex: 1,
                type: 'line',
                smooth:true,
                data: data.salinity
            },{
                name: '海流',
                xAxisIndex: 2,
                type: 'line',
                smooth:true,
                data: data.flowS
            },{
                name: '流向',
                type: 'custom',
                xAxisIndex: 2,
                renderItem: renderArrow,
                data: flowData,
                tooltip: {show: false}
            }]
        };
        oneChart.setOption(option);
    }

    function renderArrow(param, api) {
        var point = api.coord([
            api.value(0),
            api.value(1)
        ]);

        return {
            type: 'path',
            shape: {
                pathData: 'M31 16l-15-15v9h-26v12h26v9z',
                x: -arrowSize / 2,
                y: -arrowSize / 2,
                width: arrowSize,
                height: arrowSize
            },
            rotation: (270-api.value(2))*Math.PI/180,
            // rotation: api.value(3),
            position: point,
            style: api.style({
                stroke: '#555',
                lineWidth: 1
            })
        };
    }

    return {
        querySeaBadInfo: querySeaBadInfo
    }

});