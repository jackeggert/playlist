function submitEntry(date) {
    var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    var params = {
    TableName: 'userData',
    Key: {
        'email': {S: userEmail}
    },
    ProjectionExpression: 'overUnderPlaced'
    };

    // Call DynamoDB to read the item from the table
    ddb.getItem(params, function(err, data) {
    if (err) {
        console.log(err) }
    else {
        numberString = JSON.stringify(data.Item.overUnderPlaced)
        numberLength = numberString.length
        numberBet = (numberString.slice(6,numberLength-2))
        
        finalSubmit(date, numberBet, userEmail);
        updateNumber(userEmail, numberBet);
    }})
}

function updateNumber(email, number) {
    var ddb2 = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    var newNumber = (Number(number) + 1)
    var params2 = {
        TableName: 'userData',
        Key: {
            email: { S : email },
        },               
        UpdateExpression: 'SET #overUnderPlaced =:val1',
        ExpressionAttributeNames: {
            '#overUnderPlaced': 'overUnderPlaced' //COLUMN NAME       
        },
        ExpressionAttributeValues: {
            ':val1': {
                'N': String(newNumber)
            },
        }
    };


    ddb2.updateItem(params2, function(err, data) {
        if (err) console.log(err);
        else console.log(data);
    });
}



async function finalSubmit(date, numberBet, userEmail) {


        updatedUserBalance = Number(balanceFinal - wagerAmount);

        AWS.config.update({region: 'us-west-2'});

        // Create the DynamoDB service object
        var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
        
        if (parlayLength == 2) {
            var params = {
            TableName: 'activeOverUnderBets',
            Item: {
                'completeDate' : {S: date},
                'email' : {S: userEmail},
                'entryAmount' : {N: String(wagerAmount)},
                'winningAmount' : {N: String(winAmount)},
                'wager1' : {S: parlayArray[0]},
                'wager2' : {S: parlayArray[1]},
                'wager3' : {S: 'null'},
                'wager4' : {S: 'null'},
                'betNumber' : {S: String(numberBet)}
            }
            }};

        if (parlayLength == 3) {
            var params = {
            TableName: 'activeOverUnderBets',
            Item: {
                'completeDate' : {S: date},
                'email' : {S: userEmail},
                'entryAmount' : {N: String(wagerAmount)},
                'winningAmount' : {N: String(winAmount)},
                'wager1' : {S: parlayArray[0]},
                'wager2' : {S: parlayArray[1]},
                'wager3' : {S: parlayArray[2]},
                'wager4' : {S: 'null'},
                'betNumber' : {S: String(numberBet)}
            }
            }};

        if (parlayLength == 4) {
            var params = {
            TableName: 'activeOverUnderBets',
            Item: {
                'completeDate' : {S: date},
                'email' : {S: userEmail},
                'entryAmount' : {N: String(wagerAmount)},
                'winningAmount' : {N: String(winAmount)},
                'wager1' : {S: parlayArray[0]},
                'wager2' : {S: parlayArray[1]},
                'wager3' : {S: parlayArray[2]},
                'wager4' : {S: parlayArray[3]},
                'betNumber' : {S: String(numberBet)}
            }
            }};
        
        // Call DynamoDB to add the item to the table
        ddb.putItem(params, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data);
            finalizeBetPlaced();
        }
        })
        
    }