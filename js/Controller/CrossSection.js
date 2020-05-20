//剖面图
define([], function() {
    
    var Img;
    /**
     * 初始化
     */
    function init(){
        var img = new Image();
        img.src = './img/wind/windy.png';
    }
    init();

    /**
     * 绘制剖面图
     * @param {*} data  数据
     * @param {*} id    canvas ID
     * @param {*} type  类型 
     * @param {*} hPas  气压列表
     */
    function drawCrossSection(data, id, type, hPas){
        var canvas = $('#' + id);
        var hPa = ["100", "200", "300", "400", "500", "700", "850", "925"];

        var width = canvas.width();
        var height = canvas.height();

        var lineStartX = 5 + 30;
        var lineEndX = width - 5;
        var startY = 15;
        var endY = height - 40;

        var y = (endY - startY) / hPa.length;
        var imgy = y * 2 / 3;
        var imgx = imgy / 2;
    }

    return {
        drawCrossSection: drawCrossSection
    }
});