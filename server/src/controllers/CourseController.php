<?php

	class CourseController extends GenericController{
		private $dao;
		private $tableName = "course";
		private $studentTable = "students";
		private $instructorTable = "instructor";

		function __construct(DaoManagerInterface $dbConnection){
            parent::__construct($dbConnection, $this->tableName);
		}

		function getCourseList(){
			return parent::getDbConnection()->getAll($this->tableName,["id, S_TITLE, N_INSTRUCTOR_ID, D_TERM_START, D_TERM_END, S_CLASS_DAYS"]);
		}

		function createCourse($courseTitle, $instructorId, $termStart, $termEnd, $termDays){
			$termStart = DateTime::createFromFormat('m/d/Y', $termStart)->format('Y-m-d');
			$termEnd = DateTime::createFromFormat('m/d/Y', $termEnd)->format('Y-m-d');
			try{
				parent::getDbConnection()->startTransaction();
				// Verify the instructor exists. If the instructor does not exist then the transaction does not begin and execution is terminated
				$instructorResultObject = parent::getDbConnection()->getRecordById($this->instructorTable, $instructorId, ["id"]);
				if(isset($instructorResultObject)){
					parent::getDbConnection()->insertRecord($this->tableName, ["S_TITLE"=> $courseTitle, "N_INSTRUCTOR_ID" => $instructorId, "D_TERM_START" => $termStart
					, "D_TERM_END" => $termEnd, "S_CLASS_DAYS" => $termDays]);
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

		function updateCourse($courseId, $courseTitle, $instructorId, $termStart, $termEnd, $termDays){
			$updateRecordSet = null;
			echo "Course Id: ".$courseId;

			if(isExisting($courseTitle)){
				$updateRecordSet["S_TITLE"] = $courseTitle;
			}
			if(isExisting($instructorId)){
				$updateRecordSet["N_INSTRUCTOR_ID"] = $instructorId;
			}
			if(isExisting($termStart)){
				$updateRecordSet["D_TERM_START"] = DateTime::createFromFormat('m/d/Y', $termStart)->format('Y-m-d');
			}
			if(isExisting($termEnd)){
				$updateRecordSet["D_TERM_END"] = DateTime::createFromFormat('m/d/Y', $termEnd)->format('Y-m-d');
			}
			if(isExisting($termDays)){
				$updateRecordSet["S_CLASS_DAYS"] = $termDays;
			}

			try{
				parent::getDbConnection()->startTransaction();

				if(isset($updateRecordSet)){
					parent::getDbConnection()->updateRecordById($this->tableName, $updateRecordSet, $courseId);
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

		function getCourseTermById($id){
			return parent::getDbConnection()->getRecordById($this->courseTable, $id, [D_TERM_START, D_TERM_END]);
		}
	}

?>