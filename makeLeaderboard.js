function makeLeaderboard () {

    // Set the region
    AWS.config.update({region: 'us-west-2'});

    // Create the DynamoDB service object
    const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    // Set the parameters for the query
    const params = {
        TableName: 'userBalances',
        ProjectionExpression: 'email, balance, username'
    };

    // Query the DynamoDB table
    ddb.scan(params, function(err, data) {
        if (err) {
            console.log('Error', err);
        } else {
            // Sort the items by score
            const items = data.Items.sort((a, b) => b.balance.N - a.balance.N);

            // Create a list of the scores and the associated emails
            const scoresAndEmails = items.map(item => ({
                score: parseInt(item.balance.N),
                email: item.email.S,
                username: item.username.S
            }));

            logScores(scoresAndEmails);
            generateRestOfRanks(scoresAndEmails);

        }
    });

}