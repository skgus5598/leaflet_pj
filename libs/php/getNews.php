<?php

	$executionStartTime = microtime(true);
	include("apiConfig.php");

	$url= $getNews_url. $_REQUEST['lat'] .'&lon='. $_REQUEST['lng'];

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

	$output['data'] = $decode['reports'];


	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
