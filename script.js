const typingForm = document.querySelector(".typing-form");
const chatContainer=document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton=document.querySelector("#delete-chat-button");

let userMessage=null;
let isResponseGenerating=false;

// ❗ API key required to run this project
// Create your own API key from Google AI Studio

const API_KEY = ""; // <-- INSERT YOUR API KEY HERE
const API_URL = ""; // <-- INSERT API URL HERE


const loadDataFromLocalStorage=()=>
{
    const savedChats=localStorage.getItem("saved-chats");
    const isLightMode=(localStorage.getItem("themeColor")==="light_mode");

    document.body.classList.toggle("light_mode",isLightMode);
    toggleThemeButton.innerText=isLightMode ? "dark_mode" : "light_mode";

    chatContainer.innerHTML=savedChats || '';
    document.body.classList.toggle("hide-header",savedChats);

    chatContainer.scrollTo(0,chatContainer.scrollHeight);
}

const createMessageElement=(content, ...classes)=>
{
    const div =document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML=content;
    return div;
}

const showTypingEffect=(text,textElement,incomingMessageDiv)=>
{
    const words=text.split(' ');
    let currentWordIndex=0;

    const typingInterval = setInterval(()=>
    {
        textElement.innerText += (currentWordIndex ===0 ? '' : ' ') + words[currentWordIndex++];
        incomingMessageDiv.querySelector(".icon").classList.add("hide");

        if(currentWordIndex === words.lenth)
        {
            clearInterval(typingInterval);
            isResponseGenerating=false;
            incomingMessageDiv.querySelector(".icon").classList.remove("hide");
            localStorage.setItem("saved-chats", chatContainer.innerHTML);
        }
        chatContainer.scrollTo(0,chatContainer.scrollHeight);
    },75)
}

const generateAPIResponse = async (incomingMessageDiv)=>
{
    const textElement=incomingMessageDiv.querySelector(".text");
    try
    {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(
                {
                    contents: [
                        {
                            role: "user",
                            parts: [{text: userMessage}]
                        }
                    ]
                }
            ),
        });

        const data =await response.json();
        if(!response.ok) throw new Error(data.error.message);

        const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
        showTypingEffect(apiResponse,textElement,incomingMessageDiv);
    }
    catch(error)
    {
        isResponseGenerating=false;
        textElement.innerText=error.message;
        textElement.parentElement.closest(",message").classList.add("error");
    }finally
    {
        incomingMessageDiv.classList.remove("loading");
    }
}

const showLoadingAnimation= ()=>
{
    const html = <div class="message-content">
        <img class="avatar" src="images/gemini.svg" alt="Gemini avatar"/>
        <p class="text"></p>
        <div class="loading-indicator">
            <div class="loading-bar"></div>
            <div class="loading-bar"></div>
            <div class="loading-bar"></div>
        </div>
        <span onClick="copyMessage(this)" class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>
        </span>
    </div>

    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
    chatContainer.appendChild(incomingMessageDiv);

    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    generateAPIResponse(incomingMessageDiv);
}

const copyMessage= (copyButton) =>
{
    const messageText = copyButton.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(messageText);
    copyButton.innerText= "done";
    setTimeout(() =>
    {
        copyButton.innerText = ""
    })
}