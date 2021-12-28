"use strict"

require("dotenv").config()
const express = require("express")
const storage = require("express-session")
const bcrypt = require("bcrypt")
const app = express()
const size = require("image-size")
const canvas = require("canvas").createCanvas
const nodemailer = require("nodemailer").createTransport
const remarkable = require("remarkable").Remarkable
const mongodb = require("mongodb").MongoClient
const store = require("connect-mongo")
const server = require("http").Server(app)
const io = require("socket.io")(server)
const shared = require("express-socket.io-session")
const configuration = JSON.parse(process.env.APP_CONFIG).mongo
const parser = require("cookie-parser")
const html = require("./html.js")

const protocol = req => req.headers["x-forwarded-proto"] == "https" ? "https" : "http"
const find = collection => client.db(configuration.db).collection(collection)
const age = 3.1536e12

const client = new mongodb(
    "mongodb://" + configuration.user +
    ":" + encodeURIComponent(process.env.DATABASE) +
    "@" + configuration.hostString)

const transporter = nodemailer({
    host: "smtp.zoho.eu",
    auth: {user: process.env.EMAIL, pass: process.env.PASSWORD},
    port: 465,
    secure: true
})

const session = storage({
    cookie: {maxAge: age},
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: true,
    secure: true,

    store: store.create({
        mongoUrl: "mongodb://" + configuration.user +
            ":" + encodeURIComponent(process.env.DATABASE) +
            "@" + configuration.hostString
    }),
})

const convert = string => {
    let value = ""

    for (let i in string) {
        const code = string[i].charCodeAt()

        if (code < 35 || code > 127)
            value += `&#${code};`
        
        else value += string[i]
    }

    return value
}

io.use(shared(session, {autoSave: true}))
app.use(session)
app.use(parser())
app.use(express.urlencoded({extended: true}))
app.use(express.static(__dirname + "/public"))
  
app.use(async (req, res, next) => {
    try {
        if (/\/\w+\/.+/.test(req.url)) {
            const url = req.url.replace(/\/\w+\//, "")

            if (req.url.startsWith("/demo/")) {
                const project = await find("projects").findOne({id: {$regex: new RegExp(url, "i")}})

                if (project) {
                    const users = {}
                    const user = await find("users").findOne({name: req.session.name}, {projection: {name: 1, image: 1}})
                    const creator = await find("users").findOne({name: project.name}, {projection: {name: 1, image: 1}})
                    const views = JSON.parse(req.cookies.views || "[]")

                    const array = await find("users").find(
                        {name: {$in: project.comments.map(comment => comment.name)}},
                        {projection: {name: 1, image: 1}}).toArray()
                        
                    array.forEach(user => users[user.name] = user.image)

                    if (!views.includes(url)) {
                        await find("projects").updateOne(
                            {id: {$regex: new RegExp(url, "i")}},
                            {$inc: {views: 1}})

                        views.push(url)
                        res.cookie("views", JSON.stringify(views), {httpOnly: true, maxAge: age})
                    }

                    return res.send(html.demo(user, creator, req.get("host"), project, users, new remarkable({breaks: true})))
                }
            }

            if (req.url.startsWith("/project/")) {
                const project = await find("projects").findOne({id: {$regex: new RegExp(url, "i")}})
                return res.send(html.template(project, convert(project.code)))
            }

            if (req.url.startsWith("/profile/")) {
                const profile = await find("users").findOne({name: {$regex: new RegExp(url, "i")}})
                const user = await find("users").findOne({name: req.session.name}, {projection: {name: 1, image: 1}})

                const projects = await find("projects").find(
                    {name: {$regex: new RegExp(url, "i")}},
                    {projection: {id: 1, image: 1, smiles: 1}}).toArray()

                return res.send(html.profile(user, profile, req.get("host"), protocol(req), projects))
            }

            if (req.url.startsWith("/verify/")) {
                const set = await find("verify").findOne({address: url})

                if (set) {
                    req.session.name = set.name
                    await find("users").updateOne({name: set.name}, {$set: {password: set.password}})
                    return res.redirect("/")
                }
                
                return res.send(html.expired())
            }
        }
    }

    catch (error) {next(error)}
    next()
})

app.use(async (error, req, res, next) => {
    try {
        const bug = await find("errors").findOne({message: error.message})
        if (bug) await find("errors").updateOne({message: error.message}, {$inc: {index: 1}})
        else await find("errors").insertOne({message: error.message, stack: error.stack, index: 1})
    }

    catch (error) {console.log(error)}
})

app.get("/sitemap.xml", async (req, res, next) => {
    try {
        let content = `<?xml version = "1.0" encoding = "UTF-8"?><urlset xmlns = "http://www.sitemaps.org/schemas/sitemap/0.9">`

        const insert = (url, change, priority) => {
            content += (
                `<url><loc>${protocol(req)}://${req.get("host")}/${url}</loc>` +
                `<changefreq>${change}</changefreq>` +
                `<priority>${priority}</priority></url>`
            )
        }

        insert("", "monthly", 1)
        insert("gallery", "hourly", 0.9)
        insert("create", "monthly", 0.5)
        insert("sign", "monthly", 0.5)
        insert("password", "monthly", 0.5)

        const users = await find("users").find().toArray()
        const projects = await find("projects").find().toArray()

        users.forEach(user => insert("profile/" + user.name, "weekly", 0.3))

        projects.forEach(project => {
            insert("demo/" + project.id, "weekly", 0.3)
            insert("project/" + project.id, "yearly", 0.3)
        })

        content += "</urlset>"

        res.set("Content-Type", "text/xml")
        return res.send(content)
    }
    
    catch (error) {next(error)}
})

app.get("/", async (req, res, next) => {
    try {
        const user = await find("users").findOne(
            {name: req.session.name},
            {projection: {name: 1, image: 1}})

        return res.send(html.home(user))
    }

    catch (error) {next(error)}
})

app.get("/chat", async (req, res, next) => {
    try {
        let smiles = 0

        const projects = await find("projects").find(
            {name: req.session.name},
            {projection: {smiles: 1}}).toArray()
            
        projects.forEach(project =>
            smiles += project.smiles.length)

        if (smiles >= 5) {
            req.session.chat = true

            const user = await find("users").findOne(
                {name: req.session.name},
                {projection: {name: 1, image: 1}})

            return res.send(html.chat(user))
        }
    }

    catch (error) {next(error)}
})

app.get("/gallery", async (req, res, next) => {
    try {
        const user = await find("users").findOne(
            {name: req.session.name},
            {projection: {name: 1, image: 1}})

        return res.send(html.gallery(user))
    }
    
    catch (error) {next(error)}
})

app.get("/project", async (req, res, next) => {
    try {
        if (req.session.name) {
            const user = await find("users").findOne(
                {name: req.session.name},
                {projection: {name: 1, image: 1}})

            return res.send(html.project(user))
        }

        next()
    }

    catch (error) {next(error)}
})

app.get("/reported", async (req, res, next) => {
    try {
        if (req.session.name == process.env.HOST) {
            const projects = await find("projects").find().toArray()

            const user = await find("users").findOne(
                {name: req.session.name},
                {projection: {name: 1, image: 1}})

            res.send(html.reported(user, projects, new remarkable({breaks: true})))
        }

        next()
    }

    catch (error) {next(error)}
})

app.get("/errors", async (req, res, next) => {
    try {
        if (req.session.name == process.env.HOST) {
            const bugs = await find("errors").find().toArray()

            const user = await find("users").findOne(
                {name: req.session.name},
                {projection: {name: 1, image: 1}})

            res.send(html.errors(user, bugs))
        }

        next()
    }

    catch (error) {next(error)}
})

app.get("/users", async (req, res, next) => {
    try {
        if (req.session.name == process.env.HOST) {
            const users = await find("users").find().toArray()

            const user = await find("users").findOne(
                {name: req.session.name},
                {projection: {name: 1, image: 1}})

            res.send(html.users(user, users))
        }

        next()
    }

    catch (error) {next(error)}
})

app.get("/create", (req, res) => res.send(html.create()))
app.get("/sign", (req, res) => res.send(html.sign()))
app.get("/password", (req, res) => res.send(html.password()))

app.post("/chat", async (req, res, next) => {
    try {
        if (decodeURIComponent(req.body.comment).trim()) {
            const user = await find("users").findOne(
                {name: req.session.name},
                {projection: {name: 1, image: 1}})

            io.sockets.sockets.forEach(socket =>
                socket.handshake.session.chat &&
                socket.handshake.session.name != req.session.name &&
                socket.emit("comment", decodeURIComponent(req.body.comment), user))
        }
    }

    catch (error) {next(error)}
})

app.post("/gallery", async (req, res, next) => {
    try {
        const user = await find("users").findOne(
            {name: req.session.name},
            {projection: {name: 1, image: 1}})

        return res.send(html.gallery(user, req.body.search))
    }

    catch (error) {next(error)}
})

app.post("/expel", async (req, res, next) => {
    try {
        if (req.session.name == process.env.HOST) {
            await find("users").deleteOne({name: req.body.name})
            await find("projects").deleteMany({name: req.body.name})
            const projects = await find("projects").find().toArray()

            projects.forEach(async (project) => {
                project.comments.forEach(async (comment, index) => {
                    if (comment.name == req.body.name) {
                        project.comments.splice(index, 1)
                        await find("projects").updateOne({id: project.id}, {$set: {comments: project.comments}})
                    }
                })

                project.flags.forEach(async (flag, index) => {
                    if (flag == req.body.name) {
                        project.flags.splice(index, 1)
                        await find("projects").updateOne({id: project.id}, {$set: {flags: project.flags}})
                    }
                })
            })
        }
    }
    
    catch (error) {next(error)}
})

app.post("/profile", async (req, res, next) => {
    try {
        const image = size(Buffer.from(req.body.image.replace(/data:image\/jpeg;base64/, ""), "base64"))

        if (image.width == 100 && image.height == 100)
            await find("users").updateOne(
                {name: req.session.name},
                {$set: {image: req.body.image}})
    }

    catch (error) {next(error)}
})

app.post("/log", async (req, res, next) => {
    try {
        req.session.destroy()
        return res.redirect("/")
    }

    catch (error) {next(error)}
})

app.post("/request", async (req, res, next) => {
    try {
        const array = req.body.search.toLowerCase().split(/(\s|,)/g).filter(i => i)
        const projects = await find("projects").find().toArray()
        const rated = {}

        projects.forEach(project => {
            let rating = req.body.filter == "Top" ?
                project.smiles.length + (project.views / 10) :
                req.body.filter == "Newest" ?
                5 / ((Date.now() - project.date) / (1000 * 60 * 60 * 24)) :
                Math.random() * 5
            
            array.forEach(item => {
                project.tags.forEach(tag => tag == item && (rating += 5))

                const get = (string, value) => {
                    const match = string.match(new RegExp(item, "i"))
                    return (match ? match.length * value : 0)
                }

                rating += get(project.title, 3)
                rating += get(project.description, 2)
                project.comments.forEach(source => rating += get(source.comment || "", 1))
            })

            rated[rating + project.id] = project.image
        })

        res.send(Object.keys(rated).sort((a, b) => Number(a.slice(0, -4)) - Number(b.slice(0, -4))).reverse().map(i => {
            return {image: rated[i], id: i.slice(-4)}}))
    }

    catch (error) {next(error)}
})

app.post("/website", async (req, res, next) => {
    try {
        await find("users").updateOne(
            {name: req.session.name},
            {$set: {website: req.body.website}})
    }

    catch (error) {next(error)}
})

app.post("/delete", async (req, res, next) => {
    try {
        if (req.session.name == process.env.HOST) {
            await find("projects").deleteOne({id: req.body.project})
            return res.redirect("/gallery")
        }

        const project = await find("projects").findOne(
            {name: req.session.name, id: req.body.project},
            {projection: {smiles: 1}})

        if (project.smiles.length < 10) {
            await find("projects").deleteOne({id: req.body.project})
            return res.redirect("/gallery")
        }
    }

    catch (error) {next(error)}
})

app.post("/splice", async (req, res, next) => {
    try {
        const project = await find("projects").findOne(
            {id: req.body.project},
            {projection: {comments: 1}})

        if (project.comments[req.body.comment].name == req.session.name || req.session.name == process.env.HOST) {
            project.comments.splice(req.body.comment, 1)
            await find("projects").updateOne({id: req.body.project}, {$set: {comments: project.comments}})
        }
    }

    catch (error) {next(error)}
})

app.post("/comment", async (req, res, next) => {
    try {
        if (req.body.comment.trim()) {
            const project = await find("projects").findOne(
                {id: req.body.project},
                {projection: {comments: 1}})

            project.comments.push({
                name: req.session.name,
                comment: req.body.comment.trim(),
                flags: []
            })

            await find("projects").updateOne(
                {id: req.body.project},
                {$set: {comments: project.comments}})
        }
    }

    catch (error) {next(error)}
})

app.post("/flag", async (req, res, next) => {
    try {
        const project = await find("projects").findOne(
            {id: req.body.project},
            {projection: {comments: 1}})

        if (!project.comments[req.body.comment].flags.includes(req.session.name)) {
            project.comments[req.body.comment].flags.push(req.session.name)

            await find("projects").updateOne(
                {id: req.body.project},
                {$set: {comments: project.comments}})
        }
    }
    
    catch (error) {next(error)}
})

app.post("/unflag", async (req, res, next) => {
    try {
        const project = await find("projects").findOne(
            {id: req.body.project},
            {projection: {comments: 1}})

        project.comments[req.body.comment].flags.splice(
            project.comments[req.body.comment].flags.indexOf(req.session.name), 1)

        await find("projects").updateOne(
            {id: req.body.project},
            {$set: {comments: project.comments}})
    }
    
    catch (error) {next(error)}
})

app.post("/report", async (req, res, next) => {
    try {
        const project = await find("projects").findOne(
            {id: req.body.project},
            {projection: {flags: 1}})

        if (!project.flags.includes(req.session.name)) {
            project.flags.push(req.session.name)
            
            await find("projects").updateOne(
                {id: req.body.project},
                {$set: {flags: project.flags}})
        }
    }

    catch (error) {next(error)}
})

app.post("/unreport", async (req, res, next) => {
    try {
        const project = await find("projects").findOne(
            {id: req.body.project},
            {projection: {flags: 1}})

        project.flags.splice(
            project.flags.indexOf(req.session.name), 1)

        await find("projects").updateOne(
            {id: req.body.project},
            {$set: {flags: project.flags}})
    }

    catch (error) {next(error)}
})

app.post("/like", async (req, res, next) => {
    try {
        const project = await find("projects").findOne(
            {id: req.body.project},
            {projection: {smiles: 1}})

        if (!project.smiles.includes(req.session.name)) {
            project.smiles.push(req.session.name)
            
            await find("projects").updateOne(
                {id: req.body.project},
                {$set: {smiles: project.smiles}})
        }
    }

    catch (error) {next(error)}
})

app.post("/unlike", async (req, res, next) => {
    try {
        const project = await find("projects").findOne(
            {id: req.body.project},
            {projection: {smiles: 1}})

        project.smiles.splice(
            project.smiles.indexOf(req.session.name), 1)

        await find("projects").updateOne(
            {id: req.body.project},
            {$set: {smiles: project.smiles}})
    }

    catch (error) {next(error)}
})

app.post("/finish", async (req, res, next) => {
    try {
        const code = decodeURIComponent(req.body.code)

        if (Buffer.from(code).length <= 2048) {
            const user = await find("users").findOne(
                {name: req.session.name},
                {projection: {name: 1, image: 1}})

            req.session.code = code
            return res.send(html.finish(user, convert(code)))
        }
    }

    catch (error) {next(error)}
})

app.post("/submit", async (req, res, next) => {
    try {
        const image = size(Buffer.from(req.body.image.replace(/data:image\/jpeg;base64/, ""), "base64"))

        if (image.width == 400 && image.height == 240 && req.body.tags.trim()) {
            const generate = () => Math.floor(Math.random() * 1679615).toString(36)
    
            let identity = generate()
            while (await find("projects").findOne({id: identity}))
                identity = generate()

            await find("projects").insertOne({
                id: identity,
                name: req.session.name,
                title: req.body.title.trim() || "Untitled",
                description: req.body.description.trim(),
                tags: req.body.tags.toLowerCase().split(" ").filter(i => i).slice(0, 5),
                date: Date.now(),
                smiles: [],
                flags: [],
                views: 0,
                comments: [],
                code: req.session.code,
                image: req.body.image
            })
    
            return res.redirect("/demo/" + identity)
        }
    }

    catch (error) {next(error)}
})

app.post("/password", async (req, res, next) => {
    try {
        const users = client.db(configuration.db).collection("users")
        const verify = client.db(configuration.db).collection("verify")
        const user = await users.findOne({email: req.body.email}, {projection: {name: 1}})

        if (!user)
            return res.send(html.password("Email doesn't exist"))

        let code = ""
        const password = await bcrypt.hash(req.body.password, 10)
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            
        for (let i = 0; i < 128; i ++)
            code += chars[Math.floor(Math.random() * chars.length)]

        await verify.insertOne({
            name: user.name,
            password,
            address: code,
            date: Date.now()
        })
                
        const address = `${protocol(req)}://${req.get("host")}/verify/${code}`

        const options = {
            from: process.env.EMAIL,
            to: req.body.email,
            subject: "Change Your Password",
            html: html.email(user.name, address)
        }
        
        transporter.sendMail(options, (error, info) => error && add(error))
        return res.send(html.verify(req.body.email))
    }

    catch (error) {next(error)}
})

app.post("/sign", async (req, res, next) => {
    try {
        const users = client.db(configuration.db).collection("users")
        const user = await users.findOne({name: req.body.name})

        if (!user || !await bcrypt.compare(req.body.password, user.password))
            return res.send(html.sign("Incorrect password"))

        req.session.name = req.body.name
        return res.redirect("/")
    }

    catch (error) {next(error)}
})

app.post("/create", async (req, res, next) => {
    try {
        const users = client.db(configuration.db).collection("users")

        if (await users.findOne({name: {"$regex": new RegExp(req.body.name, "i")}}))
            return res.send(html.create("Username already exists"))
    
        if (await users.findOne({email: req.body.email}))
            return res.send(html.create("Email already exists"))

        const image = canvas(100, 100)
        const context = image.getContext("2d")

        context.fillStyle = "#fff"
        context.fillRect(0, 0, image.width, image.height)
        context.fillStyle = "#000"

        for (let i = 0; i < 50; i ++) {
            const x = i & 3.5
            const y = i >> 3.5
            const size = 12
            
            const random = () => ~~(Math.random() * 255)
            const fill = mirror => context.fillRect(x * mirror + image.width / 2 - size / 2, y * size, size, size)
        
            if (random() ** 2 / 3000 > x ** 2 + (y - 5) ** 2) {
                fill(size)
                fill(-size)
            }
            
            if (random() > 220)
                context.fillStyle = `rgb(${random()}, ${random()}, ${random()})`
        }

        const password = await bcrypt.hash(req.body.password, 10)
        const url = image.toDataURL()
        req.session.name = req.body.name

        await users.insertOne({
            name: req.body.name,
            email: req.body.email,
            password,
            date: Date.now(),
            projects: {},
            website: "",
            image: url
        })

        const options = {
            from: process.env.EMAIL,
            to: req.body.email,
            subject: "Welcome to JS ByteBase",
            html: html.welcome(req.body.name),

            attachments: [{
                filename: "profile.png",
                path: url
            }]
        }
        
        transporter.sendMail(options, (error, info) => error && add(error))
        return res.redirect("/")
    }
    
    catch (error) {next(error)}
})

client.connect()
server.listen(process.env.PORT || 5000)

setInterval(async () => {
    const verify = client.db(configuration.db).collection("verify")
    await verify.deleteMany({date: {$lt: Date.now() - 1000 * 60 * 15}})
}, 60000)