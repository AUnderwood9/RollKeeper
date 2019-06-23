<?php

	class PersonController extends GenericController{
		private $tableName = "students";
		private $courseTable = "course";
		private $instructorTable = "instructor";
		private $contactTable = "contact";	

		function __construct(DaoManagerInterface $dbConnection){
            parent::__construct($dbConnection, $this->tableName);
		}

		function getAllPeople($personType){
			if($personType == "instructor"){
				return parent::getDbConnection()->getAll($this->instructorTable, ["id","S_FIRST_NAME", "S_LAST_NAME", "N_CONTACT_ID"], 
																					["instructorId", "firstName", "lastName", "contactId"]);
			}
			else{
				return parent::getDbConnection()->getAll($this->tableName, ["id","S_FIRST_NAME", "S_LAST_NAME", "N_COURSE_ID", "N_CONTACT_ID"],
																			["studentId", "firstName", "lastName", "courseId", "contactId"]);
			}
		}

		function createPerson($personType, $personCreateSet, $contactCreateSet){
			$personInsertSet = ["S_FIRST_NAME" => $personCreateSet["firstName"], "S_LAST_NAME" => $personCreateSet["lastName"]];
			$contactInsertSet = ["S_PRIMARY_PHONE" => $contactCreateSet["phoneNumber"], "S_PRIMARY_EMAIL" => $contactCreateSet["email"]];
			$operationStatus = OperationStatusEnum::FAIL;
			
			try{
				parent::getDbConnection()->startTransaction();

				$contactResultSet = parent::getDbConnection()->insertRecord($this->contactTable, $contactInsertSet);

				if(isset($contactResultSet) && $contactResultSet !== ''){
					$personInsertSet["N_CONTACT_ID"] = $contactResultSet["effectedId"];

					if($personType == "instructor"){
						$createPersonResultSet = parent::getDbConnection()->insertRecord($this->instructorTable, $personInsertSet);
						parent::getDbConnection()->commitTransaction();
						$operationStatus = OperationStatusEnum::SUCCESS;
					}
					else{
						if(isset($personCreateSet["courseId"]) && $personCreateSet["courseId"] !== ''){
							$personInsertSet["N_COURSE_ID"] = $personCreateSet["courseId"];
							$createPersonResultSet = parent::getDbConnection()->insertRecord($this->tableName, $personInsertSet);
							parent::getDbConnection()->commitTransaction();
							$operationStatus = OperationStatusEnum::SUCCESS;
						}
						else{
							parent::getDbConnection()->rollbackTransaction();
							$operationStatus = OperationStatusEnum::FAIL;			
						}
						
					}
				} else{
					parent::getDbConnection()->rollbackTransaction();
					$operationStatus = OperationStatusEnum::FAIL;			
				}
			} 
			catch (Exception $e) {
				echo $e;
				parent::getDbConnection()->rollbackTransaction();
				$operationStatus = OperationStatusEnum::FAIL;
			}

			return $operationStatus;
		}
	}

?>