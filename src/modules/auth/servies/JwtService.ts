import jsonwebtoken, {Algorithm} from "jsonwebtoken"

type JwtServiceOptions = {
    secret: string,
    algo?: Algorithm,
}
type CreateTokenOptions = {
    duration?: number
}
export default class JwtService {
    private secret: string
    private algorithm: Algorithm

    constructor(options: JwtServiceOptions) {
        if (!options.secret) {
            throw new Error('missing options.secret')
        }

        this.secret = options.secret
        this.algorithm = options.algo || "HS256"
    }

    create(claims: object, options: CreateTokenOptions) {
        const payload = {...claims}
        let duration = 'duration' in options ? options.duration : (60 * 1000)
        if (typeof duration === 'number') {
            Object.assign(payload, {exp: Math.round(Date.now() / 1000) + duration})
        }

        return jsonwebtoken.sign(payload, this.secret, {
            algorithm: this.algorithm,
        })
    }

    parseValid(token: string) {
        return jsonwebtoken.verify(token, this.secret, {algorithms: [this.algorithm]})
    }
}
