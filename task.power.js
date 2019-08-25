let operator = require('role.operator');

let taskPower = module.exports;
taskPower.run = function(spawns) {
    let powerSpawns = spawns[0].room.find(FIND_STRUCTURES, {
        filter: (s) => (s.structureType == STRUCTURE_POWER_SPAWN)
    });

    this.mine(spawns);
    
    if(powerSpawns.length > 0)
        this.creeping(powerSpawns[0]);
};
taskPower.mine = function(spawns) {
    let spawn1 = spawns[0];
    let r = spawn1.room;
    let powerBanks = r.find(FIND_STRUCTURES, {
        filter: (s) => (s.structureType == STRUCTURE_POWER_BANK)
    });
    let powerSpawns = r.find(FIND_STRUCTURES, {
        filter: (s) => (s.structureType == STRUCTURE_POWER_SPAWN)
    });
    if(powerBanks.length > 0 && powerBanks[0].ticksToDecay % 50 == 0) {
        let msg = r.name + " has power, " + Math.round(100.0*powerBanks[0].hits/powerBanks[0].hitsMax) + "% remaining, " + powerBanks[0].ticksToDecay + " ticks remaining";
        console.log(msg); Game.notify(msg);
    }
    if(powerBanks.length && (!Memory.roomData[r.name].power || !Memory.roomData[r.name].powerAccess)) {
        let powerBank = powerBanks[0];
        Memory.roomData[r.name].power = powerBank.id;
        if(!Memory.roomData[r.name].powerAccess) {
            let terrain = r.getTerrain();
            let x = powerBank.pos.x;
            let y = powerBank.pos.y;
            let access = 0;
            if(global.util.isWalkable(x+1,y,r,terrain)) access++;
            if(global.util.isWalkable(x-1,y,r,terrain)) access++;
            if(global.util.isWalkable(x,y+1,r,terrain)) access++;
            if(global.util.isWalkable(x,y-1,r,terrain)) access++;
            if(global.util.isWalkable(x+1,y+1,r,terrain)) access++;
            if(global.util.isWalkable(x-1,y-1,r,terrain)) access++;
            if(global.util.isWalkable(x-1,y+1,r,terrain)) access++;
            if(global.util.isWalkable(x+1,y-1,r,terrain)) access++;
            if(access > 3) access = 3;
            Memory.roomData[r.name].powerAccess = access;
        }
    } else if(!powerBanks.length && (Memory.roomData[r.name].power || Memory.roomData[r.name].powerAccess)) {
        delete Memory.roomData[r.name].power;
        delete Memory.roomData[r.name].powerAccess;
    }

    if(powerSpawns.length && powerSpawns[0].power >= 1 && powerSpawns[0].energy >= 50) {
        if(powerSpawns[0].processPower() == OK && powerSpawns[0].power % 10 == 0)
            Game.notify(r.name + " processed power, GPL = " + (Game.gpl.level + (Math.round(1000*Game.gpl.progress/Game.gpl.progressTotal)/1000)));
    }
};
taskPower.spawnCreep = function(creep,pSpawn) {
    if(pSpawn.room && pSpawn.room.name != "W8N3") return -1;

    let err = creep.spawn(pSpawn);
    // console.log(err + ", " + pSpawn.structureType);
    if(err == OK) {
        console.log("W8N3: POWERCREEP SPAWNED");
        Game.notify("W8N3: POWERCREEP SPAWNED");
    } else {
        console.log("Error spawning PC: " + err);
    }
    return err;
};
taskPower.creeping = function(spawn) {
    for(let c in Game.powerCreeps) {
        let creep = Game.powerCreeps[c];
        // console.log(creep.name + ": can spawn at " + new Date(creep.spawnCooldownTime));
        if(!creep.ticksToLive && ((creep.spawnCooldownTime && creep.spawnCooldownTime <= Date.now()) || !creep.spawnCooldownTime)) {
            let result = this.spawnCreep(creep,spawn);
            if(result != OK) {
                return;
            }
        } else if (!creep.ticksToLive) {
            return;
        }
        if(creep.room && spawn && creep.room.name != spawn.room.name) return;
        operator.run(creep);
    }
};
taskPower.name = "power";