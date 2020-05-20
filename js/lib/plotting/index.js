var server_url = "http://weather.xinhong.net/";
var airPortMsgDisplay = false;
var myLength = $('#addTo li').length;
var himawariClickFlag = false;
var danDian_cloudChange_lng, danDian_cloudChange_lat;
/*var duoDian_cloudChange_lng,duoDian_cloudChange_lat;*/
String.prototype.Trim = function () {
    // return this.replace(/(^\s*)|(\s*$)/g, "");
    return this.replace(/\s+/g, "");
}
String.prototype.LTrim = function () {
    return this.replace(/(^\s*)/g, "");
}
String.prototype.RTrim = function () {
    return this.replace(/(\s*$)/g, "");
}

$(function () {
    (function ($) {
        $(window).load(function () {
            $(".content_scroll").mCustomScrollbar();
        });
    })(jQuery);



    $('#leftFaceplate .btn').click(function (event) {
        $(this).addClass('current').siblings().removeClass('current');
    });

    //单点框隐藏 (添加)
    $('#oddDotShow .del').click(function (event) {
        closeDotInfo();
    });




    var manyDotFlag = false;
    //多点云变化显示 (添加)
    $('#leftFaceplate .manyDotBtn').click(function (event) {
        manyDotFlag = !manyDotFlag;
        if (manyDotFlag) {
            manyDotFlag = showDotChanges();
            if (manyDotFlag) {
                $(this).addClass('clickbg02');
            }

        } else {
            $('#manyDot').stop().fadeOut(300);
            $(this).removeClass('clickbg02');
        }
    });

    //多点云变化隐藏 (添加)
    $('#manyDot .del').click(function (event) {
        $('#manyDot').stop().fadeOut(300);
        $('#leftFaceplate .manyDotBtn').removeClass('clickbg02');
        $('#manyDotBtn').removeClass('clickbg02');
    });


    // 航路点操作
    $('#addTo li:nth-child(3) i').css('background', 'url(./static/image/reduce.png) no-repeat left center');
    $('#addDot').click(addDot);


    //机场预报隐藏
    $('#aerodromeWh .del').click(function (event) {
        $('#aerodromeWh').stop().fadeOut(300);
    });
    //机场简介隐藏
    $('.aerodromeSynopsis .del').click(function (event) {
        $('.aerodromeSynopsis').stop().fadeOut(300);
    });

    //红外通道
    $('.alleywayWarp li>a').click(function (event) {
        $(this).parent().toggleClass('showul');
    });
    var currentTime = null;
    var level1Flag = false, levle1Status;
    var level2Flag = false, levle2Type;
    var level1Playing, level2Playing;
    var level1Time, level2Time;
    var playTime0 = null, playTime1 = null, playTime2 = null, playTime3 = null, playTime4 = null;
    var level1Data, level2Data, level1CurrNum = 0, level2CurrNum = 0;
    //葵花8云图上一张
    $('#mapArrowL').click(function (event) {
        if (secondLevel != "" && secondLevel != null) {
            if (secondLevel == "stationradarmap") {
                upperStationradarmap();
            } else if (secondLevel == "radarmap") {
                upperRadarmap();
            } else if (secondLevel == "cloudmap") {
                upperCloudmap();
            }
        } else {
            if (level1Flag) {
                var nextDate = dateDecrease(level1Time);
                var time = nextDate.format("yyyyMMddhhmm");
                if (level1Data[0].date <= time) {
                    level1Time = time;
                    for (var i = 0; i < level1Data.length; i++) {
                        if (time == level1Data[i].date) {
                            level1CurrNum--;
                            delLayer('himawariLevel1Layer');
                            addStaticImage(level1Data[i], 'himawariLevel1Layer', 100);
                        }
                    }
                }
                showTitle();
            }
            if (level2Flag) {
                var nextDate = dateDecrease(level2Time);
                var time = nextDate.format("yyyyMMddhhmm");
                if (level2Data[0].date <= time) {
                    level2Time = time;
                    for (var i = 0; i < level2Data.length; i++) {
                        if (time == level2Data[i].date) {
                            level2CurrNum--;
                            delLayer('himawariLevel2Layer');
                            addStaticImage(level2Data[i], 'himawariLevel2Layer', 101);
                        }
                    }
                }
                showTitle();
            }
        }
    });

    //葵花8云图下一张
    $('#mapArrowR').click(function (event) {
        if (secondLevel != "" && secondLevel != null) {
            if (secondLevel == "stationradarmap") {
                lowerStationradarmap();
            } else if (secondLevel == "radarmap") {
                lowerRadarmap();
            } else if (secondLevel == "cloudmap") {
                lowerCloudmap();
            }
        } else {
            if (level1Flag) {
                if (level1Data) {
                    var nextDate = dateAdd(level1Time);
                    var time = nextDate.format("yyyyMMddhhmm");
                    if (level1Data[level1Data.length - 1].date >= time) {
                        level1Time = time;
                        for (var i = 0; i < level1Data.length; i++) {
                            if (time == level1Data[i].date) {
                                level1CurrNum++;
                                delLayer('himawariLevel1Layer');
                                addStaticImage(level1Data[i], 'himawariLevel1Layer', 100);
                            }
                        }
                    }
                }
                showTitle();
            }
            if (level2Flag) {
                if (level2Data) {
                    var nextDate = dateAdd(level2Time);
                    var time = nextDate.format("yyyyMMddhhmm");
                    if (level2Data[level2Data.length - 1].date >= time) {
                        level2Time = time;
                        for (var i = 0; i < level2Data.length; i++) {
                            if (time == level2Data[i].date) {
                                level2CurrNum++;
                                delLayer('himawariLevel2Layer');
                                addStaticImage(level2Data[i], 'himawariLevel2Layer', 101);
                            }
                        }
                    }
                }
                showTitle();
            }
        }
    });


    $('#play').click(function () {

        if (level1Playing || level2Playing) {
            return;
        }
        playTime0 = setInterval(function () {
            if (level1Flag || level2Flag) {
                var nextDate;
                if (level2Time) {
                    nextDate = dateAdd(level2Time);
                } else {
                    nextDate = dateAdd(level1Time);
                }
                currentTime = nextDate.format("yyyyMMddhhmm");
            } else {
                clearTimer0();
            }
        }, 1000);

        if (level1Flag) {
            playTime1 = setInterval(function () {
                if (level1Data) {
                    level1Playing = true;
                    var nextDate = dateAdd(level1Time);
                    var time = nextDate.format("yyyyMMddhhmm");
                    if (level1Data[level1Data.length - 1].date >= time) {
                        level1Time = time;
                        for (var i = 0; i < level1Data.length; i++) {
                            if (time == level1Data[i].date) {
                                level1CurrNum++;
                                showTitle();
                                delLayer('himawariLevel1Layer');
                                addStaticImage(level1Data[i], 'himawariLevel1Layer', 100);
                            }
                        }
                    } else {
                        clearTimer();
                        level1Playing = true;
                    }
                } else {
                    clearTimer();
                    level1Playing = true;
                }
            }, 1000);
        }
        if (level2Flag) {
            playTime2 = setInterval(function () {
                if (level2Data) {
                    level2Playing = true;
                    var nextDate = dateAdd(level2Time);
                    var time = nextDate.format("yyyyMMddhhmm");
                    if (level2Data[level2Data.length - 1].date >= time) {
                        level2Time = time;
                        for (var i = 0; i < level2Data.length; i++) {
                            if (time == level2Data[i].date) {
                                level2CurrNum++;
                                showTitle();
                                delLayer('himawariLevel2Layer');
                                addStaticImage(level2Data[i], 'himawariLevel2Layer', 101);
                            }
                        }
                    } else {
                        clearTimer();
                        level1Playing = true;
                    }
                } else {
                    clearTimer2();
                    level1Playing = true;
                }
            }, 1000);
        }
    });

    /**
     * 时间增加10分钟
     * @param leveltime
     * @returns {Date}
     */
    function dateAdd(leveltime) {
        var year = leveltime.substring(0, 4);
        var mon = leveltime.substring(4, 6);
        var day = leveltime.substring(6, 8);
        var hour = leveltime.substring(8, 10);
        var min = leveltime.substring(10, 12);
        var dateTime = year + "/" + mon + "/" + day + " " + hour + ":" + min + ":" + "00";
        var levelDate = new Date(dateTime);
        levelDate.setMinutes(levelDate.getMinutes() + 10);
        return levelDate;
    }


    /**
     * 时间减少10分钟
     * @param leveltime
     * @returns {Date}
     */
    function dateDecrease(leveltime) {
        var year = leveltime.substring(0, 4);
        var mon = leveltime.substring(4, 6);
        var day = leveltime.substring(6, 8);
        var hour = leveltime.substring(8, 10);
        var min = leveltime.substring(10, 12);
        var dateTime = year + "/" + mon + "/" + day + " " + hour + ":" + min + ":" + "00";
        var levelDate = new Date(dateTime);
        levelDate.setMinutes(levelDate.getMinutes() - 10)
        return levelDate;
    }

    function clearTimer0() {
        if (playTime0 != null) {
            clearInterval(playTime0);
            playTime0 = null;
        }
        level1Playing = false;
        level2Playing = false;
    }

    function clearTimer() {
        if (playTime1 != null) {
            clearInterval(playTime1);
            playTime1 = null;
        }
        level1Playing = false;
    }

    function clearTimer2() {
        if (playTime2 != null) {
            clearInterval(playTime2);
            playTime2 = null;
        }
        level2Playing = false;
    }

    function clearTimer3() {
        if (playTime3 != null) {
            clearInterval(playTime3);
            playTime3 = null;
        }
    }

    function clearTimer4() {
        if (playTime4 != null) {
            clearInterval(playTime4);
            playTime4 = null;
        }
    }

    $('#stop').click(function () {
        clearTimer0();
        clearTimer();
        clearTimer2();
    });
    $('#location').click(function (event) {
        var location = [113.27, 23.11];
        flyTo(location, function () {
        });
    });
    //机场状态切换
    $('#racetrack').click(function (event) {
        $(this).toggleClass('icon4');
    });


    $('#ir').click(function (e) {
        addLevel1Layer($(e.target));
    });
    $('#irwv').click(function (e) {
        addLevel1Layer($(e.target));
    });
    $('#vis').click(function (e) {
        addLevel1Layer($(e.target));
    });


    function addLevel1Layer(elem) {
        $('#city').html("");
        level1CurrNum = 0;
        var channel = $(elem).attr('id'); //ir-红外一  vis-可见光 irwv-红外二
        levle1Status = channel;
        $(elem).parent().toggleClass('select').siblings().removeClass('select');
        if ($(elem).parent().attr('class').indexOf('select') > -1) {
            level1Flag = true;
        } else {
            level1Flag = false;
            clearTimer();
            delLayer('himawariLevel1Layer');
        }

        if (level1Flag) {
            //todo:生产环境不需要时间参数
            $.ajax(appendInfoToURL(server_url + "himawari8l2map/info?channel=" + channel), {
                cache: false,
                dataType: 'json',
                timeout: 10000,
                success: function (data) {
                    delLayer('himawariLevel1Layer');
                    level1Data = data.data;
                    level1Time = level1Data[0].date;
                    var l1data;
                    if (level2Flag) {
                        if (currentTime > level1Time) {
                            if (level1Data[level1Data.length - 1].date > currentTime) {
                                if (level1Data[level1Data.length - 1].date > level1Time) {
                                    level1Time = currentTime;
                                    for (var i = 0; i < level1Data.length; i++) {
                                        if (currentTime == level1Data[i].date) {
                                            showTitle();
                                            delLayer('himawariLevel1Layer');
                                            addStaticImage(level1Data[i], 'himawariLevel1Layer', 100);
                                        }
                                    }
                                } else {
                                    level1Time = level1Data[level1Data.length - 1].date;
                                    showTitle();
                                    delLayer('himawariLevel1Layer');
                                    addStaticImage(level1Data[level1Data.length - 1], 'himawariLevel1Layer', 100);
                                }
                            } else {
                                level1Time = level1Data[level1Data.length - 1].date;
                                showTitle();
                                delLayer('himawariLevel1Layer');
                                addStaticImage(level1Data[level1Data.length - 1], 'himawariLevel1Layer', 100);
                            }
                        } else {
                            l1data = level1Data[0];
                            addStaticImage(l1data, 'himawariLevel1Layer', 100);
                            $('#mapArrowL').show();
                            $('#mapArrowR').show();
                            showTitle();
                        }
                    } else {
                        l1data = level1Data[0];
                        addStaticImage(l1data, 'himawariLevel1Layer', 100);
                        $('#mapArrowL').show();
                        $('#mapArrowR').show();
                    }
                    showTitle();
                },
                error: function () {
                    alert("请求服务失败！");
                }
            });
            if (level2Playing && playTime3 == null) {
                playTime3 = setInterval(function () {
                    if (level1Data) {
                        level1Playing = true;
                        level1Time = level1Data[0].date;
                        var nextDate = dateAdd(level1Time);
                        var time = nextDate.format("yyyyMMddhhmm");
                        if (currentTime >= time) {
                            if (level1Data[level1Data.length - 1].date >= currentTime) {
                                if (level1Data[level1Data.length - 1].date >= time) {
                                    level1Time = currentTime;
                                    for (var i = 0; i < level1Data.length; i++) {
                                        if (currentTime == level1Data[i].date) {
                                            level1CurrNum++;
                                            showTitle();
                                            delLayer('himawariLevel1Layer');
                                            addStaticImage(level2Data[i], 'himawariLevel1Layer', 100);
                                            clearTimer3();
                                        }
                                    }
                                } else {
                                    level1Time = level1Data[level1Data.length - 1].date;
                                    showTitle();
                                    delLayer('himawariLevel1Layer');
                                    addStaticImage(level1Data[level1Data.length - 1], 'himawariLevel1Layer', 100);
                                    clearTimer3();
                                }
                            } else {
                                level1Time = level1Data[level1Data.length - 1].date;
                                showTitle();
                                delLayer('himawariLevel1Layer');
                                addStaticImage(level1Data[level1Data.length - 1], 'himawariLevel1Layer', 100);
                                clearTimer3();
                            }
                        } else {
                            level1Time = level1Data[level1Data.length - 1].date;
                            showTitle();
                            delLayer('himawariLevel1Layer');
                            addStaticImage(level1Data[level1Data.length - 1], 'himawariLevel1Layer', 100);
                            clearTimer3();
                        }
                    } else {
                        clearTimer();
                        level1Playing = true;
                    }
                }, 1000);
            }
        } else {
            clearTimer();
            clearTimer3();
            delLayer('himawariLevel1Layer');
            showTitle();
            if (!level2Flag) {
                $('#mapTitle').hide();
            }
            if (!level1Flag && !level2Flag) {
                clearTimer0();
                currentTime = 0;
            }
        }
    }

    $('#clot').click(function (e) {
        secondLevel = "";
        addLevel2Layer($(e.target));
    });
    $('#clth').click(function (e) {
        secondLevel = "";
        addLevel2Layer($(e.target));
    });
    $('#cltype').click(function (e) {
        secondLevel = "";
        addLevel2Layer($(e.target));
    });

    $('#stationradarmap').click(function (e) {
        addRadarmapAndCloudmap($(e.target));
    });
    $('#radarmap').click(function (e) {
        addRadarmapAndCloudmap($(e.target));
    });
    $('#cloudmap').click(function (e) {
        addRadarmapAndCloudmap($(e.target));
    });

    var selectType;
    var secondLevel;

    function addRadarmapAndCloudmap(elem) {
        secondLevel = "";
        delLayer('himawariLevel2Layer');
        $('#city').html("");
        $('#mapTitle').hide();
        var type = $(elem).attr('id');
        $(elem).parent().toggleClass('select').siblings().removeClass('select');
        if ($(elem).parent().attr('class').indexOf('select') > -1) {
            secondLevel = type;
            $.ajax(appendInfoToURL(server_url + type + "/info"), {
                cache: false,
                dataType: 'JSON',
                timeout: 10000,
                success: function (data) {
                    if (data.status_code == 0) {
                        var citys = [];
                        for (var key in data.data) {
                            citys[key] = data.data[key].cname;
                        }
                        if (type == "stationradarmap") {
                            //单站雷达
                            var a = '<option value="请选择城市" selected="selected">' + "请选择城市" + '</option>';
                            var b = "";
                            document.getElementById("city").style.display = "block";
                            if (citys.length >= 2) {
                                for (var i = 0; i < citys.length; i++) {
                                    b += "<option value='" + citys[i] + "'>" + citys[i] + "</option>+";
                                }
                                var c = b.substring(0, b.length - 1);
                            } else {
                                b = "<option value='" + citys[0] + "'>" + citys[0] + "</option>";
                                var c = b;
                            }
                            var citySelect1 = '<select id="citySelectType">'
                                + a
                                + c
                                + '</select>';
                            $('#city').html(citySelect1);
                            selectType = document.getElementById("citySelectType");
                            selectType.onchange = function () {
                                $('#mapTitle').hide();
                                delLayer('himawariLevel2Layer');
                                addStationradarmaps(data)
                            }
                        } else if (type == "radarmap") {
                            //全国雷达
                            $('#mapTitle').hide();
                            addRadarmap(data.data, 'himawariLevel2Layer', 101);
                        } else if (type == "cloudmap") {
                            //云图
                            $('#mapTitle').hide();
                            addCloudmap(data.data, 'himawariLevel2Layer', 101);
                        }
                    } else {
                        alert(data.status_msg);
                    }
                },
                error: function () {
                    alert("请求服务失败！");
                }
            });
        }
    }

//单站雷达的城市
    function addStationradarmaps(data) {
        var value = selectType.value;
        if (value != "请选择城市") {
            for (var key in data.data) {
                if (data.data[key].cname == value) {
                    //console.info(key+"  "+data.data[key].cname+"  "+data.data[key].imagesdata.length);
                    addStationradarmap(value, data.data[key].latlng, data.data[key].imagesdata, 'himawariLevel2Layer', 101);
                    break;
                }
            }
        }
    }

    function addLevel2Layer(elem) {
        $('#city').html("");
        level2CurrNum = 0;
        var type = $(elem).attr('id'); //红1， 红2...
        levle2Type = type;
        $(elem).parent().toggleClass('select').siblings().removeClass('select');
        if ($(elem).parent().attr('class').indexOf('select') > -1) {
            level2Flag = true;
        } else {
            level2Flag = false;
            clearTimer2();
            delLayer('himawariLevel2Layer');
        }
        if (level2Flag) {
            $.ajax(appendInfoToURL(server_url + "/himawari8l2map/info?channel=" + type), {
                cache: false,
                dataType: 'json',
                timeout: 10000,
                success: function (data) {
                    delLayer('himawariLevel2Layer');
                    level2Data = data.data;
                    level2Time = level2Data[0].date;
                    var l2data;
                    //console.info(currentTime);
                    if (level1Flag) {
                        if (currentTime > level2Time) {
                            if (level2Data[level2Data.length - 1].date > currentTime) {
                                if (level2Data[level2Data.length - 1].date > level2Time) {
                                    level2Time = currentTime;
                                    for (var i = 0; i < level2Data.length; i++) {
                                        if (currentTime == level2Data[i].date) {
                                            showTitle();
                                            delLayer('himawariLevel2Layer');
                                            addStaticImage(level2Data[i], 'himawariLevel2Layer', 101);
                                        }
                                    }
                                } else {
                                    level2Time = level2Data[level2Data.length - 1].date;
                                    showTitle();
                                    delLayer('himawariLevel2Layer');
                                    addStaticImage(level2Data[level2Data.length - 1], 'himawariLevel2Layer', 101);
                                }
                            } else {
                                level2Time = level2Data[level2Data.length - 1].date;
                                showTitle();
                                delLayer('himawariLevel2Layer');
                                addStaticImage(level2Data[level2Data.length - 1], 'himawariLevel2Layer', 101);
                            }
                        } else {
                            l2data = level2Data[0];
                            addStaticImage(l2data, 'himawariLevel2Layer', 101);
                            $('#mapArrowL').show();
                            $('#mapArrowR').show();
                            showTitle();
                        }
                    } else {
                        l2data = level2Data[0];
                        addStaticImage(l2data, 'himawariLevel2Layer', 101);
                        $('#mapArrowL').show();
                        $('#mapArrowR').show();
                    }
                    showTitle();
                },
                error: function () {
                    alert("请求服务失败！");
                }
            });
            if (level1Playing && playTime4 == null) {
                playTime4 = setInterval(function () {
                    if (level2Data) {
                        level2Playing = true;
                        level2Time = level2Data[0].date;
                        var nextDate = dateAdd(level2Time);
                        var time = nextDate.format("yyyyMMddhhmm");
                        if (currentTime >= time) {
                            if (level2Data[level2Data.length - 1].date >= currentTime) {
                                if (level2Data[level2Data.length - 1].date >= time) {
                                    level2Time = currentTime;
                                    for (var i = 0; i < level2Data.length; i++) {
                                        if (currentTime == level2Data[i].date) {
                                            level2CurrNum++;
                                            showTitle();
                                            delLayer('himawariLevel2Layer');
                                            addStaticImage(level2Data[i], 'himawariLevel2Layer', 101);
                                            // clearTimer4();
                                        }
                                    }
                                } else {
                                    level2Time = level2Data[level2Data.length - 1].date;
                                    showTitle();
                                    delLayer('himawariLevel2Layer');
                                    addStaticImage(level2Data[level2Data.length - 1], 'himawariLevel2Layer', 101);
                                    // clearTimer4();
                                }
                            } else {
                                level2Time = level2Data[level2Data.length - 1].date;
                                showTitle();
                                delLayer('himawariLevel2Layer');
                                addStaticImage(level2Data[level2Data.length - 1], 'himawariLevel2Layer', 101);
                                clearTimer4();
                            }
                        }
                    } else {
                        clearTimer4();
                    }
                }, 1000);
            }
        } else {
            if (level1Flag && level2Flag) {
                clearTimer0();
            }
            delLayer('himawariLevel2Layer');
            clearTimer2();
            clearTimer4();
            showTitle();
            if (!level1Flag) {
                $('#mapTitle').hide();
            }
            if (!level1Flag && !level2Flag) {
                clearTimer0();
                currentTime = 0;
            }
        }

    }


    var level2TitleStr = "";
    var level1TitleStr = "";

    function showlevel2ByElem() {
        if (levle2Type == "clot") {
            level2TitleStr = "葵花8二级产品（光学厚度)";
        }
        if (levle2Type == "clth") {
            level2TitleStr = "葵花8二级产品（云顶高)";
        }
        if (levle2Type == "cltt") {
            level2TitleStr = "葵花8二级产品（云顶温)";
        }
        if (levle2Type == "cttype") {
            level2TitleStr = "葵花8二级产品（云分类)";
        }
    }

    function showlevel1ByElem() {
        if (levle1Status == "ir") {
            level1TitleStr = "葵花8一级产品（11.2微米红外通道）";
        }
        if (levle1Status == "vis") {
            level1TitleStr = "葵花8一级产品（0.64可见光通道）";
        }
        if (levle1Status == "irwv") {
            level1TitleStr = "葵花8一级产品（10.4微米红外通道）";
        }
    }

    function showTitle() {
        showlevel1ByElem();
        showlevel2ByElem();
        if (level1Flag && level2Flag) {
            if (level2Time != "" && level2Time != null && level2Time != undefined) {
                var showlevel2 = level2Time.substring(4, 6) + '月' + level2Time.substring(6, 8) + '日' + level2Time.substring(8, 10) + ':' + level2Time.substring(10, 12);
                $('#mapTitle').show();
                $('#mapTitle').html('<li>' + showlevel2 + '</li><li>' + level1TitleStr + '</li><li>' + level2TitleStr + '</li>');
            } else if (level1Time != "" && level1Time != null && level1Time != undefined) {
                var showlevel1 = level1Time.substring(4, 6) + '月' + level1Time.substring(6, 8) + '日' + level1Time.substring(8, 10) + ':' + level1Time.substring(10, 12);
                $('#mapTitle').show();
                $('#mapTitle').html('<li>' + showlevel1 + '</li><li>' + level1TitleStr + '</li><li>' + level2TitleStr + '</li>');
            }
        } else if (level1Flag) {
            if (level1Time != "" && level1Time != null && level1Time != undefined) {
                var showlevel1 = level1Time.substring(4, 6) + '月' + level1Time.substring(6, 8) + '日' + level1Time.substring(8, 10) + ':' + level1Time.substring(10, 12);
                $('#mapTitle').show();
                $('#mapTitle').html('<li>' + showlevel1 + '</li><li>' + level1TitleStr + '</li>');
            }
        } else if (level2Flag) {
            if (level2Time != "" && level2Time != null && level2Time != undefined) {
                var showlevel2 = level2Time.substring(4, 6) + '月' + level2Time.substring(6, 8) + '日' + level2Time.substring(8, 10) + ':' + level2Time.substring(10, 12);
                $('#mapTitle').show();
                $('#mapTitle').html('<li>' + showlevel2 + '</li><li>' + level2TitleStr + '</li>');
            }
        } else {
            // $('#mapTitle').hide();
        }
        // $('#mapTitle').show();
    }


    // 查看机场报文
    $('#airPortRealHref').click(function (event) {
        $('#airPortRealHref').parent().toggleClass('select').siblings().removeClass('select');
        airPortMsgDisplay = !airPortMsgDisplay;
        if (airPortMsgDisplay) {
            $('#racetrack').show(100);
            $.ajax(appendInfoToURL(server_url + "airportdata_surf/sigmentdataindexs"), {
                cache: false,
                dataType: 'json',
                timeout: 10000,
                success: function (data) {
                    addAirPortOverlay(data);
                },
                error: function () {
                    alert("请求服务失败！");
                }
            });
        } else {
            $('#racetrack').hide(100);
            //删除机场天气
            delLayer('airPortLayers');
        }
    });


    $('#airPortDetailHref').click(function (event) {
        delLayer('airPortLayers');
        $('#airPortDetailHref').parent().toggleClass('select').siblings().removeClass('select');
    });
});


function closeDotInfo() {
    $('#oddDotShow').stop().fadeOut(300);
    $('#leftFaceplate .oddDot').removeClass('clickbg01');
}

function showDotInfo(id, lng, lat) {
    if (id != null) {
        lng = $('#pointLng' + id).val().Trim();
        lat = $('#pointLat' + id).val().Trim();
    } else {
        lng = parseFloat(lng).toFixed(2);
        lat = parseFloat(lat).toFixed(2);
    }
    if (checkLngRange(lng) && checkLatRange(lat)) {
        $.ajax(appendInfoToURL(server_url + "himawari8l2/pointtimedata?lat=" + lat + "&lng=" + lng), {
            cache: false,
            dataType: 'json',
            timeout: 10000,
            success: function (data) {
                if (data.status_code == 0) {
                    for (var key in data.data) {
                        if (data.data[key].CH != null && data.data[key].CH != "") {
                            var datum = data.data[key];
                            break;
                        } else {
                            continue;
                        }
                    }
                    var html = '<p class="dotEN">' +
                        '<span class="dotE">' + convertLatLng(lat, lng) + '<input type="hidden" id="dotLng" value="' + lng + '" />' +
                        '<input type="hidden" id="dotLat" value="' + lat + '" /></span>' +
                        '<span class="time">' + moment(data.time, "YYYYMMDDHHmm").format('HH:mm') + '</span></p>' +
                        '<div class="dotList">' +
                        '<span>云顶高： ' + datum.CH.toFixed(2) + '千米</span><span>光学厚度： ' + datum.CO.toFixed(2) + '</span><span>云类型： ' + cloudTypes(datum.CP) + '</span>' +
                        '</div><a href="javascript:void(0)" class="seeChange" id="seeChange" onclick="showDotChange(' + lat + ',' + lng + ');">单点云变化 ＞</a>' +
                        '<a href="javascript:void(0)" class="seeChange" id="dotSection" onclick="dotSection()">单点剖面图 ＞</a>';
                    $('#dot-popup-content').html(html);
                    $('#manyDotBtn').removeClass("clickbg02");
                    showDotChange(lat, lng);
                    himawariOverlay.setPosition([lng, lat]);
                } else {
                    alert(data.status_msg);
                }
            },
            error: function () {
                alert("请求服务失败！");
            }
        });
    } else {
        alert("经纬度格式不正确！");
    }
}

//机场文本框焦点事件
var choice_airport_id = ""
function airportOnfocus(id) {
    choice_airport_id = id;
    //获取焦点文本框的上一级div
    var inputWarp_div = document.getElementById(id).parentNode;
    //http://weather1.xinhong.net/airportdata_surf/sigmentdataindexs
    $('#' + id).bind('keyup', function (event) {
        var myLi = "";
        var name = $('#' + id).val().Trim();
        if (name != "" && name != null) {
            $.ajax(appendInfoToURL("http://weather1.xinhong.net/airportdata_surf/sigmentdataindexs"), {
                cache: false,
                dataType: 'json',
                timeout: 10000,
                success: function (data) {
                    //判断是否为汉字
                    var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
                    //判断是否为字母
                    //var reg1=new RegExp("/^[A-Za-z]+$/");
                    if (reg.test(name)) {
                        for (var i = 0; i < data.data.length; i++) {
                            var val=data.data[i].split("_");
                            if(val[5].indexOf(name)>-1){
                                myLi+="<li onclick='airportOnfocusLi(this)'>"+val[0]+"("+val[2]+" "+val[3]+" "+val[4]+" "+val[5]+")"+"</li>";
                                $('#down_box').remove();
                                var myTag = "<div id='down_box'><ul id='down_list'>" + myLi + "</ul></div>";
                                $(inputWarp_div).after(myTag);
                            }
                        }
                    }else {
                        for (var i = 0; i < data.data.length; i++) {
                            var val=data.data[i].split("_");
                            if(val[0].toUpperCase().indexOf(name)>-1 || val[0].toLowerCase().indexOf(name)>-1){
                                myLi+="<li onclick='airportOnfocusLi(this)'>"+val[0]+"("+val[2]+" "+val[3]+" "+val[4]+" "+val[5]+")"+"</li>";
                                $('#down_box').remove();
                                var myTag = "<div id='down_box'><ul id='down_list'>" + myLi + "</ul></div>";
                                $(inputWarp_div).after(myTag);
                            }
                        }
                    }
                },
                error: function () {
                    alert("请求服务失败！");
                }
            });
        }else {
            $('#down_box').remove();
        }
    })
}
//机场文本框失去焦点事件
function airportOnblur() {
    setTimeout(removeDown_box, 200);
}

//机场选项卡点击事件
function airportOnfocusLi(html) {
    var myValue = html.innerHTML;
    $('#down_box').remove();
    $('#' + choice_airport_id).val(myValue);
}
//机场单点查询
function airportOnclick(id) {
    if (typeof id != "undefined") {
        var airportValue = $('#Choice_airport' + id).val();
        if (airportValue != null && airportValue != "") {
            var lngLat = airportValue.split(" ");
            showDotInfo(null, lngLat[1], lngLat[2]);
        } else {
            alert("航路点不能为空");
        }
    }
}

//航路点文本框焦点事件
var choice_waypoint_id = "";
function waypointOnfocus(id) {
    choice_waypoint_id = id;
    //获取焦点文本框的上一级div
    var inputWarp_div = document.getElementById(id).parentNode;
    /*//模糊查询航路点信息
     http://weather1.xinhong.net/airport/waypointfromname?name=l*/
    /*//根据航线标识(routeident)查询航路点列表
     http://weather1.xinhong.net/airport/waypointsfromrouteidenty?identy=A456*/
    $('#' + id).bind('keyup', function (event) {
            var myLi = "";
            var name = $('#' + id).val().Trim();
            if (name != null && name != "") {
                $.ajax(appendInfoToURL("http://weather1.xinhong.net/airport/waypointfromname?name=" + name), {
                    cache: false,
                    dataType: 'json',
                    timeout: 10000,
                    success: function (data) {
                        if (data.status_code == 0) {
                            for (var key in data.data) {
                                myLi += "<li onclick='waypointOnfocusLi(this)'>" + data.data[key].name + "(" + data.data[key].routeident + " " + (data.data[key].lng).toFixed(2) + "°E" + " " + (data.data[key].lat).toFixed(2) + "°N" + ")" + "</li>";
                            }
                            $('#down_box').remove();
                            var myTag = "<div id='down_box'><ul id='down_list'>" + myLi + "</ul></div>";
                            $(inputWarp_div).after(myTag);
                        } else {
                            $('#down_box').remove();
                            myLi = '<div id="down_box"><ul id="down_list"></ul></div>';
                            $(inputWarp_div).after(myLi);
                        }
                    },
                    error: function () {
                        alert("请求服务失败！");
                    }
                });
            } else {
                $('#down_box').remove();
            }
        }
    );
}

//航路点文本框失去焦点事件
function waypointOnblur() {
    setTimeout(removeDown_box, 200);
}

//航路点选项卡点击事件
function waypointOnfocusLi(html) {
    var myValue = html.innerHTML;
    $('#down_box').remove();
    $('#' + choice_waypoint_id).val(myValue);
}

//航路点单点查询
function waypointOnclick(id) {
    if (typeof id != "undefined") {
        var waypointValue = $('#Choice_waypoint' + id).val();
        if (waypointValue != null && waypointValue != "") {
            var lngLat = waypointValue.split(" ");
            var lng = lngLat[1].substring(0, lngLat[1].length - 2);
            var lat = lngLat[2].substring(0, lngLat[2].length - 3);
            showDotInfo(null, lng, lat);
        } else {
            alert("航路点不能为空");
        }
    }
}

//删除down_box选项卡
function removeDown_box() {
    $('#down_box').remove();
}

/**
 * 日期格式化
 * @param fmt
 * @returns {*}
 */
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};


function showDotChanges() {
    var warpWid = $('#manyDot').width();
    $('#duoDianleftLine0').width(warpWid - 265);
    var theDifference = true;
    //todo:绘制多点单时序图
    //lng经度 -------lat纬度
    var lngs = document.getElementsByName("pointLng");
    var lats = document.getElementsByName("pointLat");
    var lng = "";
    var lat = "";
    for (var i = 0; i < lngs.length; i++) {
        if (checkLngRange(lngs[i].value) && checkLatRange(lats[i].value)) {
            lng += lngs[i].value.Trim() + ",";
            lat += lats[i].value.Trim() + ",";
        } else {
            alert("经纬度不能为空或错误！");
            return false;
        }
    }
    var finalLng = lng.substring(0, lng.length - 1);
    var finalLat = lat.substring(0, lat.length - 1);
    //interploate设置为false或0时不插值，否则插值
    $.ajax(appendInfoToURL(server_url + "himawari8l2/pointspacedata?lat=" + finalLat + "&lng=" + finalLng + "&interploate=" + theDifference), {
        cache: false,
        dataType: 'JSON',
        timeout: 10000,
        success: function (data) {
            if (data.status_code == 0) {
                $('#manyDot').stop().fadeIn(300);
                duoDianCanvas(data, theDifference);
            } else {
                alert(data.status_msg);
                return false;
            }
        },
        error: function () {
            alert("请求服务失败！");
            return false;
        }
    });
    return true;
}

//按经纬度
function Choice_lanLat(lng, lat) {
    $('#addTo li').remove();
    myLength = $('#addTo li').length;
    //console.info(myLength);
    lng = lng ? lng : "";
    lat = lat ? lat : "";
    var myTag = $('<li class="clearfix"><i class="reduce02" onclick="delDot(this)"></i><div class="inputWarp">' +
        '<input placeholder="经度" type="text" id="pointLng' + myLength + '" name="pointLng" onblur="modifyLine();" value="' + lng + '"/>' +
        '<input placeholder="纬度" type="text" id="pointLat' + myLength + '" name="pointLat" onblur="modifyLine();" value="' + lat + '"/>' +
        '</div><a href="##" class="oddDot" onclick="showDotInfo(' + myLength + ');">单点查询</a></li>' +
        '<li class="clearfix"><i class="reduce02" onclick="delDot(this)"></i><div class="inputWarp">' +
        '<input placeholder="经度" type="text" id="pointLng' + (myLength + 1) + '" name="pointLng" onblur="modifyLine();" value="' + lng + '"/>' +
        '<input placeholder="纬度" type="text" id="pointLat' + (myLength + 1) + '" name="pointLat" onblur="modifyLine();" value="' + lat + '"/>' +
        '</div><a href="##" class="oddDot" onclick="showDotInfo(' + (myLength + 1) + ');">单点查询</a></li>');
    $('#addTo').append(myTag);
}

//按机场
function Choice_airport(airport) {
    $('#addTo li').remove();
    myLength = $('#addTo li').length;
    airport = airport ? airport : "";
    $('#addTo li').remove();
    var myTag = $('<li class="clearfix"><i class="reduce02" onclick="delDot(this)"></i><div class="inputWarp">' +
        '<input placeholder="机场名称" style="width: 165px;" type="text" id="Choice_airport' + myLength + '" name="Choice_airport" onblur="airportOnblur();" onfocus="airportOnfocus(this.id)" value="' + airport + '" width="170px"/>' +
        '</div><a href="##" class="oddDot" onclick="airportOnclick(' + myLength + ');">单点查询</a></li>' +
        '<li class="clearfix"><i class="reduce02" onclick="delDot(this)"></i><div class="inputWarp">' +
        '<input placeholder="机场名称" style="width: 165px;" type="text" id="Choice_airport' + (myLength + 1) + '" name="Choice_airport" onblur="airportOnblur();" onfocus="airportOnfocus(this.id)" value="' + airport + '" width="170px"/>' +
        '</div><a href="##" class="oddDot" onclick="airportOnclick(' + (myLength + 1) + ');">单点查询</a></li>');
    $('#addTo').append(myTag);
}
//按航路点
function Choice_waypoint(waypoint) {
    $('#addTo li').remove();
    myLength = $('#addTo li').length;
    waypoint = waypoint ? waypoint : "";
    var myTag = $('<li class="clearfix"><i class="reduce02" onclick="delDot(this)"></i><div class="inputWarp">' +
        '<input placeholder="航路点名称" style="width: 165px;"  type="text" id="Choice_waypoint' + myLength + '" name="Choice_waypoint" onblur="waypointOnblur();" onfocus=" waypointOnfocus(this.id)" value="' + waypoint + '"/>' +
        '</div><a href="##" class="oddDot" onclick="waypointOnclick(' + myLength + ');">单点查询</a></li>' +
        '<li class="clearfix"><i class="reduce02" onclick="delDot(this)"></i><div class="inputWarp">' +
        '<input placeholder="航路点名称" style="width: 165px;"  type="text" id="Choice_waypoint' + (myLength + 1) + '" name="Choice_waypoint" onblur="waypointOnblur();" onfocus="waypointOnfocus(this.id)" value="' + waypoint + '"/>' +
        '</div><a href="##" class="oddDot" onclick="waypointOnclick(' + (myLength + 1) + ');">单点查询</a></li>');
    $('#addTo').append(myTag);
}

function addDot(event, lng, lat, airport, waypoint) {
    myLength = $('#addTo li').length;
    $('#addTo li i').css('background', 'url(./static/image/reduce02.png) no-repeat left center');
    lng = lng ? lng : "";
    lat = lat ? lat : "";
    airport = airport ? airport : "";
    waypoint = waypoint ? waypoint : "";
    if (myLength <= 9) {
        if ($('#btnBtn1').hasClass("current")) {
            var myTag = $('<li class="clearfix"><i class="reduce02" onclick="delDot(this)"></i><div class="inputWarp">' +
                '<input placeholder="经度" type="text" id="pointLng' + myLength + '" name="pointLng" onblur="modifyLine();" value="' + lng + '"/>' +
                '<input placeholder="纬度" type="text" id="pointLat' + myLength + '" name="pointLat" onblur="modifyLine();" value="' + lat + '"/>' +
                '</div><a href="##" class="oddDot" onclick="showDotInfo(' + myLength + ');">单点查询</a></li>');
        } else if ($('#btnBtn2').hasClass("current")) {
            var myTag = $('<li class="clearfix"><i class="reduce02" onclick="delDot(this)"></i><div class="inputWarp">' +
                '<input placeholder="机场名称" style="width: 165px;" type="text" id="Choice_airport' + myLength + '" name="Choice_airport" onblur="airportOnblur();" onfocus="airportOnfocus(this.id)" value="' + airport + '" width="170px"/>' +
                '</div><a href="##" class="oddDot" onclick="airportOnclick(' + myLength + ');">单点查询</a></li>');
        } else if ($('#btnBtn3').hasClass("current")) {
            var myTag = $('<li class="clearfix"><i class="reduce02" onclick="delDot(this)"></i><div class="inputWarp">' +
                '<input placeholder="航路点名称" style="width: 165px;"  type="text" id="Choice_waypoint' + myLength + '" name="Choice_waypoint" onblur="waypointOnblur();" onfocus="waypointOnfocus(this.id)" value="' + waypoint + '"/>' +
                '</div><a href="##" class="oddDot" onclick="waypointOnclick(' + myLength + ');">单点查询</a></li>');
        }
        $('#addTo').append(myTag);
        $(this).removeClass('add');
    }
    if (myLength == 9) {
        $('#addDot').addClass('add').html('已添加至最多');
    }
}

function delDot(id) {
    $('#addDot').removeClass('add').html('再加一点(最多十点)');
    var myLength = $('#addTo li').length;
    if (myLength > 2) {
        $(id).parent().remove();
        modifyLine();
    }
    if (myLength == 3) {
        $('#addTo li:lt(2) i').css('background', 'url(./static/image/reduce.png) no-repeat left center');
    }
}


function createAirPortMsg(data, airPortName) {

    var fcstData = data.fcst[0].fcst;
    var realData = data.real;
    var fcstDate = "";

    /*********************实况********************/
    var realwswd = realData.WDCHN ? realData.WDCHN : "";
    realwswd = realData.WSCHN ? realwswd + " " + realData.WSCHN : realwswd;
    realwswd = realData.GWSCHN ? realwswd + "（阵风" + fcstData.GWSCHN + "）" : realwswd;
    var realVis = realData.VISCHN ? realData.VISCHN : "";
    var realWTHC = realData.WTHC ? realData.WTHC : "";
    var realTTCHN = realData.TTCHN ? realData.TTCHN : "";
    var fcstmsgchn = realData.FCSTMSGCHN ? realData.FCSTMSGCHN : "";
    var realCn = "";
    if (realData.CN1CHN) {
        realCn += realData.CN1CHN;
    }
    if (realData.CH1CHN) {
        if (realCn) {
            realCn += "/";
        }
        realCn += realData.CH1CHN;
    }

    if (realData.CN2CHN) {
        if (realCn) {
            realCn += "、";
        }
        realCn += realData.CN2CHN;
    }
    if (realData.CH2CHN) {
        if (realData.CN2CHN) {
            realCn += "/";
        }
        realCn += realData.CH2CHN;
    }

    if (realData.CN3CHN) {
        if (realCn) {
            realCn += "、";
        }
        realCn += realData.CN3CHN;
    }
    if (realData.CH3CHN) {
        if (realData.CN3CHN) {
            realCn += "/";
        }
        realCn += realData.CH3CHN;
    }

    /*********************预报********************/
    var endData = data.fcst[0].TIME_ED ? data.fcst[0].TIME_ED : data.fcst[0].TIME_ED;
    //预报时效
    if (fcstDate.TIME_BG) {
        fcstDate = fcstData.TIME_BG + " -" + endData;
    }
    var fsctmsgchn = data.fcst[0].FCSTMSGCHN ? data.fcst[0].FCSTMSGCHN : "";
    var fcstCn = "";
    if (fcstData.CN1CHN) {
        fcstCn += fcstData.CN1CHN;
    }
    if (fcstData.CH1CHN) {
        if (realCn) {
            fcstCn += "/";
        }
        fcstCn += fcstData.CH1CHN;
    }

    if (fcstData.CN2CHN) {
        if (fcstCn) {
            fcstCn += "、";
        }
        fcstCn += fcstData.CN2CHN;
    }
    if (fcstData.CH2CHN) {
        if (fcstData.CN2CHN) {
            fcstCn += "/";
        }
        fcstCn += fcstData.CH2CHN;
    }

    if (fcstData.CN3CHN) {
        if (fcstCn) {
            fcstCn += "、";
        }
        fcstCn += fcstData.CN3CHN;
    }
    if (fcstData.CH3CHN) {
        if (fcstData.CN3CHN) {
            fcstCn += "/";
        }
        fcstCn += fcstData.CH3CHN;
    }
    var fcstVISCHN = fcstData.VISCHN ? fcstData.VISCHN : "";
    var fcstWTHC = fcstData.WTHC ? fcstData.WTHC : "";

    var fcstwswd = fcstData.WDCHN ? fcstData.WDCHN : "";
    fcstwswd = fcstData.WSCHN ? fcstwswd + " " + fcstData.WSCHN : fcstwswd;
    fcstwswd = fcstData.GWSCHN ? fcstwswd + "（阵风" + fcstData.GWSCHN + "）" : fcstwswd;
    var fcstTT = fcstData.TT ? fcstData.TT : "";

    // fcstData.WSCHN
    $('#msgTitle').html(data.code4 + "&nbsp;" + airPortName);
    airportLanding(data.code4);
    airportAndtakeOff(data.code4);
    var html = /*"<h4>" + data.code4 + "&nbsp;" + airPortName + "</h4>" +*/
        "<div class='top'><h5>机场实况</h5>" +
        "<ul><li>观测时间：" + data.odate + "</li><li>能见度：" + realVis + "</li><li>云：" + realCn + "</li><li>天气现象：" + realWTHC + "</li><li>风：" + realwswd + "</li><li>温度：" + realTTCHN + "</li><li>变化：" + fcstmsgchn + "</li></ul></div>" +
        "<div class='bottom'><h5>机场预报</h5><ul><li>预报时效：" + fcstDate + "</li><li>能见度：" + fcstVISCHN + "</li><li>云：" + fcstCn + "</li><li>天气现象：" + fcstWTHC + "</li><li>风：" + fcstwswd + "</li><li>温度：" + fcstTT + "</li><li>变化：" + fsctmsgchn + "</li></ul></div>" +
        "<p>" + data.msg + "</p><p>" + data.fcst[0].msg + "</p>";
    return html;
}

//机场着陆标准
function airportLanding(airportName) {
    $.getJSON("static/json/airport_land.json", function (data) {
        var keys = [];
        var i = 0;
        for (var key in data.data) {
            keys[i] = key;
            i++;
        }
        if ($.inArray(airportName, keys) < 0) {
            //没有此机场
            var htmlstr = "<table border='1px'>"
                + "<tr>"
                + "<td >" + "Run Way" + "</td>"
                + "<td >" + "Come Near Type" + "</td>"
                + "<td >" + "Come Near Normal" + "</td>"
                + "<td >" + "C Kind" + "</td>"
                + "</tr>"
                + "</table>";
            $('#landing').html(htmlstr);
        } else {
            var rows = data.data[airportName].length; //行
            var cols = 4;    //列
            var htmlstr = "<table border='1px'>";
            for (var i = 0; i <= rows; i++) {
                htmlstr += "<tr>";
                for (var j = 1; j <= cols; j++) {
                    if (i == 0 && j == 1) {
                        htmlstr += "<td >" + "Run Way" + "</td>";
                    } else if (i == 0 && j == 2) {
                        htmlstr += "<td >" + "Come Near Type" + "</td>";
                    } else if (i == 0 && j == 3) {
                        htmlstr += "<td >" + "Come Near Normal" + "</td>";
                    } else if (i == 0 && j == 4) {
                        htmlstr += "<td >" + "C Kind" + "</td>";
                    } else {
                        if (j == 1) {
                            htmlstr += "<td >" + data.data[airportName][i - 1].RW + "</td>";
                        } else if (j == 2) {
                            htmlstr += "<td >" + data.data[airportName][i - 1].CNT + "</td>";
                        } else if (j == 3) {
                            htmlstr += "<td >" + data.data[airportName][i - 1].CNN + "</td>";
                        } else if (j == 4) {
                            htmlstr += "<td >" + data.data[airportName][i - 1].CK + "</td>";
                        }
                    }
                }
                htmlstr += "</tr>";
            }
            htmlstr += "</table>";
            $('#landing').html(htmlstr);
        }
    })
}

//机场起飞标准
function airportAndtakeOff(airportName) {
    $.getJSON("static/json/airport_take_off.json", function (data) {
        var keys = [];
        var i = 0;
        for (var key in data.data) {
            keys[i] = key;
            i++;
        }
        if ($.inArray(airportName, keys) < 0) {
            //没有此机场
            var htmlstr = "<table border='1px'>"
                + "<tr>"
                + "<td >" + "Run Way" + "</td>"
                + "<td >" + "Acraft Type" + "</td>"
                + "<td >" + "Hirl Rcls" + "</td>"
                + "<td >" + "Hirl" + "</td>"
                + "<td >" + "Hirl Rcls Stop" + "</td>"
                + "</tr>"
                + "</table>";
            $('#takeOff').html(htmlstr);
        } else {
            var rows = data.data[airportName].length; //行
            var cols = 5;    //列
            var htmlstr = "<table border='1px'>";
            for (var i = 0; i <= rows; i++) {
                htmlstr += "<tr>";
                for (var j = 1; j <= cols; j++) {
                    if (i == 0 && j == 1) {
                        htmlstr += "<td >" + "Run Way" + "</td>";
                    } else if (i == 0 && j == 2) {
                        htmlstr += "<td >" + "Acraft Type" + "</td>";
                    } else if (i == 0 && j == 3) {
                        htmlstr += "<td >" + "Hirl Rcls" + "</td>";
                    } else if (i == 0 && j == 4) {
                        htmlstr += "<td >" + "Hirl" + "</td>";
                    } else if (i == 0 && j == 5) {
                        htmlstr += "<td >" + "Hirl Rcls Stop" + "</td>";
                    } else {
                        if (j == 1) {
                            htmlstr += "<td >" + data.data[airportName][i - 1].RW + "</td>";
                        } else if (j == 2) {
                            htmlstr += "<td >" + data.data[airportName][i - 1].AT + "</td>";
                        } else if (j == 3) {
                            htmlstr += "<td >" + data.data[airportName][i - 1].HR + "</td>";
                        } else if (j == 4) {
                            htmlstr += "<td >" + data.data[airportName][i - 1].H + "</td>";
                        } else if (j == 5) {
                            htmlstr += "<td >" + data.data[airportName][i - 1].HRS + "</td>";
                        }
                    }
                }
                htmlstr += "</tr>";
            }
            htmlstr += "</table>";
            $('#takeOff').html(htmlstr);
        }
    })
}

// 机场预报 着路起飞标准 切换
$(function () {
    $('#popup #popupTab li').click(function () {
        $(this).addClass('bgcolor').siblings().removeClass('bgcolor');
        $('#popupTabNet>div').eq($(this).index()).show().siblings().hide();
    })

})

function getFillColor(elem, val) {
    if (elem == 'ICE') {
        if (val <= 0.7) {
            return 'rgba(0, 0, 0, 0)';
        } else if (val <= 2) {
            return 'rgba(0, 236, 236, 0.35)';
        } else if (val <= 3.5) {
            return 'rgba(1, 160, 246, 0.6)';
        } else {
            return 'rgba(0, 0, 255, 0.75)';
        }
    }
    if (elem == 'TURB') {
        if (val <= 0.7) {
            return 'rgba(0, 0, 0, 0)';
        } else if (val <= 2) {
            return 'rgba(254, 201, 89, 0.25)';
        } else if (val <= 3.5) {
            return 'rgba(235, 111, 19, 0.35)';
        } else {
            return 'rgba(110, 39, 6, 0.35)';
        }
    }
    if (elem == 'RH') {
        var r = 0.95, g = 1.0, b = 0.95, a = 0.6;
        var delta = val - 20;
        var maxDeltaRight = 100;
        r = r - delta * 1.0 / maxDeltaRight;
        if (r < 0.1) r = 0.1; else if (r > 1.0) r = 1.0;
        g = g - delta * 0.5 / maxDeltaRight;
        if (g < 0.5) g = 0.5; else if (g > 1.0) g = 1.0;
        b = b - delta * 1.0 / maxDeltaRight;
        if (b < 0.1) b = 0.1; else if (b > 1.0) b = 1.0;
        a = a + delta * 2.0 / maxDeltaRight;
        if (a > 1.0) a = 0.9;
        return 'rgba(' + Math.round(r * 255) + ',' + Math.round(g * 255) + ',' + Math.round(b * 255) + ',' + a + ')';
    }
}






function convertLatLng(lat, lng) {
    var slat = Math.abs(lat);
    var slng = Math.abs(lng);

    if (lat >= 0) {
        slat += "°N";
    } else {
        slat += "°S";
    }

    if (lng >= 0) {
        slng += "°E";
    } else {
        slng += "°W";
    }

    return slat + "" + slng;
}
function isNum(str) {
    var r = /^(-)?\d+(\.\d+)?$/;
    var flag = r.test(str);
    return flag;
}

function checkLatRange(lat) {
    if (isNum(lat)) {
        if (lat <= 90 && lat >= -90) {
            return true;
        }
    } else {
        return false;
    }
}
function checkLngRange(lng) {

    if (isNum(lng)) {
        if (lng <= 180 && lng >= -180) {
            return true;
        }
    } else {
        return false;
    }
}

/**
 * 加载手绘列表div
 */

$("#handerDrawList").click(function () {
    $("#handerDrawSpace").show();
});
$("#delHander").click(function () {
    $("#handerDrawSpace").hide();
});
$("#myHanderBtn").click(function () {
    var handerDate = $("#handerDate").val();

    if (handerDate != null && handerDate != "" && handerDate != 'undefined') {
        var date = handerDate.split("/");
        var year = date[2];
        var month = date[0];
        var day = date[1];
        $.ajax({
            data: {
                year: year,
                month: month,
                day: day
            },
            url: 'fileController/getFileList',
            type: 'post',
            success: function (obj) {
                if (obj) {
                    var html = '';
                    for (var i = 0; i < obj.length; i++) {
                        var path = obj[i].value;
                        var fileName = obj[i].key;
                        html += '<li><a class="handerFiles" href="##" tid=' + path + ' name=' + fileName + ' >' + fileName + '</a></li>';
                    }
                    $("#handerJsList").html(html);
                    $(".handerFiles").on('click', function () {
                        $("#myInput").val($(this).attr('name'));
                        $("#getHanderDraw").attr('tid', $(this).attr('tid'));
                    });
                }
            }
        })
    }
});
