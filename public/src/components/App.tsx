import * as React from 'react';
import { RouteComponentProps, BrowserRouter, Router, Switch, Route } from 'react-router-dom';

import MonthContainer from "./MonthContainer";
import LandingPageContainer from "./LandingPage/LandingPageContainer";
import YearViewLinks from "./CalendarPage/yearViewLinks";
import MonthViewLinks from "./CalendarPage/monthViewLinks";
import RollSheetContainer from "./CalendarPage/RollSheetContainer";

interface Props {

}

interface State {
	currentCourseId: number;
}

class App extends React.PureComponent<Props, State>{
	constructor(props){
		super(props);
		
		// Storing current course id for the application in the window's session for now. Will in the future create cron jobs to maintain sessions
		// and store/destroy courseIds along with user sessions

		// console.log(localStorage.getItem("sessionCourseId"));

		// const currentCourseId 
		this.state = {
			currentCourseId: localStorage.getItem("sessionCourseId") != null ? parseInt(localStorage.getItem("sessionCourseId")) : 0
		}
	}

	render() {
		return(
			<BrowserRouter>
				<div className="mainContainer">
					<Switch>
						<Route path="/calendar" exact render={ (props) => <YearViewLinks routeMatch={props.match} /> }/>
						<Route path="/" exact component={LandingPageContainer}/>
						<Route exact path="/calendar/month/:year" render={ (props) => <MonthViewLinks routeMatch={props.match} /> }/>
						{/* <Route path="/calendar/month/:year/:month" render={(props) => <MonthContainer 
																											courseId={this.state.currentCourseId} 
																											routeMatch = {props.match}
																											/>}/> */}
						<Route path="/calendar/month/:year/:month" render={(props) => <RollSheetContainer 
																											courseId={this.state.currentCourseId} 
																											routeMatch = {props.match}
																											/>}/>
					</Switch>
				</div>
			</BrowserRouter>
		);
	}
}

export default App;