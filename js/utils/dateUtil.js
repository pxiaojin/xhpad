function toUTC(time) {
    var offset = new Date().getTimezoneOffset();
    var locale = new Date(parseInt(time.year), parseInt(time.month) - 1, parseInt(time.day), parseInt(time.hour));
    var utcDate = new Date(locale.getTime() + offset * 60 * 1000);
    return toTimeMap(utcDate, time.vti);
}

function toLocale(utcTime) {
    var offset = new Date().getTimezoneOffset();
    var utcDate = new Date(parseInt(utcTime.year), parseInt(utcTime.month) - 1, parseInt(utcTime.day), parseInt(utcTime.hour));
    var locale = new Date(utcDate.getTime() - offset * 60 * 1000);
    return toTimeMap(locale, utcTime.vti);
}

function toTimeMap(date, vti) {
    let timeInfo = {
    }
    timeInfo.year = date.getFullYear() + '';
    timeInfo.month = date.getMonth() < 9 ? ('0' + (date.getMonth() + 1)) : ('' + (date.getMonth() + 1));
    timeInfo.day = date.getDate() < 10 ? ('0' + date.getDate()) : ('' + date.getDate());
    timeInfo.hour = date.getHours() < 10 ? ('0' + date.getHours()) : ('' + date.getHours());
    // timeInfo.vti = vti + '';
    return timeInfo;
}

function toRealDateStr(time, format='yyyy年MM月dd日HH时') {
    var startTime = new Date(parseInt(time.year), parseInt(time.month) - 1, parseInt(time.day), parseInt(time.hour));
    var curdate = new Date(startTime.getTime() + 
                time.vti ? (parseInt(time.vti) * 60 *60 *1000):0);
    return formatDate(curdate, format);
}

function formatDate(time, format='yyyy-MM-dd HH:mm:ss') {

    var date = null;
    if (typeof(time) == 'string')
        date = new Date(time)
    else if (typeof(time) == 'number')
        date = new Date(time)
    else if (time instanceof Date)
        date = time;
    else if (typeof(time) == 'object')
        date = new Date(parseInt(time.year), 
                        parseInt(time.month) + 1, 
                        parseInt(time.day),
                        time.hour?parseInt(time.hour):0, 
                        time.minute?parseInt(time.minute):0, 
                        time.second?parseInt(time.second):0);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minutes = date.getMinutes();
    let second = date.getSeconds();
    var preArr = Array.apply(null, Array(10)).map(function(elem, index){
        return '0' + index;
    })
    var newTime = format.replace(/yyyy/g,year)
                        .replace(/MM/g,preArr[month]||month)
                        .replace(/dd/g,preArr[day]||day)
                        .replace(/HH/g,preArr[hour]||hour)
                        .replace(/mm/g,preArr[minutes]||minutes)
                        .replace(/ss/g,preArr[second]||second);
    return newTime;
}