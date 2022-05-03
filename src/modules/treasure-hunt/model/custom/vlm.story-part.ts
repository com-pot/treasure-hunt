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

type ClueChaseConfig = {
    path: string[],
    errorContents: {
        default: any,
        [currentStep: string]: any,
    },
    finishItem: string,
}
const chaseConfig: ClueChaseConfig = {
    path: [
        "ve-studne-zije-vodnik",
        "videls-tu-veverku",
        "a-nejhorsi-jsou-ty-neviditelny",
        "rodeo-rodeo-rodeooo",
        "kdyz-ja-jim-dam",
        "mela-kozy-jako-vozy"
    ],
    errorContents: {
        default: [
            {
                "type": "text",
                "config": {
                    "blocks": [
                        {"id": "fwGfuIc2mp", "type": "paragraph", "data": { "text": "\nBohužel, chlapec ti zmizel z&nbsp;dohledu/ nebo jdeš nesprávným\nsměrem - začni znovu od začátku." } }
                    ],
                    "html": "<p id=\"fwGfuIc2mp\">\nBohužel, chlapec ti zmizel z&nbsp;dohledu/ nebo jdeš nesprávným\nsměrem - začni znovu od začátku.</p>",
                }
            },

        ],
    },
    finishItem: 'jen-pockej:finish',
}

const searchLocationConfig: {correctLocation: string, wrongLocations: Record<string, {message: string, timeoutMinutes: number}>} = {
    correctLocation: "cuatro-rosas",
    wrongLocations: {
        'tearoom': {
            timeoutMinutes: 5,
            message: "Vcházíš do čajovny, před kterou si hrál Chorche s chlapcem. Jdeš si promluvit s čajovníkem. Ten ti po ukázání fotografií stále tvrdí, že muže nezná. Když na něj vytáhneš to, že podle protokolu zde měli chodit pravidelně, tak si povzdechne a řekne pravdu. Prý se jen nechtěl dostat do problémů. Chorche sedával venku a hrával kuličky a jiné hry s jeho synem. Zatím co Pedro přicházel později od doktora a vždy si objednal bylinkový čaj na průdušky. Seděli u okna a koukali ven. Když ho viděl naposledy, bylo to před tím přepadením. To ani čaj nevypil a najednou odešel. Inu, nic moc důležitého ti neřekl a jen tě zdržel dobrých {{minutes}} minut. Kam půjdeš dál?",
        },
        'doctors-office': {
            timeoutMinutes: 15,
            message: "Přijdeš do ordinace doktora, sestřička tě usadí. Doktor má u sebe ještě pacienta, tak musíš počkat. Po nějaké chvíli k němu konečně můžeš. Ptáš se ho na Chorcheho a Pedra. O Chorchem ti řekne, že mohl konstatovat jen „smrt zaviněnou střelným zraněním“. Pokud jde o Pedra, chápe, že je hledaným zločincem, ale nic podstatného ti říct o něm nemůže. Snad jen krom toho, že mu ten mizera ukradl čistý alkohol, který si schoval v lahvičkách od éteru. Jinak veškeré záznamy pacienta podléhají lékařskému tajemství. Když odcházíš, jen ucedí poznámku, že pokud ho opravdu tak moc chceš najít, musíš si pospíšit, jinak by tě mohli předběhnout supi. Inu, nic moc důležitého ti neřekl a jen tě čekání v ordinaci zdrželo dobrých {{minutes}} minut. Kam půjdeš dál?",
        },
        'san-lazaro': {
            timeoutMinutes: 10,
            message: "Dojedeš kousek za město na kopec San Lázaro. Zde se dle všeho Pedro a Chorche setkávali s Josém Antoniem a kupovali si zásoby. Nedaleko odtud také prý došlo k přepadení obchodníka. Nic zajímavého ani důležitého tu nenacházíš. Cesta sem tě zdržela dobrých {{minutes}} minut. Kam půjdeš dál?",
        },
        'stables': {
            timeoutMinutes: 5,
            message: "Ve stájích najdeš majitele a ptáš se ho na Pedra a Chorcheho. Dost rozhořčeně ti začne vykládat o Chorchem, jak k němu přišel před 4 měsíci a požádal o práci. Zpočátku to bylo fajn. K práci se uměl postavit čelem. Rozhodně nemohl na Chorcheho stěžovat. Jeho kamarád si tam ustájil koně. Takovou starou herku a Chorche si tu a tam přivedl svého oslíka. Pak ale jednoho dne ukradl dva koně a použil je prý k loupežnému přepadení. Dál už jen pokračoval se spoustou nadávek. Inu, nic moc důležitého ti neřekl a jen tě zdržel dobrých {{minutes}} minut. Kam půjdeš dál?",
        },
        default: {
            timeoutMinutes: 5,
            message: "Ztratila se ti cesta před nosem. Blouhíš zhruba {{minutes}}",
        },
    },
}

const toAlamoConfig: {correctLocation: string, wrongLocations: Record<string, {message: string, timeoutMinutes: number}>} = {
    correctLocation: "reynosa",
    wrongLocations: {
        'alamo': {
            timeoutMinutes: 5,
            message: "Bohužel lístek až do Alama tu koupit nemohu.",
        },
        default: {
            timeoutMinutes: 5,
            message: "kdepak to není má cílová destinace",
        },
    },
}

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
    'clue-chase': (answer, challenge, data) => {
        const path = chaseConfig.path

        const currentStep = data?.currentStep

        const iCurrent = path.findIndex((item) => item === currentStep)
        const iAnswer = path.findIndex((item => item === answer.value))

        if (iAnswer === iCurrent + 1) {
            const final = iAnswer === path.length
            const result: ReturnType<AnswerEvaluationController> = {
                status: 'custom',
                evaluationEffects: [
                    {type: 'updateProgressionData', arguments: {data: {currentStep: answer.value}}}
                ],
            }
            if (final) {
                result.evaluationEffects?.push({
                    type: 'collectItem', arguments: {itemName: chaseConfig.finishItem,},
                })
            }

            return result
        }

        if (iAnswer === iCurrent) {
            return {status: 'custom'}
        }

        return {
            status: 'ko',
            evaluationEffects: [
                {type: 'updateProgressionData', arguments: {data: {currentStep: null}}},
                {
                    type: 'changeClueContents', arguments: {
                        blocks: chaseConfig.errorContents[currentStep] || chaseConfig.errorContents.default,
                    },
                },
            ],
        }
    },
    'chorche-hints': (answer, challenge, data) => {
        if (answer.value === searchLocationConfig.correctLocation) {
            return {status: 'ok'}
        }

        const wrongLocation = searchLocationConfig.wrongLocations[answer.value] || searchLocationConfig.wrongLocations.default
        const visitedPlaces = data?.visitedPlaces || []

        const result: ReturnType<AnswerEvaluationController> = {
            status: 'custom',
            evaluationEffects: [
                {
                    type: 'treasure-hunt.ui.displayContent', arguments: {
                        template: wrongLocation.message.replace('{{minutes}}', ''+wrongLocation.timeoutMinutes),
                    },
                },
            ],
        }


        if (!visitedPlaces.includes(answer.value)) {
            visitedPlaces.push(answer.value)
            result.evaluationEffects?.push(
                {type: 'timeout', arguments: {duration: wrongLocation.timeoutMinutes * 60}},
                {type: 'updateProgressionData', arguments: {data: {visitedPlaces}}}
            )
        }

        return result
    },
    'trip:to-alamo': (answer, challenge, data) => {
        if (answer.value === toAlamoConfig.correctLocation) {
            return {status: 'ok'}
        }

        const wrongLocation = toAlamoConfig.wrongLocations[answer.value] || toAlamoConfig.wrongLocations.default
        const visitedPlaces = data?.visitedPlaces || []

        const result: ReturnType<AnswerEvaluationController> = {
            status: 'custom',
            evaluationEffects: [
                {
                    type: 'treasure-hunt.ui.displayContent', arguments: {
                        template: wrongLocation.message.replace('{{minutes}}', ''+wrongLocation.timeoutMinutes),
                    },
                },
            ],
        }


        if (!visitedPlaces.includes(answer.value)) {
            visitedPlaces.push(answer.value)
            result.evaluationEffects?.push(
                {type: 'timeout', arguments: {duration: wrongLocation.timeoutMinutes * 60}},
                {type: 'updateProgressionData', arguments: {data: {visitedPlaces}}}
            )
        }

        return result
    },
}
