import * as React from "react";

interface Props{
	courseId: number,
	instructorList: {instructorId: string, firstName: string, lastName: string, contactId: string}[],
	toggleModalEvent:(modalContainerId: string) => void
}

const createCourseModal: React.FunctionComponent<Props> = ({courseId, instructorList, toggleModalEvent}) => {
	function modalCloseHandler():void{
		toggleModalEvent("create-courses-modal-container");
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
				<form id="create-course-form">
					<input type="text" placeholder="title"/>
					<input type="date" name="term-start" id="term-start"/>
					<input type="date" name="term-end" id="term-end"/>
					<select name="course-instructor-select-list" id="course-instructor-select-list">{renderInstructorListElement()}</select>
					<div id="day-list">
						<h4>Please Select the Days of the class</h4>
						<input type="checkbox" name="day-selection" id="sunday-selection" value="s"/> <label htmlFor="sunday-selection">Sunday</label>
						<input type="checkbox" name="day-selection" id="monday-selection" value="m"/> <label htmlFor="monday-selection">Monday</label>
						<input type="checkbox" name="day-selection" id="tuesday-selection" value="t"/> <label htmlFor="tuesday-selection">Tuesday</label>
						<input type="checkbox" name="day-selection" id="wednesday-selection" value="w"/> <label htmlFor="wednesday-selection">Wednesday</label>
						<input type="checkbox" name="day-selection" id="thursday-selection" value="th"/> <label htmlFor="thursday-selection">Thursday</label>
						<input type="checkbox" name="day-selection" id="friday-selection" value="f"/> <label htmlFor="friday-selection">Friday</label>
						<input type="checkbox" name="day-selection" id="saturday-selection" value="sa"/> <label htmlFor="saturday-selection">Saturday</label>
					</div>
					<input type="submit" value="submit"/>
				</form>
			</div>

			<span id="modal-close-button" onClick={modalCloseHandler}>&times;</span>
		</div>
	);
}

export default createCourseModal;