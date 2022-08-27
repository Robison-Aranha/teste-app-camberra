import react, { useState } from "react"
import { over } from "stompjs"
import SockJS from "sockjs-client"

var StompClient = null;

export const ChatRoom = () => {

    const [chatroom, setChatroom] = useState([])

    const [userData, setUserData] = useState({
        username : "",
        recievername : "",
        connected : "",
        key : "",
        message : ""
    })

    const handlerValue = (event) => {
        const { value, name } = event.target 
        setUserData({...userData, [name]: value})
    }

    const registerUser = () => {
        let sock = new SockJS("https://tcc-camberra-websocket-teste.herokuapp.com/ws")
        StompClient = over(sock)
        StompClient.connect({}, onConnected, onError)
    }

    const onConnected = () => {
        setUserData({...userData, connected : true})
        StompClient.subscribe("/room/" + userData.key, onMessageChat)
        userJoin();
    }

    const userJoin = () => {
        let chatMessage = {
            senderName : userData.username,
            key: userData.key,
            status : "JOIN"
        }
        StompClient.send("/app/room", {}, JSON.stringify(chatMessage))   
        
        let joinMessage = {
            senderName : "room",
            message : userData.username + " se juntou a sala!!",
            key : userData.key,
            status : "MESSAGE"
        }
        StompClient.send("/app/room", {}, JSON.stringify(joinMessage))
    }


    const onMessageChat = (payload) => {
        let payloadData = JSON.parse(payload.body)

        switch(payloadData.status) {
            case "JOIN":
                break
            case "MESSAGE":
                chatroom.push(payloadData)
                setChatroom([...chatroom])
                break
        }
    }

    const sendMessageChatRoom = () => {
        if (StompClient){
            let chatMessage = {
                senderName : userData.username,
                message : userData.message,
                key: userData.key,
                status : "MESSAGE"
            }
            StompClient.send("/app/room", {}, JSON.stringify(chatMessage))
            setUserData({...userData, message : ""})
        }
    }

    const onError = (error) => {
        console.log(error)
    }

    console.log(chatroom)
    console.log(userData)

    return (

        <div className="ChatRoom__container">
            { userData.connected ? 
                <div className="ChatRoom_chat-box">
                    <div>
                        Chatroom
                    </div>
                    <div className="ChatRoom__chat-content">
                        <ul>
                            {chatroom.map((chat, index) => (
                                <li className="ChatRoom__chat-content-message" key={index}>

                                    <div className="ChatRoom__chat-content-message-data"> {chat.senderName} : {chat.message} </div>
                                    
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="ChatRoom_send-message">
                        <input type="text" className="ChatRoom_send-message-input" placeholder="enter message" value={userData.message} name="message" onChange={handlerValue} />
                        <button type="button" className="ChatRoom_send-message-button" onClick={sendMessageChatRoom}> 
                            Send
                        </button>
                    </div>
                </div>
                :

                <div className="ChatRoom__register">
                    <input className="ChatRoom__register-username" placeholder="Enter the username" name="username" value={userData.username} onChange={handlerValue}/>
                    <input type="text" className="ChatRoom_send-message-input" placeholder="enter code" value={userData.key} name="key" onChange={handlerValue} />
                    <button type="button" onClick={registerUser}> 
                        Connect
                    </button>
                </div>

            }
        </div>
    );

}