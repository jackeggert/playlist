let accessToken;

getToken = async () => {

    const settings = {
        method: 'POST',
        body: '{"refreshtoken":"qynJbd9erEHYvh5WuA7zDtbRyxaVAeyopnrAyvn4KdLlKQmDVhcqrHJEf9gR4dTS"}',
        headers: {
          "Content-Type": "application/json"
        }
    };

    fetch('https://u6dqtp7h3vrd5tmd2kzcyrevfu0oterb.lambda-url.us-west-2.on.aws/?url=https://api.chartmetric.com/api/token', settings)
    .then(response => response.json())
    .then(data => {
      // do something with the data
      accessToken = data.token;
    })
    .catch(error => {
      // handle any errors
      console.error(error);
    });

}

function search (query) {

    //document.getElementById('loading').classList.remove('invisible')

    const newQuery = query.split(' ').join('+')
    console.log(newQuery)
    console.log(searchInProgress)
    if (query) {
    fetch(`https://so3nhtsc3qsg4m6vbk7oc42vbu0lhnps.lambda-url.us-west-2.on.aws/?q=${newQuery}&accessKey=${accessToken}`)
    .then( response => response.json())
    .then( data => {
        // searchInProgress = false;
        topResults = data['obj']['artists'];
        generateCards(topResults)
    })} else {
        generateCards([])
    }

}