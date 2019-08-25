let harvester = module.exports;
harvester.run = function(creep) {
    let spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];

    if(creep.carryCapacity == 0 || creep.carry.energy < creep.carryCapacity) {
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
                        _.sum(s.store) < s.storeCapacity) ||
                        (s.structureType == STRUCTURE_EXTENSION &&
                        s.energy < s.energyCapacity)))
        });
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
    0: { type: WORK, amt: 5},
    1: { type: MOVE, amt: 5}
};