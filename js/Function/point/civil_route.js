define(['Function/point/Profile','Controller/DataFormat','Controller/Http'],
 function(multiAviation,format,http) {
    var routeid = null; // 航线id   
    var layers = [];  //  所有航线图层
    Array.prototype.indexOf = function(val) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == val) return i;
        }
        return -1;
    };
    Array.prototype.remove = function(val) {
        var index = this.indexOf(val);
        if (index > -1) {
        this.splice(index, 1);
        }
    };
    function init(){
        getFocus();
        
        
    }

    //  获取固定航线信息
    function getFocus(addSign){
        $.ajax({
            type: "get",
            contentType: 'application/json; charset=UTF-8',
            url: XHW.C.http.ecmfUrlNew + "/ac/commonflight",
            dataType: "json",
            success: function (data) {
                var data = data.data;   
                getHtml(data);    
            }
        })
    }
    
    

    //  显示航线
    showCivilMultipoint = function(route_data,self){
        var name = route_data.name;
        var id = route_data.name;
        var lngAr = route_data.lngs;
        var latgAr = route_data.lats;
        var highAr = route_data.highs;
        var startAir = route_data.dept_name;
        var endAri = route_data.arr_name;

        var myDate = new Date();
        var mydate = myDate.toLocaleDateString();     //获取当前日期
            mydate = mydate.split('/');
            mydate = mydate[0] + toTwo(mydate[1]) + '' + toTwo(mydate[2]);

        var mytime=myDate.toLocaleTimeString();   //获取当前时间
            mytime = mytime.slice('2').split(':');
            mytime = toTwo(mytime[0])+ '' + toTwo(mytime[1]);
        var flytime = route_data.fly_time; 
            flyHour = Number(flytime.substr(0,2));
            flyMin = Number(flytime.substr(2,2));
        var start = mydate + mytime; 

        myDate.setHours(myDate.getHours()+flyHour);
        myDate.setMinutes(myDate.getMinutes()+flyMin);
        var enddate = myDate.toLocaleDateString();     //获取当前日期
        enddate = enddate.split('/');
        enddate = enddate[0] + toTwo(enddate[1]) + '' + toTwo(enddate[2]);

        var endtime=myDate.toLocaleTimeString();   //获取当前时间
        endtime = endtime.slice('2').split(':');
        endtime = toTwo(endtime[0])+ '' + toTwo(endtime[1]);
        var end = enddate + endtime;
        if($(self).parent().hasClass('curr')){  
            $(self).parent().removeClass('curr');       
            removelayer(id)
        }else{     
            $(self).parent().addClass('curr');
            addlayer(name,id,lngAr,latgAr,highAr,start,end,startAir,endAri)
        }

        // profileImg(value, locationNameMap)
        // 先显示弹框，输起始时间展示剖面图
        // var parVal = {
        //     lat: latgAr,
        //     lng: lngAr,
        //     start: start,
        //     end: end,
        //     high: highAr,
        // };
        // multiAviation.queryAviationInfo(parVal);

        // var curPositions = [latgAr,lngAr];
        // var par_start = start;
        // var par_end = end;
        // multiAviation.queryAviation(curPositions,par_start,par_end);
        // $('.botPanelHangKong').show();
        // var lng = lngAr.split(',');
        // startlng = lng[0];
        // endlng = lng[lng.length - 1];
        // var lat = latgAr.split(',');
        // startlat = lat[0];
        // endlat = lat[lat.length - 1];

        // startime = start;
        // endtime = end;
        // startName=name.substr(0,4);
        // endName=name.substr(4,4);
        // $('.botHangKongRight .curposi').html(format.data('经纬度：', format.lnglat(startlat, startlng)));
        // $('.botHangKongRight .airtime').html('起飞时间：' + startime);
        // $('.botHangKongRight .station_info .start_btn').addClass('curr').siblings().removeClass('curr');
        // if( $('.botHangKongRight .station_info .station_title .airportName').length>0){
        //     $('.botHangKongRight .station_info .station_title .airportName').html(startAir+'('+startName+')')
        // }else {
        //     $('.botHangKongRight .station_info .station_title').prepend(' <p style="color: #BAFC05;font-size: 0.25rem" class="airportName">'+startAir+'('+startName+')'+'</p>')
        // }
        // getAirportData(startName)
    }

    // 添加列表
    function getHtml(data){
        var html = '';
        for(var i = 0; i < data.length; i++){
            var route_data = data[i];
            var startAir = route_data.dept_name;
            var endAri = route_data.arr_name;
            startAir=startAir.replace("机场","");
            startAir=startAir.replace("国际","");
            endAri=endAri.replace("机场","");
            endAri=endAri.replace("国际","");
        // class="'+name+'"
            html += '<p style="color: white;font-size: 0.22rem;line-height: 1.5">'+
                        '<span onclick="showCivilMultipoint('+ JSON.stringify(route_data).replace(/"/g, '&quot;') + ',this)">'+startAir+'→'+endAri+'</span>'+
                    '</p>';
            
        }
        $('.civilRouteList .civil_list .list_con').html(html);       
    } 

    function removelayer(id){
        multiAviation.removePopup();
        for(var i = 0; i < layers.length; i++){
            if(layers[i].id == 'routelayer'+id){
                XHW.map.removeLayer(layers[i]);
                layers.remove(layers[i]);
            }
        }   
    }
 
    function addlayer(name,id,lngAr,latgAr,highAr,start,end,startAir,endAir){
        let markers = [];
        let lnglats = [];
        var locationNameMap = {};
        var latstr = latgAr;
        var lngstr = lngAr;
        var lngAr = lngAr.split(',');
        var latgAr = latgAr.split(',');
        var highAr = highAr.split(',');
        
        //-----------step1--------------遍历数据
        for(let i = 0; i < lngAr.length; i++) {
            //  根据经纬度查询地址        
            getAddressBy(lngAr[i],latgAr[i], function(address){
                locationNameMap[lngAr[i] + ',' + latgAr[i]] = address&&address!=''?address:'unknown';
            }, function(error){
                locationNameMap[lngAr[i] + ',' + latgAr[i]] = 'unknown';
            });
            let lnglat = ol.proj.fromLonLat([parseFloat(lngAr[i]),parseFloat(latgAr[i])]);
            //--------step2-------------画点
            let marker = new ol.Feature({
                type2: 'mark',
                geometry:new ol.geom.Point(lnglat), 
            });
            //----------step3------------给marker加入标记
            marker.type = name+id;
            marker.value = {
                name: name,
                lat: latstr,
                lng: lngstr,
                high: highAr,
                start: start,
                end: end,
                startAir:startAir,
                endAir:endAir
            };
            // var text_content = i == 0 ? '起飞时间：' + start + ';位置：' + format.lnglat(lngAr[i],latgAr[i])+'' :
            //                         i == lngAr.length -1 ?  '降落时间：' + end + ';位置：' + format.lnglat(lngAr[i],latgAr[i])+'' :
            //                             format.lnglat(lngAr[i],latgAr[i])+'' ;
            var text_content = i == 0 ? startAir : '';
            var circleColor = i == 0 ? 'green' : 'green';
            marker.setStyle(new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 7,
                    stroke: new ol.style.Stroke({
                        color: 'white',                                    
                    }), 
                    fill: new ol.style.Fill({
                        color: circleColor
                    })
                }),
                text: new ol.style.Text({
                    // text: format.lnglat(lngAr[i],latgAr[i])+'',
                    text:text_content,
                    fill: new ol.style.Fill({
                        color: '#fff'
                    }),
                    textBaseline: 'top',
                    offsetY: -25,
                    padding: [5,5,5,5],
                    backgroundFill: new ol.style.Fill({
                        color: 'rgba(0,0,0,0.5)'
                    })
                })
            }));
            //-----------step5------------把marker加入数组
            markers.push(marker);
            lnglats.push(lnglat);
        }
        //---------step6--------画线以及设置线的样式
        let line = new ol.Feature({
            type2: 'path',
            geometry: new ol.geom.LineString(lnglats)
        });
        line.setStyle(new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 3,
                color: [237, 212, 0, 0.8]
            }),
        }));
        line.type = name+id;
        line.value = {
            name: name,
            lat: latstr,
            lng: lngstr,
            high: highAr,
            start: start,
            end: end,
        };

        //----------step7-----------把marker和线放到同一组数据中
        let features = markers;
        features.push(line);   

        //-------step8--------删除旧图层，替换新的图层
        // if(!layer || $.inArray(layer, XHW.map.getLayers().getArray()) == -1){
        var layer = new ol.layer.Vector();
        layer.id = 'routelayer' + id;
        layer.setZIndex(15);          
        let source = new ol.source.Vector({
            features: features
        });
        layer.setSource(source);
        layers.push(layer);
        XHW.map.addLayer(layer);
        
        XHW.C.mapclick.addCallback(name+id, function(value){
            $('.bottompanel_air').hide();
            profileImg(value,locationNameMap);

            var lonlat = [103.68,32.85];
            XHW.map.getView().animate(
                {center: ol.proj.transform(lonlat, 'EPSG:4326', 'EPSG:3857'), zoom: 5});
        })

        var lastClickTime = 0;
        var clickTimer;
        $('.botHangKongLeft').on('click', (event) => {
            var nowTime = new Date().getTime();
            if (nowTime - lastClickTime < 300) {
                /*双击*/
                lastClickTime = 0;
                clickTimer && clearTimeout(clickTimer);
                if($('.botHangKongRight').is(':visible')){
                    $('.botHangKongRight').hide();
                    $('.botPanelHangKong').css('height','500px');
                    $('.botHangKongLeft').css('width','100%');
                    $('.botHangKongLeft .botPanelScroll').css('height','100%');
                    $('#ProfileChart_yAxis').css('height','100%');
                    $('#ProfileChart_yAxis').css('width','100px');
                    $('.botHangKongLeft .botPanelScroll .botPanelLeftTu').css('height','100%');
                    $('.botHangKongLeft .botPanelScroll .botPanelLeftTu').css('width','100%');
                    $('.botHangKongLeft .botPanelScroll .botPanelLeftTu').css('left','100px');
                    $('#mCSB_1').css('height','100%');
                    $('#mCSB_1_container').css('height',"100%")
                    multiAviation.drawCrossSection();
                }else{
                    $('.botHangKongRight').show()
                    $('.botPanelHangKong').css('height','330px');
                    $('.botHangKongLeft .botPanelScroll').css('height','300px');
                    $('#ProfileChart_yAxis').css('height','300px');
                    $('#ProfileChart_yAxis').css('width','50px');
                    $('.botHangKongLeft .botPanelScroll .botPanelLeftTu').css('height','300px');
                    $('.botHangKongLeft .botPanelScroll .botPanelLeftTu').css('left','50px');
                    botHangKongLeftWidth();
                    $('#mCSB_1_container').css('height',"295px")
                    multiAviation.drawCrossSection()
                }
            } else {
                /*单击*/
                lastClickTime = nowTime;
            }
        });    
    }

    function toTwo(num){
        num = parseInt(num);
        return num >= 10 ? num : '0' + num;
    }

        //   绘制剖面图
        var startlng, startlat, startime, endlng, endlat, endtime;
        var name;
        var startName,endName;
        var startAir,endAir;

        function profileImg(value, locationNameMap) {
            multiAviation.queryAviationInfo(value, locationNameMap);
            name = value.name;
            var lng = value.lng.split(',');
            startlng = lng[0];
            endlng = lng[lng.length - 1];
            var lat = value.lat.split(',');
            startlat = lat[0];
            endlat = lat[lat.length - 1];
            startime = value.start;
            endtime = value.end;
            startName=name.substr(0,4);
            endName=name.substr(4,4);
            startAir=value.startAir;
            endAir=value.endAir;
            $('.botHangKongRight .curposi').html(format.data('经纬度：', format.lnglat(startlat, startlng)));
            $('.botHangKongRight .airtime').html('起飞时间：' + startime);
            $('.botHangKongRight .station_info .start_btn').addClass('curr').siblings().removeClass('curr');
            if( $('.botHangKongRight .station_info .station_title .airportName').length>0){
                $('.botHangKongRight .station_info .station_title .airportName').html(startAir+'('+startName+')')
            }else {
                $('.botHangKongRight .station_info .station_title').prepend(' <p style="color: #BAFC05;font-size: 0.25rem" class="airportName">'+startAir+'('+startName+')'+'</p>')
            }
            getAirportData(startName)
        }

        $('.botHangKongRight .station_info .start_btn').click(function (event) {
            if($('.civilRouteList .civilRouteBtn .guding').hasClass('cur')){
                //----------------------------起飞机场
                if( $('.botHangKongRight .station_info .station_title .airportName').length>0){
                    $('.botHangKongRight .station_info .station_title .airportName').html(startAir+'('+startName+')')
                }else {
                    $('.botHangKongRight .station_info .station_title').prepend(' <p style="color: #BAFC05;font-size: 0.25rem" class="airportName">'+startAir+'('+startName+')'+'</p>')
                }
                $('.botHangKongRight .curposi').html(format.data('经纬度：', format.lnglat(startlat, startlng)));
                $('.botHangKongRight .airtime').html('起飞时间：' + startime);
                event.stopPropagation();
                $(this).addClass('curr').siblings().removeClass('curr');
                getAirportData(startName)
            }
        })
        $('.botHangKongRight .station_info .end_btn').click(function (event) {
            if($('.civilRouteList .civilRouteBtn .guding').hasClass('cur')) {
                //----------------------------降落机场
                if( $('.botHangKongRight .station_info .station_title .airportName').length>0){
                    $('.botHangKongRight .station_info .station_title .airportName').html(endAir+'('+endName+')')
                }else {
                    $('.botHangKongRight .station_info .station_title').prepend(' <p style="color: #BAFC05;font-size: 0.25rem" class="airportName">'+endAir+'('+endName+')'+'</p>')
                }
                $('.botHangKongRight .curposi').html(format.data('经纬度：', format.lnglat(endlat, endlng)));
                $('.botHangKongRight .airtime').html('降落时间：' + endtime);
                event.stopPropagation();
                $(this).addClass('curr').siblings().removeClass('curr');
                getAirportData(endName)
            }
        })

        function removeAllLayer() {
            if (layers.length > 0) {
                for (var i = 0; i < layers.length; i++) {
                    XHW.map.removeLayer(layers[i]);
                }
                layers = [];
            }
        }

        function close() {
            multiAviation.removePopup();
            removeAllLayer();
            $('.airRoute_pop').hide();
            $('.airRoutePar_pop').hide();
            $('.civilRouteList').hide();
            $('.civilRouteList p').each(function () {
                $(this).removeClass('curr')
            })
            // mp.removeMultipoint();
        }

        function getAirportData(code) {
            /**
             * step1 获取机场降落条件气象数据
             * http://weather.xinhong.net/airportdata_surf/sigmentdataindexslevel
             */
            $.ajax({
                type: "POST",
                //端口 7019 or 7029
                url: appendInfoToURL("http://ocean.xinhong.net:7019/airportStatus"),
                contentType: "application/json",
                // async: false,
                data: JSON.stringify({type: "airworth"}),
                success: function (res) {
                    /**
                     * step2 获取机场报文气象数据
                     * http://weather.xinhong.net/airportdata_surf/sigmentdataindexslevel
                     */
                    XHW.C.http.http('/airportdata_surf/sigmentdataindexslevel', '', function (data, Stime) {
                        collating(data, res.data);
                        var time=airportdata[code].time;
                        var weather=airportdata[code].weather;
                        var realValueStr=airportdata[code].ILS?airportdata[code].ILS.status:
                            airportdata[code].NDB?airportdata[code].NDB.status:
                                airportdata[code].VF?airportdata[code].VF.status:undefined;
                        var param = {
                            year: time.substring(0, 4),
                            month: time.substring(4, 6),
                            day: time.substring(6, 8),
                            hour: time.substring(8, 10),
                            minute: time.substring(10, 12),
                            code: code,
                            sigmenttype: weather
                        };
                        http.get(http.weatherUrl, '/airportdata_surf/sigmentdatafromcode', param, function (json) {
                            var data = json.data;
                            var real = data.real ? data.real : {};
                            let realValue;
                            if (realValueStr && realValueStr != '适航') {
                                if (typeof realValueStr == 'string') {
                                    realValue = JSON.parse(realValueStr);
                                } else {
                                    realValue = realValueStr;
                                }
                            }
                            $(".botHangKongRight .route_info h3").html("实况（METAR）");
                            if (realValue) {
                                var rwth = format.data('', realValue.WEATHER);
                                if (rwth == '无明显变化') rwth = '无';
                                var html= '<p style="color: white;font-size: 0.12rem">'+format.data('', realValue.METAR)+'</p>' +
                                    '<p class="content_Element" style="color: white;font-size: 0.12rem;height: 0.2rem;"><span class="text">观测时间</span><span class="content">'+realValue.ODATE+'</span></p>' +
                                    '<p class="content_Element" style="color: white;font-size: 0.12rem;height: 0.2rem;"><span class="text">能见度</span><span class="content">'+realValue.VISCHN+'</span></p>' +
                                    '<p class="content_Element" style="color: white;font-size: 0.12rem;height: 0.2rem;"><span class="text">云</span><span class="content">'+format.data('', realValue.N1CHN, ',') + format.data('', realValue.N2CHN, ',') + format.data('', realValue.N3CHN, ',')+'</span></p>' +
                                    '<p class="content_Element" style="color: white;font-size: 0.12rem;height: 0.2rem;"><span class="text">温度</span><span class="content">'+realValue.TTCHN+'</span></p>' +
                                    '<p class="content_Element" style="color: white;font-size: 0.12rem;height: 0.2rem;"><span class="text">海平面气压</span><span class="content">'+realValue.PRCHN+'</span></p>' +
                                    '<p class="content_Element" style="color: white;font-size: 0.12rem;height: 0.2rem;"><span class="text">天气现象</span><span class="content">'+rwth+'</span></p>' +
                                    '<p class="content_Element" style="color: white;font-size: 0.12rem;height: 0.2rem;"><span class="text">风</span><span class="content">'+realValue.WDCHN + " " + realValue.WSCHN+'</span></p>' ;
                                $('.botHangKongRight .air_real .air_content').html(html);
                            } else {
                                var rwth = format.data('', real.WTHC);
                                if (rwth == '无明显变化') rwth = '无';
                                var html='<p style="color: white;font-size: 0.12rem">'+format.data('', data.msg)+'</p>'+
                                    '<p class="content_Element" style="font-size: 0.12rem;color: white;height: 0.2rem;"><span class="text">观测时间</span><span class="content">'+format.data('', data.odate)+'</span></p>' +
                                    '<p class="content_Element" style="font-size: 0.12rem;color: white;height: 0.2rem;"><span class="text">能见度</span><span class="content">'+format.vis(real.MIVIS)+'</span></p>' +
                                    '<p class="content_Element" style="font-size: 0.12rem;color: white;height: 0.2rem;"><span class="text">云</span><span class="content">'+format.data('', real.NH1, ',') + format.data('', real.NH2, ',') + format.data('', real.NH3)+'</span></p>' +
                                    '<p class="content_Element" style="font-size: 0.12rem;color: white;height: 0.2rem;"><span class="text">温度</span><span class="content">'+format.tt(real.TT)+'</span></p>' +
                                    '<p class="content_Element" style="font-size: 0.12rem;color: white;height: 0.2rem;"><span class="text">海平面气压</span><span class="content">'+format.pr(real.PR)+'</span></p>' +
                                    '<p class="content_Element" style="font-size: 0.12rem;color: white;height: 0.2rem;"><span class="text">天气现象</span><span class="content">'+rwth+'</span></p>' +
                                    '<p class="content_Element" style="font-size: 0.12rem;color: white;height: 0.2rem;"><span class="text">风</span><span class="content">'+format.wind(real.WD, real.WS)+'</span></p>';
                                $('.botHangKongRight .air_real .air_content').html(html);
                            }

                            // //预报
                            $(".botHangKongRight .air_fore h3").html("预报（TAF）");
                            var fcst = data.fcst && data.fcst.length >= 1 ? data.fcst[data.fcst.length - 1] : { fcst: {} };
                            var time1 = '', time2 = '';
                            if (fcst.TIME_BG) {
                                time1 = new Date(fcst.TIME_BG.split('-').join('/'));
                                time1 = time1.getDate() + '日' + time1.getHours() + '时';
                                if (fcst.TIME_ED) {
                                    time2 = new Date(fcst.TIME_ED.split('-').join('/'));
                                    time2 = time2.getDate() + '日' + time2.getHours() + '时';
                                }
                            }
                            let cloudStr = '';
                            if (fcst.fcst.CN1CHN) {
                                cloudStr += fcst.fcst.CN1CHN;
                                cloudStr += ',';
                            }
                            if (fcst.fcst.CN2CHN) {
                                cloudStr += fcst.fcst.CN2CHN;
                                cloudStr += ',';
                            }
                            if (fcst.fcst.CN3CHN) {
                                cloudStr += fcst.fcst.CN3CHN;
                                cloudStr += ',';
                            }
                            if (cloudStr.length > 0) {
                                cloudStr = cloudStr.substring(0, cloudStr.length - 1)
                            }
                            let tt = format.tt(fcst.fcst.MINAT) + "~" + format.tt(fcst.fcst.MAXAT);
                            var fwth = format.data('', fcst.fcst.WTHC);
                            if (fwth == '无明显变化') fwth = '无';
                            var html='<p id="rightInfo_airline_msgFcst" style="font-size: 0.12rem;color: white;">'+format.data('', fcst.msg)+'</p>' +
                                '<p class="content_Element" style="font-size: 0.12rem;height: 0.2rem;color: white;"><span class="text">预报时效</span><span class="content">'+format.data('', time1) + ' — ' + format.data('', time2)+'</span>\</p>' +
                                '<p class="content_Element" style="font-size: 0.12rem;height: 0.2rem; color: white;"><span class="text">能见度</span><span class="content">'+format.vis(fcst.fcst.MIVIS)+'</span></p>' +
                                '<p class="content_Element" style="font-size: 0.12rem;height: 0.2rem; color: white;"><span class="text">云</span><span class="content">'+cloudStr+'</span></p>' +
                                '<p class="content_Element" style="font-size: 0.12rem;height: 0.2rem; color: white;"><span class="text">温度</span><span class="content">'+tt+'</span></p>' +
                                '<p class="content_Element" style="font-size: 0.12rem;height: 0.2rem; color: white;"><span class="text">天气现象</span><span class="content">'+fwth+'</span></p>' +
                                '<p class="content_Element" style="font-size: 0.12rem;height: 0.2rem; color: white;"><span class="text">风</span><span class="content">'+format.wind(fcst.fcst.WD, fcst.fcst.WS)+'</span></p>' +
                                '<p style="font-size: 0.12rem; color: white;"><span class="text left">变化</span><span class="content right">'+format.data('', fcst.FCSTMSGCHN)+'</span></p>';
                            $('.botHangKongRight .air_fore .air_content').html(html);
                        });
                    }, function () {
                    })
                },
                error: function (message) {
                },
                dataType: "json"
            });
        }

        /**
         * 整理数据
         * @param {*} rawData
         * @param {*} wData
         */
        function collating(rawData, wData) {
            airportdata = {};
            // for(var key in rawData) {
            for (var i = 0; i < rawData.length; i++) {
                // ZYYJ_20190112140000_NONE_129.45_42.882_延吉/朝阳川_2
                // var keys = rawData[key].split('_');
                var keys = rawData[i].split('_');
                airportdata[keys[0]] = {       //四字码
                    time: keys[1],       //时间
                    weather: keys[2],    //天气条件
                    lng: keys[3],        //经度
                    lat: keys[4],        //维度
                    name: keys[5],       //机场名
                    level: keys[6],      //分级
                    ILS: wData['ILS'] ? wData['ILS'][keys[0]] : 0,             //盲降
                    NDB: wData['NDB'] ? wData['NDB'][keys[0]] : 0,             //NDB条件
                    VF: wData['VF'] ? wData['VF'][keys[0]] : 0               //目视条件
                }
            }
        }

     var lastClickTime = 0;
     var clickTimer;
     // 航线机场预报信息双击生成放大图片并显示
     $('.botHangKongRight').on('click', (event) => {
         var nowTime = new Date().getTime();
         if (nowTime - lastClickTime < 300) {
             /*双击*/
             lastClickTime = 0;
             clickTimer && clearTimeout(clickTimer);
             $('.botHangKongRight .btn_air').hide();
             html2canvas($(".botHangKongRight")).then(function (canvas) {
                 var imgUri = canvas.toDataURL("image/png");//生成的图片的url
                 var ctx = '<img src="' + imgUri + '"/>';
                 $('#airlineImg').html(ctx);
                 $('#airlineImg').show();
             });
         } else {
             /*单击*/
             lastClickTime = nowTime;
         }
     });
     //放大图片双击隐藏
     $('#airlineImg').on('click', (event) => {
         var nowTime = new Date().getTime();
         if (nowTime - lastClickTime < 300) {
             /*双击*/
             clickTimer && clearTimeout(clickTimer);
             if ($('#airlineImg').is(':visible')) {
                 $('.botHangKongRight .btn_air').show();
                 $('#airlineImg').hide();
             }
         } else {
             /*单击*/
             lastClickTime = nowTime;
         }
     });


        return {
            init: init,
            close: close,
            removeAllLayer: removeAllLayer
        }
    });