import * as React from 'react';
import { element } from 'prop-types';

interface Props{
	courseListing: {courseId: string, courseTitle: string, instructorId: string, termStart: Date, termEnd: Date, classDays: string}[],
	selectCoursesEvent: (checkboxValue: number) =>  void
}

const courseListCheckbox: React.SFC<Props> = ({courseListing, selectCoursesEvent}) => {

	let renderCourseListingElement = () =>{
		let courseListingElements: JSX.Element[] = [];
		courseListing.forEach((element) => {
			courseListingElements.push( <option key={`course-dropdown-listing-${element.courseId}`} value={element.courseId}>{element.courseTitle}</option>);
		});

		courseListingElements.unshift(<option key={`course-dropdown-listing-0`} value={0}>Please Select a Course to Continue</option>);

		return courseListingElements;
	}

	function handleSelectCoursesEvent(): React.ChangeEvent<HTMLSelectElement>{
		const courseId = parseInt((document.getElementById("course-listing-dropdown") as HTMLSelectElement).value);
		const currentCourseObj = courseListing.find((courseElement) => {
			return courseElement.courseId == courseId.toString();
		});
		console.log(currentCourseObj);
		localStorage.setItem("sessionCourseId", courseId.toString());
		localStorage.setItem("sessionTermStart", currentCourseObj.termStart.toString());
		localStorage.setItem("sessionTermEnd", currentCourseObj.termEnd.toString());
		selectCoursesEvent(courseId);
		return null;
	}

	return(
		<React.Fragment>
			<h3>Select Your Course</h3>
			<select 
				name="course-listing-dropdown" 
				id="course-listing-dropdown"
				onChange={handleSelectCoursesEvent}
				>{renderCourseListingElement()}</select>
		</React.Fragment>
	);
}

export default courseListCheckbox;