define([], function() {

    /**
     * 格式化基础数据
     * @param {*} start 
     * @param {*} data 
     * @param {*} end 
     */
    function data(start, data, end){
        start = start ? start : '';
        end = end ? end : '';
        data = data ? 
                    start + data + end :
                    start + '--' + end;
        return data;
    }

     /**
     * 格式化基础数据保留1位小数
     * @param {*} start 
     * @param {*} data 
     * @param {*} end 
     */
    function data1(start, data, end){
        start = start ? start : '';
        end = end ? end : '';
        data = data ? 
                    start + (((data * 10) >> 0) / 10) + end :
                    start + '--' + end;
        return data;
    }


    /**
     * 格式化城市名
     * @param {*} name 
     */
    function cityName(name){
        if(name) return name;
        return '--';
    }

    /**
     * 格式化机场名
     * @param {*} name 
     */
    function airportName(name){
        name = name
                ? name.indexOf('机场') != -1  
                    ? name
                    : name + '机场'
                : '--';
        return name
    }

    /**
     * 格式化经纬度
     * @param {*} lng 
     * @param {*} lat 
     */
    function lnglat(lng, lat){
        while(lng > 180) {
            lng -=360;
        }
        while(lng < -180) {
            lng +=360;
        }
        lng = parseFloat(lng).toFixed(2);// ((parseFloat(lng) * 100) >> 0) / 100;
        lat = parseFloat(lat).toFixed(2);//((parseFloat(lat) * 100) >> 0) / 100;
        if((lng || lng == 0) 
                && (lat || lat == 0)) {
            lng = lng >= 0 ? lng + 'E' : Math.abs(lng) + 'W';
            lat = lat >= 0 ? lat + 'N' : Math.abs(lat) + 'S';
            return lat + ' , ' + lng;
        }
        return '--,--';
    }

    /**
     * 格式化时间，显示年月日
     * @param {*} year 
     * @param {*} month 
     * @param {*} day 
     */
    function timeDay(year, month, day){
        year = year ? year + '年' : '----年';
        month = parseInt(month);
        month = month 
                    ? month < 10 
                        ? '0' + month + '月'
                        : month + '月'
                    : '--月';
        day = parseInt(day);
        day = day 
                ? day < 10 
                    ? '0' + day + '日'
                    : day + '日'
                : '--日';
        return year + month + day;
    }

    /**
     * 格式化时间 显示XX：00格式
     * @param {*} hour
     */
    function timeHour(hour){
        hour = parseInt(hour);
        hour = hour 
                ? hour < 10
                    ? '0' + hour + ':00'
                    : hour + ':00'
                : '--:--';
        return hour
    }

    /**
     * 返回x年x月x日x时格式
     * @param {*} year 
     * @param {*} month 
     * @param {*} day 
     * @param {*} hour 
     */
    function dayHour(year, month, day, hour){
        return ''
    }

    /**
     * 格式化时间
     * @param {*} year 
     * @param {*} month 
     * @param {*} day 
     * @param {*} hour 
     * @param {*} vti 
     */
    function time(year, month, day, hour, vti){
        var QBtime = new Date(year,
                     parseInt(month) - 1, day, hour);
        var Ntime = new Date(QBtime.getTime() + 
                    (parseInt(vti) * 60 *60 *1000));
        vti = vti ? '+' + vti: '+---';
        return {
            QBDayHour: dayHour(QBtime.getFullYear(),
                QBtime.getMonth + 1, QBtime.getDate(),
                QBtime.getHours()),
            Ntime: dayHour(QBtime.getFullYear(),
                QBtime.getMonth + 1, QBtime.getDate(),
                QBtime.getHours()),
            VTI: vti,
        }
    }

    /**
     * 格式化json返回的时间
     * @param {*} time 
     */
    function jsonDate(time){
        time = time.split('_');
        var date = '', date1 = '';
        if(time && time[0]) {
            date = new Date(time[0].substring(0, 4), parseInt(time[0].substring(4, 6)) -1,
                            time[0].substring(6, 8), time[0].substring(8, 10),
                            time[0].substring(10, 12));
            if(time[1]) {
                date1 = new Date(date.getTime() + parseInt(time[1]) * 60 * 60 * 1000);
                date1 = (date1.getMonth() + 1) + '月' + date1.getDate() + '日 ' +
                        (date1.getHours() < 10 ? '0' + date1.getHours() : date1.getHours())
                        + ':' +
                        (date1.getMinutes() < 10 ? '0' + date1.getMinutes() : date1.getMinutes());
            }
            date = (date.getMonth() + 1) + '月' + date.getDate() + '日 ' +
                    (date.getHours() < 10 ? '0' + date.getHours() : date.getHours())
                    + ':' +
                    (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
        }
        return [date, date1];
    }

    /**
     * 格式化温度
     * @param {*} t 
     */
    function tt(t){
        t = parseFloat(t);
        t = t || t == 0 
                ? ((t * 10) >> 0) / 10 + '℃' 
                : '--℃';
        return t
    }

    /**
     * 格式化能见度
     * @param {} vis 
     */
    function vis(vis){
        vis = parseInt(vis);
        vis = vis || vis == 0
                ? vis >= 50
                    ? vis >= 1000
                        ? parseInt(vis / 1000)+ 'km'
                        : vis + 'm'
                    : '小于50m'
                : '--m'
        return vis;
    }

    /**
     * 降水
     * @param {*} rn 
     */
    function rn(rn){
        rn = parseFloat(rn);
        rn = rn && rn == -1
                ? '缺测' : rn || rn == 0               
                ? rn.toFixed(1) + 'mm'
                : '--mm'
        return rn;
    }

    /**
     * 云量
     * @param {*} cn 
     */
    function cn(cn){
        cn = parseInt(cn);  //去掉小数点的，非四舍五入
        cn = cn || cn == 0
                ? cn + '成'
                : '--成'
        return cn;
    }

    /**
     * 云高
     * @param {} ch 
     */
    function ch(ch){
        ch = parseFloat(ch);
        ch = ch || ch == 0
                ? (((ch * 10) >> 0) / 10) + 'm'
                : '--m'
        return ch;
    }

    /**
     * 海平面气压
     * @param {*} pr 
     */
    function pr(pr) {
        pr = parseFloat(pr);
        pr = pr || pr == 0
                ? (((pr * 10) >> 0) / 10) + 'hPa'
                : '--hPa'
        return pr;
    }

    /**
     * 格式化风 风速m/s，风向度数
     * @param {*} wd 
     * @param {*} ws 
     */
    function wind(wd, ws){
        wd = parseFloat(wd);
        wd = wd || wd == 0
                ? wd >= 360 
                    ? (((wd - 360) * 10) >> 0) / 10 + '°'
                    : ((wd * 10) >> 0) / 10 + '°'
                : '--°';
        return  wd + ' ' + windSpeed(ws);
    }

    /**
     * 格式化风速
     * @param {*} ws 
     */
    function windSpeed(ws){
        ws = parseFloat(ws);
        ws = ws || ws == 0 
                    ? (((ws * 10) >> 0) / 10) + 'm/s'
                    : '--m/s'
        return ws;
    }

    //  风向转换
    function windDeg(type){
        var wd;
        switch(type){
            case '北风':
                wd = '0';
                break;
            case '东北风':
                wd = '45';
                break;
            case '东风':
                wd = '90';
                break;
            case '东南风':
                wd = '135';
                break;
            case '南风':
                wd = '180';
                break;
            case '西南风':
                wd = '225';
                break;
            case '西风':
                wd = '270';
                break;
            case '西北风':
                wd = '315';
                break;
        }
        return wd;
    }

    /**
     * 根据中心风速计算阵风
     * @param {*} ws 
     */
    function windMax(ws){
        ws = ws * 1.94386;
        var gust = '--';
        ws = ws < 0 ? 0 : ws;
        gust = ws == 0 ? '--' :
                ws < 28 ? ws + 4:
                ws < 35 ? ws + 8:
                ws < 45 ? ws + 10:
                ws < 50 ? ws + 12:
                ws < 70 ? ws + 15:
                ws < 100 ? ws + 20 :
                         ws + 25;
        gust = gust / 1.94386;
        gust = ((gust * 10) >> 0) / 10;
        return gust + 'm/s';
    }
    
    /**
     * 湿度
     * @param {*} rh 
     */
    function rh(rh) {
        rh = parseFloat(rh);
        rh = rh || rh == 0 
                ? (((rh * 10) >> 0) / 10) + '%'
                : '--%';
        return rh;
    }

    /**
     * 雷暴概率
     * @param {*} ts 
     */
    function ts(ts){
        ts = parseFloat(ts);
        ts = ts || ts == 0 
                ? (((ts * 10) >> 0) / 10) + '%'
                : '--%';
        return ts;
    }

    /**
     * 根据代号获取天气
     * @param {*} wth 
     */
    function weather(wth){
        var weatherImage = [
            "晴",   "少云",    "晴",   "多云",  "烟",
            "霾",   "浮尘",    "浮尘", "尘旋",  "沙尘暴",
            "轻雾", "片状浅雾", "连续浅雾","闪电无雷声","降水未达地面",
            "降水","降水", "雷暴无降水","飑","漏斗云",
            "毛毛雨","雨","雪","雨夹雪","冻雨",
            "阵雨","阵雪","冰雹", "雾或冰雾", "雷暴",
            "轻中度沙尘暴","轻中度沙尘暴", "轻中度沙尘暴", "强沙尘暴", "强沙尘暴",
            "强沙尘暴", "轻中度低吹雪","强低吹雪","轻中度低吹雪", "强低吹雪",
            "雾", "冰雾","雾或冰雾","雾或冰雾", "雾或冰雾",
            "雾或冰雾","雾或冰雾","雾或冰雾","雾淞","雾淞",
            "毛毛雨","毛毛雨","毛毛雨", "毛毛雨","毛毛雨",
            "毛毛雨",  "冻毛毛雨", "冻毛毛雨", "毛毛雨夹雨", "毛毛雨夹雨",
            "小雨", "小雨", "中雨", "中雨", "大雨",
            "大雨","轻度冻雨", "中等冻雨", "轻度雨夹雪", "中等雨夹雪",
            "小雪", "小雪", "中雪","中雪","大雪",
            "大雪", "冰针","米雪","雪晶","冰粒",
            "小阵雨", "中等阵雨", "大阵雨","小阵雨夹雪","中等阵雨夹雪",
            "小阵雪", "中等阵雪","阵雪或冰雹", "中等阵雪或冰雹", "阵雪或冰雹",
            "中等阵雪或冰雹", "小雨", "中雨","小雪或雨夹雪","中雪或雨夹雪",
            "雷阵雨", "雷暴伴有冰雹", "强雷阵雨","雷暴伴有沙尘暴","强雷暴伴有冰雹"
        ]
        wth = wth > 99 || wth < 0 ? 
                "--" : 
                weatherImage[wth];
        return wth;
    }
    return {
        data: data,
        data1: data1,
        cityName: cityName,
        airportName: airportName,
        lnglat: lnglat,
        timeDay: timeDay,
        timeHour: timeHour,
        jsonDate: jsonDate,
        tt: tt,
        vis: vis,
        rn: rn,
        cn: cn,
        ch: ch,
        pr: pr,
        wind: wind,
        windSpeed: windSpeed,
        windMax: windMax,
        rh: rh,
        ts: ts,
        weather: weather,
        windDeg: windDeg
    }
});