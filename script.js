const typingForm = document.querySelector(".typing-form");
const chatContainer=document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton=document.querySelector("#delete-chat-button");

let userMessage=null;
let isResponseGenerating=false;

const API_KEY="AIzaSyAVQzttzQt1JkVSDQQ_zWMqhhMNq9kaECU";
const API_URL=`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

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