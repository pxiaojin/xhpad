goog.provide('tool.ProfileChart');
tool.ProfileChart = function (opt_options) {
    this.canvasL_ = $('#' + opt_options.left_axe);
    this.canvasR_ = $('#' + opt_options.right_content);
};

tool.ProfileChart.prototype.resetData = function(datas,high,lng,lat) {
    this.options = datas;
    this.highinfo = high ? high : '';
    this.lnginfo = lng ? lng : '';
    this.latinfo = lat ? lat : '';
    this.repaint_();
};

tool.ProfileChart.prototype.repaint_ = function() {
    let canvasL = this.canvasL_;
    let canvasR = this.canvasR_;

    let leftWidth = 45;
    //------------------获取高度
    // let devicePixelRatio = window.devicePixelRatio || 1;
    let devicePixelRatio = 1;
    let height = canvasL.height() * devicePixelRatio;
    //------------------设置左侧气压canvas像素比
    canvasL.attr('width', leftWidth * devicePixelRatio + 'px');
    canvasL.attr('height', height + 'px');
    //-----------------计算并设置右侧数据展示canvas宽度及像素比
    let width = canvasR.width() * devicePixelRatio;
    let xi = 50 * devicePixelRatio * 1.5;//预设单个数据所占x宽度
    if (this.options && this.options.xAxis && this.options.xAxis.data && this.options.xAxis.data.length) {
        if (this.options.xAxis.data.length <= 14 && !this.options.fixedWidth) {
            xi = width / this.options.xAxis.data.length;
        } else {
            width = this.options.xAxis.data.length > 0 ? this.options.xAxis.data.length * xi: width;
        }
    } 
    canvasR.css('width', width / devicePixelRatio + 'px');
    canvasR.attr('width', width / devicePixelRatio );
    canvasR.attr('height', height );
    if (!this.options)
        return;
    let chartHeight = height;
    let locationNameHeight = 0;
    if (this.options.isDrawLocationName) {
        locationNameHeight = 10;
    }
    chartHeight -= locationNameHeight;
    let yAxisLength = this.options.yAxis.data.length;
    let yi = (chartHeight - 40 * devicePixelRatio) / yAxisLength;   //预设单个数据所占y高度
    //------------------风羽图片大小
    let imgY = 16 * devicePixelRatio;
    let imgX = imgY / 2;
    //-----------------获取绘画对象
    let ctxL = canvasL[0].getContext('2d');
    let ctxR = canvasR[0].getContext('2d');
    //-----------------绘制横纵轴
    ctxL.beginPath();
    ctxL.strokeStyle = '#13507f';
    ctxL.moveTo(leftWidth * devicePixelRatio, 0);
    ctxL.lineTo(leftWidth * devicePixelRatio, yi * yAxisLength + 1);
    ctxL.lineTo(leftWidth * devicePixelRatio + 30, yi * yAxisLength + 1);
    ctxL.stroke();
    ctxR.beginPath();
    ctxR.strokeStyle = '#13507f';
    ctxR.moveTo(0, yi * yAxisLength + 1);
    ctxR.lineTo(width, yi * yAxisLength + 1);
    ctxR.stroke();
    ctxR.closePath();
    function getIndex(num) {
        var num = Number(num);
        if (num<=300){
            return 10;
        } else if (num<=500){
            return 9;
        } else if (num<=700){
            return 8;
        } else if (num<=900){
            return 7;
        } else if (num<=1500){
            return 6;
        } else if (num<=2000){
            return 5;
        } else if (num<=3000){
            return 4;
        } else if(num<=5500){
            return 3;
        }else if (num<=9000){
            return 2;
        } else if (num<=12000){
            return 1;
        } else {
            return 0;
        }
    }
    //-----------------遍历数据 经纬度
    for(let i = 0; i < this.options.xAxis.data.length; i++) {
        let x = xi * i;     //单个数据的左边界      
        //-------------------遍历数据 气压层次
        for (let j = 0; j < yAxisLength; j++) {
            let y = yi * j;     //单个数据的上边界
            let yAxi = this.options.yAxis.data[j];
            if (i === 0) {
                let yAxiDesc = yAxi;
                if (yAxi == '9999') {
                    yAxiDesc = '地面';
                }
                //---------------遍历第一组数据，同时填充纵坐标
                this.drawAlignRightText2(ctxL, '#13507f', yAxiDesc, leftWidth * devicePixelRatio - 5 * devicePixelRatio, y + yi / 2 + 5 * devicePixelRatio);
            }
            for(let k = 0; k < this.options.series.length; k++) {
                if (!this.options.series[k].visible) {
                    continue;
                }
                if (!this.options.series[k].yAxis) {
                    this.options.series[k].yAxis = this.options.yAxis.data;
                }
                if ($.inArray(yAxi, this.options.series[k].yAxis) == -1) {
                    continue;
                }
                if (this.options.series[k].type == 'windbarb') {
                    //-----------------填充风羽
                    let ws = NaN;
                    let wd = NaN;
                    if (this.options.series[k].yAxis.length == 1) {
                        ws = this.options.series[k].WS[i];
                        wd = this.options.series[k].WD[i];
                    } else {
                        ws = this.options.series[k].WS[i][j];
                        wd = this.options.series[k].WD[i][j];
                    }
                    if (Number.isNaN(ws) && Number.isNaN(wd)) {
                        continue;
                    }
                    let labelX = x + xi / 2;
                    if (this.options.series[k].offset && this.options.series[k].offset.x) {
                        labelX += this.options.series[k].offset.x;
                    }
                    let labelY = y + yi / 2;
                    if (this.options.series[k].offset && this.options.series[k].offset.y) {
                        labelY += this.options.series[k].offset.y;
                    }

                    ctxR.translate(labelX, labelY);
                    ctxR.rotate(wd * Math.PI / 180);
                    ctxR.drawImage(this.options.series[k].Img,
                        tool.ProfileChart.getWindImageX(ws),
                        tool.ProfileChart.getWindImageY(ws, false), 15, 31,
                        0, -imgY, imgX, imgY);
                    ctxR.rotate(-wd * Math.PI / 180);
                    ctxR.translate(-(labelX), -(labelY));
                } else if(this.options.series[k].type == 'fill') {
                    let value = NaN;
                    if (this.options.series[k].yAxis.length == 1) {
                        value = this.options.series[k].data[i];
                    } else {
                        value = this.options.series[k].data[i][j];
                    }
                    if (Number.isNaN(value)) {
                        continue;
                    }
                    ctxR.fillStyle = this.options.series[k].fillColorFunc(value);
                    ctxR.fillRect(x, y, xi, yi);
                } else if(this.options.series[k].type == 'bar') {
                    let value = NaN;
                    if (this.options.series[k].yAxis.length == 1) {
                        value = this.options.series[k].data[i];
                    } else {
                        value = this.options.series[k].data[i][j];
                    }
                    if (Number.isNaN(value)) {
                        continue;
                    }
                    ctxR.fillStyle = this.options.series[k].fillColorFunc(value);
                    let max = this.options.series[k].max;
                    if (!max) {
                        max = 100;
                    }
                    let barHeight = value/max * yi;

                    ctxR.fillRect(x+xi/2-5, y + (yi - barHeight), 10, barHeight);
                } else if(this.options.series[k].type == 'label') {
                    let value = NaN;
                    if (this.options.series[k].yAxis.length == 1) {
                        value = this.options.series[k].data[i];
                    } else {
                        value = this.options.series[k].data[i][j];
                    }
                    if (Number.isNaN(value)) {
                        continue;
                    }
                    if (this.options.series[k].filterValue && $.inArray(value, this.options.series[k].filterValue) != -1) {
                        continue;
                    }
                    let labelX = x + xi / 2;
                    if (this.options.series[k].offset && this.options.series[k].offset.x) {
                        labelX += this.options.series[k].offset.x;
                    }
                    let labelY = y + yi / 2 + 5;
                    if (this.options.series[k].offset && this.options.series[k].offset.y) {
                        labelY += this.options.series[k].offset.y;
                    }
                    this.drawAlignRightText(ctxR, this.options.series[k].color, ((value * 10) >> 0) / 10, labelX, labelY);
                }
            }
        }
        let xLabelAry = this.options.xAxis.data[i].split('\n');
        if (this.options.xAxis.axisLabel && this.options.xAxis.axisLabel.formatter) {
            xLabelAry = this.options.xAxis.axisLabel.formatter(this.options.xAxis.data[i]).split('\n');
        }
        let xLabelHeight = 25;
        let xLabelYOffset = 0;
        if (locationNameHeight != 0) {
            xLabelHeight = 25;
            xLabelYOffset = 0;
        }
        let textColor = '#13507f';
        if (locationNameHeight != 0 && xLabelAry.length >= 3 && xLabelAry[2] && xLabelAry[2] != ' ') {
            textColor = 'orange';
        }
        for (let xLabelIndex = 0; xLabelIndex < xLabelAry.length; xLabelIndex++) {
            if(xLabelAry[xLabelIndex] != 'unknown') {
                this.drawAlignRightText(ctxR, textColor, xLabelAry[xLabelIndex], x + xi / 2, height - locationNameHeight - ((xLabelAry.length - xLabelIndex - 1) * xLabelHeight + xLabelYOffset) * devicePixelRatio);
                // this.drawAlignRightText(ctxR, textColor, xLabelAry[xLabelIndex], x + xi / 2, height) - locationNameHeight;
            }
        }
    }

    if(this.lnginfo != '' && this.latinfo != '' && this.highinfo != ''){
        //  高度线
        var markLng = this.lnginfo.split(',');
        var markLat = this.latinfo.split(',');
        ctxR.beginPath();
        ctxR.strokeStyle = 'red';
        ctxR.lineWidth = 3;
        for(let i = 0; i < this.options.xAxis.data.length; i++) {
            var markPoint = this.options.xAxis.data[i];
            for(var j = 0; j < this.highinfo.length; j++){
                var latlon = Number(markLat[j]).toFixed(2)+','+Number(markLng[j]).toFixed(2)+', ';
                if(markPoint == latlon){
                    var pointHigh = getIndex(this.highinfo[j]);
                    if(j == 0){
                        ctxR.moveTo(xi*i+xi/2, yi*pointHigh-yi/2);
                    }    
                    ctxR.lineTo(xi*i+xi/2, yi*pointHigh-yi/2);
                }
            }
        }
        ctxR.stroke();
        ctxR.closePath();
        //   画圆（高度里的圆点）
        for(let i = 0; i < this.options.xAxis.data.length; i++) {
            var markPoint = this.options.xAxis.data[i];
            for(var j = 0; j < this.highinfo.length; j++){
                // var latlon = markLat[j]+','+markLng[j]+', ';
                var latlon = Number(markLat[j]).toFixed(2)+','+Number(markLng[j]).toFixed(2)+', ';
                if(markPoint == latlon){
                    var pointHigh = getIndex(this.highinfo[j]);  
                    ctxR.beginPath();               
                    ctxR.arc(xi*i+xi/2, yi*pointHigh-yi/2, 5, 0, Math.PI * 2, false);
                    ctxR.fillStyle="red";
                    ctxR.fill();
                    ctxR.stroke();
                    ctxR.closePath();
                }
            }
        }
    }
    
};


/**
 * 绘制水平居中文字的方法
 * @param ctx
 * @param rgb
 * @param str
 * @param x
 * @param y
 */
tool.ProfileChart.prototype.drawAlignRightText = function(ctx, rgb, str, x, y) {
    // ctx.font = window.devicePixelRatio * 10 + "px 微软雅黑 New";
    ctx.font = 16 + "px 微软雅黑 New";
    ctx.fillStyle = rgb;
    ctx.fillText(str, x - ctx.measureText(str).width / 2, y);
};

/**
 * 绘制右边距对齐的文字
 * @param ctx
 * @param rgb
 * @param str
 * @param x
 * @param y
 */
tool.ProfileChart.prototype.drawAlignRightText2 = function(ctx, rgb, str, x, y) {
    // ctx.font = window.devicePixelRatio * 10 + "px 微软雅黑";
    ctx.font = 16 + "px 微软雅黑 New";
    ctx.fillStyle = rgb;
    ctx.fillText(str, x - ctx.measureText(str).width, y);
};

/**
 * 根据风速获取X索引
 * @param {*} ws
 */
tool.ProfileChart.getWindImageX = function(ws) {
    ws = ws > 72 ? 72 : ws; //风速最大72
    ws = ws < 1 ? 1 : ws; //风速最小为0，同时0与1为同一张图片
    let index = ws < 3 ? ws - 1 :   //ws < 3时，取ws - 1张
        ((ws + 1) / 2) >> 0; // 3和4为风速4,即第三张,则取角标2  依次类推
    index = index % 10;
    return index * 16;
};

/**
 * 根据风速获取Y索引
 * @param {*} ws
 * @param {*} isGray    是否获取灰色图标
 */
tool.ProfileChart.getWindImageY = function(ws, isGray) {
    ws = ws > 72 ? 72 : ws; //风速最大72
    ws = ws < 1 ? 1 : ws; //风速最小为0，同时0与1为同一张图片
    var index = ws < 3 ? ws - 1 :   //ws < 3时，取ws - 1张
        ((ws + 1) / 2) >> 0; // 3和4为风速4,即第三张,则取角标2  依次类推
    index = (index / 10) >> 0;

    if (isGray) {
        return index * 32 + 128;
    }

    return index * 32;
};

function buildProfileOptions(datas, hPas, datasource, dangerType) {
    var data = datas.profiledatas;
    var times = datas.times;
    if(datasource == 'ECMF') {
        var tempData = [];
        var tempTimes = [];
        for(let i =0; i < data.length; i++) {
            if ($.isEmptyObject(data[i]))
                continue;
            tempData.push(data[i]);
            tempTimes.push(times[i]);
        }
        data = tempData;
        times = tempTimes;
    }
    let sourceType = datasource;
    if (sourceType == 'ecmf' || sourceType == 'ECMF')
        sourceType = 'EC';
    var datas = [];
    for(var i = 0; i < data.length; i++) {
        if(!data[i][sourceType]) {
            datas.push({});
            continue;
        }
        var tdata = {};
        for(var j = 0; j < hPas.length; j++) {
            var key = hPas[j] + '';
            if (key.length < 4) {
                key = '0' + key;
            }
            if(!data[i][sourceType][key]) {
                tdata[key] = {};
                continue;
            }
            var u = data[i][sourceType][key].UU;
            var v = data[i][sourceType][key].VV;
            var ws = Math.sqrt(u * u + v * v);
            var wd = 270.0 - Math.atan2(v, u) * 180.0 / Math.PI;
            
            tdata[hPas[j]] = {
                TT: data[i][sourceType][key].TT,
                RH: data[i][sourceType][key].RH,
                TURB: data[i][dangerType]&&data[i][dangerType][key] ? data[i][dangerType][key].TURB:undefined,
                ICE: data[i][dangerType]&&data[i][dangerType][key] ? data[i][dangerType][key].ICE:undefined,
                WS: ws,
                WD: wd,
            }
        }
        datas.push(tdata);
    }
    
    return buildTimeProfileOption(times, hPas, datas);
}

// 获取canvas的移动事件
function canMove(dataS, hPas, option){         
    var canvas=document.querySelector('#rightInfo_single_crossR');
    canvas.onmousemove = function(e){
        p = getEventPosition(e);           
        // let devicePixelRatio = window.devicePixelRatio || 1;
        let devicePixelRatio = 1;
        var canWid = $('#rightInfo_single_crossR').width() * devicePixelRatio;
        var canHei = $('#rightInfo_single_crossR').height() * devicePixelRatio;

      
        let xi = 50 * devicePixelRatio * 1.5;//单个数据所占x宽度
        if(option.xAxis.data.length <= 14){
            xi = canWid / option.xAxis.data.length;
        }

        let chartHeight = canHei;
        let locationNameHeight = 0;
        if (option.isDrawLocationName) {
            locationNameHeight = 20;
        }
        chartHeight -= locationNameHeight;
        let yAxisLength = option.yAxis.data.length;
        let yi = (chartHeight - 50 * devicePixelRatio) / yAxisLength;
        
        var i = parseInt(p.x * devicePixelRatio / xi);
        var j = parseInt(p.y * devicePixelRatio / yi);
        // if(p.y>200){
        if (j > hPas.length) {
            $('#single_popup').hide();
            return;
        }
        var top;
        var left;

        var ws = dataS[i][hPas[j]].WS ? dataS[i][hPas[j]].WS.toFixed(1) : '--';
        var wd = dataS[i][hPas[j]].WD ? dataS[i][hPas[j]].WD.toFixed(1) : '--';
        var tt = dataS[i][hPas[j]].TT ? TT_fun(dataS[i][hPas[j]].TT) : '--';
        let type = $('input:radio[name="point_profileChart_multi_radio"]').parent('.current').children('input')[0].value;
        var typeElem = null;
        if(type == 'RH'){
            // rh = '湿度： ' + dataS.RH[i][j] != 'undefined' ? dataS.RH[i][j] : '--' + '';
            typeElem = '湿度: ' + RH_fun(dataS[i][hPas[j]].RH);
        }else if(type == 'TURB'){
            var turb = dataS[i][hPas[j]].TURB ? dataS[i][hPas[j]].TURB.toFixed(1) : '--';
            typeElem = '颠簸: ' + turb;
        }else if(type == 'ICE'){
            var ice = dataS[i][hPas[j]].ICE ? dataS[i][hPas[j]].ICE.toFixed(1) : '--';
            typeElem = '积冰: ' + ice;
        }
        var innerHTML = '<span>温度：' + tt + ';</span><span> 风速：' + ws + 'm/s;</span><span> 风向：' + wd + '度;</span><span>' + typeElem + '</span>';
        $('#single_popup').html(innerHTML);
        top = p.y+5;
        left = p.x+5;

        if (e.x + 100 > document.body.clientWidth) {
            left -= 100;
        }
        $('#single_popup').show();         
        $('#single_popup').css({
            'top' : top + 'px',
            'left': left+ 'px'
        });
    };  
    $('#rightInfo_single_crossR').mouseout(function(){
        $('#single_popup').hide();
    });        
}

function getEventPosition(ev){
    var x, y;
    if (ev.layerX || ev.layerX == 0) {
      x = ev.layerX;
      y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      x = ev.offsetX;
      y = ev.offsetY;
    }
    return {x: x, y: y};
  }

  /**
 * 湿度
 * @param {*} rh 
 */
function RH_fun(rh) {
    rh = parseFloat(rh);
    rh = rh || rh == 0 
            ? (((rh * 10) >> 0) / 10) + '%'
            : '--%';
    return rh;
}

/**
 * 格式化温度
 * @param {*} t 
 */
function TT_fun(t){
    t = parseFloat(t);
    t = t || t == 0 
            ? ((t * 10) >> 0) / 10 + '℃' 
            : '--℃';
    return t
}


/**
 * 绘制剖面图
 * @param {*} type 
 */
function buildTimeProfileOption(keys, hPas, data){
    
    let Img = new Image();
    Img.src = './img/wind/windy.png';
    let TT = [];
    let WS = [];
    let WD = [];
    let RH = [];
    let TURB = [];
    let ICE = [];
    //-----------------遍历数据 经纬度
    for(let i = 0; i < keys.length; i++) {
        TT[i] = [];
        WS[i] = [];
        WD[i] = [];
        RH[i] = [];
        TURB[i] = [];
        ICE[i] = [];
        //-------------------遍历数据 气压层次
        for(let j = 0; j < hPas.length; j++) {
            let td = data[i][hPas[j]];
            TT[i][j] = td ? td.TT : undefined;
            WS[i][j] = td ? td.WS : undefined;
            WD[i][j] = td ? td.WD : undefined;
            RH[i][j] = td ? td.RH : undefined;
            TURB[i][j] = td ? td.TURB : undefined;
            ICE[i][j] = td ? td.ICE : undefined;
        }
    }
    let options = {
        fixedWidth: 50,
        xAxis: {
            data: keys,
            axisLabel:{
                formatter: function(value){
                    let day = value.substring(4, 6) + '/' + value.substring(6, 8);
                    let hour = value.substring(8, 10) + '时';
                    return hour + '\n' + day;
                }
            },
        },
        yAxis: {
            data: hPas,
            axisLine: {onZero: false, lineStyle:{color: '#13507f'}}
        },
        series: [{
            key: 'RH',
            name: '湿度',
            type: 'fill',
            data: RH,
            visible: true,
            fillColorFunc: function(value) {
                return getRHColor(value);
            }
        },{
            name: '风羽',
            type: 'windbarb',
            WS: WS,
            WD: WD,
            visible: true,
            Img: Img
        },{
            name: '温度',
            type: 'label',
            data: TT,
            visible: true,
            color: '#c23531'
        },{
            key: 'TURB',
            name: '颠簸',
            type: 'fill',
            data: TURB,
            yAxis: hPas,
            fillColorFunc: function(value) {
                return getTRUBColor(value)
            }
        },{
            key: 'ICE',
            name: '积冰',
            type: 'fill',
            data: ICE,
            yAxis: hPas,
            fillColorFunc: function(value) {
                return getICEColor(value)
            }
        }]
    };
    // canMove(data, hPas, options);
    return options;
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