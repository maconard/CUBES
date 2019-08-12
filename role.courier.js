let courier = module.exports;
courier.run = function(creep) {
    let spawn1 = Game.rooms[creep.memory.home].find(FIND_MY_SPAWNS)[0];
    let sum = _.sum(creep.carry);
    if(creep.memory.working && sum == 0) {
        creep.memory.working = false;
    }
    if(!creep.memory.working && sum == creep.carryCapacity) {
        creep.memory.working = true;
    }
    
    if(creep.memory.working) {//depositing energy
        // creep.say("supplying");
        if(creep.carry.energy > 0) {
            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => {
                        return (s.structureType == STRUCTURE_SPAWN || 
                            s.structureType == STRUCTURE_TOWER ||
                            s.structureType == STRUCTURE_POWER_SPAWN ||
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
                            && _.sum(s.store) < s.storeCapacity
                    }
            });
            if(!target) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => {
                        return ((s.structureType == STRUCTURE_CONTAINER) 
                            && _.sum(s.store) < s.storeCapacity)
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
        } else if(creep.carry[RESOURCE_POWER] > 0) {
            let powerSpawn = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_POWER_SPAWN && s.room.name == creep.room.name)
            });
            if(powerSpawn.length) {
                if(powerSpawn[0].power < 40) {
                    if(creep.transfer(powerSpawn[0],RESOURCE_POWER) != OK) {
                        creep.moveTo(powerSpawn[0]);
                    }
                    return;
                } else if(spawn1.room.storage) {
                    if(creep.transfer(spawn1.room.storage,RESOURCE_POWER) != OK) {
                        creep.moveTo(spawn1.room.storage);
                    }
                }
            } else if(spawn1.room.storage) {
                if(creep.transfer(spawn1.room.storage,RESOURCE_POWER) != OK) {
                    creep.moveTo(spawn1.room.storage);
                }
            }
        } else {
            let term = creep.room.terminal;
            if(!Memory.roomData[creep.room.name].mineral) {
                let min = creep.room.find(FIND_MINERALS);
                Memory.roomData[creep.room.name].mineral = min[0].mineralType;
            }
            for(let rss in creep.carry) {
                if(rss == RESOURCE_ENERGY) continue;
                if(term && term.storeCapacity - _.sum(term.store) > 0) {
                    let result = creep.transfer(term, rss);
                    if(result == ERR_NOT_IN_RANGE) {
                        creep.moveTo(term);
                    } else if(result == OK) {
                        break;
                    }
                }  
            }
        }
    } else { 
        // creep.say("gathering");
        // if(global.util.fixTerminals(spawn1,creep)) return;
        let power = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: (r) => (r.resourceType == RESOURCE_POWER)}); 
        if(power.length) {
            if(creep.pickup(power[0]) != OK) {
                creep.moveTo(power[0]);
            }
            return;
        }
        let powerSpawn = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => (s.structureType == STRUCTURE_POWER_SPAWN)
        });
        if(powerSpawn.length && creep.room.storage && creep.room.storage.store[RESOURCE_POWER] &&
                creep.room.storage.store[RESOURCE_POWER] > 100 && powerSpawn[0].power < 20) {
            let amt = creep.carryCapacity - _.sum(creep.carry);
            let amtPower = creep.room.storage.store[RESOURCE_POWER] - 100;
            if(amt > amtPower) amt = amtPower;
            if(creep.withdraw(creep.room.storage, RESOURCE_POWER, amt) != OK) {
                creep.moveTo(creep.room.storage);
            } 
            return;
        }

        let term = creep.room.terminal;
        if(term && term.store[RESOURCE_POWER] && term.store[RESOURCE_POWER] > 0) {
            if(creep.withdraw(term, RESOURCE_POWER) != OK) {
                creep.moveTo(term);
            } 
            return;
        }

        if(global.util.pickupResourceInRange(creep,40)) return;
        let source = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
            filter: (s) => (_.sum(s.store) > 0)}); 

        if(!source) {
            if(term && term.store[RESOURCE_ENERGY] > 11000) {
                source = term;
            }  
        }
        if(!source) {
            source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => ((s.structureType == STRUCTURE_CONTAINER) 
                && s.store[RESOURCE_ENERGY] > 50)});   
        }
        if(!source) {
            source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => ((s.structureType == STRUCTURE_STORAGE) 
                && s.store[RESOURCE_ENERGY] > 500)});
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