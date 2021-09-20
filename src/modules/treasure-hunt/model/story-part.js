export default {
    type: 'schema',
    fields: {
        story: {
            type: 'relation',
            target: 'treasure-hunt.story',
        },
        title: {type: 'string'},
        readOrder: {type: 'number'},
        slug: {type: 'string'},

        contentBlocks: {type: 'json'},
        contentHtml: {type: 'string'},
        challenge: {type: 'relation', target: 'treasure-hunt.challenge'},
    },
}
