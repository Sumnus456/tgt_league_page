// How much weight actual performance gets vs. the raw projection, based on
// how many weeks of the season have already been completed. completedWeeks
// of 0 signals "no blending" -- the caller should use the raw projection.
const getBlendWeights = (completedWeeks) => {
    if(completedWeeks <= 0) return null;
    if(completedWeeks <= 2) return { actual: 0.2, proj: 0.8 };
    if(completedWeeks <= 7) return { actual: 0.5, proj: 0.5 };
    if(completedWeeks <= 12) return { actual: 0.7, proj: 0.3 };
    return { actual: 0.85, proj: 0.15 };
}

// Average of a player's actual scored points across completed weeks,
// only counting weeks they actually played (pts > 0). Returns null if
// they haven't played any completed week yet (e.g. a rookie or new add),
// so the caller can fall back to the raw projection instead of unfairly
// blending in a zero.
const getActualPPG = (player, completedWeeks) => {
    let total = 0;
    let gamesPlayed = 0;
    for(let wk = 1; wk <= completedWeeks; wk++) {
        const actual = player.wi && player.wi[wk] ? parseFloat(player.wi[wk].a) : 0;
        if(actual > 0) {
            total += actual;
            gamesPlayed++;
        }
    }
    return gamesPlayed > 0 ? total / gamesPlayed : null;
}

const getBlendedScore = (player, week, completedWeeks, blendWeights) => {
    const projected = parseFloat(player.wi && player.wi[week] ? player.wi[week].p : 0) || 0;
    if(!blendWeights) return projected;

    const actualPPG = getActualPPG(player, completedWeeks);
    if(actualPPG == null) return projected;

    return (actualPPG * blendWeights.actual) + (projected * blendWeights.proj);
}

export const predictScores = (players, week, leagueData, completedWeeks = 0) => {
    const starterPositions = getStarterPositions(leagueData);
    const blendWeights = getBlendWeights(completedWeeks);

    // blend each player's projection for this week with their actual PPG
    // (when there's enough season played to do so) before ranking them
    const blendedPlayers = players.map((player) => ({
        ...player,
        blended: getBlendedScore(player, week, completedWeeks, blendWeights),
    }));

    // sort roster by highest blended score for that week
    const projectedPlayers = [...blendedPlayers].sort((a, b) => b.blended - a.blended);

    // now that the players are sorted, grab the QBs
    const qbs = projectedPlayers.filter(p => p.pos == 'QB');
    // and the WRs
    const wrs = projectedPlayers.filter(p => p.pos == 'WR');
    // and the RBs
    const rbs = projectedPlayers.filter(p => p.pos == 'RB');
    // and the TEs
    const tes = projectedPlayers.filter(p => p.pos == 'TE');
    // and the DEFs
    const defs = projectedPlayers.filter(p => p.pos == 'DEF');
    // and the Ks
    const ks = projectedPlayers.filter(p => p.pos == 'K');
    // and the DLs
    const dls = projectedPlayers.filter(p => p.pos == 'DL');
    // and the LBs
    const lbs = projectedPlayers.filter(p => p.pos == 'LB');
    // and the DBs
    const dbs = projectedPlayers.filter(p => p.pos == 'DB');

    let powerScore = 0;
    // next, use the roster configuration to grab the highest scorer at each position
    for(const starterPosition of starterPositions) {
        const qb = qbs[0]?.blended ?? 0;
        const rb = rbs[0]?.blended ?? 0;
        const wr = wrs[0]?.blended ?? 0;
        const te = tes[0]?.blended ?? 0;
        const dl = dls[0]?.blended ?? 0;
        const lb = lbs[0]?.blended ?? 0;
        const db = dbs[0]?.blended ?? 0;
        const k = ks[0]?.blended ?? 0;
        const def = defs[0]?.blended ?? 0;
        switch (starterPosition) {
            case 'QB':
                qbs.shift();
                powerScore += qb;
                break;
            case 'RB':
                rbs.shift();
                powerScore += rb;
                break;
            case 'WR':
                wrs.shift()
                powerScore += wr;
                break;
            case 'TE':
                tes.shift();
                powerScore += te;
                break;
            case 'DEF':
                defs.shift();
                powerScore += def;
                break;
            case 'K':
                ks.shift();
                powerScore += k;
                break;
            case 'DL':
                dls.shift();
                powerScore += dl;
                break;
            case 'LB':
                lbs.shift();
                powerScore += lb;
                break;
            case 'DB':
                dbs.shift();
                powerScore += db;
                break;
            // Start of flex players
            case 'FLEX':
                if(rb >= wr && rb >= te) {
                    rbs.shift();
                    powerScore += rb;
                } else if (wr >= rb && wr >= te) {
                    wrs.shift();
                    powerScore += wr;
                } else {
                    tes.shift();
                    powerScore += te;
                }
                break;
            case 'WRRB_FLEX':
                if(rb >= wr) {
                    rbs.shift();
                    powerScore += rb;
                } else {
                    wrs.shift();
                    powerScore += wr;
                }
                break;
            case 'SUPER_FLEX':
                if(qb >= wr && qb >= te && qb >= rb) {
                    qbs.shift();
                    powerScore += qb;
                } else if (rb >= wr && rb >= te && rb >= qb) {
                    rbs.shift();
                    powerScore += rb;
                } else if (wr >= rb && wr >= te && wr >= qb) {
                    wrs.shift();
                    powerScore += wr;
                } else {
                    tes.shift();
                    powerScore += te;
                }
                break;
            case 'IDP':
                if(dl >= lb && dl >= db) {
                    dls.shift();
                    powerScore += dl;
                } else if (lb >= dl && lb >= db) {
                    lbs.shift();
                    powerScore += lb;
                } else {
                    dbs.shift();
                    powerScore += db;
                }
                break;
            default:
                break;
        }
    }
    return powerScore;
}

export const getStarterPositions = (leagueData) => {
    const rosterPositions = leagueData.roster_positions;
    const firstBench = rosterPositions.indexOf('BN');

    return rosterPositions.slice(0, firstBench);
}