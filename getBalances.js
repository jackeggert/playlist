function getBalances(userEmail) {


    AWS.config.update({region: 'us-west-2'});

    // Create the DynamoDB service object
    var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    var params = {
    TableName: 'userBalances',
    Key: {
        'email': {S: userEmail}
    },
    ProjectionExpression: 'balance'
    };

    // Call DynamoDB to read the item from the table
    ddb.getItem(params, function(err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        //console.log("Success", data.Item);
        balanceString = JSON.stringify(data.Item.balance)
        balanceLength = balanceString.length
        balanceFinal = Number(balanceString.slice(6,balanceLength-2));

        };
    })}