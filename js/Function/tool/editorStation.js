define([], function() {
    var choosedatas = {}; //城镇气象站点数据
        choosedatas['choosedata'] = [];
    var selectedStations = {};
        selectedStations['choosedata'] = [];
    var stations;
    selectedStations['callbacks'] = [];

    init();
    function init(){
        getData();
        //         //时间轴变化监听
        // sliderBar.addCallback(function(){
        //     getData();
        // });
    }
    //配置弹出框显示
    $('.header .toolDiv .toolSheZhi').click(function(event) {
        if(!stations || $.isEmptyObject(stations))
            getData();
    });

    function getData(){
        var param = {
            year: XHW.silderTime.year,
            month: XHW.silderTime.month,
            day: XHW.silderTime.day,
            hour: XHW.silderTime.hour
        }
        var myParam = '?';
        for(var key in param) {
            myParam += key + '=' + param[key] + '&';
        };
        var url = 'https://weather.xinhong.net/xhweatherfcsys/stationdata_surf/datafromselectedstationsbylevel';
        $.ajax({
            url: url + myParam,
            dataType:'json',
            success:function(json){
                if(json.status_code != 0) {
                    return;
                }
                choosedatas['time'] = json.time;
                var rawData = json.data;
                stations = {};
                for(var key in rawData) {
                    var keys = key.split('_');
                    stations[keys[0]] = {
                        code: keys[0],
                        name: keys[1],
                        lng: keys[2],
                        lat: keys[3],
                        wth: rawData[key].WTH,
                        cn: rawData[key].CN,
                    }
                };
                updateStationsList();
                // updateSelectedStationsList();
            },
        })
    }

    $('#sea_zhan').on('keyup', function(){
        updateStationsList(); // 搜索功能
    });

    $('.zhanDianTitletop .clearBtn').click(function(){
        $('#sea_zhan').val('');
        updateStationsList();
    })
    //配置项全选
    var tag = true;
    
    $('#allchoose').click(function(){
        choosedatas = [];
        choosedatas['choosedata'] = [];
        if(tag){
            if (stations) {
                for (let code in stations) {
                    if (stations[code]) {
                        stations[code].selected = true;
                        choosedatas['choosedata'].push(stations[code]);
                    }
                }
            }
            tag = false;
        }else{
            if (stations) {
                for (let code in stations) {
                    if (stations[code]) {
                        stations[code].selected = false;
                    }
                }
            }
            tag = true;
        } 
        updateStationsListStatus();
        updateSelectedStationsList();
    })
    

    cur_box = function (obj,code,sname){
        
        if($(obj).children('i').hasClass('current')){
            $(obj).children('i').removeClass('current');
            $('.rista'+code).remove();
            if(stations[code] && stations[code].selected) {
                stations[code].selected = false;
            }
            for (let i = 0; i < choosedatas['choosedata'].length; i++) {
                if (choosedatas['choosedata'][i].code == code){
                    choosedatas['choosedata'].splice(i,1);
                }
            }
        }else{
            var rli = '<p class="rista'+code+'">'+sname+'('+code+')</p>';
            $(obj).children('i').addClass('current');
            $('#rightlistation').append(rli);  
            if(stations[code]) {
                stations[code].selected = true;
                choosedatas['choosedata'].push(stations[code]);   
            }
        }
    }

    function updateSelectedStationsList() {
        $('#rightlistation').empty();
        
        for(let code in stations) {
            let station = stations[code];
            if (station && station.selected) {
                var rli = '<p class="rista'+code+'">'+station.name+'('+code+')</p>';
                $('#rightlistation').append(rli);  
            }
        }
    }


    function updateStationsList() {
        let filterVal = $('#sea_zhan').val();
        let selected_Html = [];
        for(let code in stations) {
            let station = stations[code];
            if (station) {
                let name = "'"+station.name+"'";
                let selected = station.selected;
                if(!filterVal || filterVal == '' || (name.indexOf(filterVal) > -1
                    || code.indexOf(filterVal) > -1)){
                    let html = '<p id="station'+code+'" class="sta'+code+'" onclick="cur_box(this,'+code+','+name+')">'+
                                '<i class="inputStye' + (selected ? ' current':'') + '"><input type="checkbox"/></i>'+
                                '<span for="station'+code+'">'+name+'('+code+')'+'</span>'+                                           
                            '</p>';
                    selected_Html.push(html);
                }
            }
        }
        $('#leftlistation').html(selected_Html);   //  站点编辑左侧列表
    }

    function updateStationsListStatus() {
        for(let code in stations) {
            let station = stations[code];
            if (station) {
                let name = "'"+station.name+"'";
                let selected = station.selected;
                if ($('#station' + code)) {
                    if (selected) {
                        $('#station' + code).children('i').addClass('current')
                    } else {
                        $('#station' + code).children('i').removeClass('current')
                    }
                }
            }
        }
    }
     //配置弹出框无
     $('.zhanDianPeiZhi .PeiZhiPanelBtn').click(function(event) {
         if ($(this).hasClass('del')) {
            cacelOptions();
         } else {
            confirmResult();
         }
         $('#allchoose').removeClass('current');
         tag = true;
        // $('.PeiZhiPanel').stop().fadeOut(200);
    });

    function confirmResult() {
        selectedStations['time'] = choosedatas['time'];
        selectedStations['choosedata'] = [];
        for (let i = 0; i < choosedatas['choosedata'].length; i++) {
            selectedStations['choosedata'].push(choosedatas['choosedata'][i]);
        }
        if (selectedStations['callbacks']) {
            selectedStations['callbacks'].forEach(call => {
                call();
            });
        }
    }

    function cacelOptions() {
        for (let code in stations) {
            if (stations[code]) {
                stations[code].selected = false;
            }
        }

        choosedatas['choosedata'] = [];
        if (selectedStations && selectedStations['choosedata']) {
            for (let i = 0; i < selectedStations['choosedata'].length; i++) {
                choosedatas['choosedata'].push(selectedStations['choosedata'][i]);
                let code = choosedatas['choosedata'][i].code;
                if (code in stations){
                    if (stations && stations[code]) {
                        stations[code].selected = true;
                    }
                }
            }
        }
        updateStationsListStatus();
        updateSelectedStationsList();
    }

    return selectedStations;
});