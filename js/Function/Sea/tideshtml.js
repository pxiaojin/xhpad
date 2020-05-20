define(['lib/echarts'],function(echarts){
    var key;
    var type;
    var item;
    var layer;
    var button;     //功能开关按钮
    var isOpen = false;

    //时间对象
    var time = new Date();
    var year = time.getFullYear();
    var month = time.getMonth() + 1;
    var day = time.getDate();
    var hour = time.getHours();

    var iconFeatures = new Array();
    type = key = 'ocean_tides';
    item = XHW.C.layerC.createItem('潮汐资料显示', '', function(){
        close();
    })



     //层级缩放监听
    XHW.C.MapMove.addZoomCallback(function(){
        if(isOpen) {
            var zoom = XHW.map.getView().getZoom();            
            for(var i = 0; i < iconFeatures.length; i++){
                if(zoom >= 7){
                    tideval_style = new ol.style.Text({ 
                        textAlign: "center",
                        textBaseline: "middle",
                        font: '10px Normal Arial',                               
                        text: iconFeatures[i].value.tideVal +'m',
                        fill: new ol.style.Fill({    //文字填充色
                            color: '#32C2FD',
                        }),                            
                        offsetX: 30,
                    })
                }else{
                    tideval_style = null;
                };
                iconFeatures[i].setStyle(new ol.style.Style({
                    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                        crossOrigin: 'anonymous',
                        src: 'img/sea/chaoxi_label.png',
                        scale: 0.8,
                    })),  
                    text: tideval_style                                                   
                }));  
            }              
        };
    });

    //------------鼠标指向marker的监听
    XHW.C.mouse.addCallback(type, function(value){
        return getPopupHtml(value);
    });

    XHW.C.mapclick.addCallback(type, function(value){
        $('.tides').show();
        drawChart(value['scode'],value['name']);                                   
    })

    button = $('.tide');
    button.click(function(){
        if(isOpen) { 
            close();
        } else {
            init();
             button.addClass('currenterJiBtn');
             $('.tide img').attr('src','./img/layout/icon_chaoxi2.png');
             XHW.C.layout.judgeWhetherSelect(button);
             XHW.C.layout.fenBianLv();
             // $('.tides').show();
             isOpen = true;   
        }
    });
    $('.tideDel').click(function(){
        $('.tides').hide();
    })

    function close() {
        if (layer){
            XHW.map.removeLayer(layer); 
            layer = null;
        }
        button.removeClass('currenterJiBtn');
        $('.tide img').attr('src','./img/layout/icon_chaoxi.png');
        XHW.C.layout.judgeWhetherSelect(button);
        $('.tides').hide();
        XHW.C.layerC.removeLayer(key);
        isOpen = false;       
    }

    function init(){
        var b = XHW.C.layerC.addLayer(key, item);
        if(!b) {
            close();
            return;
        }
        
        //潮汐站点          https://weather.xinhong.net/xhweatherfcsys/tide/tidestations
        $.ajax({
            url: appendInfoToURL('http://ocean.xinhong.net:8000/xhweatherfcsys/tide/tidestations'),
            dataType:'json',
            success:function(res){
                if (res.status_code != 0) {
                    console.log("数据错误");
                    item.htmlLayer = '潮汐资料显示(无数据)';
                    XHW.C.layerC.updateLayerData(key, item);
                    return;
                }
                XHW.C.layerC.updateLayerData(key, item);
                var station = res.data;
                for(var i = 0; i < station.length; i++){
                    var scode = station[i].id;
                    var name = station[i].cnname;
                    var lng = station[i].lon;
                    var lat = station[i].lat;

                    var iconFeature = new ol.Feature({
                        geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(lng), parseFloat(lat)])),
                    });

                    iconFeature.type = type;
                    iconFeature.value = {
                        name: name,
                        scode: scode,
                        lng: lng,
                        lat: lat,
                    };

                    //  iconFeature.value 添加潮汐值 与 初始样式
                    queryTideVal(scode,iconFeature);

                    iconFeatures.push(iconFeature);                              
                } 
                var vectorSource = new ol.source.Vector({
                    features: iconFeatures,                   
                });
                
                if (!layer) {
                    layer = new ol.layer.Vector({
                    });
                    layer.setZIndex(15);
                    layer.id = key;
                }
                layer.setSource(vectorSource);
                
                if ($.inArray(layer, XHW.map.getLayers().getArray()) == -1)
                XHW.map.addLayer(layer);      
            },
        });
    }

    function getPopupHtml(value){
        var lng = Math.round(value['lng']*100)/100;
        var lat = Math.round(value['lat']*100)/100;
        var name = value['name'];
        var scode = value['scode'];

        var html = '<div style="position:absolute;left:-30px;bottom:12px;' 
                        + 'background:rgba(0,0,0,0.5);padding:2px;border-radius:2px;color:#ffffff;width: max-content">'
                    +'<h1 style="font-size:12px;margin:5px 0;">' + name + "(" + scode + ")" + '</h1>'
                    +'<h2 style="font-size:12px;margin:5px 0;">' + lat + ", " + lng + '</h2>'
                +'</div>';
        return html;
    }

    // 潮汐当前值   https://weather.xinhong.net/xhweatherfcsys/tide/tidedata?year='+year+'&month='+toTwo(month)+'&day='+toTwo(day)+'&tide='+scode
                //    http://ocean.xinhong.net:8000/xhweatherfcsys/tide/tidedata?tide=9007048
    function queryTideVal(scode,iconFeature){
        $.ajax({
            url: appendInfoToURL('http://ocean.xinhong.net:8000/xhweatherfcsys/tide/tidedata?year='+year+'&month='+toTwo(month)+'&day='+toTwo(day)+'&tide=' + scode),
            dataType:'json',
            success:function(tidedata){
                var data = tidedata.tidedata; 
                let tideVal = data['values'][hour];
                iconFeature.value.tideVal = tideVal;
                return iconFeature.setStyle(new ol.style.Style({
                    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                        crossOrigin: 'anonymous',
                        src: 'img/sea/chaoxi_label.png',
                        scale: 0.8,
                    })),                                    
                }));  
            }
        }); 
    }

    function drawChart(scode,name){
        var totalVal = [];

        var tod = getDay(0).split('-');
        var tod_yy = tod[0];
        var tod_mm = tod[1];
        var tod_dd = tod[2];

        var tom = getDay(1).split('-');
        var tom_yy = tom[0];
        var tom_mm = tom[1];
        var tom_dd = tom[2];

        var aftom = getDay(2).split('-');
        var aftom_yy = aftom[0];
        var aftom_mm = aftom[1];
        var aftom_dd = aftom[2];
       
        $.ajax({
            url: appendInfoToURL('http://ocean.xinhong.net:8000/xhweatherfcsys/tide/tidedata?year='+tod_yy+'&month='+tod_mm+'&day='+tod_dd+'&tide='+scode),
            dataType:'json',
            success:function(toddata){
                totalVal = totalVal.concat(toddata.tidedata.values);
                var odinfo = toddata.info;
                $.ajax({
                    url: appendInfoToURL('http://ocean.xinhong.net:8000/xhweatherfcsys/tide/tidedata?year='+tom_yy+'&month='+tom_mm+'&day='+tom_dd+'&tide='+scode),
                    dataType:'json',
                    success:function(tomdata){
                        totalVal = totalVal.concat(tomdata.tidedata.values);
                        var tdinfo = tomdata.info;
                        $.ajax({
                            url: appendInfoToURL('http://ocean.xinhong.net:8000/xhweatherfcsys/tide/tidedata?year='+aftom_yy+'&month='+aftom_mm+'&day='+aftom_dd+'&tide='+scode),
                            dataType:'json',
                            success:function(aftomdata){
                                totalVal = totalVal.concat(aftomdata.tidedata.values);
                                var thrdinfo = aftomdata.info;
                                linechart(totalVal,tod_dd,tom_dd,aftom_dd);

                                $('.tideContent .highTide .oned_tide').html(
                                    showHighTide_html(tod_yy,tod_mm,tod_dd,odinfo.time1,odinfo.time2,odinfo.time3,
                                        odinfo.time4,odinfo.h1,odinfo.h2,odinfo.h3,odinfo.h4,odinfo.ch1,odinfo.ch2,
                                        odinfo.ch3,odinfo.ch4));
                                $('.tideContent .highTide .twod_tide').html(
                                    showHighTide_html(tom_yy,tom_mm,tom_dd,tdinfo.time1,tdinfo.time2,tdinfo.time3,
                                        tdinfo.time4,tdinfo.h1,tdinfo.h2,tdinfo.h3,tdinfo.h4,tdinfo.ch1,tdinfo.ch2,
                                        tdinfo.ch3,tdinfo.ch4));
                                $('.tideContent .highTide .thrd_tide').html(
                                    showHighTide_html(aftom_yy,aftom_mm,aftom_dd,thrdinfo.time1,thrdinfo.time2,thrdinfo.time3,
                                        thrdinfo.time4,thrdinfo.h1,thrdinfo.h2,thrdinfo.h3,thrdinfo.h4,thrdinfo.ch1,thrdinfo.ch2,
                                        thrdinfo.ch3,thrdinfo.ch4));
                            }
                        });
                    }
                });
            }
        });

        $('.tides .tabtitle .tideCname').html(name);

        var showTime = tod_yy + '-' + tod_mm + '-' + tod_dd + ' 至 ' + aftom_yy + '-' + aftom_mm + '-' + aftom_dd;
        $('.tides .tabtitle .tideTime').html(showTime);
    }

    function toTwo(time){
         time = time+'';
        return time.length < 2 ? "0"+time : time;
    }  

    function showHighTide_html(y,m,d,t1,t2,t3,t4,v1,v2,v3,v4,n1,n2,n3,n4){
        // return html = '<p style="font-weight:bold">' +  y + '年' + m + '月' + d + '日 </p>' +
                        // '<p>' + n1 + ': ' + t1 + '&nbsp;&nbsp;&nbsp;潮高: ' + v1 + 'm' +
                        // '<p>' + n2 + ': ' + t2 + '&nbsp;&nbsp;&nbsp;潮高: ' + v2 + 'm' +
                        // '<p>' + n3 + ': ' + t3 + '&nbsp;&nbsp;&nbsp;潮高: ' + v3 + 'm' +
                        // '<p>' + n4 + ': ' + t4 + '&nbsp;&nbsp;&nbsp;潮高: ' + v4 + 'm';
        return html = '<p style="font-weight:bold">' +  y + '年' + m + '月' + d + '日 </p>' +
                        showtideInfo(n1,t1,v1) + showtideInfo(n2,t2,v2) + showtideInfo(n3,t3,v3) + showtideInfo(n4,t4,v4);
    }

    function showtideInfo(a,b,c){
        if(a){
            return '<p>' + a + ': ' + b + '&nbsp;&nbsp;&nbsp;潮高: ' + c + 'm';
        }else{
            return '';
        }
    }
            
    // 首页潮汐图
    
	function linechart(value,tod_dd,tom_dd,aftom_dd) {
        var width = $("#tidePic").width();
        var height = $("#tidePic").height();
        $("#tidePic").css("width", width).css("height", height);
        var dom = document.getElementById("tidePic");
        var myChart = echarts.init(dom);  
        var app = {};
        option = null;
        option = {
			tooltip: {
                trigger: 'axis',
                formatter: '{b0}: {c0}' + 'm'
            },
            legend: {
                left: '100',
                data: [
                    {
                        name: '潮高', textStyle: {
                            color: 'white'
                        }
                    }]
            },
			grid: {
				left: '3%',
				right: '3%',
				top: '15%',
				bottom:'-1%',
				containLabel: true
			},
			xAxis: {
                type: 'category',	
                boundaryGap : false,
				axisLine: {
					onZero:false,// 让x轴线在最下面
					lineStyle: {
						color: '#fff',//x轴的颜色
					}
                },
                splitLine:{
                    show: true,
                    interval: 23,
                },
				data: ['00时\n'+ tod_dd +'日','01时','02时','03时','04时','05时','06时','07时','08时',
                '09时','10时','11时','12时','13时','14时','15时','16时','17时','18时','19时','20时',
                '21时','22时','23时','00时','01时\n'+ tom_dd +'日','02时','03时','04时','05时','06时',
                '07时','08时','09时','10时','11时','12时','13时','14时','15时','16时','17时','18时',
                '19时','20时','21时','22时','23时','00时','01时','02时\n'+ aftom_dd +'日','03时','04时','05时','06时',
                '07时','08时','09时','10时','11时','12时','13时','14时','15时','16时','17时','18时',
                '19时','20时','21时','22时','23时']
			},
			yAxis: {
                name: '(m)',
                nameTextStyle:{padding:[-30,0,0,0],color:'white'},
				type: 'value',
				axisLine: {
					lineStyle: {
						color: '#9E9EB9',
					}
				},
				axisLabel: {
					show: true,
					textStyle: {
						color: '#fff'
					}
				},
                boundaryGap: false,
			},
			series: [
				{
					name:'潮高',
					smooth:true, 
					type:'line',
					stack: '总量',
					itemStyle: {
                        normal: {
                            color: 'rgb(65,22,234)',//折线点的颜色
                            lineStyle: {
                                color: 'rgb(65,22,234)'//折线的颜色
                            }
                        }
                    },
					areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgb(65,22,234)'
                            }, {
                                offset: 1,
                                color: '#d4f2e7'
                            }])
                        }
                    },
					data:value
				}
			]
		};

        if (option && typeof option === "object") {
            myChart.setOption(option, true);
        } 
	};
    
    // 以当前时间为准，获取前后时间的对象
    function getDay(day){        
        var today = new Date();       
        var targetday_milliseconds=today.getTime() + 1000*60*60*24*day;    
        today.setTime(targetday_milliseconds);            
        var tYear = today.getFullYear();     
        var tMonth = today.getMonth();      
        var tDate = today.getDate();   
        tYear = doHandleMonth(tYear);     
        tMonth = doHandleMonth(tMonth + 1);   
        tDate = doHandleMonth(tDate);  
        return tYear+"-"+tMonth+"-"+tDate; 
        }  
    function doHandleMonth(month){      
        var m = month;       
        if(month.toString().length == 1){    
            m = "0" + month;      
        }         
        return m;  
    }

    return {
        drawChart: drawChart,
        close: close
    }
})
