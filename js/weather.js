
function getLocation()
{
	if (!!navigator.geolocation) 
	{
		navigator.geolocation.getCurrentPosition(showWeather);  
	}
	else
	{
		alert("이 브라우저는 Geolocation를 지원하지 않습니다");
	}
}
function showSpinner() {
			var opts = {
			  lines: 30, // The number of lines to draw
			  length: 0, // The length of each line
			  width: 5, // The line thickness
			  radius: 120, // The radius of the inner circle
			  corners: 1, // Corner roundness (0..1)
			  rotate: 0, // The rotation offset
			  direction: 1, // 1: clockwise, -1: counterclockwise
			  color: '#fff', // #rgb or #rrggbb or array of colors
			  speed: 0.9, // Rounds per second
			  trail: 100, // Afterglow percentage
			  shadow: false, // Whether to render a shadow
			  hwaccel: false, // Whether to use hardware acceleration
			  className: 'spinner', // The CSS class to assign to the spinner
			  zIndex: 2e9, // The z-index (defaults to 2000000000)
			  top: 'auto', // Top position relative to parent in px
			  left: 'auto' // Left position relative to parent in px
			};
			var target = document.getElementById('spinner');
			var spinner = new Spinner(opts).spin(target);	
}
function loadingScreenAnimation(duration,ease,dawngap){
	$(".magicColor5").css("opacity","1");	
	$(".magicColor4").css("opacity","1");	
	$(".magicColor3").css("opacity","1");	
	$(".magicColor2").css("opacity","1");	
	$(".magicColor1").css("opacity","1");	
	
	$(".magicColor5").animate({opacity:"0"},duration,ease,function() {
		$(".magicColor4").animate({opacity:"0"},duration,ease,function() {
			$(".magicColor3").animate({opacity:"0"},duration,ease,function() {
				$(".magicColor2").animate({opacity:"0"},dawngap,"swing",function() {
					$(".magicColor2").animate({opacity:"1"},dawngap,"swing",function() {
					$(".magicColor3").animate({opacity:"1"},duration,ease,function() {
					$(".magicColor4").animate({opacity:"1"},duration,ease,function() {
					$(".magicColor5").animate({opacity:"1"},duration,ease,function() {
					});
					});
					});
					});
				});
			});
		});
	});
}
function showWeather(position)
{
	var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
	var sQuery = "https://api.forecast.io/forecast/29279b7685082aa05011a94496dd608f/"+latitude+","+longitude+"?units=si";

	// 스타트업 애니메이션 시작 
	loadingScreenAnimation(1000,"linear",5000);
	showSpinner();

//	setInterval(loadingScreenAnimation(),40000);
	
//	$("#magicColor4").animate({opacity:"0"},8000);
//	$("#magicColor5").animate({opacity:"0"},10000);



	$.ajax({
		type: "GET",
		url: sQuery,
		dataType: "jsonp",
		success: function(forecastData){
		
			// 스타트업 스크린 제거
	//		clearInterval(loadingScreenAnimation);
			setTimeout(function() {$(".startup_container.splash").animate({opacity:"0"},600,"swing",function() {$(".startup_container.splash").css("display","none")})},5000);			

//			setTimeout(function() {loadingScreenAnimation(5000,"linear",5000)},5600);
//			setInterval(function() {loadingScreenAnimation(5000,"linear",5000)},45600);
			
			//로컬스토리지에 예보정보 저장
			localStorage.setItem("myForecastData",JSON.stringify(extractWeatherInfo(forecastData)));
			updateWeatherPage();
		},
		error: function(request,status,error){
        	alert("에러라능");
		}
	});	
}

// 로컬 스토리지의 데이터를 이용해서 화면에 뿌려주기
function updateWeatherPage(){
	
	var myForecastData = JSON.parse(localStorage.getItem('myForecastData'));
		
	// 날짜 표시
	var sTodaydate1 = getMonthString(myForecastData['today']['dateExpression']['month']);
	sTodaydate1 = sTodaydate1 + " "+String(myForecastData['today']['dateExpression']['date'])+"<br/>";
	sTodaydate1 = sTodaydate1 + String(myForecastData['today']['dateExpression']['year'])+"<br/>";
	sTodaydate1 = sTodaydate1 + getDayString(myForecastData['today']['dateExpression']['day']);
	
	$("#today_full_date>span").html(sTodaydate1);

	var sTodaydate2 = String(myForecastData['today']['dateExpression']['month'])+'/';
	sTodaydate2 = sTodaydate2 +String(myForecastData['today']['dateExpression']['date'])+"<br/><br/>";

	$("#today_compact_date").html(sTodaydate2);
	
	// 날짜 표시
	var sTodaydate11 = getMonthString(myForecastData['tomorrow']['dateExpression']['month']);
	sTodaydate11 = sTodaydate11 + " "+String(myForecastData['tomorrow']['dateExpression']['date'])+"<br/>";
	sTodaydate11 = sTodaydate11 + String(myForecastData['tomorrow']['dateExpression']['year'])+"<br/>";
	sTodaydate11 = sTodaydate11 + getDayString(myForecastData['tomorrow']['dateExpression']['day']);
	
	$("#tomorrow_full_date>span").html(sTodaydate11);

	var sTodaydate21 = String(myForecastData['tomorrow']['dateExpression']['month'])+'/';
	sTodaydate21 = sTodaydate21 +String(myForecastData['tomorrow']['dateExpression']['date'])+"<br/><br/>";

	$("#tomorrow_compact_date").html(sTodaydate21);
	
	//// 오늘의 골든아워는 시간대에따라 0개, 1개, 2개가 남아있을 수 있다.
	// 0개인 경우 골든아워 마감알림을 표시한다.
	if(Object.keys(myForecastData['today']).length==1){
		$("#todayPage .mg-container").css("display","none");
		$("#todayPage .mgblank-container").css("display","block");
	} // 일몰 골든아워만 남은 경우 
	else if (Object.keys(myForecastData['today']).length==3) {
		$("#todayPage .mg-container:nth-child(1)").css("visibility","hidden");
		$("#todayPage .mg-container:nth-child(2)").css("display","block");


		var date = new Date(myForecastData['today']['sunsetTime']*1000);
		var hours = date.getHours();
		// minutes part from the timestamp
		var minutes = date.getMinutes();
		var formattedTime = hours + ':' + minutes;

		var sBefore26Min = getAdjustedTimeString(date,-26);
		var sAfter26Min = getAdjustedTimeString(date,26);
		
		$("#todayPage .mg-container:nth-child(2) p").html(sBefore26Min+"-"+formattedTime+"-"+sAfter26Min);
		
		
		$("#todayPage .mgblank-container").css("display","none");
	} // 일출 일몰 다 남아있는 경우
	else if (Object.keys(myForecastData['today']).length==5) {
		$("#todayPage .mg-container").css("display","block");		
		$("#todayPage .mg-container:nth-child(1)").css("display","block");
		$("#todayPage .mg-container:nth-child(2)").css("display","block");
		$("#todayPage .mgblank-container").css("display","none");	
		
		var date = new Date(myForecastData['today']['sunriseTime']*1000);
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var formattedTime = hours + ':' + minutes;

		var sBefore26Min = getAdjustedTimeString(date,-26);
		var sAfter26Min = getAdjustedTimeString(date,26);
		
		$("#todayPage .mg-container:nth-child(1) p").html(sBefore26Min+"-"+formattedTime+"-"+sAfter26Min);

		date = new Date(myForecastData['today']['sunsetTime']*1000);
		hours = date.getHours();
		minutes = date.getMinutes();
		formattedTime = hours + ':' + minutes;

		sBefore26Min = getAdjustedTimeString(date,-26);
		sAfter26Min = getAdjustedTimeString(date,26);	
		
		$("#todayPage .mg-container:nth-child(2) p").html(sBefore26Min+"-"+formattedTime+"-"+sAfter26Min);
		


	}

	// 내일의 골든아워는 절대 지나가지 않으니 두개의 정보가 언제나 채워져 있는 케이스이다.
	if(Object.keys(myForecastData['tomorrow']).length==2){
		$("#tomorrowPage .mg-container").css("display","none");
		$("#tomorrowPage .mgblank-container").css("display","block");
	} else if (Object.keys(myForecastData['tomorrow']).length==4) {
		$("#tomorrowPage .mg-container:nth-child(1)").css("display","none");
		$("#tomorrowPage .mg-container:nth-child(2)").css("display","block");
		$("#tomorrowPage .mg-container:nth-child(2) p").html("11111");

		$("#tomorrowPage .mgblank-container").css("display","none");
	} else if (Object.keys(myForecastData['tomorrow']).length==6) { // 바로 이 경우
		$("#tomorrowPage .mg-container").css("display","block");
		$("#tomorrowPage .mgblank-container").css("display","none");		

		var date = new Date(myForecastData['tomorrow']['sunriseTime']*1000);
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var formattedTime = hours + ':' + minutes;

		var sBefore26Min = getAdjustedTimeString(date,-26);
		var sAfter26Min = getAdjustedTimeString(date,26);
		
		$("#tomorrowPage .mg-container:nth-child(1) p").html(sBefore26Min+"-"+formattedTime+"-"+sAfter26Min);
		date = new Date(myForecastData['tomorrow']['sunsetTime']*1000);
		hours = date.getHours();
		minutes = date.getMinutes();
		formattedTime = hours + ':' + minutes;

		sBefore26Min = getAdjustedTimeString(date,-26);
		sAfter26Min = getAdjustedTimeString(date,26);	
		
		$("#tomorrowPage .mg-container:nth-child(2) p").html(sBefore26Min+"-"+formattedTime+"-"+sAfter26Min);
		
	}
	
	
	var sWeatherinfo = "시정:" + myForecastData["currently"]["visibility"] + "<br/>";
	sWeatherinfo =  sWeatherinfo + "날씨:" + myForecastData["currently"]["summary"] + "<br/>";
	sWeatherinfo =  sWeatherinfo + "운량:" + myForecastData["currently"]["cloudCover"]+ "<br/>";
	sWeatherinfo =  sWeatherinfo + "시간별예보:" + myForecastData["currently"]["hourlySummery"]+ "<br/>";
	sWeatherinfo =  sWeatherinfo + "주간예보:" + myForecastData["currently"]["weeklySummery"];


	$("div#todayPage div.card>.front div.weatherInfo_container>span.icon").html(getWeatherIconCode(myForecastData["currently"]));
//	console.log(myForecastData["currently"]["visibility"]);
	$("div#todayPage .card>.front div.weatherInfo_container:nth-child(4)>p").html(parseInt(myForecastData["currently"]["visibility"])+"km");
	$("div#todayPage .card>.front div.weatherInfo_container p.label").html(myForecastData["currently"]["summary"]);
	$("div#todayPage .card>.front div.weatherInfo_container>p.cloud_cover_value").html(parseInt(myForecastData["currently"]["cloudCover"]*100)+"%");
	var cloudCover = parseInt(myForecastData["currently"]["cloudCover"]*10);
	$("div#todayPage .card>.front div.weatherInfo_container>img.cloud_cover_img").attr("src","img/cloudCover"+cloudCover+".png");


	$("div#tomorrowPage div.card>.front div.weatherInfo_container>span.icon").html(getWeatherIconCode(myForecastData["tomorrow"]["summary"]));


	$("div#tomorrowPage .card>.front div.weatherInfo_container:nth-child(5)>p").html(parseInt(myForecastData["tomorrow"]["summary"]["precipProbability"]*100)+"%");
	$("div#tomorrowPage .card>.front div.weatherInfo_container p.label").html(myForecastData["tomorrow"]["summary"]["summary"]);
	$("div#tomorrowPage .card>.front div.weatherInfo_container>p.cloud_cover_value").html(parseInt(myForecastData["tomorrow"]["summary"]["cloudCover"]*100)+"%");
	var cloudCover2 = parseInt(myForecastData["tomorrow"]["summary"]["cloudCover"]*10);
	$("div#tomorrowPage .card>.front div.weatherInfo_container>img.cloud_cover_img").attr("src","img/cloudCover"+cloudCover2+".png");

	if(myForecastData["tomorrow"]["summary"]["summary"].length>=14) {
		$("div#tomorrowPage div.weatherInfo_container p.weather_description.label").css("font-size","14px");
//		console.log(myForecastData["tomorrow"]["summary"]["summary"].length);
	}
	if(myForecastData["currently"]["summary"].length>=14) {
		$("div#todayPage div.weatherInfo_container p.weather_description.label").css("font-size","14px");
//		console.log(myForecastData["currently"]["summary"].length);
	}
	
	
	
	updateUpcomingLabel();

}

function getAdjustedTimeString(date, minute) {
	hours = date.getHours();
	minutes = date.getMinutes();

	if(minute>0){	
		if(minutes+minute>=60) {
			minutes = minutes + minute - 60;
			hours = hours + 1;
		} else {
			minutes = minutes + minute;
		}
		if(String(minutes).length ==1) minutes = "0" + String(minutes);
		
		formattedTime = hours + ':' + minutes;
		
		return formattedTime;
	} else {
		if(minutes+minute<0) {
			minutes = minutes + minute + 60;
			hours = hours - 1;
		} else {
			minutes = minutes + minute;
		}

		if(String(minutes).length ==1) minutes = "0" + String(minutes);
		
		formattedTime = hours + ':' + minutes;
		
		return formattedTime;		
	}
}

function getMonthString(monthNum) {
	var monthNames = [ "January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December" ];
	return monthNames[monthNum-1];
}
function getDayString(dayNum) {
	var dayNames = [ "Sunday","Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	return dayNames[dayNum];
}

/**
*
* 현재 온도,
*/
function extractWeatherInfo(forecastData){

	var daily = forecastData['daily'];
	var hourly = forecastData['hourly'];
	var currently = forecastData['currently'];
	var tomorrowSummary = forecastData['daily']['data'][1];

	
	var present = {};

	// 현재 정보를 구축한다.
	present['currently'] = currently;
	present['currently']['hourlySummery'] = hourly['summary'];
	present['currently']['weeklySummery'] = daily['summary'];
		
	// 내일의 매직아워데이터도 구축한다.
	present['tomorrow'] = {};
	present['tomorrow']['summary'] = tomorrowSummary;
	present['tomorrow']['sunriseTime'] = daily['data'][1]['sunriseTime'];
	present['tomorrow']['sunsetTime'] = daily['data'][1]['sunsetTime'];
	present['tomorrow']['sunriseForecast']={};
	present['tomorrow']['sunriseForecast'] = hourly['data'][getNearestHourlyForecastIndex(present['tomorrow']['sunriseTime'],forecastData)];
//	present['tomorrow']['sunriseForecast'][1] = hourly['data'][getNearestHourlyForecastIndex(present['tomorrow']['sunriseTime'],forecastData)+1];
	present['tomorrow']['sunsetForecast']={};
	present['tomorrow']['sunsetForecast'] = hourly['data'][getNearestHourlyForecastIndex(present['tomorrow']['sunsetTime'],forecastData)];	
//	present['tomorrow']['sunsetForecast'][1] = hourly['data'][getNearestHourlyForecastIndex(present['tomorrow']['sunsetTime'],forecastData)+1];
	present['tomorrow']['dateExpression'] = {};

	var tomorrowDateExpression = new Date(daily['data'][1]['time']*1000);

	present['tomorrow']['dateExpression']['day'] = tomorrowDateExpression.getDay();
	present['tomorrow']['dateExpression']['year'] = tomorrowDateExpression.getYear()-100+2000;
	present['tomorrow']['dateExpression']['date'] = tomorrowDateExpression.getDate();
	present['tomorrow']['dateExpression']['month'] = tomorrowDateExpression.getMonth()+1;
		
	// 현재시간에 따라 오늘의 매직아워데이터를 가져온다.	
	var numberOfMagicHoursLeftToday = getNumberOfMagicHoursLeftToday(forecastData);
	present['today'] = {};
	if(numberOfMagicHoursLeftToday == 0) {}
	else if(numberOfMagicHoursLeftToday == 1) {
		// 일몰 매직아워 시간만 가져옴
		present['today']['sunsetTime'] = daily['data'][0]['sunsetTime'];	
		present['today']['sunsetForecast']={};
		present['today']['sunsetForecast'] = hourly['data'][getNearestHourlyForecastIndex(present['today']['sunsetTime'],forecastData)];	
//		present['today']['sunsetForecast'][1] = hourly['data'][getNearestHourlyForecastIndex(present['today']['sunsetTime'],forecastData)+1];	
		
	} else {
		// 일출 일몰 매직아워 다 가져옴
		present['today']['sunriseTime'] = daily['data'][0]['sunriseTime'];
		present['today']['sunsetTime'] = daily['data'][0]['sunsetTime'];
		present['today']['sunriseForecast'] = {};
		present['today']['sunriseForecast'] = hourly['data'][getNearestHourlyForecastIndex(present['today']['sunriseTime'],forecastData)];			
		present['today']['sunsetForecast'] = {};		
		present['today']['sunsetForecast'] = hourly['data'][getNearestHourlyForecastIndex(present['today']['sunsetTime'],forecastData)];	
	}

	present['today']['dateExpression'] = {};

	var todayDateExpression = new Date(daily['data'][0]['time']*1000);

	present['today']['dateExpression']['day'] = todayDateExpression.getDay();
	present['today']['dateExpression']['year'] = todayDateExpression.getYear()-100+2000;
	present['today']['dateExpression']['date'] = todayDateExpression.getDate();
	present['today']['dateExpression']['month'] = todayDateExpression.getMonth()+1;

	return 	present;
}

// 예보정보를 받아서 오늘 다가올 매직 아워의 갯수를 반환한다.
// 2, 1, 0 세개의 정수값 중 하나를 반환한다.
function getNumberOfMagicHoursLeftToday(forecastData){
	var currentTime = forecastData['currently']['time'];
	var todaySunriseTime = forecastData['daily']['data'][0]['sunriseTime'];
	var todaySunsetTime = forecastData['daily']['data'][0]['sunsetTime'];
	
	// 0시부터 일출의 30분 후 까지 두개의 매직아워를 알려준다.
	if(currentTime < todaySunriseTime + 1800) {
		return 2;
	}
	// 일몰의 30분 후 까지 한개의 매직아워를 알려준다.
	else if(currentTime < todaySunsetTime + 1800) {
		return 1;
	}
	// 일몰의 30분 후 이후에 오늘의 매직아워는 없다.
	else {
		return 0;
	}
}

function getNearestHourlyForecastIndex(timeStamp,forecastData) {
//	var tempNearestTimeInHourlyForecast;
	var index;
	for( index in forecastData['hourly']['data']){
		if(timeStamp < forecastData['hourly']['data'][index]['time']) {
			var minDiffbefore,minDiffafter;
			
			minDiffbefore = getMinuteDifference(forecastData['hourly']['data'][index-1]['time'],timeStamp);
			minDiffafter = getMinuteDifference(timeStamp,forecastData['hourly']['data'][index]['time']);

			if(minDiffbefore<minDiffafter) {
				index = index-1;
			}
			break;	
		}
	}
//			console.log("near : " + unixTimeStampToExpression(forecastData['hourly']['data'][index-1]['time']));
			console.log("center: " + unixTimeStampToExpression(timeStamp));
			console.log("near : " + unixTimeStampToExpression(forecastData['hourly']['data'][index]['time']));
	return index;	
}

function unixTimeStampToExpression(timeStamp) {
	var date = new Date(timeStamp*1000);
	var month = date.getMonth();
	var dates = date.getDate();
	var hours = date.getHours();
	var minutes = date.getMinutes();
//	return (month+1) + '월' + dates + '일' + hours + "시" + minutes + "분";	
	return hours + "시" + minutes + "분";	
}

function getMinuteDifference(formerTimestamp, laterTimestamp) {
	var date1 = new Date(formerTimestamp*1000);
	var years1 = date1.getYear();
	var month1 = date1.getMonth();
	var dates1 = date1.getDate();
	var hours1 = date1.getHours();	
	var minutes1 = date1.getMinutes();
	var date2 = new Date(laterTimestamp*1000);
	var years2 = date2.getYear();
	var month2 = date2.getMonth();
	var dates2 = date2.getDate();
	var hours2 = date2.getHours();
	var minutes2 = date2.getMinutes();		
	
//	console.log(hours2);

	var minDiff = (hours2-hours1)*60+minutes2-minutes1;
	
	return minDiff;
}

function getWeatherIconCode(present) {
//clear-day, clear-night, rain, snow, sleet, wind, fog, cloudy, 
//partly-cloudy-day, or partly-cloudy-night	
	var sIcon = present['icon'];
	
	switch(sIcon)
	{
	case 'clear-day':
	  return 'B';
	  break;
	case 'clear-night':
	  return 'C';
	  break;
	case 'partly-cloudy-day':
	  return 'H';
	  break;
	case 'partly-cloudy-night':
	  return 'I';
	  break;
	case 'rain':
	  return 'R';
	  break;
	case 'snow':
	  return 'W';
	  break;
	case 'sleet':
	  return 'X'
	  break;
	case 'wind':
	  return 'F';
	  break;
	case 'fog':
	  return 'F';
	  break;;
	case 'cloudy':
	  return 'F';
	  break;  
	default:
	  return 'A';
	}	
}


