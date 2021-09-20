import jsonwebtoken from "jsonwebtoken"

export default class JwtService {
    constructor(options) {
        if (!options.secret) {
            throw new Error('missing options.secret')
        }

        this.secret = options.secret
        this.algorithm = options.algo || "HS256"
    }

    create(claims, options) {
        const payload = {...claims}
        let duration = 'duration' in options ? options.duration : (60 * 1000)
        if (typeof duration === 'number') {
            payload.exp = Math.round(Date.now() / 1000) + duration
        }

        return jsonwebtoken.sign(payload, this.secret, {
            algorithm: this.algorithm,
        })
    }

    parseValid(token) {
        return jsonwebtoken.verify(token, this.secret, {algorithms: [this.algorithm]})
    }
}
