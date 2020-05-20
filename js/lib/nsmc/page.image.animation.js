var DEFAULT_LON = 116.4;
var DEFAULT_LAT = 39.9;
var VALID_RANGE = { LON : {MIN : 59, MAX : 137}, LAT : {MIN : 3, MAX : 54}};

//默认初始化  无数据 入口
var fy4AnimationCtrl = new ol.FY4AnimationController();


//定义EPSG:4490，具体的字符串参数你可以在：http://epsg.io中查询到，只需输入你的projection的EPSG码或者坐标系的名称
//即可获得相应坐标系的字符串参数，直接将其复制到代码中即可
proj4.defs("EPSG:6933","+proj=cea +lon_0=0 +lat_ts=30 +x_0=0 +y_0=0 +ellps=WGS84 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
//获得定义的坐标系
var projection6933 = new ol.proj.get('EPSG:6933');

// var nsmc_image_web_site = 'http://fy4.nsmc.org.cn/nsmc/v1/nsmc/image/animation/';
// var nsmc_image_web_site = 'http://ocean.xinhong.net:81/fy4a/';
var nsmc_image_web_site = 'http://47.93.6.45/fy4a/';

//从服务器获取数据时间列表，成功后添加动画图层   
var defaultFileNameCode='FY4A-_AGRI--_N_REGI_1047E_L1C_MTCC_MULT_GLL_YYYYMMDDhhmmss_YYYYMMDDhhmmss_4000M_V0001.JPG';
var defaultHours=3;
var TIME_LIST_MONGODB = nsmc_image_web_site + "mongodb";
var TIME_LIST_FILESYS = nsmc_image_web_site + "filesys";
var defaultTimeListUrl = TIME_LIST_MONGODB;
var defaultTileType=ol.FY4AnimationController.AnimationLayerType.TILE;
var defaultserviceUrl='//satellite.nsmc.org.cn/mongoTile_DSS/FY/TileServer.php?layer=PRODUCT&PRODUCT=FY4A-_AGRI--_N_REGI_1047E_L1C_MTCC_MULT_GLL_YYYYMMDDhhmmss_YYYYMMDDhhmmss_4000M_V0001.JPG';
var defaultExtext;
var defaultZoom = 5;
var defaultMinZoom=4;
var defaltMaxZoom = 8;
    
var defaltInitlat,defaltInitlon;
var defaultAreatype,defaultProjectiontype,defaultCoordinate,defaultProjection,defaltIsHaveNight;

var isFY4 = false;

var isHaveMapWorld=false;
var currentImageName;//当前动画文件编码

var nmsc_statellites = [{"SATELLITE":"FY-4A","SATELLITECHN":"FY-4A"}];

var nsmc_areas = [
	{"AREACHN":"中国区域","AREA":"China","ORDERNO":1088},
	// {"AREACHN":"全圆盘","AREA":"Disk","ORDERNO":2083},
	// {"AREACHN":"南海海区","AREA":"South China Sea","ORDERNO":3007},
	// {"AREACHN":"西北太平洋海区","AREA":"NW Pacific","ORDERNO":4007}
]

var product_infos = [
				//FY4A-_AGRI--_N_REGI_1047E_L1C_MTCC_MULT_GLL_YYYYMMDDhhmmss_YYYYMMDDhhmmss_4000M_V0001.JPG
	{"imagename":"FY4A-_AGRI--_N_REGI_1047E_L1C_MTCC_MULT_GLL_YYYYMMDDhhmmss_YYYYMMDDhhmmss_4000M_V0001.JPG","displayname":"Visual","displaynamechn":"可见光","satellite":"FY-4A","satellitechn":"FY-4A","area":"China","areachn":"中国区域","serviceurl":"https://satellite.nsmc.org.cn/mongoTile_DSS/FY/TileServer512.php?layer=PRODUCT&PRODUCT=FY4A-_AGRI--_N_REGI_1047E_L1C_MTCC_MULT_GLL_YYYYMMDDhhmmss_YYYYMMDDhhmmss_4000M_V0001.JPG","created":1515110400000,"updated":1528156800000,"groupname":null,"groupnamechn":null,"instrument":"AGRI","instrumentchn":"成像仪","channel":"MULT","channelchn":"多通道合成","projection":"GLL","projectionchn":"等经纬度","quickviewurl":"http://img.nsmc.org.cn/CLOUDIMAGE/FY4A/THUMBNAIL/FY4A_AGRI_REGC_MTCC.jpg","initlevel":"5","initlon":"100","initlat":"34","nonight":0,"orderno":1000,"invalid":0,"comments":"FY4A-_AGRI--_N_REGI_1047E_L1C_TCC-_MULT_GLL_YYYYMMDDHHmm_1000M_V0001.JPG","minlevel":"4","maxlevel":"7","servicetype":"MONGO","tiletype":"tile","projectiontype":"EPSG:4326","areatype":"REGC","regionfoursquarecoordinate":"-180,-90,180,90"},
	{"imagename":"FY4A-_AGRI--_N_REGI_1047E_L1C_CLV-_C009_GLL_YYYYMMDDhhmmss_YYYYMMDDhhmmss_4000M_V0001.JPG","displayname":"Water Vapor","displaynamechn":"水汽","satellite":"FY-4A","satellitechn":"FY-4A","area":"China","areachn":"中国区域","serviceurl":"http://img.nsmc.org.cn/ImageSrv/getImage.aspx?layer=IMAGE&PRODUCT=FY4A_REGC_CLV","created":1515110400000,"updated":1515110400000,"groupname":null,"groupnamechn":null,"instrument":"AGRI","instrumentchn":"成像仪","channel":"CH06","channelchn":"通道6","projection":"GLL","projectionchn":"等经纬度","quickviewurl":"http://img.nsmc.org.cn/CLOUDIMAGE/FY4A/THUMBNAIL/FY4A_AGRI_REGC_CLV.jpg","initlevel":"5","initlon":"100","initlat":"34","nonight":0,"orderno":1003,"invalid":0,"comments":null,"minlevel":"4","maxlevel":"5","servicetype":"IMAGE","tiletype":"image","projectiontype":"EPSG:4326","areatype":"REGCGLL","regionfoursquarecoordinate":"62.2,3.24,137,54"},
	{"imagename":"FY4A-_AGRI--_N_REGI_1047E_L1C_GRA-_C001_GLL_YYYYMMDDhhmmss_YYYYMMDDhhmmss_1000M_V0001.JPG","displayname":"CH01(0.45～0.49μm)","displaynamechn":"通道1 (0.45～0.49μm)","satellite":"FY-4A","satellitechn":"FY-4A","area":"China","areachn":"中国区域","serviceurl":"http://img.nsmc.org.cn/ImageSrv/getTile.aspx?layer=PRODUCT&PRODUCT=FY4A_REGC_C01","created":1515110400000,"updated":1515110400000,"groupname":"Channels","groupnamechn":"分通道影像","instrument":"AGRI","instrumentchn":"成像仪","channel":"CH01","channelchn":"通道1","projection":"GLL","projectionchn":"等经纬度","quickviewurl":"http://img.nsmc.org.cn/CLOUDIMAGE/FY4A/THUMBNAIL/FY4A_AGRI_REGC_CH01.jpg","initlevel":"5","initlon":"100","initlat":"34","nonight":1,"orderno":1010,"invalid":0,"comments":null,"minlevel":"4","maxlevel":"7","servicetype":"TILE","tiletype":"tile","projectiontype":"EPSG:4326","areatype":"REGC","regionfoursquarecoordinate":"-180,-90,180,90"},
	{"imagename":"FY4A-_AGRI--_N_REGI_1047E_L1C_GRA-_C002_GLL_YYYYMMDDhhmmss_YYYYMMDDhhmmss_0500M_V0001.JPG","displayname":"CH02 (0.55～0.75μm)","displaynamechn":"通道2 (0.55～0.75μm)","satellite":"FY-4A","satellitechn":"FY-4A","area":"China","areachn":"中国区域","serviceurl":"http://img.nsmc.org.cn/ImageSrv/getTile.aspx?layer=PRODUCT&PRODUCT=FY4A_REGC_C02","created":1515110400000,"updated":1515110400000,"groupname":"Channels","groupnamechn":"分通道影像","instrument":"AGRI","instrumentchn":"成像仪","channel":"CH02","channelchn":"通道2","projection":"GLL","projectionchn":"等经纬度","quickviewurl":"http://img.nsmc.org.cn/CLOUDIMAGE/FY4A/THUMBNAIL/FY4A_AGRI_REGC_CH02.jpg","initlevel":"5","initlon":"100","initlat":"34","nonight":1,"orderno":1020,"invalid":0,"comments":null,"minlevel":"4","maxlevel":"7","servicetype":"TILE","tiletype":"tile","projectiontype":"EPSG:4326","areatype":"REGC","regionfoursquarecoordinate":"-180,-90,180,90"},
	{"imagename":"FY4A-_AGRI--_N_REGI_1047E_L1C_GRA-_C003_GLL_YYYYMMDDhhmmss_YYYYMMDDhhmmss_1000M_V0001.JPG","displayname":"CH03 (0.75～0.90μm)","displaynamechn":"通道3 (0.75～0.90μm)","satellite":"FY-4A","satellitechn":"FY-4A","area":"China","areachn":"中国区域","serviceurl":"http://img.nsmc.org.cn/ImageSrv/getTile.aspx?layer=PRODUCT&PRODUCT=FY4A_REGC_C03","created":1515110400000,"updated":1515110400000,"groupname":"Channels","groupnamechn":"分通道影像","instrument":"AGRI","instrumentchn":"成像仪","channel":"CH03","channelchn":"通道3","projection":"GLL","projectionchn":"等经纬度","quickviewurl":"http://img.nsmc.org.cn/CLOUDIMAGE/FY4A/THUMBNAIL/FY4A_AGRI_REGC_CH03.jpg","initlevel":"5","initlon":"100","initlat":"34","nonight":1,"orderno":1030,"invalid":0,"comments":null,"minlevel":"4","maxlevel":"7","servicetype":"TILE","tiletype":"tile","projectiontype":"EPSG:4326","areatype":"REGC","regionfoursquarecoordinate":"-180,-90,180,90"},
	{"imagename":"FY4A-_AGRI--_N_REGI_1047E_L1C_GRA-_C004_GLL_YYYYMMDDhhmmss_YYYYMMDDhhmmss_2000M_V0001.JPG","displayname":"CH04 (1.36～1.39μm)","displaynamechn":"通道4 (1.36～1.39μm)","satellite":"FY-4A","satellitechn":"FY-4A","area":"China","areachn":"中国区域","serviceurl":"http://img.nsmc.org.cn/ImageSrv/getTile.aspx?layer=PRODUCT&PRODUCT=FY4A_REGC_C04","created":1515110400000,"updated":1515110400000,"groupname":"Channels","groupnamechn":"分通道影像","instrument":"AGRI","instrumentchn":"成像仪","channel":"CH04","channelchn":"通道4","projection":"GLL","projectionchn":"等经纬度","quickviewurl":"http://img.nsmc.org.cn/CLOUDIMAGE/FY4A/THUMBNAIL/FY4A_AGRI_REGC_CH04.jpg","initlevel":"5","initlon":"100","initlat":"34","nonight":0,"orderno":1040,"invalid":0,"comments":null,"minlevel":"4","maxlevel":"6","servicetype":"TILE","tiletype":"tile","projectiontype":"EPSG:4326","areatype":"REGC","regionfoursquarecoordinate":"-180,-90,180,90"},
	{"imagename":"FY4A-_AGRI--_N_REGI_1047E_L1C_GRA-_C005_GLL_YYYYMMDDhhmmss_YYYYMMDDhhmmss_2000M_V0001.JPG","displayname":"CH05 (1.58～1.64μm)","displaynamechn":"通道5 (1.58～1.64μm)","satellite":"FY-4A","satellitechn":"FY-4A","area":"China","areachn":"中国区域","serviceurl":"http://img.nsmc.org.cn/ImageSrv/getTile.aspx?layer=PRODUCT&PRODUCT=FY4A_REGC_C05","created":1515110400000,"updated":1515110400000,"groupname":"Channels","groupnamechn":"分通道影像","instrument":"AGRI","instrumentchn":"成像仪","channel":"CH05","channelchn":"通道5","projection":"GLL","projectionchn":"等经纬度","quickviewurl":"http://img.nsmc.org.cn/CLOUDIMAGE/FY4A/THUMBNAIL/FY4A_AGRI_REGC_CH05.jpg","initlevel":"5","initlon":"100","initlat":"34","nonight":0,"orderno":1050,"invalid":0,"comments":null,"minlevel":"4","maxlevel":"6","servicetype":"TILE","tiletype":"tile","projectiontype":"EPSG:4326","areatype":"REGC","regionfoursquarecoordinate":"-180,-90,180,90"},
	{"imagename":"FY4A-_AGRI--_N_REGI_1047E_L1C_GRA-_C006_GLL_YYYYMMDDhhmmss_YYYYMMDDhhmmss_2000M_V0001.JPG","displayname":"CH06 (2.1～2.35μm)","displaynamechn":"通道6 (2.1～2.35μm)","satellite":"FY-4A","satellitechn":"FY-4A","area":"China","areachn":"中国区域","serviceurl":"http://img.nsmc.org.cn/ImageSrv/getTile.aspx?layer=PRODUCT&PRODUCT=FY4A_REGC_C06","created":1515110400000,"updated":1515110400000,"groupname":"Channels","groupnamechn":"分通道影像","instrument":"AGRI","instrumentchn":"成像仪","channel":"CH06","channelchn":"通道6","projection":"GLL","projectionchn":"等经纬度","quickviewurl":"http://img.nsmc.org.cn/CLOUDIMAGE/FY4A/THUMBNAIL/FY4A_AGRI_REGC_CH06_GLL.jpg","initlevel":"5","initlon":"100","initlat":"34","nonight":0,"orderno":1060,"invalid":0,"comments":null,"minlevel":"4","maxlevel":"6","servicetype":"TILE","tiletype":"tile","projectiontype":"EPSG:4326","areatype":"REGC","regionfoursquarecoordinate":"-180,-90,180,90"},
	{"imagename":"FY4A-_AGRI--_N_REGI_1047E_L1C_GRA-_C006_LBT_YYYYMMDDhhmmss_YYYYMMDDhhmmss_2000M_V0001.JPG","displayname":"CH06 (2.1～2.35μm)","displaynamechn":"通道6 (2.1～2.35μm)","satellite":"FY-4A","satellitechn":"FY-4A","area":"China","areachn":"中国区域","serviceurl":"http://img.nsmc.org.cn/ImageSrv/getImage.aspx?layer=IMAGE&PRODUCT=FY4A_REGC_C06_LBT","created":1515110400000,"updated":1515110400000,"groupname":"Lambert projections","groupnamechn":"兰勃托投影","instrument":"AGRI","instrumentchn":"成像仪","channel":"CH06","channelchn":"通道6","projection":"LBT","projectionchn":"兰勃托投影","quickviewurl":"http://img.nsmc.org.cn/CLOUDIMAGE/FY4A/THUMBNAIL/FY4A_AGRI_REGC_CH06_LBT.jpg","initlevel":"3","initlon":"10613490","initlat":"2981809","nonight":0,"orderno":1061,"invalid":0,"comments":null,"minlevel":"2","maxlevel":"4","servicetype":"IMAGE","tiletype":"image","projectiontype":"EPSG:6933","areatype":"REGCLBT","regionfoursquarecoordinate":"6271608,-2464806,14955128,6218714"},
	{"imagename":"FY4A-_AGRI--_N_REGI_1047E_L1C_GRA-_C006_MCT_YYYYMMDDhhmmss_YYYYMMDDhhmmss_2000M_V0001.JPG","displayname":"CH06 (2.1～2.35μm)","displaynamechn":"通道6 (2.1～2.35μm)","satellite":"FY-4A","satellitechn":"FY-4A","area":"China","areachn":"中国区域","serviceurl":"http://img.nsmc.org.cn/ImageSrv/getImage.aspx?layer=IMAGE&PRODUCT=FY4A_REGC_C06_MCT","created":1515110400000,"updated":1515110400000,"groupname":"Mercator projections","groupnamechn":"麦卡托投影","instrument":"AGRI","instrumentchn":"成像仪","channel":"CH06","channelchn":"通道6","projection":"MCT","projectionchn":"麦卡托投影","quickviewurl":"http://img.nsmc.org.cn/CLOUDIMAGE/FY4A/THUMBNAIL/FY4A_AGRI_REGC_CH06_MCT.jpg","initlevel":"5","initlon":"14471533.5","initlat":"2663693","nonight":0,"orderno":1062,"invalid":0,"comments":null,"minlevel":"4","maxlevel":"7","servicetype":"IMAGE","tiletype":"image","projectiontype":"EPSG:3857","areatype":"REGCMCT","regionfoursquarecoordinate":"10245954,-1118889,17811118,6446275"},
	{"imagename":"FY4A-_AGRI--_N_REGI_1047E_L1C_GRA-_C007_GLL_YYYYMMDDhhmmss_YYYYMMDDhhmmss_2000M_V0001.JPG","displayname":"CH07 (3.5～4.0μm)","displaynamechn":"通道7 (3.5～4.0μm)","satellite":"FY-4A","satellitechn":"FY-4A","area":"China","areachn":"中国区域","serviceurl":"http://img.nsmc.org.cn/ImageSrv/getTile.aspx?layer=PRODUCT&PRODUCT=FY4A_REGC_C07","created":1515110400000,"updated":1515110400000,"groupname":"Channels","groupnamechn":"分通道影像","instrument":"AGRI","instrumentchn":"成像仪","channel":"CH07","channelchn":"通道7","projection":"GLL","projectionchn":"等经纬度","quickviewurl":"http://img.nsmc.org.cn/CLOUDIMAGE/FY4A/THUMBNAIL/FY4A_AGRI_REGC_CH07.jpg","initlevel":"5","initlon":"100","initlat":"34","nonight":0,"orderno":1070,"invalid":0,"comments":null,"minlevel":"4","maxlevel":"6","servicetype":"TILE","tiletype":"tile","projectiontype":"EPSG:4326","areatype":"REGC","regionfoursquarecoordinate":"-180,-90,180,90"},
	{"imagename":"FY4A-_AGRI--_N_REGI_1047E_L1C_GRA-_C008_GLL_YYYYMMDDhhmmss_YYYYMMDDhhmmss_4000M_V0001.JPG","displayname":"CH08 (3.5～4.0μm)","displaynamechn":"通道8 (3.5～4.0μm)","satellite":"FY-4A","satellitechn":"FY-4A","area":"China","areachn":"中国区域","serviceurl":"http://img.nsmc.org.cn/ImageSrv/getImage.aspx?layer=IMAGE&PRODUCT=FY4A_REGC_C08_GLL","created":1515110400000,"updated":1515110400000,"groupname":"Channels","groupnamechn":"分通道影像","instrument":"AGRI","instrumentchn":"成像仪","channel":"CH08","channelchn":"通道8","projection":"GLL","projectionchn":"等经纬度","quickviewurl":"http://img.nsmc.org.cn/CLOUDIMAGE/FY4A/THUMBNAIL/FY4A_AGRI_REGC_CH08_GLL.jpg","initlevel":"5","initlon":"100","initlat":"34","nonight":0,"orderno":1080,"invalid":0,"comments":null,"minlevel":"4","maxlevel":"5","servicetype":"IMAGE","tiletype":"image","projectiontype":"EPSG:4326","areatype":"REGCGLL","regionfoursquarecoordinate":"62.2,3.24,137,54"},
	{"imagename":"FY4A-_AGRI--_N_REGI_1047E_L1C_GRA-_C008_LBT_YYYYMMDDhhmmss_YYYYMMDDhhmmss_4000M_V0001.JPG","displayname":"CH08 (3.5～4.0μm)","displaynamechn":"通道8 (3.5～4.0μm)","satellite":"FY-4A","satellitechn":"FY-4A","area":"China","areachn":"中国区域","serviceurl":"http://img.nsmc.org.cn/ImageSrv/getImage.aspx?layer=IMAGE&PRODUCT=FY4A_REGC_C08_LBT","created":1515110400000,"updated":1515110400000,"groupname":"Lambert projections","groupnamechn":"兰勃托投影","instrument":"AGRI","instrumentchn":"成像仪","channel":"CH08","channelchn":"通道8","projection":"LBT","projectionchn":"兰勃托投影","quickviewurl":"http://img.nsmc.org.cn/CLOUDIMAGE/FY4A/THUMBNAIL/FY4A_AGRI_REGC_CH08_LBT.jpg","initlevel":"3","initlon":"10613490","initlat":"2981809","nonight":0,"orderno":1081,"invalid":0,"comments":null,"minlevel":"2","maxlevel":"3","servicetype":"IMAGE","tiletype":"image","projectiontype":"EPSG:6933","areatype":"REGCLBT","regionfoursquarecoordinate":"6271608,-2464806,14955128,6218714"},
	{"imagename":"FY4A-_AGRI--_N_REGI_1047E_L1C_GRA-_C008_MCT_YYYYMMDDhhmmss_YYYYMMDDhhmmss_4000M_V0001.JPG","displayname":"CH08 (3.5～4.0μm)","displaynamechn":"通道8 (3.5～4.0μm)","satellite":"FY-4A","satellitechn":"FY-4A","area":"China","areachn":"中国区域","serviceurl":"http://img.nsmc.org.cn/ImageSrv/getImage.aspx?layer=IMAGE&PRODUCT=FY4A_REGC_C08_MCT","created":1515110400000,"updated":1515110400000,"groupname":"Mercator projections","groupnamechn":"麦卡托投影","instrument":"AGRI","instrumentchn":"成像仪","channel":"CH08","channelchn":"通道8","projection":"MCT","projectionchn":"麦卡托投影","quickviewurl":"http://img.nsmc.org.cn/CLOUDIMAGE/FY4A/THUMBNAIL/FY4A_AGRI_REGC_CH08_MCT.jpg","initlevel":"5","initlon":"14471533.5","initlat":"2663693","nonight":0,"orderno":1082,"invalid":0,"comments":null,"minlevel":"4","maxlevel":"6","servicetype":"IMAGE","tiletype":"image","projectiontype":"EPSG:3857","areatype":"REGCMCT","regionfoursquarecoordinate":"10245954,-1118889,17811118,6446275"}
];

var enabled_productType = [
	{"channel":"MULT", "projection":"GLL", "displaynamechn":"可见光", "button": "fy4_gll_mult"},
	{"channel":"MULT", "projection":"GLL", "displaynamechn":"可见光", "button": "fy4_gll_mult2"},
	// {"channel":"CH06", "projection":"GLL", "displaynamechn":"通道6", "groupname": "Channels", "button": "fy4_gll_ch6"},
	// {"channel":"CH02", "projection":"GLL", "displaynamechn":"通道2", "groupname": "Channels", "button": "fy4_gll_ch2"}
];
enabled_productType.forEach(productType => {	
	if ($("#" + productType.button)) {
		$("#" + productType.button).on("click",function(){
			var hasClass = $(this).parent().hasClass('currenterJiBtn');
			// if(XHW && XHW.F && XHW.F.cloud)
			// 	XHW.F.cloud.close();
			// if (hasClass) {
				// $('#showTuLi .tuLify4').hide();
				// return;
			// }
			if(!$(this).hasClass('current')){
				closeFY4CloudFunc();
			}else{
				$('#cloud li').css('background','none');
				// $(this).parent().css('background','rgb(7, 70, 137)');
				// require(['Function/CloudMap'], function(cloud){
				// 	XHW.F.radarWindow = radarWindow;
				// });	
				XHW.F.cloud.close();
				isFY4 = true;
				$(this).parent().addClass('currenterJiBtn');
				$(this).prev().attr('src',$(this).prev().attr('mysrc'));
				XHW.C.layout.judgeWhetherSelect($(this));
				XHW.C.layout.fenBianLv();
				XHW.map.getView().animate(
					{center: ol.proj.transform([115.45, 32.02], 'EPSG:4326', 'EPSG:3857'), zoom: 6});
		
				loadCloudData(productType.channel, productType.projection, productType.groupname);
			}
			
			
		});
	}
});

$('#cloud_list_play').click(function(){
	if (!isFY4) return;
	if (fy4AnimationCtrl) {
		fy4AnimationCtrl.troggleAnimation();
	}
});

function closeFY4CloudFunc() {
	isFY4 = false;
	if (fy4AnimationCtrl) {
		fy4AnimationCtrl.close();
	}
	enabled_productType.forEach(temptype => {	
		$("#" + temptype.button).parent().removeClass('currenterJiBtn');
		$("#" + temptype.button).prev().attr('src',$("#" + temptype.button).prev().attr('mysrcpri'));
		XHW.C.layout.judgeWhetherSelect($("#" + temptype.button));
	});
}

var enabledImageList = [];
loadFY4ProductTypeList();
//获取图片信息
function loadFY4ProductTypeList() {
	var satellite = nmsc_statellites[0].SATELLITECHN;
	var area = nsmc_areas[0].AREACHN;

	// $.ajax({
	// 	url: nsmc_image_web_site + satellite + "/area/"+area+"",
	// 	type: "get",
	// 	data:{
	// 		"satellite":satellite,
	// 		"area":area
	// 	},
	// 	dataType:"json",
	// 	success:function(result){
	// 		var result=result.resource;
			
	// 		var option='';
	// 		var imagelist= result;

	// 		imagelist.forEach(element => {
	// 			if (element && element.channel && element.projection) {
	// 				enabled_productType.forEach(enabled_productType => {
	// 					if (element.channel == enabled_productType.channel
	// 						&& element.projection == enabled_productType.projection
	// 						&& (element.groupname == enabled_productType.groupname)) {
	// 							enabledImageList.push(element);
	// 						}
	// 				});
	// 			}
				
	// 		});
	// 		enabledImageList.forEach(element => {
	// 			console.info(element);
	// 		});
	// 	},
	// 	error:function(result){
	// 		console.log(result)
	// 	}
	// });

	var imagelist= product_infos;

	imagelist.forEach(element => {
		if (element && element.channel && element.projection) {
			enabled_productType.forEach(enabled_productType => {
				if (element.channel == enabled_productType.channel
					&& element.projection == enabled_productType.projection
					&& (element.groupname == enabled_productType.groupname)) {
						enabledImageList.push(element);
					}
			});
		}
		
	});
}


function loadCloudData(loadChannel, loadProj, loadgroupname) {
	if (!enabledImageList || enabledImageList == null || enabledImageList.length <= 0) {
		loadFY4ProductTypeList();
	}
	if (enabledImageList) {
		enabledImageList.forEach(paraTile => {
			if (paraTile.channel == loadChannel
				&& paraTile.projection == loadProj
				&& paraTile.groupname == loadgroupname) {
					if("FY4A-_AGRI--_N_REGI_1047E_L1C_TCC-_MULT_GLL_YYYYMMDDhhmmss_YYYYMMDDhhmmss_1000M_V0001.JPG".indexOf(paraTile.imagename)>=0){
					//	console.log(8888)
						var filenamecode=paraTile.comments; //文件名编码   注意 查询mongodb 使用comments字段作为文件名编码
					}else{
					//	console.log(999)
						var filenamecode=paraTile.imagename; //文件名编码   注意 查询mongodb 使用comments字段作为文件名编码
					}
					
					//console.log(filenamecode)
					var servicetype=paraTile.servicetype;//服务类型  根据该字段  到不同的表中获取时间列表
					var serviceurl=paraTile.serviceurl; //服务路径  获取图片（瓦片）路径
					var layerType=paraTile.tiletype;//图层类型
					var maxlevel=parseInt(paraTile.maxlevel);//最大zoom
					var minlevel=parseInt(paraTile.minlevel);//最小zoom
					var initlevel=parseInt(paraTile.initlevel); //默认zoom
					var initlat=parseFloat(paraTile.initlat);//纬度
					var initlon=parseFloat(paraTile.initlon);//经度
					var areatype=paraTile.areatype;//区域类型
					var projectiontype=paraTile.projectiontype;//投影方式
					var regionfoursquarecoordinate=paraTile.regionfoursquarecoordinate;//区域坐标
					var projection=paraTile.projection; //投影
					var isHaveNight=paraTile.nonight;//时候可看晚上时间的云图
					
					
					var satellite=paraTile.satellitechn;
					var area=paraTile.areachn;
					var imageName=paraTile.displaynamechn;
					
					var titleShow=paraTile.displaynamechn;//标题显示
					currentImageName=filenamecode;
	
					//更新云图
					updateAnimation(filenamecode,servicetype,serviceurl,layerType,maxlevel,minlevel,initlevel,initlat,initlon,areatype,projectiontype,regionfoursquarecoordinate,projection,isHaveNight,satellite,area,imageName);
				}
		});
	}
}

function loadLatestCLoud() {
	//获取数据入口
	$.ajax({
		url: nsmc_image_web_site + "/firstimage",
		type:"get",
		dataType:"json",
		success:function(result){
			var resource = result.resource;
	//		console.log(resource)
			
			if("FY4A-_AGRI--_N_REGI_1047E_L1C_TCC-_MULT_GLL_YYYYMMDDhhmmss_YYYYMMDDhhmmss_1000M_V0001.JPG".indexOf(resource.imagename)>=0){
			//	console.log(8888)
				var filenamecode=resource.comments; //文件名编码   注意 查询mongodb 使用comments字段作为文件名编码
			}else{
			//	console.log(999)
				var filenamecode=resource.imagename; //文件名编码   注意 查询mongodb 使用comments字段作为文件名编码
			}
			
			//console.log(filenamecode)
			var servicetype=resource.servicetype;//服务类型  根据该字段  到不同的表中获取时间列表
			var serviceurl=resource.serviceurl; //服务路径  获取图片（瓦片）路径
			var layerType=resource.tiletype;//图层类型
			var maxlevel=parseInt(resource.maxlevel);//最大zoom
			var minlevel=parseInt(resource.minlevel);//最小zoom
			var initlevel=parseInt(resource.initlevel); //默认zoom
			var initlat=parseFloat(resource.initlat);//纬度
			var initlon=parseFloat(resource.initlon);//经度
			var areatype=resource.areatype;//区域类型
			var projectiontype=resource.projectiontype;//投影方式
			var regionfoursquarecoordinate=resource.regionfoursquarecoordinate;//区域坐标
			var projection=resource.projection; //投影
			var isHaveNight=resource.nonight;//时候可看晚上时间的云图
			
			
			var satellite=resource.satellitechn;
			var area=resource.areachn;
			var imageName=resource.displaynamechn;
			
			var titleShow=resource.displaynamechn;//标题显示
			currentImageName=filenamecode;
			updateAnimation(filenamecode,servicetype,serviceurl,layerType,maxlevel,minlevel,initlevel,initlat,initlon,areatype,projectiontype,regionfoursquarecoordinate,projection,isHaveNight,satellite,area,imageName);
		},
		error:function(result){
			console.log(result)
		}
	})
}

var timeListLength=0;
var timeType="BTC";//定义时间类型
var currentSource;

var isCustomTime=false;
//var startTime="2018-07-10 01:00:00";//utc时间
var endTime="2018-07-11 16:00:00";//utc时间
//获取时间列表数据
function getData() { 

	$("#loadWait").show();
	$("#play-animation  button ").html("<span class='fa fa-pause fa-2x'></span>");
	$.ajax({
		url: defaultTimeListUrl,
		type: "get",
		data: {
			"dataCode": defaultFileNameCode,
			"hourRange": defaultHours,
			"isHaveNight":defaltIsHaveNight,
			"isCustomTime":isCustomTime,
//			"startTime":startTime,
			"endTime":endTime,
			
		},
		dataType: "json",
		success: function (result) {
			
			var resource = result.ds;
		//	console.log(resource)
			var timeList = new Array();
			if(resource.length<3){
				alert("时间列表无数据") // TODO 美化
				$("#loadWait").hide();
				return;
			}
			
			currentSource=resource;
			timeListLength=resource.length;
			timeSliderMin=1;
			timeSliderMax=timeListLength;
			
//			console.log(resource.length)
			for (var i = 0; i < resource.length; i++) {
				timeList.push(resource[i].dataDate + resource[i].dataTime + "_" + resource[i].endTime);
			}
			// 1.构造动画参数         
			var paraTile = new Object();
			paraTile.serviceUrl =defaultserviceUrl;
			paraTile.timeList = timeList;
			paraTile.layerType = defaultTileType;//动画图层类型："tile";
			paraTile.imageExtent=defaultExtext;
			paraTile.satellite=cur_fy4_satellite;
			paraTile.area=cur_fy4_area;
			paraTile.imageName=cur_fy4_imageName;
			paraTile.maxlevel = defaltMaxZoom;
			paraTile.minlevel = defaultMinZoom;
			fy4AnimationCtrl.updateCloudList(paraTile);
		},
		error: function (result) {
			alert('获取产品时间列表失败');
		}
	});
}

var cur_fy4_satellite = '';
var cur_fy4_area = '';
var cur_fy4_imageName = '';
//更换云图
function updateAnimation(filenamecode,servicetype,serviceurl,layerType,maxlevel,minlevel,initlevel,initlat,initlon,areatype,projectiontype,regionfoursquarecoordinate,projection,isHaveNight,satellite,area,imageName){
	cur_fy4_satellite = satellite;
	cur_fy4_area = area;
	cur_fy4_imageName = imageName;

	console.info(satellite+area+imageName);
	//获取时间列表访问路径  servicetype字段决定
	var url="";
	if("MONGO".indexOf(servicetype)>=0){
		//GisSatelliteRasterMetadataInfo表访问路径
		url = TIME_LIST_MONGODB;
	}else{
		//ImageTransferToRemoteInfo表访问路径
		url = TIME_LIST_FILESYS;
	};
	
	//区域坐标数据类型更改
	// console.log(regionfoursquarecoordinate)
	var imageExtentPre=regionfoursquarecoordinate.split(",");
	var imageExtent=[];
	/*map() 为数组的方法 
	 * map() 方法返回一个由原数组中的每个元素调用一个指定方法后的返回值组成的新数组
	 * */
	imageExtent=imageExtentPre.map(function(data){  
        return +data;  
    }); 
	
	//设置全局属性
	 defaultFileNameCode=filenamecode;
	 defaultTimeListUrl=url;
	 defaultTileType=layerType;
	 defaultserviceUrl=serviceurl;
	 defaultExtext=imageExtent;
	 defaultZoom=initlevel;
	 defaultMinZoom=minlevel;
	 defaltMaxZoom=maxlevel;
	 defaltInitlat=initlat;
	 defaltInitlon=initlon;
	 defaultAreatype=areatype;
     defaultProjectiontype=projectiontype;
     defaultCoordinate=regionfoursquarecoordinate;
     defaultProjection=projection;
     defaltIsHaveNight=isHaveNight;
     
	//判断是否有天地图
	if("GLL".indexOf(projection)>=0){
		isHaveMapWorld=true;
	}else{
		isHaveMapWorld=false;
		//隐藏天地图按钮选项点击显示的信息
		$("#layerSelect").hide();
		if (fy4AnimationCtrl.tdtLayers) {
			for (key in fy4AnimationCtrl.tdtLayers) {
				val = fy4AnimationCtrl.tdtLayers[key];
				val.setVisible(false);
			}
			var input=$("#layerSelect li input[checked]");
			for(var i=0;i<input.length;i++){
				input.attr("checked", false);
				input.prop("checked",false)
				var chekimgdiv = $("#layerSelect .layer-checkbox-checked")[0];
				$(chekimgdiv).removeClass().addClass("layer-checkbox");
			}
	    }
	}
	
	//重新加载数据   并创建新的view
	getData();

}
/**
 * 重新形成项目路径（叠加天地图中）
 * @param tileCoord
 * @param tileSize
 * @param tileExtent
 * @param pixelRatio
 * @param projection
 * @param params
 * @returns
 */
function getURLNew(tileCoord, tileSize, tileExtent, pixelRatio, projection, params) {
	 var view=fy4AnimationCtrl.map.getView();
	 var res=view.getResolution();
//	console.log(params['layername']+"   "+this.serverResolutions)
	  var urls = this.urls;
	  if (!urls) {
	    return undefined;
	  }

	    var url;
	    if (urls.length == 1) {
	        url = urls[0];
	    } else {
	        var index = ol.math.modulo(ol.tilecoord.hash(tileCoord), urls.length);
	        url = urls[index];
	    }
	    
	    var sfix = "c";
	    var index1=utilIndexOf(params['serverResolutions'], res)
	    var z = params['serverResolutions'] != null ?
	    		(index1.split(",")[0]) :
	        	fy4AnimationCtrl.map.getView().getZoom();
	    res=	index1.split(",")[1]	;
		var x = Math.round((tileExtent[0] + 180.0) / (res * tileSize[0]));
	    var y = Math.round((90 - tileExtent[3]) / (res * tileSize[1]));
	    var newpath = "/" + params['layername'] + "_" +sfix+"/wmts?SERVICE=WMTS&REQUEST=GetTile&tk=fb5273dc89827113cbd67842a1354408&VERSION=1.0.0&LAYER=" + params['layername'] + "&STYLE=default&FORMAT=tiles&TILEMATRIXSET="+sfix+"&TILEMATRIX=" + z + "&TILECOL=" + x + "&TILEROW=" + y;
	    return url + newpath;
};


/**
 * 根据当前分辨率 获取index 以及新的分辨率
 * @param allResolutions  所有分辨率
 * @param res  当前分辨率
 * @returns {String}  当前分辨率在所有分辨率中的index以及新的分辨率
 */
function utilIndexOf(allResolutions, res) {
	var result= allResolutions.indexOf(res);
	if(result==-1){//没有获取到index
		var current;
		var absolut;
		var trueResult;
		for(var i=0;i<allResolutions.length;i++){
			if(i==0){
				absolut=Math.abs(allResolutions[i]-res);
				current=allResolutions[i];
			}else{
				var sAbsolut=Math.abs(allResolutions[i]-res);
				if(sAbsolut-absolut < 0){
					absolut=sAbsolut;
					current=allResolutions[i];
				}
			}
		}
		return allResolutions.indexOf(current)+","+current;
	}else{
		return result+","+res;
	}
}