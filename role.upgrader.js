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

    let goClaim = false;
    let targetR;
    if(Memory.roomData[spawn1.room.name].claiming) {
        targetR = Memory.roomData[spawn1.room.name].claiming;
        if(Game.rooms[targetR]) {
            let spawns = Game.rooms[targetR].find(FIND_CONSTRUCTION_SITES, {
                filter: (c) => (c.structureType == STRUCTURE_SPAWN)
            });
            if(spawns.length > 0) {
                goClaim = true;
            }
        }
    }

    if(creep.memory.working) {
        // creep.say('upgrading');
        if(goClaim && creep.memory.role == 'upgrader' && !(creep.room.name == targetR)) {
            creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(targetR)));
            return;
        }
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    }
    else {
        // creep.say('collecting');
        if(goClaim && creep.memory.role == 'upgrader') {
            if(!(creep.room.name == targetR)) {
                creep.moveTo(creep.pos.findClosestByPath(creep.room.findExitTo(targetR)));
                return;
            }
            let source = creep.pos.findClosestByPath(FIND_SOURCES, {
                filter: (s) => {
                    return s.room.name == targetR;
                }
            });
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                if(creep.moveTo(source) == ERR_NO_PATH) {
                }
            }
            return;
        }

        if(creep.room.controller.level == 8 && creep.room.energyAvailable < 3000 && creep.room.controller.ticksToDowngrade > 50000) {
            creep.moveTo(creep.room.controller);
            return;
        }
        
        let store = spawn1.room.storage;
        let target = false;
        if(store && store.store.energy >= 50) {
            target = store;
        }
        if(!store) {
            target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] >= 50)});
        }
        if(target) {
            if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        } else {
            if(global.util.pickupEnergyInRange(creep,20)) return;
            
            if(creep.carry.energy > 0)
                creep.memory.working = true;
            else
                creep.moveTo(spawn1.room.controller);
        }
    }
};
upgrader.base = [WORK,CARRY,MOVE];
upgrader.add = {
    0: { type: WORK, amt: 19 },
    1: { type: CARRY, amt: 14 },
    2: { type: MOVE, amt: 14 }
    // 3: { type: MOVE, amt: 23 }
    // 3: { type: TOUGH, amt: 5 },
    // 4: { type: TOUGH, amt: 5 }
};