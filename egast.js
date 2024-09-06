const fs = require('node:fs');

const file = 15 // any valid race number

async function getResults (){
    const responseForResults = await fetch('http://ergast.com/api/f1/2024/13/results.json') //possible api deprecation
    const raceResults = await responseForResults.json()
    const races = raceResults.MRData.RaceTable.Races
    for(const race of races){
        Object.values(race).map(item => {
            for(const it in item){
                console.log(it)
            }
        })
    }
}

async function getQualiData() {
        try {
        const url = `http://ergast.com/api/f1/2024/${file}/qualifying.json`;
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        const races = json.MRData.RaceTable.Races;

        for (const race of races) {
            const qualiResults = race.QualifyingResults
            const quali = qualiResults.map(item => ({
                "Name": item.Constructor.name,
                "Q1": item.Q1,
                "Q2": item.Q2 === undefined ? "Did not qualify" : item.Q2,
                "Q3": item.Q3 === undefined ? "Did not qualify" : item.Q3
            })
            )
            return quali
        }
    } catch (error) {
        console.error(error.message);
    }
}


async function getConstructorStanding() {
    try {
       const response = await fetch(`http://ergast.com/api/f1/2024/${file}/constructorStandings.json`)
        if (!response.ok) {
            throw new Error(`Response status: ${response.status} Results Status: ${responseForResults.status}`);
        }
        const qualiData = await getQualiData()
        const json = await response.json();


        json.MRData.StandingsTable.StandingsLists.map(item => {
            const round = item.round
            const constructors = item.ConstructorStandings
            const positions = Object.values(constructors)
                // .filter(item => item.Constructor.name === "Red Bull")
                .filter(item => item.Constructor)
                .flatMap(res => ({
                    "raceNo": round,
                    "name": res.Constructor.name,
                    "points": res.points,
                    "wins": res.wins,
                    "position": res.position,
                    "qualiResults": Object.values(qualiData).filter(item =>
                        item.Name === res.Constructor.name).flatMap(item => ({
                            "name": item.Name,
                            "Q1": item.Q1,
                            "Q2": item.Q2,
                            "Q3": item.Q3
                        }))
                    })
                )
                
                fs.writeFile(`./file${file}.json`, JSON.stringify(positions), err => {
                    if (err) {
                      console.error(err);
                    }
                  });
            })
        } catch (error) {
            console.log(error)
        }
}

getConstructorStanding()
// http://ergast.com/api/f1/2024/13/results.json average speed and total completion time
// http://ergast.com/api/f1/2024/13/constructorStandings.json
// http://ergast.com/api/f1/2024/13/qualifying.json q1 q2 q3
