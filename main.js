tasks = [require('task.creeps'), require('task.towers'), 
         require('task.manage'), require('task.market'), require('task.visuals')];
garbage = require('task.garbage');
global.util = require('util');
visuals = tasks[4];
// delete Memory.roomData;
if(!Memory.roomData) Memory.roomData = {};
delete Memory.tickData;
Memory.tickData = { time: new Date().getTime() / 1000, ticks: 0, rate: "Calculating"};
let main = module.exports; 

main.loop = function() {
    let myRooms = _.values(Game.rooms);
    global.displays = [];
    myRooms.forEach(function(r) {
        try {
            let spawns = r.find(FIND_MY_SPAWNS)
            if(spawns.length == 0 || !r.controller.my) return;
            if(!Memory.roomData[r.name]) Memory.roomData[r.name] = { travelData: {}, sourceData: {} };
            if(!Memory.roomData[r.name].sourceData) Memory.roomData[r.name].sourceData = {};
            r.find(FIND_SOURCES).forEach(function(s) {
                if(!Memory.roomData[r.name].sourceData[s.id]) {
                    let c = PathFinder.search(s.pos,spawns[0].pos).path[0];
                    Memory.roomData[r.name].sourceData[s.id] = {
                        container: JSON.stringify({x:c.x,y:c.y,room:c.roomName}),
                        harvester: ""
                    }
                }
            });
            tasks.forEach(function(task) { 
                task.run(spawns); 
            });
            // global.displays.push("");
        } catch(e) {
            console.log("ERROR in ROOM " + r.name + ": " + e);
            console.log(e.stack); Game.notify(e.stack);
        }
    });
    
    let t = new Date().getTime() / 1000;
    Memory.tickData.ticks++;
    if(t >= Memory.tickData.time + 10) {
        Memory.tickData.rate = Math.round((Memory.tickData.ticks / (t - Memory.tickData.time)) * 1000.0) / 1000.0;
        Memory.tickData.ticks = 0;
        Memory.tickData.time = t;
    }
    global.displays.push("Average tick rate: " + Memory.tickData.rate + " ticks/s");
    
    visuals.global();
    garbage.run();
};