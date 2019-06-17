<?php 

	require_once "OperationTypeEnum.php";
//	require_once "ResultSetTypeEnum.php";
    require_once "DaoManagerInterface.php";

	class DaoManager implements DaoManagerInterface {
		private $dbConn;
		private $servername;
		private $dbUsername;
		private $dbPassword;
		private $dbName;
		private $charset;


		function __construct(){
			$this->servername = apache_getenv("HTTP_SERVER_NAME");
			$this->dbUsername = apache_getenv("HTTP_DB_USER_NAME");
			$this->dbPassword = apache_getenv("HTTP_DB_PASSWORD");
			$this->dbName = apache_getenv("HTTP_DB_NAME");
			$this->charset = 'utf8mb4';

			$dsn = "mysql:host=$this->servername;dbname=$this->dbName;charset=$this->charset";
			$opt = [
				PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
				PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
				PDO::ATTR_EMULATE_PREPARES   => false
			];
			$this->dbConn = new PDO($dsn, $this->dbUsername, $this->dbPassword, $opt);
			// $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		}

		/**
		 * Used to generate placeholders for prepared statements
		 * @param $operationType - type: enum - used to determine the operation type we are generating placeholders for
		 * @param $columnsOrData - type: array(string) or Array(Assoc String) - Can contain only the columns we are replacing or a key value pair of columns and values(data)
         *
         * @return string
         *
         * @TODO Abstract into its own class
		 */
		function generatePlaceholders($operationType, $columnsOrData){
			$placeholderSet = "";

			if($operationType == OperationTypeEnum::RecordInsert){
				for ($x = 0; $x < count($columnsOrData); $x++ ){
					if($x == count($columnsOrData) - 1)
						$placeholderSet .= "?"; 
					else
						$placeholderSet .= "?, ";
				}
			}
			else if($operationType == OperationTypeEnum::RecordRetrieval){
				$arrayKeys = array_keys($columnsOrData);
				$lastElement = array_pop($arrayKeys);
				
				while( $element = each( $columnsOrData ) )
				{

					if($element["key"] == $lastElement){
						// Check if string contains LIKE
						if(strpos($element["value"], "LIKE") !== false){
							$placeholderSet .= $element[ 'key' ].$element["value"]; 
						}
						else{
							$placeholderSet .= $element[ 'key' ]." = '".$element["value"]."'"; 
						}
					}
					else{
						// Check if string contains LIKE
						if(strpos($element["value"], "LIKE") !== false){
							$placeholderSet .= $element[ 'key' ].$element["value"]." AND ";
						}
						else{
							$placeholderSet .= $element[ 'key' ]." = '".$element["value"]."' AND ";
						}
					}

				}
			}
			else {
				$arrayKeys = array_keys($columnsOrData);
				$lastElement = array_pop($arrayKeys);
				
				while( $element = each( $columnsOrData ) )
				{

					if($element["key"] == $lastElement)
						$placeholderSet .= $element[ 'key' ]." = ?"; 
					else
						$placeholderSet .= $element[ 'key' ]." = ?, ";

				}	
			}

			return $placeholderSet;
		}

		/**
		 * Builds a columns substring afor SQL statements.
         * @param $columnArray array(string)
         *
         * return array
         *
         * @TODO Abstract into its own class
		 */
		function buildColumns($columnArray, $aliasList=null){
			if(isExisting($aliasList)){

				$mergedColumn = [];
				for ($i=0; $i < count($columnArray); $i++) { 
					array_push($mergedColumn, "$columnArray[$i] AS $aliasList[$i]");
				}
				return (count($mergedColumn) == 1) ? $mergedColumn[0] : join(", ",$mergedColumn);
			}
			else{
				return (count($columnArray) == 1) ? $columnArray[0] : join(", ",$columnArray);
			}
        }

        /**
         * Used to format results that retrieved from the database
         * @param $statement - type: string
         * @param $resultType - type: Enum
         *
         * @return array
         *
         * @TODO Abstract into its own class
         */
        function formatAndRetrieveResults($statement, $resultType){
            $result = $statement->fetchAll(PDO::FETCH_ASSOC);

            if($resultType == ResultSetTypeEnum::SingleResultSet)
                return $result[0];
            else
                return $result;
		}
		
		function buildMappedArrayfromRequest($columnsAndDataArray, $arrayMappings){
			$newMappedArray = [];

			// print_r($columnsAndDataArray);
			// file_put_contents('debug.log', print_r($columnsAndDataArray, true));

			for ($i=0; $i < count($columnsAndDataArray); $i++) { 
				$mappingKeys = array_keys($arrayMappings);
				for($x=0; $x < count($mappingKeys); $x++){
					$currentKey = $mappingKeys[$x];
					$currentKeyToReplace = $arrayMappings[$mappingKeys[$x]];
					$currentRequestObject[$mappingKeys[$x]] = $columnsAndDataArray[$i][$currentKeyToReplace];
				}
				array_push($newMappedArray, $currentRequestObject);
			}

			// file_put_contents('debug.log', print_r($newMappedArray, true));

			return $newMappedArray;
		}

        /**
         * Used to get all the records in a database.
         * @param $tableName - type: string
         * @param $columnsToSelect - type: array
         *
         * @return array
         */
		function getAll($tableName, $columnsToSelect=["*"], $alisList=null){
			
			$columnsToSelect = $this->buildColumns($columnsToSelect, $alisList);
			$sql = "SELECT $columnsToSelect FROM $tableName";
			
			$statement = $this->dbConn->prepare($sql);
			$statement->execute();
			// $result->fetchAll(PDO::FETCH_CLASS, '$columnName');
			$result = $statement->fetchAll(PDO::FETCH_ASSOC);
			$statement = null;

			return $result;
		}

		/**
		 * 
		 *
		 * @param string $tableName
		 * @param array/object $columnsAndDataArray
		 * @param array/object $columnToRequestMapping
		 * @param string $requestsType
		 * @param object $options
		 * @return array/object
		 */
		/*
		* 	[
				"N_COLUMN" => nColumn
			]
		*/
		function multiQueryRequest($tableName, $columnsAndDataArray, $columnToRequestMapping, $requestsType, $options=null){
			$resultResponse = ["numOfUpdates" => 0, "numOfInserts" => 0];
			file_put_contents('debug.log', "\n \n", FILE_APPEND | LOCK_EX);
			file_put_contents('debug.log', "-------------Multi Query------------- $requestsType ", FILE_APPEND | LOCK_EX);
			try{
				$this->startTransaction();
				$formattedQueryArray = $this->buildMappedArrayfromRequest($columnsAndDataArray, $columnToRequestMapping);
				if($requestsType == "update"){
					$idName =  keyExists($options, "id") ? $options["id"] : "id";
					for ($i=0; $i < count($formattedQueryArray); $i++) { 
						$tempObj = $formattedQueryArray[$i];
						$currentId = $formattedQueryArray[$i]["id"];
						unset($tempObj->id);
						$response = $this->updateRecordById($tableName, $tempObj, $currentId, $idName);
						// file_put_contents('debug.log', "-------------Updating-------------", FILE_APPEND | LOCK_EX);
						file_put_contents('debug.log', "\n \n", FILE_APPEND | LOCK_EX);
						file_put_contents('debug.log', "-------------Updating-------------", FILE_APPEND | LOCK_EX);
						file_put_contents('debug.log', "\n", FILE_APPEND | LOCK_EX);
						file_put_contents('debug.log', print_r($response, true), FILE_APPEND | LOCK_EX);
						if($response > 0){
							$resultResponse["numOfUpdates"]++;
						}
						// array_push($resultResponse, $response);
						// $this->updateRecordById($tableName, $tempObj, $currentId, $idName);
					}
				}
				else if($requestsType == "post"){
					for ($i=0; $i < count($formattedQueryArray); $i++) { 
						$tempObj = $formattedQueryArray[$i];
						if(keyExists($tempObj, "id")){
							unset($tempObj["id"]);
						}
						$response = $this->insertRecord($tableName, $tempObj);
						// file_put_contents('debug.log', "-------------Posting-------------", FILE_APPEND | LOCK_EX);
						file_put_contents('debug.log', "\n \n", FILE_APPEND | LOCK_EX);
						file_put_contents('debug.log', "-------------Posting-------------", FILE_APPEND | LOCK_EX);
						file_put_contents('debug.log', "\n", FILE_APPEND | LOCK_EX);
						file_put_contents('debug.log', print_r($response, true), FILE_APPEND | LOCK_EX);
						if($response["rowsEffected"] > 0){
							$resultResponse["numOfInserts"]++;
						}
						// array_push($resultResponse, $response);
					}
				}

				$this->commitTransaction();
			}
			catch(Exception $error) {
				// echo $error;
				file_put_contents('debug.log', "\n \n", FILE_APPEND | LOCK_EX);
				file_put_contents('debug.log', "-------------ERROR-------------", FILE_APPEND | LOCK_EX);
				file_put_contents('debug.log', "\n", FILE_APPEND | LOCK_EX);
				file_put_contents('debug.log', $error, FILE_APPEND | LOCK_EX);
				$this->rollbackTransaction();
			}

			// return $formattedQueryArray;
			return $resultResponse;
		}

		/**
		 * Used to get records from a database using a where clause (Only works for columns that can be matched with string values)
		 * @param $tableName - type: string
		 * @param $columnsAndData - type: array(string)
		 * @param $columnsToSelect - type: array(string)
         * @param $resultType - type: enum
         *
         * @return array
		 */
		function getRecordsWhere($tableName, $columnsAndData, $columnsToSelect=["*"], $resultType=ResultSetTypeEnum::SingleResultSet, 
								$aliasList=null){
			$operationType = new OperationTypeEnum(OperationTypeEnum::RecordRetrieval);
			$placeholderSet = $this->generatePlaceholders($operationType, $columnsAndData);
			$columnsToSelect = $this->buildColumns($columnsToSelect, $aliasList);

			$sql = "SELECT $columnsToSelect FROM $tableName WHERE $placeholderSet";
			
            $statement = $this->dbConn->prepare($sql);
			$statement->execute();
			$result = $this->formatAndRetrieveResults($statement, $resultType);
			$statement = null;

			return $result;
		}

		/**
		 * Used to get records from a database by their ID
		 * @param $tableName - type: string
		 * @param $id - type: int
         *
         * @return array
		 */
		function getRecordById($tableName, $id, $columnsToSelect=["*"], $idName = "id", $resultType=ResultSetTypeEnum::SingleResultSet, 
								$distinct=false, $aliasList=null){
			$columnsToSelect = $this->buildColumns($columnsToSelect, $aliasList);
			$sql = "SELECT". ($distinct ? " DISTINCT" : "") ." $columnsToSelect FROM $tableName where $idName = ? ";

			$statement = $this->dbConn->prepare($sql);
			$statement->execute([$id]);
			$result = $this->formatAndRetrieveResults($statement, $resultType);

			$statement = null;

			return $result;

		}

		/**
		 * Used to update records in a database by using the keys and values of an associative array.
		 * format:("Key" => "Column")
		 * @param $tableName - type: string
		 * @param $id - type: int
		 * @param $columnsAndData - type: Array(Assoc String)
		 * @param $idName - type: string
         *
         * @return int
		 */
		function updateRecordById($tableName, $columnsAndData, $id, $idName = "id"){
			
			$operationType = new OperationTypeEnum(OperationTypeEnum::RecordChange);
			$placeholderSet = $this->generatePlaceholders($operationType, $columnsAndData);
			
			$sql = "UPDATE $tableName SET $placeholderSet WHERE $idName = $id";

			$statement = $this->dbConn->prepare($sql);
			$statement->execute(array_values($columnsAndData));
			$numberOfRowschanged = $statement->rowCount();
			$statement = null;

			return $numberOfRowschanged;
		}

		/**
		 * Used to insert records in a database by using the keys and values of an associative array.
		 * format:("Key" => "Column")
		 * @param $tableName - type: string
		 * @param $columnsAndData - type: Array(Assoc String)
		 *
         * @return array
		 */
		function insertRecord($tableName, $columnsAndData){
			$operationType = new OperationTypeEnum(OperationTypeEnum::RecordInsert);
			$placeholderSet = $this->generatePlaceholders($operationType, $columnsAndData);
			
			$sql = "INSERT INTO $tableName (".join(", ", array_keys($columnsAndData)).") VALUES ($placeholderSet)";
			
			$statement = $this->dbConn->prepare($sql);
			$statement->execute(array_values($columnsAndData));
			$resultSet = array("rowsEffected" => $statement->rowCount(), "effectedId" => $this->dbConn->LastInsertId());
			$statement = null;

			return $resultSet;
		}

        /**
         * Deletes records in database by a supplied id
         * @param $tableName - type: string
         * @param $id - type: int
         * @param $idName - type: string
         *
         * @return array
         */
		function deleteRecord($tableName, $id, $idName = "id" ){
			$sql = "DELETE FROM $tableName WHERE $idName = ?";

			$statement = $this->dbConn->prepare($sql);
			$statement->execute([$id]);
			$numberOfRowsChanged = array("Number of Rows Effected" => $statement->rowCount());
			$statement = null;

			return $numberOfRowsChanged;
		}

		/**
		 * @TODO find a way to avoid using this boilerplate code.
		 */
		function startTransaction(){
            $this->dbConn->beginTransaction();
        }

        function commitTransaction(){
            $this->dbConn->commit();
        }

        function rollbackTransaction(){
            $this->dbConn->rollBack();
        }

        /**
         * Closes connection
         */
		function closeConnection(){
			$this->dbConn = null;
		}
	}
	

?>