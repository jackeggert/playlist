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
        getStreams(token)})

}

async function getStreams (accessKey) {
  
    fetch("https://api.chartmetric.com/api/artist/3380/tracks?limit=1", {
        headers: {
          Authorization: "Bearer " + String(accessKey)
        }
      })
      .then( res => res.json() )
      .then( data => {
        console.log(data);
      
      })

}
getToken();