let cleric = module.exports;
cleric.run = function(creep) {
    let spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];
    let source = Game.getObjectById(Memory.roomData[spawn1.room.name].power);
    if(!source) {
        let result = spawn1.recycleCreep(creep);
        if(result == ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn1);
        } else if(result == OK) {
            Game.notify("Cleric " + creep.name + " in room " + creep.room.name + " recycling because powerbank gone");
        }
        return;
    }

    if(!creep.memory.target) {
        let healTargets = spawn1.room.find(FIND_MY_CREEPS, {
            filter: (c) => (c.hits < c.hitsMax)});
        let target = creep.pos.findClosestByRange(healTargets);
        if(target) {
            creep.say("💉d");
            creep.heal(target);
            return;
        }
        creep.moveTo(source);
    } else {
        let target = Game.creeps[creep.memory.target];
        if(target) {
            if(target.hits < target.hitsMax) {
                creep.say("💉t");
                if(creep.heal(target) == ERR_NOT_IN_RANGE) {  
                    creep.moveTo(target);
                }
            } else {
                if(PathFinder.search(creep.pos,target.pos).path.length > 2) creep.moveTo(target);
            }
        } else {
            if(creep.memory.target) delete creep.memory.target;
            creep.moveTo(source);
        }
    }
};
cleric.base = [HEAL,HEAL,HEAL,HEAL,HEAL,MOVE];
cleric.add = {
    0: { type: HEAL, amt: 25},
    1: { type: MOVE, amt: 4}
};