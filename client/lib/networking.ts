import { io, Socket } from "socket.io-client";

let socket: undefined | ReturnType<typeof io> = undefined;

type Icon = string;

export function connect(tableId: string): Promise<typeof socket | undefined> | undefined {
    if (typeof window === "undefined") {
        return;
    }

    return new Promise((resolve, reject) => {
        socket = io("http://localhost:3000");
        socket.on("connect", () => {
            console.log(socket?.id);
            socket?.emit("joinTable", tableId);

            resolve(socket);
        });
    });
}

export function disconnect() {
    socket?.disconnect();
    socket = undefined;
}

export function onUpdatedIcons(callback: (data: { table: Icon[]; [key: string]: Icon[] }) => void) {
    socket?.on("updatedIcons", callback);
}

export function solve(icon: Icon) {
    socket?.emit("solve", icon);
}
