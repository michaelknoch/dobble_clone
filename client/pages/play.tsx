import React, { useState, useRef } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import shuffle from "lodash.shuffle";

function useCustomIrgendwas() {
    const [tableState, setTableState] = useState<Icon[]>([]);
    const [handState, setHandState] = useState<Icon[]>([]);

    function nextRound() {
        const result = getIcons();

        setTableState(result.table);
        setHandState(result.hand);
    }
}

const Play: NextPage = () => {
    const [tableState, setTableState] = useState<Icon[]>([]);
    const [handState, setHandState] = useState<Icon[]>([]);

    let startedAt = useRef<Date>(new Date());

    useEffect(() => {
        nextRound();
    }, []);

    function nextRound() {
        const result = getIcons();

        setTableState(result.table);
        setHandState(result.hand);

        startedAt.current = new Date();
    }

    return (
        <div>
            <main>
                <div style={styles.sachen}>
                    <div>
                        {tableState.map((icon) => (
                            <span className="icon">{icon}</span>
                        ))}
                    </div>
                </div>

                <div style={styles.sachen}>
                    <div>
                        {handState.map((icon) => (
                            <span
                                onClick={() => {
                                    const isMatching = isMatchingIcon(icon, handState, tableState);
                                    if (isMatching) {
                                        let diff = (new Date() - startedAt.current) / 1000;
                                        alert(diff);
                                        nextRound();
                                    } else {
                                        alert("neiih");
                                    }
                                }}
                                className="icon"
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

const styles = {
    sachen: {
        height: "50vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
};

const ALL_ICONS = ["🎉", "💩", "🏳️‍🌈", "🦠", "🐬", "🙈", "🐒", "💰", "🤓"] as const;
const AMOUNT_OF_ICONS = 5;

type Icon = typeof ALL_ICONS[number];

function getIcons(): { table: Icon[]; hand: Icon[] } {
    // debugger;
    const remainingIcons = [...ALL_ICONS];
    const randomIcons = getRandomElements(remainingIcons, AMOUNT_OF_ICONS);

    return {
        table: [...randomIcons],
        hand: shuffle([randomIcons[0], ...getRandomElements(remainingIcons, AMOUNT_OF_ICONS - 1)]),
    };
}

function isMatchingIcon(icon: Icon, handState: Icon[], tabelState: Icon[]) {
    return handState.includes(icon) && tabelState.includes(icon);
}

function getRandomElements(source: Icon[], amountOfElements = 1) {
    let result: Icon[] = [];
    for (let i = 0; i < amountOfElements; i++) {
        let index = Math.floor(Math.random() * source.length);
        let randomElement = source[index];
        source.splice(index, 1);
        result.push(randomElement);
    }
    return result;
}

export default Play;
