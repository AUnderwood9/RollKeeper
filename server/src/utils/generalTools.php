<?php

	function isExisting($valueToCheck){
		return (isset($valueToCheck) && $valueToCheck !== '' && $valueToCheck !== null);
	}

	function keyExists($arrayToCheck, $keyToCheck){
		return(isset($arrayToCheck[$keyToCheck]) && $arrayToCheck[$keyToCheck] != null);
	}

?>