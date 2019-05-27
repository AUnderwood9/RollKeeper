<?php

	use \Psr\Http\Message\ServerRequestInterface as Request;
	use \Psr\Http\Message\ResponseInterface as Response;

	$this->get('/features', function (Request $request, Response $response, array $args) {
		$featureController = new GenericController(new DaoManager(), "feature");

		$response->getBody()->write(json_encode($featureController->retrieveAllRecords(["id", "S_FEATURE", "B_FEATURE_ENABLED"], 
																						["id", "featureName", "isEnabled"])));

        return $response;
	});
?>