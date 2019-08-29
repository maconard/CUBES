powers = {
    0: [PWR_GENERATE_OPS],
    1: [PWR_REGEN_SOURCE],
    // 2: [PWR_OPERATE_SPAWN],
    2: [PWR_OPERATE_CONTROLLER],
    3: [PWR_REGEN_MINERAL],
    4: [PWR_OPERATE_TERMINAL],
    5: [PWR_OPERATE_STORAGE]
    //[PWR_OPERATE_EXTENSION]: 0,
    //[PWR_SHIELD]: 0
};

let operator = module.exports;
operator.run = function(creep) {
    let sum = _.sum(creep.carry);
    let ops = (creep.carry[RESOURCE_OPS] ? creep.carry[RESOURCE_OPS] : 0);
    let energy = creep.carry.energy;
    let powerSpawns = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => (s.structureType == STRUCTURE_POWER_SPAWN)
    });
    let spawn;
    if(powerSpawns.length > 0)
        spawn = powerSpawns[0];

    if(!creep.ticksToLive) return;

    // console.log("Checking if dying soon...");
    // Renew PowerCreep if dying soon
    if(creep.ticksToLive < 1000) {
        // let powerSites = creep.room.find(FIND_STRUCTURES, {
        //     filter: (s) => (s.structureType == STRUCTURE_POWER_SPAWN || s.structureType == STRUCTURE_POWER_BANK)
        // });
        if(spawn) {
            // let target = creep.pos.findClosestByPath(powerSites);
            if(creep.renew(spawn) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn);
            }
            return;
        }
    }

    // console.log(creep.room.name + " powerEnabled: " + creep.room.controller.isPowerEnabled);
    // Activate Power in the room if it isn't
    if(creep.room.controller.isPowerEnabled == false) {
        if(creep.enableRoom(creep.room.controller) != OK) {
            creep.moveTo(creep.room.controller);
        }
        return;
    }

    // console.log("Checking if can collect Ops...");
    // If low on Ops, try to collect some
    if(ops < 200) {
        let source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => ((s.structureType == STRUCTURE_STORAGE || s.structureType == STRUCTURE_TERMINAL || s.structureType == STRUCTURE_CONTAINER) 
            && s.store[RESOURCE_OPS] && s.store[RESOURCE_OPS] > 0)});
        if(source) {
            let amount = source.store[RESOURCE_OPS];
            if(amount > 250) amount = 250;
            if(amount > creep.carryCapacity - sum) amount = creep.carryCapacity - sum;
            if(creep.withdraw(source, RESOURCE_OPS, amount) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
            return;
        }
    }
    // console.log("Checking if can collect Energy...");
    // If low on Energy, try to collect some
    let amt = 200;
    if(amt > creep.carryCapacity - sum) amt = Math.floor((creep.carryCapacity - sum)/3);
    if(energy < amt && creep.carryCapacity > 700) {
        let source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => ((s.structureType == STRUCTURE_STORAGE || s.structureType == STRUCTURE_TERMINAL || s.structureType == STRUCTURE_CONTAINER) 
            && s.store[RESOURCE_ENERGY] > amt - energy)});
        if(source) {
            if(creep.withdraw(source, RESOURCE_ENERGY, amt - energy) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
            return;
        }
    }

    // console.log(powers.length + ", " + powers[0]);
    // Use standard powers according to priority
    let quit = false;
    for(let i = 0; i < Object.keys(powers).length; i++) {
        let power = powers[i];
        if(!creep.powers[power]) continue;
        let cooldown = creep.powers[power].cooldown;
        // console.log("Power " + power + " has cooldown " + cooldown);
        if(cooldown == 0) {
            result = this.activatePower(creep, power);
            if(result == OK) {
                quit = true;
                break;
            }
        }
    }
    if(quit) return;

    // console.log("Checking if high on Ops...");
    // If high on Ops, try to deposit some
    amt = 500;
    if(amt > creep.carryCapacity) amt = creep.carryCapacity;
    if(ops >= amt) {
        let target = false;
        let term = creep.room.terminal;
        let storage = creep.room.terminal;
        if(term && _.sum(term.store) < term.storeCapacity)
            target = term;
        if(!target && storage && _.sum(storage.store) < storage.storeCapacity)
            target = storage;

        if(target) {
            if(creep.transfer(target, RESOURCE_OPS, ops - Math.floor(amt/2)) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
            return;
        }
    }

    if(spawn) {
        if(creep.ticksToLive < 4500 && creep.renew(spawn) == ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn);
        } else {
            creep.moveTo(spawn);
        }
    }
};
operator.activatePower = function(creep, power) {
    // console.log("Checking switch for " + power);
    if(power == PWR_GENERATE_OPS) {
        // console.log(creep.name + ": generating ops");
        return creep.usePower(power);
    } else if(power == PWR_REGEN_SOURCE) {
        // if(!creep.carry[RESOURCE_OPS] || creep.carry[RESOURCE_OPS] < 100) return -1;
        let sources = creep.room.find(FIND_SOURCES, {
            filter: (s) => {
                return (!s.effects || s.effects.length == 0);
            }});
        if(sources.length > 0) {
            let target = creep.pos.findClosestByPath(sources);
            let result = creep.usePower(power, target);
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
                return OK;
            } else if(result == OK) {
                console.log(creep.name + ": regenerating source");
            }
            return result;
        }
        return -1;
    } else if(power == PWR_OPERATE_TERMINAL) {
        return -1;
        if(!creep.carry[RESOURCE_OPS] || creep.carry[RESOURCE_OPS] < 150) return -1;
        let term = creep.room.terminal;
        if(term.effects && term.effects.length > 0) return -1; 
        if(term) {
            let result = creep.usePower(power, term);
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(term);
                return OK;
            } else if(result == OK) {
                console.log(creep.name + ": operating terminal");
            }
            return result;
        }
        return -1
    } else if(power == PWR_OPERATE_SPAWN) {
        if(!creep.carry[RESOURCE_OPS] || creep.carry[RESOURCE_OPS] < 200) return -1;
        let spawns = creep.room.find(FIND_MY_SPAWNS)
        if(spawns.length > 0) {
            if(spawns[0].effects && spawns[0].effects.length > 0) return -1; 
            let result = creep.usePower(power, spawns[0]);
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawns[0]);
                return OK;
            } else if(result == OK) {
                console.log(creep.name + ": operating spawn");
            }
            return result;
        }
        return -1
    } else if(power == PWR_REGEN_MINERAL) {
        // if(!creep.carry[RESOURCE_OPS] || creep.carry[RESOURCE_OPS] < 100) return -1;
        let sources = creep.room.find(FIND_MINERALS, {
            filter: (s) => {
                return ((!s.effects || s.effects.length == 0) && s.mineralAmount > 0);
            }});
        if(sources.length > 0) {
            let target = creep.pos.findClosestByPath(sources);
            let result = creep.usePower(power, target);
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
                return OK;
            } else if(result == OK) {
                console.log(creep.name + ": regenerating mineral");
            }
            return result;
        }
        return -1;
    } else if(power == PWR_OPERATE_CONTROLLER) {
        if(!creep.carry[RESOURCE_OPS] || creep.carry[RESOURCE_OPS] < 200) return -1;
        let cont = creep.room.controller;
        if(cont) {
            if(cont.effects && cont.effects.length > 0) return -1; 
            let result = creep.usePower(power, cont);
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(cont);
                return OK;
            } else if(result == OK) {
                console.log(creep.name + ": operating controller");
            }
            return result;
        }
        return -1
    } else if(power == PWR_OPERATE_STORAGE) {
        if(!creep.carry[RESOURCE_OPS] || creep.carry[RESOURCE_OPS] < 200) return -1;
        let storage = creep.room.storage;
        if(storage) {
            if(_.sum(storage.store) < storage.storeCapacity * 0.95) return -1;
            let result = creep.usePower(power, storage);
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(storage);
                return OK;
            } else if(result == OK) {
                console.log(creep.name + ": operating storage");
            }
            return result;
        }
        return -1
    }

    return -1;
};