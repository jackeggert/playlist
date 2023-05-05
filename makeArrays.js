songArray = [];
async function makeArrays (i) {

    AWS.config.update({region: 'us-west-2'});

    // Create the DynamoDB service object
    var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    rank = String(i);

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
    });

}