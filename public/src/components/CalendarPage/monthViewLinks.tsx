import * as React from "react";
import { Link, match} from "react-router-dom";

interface RouteInfo{
	isExact: boolean,
	params: {},
	path: string,
	url: string
}

interface Props {
	routeMatch: match
}

const monthViewLinks: React.FunctionComponent<Props> = ({ routeMatch }) => {
	// const monthViewLinks: React.FunctionComponent = ({}) => {
		console.log(routeMatch);
	return (
		<React.Fragment>
			<h1>Hai</h1>
			<Link to={`${routeMatch.url}/January`}>January</Link>
			<Link to={`${routeMatch.url}/February`}>February</Link>
			<Link to={`${routeMatch.url}/March`}>March</Link>
			<Link to={`${routeMatch.url}/April`}>April</Link>
			<Link to={`${routeMatch.url}/May`}>May</Link>
			<Link to={`${routeMatch.url}/June`}>June</Link>
			<Link to={`${routeMatch.url}/July`}>July</Link>
			<Link to={`${routeMatch.url}/August`}>August</Link>
			<Link to={`${routeMatch.url}/September`}>September</Link>
			<Link to={`${routeMatch.url}/October`}>October</Link>
			<Link to={`${routeMatch.url}/November`}>November</Link>
			<Link to={`${routeMatch.url}/December`}>December</Link>
		</React.Fragment>
	);
}

export default monthViewLinks;