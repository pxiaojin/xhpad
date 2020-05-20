//ecmf 雷暴落区
define(['Controller/DataFormat'], function(format) {
    
    var key;
    var legend;
    var item;
    var isOpen;
    var layer;     //图层
    var button;     //按钮

    function init(){
        button = $('#ecmf_ts');
        
        button.click(function(){
            if(!isOpen) {
                open();
            } else {
                close();
            }
        });

        sliderBar.addCallback(function(){
            if(isOpen) getData();
        });

        key = 'ecmf_ts';
        legend = '<p class="tuCengP">雷暴落区</p>' + 
        '<img src="img/legend/ts.png" alt="" />' +
        '<p>' +
            '<span>单位</span>' +
            '<span>%</span>' +
        '</p>';
        item = XHW.C.layerC.createItem('', legend, function(){
            close();
        })
    }

    function getData(){ 
        var time = XHW.silderTime;
      
        var param = '&level=9999&year=' + time.year 
        + '&month=' + time.month + '&day=' + time.day +'&hour=' + time.hour;
        // http://weather.xinhong.net/ecmf/isosurfacedata?level=9999&elem=TS&year=2019&month=01&day=06&hour=12
        XHW.C.http.Http(XHW.C.http.ecmfUrl, '/ecmf/isosurfacedata?elem=TS' + param, function(data, time){
            time = format.jsonDate(time);
            item.htmlLayer = // time[0] + ' 发布 ' + 
                time[1] + ' 雷暴落区';
            XHW.C.layerC.updateLayerData(key, item);
           
            drawecmfTS(data);
        })
    }

    //========================================================================绘制拼接图片部分
    function drawecmfTS(data){
        var slat = data.elat;
        var slng = data.slng;
        var elat = data.slat;
        var elng = data.elng;
                
        //贴图方式为左上角至右下角
        var start = ol.proj.fromLonLat([slng, elat]);
        var end = ol.proj.fromLonLat([elng , slat]);
        var extent = [start[0], start[1], end[0], end[1]];

        var tlayer = new ol.layer.Image({
            source: new ol.source.ImageStatic({
                url: XHW.C.http.ecmfImgUrl + data.url + '.mkt.png',
                imageExtent: extent
            })
        });
        tlayer.setZIndex(1);
        XHW.map.addLayer(tlayer);

        //------------------判断当前是否有旧图层，有则替换
        if(layer){
            remove();
        }
        layer = tlayer;
        //------------------判断是否功能是否已经关闭，已关闭则删除图层（防止延时导致功能关闭图层保留现象
        if(!isOpen) {
            close();
        }
    }
    //===========================================================绘制结束

    function remove(){
        if(layer) {
            XHW.map.removeLayer(layer);
            layer = null;
        }
    }

    function open(){
        item.htmlLayer = '雷暴落区';
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