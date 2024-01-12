<?php

	$executionStartTime = microtime(true);
	include("apiConfig.php");

	$url = $countryInfo_url.$_REQUEST['code'];

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

	$output['code'] = $decode[0]['cca2'];
	$output['officialName'] = $decode[0]['name']['official'];
	$output['commonName'] = $decode[0]['name']['common'];
	$output['capital'] = $decode[0]['capital'];
	$output['population'] = $decode[0]['population'];
	$output['area'] = $decode[0]['area'];
	$output['languages'] = array_values($decode[0]['languages']);
	$output['currency'] = key($decode[0]['currencies']);
	$output['currencyName'] = array_values($decode[0]['currencies'])[0]['name'];
	$output['currencySymbol'] = array_values($decode[0]['currencies'])[0]['symbol'];
	$output['capitalLatLng'] = $decode[0]['capitalInfo']['latlng'];


	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
