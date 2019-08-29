let harvester = require('role.harvester');
let builder = require('role.builder');
let upgrader = require('role.upgrader');
let repairman = require('role.repairman');
let courier = require('role.courier');
let guard = require('role.guard');
let invader = require('role.invader');
let claimer = require('role.claimer');
let cleric = require('role.cleric');
let powerminer = require('role.powerminer');
let miner = require('role.miner');
let config = require('config');
        
let priority = {
    [TOUGH]: 10,
    [CARRY]: 9,
    [WORK]: 8,
    [MOVE]: 7,
    [ATTACK]: 6,
    [RANGED_ATTACK]: 5,
    [HEAL]: 4,
    [CLAIM]: 3
};
let cost = {
    [TOUGH]: 10,
    [CARRY]: 50,
    [WORK]: 100,
    [MOVE]: 50,
    [ATTACK]: 80,
    [RANGED_ATTACK]: 150,
    [HEAL]: 250,
    [CLAIM]: 600
}

if(!Memory.cache) Memory.cache = {};
if(!Memory.role_ids) Memory.role_ids = {};
Memory.cache.bodies = {};
    
let taskCreeps = module.exports;
taskCreeps.run = function(spawns) {
    let spawn1 = spawns[0];
    if(!spawn1.room.controller || !spawn1.room.controller.my) return;
    
    // Init Roles
    let cLevel = spawn1.room.controller.level;
    let roles = this.init(cLevel,spawns);
        
    // Run Creep Roles
    roles = this.creeping(spawn1, roles);

    // Emergency Spawning
    this.emergency(spawns, roles);

    // Normal Spawning
    this.spawning(spawns, roles, cLevel);

    // Powerminer Spawning
    if(cLevel == 8 && Memory.roomData[spawn1.room.name].power && spawn1.room.energyAvailable > 6000) {
        let bank = Game.getObjectById(Memory.roomData[spawn1.room.name].power);
        if(bank && bank.ticksToDecay && bank.ticksToDecay > 150) {
            this.spawnPower(spawns,roles);
        }
    } 
    
    // Logging
    this.log(spawn1,roles);
};
taskCreeps.creeping = function(spawn1, roles) {
    let roomCreeps = _.filter(Game.creeps, c => c.memory.home == spawn1.room.name);
    for(let c in roomCreeps) {
        let creep = Game.creeps[roomCreeps[c].name];
        roles[creep.memory.role].job.run(creep);
        // if(creep.ticksToLive > 30)
        roles[creep.memory.role].num++;
    }
    return roles;
};
taskCreeps.emergency = function(spawns, roles) {
    let hostiles = spawns[0].room.find(FIND_HOSTILE_CREEPS);
    let available = spawns[0].room.energyAvailable;
    let max = config.spawnEnergy[spawns[0].room.controller.level];
    if(available > max) available = max;
    if(hostiles.length > 0) {
        let date = global.util.getDate();
        Game.notify("Room " + spawns[0].room.name + " has been invaded by " + hostiles[0].owner.username + " at " + date + ".");
        // for(let i = 0; i < hostiles.length; i++) {
        //     Game.notify("Invader " + hostiles[i].name + " has parts: " + hostiles[i].body);
        // }
    }
    if(roles.harvester.num == 0)
        return this.spawn(spawns,roles, 'harvester', false, available) == OK;
    else if(roles.courier.num == 0)
        return this.spawn(spawns,roles, 'courier', false, available) == OK;
    else if((roles.upgrader.num == 0 && spawns[0].room.controller.level < 8) || 
            (roles.upgrader.num == 0 && spawns[0].room.controller.level == 8 && spawns[0].room.controller.ticksToDowngrade < 50000))
        return this.spawn(spawns,roles, 'upgrader', false, available) == OK;
    else if(roles.guard.num < 1 && hostiles > 0)
        return this.spawn(spawns,roles, 'guard', false, available) == OK;
    return false;
};
taskCreeps.spawnPower = function(spawns, roles) {
    if(roles.powerminer.num <= roles.cleric.num && roles.powerminer.num < roles.powerminer.max && spawns[0].room.energyAvailable > 3000) {
        this.spawn(spawns,roles,"powerminer",false,4500);
    } 
    else if(roles.cleric.num < roles.powerminer.num && roles.cleric.num < roles.cleric.max && spawns[0].room.energyAvailable > 3000) {
        this.spawn(spawns,roles,"cleric",false,6750);
    }
};
taskCreeps.spawning = function(spawns, roles, cLevel) {
    let tLevel = cLevel;
    let that = this;
    let quit = false;

    if(!Memory.roomData[spawns[0].room.name].avgDistToSource) {
        let dist = 0, sourceC = 0;
        let sources = spawns[0].room.find(FIND_SOURCES);
        //if sources are far from controller, increase max courier count
        for(let i in sources) {
            let path = PathFinder.search(spawns[0].room.controller.pos,sources[i].pos).path;
            dist += path.length;
            sourceC++;
        }
        Memory.roomData[spawns[0].room.name].avgDistToSource = dist/sourceC;
    }
    if(Memory.roomData[spawns[0].room.name].avgDistToSource >= 60) roles['courier'].max+=2;
    else if(Memory.roomData[spawns[0].room.name].avgDistToSource >= 30) roles['courier'].max++;

    for(let k in roles) {
        if(k == 'invader' || k == 'miner' || k == 'cleric' || k == 'powerminer' || quit) continue;
        if(roles[k].num < roles[k].max) {
            if(that.spawn(spawns,roles, k) == OK)
            quit = true;
        }
    };
    if(quit) return;
    let extractors = spawns[0].room.find(FIND_STRUCTURES, {
        filter: (s) => { return (s.structureType == STRUCTURE_EXTRACTOR); }
    }).length;
    let mineral = spawns[0].room.find(FIND_MINERALS);
    let term = (spawns[0].room.terminal ? _.sum(spawns[0].room.terminal.store) : 300000);
    if(mineral.length > 0 && mineral[0].mineralAmount > 0) mineral = true;
    else mineral = false;
    if(roles.miner.num < roles.miner.max && extractors > 0 && mineral && term < 200000) {
        this.spawn(spawns,roles, 'miner');
    }      
    else if(roles.invader.num < roles.invader.max && spawns[0].room.energyAvailable >= 5000) {
        this.spawn(spawns,roles, 'invader',false,5000);
    }        
};
taskCreeps.spawn = function(spawns,roles,role,override=false,energy=false) {
    if(!Memory.role_ids[role]) Memory.role_ids[role] = 1;
    let maxEnergy = energy || config.spawnEnergy[spawns[0].room.controller.level];
    let availableEnergy = spawns[0].room.energyAvailable;
    let capacityEnergy = spawns[0].room.energyCapacityAvailable;
    
    if(override == false && availableEnergy < maxEnergy && 
        capacityEnergy >= maxEnergy) return;
    
    let body;
    let pool = [];
    if(override) {
        body = override;
    } else if(Memory.cache.bodies[role]) {
        body = JSON.parse(JSON.stringify(roles[role].job.base));
        pool = JSON.parse(Memory.cache.bodies[role]);
    } else {
        body = JSON.parse(JSON.stringify(roles[role].job.base));
        let a = roles[role].job.add,
            used = {[TOUGH]:0,[WORK]:0,[CARRY]:0,[MOVE]:0,[HEAL]:0,[CLAIM]:0,[ATTACK]:0,[RANGED_ATTACK]:0},
            i = 0,
            len = _.toArray(a).length,
            sum = global.util.getSum(a),
            parts = 0;
        while(parts <= sum && i < 300) {
            let at = i % len;
            let x = a[at].type;
            if(used[x] >= a[at].amt) { i++; continue; }
            pool.push(x);
            parts++;
            used[x]++;
            i++;
        }
        Memory.cache.bodies[role] = JSON.stringify(pool);
    }

    let nrg = global.util.bodyCost(body);
    let j = 0;
    while(nrg < availableEnergy && nrg < maxEnergy && j < pool.length) {
        let part = pool[j];
        if(!part) { j++; continue; }
        if(nrg + cost[part] >= availableEnergy || nrg + cost[part] >= maxEnergy)
            break;
        body.push(part);
        nrg += cost[part];
        j++;
    }
    if(role == "harvester") {
        let PCs = spawns[0].room.find(FIND_MY_POWER_CREEPS);
        if(PCs.length > 0) {
            j = 0;
            while(nrg < availableEnergy && nrg < maxEnergy && j < 6) {
                if(nrg + 100 >= availableEnergy || nrg + 100 >= maxEnergy)
                    break;
                body.push(WORK);
                nrg += 100;
                j++;
            }
        }
    }
    
    body = body.sort((a,b) => priority[b] - priority[a]);
    let birthData = {memory: {role: role, working: false, home: spawns[0].room.name, pathing: { stuckCount: 0, lastX: 0, lastY: 0 }}};
    let name = role + '-' + Memory.role_ids[role];
    let result = spawns[0].spawnCreep(body, name, birthData);
    let i = 1;
    while(result == ERR_BUSY && i < spawns.length) {
        result = spawns[i].spawnCreep(body, name, birthData);
        i++;
    }
    // console.log(role + ": " + result + ", " + body);
    if(result == ERR_NAME_EXISTS) {
        console.log("ERROR: " + name + " already exists");
        Memory.role_ids[role]++;
        return ERR_NAME_EXISTS;
    } else if (result == ERR_NOT_ENOUGH_ENERGY) {
        // console.log("ERROR: not enough energy");
        return ERR_NOT_ENOUGH_ENERGY;
    } else if(result == OK) {
        console.log(spawns[0].room.name + ": birthed " + name + " with " + body.length + " parts");
        Memory.role_ids[role]++;
        roles[role].num++;
        return OK;
    }
};
taskCreeps.init = function(cLevel,spawns) {
    let roles = {
        harvester: {job: harvester, num: 0},
        builder: {job: builder, num: 0},
        upgrader: {job: upgrader, num: 0},
        repairman: {job: repairman, num: 0},
        courier: {job: courier, num: 0},
        guard: {job: guard, num: 0},
        invader: {job: invader, num: 0},
        claimer: {job: claimer, num: 0, max: 0},
        miner: {job: miner, num: 0},
        cleric: {job: cleric, num: 0, max: Memory.roomData[spawns[0].room.name].powerAccess},
        powerminer: {job: powerminer, num: 0, max: Memory.roomData[spawns[0].room.name].powerAccess}
    };
    roles.harvester.max     = config.count.override.MAX_HARVESTER || config.count[cLevel].MAX_HARVESTER;
    roles.builder.max       = config.count.override.MAX_BUILDER || config.count[cLevel].MAX_BUILDER;
    roles.upgrader.max      = config.count.override.MAX_UPGRADER || config.count[cLevel].MAX_UPGRADER;
    roles.repairman.max     = config.count.override.MAX_REPAIRMEN || config.count[cLevel].MAX_REPAIRMEN;
    roles.courier.max       = config.count.override.MAX_COURIER || config.count[cLevel].MAX_COURIER;
    roles.guard.max         = config.count.override.MAX_GUARDS || config.count[cLevel].MAX_GUARDS;
    roles.invader.max       = config.count.override.MAX_INVADERS || config.count[cLevel].MAX_INVADERS;
    roles.miner.max         = config.count.override.MAX_MINER || config.count[cLevel].MAX_MINER;

    if(spawns[0].room.controller.level == 8 && spawns[0].room.controller.ticksToDowngrade > 50000 && spawns[0].room.energyAvailable < 6000)
        roles.upgrader.max = 0;
    if(spawns[0].room.storage && spawns[0].room.storage.store[RESOURCE_ENERGY] > 150000 
            && spawns[0].room.controller.effects && spawns[0].room.controller.effects.length > 0)
        roles.upgrader.max += 2;//Math.floor(spawns[0].room.storage.store[RESOURCE_ENERGY] / 300000);
    return roles;
};
taskCreeps.log = function(spawn1,roles) {
    let contained = 0;
    let containers = spawn1.room.find(FIND_STRUCTURES, {
        filter: (s) => (s.structureType == STRUCTURE_CONTAINER)});
    if(containers.length > 0) {
        for(let x = 0; x < containers.length; x++) {
            contained += containers[x].store[RESOURCE_ENERGY];
        }
    }
    if(spawn1.room.storage)
        contained += spawn1.room.storage.store[RESOURCE_ENERGY];
    if(spawn1.room.terminal)
        contained += spawn1.room.terminal.store[RESOURCE_ENERGY];
    let population = roles.harvester.num + roles.builder.num + roles.upgrader.num + roles.repairman.num +
                        roles.courier.num + roles.guard.num + roles.miner.num + roles.invader.num + roles.claimer.num +
                        roles.cleric.num + roles.powerminer.num;
    let x = "Level " + spawn1.room.controller.level + ", " + spawn1.room.name + ": " + spawn1.room.energyAvailable + " energy and " + contained + " contained; population " + population;// + 
        // roles.harvester.num + " H, " + roles.builder.num + " B, " + roles.upgrader.num + 
        // " U, " + roles.repairman.num + " R, " + roles.courier.num + " C, " + roles.guard.num + " G, " + 
        // roles.miner.num + " M, " + roles.invader.num + " I";
    global.displays.push(x);
};
taskCreeps.name = "creeps";

if(!Creep.prototype._moveTo) {
    Creep.prototype._moveTo = Creep.prototype.moveTo;

    Creep.prototype.moveTo = function(target, opts={reusePath: 15, maxRooms: 2, ignoreCreeps: true}) { 
        // let path = this.pos.findPathTo(target,opts);
        if(target == null) return;
        if(this.memory._move && this.memory._move.dest && target.pos) {
            let tpos = target.pos;
            let mpos = this.memory._move.dest;
            if(tpos.x != mpos.x || tpos.y != mpos.y || tpos.room != mpos.room) delete this.memory._move;
        }
        // if(this.memory.pathing && this.memory.pathing.stuckCount % 3 == 0) {
        //     delete this.memory._move;
        //     this.memory.pathing = { stuckCount: 1, lastX: this.pos.x, lastY: this.pos.y };
        //     opts.ignoreCreeps = false;
        // }
        // else if(this.fatigue == 0) {
        //     if(this.memory.pathing && this.memory.pathing.lastX == this.pos.x && this.memory.pathing.lastY == this.pos.y) {
        //         this.memory.pathing.stuckCount = this.memory.pathing.stuckCount+1;
        //     } else {
        //         this.memory.pathing = { stuckCount: 1, lastX: this.pos.x, lastY: this.pos.y };
        //     }
        // }
        
        if(Math.random() < 0.2) {
            if(this.memory._move) delete this.memory._move;
            opts.ignoreCreeps = false;
        }

        opts.plainCost = 1;
        opts.swampCost = 5;
        opts.costCallback = function(roomName, costs) {
            let room = Game.rooms[roomName];
            if (!room || !Memory.roomData[roomName]) return;

            if(!Memory.roomData[roomName].pathing) Memory.roomData[roomName].pathing = { tick: 0, matrix: "" };
            let pathing = Memory.roomData[roomName].pathing;
            if(pathing.tick != Game.time || pathing.matrix == "") {
                // costs = new PathFinder.CostMatrix;
                room.find(FIND_STRUCTURES).forEach(function(struct) {
                    if (struct.structureType === STRUCTURE_ROAD) {
                        costs.set(struct.pos.x, struct.pos.y, 1);
                    } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                            (struct.structureType !== STRUCTURE_RAMPART || !struct.my)) {
                        costs.set(struct.pos.x, struct.pos.y, 0xff);
                    }
                });
                room.find(FIND_CREEPS).forEach(function(creep) {
                    let x = creep.pos.x; let y = creep.pos.y;
                    costs.set(x, y, 10);
                });
                room.find(FIND_POWER_CREEPS).forEach(function(creep) {
                    let x = creep.pos.x; let y = creep.pos.y;
                    costs.set(x, y, 10);
                });
                Memory.roomData[roomName].pathing.tick = Game.time;
                Memory.roomData[roomName].pathing.matrix = costs.serialize();
            } else {
                costs = PathFinder.CostMatrix.deserialize(Memory.roomData[roomName].pathing.matrix);
            }

            return costs;
        };
        let result = this._moveTo(target,opts);
        if(result == OK) {
            // this.memory.pathing.stuckCount++;
            if(Memory.roomData[this.room.name]) {
                let dat = JSON.stringify({x:this.pos.x,y:this.pos.y});
                if(!Memory.roomData[this.room.name].travelData[dat]) 
                    Memory.roomData[this.room.name].travelData[dat] = 1;
                else if(Memory.roomData[this.room.name].travelData[dat] < 40)
                    Memory.roomData[this.room.name].travelData[dat]++;
            }
        } 
    }
}

if(!PowerCreep.prototype._moveTo) {
    PowerCreep.prototype._moveTo = Creep.prototype._moveTo;
}