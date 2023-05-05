songArray = [];
async function scan (i) {

    AWS.config.update({region: 'us-west-2'});

    // Create the DynamoDB service object
    var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    rank = String(i);

    var params = {
    TableName: 'popularCharts',
    FilterExpression: "rank = :test",
    // Define the expression attribute value, which are substitutes for the values you want to compare.
    ExpressionAttributeValues: {
      ":test": {N: rank},
    },
    ProjectionExpression: 'trackName, trackImage, trackArtist, projectedRank'
    };

    // Call DynamoDB to read the item from the table
    ddb.scan(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {

            artistImageString = JSON.stringify(data.Item.trackImage);
            artistImageLength = artistImageString.length;
            artistImage = artistImageString.slice(6, artistImageLength - 2);


            rankDisplayString = JSON.stringify(data.Item.rankingDisplay);
            rankDisplayLength = rankDisplayString.length;
            rankDisplay = rankDisplayString.slice(6, rankDisplayLength - 2);


            artistNameString = JSON.stringify(data.Item.trackName);
            artistNameLength = artistNameString.length;
            artistName = artistNameString.slice(6, artistNameLength - 2);


            artistGenreString = JSON.stringify(data.Item.trackArtist);
            artistGenreLength = artistGenreString.length;
            artistGenre = artistGenreString.slice(6, artistGenreLength - 2);


            projectedRankString = JSON.stringify(data.Item.projectedRank);
            projectedRankLength = projectedRankString.length;
            projectedRank = projectedRankString.slice(6, projectedRankLength - 2);


            const songObject = {title: artistName, artist: artistGenre, image: artistImage, projectedRank: projectedRank };
            songArray.push(songObject);

        }
    });

}