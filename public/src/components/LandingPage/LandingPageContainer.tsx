import * as React from 'react';
import { Link } from "react-router-dom"
import CourseListCheckbox from "./courseListCheckbox";
import CreateCourseModal from "./createCourseModal";
import CreatePersonModal from "./createPersonModal";
import { toggleModal } from "../../modalAction";
require('isomorphic-fetch');

interface Props{

}

interface State {
	courseListing: {courseId: string, courseTitle: string, instructorId: string, termStart: Date, termEnd: Date, classDays: string}[],
	currentCourseId: number,
	instructorList: {instructorId: string, firstName: string, lastName: string, contactId: string}[]
}

class LandingPageContainer extends React.Component<Props, State>{
	constructor(props: Props){
		super(props);

		this.state = {
			courseListing: [],
			currentCourseId: 0,
			instructorList: []
		};

		this.selectCourse.bind(this);
	}

	selectCourse = (checkboxValue: number) => {
		if(checkboxValue > 0){
			// console.log("Selected a value " + checkboxValue);
			// this.setState((prevState) => {return {currentCourseId: checkboxValue}})
			this.setState({
				courseListing: this.state.courseListing,
				currentCourseId: checkboxValue
			});
		}
		else{
			this.setState({
				courseListing: this.state.courseListing,
				currentCourseId: checkboxValue
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

		this.setState({
			courseListing: courseListObject,
			instructorList: instructorListObject,
			currentCourseId: this.state.currentCourseId
		});
	}

	renderCourseListCheckboxElement = () =>{
		return (this.state.courseListing) ? <CourseListCheckbox courseListing={this.state.courseListing} selectCoursesEvent={this.selectCourse} /> : '';
	}

	renderButtonList = () =>{
		if(this.state.currentCourseId > 0){
			return(
				<div className="buttonLinkGroup">
					<button 
						className="landingPageModalButton"
						onClick={toggleModal.bind(this, "create-courses-modal-container")}
					>Add Courses</button>
					<Link to={{
						pathname: "/calendar",
						state: { courseId: this.state.currentCourseId }
					}}>Go to Attendance Calendar</Link>
					<button 
						className="landingPageModalButton"
						onClick={toggleModal.bind(this, "create-person-modal-container")}
					>Add Student/Instrctor</button>
				</div>
			)
		}
		else{
			return '';
		}
	}

	renderModals = () => {
		if(this.state.courseListing.length > 0 && this.state.instructorList.length > 0){
			return(
				<React.Fragment>
					<CreateCourseModal courseId={this.state.currentCourseId} instructorList={this.state.instructorList} toggleModalEvent={toggleModal}/>
					<CreatePersonModal courseId={this.state.currentCourseId} toggleModalEvent={toggleModal}/>
				</React.Fragment>
			)
		}
		else{
			return '';
		}
	}

	render(){
		return (
			<div id="landingPageContainer">
				<h1>Welcome</h1>
				{this.renderCourseListCheckboxElement()}
				{this.renderButtonList()}
				{this.renderModals()}
			</div>
		)
	}

}

export default LandingPageContainer;