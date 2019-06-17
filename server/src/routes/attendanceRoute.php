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
		$response->getBody()->write(json_encode($attendanceController->getRecordSetById($args["id"], ["id", "N_STUDENT_ID", "N_COURSE_ID", "B_HAS_ATTENDED", "D_CLASS_DATE"],
																						$searchType, "MultiResultSet",
																						["id", "studentId", "courseId", "hasAttended", "classDate"])));

        return $response;
	});

	// Get attendance by course id, year and month to ensure each attendance set is unique
	$this->get('/attendance/courseMonth/{courseId}/{yearMonth}', function (Request $request, Response $response, array $args) {
		$attendanceController = new AttendanceController(new DaoManager());
		$searchSet = ["N_COURSE_ID" => $args["courseId"], "D_CLASS_DATE" => " LIKE '".$args["yearMonth"]."-%'"];
		
		$response->getBody()->write(json_encode($attendanceController->getRecordSetWhere($searchSet, 
																						["id", "N_STUDENT_ID", "N_COURSE_ID", "B_HAS_ATTENDED", "D_CLASS_DATE"], 
																						"MultiResultSet",
																						["id", "studentId", "courseId", "hasAttended", "classDate"]
																					)));

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

	$this->post('/attendance/multi', function (Request $request, Response $response, array $args) {
		$attendanceController = new AttendanceController(new DaoManager());

		$bodyData = $request->getParsedBody();
		// $requestResult = $attendanceController->addAttendance($bodyData["studentId"], $bodyData["courseId"],
		// 												$bodyData["hasAttended"], $bodyData["classDate"]);
		$requestResult = $attendanceController->insertMultiRequest($bodyData, 
						["N_STUDENT_ID" => "studentId", "N_COURSE_ID" => "courseId", "B_HAS_ATTENDED" => "hasAttended", "D_CLASS_DATE" => "classDate"]);

		// $responseBody = new StdClass;
		// $responseBody->success = $requestResult;
		// file_put_contents('debug.log', print_r(json_encode($requestResult), true));
		file_put_contents('debug.log', "\n \n", FILE_APPEND | LOCK_EX);
		file_put_contents('debug.log', "-------------Insert Response-------------", FILE_APPEND | LOCK_EX);
		file_put_contents('debug.log', "\n \n", FILE_APPEND | LOCK_EX);
		file_put_contents('debug.log', json_encode($requestResult), FILE_APPEND | LOCK_EX);
		return $response->getBody()->write(json_encode($requestResult));
		// print_r($request->getParsedBody());
		// return $response->getBody()->write(json_encode($request->getParsedBody()));
	});

	$this->post('/attendance/update/multi', function (Request $request, Response $response, array $args) {
		$attendanceController = new AttendanceController(new DaoManager());

		$bodyData = $request->getParsedBody();
		// $requestResult = $attendanceController->addAttendance($bodyData["studentId"], $bodyData["courseId"],
		// 												$bodyData["hasAttended"], $bodyData["classDate"]);
		$requestResult = $attendanceController->updateMultiRequest($bodyData, 
						["id" => "id", "N_STUDENT_ID" => "studentId", "N_COURSE_ID" => "courseId", "B_HAS_ATTENDED" => "hasAttended", "D_CLASS_DATE" => "classDate"]);

		// $responseBody = new StdClass;
		// $responseBody->success = $requestResult;
		file_put_contents('debug.log', "\n \n", FILE_APPEND | LOCK_EX);
		file_put_contents('debug.log', "-------------Update Response-------------", FILE_APPEND | LOCK_EX);
		file_put_contents('debug.log', "\n \n", FILE_APPEND | LOCK_EX);
		file_put_contents('debug.log', json_encode($requestResult), FILE_APPEND | LOCK_EX);
		return $response->getBody()->write(json_encode($requestResult));
		// print_r($request->getParsedBody());
		// return $response->getBody()->write(json_encode($request->getParsedBody()));
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