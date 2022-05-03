import { AnswerEvaluationController } from "../story-part.service";

type TripDuration = {h: number, m: number}
const toDurangoTravelMap: Record<string, TripDuration> = {
    'mgdl-chhh-trrn-drng': {h: 2, m: 45},
    'mgdl-cssg-prrl-drng': {h: 2, m: 0},
    'mgdl-cssg-lfrt-clcn-drng': {h: 2, m: 10},
    'mgdl-hrms-jssm-drng': {h: 1, m: 30},
    'mgdl-hrms-bnvs-clcn-drng': {h: 2, m: 10},
    'mgdl-drng': {h: 3, m: 0},

}
const tripSeconds = (trip: TripDuration) => trip.h * 60 * 60 + trip.m * 60
export const vlmAnswerEvaluationControllers: Record<string, AnswerEvaluationController> = {
    'time-tables:durango': (answer, challenge) => {
        let trip = toDurangoTravelMap[answer.value]
        if (!trip) {
            console.error("Invalid trip", answer.value);
            trip = {h: 2, m: 15}
        }

        return {
            status: 'custom',
            evaluationEffects: [
                {type: 'timeout', arguments: {duration: tripSeconds(trip)}},
            ],
        }
    },
}
