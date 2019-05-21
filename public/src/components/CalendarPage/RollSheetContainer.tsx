import * as React from 'react';

import { makeFetchPost } from '../../serviceTools';

interface Props{
	courseId: number;
}

interface State {
	attendanceList: {}[];
	courseRosterList: {}[];
	courseDays: Date[];
	freshRosterAttendanceList: {}[];
	updateRosterAttendanceList: {}[];
	formSubmitted: boolean
}

class RollSheetContainer extends React.Component<Props, State>{
	constructor(props: Props){
		super(props);
		
		this.state = {
			formSubmitted: false,
			attendanceList: [],
			courseRosterList: [],
			courseDays: [],
			freshRosterAttendanceList: [],
			updateRosterAttendanceList: []
		}
	}

	
	async componentDidMount(){
		const attendanceEndpoint = `http://localhost/rollKeeper/api/attendance/courseMonth/${this.props.courseId}/${this.state.currentMonthYear}-${this.state.currentMonth < 10 ? "0" + this.state.currentMonth : this.state.currentMonth}`;
		const rosterEndpoint = `http://localhost/rollKeeper/api/person/student/course/${this.props.courseId}`;
		const courseTermEndpoint = `http://localhost/rollKeeper/api/course/${this.props.courseId}/term`

		const [attendanceResponse, rosterResponse, courseTermResponse] = await Promise.all([
			fetch(attendanceEndpoint),
			fetch(rosterEndpoint),
			fetch(courseTermEndpoint)
		]);

		const [attendanceResponseObj, rosterResponseObj, courseTermResponseObj] = await Promise.all([
			attendanceResponse.json(), 
			rosterResponse.json(),
			courseTermResponse.json()
		]);

		Date.prototype.addDays = function(days) {
			var dat = new Date(this.valueOf())
			dat.setDate(dat.getDate() + days);
			return dat;
		}
	 
		function getDates(startDate, stopDate) {
		   var dateArray = new Array();
		   var currentDate = startDate;
		   while (currentDate <= stopDate) {
			 dateArray.push(currentDate)
			 currentDate = currentDate.addDays(1);
		   }
		   return dateArray;
		 }

		 const tempDateArray = getDates(new Date(courseTermResponseObj.termStart), new Date(courseTermResponseObj.termEnd))
			.filter((element) => {
			return element.getDay() == 1 || element.getDay() == 2 || element.getDay() == 4;
			});

		this.setState({ attendanceList: attendanceResponseObj, courseRosterList: rosterResponseObj, courseDays: tempDateArray });
	}

	async componentDidUpdate(){
		if(this.state.formSubmitted){
			console.log("Updating");
			const attendanceEndpoint = `http://localhost/rollKeeper/api/attendance/courseMonth/${this.props.courseId}/${this.state.currentMonthYear}-${this.state.currentMonth < 10 ? "0" + this.state.currentMonth : this.state.currentMonth}`;
			const attendanceResponse = await fetch(attendanceEndpoint);
			const attendanceResponseObj = await attendanceResponse.json();

			this.setState({ formSubmitted: false, attendanceList: attendanceResponseObj });
		}

		console.log(this.state.attendanceList);

	}

	buildTable(StartingIndex: number): JSX.Element[]{
		let tableHeaders: JSX.Element[] = [];
		let headerIndexSet: JSX.Element[] = [];
		let headerDaySet: JSX.Element[] = [];
		let headerDateSet: JSX.Element[] = [];
		let tableBodySet: JSX.Element[] = [];

		headerIndexSet.push(<th className="rollSheetCell"></th>);
		for(let i = 0; i < this.state.courseDays.length; i++){
			headerIndexSet.push(<th className="rollSheetCell">{i+1}</th>);
		}

		let dayCount = 0;
		headerDaySet.push(<th className="rollSheetCell"></th>);
		for(let i = 0; i < this.state.courseDays.length; i++){
			if(dayCount == 0){
				headerDaySet.push(<th className="rollSheetCell">Monday</th>);
				dayCount++;
			}
			else if(dayCount == 1){
				headerDaySet.push(<th className="rollSheetCell">Tuesday</th>);
				dayCount++;
			}
			else if(dayCount == 2){
				headerDaySet.push(<th className="rollSheetCell">Thursday</th>);	
				dayCount = 0;
			}
		}

		headerDateSet.push(<th className="rollSheetCell">Names</th>);
		for(let i = 0; i < this.state.courseDays.length; i++){
			headerDateSet.push(<th className="rollSheetCell">{this.state.courseDays[i].toLocaleDateString("en-US", {year:"numeric", month: "2-digit", day: "2-digit"})}</th>)
		}

		tableHeaders.push(<tr>{headerIndexSet}</tr>);
		tableHeaders.push(<tr>{headerDaySet}</tr>);
		tableHeaders.push(<tr>{headerDateSet}</tr>); 

		let attendanceBodySet: JSX.Element[] = [];
		for(let j = 0; j < this.state.courseRosterList.length; j++){
			for(let i = 0; i < this.state.courseDays.length; i++){
				let currentCourseDate = this.state.courseDays[i].getDate() < 10 ? "0" + this.state.courseDays[i].getDate().toString() : this.state.courseDays[i].getDate().toString();
				let currentCourseMonth = this.state.courseDays[i].getMonth()+1 < 10 ? "0" + (this.state.courseDays[i].getMonth()+1).toString() : (this.state.courseDays[i].getMonth()+1).toString();
				let currentDateCheckBoxDate = `${this.state.courseDays[i].getFullYear()}-${currentCourseMonth}-${currentCourseDate}`;

				let attendanceCheck = this.state.attendanceList.find((attendanceElement) => {
					return attendanceElement.studentId == this.state.courseRosterList[j].id &&
					attendanceElement.classDate == currentDateCheckBoxDate &&
					attendanceElement.hasAttended == true;
				});

				let isChecked = attendanceCheck == undefined ? false : true;
				
				attendanceBodySet.push(
					<td className="rollSheetCell">
						{
							isChecked ? 
							<input type="checkbox" name="" defaultChecked value={this.state.courseRosterList[j].id}
							id={`student-${this.state.courseRosterList[j].id}-date-${currentDateCheckBoxDate}`}
							onClick={this.handleCheckboxClick}
							/> : 
							<input type="checkbox" name="" value={this.state.courseRosterList[j].id}
							id={`student-${this.state.courseRosterList[j].id}-date-${currentDateCheckBoxDate}`}
							onClick={this.handleCheckboxClick}
							/>
						}
					</td>
				)
			}
			tableBodySet.push((<tr><td className="rollSheetCell">{`${this.state.courseRosterList[j].firstName} ${this.state.courseRosterList[j].lastName}`}
								</td>{attendanceBodySet.splice(0, attendanceBodySet.length)}</tr>));
		}

		return [...tableHeaders, ...tableBodySet];
	}

	handleCheckboxClick = () = () => {

		let currentAttendanceObj = null;
		let currentSelectedDate = event.target.id.match("(\\d{4}-\\d{2}-\\d{2})")[0];

		currentAttendanceObj = this.state.attendanceList.find((attendanceElement) => {
			return attendanceElement.studentId == event.target.value &&
			attendanceElement.classDate == currentSelectedDate;
		});

		if(currentAttendanceObj != undefined && currentAttendanceObj != null){
			currentAttendanceObj.hasAttended = event.target.checked;
			let tempAttendanceList = this.state.updateRosterAttendanceList;
			let currentTempAttendanceObj = tempAttendanceList.find((element) => {
				return element.studentId == currentAttendanceObj.studentId;
			});
			if(currentTempAttendanceObj != undefined && currentTempAttendanceObj != null){
		
				const currentAttendanceIndex = tempAttendanceList.findIndex((element) => {
					return element.studentId == currentAttendanceObj.studentId;
				});

				if(currentAttendanceIndex > -1){
					tempAttendanceList.splice(currentAttendanceIndex, 1);
				}
				tempAttendanceList.push(currentAttendanceObj);
				this.setState({ updateRosterAttendanceList: tempAttendanceList })
			}
			else{
				this.setState({ updateRosterAttendanceList: [...this.state.updateRosterAttendanceList, currentAttendanceObj] })
			}
		} else {
			let tempAttendanceList = this.state.freshRosterAttendanceList;
			currentAttendanceObj = {
				studentId: event.target.value,
				courseId: this.props.courseId,
				hasAttended: event.target.checked,
				classDate: currentSelectedDate
			}
			if(tempAttendanceList.length > 0){
				const currentAttendanceIndex = tempAttendanceList.findIndex((element) => {
					return element.studentId == currentAttendanceObj.studentId;
				});
				
				if(currentAttendanceIndex > -1){
					tempAttendanceList.splice(currentAttendanceIndex, 1);
				}
				tempAttendanceList.push(currentAttendanceObj);

				this.setState({ freshRosterAttendanceList: tempAttendanceList });
			}
			else {
				currentAttendanceObj = {
					studentId: event.target.value,
					courseId: this.props.courseId,
					hasAttended: event.target.checked,
					classDate: currentSelectedDate
				}

				this.setState({freshRosterAttendanceList: [...this.state.freshRosterAttendanceList, currentAttendanceObj]});
			}
		}
	}

	submitAttendanceForm = () = async () => {
		event.preventDefault();

		const [createResponse, updateResponse] = await Promise.all([
			makeFetchPost("/attendance/multi", this.state.freshRosterAttendanceList),
			makeFetchPost("/attendance/update/multi", this.state.updateRosterAttendanceList)
		]);

		this.setState({ formSubmitted: true });



	}

	render(): JSX.Element {

		return (
			<form method="POST" onSubmit={this.submitAttendanceForm}>
				<table id="roll-sheet-table">
					<tbody>
						{ this.state.courseDays.length > 0 ? this.buildTable(1) : <React.Fragment/>}
					</tbody>
				</table>
				<input type="submit" value="Submit Attendance"/>

			</form>
		);
	}
}

// Workaround to prevent type erros on import
export default RollSheetContainer as any;