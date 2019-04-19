<?php 

	class ContactController{
		private $dao;
		private $tableName = "contact";
		private $studentTable = "students";
		private $instructorTable = "instructor";

		function __construct(DaoManagerInterface $dbConnection){
            $this->dao = $dbConnection;
		}

		public function getAllContacts(){

			return $this->dao->getAll($this->tableName);
		}

		public function getContactById($id){

			return $this->dao->getRecordById($this->tableName, $id, ["id", "S_PRIMARY_PHONE", "S_PRIMARY_EMAIL", "S_SECONDARY_PHONE",
			"S_SECONDARY_EMAIL"]);
		}

		public function getContactByPerson($contactPersonType, $personId){
			$currentTable = ($contactPersonType == $this->studentTable) ? $this->studentTable : $this->instructorTable;

			$contactId = $this->dao->getRecordById($currentTable, $personId)["N_CONTACT_ID"];
			$contactInfo = null;

			// Check if a person has a contact.
			if(isset($contactId) && trim($contactId) !== ''){
				$contactInfo = $this->getContactById($contactId);
			}

			return $contactInfo;
		}

		public function createContact($contactPersonType, $personContactId, $primaryPhone, $primaryEmail, 
										$secondaryPhone=NULL, $secondaryEmail=NULL){

			$operationStatus = $operationStatus = OperationStatusEnum::FAIL;

			try {
				$this->dao->startTransaction();
				$currentTable = ($contactPersonType == $this->studentTable) ? $this->studentTable : $this->instructorTable;
				// Check if a person already has a contact according to their type. If so update it.
				$contactId = $this->getContactByPerson($contactPersonType, $personContactId)["id"];

				if(!isset($contactId)){
					
					$insertSet = ["S_PRIMARY_PHONE" => $primaryPhone, "S_PRIMARY_EMAIL" => $primaryEmail, 
									"S_SECONDARY_PHONE" => $secondaryPhone, "S_SECONDARY_EMAIL" => $secondaryEmail];
					
					$insertId = $this->dao->insertRecord($this->tableName, $insertSet);
					var_dump($insertId["effectedId"]);
					$resultSet = $this->dao->updateRecordById($contactPersonType, ["N_CONTACT_ID" => $insertId["effectedId"]], $personContactId);
					echo "Done";
					var_dump($resultSet);
					if (isset($resultSet) && $resultSet !== ''){
						$operationStatus = OperationStatusEnum::SUCCESS;
						$this->dao->commitTransaction();
                    } else {
                        $this->dao->rollbackTransaction();
                        $operationStatus = OperationStatusEnum::FAIL;
                    }
				} 
				else {
					$this->dao->rollbackTransaction();
					$operationStatus = OperationStatusEnum::FAIL;;
				}

			}
			catch (Exception $e) {
				$this->dao->rollbackTransaction();
				$operationStatus = OperationStatusEnum::FAIL;
				var_dump($e);
			}
											
			return $operationStatus;
		}

		public function updateContact($personContactId, $primaryPhone=null, $primaryEmail=null, 
										$secondaryPhone=null, $secondaryEmail=null){
			$operationStatus = OperationStatusEnum::FAIL;
			$updateRecordSet = null;
			
			if(isExisting($primaryPhone)){
				$updateRecordSet["S_PRIMARY_PHONE"] = $primaryPhone;
			}
			if(isExisting($primaryEmail)){
				$updateRecordSet["S_PRIMARY_EMAIL"] = $primaryEmail;
			}
			if(isExisting($secondaryPhone)){
				$updateRecordSet["S_SECONDARY_PHONE"] = $secondaryPhone;
			}
			if(isExisting($secondaryEmail)){
				$updateRecordSet["S_SECONDARY_EMAIL"] = $secondaryEmail;
			}
			
			try{
				if(isExisting($updateRecordSet)){
					$this->dao->startTransaction();
					$this->dao->updateRecordById($this->tableName, $updateRecordSet, $personContactId);
					$operationStatus = OperationStatusEnum::SUCCESS;
					$this->dao->commitTransaction();
				}

			}
			catch (Exception $e) {
				$this->dao->rollbackTransaction();
				$operationStatus = OperationStatusEnum::FAIL;

			}

			return $operationStatus;
		}
	}

?>