counter = 0;
function getCharts() {

return new Promise(function(resolve, reject) {
setTimeout(function() {
for (let i = 1; i < 150; i++) {

    rank = String(i);
    AWS.config.update({region: 'us-west-2'});

    // Create the DynamoDB service object
    var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    var params = {
    TableName: 'popularCharts',
    Key: {
        'rank': {N: rank}
    },
    ProjectionExpression: 'artistName, artistImage'
    };

    // Call DynamoDB to read the item from the table
    ddb.getItem(params, function(err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        //console.log("Success", data.Item);
        artistImageString = JSON.stringify(data.Item.artistImage)
        artistImageLength = artistImageString.length
        artistImage = artistImageString.slice(6,artistImageLength-2)
        imageArrayPopular.push(artistImage);

        artistNameString = JSON.stringify(data.Item.artistName)
        artistNameLength = artistNameString.length
        artistName = artistNameString.slice(6,artistNameLength-2)
        artistArrayPopular.push(artistName);}
        counter++;
    });
}

resolve({ artistArrayPopular, imageArrayPopular });
}, 0);
});
}