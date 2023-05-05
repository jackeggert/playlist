function updateBalances() {

    updatedUserBalance = Number(Number(balanceFinal) - Number(wagerAmount));

    AWS.config.update({region: 'us-west-2'});

    // Create the DynamoDB service object
    var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    var params = {
        TableName: 'userBalances',
        Item: {
            'email' : {S: userEmail},
            'username' : {S: String(userid)},
            'balance' : {N: String(updatedUserBalance)}
        }
    }

    ddb.putItem(params, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data);
        }
        });
}
