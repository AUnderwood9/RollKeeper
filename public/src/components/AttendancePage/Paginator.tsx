import * as React from 'react';
// import Style from "./Paginator.module.scss";

// import { animateScroll as scroll } from "react-scroll";

function Paginator(props) {
	console.log(props);
    return (
        <div className="paginatorContainer">
            <span 
                className="paginatorElement paginatorChevron fas fa-angle-left"
                onClick={ props.handlePagination("decriment") }
            >
			</span> 
			<span className="paginatorElement paginatorPipe fas fa-ellipsis-v"></span> 
            <span 
                className="paginatorElement paginatorChevron fas fa-angle-right"
                onClick={ props.handlePagination("incriment") }
            >
			</span>
        </div>
    );
}

export default Paginator;