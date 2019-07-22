let builder = require('role.builder');

let claimer = module.exports;
claimer.run = function(creep) {
    let spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];
    if(creep.memory.targetRoom) {
        if(creep.room.name == creep.memory.targetRoom) {
            let c = creep.claimController(creep.room.controller);
            // console.log(creep.name + ": " + c);
            if(c != OK) {
                creep.moveTo(creep.room.controller);
            } else {
                delete creep.memory.targetRoom;
            }
        } else {
            creep.moveTo(creep.pos.findClosestByPath(creep.room.findExitTo(creep.memory.targetRoom)));
        }
    } else {
        builder.run(creep);
    }
};
claimer.base = [TOUGH,CLAIM,WORK,WORK,MOVE,MOVE,MOVE];
claimer.add = {
    0: { type: [MOVE], amt: 4},
    1: { type: [TOUGH], amt: 4}
};