import * as React from 'react';
import Paginator from "./paginator";

import { makeFetchPost } from '../../serviceTools';

import uuidv1 from 'uuid/v1';


/** This componenet is not expecting props. */
interface Props{

}

interface State {
	attendanceList				: {}[];
	courseRosterList			: {}[];
	attendanceStateList			: {}[];
	courseDays					: Date[];
	freshRosterAttendanceList	: {}[];
	updateRosterAttendanceList	: {}[];
	formSubmitted				: boolean,
	displayPrintableView		: boolean,
	currentCourseId				: String,
	paginationThreshold			: number
}

class RollSheetContainer extends React.Component<Props, State>{
	constructor(props: Props){
		super(props);
		
		console.log(localStorage.getItem("sessionCourseId"));
		
		this.state = {
			formSubmitted				: false,
			displayPrintableView		: false,
			attendanceList				: [],
			courseRosterList			: [],
			attendanceStateList			: [],
			courseDays					: [],
			freshRosterAttendanceList	: [],
			updateRosterAttendanceList	: [],
			currentCourseId				: localStorage.getItem("sessionCourseId") != null ? 
											parseInt(localStorage.getItem("sessionCourseId")).toString() : "0",
			paginationThreshold			: 0
		}
	}

	
	async componentDidMount(){
		const attendanceEndpoint 	= `http://localhost/rollKeeper/api/attendance/${this.state.currentCourseId}/course`;
		const rosterEndpoint 		= `http://localhost/rollKeeper/api/person/student/course/${this.state.currentCourseId}`;
		const courseTermEndpoint 	= `http://localhost/rollKeeper/api/course/${this.state.currentCourseId}/term`

		const 	[
					attendanceResponse, 
					rosterResponse, 
					courseTermResponse
				] = await Promise.all(
					[
						fetch(attendanceEndpoint),
						fetch(rosterEndpoint),
						fetch(courseTermEndpoint)
					]
		);

		const 	[
					attendanceResponseObj, 
					rosterResponseObj, 
					courseTermResponseObj
				] = await Promise.all(
					[
						attendanceResponse.json(), 
						rosterResponse.json(),
						courseTermResponse.json()
					]
		);

		Date.prototype.addDays = function(days) {
			var newDate = new Date(this.valueOf())
			newDate.setDate(newDate.getDate() + days);
			return newDate;
		}
	 
		function getDates(startDate, stopDate) {
			var dateArray 	= new Array();
			var currentDate = startDate;
			while (currentDate <= stopDate) {
				dateArray.push(currentDate)
				currentDate = currentDate.addDays(1);
		   }

		   return dateArray;
		 }

		 const courseStart 	: Date = new Date(courseTermResponseObj.termStart);
		 const courseEnd 	: Date = new Date(courseTermResponseObj.termEnd)

		 // Dates are converted to UTC to ignore daylight savings time. 
		 // For keeping track of attendance this is sufficient
		 let tempDateArray = getDates( new Date(Date.UTC(
													 courseStart.getFullYear(), 
													 courseStart.getUTCMonth(), 
													 courseStart.getUTCDate())) ,
		 								new Date(Date.UTC(
											 courseEnd.getFullYear(), 
											 courseEnd.getUTCMonth(), 
											 courseEnd.getUTCDate()+1)) )
			.filter((element) => {
				return element.getDay() == 1 || element.getDay() == 2 || element.getDay() == 4;
				});

			const dateArray = tempDateArray.map((item,index) => { 
					return item.toLocaleDateString("en-US", {year:"numeric", month: "2-digit", day: "2-digit"}).replace(/\//g ,"-");
				});


		let attendanceStateList = [];

		for (let i = 0; i < rosterResponseObj.length; i++) {

			for (let j = 0; j < dateArray.length; j++) {

				let attendanceCheck = attendanceResponseObj.find((attendanceElement) => {
						return attendanceElement.studentId == rosterResponseObj[i].id &&
						attendanceElement.classDate == dateArray[j];
					});

				// Add State objects for our controlled checkboxes.
				attendanceStateList.push(
					Object.assign(
							{}, 
							rosterResponseObj[i], 
							{
								classDate				: dateArray[j],
								attendanceRecordExists	: attendanceCheck == undefined ? 0 : 1, 
								hasAttended				: attendanceCheck == undefined ? 0 : attendanceCheck.hasAttended,
								attendanceRecordId		: attendanceCheck == undefined ? undefined : attendanceCheck.id
							}
						));
				
			}
			
		}

		this.setState({ 
				attendanceList		: attendanceResponseObj, 
				courseRosterList	: rosterResponseObj, 
				courseDays			: tempDateArray, 
				attendanceStateList 
			});
	}

	async componentDidUpdate(){
		if(this.state.formSubmitted){

			console.log("Updating");
			const attendanceEndpoint 	= `http://localhost/rollKeeper/api/attendance/courseMonth/` 
				+ `${this.state.currentCourseId}/${this.state.currentMonthYear}-`
				+ `${this.state.currentMonth < 10 ? "0" + this.state.currentMonth : this.state.currentMonth}`;

			const attendanceResponse 	= await fetch(attendanceEndpoint);
			const attendanceResponseObj = await attendanceResponse.json();

			this.setState({ formSubmitted: false, attendanceList: attendanceResponseObj });
		}

	}

	handleCheckboxClick = (this.state) = () => {
		const hasStudentAttended 	= !event.target.checked;
		let currentSelectedDate 	= event.target.id.match("(\\d{4}-\\d{2}-\\d{2})")[0];
		let { attendanceStateList } = this.state;
		let currentAttendanceIndex 	= event.target.dataset.stateindex;
		let currentAttendanceObj 	= currentAttendanceObj = {
				id			: attendanceStateList[currentAttendanceIndex].attendanceRecordId,
				studentId	: event.target.value,
				courseId	: this.state.currentCourseId,
				hasAttended	: hasStudentAttended,
				classDate	: currentSelectedDate
			};

		let newAttendanceObj = Object.assign(
								attendanceStateList[currentAttendanceIndex], 
								{hasAttended	: hasStudentAttended});

		console.log(newAttendanceObj);

		let SelectedStudentObj = attendanceStateList[currentAttendanceIndex];

		// Determine if the student already has a record of attendance.
		if(SelectedStudentObj.attendanceRecordExists){
			let tempAttendanceList = this.state.updateRosterAttendanceList;

			let updateRecordIndex = tempAttendanceList.findIndex((item) => {
				return item.studentId == event.target.value 
				&& item.classDate == event.target.dataset.date;
			});
			
			// if the update list has this record already remove it to avoid duplicate submissions
			if(updateRecordIndex != undefined && updateRecordIndex != null && updateRecordIndex != -1){
				tempAttendanceList.splice(updateRecordIndex, 1);
				// tempAttendanceList[updateRecordIndex].
			}

			tempAttendanceList.push(currentAttendanceObj);
			attendanceStateList[currentAttendanceIndex].hasAttended = hasStudentAttended;
			this.setState({ updateRosterAttendanceList: tempAttendanceList, attendanceStateList });

		} else {
			let tempAttendanceList = this.state.freshRosterAttendanceList;

			let newRecordIndex = tempAttendanceList.findIndex((item) => {
				return item.studentId == event.target.value 
				&& item.classDate == event.target.dataset.date;
			});

			// if the new record list has this record already remove it to avoid duplicate submissions
			if(newRecordIndex != undefined && newRecordIndex != null && newRecordIndex != -1){
				tempAttendanceList.splice(newRecordIndex, 1);
			}

			tempAttendanceList.push(currentAttendanceObj);
			attendanceStateList[currentAttendanceIndex].hasAttended = hasStudentAttended;
			this.setState({ freshRosterAttendanceList: tempAttendanceList, attendanceStateList });
		}
	}

	handlePagination = (intervalDefinition: String) => (event) => {
		let { paginationThreshold } = this.state;

		if(paginationThreshold < this.state.courseDays.length
			&& (paginationThreshold + 25) < this.state.courseDays.length 
			&& intervalDefinition === "incriment")
		{
			paginationThreshold += (paginationThreshold + 25) < this.state.courseDays.length ? 
				25 : this.state.courseDays.length - paginationThreshold;

			this.setState({paginationThreshold});
		}
		else if(paginationThreshold > 0 
			&& intervalDefinition === "decriment"){

			paginationThreshold = (paginationThreshold - 25) > 0 ? 
				paginationThreshold - 25 : 0;

			this.setState({paginationThreshold});
		}
	}

	handleDisplayChangeClick = (this.state) = () => {
		this.setState({ displayPrintableView: !this.state.displayPrintableView });
	}

	submitAttendanceForm = (this.state) = async () => {
		event.preventDefault();
		let { freshRosterAttendanceList, updateRosterAttendanceList } = this.state;

		const [createResponse, updateResponse] = await Promise.all([
			makeFetchPost("/attendance/multi", freshRosterAttendanceList),
			makeFetchPost("/attendance/update/multi", updateRosterAttendanceList)
		]);

		freshRosterAttendanceList.splice(0, freshRosterAttendanceList.length);
		updateRosterAttendanceList.splice(0, updateRosterAttendanceList.length);

		this.setState({ freshRosterAttendanceList, updateRosterAttendanceList });
	}

	buildTableCheckboxes(studentIdIndex: number, 
		attendanceBodySet: JSX.Element[]): void{
		if(!this.state.displayPrintableView){
			for(let i = 0; i < this.state.courseDays.length; i++){

				let currentCourseDate 	= this.state.courseDays[i].getDate() < 10 ? 
					"0" + this.state.courseDays[i].getDate().toString() : this.state.courseDays[i].getDate().toString();
				let currentCourseMonth 	= this.state.courseDays[i].getMonth()+1 < 10 ? 
					"0" + (this.state.courseDays[i].getMonth()+1).toString() : (this.state.courseDays[i].getMonth()+1).toString();
				let currentCheckDate 	= `${this.state.courseDays[i].getFullYear()}-${currentCourseMonth}-${currentCourseDate}`;

				let attendanceCheck 	= this.state.attendanceList.find((attendanceElement) => {
					return attendanceElement.studentId == this.state.courseRosterList[studentIdIndex].id &&
					attendanceElement.classDate == currentCheckDate &&
					attendanceElement.hasAttended == true;
				});

				let attendanceIndex 	= this.state.attendanceStateList.findIndex((item) => {
						return item.id == this.state.courseRosterList[studentIdIndex].id 
						&& item.classDate == `${currentCourseMonth}-${currentCourseDate}-${this.state.courseDays[i].getFullYear()}`;
					});

				let generalKeyBody 			= `${this.state.courseRosterList[studentIdIndex].id}-date-${currentCheckDate}-course-${this.state.currentCourseId}`;
				let currentAttendenceRecord = this.state.attendanceStateList[attendanceIndex];
				let isChecked 				= !currentAttendenceRecord.hasAttended;

				const checkboxProps = {
					type				: "checkbox",
					name 				: "attendanceStateList",
					defaultChecked		: !currentAttendenceRecord.hasAttended ,
					value 				: this.state.courseRosterList[studentIdIndex].id ,
					id 					: `student-${this.state.courseRosterList[studentIdIndex].id}-date-${currentCheckDate}` ,
					key 				: `student-${generalKeyBody}` ,
					onClick 			: this.handleCheckboxClick ,
					"data-date" 		: `${currentCourseMonth}-${currentCourseDate}-${this.state.courseDays[i].getFullYear()}`, 
					"data-stateindex"	: attendanceIndex,
					"data-stateid" 		: currentAttendenceRecord != undefined && currentAttendenceRecord != null ? 
											currentAttendenceRecord.id : -1
				};

				attendanceBodySet.push(
					<td 
						className="rollSheetCell" 
						key={`student-td-${generalKeyBody}`}
					>
						<input {...checkboxProps} />
					</td>
				);
			}
		} else {
			const UPPER_THRESHOLD = 
				(this.state.paginationThreshold + 25) < this.state.courseDays.length ? 
				this.state.paginationThreshold + 25 : 
				this.state.courseDays.length;

			const PADDING_THRESHOLD = this.state.paginationThreshold + 25 - UPPER_THRESHOLD; 

			for(let i = this.state.paginationThreshold; i < UPPER_THRESHOLD; i++){
				let currentCourseDate 	= this.state.courseDays[i].getDate() < 10 ? 
					"0" + this.state.courseDays[i].getDate().toString() : this.state.courseDays[i].getDate().toString();
				let currentCourseMonth 	= this.state.courseDays[i].getMonth()+1 < 10 ? 
					"0" + (this.state.courseDays[i].getMonth()+1).toString() : (this.state.courseDays[i].getMonth()+1).toString();
				let currentCheckDate 	= `${this.state.courseDays[i].getFullYear()}-${currentCourseMonth}-${currentCourseDate}`;

				let attendanceIndex 	= this.state.attendanceStateList.findIndex((item) => {
						return item.id == this.state.courseRosterList[studentIdIndex].id 
						&& item.classDate == `${currentCourseMonth}-${currentCourseDate}-${this.state.courseDays[i].getFullYear()}`;
					});

				let generalKeyBody 			= `${this.state.courseRosterList[studentIdIndex].id}-date-${currentCheckDate}-course-${this.state.currentCourseId}`;
				let currentAttendenceRecord = this.state.attendanceStateList[attendanceIndex];
				let isChecked 				= !currentAttendenceRecord.hasAttended;

				attendanceBodySet.push(
					<td 
						className="rollSheetCell"
						key={`cell-${generalKeyBody}-printable`}
					>

							<span 
								key={`student-${generalKeyBody}-printable`}
							>
									{isChecked ? "" : "X"}
							</span>
					</td>
				);
			}
			
			if( UPPER_THRESHOLD == this.state.courseDays.length){
				for(let i = 0; i < PADDING_THRESHOLD; i++){
					attendanceBodySet.push(
						<td 
							className="rollSheetCell printableBoxCell"
							key={`cell-${uuidv1()}-printable`}
						>
	
								<span 
									key={`student-${uuidv1()}-printable`}
								>
								</span>
						</td>
					);
				}
			}
		}
	}

	buildBlankTableRows(rows: number, columns: number, tableBodySet: JSX.Element[]): void{
		for(let i = 0; i < rows; i++){
			let blankColumnSet: JSX.Element[] = [];
			for(let j = 0; j < columns; j++){
				blankColumnSet.push(
					<td 
							className="rollSheetCell printableBoxCell"
							key={`cell-${uuidv1()}-printable`}
						>
	
								<span 
									key={`student-${uuidv1()}-printable`}
								>
								</span>
						</td>
				);
			}
			tableBodySet.push(
				<tr key={`student-header-row-${uuidv1()}`}>
					<th className="rollSheetCell rollSheetNameCell" 
						key={`student-header-${uuidv1()}`}
					>
						<p></p>
					</th>
					{blankColumnSet}
				</tr>
			);
		}
	}

	buildTable(StartingIndex: number): JSX.Element[]{
		let tableHeaders	: JSX.Element[] = [];
		let headerIndexSet	: JSX.Element[] = [];
		let headerDaySet	: JSX.Element[] = [];
		let headerDateSet	: JSX.Element[] = [];
		let tableBodySet	: JSX.Element[] = [];

		// Attendance cell index
		headerIndexSet.push(
				<th 
					className="rollSheetCell rollSheetNameCell" 
					key={`attendance-name-cell-blank-${uuidv1()}`}
				>
					{
						!this.state.displayPrintableView ? 
						<p></p> : "PARTICIPANTS NAME"
					}
				</th>
			);

		// Attendance Days
		if(!this.state.displayPrintableView){
			for(let i = 0; i < this.state.courseDays.length; i++){
				headerIndexSet.push(<td className="rollSheetCell" key={`attendance-index-${uuidv1()}`}>{i+1}</td>);
			}
	
			tableHeaders.push(<tr key={`main-header-index-set-${uuidv1()}`}>{headerIndexSet}</tr>);

			let dayCount = 0;

			headerDaySet.push(
					<th 
						className="rollSheetCell rollSheetNameCell printableHidden" 
						key={`attendance-day-Blank-cell-${uuidv1()}`}
					>

					</th>
				);

			for(let i = 0; i < this.state.courseDays.length; i++){
				if(dayCount == 0){
					headerDaySet.push(<td className="rollSheetCell" key={`attendance-day-m-${uuidv1()}`}>Monday</td>);
					dayCount++;
				}
				else if(dayCount == 1){
					headerDaySet.push(<td className="rollSheetCell" key={`attendance-day-t-${uuidv1()}`}>Tuesday</td>);
					dayCount++;
				}
				else if(dayCount == 2){
					headerDaySet.push(<td className="rollSheetCell" key={`attendance-day-th-${uuidv1()}`}>Thursday</td>);	
					dayCount = 0;
				}
			}	

			headerDateSet.push(
				<th 
					className="rollSheetCell rollSheetNameCell" 
					key={`attendance-names-header-${uuidv1()}`}
				>
					<p>Names</p>
				</th>
				);

			for(let i = 0; i < this.state.courseDays.length; i++){
				headerDateSet.push(<td className="rollSheetCell" key={`attendance-date-cell-${uuidv1()}`}>
										{
											this.state.courseDays[i].toLocaleDateString(
												"en-US", 
													{
														year:"numeric", 
														month: "2-digit", 
														day: "2-digit"
													}
												)
										}
									</td>)
			}

			tableHeaders.push(<tr className="printableHidden" key={`main-header-day-set-${uuidv1()}`}>{headerDaySet}</tr>);
			tableHeaders.push(<tr className="printableHidden" key={`main-header-date-set-${uuidv1()}`}>{headerDateSet}</tr>); 
		} else {
			for(let i = 0; i < 25; i++){
				headerIndexSet.push(<td className="rollSheetCell" key={`attendance-index-${uuidv1()}`}>{i+1}</td>);
			}
	
			tableHeaders.push(<tr key={`main-header-index-set-${uuidv1()}`}>{headerIndexSet}</tr>);
		}

		// Create the names of the students along with the respective chekboxes for their attendance.
		
		for(let j = 0; j < this.state.courseRosterList.length; j++){
			let attendanceBodySet : JSX.Element[] = [];
			this.buildTableCheckboxes(j, attendanceBodySet);
			
			tableBodySet.push((
								<tr key={`student-header-row-${uuidv1()}`}>
									<th className="rollSheetCell rollSheetNameCell" 
										key={`student-header-${uuidv1()}`}
									>
										{`${this.state.courseRosterList[j].firstName} ${this.state.courseRosterList[j].lastName}`}
									</th>
									{attendanceBodySet}
								</tr>
							));

		}

		if(this.state.displayPrintableView && (this.state.courseRosterList.length < 20)){
			this.buildBlankTableRows(20 - this.state.courseRosterList.length, 25, tableBodySet);
		}

		return [...tableHeaders, ...tableBodySet];
	}

	render(): JSX.Element {

		return (
			<React.Fragment>
				<div className={`courseHeadersContainer ${this.state.displayPrintableView ? "printableRevealed" : ""}`}>
					<h1 className="rollLeadHeading">Participant -Attendance-</h1>

					<div className="courseHeaders">
						<div className="rollLeadHeaderBox">
							<p>Course Title</p>
							<p>{localStorage.getItem("sessionCourseTitle")}</p>
						</div>
						<div className="rollLeadHeaderBox">
							<p>Beginning Date</p>
							<p>{localStorage.getItem("sessionTermStart")}</p>
						</div>
						<div className="rollLeadHeaderBox">
							<p>Total Course Hours</p>
							<p></p>
						</div>
					</div>
				</div>

				<form method="POST" onSubmit={this.submitAttendanceForm}>
					<table id="roll-sheet-table" className="rollSheetContainer">
						<tbody className={`rollSheetBody ${this.state.displayPrintableView ? "printableTableBody" : ""}`}>
							{ this.state.courseDays.length > 0 ? this.buildTable(1) : <React.Fragment/>}
						</tbody>
					</table>
					{ 
						!this.state.displayPrintableView ? 
						<input type="submit" value="Submit Attendance"/> : <React.Fragment/>
					}

				</form>

				<button className="viewTypeBtn" onClick={this.handleDisplayChangeClick}>
					{
						!this.state.displayPrintableView ? 
						"Display Printable View" : "Display Editable View"
					}
				</button>
				{
					!this.state.displayPrintableView ? 
						<React.Fragment /> : <Paginator handlePagination={this.handlePagination} />
				}
			</React.Fragment>
		);
	}
}

// Workaround to prevent type erros on import
export default RollSheetContainer as any;