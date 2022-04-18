import React, { useState, useRef } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import shuffle from "lodash.shuffle";

import * as networking from "../../lib/networking";
import { useRouter } from "next/router";

const Play: NextPage = () => {
    const router = useRouter();
    const [isShaking, startShaking] = useIsShaking();
    const [playerId, setPlayerId] = useState<string>();

    const [tableState, setTableState] = useState<string[]>([]);
    const [handState, setHandState] = useState<string[]>([]);
    const [opponentState, setOpponentState] = useState<{ name?: string; icons?: string[] }>({});

    const { tableId } = router.query;

    useEffect(() => {
        (async () => {
            if (tableId && typeof tableId === "string") {
                const socket = await networking.connect(tableId);
                if (!socket || !socket.id) {
                    return;
                }

                setPlayerId(socket.id);

                networking.onUpdatedIcons((result) => {
                    setOpponentState({});

                    for (const [playerId, value] of Object.entries(result)) {
                        if (playerId === "table") {
                            setTableState(result["table"]);
                        } else if (playerId === socket.id) {
                            setHandState(result[socket.id]);
                        } else {
                            setOpponentState({ name: playerId, icons: result[playerId] });
                        }
                    }
                });
            }
        })();

        () => {
            networking.disconnect();
        };
    }, [tableId]);

    return (
        <div>
            <main>
                <div style={styles.sachen}>
                    <div style={{ display: "flex" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span
                                style={{
                                    display: "flex",
                                    backgroundColor: "white",
                                    alignSelf: "start",
                                    padding: 8,
                                    marginBottom: 3,
                                }}
                            >
                                {opponentState.name}
                            </span>
                            <div style={{ display: "flex" }}>
                                {opponentState?.icons?.map((icon) => (
                                    <span key={icon} className="icon" style={{ fontSize: 30 }}>
                                        {icon}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.sachen}>
                    <div>
                        {tableState.map((icon) => (
                            <span key={icon} className="icon">
                                {icon}
                            </span>
                        ))}
                    </div>
                </div>

                <div style={styles.sachen}>
                    <div className={`me ${isShaking ? "shake" : ""}`}>
                        {handState.map((icon) => (
                            <span
                                key={icon}
                                className="icon"
                                onClick={() => {
                                    const isMatching = isMatchingIcon(icon, handState, tableState);
                                    if (isMatching) {
                                        networking.solve(icon);
                                    } else {
                                        startShaking();
                                    }
                                }}
                            >
                                {icon}
                            </span>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

function useIsShaking(): [boolean, () => void] {
    const [isShaking, setIsShaking] = useState(false);

    const startShaking = () => {
        setIsShaking(true);
        setTimeout(() => {
            setIsShaking(false);
        }, 500);
    };

    return [isShaking, startShaking];
}

const styles = {
    sachen: {
        height: "33vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
};

function isMatchingIcon(icon: string, handState: string[], tabelState: string[]) {
    return handState.includes(icon) && tabelState.includes(icon);
}

export default Play;
