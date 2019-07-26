let taskGarbage = module.exports;
taskGarbage.run = function() {
    if(Game.time % 150 == 0) {
        for(let i in Memory.creeps) {
            if(!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }

        for(let i in Memory.roomData) {
            if((Game.rooms[i] && !Game.rooms[i].controller.my) || !Game.rooms[i]) {
                delete Memory.roomData[i];
            }
        }
    
        _.toArray(Game.spawns).forEach(function(s) {
            if(!Memory.roomData[s.room.name]) return;
            let travelDat = Memory.roomData[s.room.name].travelData;
            for(key in travelDat) {
                travelDat[key] -= 3;
                if(travelDat[key] <= 0) {
                    delete Memory.roomData[s.room.name].travelData[key];
                }
            };
        });
    }
};