import * as React from "react";
import { BrowserRouter as Router, Switch, Route, Link, match } from "react-router-dom";
require('isomorphic-fetch');

import YearViewLinks from "./yearViewLinks";
import MonthViewLinks from "./monthViewLinks";
import MonthContainer from '../MonthContainer';

interface Props{
	match: match
}

interface State{
	currentYear: number,
	yearRangeStart: number,
	yearRangeEnd: number
}

class CalendarContainer extends React.PureComponent<Props, State> {
	constructor(props){
		super(props);

		const year = new Date().getFullYear().toString();

		this.state = {
			currentYear: parseInt(year),
			yearRangeStart: parseInt(year.replace(/.$/,"0")),
			yearRangeEnd: parseInt(year.replace(/.$/,"9"))
		}
	}

	renderYearGridCells() {
		let yearGridCells: JSX.Element[] = [];

		for (let index = this.state.yearRangeStart; index <= this.state.yearRangeEnd; index++) {
			yearGridCells.push(<Link className="yearViewCell" key={`year-range-cell-${index}`} to="/yearView/{index}">{index}</Link>)
		}

		return yearGridCells;
	}

	// componentDidMount(){
	// 	console.log(`CUrrent Year: ${this.state.currentYear}, year Range Start: ${this.state.yearRangeStart}, year Range End: ${this.state.yearRangeEnd}`)
	// }

	render(){
		return(
			<Router>
				<React.Fragment>
					{/* <Route path="/" component={YearViewLinks}/> */}
					<Route exact path={this.props.match.path} render={(props) => <YearViewLinks 
																currentYear={this.state.currentYear} 
																yearRangeStart={this.state.yearRangeStart} 
																yearRangeEnd={this.state.yearRangeEnd}
																match={props.match}
															/>}/>
					{/* <Route path={`/calendar/:year`} render={ (props) => <MonthViewLinks 
																routeMatch={props.match}
															/> }/>	 */}
					{/* <Route path={`${this.props.match.path}/month/:year`} component={ MonthViewLinks }/> */}
					<Route exact path={`${this.props.match.path}/month/:year`} component={ (props) => <MonthViewLinks routeMatch={props.match}/>}/>
					<Route exact path={`${this.props.match.path}/month/:year/:month`} component={MonthContainer}/>
				</React.Fragment>
			</Router>
		);
	}
}

export default CalendarContainer;