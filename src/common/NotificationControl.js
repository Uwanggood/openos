import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { showChatNoti } from "./ipcCommunication/ipcMessage";
import {
    addReceivedChat, setCurrentChatRoomFromNoti
} from "../redux/actions/chat_actions";
import { writeInfo, writeLog } from "./ipcCommunication/ipcLogger";
import { addMessage, setCurrentMessage, setCurrentMessageListsType } from "../redux/actions/message_actions";

const electron = window.require("electron");

function NotificationControl() {

    const dispatch = useDispatch();
   
    // 선택한 대화방 정보를 가지고 있는다.
    const currentChatRoom = useSelector(state => state.chats.currentChatRoom);

    // 선택한 대화방 처리
    useEffect(() => {

        // 현재 대화탭이 아니면 선택된 대화방 값을 없애 버린다.
        if (window.location.hash.split("/")[1] !== "chat") {
            sessionStorage.setItem('chatRoomKey', '')
        } else {
            sessionStorage.setItem('chatRoomKey', currentChatRoom?currentChatRoom.room_key:'')
        }
    }, [currentChatRoom, window.location.hash])


    //알림 수신처리
    useEffect(() => {

        writeInfo('----------   NorificationControl Loaded!');

        //
        // 페이지 변경요청
        electron.ipcRenderer.removeAllListeners('goto');
        electron.ipcRenderer.on('goto', (event, page) => {
            writeInfo('goto', page);
            window.location.hash = `#/${page}`;
            window.location.reload();
        });

        //
        // 대화 메세지 수신
        electron.ipcRenderer.removeAllListeners('chatReceived');
        electron.ipcRenderer.on('chatReceived', (event, chatData) => {

            writeLog('------ chatReceived currentChatRoom:%s chat:%s', currentChatRoom?currentChatRoom.room_key:'', chatData);
            let chat = chatData[0];

            // 본인이 보낸 메세지는 무시한다.
            if (chat.sendId === sessionStorage.getItem('loginId')) return;

            //받은 메시지 화면에 반영해주기
            writeLog('------ chatReceived', sessionStorage.getItem('chatRoomKey'), chat)

            //if (sessionStorage.getItem('chatRoomKey')) { dispatch(addReceivedChat(chat)) };
            dispatch(addReceivedChat(chat))

            console.log('selected chatRoom', sessionStorage.getItem('chatRoomKey'))
            // 내가 대화 room_key에 해당하지 않는 페이지에 있을 때만 알림 받기
            if (!sessionStorage.getItem('chatRoomKey') || chat.roomKey !== sessionStorage.getItem('chatRoomKey')) {
                //알림 받기
                showChatNoti(chat);
            }
        });  

        //
        // 쪽지 수신
        // 현재 선택된 쪽지 탭 유형을 확인하고, 쪽지 목록화면에 추가해야 함으로 쪽지 컨트롤에서 처리
        electron.ipcRenderer.removeAllListeners('messageReceived');
        electron.ipcRenderer.on('messageReceived', (event, msgData) => {
            let currentMessageListType = sessionStorage.getItem('currentMessageListType');
            let msg = msgData[0];

            // 내가 나에게 보내는 경우가 있으니 모든 경우를 판단한다.
            let destIds = msg.allDestId.split('|');
            let isRecvMsg = destIds.includes(sessionStorage.getItem('loginId'));
            let isSendMsg = msg.sendId === sessionStorage.getItem('loginId');

            // 내가 보고있는 함에 맞는 메세지가 오면 추가.
            if ((isSendMsg && currentMessageListType === 'MSG_SEND') ||
                (isRecvMsg && currentMessageListType === 'MSG_RECV')) {
                dispatch(
                    addMessage(msg.key, 
                        msg.destIds, 
                        msg.destName, 
                        msg.subject,
                        msg.message.trim().length === 0 ? `<p>${msg.subject}</>` : msg.message, 
                        msg.sendName));
            } 
        });
    
        // 
        // 알림창 클릭
        electron.ipcRenderer.removeAllListeners('notiTitleClick');  // 2중 등록 방지
        electron.ipcRenderer.on('notiTitleClick', (event, noti) => {

            writeLog('notiTitleClick', noti);

            switch(noti[0].notiType) {
                case 'NOTI_MESSAGE':
                    window.location.hash = `#/message`;
                    dispatch(setCurrentMessageListsType('MSG_RECV'));
                    dispatch(setCurrentMessage(noti[0].notiId))

                    break;
                case 'NOTI_CHAT':
                    writeLog('chat noti click!--');
                    window.location.hash = `#/chat/${noti[0].notiId}`;
                    //dispatch(setCurrentChatRoomFromNoti(noti[0].notiId, chatRooms))
                    dispatch(setCurrentChatRoomFromNoti())
                    
                    // // let notiType = sentInfo[0]
                    // let message = sentInfo[3]
                    // let roomKey = sentInfo[1]
                    // let allMembers = sentInfo[2]
                    // if (window.location.hash.split("/")[1] !== "chat") {
                    //     writeLog('notiTitleClick--');
                    //     window.location.hash = `#/chat/${roomKey}/${allMembers}/${message}`;
                    // }
                    break;
                default:
                    writeLog('Unknown Noti Title Click', noti[0])
                    return;
            }
        });
    
        
        //
        // 별칭(대화명) 변경 알림
        electron.ipcRenderer.removeAllListeners('userAliasChanged');
        electron.ipcRenderer.on('userAliasChanged', (event, msgData) => {
            writeInfo('userAliasChanged', msgData);
        });

    }, [])

    return (
        <div></div>
    )
}



export default NotificationControl

// let roomKey;
// // SelectedUsers = ["jeen8337","inkyung"]
// if (SelectedUsers.length === 2) {
//     roomKey = SelectedUsers.sort().join("|")
// } else {
//     roomKey = LoggedInUserId + "_" + getUUID()
// }



// window.location.hash = `#/chat/${roomKey}/${allMembers}`;
