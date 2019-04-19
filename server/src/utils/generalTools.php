<?php

	function isExisting($valueToCheck){
		return (isset($valueToCheck) && $valueToCheck !== '' && $valueToCheck !== null);
	}

?>