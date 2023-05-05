AWS.config.update({region: 'us-west-2'});

finalItem = false;

async function getUserDetails(user) {

    email = String(user);

    var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    var params = {
        TableName: 'userData',
        Key: {
            'email': {S: email}
        },
        ProjectionExpression: 'overUnderWins, fantasyWins, amountWon'
        };
    
        // Call DynamoDB to read the item from the table
        ddb.getItem(params, function(err, data) {
        if (err) {
            console.log(err) }
        else {

            ouString = JSON.stringify(data.Item.overUnderWins);
            ouLength = ouString.length;
            ouWins = ouString.slice(6, ouLength - 2);
            document.getElementById('overUnderWins').innerHTML = `<b>${ouWins}</b><div class='dataDetails'>Over/Under Wins</div>`

            fantString = JSON.stringify(data.Item.fantasyWins);
            fantLength = fantString.length;
            fantWins = fantString.slice(6, fantLength - 2);
            document.getElementById('fantasyWins').innerHTML = `<b>${fantWins}</b><div class='dataDetails'>Fantasy Wins</div>`

            amountWonString = JSON.stringify(data.Item.amountWon);
            amountWonLength = amountWonString.length;
            amountWon = amountWonString.slice(6, amountWonLength - 2);

            const formatCurrency = (amountWon) => {
                const formatter = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                });
                return formatter.format(amountWon);
              };

            document.getElementById('amountWon').innerHTML = `<b>${formatCurrency(amountWon)}</b><div class='dataDetails'>Amount Won</div>`

        }})

}


async function getActiveBets (user) {

    email = String(user);

    // For testing
    // email = 'skrantz@usc.edu';

    const d = new Date();
    let dateString = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit'}).format(d);

    // Create the DynamoDB service object
    var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});


    // CHANGE THE SUBMISSION TO CREATE COMPLETEDATE NOT AS PARTITION KEY!!!!
    const params = {
        // Specify which items in the results are returned.
        FilterExpression: "email = :email",
        // Define the expression attribute value, which are substitutes for the values you want to compare.
        ExpressionAttributeValues: {
          ":email": {S: email}
        },
        // Set the projection expression, which are the attributes that you want.
        ProjectionExpression: "email, completeDate, entryAmount, wager1, wager2, wager3, wager4, winningAmount, betNumber, finalResult",
        TableName: "activeOverUnderBets",
    };

    // Call DynamoDB to read the item from the table
    ddb.scan(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {

            queryLength = data.Count;
            console.log(queryLength)
            createForms(queryLength, data, dateString);


        
        }
    });
}


async function createForms(length, object, todayDate) {

    testDigit = 0;
    testDigitPast = 0;

    parlayObject = [];
    parlayIndexCounter = 0;
    completedObject = [];
    completedIndexCounter = 0;

    console.log(length)

    for (let i = 0; i < length; i++) {

        parlayLength = 0;

        console.log(object)
        // the 'object' is every one of the user's bets, regardless of if its still active


        // Complete Date variable
        dateString = JSON.stringify(object.Items[i].completeDate);
        dateLength = dateString.length;
        date = dateString.slice(6, dateLength - 2);

        const finishDate = new Date(String(date)); // create a new Date object from the input string
        console.log("Finish date: " + finishDate)

        const today = new Date(String(todayDate));
        console.log("Today: " + today)
        var active = false;

        // Winning Amount
        winningsString = JSON.stringify(object.Items[i].winningAmount);
        winningsLength = winningsString.length;
        winnings = winningsString.slice(6, winningsLength - 2);

        // Entry Amount
        entryString = JSON.stringify(object.Items[i].entryAmount);
        entryLength = entryString.length;
        entry = entryString.slice(6, entryLength - 2);
        
        if (finishDate <= today) {

            testDigitPast++;

            console.log("The input date is before today.");

            completedObject[completedIndexCounter] = [];

            let active = false;

            wager1 = makeWagerObject(object.Items[i].wager1, completedIndexCounter, active);
            wager2 = makeWagerObject(object.Items[i].wager2, completedIndexCounter, active);
            wager3 = makeWagerObject(object.Items[i].wager3, completedIndexCounter, active);
            wager4 = makeWagerObject(object.Items[i].wager4, completedIndexCounter, active);

            completedObject[completedIndexCounter].winnings = winnings;
            completedObject[completedIndexCounter].toWin = entry;
            completedObject[completedIndexCounter].date = date;

            resultString = JSON.stringify(object.Items[i].finalResult);
            resultLength = resultString.length;
            result = resultString.slice(6, resultLength - 2);

            completedObject[completedIndexCounter].result = result;

            let length = completedObject[completedIndexCounter].length;

            // checkResults(email, winnings, completedObject[completedIndexCounter], entry, length, testDigit)

            completedIndexCounter++;


        } else if (finishDate > today) {

            testDigit++;

            parlayObject[parlayIndexCounter] = [];

            // if the bet is active, get the data
            console.log("The input date is after today.");

            let active = true;

            wager1 = makeWagerObject(object.Items[i].wager1, parlayIndexCounter, active);
            wager2 = makeWagerObject(object.Items[i].wager2, parlayIndexCounter, active);
            wager3 = makeWagerObject(object.Items[i].wager3, parlayIndexCounter, active);
            wager4 = makeWagerObject(object.Items[i].wager4, parlayIndexCounter, active);

            parlayObject[parlayIndexCounter].winnings = winnings;
            parlayObject[parlayIndexCounter].toWin = entry;
            parlayObject[parlayIndexCounter].date = date;

            let length = parlayObject[parlayIndexCounter].length
            console.log('OBJECT LENGTH: ' + length)

            parlayIndexCounter++;


        }

    }
    console.log('OBJECT LENGTH: ' + length)

    if (parlayObject.length != 0) {
        checkResults(parlayObject[0], testDigit)
    }
    else {

        document.getElementById('animation').classList.add('invisible')
        document.getElementById('noBets').classList.remove('invisible')

    }

}

async function checkResults (parlay, activeBetsCount) {

    winnings = parlay.winnings;
    initialAmount = parlay.toWin;
    betLength = parlay.length;
    date = parlay.date;
    overAlready = false;

    if (parlay.result) {

        overAlready = true;

        if (parlay.result == 'loss') {

            document.getElementById('progressBox').innerHTML = 'LOSS';
            document.getElementById('progressBox').classList.remove('inProgress');
            document.getElementById('progressBox').classList.remove('win');
            document.getElementById('progressBox').classList.add('loss');

        }

        if (parlay.result == 'win') {

            document.getElementById('progressBox').innerHTML = 'WIN';
            document.getElementById('progressBox').classList.remove('inProgress');
            document.getElementById('progressBox').classList.remove('loss');
            document.getElementById('progressBox').classList.add('win');
            
        }

    } else {
        countdown(date, page);
    }

    console.log(parlayLength)


    // Get ID from parlay[i]
    var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    const formatCurrency = (amountWon) => {
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        });
        return formatter.format(amountWon);
      };

    document.getElementById('betTitle').innerHTML = `${betLength} Picks to pay ${formatCurrency(winnings)}`;
    document.getElementById('betSubtitle').innerHTML = `${formatCurrency(initialAmount)} Entry - Ends on <b style='font-size: 25px;'>${date}</b>`;
    if (overAlready == true) {
        document.getElementById('betSubtitle').innerHTML = `${formatCurrency(initialAmount)} Entry - Ended on <b style='font-size: 25px;'>${date}</b>`;
    }

    // PARLAY LENGTH OF TWO

    if (betLength == 2) {
        var params = {
            RequestItems: {
            'pointsById': {
                Keys: [
                {'id': {S: String(parlay[0].id)}},
                {'id': {S: String(parlay[1].id)}},
                ],
                ProjectionExpression: 'id, playlistPoints'
            }
            }
        };
        
        ddb.batchGetItem(params, function(err, data) {
            if (err) {
            console.log("Error", err);
            } else {

                idString = JSON.stringify(data.Responses.pointsById[0].id);
                idLength = idString.length;
                idFinal = idString.slice(6, idLength - 2);

                pointsString = JSON.stringify(data.Responses.pointsById[0].playlistPoints);
                pointsLength = pointsString.length;
                pointsFinal = pointsString.slice(6, pointsLength - 2);

                for (let i = 0; i < 2; i++) {
                
                    idCheck = parlay[i].id;
                    if (idFinal == idCheck) {

                        checkIndex = i;

                    }

                }

                isOver = parlay[checkIndex].isOver;

                var change = Number(pointsFinal) - Number(parlay[checkIndex].threshold)

                console.log(checkIndex, isOver, change);


                var difference = change/100;
                getArtistData(parlay[checkIndex], isOver, difference, pointsFinal, overAlready);


                    idString = JSON.stringify(data.Responses.pointsById[1].id);
                    idLength = idString.length;
                    idFinal = idString.slice(6, idLength - 2);
    
                    pointsString = JSON.stringify(data.Responses.pointsById[1].playlistPoints);
                    pointsLength = pointsString.length;
                    pointsFinal = pointsString.slice(6, pointsLength - 2);
    
                    for (let i = 0; i < 2; i++) {
                    
                        idCheck = parlay[i].id;
                        if (idFinal == idCheck) {
    
                            checkIndex = i;
    
                        }
    
                    }
    
                    isOver = parlay[checkIndex].isOver;
    
                    var change = Number(pointsFinal) - Number(parlay[checkIndex].threshold)
    
                    console.log(parlay[checkIndex].id, isOver, change)
    
                    finalItem = true;

                    var difference = change/100
                    getArtistData(parlay[checkIndex], isOver, difference, pointsFinal, overAlready);

    
    }})};


    // PARLAY LENGTH OF THREE

    if (betLength == 3) {
        var params = {
            RequestItems: {
            'pointsById': {
                Keys: [
                {'id': {S: String(parlay[0].id)}},
                {'id': {S: String(parlay[1].id)}},
                {'id': {S: String(parlay[2].id)}},
                ],
                ProjectionExpression: 'id, playlistPoints'
            }
            }
        };
        
        ddb.batchGetItem(params, function(err, data) {
            if (err) {
            console.log("Error", err);
            } else {

                console.log(data.Responses)
                idString = JSON.stringify(data.Responses.pointsById[0].id);
                idLength = idString.length;
                idFinal = idString.slice(6, idLength - 2);

                pointsString = JSON.stringify(data.Responses.pointsById[0].playlistPoints);
                pointsLength = pointsString.length;
                pointsFinal = pointsString.slice(6, pointsLength - 2);

                for (let i = 0; i < 3; i++) {
                
                    idCheck = parlay[i].id;
                    if (idFinal == idCheck) {

                        checkIndex = i;

                    }

                }



                isOver = parlay[checkIndex].isOver;

                var change = Number(pointsFinal) - Number(parlay[checkIndex].threshold)

                console.log("CHANGE CHANGE CHANGE CHANGE: " + pointsFinal + " MINUS " + parlay[checkIndex].threshold + " = " + change)

                var difference = change/100
                getArtistData(parlay[checkIndex], isOver, difference, pointsFinal, overAlready);

                idString = JSON.stringify(data.Responses.pointsById[1].id);
                idLength = idString.length;
                idFinal = idString.slice(6, idLength - 2);

                pointsString = JSON.stringify(data.Responses.pointsById[1].playlistPoints);
                pointsLength = pointsString.length;
                pointsFinal = pointsString.slice(6, pointsLength - 2);

                for (let i = 0; i < 3; i++) {
                
                    idCheck = parlay[i].id;
                    if (idFinal == idCheck) {

                        checkIndex = i;

                    }

                }

                isOver = parlay[checkIndex].isOver;

                var change = Number(pointsFinal) - Number(parlay[checkIndex].threshold)

                console.log("CHANGE CHANGE CHANGE CHANGE: " + pointsFinal + " MINUS " + parlay[checkIndex].threshold + " = " + change)


                difference = change/100
                getArtistData(parlay[checkIndex], isOver, difference, pointsFinal, overAlready);




                idString = JSON.stringify(data.Responses.pointsById[2].id);
                idLength = idString.length;
                idFinal = idString.slice(6, idLength - 2);

                pointsString = JSON.stringify(data.Responses.pointsById[2].playlistPoints);
                pointsLength = pointsString.length;
                pointsFinal = pointsString.slice(6, pointsLength - 2);

                for (let i = 0; i < 3; i++) {
                
                    idCheck = parlay[i].id;
                    if (idFinal == idCheck) {

                        checkIndex = i;

                    }

                }

                isOver = parlay[checkIndex].isOver;

                var change = Number(pointsFinal) - Number(parlay[checkIndex].threshold)

                console.log("CHANGE CHANGE CHANGE CHANGE: " + pointsFinal + " MINUS " + parlay[checkIndex].threshold + " = " + change)
                var difference = change/100;

                finalItem = true;
                getArtistData(parlay[checkIndex], isOver, difference, pointsFinal, overAlready);


            };
            });

    }

    // PARLAY LENGTH OF 4

    if (betLength == 4) {
        var params = {
            RequestItems: {
            'pointsById': {
                Keys: [
                {'id': {S: String(parlay[0].id)}},
                {'id': {S: String(parlay[1].id)}},
                {'id': {S: String(parlay[2].id)}},
                {'id': {S: String(parlay[3].id)}},
                ],
                ProjectionExpression: 'id, playlistPoints'
            }
            }
        };
        
        ddb.batchGetItem(params, function(err, data) {
            if (err) {
            console.log("Error", err);
            } else {

                idString = JSON.stringify(data.Responses.pointsById[0].id);
                idLength = idString.length;
                idFinal = idString.slice(6, idLength - 2);

                pointsString = JSON.stringify(data.Responses.pointsById[0].playlistPoints);
                pointsLength = pointsString.length;
                pointsFinal = pointsString.slice(6, pointsLength - 2);

                for (let i = 0; i < 4; i++) {
                
                    idCheck = parlay[i].id;
                    if (idFinal == idCheck) {

                        checkIndex = i;

                    }

                }

                isOver = parlay[checkIndex].isOver;
    
                var change = Number(pointsFinal) - Number(parlay[checkIndex].threshold)

                console.log(parlay[checkIndex].id, isOver, change)


                var difference = change/100
                getArtistData(parlay[checkIndex], isOver, difference, pointsFinal, overAlready);



                    idString = JSON.stringify(data.Responses.pointsById[1].id);
                    idLength = idString.length;
                    idFinal = idString.slice(6, idLength - 2);
    
                    pointsString = JSON.stringify(data.Responses.pointsById[1].playlistPoints);
                    pointsLength = pointsString.length;
                    pointsFinal = pointsString.slice(6, pointsLength - 2);
    
                    for (let i = 0; i < 4; i++) {
                    
                        idCheck = parlay[i].id;
                        if (idFinal == idCheck) {
    
                            checkIndex = i;
    
                        }
    
                    }
    
                    isOver = parlay[checkIndex].isOver;
    
                    var change = Number(pointsFinal) - Number(parlay[checkIndex].threshold)
    
                    console.log(parlay[checkIndex].id, isOver, change)
    
                    var difference = change/100
                    getArtistData(parlay[checkIndex], isOver, difference, pointsFinal, overAlready);


                    idString = JSON.stringify(data.Responses.pointsById[2].id);
                    idLength = idString.length;
                    idFinal = idString.slice(6, idLength - 2);
    
                    pointsString = JSON.stringify(data.Responses.pointsById[2].playlistPoints);
                    pointsLength = pointsString.length;
                    pointsFinal = pointsString.slice(6, pointsLength - 2);
    
                    for (let i = 0; i < 4; i++) {
                    
                        idCheck = parlay[i].id;
                        if (idFinal == idCheck) {
    
                            checkIndex = i;
    
                        }
    
                    }
    
                    isOver = parlay[checkIndex].isOver;
    
                    var change = Number(pointsFinal) - Number(parlay[checkIndex].threshold)
    
                    console.log(parlay[checkIndex].id, isOver, change)
    
                    var difference = change/100
                    getArtistData(parlay[checkIndex], isOver, difference, pointsFinal, overAlready);    




                    idString = JSON.stringify(data.Responses.pointsById[3].id);
                    idLength = idString.length;
                    idFinal = idString.slice(6, idLength - 2);
    
                    pointsString = JSON.stringify(data.Responses.pointsById[3].playlistPoints);
                    pointsLength = pointsString.length;
                    pointsFinal = pointsString.slice(6, pointsLength - 2);
    
                    for (let i = 0; i < 4; i++) {
                    
                        idCheck = parlay[i].id;
                        if (idFinal == idCheck) {
    
                            checkIndex = i;
    
                        }
    
                    }
    
                    isOver = parlay[checkIndex].isOver;
    
                    var change = Number(pointsFinal) - Number(parlay[checkIndex].threshold)
                    console.log(pointsFinal, parlay[checkIndex].threshold)
    
                    finalItem = true;

                    var difference = change/100

                    getArtistData(parlay[checkIndex], isOver, difference, pointsFinal, overAlready);



    }})};

}



async function getArtistData (parlayThing, isOver, currentChange, currentScore, past) {

    // supposed to fetch the artist data (now stored in activeBets table instead)


        artistName = parlayThing["name"].split('_').join(' ');
        artistPic = parlayThing["image"];
        artistGenre = parlayThing["genre"];
        var veryStrange = currentChange;

        console.log(currentChange)
        var color = 'white';
        
        if (isOver == true) {
            console.log(currentChange)
            var guess = 'Over'
            if (currentChange > 0) {
                color = 'green'
                border = 'greenBorder'
            }
            if (currentChange < 0) {
                color = 'red'
                border = 'redBorder'
            }
            if (currentChange = 0) {
                color = 'white'
            }
        } 
        console.log(currentChange)
        if (isOver == false) {
            guess = 'Under'
            if (currentChange > 0) {
                color = 'red'
                border = 'redBorder'
            }
            if (currentChange < 0) {
                color = 'green'
                border = 'greenBorder'
            }
            if (currentChange = 0) {
                color = 'white'
            }
        }

        arrow = ''
        if (veryStrange > 0) {
            arrow = "src='Images/up-arrow.png'"
        } 
        if (veryStrange < 0) {
            arrow = "src='Images/down-arrow.png'"
        }
        console.log(parlayThing)

        // Generate Artist Thingy

        let score = (currentScore/100).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

        if (past == true) {

            var htmlString = `
                    <img src='${artistPic}' class='artistPic'>
                    <div class='selectionDetails'>
                        <div class='artistName'><b>${artistName}</b></div>
                        <div class='artistGenre'>${artistGenre}</div>
                        <div class='artistGenre' style='font-weight: 100; margin-top: 10px;'>Current Score: ${score}</div>
                    </div>

                    <div class='guess ${color}'>
                        ${guess}
                    </div>
                    <div class='middleThing'>
                        <div class='line'></div>
                    </div>
                    <div class='currentStanding'>
                        <div class='standingTitle'>Final Standing</div>
                        <div class='movement'>
                            <img style='height: 22.5px;' ${arrow}>
                            <b id='change'>${veryStrange}</b> Points
                        </div>
                    </div>
            `

            const parent = document.getElementById('betList');

            let col = document.createElement("div");
            col.className = `listItem ${border}`
            col.innerHTML= htmlString;
    
            parent.appendChild(col);

        } else {

        var htmlString = `
                <img src='${artistPic}' class='artistPic'>
                <div class='selectionDetails'>
                    <div class='artistName'><b>${artistName}</b></div>
                    <div class='artistGenre'>${artistGenre}</div>
                    <div class='artistGenre' style='font-weight: 100; margin-top: 10px;'>Current Score: ${score}</div>
                </div>

                <div class='guess ${color}'>
                    ${guess}
                </div>
                <div class='middleThing'>
                    <div class='line'></div>
                </div>
                <div class='currentStanding'>
                    <div class='standingTitle'>Current Standing</div>
                    <div class='movement'>
                        <img style='height: 22.5px;' ${arrow}>
                        <b id='change'>${veryStrange}</b> Points
                    </div>
                </div>
        `

        const parent = document.getElementById('betList');

        let col = document.createElement("div");
        col.className = 'listItem'
        col.innerHTML= htmlString;

        parent.appendChild(col);

        }

        if (finalItem == true) {

            document.getElementById('betBox').classList.remove('invisible')
            document.getElementById('animation').classList.add('invisible')
            document.getElementById('pageNumber').innerHTML = `${page+1}/${testDigit}`;


            console.log("TEST: " + testDigit)
            if (testDigit < 2) {
                document.getElementById('arrow-right').classList.add('invisible');
                document.getElementById('pageNumber').classList.add('invisible');
            }

        }

        if (change > 0) {
            document.getElementById("change").innerHTML = String(change).substring(1)
        } 
        if (change < 0) {
            document.getElementById("change").innerHTML = String(change).substring(1)
        }
        
    
}


function makeWagerObject(wagerItem, number, status) {

    wagerString = JSON.stringify(wagerItem);
    wagerLength = wagerString.length;
    wager = wagerString.slice(6, wagerLength - 2);

    console.log("WAGER #: " + number)

    if (wager != "null") {

        let endIndexId = wager.indexOf("?name=");
        let endIndexName = wager.indexOf("&image=");
        let endIndexImage = wager.indexOf("&genre=");
        let endIndexGenre = wager.indexOf("&ou=");
        let endIndexOu = wager.indexOf("&proj=");
        console.log(endIndexId, endIndexName, endIndexImage, endIndexGenre, endIndexOu, wagerLength)

        let artistId = wager.slice(0, endIndexId);
        let artistName = wager.slice(endIndexId + 6, endIndexName);
        let artistImage = wager.slice(endIndexName + 7, endIndexImage);
        let artistGenre = wager.slice(endIndexImage + 7, endIndexGenre);
        let overUnder = wager.slice(endIndexGenre + 4, endIndexOu);
        
        // ChatGPT code
        const regex = /proj=(\d+)/;
        const match = wager.match(regex);

        if (match) {
            var projValue = match[1];
        }

        if (overUnder == "over") {
            over = true;
        } else { over = false };

        wagerObject = { id: artistId, isOver: over, threshold: Number(projValue), name: artistName, image: artistImage, genre: artistGenre }
        parlayLength++;

        if (status === true) {
            console.log('pushed')
            parlayObject[number].push(wagerObject)
        }
        if (status === false) {
            completedObject[number].push(wagerObject)
        }

    } else { return; }

}

async function nextBet (length, object, todayDate, pageNumber) {

    testDigit = 0;

    console.log(length)


        parlayLength = 0;

        console.log(object)
        // the 'object' is every one of the user's bets, regardless of if its still active


        // Complete Date variable
        dateString = JSON.stringify(object.Items[pageNumber].completeDate);
        dateLength = dateString.length;
        date = dateString.slice(6, dateLength - 2);

        const finishDate = new Date(String(date)); // create a new Date object from the input string
        console.log("Finish date: " + finishDate)

        const today = new Date(String(todayDate));
        console.log("Today: " + today)


        // Winning Amount
        winningsString = JSON.stringify(object.Items[pageNumber].winningAmount);
        winningsLength = winningsString.length;
        winnings = winningsString.slice(6, winningsLength - 2);

        // Entry Amount
        entryString = JSON.stringify(object.Items[pageNumber].entryAmount);
        entryLength = entryString.length;
        entry = entryString.slice(6, entryLength - 2);


    checkResults(email, winnings, parlayObject[pageNumber], entry, length, testDigit)

}