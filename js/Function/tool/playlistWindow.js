define([], function(){
    var TIME_INTERVAL_SLOW = 1000;
    var TIME_INTERVAL_MID = 500;
    var TIME_INTERVAL_FAST = 200;

    var TIME_WAITING = 0;
    var TIME_WAITING_LIMIT = TIME_INTERVAL_SLOW;

    return function PlaylistWindow(id) {
        this.listId = id;
        this.curIndexHtmlId = id + '_curIndexHtmlId';
        this.fy4CurTimeHtml = '<div id="' + this.curIndexHtmlId + '" class="bottom current"><p class="current"><span style="font-size: 28px;">--月--日 --:--</span></p></div>'

        this.timeCode = null;	//播放动画

        let this_ = this;

        $('#' + this.listId).children('.taiFengDel').click(function () {
            this_.close();
        });
        $('#' + this_.listId + '_play').click(function(){
            this_.troggleAnimation(this_.dataIndex);
        });

        this.open = function (list, funcCollection, selectIndex) {
            this.dataList = list;
            this.dataIndex = this_.dataList.length - 1 - (selectIndex>=0?selectIndex:0); // 倒序
            this.callFuncs = funcCollection;
            this_.updateListView();
        };

        this.close = function () {
            // this_.StopAnimation();
            if (this_.callFuncs && this_.callFuncs.close) {
                this_.callFuncs.close();
            }
            this_.dataList = null;
            this.dataIndex = 0;
            TIME_WAITING_LIMIT = TIME_INTERVAL_SLOW;

            $('#' + this_.listId + '_play').css('background', 'url(img/layout/play.png) no-repeat');
            $('#' + this_.listId).hide();
        };

        this.updateListView = function() {
            //----------------step1 清空列表
            let menuContent = $('#' + this_.listId + ' .bottomF');
            menuContent.empty();
            //----------------step1.5 反序
            // data.reverse();
            //----------------step2 遍历数据
            for(let i = this_.dataList.length-1; i >= 0; i--) {
                //------------------step3 填充列表
                let html = 	'<p class="swiper-slide"><span>' + this_.dataList[i].desc + '</span></p>';
                if (this_.dataList[i].color) {
                    html = 	'<p class="swiper-slide"><span style="color:' + this_.dataList[i].color + '">' + this_.dataList[i].desc + '</span></p>';
                }
                menuContent.append(html);
            }
            //----------------step4 添加点击事件
            menuContent.children().click(function(){
                let index = $(this).index();
                this_.showIndex(this_.dataList.length - 1 - index);//列表倒着看
            });
            this_.showIndex(this.dataIndex, true);
            $('#' + this_.listId).show();
        };

        this.troggleAnimation = function(index){

            if(!this_.animationOn) {
                this_.StartAnimation();
                $('#' + this_.listId + '_play').css('background', 'url(img/layout/stop.png) no-repeat');
            } else {
                this_.StopAnimation();
                $('#' + this_.listId + '_play').css('background', 'url(img/layout/play.png) no-repeat');
            }
        }

        this.showIndex = function(index, scrollToIndex){
            this_.dataIndex = index;
            $('#' + this_.curIndexHtmlId + ' span').text($('#' + this_.listId + ' .bottomF').children().eq(this_.dataList.length - 1 - index).text());
            // $('#' + this_.listId + ' .contenty').mCustomScrollbar('scrollTo', $('#' + this_.listId + ' .bottomF .current'), {
            //     scrollInertia:0
            // });
            let liIndex = this_.dataList.length - 1 - index;
            if ((this_.dataList.length - 1 - liIndex)%6 == 0 && !scrollToIndex) {
                let top = 0;
                if (liIndex > 5) {
                    top =  $('#' + this_.listId + ' .bottomF').children().eq(liIndex - 6/2).position().top;
                }
                top = top - 60 <= 0 ? top : top - 60;
                $('#' + this_.listId + ' .contenty').mCustomScrollbar('scrollTo', top, { scrollInertia:TIME_WAITING_LIMIT/2 });
            }
            $('#' + this_.listId + ' .bottomF').children().eq(liIndex).addClass('current').siblings().removeClass('current');
            

            if (this_.callFuncs && this_.callFuncs.showIndex) {
                this_.callFuncs.showIndex(index)
            }
            if (scrollToIndex) {
                $('#' + this_.listId + ' .contenty').mCustomScrollbar('scrollTo', liIndex*20);
            }
        }
        /**
         * APIMethod: StartAnimation
         * 开始播放动画.
         */
        this.StartAnimation = function() {
            this_.StopAnimation();
            if(this_.animationOn){
                return;
            }

            // $('#' + this_.listId + ' .contenty').hide();
            $('#' + this_.listId).append(this_.fy4CurTimeHtml);

            this_.animationOn = true;//开启动画

            $('#' + this_.curIndexHtmlId + ' span').text($('#' + this_.listId + ' .bottomF p.current span').text());
            this_.timeCode = setInterval(function(){
                this_.LoadNextTimeImage();
            }, TIME_WAITING_LIMIT);
        }

        /**
         * APIMethod: StopAnimation
         * 停止动画.
         */
        this.StopAnimation = function() {
            this_.animationOn = false;
            $('#' + this_.curIndexHtmlId).remove();
            // $('#' + this_.listId + ' .contenty').show();
            $('#' + this_.listId + ' .contenty').mCustomScrollbar('scrollTo', $('#' + this_.listId + ' .bottomF .current'), {
                scrollInertia:0
            });
            if(this_.timeCode) {
                clearInterval(this_.timeCode);
                this_.timeCode = null;
            }
        }

        /**
         * Method: LoadNextTimeImage
         * 加载下一时次.
         */
        this.LoadNextTimeImage = function() {
            this_.dataIndex = this_.IncreaseIndex(this_.dataIndex);
            let nextDataIndex = this_.dataIndex;
            if (nextDataIndex >= this_.dataList.length) {
//        nextDataIndex -= this.dataList.length;
                nextDataIndex = nextDataIndex % this_.dataList.length;
//        nextDataIndex =0;
            }

            this_.showIndex(nextDataIndex)
        };

        /**
         * Method: IncreaseIndex
         * 循环移动时次索引号.
         */
        this.IncreaseIndex = function(index) {
            index++;
            if (this_.dataList && index >= this_.dataList.length) {
                index = 0;
                if (TIME_WAITING_LIMIT == TIME_INTERVAL_SLOW) {
                    clearInterval(this_.timeCode);
                    TIME_WAITING_LIMIT = TIME_INTERVAL_MID;
                    this_.timeCode = setInterval(function(){
                        this_.LoadNextTimeImage();
                    }, TIME_WAITING_LIMIT);
                }
            }
            return index;
        }
    }
});