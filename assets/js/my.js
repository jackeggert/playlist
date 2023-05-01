function generatePopularList (i) {


	let rank = i;

	AWS.config.update({region: 'us-west-2'});

	var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

	var params = {
		TableName: 'popularCharts',
		Key: {
			'rank': {N: rank}
		},
		ProjectionExpression: 'artistName, artistImage, artistGenre, playlistPoints, currentRank, id'
		};
	
		// Call DynamoDB to read the item from the table
		ddb.getItem(params, function (err, data) {
			if (err) {
				console.log("Error", err);
			} else {
	
				artistImageString = JSON.stringify(data.Item.artistImage);
				artistImageLength = artistImageString.length;
				artistImage = artistImageString.slice(6, artistImageLength - 2);
	
	
				currentRankString = JSON.stringify(data.Item.currentRank);
				currentRankLength = currentRankString.length;
				currentRank = currentRankString.slice(6, currentRankLength - 2);
	
	
				artistNameString = JSON.stringify(data.Item.artistName);
				artistNameLength = artistNameString.length;
				artistName = artistNameString.slice(6, artistNameLength - 2);
	
	
				artistGenreString = JSON.stringify(data.Item.artistGenre);
				artistGenreLength = artistGenreString.length;
				artistGenre = artistGenreString.slice(6, artistGenreLength - 2);
	
	
				projectedRankString = JSON.stringify(data.Item.playlistPoints);
				projectedRankLength = projectedRankString.length;
				projectedRank = projectedRankString.slice(6, projectedRankLength - 2);
	
				idString = JSON.stringify(data.Item.id);
				idLength = idString.length;
				id = idString.slice(6, idLength - 2)
	
	
				const songObject = { currentRank: currentRank, title: artistName, artist: artistGenre, image: artistImage, projectedRank: projectedRank, artistId: id };
				songArray.push(songObject);
	
			}

		})

}


function generateCards (topResults) {

	document.getElementById('artistcardsparent').innerHTML = '';

	const resultsLength = topResults.length;

	console.log(resultsLength)
	trueResultsLength = 0;


	for (let i = 0; i<resultsLength; i++) {

		let score = (Math.round((topResults[i].cm_artist_score)/100))
		let artistName = topResults[i].name;
		let pic = topResults[i].image_url;
		let id = topResults[i].id;

		if (score > 10) {
			if (pic) {

				let newScore = score.toLocaleString("en-US");

				trueResultsLength++;
				let artistValue = 3;


		$("#artistcardsparent").append(`<label class="card-checkBox-label position-relative label">
								<div class="label-inner">
								<input id='${id}' class="checkbox-input checkbox-disabled${artistValue}" type="checkbox" name="">
								<div class="checked-styling position-relative">
									<img class="checkbox-image" src="${pic}">
									<div class="position-absolute card-top px-3 py-2 w-100">
										<div class="d-flex align-items-center justify-content-between flex-wrap position-relative">
											<div class="graph-image">
												<img class="img-fluid" src="assets/images/graph.png">
											</div>
											<div class="fw-bold text-white top-number">${artistValue}</div>
										</div>
									</div>
									<div class="position-absolute card-center px-3 py-2 w-100">
										<div class="text-center">
											<div class="text-white fw-bold h5 card-center-text mb-0">${artistName}</div>
										</div>
									</div>
									<div class="position-absolute card-bottom p-2 w-100">
										<div class="d-flex align-items-center position-relative justify-content-center w-100 mx-auto">
											<div class="fw-bold text-white card-bottom-number px-2">${newScore}</div>
											<div class="fw-normal text-white card-bottom-text px-2">Current Points</div>
										</div>
									</div>
								</div>
								</div>
								<div class="overlay position-absolute"></div>
							</label>`);
	}}}

	if (trueResultsLength == 0) {

		document.getElementById('artistcardsparent').innerHTML = `

						<div style='text-align: center;' id='nopicksimg'>
						<img src='Images/nopicks.png' class='nopicksimg'>
						<div style="font-weight: 400; color: white;">No Results Found!</div>
						<p style="font-size: 12.5px; margin-top: 15px; font-weight: 100; color: white;">Check to make sure you spelled everything right.</p>
						</div>
						`

	}
	
	// document.getElementById('loading').classList.add('invisible')
	searchInProgress = false;


	$(".checkbox-input").click(function(){

		let artistValue = 3;

		console.log(pointsSpent + artistValue)

		this.classList.remove(`checkbox-disabled${artistValue}`);
		this.classList.add('checkbox-enabled');



		if(this.checked){

			let key = getKeyByIdSearch(topResults, this.id)

			console.log(key)

			let score = (Math.round((topResults[key].cm_artist_score)/100)).toLocaleString("en-US");
			let artistName = topResults[key].name;
			let pic = topResults[key].image_url;
			let artistValue = 3;


		// Make sure that the user isn't overspending
		if (pointsSpent + artistValue <= 10) {

			pointsSpent = pointsSpent + artistValue;




			if (pointsSpent >= 8) {

				var elements = Array.from(document.getElementsByClassName("checkbox-disabled3"))
				console.log(elements)
				for (i=0; i < elements.length; i++) {
					elements[i].disabled = true;
				}

			}

			if (pointsSpent == 10) {

				var elements = Array.from(document.getElementsByClassName("checkbox-disabled1"))
				console.log(elements)
				for (i=0; i < elements.length; i++) {
					elements[i].disabled = true;
				}

			}



			document.getElementById('remainingPoints1').innerHTML = `${10-pointsSpent}/10`;
			document.getElementById('remainingPoints2').innerHTML = `${10-pointsSpent}/10`;
			artistObject = { id: this.id, value: artistValue}
			entryObject["artists"].push(artistObject);
			// let id = topResults[key].id;

			$(".table-body").append(`<tr id='${this.id}ListItem1'>
											<td>
												<div class="avatar mx-auto position-relative">
													<img class="img-fluid rounded-circle" src="${pic}">
													<div class="position-absolute image-number text-white fw-bold text-center">3</div>
												</div>
											</td>
											<td class="text-center fw-bold mobile-table-text h5 mb-0">${artistName}</td>
											<td class="text-center">
												<div class="fw-bold mobile-table-number">${score}</div>
												<div class="mobile-points">Points</div>
											</td>
										</tr>`);
			$(".table-body-one").append(`<tr id='${this.id}ListItem2'>
											<td>
												<div class="avatar mx-auto position-relative">
													<img class="img-fluid rounded-circle" src="${pic}">
													<div class="position-absolute image-number text-white fw-bold text-center">${artistValue}</div>
												</div>
											</td>
											<td class="text-center fw-bold mobile-table-text h5 mb-0">${artistName}</td>
											<td class="text-center">a
												<div class="fw-bold mobile-table-number">${score}</div>
												<div class="mobile-points">Points</div>
											</td>
										</tr>`);

				}


		}else{
 
				pointsSpent = pointsSpent - artistValue;


			// If 7 or less, enable 3's again
			if (pointsSpent < 8) {

				var elements = Array.from(document.getElementsByClassName("checkbox-disabled3"))
				console.log(elements)
				for (i=0; i < elements.length; i++) {
					elements[i].disabled = false;
				}

			}


			// enable all 1's again
				var elements = Array.from(document.getElementsByClassName("checkbox-disabled1"))
				console.log(elements)
				for (i=0; i < elements.length; i++) {
					elements[i].disabled = false;
				}

				this.classList.remove("checkbox-enabled");
				this.classList.add(`checkbox-disabled${artistValue}`);





				document.getElementById('remainingPoints1').innerHTML = `${10-pointsSpent}/10`;
				document.getElementById('remainingPoints2').innerHTML = `${10-pointsSpent}/10`;
				document.getElementById(`${this.id}ListItem1`).remove();
				document.getElementById(`${this.id}ListItem2`).remove();
				let index = entryObject["artists"].indexOf(this.id);
				entryObject["artists"].splice(index, 1);
			


		}
		
		
	
	});
};

function generateInitialCards (artistData) {


		let score = (Math.round((artistData.projectedRank)/100)).toLocaleString("en-US");
		let artistName = artistData.title;
		let pic = artistData.image;
		let id = artistData.artistId;
		let artistValue = 3;

		$("#artistcardsparent").append(`<label class="card-checkBox-label position-relative label">
								<div class="label-inner">
								<input id='${id}' class="checkbox-input checkbox-disabled${artistValue}" type="checkbox" name="">
								<div class="checked-styling position-relative">
									<img class="checkbox-image" src="${pic}">
									<div class="position-absolute card-top px-3 py-2 w-100">
										<div class="d-flex align-items-center justify-content-between flex-wrap position-relative">
											<div class="graph-image">
												<img class="img-fluid" src="assets/images/graph.png">
											</div>
											<div class="fw-bold text-white top-number">${artistValue}</div>
										</div>
									</div>
									<div class="position-absolute card-center px-3 py-2 w-100">
										<div class="text-center">
											<div class="text-white fw-bold h5 card-center-text mb-0">${artistName}</div>
										</div>
									</div>
									<div class="position-absolute card-bottom p-2 w-100">
										<div class="d-flex align-items-center position-relative justify-content-center w-100 mx-auto">
											<div class="fw-bold text-white card-bottom-number px-2">${score}</div>
											<div class="fw-normal text-white card-bottom-text px-2">Current Points</div>
										</div>
									</div>
								</div>
								</div>
								<div class="overlay position-absolute"></div>
							</label>`);
	
	
	//document.getElementById('loading').classList.add('invisible')
	searchInProgress = false;


	$(document.getElementById(id)).click(function(){

		console.log(pointsSpent + artistValue)

		document.getElementById(id).classList.remove(`checkbox-disabled${artistValue}`);
		document.getElementById(id).classList.add('checkbox-enabled');

		if(this.checked){

			let key = getKeyById(songArray, this.id)

			let score = (Math.round((songArray[key].projectedRank)/100)).toLocaleString("en-US");
			let artistName = songArray[key].title;
			let pic = songArray[key].image;
			let artistValue = 3;



		// Make sure that the user isn't overspending
		if (pointsSpent + artistValue <= 10) {


			pointsSpent = pointsSpent + artistValue;

			if (pointsSpent >= 8) {

				var elements = Array.from(document.getElementsByClassName("checkbox-disabled3"))
				console.log(elements)
				for (i=0; i < elements.length; i++) {
					elements[i].disabled = true;
				}

			}

			if (pointsSpent == 10) {

				var elements = Array.from(document.getElementsByClassName("checkbox-disabled1"))
				console.log(elements)
				for (i=0; i < elements.length; i++) {
					elements[i].disabled = true;
				}

			}


			document.getElementById('remainingPoints1').innerHTML = `${10-pointsSpent}/10`;
			document.getElementById('remainingPoints2').innerHTML = `${10-pointsSpent}/10`;
			artistObject = { id: this.id, value: artistValue}
			entryObject["artists"].push(artistObject);

			//let id = songArray[key].artistId;

			$(".table-body").append(`<tr id='${this.id}ListItem1'>
											<td>
												<div class="avatar mx-auto position-relative">
													<img class="img-fluid rounded-circle" src="${pic}">
													<div class="position-absolute image-number text-white fw-bold text-center">3</div>
												</div>
											</td>
											<td class="text-center fw-bold mobile-table-text h5 mb-0">${artistName}</td>
											<td class="text-center">
												<div class="fw-bold mobile-table-number">${score}</div>
												<div class="mobile-points">Points</div>
											</td>
										</tr>`);
			$(".table-body-one").append(`<tr id='${this.id}ListItem2'>
											<td>
												<div class="avatar mx-auto position-relative">
													<img class="img-fluid rounded-circle" src="${pic}">
													<div class="position-absolute image-number text-white fw-bold text-center">${artistValue}</div>
												</div>
											</td>
											<td class="text-center fw-bold mobile-table-text h5 mb-0">${artistName}</td>
											<td class="text-center">a
												<div class="fw-bold mobile-table-number">${score}</div>
												<div class="mobile-points">Points</div>
											</td>
										</tr>`);

					} 


		}else{
			pointsSpent = pointsSpent - artistValue;

			// If 7 or less, enable 3's again
			if (pointsSpent < 8) {

				var elements = Array.from(document.getElementsByClassName("checkbox-disabled3"))
				console.log(elements)
				for (i=0; i < elements.length; i++) {
					elements[i].disabled = false;
				}

			}


			// enable all 1's again
				var elements = Array.from(document.getElementsByClassName("checkbox-disabled1"))
				console.log(elements)
				for (i=0; i < elements.length; i++) {
					elements[i].disabled = false;
				}

				document.getElementById(this.id).classList.remove("checkbox-enabled");
				document.getElementById(this.id).classList.add(`checkbox-disabled${artistValue}`);


			document.getElementById('remainingPoints1').innerHTML = `${10-pointsSpent}/10`;
			document.getElementById('remainingPoints2').innerHTML = `${10-pointsSpent}/10`;
			document.getElementById(`${this.id}ListItem1`).remove();
			document.getElementById(`${this.id}ListItem2`).remove();
			let index = entryObject["artists"].indexOf(this.id);
			entryObject["artists"].splice(index, 1);

			if (pointsSpent < 8) {
				disableThrees = false;
			}
			disableOnes = false;

		}
		
		
	})

};
