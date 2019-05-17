import * as React from 'react';
// import DayInput from "./dayInput";
// import AttendanceModalContainer from "./AttendanceModalContainer";
import { StaticContext, RouteComponentProps, match } from 'react-router';

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
	selectedDate: string;
	attendanceList: {}[];
	selectedAttendanceList: {}[];
	courseRosterList: {}[];
	courseDays: Date[];
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
			selectedDate: "",
			attendanceList: [],
			courseRosterList: [],
			selectedAttendanceList: [],
			courseDays: []
		}

		// this.updateCalendar.bind(this);
		// console.log(this.state);
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

		console.log(courseTermResponseObj);

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
					attendanceElement.classDate == currentDateCheckBoxDate;
					// return attendanceElement.studentId == this.state.courseRosterList[j].id;
				});

				// console.log(currentDateCheckBoxDate);

				let isChecked = attendanceCheck == undefined ? false : true;
				
				attendanceBodySet.push(
					<td className="rollSheetCell">
						<input type="checkbox" name="" checked={isChecked}
							id={`student-${this.state.courseRosterList[j].id}-date-${currentDateCheckBoxDate}`}/>
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

	// modalHandler = (this.state) = () => {
	// 	if(event.target.tagName === "INPUT"){
	// 		const selectedDate = new Date(event.target.name.replace("day-input-", ""));
	// 		const newDateFormat = `${selectedDate.getFullYear()}-${selectedDate.getMonth()+1 > 10 ? selectedDate.getMonth()+1 : `0${selectedDate.getMonth()+1}`}-${selectedDate.getDate() > 10 ? selectedDate.getDate() : `0${selectedDate.getDate()}`}`; 
	// 		const selectedAttendanceList = this.state.attendanceList.filter(function (element) {
	// 			return element.classDate == newDateFormat;
	// 		  });

	// 		  toggleModal("attendance-modal-containner");
	// 		  this.setState({ selectedDate: newDateFormat, 
	// 			selectedAttendanceList  });
	// 	}
	// 	else {
	// 		toggleModal("attendance-modal-containner");
	// 	}
	// }

	// updateCalendar = (this.state) = async () => {
	// 	console.log(this.state);
	// 	const attendanceEndpoint = `http://localhost/rollKeeper/api/attendance/courseMonth/${this.props.courseId}/${this.state.currentMonthYear}-${this.state.currentMonth < 10 ? "0" + this.state.currentMonth : this.state.currentMonth}`;

	// 	const attendanceResponse = await fetch(attendanceEndpoint);

	// 	const attendanceResponseObj = await attendanceResponse.json()

	// 	this.setState({ attendanceList: attendanceResponseObj });
	// }

	// buildWeekPadding(): { firstWeek: JSX.Element, lastWeek: JSX.Element, startingDate: number ,endingDate: number } {
	// 	let firstWeekArray: JSX.Element[] = [
	// 		<input className="inputCell paddingDay" type="text" name="padding-day-1" disabled/>,
	// 		<input className="inputCell paddingDay" type="text" name="padding-day-2" disabled/>,
	// 		<input className="inputCell paddingDay" type="text" name="padding-day-3" disabled/>,
	// 		<input className="inputCell paddingDay" type="text" name="padding-day-4" disabled/>,
	// 		<input className="inputCell paddingDay" type="text" name="padding-day-5" disabled/>,
	// 		<input className="inputCell paddingDay" type="text" name="padding-day-6" disabled/>,
	// 		<input className="inputCell paddingDay" type="text" name="padding-day-7" disabled/>
	// 	];

	// 	let lastWeekArray: JSX.Element[] = [
	// 		<input className="inputCell paddingDay" type="text" name="padding-day-8" disabled/>,
	// 		<input className="inputCell paddingDay" type="text" name="padding-day-9" disabled/>,
	// 		<input className="inputCell paddingDay" type="text" name="padding-day-10" disabled/>,
	// 		<input className="inputCell paddingDay" type="text" name="padding-day-11" disabled/>,
	// 		<input className="inputCell paddingDay" type="text" name="padding-day-12" disabled/>,
	// 		<input className="inputCell paddingDay" type="text" name="padding-day-13" disabled/>,
	// 		<input className="inputCell paddingDay" type="text" name="padding-day-14" disabled/>
	// 	];

	// 	let firstDayIndex = new Date(`${this.state.currentMonth}-1-${this.state.currentMonthYear}`).getDay();
	// 	let lastDayIndex = new Date(`${this.state.currentMonth}-${this.state.numOfDays}-${this.state.currentMonthYear}`).getDay();
	// 	// console.log(`The first day is ${firstDayIndex}, Date: ${this.state.currentMonth}-1-${this.state.currentMonthYear}
	// 	// 	the last day is: ${lastDayIndex}, Date: ${this.state.currentMonth}-${this.state.numOfDays}-${this.state.currentMonthYear}
	// 	// `)

	// 	// While we still have some days left on the first week, replace any padding days with actual days
	// 	let startingDate = 0;
	// 	while(firstDayIndex < firstWeekArray.length){
	// 		firstWeekArray[firstDayIndex] = <DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
	// 		currentYear={this.state.currentMonthYear}
	// 		currentDate={startingDate}
	// 		clickEvent={this.modalHandler}
	// 		/>
	// 		firstDayIndex++;
	// 	}

	// 	let endingDate = this.state.numOfDays;

	// 	while(lastDayIndex >= 0){
	// 		lastWeekArray[lastDayIndex] = <DayInput key={`dayInputKey-${this.state.currentMonth}-${endingDate}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
	// 		currentYear={this.state.currentMonthYear}
	// 		currentDate={endingDate--}
	// 		clickEvent={this.modalHandler}
	// 		/>
	// 		lastDayIndex--;
	// 	}

	// 	// console.log(firstWeekArray);

	// 	let firstWeek: JSX.Element = (
	// 		<section className="firstWeekRow">
	// 			{[...firstWeekArray]}
	// 		</section>
	// 	);

	// 	let lastWeek: JSX.Element = (
	// 		<section className="lastWeekRow">
	// 			{[...lastWeekArray]}
	// 		</section>
	// 	);

	// 	return {firstWeek, lastWeek, startingDate, endingDate};
	// }

	// buildDayElements(): JSX.Element[] {
	// 	const daysOfWeekElement: JSX.Element = (
	// 						<section className="daysOfWeekRow">
	// 							<input className="dayOfMonthCell inputCell" placeholder="Sunday" disabled/> 
	// 							<input className="dayOfMonthCell inputCell" placeholder="Monday" disabled/>
	// 							<input className="dayOfMonthCell inputCell" placeholder="Tuesday" disabled/>
	// 							<input className="dayOfMonthCell inputCell" placeholder="Wednsday" disabled/>
	// 							<input className="dayOfMonthCell inputCell" placeholder="Thursday" disabled/>
	// 							<input className="dayOfMonthCell inputCell" placeholder="Friday" disabled/>
	// 							<input className="dayOfMonthCell inputCell" placeholder="Saturday" disabled/>
	// 						</section>)
	
	// 	let {firstWeek, lastWeek, startingDate, endingDate}: { firstWeek: JSX.Element, lastWeek: JSX.Element, startingDate: number ,endingDate: number } = this.buildWeekPadding();
		
	// 	let dayElementList: JSX.Element[] = [daysOfWeekElement, firstWeek];
	// 	for(let x = startingDate; x < endingDate - 1; x++){
	// 		dayElementList.push(
	// 						<section>
	// 								<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
	// 								currentYear={this.state.currentMonthYear}
	// 								currentDate={startingDate}
	// 								clickEvent={this.modalHandler}
	// 								/>
	// 								<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
	// 								currentYear={this.state.currentMonthYear}
	// 								currentDate={startingDate}
	// 								clickEvent={this.modalHandler}
	// 								/>
	// 								<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
	// 								currentYear={this.state.currentMonthYear}
	// 								currentDate={startingDate}
	// 								clickEvent={this.modalHandler}
	// 								/>
	// 								<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
	// 								currentYear={this.state.currentMonthYear}
	// 								currentDate={startingDate}
	// 								clickEvent={this.modalHandler}
	// 								/>
	// 								<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
	// 								currentYear={this.state.currentMonthYear}
	// 								currentDate={startingDate}
	// 								clickEvent={this.modalHandler}
	// 								/>
	// 								<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
	// 								currentYear={this.state.currentMonthYear}
	// 								currentDate={startingDate}
	// 								clickEvent={this.modalHandler}
	// 								/>
	// 								<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
	// 								currentYear={this.state.currentMonthYear}
	// 								currentDate={startingDate}
	// 								clickEvent={this.modalHandler}
	// 								/>
	// 							</section>
			
	// 		)

	// 		x = startingDate;
	// 	}

	// 	dayElementList.push(lastWeek);

	// 	return dayElementList;
	// }

	render(): JSX.Element {
		// return <div>{this.state.count}</div>;

		return (
			<div>
				<table id="roll-sheet-table">
					<tbody>
						{/* {console.log(this.state.courseDays)} */}
						{ this.state.courseDays.length > 0 ? this.buildTable(1) : <React.Fragment/>}
					</tbody>
				</table>
				{/* {this.buildDayElements()} */}
			</div>
		);
	}
}

// Workaround to prevent type erros on import
export default RollSheetContainer as any;