define([], function() {
   var http = {
        ecmfUrlNew:'http://ocean.xinhong.net:7012',
        weatherUrl:'https://weather.xinhong.net/xhweatherfcsys',
        imgUrl:'https://weather.xinhong.net',
        oceanUrl:'https://ocean.xinhong.net',
        ecmfUrl:'http://ocean.xinhong.net:8000/xhweatherfcsys', //生产环境中使用
        // ecmfUrl:'http://ocean.xinhong.net:9082/xhweatherfcsys',
        // ecmfUrl: 'http://192.6.1.241:9082',
        // ecmfImgUrl:'http://192.6.1.23:9082',
        testIp:'http://ocean.xinhong.net:7020',
        buoyUrl:'http://ocean.xinhong.net:7018',
        ecmfImgUrl:'http://ocean.xinhong.net:8000',
        userUrl:'http://ocean.xinhong.net:7011/',
        // userUrl:'http://192.6.1.115:8080/',
        // oceanUrl:'http://ocean.xinhong.net',
        /**
         * 根据get方式请求数据
         * @param {*} host host路径
         * @param {*} url  后续路径
         * @param {*} param    参数
         * @param {*} callback      成功回调
         * @param {*} errorback     无数据回调
         */
        get: function(host, url, param, callback, errorback){
            var myParam = '?';
            for(var key in param) {
                myParam += key + '=' + param[key] + '&';
            }
            $.ajax({
                url: appendInfoToURL(host + url + myParam),
                dataType:'json',
                success:function(json){
                    if(json.status_code != 0) {
                        errorback ? errorback(json):null;
                        return;
                    }
                    callback ? callback(json) : null;
                },
                error: function(error){
                    errorback ? errorback(error):null;
                }
            })
        },
        /**
         * 网络请求获取数据
         * @param {string} url  后续路径
         * @param {*} param     请求参数
         * @param {function} callback  回调函数
         */
        http: function (url, param, callback, errorback){
            $.ajax({
                url: appendInfoToURL(http.weatherUrl + url + param),
                // param:'',
                dataType:'json',
                success:function(json){
                    if(json.status_code != 0) {
                        console.log('数据错误');
                        errorback ? errorback(json) : null;
                        return;
                    }
                    callback ? callback(json.data, json.time) : null;
                },
                error: function(error){
                    errorback ? errorback(error):null;
                }
            })
        },
        oceanHttp: function(url, param, callback, errorback){
            $.ajax({
                url: appendInfoToURL(http.oceanUrl + url + param),
                // param:'',
                dataType:'json',
                success:function(json){
                    if(json.status_code != 0) {
                        console.log('数据错误');
                        errorback ? errorback(json) : null;
                        return;
                    }
                    callback ? callback(json.data, json.time) : null;
                },
                error: function(error){
                    errorback ? errorback(error):null;
                }
            })
        },
        Http: function(url, param, callback){
            $.ajax({
                url: appendInfoToURL(url + param),
                // param:'',
                dataType:'json',
                success:function(json){
                    if(json.status_code != 0) {
                        console.log('数据错误');
                        return;
                    }
                    callback ? callback(json.data, json.time) : null;
                }
            })
        },
   }

   

   return http;
});


//https://weather.xinhong.net/xhweatherfcsys/stationdata_surf/seqdatafromcode?code=54523&elem=PR   TLOGP图