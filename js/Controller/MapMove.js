/**
 * 地图移动结束监听
 */
define([], function() {
    var zoom;   //用来记录之前的地图缩放（防止移动地图时也调用
    var zoomCallbacks = [];    //需要在zoom变化时更新数据的回调列表
    var moveCallbacks = [];    //需要在地图拖动时更新数据的回调列表

    function init(){
        XHW.map.on("moveend",function(e){
            var z = XHW.map.getView().getZoom();  //获取当前地图的缩放级别
            if(z != zoom) {
                zoom = z;
                updateZ();
            }
            updataMove();
        });
    }

    init();

    /**
     * 遍历XHW.F，查找是否有层级缩放变化需求
     */
    function updateZ(){
        for(var i in zoomCallbacks) {
            // if(zoomCallbacks[i].updateZ) zoomCallbacks[i].updateZ();
            zoomCallbacks[i] ? zoomCallbacks[i]() : null;
        }
    }

    /**
     * 遍历XHW.F，查找是否有地图拖动变化需求
     */
    function updataMove(){
        for(var i in moveCallbacks) {
            moveCallbacks[i] ? moveCallbacks[i]() : null;
        }
    }

    function addZoomCallback(fc){
        zoomCallbacks.push(fc);
    }

    function addMoveCallback(fc){
        moveCallbacks.push(fc);
    }
    
    return {
        init: init,
        addZoomCallback: addZoomCallback,
        addMoveCallback: addMoveCallback,
    }
});