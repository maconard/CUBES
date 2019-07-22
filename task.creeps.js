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

function bodyCost (body) {
    return body.reduce(function(cost, part) {
        return cost + BODYPART_COST[part];
    }, 0);
};

function getSum(arr,attr="") {
    let sum = 0;
    Object.keys(arr).forEach(function(b) {
        sum += arr[b].amt;
    });   
    return sum; 
};
    
let taskCreeps = {
    run: function(spawns) {
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
    },
    creeping: function(spawn1, roles) {
        let roomCreeps = _.filter(Game.creeps, c => c.memory.home == spawn1.room.name);
        for(let c in roomCreeps) {
            let creep = Game.creeps[roomCreeps[c].name];
            roles[creep.memory.role].job.run(creep);
            roles[creep.memory.role].num++;
        }
        return roles;
    },
    emergency: function(spawns, roles) {
        let hostiles = spawns[0].room.find(FIND_HOSTILE_CREEPS).length;
        if(roles.guard.num < 1 && hostiles > 0)
            return this.spawn(spawns,roles, 'guard') == OK;
        else if(roles.harvester.num == 0)
            return this.spawn(spawns,roles, 'harvester') == OK;
        else if(roles.courier.num == 0)
            return this.spawn(spawns,roles, 'courier') == OK;
        else if(roles.upgrader.num == 0)
            return this.spawn(spawns,roles, 'upgrader') == OK;
        return false;
    },
    spawning: function(spawns, roles, cLevel) {
        let tLevel = cLevel;
        let that = this;
        let quit = false;
        Object.keys(roles).forEach(function(k) {
            if(k == 'invader' || k == 'miner' || quit) return;
            if(roles[k].num < roles[k].max) {
                if(that.spawn(spawns,roles, k) == OK)
                quit = true;
            }
        });
        let extractors = spawns[0].room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTRACTOR);
            }}).length;
        let mineral = spawns[0].room.find(FIND_MINERALS);
        if(mineral.length > 0 && mineral[0].mineralAmount > 0) mineral = true;
        else mineral = false;
        let term = (spawns[0].room.terminal ? _.sum(spawns[0].room.terminal.store) : 300000);

        if(roles.miner.num < roles.miner.max && extractors > 0 && mineral && term < 300000) {
            this.spawn(spawns,roles, 'miner');
        }      
        if(roles.invader.num < roles.invader.max && spawns[0].room.energyAvailable >= 5000) {
            this.spawn(spawns,roles, 'invader',false,6000);
        }        
    },
    spawn: function(spawns,roles,role,override=false,energy=false) {
        if(typeof(Memory.role_ids) == 'undefined') {
            Memory.role_ids = {};
        }
        if(typeof(Memory.role_ids[role]) == 'undefined') {
            Memory.role_ids[role] = 1;
        }
        
        let body;
        if(override) {
            body = override;
        } else {
            body = JSON.parse(JSON.stringify(roles[role].job.base));
            let a = roles[role].job.add,
                nrg = bodyCost(body),
                used = {[TOUGH]:0,[WORK]:0,[CARRY]:0,[MOVE]:0,[HEAL]:0,[CLAIM]:0,[ATTACK]:0,[RANGED_ATTACK]:0},
                i = 0,
                len = _.toArray(a).length;
            if(!energy) energy = config.spawnEnergy[spawns[0].room.controller.level];
            let sum = getSum(a);
            let parts = 0;
            while((nrg <= spawns[0].room.energyAvailable && nrg <= energy) && (parts < sum) && (i < 300)) {
                let at = i % len;
                let x = a[at].type;
                if(used[x] >= a[at].amt) { i++; continue; }
                if(nrg + cost[x] > spawns[0].room.energyAvailable) break;
                parts++;
                body.push(x);
                nrg += cost[x];
                used[x]++;
                i++;
            }
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
    },
    init: function(cLevel) {
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
    },
    log: function(spawn1,roles) {
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
        // ticks[spawn1.room.name]++;
        let x = spawn1.room.name + ": " + spawn1.room.energyAvailable + " energy and " + contained + " contained; " + 
            roles.harvester.num + " H, " + roles.builder.num + " B, " + roles.upgrader.num + 
            " U, " + roles.repairman.num + " R, " + roles.courier.num + " C, " + roles.guard.num + " G, " + 
            roles.miner.num + " M, " + roles.invader.num + " I";
        global.displays.push(x);
    }
}

module.exports = taskCreeps;