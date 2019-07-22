let config = require('config');

let upgrader = module.exports;
upgrader.run = function(creep) {
    let spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];
    if(creep.memory.working && creep.carry.energy == 0) {
        creep.memory.working = false;
    }
    if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
        creep.memory.working = true;
    }

    if(creep.memory.working) {
        // creep.say('upgrading');
        if(config.upgradeTarget && spawn1.room.controller.level > 6) {

            let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || 
                    structure.structureType == STRUCTURE_RAMPART ||
                    structure.structureType == STRUCTURE_SPAWN);
                }
            });
            if(!target) {
                target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            }
            if(target) {
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
                return;
            }

            let targetRoom = config.upgradeTarget;
            if(!(creep.room.name == targetRoom)) {
                creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetRoom)));
                return;
            }
        }
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    }
    else {
        // creep.say('collecting');
        if(global.util.pickupEnergyInRange(creep,20)) return;
        
        if(config.upgradeTarget != "" && creep.room.name == config.upgradeTarget) {
            let source = creep.pos.findClosestByPath(FIND_SOURCES, {
                filter: (s) => {
                    return s.room.name == config.upgradeTarget;
                }
            });
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                if(creep.moveTo(source) == ERR_NO_PATH) {
                }
            }
            return;
        }
        
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => (s.structureType == STRUCTURE_CONTAINER || 
                            s.structureType == STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] >= 50});
        if(target) {
            if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        } else {
            creep.moveTo(spawn1);
        }
    }
};
upgrader.base = [WORK,CARRY,MOVE];
upgrader.add = {
    0: { type: WORK, amt: 12 },
    1: { type: CARRY, amt: 12 },
    // 2: { type: WORK, amt: 12},
    2: { type: MOVE, amt: 23 }
    // 3: { type: TOUGH, amt: 5 },
    // 4: { type: TOUGH, amt: 5 }
};