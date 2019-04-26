import * as React from "react";
import { makeFetchPost } from "../../serviceTools";

interface Props{
	courseId: number,
	toggleModalEvent:(modalContainerId: string) => void
}

const createPersonModal: React.FunctionComponent<Props> = ({courseId, toggleModalEvent})  =>{
	const [firstName, setFirstName] = React.useState("");
	const [lastName, setLastName] = React.useState("");
	const [email, setprimaryEmail] = React.useState("");
	const [phoneNumber, setprimaryPhone] = React.useState("");
	const [personType, setpersonType] = React.useState("");

	function modalCloseHandler():void{
		toggleModalEvent("create-person-modal-container");
	}

	function submitCreatePersonForm():void {
		event.preventDefault();

		const requestOjbect = {
			personType,
			firstName,
			lastName,
			phoneNumber,
			email,
			courseId
		}

		makeFetchPost("/person", requestOjbect)
		.catch((error) => {console.log(error)});
	}

	return(
		<div id="create-person-modal-container">
			<div id="modal-body">
				<form 
					id="create-person-form"
					onSubmit={submitCreatePersonForm}
					>
					<label htmlFor="first-name-input">First Name</label>
					<input type="text" name="first-name-input" id="first-name-input" value={firstName} onChange={(e) => {setFirstName(e.target.value)}} required/>
					<label htmlFor="last-name-input">Last Name</label>
					<input type="text" name="last-name-input" id="last-name-input" value={lastName} onChange={(e) => {setLastName(e.target.value)}} required/>
					<label htmlFor="primary-email-input">Email Address</label>
					<input type="email" name="primary-email-input" id="primary-email-input" value={email} onChange={(e) => {setprimaryEmail(e.target.value)}} required/>
					<label htmlFor="primary-phone-input">Phone Number</label>
					<input type="tel" name="primary-phone-input" id="primary-phone-input" pattern="[0-9]{10}" value={phoneNumber} onChange={(e) => {setprimaryPhone(e.target.value)}} required/>

					<label htmlFor="">Student or Instructor</label>
					<div id="radio-button-group">
						<input type="radio" name="person-type" id="student-type" value="student" onChange={(e) => {setpersonType(e.target.value)}}/>
						<label htmlFor="student-type">Student</label>
						<input type="radio" name="person-type" id="instructor-type" value="instructor" onChange={(e) => {setpersonType(e.target.value)}}/>
						<label htmlFor="instructor-type">Instructor</label>
					</div>
					<input type="submit" value="Submit"/>
				</form>
			</div>

			<span id="modal-close-button" onClick={modalCloseHandler}>&times;</span>
		</div>
	);
}

export default createPersonModal;