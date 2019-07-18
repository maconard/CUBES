var ticks = 0;

var taskVisuals = {
    run: function(spawns) {
        var s = spawns[0];
        if(!Memory.visuals) return;
        if(!Memory.roomData[s.room.name]) Memory.roomData[s.room.name] = { travelData: {} };
        var travel = Memory.roomData[s.room.name].travelData;
        Object.keys(travel).forEach(function(t) {
            var dt = JSON.parse(t);
            if(travel[t] > 35)
                s.room.visual.rect(dt.x - 0.5, dt.y - 0.5, 1, 1, { fill: "#ff0000", opacity: .3 }); //red, lots of travel
            else if(travel[t] > 15)
                s.room.visual.rect(dt.x - 0.5, dt.y - 0.5, 1, 1, { fill: "#ff00ff", opacity: .3 }); //magenta, mild travel
            else if(travel[t] > 0)
                s.room.visual.rect(dt.x - 0.5, dt.y - 0.5, 1, 1, { fill: "#0000ff", opacity: .3 }); //blue, low travel 
        });
    },
    global: function() {
        if(!Memory.visuals) return;
        for(var i = 0; i < global.displays.length; i++) {
            new RoomVisual().text(global.displays[i],0.5,i+0.5, {align: "left"});
        }
    }
}

module.exports = taskVisuals;