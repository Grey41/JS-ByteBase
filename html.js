"use strict"

const license = `<!--Welcome to JS ByteBase.

JS ByteBase is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
at your option) any later version.

JS ByteBase is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
-->`

module.exports = {
    home(user) {
        return `${license}
<!DOCTYPE html>
<html lang = "en-gb">
    <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src = "https://www.googletagmanager.com/gtag/js?id=G-Z48CP6DVRN"></script>
        <script src = main.js></script>

        <title>JS ByteBase</title>

        <script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@type": "Organization",
                "url": "https://www.js-bytebase.com",
                "logo": "https://www.js-bytebase.com/logo.png"
            }
        </script>

        <meta name = description content = "Join the JavaScript 2k community. Play games, upload original projects, share your creations and build your portfolio.">
        <meta name = viewport content = "width = device-width, initial-scale = 1.0">

        <link rel = icon href = favicon.ico sizes = "16x16 24x24 32x32 48x48 64x64 110x110 114x114" type = "image/vnd.microsoft.icon">
        <link rel = stylesheet href = main.css>
        
        <script src = https://kit.fontawesome.com/1dc9aa0b49.js crossorigin = anonymous></script>

        <style>
            body, html {
                height: 100%
            }

            canvas {
                position: absolute;
                top: 0;
                left: 0;
                z-index: -1
            }

            .main {
                color: var(--text-contrast);
                height: calc(100vh - 3em)
            }

            .main p {
                font-size: var(--font)/*25*/
            }
        </style>
    </head>

    <body>        
        <section class = top>
            <div>
                <a class = logo href = />
                    <svg xmlns = http://www.w3.org/2000/svg viewBox = "0 0 630 630">
                        <path d = "M 0 0 V 630 H 630 V 183 Q 446 183 446 0" fill = "#f7df1e"/>
                        <path d = "m 423 492 c 13 21 29 36 58 36 c 25 0 40 -12 40 -29 c 0 -20 -16 -28 -43 -39 l -15 -6 c -43 -18 -71 -41 -71 -89 c 0 -44 34 -78 87 -78 c 38 0 65 13 84 47 l -46 30 c -10 -18 -21 -25 -38 -25 c -17 0 -28 11 -28 25 c 0 18 11 25 36 36 l 15 6 c 50 22 79 44 79 93 c 0 53 -42 83 -98 83 c -55 0 -91 -26 -108 -61 z m -209 5 c 9 17 18 30 38 30 c 19 0 32 -8 32 -37 v -201 h 59 v 202 c 0 61 -36 89 -88 89 c -47 0 -75 -25 -89 -54 z" fill = "#000"/>
                    </svg>
                    
                    <span>ByteBase</span>
                </a>
                
                <form action = /gallery method = post>
                    <input type = text name = search placeholder = Search>
                </form>

                <a href = /gallery>
                    <button class = button version = plain>Gallery</button>
                </a>

                ${user ? `<a href = /profile/${user.name}>
                    <button class = "profile button" version = plain>
                        <img id = user src = "${user.image}">${user.name}
                    </button>
                </a>
                        
                <a href = /project>
                    <button class = button version = plain>New<span> project</span></button>
                </a>` : `<a href = /sign>
                    <button class = button version = plain>Sign in</button>
                </a>

                <a href = /create>
                    <button class = button version = green>Create<span> account</span></button>
                </a>`}
            </div>
        </section>

        <section class = main page = narrow onclick = "window.location.href = '/gallery'">
            <h1>Welcome to JS ByteBase</h1>

            <p>
                Join the JavaScript 2k community.
                <br>
                Play games, upload original projects, share your creations and build your portfolio.
            </p>
        </section>

        <canvas id = canvas></canvas>

        <script>
            const webgl = canvas.getContext("webgl")
            const program = webgl.createProgram()
            let contrast = 0.01
            let fade = 0
            
            function resize() {
                canvas.width = document.body.clientWidth
                canvas.height = document.body.clientHeight
                webgl.viewport(0, 0, canvas.width, canvas.height)
                webgl.uniform1f(webgl.getUniformLocation(program, "width"), canvas.width)
            }
            
            function loop() {
                webgl.clear(webgl.COLOR_BUFFER_BIT)
                contrast *= 1.01
                fade += (1 - fade) * 0.001
                webgl.uniform1f(webgl.getUniformLocation(program, "contrast"), contrast)
                webgl.uniform1f(webgl.getUniformLocation(program, "fade"), fade)
                webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4)
            
                requestAnimationFrame(loop)
            }
            
            const vertex_shader = webgl.createShader(webgl.VERTEX_SHADER)
            webgl.shaderSource(vertex_shader, \`
                attribute vec2 vertex;
        
                void main(void) {
                    gl_Position = vec4(vertex, 0, 1);
                }\`)
        
            webgl.compileShader(vertex_shader)
            webgl.attachShader(program, vertex_shader)
        
            const fragment_shader = webgl.createShader(webgl.FRAGMENT_SHADER)
            webgl.shaderSource(fragment_shader, \`
                precision highp float;
        
                uniform float width;
                uniform float contrast;
                uniform float fade;
        
                void main(void) {
                    float zoom = 10000.0;
                    float value = 0.0;

                    vec2 pos = vec2((gl_FragCoord.x - 1.28 * zoom - width) / zoom, (gl_FragCoord.y + 0.035 * zoom) / zoom);
                    vec2 solid = pos;
        
                    for (int index = 0; index < 200; index ++) {
                        vec2 power = vec2(pos.x * pos.x - pos.y * pos.y, 2.0 * pos.x * pos.y);
                        pos.x = power.x + solid.x;
                        pos.y = power.y + solid.y;
        
                        if (pos.x * pos.y > contrast) {
                            value = float(index);
                            break;
                        }
                    }
        
                    float next = value / 80.0 * fade;
                    gl_FragColor = vec4(next, next, next, 1); 
                }\`)
        
            webgl.compileShader(fragment_shader)
            webgl.attachShader(program, fragment_shader)
        
            webgl.linkProgram(program)
            webgl.useProgram(program)
        
            const buffer = webgl.createBuffer()
            webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer)
            webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array([-1, 1, 1, 1, -1, -1, 1, -1]), webgl.STATIC_DRAW)
            webgl.vertexAttribPointer(0, 2, webgl.FLOAT, false, 0, 0)
            webgl.enableVertexAttribArray(0)
        
            addEventListener("resize", resize)
            resize()
            loop()
        </script>
    </body>
</html>`
    },

    gallery(user, search) {
        return `${license}
<!DOCTYPE html>
<html lang = "en-gb">
    <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src = "https://www.googletagmanager.com/gtag/js?id=G-Z48CP6DVRN"></script>
        <script src = main.js></script>

        <title>JS ByteBase · Gallery</title>
        <meta name = description content = "Explore the complete collection of JS ByteBase projects">
        <meta name = viewport content = "width = device-width, initial-scale = 1.0">
        
        <link rel = icon href = favicon.ico sizes = "16x16 24x24 32x32 48x48 64x64 110x110 114x114" type = "image/vnd.microsoft.icon">
        <link rel = stylesheet href = main.css>
    </head>

    <body>        
        <section class = top>
            <div>
                <a class = logo href = />
                    <svg xmlns = http://www.w3.org/2000/svg viewBox = "0 0 630 630">
                        <path d = "M 0 0 V 630 H 630 V 183 Q 446 183 446 0" fill = "#f7df1e"/>
                        <path d = "m 423 492 c 13 21 29 36 58 36 c 25 0 40 -12 40 -29 c 0 -20 -16 -28 -43 -39 l -15 -6 c -43 -18 -71 -41 -71 -89 c 0 -44 34 -78 87 -78 c 38 0 65 13 84 47 l -46 30 c -10 -18 -21 -25 -38 -25 c -17 0 -28 11 -28 25 c 0 18 11 25 36 36 l 15 6 c 50 22 79 44 79 93 c 0 53 -42 83 -98 83 c -55 0 -91 -26 -108 -61 z m -209 5 c 9 17 18 30 38 30 c 19 0 32 -8 32 -37 v -201 h 59 v 202 c 0 61 -36 89 -88 89 c -47 0 -75 -25 -89 -54 z" fill = "#000"/>
                    </svg>
                    
                    <span>ByteBase</span>
                </a>
                
                <input type = text placeholder = Search id = search value = ${search ? search : "\"\""}>

                <select class = button version = plain id = select>
                    <option>Top</option>
                    <option>Newest</option>
                    <option>Random</option>
                </select>

                ${user ? `<a href = /profile/${user.name}>
                    <button class = "profile button" version = plain>
                        <img id = user src = "${user.image}">${user.name}
                    </button>
                </a>
                        
                <a href = /project>
                    <button class = button version = plain>New<span> project</span></button>
                </a>` : `<a href = /sign>
                    <button class = button version = plain>Sign in</button>
                </a>

                <a href = /create>
                    <button class = button version = green>Create<span> account</span></button>
                </a>`}
            </div>
        </section>

        <section class = main page = wide>
            <div id = gallery class = gallery></div>

            <footer>
                <span>&copy; Copyright ${new Date().getFullYear()} JS ByteBase ·
                <a href = mailto:hello@js-bytebase.com>hello@js-bytebase.com</a></span>
            </footer>
        </section>

        <script>
            const http = new XMLHttpRequest()
            let data = []

            function shift() {
                for (let i = 0; i < 12; i ++) {
                    const index = gallery.children.length
                    if (index == data.length) break

                    const a = document.createElement("a")
                    const img = document.createElement("img")
                    a.href = "/demo/" + data[index].id
                    img.src = data[index].image

                    a.appendChild(img)
                    gallery.appendChild(a)
                }
            }

            function request() {
                http.open("POST", "/request")

                http.onload = () => {
                    data = JSON.parse(http.response)
                    gallery.innerHTML = ""
                    shift()
                }

                http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                http.send("search=" + encodeURIComponent(search.value) + "&filter=" + select.value)
            }

            window.onscroll = () => (innerHeight + Math.ceil(pageYOffset) >= document.body.offsetHeight) && shift()
            const observer = new MutationObserver(onscroll)
            observer.observe(document, {childList: true, subtree: true})

            search.addEventListener("change", request)
            select.addEventListener("change", request)
            request()
        </script>
    </body>
</html>`
    },

    create(error) {
        return `${license}
<!DOCTYPE html>
<html lang = "en-gb">
    <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src = "https://www.googletagmanager.com/gtag/js?id=G-Z48CP6DVRN"></script>
        <script src = main.js></script>

        <title>JS ByteBase · Create Account</title>
        <meta name = description content = "Create a new account">
        <meta name = viewport content = "width = device-width, initial-scale = 1.0">

        <link rel = icon href = favicon.ico sizes = "16x16 24x24 32x32 48x48 64x64 110x110 114x114" type = "image/vnd.microsoft.icon">
        <link rel = stylesheet href = main.css>
        <link rel = stylesheet href = account.css>

        <script src = https://kit.fontawesome.com/1dc9aa0b49.js crossorigin = anonymous></script>
    </head>

    <body>
        <div>
            <form action = "" method = post>
                <input type = text name = name placeholder = Username required>
                <input type = email name = email placeholder = Email required>
                <input type = password name = password placeholder = Password required>

                <button class = button version = green type = submit>
                    <i class = "fas fa-sign-in-alt"></i>Create
                </button>${error ? `
                
                <span>${error}</span>` : ""}
            </form>    
        </div>    

        <a href = /sign>Sign in</a>
    </body>
</html>`
    },

    sign(error) {
        return `${license}
<!DOCTYPE html>
<html lang = "en-gb">
    <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src = "https://www.googletagmanager.com/gtag/js?id=G-Z48CP6DVRN"></script>
        <script src = main.js></script>

        <title>JS ByteBase · Sign In</title>
        <meta name = description content = "Sign in to JS ByteBase">
        <meta name = viewport content = "width = device-width, initial-scale = 1.0">

        <link rel = icon href = favicon.ico sizes = "16x16 24x24 32x32 48x48 64x64 110x110 114x114" type = "image/vnd.microsoft.icon">
        <link rel = stylesheet href = main.css>
        <link rel = stylesheet href = account.css>

        <script src = https://kit.fontawesome.com/1dc9aa0b49.js crossorigin = anonymous></script>
    </head>

    <body>
        <div>
            <form action = "" method = post>
                <input type = text name = name placeholder = Username required>
                <input type = password name = password placeholder = Password required>

                <button class = button version = green type = submit>
                    <i class = "fas fa-sign-in-alt"></i>Sign in
                </button>${error ? `
                
                <span>${error}</span>` : ""}
            </form>    
        </div>    

        <a href = /password>Forgot password</a>
    </body>
</html>`
    },

    password(error) {
        return `${license}
<!DOCTYPE html>
<html lang = "en-gb">
    <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src = "https://www.googletagmanager.com/gtag/js?id=G-Z48CP6DVRN"></script>
        <script src = main.js></script>

        <title>JS ByteBase · Change Password</title>
        <meta name = description content = "Change your password">
        <meta name = viewport content = "width = device-width, initial-scale = 1.0">

        <link rel = icon href = favicon.ico sizes = "16x16 24x24 32x32 48x48 64x64 110x110 114x114" type = "image/vnd.microsoft.icon">
        <link rel = stylesheet href = main.css>
        <link rel = stylesheet href = account.css>

        <script src = https://kit.fontawesome.com/1dc9aa0b49.js crossorigin = anonymous></script>
    </head>

    <body>
        <div>
            <form action = "" method = post>
                <input type = email name = email placeholder = Email required>
                <input type = password name = password placeholder = "New password" required>

                <button class = button version = green type = submit>
                    <i class = "fas fa-unlock-alt"></i></i>Verify
                </button>${error ? `
                
                <span>${error}</span>` : ""}
            </form>    
        </div>    

        <a href = /sign>Sign in</a>
    </body>
</html>`
    },

    verify(email) {
        return `${license}
<!DOCTYPE html>
<html lang = "en-gb">
    <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src = "https://www.googletagmanager.com/gtag/js?id=G-Z48CP6DVRN"></script>
        <script src = main.js></script>

        <title>JS ByteBase · Change Password</title>
        <meta name = viewport content = "width = device-width, initial-scale = 1.0">

        <link rel = icon href = favicon.ico sizes = "16x16 24x24 32x32 48x48 64x64 110x110 114x114" type = "image/vnd.microsoft.icon">
        <link rel = stylesheet href = main.css>
        <link rel = stylesheet href = account.css>

        <script src = https://kit.fontawesome.com/1dc9aa0b49.js crossorigin = anonymous></script>

        <style>
            span {
                color: var(--green)
            }
        </style>
    </head>    

    <body>
        <h3>Verification email sent to <span>${email}</span></h3>
        You can close this page
    </body>
</html>`
    },

    expired() {
        return `${license}
<!DOCTYPE html>
<html lang = "en-gb">
    <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src = "https://www.googletagmanager.com/gtag/js?id=G-Z48CP6DVRN"></script>
        <script src = ../main.js></script>

        <title>JS ByteBase · Link Expired</title>
        <meta name = viewport content = "width = device-width, initial-scale = 1.0">

        <link rel = icon href = ../favicon.ico sizes = "16x16 24x24 32x32 48x48 64x64 110x110 114x114" type = "image/vnd.microsoft.icon">
        <link rel = stylesheet href = ../main.css>

        <script src = https://kit.fontawesome.com/1dc9aa0b49.js crossorigin = anonymous></script>

        <style>
            body, html {    
                height: 100%    
            }

            body {
                display: flex;
                align-items: center;
                flex-direction: column;
                justify-content: center;
                color: var(--text)
            }

            a {
                text-decoration: none;
                color: var(--blue);
                display: inline
            }

            a:hover {
                color: var(--blank)
            }
        </style>
    </head>    

    <body>
        <h3>This link has expired</h3>
        <span>Click <a href = /password>here</a> to try again</span>
    </body>
</html>`
    },

    project(user) {
        return `${license}
<!DOCTYPE html>
<html lang = "en-gb">
    <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src = "https://www.googletagmanager.com/gtag/js?id=G-Z48CP6DVRN"></script>
        <script src = main.js></script>

        <title>JS ByteBase · Create Project</title>
        <meta name = viewport content = "width = device-width, initial-scale = 1.0">

        <link rel = icon href = favicon.ico sizes = "16x16 24x24 32x32 48x48 64x64 110x110 114x114" type = "image/vnd.microsoft.icon">
        <link rel = stylesheet href = main.css>
        
        <script src = https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js></script>
        <script src = https://kit.fontawesome.com/1dc9aa0b49.js crossorigin = anonymous></script>
        <script src = map.js></script>
        <script src = bundle.js></script>
        <script src = saver.js></script>

        <style>
            iframe {
                border-radius: var(--radius);
                background-color: #fff;
                width: 100%;
                height: 100%;
                border: none
            }
            
            .respond {
                background-color: var(--button);
                border-radius: var(--radius);
                position: relative;
                display: flex;
                flex-direction: row;
                height: calc(100vh - 9em);
                width: 100%;
                overflow: hidden;
                padding: 1em
            }
            
            .editor {
                border-radius: var(--radius);
                padding: var(--padding);
                width: 50%;
                resize: horizontal;
                overflow: hidden;
                flex: 0 1 1;
                font-size: var(--font);
                margin-right: 1em
            }

            .respond > div:nth-child(2) {
                width: 1em;
                display: flex;
                flex-direction: column;
                flex: auto 1 0
            }

            .respond > div:nth-child(2) div:first-child {
                resize: vertical;
                overflow: hidden;
                width: 100%;
                height: 80%;
                margin-bottom: 1em
            }

            .respond > div:nth-child(2) div:last-child {
                background-color: var(--background);
                border-radius: var(--radius);
                padding: var(--padding);
                white-space: nowrap;
                overflow: auto;
                font-family: monospace;
                border: none;
                flex: 1 1 0;
                width: 100%
            }
            
            .respond > span {
                font-size: 14px;
                font-family: monospace;
                position: absolute;
                left: 1.5em;
                bottom: 0.1em
            }

            .flex > button, .flex > form, .flex > label {
                display: inline-block;
                margin: 0 1em 1em 0
            }

            .flex > label {
                cursor: pointer
            }
        </style>
    </head>

    <body>
        <section class = top>
            <div>
                <a class = logo href = />
                    <svg xmlns = http://www.w3.org/2000/svg viewBox = "0 0 630 630">
                        <path d = "M 0 0 V 630 H 630 V 183 Q 446 183 446 0" fill = "#f7df1e"/>
                        <path d = "m 423 492 c 13 21 29 36 58 36 c 25 0 40 -12 40 -29 c 0 -20 -16 -28 -43 -39 l -15 -6 c -43 -18 -71 -41 -71 -89 c 0 -44 34 -78 87 -78 c 38 0 65 13 84 47 l -46 30 c -10 -18 -21 -25 -38 -25 c -17 0 -28 11 -28 25 c 0 18 11 25 36 36 l 15 6 c 50 22 79 44 79 93 c 0 53 -42 83 -98 83 c -55 0 -91 -26 -108 -61 z m -209 5 c 9 17 18 30 38 30 c 19 0 32 -8 32 -37 v -201 h 59 v 202 c 0 61 -36 89 -88 89 c -47 0 -75 -25 -89 -54 z" fill = "#000"/>
                    </svg>
                    
                    <span>ByteBase</span>
                </a>
                
                <form action = /gallery method = post>
                    <input type = text name = search placeholder = Search>
                </form>

                <a href = /gallery>
                    <button class = button version = plain>Gallery</button>
                </a>

                ${user ? `<a href = /profile/${user.name}>
                    <button class = "profile button" version = plain>
                        <img id = user src = "${user.image}">${user.name}
                    </button>
                </a>
                        
                <a href = /project>
                    <button class = button version = plain>New<span> project</span></button>
                </a>` : `<a href = /sign>
                    <button class = button version = plain>Sign in</button>
                </a>

                <a href = /create>
                    <button class = button version = green>Create<span> account</span></button>
                </a>`}
            </div>
        </section>

        <section class = main page = wide>
            <div class = flex>
                <button class = button version = plain onclick = run()><i class = "fas fa-cog"></i>Run</button>
                <button class = button version = plain onclick = mini()><i class = "fas fa-compress-alt"></i>Minify</button>
                <button class = button version = plain onclick = fullscreen()><i class = "fas fa-expand"></i>Fullscreen</button>
                <button class = button version = plain onclick = save()><i class = "fas fa-save"></i>Save</button>

                <label class = button version = plain>
                    <input type = file id = file accept = ".js, application/javascript, text/javascript">
                    <i class = "fas fa-folder-open"></i>Open
                </label>

                <form action = /finish method = post onsubmit = "return enter()">
                    <input type = hidden name = code id = text>

                    <button type = submit class = button version = blue id = finish>
                        <i class = "fas fa-arrow-right"></i>Finish
                    </button>
                </form>
            </div>

            <div class = respond>
                <div id = code class = editor></div>

                <div>
                    <div><iframe id = frame></iframe></div>
                    <div id = error></div>
                </div>

                <span id = bytes></span>
            </div>

            <footer>
                <span>&copy; Copyright ${new Date().getFullYear()} JS ByteBase ·
                <a href = mailto:hello@js-bytebase.com>hello@js-bytebase.com</a></span>
            </footer>
        </section>

        <script>
            const editor = ace.edit(code)

            function enter() {
                text.value = encodeURIComponent(editor.getValue())
                return finish.getAttribute("version") == "blue"
            }

            function fullscreen() {
                if (frame.requestFullscreen) frame.requestFullscreen()
                else if (frame.webkitRequestFullscreen) frame.webkitRequestFullscreen()
                else if (frame.msRequestFullscreen) frame.msRequestFullscreen()
            }

            function run() {
                const iframe = document.createElement("iframe")
                frame.before(iframe)
                frame.remove()
                frame = iframe
                frame.sandbox = "allow-scripts"

                const content = frame.contentWindow || frame.contentDocument
                content.document.open()
                content.document.write("<!DOCTYPE html><body style='margin:0;overflow:hidden'></body></html>")
                content.document.close()

                content.console.log = message => show(message, 0)
                error.innerHTML = ""

                try {content.eval(editor.getValue())}
                catch (error) {show(error, 1)}
            }

            function show(message, type) {
                const section = document.createElement("section")
                section.style.color = "var(--" + (type ? "error" : "text") + ")"
                section.innerText = message
                error.appendChild(section)

                if (error.innerText.length > 5000) error.innerHTML = ""
                error.scrollTop = error.scrollHeight
            }

            function save() {
                const blob = new Blob([editor.getValue()], {type: "text/javascript"})
                saveAs(blob, "project.js")
            }

            async function mini() {
                const result = await Terser.minify(editor.getValue(), {
                    compress: {booleans_as_integers: true},
                    format: {comments: false},
                    mangle: {toplevel: true},
                    toplevel: true,
                    nameCache: {}
                })

                editor.setValue(result.code)
                input()
            }

            function input() {
                localStorage.setItem("code", editor.getValue())
                const size = new Blob([editor.getValue()]).size

                bytes.innerText = size + " bytes"
                bytes.style.color = size > 2048 ? "var(--error)" : "var(--text)"
                finish.setAttribute("version", size > 2048 ? "blank" : "blue")
            }

            const observer = new MutationObserver(() => editor.resize())
            observer.observe(code, {attributes: true})

            module.theme(editor)
            editor.session.setMode("ace/mode/javascript")
            editor.on("change", input)

            editor.setValue(
                localStorage.getItem("code") || (
                    "c = document.createElement('canvas')\\ndocument.body.appe" +
                    "ndChild(c)\\n\\nc.width = innerWidth\\nc.height = innerHeight" +
                    "\\n\\nx = c.getContext('2d')\\nx.fillRect(c.width / 2 - 5" +
                    "0, c.height / 2 - 50, 100, 100)"
                )
            )

            file.addEventListener("change", event => {
                if (!file.files.length) return
                const reader = new FileReader()

                reader.onload = () => editor.setValue(reader.result)
                reader.readAsText(file.files[0])
            })
        </script>
    </body>
</html>`
    },

    finish(user, code) {
        return `${license}
<!DOCTYPE html>
<html lang = "en-gb">
    <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src = "https://www.googletagmanager.com/gtag/js?id=G-Z48CP6DVRN"></script>
        <script src = main.js></script>

        <title>JS ByteBase · Submit Project</title>
        <meta name = viewport content = "width = device-width, initial-scale = 1.0">

        <link rel = icon href = favicon.ico sizes = "16x16 24x24 32x32 48x48 64x64 110x110 114x114" type = "image/vnd.microsoft.icon">
        <link rel = stylesheet href = main.css>

        <script src = https://kit.fontawesome.com/1dc9aa0b49.js crossorigin = anonymous></script>
        <script src = screenshot.js crossorigin = anonymous></script>

        <style>
            textarea {
                height: 10em;
                resize: none
            }

            p {
                font-size: var(--small);
                color: var(--fade)
            }

            .main > input[type = "text"], textarea {
                background-color: var(--background);
                color: var(--text);
                padding: var(--padding);
                border-radius: var(--radius);
                border: var(--border) var(--plain);
                margin-bottom: 1em;
                width: 100%
            }

            .respond {
                display: flex;
                flex-direction: row
            }

            .respond > iframe, .respond > div {
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

            .respond > div {
                position: relative
            }

            .tags {
                margin-bottom: 1em;
                width: 100%
            }

            .respond > div > div {
                color: #0003;
                transition: var(--transition);
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

            .respond > div > div > label {
                font-size: var(--font);
                color: #0004;
                transition: var(--transition);
                cursor: pointer
            }

            .respond > div > div > label:hover {
                color: #0007
            }
    
            .respond > div > div > i {
                font-size: 40px
            }
    
            .respond > div > div:hover {
                color: #0006;
                background-color: #fff6
            }

            .respond > div > canvas {
                width: 100%;
                height: 100%
            }

            .tags > input {
                background-color: var(--background);
                color: var(--text);
                border: var(--border) var(--plain);
                border-radius: var(--radius);
                padding: var(--padding);
                width: 5em;
                margin: 0 1em 0 0
            }

            .button[type = "submit"], form {
                float: right
            }
        </style>
    </head>

    <body>        
        <section class = top>
            <div>
                <a class = logo href = />
                    <svg xmlns = http://www.w3.org/2000/svg viewBox = "0 0 630 630">
                        <path d = "M 0 0 V 630 H 630 V 183 Q 446 183 446 0" fill = "#f7df1e"/>
                        <path d = "m 423 492 c 13 21 29 36 58 36 c 25 0 40 -12 40 -29 c 0 -20 -16 -28 -43 -39 l -15 -6 c -43 -18 -71 -41 -71 -89 c 0 -44 34 -78 87 -78 c 38 0 65 13 84 47 l -46 30 c -10 -18 -21 -25 -38 -25 c -17 0 -28 11 -28 25 c 0 18 11 25 36 36 l 15 6 c 50 22 79 44 79 93 c 0 53 -42 83 -98 83 c -55 0 -91 -26 -108 -61 z m -209 5 c 9 17 18 30 38 30 c 19 0 32 -8 32 -37 v -201 h 59 v 202 c 0 61 -36 89 -88 89 c -47 0 -75 -25 -89 -54 z" fill = "#000"/>
                    </svg>
                    
                    <span>ByteBase</span>
                </a>
                
                <form action = /gallery method = post>
                    <input type = text name = search placeholder = Search>
                </form>

                <a href = /gallery>
                    <button class = button version = plain>Gallery</button>
                </a>

                ${user ? `<a href = /profile/${user.name}>
                    <button class = "profile button" version = plain>
                        <img id = user src = "${user.image}">${user.name}
                    </button>
                </a>
                        
                <a href = /project>
                    <button class = button version = plain>New<span> project</span></button>
                </a>` : `<a href = /sign>
                    <button class = button version = plain>Sign in</button>
                </a>

                <a href = /create>
                    <button class = button version = green>Create<span> account</span></button>
                </a>`}
            </div>
        </section>

        <section class = main page = narrow>
            <input type = text placeholder = Title id = title>

            <div class = respond id = respond>
                <iframe id = frame sandbox = "allow-scripts allow-same-origin" srcdoc = "<!DOCTYPE html><body style='margin:0;overflow:hidden'><script>${code}</script></body></html>"></iframe>

                <div onclick = screenshot()>
                    <canvas id = canvas width = 400 height = 240></canvas>

                    <div>
                        Take snapshot

                        <label>
                            <input type = file id = input accept = "image/*">
                            or upload 400 &#215; 240 image
                        </label>
                    </div>
                </div>
            </div>

            <p>
                We only recommend uploading your own image when the snapshot feature doesn't work.
                This can happen when your project contains WebGL or fancy CSS.
            </p>

            <textarea placeholder = Description id = description></textarea>

            <div class = tags id = tags>
                <input placeholder = "Tag 1">
                <input placeholder = "Tag 2">
                <input placeholder = "Tag 3">
                <input placeholder = "Tag 4">
                <input placeholder = "Tag 5">
            </div>

            <a href = /project>
                <button class = button version = blue><i class = "fas fa-arrow-left"></i>Back</button>
            </a>

            <form action = /submit method = post class = submit onsubmit = "return enter(this)" id = form>
                <input type = hidden name = title>
                <input type = hidden name = description>
                <input type = hidden name = image>
                <input type = hidden name = tags>

                <button id = button type = submit class = button version = blank>
                    <i class = "fas fa-upload"></i>Submit
                </button>
            </form>

            <footer>
                <span>&copy; Copyright ${new Date().getFullYear()} JS ByteBase ·
                <a href = mailto:hello@js-bytebase.com>hello@js-bytebase.com</a></span>
            </footer>
        </section>

        <script>
            const context = canvas.getContext("2d")
            let shot = false

            function enter(form) {
                form[0].value = title.value
                form[1].value = description.value

                for (let child of tags.children)
                    form[3].value += child.value + " "

                return button.getAttribute("version") == "blue"
            }

            function check() {
                let submit = false

                for (let child of tags.children)
                    if (child.value.trim()) {
                        submit = true
                        break
                    }

                button.setAttribute("version", (submit && shot ? "blue" : "blank"))
            }

            function capture() {
                form[2].value = canvas.toDataURL("image/jpeg", 0.8)
                shot = true
                check()
            }

            function screenshot() {
                const screen = frame.contentWindow ? frame.contentWindow.document.body : frame.contentDocument.body

                html2canvas(screen, {scale: 1}).then(image => {
                    context.drawImage(
                        image, 0, 0,
                        frame.clientWidth, frame.clientHeight,
                        0, 0, canvas.width, canvas.height)

                    capture()
                })
            }

            respond.onmouseenter = () => document.body.style.overflow = "hidden"
            respond.onmouseleave = () => document.body.style.overflow = "auto"

            tags.addEventListener("input", event => {
                if (event.data == " ") {
                    if (event.target.nextElementSibling) {
                        const caret = event.target.selectionStart
                        const string = event.target.value

                        event.target.value = string.substring(0, caret)
                        event.target.nextElementSibling.value = string.substring(caret).replace(/\\s/g, "")
                        event.target.nextElementSibling.focus()
                    }

                    event.target.value = event.target.value.replace(/\\s/g, "")
                }

                event.target.value = event.target.value.toLowerCase()
                check()
            })

            tags.addEventListener("keydown", event => {
                if (event.key == "Backspace" && !event.target.selectionStart && event.target.previousElementSibling) {
                    const caret = event.target.previousElementSibling.value.length
                    event.target.previousElementSibling.setSelectionRange(caret, caret)
                    event.target.previousElementSibling.focus()
                }
            })

            input.addEventListener("change", event => {
                if (!input.files.length) return

                const reader = new FileReader()

                reader.onload = event => {
                    const image = new Image()

                    image.onload = () => {
                        if (image.width / 5 * 3 > image.height) {
                            const width = image.width * canvas.height / image.height
                            context.drawImage(image, (canvas.width - width) / 2, 0, width, canvas.height)
                        }

                        else {
                            const height = image.height * canvas.width / image.width
                            context.drawImage(image, 0, (canvas.height - height) / 2, canvas.width, height)
                        }

                        capture()
                    }
                    
                    image.src = event.target.result
                }

                reader.readAsDataURL(input.files[0])
            })
        </script>
    </body>
</html>`
    },

    demo(user, creator, host, project, users, markdown) {
        let comments = ""
        let tags = "<form action = /gallery method = post>"

        project.tags.forEach(item => tags += "<input type = submit name = search value = " + item + ">")
        tags += "</form>"

        project.comments.forEach(item => {
            comments += `<div class = comment>
                <a href = /profile/${item.name}>
                    <img src = "${users[item.name]}">${item.name}
                </a>${user ? `
                    
                <i class = "far fa-${item.name == user.name ? "trash-alt" :
                    "flag"}" type = ${item.name == user.name ? "delete" :
                    item.flags.includes(user.name) ? "unflag" : "flag"}
                    onclick = ${item.name == user.name ? "splice" :
                    item.flags.includes(user.name) ? "unflag" : "flag"}(this)>
                </i>` : ""}

                <div class = markdown>${markdown.render(item.comment)}</div>
            </div>`
        })

        return `${license}
<!DOCTYPE html>
<html lang = "en-gb">
    <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src = "https://www.googletagmanager.com/gtag/js?id=G-Z48CP6DVRN"></script>
        <script src = ../main.js></script>

        <title>JS ByteBase · ${project.title}</title>
        <meta name = description content = "${project.title} by ${creator.name}">
        <meta name = viewport content = "width = device-width, initial-scale = 1.0">

        <link rel = icon href = ../favicon.ico sizes = "16x16 24x24 32x32 48x48 64x64 110x110 114x114" type = "image/vnd.microsoft.icon">
        <link rel = stylesheet href = ../main.css>

        <script src = https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js></script>
        <script src = https://kit.fontawesome.com/1dc9aa0b49.js crossorigin = anonymous></script>
        <script src = https://cdn.jsdelivr.net/remarkable/1.7.1/remarkable.min.js></script>

        <style>
            .main > div:first-child {
                margin-bottom: 1em
            }

            .main > div:first-child > div:first-child {
                display: inline-block;
                margin-right: 1em;
                position: relative
            }

            .main > div:first-child > div:first-child > a > img {
                border-radius: var(--radius);
                box-shadow: var(--shadow) var(--box);
                max-width: 100%
            }

            .main > div:first-child > div:last-child {
                display: inline-block;
                vertical-align: top;
                overflow: hidden
            }

            .main > div:first-child > div:last-child > div:first-child {
                color: var(--text);
                font-size: var(--header);
                font-weight: bold;
                margin-bottom: 0.5em;
                white-space: nowrap;
                overflow: auto
            }

            .main .profile {
                margin-bottom: 0.6em
            }

            .tab {
                color: var(--text);
                background-color: var(--background);
                border-radius: var(--radius);
                border: var(--border) var(--plain);
                font-size: var(--small);
                display: inline-block;
                font-family: monospace;
                padding: 0.2em;
                margin-bottom: 0.3em
            }

            .smiles, .main > div:first-child > div:first-child > span {
                position: absolute;
                left: 0.5em;
                bottom: 0.9em;
                color: var(--text);
                background-color: var(--off);
                border-radius: var(--radius);
                border: var(--border) var(--text);
                font-size: 15px;
                padding: 0.2em 0.4em;
            }

            .tab i, .smiles i {
                padding-right: var(--padding)
            }

            form {
                display: inline-block
            }

            button[class = "tab"]:hover, button[type = "like"]:hover, button[type = "report"]:hover {
                background-color: var(--button);
            }

            button[type = "unlike"] {
                background-color: var(--green);
                color: var(--text-contrast)
            }

            button[type = "unlike"]:hover {
                background-color: var(--green-hover);
            }

            button[type = "unreport"] {
                background-color: var(--error);
                color: var(--text-contrast)
            }

            button[type = "unreport"]:hover {
                background-color: var(--error-hover)
            }

            #code {
                box-shadow: var(--shadow) var(--box);
                border-radius: var(--radius);
                font-size: var(--font);
                height: 10em;
                margin-bottom: 1em
            }

            .tags input {
                padding: var(--padding);
                border-radius: var(--radius);
                box-shadow: var(--shadow) var(--box);
                font-size: var(--font);
                background-color: var(--off);
                color: var(--text);
                font-family: nunito;
                display: inline-block;
                margin-right: 0.5em;
                border: none
            }

            .tags {
                margin-bottom: 2em
            }

            .tags input:hover {
                background-color: var(--box)
            }

            .main > div:nth-child(2) {
                border-radius: var(--radius);
                padding: var(--padding) var(--padding) 0 var(--padding);
                border: var(--border) var(--plain);
                margin-bottom: 1em
            }

            i[type = "delete"], i[type = "flag"], i[type = "unflag"] {
                font-size: var(--font);
                transition: var(--transition);
                padding-top: 0.1em;
                cursor: pointer
            }

            i[type = "delete"], i[type = "flag"] {
                color: var(--blank)
            }

            i[type = "unflag"], i[type = "delete"]:hover, i[type = "flag"]:hover {
                color: var(--error)
            }

            i[type = "unflag"]:hover {
                color: var(--error-hover)
            }
        </style>
    </head>

    <body>        
        <section class = top>
            <div>
                <a class = logo href = />
                    <svg xmlns = http://www.w3.org/2000/svg viewBox = "0 0 630 630">
                        <path d = "M 0 0 V 630 H 630 V 183 Q 446 183 446 0" fill = "#f7df1e"/>
                        <path d = "m 423 492 c 13 21 29 36 58 36 c 25 0 40 -12 40 -29 c 0 -20 -16 -28 -43 -39 l -15 -6 c -43 -18 -71 -41 -71 -89 c 0 -44 34 -78 87 -78 c 38 0 65 13 84 47 l -46 30 c -10 -18 -21 -25 -38 -25 c -17 0 -28 11 -28 25 c 0 18 11 25 36 36 l 15 6 c 50 22 79 44 79 93 c 0 53 -42 83 -98 83 c -55 0 -91 -26 -108 -61 z m -209 5 c 9 17 18 30 38 30 c 19 0 32 -8 32 -37 v -201 h 59 v 202 c 0 61 -36 89 -88 89 c -47 0 -75 -25 -89 -54 z" fill = "#000"/>
                    </svg>
                    
                    <span>ByteBase</span>
                </a>
                
                <form action = /gallery method = post>
                    <input type = text name = search placeholder = Search>
                </form>

                <a href = /gallery>
                    <button class = button version = plain>Gallery</button>
                </a>

                ${user ? `<a href = /profile/${user.name}>
                    <button class = "profile button" version = plain>
                        <img id = user src = "${user.image}">${user.name}
                    </button>
                </a>
                        
                <a href = /project>
                    <button class = button version = plain>New<span> project</span></button>
                </a>` : `<a href = /sign>
                    <button class = button version = plain>Sign in</button>
                </a>

                <a href = /create>
                    <button class = button version = green>Create<span> account</span></button>
                </a>`}
            </div>
        </section>

        <section class = main page = narrow>
            <div>
                <div>
                    <${user ? `button class = smiles onclick = ${project.smiles.includes(user.name) ?
                        "unlike(this) type = unlike" : "like(this) type = like"}` : "span"}>
                        <i class = "far fa-smile"></i><span id = smiles>${project.smiles.length}</span>
                    </${user ? "button" : "span"}>

                    <a href = /project/${project.id} target = _blank>
                        <img src = "${project.image}"></a>
                </div>

                <div>
                    <div>${project.title}</div>

                    <a href = /profile/${creator.name}>
                        <button class = "profile button" version = plain>
                            <img src = "${creator.image}">${creator.name}
                        </button>
                    </a><br>

                    <span class = tab><i class = "fas fa-link"></i>${host}/project/${project.id}</span><br>
                    <span class = tab>${project.views + (project.views == 1 ? " view" : " views")}</span>
                    <span class = tab>${Buffer.from(project.code).length} bytes</span><br>

                    <a href = /project/${project.id} target = _blank>
                        <button class = tab>
                            <i class = "far fa-play-circle"></i>Play
                        </button></a>${user ? `
                        
                    ${creator.name == user.name ? `<form action = /delete method = post onsubmit = "return remove()">
                        <input type = hidden name = project value = ${project.id}>

                        <button type = submit class = tab>
                            <i class = "far fa-trash-alt"></i>Delete
                        </button>
                    </form>` : `
                    <button class = tab onclick = ${project.flags.includes(user.name) ? "unreport(this) type = unreport" : "report(this) type = report"}>
                        <i class = "far fa-flag"></i>Report
                    </button>`}` : ""}
                </div>
            </div>

            <div><div class = markdown>${markdown.render(project.description)}</div></div>
            <div id = code></div>

            <div class = tags>${tags}</div>
            <div id = comments>${comments}</div>${user ? `
            
            <div class = message>
                <textarea placeholder = "Add comment" oninput = module.input(this)></textarea>
                <i onclick = post(this) class = "fas fa-paper-plane" version = blank></i>
            </div>` : ""}

            <footer>
                <span>&copy; Copyright ${new Date().getFullYear()} JS ByteBase ·
                <a href = mailto:hello@js-bytebase.com>hello@js-bytebase.com</a></span>
            </footer>
        </section>

        <script>${user ? `
            const http = new XMLHttpRequest()
            const markdown = new Remarkable({breaks: true})

            function ajax(link) {
                http.open("POST", link)
                http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                http.send("project=${project.id}")
            }

            function like(button) {
                ajax("/like")
                button.setAttribute("onclick", "unlike(this)")
                button.setAttribute("type", "unlike")
                smiles.innerText = Number(smiles.innerText) + 1
            }

            function unlike(button) {
                ajax("/unlike")
                button.setAttribute("onclick", "like(this)")
                button.setAttribute("type", "like")
                smiles.innerText = Number(smiles.innerText) - 1
            }

            function report(button) {
                ajax("/report")
                button.setAttribute("onclick", "unreport(this)")
                button.setAttribute("type", "unreport")
            }

            function unreport(button) {
                ajax("/unreport")
                button.setAttribute("onclick", "report(this)")
                button.setAttribute("type", "report")
            }

            function remove() {
                if (Number(smiles.innerText) >= 10) {
                    alert("You cannot delete a project with 10 or more smiles")
                    return false
                }

                return confirm("Please confirm this decision")
            }

            function register(link, index) {
                http.open("POST", link)
                http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                http.send("project=${project.id}&comment=" + index)
            }

            function splice(button) {
                if (!confirm("Please confirm this decision")) return

                const index = [].indexOf.call(comments.children, button.parentElement)
                register("/splice", index)
                comments.children[index].remove()
            }

            function flag(button) {
                const index = [].indexOf.call(comments.children, button.parentElement)
                register("/flag", index)
                button.setAttribute("onclick", "unflag(this)")
                button.setAttribute("type", "unflag")
            }

            function unflag(button) {
                const index = [].indexOf.call(comments.children, button.parentElement)
                register("/unflag", index)
                button.setAttribute("onclick", "flag(this)")
                button.setAttribute("type", "flag")
            }

            function post(button) {
                const element = button.previousElementSibling
                if (!element.value.trim()) return

                register("/comment", encodeURIComponent(element.value))

                comments.appendChild(module.comment(
                    markdown.render(element.value.trim()),
                    "${user.name}", "${user.image.replace(/"/g, "\\\"").replace(/\n/g, "\\n")}"))

                element.value = ""
            }` : ""}
            const editor = ace.edit(code)

            module.theme(editor)
            editor.setOption("wrap", true)
            editor.session.setMode("ace/mode/javascript")
            editor.setValue("${project.code.replace(/"/g, "\\\"").replace(/\n/g, "\\n")}")
            editor.setReadOnly(true)
            editor.gotoLine(0, 1, true)
        </script>
    </body>
</html>`
    },

    profile(user, profile, host, protocol, projects) {
        const settings = user && profile.name == user.name
        const date = new Date(profile.date)
        const link = `${protocol}://${host}/profile/${profile.name}`

        let smiles = 0
        let gallery = ""

        projects.forEach(project => {
            smiles += project.smiles.length
            gallery += `<a href = /demo/${project.id}><img src = "${project.image}"></a>`
        })

        return `${license}
<!DOCTYPE html>
<html lang = "en-gb">
    <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src = "https://www.googletagmanager.com/gtag/js?id=G-Z48CP6DVRN"></script>
        <script src = ../main.js></script>

        <title>JS ByteBase · ${profile.name}</title>
        <meta name = description content = "Profile of ${profile.name}">
        <meta name = viewport content = "width = device-width, initial-scale = 1.0">
        
        <link rel = icon href = ../favicon.ico sizes = "16x16 24x24 32x32 48x48 64x64 110x110 114x114" type = "image/vnd.microsoft.icon">
        <link rel = stylesheet href = ../main.css>

        <script src = https://kit.fontawesome.com/1dc9aa0b49.js crossorigin = anonymous></script>
        <script src = https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js></script>

        <style>
            .main {
                display: flex;
                flex-flow: row
            }

            .main > div {
                flex: 1 1 0
            }

            .main > div:first-child > div:first-child {
                border-radius: var(--radius);
                border: var(--border) var(--plain);
                margin-bottom: 1em;
                padding: 1em
            }

            #box {
                display: inline-block;
                font-family: nunito;
                vertical-align: top;
                overflow: hidden;
                margin-left: 1em
            }

            .main > div:first-child > div:first-child img {
                box-shadow: var(--shadow) var(--box);
                border-radius: 50%
            }

            .main > div:first-child > div:first-child > label > img:hover {
                opacity: 0.5
            }

            #box div:first-child {
                color: var(--text);
                font-size: var(--header);
                font-weight: bold
            }

            .tab {
                color: var(--text);
                background-color: var(--background);
                border-radius: var(--radius);
                border: var(--border) var(--plain);
                font-size: var(--small);
                display: inline-block;
                font-family: monospace;
                padding: 0.2em;
                margin-bottom: 0.3em
            }

            button[class = tab]:hover {
                background-color: var(--button)
            }

            i {
                padding-right: var(--padding)
            }

            .fa-cog {
                color: var(--fade);
                transition: var(--transition);
                float: right;
                cursor: pointer
            }

            .fa-cog:hover {
                color: var(--text);
            }

            #settings {
                transition: var(--reveal);
                overflow: hidden
            }

            #settings > div {
                padding: 1em;
                transition: var(--reveal);
                border-radius: var(--radius);
                border: var(--border);
                color: var(--text)
            }

            #settings[type = "hidden"] {
                flex: 0 0 0;
                max-height: 0;
                margin: 0
            }

            #settings[type = "hidden"] > div {
                border-color: var(--background)
            }

            #settings[type = "active"] {
                flex: 0 0 40%;
                max-height: 50em;
                margin-left: 1em
            }

            #settings[type = "active"] > div {
                border-color: var(--plain)
            }

            #code {
                box-shadow: var(--shadow) var(--box);
                font-size: var(--font);
                border-radius: var(--radius);
                margin: var(--padding) 0 1em 0
            }

            form[method = post], form[method = post] > button {
                color: var(--text);
                font-size: var(--small);
                float: right;
                border: none;
                background: none;
                margin-bottom: var(--padding)
            }

            form[method = post] > button:hover {
                color: var(--fade)
            }

            svg {
                margin-right: var(--padding)
            }

            input[type = "file"] {
                display: none
            }

            #settings > div > label {
                color: var(--text);
                border: var(--border) var(--plain);
                border-radius: var(--radius);
                padding: var(--padding);
                display: inline-block;
                margin-bottom: 1em
            }

            #settings > div > label > select, #settings > div > input {
                border-radius: var(--radius);
                border: var(--border) var(--plain);
                background-color: var(--off);
                color: var(--text)
            }

            #settings > div > input {
                padding: var(--padding);
                display: block;
                max-width: 100%;
                margin-bottom: 1em
            }
        </style>
    </head>
    
    <body>        
        <section class = top>
            <div>
                <a class = logo href = />
                    <svg xmlns = http://www.w3.org/2000/svg viewBox = "0 0 630 630">
                        <path d = "M 0 0 V 630 H 630 V 183 Q 446 183 446 0" fill = "#f7df1e"/>
                        <path d = "m 423 492 c 13 21 29 36 58 36 c 25 0 40 -12 40 -29 c 0 -20 -16 -28 -43 -39 l -15 -6 c -43 -18 -71 -41 -71 -89 c 0 -44 34 -78 87 -78 c 38 0 65 13 84 47 l -46 30 c -10 -18 -21 -25 -38 -25 c -17 0 -28 11 -28 25 c 0 18 11 25 36 36 l 15 6 c 50 22 79 44 79 93 c 0 53 -42 83 -98 83 c -55 0 -91 -26 -108 -61 z m -209 5 c 9 17 18 30 38 30 c 19 0 32 -8 32 -37 v -201 h 59 v 202 c 0 61 -36 89 -88 89 c -47 0 -75 -25 -89 -54 z" fill = "#000"/>
                    </svg>
                    
                    <span>ByteBase</span>
                </a>
                
                <form action = /gallery method = post>
                    <input type = text name = search placeholder = Search>
                </form>

                <a href = /gallery>
                    <button class = button version = plain>Gallery</button>
                </a>

                ${user ? `<a href = /profile/${user.name}>
                    <button class = "profile button" version = plain>
                        <img id = user src = "${user.image}">${user.name}
                    </button>
                </a>
                        
                <a href = /project>
                    <button class = button version = plain>New<span> project</span></button>
                </a>` : `<a href = /sign>
                    <button class = button version = plain>Sign in</button>
                </a>

                <a href = /create>
                    <button class = button version = green>Create<span> account</span></button>
                </a>`}
            </div>
        </section>

        <section class = main page = narrow>
            <div>
                <div>${settings ? `
                    <label>
                        <input type = file id = input accept = "image/*">
                        <img src = "${profile.image}">
                    </label>

                    <i class = "fas fa-cog" onclick = display()></i>` : `
                    <img src = "${profile.image}">`}

                    <div id = box>
                        <div>${profile.name}</div>
                        <span class = tab><i class = "far fa-smile"></i>${smiles}</span>

                        <span class = tab>
                            <i class = "far fa-calendar-alt"></i>${date.getDate()}.${date.getMonth()}.${date.getFullYear()}
                        </span><br>${profile.website ? `
                        
                        <a id = link target = _blank href = "${(profile.website.startsWith("http://") ||
                            profile.website.startsWith("https://") ? "" : "http://") + profile.website}"><button class = tab>
                            <i class = "fas fa-link"></i><span id = span>${profile.website.replace(/(http|https):\/\//, "")}</span>
                        </button></a>` : ""}
                    </div>
                </div>

                <div class = gallery>${gallery}</div>
            </div>${settings ? `
            
            <div id = settings type = active>
                <div>
                    <form action = /log method = post>
                        <button type = submit>Log out</button>
                    </form>

                    <input value = "${profile.website}" type = text oninput = website(this) placeholder = "Enter your website here">

                    <label>
                        Select theme:
                        <select id = select onchange = change()>
                            <option>Light</option>
                            <option>Dark</option>
                            <option>Gob</option>
                            <option>Vibrant</option>
                            <option>Navy</option>
                        </select>
                    </label><br>

                    Generate a link to your profile by pasting the following code into your website.

                    <div id = code></div>${smiles < 5 ? "" : `
                    
                    <form action = /chat method = get>
                        <button type = submit class = button version = green>Join chat room</button>
                    </form>`}
                </div>
            </div>` : ""}

            <footer>
                <span>&copy; Copyright ${new Date().getFullYear()} JS ByteBase ·
                <a href = mailto:hello@js-bytebase.com>hello@js-bytebase.com</a></span>
            </footer>
        </section>${settings ? `

        <script>
            const editor = ace.edit(code)
            const http = new XMLHttpRequest()
            let defined = ${profile.website ? "true" : "false"}

            function website(input) {
                if (!defined) {
                    const link = document.createElement("a")
                    const button = document.createElement("button")
                    const icon = document.createElement("i")
                    const span = document.createElement("span")
    
                    link.id = "link"
                    link.target = "_blank"
                    button.className = "tab"
                    icon.className = "fas fa-link"
                    span.id = "span"

                    button.appendChild(icon)
                    button.appendChild(span)
                    link.appendChild(button)
                    box.appendChild(link)
                    defined = true
                }

                link.href = (input.value.startsWith("http://") || input.value.startsWith("https://") ? "" : "http://") + input.value
                span.innerText = input.value.replace(/(http|https):\\/\\//, "")

                http.open("POST", "/website")
                http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                http.send("website=" + encodeURIComponent(input.value))

                if (defined && !input.value) {
                    defined = false
                    link.remove()
                }
            }

            function change() {
                document.body.setAttribute("theme", select.value)
                localStorage.setItem("theme", select.value)
                module.theme(editor)
            }

            function display() {
                if (settings.getAttribute("type") == "hidden")
                    settings.setAttribute("type", "active")

                else settings.setAttribute("type", "hidden")
            }

            select.value = localStorage.getItem("theme")

            input.addEventListener("change", event => {
                if (!input.files.length) return

                const reader = new FileReader()

                reader.onload = event => {
                    const image = new Image()

                    image.onload = () => {
                        const canvas = document.createElement("canvas")
                        const context = canvas.getContext("2d")

                        canvas.width = 100
                        canvas.height = 100

                        context.drawImage(image, 0, 0, 100, 100)
                        input.nextElementSibling.src = canvas.toDataURL("image/jpeg", 0.8)
                        user.src = input.nextElementSibling.src

                        http.open("POST", "/profile")
                        http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                        http.send("image=" + encodeURIComponent(input.nextElementSibling.src))
                    }
                    
                    image.src = event.target.result
                }

                reader.readAsDataURL(input.files[0])
            })

            module.theme(editor)

            editor.setValue(
                "<a href = \\"${link}\\"><svg xmlns = http://www.w3.org/2000/svg viewBox = \\"0 0 630 630\\" width = 4" +
                "0 height = 40>\\n\\t<path d = \\"M 0 0 V 630 H 630 V 183 Q 446 183 446 0\\" fill = \\"#f7df1e\\"/>\\n" +
                "\\t<path d = \\"m 423 492 c 13 21 29 36 58 36 c 25 0 40 -12 40 -29 c 0 -20 -16 -28 -43 -39 l -15 -6 c" +
                " -43 -18 -71 -41 -71 -89 c 0 -44 34 -78 87 -78 c 38 0 65 13 84 47 l -46 30 c -10 -18 -21 -25 -38 -25 " +
                "c -17 0 -28 11 -28 25 c 0 18 11 25 36 36 l 15 6 c 50 22 79 44 79 93 c 0 53 -42 83 -98 83 c -55 0 -91 " +
                "-26 -108 -61 z m -209 5 c 9 17 18 30 38 30 c 19 0 32 -8 32 -37 v -201 h 59 v 202 c 0 61 -36 89 -88 89" +
                " c -47 0 -75 -25 -89 -54 z\\" fill = \\"#000\\"/>\\n</svg></a>")

            editor.session.setMode("ace/mode/html")
            editor.setOptions({maxLines: 4})
            editor.gotoLine(1)
        </script>` : ""}
    </body>
</html>`
    },

    chat(user) {
        return `${license}
<!DOCTYPE html>
<html lang = "en-gb">
    <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src = "https://www.googletagmanager.com/gtag/js?id=G-Z48CP6DVRN"></script>
        <script src = main.js></script>

        <title>JS ByteBase · Chat</title>
        <meta name = viewport content = "width = device-width, initial-scale = 1.0">
        
        <link rel = icon href = favicon.ico sizes = "16x16 24x24 32x32 48x48 64x64 110x110 114x114" type = "image/vnd.microsoft.icon">
        <link rel = stylesheet href = main.css>

        <script src = https://kit.fontawesome.com/1dc9aa0b49.js crossorigin = anonymous></script>
        <script src = https://cdn.jsdelivr.net/remarkable/1.7.1/remarkable.min.js></script>
        <script src = socket.io/socket.io.js></script>

        <style>
        </style>
    </head>
    
    <body>        
        <section class = top>
            <div>
                <a class = logo href = />
                    <svg xmlns = http://www.w3.org/2000/svg viewBox = "0 0 630 630">
                        <path d = "M 0 0 V 630 H 630 V 183 Q 446 183 446 0" fill = "#f7df1e"/>
                        <path d = "m 423 492 c 13 21 29 36 58 36 c 25 0 40 -12 40 -29 c 0 -20 -16 -28 -43 -39 l -15 -6 c -43 -18 -71 -41 -71 -89 c 0 -44 34 -78 87 -78 c 38 0 65 13 84 47 l -46 30 c -10 -18 -21 -25 -38 -25 c -17 0 -28 11 -28 25 c 0 18 11 25 36 36 l 15 6 c 50 22 79 44 79 93 c 0 53 -42 83 -98 83 c -55 0 -91 -26 -108 -61 z m -209 5 c 9 17 18 30 38 30 c 19 0 32 -8 32 -37 v -201 h 59 v 202 c 0 61 -36 89 -88 89 c -47 0 -75 -25 -89 -54 z" fill = "#000"/>
                    </svg>
                    
                    <span>ByteBase</span>
                </a>
                
                <form action = /gallery method = post>
                    <input type = text name = search placeholder = Search>
                </form>

                <a href = /gallery>
                    <button class = button version = plain>Gallery</button>
                </a>

                ${user ? `<a href = /profile/${user.name}>
                    <button class = "profile button" version = plain>
                        <img id = user src = "${user.image}">${user.name}
                    </button>
                </a>
                        
                <a href = /project>
                    <button class = button version = plain>New<span> project</span></button>
                </a>` : `<a href = /sign>
                    <button class = button version = plain>Sign in</button>
                </a>

                <a href = /create>
                    <button class = button version = green>Create<span> account</span></button>
                </a>`}
            </div>
        </section>

        <section class = main page = narrow>
            <div id = comments></div>

            <div class = message>
                <textarea placeholder = "Add message" oninput = module.input(this)></textarea>
                <i onclick = post(this) class = "fas fa-paper-plane" version = blank></i>
            </div>

            <footer>
                <span>&copy; Copyright ${new Date().getFullYear()} JS ByteBase ·
                <a href = mailto:hello@js-bytebase.com>hello@js-bytebase.com</a></span>
            </footer>
        </section>

        <script>
            const socket = io()
            const http = new XMLHttpRequest()
            const markdown = new Remarkable({breaks: true})

            function post(button) {
                const element = button.previousElementSibling
                if (!element.value.trim()) return

                http.open("POST", "/chat")
                http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                http.send("comment=" + encodeURIComponent(element.value))

                comments.appendChild(module.comment(
                    markdown.render(element.value.trim()),
                    "${user.name}", "${user.image.replace(/"/g, "\\\"").replace(/\n/g, "\\n")}"))

                element.value = ""
            }

            socket.on("comment", (comment, user) =>
                comments.appendChild(module.comment(
                    markdown.render(comment), user.name, user.image, 1)))
        </script>
    </body>
</html>`
    },

    template(project, code) {
        return `${license}
<!DOCTYPE html>
<html lang = "en-gb">
    <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src = "https://www.googletagmanager.com/gtag/js?id=G-Z48CP6DVRN"></script>
        <script src = ../main.js></script>

        <title>${project.title} by ${project.name}</title>
        <meta name = description content = "${project.description}">
        <meta name = viewport content = "width = device-width, initial-scale = 1.0">

        <style>
            iframe {
                position: fixed;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                border: none
            }
        </style>
    </head>

    <body>
        <iframe
            id = frame
            srcdoc = "<!DOCTYPE html><body style='margin:0;overflow:hidden'><script>${code}</script></body></html>"
            sandbox = "allow-scripts allow-same-origin">
        </iframe>

        <script>
            frame.onload = () => {
                const content = frame.contentWindow || frame.contentDocument
                content.focus()
            }
        </script>
    </body>
</html>`
    },

    reported(user, projects, markdown) {
        let reported = ""

        projects.forEach(project => {
            const link = "/demo/" + project.id

            if (project.flags.length)
                reported += `<div class = project>
                        <span>
                            ${project.flags.length}
                            <i class = "far fa-trash-alt" onclick = "project(this, '${project.id}')"></i>
                        </span>

                        <a href = ${link}>${project.title}</a>
                    </div>`

            project.comments.forEach((comment, index) => {
                if (comment.flags.length)
                    reported += `<div class = "note ${project.id}">
                            <span>
                                ${comment.flags.length}
                                <i class = "far fa-trash-alt" onclick = "comment(this, '${project.id}', ${index})"></i>
                            </span>

                            <a href = ${link} class = markdown>${markdown.render(comment.comment)}</a>                             
                        </div>`
            })
        })

        return `${license}
<!DOCTYPE html>
<html lang = "en-gb">
    <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src = "https://www.googletagmanager.com/gtag/js?id=G-Z48CP6DVRN"></script>
        <script src = main.js></script>

        <title>JS ByteBase · Reported</title>
        <meta name = viewport content = "width = device-width, initial-scale = 1.0">
        
        <link rel = icon href = favicon.ico sizes = "16x16 24x24 32x32 48x48 64x64 110x110 114x114" type = "image/vnd.microsoft.icon">
        <link rel = stylesheet href = main.css>

        <script src = https://kit.fontawesome.com/1dc9aa0b49.js crossorigin = anonymous></script>

        <style>
            .main > div:nth-child(2) > div {
                border-radius: var(--radius);
                border: var(--border);
                margin: 0.5em 0
            }

            .main > div:nth-child(2) > div > a {
                text-decoration: none;
                display: block;
                transition: var(--transition);
                color: var(--text-title)
            }

            .main > div:nth-child(2) > div > a:hover {
                color: var(--blank)
            }

            .main > div:nth-child(2) > div > span > i {
                margin-right: 0.2em;
                cursor: pointer;
                color: var(--blank);
                transition: var(--transition)
            }

            .main > div:nth-child(2) > div > span {
                float: right;
                color: var(--deep)
            }

            .main > div:nth-child(2) > div > span > i:hover {
                color: var(--error)
            }

            .main > div:nth-child(2) > .note > div:nth-child(2) {
                margin-top: var(--padding)
            }

            .main > div:nth-child(2) > .note {
                border-color: var(--deep);
                padding: var(--padding) var(--padding) 0 var(--padding)
            }

            .main > div:nth-child(2) > .project {
                border-color: var(--error);
                padding: var(--padding)
            }

            #buttons {
                margin-bottom: 1em
            }

            #buttons button {
                margin-right: 1em
            }
        </style>
    </head>
    
    <body>        
        <section class = top>
            <div>
                <a class = logo href = />
                    <svg xmlns = http://www.w3.org/2000/svg viewBox = "0 0 630 630">
                        <path d = "M 0 0 V 630 H 630 V 183 Q 446 183 446 0" fill = "#f7df1e"/>
                        <path d = "m 423 492 c 13 21 29 36 58 36 c 25 0 40 -12 40 -29 c 0 -20 -16 -28 -43 -39 l -15 -6 c -43 -18 -71 -41 -71 -89 c 0 -44 34 -78 87 -78 c 38 0 65 13 84 47 l -46 30 c -10 -18 -21 -25 -38 -25 c -17 0 -28 11 -28 25 c 0 18 11 25 36 36 l 15 6 c 50 22 79 44 79 93 c 0 53 -42 83 -98 83 c -55 0 -91 -26 -108 -61 z m -209 5 c 9 17 18 30 38 30 c 19 0 32 -8 32 -37 v -201 h 59 v 202 c 0 61 -36 89 -88 89 c -47 0 -75 -25 -89 -54 z" fill = "#000"/>
                    </svg>
                    
                    <span>ByteBase</span>
                </a>
                
                <form action = /gallery method = post>
                    <input type = text name = search placeholder = Search>
                </form>

                <a href = /gallery>
                    <button class = button version = plain>Gallery</button>
                </a>

                ${user ? `<a href = /profile/${user.name}>
                    <button class = "profile button" version = plain>
                        <img id = user src = "${user.image}">${user.name}
                    </button>
                </a>
                        
                <a href = /project>
                    <button class = button version = plain>New<span> project</span></button>
                </a>` : `<a href = /sign>
                    <button class = button version = plain>Sign in</button>
                </a>

                <a href = /create>
                    <button class = button version = green>Create<span> account</span></button>
                </a>`}
            </div>
        </section>

        <section class = main page = narrow>
            <div id = buttons>
                <a href = /reported><button class = button version = blue>
                    <i class = "far fa-flag"></i>Reported
                </button></a>

                <a href = /errors><button class = button version = plain>
                    <i class = "fas fa-bug"></i>Errors
                </button></a>

                <a href = /users><button class = button version = plain>
                    <i class = "fas fa-users"></i>Users
                </button></a>
            </div>

            <div>${reported}</div>

            <footer>
                <span>&copy; Copyright ${new Date().getFullYear()} JS ByteBase ·
                <a href = mailto:hello@js-bytebase.com>hello@js-bytebase.com</a></span>
            </footer>
        </section>

        <script>
            const http = new XMLHttpRequest()
            const move = place => window.location.href = place

            function project (button, project) {
                if (!confirm("Please confirm this decision")) return

                http.open("POST", "/delete")
                http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                http.send("project=" + project)
                button.parentElement.parentElement.remove()
                const elements = document.getElementsByClassName("comment " + project)

                while (elements.length > 0)
                    elements[0].remove()
            }

            function comment(button, project, index) {
                if (!confirm("Please confirm this decision")) return

                http.open("POST", "/splice")
                http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                http.send("project=" + project + "&comment=" + index)
                button.parentElement.parentElement.remove()
            }
        </script>
    </body>
</html>`
    },

    errors(user, bugs) {
        let errors = ""

        bugs.forEach(bug => {
            errors += `<div type = closed>
                    <div>
                        <div>
                            <i class = "fas fa-chevron-down" type = "down" onclick = change(this)></i>
                            ${bug.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                        </div>
                        <span>${bug.index}</span>
                    </div>
                    
                    <div>${bug.stack.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
                </div>`
        })

        return `${license}
<!DOCTYPE html>
<html lang = "en-gb">
    <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src = "https://www.googletagmanager.com/gtag/js?id=G-Z48CP6DVRN"></script>
        <script src = main.js></script>

        <title>JS ByteBase · Errors</title>
        <meta name = viewport content = "width = device-width, initial-scale = 1.0">
        
        <link rel = icon href = favicon.ico sizes = "16x16 24x24 32x32 48x48 64x64 110x110 114x114" type = "image/vnd.microsoft.icon">
        <link rel = stylesheet href = main.css>

        <script src = https://kit.fontawesome.com/1dc9aa0b49.js crossorigin = anonymous></script>

        <style>
            .main > div:nth-child(2) > div {
                border-radius: var(--radius);
                border: var(--border) var(--plain);
                padding: var(--padding);
                font-family: nunito;
                overflow: hidden;
                margin: 0.5em 0 0.5em 0;
                color: var(--error);
                transition: var(--reveal)
            }

            .main > div:nth-child(2) > div[type = "closed"] {
                max-height: 2.1em
            }

            .main > div:nth-child(2) > div[type = "open"] {
                max-height: 20em
            }

            .main > div:nth-child(2) > div > div:first-child {
                display: flex
            }

            .main > div:nth-child(2) > div > div:first-child > div {
                flex: 1 1 0
            }

            .main > div:nth-child(2) span {
                color: var(--deep);
                float: right;
                padding-right: var(--padding)
            }

            .main > div:nth-child(2) > div > div:nth-child(2) {
                margin: 0.5em
            }

            .main > div:nth-child(2) i {
                color: var(--fade);
                transition: var(--transition);
                cursor: pointer;
                display: inline-block;
                padding: 0 var(--padding)
            }

            .main > div:nth-child(2) i[type = "down"] {
                transform: rotate(0deg)
            }

            .main > div:nth-child(2) i[type = "up"] {
                transform: rotate(540deg)
            }

            .main > div:nth-child(2) i:hover {
                color: var(--text)
            }

            #buttons {
                margin-bottom: 1em
            }

            #buttons button {
                margin-right: 1em
            }
        </style>
    </head>
    
    <body>        
        <section class = top>
            <div>
                <a class = logo href = />
                    <svg xmlns = http://www.w3.org/2000/svg viewBox = "0 0 630 630">
                        <path d = "M 0 0 V 630 H 630 V 183 Q 446 183 446 0" fill = "#f7df1e"/>
                        <path d = "m 423 492 c 13 21 29 36 58 36 c 25 0 40 -12 40 -29 c 0 -20 -16 -28 -43 -39 l -15 -6 c -43 -18 -71 -41 -71 -89 c 0 -44 34 -78 87 -78 c 38 0 65 13 84 47 l -46 30 c -10 -18 -21 -25 -38 -25 c -17 0 -28 11 -28 25 c 0 18 11 25 36 36 l 15 6 c 50 22 79 44 79 93 c 0 53 -42 83 -98 83 c -55 0 -91 -26 -108 -61 z m -209 5 c 9 17 18 30 38 30 c 19 0 32 -8 32 -37 v -201 h 59 v 202 c 0 61 -36 89 -88 89 c -47 0 -75 -25 -89 -54 z" fill = "#000"/>
                    </svg>
                    
                    <span>ByteBase</span>
                </a>
                
                <form action = /gallery method = post>
                    <input type = text name = search placeholder = Search>
                </form>

                <a href = /gallery>
                    <button class = button version = plain>Gallery</button>
                </a>

                ${user ? `<a href = /profile/${user.name}>
                    <button class = "profile button" version = plain>
                        <img id = user src = "${user.image}">${user.name}
                    </button>
                </a>
                        
                <a href = /project>
                    <button class = button version = plain>New<span> project</span></button>
                </a>` : `<a href = /sign>
                    <button class = button version = plain>Sign in</button>
                </a>

                <a href = /create>
                    <button class = button version = green>Create<span> account</span></button>
                </a>`}
            </div>
        </section>

        <section class = main page = narrow>
            <div id = buttons>
                <a href = /reported><button class = button version = plain>
                    <i class = "far fa-flag"></i>Reported
                </button></a>

                <a href = /errors><button class = button version = blue>
                    <i class = "fas fa-bug"></i>Errors
                </button></a>

                <a href = /users><button class = button version = plain>
                    <i class = "fas fa-users"></i>Users
                </button></a>
            </div>

            <div>${errors}</div>

            <footer>
                <span>&copy; Copyright ${new Date().getFullYear()} JS ByteBase ·
                <a href = mailto:hello@js-bytebase.com>hello@js-bytebase.com</a></span>
            </footer>
        </section>

        <script>
            function change(icon) {
                if (icon.getAttribute("type") == "down") {
                    icon.parentElement.parentElement.parentElement.setAttribute("type", "open")
                    icon.setAttribute("type", "up")
                }

                else {
                    icon.parentElement.parentElement.parentElement.setAttribute("type", "closed")
                    icon.setAttribute("type", "down")
                }
            }
        </script>
    </body>
</html>`
    },

    users(user, users) {
        let clients = ""

        users.forEach(user => {
            clients += `<div>
                <div onclick = "move('profile/${user.name}')">
                    <img src = "${user.image}">
                    <div>
                        <div>${user.name}</div>
                        <div>${user.email}</div>
                    </div>
                </div>
                <div><i class = "far fa-trash-alt" onclick = "expel(this, '${user.name}')"></i></div>
            </div>`
        })

        return `${license}
<!DOCTYPE html>
<html lang = "en-gb">
    <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src = "https://www.googletagmanager.com/gtag/js?id=G-Z48CP6DVRN"></script>
        <script src = main.js></script>

        <title>JS ByteBase · Users</title>
        <meta name = viewport content = "width = device-width, initial-scale = 1.0">
        
        <link rel = icon href = favicon.ico sizes = "16x16 24x24 32x32 48x48 64x64 110x110 114x114" type = "image/vnd.microsoft.icon">
        <link rel = stylesheet href = main.css>

        <script src = https://kit.fontawesome.com/1dc9aa0b49.js crossorigin = anonymous></script>

        <style>
            .main > div:nth-child(2) > div {
                position: relative;
                border-radius: var(--radius);
                border: var(--border) var(--plain);
                margin-bottom: 0.5em;
                padding: var(--padding);
                padding-left: 3.3em;
                display: flex
            }

            .main > div:nth-child(2) > div > div:first-child > img {
                box-shadow: var(--shadow) var(--box);
                border-radius: 50%;
                position: absolute;
                transform: translateY(50%);
                left: 0.3em;
                bottom: 50%;
                width: 2.5em;
                height: 2.5em
            }

            .main > div:nth-child(2) > div > div:first-child > div > div:first-child {
                font-size: var(--font);
                font-weight: bold
            }

            .main > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) {
                font-size: var(--small)
            }

            .main > div:nth-child(2) > div > div:first-child {
                flex: 1 1 0;
                cursor: pointer
            }

            .main > div:nth-child(2) > div > div > i {
                float: right;
                margin: var(--padding) 0.2em;
                cursor: pointer;
                color: var(--blank);
                transition: var(--transition)
            }

            .main > div:nth-child(2) > div > div > i:hover {
                color: var(--error)
            }

            #buttons {
                margin-bottom: 1em
            }

            #buttons button {
                margin-right: 1em
            }
        </style>
    </head>
    
    <body>        
        <section class = top>
            <div>
                <a class = logo href = />
                    <svg xmlns = http://www.w3.org/2000/svg viewBox = "0 0 630 630">
                        <path d = "M 0 0 V 630 H 630 V 183 Q 446 183 446 0" fill = "#f7df1e"/>
                        <path d = "m 423 492 c 13 21 29 36 58 36 c 25 0 40 -12 40 -29 c 0 -20 -16 -28 -43 -39 l -15 -6 c -43 -18 -71 -41 -71 -89 c 0 -44 34 -78 87 -78 c 38 0 65 13 84 47 l -46 30 c -10 -18 -21 -25 -38 -25 c -17 0 -28 11 -28 25 c 0 18 11 25 36 36 l 15 6 c 50 22 79 44 79 93 c 0 53 -42 83 -98 83 c -55 0 -91 -26 -108 -61 z m -209 5 c 9 17 18 30 38 30 c 19 0 32 -8 32 -37 v -201 h 59 v 202 c 0 61 -36 89 -88 89 c -47 0 -75 -25 -89 -54 z" fill = "#000"/>
                    </svg>
                    
                    <span>ByteBase</span>
                </a>
                
                <form action = /gallery method = post>
                    <input type = text name = search placeholder = Search>
                </form>

                <a href = /gallery>
                    <button class = button version = plain>Gallery</button>
                </a>

                ${user ? `<a href = /profile/${user.name}>
                    <button class = "profile button" version = plain>
                        <img id = user src = "${user.image}">${user.name}
                    </button>
                </a>
                        
                <a href = /project>
                    <button class = button version = plain>New<span> project</span></button>
                </a>` : `<a href = /sign>
                    <button class = button version = plain>Sign in</button>
                </a>

                <a href = /create>
                    <button class = button version = green>Create<span> account</span></button>
                </a>`}
            </div>
        </section>

        <section class = main page = narrow>
            <div id = buttons>
                <a href = /reported><button class = button version = plain>
                    <i class = "far fa-flag"></i>Reported
                </button></a>

                <a href = /errors><button class = button version = plain>
                    <i class = "fas fa-bug"></i>Errors
                </button></a>

                <a href = /users><button class = button version = blue>
                    <i class = "fas fa-users"></i>Users
                </button></a>
            </div>

            <div>${clients}</div>

            <footer>
                <span>&copy; Copyright ${new Date().getFullYear()} JS ByteBase ·
                <a href = mailto:hello@js-bytebase.com>hello@js-bytebase.com</a></span>
            </footer>
        </section>

        <script>
            const http = new XMLHttpRequest()
            const move = place => window.location.href = place

            const expel = (button, name) => {
                if (!confirm("Only use this feature in extreme cases")) return

                http.open("POST", "/expel")
                http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                http.send("name=" + encodeURIComponent(name))

                button.parentElement.parentElement.remove()
            }
        </script>
    </body>
</html>`
    },

    email(name, link) {
        return `
<p>
    Hello ${name},
    <br>
    We are sending this email because you have tried to change your password.
    <br>
    If you have not tried to change it, do not click the verify button.
    <br>
    &nbsp
</p>

<p>
    <a href=${link} style="background-color:#4a4;padding:0.4em;font-family:sans-serif;font-size:20px;border-radius:0.3em;text-decoration:none;color:#fff">
        Verify
    </a>
</p>`
    },

    welcome(name) {
        return `
<p>
    Hello ${name},
    <br>
    We are very excited to have you as part of the JS ByteBase community.
</p>`
    }
}