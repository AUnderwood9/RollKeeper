<?php

	class GenericController{
		private $dao;
		private $tableName;

		function __construct(DaoManagerInterface $dbConnection, $tableName){
			$this->dao = $dbConnection;
			$this->tableName = $tableName;
		}

		function getRecordSetById($id, $columnsToSelect=["*"], $idName = "id", $resultType=ResultSetTypeEnum::SingleResultSet){
			return $this->dao->getRecordById($this->tableName, $id, $columnsToSelect, $idName, $resultType);
		}
		
		function getSecondaryRecordSetById($id, $secondaryTableName, $columnsToSelect=["*"], $idName = "id", $resultType=ResultSetTypeEnum::SingleResultSet){
			return $this->dao->getRecordById($this->secondaryTableName, $id, $columnsToSelect, $idName, $resultType);
		}

		function getRecordSetWhere($columnsAndData, $columnsToSelect=["*"], $resultType=ResultSetTypeEnum::SingleResultSet, $aliasList=NULL){
			return $this->dao->getRecordsWhere($this->tableName, $columnsAndData , $columnsToSelect, $resultType, $aliasList);
		}

		function getDbConnection(){
			return $this->dao;
		}
	}

?>