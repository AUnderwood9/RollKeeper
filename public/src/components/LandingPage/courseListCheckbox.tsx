import * as React from 'react';
import { element } from 'prop-types';

interface Props{
	courseListing: {
			courseId	: string, 
			courseTitle	: string, 
			instructorId: string, 
			termStart	: Date, 
			termEnd		: Date, 
			classDays	: string
		}[],
	selectCoursesEvent	: (checkboxValue: number) =>  void,
	isViewCheckbox		: boolean,
	courseSeletionEvent	: (String) => void
}

const courseListCheckbox: React.SFC<Props> = ({courseListing, selectCoursesEvent, isViewCheckbox, courseSeletionEvent}) => {

	let renderCourseListingElement = () =>{

		let courseListingElements: JSX.Element[] = [];
		courseListing.forEach((element) => {
			courseListingElements.push( 
				<option 
						key		= {`course-dropdown-listing-${element.courseId}`} 
						value	= {element.courseId}
					>{element.courseTitle}</option>);
		});

		courseListingElements.unshift(
				<option 
					key		= {`course-dropdown-listing-0`} 
					value	= {0}>Please Select a Course to Continue
				</option>
			);

		return courseListingElements;
	}

	function handleSelectCoursesEvent(): React.ChangeEvent<HTMLSelectElement>{
		const courseId 			= parseInt((document.getElementById("course-listing-dropdown") as HTMLSelectElement).value);
		const currentCourseObj 	= courseListing.find((courseElement) => {
			return courseElement.courseId == courseId.toString();
		});
		console.log("checkboxId" + courseId);

		// Check if a course was actually selected and if we are using the checkbox to choose 
		// the class for the rollsheet.
		if(courseId == 0 && isViewCheckbox){
			selectCoursesEvent(courseId);
		}
		else if(isViewCheckbox){
			localStorage.setItem("sessionCourseId"		, courseId.toString());
			localStorage.setItem("sessionTermStart"		, currentCourseObj.termStart.toString());
			localStorage.setItem("sessionTermEnd"		, currentCourseObj.termEnd.toString());
			localStorage.setItem("sessionCourseTitle"	, currentCourseObj.courseTitle.toString())
			// Update the parent component's courseId
			selectCoursesEvent(courseId);
			console.log(localStorage.getItem("sessionCourseId"));
		} 
		else{
			courseSeletionEvent(courseId);
		}
		
		return null;
	}

	return(
		<React.Fragment>
			<select 
				name		= "course-listing-dropdown" 
				id			= "course-listing-dropdown"
				onChange	= {handleSelectCoursesEvent}
				>{renderCourseListingElement()}</select>
		</React.Fragment>
	);
}

export default courseListCheckbox;