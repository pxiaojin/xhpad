var textData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
var distanceLeft;
var left = $('.progressMain .timeline').offset().left
var disLi = $('.timeline .point').width(); // 点之间的间隔 单位px
var distanceArr = [disLi, disLi * 2] // 每步长度
var timeLeft = 0; // 时间轴整体挪动距离
var rem = 100;

// 时间轴时间
var timeBar = {}
// XHW.timeBar = timeBar

var date = new Date()
timeBar['year'] = date.getFullYear()
timeBar['month'] = date.getMonth() + 1 < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
timeBar['day'] = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
timeBar['hour'] = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
// 设置默认时间控件时间
timeBar['setInputDate'] = function(e) {
    return timeBar.year + '-' + timeBar.month + '-' + timeBar.day
}
// 获取时间控件时间
timeBar['getInputDate'] = function(e) {
    return $('#inputDate').val()
}
// 更新时间轴时间
timeBar['setTimeLine'] = function(hour) {
    hour = hour < 10 ? '0' + hour : hour;
    timeBar.hour = hour;
    if(hour == 24 || hour == '24'){
        timeBar.hour = '00'
    }
    return timeBar.hour;
}
// 请求数据时间
timeBar['getRequestTime'] = function(e) {
    return timeBar.getInputDate() + '-' + timeBar.hour
}

// 增加回调函数
var functionS = [];
timeBar.addCallback = function(fc){
    functionS.push(fc);
};



// 时间轴默认设置 drag progress timeNow
var hourleft = timeBar.hour * disLi + left
var hourContent = timeBar.hour + ':00'
$('.timeNow').css('left', hourleft - disLi / 1.5);
$('.timeNow').html(hourContent)
// $('.drag').css('left', hourleft - disLi / 2);
$('.drag').css('left', hourleft);
$('.drag').html(hourContent);
$('.progress').css('width', timeBar.hour * disLi)

// 时间轴日期控件默认时间
$('#inputDate').attr('value', timeBar.setInputDate())

// 点击关键点
$('.progressMain .timeline').on('click', function (e) {
    $('.start').removeClass('current')
    $('.drag').stop(true, true)
    $('.time .progressMain .progress').stop(true, true)
    // 获取当前点击位置
    var index = Math.round((e.pageX - left - timeLeft) / disLi)
    if($('.time .timeline .point').eq(index-1).attr('tag') == 'false'){
        return
    }
    timeBar.setTimeLine(index)
    // console.log(timeBar.getRequestTime())
    var html = textData[index - 1]
    $('.box').html(html)
    fragNow(index)
    var dis = index * disLi
    // 原尺寸left - disLi/2 === 280
    // $('.time .progressMain .drag').css('left', dis + left - disLi / 2)
    $('.time .progressMain .drag').css('left', dis + left)
    go(dis)
    for(var i in functionS) {
        functionS[i] ? functionS[i](timeBar.getRequestTime()) : null;
    }
})

//   改变日历
$('#inputDate').change(function(){
    for(var i in functionS) {
        functionS[i] ? functionS[i](timeBar.getRequestTime()) : null;
    }
});

// 点击start
$('.start').click(function (e) {
    if ($(this).hasClass('current')) {
        // 暂停
        $(this).removeClass('current')
        stop()
    } else if (!$(this).hasClass('current')) {
        // 播放中
        $(this).addClass('current')
        // 判断是开始还是继续
        if (!$('.time .progressMain .progress').width() > 0) {
            // 开始
            distance = distanceArr[0]
            conti(distance, 1)
        } else {
            // 继续
            distance = distanceArr[0]
            var index = Math.round($('.time .progressMain .progress').width() / distance)
            conti(distance, index)
        }      
    }
})

// 执行两步
$('.two').click(function (e) {
    distance = distanceArr[1]
    conti(distance, 1)
})

$('.twogoon').click(function (e) {
    distance = distanceArr[1]
    // var index = $('.time .progress').width() / distance
    var index = Math.round($('.time .progressMain .progress').width() / distance)
    conti(distance, index)
})

// 向前一步
$('.time .forward').click(function (e) {
    var direct = -1
    progressMove(direct)
})

// 向后一步
$('.time .next').click(function (e) {
    var direct = 1
    progressMove(direct)
})

// 时间轴进度动画 distance 移动距离
function go(distance) {
    $('.time .progressMain .progress').animate({ 'width': distance }, 0)
}

// 暂停
function stop() {
    $('.time .progressMain .drag').stop(true, true)
    $('.time .progressMain .progress').stop(true, true)
}

// 向前 / 向后移动一步 direct 方向
function progressMove(direct) {
    stop()
    $('.start').removeClass('current')
    distance = distanceArr[0]
    var w = ($('.time .progressMain .progress').width() / disLi + direct) * disLi
    var index = Math.round($('.time .progressMain .progress').width() / disLi)
    if(index == 24 && direct == 1){
        w = distance;
        index = 1;
        timeBar.setTimeLine(1);
        $('.time .progressMain .progress').css('width', w);
        // $('.time .progressMain .drag').css('left', w + left - (disLi / 2))
        $('.time .progressMain .drag').css('left', w + left)
        fragNow(1)
    }else if(index == 1 && direct == -1){
            w = 24*disLi;
            index = 24;
            timeBar.setTimeLine(24);
            $('.time .progressMain .progress').css('width', w);
            $('.time .progressMain .drag').css('right', w)
            fragNow(24)
    }else{
        timeBar.setTimeLine(index + direct)
        $('.time .progressMain .progress').css('width', w)
        // $('.time .progressMain .drag').css('left', w + left - (disLi / 2))
        $('.time .progressMain .drag').css('left', w + left)
        $('.box').html(textData[index - 1 + direct])
        fragNow(index + direct)
    }
    

    for(var i in functionS) {
        functionS[i] ? functionS[i](timeBar.getRequestTime()) : null;
    }
}

// 从当前位置开始执行动画 ratio 步数比例 / distance 每步长度
function conti(distance, index) {
    var ratio = distance / disLi
    for (let i = index; i < textData.length / ratio + 1; i++) {
        // $('.time .progressMain .drag').animate({ 'left': i * distance + left - (disLi / 2) }, 2000, function () {
        $('.time .progressMain .drag').animate({ 'left': i * distance + left }, 2000, function () {
            $('.box').html(textData[i * ratio - 1])
            if (!i) {
                $('.time .timeNow').html('00:00')
            } else {
                fragNow(i * ratio)
                timeBar.setTimeLine(i)
                for(let key in functionS) {
                    functionS[key] ? functionS[key](timeBar.getRequestTime()) : null;
                }
            }
        })
        $('.time .progressMain .progress').animate({ 'width': i * distance }, 2000);        
    }
}

// // 连续执行动画 distance 每一步距离
// function ani(distance) {
//     // 步数比例
//     var ratio = distance / 100
//     for (let i = 1; i < textData.length / ratio + 1; i++) {
//         $('.time .drag').animate({ 'left': i * distance + 135 + 'px' }, 1000, function () {
//             $('.box').html(textData[i * ratio - 1])
//         })
//         $('.time .progress').animate({ 'width': i * distance + 'px' }, 1000)
//         // $('.box').animate({'html': textData[i-1]}, 1000)
//     }
// }

// 浮标拖拽
var drag = $('.time .drag')[0]
var progress = $('.time .progressMain .progress')[0]

drag.addEventListener('touchstart', function (e) {
    var divleft = drag.offsetLeft
    var mouseleft = e.touches[0].pageX
    var posi = mouseleft - divleft

    // drag.addEventListener('touchmove', function (ev) {
    //     var dragposi = ev.touches[0].pageX - posi
    //     drag.style.left = dragposi + 'px'
    //     progress.style.width = dragposi - (left - disLi / 1.5) + 'px'
    // })

    drag.addEventListener('touchend', function (even) {
        var index = Math.ceil($('.time .progressMain .progress').width() / disLi)
        $('.box').html(textData[index - 1])
        timeBar.setTimeLine(index)
        fragNow(index);
        for(var i in functionS) {
            functionS[i] ? functionS[i](timeBar.getRequestTime()) : null;
        }
    })
})

// 浮标内容更新
function fragNow(index) {
    if (index) {
        var dragContent = textData[index - 1]
        dragContent = dragContent >= 10 ? dragContent + ':00' : '0' + dragContent + ':00'
        $('.time .drag').html(dragContent)
    }
}


