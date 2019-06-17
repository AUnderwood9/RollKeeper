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
			courseSelectedcourseSelected: false,
			instructorList: [],
			attendanceViewPathName: "rollsheet"
		};

		this.selectCourse.bind(this);
	}

	selectCourse = (checkboxValue: number) => {
		console.log("Selected a value " + checkboxValue);
		if(checkboxValue > 0){
			// console.log("Selected a value " + checkboxValue);
			// this.setState((prevState) => {return {currentCourseId: checkboxValue}})
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
		console.log(this.props.featuresEnabled);
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

	renderCourseListCheckboxElement = () =>{
		return (this.state.courseListing) ? <CourseListCheckbox courseListing={this.state.courseListing} 
												selectCoursesEvent={this.selectCourse} 
												isViewCheckbox={true as boolean} 
												courseSeletionEvent={null} /> : '';
	}

	renderViewAttendanceButton = () =>{
		console.log(this.state.attendanceViewPathName);
		console.log(localStorage.getItem("sessionCourseId"));
		if(this.state.courseSelected){
			return(
				<div className="buttonLinkGroup">
					<Link to={{
						pathname: `/${this.state.attendanceViewPathName}`
					}}>Go to Attendance</Link>
				</div>
			)
		}
		else{
			return '';
		}
	}

	renderModals = () => {
			return(
				<React.Fragment>
					<CreateCourseModal instructorList={this.state.instructorList} toggleModalEvent={toggleModal} courseListings={this.renderCourseListCheckboxElement}/>
					<CreatePersonModal toggleModalEvent={toggleModal}/>
				</React.Fragment>
			)
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
				{this.renderViewAttendanceButton()}
				{this.renderModals()}
			</div>
		)
	}

}

export default LandingPageContainer;