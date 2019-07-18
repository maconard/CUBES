var claimer = {
    run: function(creep) {
        var spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];
        if(creep.room.name == creep.memory.targetRoom) {
            var c = creep.claimController(creep.room.controller);
            // console.log(creep.name + ": " + c);
            if(c != OK) {
                creep.moveTo(creep.room.controller);
            }
        } else {
            creep.moveTo(creep.pos.findClosestByPath(creep.room.findExitTo(creep.memory.targetRoom)));
        }
    },
    base: [TOUGH,CLAIM,CLAIM,MOVE,MOVE,MOVE],
    add: {
        0: { type: [MOVE], amt: 4},
        1: { type: [TOUGH], amt: 4}
    }
}

module.exports = claimer;