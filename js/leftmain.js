// 刷新默认显示地面图层

// 弹框关闭按钮
// $('.del').on('touchstart', function (e) {
//     $(this).parent().hide()
// })

// 一级菜单点击
$('.leftMain').on('touchstart', '.mainBtn', function (e) {
    $(this).addClass('active').siblings().removeClass('active')

    if (!$(this).siblings().children('.title').hasClass('isShow')) {
        // 根据isShow判断是否第一次点击
        $(this).siblings().children('.title').css('display', 'block')
        $(this).siblings().children('.title').addClass('isShow')
        $(this).addClass('active').siblings().show()
    } else {
        // 根据一级点击控制二级的显示与隐藏
        $(this).siblings().children('.title').toggle()
        $(this).toggleClass('active').siblings().show()
        $(this).siblings().children('.title').removeClass('isShow')
    }
    // 加上isShow 清除其他元素的isShow
    $(this).siblings().children('.title').addClass('isShow')
    $(this).parent().siblings().find('.title').removeClass('isShow')

    $(this).parent().siblings().find('.mainBtn').removeClass('active')
    $(this).parent().siblings().find('.erjiMenu').hide()

    // 没有二级菜单情况
    if (!$(this).siblings('.title')[0]) {
        $(this).siblings('.erjiMenu').css('border', 'none')
    }

    // 二级默认显示
    if ($(this).siblings('.erjiMenu').find('.active').html() == '地面' || '海面') {
        var index = $(this).siblings('.erjiMenu').find('.active').index()
        $(this).siblings('.erjiMenu').find('.tuCeng_ul').eq(index).show().siblings().hide()
    }

    //  改变图片样式   
    if($(this).hasClass('active')){
        $(this).children('.img1').hide();
        $(this).children('.img2').show();
        $(this).parent().siblings().find('.mainBtn').children('.img1').show();
        $(this).parent().siblings().find('.mainBtn').children('.img2').hide();
    }

    //  顶部显示图层名称
    // $('#top_elem .cur_e_elem').html($(this).children('p').html());
})
// 二级菜单点击
$('.erjiMenu .title').on('touchstart', 'li', function (e) {
    $(this).addClass('active').siblings().removeClass('active')
    var index = $(this).index()
    $(this).parent().siblings('.tuCeng').children().eq(index).show().siblings().hide()
})
//  天气态势和海洋高度层地面图片URL改变事件
$('#sea_mixedGraph_level li').click(function(){
    if($(this).attr('data-value') == '9999'){
        $('#surface').attr('src', 'img/nav/cengci2.png')
    }else{
        $('#surface').attr('src', 'img/nav/cengci3.png')
    }
})
$('#real_mixedGraph_level li').click(function(){
    if($(this).attr('data-value') == '9999'){
        $('#dimian').attr('src', 'img/nav/cengci.png')
    }else{
        $('#dimian').attr('src', 'img/nav/cengci1.png')
    }
})


// 热带气旋台风
$('#typhoon_button').on('touchstart', function (e) {
    $('.taiFeng1').show()
    $('.taiFeng1 .inputstye').removeClass('current')
})
$('.taiFeng1 .del').on('touchstart', function (e) {
    $('.taiFeng1 .inputstye').removeClass('current')
    $('.taiFeng2').hide()
})
$('.taiFeng2 .taiFengDel').on('touchstart', function (e) {
    $('.taiFeng2').hide()
    $('.taiFeng1 .inputStye').removeClass('current')
})
$('.taiFeng1 .inputStye').on('touchstart', function (e) {
    $(this).toggleClass('current')
    $('.taiFeng2').toggle()
})
// 雷达
$('#radar').on('touchstart', function (e) {
    $('#radar_data_list').show()
})
$('#radar_data_list .del').click(function (e) {
    $(this).parent().hide()
})

// 云图
$('#cloud').on('touchstart', function (e) {
    $('#cloud_source_list').show()
})

// 图层点击
$('.eye').on('touchstart', function (e) {
    if ($(this).hasClass('current')) {
        $(this).removeClass('current')
    } else
        $(this).addClass('current')
})

// 图例点击
// $('.tuli').on('touchstart', function (e) {
//     // 判断图层是否打开
//     if(!$(this).siblings('.eye').hasClass('current')) {
//         return
//     }
//     if ($(this).hasClass('current')) {
//         $(this).removeClass('current')
//         $('.tuLi').hide()
//     } else {
//         $(this).addClass('current').parent().siblings().children('.tuli').removeClass('current')
//         var keyValue = $(this).attr('key');
//         $('.tuLi').show()
//         $('#showTuLi #' + keyValue).show().siblings().hide();
//     }
// })

//  扇形功能
var toggle = $('#ss_toggle');
var menu = $('.erjiMenu .title');
var rot;
// $('#ss_toggle').on('click', function (ev) {
//     rot = parseInt($(this).data('rot')) ;
//     menu.css('transform', 'rotate(' + rot + 'deg)');
//     menu.css('webkitTransform', 'rotate(' + rot + 'deg)');
//     toggle.children('img').css('transform', 'rotate(' + rot + 'deg)');
//     toggle.children('img').css('webkitTransform', 'rotate(' + rot + 'deg)');
//     $(this).data('rot', rot-180);
// });

// 一级菜单点击变橙色
$('#leftMain .oneNavIcon').click(function(event) {
    $(this).closest('li').addClass('orange').siblings().removeClass('orange');
    if(!$(this).hasClass('isTime')){
        $('.swiper-container').hide();
    }
});