let harvester = module.exports;
harvester.run = function(creep) {
    let spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];

    // if(!creep.memory.source) {
    //     let sources = spawn.room.find(FIND_SOURCES);
    //     sources.forEach(function(s) {
    //         if(!Memory.roomData[creep.room.name].sourceData) Memory.roomData[creep.room.name].sourceData = {};
    //         if(!Memory.roomData[creep.room.name].sourceData[s.id]) Memory.roomData[creep.room.name].sourceData[s.id] = {count: 0};

    //     });
    // }

    if(creep.carry.energy < creep.carryCapacity || creep.carryCapacity == 0) {
        // creep.say("harvesting");
        let source = creep.pos.findClosestByPath(FIND_SOURCES, {
            filter: (s) => {
                return (s.energy > 0);
            }});
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
            if(creep.moveTo(source) == ERR_NO_PATH) {
            }
        }
    } else { //depositing energy
        // creep.say("depositing");
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => (
                                (((s.structureType == STRUCTURE_CONTAINER ||  
                                    s.structureType == STRUCTURE_STORAGE) && 
                                    s.store[RESOURCE_ENERGY] < s.storeCapacity) ||
                                    (s.structureType == STRUCTURE_EXTENSION &&
                                    s.energy < s.energyCapacity)) && 
                                    creep.pos.getRangeTo(s) < 30)});
        if(target) {
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        } else {
            if(creep.transfer(spawn1, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn1);
            }
        }
    }
};
harvester.base = [WORK,MOVE];
harvester.add = {
    0: { type: WORK, amt: 4},
    1: { type: MOVE, amt: 2}
};