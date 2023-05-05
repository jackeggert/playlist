var AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});

function submitEntry(date) {
    var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    userEmail = "jreggert@usc.edu"
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
        console.log(numberBet)
    }})
}

submitEntry("today");