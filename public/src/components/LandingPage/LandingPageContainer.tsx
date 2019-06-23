import * as React from 'react';
import { Link } from "react-router-dom"
import CourseListCheckbox from "./courseListCheckbox";
import CreateCourseModal from "./createCourseModal";
import CreatePersonModal from "./createPersonModal";
import { toggleModal } from "../../modalAction";
require('isomorphic-fetch');

interface Props{
	featuresEnabled: []
}

interface State {
	courseListing: {courseId: string, courseTitle: string, instructorId: string, termStart: Date, termEnd: Date, classDays: string}[],
	courseSelected: boolean,
	instructorList: {instructorId: string, firstName: string, lastName: string, contactId: string}[],
	attendanceViewPathName: string
}

class LandingPageContainer extends React.Component<Props, State>{
	constructor(props: Props){
		super(props);

		this.state = {
			courseListing: [],
			courseSelected: false,
			instructorList: [],
			attendanceViewPathName: "rollsheet"
		};

		this.selectCourse.bind(this);
	}

	selectCourse = (checkboxValue: number) => {
		// console.log("Selected a value " + checkboxValue);
		if(checkboxValue > 0){

			this.setState({
				courseListing: this.state.courseListing,
				courseSelected: true
			});
		}
		else{
			this.setState({
				courseListing: this.state.courseListing,
				courseSelected: false
			});
		}
	}

	async componentDidMount(){
		const [courseListResponse, instructorListResponses] = await Promise.all([
			fetch("http://localhost/rollKeeper/api/courses"),
			fetch("http://localhost/rollKeeper/api/person/all/instructor")
		]);

		const [courseListObject, instructorListObject] = await Promise.all([
			courseListResponse.json(), instructorListResponses.json()
		]);

		let attendanceViewPathName;

		if(this.props.featuresEnabled.length > 0){
			// check features here
			attendanceViewPathName = "rollsheet";
		} else{
			attendanceViewPathName = "rollsheet";
		}

		this.setState({
			courseListing: courseListObject,
			instructorList: instructorListObject,
			attendanceViewPathName: attendanceViewPathName
		});
	}

	renderCourseListCheckboxElement = (isLandingPage = true, listingEvent = null) =>{

		return (this.state.courseListing && this.state.courseListing.length > 0) ? <CourseListCheckbox 
												courseListing={this.state.courseListing} 
												selectCoursesEvent={listingEvent != null ? listingEvent : this.selectCourse} 
												isViewLinkCheckbox={isLandingPage} 
												courseSelectionEvent={listingEvent != null ? listingEvent : null} /> : '';
	}

	render(){
		return (
			<div id="landingPageContainer">
				<h1>Welcome</h1>
				<button 
					className="landingPageModalButton"
					onClick={toggleModal.bind(this, "create-courses-modal-container")}
				>Add Courses</button>

				{this.renderCourseListCheckboxElement()}

				<button 
					className="landingPageModalButton"
					onClick={toggleModal.bind(this, "create-person-modal-container")}
				>Add Student/Instrctor</button>
				
				{
					this.state.courseSelected ? <div className="buttonLinkGroup">
													<Link to={{
														pathname: `/${this.state.attendanceViewPathName}`
													}}>Go to Attendance</Link>
												</div> : <React.Fragment></React.Fragment>
				}
				
				<CreateCourseModal instructorList={this.state.instructorList} toggleModalEvent={toggleModal}/>
				<CreatePersonModal toggleModalEvent={toggleModal} courseListings={this.renderCourseListCheckboxElement}/>
			</div>
		)
	}

}

export default LandingPageContainer;