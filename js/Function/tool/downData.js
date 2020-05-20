define(['Controller/DataFormat'], function(format) {
    var layer = null;
    var lngOne,lngTwo,latOne,latTwo; // 经纬度起始点
    var elemArr = [] ;   // 要素选中集合
    //下载要素  
    var elemName = {
        "2米温度":"T2",
        // "位势高度":"HH",
        // "湿度":"RH",
        // "温度":"TT",
        // "风场":"",
        "降水":"TR",
        // "云":"",
        // "海温":"",
        // "海流":"",
        "海平面气压":"SLP",
        "海面风":"HY_WIND",
        "海浪":"HY_WAVE",
        // "波高":"",
        // "海区预报":"",
        // "浮标资料":"",
        // "船舶":"",
    }

    
    function initDateDiv() {
        let time = new Date();
        unityDate(time);
        time = curDate.year + '-' + curDate.month + '-' + curDate.day;
        resetDate(time);

        $('#downLoadDateInput').html(time);
    }

    function resetDate(time) {
        laydate.render({
            elem: '#downLoadDateInput',
            value: time,
            showBottom: false,
            done: function(value, date){
                curDate.year = date.year;
                curDate.month = date.month;
                curDate.day = date.date;
                if(curDate.month < 10) curDate.month = '0' + curDate.month;
                if(curDate.day < 10) curDate.day = '0' + curDate.day;
                curDate.hour = '00';
            },
        });
    }

    var curDate;
    function unityDate(date) {
        curDate = {
            year : date.getFullYear(),
            month : date.getMonth() + 1,
            day: date.getDate(),
            hour: '00',
        };
        if(curDate.month < 10) curDate.month = '0' + curDate.month;
        if(curDate.day < 10) curDate.day = '0' + curDate.day;
        if(curDate.hour < 10) curDate.hour = '0' + curDate.hour;
    }
    initDateDiv();
    // 后去选中要素的参数
    checkboxVal = function (This){
        var val = $(This).val();
        if(val==""){
             elemSingle = null;
        }else{               
             elemSingle = {"delta":1,"elemCode":val,"longestVti":72,"selected":true,"vtiStep":6};
        }
        if($(This).is(":checked")){
            $(This).parent().css('background-image','url(./img/layout/icon_checkbox_blue2.png)'); 
            if(elemSingle != null){        
                elemArr.push(elemSingle);
            };
        }else{
            $(This).parent().css('background-image','url(./img/layout/icon_checkbox_blue.png)');
            if(elemSingle){
                elemArr.splice(jQuery.inArray(elemSingle,elemArr),1); 
            }
        }
    }
    for(var key in elemName){
        $('#elem').append('<p><i class="inputStye"><input onclick="checkboxVal(this);" type="checkbox" value="'+elemName[key]+'" /></i><span>'+key+'</span></p>');
        

    }

    // 复选框选种值
    
    var drawSource;
    var rectangleDrawer;
    // 画矩形
    function drawRectangle() {
         //设置maxPoints及geometryFunction
        var maxPoints, geometryFunction;
            maxPoints = 2;
            geometryFunction = function (coordinates, geometry) {
                if (!geometry) {              
                    clearDrawContent();
                    geometry = new ol.geom.Polygon();
                }
                //设置起始点及终止点
                var start = coordinates[0];
                var end = coordinates[1];

                geometry.setCoordinates([
                    [start, [start[0], end[1]], end, [end[0], start[1]], start] 
                ]);
                start = ol.proj.transform( start ,'EPSG:3857' ,'EPSG:4326');
                end = ol.proj.transform( end ,'EPSG:3857' ,'EPSG:4326');
                lngOne = Math.floor(start[0] * 100) / 100 ;
                latTwo = Math.floor(start[1] * 100) / 100 ;
                lngTwo = Math.floor(end[0] * 100) / 100 ;
                latOne = Math.floor(end[1] * 100) / 100 ;
                var slngg = lngOne; 
                var slatt = latOne;
                if(lngOne>=lngTwo){
                    lngOne = lngTwo;
                    lngTwo = slngg;
                }
                if(latOne>=latTwo){
                    latOne = latTwo;
                    latTwo = slatt;
                }
                let latlng1 = format.lnglat(lngOne, latOne).split(' , ');
                let latlng2 = format.lnglat(lngTwo, latTwo).split(' , ');
                $('#downCon .downElemTwo .scope .scolngOne').html(latlng1[1]);
                $('#downCon .downElemTwo .scope .scolngTwo').html(latlng2[1]);
                $('#downCon .downElemTwo .scope .scolatOne').html(latlng1[0]);
                $('#downCon .downElemTwo .scope .scolatTwo').html(latlng2[0]);

                return geometry;
            }; 
            //新建source和layer
            if (!drawSource) {
                drawSource = new ol.source.Vector({
                    wrapX: false,
                });
            }
            if(layer != null ){
                XHW.map.removeLayer(layer);
                layer = null;
            }
            if(rectangleDrawer != null ){
               XHW.map.removeInteraction(rectangleDrawer);
               rectangleDrawer = null;
           }
            layer = new ol.layer.Vector({
                source: drawSource
            });

            //新建绘制长方形interaction
            rectangleDrawer = new ol.interaction.Draw({
                source: drawSource,
                type: "LineString",
                geometryFunction: geometryFunction,
                maxPoints: maxPoints
            });     
            
            
            XHW.map.addLayer(layer);
            XHW.map.addInteraction(rectangleDrawer);  
        }

        function clearDrawContent() {
            if (drawSource && drawSource.clear) {
                drawSource.clear();
            }
        }

        $('#moveBar .drawRect').click(function(){            
            drawRectangle();  
        })
        $('.downloaddata').click(function(){
            if (!elemArr || elemArr.length <= 0) {
                window.alert("请选择需要下载的要素！")
                return;
            }
            // 下载时间
            var time = new Date();
            time = time.getTime();

            var dateTime = new Date(curDate.year, parseInt(curDate.month)-1, curDate.day, curDate.hour);
            dateTime = dateTime.getTime();
            //下载范围 
            var sLng = $('#downCon .downElemTwo .scope .scolngOne').html();
            var eLng = $('#downCon .downElemTwo .scope .scolngTwo').html();
            var sLat = $('#downCon .downElemTwo .scope .scolatOne').html();
            var eLat = $('#downCon .downElemTwo .scope .scolatTwo').html();
            sLng = sLng.split('E')[0];
            eLng = eLng.split('E')[0];
            sLat = sLat.split('N')[0];
            eLat = eLat.split('N')[0];
            var freeArea = {"eLat":eLat,"eLon":eLng,"sLat":sLat,"sLon":sLng};

            var downDataParm =  {
                "queryTime":time,
                "dataTime":dateTime,
                "freeArea":freeArea,
                "itemConditions":elemArr
            };


            // var url = 'http://47.92.115.61:8080/xinhong-data-web/downloadElemServlet';
            var url = 'http://ocean.xinhong.net:81/xinhong-data-web/downloadElemServlet';
            var xhr = new XMLHttpRequest();
            xhr.open('POST',url,true);
            xhr.responseType = 'blob';
            xhr.setRequestHeader("RANGE","bytes=0");
            xhr.send(JSON.stringify(downDataParm));
            xhr.onload = function(){
                if(this.status == 200){
                    var blob = this.response;
                    var fileName = xhr.getResponseHeader('filename');
                    let reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onload = function(e){
                        let a = document.createElement("a");
                        a.download = fileName;
                        a.href = e.target.result;
                        a.click(); 
                    }
                }
            }
        })

        $('#moveBar .dbdel').click(function(){  
            close();
        });

        $('.toolDiv .toolUl .toolXiaZai').click(function(){                              
            $('#moveBar').show();  
            
        });

        function close() {
            if (layer)
                XHW.map.removeLayer(layer); 
            if (rectangleDrawer)
                XHW.map.removeInteraction(rectangleDrawer);             
            $('#moveBar').hide();  
        }


        return {
            close: close
        }
});