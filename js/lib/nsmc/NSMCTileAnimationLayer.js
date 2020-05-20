var TIME_INTERVAL_SLOW = 1000;
var TIME_INTERVAL_MID = 200;
var TIME_INTERVAL_FAST = 100;

var mapWaitAfterLoading=TIME_INTERVAL_MID;//动画默认间隔时间，等于“中”速度时间

var waitPageUpLoading=TIME_INTERVAL_SLOW;//’后退‘按钮等待瓦片加载时间，太短则加载容易失败

var fy4SourceCache;

ol.FY4AnimationController = function() {
    this.fy4SourceCache = {};
};

ol.FY4AnimationController.AnimationLayerType = {
    TILE: 'tile',
    IMAGE:'image'
};//自定义的地图渲染类型

var dataTimeList;
var animationLayerType;

var animationLayer;
var layerTileItem;

var timeIndex;
var paraTile;
/**
* APIMethod: addAnimationLayers
* 添加动画图层.
*/
var _animation=null;
ol.FY4AnimationController.prototype.updateCloudList = function(paraTile) {
    if (!paraTile || !paraTile.timeList || paraTile.timeList.length <= 0){
        return;
    }
    this.paraTile = paraTile;

    this.dataTimeList = paraTile.timeList;        
    
    this.animationLayerType = paraTile.layerType;

    this.timeIndex = 0;

    this.updateListView();
}

ol.FY4AnimationController.prototype.close = function() {
    
    this.StopAnimation();
    
    if (this.animationLayer) {
        XHW.map.removeLayer(this.animationLayer);
        this.animationLayer = null;
    }
    XHW.C.layerC.removeLayer('FY4-Animation');
    layerTileItem = null;
    
    this.paraTile = null;
    this.dataTimeList = null;        
    this.animationLayerType = null;

    this.timeIndex = 0;
    if (this.fy4SourceCache && this.fy4SourceCache.clear)
        this.fy4SourceCache.clear();

    TIME_WAITING_LIMIT = TIME_INTERVAL_SLOW;
    
    $('#cloud_list_play').css('background', 'url(img/layout/play.png) no-repeat');
    $('#cloud_source_list').hide();
}

/**
 * 预先实现，以便后期优化速度（如自动更新列表、切换通道等）
 * @param {string} s String.
 * @return {ol.Color} Color.
 */
function fromCache(cache, maxCacheSize, key, vauleBuildFunction) {
    let MAX_CACHE_SIZE = maxCacheSize;
    if (!cache) {
        cache = {};
    }
    var cacheSize = Object.getOwnPropertyNames(cache).length;

    return (
    /**
     * @param {string} s String.
     * @return {ol.Color} Color.
     */
    function(s) {
        var value;
        if (cache.hasOwnProperty(s)) {
            value = cache[s];
        } else {
            if (cacheSize >= MAX_CACHE_SIZE) {
                var i = 0;
                var tempKey;
                for (tempKey in cache) {
                    if ((i++ & 3) === 0) {
                        delete cache[tempKey];
                    }
                }
            }
            if (vauleBuildFunction) {
                value = vauleBuildFunction();
            }
            cache[s] = value;
        }
        return value;
    })(key);

}

ol.FY4AnimationController.prototype.updateListView = function() {
    
    //----------------step1 清空列表
    var menuContent = $('#cloud_source_list .bottomF');
    menuContent.empty();
    //----------------step1.5 反序
    // data.reverse();
    //----------------step2 遍历数据
    for(var i = this.dataTimeList.length-1; i >= 0; i--) {
        //------------------step3 填充列表
        var time = this.buildBJTViewDateStr(this.dataTimeList[i]);
        var html = 	'<p class="swiper-slide"><span>' + time + '</span></p>';
        menuContent.append(html);
    }
    let animation = this;
    //----------------step4 添加点击事件
    menuContent.children().click(function(){
        var index = $(this).index();
        animation.showIndex(animation.dataTimeList.length - 1 - index);//列表倒着看
    });
    this.showIndex(this.dataTimeList.length - 1);
    // this.StartAnimation();
    $('#cloud_source_list').show();
}

ol.FY4AnimationController.prototype.buildBJTViewDateStr = function (timeStr) {
    var time = timeStr;
    var date = new Date(time.substring(0, 4), parseInt(time.substring(4, 6)) -1,
        time.substring(6, 8), time.substring(8, 10), time.substring(10,12));
    //世界时转北京时加8小时
    var date1 = new Date(date.getTime() + 8 * 60 * 60 * 1000);
    // (date1.getMonth() + 1) + '月' + date1.getDate() + '日 ' +
    time = (date1.getHours() < 10 ? '0' + date1.getHours() : date1.getHours())
            + ':' +
            (date1.getMinutes() < 10 ? '0' + date1.getMinutes() : date1.getMinutes());
    return time;
}

ol.FY4AnimationController.prototype.troggleAnimation = function(index){

    if(!animationOn) {
        this.StartAnimation();
		$('#cloud_list_play').css('background', 'url(img/layout/stop.png) no-repeat');
    } else {
        this.StopAnimation();
        $('#cloud_list_play').css('background', 'url(img/layout/play.png) no-repeat');
    }
}

ol.FY4AnimationController.prototype.showIndex = function(index){
    // $('#cloud_source_list .bottomF').children().eq(this.dataTimeList.length - 1 - index).addClass('current').siblings().removeClass('current');
    $('#' + fy4CurTimeHtmlId + ' span').text($('#cloud_source_list .bottomF').children().eq(this.dataTimeList.length - 1 - index).text());
    
    let liIndex = this.dataTimeList.length - 1 - index;
    if ((this.dataTimeList.length - 2 - liIndex)%6 == 0) {
        let top = 0;
        if (liIndex > 5) {
            top =  $('#cloud_source_list .bottomF').children().eq(liIndex-6/2).position().top;
        }
        top = top - 60 <= 0 ? top : top - 60;
        $('#cloud_source_list .contenty').mCustomScrollbar('scrollTo', top, { scrollInertia:500 });
    }
    $('#cloud_source_list .bottomF').children().eq(liIndex).addClass('current').siblings().removeClass('current');
    
    this.UpdateLayerByTimeStr(this.dataTimeList[index]);// 数据顺序与列表顺序相反
    var html = $('#cloud_source_list .bottomF p:eq('+liIndex+') span').html();
    $('#show-time').html('<p class="current"><span style="font-size: 28px;">'+html+'</span></p>');
}

/**
 * 移除动画图层
 * 
 * 
 */
ol.FY4AnimationController.prototype.removeAnimationLayers=function(){
    
}

/**
* APIMethod: createAnimationLayer
* 创建动画图层（）.
*/
ol.FY4AnimationController.prototype.createAnimationLayer = function (timestr) {
    
    let source = this.createAnimationSource(timestr)
    var wmslayer = null;
    if (this.paraTile.layerType == "tile") {
        
        var extent = ol.proj.transformExtent([62.2, 3.3, 137, 54], 'EPSG:4326', 'EPSG:3857');
        let minResolution = XHW.map.getView().getResolutionForZoom(this.paraTile.minlevel);
        let maxResolution = XHW.map.getView().getResolutionForZoom(this.paraTile.maxlevel);
        wmslayer = new ol.layer.Tile({
            source: source,
            extent: extent,
            minResolution: maxResolution,
            // maxResolution: maxResolution,
        });
        wmslayer.id='FY4-Animation';
    }
    else {
        wmslayer = new ol.layer.Image({
            source: source
        });
        wmslayer.id='FY4-Animation';
    }
    return wmslayer;
}
var maxCacheSize = 1024;
/**
* APIMethod: createAnimationLayer
* 创建动画图层（）.
*/
ol.FY4AnimationController.prototype.createAnimationSource = function (timestr) {
    
    var d = timestr.substr(0, 8);
    var t = timestr.substr(8, 4);
    var e = "";
    if (timestr.length > 15) {
        t = timestr.substr(8, 6);
        e = timestr.substr(15, 6);
    }
    var url = this.paraTile.serviceUrl + "&DATE=" + d + "&TIME=" + t + "&" + "&ENDTIME=" + e + "&";
    
    var imageSize=256;
    if(this.paraTile.serviceUrl.indexOf("512")>=0){
        imageSize=512;
    }
    
    var this_ = this;
    var cache = this.fy4SourceCache;
    var source = fromCache(cache, maxCacheSize, url, function(){
        var source = null;
        if (this_.paraTile.layerType == "tile") {
            var tileGrid = ol.tilegrid.createForProjection('EPSG:4326', undefined, imageSize, undefined);
            source = new ol.source.TileWMS({
                cacheSize: 2048,
                crossOrigin: 'anonymous',  
                attributions:'nsmc',
                wrapX: true,
                url: url,
                params: { 'LAYERS': 'satellite','FORMAT':'image/jpeg',  'NOTILE':'BLACK', 'TILED': true, 'VERSION': '1.1.1' },//注意： 'VERSION'默认为1.3.0，对应的BBOX中经纬度顺序相反
                projection:'EPSG:4326',
                tileGrid: tileGrid
            });
        }
        else {
            source = new ol.source.ImageStatic({
                crossOrigin: 'anonymous',  
                url: url,
                imageExtent: this_.paraTile.imageExtent
            })
        }
        return source;
    });
    
    return source;
}

var fy4CurTimeHtmlId = 'fy4AnimationCurTime'
var fy4CurTimeHtml = '<div id="fy4AnimationCurTime" class="bottom current"><p><span style="font-size: 28px;">--月--日 --:--</span></p></div>'

var animationOn;
/**
* APIMethod: StartAnimation
* 开始播放动画.
*/
ol.FY4AnimationController.prototype.StartAnimation = function () {
    this.StopAnimation();
    if(animationOn){
        return;
    }
    
    // $('#cloud_source_list .contenty').hide();
    // $('#cloud_source_list').append(fy4CurTimeHtml);

    animationOn = true;//开启动画

    var animation = this;
    timeCode = setInterval(function(){
        animation.LoadNextTimeImage();
    }, TIME_WAITING_LIMIT);
    $('#show-time').show();
}

var timeCode;	//播放动画
var TIME_WAITING = 0;
var TIME_WAITING_LIMIT = TIME_INTERVAL_SLOW;

/**
 * APIMethod: StopAnimation
 * 停止动画.
 */
ol.FY4AnimationController.prototype.StopAnimation = function () {
    animationOn = false;
    // $('#' + fy4CurTimeHtmlId).remove();
    // $('#cloud_source_list .contenty').show();
    // $('#cloud_source_list .contenty').mCustomScrollbar('scrollTo', $('#cloud_source_list .bottomF .current'), {
    //     scrollInertia:0
    // });
    if(timeCode) {
        clearInterval(timeCode);
        timeCode = null;
    }
    $('#show-time').hide();
}

/**
* Method: LoadNextTimeImage
* 加载下一时次.
*/
ol.FY4AnimationController.prototype.LoadNextTimeImage = function () {
    if (loading) // 正在加载时
        return
    this.timeIndex = this.IncreaseIndex(this.timeIndex);
    var nextTimeIndex = this.timeIndex;
    if (nextTimeIndex >= this.dataTimeList.length) {
//        nextTimeIndex -= this.dataTimeList.length;
        nextTimeIndex = nextTimeIndex % this.dataTimeList.length;
//        nextTimeIndex =0;
    }
    
    this.showIndex(nextTimeIndex)
}

/**
 * Method: LoadPreviousTimeImage
 * 加载上一时次.(目前不可用于倒序的动画播放)
 * type类型决定显示上一时次 还是最后一时次    为1显示最新（最后）时次  为0显示上一时次
 */
ol.FY4AnimationController.prototype.LoadPreviousTimeImage=function (type) {
    if(type==0){
        // 显示上一时次
        var previousTimeIndex = this.timeIndex - 1;
        if (previousTimeIndex < 0) {
            previousTimeIndex = this.dataTimeList.length - 1;
        }
        var timestr = this.dataTimeList[previousTimeIndex];
        this.UpdateLayerByTimeStr(timestr);//更新动画层最下层
        this.timeIndex = previousTimeIndex;
    }else  if(type==1){
        // 显示最后一时次
        var previousTimeIndex = this.dataTimeList.length - 1;
        var timestr = this.dataTimeList[previousTimeIndex];
        this.UpdateLayerByTimeStr(timestr);//更新动画层最下层
        this.timeIndex = this.dataTimeList.length - 1;
    }else if(type==2){
        //更新当前时次
        var timestr = this.dataTimeList[this.timeIndex];
        this.UpdateLayerByTimeStr(timestr);//更新动画层最下层
    }else if(type==21){
        //更新当前时次的下一时次
        var nextTimeIndex = this.timeIndex + 1;
        if (nextTimeIndex >= this.dataTimeList.length) {
            nextTimeIndex = 0;
        }
        var timestr1 = this.dataTimeList[nextTimeIndex];
        this.UpdateLayerByTimeStr(timestr1);//更新动画层中间层
        
        
        //更新当前时次的下两次
        var nextNextTimeIndex=nextTimeIndex+1;
        if (nextNextTimeIndex >= this.dataTimeList.length) {
            nextNextTimeIndex = 0;
        }
        var timestr2 = this.dataTimeList[nextNextTimeIndex];
        this.UpdateLayerByTimeStr(timestr2);//更新动画层中间层
    }

}

/**
 * 根据定位索引   需要考虑  暂时先这样
 */
ol.FY4AnimationController.prototype.PositioningIndex = function (index) {
    var nextTimeIndex = index;
    if (nextTimeIndex >= this.dataTimeList.length) {
        nextTimeIndex = nextTimeIndex % this.dataTimeList.length;
//        nextTimeIndex =0;
    }
    return nextTimeIndex;
}

ol.FY4AnimationController.prototype.latestPageAction=function (animation) {
    this.UpdateLayerByTimeStr(this.dataTimeList[dataTimeList.length - 1]);
}

/**
* Method: IncreaseIndex
* 循环移动时次索引号.
*/
ol.FY4AnimationController.prototype.IncreaseIndex = function (index) {
    index++;
    if (index >= this.dataTimeList.length) {
        index = 0;
        if (TIME_WAITING_LIMIT == TIME_INTERVAL_SLOW) {
            clearInterval(timeCode);
            var animation = this;
            TIME_WAITING_LIMIT = TIME_INTERVAL_MID;
            timeCode = setInterval(function(){
                animation.LoadNextTimeImage();
            }, TIME_WAITING_LIMIT);
        }
    }
    return index;
}
/**
* APIMethod: GetCurrentTimeStr
* 获取当前时次.
*/
ol.FY4AnimationController.prototype.GetCurrentTimeStr = function () {
    return this.dataTimeList[this.timeIndex];
}

function getQueryString(url, name) {
var query = url.split("?")[1];
var queryArr = query.split("&");
var str = "";
queryArr.forEach(function(item){
    var obj = {};
    var value = item.split("=")[1];
    var key = item.split("=")[0];
    if (key == name) {
        str = value;
        return;
    }
});
return str;
}

/**
* Method: UpdateLayerByTimeStr
* 根据时间字符串更新指定图层.
*/
ol.FY4AnimationController.prototype.UpdateLayerByTimeStr = function (timestr) {
    if (!this.animationLayer) {
        this.animationLayer = this.createAnimationLayer(timestr); 
        XHW.map.addLayer(this.animationLayer);
        this.addAnimationLayerEvent(this.animationLayer);
    } else {
        let source = this.createAnimationSource(timestr);
        this.animationLayer.setSource(source);
        // //	console.log(timestr)
        //     if("undefined".indexOf(timestr)>=0){
        //         console.log(111)
        //     }
        //     var d = timestr.substr(0, 8);
        //     var t = timestr.substr(8, 4);
        //     var e = "";
        //     if (timestr.length > 15) {
        //         t = timestr.substr(8, 6);
        //         e = timestr.substr(15, 6);
        //     }
        //     //var url = serviceUrl + "&DATE=" + d + "&TIME=" + t + "&" + "&ENDTIME=" + e + "&";
            
        //     if (this.animationLayer != null) {
        //         var src = this.animationLayer.getSource();
        //         if (this.animationLayerType == 'image') {//单幅图层
        // //        	 console.log(layer.getSource().image_.src_)
        //             var url = src.image_.src_;
        //             var strTIME = getQueryString(url, "TIME");
        //             var strENDTIME = getQueryString(url, "ENDTIME");
        //             var strDATE = getQueryString(url, "DATE");
        // //            if (strTIME != t || strENDTIME != e || strDATE != d ) {
        
        //                 url = url.replace(/TIME=(.*?)\&/ig, "TIME=" + t + "&");//替换时次
        //                 url = url.replace(/ENDTIME=(.*?)\&/ig, "ENDTIME=" + e + "&");//替换日期
        //                 url = url.replace(/DATE=(.*?)\&/ig, "DATE=" + d + "&");//替换日期
        //                 src.image_.src_ = url;
        //                 //console.log(src.image_.state+"   00")
        //                 src.image_.state = ol.ImageState.IDLE;//修改图片状态为未加载，即会自动加载新图片LOADING  IDLE
        //             // console.log(src.image_.state+"   11")
        //                 src.image_.load();
        //         //                console.log(layer.getSource().image_.src_)
        // //            }
        // //            src.image_.load();
        //         }
        //         else {//瓦片图层
        //             var urls = src.getUrls();
        //             var strTIME = getQueryString(urls[0], "TIME");
        //             var strDATE = getQueryString(urls[0], "DATE");
        //         // if (strTIME != t || strDATE != d ) {
        //                 urls[0] = urls[0].replace(/TIME=(.*?)\&/ig, "TIME=" + t + "&");//替换时次
        //                 urls[0] = urls[0].replace(/DATE=(.*?)\&/ig, "DATE=" + d + "&");//替换日期
                        
        //                 src.setUrls(urls);
        //         }  
        //     }
    }
    if (!layerTileItem) {
        layerTileItem = XHW.C.layerC.createItem('', '', function(){	//云图目前没有图例
            closeFY4CloudFunc();
        })
        var b = XHW.C.layerC.addLayer('FY4-Animation', layerTileItem);
        if (!b) closeFY4CloudFunc();
    }
    var time = this.buildBJTViewDateStr(timestr);
    layerTileItem.htmlLayer = time + ' ' + this.paraTile.area + this.paraTile.imageName;
    
    XHW.C.layerC.updateLayerData('FY4-Animation', layerTileItem);
    
    XHW.map.render();
}

/**
* Method: AddAnimationLayerEvent
* 添加动画图层事件.
*/
ol.FY4AnimationController.prototype.addAnimationLayerEvent = function (layer) {
    //layer.events.register("loadstart", layer, this.OnLayerLoadStart);
    //layer.events.register("loadend", layer, this.OnLayerLoadEnd);

    // layer.on('change:source', this.OnLayerLoadStart);
    
    // layer.on('postcompose', this.OnLayerLoadEnd);

    // var source = layer.getSource();
    // var map = XHW.map;
    // source.map = map;
    // source.on('tileloadstart', this.OnLayerLoadStart);
    // source.on('tileloadend', this.OnLayerLoadEnd);
    // source.on('tileloaderror', this.OnLayerLoadEnd);


}

var loading;
/**
* Method: OnLayerLoadStart
* 图层加载开始事件.
*/
ol.FY4AnimationController.prototype.OnLayerLoadStart = function (e) {  
    //this.map.loadingTileCount++;
    loading = true;
    console.info(e);
}
/**
 * Method: OnLayerLoadEnd
 * 图层加载结束事件.
 */
ol.FY4AnimationController.prototype.OnLayerLoadEnd = function (e) {
    //this.map.loadingTileCount--;
    loading = false;
    console.info('OnLayerLoadEnd');
}