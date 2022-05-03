export default {
    collection: [
        {
            type: 'anagram',
            params: {
                inputText: {type: 'string'},
                outputLength: {type: 'number'},
            },
        },
        {
            type: 'bpc',
            params: {
                inputs: {
                    type: 'list',
                    innerType: {
                        type: 'schema',
                        fields: {
                            name: {type: 'string', required: true},
                            caption: {type: 'string'},
                        },
                    },
                },
            },
        },
        {
            type: 'rings',
            params: null, // rings minigame parametrization is a bit far off. Config is in the UI for now.
        },
        {
            type: 'combo-pick',
            params: null, // same as rings
        },
        {
            type: 'drums',
            params: null, //maybe we could parametrize the drums and the playback sequences?
        },
        {
            type: 'mix-match',
            params: null, // the structure configuration needs quite somelove and I have the needed volume on me rn
        },
        {
            type: 'password',
            params: {
                prompt: {type: 'string'},
            },
        },
        {
            type: 'toggle-matrix',
            params: {
                dimensions: {
                    type: 'schema',
                    fields: {
                        width: {type: 'number'},
                        height: {type: 'number'},
                    },
                },
                fields: {
                    type: 'map',
                    innerType: {
                        type: 'list',
                        fields: {
                            row: {type: 'number'},
                            col: {type: 'number'},
                            key: {type: 'string'},
                            label: {type: 'string'},
                        },
                    },
                },
            },
        },
        {
            type: 'quick-pick',
            params: {
                options: {
                    type: 'list',
                    innerType: {type: 'string'},
                },
            },
        },
        {
            type: 'zebra',
            params: null, // this is one of the most complex-to-parametrize components
        },
        {
            type: 'choice.picture',
            params: {
                urlPrefis: {type: 'string'},
                options: {type: 'list', innerType: {type: 'string'}},
            },
        },
        {
            type: "choice.value-label",
            params: {
                options: {
                    type: 'list',
                    innerType: {
                        type: 'schema',
                        fields: {
                            value: {type: 'string'},
                            label: {type: 'string'},
                        },
                    },
                },
            },
        },
    ],
}
