define(['Function/tool/playlistWindow',
    'Controller/Http'], function(PlaylistWindow, http){

    var button = 'lightning';
    var isOpen;

    var listId = 'lighting-position-list';
    var realListWindow = new PlaylistWindow(listId);
    $('#' + button).click(function () {
        if (isOpen) {
            close();
            XHW.C.layout.judgeWhetherSelect($('#' + button));
        } else {
            open();
            XHW.C.layout.judgeWhetherSelect($('#' + button));
        }
    });

    function open() {
        isOpen = true;
        requestDataList(function(datas){
            realListWindow.open(
                datas,
                {
                    close: function(){
                        onWindowClose();
                        $('#' + button).parent().removeClass('currenterJiBtn');
                        $('#' + button).parent().parent().removeClass('current2');
                        $('#' + button).prev().attr('src',$('#' + button).prev().attr('mysrcpri'));
                        isOpen = false;
                    },
                    showIndex: function(index){
                        // drawGeoJsonInfo(datas[index].date);
                        drawLightning(datas[index].data);
                    }
                });
        });    
        $('#' + button).parent().addClass('currenterJiBtn');
        $('#' + button).parent().parent().addClass('current2');
        $('#' + button).prev().attr('src',$('#' + button).prev().attr('mysrc'));    
    }

    var lightningDatas;
    function requestDataList(call) {
        $.ajax({
            url: appendInfoToURL(http.ecmfUrl + '/lightning/now'),
            dataType:'json',
            success:function(json){
                lightningDatas = json.data;
                let datas = {};
                if (lightningDatas) {
                    for (let i = 0; i < lightningDatas.length; i++) {
                        let timeStr = lightningDatas[i].time.substring(0,15); // 10分钟一组
                        if (!(timeStr in  datas)) {
                            datas[timeStr] = [];
                        }
                        datas[timeStr].push(lightningDatas[i]);
                    }
                }
                let res = [];
                if (datas) {
                    for (time in datas) {
                        lightningGroup = {};
                        lightningGroup.desc = //dateStr.substring(4, 6) + '月' 
                                time.substring(8, 10) + '日' 
                                + " " + time.substring(11, 13) 
                                + ":" + time.substring(14, 15) + '0'
                                + "~" + time.substring(14, 15) + '9';
                                // + ":" + time.substring(14, 15) + '9';
                        lightningGroup.date = time+'0';
                        lightningGroup.data = datas[time];
                        res.push(lightningGroup);
                    }
                }
                if (call && res) {
                    call(res.reverse());
                }
            },
            error: function(error){
            }
        });
    }

    function searchLightningBy(endDate, minutes) {
        if (!lightningDatas || lightningDatas.length <= 0)
            return;
        let res = [];
        if (!minutes){
            minutes = 6;
        }
        let toTime = endDate ? endDate.getTime() : new Date().getTime();
        let fromTime = toTime - minutes * 60 * 1000;
        for (let i = 0; i < lightningDatas.length; i++) {
            let lightningTime = calcLightningTime(lightningDatas[i].time);
            if (lightningTime && fromTime <= lightningTime && toTime >= lightningTime) {
                res.push(lightningDatas[i]);
            }
        }
        return res;
    }

    function calcLightningTime(dateStr) {
        if (!dateStr) {
            return;
        }
        // 2019-05-14 15:09:09.807
        let dateString = dateStr.substring(0,19);
        dateString = dateString.replace(/-/g,'/');
        return new Date(dateString).getTime();
    }

    function close() {
        realListWindow.close();
        onWindowClose();

        $('#' + button).parent().removeClass('currenterJiBtn');
        $('#' + button).parent().parent().removeClass('current2');
        $('#' + button).prev().attr('src',$('#' + button).prev().attr('mysrcpri'));
        isOpen = false;
    }

    function onWindowClose() {
        if (lightningLayer) {
            XHW.map.removeLayer(lightningLayer);
            lightningLayer = null;
        }
        if (lightningDatas) {
            lightningDatas = null;
        }
    }

    var lightningLayer;

    function drawLightning(lightningDatas) {

        if (!lightningDatas)
            return;
        var resfeatures = buildLightningFeatures(lightningDatas);
        if (!lightningLayer) {
            lightningLayer = new ol.layer.Vector({
                title: '闪电告警',
            });
            XHW.map.addLayer(lightningLayer);
        }
        lightningSource = new ol.source.Vector({
            features: resfeatures,
        });
        lightningLayer.setSource(lightningSource);
    }
    var lightningStyle = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: 'img/lightning.gif',
            scale: 0.1
        })
    });

    function buildLightningFeatures(lightningDatas) {
        var lightningfeatures = [];
        for (let i = 0; i < lightningDatas.length; i++){

            let lightningFeature = new ol.Feature(
                new ol.geom.Point(
                    ol.proj.fromLonLat(
                        [parseFloat(lightningDatas[i].lng), parseFloat(lightningDatas[i].lat)])));
            lightningFeature.setStyle(lightningStyle);
            lightningfeatures.push(lightningFeature);
        }
        return lightningfeatures;
    }

    return {
        open: open,
        close: close
    }
});