//data names from csv 
//ID,name,category,main_category,currency,deadline,goal,launched,pledged,state,
//backers,country,usd pledged,usd_pledged_real,usd_goal_real
var originalData; 
   
d3.csv("top500.csv", function(datum){ 
        return {
            //"ID": +datum["ID"],
            "name": datum["name"],
            //"category": datum["category"],
            "main_category": datum["main_category"],
            //"currency": datum["currency"],
            "deadline": new Date(datum["deadline"]),
            "goal": +datum["goal"],
            "launched": new Date(datum["launched"]),
            "year": +datum["year"],
            "launched2": new Date(datum["launched2"]),
            "pledged": +datum["pledged"],
            "state": datum["state"],
            "backers": +datum["backers"],
            "country": datum["country"],
            "usd_pledged": +datum["usd pledged"],
            "pledged_real": +datum["usd_pledged_real"],
            "goal_real": +datum["usd_goal_real"],
            "data_diff_days": +datum["data_diff_days"],
        };
    }, function(data) {

        var selection = function(){
            //update the others by selection on the other graphs

            radar.update(data, checkBoxes.selected);
            radar.update(data, radioBut.selected);
            heatMap.update(data, radar.selected);
            scatter.update(data, radar.selected);
            parallel.update(data, radar.selected);
        }
        
            
            //var radar = new RadarChart(d3.select("container"), data, selection);
            //var heatMap = new HeatMap(d3.select("container"), data, selection);
            var scatter = new ScatterChart(d3.select("container"), data, selection);
            var parallel = new ParallelPlots(d3.select("container"), data, selection);
            var myd = ["2017", "2015", "2016"]
            makeRadar(myd); 
            originalData = data;

});

function updateParallel( y ) {
    console.log("IN parallel");
    console.log(Interaction_Selected_Data);
    Interaction_Selected_Data = Interaction_Selected_Data.filter(word => y.indexOf(word.year.toString()) > -1);
    console.log(Interaction_Selected_Data);
    ctx.clearRect(0,0,width,height);
    render(Interaction_Selected_Data);
    Interaction_Selected_Data = originalData;
}

function checkBoxFunction(){
    // var years = ["2014","2015", "2016", "2017"],
    var years = ["2015", "2016", "2017"],

        checkedBoxes = [],
        uncheckedBoxes = [];
    years.forEach(element => {
        var string = "check" + element;
        if(document.getElementById(string).checked){
            checkedBoxes.push(element);
        }
        else{
            uncheckedBoxes.push(element);
        }
    });
    scatterUpdate(checkedBoxes, uncheckedBoxes);

    console.log("test asdfj")

    d3.select(".radarChart").selectAll('*').remove();
    makeRadar(checkedBoxes);

    updateParallel( checkedBoxes )    
}