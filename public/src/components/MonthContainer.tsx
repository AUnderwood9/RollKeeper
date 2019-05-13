import * as React from 'react';
import DayInput from "./dayInput";
import AttendanceModalContainer from "./AttendanceModalContainer";
import { StaticContext, RouteComponentProps, match } from 'react-router';

import { makeFetchPost } from "../serviceTools";
import { toggleModal } from "../modalAction";

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
}

class MonthContainer extends React.Component<Props, State>{
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
			selectedAttendanceList: []
		}

		// this.updateCalendar.bind(this);
		// console.log(this.state);
	}

	
	async componentDidMount(){
		const attendanceEndpoint = `http://localhost/rollKeeper/api/attendance/courseMonth/${this.props.courseId}/${this.state.currentMonthYear}-${this.state.currentMonth < 10 ? "0" + this.state.currentMonth : this.state.currentMonth}`;
		const rosterEndpoint = `http://localhost/rollKeeper/api/person/student/course/${this.props.courseId}`;
		// console.log(attendanceEndpoint);
		// console.log(rosterEndpoint);

		const [attendanceResponse, rosterResponse] = await Promise.all([
			fetch(attendanceEndpoint),
			fetch(rosterEndpoint)
		]);

		const [attendanceResponseObj, rosterResponseObj] = await Promise.all([
			attendanceResponse.json(), 
			rosterResponse.json()
		])

		// console.log("Attendance: ");
		// console.log(attendanceResponseObj);

		this.setState({ attendanceList: attendanceResponseObj, courseRosterList: rosterResponseObj });

		// console.log(responseObj.filter(function (element) {
		// 	return element.classDate == "2019-02-12";
		//   }))
	}

	modalHandler = (this.state) = () => {
		// console.log("Event Type: " + event.target.tagName);
		if(event.target.tagName === "INPUT"){
			const selectedDate = new Date(event.target.name.replace("day-input-", ""));
			const newDateFormat = `${selectedDate.getFullYear()}-${selectedDate.getMonth()+1 > 10 ? selectedDate.getMonth()+1 : `0${selectedDate.getMonth()+1}`}-${selectedDate.getDate() > 10 ? selectedDate.getDate() : `0${selectedDate.getDate()}`}`; 
			// console.log("INPUT");
			// console.log("input Date: " + newDateFormat);
			// console.log(this.state.attendanceList[0].classDate);
			// console.log(this.state.attendanceList.filter(function (element) {
			// 	// return element.classDate == "2019-02-12";
			// 	return element.classDate == newDateFormat;
			//   }))
			const selectedAttendanceList = this.state.attendanceList.filter(function (element) {
				// return element.classDate == "2019-02-12";
				return element.classDate == newDateFormat;
			  });

			  toggleModal("attendance-modal-containner");
			  this.setState({ selectedDate: newDateFormat, 
				selectedAttendanceList  });
		}
		else {
			toggleModal("attendance-modal-containner");
		}
	}

	updateCalendar = (this.state) = async () => {
		console.log(this.state);
		const attendanceEndpoint = `http://localhost/rollKeeper/api/attendance/courseMonth/${this.props.courseId}/${this.state.currentMonthYear}-${this.state.currentMonth < 10 ? "0" + this.state.currentMonth : this.state.currentMonth}`;
		// console.log(attendanceEndpoint);
		// console.log(rosterEndpoint);

		const attendanceResponse = await fetch(attendanceEndpoint);

		const attendanceResponseObj = await attendanceResponse.json()

		// console.log("Attendance: ");
		// console.log(attendanceResponseObj);

		this.setState({ attendanceList: attendanceResponseObj });
	}

	buildWeekPadding(): { firstWeek: JSX.Element, lastWeek: JSX.Element, startingDate: number ,endingDate: number } {
		let firstWeekArray: JSX.Element[] = [
			<input className="inputCell paddingDay" type="text" name="padding-day-1" disabled/>,
			<input className="inputCell paddingDay" type="text" name="padding-day-2" disabled/>,
			<input className="inputCell paddingDay" type="text" name="padding-day-3" disabled/>,
			<input className="inputCell paddingDay" type="text" name="padding-day-4" disabled/>,
			<input className="inputCell paddingDay" type="text" name="padding-day-5" disabled/>,
			<input className="inputCell paddingDay" type="text" name="padding-day-6" disabled/>,
			<input className="inputCell paddingDay" type="text" name="padding-day-7" disabled/>
		];

		let lastWeekArray: JSX.Element[] = [
			<input className="inputCell paddingDay" type="text" name="padding-day-8" disabled/>,
			<input className="inputCell paddingDay" type="text" name="padding-day-9" disabled/>,
			<input className="inputCell paddingDay" type="text" name="padding-day-10" disabled/>,
			<input className="inputCell paddingDay" type="text" name="padding-day-11" disabled/>,
			<input className="inputCell paddingDay" type="text" name="padding-day-12" disabled/>,
			<input className="inputCell paddingDay" type="text" name="padding-day-13" disabled/>,
			<input className="inputCell paddingDay" type="text" name="padding-day-14" disabled/>
		];

		let firstDayIndex = new Date(`${this.state.currentMonth}-1-${this.state.currentMonthYear}`).getDay();
		let lastDayIndex = new Date(`${this.state.currentMonth}-${this.state.numOfDays}-${this.state.currentMonthYear}`).getDay();
		// console.log(`The first day is ${firstDayIndex}, Date: ${this.state.currentMonth}-1-${this.state.currentMonthYear}
		// 	the last day is: ${lastDayIndex}, Date: ${this.state.currentMonth}-${this.state.numOfDays}-${this.state.currentMonthYear}
		// `)

		// While we still have some days left on the first week, replace any padding days with actual days
		let startingDate = 0;
		while(firstDayIndex < firstWeekArray.length){
			firstWeekArray[firstDayIndex] = <DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
			currentYear={this.state.currentMonthYear}
			currentDate={startingDate}
			clickEvent={this.modalHandler}
			/>
			firstDayIndex++;
		}

		let endingDate = this.state.numOfDays;

		while(lastDayIndex >= 0){
			lastWeekArray[lastDayIndex] = <DayInput key={`dayInputKey-${this.state.currentMonth}-${endingDate}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
			currentYear={this.state.currentMonthYear}
			currentDate={endingDate--}
			clickEvent={this.modalHandler}
			/>
			lastDayIndex--;
		}

		// console.log(firstWeekArray);

		let firstWeek: JSX.Element = (
			<section className="firstWeekRow">
				{[...firstWeekArray]}
			</section>
		);

		let lastWeek: JSX.Element = (
			<section className="lastWeekRow">
				{[...lastWeekArray]}
			</section>
		);

		return {firstWeek, lastWeek, startingDate, endingDate};
	}

	buildDayElements(): JSX.Element[] {
		const daysOfWeekElement: JSX.Element = (
							<section className="daysOfWeekRow">
								<input className="dayOfMonthCell inputCell" placeholder="Sunday" disabled/> 
								<input className="dayOfMonthCell inputCell" placeholder="Monday" disabled/>
								<input className="dayOfMonthCell inputCell" placeholder="Tuesday" disabled/>
								<input className="dayOfMonthCell inputCell" placeholder="Wednsday" disabled/>
								<input className="dayOfMonthCell inputCell" placeholder="Thursday" disabled/>
								<input className="dayOfMonthCell inputCell" placeholder="Friday" disabled/>
								<input className="dayOfMonthCell inputCell" placeholder="Saturday" disabled/>
							</section>)
	
		let {firstWeek, lastWeek, startingDate, endingDate}: { firstWeek: JSX.Element, lastWeek: JSX.Element, startingDate: number ,endingDate: number } = this.buildWeekPadding();
		
		let dayElementList: JSX.Element[] = [daysOfWeekElement, firstWeek];
		for(let x = startingDate; x < endingDate - 1; x++){
			dayElementList.push(
							<section>
									<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
									currentYear={this.state.currentMonthYear}
									currentDate={startingDate}
									clickEvent={this.modalHandler}
									/>
									<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
									currentYear={this.state.currentMonthYear}
									currentDate={startingDate}
									clickEvent={this.modalHandler}
									/>
									<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
									currentYear={this.state.currentMonthYear}
									currentDate={startingDate}
									clickEvent={this.modalHandler}
									/>
									<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
									currentYear={this.state.currentMonthYear}
									currentDate={startingDate}
									clickEvent={this.modalHandler}
									/>
									<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
									currentYear={this.state.currentMonthYear}
									currentDate={startingDate}
									clickEvent={this.modalHandler}
									/>
									<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
									currentYear={this.state.currentMonthYear}
									currentDate={startingDate}
									clickEvent={this.modalHandler}
									/>
									<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
									currentYear={this.state.currentMonthYear}
									currentDate={startingDate}
									clickEvent={this.modalHandler}
									/>
								</section>
			
			)

			x = startingDate;
		}

		dayElementList.push(lastWeek);

		return dayElementList;
	}

	render(): JSX.Element {
		// return <div>{this.state.count}</div>;

		return (
			<div>
				<AttendanceModalContainer
					selectedDate={this.state.selectedDate}
					clickEvent={this.modalHandler}
					attendanceList={this.state.selectedAttendanceList}
					rosterList={this.state.courseRosterList}
					currentCourseId={this.props.courseId}
					updateCalendar={this.updateCalendar}
				/>
				{this.buildDayElements()}
			</div>
		);
	}
}

// Workaround to prevent type erros on import
export default MonthContainer as any;