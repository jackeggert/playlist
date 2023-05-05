const { getChart } = require('billboard-top-100');

artistArrayPopular = [];
imageArrayPopular = [];

getChart('artist-100', '', (err, chart) => {
    if (err) console.log(err);
    for (let i = 0; i < 100; i++) {
    artistArrayPopular.push(chart.songs[i].artist)
    imageArrayPopular.push(chart.songs[i].cover)
    }
    console.log("test 1: " + artistArrayPopular);
    return artistArrayPopular;
});
console.log("test 2: " +artistArrayPopular)