window.dataLayer = window.dataLayer || []
function gtag() {dataLayer.push(arguments)}
gtag("js", new Date())
gtag("config", "G-Z48CP6DVRN")

const module = {
    theme: editor => {
        const theme = localStorage.getItem("theme")
    
        editor.setTheme(
            theme == "Dark" ? "ace/theme/tomorrow_night_eighties" :
            theme == "Gob" ? "ace/theme/gob" :
            theme == "Vibrant" ? "ace/theme/merbivore_soft" :
            theme == "Navy" ? "ace/theme/nord_dark" : "ace/theme/dawn")
    },

    input: text => {
        if (text.value.trim()) text.nextElementSibling.setAttribute("version", "active")
        else text.nextElementSibling.setAttribute("version", "blank")
    },

    comment: (content, name, source, type) => {
        const comment = document.createElement("div")
        const markdown = document.createElement("div")
        const button = document.createElement("i")
        const image = document.createElement("img")
        const link = document.createElement("a")

        markdown.innerHTML = content
        markdown.className = "markdown"
        comment.className = "comment"
        
        button.setAttribute("type", type ? "flag" : "delete")
        button.className = `far fa-${type ? "flag" : "trash-alt"}`
        button.setAttribute("onclick", `${type ? "flag" : "splice"}(this)`)

        link.href = "/profile/" + name
        link.innerText = name
        image.src = source
        
        link.appendChild(image)
        comment.appendChild(link)
        comment.appendChild(button)
        comment.appendChild(markdown)

        return comment
    }
}

const mutation = new MutationObserver(() => {
    if (document.body) {
        mutation.disconnect()

        if (localStorage.getItem("theme"))
            document.body.setAttribute("theme", localStorage.getItem("theme"))
        
        else {
            document.body.setAttribute("theme", "Light")
            localStorage.setItem("theme", "Light")
        }
    }
})

mutation.observe(document.documentElement, {childList: true})