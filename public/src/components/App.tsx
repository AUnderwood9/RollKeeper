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
	featureList: []
}

class App extends React.PureComponent<Props, State>{
	constructor(props){
		super(props);
		
		// Storing current course id for the application in the window's session for now. Will in the future create cron jobs to maintain sessions
		// and store/destroy courseIds along with user sessions

		// console.log(localStorage.getItem("sessionCourseId"));

		// const currentCourseId 
		this.state = {
			currentCourseId: localStorage.getItem("sessionCourseId") != null ? parseInt(localStorage.getItem("sessionCourseId")) : 0,
			featureList: []
		}
	}

	async componentDidMount(){
		const featureList = await fetch("http://localhost/rollKeeper/api/features");
		const featureListObj = await featureList.json();

		console.log(featureListObj);
		this.setState({ featureList: featureListObj })
	}
	
	// featureListRoutes(){
	// 	if(this.state.featureList.length < 1 || this.state.featureList == undefined){
	// 		return;
	// 	} else if(this.state.featureList[0].isEnabled){
	// 		return (
	// 			<Route path="/rollsheet" render={(props) => <RollSheetContainer 
	// 				courseId={this.state.currentCourseId} 
	// 				/>}/>
	// 		)
	// 	}
	// }

	render() {
		return(
			<BrowserRouter>
				<div className="mainContainer">
					<Switch>
						<Route path="/calendar" exact render={ (props) => <YearViewLinks routeMatch={props.match} /> }/>
						<Route path="/" exact render={(props) => <LandingPageContainer
							featuresEnabled={this.state.featureList}
						/>}/>
						<Route path="/rollsheet" render={(props) => <RollSheetContainer 
																		courseId={this.state.currentCourseId} 
																		routeMatch = {props.match}
																		/>}/>
						<Route exact path="/calendar/month/:year" render={ (props) => <MonthViewLinks routeMatch={props.match} /> }/>
						<Route path="/calendar/month/:year/:month" render={(props) => <MonthContainer 
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