import * as React from 'react';
// import DayInput from "./dayInput";
// import AttendanceModalContainer from "./AttendanceModalContainer";
import { StaticContext, RouteComponentProps, match } from 'react-router';
import { makeFetchPost } from '../../serviceTools';

// import { makeFetchPost } from "../serviceTools";
// import { toggleModal } from "../modalAction";

// interface Props {}
// interface DayInputProps {
// 	currentMonth: number;
// 	currentYear: number;
// 	currentDate: number;
// }

interface myParms{
	month: string;
	year: string;
}

interface Props{
	currentMonth: number;
	currentYear: number;
	currentDate: number;
	courseId: number;
	routeMatch: match<myParms>;
}

interface State {
	currentMonth: number;
	currentMonthYear: number;
	numOfDays: number;
	attendanceList: {}[];
	selectedAttendanceList: {}[];
	courseRosterList: {}[];
	courseDays: Date[];
	freshRosterAttendanceList: {}[];
	updateRosterAttendanceList: {}[];
	formSubmitted: boolean
}

class RollSheetContainer extends React.Component<Props, State>{
	constructor(props: Props){
		super(props);
		
		const initialDate: Date = new Date(`${props.routeMatch.params.month}-${props.routeMatch.params.year}`);
		// const monthToSet: number = props.hasOwnProperty('currentMonth') ? props.routeMatch.params.month : parseInt(new Date().toLocaleDateString('en-US', {month: "2-digit"}));
		// const yearToSet: number = props.hasOwnProperty('currentYear') ? props.routeMatch.params.year : parseInt(new Date().toLocaleDateString('en-US', {year: "numeric"}));
		const monthToSet: number = parseInt(initialDate.toLocaleDateString('en-US', {month: "2-digit"}));
		const yearToSet: number = parseInt(initialDate.toLocaleDateString('en-US', {year: "numeric"}));
		const numOfDaysToSet: number = new Date(yearToSet, monthToSet, 0).getDate(); 
		
		this.state = {
			currentMonth: monthToSet,
			currentMonthYear: yearToSet,
			numOfDays: numOfDaysToSet,
			formSubmitted: false,
			attendanceList: [],
			courseRosterList: [],
			selectedAttendanceList: [],
			courseDays: [],
			freshRosterAttendanceList: [],
			updateRosterAttendanceList: []
		}

		// this.updateCalendar.bind(this);
		// console.log(this.state);
	}

	
	async componentDidMount(){
		console.log("Mounting");
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

		// console.log(courseTermResponseObj);
		console.log(attendanceResponseObj);

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

		// console.log(tempDateArray);

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
		// let attendanceBodySet: JSX.Element[] = [];
		let tableBodySet: JSX.Element[] = [];
		// let tableBodySet: JSX.Element;

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
			// console.log(this.state.courseDays[i]);
			headerDateSet.push(<th className="rollSheetCell">{this.state.courseDays[i].toLocaleDateString("en-US", {year:"numeric", month: "2-digit", day: "2-digit"})}</th>)
		}

		tableHeaders.push(<tr>{headerIndexSet}</tr>);
		tableHeaders.push(<tr>{headerDaySet}</tr>);
		tableHeaders.push(<tr>{headerDateSet}</tr>); 

		// console.log(this.state.attendanceList);
		// console.log(this.state.courseRosterList);
		// let attendanceSetTemp: JSX.Element[] = [];
		let attendanceBodySet: JSX.Element[] = [];
		for(let j = 0; j < this.state.courseRosterList.length; j++){
			// console.log(this.state.courseRosterList[j]);
			for(let i = 0; i < this.state.courseDays.length; i++){
				let currentCourseDate = this.state.courseDays[i].getDate() < 10 ? "0" + this.state.courseDays[i].getDate().toString() : this.state.courseDays[i].getDate().toString();
				let currentCourseMonth = this.state.courseDays[i].getMonth()+1 < 10 ? "0" + (this.state.courseDays[i].getMonth()+1).toString() : (this.state.courseDays[i].getMonth()+1).toString();
				// let currentCourseMonth = this.state.courseDays[i].getMonth()+1;
				let currentDateCheckBoxDate = `${this.state.courseDays[i].getFullYear()}-${currentCourseMonth}-${currentCourseDate}`;
				// let currentDateCheckBoxDate = this.state.courseDays[i].toISOString().substr(0, 10);

				let attendanceCheck = this.state.attendanceList.find((attendanceElement) => {
					return attendanceElement.studentId == this.state.courseRosterList[j].id &&
					attendanceElement.classDate == currentDateCheckBoxDate &&
					attendanceElement.hasAttended == true;
					// return attendanceElement.studentId == this.state.courseRosterList[j].id;
				});

				// console.log(currentDateCheckBoxDate);

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
						{/* <input type="checkbox" name="" value={this.state.courseRosterList[j].id}
							id={`student-${this.state.courseRosterList[j].id}-date-${currentDateCheckBoxDate}`}
							onClick={this.handleCheckboxClick}
							/> */}
					</td>
				)
			}
			tableBodySet.push((<tr><td className="rollSheetCell">{`${this.state.courseRosterList[j].firstName} ${this.state.courseRosterList[j].lastName}`}
								</td>{attendanceBodySet.splice(0, attendanceBodySet.length)}</tr>));
			// attendanceSetTemp
		}

		// tableBodySet = (<tr>{attendanceBodySet}</tr>)

		return [...tableHeaders, ...tableBodySet];
	}

	handleCheckboxClick = (this.state) = () => {

		let currentAttendanceObj = null;
		let currentSelectedDate = event.target.id.match("(\\d{4}-\\d{2}-\\d{2})")[0];

		currentAttendanceObj = this.state.attendanceList.find((attendanceElement) => {
			// console.log(`ID: ${event.target.value} elementID:  ${attendanceElement.studentId} date: ${currentSelectedDate} elementDate: ${attendanceElement.courseDate}`)
			return attendanceElement.studentId == event.target.value &&
			attendanceElement.classDate == currentSelectedDate;
		});

		// console.log(event.target.id);
		// console.log(event.target.value);
		// console.log(currentSelectedDate);
		// console.log(event.target.id.match("(\\d{4}-\\d{2}-\\d{2})")[0]);
		// console.log(currentAttendanceObj);
		// console.log(this.state.attendanceList);
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
				// setUpdateRosterAttendanceList([...tempAttendanceList]);
				this.setState({ updateRosterAttendanceList: tempAttendanceList })
			}
			else{
				this.setState({ updateRosterAttendanceList: [...this.state.updateRosterAttendanceList, currentAttendanceObj] })
				// setUpdateRosterAttendanceList([...updateRosterAttendanceList, currentAttendanceObj]);
			}
		} else {
			console.log("New");
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
				// setFreshRosterAttendanceList([...tempAttendanceList]);
				this.setState({ freshRosterAttendanceList: tempAttendanceList });
			}
			else {
				currentAttendanceObj = {
					studentId: event.target.value,
					courseId: this.props.courseId,
					hasAttended: event.target.checked,
					classDate: currentSelectedDate
				}

				// setFreshRosterAttendanceList([...freshRosterAttendanceList, currentAttendanceObj]);
				this.setState({freshRosterAttendanceList: [...this.state.freshRosterAttendanceList, currentAttendanceObj]});
			}
		}
	}

	submitAttendanceForm = (this.state) = async () => {
		event.preventDefault();
		// console.log(event);
		// console.log("New Roster")
		// console.log(this.state.freshRosterAttendanceList)
		// console.log("Old Roster")
		// console.log(this.state.updateRosterAttendanceList)

		const [createResponse, updateResponse] = await Promise.all([
			makeFetchPost("/attendance/multi", this.state.freshRosterAttendanceList),
			makeFetchPost("/attendance/update/multi", this.state.updateRosterAttendanceList)
		]);

		this.setState({ formSubmitted: true });

		// console.log("Parsing");

		// console.log("Creation");
		// console.log(createResponse);

		// console.log("Update");
		// console.log(updateResponse);
	}

	render(): JSX.Element {
		// return <div>{this.state.count}</div>;
		console.log("Rendering");
		console.log(this.state.freshRosterAttendanceList);
		console.log(this.state.updateRosterAttendanceList);

		return (
			<form method="POST" onSubmit={this.submitAttendanceForm}>
				<table id="roll-sheet-table">
					<tbody>
						{/* {console.log(this.state.courseDays)} */}
						{ this.state.courseDays.length > 0 ? this.buildTable(1) : <React.Fragment/>}
					</tbody>
				</table>
				<input type="submit" value="Submit Attendance"/>
				{/* {this.buildDayElements()} */}
			</form>
		);
	}
}

// Workaround to prevent type erros on import
export default RollSheetContainer as any;