let courier = module.exports;
courier.run = function(creep) {
    let spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];
    if(creep.memory.working && creep.carry.energy == 0) {
        creep.memory.working = false;
    }
    if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
        creep.memory.working = true;
    }
    
    if(creep.memory.working) {//depositing energy
        // creep.say("supplying");
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => {
                    return (s.structureType == STRUCTURE_SPAWN || 
                        s.structureType == STRUCTURE_TOWER ||
                        s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity
                }
        });
        if(target) {
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            } 
            return;
        }

        let term = creep.room.terminal;
        if(term && _.sum(term.store) < 300000 && term.store[RESOURCE_ENERGY] < 10000) {
            if(creep.transfer(term, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(term);
            } 
            return;
        }

        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => {
                    return (s.structureType == STRUCTURE_STORAGE) 
                        && s.store[RESOURCE_ENERGY] < s.storeCapacity
                }
        });
        if(!target) {
            target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => {
                    return ((s.structureType == STRUCTURE_CONTAINER) 
                        && s.store[RESOURCE_ENERGY] < s.storeCapacity) ||
                        (s.structureType == STRUCTURE_POWER_SPAWN && s.energy < s.energyCapacity)
                }
            });
        }
        if(target) {
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            } 
        } else {
            creep.moveTo(spawn1.room.controller);
        }
    } else { 
        creep.say("gathering");

        global.util.pickupEnergyInRange(creep,40);

        let source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => ((s.structureType == STRUCTURE_CONTAINER) 
                && s.store[RESOURCE_ENERGY] > 50)});   
        if(!source) {
            source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => ((s.structureType == STRUCTURE_STORAGE) 
                && s.store[RESOURCE_ENERGY] > 100)});
        }
        if(source) {
            if(creep.withdraw(source, RESOURCE_ENERGY) != OK) {
                creep.moveTo(source);
            } 
        } else {
            if(creep.carry.energy > 0)
                creep.memory.working = true;
            else
                creep.moveTo(spawn1.room.controller);
        }
    }
};
courier.base = [CARRY,MOVE];
courier.add = {
    0: { type: MOVE, amt: 24},
    1: { type: CARRY, amt: 24}
};