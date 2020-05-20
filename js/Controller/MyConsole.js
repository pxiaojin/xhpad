//页面提示弹窗,数秒后自动消失
define([], function() {
    var popup = $('#console_log');
    var TIME = 2000;  //弹窗显示时间，默认2秒

    /**
     * 显示消息提示窗
     * @param {*} str    消息内容 
     * @param {*} time   弹窗持续时间
     */
    function showLog(str ,time){
        popup.html(str);
        popup.show();
        time = time ? time : TIME;
        setTimeout(function(){
            popup.hide();
        }, time)
    }

    return {
        showLog: showLog
    }
});