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