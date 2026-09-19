import { leagueID } from "$lib/utils/leagueInfo"
import { round } from "$lib/utils/helperFunctions/universalFunctions"
import { waitForAll } from "$lib/utils/helperFunctions/multiPromise"
import { json, error } from '@sveltejs/kit';

const POSITION_QUERY = 'position[]=DB&position[]=DEF&position[]=DL&position[]=FLEX&position[]=IDP_FLEX&position[]=K&position[]=LB&position[]=QB&position[]=RB&position[]=REC_FLEX&position[]=SUPER_FLEX&position[]=TE&position[]=WR&position[]=WRRB_FLEX&order_by=ppr';

export async function GET() {
    // get NFL state from sleeper (week and year)
    const [nflStateRes, leagueDataRes, playoffsRes] = await waitForAll(
        fetch(`https://api.sleeper.app/v1/state/nfl`, {compress: true}),
        fetch(`https://api.sleeper.app/v1/league/${leagueID}`, {compress: true}),
        fetch(`https://api.sleeper.app/v1/league/${leagueID}/winners_bracket`, {compress: true}),
    )

    const [nflState, leagueData, playoffs] = await waitForAll(
        nflStateRes.json(),
        leagueDataRes.json(),
        playoffsRes.json(),
    )

	let year = nflState.league_season;
    const regularSeasonLength = leagueData.settings.playoff_week_start - 1;
    const playoffLength = playoffs.pop().r;
    const fullSeasonLength = regularSeasonLength + playoffLength;

    // how many weeks already have final stats, used to blend actual
    // performance into the rest-of-season power rankings projections
    let completedWeeks = 0;
    if(nflState.season_type == 'regular') {
        completedWeeks = Math.max(0, nflState.week - 1);
    } else if(nflState.season_type == 'post') {
        completedWeeks = regularSeasonLength;
    }

    const projectionPromises = [
        fetch(`https://api.sleeper.app/v1/players/nfl`, {compress: true})
    ];

    for(let week = 1; week <= fullSeasonLength + 3; week++) {
        projectionPromises.push(
            fetch(`https://api.sleeper.app/projections/nfl/${year}/${week}?season_type=regular&${POSITION_QUERY}`, {compress: true})
        );
    }

    const statsPromises = [];
    for(let week = 1; week <= completedWeeks; week++) {
        statsPromises.push(
            fetch(`https://api.sleeper.app/stats/nfl/${year}/${week}?season_type=regular&${POSITION_QUERY}`, {compress: true})
        );
    }

	const responses = await waitForAll(...projectionPromises, ...statsPromises);

    const resJSONs = [];
    for(const res of responses) {
        if(!res.ok) {
            throw error(500, "No luck");
        }
        resJSONs.push(res.json());
    }

    const allData = await waitForAll(...resJSONs);

    const playerData = allData.shift(); // first item is all player data
    const weeklyData = allData.splice(0, fullSeasonLength + 3); // remaining projection weeks
    const actualWeeklyData = allData; // whatever's left is actual stats, one entry per completed week

    const scoringSettings = leagueData.scoring_settings;

    return json(computePlayers(playerData, weeklyData, actualWeeklyData, scoringSettings));
}

const computePlayers = (playerData, weeklyData, actualWeeklyData, scoringSettings) => {
    const computedPlayers = {};

    // create non weekly dependent player info
    for(const id in playerData) {
        const projPlayer = playerData[id];
        const player = {
            // injury_notes: projPlayer.injury_notes,
            fn: projPlayer.first_name,
            ln: projPlayer.last_name,
            pos: projPlayer.position,
        };
        if(projPlayer.team) {
            player.t = projPlayer.team;
            player.wi = {};
        }
        if(projPlayer.team && projPlayer.injury_status) {
            player.is = projPlayer.injury_status;
        }

        computedPlayers[id] = player;
    }

    // add weekly projections
    for(let week = 1; week <= weeklyData.length; week++) {
        for(const player of weeklyData[week - 1]) {
            const id = player.player_id;

            // check if the player is active in the NFL
            if(computedPlayers[id] == null || !computedPlayers[id].wi) continue;

            computedPlayers[id].wi[week] = {
                p: calculateProjection(player.stats, scoringSettings),
                o: player.opponent
            }
        }
    }

    // add actual points for completed weeks, used to blend performance
    // into the rest-of-season power rankings projections
    for(let week = 1; week <= actualWeeklyData.length; week++) {
        for(const player of actualWeeklyData[week - 1]) {
            const id = player.player_id;

            if(computedPlayers[id] == null || !computedPlayers[id].wi || !computedPlayers[id].wi[week]) continue;

            computedPlayers[id].wi[week].a = calculateProjection(player.stats, scoringSettings);
        }
    }

    computedPlayers["OAK"] = computedPlayers["LV"];
    return computedPlayers;
}

const calculateProjection = (projectedStats, scoreSettings) => {
    let score = 0
    for(const stat in projectedStats) {
        const multiplier = scoreSettings[stat] ? scoreSettings[stat] : 0;
        score += projectedStats[stat] * multiplier;
    }
    return round(score);
}
