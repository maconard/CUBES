const tasks = [require('task.creeps'), require('task.towers'), require('task.manage'), require('task.market'), require('task.power'), require('task.visuals')];
const garbage = require('task.garbage');
const visuals = tasks[5];
global.util = require('util');
global.util.setupRoomData();

const profiler = require('screeps-profiler');
// profiler.enable();

let main = module.exports; 
main.loop = function() {
    profiler.wrap(function() {
        let myRooms = _.values(Game.rooms);
        global.displays = [];
        myRooms.forEach(function(r) {
            let spawns = r.find(FIND_MY_SPAWNS)
            if(!r.controller || !r.controller.my || spawns.length == 0) return;
            global.util.initializeRoomData(spawns,r);

            tasks.forEach(function(task) { 
                try {
                    task.run(spawns); 
                } catch(e) {
                    let msg = "ERROR in TASK " + task.name + " for ROOM " + r.name + ": " + e;
                    console.log(msg); Game.notify(msg);
                    console.log(e.stack); Game.notify(e.stack);
                }
            });
        });
        global.util.processTickData();
        visuals.global();
        garbage.run();
    });
};