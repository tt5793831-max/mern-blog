const express=require('express')
const cors=require('cors')
const {connect}=require('mongoose')
require('dotenv').config()
const upload=require('express-fileupload')

const userRoutes=require('./routes/userRoutes')
const postRoutes=require('./routes/postRoutes')
const {notFound, errorHandler} = require('./middleware/errorMiddleware')

const app = express()

app.use(cors()) // CORS လိုအပ်ရင် ထည့်ပေးပါ
app.use(express.json({extended: true}))
app.use(express.urlencoded({extended: true}))
app.use(upload())
app.use('/uploads', express.static(__dirname + '/uploads'))

// 1. Routes များကို အပေါ်ဘက်တွင် အရင်ချိတ်ဆက်ပါ
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)

// 2. Not Found Middleware ကို Routes တွေရဲ့ အောက်မှာ ထားပါ
app.use(notFound)

// 3. Error Handler Middleware များကို အနောက်ဆုံးတွင် ထားပါ
app.use(errorHandler)

// Server စတင်ရန်နှင့် Database ချိတ်ဆက်ရန်
connect(process.env.MONGO_URL)
  .then(() => {
      app.listen(process.env.PORT || 5000, () => console.log("Server running on port " + (process.env.PORT || 5000)))
  })
  .catch(error => console.log(error))