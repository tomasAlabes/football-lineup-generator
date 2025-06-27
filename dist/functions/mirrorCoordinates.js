export function mirrorCoordinatesForAwayTeam(coords, width) {
    return {
        x: width - coords.x,
        y: coords.y
    };
}
