import axios from 'axios';
import {
    GET_INITIAL_CHAT_ROOMS,
    GET_INITIAL_CHAT_MESSAGES,
    SET_CURRENT_CHAT_ROOM,
    GET_MORE_CHATS_MESSAGES,
    ADD_CHAT_ROOM_FROM_ORGANIZATION,
    MOVE_TO_CLICKED_CHAT_ROOM,
    ADD_CHAT_MESSAGE,
    ADD_CHAT_ROOM,
    ADD_RECEIVED_CHAT,
    SET_CURRENT_CHAT_ROOM_FROM_NOTI,
    EMPTY_CHAT_MESSAGE
} from './types';
import { getChatRoomList, sendChatMessage, getChatList } from '../../common/ipcCommunication/ipcMessage'
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
/**
 * 32자리 UUID를 반환합니다 
 */
function getUUID() {
    // 인덱싱이 되는경우 '-'가 성능저하가 됨으로 
    // 인덱싱 성능 보장용으로 사용한다. DB에 사용할경우 type을 binary로 하면 된다.
    // [인덱싱 성능 관련 참고:https://www.percona.com/blog/2014/12/19/store-uuid-optimized-way/]
    let tokens = uuidv4().split('-')
    return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4]
}

export function setCurrentChatRoom(roomKey, chatRooms) {
    let realRequest = chatRooms.filter(c => c.room_key === roomKey)
    return {
        type: SET_CURRENT_CHAT_ROOM,
        payload: realRequest
    }
}

export async function setCurrentChatRoomFromNoti() {

    return {
        type: SET_CURRENT_CHAT_ROOM_FROM_NOTI
    }
}

export async function getInitialChatRooms() {
    
    const getChatRoomListResult = await getChatRoomList(0, 100)
    let request = [];
    let chatRoomListData = getChatRoomListResult.data.table.row
    if (chatRoomListData !== undefined) {
        request = Array.isArray(chatRoomListData) ? chatRoomListData : [chatRoomListData]
    }
    return {
        type: GET_INITIAL_CHAT_ROOMS,
        payload: request
    }
}

export async function getInitialChatMessages(chatRoomId, lastLineKey) {

    console.log('chatRoomId', chatRoomId)

    let getChatListsResult = await getChatList(chatRoomId, lastLineKey, 10)
    
    let request = [];
    let getChatLists = getChatListsResult.data.table.row
    if (getChatLists !== undefined) {
        request = Array.isArray(getChatLists) ? getChatLists : [getChatLists]
    }
    console.log('getChatLists request', request)

    return {
        type: GET_INITIAL_CHAT_MESSAGES,
        payload: request
    }
}

export function addChatMessage(chatUsersId, chatMessage, isNewChat, chatRoomId = null, senderName, senderId) {

    let userIds = chatUsersId.split('|')

    sendChatMessage(userIds, chatMessage, isNewChat ? null : chatRoomId);
    let request = {
        chat_contents: chatMessage,
        chat_send_name: senderName,
        chat_send_date: moment().format("YYYYMMDDHHmm"),
        read_count: 0,
        chat_send_id: senderId
    }
    return {
        type: ADD_CHAT_MESSAGE,
        payload: request
    }
}

export function addReceivedChat(newMessage) {

    return {
        type: ADD_RECEIVED_CHAT,
        payload: newMessage
    }
}

export function emptyChatMessages () {
    return {
        type: EMPTY_CHAT_MESSAGE
    }
}


export async function addChatRoom(request) {
    // 여기서 체크해야할것은 만약 1:1 채팅이면 
    // 이미 만들어진 채팅 방이 있는지 체크해서 
    // 있다면 그 채팅방의 채팅 리스트를 보내주기 
    if (request.user_counts === 2) {
        let chatRoomKey = request.selected_users.sort().join("|")
        request.room_key = chatRoomKey
        let getChatListsResult = await getChatList(chatRoomKey, '9999999999999999', 10)
        let chatData = getChatListsResult.data.table.row
        if (chatData) {
            request.chatLists = Array.isArray(getChatListsResult.data.table.row) ? getChatListsResult.data.table.row : [getChatListsResult.data.table.row]
        } else {
            request.chatLists = [];
        }

    } else {
        request.room_key = request.chat_send_id + "_" + getUUID()
        request.chatLists = []
    }
    return {
        type: ADD_CHAT_ROOM,
        payload: request
    }
}


export async function addChatRoomFromOrganization(orgMembers) {
    // 여기서 체크해야할것은 만약 1:1 채팅이면 
    // 이미 만들어진 채팅 방이 있는지 체크해서 
    // 있다면 그 채팅방의 채팅 리스트를 보내주기 
    let finalSelectedKeys = orgMembers.split("|")
    let newFinal = finalSelectedKeys
    newFinal.push(sessionStorage.getItem(`loginId`))
    const request = {
        selected_users: finalSelectedKeys,
        user_counts: newFinal.length,
        chat_entry_ids: newFinal.join('|'),
        unread_count: 0,
        chat_content: "",
        last_line_key: '9999999999999999',
        chat_send_name: sessionStorage.getItem(`loginName`),
        create_room_date: moment().format("YYYYMMDDHHmm"),
        chat_send_id: sessionStorage.getItem(`loginId`),
    };

    if (request.user_counts === 2) {
        let chatRoomKey = request.selected_users.sort().join("|")
        request.room_key = chatRoomKey
        let getChatListsResult = await getChatList(chatRoomKey, '9999999999999999', 10)
        let chatData = getChatListsResult.data.table.row
        if (chatData) {
            request.chatLists = Array.isArray(getChatListsResult.data.table.row) ? getChatListsResult.data.table.row : [getChatListsResult.data.table.row]
        } else {
            request.chatLists = [];
        }

    } else {
        request.room_key = request.chat_send_id + "_" + getUUID()
        request.chatLists = []
    }
    return {
        type: ADD_CHAT_ROOM,
        payload: request
    }
}

export async function moveToClickedChatRoom(request) {

    let getChatListsResult = await getChatList(request.room_key, '9999999999999999', 10)
    let chatData = getChatListsResult.data.table.row
    if (chatData) {
        request.chatLists = Array.isArray(getChatListsResult.data.table.row) ? getChatListsResult.data.table.row : [getChatListsResult.data.table.row]
    } else {
        request.chatLists = [];
    }

    const getChatRoomListResult = await getChatRoomList(0, 15)
    let chatRooms = [];
    let chatRoomListData = getChatRoomListResult.data.table.row
    if (chatRoomListData !== undefined) {
        chatRooms = Array.isArray(chatRoomListData) ? chatRoomListData : [chatRoomListData]
    }

    let chatRoomsWithoutCurrenChatRoom = chatRooms.filter(room => room.room_key !== request.room_key)

    let allChatRooms = [request, ...chatRoomsWithoutCurrenChatRoom]
    let currentChatRoom = request
    let realRequest = [];
    realRequest[0] = allChatRooms;
    realRequest[1] = currentChatRoom;
    return {
        type: MOVE_TO_CLICKED_CHAT_ROOM,
        payload: realRequest
    }
}



// export function getMoreChatMessages(bandId, page = 1) {
//     const request = axios.get(`${SERVER_URI}:5000/api/talk?bandId=${bandId}&page=${page}`)
//         .then(response => response.data);

//     return {
//         type: GET_MORE_CHATS_MESSAGES,
//         payload: request
//     }
// }


// export async function getInitialChatRooms() {
//     const getChatRoomListResponse = await getChatRoomList(0, 100)
//     let chatRoomWithMembers = []
//     getChatRoomListResponse.data.table.row.forEach(async chatRoomItem => {
//         let convertedIds = chatRoomItem.chat_entry_ids.split('|')
//         const getUserInfosResponse = await getUserInfos(convertedIds)
//         chatRoomItem.userInfos = Array.isArray(getUserInfosResponse.data.items.node_item) ? getUserInfosResponse.data.items.node_item : [getUserInfosResponse.data.items.node_item]
//         chatRoomWithMembers.push(chatRoomItem)
//     })

//     winston.info('chatRoomWithMembers request: ', chatRoomWithMembers)

//     return {
//         type: GET_INITIAL_CHAT_ROOMS,
//         payload: chatRoomWithMembers
//     }
// }
