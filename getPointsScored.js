scoreArray = [];
async function getPointsScored (i) {

    AWS.config.update({region: 'us-west-2'});

    // Create the DynamoDB service object
    var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    rank = String(i);

    var params = {
    TableName: 'pointsScored',
    Key: {
        'rank': {N: rank}
    },
    ProjectionExpression: 'currentRank, id, playlistPoints'
    };

    // Call DynamoDB to read the item from the table
    ddb.getItem(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {

            pointsString = JSON.stringify(data.Item.playlistPoints);
            pointsLength = pointsString.length;
            pointsFinal = pointsString.slice(6, pointsLength - 2);


            currentRankString = JSON.stringify(data.Item.currentRank);
            currentRankLength = currentRankString.length;
            currentRank = currentRankString.slice(6, currentRankLength - 2);


            const pointsObject = { currentRank: currentRank, points: pointsFinal };
            scoreArray.push(pointsObject);

        }
    });

}