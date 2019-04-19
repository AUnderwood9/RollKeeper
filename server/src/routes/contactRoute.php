<?php

	use \Psr\Http\Message\ServerRequestInterface as Request;
	use \Psr\Http\Message\ResponseInterface as Response;


	$this->get('/contacts', function (Request $request, Response $response, array $args) {
		$contactController = new ContactController(new DaoManager());

		$response->getBody()->write(json_encode($contactController->getAllContacts()));

        return $response;
	});

	$this->get('/contact/{id}', function (Request $request, Response $response, array $args) {
		$contactController = new ContactController(new DaoManager());

		$response->getBody()->write(json_encode($contactController->getContactById($args["id"])));

        return $response;
	});

	$this->get('/contact/{type}/{id}', function (Request $request, Response $response, array $args) {
		$contactController = new ContactController(new DaoManager());

		$response->getBody()->write(json_encode($contactController->getContactByPerson($args["type"], $args["id"])));

        return $response;
	});
	
	$this->post('/contact', function (Request $request, Response $response, array $args) {
		$contactController = new ContactController(new DaoManager());

		$bodyData = $request->getParsedBody();
		$requestResult = $contactController->createContact($bodyData["contactPersonType"], $bodyData["personContactId"],
														$bodyData["primaryPhone"], $bodyData["primaryEmail"]);
		$responseBody = new StdClass;
		$responseBody->success = $requestResult;
		return $response->getBody()->write(json_encode($requestResult));
	});

	$this->post('/contact/{id}', function (Request $request, Response $response, array $args) {
		$contactController = new ContactController(new DaoManager());

		$bodyData = $request->getParsedBody();
		$requestResult = $contactController->updateContact($args["id"],
														$bodyData["primaryPhone"], $bodyData["primaryEmail"],
														$bodyData["secondaryPhone"], $bodyData["secondaryEmail"]);
		$responseBody = new StdClass;
		$responseBody->success = $requestResult;
		return $response->getBody()->write(json_encode($requestResult));
	});
?>