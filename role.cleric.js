let cleric = module.exports;
cleric.run = function(creep) {
    let spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];
    
    if(!creep.memory.target) {
        creep.moveTo(spawn1.room.controller);
    } else {
        let target = Game.creeps[target];
        if(target) {
            if(target.hits < target.hitsMax) {
                creep.heal(target);
            }
            creep.moveTo(target);
        } else {
            if(creep.memory.target) delete creep.memory.target;
            creep.moveTo(spawn1.room.controller);
        }
    }
};
cleric.base = [HEAL,MOVE];
cleric.add = {
    0: { type: HEAL, amt: 4},
    1: { type: MOVE, amt: 4}
};