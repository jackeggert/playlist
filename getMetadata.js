async function getToken () {
  
    getToken = await fetch("https://api.chartmetric.com/api/token", {
        body: '{"refreshtoken":"fywqwAn9WkiGvg9BvldOBuNTuX8reuvF9Y2yA9urudxvQLmSTx3RI0Pjyf2rKcsM"}',
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      })
      .then( res => res.json() )
      .then( data => {
        token = data.token
        getCharts(token)})

}

async function getCharts (accessKey) {

    var today = new Date();
    var dd1 = String(today.getDate()).padStart(2, '0');
    var mm1 = String(today.getMonth() + 1).padStart(2, '0'); 
    var yy1 = String(today.getFullYear()).padStart(2, '0')

    today = yy1 + '-' + mm1 + '-' + dd1;


    fetch("https://api.chartmetric.com/api/charts/spotify/artists?date="+today+"&interval=daily&type=monthly_listeners", {
        headers: {
          Authorization: "Bearer " + String(accessKey)
        }
    })
    .then( res => res.json() )
    .then( data => {

        console.log(data)
        idArray = [];
        charts = data; 
        chartLength = charts['obj']['length']
        
        for (i = 0; i < 10; i++) {
          idArray.push(charts['obj']['data'][i]['id']);
        }
        console.log(idArray);

        getMetadata(idArray, token);
    })

};

getToken();