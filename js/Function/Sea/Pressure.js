//sea 海平面气压
define(['Controller/DataFormat'], function(format) {
    
    var key;
    var legend;
    var item;
    var isOpen;
    var layerPR;     //图层
    var button;     //按钮
    

    function init(){
        button = $('#sea_pr');
        
        button.click(function(){
            if(!isOpen) {
                open();
            } else {
                close();
            }
        });

        // sliderBar.addCallback(function(){
        //     if(isOpen) getData();
        // });

        key = 'sea_pr';
        legend = '<p class="tuCengP">海压</p>' + 
                '<img src="img/legend/pr.png" alt="" />' +
                '<p>' +
                    '<span>单位</span>' +
                    '<span>hPa</span>' +
                '</p>';
        item = XHW.C.layerC.createItem('', legend, function(){
            close();
        })
    }

    function getData(){    //TODO, 之后更改写法（传递时间，elem固定
        var time = XHW.silderTime;
      
        var param = '&level=9999&year=' + time.year 
        + '&month=' + time.month + '&day=' + time.day +'&hour=' + time.hour;
        // http://weather.xinhong.net/stationdata_surf/isolinedata?level=9999&elem=PR&year=2019&month=01&day=07&hour=03
        XHW.C.http.http('/gfs/isolinedata', '?elem=PR' + param, function(data, time){
            time = format.jsonDate(time);
            item.htmlLayer = // time[0] + ' 发布 ' +
                     time[1] + ' 海平面气压';
            XHW.C.layerC.updateLayerData(key, item);
           
            myData = data;
            drawGfsPR(data);
        },function(){
            item.htmlLayer = Number(time.month) + '月' + Number(time.day) + '日 ' + time.hour + ':00 ' + ' 海平面气压' + '(无数据)';
            XHW.C.layerC.updateLayerData(key, item);
            remove();
        })
    }

    var myData;

    //========================================================================绘制线条部分
    function drawGfsPR(data){
        //step1---------------等值线所在数组
        var feature = [];
        //step1.5-------------设置等值线默认颜色
        var DefaultColor = null;
        if($('#isolineConfigColorMode p .current').next().html() != '多色') {
            if($('#config_map p .current').next().html() == '影像图') {
                DefaultColor = "#2222FF";
            } else {
                DefaultColor = "#000000";
            }
        }
        let textColor = '#fff';
        //step2---------------循环遍历每一条线的数据
        for(var i = 0; i < data.lines.length; i++) {
            var lineData = data.lines[i];
            //step3----------------创建数组记录单条等值线的点
            var lnglats = smoothIsoline(lineData);
            if (!lnglats || lnglats.length <= 0)
                continue;
            // var lnglats = [];
            // for(var j = 0; j < lineData.pointNum; j++) {
            //     lnglats.push(ol.proj.fromLonLat([parseFloat(lineData.lng[j]), parseFloat(lineData.lat[j])]));
            // }
            var color = DefaultColor ? DefaultColor : "#" + ((1 << 24) + (lineData.lineColor.r << 16)     //颜色转为16进制
            + (lineData.lineColor.g << 8) + lineData.lineColor.b).toString(16).slice(1);
            let textBackgroundColor = color ;
            //step4-----------------创建地图线对象
            var line = new ol.Feature({
                geometry: new ol.geom.LineString(lnglats)
            });
            let lineStyle = buildIsolineStyle(lineData.val + '', lineData.lineWidth, color, textColor, textBackgroundColor);
            line.setStyle(lineStyle);
            feature.push(line);
        }
        //step7------------------将所有等值线加入同一个图层

        let source = new ol.source.Vector({
            features: feature
        });

        if (!layerPR) {
            layerPR = new ol.layer.Vector({
            
            });
            layerPR.setZIndex(5);
            layerPR.id = key;
        }
        layerPR.setSource(source);
        if ($.inArray(layerPR, XHW.map.getLayers().getArray()) == -1)
        XHW.map.addLayer(layerPR);
        //step9------------------判断是否功能是否已经关闭，已关闭则删除图层（防止延时导致功能关闭图层保留现象
        if(!isOpen) {
            close();
        }
    }
    //===========================================================绘制结束

    function remove(){
        if(layerPR) {
            XHW.map.removeLayer(layerPR);
            layerPR = null;
        }
    }

    function open(){
        //---------添加图层控制
        item.htmlLayer = '海平面气压';
        var b = XHW.C.layerC.addLayer(key, item);
        if(!b) {
            close();
            return;
        }
        //---------添加按钮选中样式
        button.parent().addClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrc'));
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
		XHW.C.layout.judgeWhetherSelect(button);

        remove();
        isOpen = false;
    }

    function update(){
        if(!button.parent().hasClass('currenterJiBtn')) return;
        if(!layerPR) return;
        drawGfsPR(myData);
    }

    init();

    return {
        close: close,
        update: update
    }
});