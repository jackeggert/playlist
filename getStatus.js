function getStatus(userEmail) {


    AWS.config.update({region: 'us-west-2'});

    // Create the DynamoDB service object
    var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    var params = {
    TableName: 'isActiveBet',
    Key: {
        'email': {S: userEmail}
    },
    ProjectionExpression: 'isActive'
    };

    // Call DynamoDB to read the item from the table
    ddb.getItem(params, function(err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        //console.log("Success", data.Item);
        statusString = JSON.stringify(data.Item.isActive)
        statusLength = statusString.length
        statusFinal = Boolean(statusString.slice(6,statusLength-2) == "true");

        console.log(statusFinal)
        if (statusFinal == true) {
            document.getElementById('errorMsg').innerHTML = "YOU HAVE AN ACTIVE BET.";
        }


        };
    })}