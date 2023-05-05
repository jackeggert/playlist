function getToken (id, isOver, change) {
  
    fetch("https://api.chartmetric.com/api/token", {
        body: '{"refreshtoken":"qynJbd9erEHYvh5WuA7zDtbRyxaVAeyopnrAyvn4KdLlKQmDVhcqrHJEf9gR4dTS"}',
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      })
      .then( res => res.json() )
      .then( data => {
        console.log(data)}

      )};

getToken();