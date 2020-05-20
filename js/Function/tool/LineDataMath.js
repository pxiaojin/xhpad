function smoothIsoline(lineData) {
    if (!lineData)
        return;
    var lnglats = [];
    for(var j = 0; j < lineData.pointNum; j++) {
        lnglats.push(ol.proj.fromLonLat([lineData.lng[j], lineData.lat[j]]));
    }
    var smoothXYArr = smoothLine(lnglats, 0.1, 0.5);
    return smoothXYArr;
    // var positions = [];
    // smoothXYArr.forEach(lnglat => {
    //     positions.push(ol.proj.fromLonLat([lnglat[0], lnglat[1]]));
    // });
    // return positions;
}