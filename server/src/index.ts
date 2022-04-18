import { createServer } from "http";
import { Server } from "socket.io";

import { Icon, getIcons } from "./game";

import * as game from "./game";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:1337",
        methods: ["GET", "POST"],
    },
});

// game state
let rooms: {
    [key: string]: {
        table: Icon[];
        [key: string]: Icon[];
    };
} = {};

function getPlayerIds(roomId: string) {
    if (!rooms[roomId]) return [];

    const playerIds = Object.keys(rooms[roomId]);
    return playerIds.filter((id) => id !== "table");
}

function getTableIdForPlayerId(playerId: string): string | undefined {
    for (const [tableId, roomState] of Object.entries(rooms)) {
        if (roomState[playerId]) {
            return tableId;
        }
    }

    return undefined;
}

io.on("connection", (socket) => {
    console.log("connection", socket.id);

    socket.on("joinTable", (tableId: string) => {
        socket.join(tableId);
        console.log(`${socket.id} joined room ${tableId})`);

        rooms[tableId] = game.getIcons([...getPlayerIds(tableId), socket.id]);
        io.to(tableId).emit("updatedIcons", rooms[tableId]);
    });

    socket.on("solve", (icon) => {
        const [, tableId] = socket.rooms.values();

        console.log("attempt to solve", icon, tableId);

        game.isMatchingIcon(icon, rooms[tableId][socket.id], rooms[tableId].table);

        rooms[tableId] = game.getIcons(getPlayerIds(tableId));
        io.to(tableId).emit("updatedIcons", rooms[tableId]);
    });

    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);

        const tableId = getTableIdForPlayerId(socket.id);
        console.log("disconnect table", tableId);

        if (tableId) {
            delete rooms[tableId][socket.id];

            rooms[tableId] = game.getIcons(getPlayerIds(tableId));
            io.to(tableId).emit("updatedIcons", rooms[tableId]);
        }
    });
});

console.log("server listening on port 3000");
httpServer.listen(3000);
