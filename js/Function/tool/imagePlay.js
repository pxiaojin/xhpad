define([], function(){

    var imgCanvasId;
    var imageCanvas = {};

    function showImg(canvasId, url) {
        imgCanvasId = canvasId;
        if (!imageCanvas.hasOwnProperty(canvasId)) {
            buildImgDiv();
        }
        imgShow(
            '#' + imgCanvasId +'outerdiv',
            '#' + imgCanvasId + 'innerdiv',
            '#' + imgCanvasId + 'bigimg',
            url);
        $('#' + imgCanvasId).show();
    }

    function close(){
        $('#' + imgCanvasId).hide();
    }

    function buildImgDiv() {
        let imgDiv = 'div id="' + imgCanvasId + 'outerdiv" style="position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);z-index:2;width:100%;height:100%;display:none;">'
            + '<div id="' + imgCanvasId + 'innerdiv" style="position:absolute;">'
            + '<img id="' + imgCanvasId + 'bigimg" style="border:5px solid #fff;" src="" />'
            + '</div>'
            + '</div>';
        $('#' + imgCanvasId).append(imgDiv);

        imageCanvas[imgCanvasId] = true;
    }

    function imgShow(outerdiv, innerdiv, bigimg, src){
        $(bigimg).attr("src", src);//设置#bigimg元素的src属性

        /*获取当前点击图片的真实大小，并显示弹出层及大图*/
        $(bigimg).attr("src", src).load(function(){
            var windowW = $(window).width();//获取当前窗口宽度
            var windowH = $(window).height();//获取当前窗口高度
            var realWidth = 1000;//获取图片真实宽度
            var realHeight = 1000;//获取图片真实高度
            var imgWidth, imgHeight;
            var scale = 0.88;//缩放尺寸，当图片真实宽度和高度大于窗口宽度和高度时进行缩放

            if(realHeight>windowH*scale) {//判断图片高度
                imgHeight = windowH*scale;//如大于窗口高度，图片高度进行缩放
                imgWidth = imgHeight/realHeight*realWidth;//等比例缩放宽度
                if(imgWidth>windowW*scale) {//如宽度扔大于窗口宽度
                    imgWidth = windowW*scale;//再对宽度进行缩放
                }
            } else if(realWidth>windowW*scale) {//如图片高度合适，判断图片宽度
                imgWidth = windowW*scale;//如大于窗口宽度，图片宽度进行缩放
                imgHeight = imgWidth/realWidth*realHeight;//等比例缩放高度
            } else {//如果图片真实高度和宽度都符合要求，高宽不变
                imgWidth = realWidth;
                imgHeight = realHeight;
            }
            $(bigimg).css("width",imgWidth);//以最终的宽度对图片缩放

            var w = (windowW-imgWidth)/2;//计算图片与窗口左边距
            var h = (windowH-imgHeight)/2 + 15;//计算图片与窗口上边距
            $(innerdiv).css({"top":h, "left":w});//设置#innerdiv的top和left属性
            $(outerdiv).fadeIn("fast");//淡入显示#outerdiv及.pimg
        });

        $(outerdiv).click(function(){//再次点击淡出消失弹出层
            $(this).fadeOut("fast");
        });
    }

    return {
        close: close,
        showImg: showImg
    }
});