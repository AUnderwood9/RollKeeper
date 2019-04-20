<?php

	use \Psr\Http\Message\ServerRequestInterface as Request;
	use \Psr\Http\Message\ResponseInterface as Response;


	$this->get('/courses', function (Request $request, Response $response, array $args) {
		$courseController = new CourseController(new DaoManager());
		$controllerResponse = json_encode($courseController->getCourseList());

		// $response->getBody()->write(json_encode(["courseId" => $controllerResponse["id"], "courseTitle" => $controllerResponse["S_TITLE"], 
		// 									"instructorId" => $controllerResponse["N_INSTRUCTOR_ID"], "termStart" => $controllerResponse["D_TERM_START"],
		// 									"termEnd" => $controllerResponse["D_TERM_END"], "classDays" => $controllerResponse["S_CLASS_DAYS"]]));

		$response->getBody()->write($controllerResponse);

        return $response;
	});

	$this->get('/course/{id}', function (Request $request, Response $response, array $args) {
		$courseController = new CourseController(new DaoManager());

		$response->getBody()->write(json_encode($courseController->getRecordSetById($args["id"])));

        return $response;
	});
	
	$this->get('/course/{id}/term', function (Request $request, Response $response, array $args) {
		$courseController = new CourseController(new DaoManager());

		$response->getBody()->write(json_encode($courseController->getCourseTermById($args["id"])));

        return $response;
	});

	$this->post('/course', function (Request $request, Response $response, array $args) {
		$courseController = new CourseController(new DaoManager());

		$bodyData = $request->getParsedBody();
		$requestResult = $courseController->createCourse($bodyData["courseTitle"], $bodyData["instructorId"],
														$bodyData["termStart"], $bodyData["termEnd"], $bodyData["termDays"]);
		$responseBody = new StdClass;
		$responseBody->success = $requestResult;
		return $response->getBody()->write(json_encode($requestResult));
	});

	$this->post('/course/{id}', function (Request $request, Response $response, array $args) {
		$courseController = new CourseController(new DaoManager());

		$bodyData = $request->getParsedBody();
		$requestResult = $courseController->updateCourse($args["id"],
														$bodyData["courseTitle"], $bodyData["instructorId"],
														$bodyData["termStart"], $bodyData["termEnd"], $bodyData["termDays"]);
		$responseBody = new StdClass;
		$responseBody->success = $requestResult;
		return $response->getBody()->write(json_encode($requestResult));
	});
?>