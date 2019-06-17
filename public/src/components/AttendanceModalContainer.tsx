/* Tables Needed
	Terms: id, start date, end date
	Students: id, First Name, Last Name
	Attendance: id, studentIdl, termId, date, has attended
 */
import * as React from 'react';

import { makeFetchPost } from "../serviceTools";
import { toggleModal } from "../modalAction";
import { useEffect } from 'react';

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
	currentCourseId: number;
	updateCalendar(): void;
}

// Ex:
// classDate: "2019-02-13"
// courseId: 2
// hasAttended: 1
// studentId: 17

const AttendanceModalContainer: React.FunctionComponent<Props> = ({selectedDate, clickEvent, attendanceList, rosterList, currentCourseId, updateCalendar}) => {

		const [freshRosterAttendanceList, setFreshRosterAttendanceList] = React.useState([]);
		const [updateRosterAttendanceList, setUpdateRosterAttendanceList] = React.useState([]);

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
				attendanceCheck = hasAttendedList.find((attendanceElement) => {
					// console.log(`element: ${element.id} attendance: ${attendanceElement.studentId}`);
					return attendanceElement.studentId == element.id && attendanceElement.hasAttended == true;
				});

				// console.log("find");
				// console.log(attendanceCheck);
				rosterListElements.push(
					<React.Fragment>
						<label htmlFor={`roster-checkbox-${index}-${element.id}`}>{element.firstName} {element.lastName}</label>
						{/* <input key={`checkbox-${index}`} type="checkbox" name={`checkbox-${element.id}`} id={`checkbox-${element.id}`}/> */}
						{attendanceCheck !== undefined && attendanceCheck !== null ? 
							<input 
								key={`checkbox-${index}`} type="checkbox" 
								name={`checkbox-${element.id}`} id={`checkbox-${element.id}`} 
								value={element.id} defaultChecked 
								onClick={handleCheckboxClick}
								/> : 
							<input 
								key={`checkbox-${index}`} type="checkbox" 
								name={`checkbox-${element.id}`} id={`checkbox-${element.id}`} 
								value={element.id}
								onClick={handleCheckboxClick}
								/>
						}
					</React.Fragment>
				);
			});

			return rosterListElements;
		}

		
		const handleCheckboxClick = () => {

			let currentAttendanceObj = null;

			currentAttendanceObj = attendanceList.find((attendanceElement) => {
				return attendanceElement.studentId == event.target.value;
			});

			console.log(event.target.value);

			if(currentAttendanceObj != undefined && currentAttendanceObj != null){
				currentAttendanceObj.hasAttended = event.target.checked;
				let tempAttendanceList = updateRosterAttendanceList;
				let currentTempAttendanceObj = tempAttendanceList.find((element) => {
					return element.studentId == currentAttendanceObj.studentId;
				});
				if(currentTempAttendanceObj != undefined && currentTempAttendanceObj != null){
			
					const currentAttendanceIndex = tempAttendanceList.findIndex((element) => {
						return element.studentId == currentAttendanceObj.studentId;
					});

					if(currentAttendanceIndex > -1){
						tempAttendanceList.splice(currentAttendanceIndex, 1);
					}
					tempAttendanceList.push(currentAttendanceObj);
					setUpdateRosterAttendanceList([...tempAttendanceList]);
				}
				else{
					setUpdateRosterAttendanceList([...updateRosterAttendanceList, currentAttendanceObj]);
				}
			} else {
				console.log("New");
				let tempAttendanceList = freshRosterAttendanceList;
				currentAttendanceObj = {
					studentId: event.target.value,
					courseId: currentCourseId,
					hasAttended: event.target.checked,
					classDate: selectedDate
				}
				if(tempAttendanceList.length > 0){
					const currentAttendanceIndex = tempAttendanceList.findIndex((element) => {
						return element.studentId == currentAttendanceObj.studentId;
					});
					
					if(currentAttendanceIndex > -1){
						tempAttendanceList.splice(currentAttendanceIndex, 1);
					}
					tempAttendanceList.push(currentAttendanceObj);
					setFreshRosterAttendanceList([...tempAttendanceList]);
				}
				else {
					currentAttendanceObj = {
						studentId: event.target.value,
						courseId: currentCourseId,
						hasAttended: event.target.checked,
						classDate: selectedDate
					}

					setFreshRosterAttendanceList([...freshRosterAttendanceList, currentAttendanceObj]);
				}
			}
		}

		const submitAttendanceForm = async () => {
			event.preventDefault();
			// console.log(event);
			console.log("New Roster")
			console.log(freshRosterAttendanceList)
			console.log("Old Roster")
			console.log(updateRosterAttendanceList)

			const [createResponse, updateResponse] = await Promise.all([
				makeFetchPost("/attendance/multi", freshRosterAttendanceList),
				makeFetchPost("/attendance/update/multi", updateRosterAttendanceList)
			]);

			console.log("Parsing");

			console.log("Creation");
			console.log(createResponse);

			console.log("Update");
			console.log(updateResponse);

			// Reset hooks on parent component update
			// setUpdateRosterAttendanceList(attendanceList);
			// setFreshRosterAttendanceList([]);
			updateCalendar();
		}

		return (
			<div id="attendance-modal-containner">
			{/* {console.log("New Roster")}
			{console.log(freshRosterAttendanceList)}
			{console.log("Old Roster")}
			{console.log(updateRosterAttendanceList)} */}
				<div id="modal-body">
					<label htmlFor="">Absent</label> <input type="checkbox" name="" id=""/>
					<label htmlFor="">Present</label> <input type="checkbox" name="" id="" checked/>
					<form method={"POST"} onSubmit={submitAttendanceForm}>
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