<?php

	use \Psr\Http\Message\ServerRequestInterface as Request;
	use \Psr\Http\Message\ResponseInterface as Response;


	$this->get('/attendance', function (Request $request, Response $response, array $args) {
		$attendanceController = new AttendanceController(new DaoManager());

		$response->getBody()->write(json_encode($attendanceController->getAttendanceList()));

        return $response;
	});

	$this->get('/attendance/date/{date}', function (Request $request, Response $response, array $args) {
		$attendanceController = new AttendanceController(new DaoManager());
		$date = DateTime::createFromFormat('m-d-Y', $args["date"])->format('Y-m-d');

		$response->getBody()->write(json_encode($attendanceController->getRecordSetWhere(["D_CLASS_DATE" => $date], ["*"], "MultiResultSet")));

        return $response;
	});

	$this->get('/attendance/{id}', function (Request $request, Response $response, array $args) {
		$attendanceController = new AttendanceController(new DaoManager());

		$response->getBody()->write(json_encode($attendanceController->getRecordSetById($args["id"])));

        return $response;
	});

	$this->get('/attendance/{id}/{type}', function (Request $request, Response $response, array $args) {
		$attendanceController = new AttendanceController(new DaoManager());
		$searchType = $args["type"] == "course" ? "N_COURSE_ID" : "N_STUDENT_ID";
		$response->getBody()->write(json_encode($attendanceController->getRecordSetById($args["id"], ["*"], $searchType, "MultiResultSet")));

        return $response;
	});

	$this->post('/attendance', function (Request $request, Response $response, array $args) {
		$attendanceController = new AttendanceController(new DaoManager());

		$bodyData = $request->getParsedBody();
		$requestResult = $attendanceController->addAttendance($bodyData["studentId"], $bodyData["courseId"],
														$bodyData["hasAttended"], $bodyData["classDate"]);
		$responseBody = new StdClass;
		$responseBody->success = $requestResult;
		return $response->getBody()->write(json_encode($requestResult));
	});

	$this->post('/attendance/update', function (Request $request, Response $response, array $args) {
		$attendanceController = new AttendanceController(new DaoManager());

		$bodyData = $request->getParsedBody();
		$requestResult = $attendanceController->updateAttendance($bodyData["id"], $bodyData["hasAttended"]);
		$responseBody = new StdClass;
		$responseBody->success = $requestResult;
		return $response->getBody()->write(json_encode($requestResult));
	});

?>