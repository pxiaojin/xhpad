//海浪  （综合有效波高
define(['Controller/DataFormat'], function(format) {
    var key;
    var legend;
    var item;
    var isOpen;
    var layerH; //浪高图层
    var layerD; //浪向图层（浪向图层需要随地图移动重新绘制
    var layerStream;   //浪流线图图层
    var dataWD;   //浪向数据（浪向要根据图层缩放重新绘制，需要记录数据）
    var dataWH_data;  //浪高数据(里面包含的数组)
    var button;
    var buttonFlow;

    var thinparam = 2; //对数据进行抽稀（流线图时使用)

    var drawType = 'flow';

    function init(){
        button = $('#seaWave');
        button.click(function(){
          if (!isOpen) {
            if($('#haiLang .liZi').hasClass('current')) {
              drawType = 'flow';
            } else {
              drawType = 'direction';
            };
            open();
          } else {
            close();
            // if (drawType != 'direction') {
            //   drawType = 'direction';
            //   open();
            // }
            // if (drawType != 'flow') {
            //   drawType = 'flow';
            //   open();
            // }          
          }
        });
        // buttonFlow = $('#seaWaveFlow');
        // buttonFlow.click(function(){
        //   if (!isOpen) {
        //     drawType = 'flow';
        //     open();
        //   } else {
        //     close();
        //     if (drawType != 'flow') {
        //       drawType = 'flow';
        //       open();
        //     }
        //   }
        // });

        // XHW.C.MapMove.addZoomCallback(function(){
        //     updateZ();
        // });

        // sliderBar.addCallback(function(){
        //     if(isOpen) getData();
        // });

        key = 'sea_wave';
        legend = '<p class="tuCengP">海浪</p>' +
                '<img src="img/legend/seaWave.png" alt="" />' +
                '<p>' +
                    '<span>单位</span>' +
                    '<span>m</span>' +
                '</p>';
        item = XHW.C.layerC.createItem('', legend, function(){
            close();
        })
    }

    function getData(){    //TODO, 之后更改写法（传递时间，elem固定
        dataWD = null;
        dataWH_data = null;

        let param = '&level=' + level + '&time=' + timeBar.getRequestTime().split('-').join('') + '&type=array';

        // XHW.C.http.oceanHttp('/hy1Suo/isolinedata/', '?elem=WH' + param, function(data, time){
        //     time = format.jsonDate(time);
        //     item.htmlLayer =  // time[0] + ' 发布 ' +
        //             time[1] + ' 综合有效波高';
        //     XHW.C.layerC.updateLayerData(key, item);
        //     drawSeaWaveH(data);
        //     // drawSeaWaveFlow();
        // })

        XHW.C.http.Http(XHW.C.http.ecmfUrlNew, '/fio/areadata?elem=TH' + param, function(json, time){
            dataWD  = json;
            time = format.jsonDate(time);
            item.htmlLayer = // time[0] + ' 发布 ' + 
                    time[1] + ' 海浪' + (drawType == 'flow' ? '(动态)' : '');
            XHW.C.layerC.updateLayerData(key, item);
            if (drawType == 'flow') {
              drawSeaWaveFlow();
            } else {
              drawSeaWave();
            }
        }, function(){
          item.htmlLayer = Number(time.month) + '月' + Number(time.day) + '日 ' + time.hour + ':00 ' + ' 海浪' + '(无浪向数据)';
          XHW.C.layerC.updateLayerData(key, item);
          remove();
        })
        XHW.C.http.Http(XHW.C.http.ecmfUrlNew, '/fio/areadata?elem=HS' + param, function(json, time){
            dataWH_data = json.vals;
            time = format.jsonDate(time);
            item.htmlLayer = // time[0] + ' 发布 ' + 
                    time[1] + ' 海浪' + (drawType == 'flow' ? '(动态)' : '');
            XHW.C.layerC.updateLayerData(key, item);
            if (drawType == 'flow') {
              drawSeaWaveFlow();
            } else {
              drawSeaWave();
            }
        }, function(){
          item.htmlLayer = Number(time.month) + '月' + Number(time.day) + '日 ' + time.hour + ':00 ' + ' 海浪' + '(无浪高数据)';
          XHW.C.layerC.updateLayerData(key, item);
          remove();
        })
    }

    /**
     * 绘制海浪高度 等值线形式
     * @param {*} data
     */
    function drawSeaWaveH(data){
        //step1---------------等值线所在数组
        var feature = [];
        //step2---------------循环遍历每一条线的数据
        let textColor = 'white';
        for(var i = 0; i < data.lines.length; i++) {
            var lineData = data.lines[i];
            //step3----------------创建数组记录单条等值线的点
            var lnglats = [];
            for(var j = 0; j < lineData.pointNum; j++) {
                lnglats.push(ol.proj.fromLonLat([parseFloat(lineData.lng[j]), parseFloat(lineData.lat[j])]));
            }
            var color = "#" + ((1 << 24) + (lineData.lineColor.r << 16)     //颜色转为16进制
            + (lineData.lineColor.g << 8) + lineData.lineColor.b).toString(16).slice(1);
            //step4-----------------创建地图线对象
            var line = new ol.Feature({
                geometry: new ol.geom.LineString(lnglats)
            });
            // let textBackgroundColor = color;
            let textBackgroundColor = '#000000';
            let textColor = 'white';
            line.setStyle(buildIsolineStyle(lineData.val + '', lineData.lineWidth, color, textColor, textBackgroundColor));
            //step5------------------地图对象加入数组
            feature.push(line);
        }
        //step7------------------将所有等值线加入同一个图层
        let source = new ol.source.Vector({
            features: feature
        });

        if (!layerH) {
            layerH = new ol.layer.Vector({
                
            });
            layerH.setZIndex(15);
            layerH.id = key;
        }
        layerH.setSource(source);
        
        if ($.inArray(layerH, XHW.map.getLayers().getArray()) == -1)
        XHW.map.addLayer(layerH);

        var elem = 'sea_9999_9999_HS';
        if($('.'+elem).children('span').hasClass('current') && $('.'+elem).parent().attr('display') == 'block'){
          if(layerH)layerH.setVisible(true);
        }else{
          if(layerH)layerH.setVisible(false);
        }
        //step9------------------判断是否功能是否已经关闭，已关闭则删除图层（防止延时导致功能关闭图层保留现象
        if(!isOpen) {
            close();
        }
    }

  /**
   * 二维数组转一维（并且调换顺序） 并进行了抽稀
   */
  function TDtoODFor1SuoWave(array){
    var arr = [];
    var length = array[0].length;
    // for(var j = length - 1; j >= 0; j=j-thinparam) {
    //   for(var i = 0; i < array.length; i=i+thinparam) {
    //       arr.push(array[i][j]);
    //   }
    // }
    for(var i = array.length - 1; i >= 0; i=i-thinparam) {
      for(var j = 0; j < array[0].length; j=j+thinparam) {
          arr.push(Math.round(array[i][j]));
      }
  }
    return arr;
  }


    /**
     * 速度和方向转U V分量
     * @param speed
     * @param direct
     * @constructor
     */
  function SDtoUV(speed, direct){
      if(!speed || !direct) {
        return;
      }
        if (speed < 0)
            return;
      var u = speed * Math.cos((direct) * Math.PI / 180);
      var v = speed * Math.sin((direct) * Math.PI / 180);
      return [u,v];
  }

  /**
   * 获取各组数据相关配置(流线图)
   * @param {*} lo1   起始经度
   * @param {*} la1   起始纬度
   * @param {*} dx    经度差值
   * @param {*} dy    纬度差值
   * @param {*} nx    经度差值次数
   * @param {*} ny    纬度差值次数
   * @param {*} parameC   参数类别
   * @param {*} parameN   参数标记
   */
  function getWaveStreamHeader(lo1, la1, dx, dy, nx, ny, parameC, parameN){
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
     * 绘制海浪流线效果
     */
    function drawSeaWaveFlow(){
      //step*---------------查看两组数据是否齐全
      if(!dataWH_data || !dataWD) {
        return;
      }

      //分解为u v分量
      var wh1dary =  TDtoODFor1SuoWave(dataWH_data);
      var wd1dary =  TDtoODFor1SuoWave(dataWD.vals);
      var uary = [];
      var vary = [];
      for(var i = 0; i < wh1dary.length; i ++) {
        if((!wh1dary[i] && wh1dary[i] != 0) ||
          (!wd1dary[i] && wd1dary[i] != 0)) {    //如果值为空并且值不为0，则不绘制（在陆地）
          uary.push(0);
          vary.push(0);
          continue;
        }
        var uv = SDtoUV(wh1dary[i], wd1dary[i]);
        if (!uv){
          uary.push(0);
          vary.push(0);
          continue;
        }
        uary.push(uv[0]);
        vary.push(uv[1]);
      }

      //创建流线所需数据对象，设置各组数据配置
      var streamdata = [{
        header: getWaveStreamHeader(dataWD.slng, dataWD.elat, dataWD.delta*thinparam,
          dataWD.delta*thinparam, dataWD.colNum/2, dataWD.rowNum/2, 0, 0), //0,0表示速度（高度）值
        data:[]
      },{
        header: getWaveStreamHeader(dataWD.slng, dataWD.elat, dataWD.delta*thinparam,
          dataWD.delta*thinparam, dataWD.colNum/2, dataWD.rowNum/2, 2, 2),  //2,2表示u分量
        data:[]
      },{
        header: getWaveStreamHeader(dataWD.slng, dataWD.elat, dataWD.delta*thinparam,
          dataWD.delta*thinparam, dataWD.colNum/2, dataWD.rowNum/2, 2, 3),  //2,3表示v分量
        data:[]
      }];

      // data[0].header = getWindHeader(60, 60, 0.25, 0.25, 361, 281,0,0);
      // data[1].header = getWindHeader(60, 60, 0.25, 0.25, 361, 281,2,2);
      // data[2].header = getWindHeader(60, 60, 0.25, 0.25, 361, 281,2,3);

      //step2 填充数据
      for(let i = 0; i < wh1dary.length; i++) {
        streamdata[0].data[i] = wh1dary[i];
        streamdata[1].data[i] = uary[i];
        streamdata[2].data[i] = vary[i];
      }

      //step3 创建流线图对象
      var layer = new WaveStreamLayer(streamdata, {
        projection: 'EPSG:3857',
        ratio: 1
      });
      layer.id = 'sea_'+level+'_'+level+'_'+key;

      layer.appendTo(XHW.map);
      if(layerStream){
        layerStream.clearWind();
      }
      layerStream = layer;

      var elem = 'sea_9999_9999_HS';
      if($('.'+elem).children('span').hasClass('current') && $('#sea_mixedGraph_level li.active').html() == '海面'){
        if(layerStream)layerStream.setVisible(true);
      }else{
        if(layerStream)layerStream.setVisible(false);
      }
      // 根据图例显隐状态，设置流线图层显隐
      // if($('#lc_sea_wave').siblings($('.tuLiEye')).hasClass('current')){
      //     layerStream.setVisible(false);
      // }else{
      //     layerStream.setVisible(true);
      // }

    }


    /**
     * 绘制海浪方向 箭头形式
     * @param {} data
     */
    function drawSeaWave(){
        //step*---------------查看两组数据是否齐全
        if(!dataWD || !dataWH_data) {
            return;
        }
        //step1---------------箭头所在数组
        var markers = [];
        //step2---------------获取屏c幕显示范围(地图本身疑似做过优化)
        //step3---------------根据屏幕显示范围获取循环起始结束位置

        //step4---------------根据地图层级决定箭头疏密程度
        var zoom = XHW.map.getView().getZoom();
        //var delta = getDelta(zoom) * 5;     //数据间隔为0.2经纬度 乘5转为1经纬度
        var delta = getDelta(zoom)
        //step5---------------循环绘制箭头
        var vals = dataWD.vals;
        for(var i = 0; i < vals.length; i += delta) {  //row循环 lng+
            var lng = dataWD.slng + i * dataWD.delta;
            for(var j = 0; j < vals[i].length; j += delta) { //col循环 lat+
                if(!vals[i][j] && vals[i][j] != 0) {    //如果值为空并且值不为0，则不绘制（在陆地）
                    continue;
                }
                var lat = dataWD.slat + j * dataWD.delta;
                var marker = new ol.Feature({
                    geometry:new ol.geom.Point(ol.proj.fromLonLat([lng, lat])),
                })

                var imgSrc = getImage(dataWH_data[i][j]);
                marker.setStyle(new ol.style.Style({
                    image: new ol.style.Icon({
                        rotation: (270 - vals[i][j]) * Math.PI / 180,     // 波浪的主要行进方向与地球正北方向之间的夹角。0度从Y轴负轴方向开始，顺时针绘制
                        // anchor: 'anonymous',
                        // duration: 2000,
                        src: imgSrc
                    })
                }));
                markers.push(marker);
            }
        }

        //step6------------------将所有marker加入同一个图层
        let source = new ol.source.Vector({
            features: markers
        });

        if (!layerD) {
            layerD = new ol.layer.Vector({
                
            });
            layerD.setZIndex(15);
            layerD.id = key;
        }
        layerD.setSource(source);
        
        if ($.inArray(layerD, XHW.map.getLayers().getArray()) == -1)
        XHW.map.addLayer(layerD);
        var elem = 'sea_9999_9999_HS';
        if($('.'+elem).children('span').hasClass('current') && $('.'+elem).parent().attr('display') == 'block'){
          if(layerD)layerD.setVisible(true);
        }else{
          if(layerD)layerD.setVisible(false);
        }
        //step8------------------判断是否功能是否已经关闭，已关闭则删除图层（防止延时导致功能关闭图层保留现象
        if(!isOpen) {
            close();
        }
    }

    /**
     * 根据zoom获取间距
     * @param {} zoom
     */
    function getDelta(zoom){
        var delta = zoom > 10 ? 1 :
                    zoom > 9 ? 2 :
                    zoom > 8 ? 3 :
                    zoom > 7 ? 4 :
                    zoom > 6 ? 5 :
                    zoom > 5 ? 6 :
                    zoom > 4 ? 7 :
                    zoom > 3 ? 8 : 9;
        return delta;
    }

    function getImage(val) {
        var imgSrc = val <= 1 ? '1':
                    val <= 1.5 ? '1.5':
                    val <= 2 ? '2':
                    val <= 2.5 ? '2.5':
                    val <= 3 ? '3':
                    val <= 3.5 ? '3.5':
                    val <= 4 ? '4':
                    val <= 5 ? '5':
                    val <= 6 ? '6':
                    val <= 7 ? '7':
                    val <= 8 ? '8':
                    val <= 9 ? '9': '10';
        return 'img/sea/' + imgSrc + '.png';
    }

    function remove(){
        XHW.map.removeLayer(layerH);
        XHW.map.removeLayer(layerD);
        XHW.map.removeLayer(layerStream);
    }

    function open(key_, level_, levelDesc_, callBack_, plotType_){
        key = key_;
        level = level_;
        levelDesc = levelDesc_;
        callBack = callBack_;
        plotType = plotType_;
        item.htmlLayer = '海浪';
        //---------添加图层控制
        var b = XHW.C.layerC.addLayer(key, item);
        if(!b) {
            close();
            return;
        }
        // if (drawType == 'flow') {
          //---------添加按钮选中样式
          // buttonFlow.parent().addClass('currenterJiBtn');
          // buttonFlow.prev().attr('src',buttonFlow.prev().attr('mysrc'));
        //   XHW.C.layout.judgeWhetherSelect(buttonFlow);
        // } else {
          //---------添加按钮选中样式
          button.parent().addClass('currenterJiBtn');
          button.prev().attr('src',button.prev().attr('mysrc'));
          XHW.C.layout.judgeWhetherSelect(button);
          $('#haiLang').show();
        // }

        getData();
        isOpen = true;
    }

    function close(){
      closeDirection();
      closeFlow();
      // 海浪、海风、预报风都关闭，粒子动态样式隐藏
      // if(!$('#seaWave').parent().hasClass('currenterJiBtn') && !$('#seaWind').parent().hasClass('currenterJiBtn') && !$('#numberFC_wind').parent().hasClass('currenterJiBtn'))
      // $('#haiLang').hide();
    }

    function closeDirection(){
        //---------删除图层控制
        XHW.C.layerC.removeLayer(key);

        //---------取消按钮选中样式
        button.parent().removeClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrcpri'));
		    XHW.C.layout.judgeWhetherSelect(button);
        remove();
        isOpen = false;
    }

    function closeFlow(){
        //---------删除图层控制
        XHW.C.layerC.removeLayer(key);
        //---------取消按钮选中样式
        // buttonFlow.parent().removeClass('currenterJiBtn');
        // buttonFlow.prev().attr('src',buttonFlow.prev().attr('mysrcpri'));
		    // XHW.C.layout.judgeWhetherSelect(buttonFlow);
        remove();
        isOpen = false;
    }

    /**
     * 当层次发生变化时
     *
     */
    function updateZ(){
        if(!isOpen) return; //当前功能未开启则不执行
        if (drawType == 'flow') {
          drawSeaWaveFlow();
        } else {
          drawSeaWave();
        }
    }

    function update(){
        if(!isOpen) return; //当前功能未开启则不执行
        remove();
        if($('#haiLang .liZi').hasClass('current')) {
          drawType = 'flow';
        } else {
          drawType = 'direction';
        };
        open();
    }

    init();

    return {
        updateZ: updateZ,
        open: open,
        close: close,
        update: update
    }
});
