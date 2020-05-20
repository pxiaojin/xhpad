define(['Function/point/StationInfo','Function/point/AirportInfo'], function(stationInfo,airportInfo) {
    var timeBg = [];
    var timeBga = [];
    var timeBgb = [];
    var timeEd = [];
    var timeEda = [];
    var timeEdb = [];
    var myVal = [];

     $('.header .searchInput').keyup(function(){
        myVal =  $(this).val();
        if (myVal == '搜索位置、气象站' || myVal == ''){
            $('.header .searchDiv ul').hide()
        } else{
            $('.header .searchDiv ul').show()
        };        
        if (event.keyCode == "13") {
    　　　　$('.header .searchBtn').click();
    　　} else if(event.keyCode >=[ 37 && event.keyCode <= 40]) {
            return;
        } else {
            $.ajax({
                url:appendInfoToURL('http://weather.xinhong.net/station/infofrompynamecode?param='+myVal),
                dataType:'json', 
                success:function(res){
                    onqueryfinished(res.data);
                },
                error:function(){
                    onqueryfinished(undefined);
                }
            });
            // 不论查询成功或失败，都要调用
            function onqueryfinished(data) {
                $('.header .searchDiv ul').empty();
                updateStations(data);
                queryAirports();
            }
        }           
    });

    function queryAirports() {
        $.ajax({
            url:appendInfoToURL('http://weather.xinhong.net/airport/infofromnameicao3icao4?param='+myVal),
            dataType:'json',
            success:function(res){
                updateAirports(res.data);
            },
            error:function(){
                updateAirports(undefined);
            }
        });  
    }

    $('#searchMaxIcon').click(function(event) {
        $(this).hide();
        $('#searchDiv').stop().fadeIn(500);
    });
 

    $('.header .searchBtn').click(function(){
        if (stations) {
            locationStation(0);
        } else {
            locationAirport(0);
        }
    });

    var stations;
    var airports;
    function updateStations(stations_) {
        stations = stations_;
        if(stations) {  
            dataLen = stations.length;            
            for(var i = 0; i < stations.length; i++){     
                let k = i;                                                
                
                var cname = stations[i].cname;
                var ename = stations[i].ename;
                $('.header .searchDiv ul').append("<li></li>");
                var oH = document.createElement("h3");
                var oSpan = document.createElement("span");                
                $('.header .searchDiv ul>li:eq('+i+')').append(oH);
                $('.header .searchDiv ul>li:eq('+i+')').append(oSpan);
                $('.header .searchDiv ul>li:eq('+i+')>h3').append("<b>"+cityName(cname)+"</b>  ,  "+ cityName(ename));
                oSpan.innerHTML = "纬度：" + stations[i].lat + "  /  经度：" + stations[i].lng;    
                
                $('.header .searchDiv ul>li:eq('+i+')').click(function(){
                    locationStation(k);
                });
            };                 
        }
    }

    function locationStation(index) {
        if (stations && stations.length > index) {
            let myCodes = stations[index].stationCode;
            let cnames = stations[index].cname;
            let stalng = stations[index].lng;
            let stalat = stations[index].lat;
            viewAnimate(stalng, stalat);
            stationInfo.queryStationInfo(myCodes, cnames);           
            $('.header .searchDiv ul').hide();
        }
    }

    function updateAirports(airports_) {
        airports = airports_;
        var dataLen = stations?stations.length:0;
        if (airports) {
            for(let j = 0; j < airports.length; j++){
                var lng = airports[j].lng;
                var lat = airports[j].lat;
                var cname = airports[j].cname;
                var ccname = airports[j].ccname;
                $('.header .searchDiv ul').append("<li></li>");
                var oH = document.createElement("h3");
                var oSpan = document.createElement("span");
                $('.header .searchDiv ul>li:eq('+(j+dataLen)+')').append(oH);
                $('.header .searchDiv ul>li:eq('+(j+dataLen)+')').append(oSpan);
                $('.header .searchDiv ul>li:eq('+(j+dataLen)+')>h3').append("<b>"+cityName(cname)+"</b>  ,  "+ cityName(ccname));
                oSpan.innerHTML = "icao4：" + airports[j].icao4 + "  /  icao3：" + airports[j].icao3;
                $('.header .searchDiv ul>li:eq('+(j+dataLen)+')').click(function(){
                    locationAirport(j);                    
                })
            }
        }
    }

    function locationAirport(index) {
        if (airports && airports.length > index) {
             // showAirport(data[j].icao4);
            var lng = airports[index].lng;
            var lat = airports[index].lat;
             viewAnimate(lng,lat);
             $('.header .searchDiv ul').hide();
             XHW.C.http.http('/airportdata_surf/sigmentdataindexslevel', '', function(res, time){
                 for(var i = 0; i < res.length; i++){
                     var code = res[i].split('_')[0]; 
                     var time = res[i].split('_')[1];
                     var weather = res[i].split('_')[2];
                     if(airports[index].icao4==code){
                         airportInfo.queryAirportInfo(code, time, weather);
                     }
                 }
             });      
        }
    }

      // 点击搜索按钮
    // $('.header .searchBtn').click(function(event) {
    //     myVal =  $('.header .searchInput').val();
    //     posit(myVal);
    //     animate();
    //     // if(myVal==null) return; 
    //     // queryData5(myVal);       
    //     $('.header .searchDiv ul').hide();
    // });

    // 站点和机场定位  view层动画定位
    function viewAnimate(lng,lat){
        var posto = ol.proj.fromLonLat([lng,lat]);
        XHW.map.getView().animate({
            center: posto,
            zoom: 6,
            duration: 1000
        });
        
        // 添加闪烁marker点
        var point_div = document.getElementById("css_animation");
        $('#css_animation').show();
        var point_overlay = new ol.Overlay({
            element: point_div,
            positioning: 'center-center'
        });
        XHW.map.addOverlay(point_overlay);
        point_overlay.setPosition(posto);

        // setTimeout(function(){
        //     // XHW.map.removeOverlay(point_overlay);
        //     $('#css_animation').hide();
        // },20000)
    }

    function showStation(myCode,name) {
        animate();
        $('.right-menu').eq(0).show();
        $('.right-menu').eq(1).hide();
        queryData2(myCode);
        queryData3(myCode);
        queryData4(myCode);
        lunbo(myCode,name);
        queryTLogP(myCode, name);
        $('.header>ul').hide();
    }

    function showAirport(icao4) {
        // queryData4(icao4);
        $.ajax({
            url:appendInfoToURL('https://weather.xinhong.net/airport/infofromnameicao3icao4?param='+icao4),
            dataType:'json',
            sync: false,
            success:function(res){
                var data = res.data;
                if (data) {
                    airportInfo = data[0];
                    let lat = airportInfo.lat;
                    let lng = airportInfo.lng;
                    let cname =  airportInfo.cname;
                    lunboTwo(lat,lng);
                    animate();
                    $('.right-menu').eq(1).show();
                    $('.right-menu').eq(0).hide();                  
                    $('.right-Pane-jichang h2').html(airportInfo.cname+'('+airportInfo.ccname+')');
                    $('.right-Pane-jichang>p:eq(0)').html('China/经纬度：'+airportInfo.lng+'E  ,  '+ airportInfo.lat+'N');
                    airport(cname);
                    $('.header>ul').hide();
                    getStationCode(lat, lng)
                };
            },
            error:function(){
            }
        })
    }

    // 机场与气象站右侧数据展示方法
    function queryData5(myVal){
        if(!isNaN(myVal)){
            $.ajax({
                url:appendInfoToURL('https://weather.xinhong.net/station/infofrompynamecode?param='+myVal),
                dataType:'json',
                success:function(res){             
                    var myCode = res.data[0].stationCode;
                    var name = res.data[0].cname;
                    $('.header>ul').empty();                          
                    queryData2(myCode);
                    queryData3(myCode);
                    queryData4(myCode); 
                    lunbo(myCode,name);              
                },
                error:function(){
                }
            });
            $('.right-menu').eq(0).show();
            $('.right-menu').eq(1).hide();
        }else{
            $.ajax({
                url:appendInfoToURL('https://weather.xinhong.net/airport/infofromnameicao3icao4?param='+myVal),
                dataType:'json',
                success:function(res){               
                    var data = res.data;
                    var cname = data[0].cname;                                                                                  
                    $('.right-Pane-jichang h2').html(data[0].cname+'('+data[0].ccname+')');
                    $('.right-Pane-jichang>p:eq(0)').html('China/经纬度：'+data[0].lng+' E  ,  '+ data[0].lat+'N');                                                              
                    airport(cname); 
                    lunboTwo(data[0].lat,data[0].lng);                                                                               
                },
                error:function(){
                   
                }
            });  
            $('.right-menu').eq(1).show();
            $('.right-menu').eq(0).hide();
        }   
    }

    // 右侧展示区
    function animate(){
        // var rightPanelW = $('.rightPanel').width();
        // $('.rightPanel').stop().animate({'right':'0'},200);
        // $('.panelDel').stop().animate({'right':''+(rightPanelW - 10)+'px'},200);
        // $('.tuLi,.predictionTime').stop().animate({'right':''+(rightPanelW + 20 )+'px'},200);
        // $('.slibarDiv').stop().animate({'right':''+rightPanelW+'px'},200);

        var rightPanelW = 550;
        // $('.panelDel').stop().animate({'right':''+(rightPanelW - 10)+'px'},200);
        $('.slibarDiv').stop().animate({'right':''+rightPanelW+'px'},200);
    }

    // 机场报文的数据
    // url = 'http://weather1.xinhong.net/airportdata_surf/sigmentdatafromcode?year='
    // param = +arrTwo[i][0]+arrTwo[i][1]+arrTwo[i][2]+arrTwo[i][3]+'&month='+arrTwo[i][4]+arrTwo[i][5]+'&day='+arrTwo[i][6]+arrTwo[i][7]+'&hour='+arrTwo[i][8]+arrTwo[i][9]+'&minute='+arrTwo[i][10]+arrTwo[i][11]+'&code='+arr[i][0]+'&sigmenttype='+arr[i][2]
    function queryData1(url,param){
        $.ajax({
            url:appendInfoToURL(url+param),
            dataType:'json',
            success:function(res){
                var data = res.data;
                var realWD = data.real.WDF;
                var fcstWD = data.fcst[0].fcst.WD;
                $('.right-Pane-jichang .moduleOne p:eq(0) span:eq(1)').html(data.odate);
                $('.right-Pane-jichang .moduleOne p:eq(1) span:eq(1)').html(data.real.VIS/1000+'km');
                $('.right-Pane-jichang .moduleOne p:eq(2) span:eq(1)').html(data.real.NH1);
                $('.right-Pane-jichang .moduleOne p:eq(3) span:eq(1)').html(data.real.TT+'℃');
                $('.right-Pane-jichang .moduleOne p:eq(5) span:eq(1)').replaceWith('<span class="rightNum">'
                +data.real.WS+'m/s <img src="img/sea/1.5.png" class="fengXiang" style="-webkit-transform:rotate(' + realWD + 
                'deg);-o-transform:rotate(' + realWD + 'deg);-ms-transform:rotate(' + realWD + 'deg);-moz-transform:rotate(' + realWD + 'deg);"/></span>');
                
                if(data.fcst[0].TIME_ED != null && data.fcst[0].TIME_BG != null){
                    timeBg.push(data.fcst[0].TIME_BG.split(' '));
                    timeBga.push(timeBg[0][0].split('-'));                                                      
                    timeBgb.push(timeBg[0][1].split(':'));
                    timeEd.push(data.fcst[0].TIME_ED.split(' '));
                    timeEda.push(timeEd[0][0].split('-'));
                    timeEdb.push(timeEd[0][1].split(':'));
                    $('.right-Pane-jichang .moduleTwo p:eq(0) span:eq(1)').html(timeBga[0][2]+'日'+timeBgb[0][0]+'时'+'-'+timeEda[0][2]+'日'+timeEdb[0][0]+'时');
                };       
                
                $('.right-Pane-jichang .moduleTwo p:eq(1) span:eq(1)').html(data.fcst[0].fcst.VIS/1000+'km');
                $('.right-Pane-jichang .moduleTwo p:eq(2) span:eq(1)').html(data.fcst[0].fcst.NH1);
                $('.right-Pane-jichang .moduleTwo p:eq(3) span:eq(1)').html(data.fcst[0].fcst.TT+'℃');
                $('.right-Pane-jichang .moduleTwo p:eq(5) span:eq(1)').replaceWith('<span class="rightNum">'+data.fcst[0].fcst.WS
                +'m/s <img src="img/sea/1.5.png" class="fengXiang" style="display:inline-block;-webkit-transform:rotate(' + fcstWD + 
                'deg);-o-transform:rotate(' + fcstWD + 'deg);-ms-transform:rotate(' + fcstWD + 'deg);-moz-transform:rotate(' + fcstWD + 'deg);"/></span>');
                if(data.FCSTMSGCHN != null){
                    $('.right-Pane-jichang .moduleTwo p:eq(6) span:eq(1)').html(data.fcst[0].FCSTMSGCHN);
                };               
                $('.right-Pane-jichang .moduleTwo .xinXi').html(data.msg);
                $('.right-Pane-jichang .moduleTwo .xinXiTwo').html(data.fcst[0].msg);
            },
            error:function(){
            }
        });
    };

    function airport(cname){
        $.ajax({
            url:appendInfoToURL('http://weather1.xinhong.net/airportdata_surf/sigmentdataindexs'),
            dataType:'json',
            success:function(res){
                var data = res.data;
                var arr = [];
                var arrTwo = [];
                for(var i = 0; i<data.length; i++){
                    arr.push(data[i].split('_'));
                    arrTwo.push(arr[i][1].split(''));
                    if(cname === arr[i][5]){
                        queryData1('http://weather1.xinhong.net/airportdata_surf/sigmentdatafromcode?year=',param = +arrTwo[i][0]+arrTwo[i][1]+arrTwo[i][2]+arrTwo[i][3]+'&month='+arrTwo[i][4]+arrTwo[i][5]+'&day='+arrTwo[i][6]+arrTwo[i][7]+'&hour='+arrTwo[i][8]+arrTwo[i][9]+'&minute='+arrTwo[i][10]+arrTwo[i][11]+'&code='+arr[i][0]+'&sigmenttype='+arr[i][2])
                    }
                };
            },
            error:function(){
            }
        });   
    }

    // 气象站的数据
    function queryData2(myCode){
         $.ajax({
            url:appendInfoToURL('https://weather.xinhong.net/stationdata_surf/datafromcode?code='+myCode),
            dataType:'json',
            success:function(res){          
                $('.right-Pane-qixiang .panelTitle').replaceWith("<h2 class='panelTitle'>"+res.station_cname+"</h2>") ;
                $('.right-Pane-qixiang .title1').replaceWith("<p class='titleDescribe title1'>China/经纬度："+res.lng+" E，"+res.lat+" N</p>");
                $('.right-Pane-qixiang .left .leftIcon').replaceWith('<span class="leftIcon" style="background: url(./img/lineWeather/' + res.data.WTHC + '.png) no-repeat;background-size:68px;"></span>');
                $('.right-Pane-qixiang .right .rightElement:first-child .rightNum').replaceWith('<span class="rightNum">' + res.data.TT + '℃</span>');
                $('.right-Pane-qixiang .right .rightElement:eq(1) .rightNum').replaceWith('<span class="rightNum">' + res.data.VIS/1000 +'km</span>');
                // $('.right-Pane-qixiang .right .rightElement:eq(2) .rightNum').replaceWith('<span class="rightNum">' + res.data.RN +'km</span>');
                $('.right-Pane-qixiang .right .rightElement:eq(3) .rightNum').replaceWith('<span class="rightNum">' + res.data.CN + '%</span>');
                $('.right-Pane-qixiang .right .rightElement:eq(4) .rightNum').replaceWith('<span class="rightNum">' + res.data.PR + 'hPa</span>');
                $('.right-Pane-qixiang .right .rightElement:eq(5) .rightNum').replaceWith('<span class="rightNum">' + res.data.WS + 'm/s<i class="fengXiang"></i></span>');
                var time = res.time;
                $('.right-time-day').html(time.substring(0, 4) + '年' + time.substring(4,6) + '月' + time.substring(6, 8) + '日');
                $('.right-time-hour').html(time.substring(8, 10) + ':00');
            },
            error:function(){
            }
        });
    }

    function queryData3(myCode){
        $.ajax({
            // http://ocean.xinhong.net:7020/cityFC3/pointsfromcode?code=54823&elem=TT,WS,WD,RN,RH,WW&year=2019&month=05&day=28&hour=20&
            // url:'http://weather.xinhong.net/stationdata_surf/seqdatafromcode?code='+myCode+'&elem=TT,WS,RN',
            // url:'https://weather.xinhong.net/stationdata_cityfc/datafromcode?code='+myCode+'&&elem=TT,RH,WW,WS,RN',
            url: appendInfoToURL('http://ocean.xinhong.net:7020/cityFC3/pointsfromcode?code=' + myCode + '&elem=TT,WS,WD,RN,RH,WW'),
            dataType:'json',
            success:function(res){
                var data = res.data;
                $('.list').empty();

                var sh = res.time.slice(8,10);
                var arrTime = [3,6,9,12,15,18,21,24,27,30,33,36,39,42,45,48,54,60,66,72,84,96,108,120,132,144,156,168];
                for(var i = 0; i < arrTime.length; i++){
                    var h = 8 + parseInt(arrTime[i]);
                                     
                    //  起报时间分为早八点和晚八点，
                    if(sh==8){
                        tt = data.TT[arrTime[i]];ww = data.WW[arrTime[i]];rh = data.RH[arrTime[i]];ws = data.WS[arrTime[i]];
                    };
                    if(sh==20){
                         tt = data.TT[arrTime[i+4]];ww = data.WW[arrTime[i+4]];rh = data.RH[arrTime[i+4]];ws = data.WS[arrTime[i+4]];
                    };

                    if(h > 0 && h <= 24){
                        var h = h;   
                        var m = getDay(0).split('-')[0];  
                        var d = getDay(0).split('-')[1]; 
                    }else if(h > 24 && h <= 48 ){
                        var h = h - 24;
                        var m = getDay(1).split('-')[0];  
                        var d = getDay(1).split('-')[1]; 
                    }else if(h > 48 && h <= 72 ){
                        var h = h - 48;
                        var m = getDay(2).split('-')[0];  
                        var d = getDay(2).split('-')[1]; 
                    }else if(h > 72 && h <= 96 ){
                        var h = h - 72;
                        var m = getDay(3).split('-')[0];  
                        var d = getDay(3).split('-')[1]; 
                    }else if(h > 96 && h <= 120 ){
                        var h = h - 96;
                        var m = getDay(4).split('-')[0];  
                        var d = getDay(4).split('-')[1]; 
                    }else if(h > 120 && h <= 144 ){
                        var h = h - 120;
                        var m = getDay(5).split('-')[0];  
                        var d = getDay(5).split('-')[1]; 
                    }else if(h > 144 && h <= 168 ){
                        var h = h - 144;
                        var m = getDay(6).split('-')[0];  
                        var d = getDay(6).split('-')[1]; 
                    }else if(h > 168){
                        var h = h - 168;
                        var m = getDay(7).split('-')[0];  
                        var d = getDay(7).split('-')[1]; 
                    };                

                    // var date = time[i].toString();
                    // var month = date.substring(4,6);
                    // var day = date.substring(6,8);
                    // var hour = date.substring(8,10);
                    $('.list').append("<li></li>");
                    $('.list>li:eq('+i+')').append('<span class="timeSpan">'+m+'月'+d+'日&nbsp;&nbsp;'+toTwo(h)+'：00'+'</span><span class="minIcon" style="background: url(./img/lineWeather/' + ww.toString() + '.png) no-repeat;background-size:34px 34px;">'+ ww + '</span><span class="wenDuSpan">'+tt+'℃</span><span class="fengXiangSpan">'+ws+'m/s</span><span class="jiangShuiSpan"><i class="jiangShuiIcon"></i>'+rh+'</span>');                                
                }
            },
            error:function(){
            }
        });
    }

    function queryData4(myCode){
        $.ajax({
            url: appendInfoToURL('http://weather.xinhong.net/stationdata_high/indexfromcode?code='+myCode),       //强对流指数
            dataType:'json',
            success:function(res){
                var data = res.data;console.log(data)
                if(data){
                    if(data.SSI){
                        $('.right-Pane-qixiang .moduleFour>p:eq(0)>span:eq(1)').html(parseInt(data.SSI*10)/10)
                    };
                    $('.right-Pane-qixiang .moduleFour>p:eq(1)>span:eq(1)').html(parseInt(data.K*10)/10);
                    $('.right-Pane-qixiang .moduleFour>p:eq(2)>span:eq(1)').html(parseInt(data.SW*10)/10);
                    $('.right-Pane-qixiang .moduleFour>p:eq(3)>span:eq(1)').html(parseInt(data.RI8550*10)/10);
                    $('.right-Pane-qixiang .moduleFour>p:eq(4)>span:eq(1)').html(parseInt(data.CI*10)/10);
                    $('.right-Pane-qixiang .moduleFour>p:eq(5)>span:eq(1)').html(parseInt(data.WindShearWS5030*10)/10);
                    $('.right-Pane-qixiang .moduleFour>p:eq(6)>span:eq(1)').html(parseInt(data.WindShearWD5030*10)/10);
                    $('.right-Pane-qixiang .moduleFour>p:eq(7)>span:eq(1)').html(parseInt(data.WindShearWS7030*10)/10);
                    $('.right-Pane-qixiang .moduleFour>p:eq(8)>span:eq(1)').html(parseInt(data.WindShearWD7030*10)/10);
                }
            },
            error:function(){
            }
        })
    }

    function queryTLogP(myCode, name){
        // https://weather.xinhong.net/stationdata_high/tlogpimageurl?key=XXXXXXX&code=54511&cname=北京&month=12&day=25&year=2018&hour=14
        $.ajax({
            url: appendInfoToURL('https://weather.xinhong.net/stationdata_high/tlogpimageurl?code='+myCode + '&name=' + name),       //强对流指数
            dataType:'json',
            success:function(res){
                console.log(res);
                if(res.status_code == 0) {
                    var url = 'https://weather.xinhong.net' + res.data.url;
                    $('#station_tlogp').attr('src',url); 
                } else {
                    $('#station_tlogp').attr('src','img/data/nodata.jpg'); 
                }
            },
            error:function(){
            }
        })
    }

    function getStationCode(lat, lng){
        $.ajax({
            url: appendInfoToURL('http://weather.xinhong.net/station/infofromlatlng?lat=' + lat + '&lng=' + lng),       //强对流指数
            dataType:'json',
            success:function(res){
                if(res.status_code == 0) {
                    queryDataAirport(res.data.stationCode);
                }       
            },
            error:function(){
            }
        })
    }

    function queryDataAirport(myCode){
        $.ajax({
            url: appendInfoToURL('http://weather.xinhong.net/stationdata_high/indexfromcode?code='+myCode),       //强对流指数
            dataType:'json',
            success:function(res){
                var data = res.data;console.log(data)
                if(data){
                    if(data.SSI){
                        $('.right-Pane-jichang .moduleFour>p:eq(0)>span:eq(1)').html(parseInt(data.SSI*10)/10)
                    };
                    $('.right-Pane-jichang .moduleFour>p:eq(1)>span:eq(1)').html(parseInt(data.K*10)/10);
                    $('.right-Pane-jichang .moduleFour>p:eq(2)>span:eq(1)').html(parseInt(data.SW*10)/10);
                    $('.right-Pane-jichang .moduleFour>p:eq(3)>span:eq(1)').html(parseInt(data.RI8550*10)/10);
                    $('.right-Pane-jichang .moduleFour>p:eq(4)>span:eq(1)').html(parseInt(data.CI*10)/10);
                    $('.right-Pane-jichang .moduleFour>p:eq(5)>span:eq(1)').html(parseInt(data.WindShearWS5030*10)/10);
                    $('.right-Pane-jichang .moduleFour>p:eq(6)>span:eq(1)').html(parseInt(data.WindShearWD5030*10)/10);
                    $('.right-Pane-jichang .moduleFour>p:eq(7)>span:eq(1)').html(parseInt(data.WindShearWS7030*10)/10);
                    $('.right-Pane-jichang .moduleFour>p:eq(8)>span:eq(1)').html(parseInt(data.WindShearWD7030*10)/10);
                } else {
                    $('.right-Pane-jichang .moduleFour>p:eq(0)>span:eq(1)').html('')
                    $('.right-Pane-jichang .moduleFour>p:eq(1)>span:eq(1)').html('');
                    $('.right-Pane-jichang .moduleFour>p:eq(2)>span:eq(1)').html('');
                    $('.right-Pane-jichang .moduleFour>p:eq(3)>span:eq(1)').html('');
                    $('.right-Pane-jichang .moduleFour>p:eq(4)>span:eq(1)').html('');
                    $('.right-Pane-jichang .moduleFour>p:eq(5)>span:eq(1)').html('');
                    $('.right-Pane-jichang .moduleFour>p:eq(6)>span:eq(1)').html('');
                    $('.right-Pane-jichang .moduleFour>p:eq(7)>span:eq(1)').html('');
                    $('.right-Pane-jichang .moduleFour>p:eq(8)>span:eq(1)').html('');
                }                
            },
            error:function(){
            }
        })
    }

    // 时间剖面图
    function lunbo(myCode,name){
        $('#hezi').empty();
		$.ajax({
			url: appendInfoToURL('http://weather1.xinhong.net/stationdata_high/timeprofilefromcode?code='+myCode),
			dataType:'json',
			success: function(res){
                
				var data = res.data;
				var gh = ['0100','0200','0300','0400','0500','0700','0850','0925'];
				var dataTime = [];
				for(var key in data) {
					var keyNum = parseInt(key);
					dataTime.push(keyNum);	
					dataTime.sort();
                };
                console.log(res);
                var div = "<div class='station_scroll' style='overflow: auto;width:100%;height:100%'></div>";
                $('#hezi').html(div);
				for(var i = 0; i < dataTime.length; i++){
                    var left = 57*i + 'px';
                    var timeString = dataTime[i].toString();
                    var hour = timeString.slice(8,10)+"时";
                    var month = timeString.slice(4,6) +"/" + timeString.slice(6,8);
                    
					for(var j = 0; j < gh.length; j++){	
                        var arr = [100,200,300,400,500,700,850,925];
                        if(data[dataTime[i]][gh[j]]){					
                            var tt = data[dataTime[i]][gh[j]].TT;
                                tt = Math.round(tt);
                            var rh = data[dataTime[i]][gh[j]].RH;
                            var ws = data[dataTime[i]][gh[j]].WS;
                            var wd = data[dataTime[i]][gh[j]].WD;
                            var top = 57*j + 'px';
                            
                            var html = "<div style ='position:absolute;top:" + top + ";left:" + left
                                        + ";width:37px;height:37px;padding-top:20px;padding-left:20px;color:red;background-color:"
                                        + color(rh) + ";'>"	+ tt + "<img src = 'img/imgs/icon_ws" + toTwo(toT(ws)) 
                                        + "@2x.png' style = 'width:10px;height:15px; -ms-transform:rotate(" + wd + "deg); -moz-transform:rotate(" + wd 
                                        + "deg);-webkit-transform:rotate(" + wd + "deg);-o-transform:rotate(" + wd + "deg);'/></div>";
                            $('.station_scroll').append(html);
                           
                            if(i == 0 && j == 0) {
                                var station = "<h3 style ='position:absolute;top:-20px;left:100px;width:200px;font-size:18px;color:white;font-family:微软雅黑;'>"
                                                 + name + "站点时间剖面图</h3>";
                                $('#hezi').append(station);
                            }

                            if(i == 0) {
                                var hh = "<div style ='padding-top:20px;position:absolute;top:" + top + 
                                        ";left:-35px;color:#868688;font-weight:bold;font-size:14px;'>"
                                        + arr[j] + "</dov>";
                                $('#hezi').append(hh);
                            }

                            
                        };
                    }
                    var time = "<div style ='position:absolute;bottom:-50px;left:" + left + ";color:#868688;font-size:14px;'><p>"			 
                    + hour + "</p><p>" + month + "</p></dov>";
                    $('.station_scroll').append(time);
				}
			},
			error:function(res){
				
			}
		});
	};
    
    //时间剖面图预报
    var num = 0;
    $('#incloudTwo .rightBut').click(function() {
        num+=50;
        if(num > 584){
            num = 584;
        }
        $('#heziTwo .single').stop().animate({'right':''+num+'px'},500);
        $('.wrap .staTime').stop().animate({'right':''+num+'px'},500);
    });
	$('#incloudTwo .leftBut').click(function() {
        num -= 50;
        if(num < 0){
            num = 0;
        }
        $('#heziTwo .single').stop().animate({'right':''+num+'px'},500);
        $('.wrap .staTime').stop().animate({'right':''+num+'px'},500);
    });
	function lunboTwo(lat,lng){
        $('#heziTwo .single').empty();
        $('.wrap .staTime').empty();
        $('#incloudTwo h3').remove();
        $('#incloudTwo p').remove();
        
		$.ajax({
			url: appendInfoToURL('https://weather.xinhong.net/gfs/timeprofiledata?lat=' + lat + '&lng=' + lng),
			dataType:'json',
			success: function(res){
                if(res.data){
                    var data = res.data.profiledatas;
                    var timeString = res.data.times;
                    var ghh = ['0100','0200','0300','0400','0500','0600','0650','0700','0750','0800','0850','0900','0925','0950','0975'];
                    for(var i = 0; i < data.length; i++){
                        for(var j = 0; j < ghh.length; j++){	
                            var arr = [100,200,300,400,500,600,650,700,750,800,850,900,925,950,975];                           
                            if(data[i].GFS == null){continue;};              
                            var tt = data[i].GFS[ghh[j]].TT;
                                tt = Math.round(tt);
                            var rh = data[i].GFS[ghh[j]].RH;
                            var vv = data[i].GFS[ghh[j]].VV;
                            var uu = data[i].GFS[ghh[j]].UU;
                            var ws = Math.sqrt(vv*vv+uu*uu);
                                ws =  Math.round(ws);
                            var top = 30*j ;
                            var left = 41*i;	
                            var leftTime = left+42;	
                            
                            var html = "<div style ='position: relative;position:absolute;top:" + top + "px;left:" + left								
                                        + "px;width:29px;height:22px;padding-top:8px;padding-left:12px;color:red;background-color:"
                                        + color(rh) + ";'>"	+ tt + "<img src = 'img/imgs/icon_ws" + toTwo(toT(ws)) + 					 																
                                        "@2x.png' style = 'position:absolute;top:5px;width:10px;height:15px; -ms-transform:rotate(" + windDeg(uu,vv) + "deg); -moz-transform:rotate(" + windDeg(uu,vv) + 
                                        "deg);-webkit-transform:rotate(" + windDeg(uu,vv) + "deg);-o-transform:rotate(" + windDeg(uu,vv) + "deg);'/></div>";
                            $('#heziTwo .single').append(html);
                            
                            if(j == 0) {
                                var hour = timeString[i].slice(8,10)+"时";
                                var month = timeString[i].slice(4,6) +"/" + timeString[i].slice(6,8);
                                var time = "<div style ='position:absolute;bottom:0;left:" + left + "px;color:#868688;font-size:12px;'><p>"			 
                                        + hour + "</p><p>" + month + "</p></dov>";
                                $('.wrap .staTime').append(time);
                            }

                            if(i == 0) {
                                var topHh = top+30;
                                var hh = "<p style ='padding-top:20px;position:absolute;top:" + topHh + 
                                "px;left:5px;color:#868688;font-weight:bold;font-size:14px;'>"
                                + arr[j] + "</p>";  
                                $('#incloudTwo').append(hh);  
                            }
                        }
                    }
                    var station = "<h3 style ='position:absolute;top:5px;left:120px;width:200px;font-size:18px;color:white;'>未来24小时剖面图</h3>";                                     
                    $('#incloudTwo').append(station); 
                }
			},
			error:function(res){
				
			}
		});
    };
    // 风向角度
    function windDeg(uu,vv){
		if (uu == 0) {
			if (vv == 0){
				wd = 0
			}else {
				if (vv > 0) wd = 360;
				if (vv < 0) wd = 180;
			};			
		}else{
			if (uu > 0)
				wd = 270 - Math.atan(vv / uu) * 180 / Math.PI;
			if (uu < 0)
				wd = 90 - Math.atan(vv / uu) * 180 / Math.PI;
		};
		return wd;
	}
    // 湿度的颜色
	function color(rh){
		if(rh >= 90){  
			return "rgba(55,150,56,1.0)";
		}else if(rh >=80){
			return "rgba(80,162,80,0.9)";
		}else if(rh >=70){
			return "rgba(111,178,111,0.8)";
		}else if(rh >= 60){ 
			return "rgba(162,203,163,0.7)";
		}else if(rh >= 40){ 
			return "rgba(188,222,189,0.6)";
		}else if(rh >= 30){ 
			return "rgba(179,196,180,0.5)";
		}else if(rh >= 20){ 
			return "rgba(153,155,154,0.5)";
		}else if(rh >= 10){ 
			return "rgba(162,166,165,0.5)";
		}else{
			return -1;
		};
						
    };
    // 
	function toT(wsVal){   
		if(wsVal ==0 || wsVal ==1){
			return wsVal = 1;
		};
		if(wsVal >= 72){
			return wsVal = 72;
		};                       
		if(wsVal % 2 ==0){
			return wsVal ;
		}else if(wsVal%2 ==1){
			return wsVal = wsVal + 1 ;
		};                                                                                        
	};
	function toTwo(time){
        return time < 10 ? "0"+time : time;
    };

    // 获取七天预报时间对象
    function getDay(day){        
        var today = new Date();       
        var targetday_milliseconds=today.getTime() + 1000*60*60*24*day;    
        today.setTime(targetday_milliseconds);            
        var tYear = today.getFullYear();     
        var tMonth = today.getMonth();      
        var tDate = today.getDate();      
        tMonth = doHandleMonth(tMonth + 1);   
        tDate = doHandleMonth(tDate);  
        return tMonth+"-"+tDate; 
        }  
    function doHandleMonth(month){      
        var m = month;       
        if(month.toString().length == 1){    
            m = "0" + month;      
        }         
        return m;  
    }

    /**
     * 格式化城市名
     * @param {*} name 
     */
    function cityName(name){
        if(name) return name;
        return '--';
    }

    return{
        queryAirport: showAirport,
        queryStation: showStation,
        viewAnimate: viewAnimate,
    }
});