export default {
    collection: [
        {
            id: "sotw.ch-1.understand",
            name: "Pochop",
            description: "Mladý Ted je očividně stále omámen bylinami a má problém se soustředit. Pomoz mu si spojit různá gesta a správné významy. Zkus pochopit, co které gesto znamená a pak pro to, aby se je Ted naučil, mu musíš rychle našeptávat do ucha jejich správný význam, než ztratí koncentraci. Pokud si gesta a významy spleteš i ty, tak musíš začít od znovu.",
            type: 'quick-pick',
            challengeConfig: {
                options: ["drink","walk","deer","sleep","grass","bison","horse","see","baby","eat"],
            },
            checkSum: '3',
            onError: [
                ['message', "Ale né musíme to zkusit znova!"],
            ],
        },
        {
            id: "sotw.ch-2.who-is-she",
            name: "Krásná, neznámá",
            description: "Ted se potřebuje spřátelit s indiány a tak by bylo dobré, kdyby projevil úctu a správně dívku oslovil jménem. Ovšem při všem tom včerejším učení její jméno zapomenul. Tvá paměť určitě ale není tak krátká jako Tedova a určitě mu budeš umět do ucha pošeptat jméno indiánské dívky.",
            type: 'password',
            challengeConfig: {prompt: "Jak se jen jmenuje??"},
            checkSum: '3b56a399',
            onError: [
                ['message', "Ne ne! To není ono musíš si vzpomenout, jak se jmenovala !"],
                ['gameState', "reset"],
            ],
        },
        {
            id: 'sotw.ch-3.reipe',
            name: "Recept",
            description: "Dění kolem Teda pohltilo veškerou tvou pozornost. Takže odjezd lovců unikl tvé pozornosti. Je ti ho ale líto a proto se mu rozhodneš s hádankou pomoci.\n\nVíš že: Odjelo 22 hlav 72 nohou. Kůry musí dát tolik špetek, kolik jelo lovců. Počet koní je počet květů, které musí přidat a kolik mají koně celkem nohou tolik špetek lišejníku.",
            type: 'bpc',
            challengeConfig: {
                inputs: [
                    {name: 'bark', caption: 'Množství kůry'},
                    {name: 'petals', caption: "Počet květů"},
                    {name: 'moss', caption: "Kousků lišejníku"},
                ],
            },
            checkSum: '744b1831',
            onError: [
                ['message', "Instinkt ti říká, že tohle není správně. Musíš se víc soustředit! Špatný poměr by Teda mohl zabít!"],
            ],
        },
        {
            id: 'sotw.ch-4.name',
            name: 'Jméno',
            description: "Víš, že autor použil název „Příběh Byla Naprdla“ . Což opravdu nezní jako indiánské jméno. V tom ti to dojde, indiáni jméno přece neskloňují. Takže né „Byla Naprdla“, ale „Byl Naprdlo“. Šaman taky říkal, že tohle jméno vytvořil z původního překladu indiánského jména. Takže pokud si pohraješ s písmeny a správně je přeskládáš, měl by jsi být schopen přijít na pravé čestné jméno které si indián vysloužil . Postupně zapisuj písmena z posměšného jména a nezapomeň oddělit jednotlivé časti jména mezerou.",
            type: 'anagram',
            challengeConfig: {inputText: 'byl naprdlo', outputLength: 'byl naprdlo '.length},
            checkSum: '481a3a09',
            onError: [
                ['message', "Tohle nezní úplně správně možná to budu muset ještě trochu zpřeházet nebo změnit pořadí? Vzpomeň si na příběh - z kolika částí se skládá původní jméno"],
            ],
        },
        {
            id: 'sotw.ch-5.asabikeshiinh',
            name: "asabikeshiinh / lapač snů",
            description: "Tedova zelenkavě zářící silueta stojí uprostřed mlžného města. Z rukou pavoučí ženy vylétlo 7 barevných světel a vzduchem kolem nich poletují z pavoučího vlákna napsaná slova. Jak se zdá, chce, aby Ted přiřadil správná slova k jednotlivým barvám a to tak, aby nejprve přiřadil význam barvy v indiánské kultuře a pak i jaký efekt, nebo význam, má barva ve válečném malování. Dle všeho najdeš nápovědu, pokud najdeš 7 ochránců snů, které pavoučí žena věnovala indiánům a které si zdejší lidé připevnili na své domy. Problém je, že Ted, ačkoliv se snaží, tak se z nějakého důvodu nemůže pohnout z místa. Skoro jako by ho něco drželo. Budeš se tedy muset po městě porozhlédnout za něj a zkusit mu významy pošeptat, aby je správně přiřadil.",
            type: 'comboPick',
            challengeConfig: {
                prompts: [
                    {color: 'red'},
                    {color: 'white'},
                    {color: 'yellow'},
                    {color: 'green'},
                    {color: 'blue'},
                    {color: '#808'},
                ],
                options: {
                    default: [
                        {value: 'n/a', label: 'žádný význam'},
                        {value: 'shr', label: 'sdílení'},
                        {value: 'mag', label: 'magie'},
                        {value: 'int', label: 'intuice'},
                        {value: 'rlg', label: 'víra'},
                        {value: 'hea', label: 'léčení'},
                        {value: 'itl', label: 'intelekt'},
                    ],
                    war: [
                        {value: 'n/a', label: 'žádný význam'},
                        {value: 'cnf', label: 'sebevědomí'},
                        {value: 'enr', label: 'energie'},
                        {value: 'end', label: 'vytrvalost'},
                        {value: 'det', label: 'odhodlání'},
                        {value: 'sor', label: 'smutek'},
                    ],
                },
            },
            checkSum: '253cebd1',
            onError: [
                ['message', "Musel jsem to poplést. Radši to překontroluji"],
            ],
        },
        {
            id: 'sotw.ch-6.three-warriors',
            name: "Deska tří bojovníků",
            description: "Ted se nemůže ani pohnout, takže je to opět na tobě mu pomoci. Musíš se rozeběhnout po mlžném městě a najít desky s hvězdami, které patří třem válečníkům a spojit je do jedné. Víš, že přežilo sedm současných klanu a věříš, že ze jmen dokážeš i s trochou důvtipu určit, do kterých klanů indiánů tito válečníci patří. Pak stačí jen zakreslit všechny hvězdy do jedné desky.",
            type: 'toggleMatrix',
            challengeConfig: {
                width: 3,
                height: 3,
                fields: [
                    {row: 1, col: 1, label: 'A', key: 'albatros'},
                    {row: 2, col: 1, label: 'B', key: 'boar'},
                    {row: 3, col: 1, label: 'D', key: 'deer'},
                    
                    {row: 1, col: 2, label: 'C', key: 'cicada'},
                    {row: 2, col: 2, label: 'H', key: 'hound'},
                    {row: 3, col: 2, label: 'J', key: 'jackal'},

                    {row: 1, col: 3, label: 'F', key: 'flamingo'},
                    {row: 2, col: 3, label: 'E', key: 'emu'},
                    {row: 3, col: 3, label: 'G', key: 'grizzly'},
                ],
            },
            checkSum: '711eab77',
            onError: [
                ['message', "Na zem do písku před Teda kreslíš desku o 9 polích a zakresluješ do ní hvězdy, když v tom přiběhne pavouk, malbu smaže a zase uteče. Jak se zdá, pavoučí žena se ti snaží napovědět, že takhle to není správně a někde je chyba."],
                ['gameState', 'reset'],
            ],
        },
        {
            id: 'sotw.ch-7.shamans',
            name: "Usadit šamany",
            description: "Tohle by mohla být pro Teda šance. Pokud se uklidní, třeba vymyslí i jiné řešení než smrt.\nDíváš se na kameny a vzpomínáš na to, jak se šamani k sobě chovali za celou tu dobu, co je sleduješ. Místo šamana kmene jelenů, jakožto hostitele, je jasné, ale co ostatní? Dle toho co jsi zjistil tak:\n\nMedvědi se od nepaměti přátelí s vlky, ale pumy a buvoli jsou jejich nepřátelé.\nSovy byly vždy přáteli jelenů a nikdy neměli v oblibě medvědy a lišky.\nPumy jsou známé tím, že se s nikým výrazně nepřátelí, pouze mají spory s lišáky a sovami.\nOproti tomu vlci se snaží zavděčit pumám jak jen mohou a spřátelit se s nimi i za cenu toho, že se tím dostali do sporů s jeleny a bizony.\nDíky tomu bizoni pohrdají podlézavými vlky a namyšlenými pumami. Spřátelili se však se sovami.\nNavíc, dýmka vždy koluje od hostitele ve směru hodinových ručiček a šaman bizonů by se urazil, pokud by jí dostal před ním šaman medvědů…\n\nSnad si s tím poradím a podaří se mi naskládat kameny správně do kruhu..",
            type: 'zebraFoal',
            challengeConfig: async () => (await import('./challenge.sotw.shamans.js')).default,
            checkSum: '7630d587',
            onError: [
                ['message', "Ne když je usadíme takhle, tak budou hádat, nebo by se mohli i urazit."],
            ],
        },
        {
            id: 'sotw.ch-8.totem',
            name: "Totem",
            description: "Musíš najít příbytek Bohpoli v mlžném městě. U jeho domu bys měl najít postup, jak sestavit správné hlavy a barvy totemu. Až se ti podaří sestavit správnou podobu totemu, tak bys měl ucítit spojení se světem živých. Teprve pak se vrať za Na'ashjé'íí Asdzáá.\n\nPodle návodu u příbytku Bohpoli vyměň hlavy a barvy, aby jsi dostal správnou kombinaci totemu.",
            type: 'mixMatch',
            challengeConfig: async () => (await import('./challenge.sotw.totems.js')).default,
            checkSum: '5be7e1ec',
            onError: [
                ['message', "Ne to není ono... stále necítíš spojení se světem živých"],
            ],
        },
        {
            id: 'sotw.ch-9.rings',
            name: "Kruhová deska",
            description: "Když slyšíš její slova, jdeš blíž k misce a cítíš, jak ti opět jiskří ruka. Zkusíš natáhnout ruku k jednomu z kruhů a posunout svítící značku směrem k totemu. Opravdu, kruh se začíná otáčet, ale spolu sním i ostatní kruhy. Když pohneš druhým kruhem, tak chtě nechtě, pohneš i ostatními kruhy. Jak se zdá nebude úplně snadné. Musíš najít způsob, jak srovnat všechny značky směrem k totemu.",
            type: 'rings',
            challengeConfig: async () => (await import('./challenge.sotw.rings.js')).default,
            checkSum: '4fad461c',
            onError: [
                ['message', "Stále všechny ozářené značky nesměrují směrem nahoru k totemu"],
            ],
        },
        {
            id: 'sotw.ch-10.drums',
            name: "Bubny",
            description: "Jak se zdá, musíš zopakovat melodii, kterou bude Ted hrát na bubny.",
            type: 'drums',
            checkSum: '56afb606',
            onError: [
                ['message', "Ale ne! Popletly se ti bubny! Musíš to zkusit znovu!"],
            ],
        },
        {
            id: 'sotw.ch-11.final-choice',

            name: "Správný dar",
            description: "Musíš použít správný dar od šamanů, ke spoutání zlého ducha. Dar od kterého šamana použiješ?",
            type: 'finalChoice',
            challengeConfig: {
                options: ['bear', 'cougar', 'fox', 'deer', 'wolf', 'owl', 'bison'],
            },
            checkSum: '1af84',
            onError: [
                ['message', 'Nevybral jsi dobře ! Stvůře se navíc podařilo tě odtáhnout od oltáře. Musíš jí tedy dotáhnout zpět a to zabere dobrých 10 minut.'],
                ['timeout', 10 * 60],
            ],
        },
    ],
}
