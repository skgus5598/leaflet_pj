<?php

	$executionStartTime = microtime(true);
	include("apiConfig.php");

	$url = $getWeather_url .$_REQUEST['lat'] . '&lon=' .$_REQUEST['lng'];
	
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	
	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

	$output['city'] = $decode['city']['name'];
	$output['description'] = $decode['list'][0]['weather'][0]['description'];
	$output['icon'] = $decode['list'][0]['weather'][0]['icon'].'.png';
	$output['main'] = $decode['list'][0]['weather'][0]['main'];
	$output['windSpeed'] = $decode['list'][0]['wind']['speed'].' m/s';
	$output['humidity'] = $decode['list'][0]['main']['humidity'].'%';
	$output['currentTemp'] = $decode['list'][0]['main']['temp'];
	$output['feelsLike'] = $decode['list'][0]['main']['feels_like'];
	$output['maxTemp'] = $decode['list'][0]['main']['temp_max'];
	$output['minTemp'] = $decode['list'][0]['main']['temp_min'];


	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
