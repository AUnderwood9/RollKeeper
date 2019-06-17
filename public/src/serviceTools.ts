const baseUrl = "http://localhost/rollKeeper/api"

function makeFetchPost(endpoint, postData):Promise<any>{
	return fetch(baseUrl + endpoint, {
        method: "POST", 
		mode: "cors",
		headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(postData)
    })
    .then(response => {
		let responseObj = response.json();
		return responseObj;
	});
}

export {
	makeFetchPost
}