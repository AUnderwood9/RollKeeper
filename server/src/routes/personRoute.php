<?php

	use \Psr\Http\Message\ServerRequestInterface as Request;
	use \Psr\Http\Message\ResponseInterface as Response;

	$this->get('/person/all/{type}', function (Request $request, Response $response, array $args) {
		$personController = new PersonController(new DaoManager());

		$response->getBody()->write(json_encode($personController->getAllPeople($args["type"])));

        return $response;
	});

	$this->get('/person/student/{id}', function (Request $request, Response $response, array $args) {
		$personController = new PersonController(new DaoManager());

		$response->getBody()->write(json_encode($personController->getRecordSetById($args["id"])));

        return $response;
	});

	$this->get('/person/instructor/{id}', function (Request $request, Response $response, array $args) {
		$personController = new PersonController(new DaoManager());

		$response->getBody()->write(json_encode($personController->getSecondaryRecordSetById($args["id"], "instructor")));

        return $response;
	});

	$this->get('/person/student/course/{id}', function (Request $request, Response $response, array $args) {
		$personController = new PersonController(new DaoManager());

		$response->getBody()->write(json_encode($personController->getRecordSetById($args["id"], ["id, S_FIRST_NAME, S_LAST_NAME, N_CONTACT_ID"], "N_COURSE_ID", ResultSetTypeEnum::MultiResultSet)));

        return $response;
	});

	$this->post('/person', function (Request $request, Response $response, array $args) {
		$personController = new PersonController(new DaoManager());

		$bodyData = $request->getParsedBody();
		$courseIdEntry = isExisting($bodyData["courseId"]) ? $bodyData["courseId"] :  "";
		$requestResult = $personController->createPerson($bodyData["personType"], 
														["firstName" => $bodyData["firstName"], "lastName" => $bodyData["lastName"], 
														"courseId" => $courseIdEntry],
														["phoneNumber" => $bodyData["phoneNumber"], "email" => $bodyData["email"]]
														);
		$responseBody = new StdClass;
		$responseBody->success = $requestResult;

		return $response->getBody()->write(json_encode($requestResult));
	});
?>