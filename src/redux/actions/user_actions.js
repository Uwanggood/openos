import axios from 'axios';
import {
    GET_LOGGED_IN_USER_INFO
} from './types';
import { getUserInfos } from '../../common/ipcCommunication/ipcOrganization'

export async function getLogginedInUserInfo(userId) {
    let request = await getUserInfos([userId])
    return {
        type: GET_LOGGED_IN_USER_INFO,
        payload: request.data.items && request.data.items.node_item
    }
}
