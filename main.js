tasks = [require('task.creeps'), require('task.towers'), 
         require('task.manage'), require('task.visuals')];
garbage = require('task.garbage');
global.util = require('util');
visuals = tasks[3];
// delete Memory.roomData;
if(!Memory.roomData) Memory.roomData = {};
let main = module.exports; 

main.loop = function() {
    var myRooms = _.values(Game.rooms);
    global.displays = [];
    myRooms.forEach(function(r) {
        try {
            var spawns = r.find(FIND_MY_SPAWNS)
            if(spawns.length == 0 || !r.controller.my) return;
            if(!Memory.roomData[r.name]) Memory.roomData[r.name] = { travelData: {}, sourceData: {} };
            if(!Memory.roomData[r.name].sourceData) Memory.roomData[r.name].sourceData = {};
            r.find(FIND_SOURCES).forEach(function(s) {
                if(!Memory.roomData[r.name].sourceData[s.id]) {
                    var c = PathFinder.search(s.pos,spawns[0].pos).path[0];
                    Memory.roomData[r.name].sourceData[s.id] = {
                        container: JSON.stringify({x:c.x,y:c.y,room:c.roomName}),
                        harvester: ""
                    }
                }
            });
            tasks.forEach(function(task) { 
                task.run(spawns); 
            });
            global.displays.push("");
        } catch(e) {
            console.log("ERROR in ROOM " + r.name + ": " + e);
            console.log(e.stack);
        }
    });
    visuals.global();
    garbage.run();
};