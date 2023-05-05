const { getChart } = require('billboard-top-100');
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});

function getArtists () {

    return new Promise(function(resolve, reject) {
        setTimeout(function() {

            getChart('artist-100', '', (err, chart) => {
                if (err) console.log(err);
                resolve(chart);
            });

        }, 0);
    });
}

async function balls (event, context) {

    var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    let chart = await getArtists();

    for (let i = 0; i < 100; i++) {

        artistName = String(chart.songs[i].artist);
        artistImage = String(chart.songs[i].cover);
        artistRank = String(chart.songs[i].rank);

        var params = {
            TableName: 'popularCharts',
            Item: {
              'artistName' : {S: artistName},
              'artistImage' : {S: artistImage},
              'rank' : {N: artistRank}
            }
        };

        ddb.putItem(params, function(err, data) {
            if (err) {
                console.log("Error", err);
            } else {
              console.log("Success", data);
            }
        });

    }

    return "Successfully updated DynamoDB table: popularCharts";

}
balls();