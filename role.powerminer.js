let powerminer = module.exports;
powerminer.run = function(creep) {
    let spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];

    let source = Game.getObjectById(Memory.roomData[spawn1.room.name].power);
    let clerics = _.filter(Game.creeps, (c) => (c.memory.role == "cleric"));
    let assignedCleric = _.filter(clerics, (c) => (c.memory.target && c.memory.target == creep.name));
    if(!assignedCleric) {
        let freeClerics = _.filter(clerics, (c) => (!c.memory.target));
        if(freeClerics) {
            freeClerics[0].memory.target = creep.name;
        }
    } else if(source && assignedCleric) { 
        if(creep.hits > 0.33 * creep.hitsMax) {
            let result = creep.attack(source);
            if(result == ERR_NOT_IN_RANGE) {
                if(creep.moveTo(source) == ERR_NO_PATH) {
                }
            }
        }
    }
};
powerminer.base = [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK];
powerminer.add = {
};