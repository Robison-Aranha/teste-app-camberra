import react, { useState } from "react"
import { over } from "stompjs"
import SockJS from "sockjs-client"

var StompClient = null;

export const Inputs = ({ content, name, key }) => {

    const [contents, setContents] = useState([])


    const [userContent, setUserContent] = useState({
        username : name,
        connected : "",
        content : content,
        key : key
    })

    useEffect(() => {
        let sock = new SockJS("http://localhost:8080/ws")
        StompClient = over(sock)
        StompClient.connect({}, onConnected, onError)
    }, [])

    const onConnected = () => {
        setUserData({...userData, connected : true})
        StompClient.subscribe("/room/" + userData.key + "/content", onContent)
    }

    const onContent = (payload) => {
        let payloadData = JSON.parse(payload.body)

        chatroom.push(payloadData)
        setChatroom([...chatroom])
    }


}