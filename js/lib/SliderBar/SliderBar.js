var sliderBar = {
    callback:null,	//回调事件

    touchArea:null,		//进度轴 触摸板
    slider:null,	//滑块
    scale:null,		//刻度标记区域

    index:0,		//滑块所在位置

    time:null,		//当前时间
    a :16/2,//滑块宽度的一半,可以使滑块居中显示

    init:function(callback) {		//初始化
        sliderBar.touchArea = $('#bar');
        sliderBar.slider = $('#slider');
        sliderBar.scale = $('#scale');
        sliderBar.callback = callback;

        sliderBar.layoutInit();
        sliderBar.setOnTouchEvent();

        var time = new Date();
        var hour = time.getHours();
        var month = time.getMonth() + 1;
        month = month < 10 ? '0' + month : month;
        time = time.getFullYear() + '-' + month + '-' + time.getDate();
        //初始化三方插件laydate实例
        var lay = laydate.render({
            elem: '#timeInput', 	//指定元素
            value: time,			//初始值
            showBottom: false,		//不出现底部选择栏
            done: function(value, date){	//回调函数
                //console.log('你选择的日期是：' + value);
                //console.log(date);
                sliderBar.time = value;                
                sliderBar.returnTime();
            },
        });
        //设置初始值（时）
        sliderBar.time = time;			//记录当前时间
        sliderBar.index = hour;
        sliderBar.setSliderIndex();
        sliderBar.returnTime();

        // 未来七天时间显示
        $('#futureSevenDay .dayfour').html(sliderBar.getDate(3));
        $('#futureSevenDay .dayfive').html(sliderBar.getDate(4));
        $('#futureSevenDay .daysix').html(sliderBar.getDate(5));
        $('#futureSevenDay .dayseven').html(sliderBar.getDate(6));
        // 七天时间框的相对位置
        sliderBar.sevenMove();
    },
    layoutInit:function(){	//初始化刻度区域布局
        var html = '';
        for(var i = 0; i < 24; i++) {
            if (i == 0 || (i+1)%3 != 0)
                continue
            var value = i < 10 ? '0' + i + ':00' : i + ':00';
            var left = (4.34 * i) + "%";
            html+= "<a style='background: rgba(0,0,0,0.5);border-radius: 10px;position: absolute;top: .5em;margin-left: -2em;width: 4em;text-align: center;color: #fff;font-size:12px;text-shadow: 1px 1px 3px #000;font-variant: small-caps;white-space: pre;left:" + left + ";'>" + value + "</a>";
        }
        sliderBar.scale.html(html);
    },
    updateSliderText:function(selectIndex){	//初始化刻度区域布局
        var html = '';
        for(var i = 0; i < 24; i++) {
            if (i == 0 || (i+1)%3 != 0 && selectIndex != i) {
                continue
            }
            
            var value = i < 10 ? '0' + i + ':00' : i + ':00';
            var left = (4.34 * i) + "%";
            var background = 'rgba(0,0,0,0.5)';
            if(selectIndex == i) {
                background = 'rgba(55,130,205,0.8)';
            }
            html+= "<a style='background: " + background + ";border-radius: 10px;position: absolute;top: .5em;margin-left: -2em;width: 4em;text-align: center;color: #fff;font-size:12px;text-shadow: 1px 1px 3px #000;font-variant: small-caps;white-space: pre;left:" + left + ";'>" + value + "</a>";
        }
        sliderBar.scale.html(html);
    },
    getWidth: function() {		//获取当前整个滑块区域长度
        return sliderBar.scale.css("width").split("px")[0];
    },
    getItpt:function() {		//获取单个滑块刻度区域长度
        return (((sliderBar.getWidth() / 23) * 100) >> 0) / 100;
    },
    setSliderPosition:function(left){		//设置滑块显示位置
        var left = ((left - sliderBar.a) / sliderBar.getWidth()) * 100
        sliderBar.slider.css('left', left + '%');
    },
    setOnTouchEvent:function(){	//设置触摸事件
        var onTouch = false;
        var clickX = 0;
        sliderBar.touchArea[0].addEventListener('mousedown',function(e){	//onmousedown	鼠标按钮被按下
            onTouch = true;
        });
        sliderBar.touchArea[0].addEventListener('mousemove',function(e){	//onmousemove	鼠标被移动
            if(onTouch) {	//按下状态时执行
                var currentX = e.offsetX;
                sliderBar.setSliderPosition(currentX);
            }
        });
        sliderBar.touchArea[0].addEventListener('mouseup',function(e){		//onmouseup	    鼠标按键被松开
            if(onTouch) {	//按下状态时执行
                var currentX = e.offsetX;
                sliderBar.slideStop(currentX);
                onTouch = false;
            }
        });
        sliderBar.touchArea[0].addEventListener('mouseout',function(e){		//onmouseout	鼠标从某元素移开
            if(onTouch) {	//按下状态时执行
                var currentX = e.offsetX;
                sliderBar.slideStop(currentX);
                onTouch = false;
            }
        });
    },
    slideStop:function(currentX) {		//滑动停止
        if(currentX < 0) currentX = 0;
        var width = sliderBar.getWidth();
        if(currentX > width) currentX = width;//判断是否出界

        var itpt = sliderBar.getItpt();
        var index = (currentX / itpt) >> 0;		//根据鼠标位置计算当前对应刻度索引
        var x = currentX % itpt;
        index = x >= (itpt / 2) ? index  + 1: index;
        sliderBar.index = index;
        sliderBar.setSliderIndex();
    },
    setSliderIndex:function() {			//根据索引设置滑块位置
        sliderBar.setSliderPosition(sliderBar.index * sliderBar.getItpt());
        sliderBar.updateSliderText(sliderBar.index)
        sliderBar.returnTime();
    },
    returnTime:function() {			//返回时间
        var value = sliderBar.index < 10 ? '0' + sliderBar.index + ':00' : sliderBar.index + ':00';
        sliderBar.callback ? sliderBar.callback(new Date(sliderBar.time + ' ' + value).getTime()) : null;
        for(var i in sliderBar.functionS) {
            sliderBar.functionS[i] ? sliderBar.functionS[i](sliderBar.time + ' ' + value) : null;
        }
    },
    functionS:[],
    addCallback:function(fc){
        sliderBar.functionS.push(fc);
    },
    clickNext:function(){
        if(sliderBar.playId > 0) { 		//停止播放状态
            window.clearInterval(sliderBar.playId);
            sliderBar.playId = -1;
        }
        sliderBar.next();
    },
    next:function() {		//下一时次
        var step = $('#timeBuChange select').find('option:selected').val();
        sliderBar.index = (sliderBar.index + 1) > 23 ? 0 : sliderBar.index + Number(step);
        if(sliderBar.index == 0) {		//如果下一时次是0点则加一天
            var time = new Date(sliderBar.time);
            time.setDate(time.getDate() + 1);
            var month = time.getMonth() + 1;
            month = month < 10 ? '0' + month : month;
            time = time.getFullYear() + '-' + month + '-' + time.getDate();
            sliderBar.time = time;
            $('#timeInput').html(time);
        }
        sliderBar.setSliderIndex();
    },
    chooseSevenDay:function(i){
        var time = new Date();
        time.setDate(time.getDate() + i);
        var month = time.getMonth() + 1;
        month = month < 10 ? '0' + month : month;
        time = time.getFullYear() + '-' + month + '-' + time.getDate();
        sliderBar.time = time;
        $('#timeInput').html(time);
        sliderBar.setSliderIndex();
    },
    getDate:function(i){
        var time = new Date();
        time.setDate(time.getDate() + i);
        return time.getDate()+'日';
    },
    clickPrevious:function(){
        if(sliderBar.playId > 0) {		//停止播放状态
            window.clearInterval(sliderBar.playId);
            sliderBar.playId = -1;
        }
        sliderBar.previous();
    },
    previous:function() {		//上一时次
        var step = $('#timeBuChange select').find('option:selected').val();
        sliderBar.index = (sliderBar.index - 1) < 0 ? 23 : sliderBar.index - Number(step);
        if(sliderBar.index == 23) {		//如果上一时次是23点则减一天
            var time = new Date(sliderBar.time);
            time.setDate(time.getDate() - 1);
            var month = time.getMonth() + 1;
            month = month < 10 ? '0' + month : month;
            time = time.getFullYear() + '-' + month + '-' + time.getDate();
            sliderBar.time = time;
            $('#timeInput').html(time);
        }
        sliderBar.setSliderIndex();
    },
    playId: -1,
    play:function(){		//播放
        if(sliderBar.playId > 0) {
            window.clearInterval(sliderBar.playId);
            sliderBar.playId = -1;
        } else {
            sliderBar.next();
            sliderBar.playId = setInterval(sliderBar.next, 2000);
        };
        $('.slibarPlayBtn').toggleClass('current');
    },
    setA: function(s) {
        sliderBar.a = s;
    },
    sevenMove:function(){         
        var bindEvent = function(dom, eventName, listener){
            if(dom.attachEvent) {
              dom.attachEvent('on'+eventName, listener);
            } else {
              dom.addEventListener(eventName, listener);
            }
          }
        var mydiv = document.getElementById('bar');
        var mysdiv = document.getElementById('futureSevenDay');
        bindEvent(mydiv, 'mousemove', function(e){
            var offsetX = e.clientX - mydiv.clientLeft - 20;
            // var offsetY = e.clientY - mydiv.clientTop;
            var sevenElemWidth = $('#futureSevenDay').width();
            var rightWin = $(window).width() - e.clientX;
            if(rightWin <= sevenElemWidth){
                var left = offsetX - 205;
                $('#futureSevenDay').addClass('current');
                $('#futureSevenDay').css('left',left+'px'); 
                if(rightWin <= 25){     
                    var offset = left - 20;        
                    $('#futureSevenDay').css('left', offset + 'px');
                }
            }else{
                $('#futureSevenDay').removeClass('current');
                $('#futureSevenDay').css('left',offsetX+'px'); 
            }
            
                $('#futureSevenDay').show();
                                
        });

        bindEvent(mydiv, 'mouseout', function(e){
            $('#futureSevenDay').hide();               
        });

        bindEvent(mysdiv, 'mouseover', function(e){
            $('#futureSevenDay').show();               
        });
        bindEvent(mysdiv, 'mouseout', function(e){
            $('#futureSevenDay').hide();               
        });
    },   
};

