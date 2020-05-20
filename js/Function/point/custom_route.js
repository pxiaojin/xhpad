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

        $('.airRoute_pop .airRoute_pop_btn').click(function(){
            add();
            $('.airRoute_pop').hide();
            $('.airRoutePar_pop').hide();
        })
        
        $('.airRoutePar_pop .airRoutePar_pop_btn .del').click(function(){
            if(routeid == null) return false;
            $('#alertBox').show();
        })
        //  是否删除确认
        $('#alertSure').click(function(){           
            if(!$('.airRoutePar_pop').is(':hidden')){
                if(routeid != null){
                    remove(routeid);
                    routeid == null;
                    $('#alertBox').hide();
                }else{
                    alert('删除失败')
                }
            }                      
        })

        $('.airRoutePar_pop .airRoutePar_pop_btn .edit').click(function(){
            if(routeid == null) return false;
            $('.airRoute_pop').show();
            $('.airRoutePar_pop').hide();
        })
    }
    
     //  删除
     function remove(id){
        var userid = {
            'id': id,
        }
        $.ajax({
            type: "post",
            contentType: 'application/json; charset=UTF-8',
            url: XHW.C.http.userUrl + "delcustomline",
            data: JSON.stringify(userid),
            dataType: "json",
            success: function (data) {
                $('.airRoutePar_pop').hide();
                //   删除该航线图册
                for(var i = 0; i < layers.length; i++){
                    if(layers[i].id == 'routelayer'+id){
                        XHW.map.removeLayer(layers[i]);
                        layers.remove(layers[i]);
                    }
                }   
                getFocus();
            }
        })
    }
    //  获取用户信息
    function getFocus(addSign){
        // http://ocean.xinhong.net:7011/getfavourite
        // {"uid":"101"}
        var userid = {
            uid: '101'
        }
        $.ajax({
            type: "get",
            contentType: 'application/json; charset=UTF-8',
            url: XHW.C.http.userUrl + "getcustomline",
            data: userid,
            dataType: "json",
            success: function (data) {
                var data = data.data;   
                getHtml(data,addSign);    
            }
        })
    }

    // 添加 或 编辑 航线
    function add(){      
        $('.airRoute_pop input').each(function(){
            if($(this).val() == ''){
                alert('需填写全部信息');
                return false;
            }           
        })

        var lngstr = '';
        var latstr = '';
        var highstr = '';
        $('.airRoute_pop_focus').each(function(index,item){
            var single_lng = $(this).children('.pop_lng').val();
            var single_lat = $(this).children('.pop_lat').val(); 
            var single_high = $(this).children('.pop_height').val(); 
            single_lng = single_lng.replace('E','');
            single_lat = single_lat.replace('N','');
            if(!Number(single_lng) || !Number(single_lat) || !Number(single_high)){
                alert('经纬度高度信息输入错误');
                return false;
            }
            if(-180 <= single_lng && single_lng<= 180 && -90 <= single_lat && single_lat<= 90){
                console.log(single_lng)
            }else{
                alert('经纬度信息输入错误');
                return false;
            }
            lngstr += single_lng + ',';
            latstr += single_lat + ',';
            highstr += single_high + ',';
        });
        lngstr = lngstr.substr(0,lngstr.length-1);
        latstr = latstr .substr(0,latstr.length-1);
        highstr = highstr.substr(0,highstr.length-1);
        var routes_name = $('.airRoute_pop .airRoute_pop_name .airRoute_pop_input').val();
        var routes_startTime = $('.airRoute_pop .airRoute_pop_time1 .airstayear').val() + $('.airRoute_pop .airRoute_pop_time1 .airstahour').val();
        routes_startTime = routes_startTime.replace(/-/g,'').replace(':','');
        var routes_endtTime = $('.airRoute_pop .airRoute_pop_time2 .airstayear').val() + $('.airRoute_pop .airRoute_pop_time2 .airstahour').val();
        routes_endtTime = routes_endtTime.replace(/-/g,'').replace(':','');

        if(routeid == null){
            //  添加航线
            var siteinfo = {
                uid: '101',   // 用户ID
                lat: latstr,
                lng: lngstr,
                high: highstr,
                start: routes_startTime,
                end: routes_endtTime,
                name: routes_name
            };
            $.ajax({
                type: "post",
                contentType: 'application/json; charset=UTF-8',
                url: XHW.C.http.userUrl + "addcustomline",
                data: JSON.stringify(siteinfo),
                dataType: "json",
                success: function (data) {
                    routeid = null;
                    getFocus(siteinfo.lat);
                }
            })
        }else{
            //  编辑航线
            var siteinfo = {
                id: routeid,   //航线ID
                lat: latstr,
                lng: lngstr,
                high: highstr,
                start: routes_startTime,
                end: routes_endtTime,
                name: routes_name
            };
            $.ajax({
                type: "post",
                contentType: 'application/json; charset=UTF-8',
                url: XHW.C.http.userUrl + "updatecustomline",
                data: JSON.stringify(siteinfo),
                dataType: "json",
                success: function (data) {                   
                    getFocus();
                    var classname = 'route'+routeid;
                    if($('.'+classname).hasClass('curr')){
                        $('.'+classname).removeClass('curr');
                        removelayer(routeid);
                        addlayer(siteinfo.name,siteinfo.id,siteinfo.lng,siteinfo.lat,siteinfo.high,siteinfo.start,siteinfo.end);
                        setTimeout(function(){$('.'+classname).addClass('curr');},300)                   
                    }                                     
                    routeid = null;
                }
            })
        } 
    }
    
    // 添加列表
    function getHtml(data,addSign){
        var cusHtml = '';
        var hisHtml = '';
        var myDate = new Date();
        var mydate = myDate.toLocaleDateString();     //获取当前日期
            mydate = mydate.split('/');
            mydate = mydate[0] + toTwo(mydate[1]) + '' + toTwo(mydate[2]);

        var mytime=myDate.toLocaleTimeString();   //获取当前时间
            mytime = mytime.slice('2').split(':');
            mytime = toTwo(mytime[0])+ '' + toTwo(mytime[1]);
        
        var nowtime = mydate + mytime;

        // var mytime = myDate.toLocaleString(); // 获取当前时间与日期

        for(var i = 0; i < data.length; i++){
            var route_data = data[i];
            var routeid = data[i].id;
            var name = route_data.name;
            var end = route_data.end_time; 
            if(parseInt(nowtime) <= parseInt(end)){
                cusHtml += '<p class="route'+routeid+'" >'+
                            '<span style="font-size: 0.22rem;color: white" onclick="showMultipoint('+ JSON.stringify(route_data).replace(/"/g, '&quot;') + ',this)">'+name+'</span>'+
                            '<span style="color: #2d81ec" onclick="editRoute('+ JSON.stringify(route_data).replace(/"/g, '&quot;') + ')">操作</span>'+
                            '</p>';
            }else{
                hisHtml += '<p class="route'+routeid+'">'+
                            '<span style="font-size: 0.22rem;color: white" onclick="showMultipoint('+ JSON.stringify(route_data).replace(/"/g, '&quot;') + ',this)">'+name+'</span>'+
                            '<span style="color: #2d81ec" onclick="editRoute('+ JSON.stringify(route_data).replace(/"/g, '&quot;') + ')">操作</span>'+
                            '</p>';
            }
        }
        $('.airRouteList .custom_list .list_con').html(cusHtml);
        $('.airRouteList .his_route_list .list_con').html(hisHtml);

        for(var i = 0; i < data.length; i++){
            var route_data = data[i];
            var routeid = data[i].id;
            var selfparent = '.airRouteList p.route' + routeid;
            if(addSign && addSign == route_data.lats){
                showMultipoint(route_data, $(selfparent).children('span').eq(0))
            }
        }
        
    } 

    //  显示航线
    showMultipoint = function(route_data,self){
        var name = route_data.name;
        var id = route_data.id;
        var lngAr = route_data.lngs;
        var latgAr = route_data.lats;
        var highAr = route_data.highs;
        var start = route_data.start_time;
        var end = route_data.end_time;
        if($(self).parent().hasClass('curr')){  
            $(self).parent().removeClass('curr');       
            removelayer(id)
        }else{     
            $(self).parent().addClass('curr');
            addlayer(name,id,lngAr,latgAr,highAr,start,end)
        }
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
    function addlayer(name,id,lngAr,latgAr,highAr,start,end){
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
            };
            //-----------step4-------------调整marker的样式
            // var text_content = i == 0 ? '<p>航线:'+name + '</p><p>起飞时间：' + start + '</p><p>' + format.lnglat(lngAr[i],latgAr[i])+'</p></div>' :
            //                         i == lngAr.length -1 ?  '降落时间：' + end + '<br/>' + format.lnglat(lngAr[i],latgAr[i])+'' :
            //                             format.lnglat(lngAr[i],latgAr[i])+'' ;
            // var popup = '<div id="'+ name + i +'" style="background:white;color：black;border:1px solid black;">'+text_content+'</div>';
            // $('body').append(popup);
            // var elem =  document.getElementById(name+ '' + i );
            // //--------创建地图弹窗对象      
            // var overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
            //     element: elem,
            //     autoPan: true,
            //     position: lnglat,     //--------设置弹窗位置  值为marker位置
            //     positioning: 'bottom-left',         //--------默认左下角（设置下方居中无效，依靠样式自己设置）
            //     autoPanAnimation: {
            //         duration: 250   //当Popup超出地图边界时，为了Popup全部可见，地图移动的速度. 单位为毫秒（ms）
            //     }
            // }));         
            // //-------打开弹窗
            // XHW.map.addOverlay(overlay);
            // showPopup([parseFloat(lngAr[i]),parseFloat(latgAr[i])],"route"+ name);
            // var text_content = i == 0 ? '起飞时间：' + start + ';位置：' + format.lnglat(lngAr[i],latgAr[i])+'' :
            //                         i == lngAr.length -1 ?  '降落时间：' + end + ';位置：' + format.lnglat(lngAr[i],latgAr[i])+'' :
            //                             format.lnglat(lngAr[i],latgAr[i])+'' ;
            var text_content = i == 0 ? name : '';
            var circleColor = i == 0 ? 'green' : 'red';
            marker.setStyle(new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 10,
                    stroke: new ol.style.Stroke({
                        color: circleColor                                        
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
            geometry: new ol.geom.LineString(lnglats)
        });
        line.setStyle(new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 5,
                color: 'yellow'
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
        let feature = markers;
        feature.push(line);       

        //-------step8--------删除旧图层，替换新的图层
        // if(!layer || $.inArray(layer, XHW.map.getLayers().getArray()) == -1){
        var layer = new ol.layer.Vector();
        layer.id = 'routelayer' + id;
        layer.setZIndex(15);          
        let source = new ol.source.Vector({
            features: feature
        });
        layer.setSource(source);
        layers.push(layer);
        XHW.map.addLayer(layer);

        XHW.C.mapclick.addCallback(name+id, function(value){
            $('.bottompanel_air').hide();
            profileImg(value,locationNameMap)
        })
    }

    // 显示航线详情  编辑+删除
    editRoute = function(route_data){
        routeid = route_data.id;
        var name = route_data.name;
        var lngAr = route_data.lngs.split(',');
        var latAr = route_data.lats.split(',');
        var highAr = route_data.highs.split(',');
        var start = route_data.start_time;
        var end = route_data.end_time; 
        $('.airRoutePar_pop .airRoutePar_pop_name .pop_name').html(name);
        $('.airRoutePar_pop .airRoutePar_pop_time1 span').eq(1).html(start);
        $('.airRoutePar_pop .airRoutePar_pop_time2 span').eq(1).html(end);
        var html = '';
        var editHtml = '';
        for(let i = 0; i < lngAr.length; i++) {
            html += '<div class="airRoutePar_pop_focus">'+
                        '<span>'+lngAr[i]+'</span>'+
                        '<span>'+latAr[i]+'</span>'+
                        '<span>'+highAr[i]+'</span>'+
                    '</div>';
            
            editHtml +=  '<div class="airRoute_pop_focus">'+
                        '<input type="text" class="pop_lng" value="'+lngAr[i]+'">'+
                        '<input type="text" class="pop_lat" value="'+latAr[i]+'">'+
                        '<input type="text" class="pop_height" value="'+highAr[i]+'">'+
                        '<div class="addSpan" onclick="insertElem(this)"><img src="img/guanzhu_pop/add_min.png" height="23" width="25" alt=""></div>'+
                        '<div class="delSpan" onclick="removeElem(this)"><img src="img/guanzhu_pop/del.png" height="23" width="25" alt=""></div>'+
                    '</div>';
        }
        $('.airRoutePar_pop .airRoutePar_pop_main').html(html);
        $('.airRoutePar_pop').show();
        $('.airRoute_pop_con .airRoute_pop_main').html(editHtml);
        $('.airRoute_pop .airRoute_pop_input').val(name);
    }

    function toTwo(num){
        num = parseInt(num);
        return num >= 10 ? num : '0' + num;
    }

    insertElem = function(self){
        $(self).parent().after('<div class="airRoute_pop_focus">'+
            '<input type="text" class="pop_lng" value="">'+
            '<input type="text" class="pop_lat" value="">'+
            '<input type="text" class="pop_height" value="">'+
            '<div class="addSpan" onclick="insertElem(this)"><img src="img/guanzhu_pop/add_min.png" height="23" width="25" alt=""></div>'+
            '<div class="delSpan" onclick="removeElem(this)"><img src="img/guanzhu_pop/del.png" height="23" width="25" alt=""></div>'+
        '</div>');
    }

    removeElem = function(self){
        $(self).parent().remove();
    }

    //   绘制剖面图
    var startlng,startlat,startime,endlng,endlat,endtime;
    function profileImg(value,locationNameMap){
        multiAviation.queryAviationInfo(value,locationNameMap);

        var lng = value.lng.split(',');
         startlng = lng[0];
         endlng =lng[lng.length-1];
        var lat = value.lat.split(',');
         startlat = lat[0];
         endlat =lat[lat.length-1];
         startime = value.start;
         endtime = value.end;
        $('.botHangKongRight .station_info .start_btn').addClass('curr').siblings().removeClass('curr');
        if( $('.botHangKongRight .station_info .station_title .airportName').length>0) {
            $('.botHangKongRight .station_info .station_title .airportName').remove();
        }
        routeline_info(startlng,startlat,startime);
    }

    $('.botHangKongRight .station_info .start_btn').click(function(event){
        if($('.airRouteList .civilRouteBtn .zidingyi').hasClass('cur2')){
            if( $('.botHangKongRight .station_info .station_title .airportName').length>0) {
                $('.botHangKongRight .station_info .station_title .airportName').remove();
            }
            event.stopPropagation();
            $(this).addClass('curr').siblings().removeClass('curr');
            routeline_info(startlng,startlat,startime);
        }
    })
    $('.botHangKongRight .station_info .end_btn').click(function(event){
        if($('.airRouteList .civilRouteBtn .zidingyi').hasClass('cur2')) {
            if( $('.botHangKongRight .station_info .station_title .airportName').length>0) {
                $('.botHangKongRight .station_info .station_title .airportName').remove();
            }
            event.stopPropagation();
            $(this).addClass('curr').siblings().removeClass('curr');
            routeline_info(endlng, endlat, endtime);
        }
    })
    function routeline_info(lng,lat,time){
        $('.botHangKongRight .air_real h3').html('实况（METAR）');
        $('.botHangKongRight .air_fore h3').html('预报（TAF）');
        //----------------------------地点时间
        $('.botHangKongRight .curposi').html(format.data('经纬度：', format.lnglat(lng, lat)));
        $('.botHangKongRight .airtime').html('起飞时间：' + time);
        var param = {
            lng: lng,
            lat: lat,
            year: time.substr(0,4),
            month: time.substr(4,2),
            day: time.substr(6,2),
            hour: time.substr(8,2)
        }
        let url = XHW.config.datasource == 'ECMF' ? http.ecmfUrl : http.weatherUrl;
        let paramsURL = XHW.config.datasource == 'ECMF' ? '/ecmf' : '/gfs';
        paramsURL += '/pointdata';
        http.get(url, paramsURL, param, function (json) {
            var fcTime = json.time.split('_');
            //----------------------------基础信息
            let sourceType = XHW.config.datasource;
            if (sourceType == 'ecmf' || sourceType == 'ECMF')
                sourceType = 'EC';
                //   获取选中高度层的预报数据
            var info = json.data[sourceType] && json.data[sourceType]['9999'] ? json.data[sourceType]['9999'] : {};
            var u = info.UU;
            var v = info.VV;
            var ws = Math.sqrt(u * u + v * v);
            var wd = 270.0 - Math.atan2(v, u) * 180.0 / Math.PI;
            // var gws = info.GWS.toFixed(1);
            var html = '<p class="content_Element" style="color: white;"><span class="text">起报时间：</span><span class="content">'+fcTime[0]+'</span></p>'+
                        '<p class="content_Element" style="color: white;"><span class="text">时效：</span><span class="content">'+fcTime[1]+'</span></p>'+
                        '<p class="content_Element" style="color: white;"><span class="text">温度：</span><span class="content">'+format.tt(info.TT)+'</span></p>'+
                        '<p class="content_Element" style="color: white;"><span class="text">风：</span><span class="content">'+format.wind(wd, ws)+'</span></p>'+
                        '<p class="content_Element" style="color: white;"><span class="text">能见度：</span><span class="content">'+format.vis(info.VIS)+'</span></p>'+
                        '<p class="content_Element" style="color: white;"><span class="text">6h降水：</span><span class="content">'+format.rn(info.RN)+'</span></p>'+
                        '<p class="content_Element" style="color: white;"><span class="text">总云量：</span><span class="content">'+format.cn(info.CN)+'</span></p>'+
                        '<p class="content_Element" style="color: white;"><span class="text">低云量：</span><span class="content">'+format.cn(info.CNL)+'</span></p>';
            $('.botHangKongRight .air_fore .air_content').html(html);
        }, function () { })

        var html = '<p class="content_Element" style="color: white;"><span class="text">温度：</span><span class="content">--</span></p>'+
                        '<p class="content_Element" style="color: white;"><span class="text">风：</span><span class="content">--</span></p>'+
                        '<p class="content_Element" style="color: white;"><span class="text">能见度：</span><span class="content">--</span></p>'+
                        '<p class="content_Element" style="color: white;"><span class="text">气压：</span><span class="content">--</span></p>'+
                        '<p class="content_Element" style="color: white;"><span class="text">总云量：</span><span class="content">--</span></p>'+
                        '<p class="content_Element" style="color: white;"><span class="text">低云量：</span><span class="content">--</span></p>';
        $('.botHangKongRight .air_real .air_content').html(html);

        var real_url = 'http://weather.xinhong.net/stationdata_surf/datafromlatlng?';
        var real_par = 'lat='+lat+'&lng='+lng+'&hour='+time.substr(8,2);

        http.Http(real_url,real_par,function(json){
            var html = '<p class="content_Element" style="color: white;"><span class="text">温度：</span><span class="content">'+format.tt(json.TT)+'</span></p>'+
                        '<p class="content_Element" style="color: white;"><span class="text">风：</span><span class="content">'+json.WDF + ' ' + json.WS + 'm/s</span></p>'+
                        '<p class="content_Element" style="color: white;"><span class="text">能见度：</span><span class="content">'+format.vis(json.VIS)+'</span></p>'+
                        '<p class="content_Element" style="color: white;"><span class="text">气压：</span><span class="content">'+format.pr(json.PR)+'</span></p>'+
                        '<p class="content_Element" style="color: white;"><span class="text">总云量：</span><span class="content">'+format.cn(json.CN)+'</span></p>'+
                        '<p class="content_Element" style="color: white;"><span class="text">低云量：</span><span class="content">'+format.cn(json.CNML)+'</span></p>';
            $('.botHangKongRight .air_real .air_content').html(html);
        })
    }

    function getIndex(num) {
        var num = Number(num);
        if (num<=300){
            return '1000';
        } else if (num<=500){
            return '0950';
        } else if (num<=700){
            return '0925';
        } else if (num<=900){
            return '0900';
        } else if (num<=1500){
            return '0850';
        } else if (num<=2000){
            return '0800';
        } else if (num<=3000){
            return '0700';
        } else if(num<=5500){
            return '0500';
        }else if (num<=9000){
            return '0300';
        } else if (num<=12000){
            return '0200';
        } else {
            return '0100';
        }
    }

    function removeAllLayer(){
        if(layers.length>0){
            for(var i = 0; i < layers.length; i++){
                XHW.map.removeLayer(layers[i]);
            }   
            layers = [];
        }
    }
   function close(){
        multiAviation.removePopup();
        removeAllLayer();
        $('.airRoute_pop').hide();
        $('.airRoutePar_pop').hide();
        $('.airRouteList').hide();
        $('.airRouteList p').each(function(){
            $(this).removeClass('curr')
        })
   }


    return {
        init:init,
        close:close,
        removeAllLayer:removeAllLayer
    }
});