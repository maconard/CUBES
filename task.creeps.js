let harvester = require('role.harvester');
let builder = require('role.builder');
let upgrader = require('role.upgrader');
let repairman = require('role.repairman');
let courier = require('role.courier');
let guard = require('role.guard');
let invader = require('role.invader');
let claimer = require('role.claimer');
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
    let roles = this.init(cLevel);
        
    //Run Creep Roles
    roles = this.creeping(spawn1, roles);

    //Emergency Spawning
    let emg = this.emergency(spawns, roles);

    //Normal Spawning
    if(!emg)
        this.spawning(spawns, roles, cLevel);
    
    //Logging
    this.log(spawn1,roles);
};
taskCreeps.creeping = function(spawn1, roles) {
    let roomCreeps = _.filter(Game.creeps, c => c.memory.home == spawn1.room.name);
    for(let c in roomCreeps) {
        let creep = Game.creeps[roomCreeps[c].name];
        roles[creep.memory.role].job.run(creep);
        roles[creep.memory.role].num++;
    }
    return roles;
};
taskCreeps.emergency = function(spawns, roles) {
    let hostiles = spawns[0].room.find(FIND_HOSTILE_CREEPS).length;
    if(hostiles > 0) {
        let date = global.util.getDate();
        for(let i = 0; i < hostiles.length; i++) {
            Game.notify("Room " + spawns[0].room.name + " has been entered by " + hostiles[i].owner + " at " + date + ".");
            Game.notify("Invader " + hostiles[i].name + " has parts: " + hostiles[i].body);
        }
    }
    if(roles.harvester.num == 0)
        return this.spawn(spawns,roles, 'harvester') == OK;
    else if(roles.courier.num == 0)
        return this.spawn(spawns,roles, 'courier') == OK;
    else if(roles.upgrader.num == 0)
        return this.spawn(spawns,roles, 'upgrader') == OK;
    else if(roles.guard.num < 1 && hostiles > 0)
        return this.spawn(spawns,roles, 'guard') == OK;
    return false;
};
taskCreeps.spawning = function(spawns, roles, cLevel) {
    let tLevel = cLevel;
    let that = this;
    let quit = false;
    for(let k in roles) {
        if(k == 'invader' || k == 'miner' || quit) continue;
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
    if(roles.miner.num < roles.miner.max && extractors > 0 && mineral && term < 300000) {
        this.spawn(spawns,roles, 'miner');
    }      
    else if(roles.invader.num < roles.invader.max && spawns[0].room.energyAvailable >= 5000) {
        this.spawn(spawns,roles, 'invader',false,6000);
    }        
};
taskCreeps.spawn = function(spawns,roles,role,override=false,energy=false) {
    if(!Memory.role_ids[role]) Memory.role_ids[role] = 1;
    
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
    if(!energy) energy = config.spawnEnergy[spawns[0].room.controller.level];
    let j = 0;
    while(nrg < spawns[0].room.energyAvailable && nrg < energy && j < pool.length) {
        let part = pool[j];
        if(!part) { j++; continue; }
        if(nrg + cost[part] >= spawns[0].room.energyAvailable || nrg + cost[part] >= energy)
            break;
        body.push(part);
        nrg += cost[part];
        j++;
    }
    
    body = body.sort((a,b) => priority[b] - priority[a]);
    let birthData = {memory: {role: role, working: false, home: spawns[0].room.name}};
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
        console.log(spawns[0].room.name + ": birthed " + name + ", [" + body + "]");
        Memory.role_ids[role]++;
        return OK;
    }
};
taskCreeps.init = function(cLevel) {
    let roles = {
        harvester: {job: harvester, num: 0},
        builder: {job: builder, num: 0},
        upgrader: {job: upgrader, num: 0},
        repairman: {job: repairman, num: 0},
        courier: {job: courier, num: 0},
        guard: {job: guard, num: 0},
        invader: {job: invader, num: 0},
        claimer: {job: claimer, num: 0},
        miner: {job: miner, num: 0}
    };
    roles.harvester.max     = config.count.override.MAX_HARVESTER || config.count[cLevel].MAX_HARVESTER;
    roles.builder.max       = config.count.override.MAX_BUILDER || config.count[cLevel].MAX_BUILDER;
    roles.upgrader.max      = config.count.override.MAX_UPGRADER || config.count[cLevel].MAX_UPGRADER;
    roles.repairman.max     = config.count.override.MAX_REPAIRMEN || config.count[cLevel].MAX_REPAIRMEN;
    roles.courier.max       = config.count.override.MAX_COURIER || config.count[cLevel].MAX_COURIER;
    roles.guard.max         = config.count.override.MAX_GUARDS || config.count[cLevel].MAX_GUARDS;
    roles.invader.max       = config.count.override.MAX_INVADERS || config.count[cLevel].MAX_INVADERS;
    roles.miner.max         = config.count.override.MAX_MINER || config.count[cLevel].MAX_MINER;
    roles.claimer.max       = 0;
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
    let x = spawn1.room.name + ": " + spawn1.room.energyAvailable + " energy and " + contained + " contained; " + 
        roles.harvester.num + " H, " + roles.builder.num + " B, " + roles.upgrader.num + 
        " U, " + roles.repairman.num + " R, " + roles.courier.num + " C, " + roles.guard.num + " G, " + 
        roles.miner.num + " M, " + roles.invader.num + " I";
    global.displays.push(x);
};