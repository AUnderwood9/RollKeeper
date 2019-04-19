<?php

	class AttendanceController extends GenericController{
		private $dao;
		private $tableName = "attendance";
		private $studentTable = "students";
		private $instructorTable = "instructor";

		function __construct(DaoManagerInterface $dbConnection){
            parent::__construct($dbConnection, $this->tableName);
		}

		function getAttendanceList(){
			return parent::getDbConnection()->getAll($this->tableName,["id, N_STUDENT_ID, N_COURSE_ID, B_HAS_ATTENDED, D_CLASS_DATE"]);
		}

		function addAttendance($studentId, $courseId, $hasAttended, $classDate){
			$classDate = DateTime::createFromFormat('m/d/Y', $classDate)->format('Y-m-d');

			try{
				parent::getDbConnection()->startTransaction();
				$resultObj = parent::getDbConnection()->insertRecord($this->tableName, ["N_STUDENT_ID" => $studentId, "N_COURSE_ID" => $courseId, "B_HAS_ATTENDED" => $hasAttended, "D_CLASS_DATE" => $classDate]);

				if(isset($resultObj)){
					parent::getDbConnection()->commitTransaction();
					return $operationStatus = OperationStatusEnum::SUCCESS;
				}
				else {
					return $operationStatus = OperationStatusEnum::FAIL;
				}
				
			}
			catch(Exception $e) {
				parent::getDbConnection()->rollbackTransaction();
				return $operationStatus = OperationStatusEnum::FAIL;
			}
		}

		/**
		 * @todo Add capability to update multiple records to reduce service calls made for performance
		 *
		 * @param integer $attendanceId
		 * @param boolean $hasAttended
		 * @return string
		 */
		function updateAttendance($attendanceId, $hasAttended){
			$updateRecordSet = OperationStatusEnum::FAIL;

			try{
				parent::getDbConnection()->startTransaction();

				if(isset($attendanceId) && isset($hasAttended)){
					parent::getDbConnection()->updateRecordById($this->tableName, ["B_HAS_ATTENDED" => $hasAttended], $attendanceId);
					parent::getDbConnection()->commitTransaction();
					return $operationStatus = OperationStatusEnum::SUCCESS;
				}
				else {
					return $operationStatus = OperationStatusEnum::FAIL;
				}
				
			}
			catch(Exception $e) {
				echo $e;
				parent::getDbConnection()->rollbackTransaction();
				return $operationStatus = OperationStatusEnum::FAIL;
			}
		}
	}

?>