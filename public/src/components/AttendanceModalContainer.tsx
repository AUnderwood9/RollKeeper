/* Tables Needed
	Terms: id, start date, end date
	Students: id, First Name, Last Name
	Attendance: id, studentIdl, termId, date, has attended
 */
import * as React from 'react';

// interface Props {
// 	currentMonth: number;
// 	currentYear: number;
// 	currentDate: number;
// }

interface Props {
	clickEvent(): void;
}

interface State {
	studentList: { studentFirstName: String, studentLastName: String, hasAttended: boolean }[]
}

class AttendanceModalContainer extends React.Component<Props, State>{
	constructor(props: Props){
		super(props);

		this.state = {
			studentList:[
				{
					studentFirstName: "Joe",
					studentLastName: "weaver",
					hasAttended: true
				},{
					studentFirstName: "Joan",
					studentLastName: "Stilts",
					hasAttended: true
				},{
					studentFirstName: "Kris",
					studentLastName: "Barns",
					hasAttended: false
				}, {
					studentFirstName: "Maxine",
					studentLastName: "cartley",
					hasAttended: false
				}
			]
		}
	}

	render(){
		return (
			<div id="attendance-modal-containner">
				<div id="modal-body">
					<p>This is my modal this is my code!</p>
					<p>This is for fighting, this is for fun!!!</p>
					<p>I need more text!</p>
					<p>I need more text!</p>
					<p>I need more text!</p>
					<p>I need more text!</p>
					<p>I need more text!</p>
					<p>I need more text!</p>
				</div>

				<span 
					id="modal-close-button"
					onClick={this.props.clickEvent}
					>
						&times;
					</span>
			</div>
		)
	}

}

export default AttendanceModalContainer;