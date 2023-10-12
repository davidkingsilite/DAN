const allowedOrigins = require('./allowedOrigins')

const corpsOptions = {
    origin: (origin, callback)=> {
        if(allowedOrigins.indexOf(origin) !== -1 ){
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
   
    optionsSuccessStatus: 200

}

module.exports = corpsOptions