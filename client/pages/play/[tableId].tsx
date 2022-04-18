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

    const [tableState, setTableState] = useState<Icon[]>([]);
    const [handState, setHandState] = useState<Icon[]>([]);
    const [opponentState, setOpponentState] = useState<{ name?: string; icons?: Icon[] }>({});

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
                    for (const [key, value] of Object.entries(result)) {
                        if (key === "table") {
                            setTableState(result["table"]);
                        } else if (key === socket.id) {
                            setHandState(result[socket.id]);
                        } else {
                            setOpponentState({ name: socket.id, icons: result[key] });
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

type Icon = string;
function isMatchingIcon(icon: Icon, handState: Icon[], tabelState: Icon[]) {
    return handState.includes(icon) && tabelState.includes(icon);
}

export default Play;
