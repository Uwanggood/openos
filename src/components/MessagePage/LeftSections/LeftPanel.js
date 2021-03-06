import React, { useState } from "react";
import MessageLists from "./MessageLists";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentMessageListsType } from "../../../redux/actions/message_actions";
import Modal from "react-modal";
import MessageInputModal from "../../../common/components/Modal/MessageInputModal";

function LeftPanel() {
  const [isOpenMessageInputModal, setIsOpenMessageInputModal] = useState(false);
  const dispatch = useDispatch();
  const currentMessageListType = useSelector(
    (state) => state.messages.currentMessageListType
  );
  const onChangeMessageListsTypeClick = (msgType) => {
    dispatch(setCurrentMessageListsType(msgType));
  };
  const onOpenMessageInputModalClick = () => {
    setIsOpenMessageInputModal(true);
  };
  const MessageInputModalClose = () => {
    setIsOpenMessageInputModal(false);
  };

  return (
    <div className="message-list-area">
      <div className="message-page-title-wrap">
        <h4 className="page-title">쪽지</h4>
        <div
          className={`message-tab receive ${
            currentMessageListType === "MSG_RECV" && "current"
          }`}
          onClick={() => onChangeMessageListsTypeClick("MSG_RECV")}
        >
          수신
        </div>
        <div
          className={`message-tab sent ${
            currentMessageListType === "MSG_SEND" && "current"
          }`}
          onClick={() => onChangeMessageListsTypeClick("MSG_SEND")}
        >
          발신
        </div>
        {/* <div className="message-tab booked">예약</div>
                <div className="message-tab file">파일함</div> */}
        <div className="message-list-action-wrap">
          <button
            className="message-list-action add"
            title="쪽지쓰기"
            onClick={onOpenMessageInputModalClick}
          ></button>
          <div className="message-list-action search" title="쪽지 검색">
            <input type="checkbox" id="message-list-search-toggle-check" />
            <label
              className="message-list-search-toggle"
              htmlFor="message-list-search-toggle-check"
            ></label>
            <div className="message-list-search-wrap">
              <input
                type="text"
                // className="message-list-search"
                placeholder="이름, 내용, 파일명, 일시 검색"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="chat-list-wrap">
        <ul>
          <MessageLists />
        </ul>
      </div>

      <Modal
        isOpen={isOpenMessageInputModal}
        onRequestClose={MessageInputModalClose}
        style={CustomStyles}
      >
        <MessageInputModal closeModalFunction={MessageInputModalClose} />
      </Modal>
    </div>
  );
}

export default LeftPanel;
const CustomStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    minWidth: "460px",
    height: "auto",
    padding: "24px 24px 40px",
    transform: "translate(-50%, -50%)",
  },
  overlay: { zIndex: 1000 },
};
Modal.setAppElement("#root");
