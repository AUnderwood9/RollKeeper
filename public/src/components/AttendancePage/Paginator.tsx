import * as React from 'react';
// import Style from "./Paginator.module.scss";

// import { animateScroll as scroll } from "react-scroll";

function Paginator(props) {
    return (
        <div className="paginatorContainer">
            <span 
                className="paginatorElement paginatorChevron fas fa-angle-left"
                // onClick={ (event) => props.getPreviosGames(event) }
            >
			</span> 
			<span className="paginatorElement paginatorPipe fas fa-ellipsis-v"></span> 
            <span 
                className="paginatorElement paginatorChevron fas fa-angle-right"
                // onClick={ (event) => props.getNextGames(event) }
            >
			</span>
        </div>
    );
}

export default Paginator;