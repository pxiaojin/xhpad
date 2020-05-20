// m/s转换为km/小时
function msTokmH(speed) {
    return speed * 3.6;
}
// km每小时转化为节
function kmToKnot(speed) {
    return speed / 1.852;
}
// m/s转换为节
function mToKnot(speed) {
    return speed / 0.514
}
function toDecimal(x, number) {
    var f = parseFloat(x);
    if (isNaN(f)) {
        return;
    }
    let round = Math.pow(10, number);
    f = Math.round(x*round)/round;
    return f;
}