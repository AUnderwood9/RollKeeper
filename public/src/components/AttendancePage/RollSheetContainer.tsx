import * as React from 'react';

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
	currentCourseId				: String
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
											parseInt(localStorage.getItem("sessionCourseId")).toString() : "0"
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
				</th>
			);

		for(let i = 0; i < this.state.courseDays.length; i++){
			headerIndexSet.push(<th className="rollSheetCell" key={`attendance-index-${uuidv1()}`}>{i+1}</th>);
		}

		tableHeaders.push(<tr key={`main-header-index-set-${uuidv1()}`}>{headerIndexSet}</tr>);

		// Attendance Days
		if(!this.state.displayPrintableView){
			let dayCount = 0;

			headerDaySet.push(
					<th 
						className="rollSheetCell rollSheetNameCell" 
						key={`attendance-day-Blank-cell-${uuidv1()}`}
					>

					</th>
				);

			for(let i = 0; i < this.state.courseDays.length; i++){
				if(dayCount == 0){
					headerDaySet.push(<th className="rollSheetCell" key={`attendance-day-m-${uuidv1()}`}>Monday</th>);
					dayCount++;
				}
				else if(dayCount == 1){
					headerDaySet.push(<th className="rollSheetCell" key={`attendance-day-t-${uuidv1()}`}>Tuesday</th>);
					dayCount++;
				}
				else if(dayCount == 2){
					headerDaySet.push(<th className="rollSheetCell" key={`attendance-day-th-${uuidv1()}`}>Thursday</th>);	
					dayCount = 0;
				}
			}	

			headerDateSet.push(
				<th 
					className="rollSheetCell rollSheetNameCell" 
					key={`attendance-names-header-${uuidv1()}`}
				>
					Names
				</th>
				);

			for(let i = 0; i < this.state.courseDays.length; i++){
				headerDateSet.push(<th className="rollSheetCell" key={`attendance-date-cell-${uuidv1()}`}>
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
									</th>)
			}

			tableHeaders.push(<tr key={`main-header-day-set-${uuidv1()}`}>{headerDaySet}</tr>);
			tableHeaders.push(<tr key={`main-header-date-set-${uuidv1()}`}>{headerDateSet}</tr>); 
		}

		// Create the names of the students along with the respective chekboxes for their attendance.
		
		for(let j = 0; j < this.state.courseRosterList.length; j++){
			let attendanceBodySet : JSX.Element[] = [];

			for(let i = 0; i < this.state.courseDays.length; i++){

				let currentCourseDate 	= this.state.courseDays[i].getDate() < 10 ? 
					"0" + this.state.courseDays[i].getDate().toString() : this.state.courseDays[i].getDate().toString();
				let currentCourseMonth 	= this.state.courseDays[i].getMonth()+1 < 10 ? 
					"0" + (this.state.courseDays[i].getMonth()+1).toString() : (this.state.courseDays[i].getMonth()+1).toString();
				let currentCheckDate 	= `${this.state.courseDays[i].getFullYear()}-${currentCourseMonth}-${currentCourseDate}`;

				let attendanceCheck 	= this.state.attendanceList.find((attendanceElement) => {
					return attendanceElement.studentId == this.state.courseRosterList[j].id &&
					attendanceElement.classDate == currentCheckDate &&
					attendanceElement.hasAttended == true;
				});

				let attendanceIndex 	= this.state.attendanceStateList.findIndex((item) => {
						return item.id == this.state.courseRosterList[j].id 
						&& item.classDate == `${currentCourseMonth}-${currentCourseDate}-${this.state.courseDays[i].getFullYear()}`;
					});

				let generalKeyBody 			= `${this.state.courseRosterList[j].id}-date-${currentCheckDate}-course-${this.state.currentCourseId}`;
				let currentAttendenceRecord = this.state.attendanceStateList[attendanceIndex];
				let isChecked 				= !currentAttendenceRecord.hasAttended;

				if(!this.state.displayPrintableView){
					const checkboxProps = {
						name 				: "attendanceStateList",
						defaultChecked		: !currentAttendenceRecord.hasAttended ,
						value 				: this.state.courseRosterList[j].id ,
						id 					: `student-${this.state.courseRosterList[j].id}-date-${currentCheckDate}` ,
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
							<input type="checkbox" {...checkboxProps} />
						</td>
					)
				}
				else{
					attendanceBodySet.push(
						<td 
							className="rollSheetCell"
							key={`cell-${generalKeyBody}-printable`}
						>

								<span 
									type="checkbox" 
									checked
									id={`student-${this.state.courseRosterList[j].id}-date-${currentCheckDate}-printable`}
									key={`student-${generalKeyBody}-printable`}
								>
										{isChecked ? "x" : ""}
								</span>
						</td>
					)
				}
			}
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
		return [...tableHeaders, ...tableBodySet];
	}

	render(): JSX.Element {

		return (
			<React.Fragment>
				<form method="POST" onSubmit={this.submitAttendanceForm}>
					<table id="roll-sheet-table" className="rollSheetContainer">
						<tbody className="rollSheetBody">
							{ this.state.courseDays.length > 0 ? this.buildTable(1) : <React.Fragment/>}
						</tbody>
					</table>
					{ 
						!this.state.displayPrintableView ? 
						<input type="submit" value="Submit Attendance"/> : <React.Fragment/>
					}

				</form>

				<button onClick={this.handleDisplayChangeClick}>
					{
						!this.state.displayPrintableView ? 
						"Display Printable View" : "Display Editable View"
					}
				</button>
			</React.Fragment>
		);
	}
}

// Workaround to prevent type erros on import
export default RollSheetContainer as any;