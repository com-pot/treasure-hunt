if (!process.env.AUTH_SECRET) {
    throw new Error("Missing AUTH_SECRET")
}

export default {
    authSecret: process.env.AUTH_SECRET,
}
