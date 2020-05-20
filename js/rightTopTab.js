// 右上角按钮
 // 模式切换
 $('#moShiQieHuang span').on('touchstart', function(event) {
    $(this).addClass('current').siblings().removeClass('current');
    // var imgSrc = $(this).html().toLowerCase();
    // var bgUrl = 'url(./img/nav/'+imgSrc+'.png)'
    // $('#moShiQieHuang').css('background-image',bgUrl);
});


// 粒子动画
$('#haiLang .liZi').on('touchstart', function(event) {
    $(this).toggleClass('current');
});

// 粒子动画
$('#dotSwitch .dotSwitchSpan').on('touchstart', function(event) {
    $(this).toggleClass('current');
});

// 图层 叠加 覆盖
$('#tuCengDieJia span').on('touchstart', function(event) {
     $(this).addClass('current').siblings().removeClass('current');
 });

 // 地形图 影像图
$('#switchMap span').on('touchstart', function(event) {
    $(this).addClass('current').siblings().removeClass('current');
    // if($(this).html() == '地形图'){
    //     var bgUrl = 'url(./img/nav/dixing.png)';
    //     $('#switchMap').css('background-image',bgUrl);
    // }else{
    //     var bgUrl = 'url(./img/nav/yingxiang.png)';
    //     $('#switchMap').css('background-image',bgUrl);
    // }
    XHW.C.tile.switchMap($(this).html());
});

// 设置弹框
$('#top_setting').on('touchstart', function(event) {
    $('#set_pop').toggle()
})

$('#set_pop div').on('touchstart', function(event) {
    if($(this).hasClass('current')) {
        $(this).removeClass('current')
    } else {
        $(this).addClass('current').siblings().removeClass('current')
    }
})
