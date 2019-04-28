import * as React from 'react';
import DayInput from "./dayInput";
import AttendanceModalContainer from "./AttendanceModalContainer";
import { StaticContext, RouteComponentProps, match } from 'react-router';

import { makeFetchPost } from "../serviceTools";

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
}

class MonthContainer extends React.Component<Props, State>{
	constructor(props: Props){
		super(props);

		console.log(props.routeMatch.params);
		
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
			attendanceList: []
		}

		console.log(this.state);
	}

	
	async componentDidMount(){
		const endpoint = `http://localhost/rollKeeper/api/attendance/courseMonth/${this.props.courseId}/${this.state.currentMonthYear}-${this.state.currentMonth < 10 ? "0" + this.state.currentMonth : this.state.currentMonth}`;
		// console.log(endpoint);
		let response = await fetch(endpoint);
		let responseObj = await response.json();

		console.log(responseObj);
		console.log(responseObj.filter(function (element) {
			return element.classDate == "2019-02-12";
		  }))
	}

	toggleModal(): void{
		// console.log(event.target);
		let attendanceModal = document.getElementById("attendance-modal-containner");
		let resultObject: {} = {  };

		if( attendanceModal.style.display == "none" || attendanceModal.style.display === "" || attendanceModal.style.display == null){
			attendanceModal.style.display = "flex";
			resultObject = { target: event.target }
		} else if( attendanceModal.style.display == "flex" ){
			attendanceModal.style.display = "none";
		} else{
			attendanceModal.style.display = "none";
		}

		return ;
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
			clickEvent={this.toggleModal}
			/>
			firstDayIndex++;
		}

		let endingDate = this.state.numOfDays;

		while(lastDayIndex >= 0){
			lastWeekArray[lastDayIndex] = <DayInput key={`dayInputKey-${this.state.currentMonth}-${endingDate}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
			currentYear={this.state.currentMonthYear}
			currentDate={endingDate--}
			clickEvent={this.toggleModal}
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
		console.log("Ending date: " + endingDate);
		let dayElementList: JSX.Element[] = [daysOfWeekElement, firstWeek];
		for(let x = startingDate; x < endingDate - 1; x++){
			dayElementList.push(
							<section>
									<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
									currentYear={this.state.currentMonthYear}
									currentDate={startingDate}
									clickEvent={this.toggleModal}
									/>
									<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
									currentYear={this.state.currentMonthYear}
									currentDate={startingDate}
									clickEvent={this.toggleModal}
									/>
									<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
									currentYear={this.state.currentMonthYear}
									currentDate={startingDate}
									clickEvent={this.toggleModal}
									/>
									<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
									currentYear={this.state.currentMonthYear}
									currentDate={startingDate}
									clickEvent={this.toggleModal}
									/>
									<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
									currentYear={this.state.currentMonthYear}
									currentDate={startingDate}
									clickEvent={this.toggleModal}
									/>
									<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
									currentYear={this.state.currentMonthYear}
									currentDate={startingDate}
									clickEvent={this.toggleModal}
									/>
									<DayInput key={`dayInputKey-${this.state.currentMonth}-${startingDate++}-${this.state.currentMonthYear}`} currentMonth={this.state.currentMonth}
									currentYear={this.state.currentMonthYear}
									currentDate={startingDate}
									clickEvent={this.toggleModal}
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
					clickEvent={this.toggleModal}
				/>
				{this.buildDayElements()}
			</div>
		);
	}
}

// Workaround to prevent type erros on import
export default MonthContainer as any;