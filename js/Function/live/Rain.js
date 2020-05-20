//live 降水
define(['Controller/DataFormat', 
'Function/numberFC/FloatSelector',
'Function/numberFC/DrawTypeBuilder',], function(format, floatSelector, chartBuilder) {
    
    var key;
    var legend;
    var item;
    var isOpen;
    var layerR;     //图层
    var button;     //按钮

    function init(){
        button = $('#live_rn');
        
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
        floatSelector.on('live_rain_type', 'click', function(){
            open();
        });

        key = 'live_rn';
        legend = '<p class="tuCengP">6h累计降水</p>' + 
                '<img src="img/legend/rn06.png" alt="" />' +
                '<p>' +
                    '<span>单位</span>' +
                    '<span>mm</span>' +
                '</p>';
        item = XHW.C.layerC.createItem('', legend, function(){
            close();
        })
    }

    function getData(){ 
        var time = XHW.silderTime;
      
        // http://weather.xinhong.net/stationdata_surf/isosurfacedata?level=9999&elem=RN&year=2019&month=01&day=06&hour=12
        var type = floatSelector.getValue('live_rain_type');
        var typeDesc= floatSelector.getValueDesc('live_rain_type');
        var param = {
            elem: type,
            level: '9999',
            year: time.year,
            month: time.month,
            day: time.day,
            hour: time.hour
        }
        item.htmlLegend = chartBuilder.buildLegendHtml(type, typeDesc);
        XHW.C.http.get(XHW.C.http.weatherUrl, '/stationdata_surf/isosurfacedata', param, function(json){
            var time = format.jsonDate(json.time);
            item.htmlLayer = time[0] + ' ' + typeDesc;
            XHW.C.layerC.updateLayerData(key, item);
           
            drawGfsRN(json.data);
        },function(){
            remove();
        });
    }

    //========================================================================绘制拼接图片部分
    function drawGfsRN(data){
        var slat = data.elat;
        var slng = data.slng;
        var elat = data.slat;
        var elng = data.elng;
        var xD = Math.abs(elng - slng) / data.col;
        var yD = Math.abs(elat - slat) / data.row;
        tLayers = [];

        for(var i = 0; i < data.files.length; i++){
            //！！！图片排列方式为从地图左上角至右下角
            var x = data.files[i].split('_')[1].split('.')[0];
            var y = data.files[i].split('_')[0];

            //贴图方式为左下角至右上角
            var start = ol.proj.fromLonLat([slng + x * xD, slat - (parseInt(y) + 1) * yD]);
            var end = ol.proj.fromLonLat([slng + (parseInt(x) + 1) * xD, slat - y * yD]);
            var extent = [start[0], start[1], end[0], end[1]];
            // console.log((slng + x * xD) + '  ' + (slat - (parseInt(y) + 1) * yD) + '  ' + (slng + (parseInt(x) + 1) * xD) + ' ' + (slat - y * yD));
           
            tLayers.push(new ol.layer.Image({
                source: new ol.source.ImageStatic({
                    url: XHW.C.http.imgUrl + data.url + data.files[i] + '.mkt',
                    imageExtent: extent
                })
            }));

            tLayers[i].setZIndex(1);
            tLayers[i].setOpacity(0.7);
            XHW.map.addLayer(tLayers[i]);
            tLayers[i].id = key;
            if($('#lc_live_rn').siblings($('.tuLiEye')).hasClass('current')){
                tLayers[i].setVisible(false);
            }else{
                tLayers[i].setVisible(true);
            }
        }

        //------------------判断当前是否有旧图层，有则替换
        if(layerR && layerR.length > 0){
            remove();
        }
        layerR = tLayers;
        //------------------判断是否功能是否已经关闭，已关闭则删除图层（防止延时导致功能关闭图层保留现象
        if(!isOpen) {
            close();
        }
    }
    //===========================================================绘制结束

    function remove(){
        if(layerR) {
            for(var i in layerR) {
                XHW.map.removeLayer(layerR[i]);
            }
            layerR = null;
        } 
    }

    function open(){
        item.htmlLayer = '降水';
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

    init();

    return {
        close: close
    }
});