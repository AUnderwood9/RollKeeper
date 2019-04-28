/* Tables Needed
	Terms: id, start date, end date
	Students: id, First Name, Last Name
	Attendance: id, studentIdl, termId, date, has attended
 */
import * as React from 'react';

import { toggleModal } from "../modalAction";

// interface Props {
// 	currentMonth: number;
// 	currentYear: number;
// 	currentDate: number;
// }

interface Props {
	selectedDate: string;
	clickEvent(): void;
	attendanceList: {}[];
	rosterList: {}[];
}

const AttendanceModalContainer: React.FunctionComponent<Props> = ({selectedDate, clickEvent, attendanceList, rosterList}) => {
		// console.log(selectedDate);
		// console.log("Attendance List: ");
		// console.log(console.log(attendanceList.filter(function (element) {
		// 	// return element.classDate == "2019-02-12";
		// 	return element.classDate == selectedDate;
		//   })))
		// console.log(rosterList);

		const buildRosterListElements = (): JSX.Element[] => {
			let rosterListElements: JSX.Element[] = [];
			let attendanceCheck;
			const hasAttendedList = attendanceList.filter((element) => {
				return element.hasAttended;
			});

			// console.log(hasAttendedList);
			// console.log(rosterList);

			// console.log(attendanceList.filter((element) => {
			// 	return element.hasAttended;
			// }))

			rosterList.forEach((element, index) => {
				attendanceCheck = hasAttendedList.filter((attendanceElement) => {
					// console.log(`element: ${element.id} attendance: ${attendanceElement.studentId}`);
					return attendanceElement.studentId == element.id;
				});
				rosterListElements.push(
					<React.Fragment>
						<label htmlFor={`roster-checkbox-${index}-${element.id}`}>{element.firstName} {element.lastName}</label>
						{attendanceCheck.length > 0 ? 
							<input key={`checkbox-${index}`} type="checkbox" name={`checkbox-${element.id}`} id={`checkbox-${element.id}`} checked/> : 
							<input key={`checkbox-${index}`} type="checkbox" name={`checkbox-${element.id}`} id={`checkbox-${element.id}`}/>
						}
					</React.Fragment>
				);
			});

			return rosterListElements;
		}

		return (
			<div id="attendance-modal-containner">
				<div id="modal-body">
					<form>
						{buildRosterListElements()}
						<input type="submit" value="Submit"/>
					</form>
				</div>

				<span 
					id="modal-close-button"
					onClick={clickEvent}
					>
						&times;
					</span>
			</div>
		)

}

export default AttendanceModalContainer;