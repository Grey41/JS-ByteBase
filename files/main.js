window.dataLayer = window.dataLayer || []
function gtag() {dataLayer.push(arguments)}
gtag("js", new Date())
gtag("config", "G-Z48CP6DVRN")

const mutation = new MutationObserver(_ => {
    const body = document.body

    if (body) {
        const theme = localStorage.getItem("theme")

        body.setAttribute("theme", theme ? theme : "Light")
        mutation.disconnect()
    }
})

mutation.observe(document.documentElement, {childList: true})

const input = text => text.nextElementSibling.setAttribute("version", text.value.trim() ? "active" : "blank")
const get = query => document.querySelector(query)

const render = (canvas, image, ratio) => {
    const context = canvas.getContext("2d")
    const width = image.width * canvas.height / image.height
    const height = image.height * canvas.width / image.width

    context.fillStyle = "#fff"
    context.fillRect(0, 0, canvas.width, canvas.height)

    if (image.width > image.height * ratio)
        context.drawImage(
            image, (canvas.width - width) / 2,
            0, width, canvas.height)

    else context.drawImage(
        image, 0, (canvas.height - height) / 2,
        canvas.width, height)
}

const gallery = event => {
    const gallery = get(".gallery")
    const array = JSON.parse(event.target.response)
    
    array.forEach(item => {
        const link = document.createElement("a")
        const image = document.createElement("img")
        link.href = "/demo/" + item.id
        image.src = item.image

        link.appendChild(image)
        gallery.appendChild(link)
    })
}

const construct = (content, name, source, type) => {
    const comment = document.createElement("div")
    const markdown = document.createElement("div")
    const button = document.createElement("i")
    const image = document.createElement("img")
    const link = document.createElement("a")

    markdown.innerHTML = content
    markdown.className = "markdown"
    comment.className = "comment"
    
    button.className = `far fa-${type ? "flag" : "trash-alt"}`
    button.setAttribute("onclick", `${type ? "flag" : "remove"}(this)`)

    link.href = "/profile/" + name
    link.textContent = name
    image.src = source
    
    link.appendChild(image)
    comment.appendChild(link)
    comment.appendChild(button)
    comment.appendChild(markdown)

    return comment
}

const theme = editor => {
    const theme = document.body.getAttribute("theme")

    editor.setTheme(
        theme == "Dark" ? "ace/theme/tomorrow_night_eighties" :
        theme == "Gob" ? "ace/theme/gob" :
        theme == "Vibrant" ? "ace/theme/merbivore_soft" :
        theme == "Navy" ? "ace/theme/nord_dark" : "ace/theme/dawn")
}

const shader = (webgl, vertex, fragment) => {
    const vertex_shader = webgl.createShader(webgl.VERTEX_SHADER)
    const fragment_shader = webgl.createShader(webgl.FRAGMENT_SHADER)
    const program = webgl.createProgram()

    webgl.shaderSource(vertex_shader, vertex)
    webgl.shaderSource(fragment_shader, fragment)
    
    webgl.compileShader(vertex_shader)
    webgl.compileShader(fragment_shader)
    webgl.attachShader(program, vertex_shader)
    webgl.attachShader(program, fragment_shader)
    
    webgl.linkProgram(program)
    webgl.useProgram(program)
    webgl.deleteShader(vertex_shader)
    webgl.deleteShader(fragment_shader)

    return program
}

const error = (canvas, status, red, green, blue) => {
    const webgl = canvas.getContext("webgl")
    const buffer = webgl.createBuffer()
    const texture = webgl.createTexture()
    const array = new Float32Array([-1, 1, 0, 0, 1, 1, 1, 0, -1, -1, 0, 1, 1, -1, 1, 1])
    const size = array.BYTES_PER_ELEMENT
    const image = document.createElement("canvas")
    const context = image.getContext("2d")
    const font = new FontFace("bold", "url(/sans.ttf)")

    const program = shader(webgl, /*glsl*/ `
        attribute vec2 vertex;
        attribute vec2 texture;

        varying vec2 coordinate;

        void main(void) {
            gl_Position = vec4(vertex, 0, 1);
            coordinate = texture;
        }`, /*glsl*/ `
        precision highp float;
        varying vec2 coordinate;

        uniform vec2 size;
        uniform vec2 phase;
        uniform vec3 shade;
        uniform sampler2D sampler;
        uniform float flash;

        void main(void) {
            float texture = texture2D(sampler, coordinate).x;
            float zoom = 500.0;
            float value;

            vec2 pos = vec2(
                (gl_FragCoord.x - size.x / 2.0 + texture * 100.0) / zoom,
                (gl_FragCoord.y - size.y / 2.0 + texture * 100.0) / zoom);

            for (float index = 0.0; index < 40.0; index ++) {
                float next = pos.x * pos.x - pos.y * pos.y + phase.x;
                pos.y = 2.0 * pos.x * pos.y + phase.y;
                pos.x = next;

                if (tan(pos.x) * pos.y > 5.0) {
                    value = index;
                    break;
                }
            }

            float distance = sqrt(pow(size.x / 2.0 - gl_FragCoord.x, 2.0) + pow(size.y / 2.0 - gl_FragCoord.y, 2.0)) / 50.0;

            if (texture == 0.0) {
                float color = mod(value, 10.0) / flash / 100.0;

                gl_FragColor = vec4(
                    mod(value, 10.0) * color * shade.x,
                    mod(value, 20.0) * color * shade.y,
                    mod(value, 30.0) * color * shade.z, 1);
            }

            else {
                float color = value / distance / flash / 2.0;
                gl_FragColor = vec4(color, color / 2.0, color / 4.0, 1);
            }
        }`)

    let phase = 1.5

    const resize = _ => {
        canvas.width = image.width = document.body.clientWidth
        canvas.height = image.height = document.body.clientHeight

        context.textAlign = "center"
        context.textBaseline = "middle"
        context.font = canvas.width / 3 + "px bold"
        context.fillStyle = "#fff"
        context.fillText(status, canvas.width / 2, canvas.height / 2)

        webgl.viewport(0, 0, canvas.width, canvas.height)
        webgl.uniform2f(webgl.getUniformLocation(program, "size"), canvas.width, canvas.height)
        webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGB, webgl.RGB, webgl.UNSIGNED_BYTE, image)
    }

    const loop = _ => {
        requestAnimationFrame(loop)
        phase += 0.005

        webgl.clear(webgl.COLOR_BUFFER_BIT)
        webgl.uniform1f(webgl.getUniformLocation(program, "flash"), Math.sin(phase * 0.6) + 2)

        webgl.uniform2f(
            webgl.getUniformLocation(program, "phase"),
            Math.tan(phase) / 20 + Math.cos(phase), Math.sin(phase))

        webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4)
    }
        
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer)
    webgl.bufferData(webgl.ARRAY_BUFFER, array, webgl.STATIC_DRAW)
    webgl.vertexAttribPointer(0, 2, webgl.FLOAT, false, size * 4, 0)
    webgl.vertexAttribPointer(1, 2, webgl.FLOAT, false, size * 4, size * 2)
    webgl.enableVertexAttribArray(0)
    webgl.enableVertexAttribArray(1)

    webgl.bindTexture(webgl.TEXTURE_2D, texture)
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE)
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE)
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.LINEAR)
    webgl.activeTexture(webgl.TEXTURE0)
    webgl.uniform1i(webgl.getUniformLocation(program, "sampler"), 0)
    webgl.uniform3f(webgl.getUniformLocation(program, "shade"), red, green, blue)

    addEventListener("resize", resize)
    font.load().then(_ => document.fonts.add(font) || resize())
    resize()
    loop()
}