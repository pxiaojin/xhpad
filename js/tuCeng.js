// 默认显示
// $('.erjiMenu .title').on('click', 'li', function (e) {

    // window.setTimeout(() => {
        // var layers = XHW.map.getLayers()
        // var index = $(this).index()
        // var tuCeng = $(this).parent().siblings('.tuCeng').find('.tuCeng_ul').eq(index)[0]
        // if (tuCeng) {
        //     tuCeng = tuCeng.getElementsByTagName('li');
        //     for (var i = 0; i < tuCeng.length; i++) {
        //         if (tuCeng[i].getAttribute('class')) {
        //             layers.forEach((layer) => {
        //                 if (layer.id == tuCeng[i].getAttribute('class')) {
        //                     var toggle = tuCeng[i].getElementsByClassName('eye')
                            
        //                     // toggle = toggle[0].classList[1] == 'current'
        //                     // layer.setVisible(toggle)
        //                     if(toggle && toggle.hasClass('current')){
        //                         layer.setVisible(true)
        //                     }
        //                 }else{
        //                     if(layer.id && $('#sea_mixedGraph').hasClass('active'))layer.setVisible(false)
        //                 }
        //             })
        //         }

        //     }
        // }

        // var tuCeng = $(this).parent().siblings('.tuCeng').children('.tuCeng_ul').eq(index).children('li');
        // if (tuCeng) {
        //     tuCeng.each(function(ind){
        //         layers.forEach((layer) => {
        //             if($(this).attr('class') == layer.id && $(this).children('span').hasClass('current')) {                    
        //                 layer.setVisible(true)
        //             }
        //             if(layer.id != undefined && $('#sea_mixedGraph').hasClass('active') && $(this).attr('class') != layer.id && !$(this).children('span').hasClass('current')){console.log(layer.id)
        //                 layer.setVisible(false)
        //             }
        //             // console.log(layer.id == undefined)
        //         })
        //     })        
        // }
    // }, 1000)
// })

// 小眼睛控制图层
// $('#WSS').show();
// $('.tuCeng_ul').on('click', '.eye', function (e) {
//     var layers = XHW.map.getLayers();
//     var keyValue = $(this).attr('key');
//     if ($(this).parent().attr('class')) {
//         layers.forEach((layer) => {
//             if (layer.id == $(this).parent().attr('class')) {
//                 // var state = layer.getVisible()
//                 if ($(this).hasClass('current')) {                  
//                     // 眼睛打开
//                     layer.setVisible(true);                 
//                     $('#showTuLi #' + keyValue).show();
//                 } else {
//                     layer.setVisible(false); 
//                     $('#showTuLi #' + keyValue).hide();
//                 }

//             }
//         })
//     }

//     if ($(this).hasClass('current')) {
//         $(this).parent().css('background','#074689');
//     } else {
//         $(this).parent().css('background','none');
//     }
// })