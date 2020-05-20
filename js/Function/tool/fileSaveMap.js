define([], function() {
    var time = new Date();  
        time = time.getTime();

    // 保存
    $('.toolDiv .toolUl .save').click(function() {
        XHW.map.once('postcompose', function (event) {
            var canvas = event.context.canvas;
            if (navigator.msSaveBlob) {
                navigator.msSaveBlob(canvas.msToBlob(), 'map'+time+'.png');
            } else {
                canvas.toBlob(function (blob) {
                    saveAs(blob, 'map'+time+'.png');
                });
            }
        });
        XHW.map.renderSync();
    });

    // 打印
    $('.toolDiv .toolUl .print').click(function(){
            window.print()
    })

    $('.toolDiv .toolUl ul li').click(function(){
            $(this).parent().hide();
    })
    
    $('.toolDiv .toolUl .gongJu').click(function(){
            $(this).children(ul).show();
    })
});