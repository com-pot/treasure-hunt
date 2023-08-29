import jsonwebtoken, {Algorithm, JwtPayload} from "jsonwebtoken"
export { TokenExpiredError } from "jsonwebtoken"

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
        const duration = 'duration' in options ? options.duration : (60 * 1000)
        if (typeof duration === 'number') {
            Object.assign(payload, {exp: Math.round(Date.now() / 1000) + duration})
        }

        return jsonwebtoken.sign(payload, this.secret, {
            algorithm: this.algorithm,
        })
    }

    parseValid<T extends JwtPayload>(token: string): T {
        const parsed = jsonwebtoken.verify(token, this.secret, {algorithms: [this.algorithm]})
        if (typeof parsed !== 'object') {
            throw new Error("Could not parse JWT payload to object")
        }
        return parsed as T
    }
}
