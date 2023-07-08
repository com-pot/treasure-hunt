import pino from "pino";
import pretty from "pino-pretty"

const options: Parameters<typeof pino>[0] = {

}
let logger: ReturnType<typeof pino>
if (process.env.DEV) {

    const stream = pretty({
        colorize: true,
    })
    logger = pino(options, stream)
} else {
    logger = pino(options)
}

export default logger
