import { WebSocket } from "ws";
import axios from "axios";




const siteId = process.env.SITE_ID || "27532676";
const authUrl = `https://va.idp.liveperson.net/api/account/${siteId}/signup`;
const wsUrl = `wss://va.msg.liveperson.net/ws_api/account/${siteId}/messaging/consumer?v=3`;


axios.post(authUrl).then(response  => {

    const { jwt } = response.data;
    
    const socket = new WebSocket(wsUrl, {
        headers: {
            "Authorization": `jwt ${jwt}`
        }
    })

    socket.on("open", () => {
        console.log("connected");
        
        const requestConversation = {
            kind: "req",
            id: 1,
            type:"cm.ConsumerRequestConversation"
        };

        console.log("Requesting conversation");
        socket.send(JSON.stringify(requestConversation));
    });

    socket.on("close", () => {
        console.log("disconnected");
    });

    socket.on("message", data => {
        const msgText = data.toString();
        const msg = JSON.parse(msgText);
        
        const { conversationId } = msg.body;
        console.log(`Received conversation id: ${conversationId}`);;

        const myFirstMessage = {
            kind:"req",
            id: 2,
            type:" ms.PublishEvent",
            body:{
                dialogId: conversationId,
                event: {
                    type: "ContentEvent",
                    contentType: "text/plain",
                    message: "My first message"
                }
            }
        };

        console.log("My first message");
        socket.send(JSON.stringify(myFirstMessage));
    });
    
});