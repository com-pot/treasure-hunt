const mongoUrl = process.env.MONGO_URL
if (!mongoUrl) {
    throw new Error("Missing env variable MONGO_URL")
}

export default {
    staticDataMask: 'data/$tenantName',
    mongo: {
        url: mongoUrl,
    },
}
