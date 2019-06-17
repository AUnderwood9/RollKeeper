import * as React from "react";
import { makeFetchPost } from "../../serviceTools";

interface Props{
	instructorList: {instructorId: string, firstName: string, lastName: string, contactId: string}[],
	toggleModalEvent:(modalContainerId: string) => void,
	courseListings
}

const createCourseModal: React.FunctionComponent<Props> = ({instructorList, toggleModalEvent, courseListings}) => {
	const [courseTitle, setCourseTitle] = React.useState("");
	const [termStart, setTermStart] = React.useState("");
	const [termEnd, setTermEnd] = React.useState("");
	const [termDays, setTermDays] = React.useState("");
	const [instructorId, setInstructorId] = React.useState("");
	const [courseId, setCourseId] = React.useState("");

	function modalCloseHandler():void{
		toggleModalEvent("create-courses-modal-container");
	}

	function handleCheckBox(dayCheckBox):void {
		let newDayCheckList = [];
		document.querySelectorAll('input[name="day-selection"]:checked').forEach((element) => {
			newDayCheckList.push((element as HTMLInputElement).value);
			console.log(newDayCheckList)
		})
		setTermDays(newDayCheckList.join(", "));
	}

	function handleFormSubmit(): void{
		event.preventDefault();

		const requestOjbect = {
			courseTitle, 
			termStart, 
			termEnd, 
			termDays, 
			instructorId
		}

		// makeFetchPost("/course", requestOjbect)
		// .catch((error) => {console.log(error)});
	}

	let renderInstructorListElement = () =>{
		let courseListingElements: JSX.Element[] = [];
		instructorList.forEach((element) => {
			courseListingElements.push( <option key={`instructor-dropdown-listing-${element.instructorId}`} value={element.instructorId}>{`${element.firstName} ${element.lastName}`}</option>);
		});

		courseListingElements.unshift(<option key={`instructor-dropdown-listing-0`} value={0}>Please Select an instructor to Continue</option>);

		return courseListingElements;
	}

	return (
		<div id="create-courses-modal-container">
			<div id="modal-body">
				<form id="create-course-form" onSubmit={handleFormSubmit}>
					{courseListings()}
					<input type="text" placeholder="title" value={courseTitle} onChange={(e) => {setCourseTitle(e.target.value)}} required/>
					<input type="date" name="term-start" id="term-start" onChange={(e) => {setTermStart(e.target.value)}} required/>
					<input type="date" name="term-end" id="term-end" onChange={(e) => {setTermEnd(e.target.value)}} required/>
					<select name="course-instructor-select-list" id="course-instructor-select-list" onChange={(e) => {setInstructorId(e.target.value)}} required>{renderInstructorListElement()} }</select>
					<div id="day-list">
						<h4>Please Select the Days of the class</h4>
						<input type="checkbox" name="day-selection" id="sunday-selection" value="s" onChange={(e) => {handleCheckBox(e.target)}}/> <label htmlFor="sunday-selection">Sunday</label>
						<input type="checkbox" name="day-selection" id="monday-selection" value="m" onChange={(e) => {handleCheckBox(e.target)}}/> <label htmlFor="monday-selection">Monday</label>
						<input type="checkbox" name="day-selection" id="tuesday-selection" value="t" onChange={(e) => {handleCheckBox(e.target)}}/> <label htmlFor="tuesday-selection">Tuesday</label>
						<input type="checkbox" name="day-selection" id="wednesday-selection" value="w" onChange={(e) => {handleCheckBox(e.target)}}/> <label htmlFor="wednesday-selection">Wednesday</label>
						<input type="checkbox" name="day-selection" id="thursday-selection" value="th" onChange={(e) => {handleCheckBox(e.target)}}/> <label htmlFor="thursday-selection">Thursday</label>
						<input type="checkbox" name="day-selection" id="friday-selection" value="f" onChange={(e) => {handleCheckBox(e.target)}}/> <label htmlFor="friday-selection">Friday</label>
						<input type="checkbox" name="day-selection" id="saturday-selection" value="sa" onChange={(e) => {handleCheckBox(e.target)}}/> <label htmlFor="saturday-selection">Saturday</label>
					</div>
					<input type="submit" value="submit"/>
				</form>
			</div>

			<span id="modal-close-button" onClick={modalCloseHandler}>&times;</span>
		</div>
	);
}

export default createCourseModal;