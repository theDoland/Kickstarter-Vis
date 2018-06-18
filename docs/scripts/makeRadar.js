
var testdata = {}; 

function makeRadar(checkBoxes) {

  testdata = {};
  d3.csv("RadarData.csv", function (d) {

    // if (checkBoxes.length == 0)
    //   return;
      


     console.log(checkBoxes.indexOf(d.year));  
      if (checkBoxes.indexOf(d.year) > -1){
        //console.log(checkBoxes); 
        //console.log("test"); 
        //console.log(d); 
        if (testdata[d.category] === undefined) { 
           testdata[d.category] = 0;
        }            

        // adds all the annual rate with a certain department name
        testdata[d.category] += parseInt(d.usd_pledged);
        return d;
      }
  }, function(error, data) {

    // if (data.length == 0)
    //   return;
    console.log("In make radar"); 
    console.log(testdata);
    console.log(data);
    //console.log(data[0].usd_pledged);

  //////////////////////////////////////////////////////////////
  //////////////////////// Set-Up //////////////////////////////
  //////////////////////////////////////////////////////////////

  var margin = { top: 50, right: 80, bottom: 50, left: 80 },
    width = Math.min(700, window.innerWidth / 4) - margin.left - margin.right,
    height = Math.min(width, window.innerHeight - margin.top - margin.bottom);

  //////////////////////////////////////////////////////////////
  ////////////////////////// Data //////////////////////////////
  //////////////////////////////////////////////////////////////

  // var Mortality = parseInt(data[0].Mortalitynationalcomparison); 
  // var Safety = parseInt(data[0].Safetyofcarenationalcomparison)
  // var Readmission = parseInt(data[0].Readmissionnationalcomparison)
  // var Patient = parseInt(data[0].Patientexperiencenationalcomparison)
  // var Effectivesness = parseInt(data[0].Effectivenessofcarenationalcomparison)

//    console.log(testdata.Art);
  var art = parseInt(testdata.Art);
  var comics = parseInt(testdata.Comics);
  var crafts = parseInt(testdata.Crafts);
  var design = parseInt(testdata.Design);
  var fashion = parseInt(testdata.Fashion);
  var film_video = parseInt(testdata.FilmVideo);
  var food = parseInt(testdata.Food);
  var game = parseInt(testdata.Games);
  var journalism = parseInt(testdata.Journalism);
  var music = parseInt(testdata.Music);
  var photo = parseInt(testdata.Photography);
  var publishing = parseInt(testdata.Publishing);
  var tech = parseInt(testdata.Technology);
  var theater = parseInt(testdata.Theater);


  var data = [
    { name: 'Allocated budget',
      axes: [
        {axis: 'Art', value: art},
        {axis: 'Comics', value: comics},
        {axis: 'Crafts', value: crafts},
        {axis: 'Design', value: design},
        {axis: 'Fashion', value: fashion},
        {axis: 'FilmVideo', value: film_video},
        {axis: 'Food', value: food},
        {axis: 'Games', value: game},
        {axis: 'Journalism', value: journalism},
        {axis: 'Music', value: music},
        {axis: 'Photography', value: photo},
        {axis: 'Publishing', value: publishing},
        {axis: 'Technology', value: tech},
        {axis: 'Theater', value: theater}
      ]
    }
  ];

  //////////////////////////////////////////////////////////////
  ////// First example /////////////////////////////////////////
  ///// (not so much options) //////////////////////////////////
  //////////////////////////////////////////////////////////////
  var radarChartOptions = {
    w: 290,
    h: 350,
    margin: margin,
    levels: 3,
    roundStrokes: true,
    color: d3.scaleOrdinal().range(["#26AF32", "#762712"]),
    format: '.0f'
  };

  // Draw the chart, get a reference the created svg element :
  let svg_radar1 = RadarChart(".radarChart", data, radarChartOptions);

  })
}

//makeRadar(); 
