import { useEffect, useState } from "react";
import Header from "../header/Header";
import NewChat from "../popups/NewChat";
import Sidebar from "../sidebar/Sidebar";
import { invoke } from "@tauri-apps/api/core";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import ConfirmNavigate from "../popups/ConfirmNavigate";
import style from './Chat.module.css';

// Handle getting the list of chats for the sidebar
// We then pass it as a prop to the component
type Chat = {
    id: number;
    name: string;
}

export default function Layout() {

    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

    const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
    const [isResponding, setIsResponding] = useState<boolean>(false);
    const [navId, setNavId] = useState<number>(-1);

    const params = useParams();
    const chatId = params.id ? Number(params.id) : -1;

    // Selected model from the dropdown
    const [selectedModel, setSelectedModel] = useState<string>('');

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    }


    const [chatList, setChatList] = useState<Chat[]>([]);

    const fetchChats = async () => {
        setChatList([]);
        try {
            setChatList(await invoke('get_chats'));
        } catch (error) {
            console.error('Error fetching chats:', error);
        }
    }

    useEffect(() => {
        fetchChats();
    }, []);

    // Manage creating a new chat
    const [newChatName, setNewChatName] = useState<string>('');

    const navigate = useNavigate();

    const createNewChat = async () => {
        const chatName = newChatName.trim();
        if (chatName === '') {
            return;
        }

        try {
            // Create a new chat in the backend and db
            const newChat: Chat = await invoke('create_chat', { name: chatName });
            setChatList(prevChats => [newChat, ...prevChats]);
            setNewChatName('');
            setIsPopupOpen(false);
            navigate(`/chats/${newChat.id}`);
        } catch (error) {
            console.error('Error creating new chat:', error);
        }
    }

    const handleNavigate = (id: number) => {
        navigate(`/chats/${id}`);
        setIsConfirmOpen(false);
        setNavId(-1);
    }

    // Use this for special logic for when sending msg from home page
    // So when we hit send, and it creates and routes to a new chat, we'll auto-send the message
    // they initially typed in the home page
    const [sentFromHome, setSentFromHome] = useState<boolean>(false);

    // We need to lock the model the user selected when initially sending the message
    // So that if the user changes the model while the llm is responding, we still use the initial model
    const [homePageModel, setHomePageModel] = useState<string>('');
    const [chatText, setChatText] = useState<string>('');

    return (
        <div className={`${style.container}`}>
            {isPopupOpen &&
                <NewChat
                    onSave={createNewChat}
                    onCancel={() => setIsPopupOpen(false)}
                    value={newChatName}
                    setValue={setNewChatName}
                />}

            {isConfirmOpen &&
                <ConfirmNavigate
                    onYes={() => handleNavigate(navId)}
                    onNo={() => setIsConfirmOpen(false)}
                />}

            <Header
                isOpen={isSidebarOpen}
                toggle={toggleSidebar}
                setSelectedModel={setSelectedModel}
            />

            <Sidebar
                isOpen={isSidebarOpen}
                toggle={toggleSidebar}
                setIsOpen={setIsPopupOpen}
                chatList={chatList}
                setChatList={setChatList}
                chatId={chatId}
                isResponding={isResponding}
                setIsConfirmOpen={setIsConfirmOpen}
                setNavId={setNavId}
            />

            <Outlet context={{
                isSidebarOpen,
                selectedModel,
                isResponding,
                setIsResponding,
                setIsPopupOpen,
                sentFromHome,
                setSentFromHome,
                homePageModel,
                setHomePageModel,
                chatText,
                setChatText,
                setIsConfirmOpen,
            }} />
        </div>
    );
}