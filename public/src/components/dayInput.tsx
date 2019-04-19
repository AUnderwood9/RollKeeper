import * as React from 'react';

interface Props {
	currentMonth: number;
	currentYear: number;
	currentDate: number;
	clickEvent(): void;
}

const dayInput: React.SFC<Props> = ({currentMonth, currentYear, currentDate, clickEvent}) => 
	<input className="dateOfMonthCell inputCell" 
		type="text" 
		name={`day-input-${currentMonth}-${currentDate}-${currentYear}`} 
		id={`day-input-${currentMonth}-${currentDate}-${currentYear}`}
		value={`${currentDate}`}
		onClick={clickEvent}
		readOnly
	/>;



export default dayInput;