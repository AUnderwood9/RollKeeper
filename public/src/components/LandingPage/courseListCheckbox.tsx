import * as React from 'react';
import { element } from 'prop-types';

interface Props{
	courseListing: {courseId: string, courseTitle: string, instructorId: string, termStart: Date, termEnd: Date, classDays: string}[],
	selectCoursesEvent: (checkboxValue: number) =>  void,
	isViewLinkCheckbox: boolean,
	// courseSelectionEvent: () => void
	courseSelectionEvent: (checkboxValue: number) =>  void
}

const courseListCheckbox: React.SFC<Props> = ({courseListing, selectCoursesEvent, isViewLinkCheckbox, courseSelectionEvent}) => {

	let renderCourseListingElement = () =>{

		let courseListingElements: JSX.Element[] = [];
		courseListing.forEach((element) => {
			courseListingElements.push( <option key={`course-dropdown-listing-${element.courseId}`} value={element.courseId}>{element.courseTitle}</option>);
		});

		courseListingElements.unshift(<option key={`course-dropdown-listing-0`} value={0}>Please Select a Course to Continue</option>);

		return courseListingElements;
	}

	function handleSelectCoursesEvent(): React.ChangeEvent<HTMLSelectElement>{
		const courseId = parseInt(event.target.value);
		const currentCourseObj = courseListing.find((courseElement) => {
			return courseElement.courseId == courseId.toString();
		});

		// Check if a course was actually selected
		if(courseId == 0 && isViewLinkCheckbox){
			selectCoursesEvent(courseId);
		}
		else if(isViewLinkCheckbox){
			localStorage.setItem("sessionCourseId", courseId.toString());
			localStorage.setItem("sessionTermStart", currentCourseObj.termStart.toString());
			localStorage.setItem("sessionTermEnd", currentCourseObj.termEnd.toString());

			// Update the parent component's courseId
			selectCoursesEvent(courseId);
		} 
		else{
			courseSelectionEvent(courseId);
		}
		
		return null;
	}

	return(
		<React.Fragment>
			<select 
				name="course-listing-dropdown" 
				required={isViewLinkCheckbox ? false : true}
				id={`${isViewLinkCheckbox ? 'view-links-' : 'create-person-'}course-listing-dropdown`}
				onChange={handleSelectCoursesEvent}
				>{renderCourseListingElement()}</select>
		</React.Fragment>
	);
}

export default courseListCheckbox;