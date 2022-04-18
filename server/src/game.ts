import shuffle from "lodash.shuffle";

const ALL_ICONS = [
    "🎉",
    "💩",
    "🏳️‍🌈",
    "🦠",
    "🐬",
    "🙈",
    "🐒",
    "💰",
    "🤓",
    "👻",
    "🤯",
    "🤳",
    "💋",
    "💂‍♂️",
    "🥷",
    "☂️",
    "🧙🏻‍♀️",
    "🧘🏻‍♀️",
    "🏂🏼",
] as const;
const AMOUNT_OF_ICONS = 8;

export type Icon = typeof ALL_ICONS[number];

export function getIcons(playerIds: string[]): { table: Icon[]; [key: string]: Icon[] } {
    const remainingIcons = [...ALL_ICONS];
    const randomIcons = getRandomElements(remainingIcons, AMOUNT_OF_ICONS);

    return {
        table: [...randomIcons],
        ...playerIds.reduce(
            (acc, id) => ({
                ...acc,
                [id]: shuffle([
                    randomIcons[0],
                    ...getRandomElements([...remainingIcons], AMOUNT_OF_ICONS - 1),
                ]),
            }),
            {}
        ),
    };
}

export function isMatchingIcon(icon: Icon, handState: Icon[], tableState: Icon[]) {
    return handState.includes(icon) && tableState.includes(icon);
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
