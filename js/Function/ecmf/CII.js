//ecmf 
// 对流不稳定指数
// Convective instability index
define(['Controller/DataFormat'], function(format) {
    
    var key;
    var legend_li;
    var legend_cape;
    var item;
    var isOpen;
    var layer;     //图层
    var button;     //按钮
    var select;     //选择框

    function init(){
        button = $('#ecmf_cii');
        select = $('#ecmf_cii_select');
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

        sliderBar.addCallback(function(){
            if(isOpen) getData();
        });

        key = 'ecmf_cloud';
        
        legend_li = '<p class="tuCengP">LI</p>' + 
                        '<img src="img/legend/li.png" alt="" />' +
                        '<p>' +
                            '<span></span>' +
                            '<span></span>' +
                        '</p>';
        legend_cape = '<p class="tuCengP">CAPE</p>' + 
                        '<img src="img/legend/cape.png" alt="" />' +
                        '<p>' +
                            '<span></span>' +
                            '<span></span>' +
                        '</p>';
        item = XHW.C.layerC.createItem('', '', function(){
            close();
        })
    }

    function getData(){    //TODO, 之后更改写法（传递时间，elem固定
        var level = select.val();

        var time = XHW.silderTime;
      
        var param = '&level=9999&year=' + time.year 
        + '&month=' + time.month + '&day=' + time.day +'&hour=' + time.hour;
        // http://weather.xinhong.net/ecmf/isosurfacedata?level=0500&elem=TURB&year=2019&month=01&day=08&hour=09
        XHW.C.http.Http(XHW.C.http.ecmfUrl, '/ecmf/isosurfacedata?elem=' + level + param, function(data, time){
            time = format.jsonDate(time);
            item.htmlLayer = //time[0] + ' 发布 ' + 
                        time[1] + ' 对流不稳定指数 ' + select.find("option:selected").text();
            item.htmlLegend = select.val() == 'LI' ? legend_li : legend_cape;
            XHW.C.layerC.updateLayerData(key, item);
            
            drawecmfSplicing(data);
        })
    }

    //========================================================================绘制拼接图片部分
    function drawecmfSplicing(data){
        var slat = data.elat;
        var slng = data.slng;
        var elat = data.slat;
        var elng = data.elng;
        var xD = Math.abs(elng - slng) / data.col;
        var yD = Math.abs(elat - slat) / data.row;
        var tLayers = [];

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
                    url: XHW.C.http.ecmfImgUrl + data.url + data.files[i] + '.mkt.png',
                    imageExtent: extent
                })
            }));

            tLayers[i].setZIndex(1);
            XHW.map.addLayer(tLayers[i]);
        }

        //------------------判断当前是否有旧图层，有则替换
        remove();
        layer = tLayers;
        //------------------判断是否功能是否已经关闭，已关闭则删除图层（防止延时导致功能关闭图层保留现象
        if(!isOpen) {
            close();
        }
    }

    //===========================================================绘制结束

    function remove(){
        if(layer) {
            for(var i in layer) {
                XHW.map.removeLayer(layer[i]);
            }
            layer = null;
        } 
    }

    function open(){
        item.htmlLayer = '对流不稳定指数';
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
        select.parent().css('display', 'inline-block');//选中时展示层次选择框

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
        select.parent().hide();

        remove();
        isOpen = false;
    }

    init();

    return {
        close: close
    }
});