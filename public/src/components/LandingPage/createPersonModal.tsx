import * as React from "react";

interface Props{
	courseId: number,
	toggleModalEvent:(modalContainerId: string) => void
}

const createPersonModal: React.FunctionComponent<Props> = ({courseId, toggleModalEvent})  =>{
	function modalCloseHandler():void{
		toggleModalEvent("create-person-modal-container");
	}
	return(
		<div id="create-person-modal-container">
			<div id="modal-body">
				<form id="create-person-form">
					<input type="text" name="first-name-input" id="first-name-input"/>
					<input type="text" name="last-name-input" id="last-name-input"/>
					<input type="email" name="primary-email-input" id="primary-email-input"/>
					<input type="tel" name="primary-phone-input" id="primary-phone-input"/>
					<div id="radio-button-group">
						<input type="radio" name="person-type" id="student-type"/>
						<label>Student</label>
						<input type="radio" name="person-type" id="instructor-type"/>
						<label>Instructor</label>
					</div>
					<input type="submit" value="Submit"/>
				</form>
			</div>

			<span id="modal-close-button" onClick={modalCloseHandler}>&times;</span>
		</div>
	);
}

export default createPersonModal;