import * as React from "react";
import { Link, match } from "react-router-dom";
import { useState } from "react";

interface RouteInfo{
	isExact: boolean,
	params: {},
	path: string,
	url: string
}

interface Props {
	routeMatch: match
}

const yearViewLinks: React.FunctionComponent<Props> = ({routeMatch}) => {

	const [year, setYear] = useState(new Date().getFullYear().toString());
	const [currentYear, setCurrentYear] = useState(parseInt(year));
	const [yearRangeStart, setYearRangeStart] = useState(parseInt(year.replace(/.$/,"0")));
	const [yearRangeEnd, setYearRangeEnd] = useState(parseInt(year.replace(/.$/,"9")));
	
	function renderYearGridCells() {
		let yearGridCells: JSX.Element[] = [];

	for (let index = yearRangeStart; index <= yearRangeEnd; index++) {
			yearGridCells.push(<Link className="yearViewCell" key={`year-range-cell-${index}`} 
								to={`${routeMatch.path}/month/${index}`}>{index}</Link>)
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
}

export default yearViewLinks;