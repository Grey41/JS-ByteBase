"use strict"

require("dotenv").config()
const express = require("express")
const storage = require("express-session")
const parser = require("cookie-parser")
const canvas = require("canvas").createCanvas
const nodemailer = require("nodemailer").createTransport

const size = require("image-size")
const mongodb = require("mongodb").MongoClient
const remarkable = require("remarkable").Remarkable
const store = require("connect-mongo")
const bcrypt = require("bcrypt")
const app = express()
const server = require("http").Server(app)
const set = JSON.parse(process.env.APP_CONFIG).mongo
const url = `mongodb://${set.user}:${encodeURIComponent(process.env.DATABASE)}@${set.hostString}`
const client = new mongodb(url)
const markdown = new remarkable({breaks: true})

const emails = {
    welcome: name => /*html*/
`<p>
    Hello ${name},
    <br>
    We are very excited to have you as part of the JS-ByteBase community.
</p>`,

    verify: (name, address) => /*html*/
`<p>
    Hello ${name},
    <br>
    We have sent this verification email because you have tried to change your password.
    Click the link below to verify your email address.
    <br>
    &nbsp
</p>

<p>
    <a
        href = ${address}
        style = "background-color: #4a4; padding: 0.4em; font-family: sans-serif; font-size: 20px; border-radius: 0.3em; text-decoration: none; color: #fff">
        Verify
    </a>
</p>`
}

const blocks = {
    top: (user, gallery, search = "") => /*html*/
`<section class = top>
    <div>
        <a href = "/">
            <svg xmlns = http://www.w3.org/2000/svg viewBox = "0 0 630 630">
                <path d = "M 0 0 V 630 H 630 V 183 Q 446 183 446 0" fill = #f7df1e></path>

                <path d = "m 423 492 c 13 21 29 36 58 36 c 25 0 40 -12 40 -29 c 0 -20 -16 -28 -43 -39 l -15
                    -6 c -43 -18 -71 -41 -71 -89 c 0 -44 34 -78 87 -78 c 38 0 65 13 84 47 l -46 30 c -10 -18
                    -21 -25 -38 -25 c -17 0 -28 11 -28 25 c 0 18 11 25 36 36 l 15 6 c 50 22 79 44 79 93 c 0
                    53 -42 83 -98 83 c -55 0 -91 -26 -108 -61 z m -209 5 c 9 17 18 30 38 30 c 19 0 32 -8 32
                    -37 v -201 h 59 v 202 c 0 61 -36 89 -88 89 c -47 0 -75 -25 -89 -54 z" fill = #000></path>
            </svg>
            
            <span>ByteBase</span>
        </a>${gallery ? /*html*/ `
        
        <input type = text placeholder = Search onchange = submit() value = "${search}">

        <select class = button version = plain onchange = submit()>
            <option>Top</option>
            <option>Newest</option>
            <option>Random</option>
        </select>` : /*html*/ `

        <form action = /gallery method = post>
            <input type = text name = search placeholder = Search>
        </form>

        <a href = /gallery class = button version = plain>Gallery</a>`}${user ? /*html*/ `
        
        <a href = "/profile/${user.name}" class = "profile button" version = plain>
            <img src = "${user.image}">${user.name}
        </a>
                
        <a href = /project class = button version = plain>New<span> project</span></a>` : /*html*/ `
        
        <a href = /sign class = button version = plain>Sign in</a>
        <a href = /create class = button version = green>Create<span> account</span></a>`}
    </div>
</section>`,

    footer: _ => /*html*/
`<footer>
    <span>
        &copy; Copyright ${new Date().getFullYear()} JS-ByteBase ·
        <a href = mailto:hello@js-bytebase.com>hello@js-bytebase.com</a>
    </span>
</footer>`,

    sitemap: (req, url, change, priority) => /*xml*/
`<url>
    <loc>${protocol(req)}://${req.get("host")}/${url}</loc>
    <changefreq>${change}</changefreq>
    <priority>${priority}</priority>
</url>`
}

const pages = {
    home: data => ({
        head: /*html*/
`<title>JS-ByteBase · JavaScript Coding Challenge</title>

<script type = application/ld+json>
    {
        "@context": "https://schema.org",
        "@type": "Organization",
        "url": "https://www.js-bytebase.com",
        "logo": "https://www.js-bytebase.com/logo.png"
    }
</script>

<meta name = description content = "Join the JavaScript 2k community.
    Play games, upload original projects, share your creations and build your portfolio.">
    
<style>
    body > a {
        position: fixed;
        width: 100%;
        height: calc(100% - 3em);
        top: 3em;
        left: 0
    }

    body, html {height: 100%}
    .main {color: var(--text-contrast)}
    .main p {font-size: var(--font)}
</style>`,

        body: /*html*/
`${blocks.top(data.user)}

<section class = main page = narrow>
    <h1>Welcome to JS-ByteBase</h1>

    <p>
        Join the JavaScript 2k community.
        <br>
        Play games, upload original projects, share your creations and build your portfolio.
    </p>
</section>

<a href = /gallery></a>
<canvas class = background></canvas>

<script>
    const canvas = get("canvas")
    const webgl = canvas.getContext("webgl")
    const buffer = webgl.createBuffer()

    const program = shader(webgl, ${"`" + /*glsl*/ `
        attribute vec2 vertex;

        void main(void) {
            gl_Position = vec4(vertex, 0, 1);
        }` + "`"}, ${"`" + /*glsl*/ `
        precision highp float;

        uniform float width;
        uniform float contrast;
        uniform float fade;

        void main(void) {
            float zoom = 10000.0;
            float value;

            vec2 pos = vec2((gl_FragCoord.x - 1.28 * zoom - width) / zoom, (gl_FragCoord.y + 0.035 * zoom) / zoom);
            vec2 solid = pos;

            for (float index = 0.0; index < 200.0; index ++) {
                vec2 power = vec2(pos.x * pos.x - pos.y * pos.y, 2.0 * pos.x * pos.y);
                pos.x = power.x + solid.x;
                pos.y = power.y + solid.y;

                if (pos.x * pos.y > contrast) {
                    value = index;
                    break;
                }
            }

            float next = value / 80.0 * fade;
            gl_FragColor = vec4(next, next, next, 1); 
        }` + "`"})

    let contrast = 0.01
    let fade = 0
            
    const resize = _ => {
        canvas.width = document.body.clientWidth
        canvas.height = document.body.clientHeight
        webgl.viewport(0, 0, canvas.width, canvas.height)
        webgl.uniform1f(webgl.getUniformLocation(program, "width"), canvas.width)
    }
            
    const loop = _ => {
        requestAnimationFrame(loop)
        fade += (1 - fade) * 0.001
        contrast *= 1.01

        webgl.clear(webgl.COLOR_BUFFER_BIT)
        webgl.uniform1f(webgl.getUniformLocation(program, "contrast"), contrast)
        webgl.uniform1f(webgl.getUniformLocation(program, "fade"), fade)
        webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4)
    }

    const start = _ => {
        webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer)
        webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array([-1, 1, 1, 1, -1, -1, 1, -1]), webgl.STATIC_DRAW)
        webgl.vertexAttribPointer(0, 2, webgl.FLOAT, false, 0, 0)
        webgl.enableVertexAttribArray(0)
            
        addEventListener("resize", resize)
        resize()
        loop()
    }

    start()
</script>`
    }),

    gallery: data => ({
        head: /*html*/
`<title>JS-ByteBase · Gallery</title>

<meta name = description content = "Explore the complete collection of JS-ByteBase projects">`,

        body: /*html*/
`${blocks.top(data.user, 1, data.search)}

<section class = main page = wide>
    <div class = gallery></div>
</section>

${blocks.footer()}

<script>
    const http = new XMLHttpRequest()
    const key = Math.random().toString().substring(2)

    const submit = _ => get(".gallery").innerHTML = ""

    const request = _ => {
        if (innerHeight + Math.ceil(pageYOffset) < document.body.offsetHeight)
            return

        http.onload = gallery
        http.open("POST", "/search")
        http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")

        http.send(${`\`search=\${
            encodeURIComponent(document.querySelector("input").value)}&filter=\${
            document.querySelector("select").value}&index=\${
            document.querySelector(".gallery").children.length}&key=\${
            key}\``})
    }

    const start = _ => {
        const observer = new MutationObserver(request)
        observer.observe(document, {childList: true, subtree: true})
        window.onscroll = request
    }

    start()
</script>`
    }),

    create: data => ({
        head: /*html*/
`<title>JS-ByteBase · Create Account</title>

<meta name = description content = "Create a new account">`,

        body: /*html*/
`<div class = account>
    <div>
        <form action = "" method = post>
            <input type = text name = name placeholder = Username required>
            <input type = email name = email placeholder = Email required>
            <input type = password name = password placeholder = Password required>

            <button class = button version = green type = submit>
                <i class = "fas fa-sign-in-alt"></i>Create
            </button>${data.error ? /*html*/ `
            
            <span>${data.error}</span>` : ""}
        </form>    
    </div>    

    <a href = /sign>Sign in</a>
</div>`
    }),

    sign: data => ({
        head: /*html*/
`<title>JS-ByteBase · Sign In</title>

<meta name = description content = "Sign in to JS-ByteBase">`,

        body: /*html*/
`<div class = account>
    <div>
        <form action = "" method = post>
            <input type = text name = name placeholder = Username required>
            <input type = password name = password placeholder = Password required>

            <button class = button version = green type = submit>
                <i class = "fas fa-sign-in-alt"></i>Sign in
            </button>${data.error ? /*html*/ `
            
            <span>${data.error}</span>` : ""}
        </form>
    </div>

    <a href = /email>Forgot password</a>
</div>`
    }),

    email: data => ({
        head: /*html*/
`<title>JS-ByteBase · Verify Email</title>

<meta name = description content = "Verify your email address">`,

        body: /*html*/
`<div class = account>
    <div>
        <form action = "" method = post>
            <input type = email name = email placeholder = Email required>

            <button class = button version = green type = submit>
                <i class = "fas fa-unlock-alt"></i>Verify
            </button>${data.error ? /*html*/ `
            
            <span>${data.error}</span>` : ""}
        </form>    
    </div>    

    <a href = /sign>Sign in</a>
</div>`
    }),

    verify: data => ({
        head: /*html*/
`<title>JS-ByteBase · Verify Email</title>`,

        body: /*html*/
`<div class = account>
    <h3>Verification email sent to <span>${data.email}</span></h3>
    <span>You can close this page</span>
</div>`
    }),

    expired: _ => ({
        head: /*html*/
`<title>JS-ByteBase · Link Expired</title>`,

        body: /*html*/
`<div class = account>
    <h3>This link has expired</h3>
    <span>Click <a href = /email>here</a> to try again</span>
</div>`
    }),

    password: data => ({
        head: /*html*/
`<title>JS-ByteBase · Change Password</title>

<meta name = description content = "Change your password for JS-ByteBase">`,

        body: /*html*/
`<div class = account>
    <div>
        <form action = "" method = post>
            <input type = password name = password placeholder = "New password" required>
            <input type = password name = confirm placeholder = "Confirm password" required>

            <button class = button version = green type = submit>
                <i class = "fas fa-key"></i>Reset
            </button>${data.error ? /*html*/ `
            
            <span>${data.error}</span>` : ""}
        </form>    
    </div>    
</div>`
    }),

    demo: data => ({
        head: /*html*/
`<title>JS-ByteBase · ${data.project.title}</title>

<meta name = description content = "${data.project.title} by ${data.creator.name}">

<script src = https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js></script>
<script src = https://cdn.jsdelivr.net/remarkable/1.7.1/remarkable.min.js></script>

<style>
    .image {
        margin-right: 1em;
        float: left;
        position: relative
    }

    .image img {
        border-radius: var(--radius);
        box-shadow: var(--shadow) var(--box);
        max-width: 100%
    }

    .image button, .image > span {
        position: absolute;
        left: 0.5em;
        bottom: 0.9em;
        color: var(--text);
        background-color: var(--off);
        border-radius: var(--radius);
        border: var(--border) var(--box);
        font-size: 15px;
        padding: 0.2em 0.4em
    }

    .main > div:first-child {
        margin-bottom: 1em;
        display: inline-block
    }
    
    .image button:hover {background-color: var(--button)}
    .image i {padding-right: var(--padding)}
    .main .profile {margin-bottom: 0.6em}
    .data {overflow: hidden}

    h1 {
        color: var(--text);
        font-weight: bold;
        margin: 0 0 0.5em 0;
        white-space: nowrap;
        overflow: auto
    }

    .image button[type = "like"] {
        background-color: var(--green);
        color: var(--text-contrast)
    }

    .image button[type = "like"]:hover {background-color: var(--green-hover)}

    button[type = "report"] {
        background-color: var(--error);
        color: var(--text-contrast)
    }

    button[type = "report"]:hover {background-color: var(--error-hover)}
    form {display: inline}

    .main > div:nth-child(2) {
        border-radius: var(--radius);
        padding: var(--padding) var(--padding) 0 var(--padding);
        border: var(--border) var(--plain);
        margin-bottom: 1em
    }

    .code {
        box-shadow: var(--shadow) var(--box);
        height: 10em;
        margin-bottom: 1em
    }

    .tags {margin-bottom: 1.5em}

    .tags input {
        padding: var(--padding);
        border-radius: var(--radius);
        box-shadow: var(--shadow) var(--box);
        font-size: var(--font);
        background-color: var(--off);
        color: var(--text);
        font-family: nunito;
        display: inline-block;
        margin: 0 0.5em 0.5em 0;
        transition-duration: var(--transition);
        cursor: pointer;
        border: none
    }

    .tags input:hover {background-color: var(--box)}
</style>`,

        body: /*html*/
`${blocks.top(data.user)}

<section class = main page = narrow>
    <div>
        <div class = image>${data.user ? /*html*/ `
            <button ${data.project.smiles.includes(data.user.name) ?
                "type = like" : ""} onclick = like(this)>` : /*html*/ `
            <span>`}
                <i class = "far fa-smile"></i>
                <span>${data.project.smiles.length}</span>${data.user ? /*html*/ `
            </button>` : /*html*/ `
            </span>`}

            <a href = ${"/project/" + data.project.id} target = _blank>
                <img src = "${data.project.image}">
            </a>
        </div>

        <div class = data>
            <h1>${data.project.title}</h1>

            <a href = ${"/profile/" + data.creator.name} class = "profile button" version = plain>
                <img src = "${data.creator.image}">
                ${data.creator.name}
            </a><br>

            <span class = tab><i class = "fas fa-link"></i>${data.host}/project/${data.project.id}</span><br>
            <span class = tab>${data.project.views + (data.project.views == 1 ? " view" : " views")}</span>
            <span class = tab>${Buffer.from(data.project.code).length} bytes</span><br>

            <a href = ${"/project/" + data.project.id} target = _blank class = tab>
                <i class = "far fa-play-circle"></i>Play
            </a>${data.user ? /*html*/ `${data.creator.name == data.user.name ? /*html*/ `
                
            <form action = /delete method = post onsubmit = "return enter()">
                <input type = hidden name = project value = ${data.project.id}>
                <button type = submit class = tab><i class = "far fa-trash-alt"></i>Delete</button>
            </form>` : /*html*/ `

            <button class = tab ${data.project.flags.includes(data.user.name) ?
                "type = report" : ""} onclick = report(this)>
                <i class = "far fa-flag"></i>Report
            </button>`}` : ""}
        </div>
    </div>

    <div>
        <div class = markdown>
            ${markdown.render(data.project.description)}
        </div>
    </div>

    <div class = code>${convert(data.project.code)}</div>

    <div class = tags>${data.project.tags.reduce(
        (all, item) => all + /*html*/ `
            <input type = submit name = search value = ${item}>`, /*html*/ `
        <form action = /gallery method = post>`) + /*html*/ `
        </form>`}
    </div>

    <div class = comments>${data.project.comments.reduce(
        (all, item) => all + /*html*/ `
        <div class = comment>
            <a href = ${"/profile/" + item.name}>
                <img src = "${data.users[item.name]}">${item.name}
            </a>${data.user ? /*html*/ `
                
            <i class = "far fa-${item.name == data.user.name ? "trash-alt" :
                "flag"}" ${item.name != data.user.name && item.flags.includes(data.user.name) ? "type = flag" : ""}
                onclick = ${item.name == data.user.name ? "remove" : "flag"}(this)>
            </i>` : ""}

            <div class = markdown>
                ${markdown.render(item.comment)}
            </div>
        </div>`, "")}
    </div>${data.user ? /*html*/ `

    <div class = message>
        <textarea placeholder = "Add comment" oninput = input(this) autocomplete = off></textarea>
        <i onclick = comment(this) class = "fas fa-paper-plane" version = blank></i>
    </div>` : ""}
</section>

${blocks.footer()}

<script>
    const editor = ace.edit(get(".code")) ${data.user ? /*javascript*/ `
    const http = new XMLHttpRequest()
    const markdown = new Remarkable({breaks: true})
    const smiles = get(".image").firstElementChild.lastElementChild

    const find = button => [].indexOf.call(
        get(".comments").children, button.parentElement)

    const post = (link, type, index) => {
        http.open("POST", link)
        http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
        http.send(${`\`project=${data.project.id}\${type ? "&type=1" : ""}&index=\${index}\``})
    }

    const comment = button => {
        const element = button.previousElementSibling
        if (!element.value.trim()) return

        post("/comment", 1, encodeURIComponent(element.value))

        get(".comments").appendChild(construct(
            markdown.render(element.value.trim()),
            ${`"${data.user.name}"`}, ${`"${data.user.image.replace(/"/g, "\\\"").replace(/\n/g, "\\n")}"`}))

        element.value = ""
    }

    const remove = button => {
        if (!confirm("Please confirm this decision"))
            return

        const index = find(button)
        post("/comment", 0, index)
        get(".comments").children[index].remove()
    }

    const enter = _ => {
        if (Number(smiles.textContent) >= 10) {
            alert("You cannot delete a project with 10 or more smiles")
            return false
        }

        return confirm("Please confirm this decision")
    }

    const flag = button => {
        const index = find(button)

        if (button.getAttribute("type")) {
            post("/flag", 0, index)
            button.removeAttribute("type")
        }
        
        else {
            post("/flag", 1, index)
            button.setAttribute("type", "flag")
        }
    }

    const like = button => {
        if (button.getAttribute("type")) {
            post("/like")
            button.removeAttribute("type")
            smiles.textContent = Number(smiles.textContent) - 1
        }
        
        else {
            post("/like", 1)
            button.setAttribute("type", "like")
            smiles.textContent = Number(smiles.textContent) + 1
        }
    }

    const report = button => {
        if (button.getAttribute("type")) {
            post("/report")
            button.removeAttribute("type")
        }
        
        else {
            post("/report", 1)
            button.setAttribute("type", "report")
        }
    }    
    ` : ""}
    const start = _ => {
        editor.setOption("wrap", true)
        editor.session.setMode("ace/mode/javascript")
        editor.setReadOnly(true)
        editor.gotoLine(0, 1, true)
        theme(editor)
    }

    start()
</script>`
    }),

    main: data => ({
        head: /*html*/
`<title>${data.project.title} by ${data.project.name}</title>

<meta name = description content = "${data.project.description}">

<style>
    iframe {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: #fff;
        border: none
    }
</style>`,

        body: /*html*/
`<iframe
    onload = this.contentWindow.focus()
    srcdoc = "<!DOCTYPE html><body style = 'margin: 0; overflow: hidden'><script>${convert(data.project.code)}</script></body></html>"
    sandbox = "allow-scripts allow-same-origin">
</iframe>`
    }),

    profile: data => ({
        head: /*html*/
`<title>JS-ByteBase · ${data.profile.name}</title>

<meta name = description content = "Profile of ${data.profile.name}">
<script src = https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js></script>

<style>
    .user {
        border-radius: var(--radius);
        border: var(--border) var(--plain);
        margin-bottom: 1em;
        padding: 1em
    }

    .user div {
        display: inline-block;
        font-family: nunito;
        vertical-align: top;
        overflow: hidden;
        margin-left: 1em
    }

    .user img {
        box-shadow: var(--shadow) var(--box);
        border-radius: 50%
    }

    .fa-cog {
        color: var(--fade);
        transition-duration: var(--transition);
        float: right;
        cursor: pointer
    }

    .fa-cog:hover {color: var(--text)}
    .user > label > img:hover {opacity: 0.5}

    h1 {
        color: var(--text);
        font-weight: bold;
        margin: 0
    }

    form button {
        color: var(--text);
        font-size: var(--small);
        float: right;
        border: none;
        background: none;
        margin-bottom: var(--padding)
    }

    form button:hover {color: var(--fade)}

    .settings {
        transition-duration: var(--reveal);
        overflow: hidden;
        transition: var(--reveal);
        border-radius: var(--radius);
        border: var(--border);
        padding-left: 1em;
        padding-right: 1em;
        color: var(--text)
    }

    .settings[type = "hidden"] {
        border-color: var(--background);
        max-height: 0;
        margin: 0
    }

    .settings[type = "active"] {
        border-color: var(--plain);
        max-height: 20em;
        padding: 1em;
        margin-bottom: 1em
    }

    .settings label {
        color: var(--text);
        border: var(--border) var(--plain);
        border-radius: var(--radius);
        padding: var(--padding);
        display: inline-block;
        margin-bottom: 1em
    }

    .settings select, .settings input {
        border-radius: var(--radius);
        border: var(--border) var(--plain);
        background-color: var(--off);
        color: var(--text)
    }

    .settings input {
        padding: var(--padding);
        display: block;
        max-width: 100%;
        margin-bottom: 1em
    }

    .code {
        box-shadow: var(--shadow) var(--box);
        font-size: var(--font);
        border-radius: var(--radius);
        margin: var(--padding) 0 1em 0
    }

    /*.tab[version = "hidden"]*/
</style>`,

        body: /*html*/
`${blocks.top(data.user)}

<section class = main page = narrow>
    <div class = user>${data.user && data.user.name == data.profile.name ? /*html*/ `
        <label>
            <input type = file onchange = image(this) accept = "image/*">
            <img src = "${data.profile.image}">
        </label>

        <i class = "fas fa-cog" onclick = display()></i>` : /*html*/ `
        <img src = "${data.profile.image}">`}

        <div>
            <h1>${data.profile.name}</h1>

            <span class = tab>
                <i class = "far fa-smile"></i>${data.projects.reduce((all, item) => all += item.smiles.length, 0)}
            </span>

            <span class = tab>
                <i class = "far fa-calendar-alt"></i>${
                    new Date(data.profile.date).getDate()}.${
                    new Date(data.profile.date).getMonth()}.${
                    new Date(data.profile.date).getFullYear()}
            </span><br>${data.profile.website ? /*html*/ `
            
            <a class = tab target = _blank href = "${(data.profile.website.startsWith("http://") ||
                data.profile.website.startsWith("https://") ? "" : "http://") + data.profile.website}">
                <i class = "fas fa-link"></i><span>${data.profile.website.replace(/(http|https):\/\//, "")}</span>
            </a>` : ""}
        </div>
    </div>${data.user && data.user.name == data.profile.name ? /*html*/ `
            
    <div class = settings type = hidden>
        <form action = /log method = post>
            <button type = submit>Log out</button>
        </form>

        <input
            value = "${data.profile.website}"
            type = text
            oninput = website(this)
            placeholder = "Enter your website here"
            onchange = set(this)
            autocomplete = off>

        <label>
            Select theme:
            <select onchange = change(this) class = select>
                <option>Light</option>
                <option>Dark</option>
                <option>Gob</option>
                <option>Vibrant</option>
                <option>Navy</option>
            </select>
        </label><br>

        Generate a link to your profile by pasting the following code into your website.
        <div class = code>${convert(`<a href = "${data.protocol}://${data.host}/profile/${data.profile.name}"><svg xmlns = http://www.w3.org/2000/svg viewBox = "0 0 630 630" width = 40 height = 40>\n\t<path d = "M 0 0 V 630 H 630 V 183 Q 446 183 446 0" fill = "#f7df1e"/>\n\t<path d = "m 423 492 c 13 21 29 36 58 36 c 25 0 40 -12 40 -29 c 0 -20 -16 -28 -43 -39 l -15 -6 c -43 -18 -71 -41 -71 -89 c 0 -44 34 -78 87 -78 c 38 0 65 13 84 47 l -46 30 c -10 -18 -21 -25 -38 -25 c -17 0 -28 11 -28 25 c 0 18 11 25 36 36 l 15 6 c 50 22 79 44 79 93 c 0 53 -42 83 -98 83 c -55 0 -91 -26 -108 -61 z m -209 5 c 9 17 18 30 38 30 c 19 0 32 -8 32 -37 v -201 h 59 v 202 c 0 61 -36 89 -88 89 c -47 0 -75 -25 -89 -54 z" fill = "#000"/>\n</svg></a>`)}</div>
        ${data.projects.reduce((all, item) => all += item.smiles.length, 0) < 5 ? "" : /*html*/ `
        <a href = /chat class = button version = green>Join chat room</a>`}
    </div>` : ""}

    <div class = gallery></div>
</section>

${blocks.footer()}

<script>
    const http = new XMLHttpRequest()
    const reader = new FileReader() ${data.user && data.user.name == data.profile.name ? /*javascript*/ `
    const editor = ace.edit(get(".code"))

    const set = input => {
        http.open("POST", "/website")
        http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
        http.send("website=" + encodeURIComponent(input.value))
    }
    
    const website = input => {
        if (input.value.trim()) {
            if (!get("a.tab")) {
                const link = document.createElement("a")
                const icon = document.createElement("i")
                const span = document.createElement("span")

                link.className = "tab"
                link.target = "_blank"
                icon.className = "fas fa-link"

                link.appendChild(icon)
                link.appendChild(span)
                get(".user").lastElementChild.appendChild(link)
                defined = true
            }

            const link = get("a.tab")
            link.href = (input.value.startsWith("http://") || input.value.startsWith("https://") ? "" : "http://") + input.value
            link.lastElementChild.textContent = input.value.replace(/(http|https):\\\/\\\//, "")
        }
        
        else if (get("a.tab").textContent.trim())
            get("a.tab").remove()
    }

    const image = input => {
        if (!input.files.length) return

        reader.onload = _ => {
            const image = new Image()

            image.onload = _ => {
                const canvas = document.createElement("canvas")
                const context = canvas.getContext("2d")
                const picture = input.nextElementSibling
                const user = document.querySelector(".profile").firstElementChild

                canvas.width = 100
                canvas.height = 100

                context.drawImage(image, 0, 0, 100, 100) // stretches image (sort this out soon)
                picture.src = canvas.toDataURL("image/jpeg", 0.8)
                user.src = picture.src

                http.open("POST", "/profile")
                http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                http.send("image=" + encodeURIComponent(picture.src))
            }
            
            image.src = reader.result
        }

        reader.readAsDataURL(input.files[0])
    }

    const change = select => {
        document.body.setAttribute("theme", select.value)
        localStorage.setItem("theme", select.value)
        theme(editor)
    }

    const display = _ => {
        const type = get(".settings").getAttribute("type")
        get(".settings").setAttribute("type", type == "hidden" ? "active" : "hidden")
    }
    ` : ""}
    const request = _ => {
        if (innerHeight + Math.ceil(pageYOffset) < document.body.offsetHeight)
            return

        const frames = get(".gallery")

        http.onload = gallery
        http.open("POST", "/search")
        http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
        http.send(${`\`filter=Newest&index=\${frames.children.length}&person=${data.profile.name}\``})
    }

    const start = _ => {
        const observer = new MutationObserver(request)
        observer.observe(document, {childList: true, subtree: true})
        window.onscroll = request ${data.user && data.user.name == data.profile.name ? /*javascript*/ `

        get(".select").value = document.body.getAttribute("theme")
        editor.session.setMode("ace/mode/html")
        editor.setOptions({maxLines: Infinity})
        theme(editor)` : ""}
    }

    start()
</script>`
    }),

    project: data => ({
        head: /*html*/
`<title>JS-ByteBase · Create Project</title>

<script src = https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js></script>
<script src = /bundle.js></script>
<script src = /saver.js></script>

<style>
    .main > div:first-child > * {
        display: inline-block;
        margin-right: 1em;
        cursor: pointer
    }

    .main > div:first-child {margin-bottom: 1em}

    .respond {
        background-color: var(--button);
        border-radius: var(--radius);
        position: relative;
        display: flex;
        flex-direction: row;
        height: calc(100vh - 10em);
        width: 100%;
        overflow: hidden;
        padding: 1em
    }

    .respond > div:nth-child(2) {
        width: 1em;
        display: flex;
        flex-direction: column;
        flex: auto 1 0
    }

    .result {
        resize: vertical;
        overflow: hidden;
        height: 80%;
        margin-bottom: 1em
    }

    .error {
        background-color: var(--background);
        border-radius: var(--radius);
        padding: var(--padding);
        white-space: nowrap;
        overflow: auto;
        font-family: monospace;
        border: none;
        flex: 1 1 0
    }

    .code {
        padding: var(--padding);
        width: 50%;
        resize: horizontal;
        overflow: hidden;
        flex: 0 1 1;
        margin-right: 1em
    }

    iframe {
        border-radius: var(--radius);
        background-color: #fff;
        border: none;
        width: 100%;
        height: 100%
    }

    .respond .bytes {
        font-size: 14px;
        font-family: monospace;
        position: absolute;
        left: 1.5em;
        bottom: 0.1em
    }
</style>`,

        body: /*html*/
`${blocks.top(data.user)}

<section class = main page = wide>
    <div>
        <button class = button version = plain onclick = run()><i class = "fas fa-cog"></i>Run</button>
        <button class = button version = plain onclick = minify()><i class = "fas fa-compress-alt"></i>Minify</button>
        <button class = button version = plain onclick = fullscreen()><i class = "fas fa-expand"></i>Fullscreen</button>
        <button class = button version = plain onclick = save()><i class = "fas fa-save"></i>Save</button>

        <label class = button version = plain>
            <input type = file onchange = file(this) accept = ".js, application/javascript, text/javascript">
            <i class = "fas fa-folder-open"></i>Open
        </label>

        <form id = form action = /finish method = post onsubmit = "return enter()">
            <input type = hidden name = code>

            <button type = submit class = button version = blue>
                <i class = "fas fa-arrow-right"></i>Finish
            </button>
        </form>
    </div>

    <div class = respond>
        <div class = code></div>

        <div>
            <div class = result><iframe></iframe></div>
            <div class = error></div>
        </div>

        <span class = bytes></span>
    </div>
</section>

${blocks.footer()}

<script>
    const editor = ace.edit(get(".code"))

    const minify = async _ => {
        const result = await Terser.minify(editor.getValue(), {
            compress: {booleans_as_integers: true},
            format: {comments: false},
            mangle: {toplevel: true},
            toplevel: true,
            nameCache: {}
        })

        editor.setValue(result.code)
        change()
    }

    const save = _ => {
        const blob = new Blob([editor.getValue()], {type: "text/javascript"})
        saveAs(blob, "project.js")
    }

    const log = (message, type) => {
        const section = document.createElement("section")
        const error = get(".error")

        section.style.color = ${"\`var(--${type ? \"error\" : \"text\"})\`"}
        section.textContent = message
        error.appendChild(section)

        if (error.textContent.length > 5000) error.innerHTML = ""
        error.scrollTop = error.scrollHeight
    }

    const enter = _ => {
        form.firstElementChild.value = editor.getValue()
        return form.lastElementChild.getAttribute("version") == "blue"
    }

    const fullscreen = _ => {
        const iframe = get("iframe")

        if (iframe.requestFullscreen) iframe.requestFullscreen()
        else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen()
        else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen()
    }

    const run = _ => {
        const iframe = get("iframe").cloneNode(true)
        get(".result").replaceChild(iframe, get("iframe"))

        const content = iframe.contentWindow || iframe.contentDocument
        content.document.open()
        content.document.write(${"\`<!DOCTYPE html><body style = \"margin: 0; overflow: hidden\"></body></html>\`"})
        content.document.close()

        content.console.log = log
        get(".error").innerHTML = ""

        try {content.eval(editor.getValue())}
        catch (error) {log(error, 1)}
    }

    const change = _ => {
        localStorage.setItem("code", editor.getValue())
        const size = new Blob([editor.getValue()]).size
        const span = get(".bytes")

        span.textContent = size + " bytes"
        span.style.color = ${"\`var(--${size > 2048 ? \"error\" : \"text\"})\`"}
        form.lastElementChild.setAttribute("version", size > 2048 ? "blank" : "blue")
    }

    const file = input => {
        if (!input.files.length) return

        const reader = new FileReader()
        reader.onload = _ => editor.setValue(reader.result)
        reader.readAsText(input.files[0])
    }
    
    const start = _ => {
        const observer = new MutationObserver(_ => editor.resize())
        observer.observe(get(".code"), {attributes: true})
        
        editor.session.setMode("ace/mode/javascript")
        editor.on("change", change)
        editor.setValue(localStorage.getItem("code") || ${"\`c = document.createElement(\"canvas\")\\ndocument.body.appendChild(c)\\n\\nc.width = innerWidth\\nc.height = innerHeight\\n\\nx = c.getContext(\"2d\")\\nx.fillRect(c.width / 2 - 50, c.height / 2 - 50, 100, 100)\`"})
        theme(editor)
    }

    start()
</script>`
    }),

    finish: data => ({
        head: /*html*/
`<title>JS-ByteBase · Submit Project</title>

<script src = /screenshot.js crossorigin = anonymous></script>

<style>
    textarea {
        height: 10em;
        resize: none
    }

    p {
        font-size: var(--small);
        color: var(--fade)
    }

    .main input[type = "text"], textarea {
        background-color: var(--background);
        color: var(--text);
        padding: var(--padding);
        border-radius: var(--radius);
        border: var(--border) var(--plain);
        font-size: var(--font);
        font-family: nunito;
        margin-bottom: 1em;
        width: 100%
    }

    .respond {
        display: flex;
        flex-direction: row
    }

    .respond > * {
        border: var(--border) var(--plain);
        border-radius: var(--radius);
        transition: var(--transition);
        flex: 1 1 0;
        overflow: hidden;
        aspect-ratio: 5 / 3
    }

    .respond > iframe {
        background-color: #fff;
        margin-right: 1em
    }

    .respond > div {position: relative}

    .respond div div {
        color: #0003;
        transition-duration: var(--transition);
        font-size: var(--header);
        font-weight: bold;
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        top: 0;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
        cursor: pointer
    }

    .respond div div:hover {
        color: #0006;
        background-color: #fff6
    }

    .tags {
        margin-bottom: 1em;
        width: 100%
    }

    .tags input {
        background-color: var(--background);
        color: var(--text);
        border: var(--border) var(--plain);
        border-radius: var(--radius);
        padding: var(--padding);
        width: 5em;
        margin: 0 1em 0 0
    }

    label {
        font-size: var(--font);
        color: #0004;
        transition: var(--transition);
        cursor: pointer
    }

    label:hover {color: #0007}
    
    canvas {
        width: 100%;
        height: 100%
    }

    .button[type = "submit"] {float: right}
</style>`,

        body: /*html*/
`${blocks.top(data.user)}

<section class = main page = narrow>
    <form id = form action = /submit method = post onsubmit = "return check()">
        <div class = respond onmouseenter = enter() onmouseleave = leave()>
            <iframe sandbox = "allow-scripts allow-same-origin" srcdoc = "<!DOCTYPE html><body style = 'margin: 0; overflow: hidden'><script>${convert(data.code)}</script></body></html>"></iframe>

            <div onclick = screenshot(this)>
                <canvas id = canvas width = 400 height = 240></canvas>

                <div>
                    Take snapshot

                    <label>
                        <input type = file onchange = change(this) accept = "image/*">
                        or upload 400 &#215; 240 image
                    </label>
                </div>
            </div>
        </div>

        <p>
            We only recommend uploading your own image when the snapshot feature doesn't work.
            This can happen when your project contains WebGL or fancy CSS.
        </p>

        <input type = hidden name = image autocomplete = off>
        <input type = text placeholder = Title name = title>
        <textarea placeholder = Description name = description></textarea>

        <div class = tags onkeydown = key(event) oninput = insert(event)>
            <input placeholder = "Tag 1" name = tag_1>
            <input placeholder = "Tag 2" name = tag_2>
            <input placeholder = "Tag 3" name = tag_3>
            <input placeholder = "Tag 4" name = tag_4>
            <input placeholder = "Tag 5" name = tag_5>
        </div>

        <a href = /project class = button version = blue>
            <i class = "fas fa-arrow-left"></i>Back</a>

        <button type = submit class = button version = blank>
            <i class = "fas fa-upload"></i>Submit</button>
    </form>
</section>

${blocks.footer()}

<script>
    const context = canvas.getContext("2d")
    const reader = new FileReader()

    const enter = _ => document.body.style.overflow = "hidden"
    const leave = _ => document.body.style.overflow = "auto"

    const capture = _ => {
        form.children[2].value = canvas.toDataURL("image/jpeg", 0.8)
        check()
    }

    const check = _ => {
        const tags = [...get(".tags").children].filter(input => input.value.trim())
        const submit = tags.length && form.children[2].value ? true : false
        
        form.lastElementChild.setAttribute("version", submit ? "blue" : "blank")
        return submit
    }

    const screenshot = div => {
        const iframe = div.previousElementSibling
        const screen = iframe.contentWindow ? iframe.contentWindow.document.body : iframe.contentDocument.body

        html2canvas(screen, {scale: 1}).then(image => {
            context.drawImage(
                image, 0, 0,
                iframe.clientWidth, iframe.clientHeight,
                0, 0, canvas.width, canvas.height)

            capture()
        })
    }

    const change = input => {
        if (!input.files.length) return

        reader.onload = _ => {
            const image = new Image()

            image.onload = _ => {
                const width = image.width * canvas.height / image.height
                const height = image.height * canvas.width / image.width

                if (image.width / 5 * 3 > image.height)
                    context.drawImage(
                        image, (canvas.width - width) / 2,
                        0, width, canvas.height)

                else context.drawImage(
                    image, 0, (canvas.height - height) / 2,
                    canvas.width, height)

                capture()
            }
            
            image.src = reader.result
        }

        reader.readAsDataURL(input.files[0])
    }

    const key = event => {
        const previous = event.target.previousElementSibling

        if (event.key == "Backspace" && !event.target.selectionStart && previous) {
            const caret = previous.value.length

            previous.setSelectionRange(caret, caret)
            previous.focus()
        }
    }

    const insert = event => {
        if (event.data == " ") {
            const next = event.target.nextElementSibling

            if (next) {
                const caret = event.target.selectionStart
                const string = event.target.value

                event.target.value = string.substring(0, caret)
                next.value = string.substring(caret).replace(/\\s/g, "")
                next.focus()
            }

            event.target.value = event.target.value.replace(/\\s/g, "")
        }

        event.target.value = event.target.value.toLowerCase()
        check()
    }
</script>`
    }),

    page: _ => ({
        head: /*html*/
`<title>JS-ByteBase · Not Found</title>

<style>
    body, html {height: 100%}
    .main {color: var(--text-contrast)}
    .main p {font-size: var(--font)}
</style>`,

        body: /*html*/
`<section class = main page = narrow>
    <h1>Not Found</h1>

    <p>
        This page doesn't exist.
    </p>
</section>

<canvas id = canvas class = background></canvas>
<script>error(canvas, 404, 1, 0.6, 0.4)</script>`
    }),

    error: _ => ({
        head: /*html*/
`<title>JS-ByteBase · Internal Server Error</title>

<style>
    body, html {height: 100%}
    .main {color: var(--text-contrast)}
    .main p {font-size: var(--font)}
</style>`,

        body: /*html*/
`<section class = main page = narrow>
    <h1>Internal Server Error</h1>

    <p>
        We are very sorry.
    </p>
</section>

<canvas id = canvas class = background></canvas>
<script>error(canvas, 500, 1, 0.4, 0.6)</script>`
    }),

    forbidden: _ => ({
        head: /*html*/
`<title>JS-ByteBase · Forbidden</title>

<style>
    body, html {height: 100%}
    .main {color: var(--text-contrast)}
    .main p {font-size: var(--font)}
</style>`,

        body: /*html*/
`<section class = main page = narrow>
    <h1>Forbidden</h1>

    <p>
        You don't have access to this page. Try signing in.
    </p>
</section>

<canvas id = canvas class = background></canvas>
<script>error(canvas, 403, 1, 1, 1)</script>`
    }),
}

const page = (name, data = {}) => {
    const html = pages[name](data)

    return /*html*/ `<!DOCTYPE html>
<html lang = en-gb>
    <head>
        <script async src = "https://www.googletagmanager.com/gtag/js?id=G-Z48CP6DVRN"></script>
        <script src = https://kit.fontawesome.com/1dc9aa0b49.js crossorigin = anonymous></script>
        <script src = /main.js></script>

        <meta name = viewport content = "width = device-width, initial-scale = 1">
        <link rel = icon href = /favicon.ico sizes = "16x16 24x24 32x32 48x48 64x64 110x110 114x114" type = image/vnd.microsoft.icon>
        <link rel = stylesheet href = /main.css>
        
        ${html.head.replace(/\n/g, "\n\t\t")}
    </head>

    <body>
        ${html.body.replace(/\n/g, "\n\t\t")}
    </body>
</html>`
}

const find = collection => client.db(set.db).collection(collection)
const person = async (name) => await find("users").findOne({name}, {projection: {name: 1, image: 1}})
const protocol = req => req.headers["x-forwarded-proto"] == "https" ? "https" : "http"
const word = name => new RegExp(`\\b${name}\\b`, "i")
const age = 3.1536e12

const session = storage({
    cookie: {maxAge: age},
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: true,
    secure: true,
    store: store.create({mongoUrl: url})
})

const transporter = nodemailer({
    host: "smtp.zoho.eu",
    auth: {user: process.env.EMAIL, pass: process.env.PASSWORD},
    port: 465,
    secure: true
})

const convert = string => {
    let value = ""
    for (let i in string) value += `&#${string[i].charCodeAt()};`
    return value
}

const collection = async (filter = "Top", search = "", index = 0, key, person) => {
    const array = search.toLowerCase().split(/(\s|,)/g).filter(i => i)
    const projects = await find("projects").find(person ? {name: person} : {}).toArray()
    const rated = {}

    projects.forEach(project => {
        let rating = filter == "Top" ?
            project.smiles.length + (project.views / 20) :
            filter == "Newest" ? 5 / ((Date.now() - project.date) / (1000 * 60 * 60 * 24)) :
            (key + project.date) % 100 / 10
            
        array.forEach(item => {
            project.tags.forEach(tag => tag == item && (rating += 10))

            const get = (string, value) => {
                const match = string.match(new RegExp(item, "i"))
                return (match ? match.length * value : 0)
            }

            rating += get(project.title, 5)
            rating += get(project.description, 2)
            project.comments.forEach(source => rating += get(source.comment, 1))
        })

        rated[rating + project.id] = project.image
    })

    return Object.keys(rated).sort(
        (a, b) => Number(b.slice(0, -4)) - Number(a.slice(0, -4))).slice(index, index + 12).map(
            key => ({image: rated[key], id: key.slice(-4)}))
}

app.use(session)
app.use(parser())
app.use(express.urlencoded({extended: true}))
app.use(express.static(__dirname + "/files"))

app.get("/sitemap.xml", async (req, res, next) => {
    try {
        let content = /*xml*/ `<?xml version = "1.0" encoding = "UTF-8"?><urlset xmlns = "http://www.sitemaps.org/schemas/sitemap/0.9">`

        const insert = (url, change, priority) =>
            content += blocks.sitemap(req, url, change, priority)

        insert("", "monthly", 1)
        insert("gallery", "hourly", 1)
        insert("create", "monthly", 0.5)
        insert("sign", "monthly", 0.5)
        insert("email", "monthly", 0.5)

        const users = await find("users").find().toArray()
        const projects = await find("projects").find().toArray()

        users.forEach(user => insert("profile/" + user.name, "weekly", 0.3))

        projects.forEach(project => {
            insert("demo/" + project.id, "weekly", 0.3)
            insert("project/" + project.id, "yearly", 0.1)
        })

        content += /*xml*/ `</urlset>`
        return res.set("Content-Type", "text/xml").send(content)
    }
    
    catch (error) {next(error)}
})

app.get("/create", (req, res) => res.send(page("create")))
app.get("/sign", (req, res) => res.send(page("sign")))
app.get("/email", (req, res) => res.send(page("email")))

app.get("/password", (req, res, next) => {
    try {if (req.session.name) res.send(page("password"))}
    catch (error) {next(error)}
})

app.get("/", async (req, res, next) => {
    try {res.send(page("home", {user: await person(req.session.name)}))}
    catch (error) {next(error)}
})

app.get("/gallery", async (req, res, next) => {
    try {        
        res.send(page("gallery", {
            user: await person(req.session.name)}))
    }

    catch (error) {next(error)}
})

app.get("/project", async (req, res, next) => {
    try {
        const user = await person(req.session.name)
        if (user) return res.send(page("project", {user}))
        res.send(page("forbidden"))
    }

    catch (error) {next(error)}
})

app.post("/finish", async (req, res, next) => {
    try {
        const user = await person(req.session.name)

        if (Buffer.from(req.body.code).length <= 2048 && user) {
            req.session.code = req.body.code
            return res.send(page("finish", {user, code: req.body.code}))
        }

        res.send(page("forbidden"))
    }

    catch (error) {next(error)}
})

app.post("/submit", async (req, res, next) => {
    try {
        const image = size(Buffer.from(req.body.image.replace(/data:image\/jpeg;base64/, ""), "base64"))
        const words = []

        for (let i = 1; i <= 5; i ++) {
            const tag = req.body["tag_" + i].trim()
            if (tag) words.push(tag.toLowerCase())
        }

        if (image.width == 400 && image.height == 240 && req.session.code && words.length) {
            const generate = _ => Math.floor(Math.random() * 1679615).toString(36)
            let identity = generate()

            while (await find("projects").findOne({id: identity}))
                identity = generate()

            await find("projects").insertOne({
                id: identity,
                name: req.session.name,
                title: req.body.title.trim() || "Untitled",
                description: req.body.description.trim(),
                tags: words,
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

app.post("/gallery", async (req, res, next) => {
    try {
        res.send(page("gallery", {
            user: await person(req.session.name),
            search: req.body.search}))
    }

    catch (error) {next(error)}
})

app.post("/search", async (req, res, next) => {
    try {
        res.send(await collection(
            req.body.filter, req.body.search, Number(req.body.index),
            Number(req.body.key), req.body.person))
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

app.post("/create", async (req, res, next) => {
    try {
        if (await find("users").findOne({name: {$regex: word(req.body.name)}}))
            return res.send(page("create", {error: "Username already exists"}))
    
        if (await find("users").findOne({email: req.body.email}))
            return res.send(page("create", {error: "Email already exists"}))

        const image = canvas(100, 100)
        const context = image.getContext("2d")

        context.fillStyle = "#fff"
        context.fillRect(0, 0, image.width, image.height)
        context.fillStyle = "#000"

        for (let i = 0; i < 50; i ++) {
            const x = i & 3.5
            const y = i >> 3.5
            const size = 12
            
            const random = _ => ~~(Math.random() * 255)
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

        await find("users").insertOne({
            name: req.body.name,
            email: req.body.email,
            verified: false,
            password,
            date: Date.now(),
            projects: {},
            website: "",
            image: url
        })

        const options = {
            from: process.env.EMAIL,
            to: req.body.email,
            subject: "Welcome to JS-ByteBase",
            html: emails.welcome(req.body.name),
            attachments: [{filename: "profile.png", path: url}]
        }
        
        transporter.sendMail(options, error => {
            if (error) return next(error)
            res.redirect("/")
        })
    }
    
    catch (error) {next(error)}
})

app.post("/sign", async (req, res, next) => {
    try {
        const user = await find("users").findOne({name: req.body.name}, {projection: {password: 1}})

        if (user && await bcrypt.compare(req.body.password, user.password)) {
            req.session.name = req.body.name
            return res.redirect("/")
        }
        
        res.send(page("sign", {error: "Incorrect password"}))
    }

    catch (error) {next(error)}
})

app.post("/email", async (req, res, next) => {
    try {
        const user = await find("users").findOne({email: req.body.email}, {projection: {name: 1}})
        if (!user) return res.send(page("email", {error: "Email doesn't exist"}))

        let code = ""
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

        for (let i = 0; i < 128; i ++)
            code += chars[Math.floor(Math.random() * chars.length)]

        await find("verify").insertOne({
            name: user.name,
            url: code,
            date: Date.now()
        })

        const address = `${protocol(req)}://${req.get("host")}/verify/${code}`

        const options = {
            from: process.env.EMAIL,
            to: req.body.email,
            subject: "Verify Your Email",
            html: emails.verify(user.name, address)
        }
        
        transporter.sendMail(options, error => {
            if (error) return next(error)
            res.send(page("verify", {email: req.body.email}))
        })
    }

    catch (error) {next(error)}
})

app.post("/password", async (req, res, next) => {
    try {
        const password = await bcrypt.hash(req.body.password, 10)

        if (await bcrypt.compare(req.body.confirm, password)) {
            await find("users").updateOne({name: req.session.name}, {$set: {password}})
            return res.redirect("/")
        }

        res.send(page("password", {error: "Passwords don't match"}))
    }

    catch (error) {next(error)}
})

app.post("/log", async (req, res, next) => {
    try {
        req.session.destroy()
        res.redirect("/")
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
        const project = await find("projects").findOne(
            {id: req.body.project},
            {projection: {smiles: 1}})

        if (project && project.name == req.session.name && project.smiles.length < 10) {
            await find("projects").deleteOne({id: req.body.project})
            return res.redirect("/gallery")
        }

        if (req.session.name == process.env.HOST)
            await find("projects").deleteOne({id: req.body.project})
    }

    catch (error) {next(error)}
})

app.post("/comment", async (req, res, next) => {
    try {
        const project = await find("projects").findOne(
            {id: req.body.project},
            {projection: {comments: 1}})

        if (project && req.session.name) {
            if (req.body.type)
                req.body.index.trim() && project.comments.push({
                    name: req.session.name,
                    comment: req.body.index.trim(),
                    flags: []
                })

            else project.comments.splice(req.body.index, 1)

            await find("projects").updateOne(
                {id: req.body.project},
                {$set: {comments: project.comments}})
        }
    }

    catch (error) {next(error)}
})

app.post("/report", async (req, res, next) => {
    try {
        const project = await find("projects").findOne(
            {id: req.body.project}, {projection: {flags: 1}})

        if (project && req.session.name) {
            if (req.body.type)
                project.flags.includes(req.session.name) ||
                project.flags.push(req.session.name)

            else project.flags.splice(
                project.flags.indexOf(req.session.name), 1)

            await find("projects").updateOne(
                {id: req.body.project},
                {$set: {flags: project.flags}})
        }
    }

    catch (error) {next(error)}
})

app.post("/like", async (req, res, next) => {
    try {
        const project = await find("projects").findOne(
            {id: req.body.project},
            {projection: {smiles: 1}})
        
        if (project && req.session.name) {
            if (req.body.type)
                project.smiles.includes(req.session.name) ||
                project.smiles.push(req.session.name)

            else project.smiles.splice(
                project.smiles.indexOf(req.session.name), 1)

            await find("projects").updateOne(
                {id: req.body.project},
                {$set: {smiles: project.smiles}})
        }
    }

    catch (error) {next(error)}
})

app.post("/flag", async (req, res, next) => {
    try {
        const project = await find("projects").findOne(
            {id: req.body.project},
            {projection: {comments: 1}})

        if (project && req.session.name) {
            if (req.body.type)
                project.comments[req.body.index].flags.includes(req.session.name) ||
                project.comments[req.body.index].flags.push(req.session.name)

            else project.comments[req.body.index].flags.splice(
                project.comments[req.body.index].flags.indexOf(req.session.name), 1)

            await find("projects").updateOne(
                {id: req.body.project},
                {$set: {comments: project.comments}})
        }
    }
    
    catch (error) {next(error)}
})

app.use(async (req, res, next) => {
    try {
        if (/\/(verify|demo|project|profile)\/.+/.test(req.url)) {
            const url = req.url.replace(/\/(verify|demo|project|profile)\//, "")

            if (req.url.startsWith("/demo/")) {
                const project = await find("projects").findOne({id: {$regex: word(url)}})

                if (project) {
                    const users = {}
                    const user = await person(req.session.name)
                    const creator = await person(project.name)
                    const views = JSON.parse(req.cookies.views || "[]")

                    const array = await find("users").find(
                        {name: {$in: project.comments.map(comment => comment.name)}},
                        {projection: {name: 1, image: 1}}).toArray()
                        
                    array.forEach(user => users[user.name] = user.image)

                    if (!views.includes(url)) {
                        views.push(url)
                        await find("projects").updateOne({id: project.id}, {$inc: {views: 1}})
                        res.cookie("views", JSON.stringify(views), {httpOnly: true, maxAge: age})
                    }

                    return res.send(page("demo", {user, project, creator, users, host: req.get("host")}))
                }
            }

            else if (req.url.startsWith("/project/")) {
                const project = await find("projects").findOne(
                    {id: {$regex: word(url)}},
                    {projection: {title: 1, name: 1, description: 1, code: 1}})

                if (project)
                    return res.send(page("main", {project}))
            }

            else if (req.url.startsWith("/profile/")) {
                const profile = await find("users").findOne({name: {$regex: word(url)}})

                if (profile) {
                    const user = await person(req.session.name)

                    const projects = await find("projects").find(
                        {name: {$regex: word(url)}},
                        {projection: {id: 1, image: 1, smiles: 1}}).toArray()

                    return res.send(page("profile", {
                        user, profile, host: req.get("host"), protocol: protocol(req), projects}))
                }
            }

            else if (req.url.startsWith("/verify/")) {
                const verify = await find("verify").findOne({url})

                if (verify) {
                    req.session.name = verify.name
                    return res.redirect("/password")
                }
                
                return res.send(page("expired"))
            }
        }

        res.status(404).send(page("page"))
    }

    catch (error) {next(error)}
})

app.use(async (err, req, res, next) => {
    const error = await find("errors").findOne({message: err.message})
    if (error) await find("errors").updateOne({message: err.message}, {$inc: {index: 1}})
    else await find("errors").insertOne({message: err.message, stack: err.stack, index: 1})

    console.log(err)
    res.status(500).send(page("error"))
})

client.connect()
server.listen(process.env.PORT)

setInterval(async _ => await find("verify").deleteMany(
    {date: {$lt: Date.now() - 1000 * 60 * 60}}), 1000 * 60)