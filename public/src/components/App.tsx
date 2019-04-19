import * as React from 'react';
import { RouteComponentProps, BrowserRouter, Router, Switch, Route } from 'react-router-dom';
import { History, Location } from "history";

import MonthContainer from "./MonthContainer";

// const App: React.SFC = () => <div>Hello World</div>;

// interface RouteComponentProps<P> {
//     match: match<P>;
//     location: H.Location;
//     history: H.History;
// }

class App extends React.Component<{}>{
	render() {
		return(
			<BrowserRouter>
				<div className="mainContainer">
					<Switch>
						<Route path="/" exact component={MonthContainer}/>
					</Switch>
				</div>
			</BrowserRouter>
		);
	}
}

export default App;