//live 湿度
define(['Controller/DataFormat'], function(format) {
    
    var key;
    var legend;
    var item;
    var isOpen;
    var layerT;     //图层
    var button;     //按钮
    var select;     //选择框

    function init(){
        button = $('#live_rh');
        select = $('#live_rh_select');
        button.click(function(){
            if(!isOpen) {
                open();
            } else {
                close();
            }
        });

        select.change(function(){
            if(isOpen) getData();
        });

        // sliderBar.addCallback(function(){
        //     if(isOpen) getData();
        // });

        key = 'live_rh';
        legend = '<p class="tuCengP">湿度</p>' + 
                '<img src="img/legend/rh.png" alt="" />' +
                '<p>' +
                    '<span>单位</span>' +
                    '<span>%</span>' +
                '</p>';
        item = XHW.C.layerC.createItem('', legend, function(){
            close();
        })
    }

    function getData(){    //TODO, 之后更改写法（传递时间，elem固定
        var level = select.val();
        var time = XHW.silderTime;
      
        // http://weather.xinhong.net/stationdata_surf/isolinedata?level=0500&elem=RH&year=2019&month=02&day=22&hour=08
        var param = {
            elem: 'RH',
            level: level,
            year: time.year,
            month: time.month,
            day: time.day,
            hour: time.hour
        }
        XHW.C.http.get(XHW.C.http.weatherUrl, '/stationdata_surf/isolinedata', param, function(json){
            var time = format.jsonDate(json.time);
            item.htmlLayer = time[0] + ' ' + select.find("option:selected").text() + ' 湿度';
            XHW.C.layerC.updateLayerData(key, item);
           
            drawLine(json.data);
        },function(){
            remove();
        });
    }

    //========================================================================绘制线条部分
    function drawLine(data){
        //step1---------------等值线所在数组
        var feature = [];
        let textColor = '#fff';
        var DefaultColor = null;
        if($('#isolineConfigColorMode p .current').next().html() != '多色') {
            if($('#config_map p .current').next().html() == '影像图') {
                DefaultColor = "#10A80A";
            } else {
                DefaultColor = "#10A80A";
            }
        }
        //step2---------------循环遍历每一条线的数据
        for(var i = 0; i < data.lines.length; i++) {
            var lineData = data.lines[i];
            //step3----------------创建数组记录单条等值线的点
            // var lnglats = [];
            // for(var j = 0; j < lineData.pointNum; j++) {
            //     lnglats.push(ol.proj.fromLonLat([parseFloat(lineData.lng[j]), parseFloat(lineData.lat[j])]));
            // }
            var lnglats = smoothIsoline(lineData);
            if (!lnglats || lnglats.length <= 0)
                continue;
            var color = DefaultColor ? DefaultColor : "#" + ((1 << 24) + (lineData.lineColor.r << 16)     //颜色转为16进制
                + (lineData.lineColor.g << 8) + lineData.lineColor.b).toString(16).slice(1);
            //step4-----------------创建地图线对象
            var line = new ol.Feature({
                geometry: new ol.geom.LineString(lnglats)
            });
            // line.setStyle(new ol.style.Style({
            //     stroke: new ol.style.Stroke({
            //         width: lineData.lineWidth,
            //         color: color
            //     }),
            // }));
            //step5------------------地图对象加入数组
            line.setStyle(buildIsolineStyle(lineData.val + '', lineData.lineWidth, color, textColor, color));
            feature.push(line);
            //step6------------------添加文字
            // if(lnglats.length < 30) { // 点数量较少时不添加数字（防止地图标记过多/后续考虑更改为随层级变化
            //     continue;
            // }
            // if(lineData.isClose) {  //封闭线段 中部标注
            //     var markFeatu = new ol.Feature({
            //         geometry: new ol.geom.Point(lnglats[(lineData.pointNum * 3 / 4) >> 0])
            //     });
            //     markFeatu.setStyle(new ol.style.Style({
            //         text: new ol.style.Text({
            //             textAlign: "center",
            //             text: lineData.val +'',
            //             fill: new ol.style.Fill({    //文字填充色
            //                 color: color,
            //             }),
            //         }),
            //     }));
            //     feature.push(markFeatu);
            // } else {                //未封闭线段  首尾标注
            //     var markFeatu1 = new ol.Feature({
            //         geometry: new ol.geom.Point(lnglats[0])
            //     });
            //     markFeatu1.setStyle(new ol.style.Style({
            //         text: new ol.style.Text({
            //             textAlign: "center",
            //             text: lineData.val + '',
            //             fill: new ol.style.Fill({    //文字填充色
            //                 color: color,
            //             }),
            //         }),
            //     }));
            //     feature.push(markFeatu1);

            //     var markFeatu2 = new ol.Feature({
            //         geometry: new ol.geom.Point(lnglats[lineData.pointNum - 1])
            //     });
            //     markFeatu2.setStyle(new ol.style.Style({
            //         text: new ol.style.Text({
            //             textAlign: "center",
            //             text: lineData.val + '',
            //             fill: new ol.style.Fill({    //文字填充色
            //                 color: color,
            //             }),
            //         }),
            //     }));
            //     feature.push(markFeatu2);
            // } 
        }
        //step7------------------将所有等值线加入同一个图层
        let source = new ol.source.Vector({
            features: feature
        });

        if (!layerT) {
            layerT = new ol.layer.Vector({
            
            });
            layerT.setZIndex(5);
            layerT.id = key;
        }
        layerT.setSource(source);
        
        if ($.inArray(layerT, XHW.map.getLayers().getArray()) == -1)
        XHW.map.addLayer(layerT);
    }
    //===========================================================绘制结束

    function remove(){
        if(layerT) {
            XHW.map.removeLayer(layerT);
            layerT = null;
        }
    }

    function open(){
        item.htmlLayer = '湿度';
        //---------添加图层控制
        var b = XHW.C.layerC.addLayer(key, item);
        if(!b) {
            close();
            return;
        }
        //---------添加按钮选中样式
        button.parent().addClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrc'));
        select.parent().css('display', 'inline-block');//选中时展示层次选择框
		XHW.C.layout.judgeWhetherSelect(button);

        getData();
        isOpen = true;
    }

    function close(){
        //---------删除图层控制
        XHW.C.layerC.removeLayer(key);

        //---------取消按钮选中样式
        button.parent().removeClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrcpri'));
        select.parent().hide();
		XHW.C.layout.judgeWhetherSelect(button);
        
        remove();
        isOpen = false;
    }

    init();

    return {
        close: close
    }
});