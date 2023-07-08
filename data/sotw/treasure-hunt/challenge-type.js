export default {
    collection: [
        {
            type: 'anagram',
            params: {
                type: "object",
                properties: {
                    inputText: {type: 'string'},
                    outputLength: {type: 'number'},
                },
                required: [
                    "inputText",
                    "outputLength",
                ],
            },
        },
        {
            type: 'bpc',
            params: {
                type: "object",
                properties: {
                    inputs: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: {type: 'string'},
                                caption: {type: 'string'},
                            },
                            required: ["name"],
                        },
                    },
                },
                required: ["inputs"],
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
                type: "object",
                properties: {
                    prompt: {type: 'string'},
                },
                required: ["prompt"],
            },
        },
        {
            type: 'toggle-matrix',
            params: {
                type: "object",
                properties: {
                    dimensions: {
                        type: 'object',
                        properties: {
                            width: {type: 'number'},
                            height: {type: 'number'},
                        },
                        required: ["width", "height"],
                    },
                    fields: {
                        type: 'object',
                        extraProperties: {
                            type: 'array',
                            items: {
                                type: "object",
                                properties: {
                                    row: {type: 'number'},
                                    col: {type: 'number'},
                                    key: {type: 'string'},
                                    label: {type: 'string'},
                                },
                                required: ["row", "col", "key", "label"],
                            },
                        },
                    },
                },
                required: ["dimensions", "fields"],
            },
        },
        {
            type: 'quick-pick',
            params: {
                type: "object",
                properties: {
                    options: {
                        type: 'array',
                        items: {type: 'string'},
                    },
                },
                required: ["options"],
            },
        },
        {
            type: 'zebra',
            params: null, // this is one of the most complex-to-parametrize components
        },
        {
            type: 'choice.picture',
            params: {
                type: "object",
                properties: {
                    urlPrefix: {type: 'string'},
                    options: {
                        type: 'array',
                        items: {type: 'string'},
                    },
                },

            },
        },
        {
            type: "choice.value-label",
            params: {
                options: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            value: {type: 'string'},
                            label: {type: 'string'},
                        },
                        required: ["value", "label"],
                    },
                },
            },
        },
    ],
}
