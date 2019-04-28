const toggleModal: any = (modalId: string) => {
	// console.log(event.target);
	// console.log(modalId);
	let attendanceModal = document.getElementById(modalId);

	if( attendanceModal.style.display == "none" || attendanceModal.style.display === "" || attendanceModal.style.display == null){
		attendanceModal.style.display = "flex";
	} else if( attendanceModal.style.display == "flex" ){
		attendanceModal.style.display = "none";
	} else{
		attendanceModal.style.display = "none";
	}
}

export {
	toggleModal	
}