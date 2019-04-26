import * as React from "react";
import { Link, match } from "react-router-dom";

interface RouteInfo{
	isExact: boolean,
	params: {},
	path: string,
	url: string
}

interface Props {
	currentYear: number,
	yearRangeStart: number,
	yearRangeEnd: number,
	match: match
}

// interface Props{
// 	required: string;
//   	match: RouteComponentProps<any>;
// }	

const yearViewLinks: React.FunctionComponent<Props> = ({currentYear, yearRangeStart, yearRangeEnd, match}) => {
	// const yearViewLinks: React.FunctionComponent<any> = ({ match }: RouteComponentProps<RouteInfo>) => {
	
	function renderYearGridCells() {
		let yearGridCells: JSX.Element[] = [];

	for (let index = yearRangeStart; index <= yearRangeEnd; index++) {
			yearGridCells.push(<Link className="yearViewCell" key={`year-range-cell-${index}`} to={`${match.path}/month/${index}`}>{index}</Link>)
		}

		return yearGridCells;
	}

	return(
		<React.Fragment>
			<h1>Please Select a Year</h1>
			<div id="year-view-grid-container">
				{renderYearGridCells()}
			</div>
		</React.Fragment>
	);

	// return(
	// 	<h1>Hai!</h1>
	// );
}

export default yearViewLinks;