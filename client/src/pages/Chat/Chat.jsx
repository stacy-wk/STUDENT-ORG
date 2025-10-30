import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Send, MessageSquare, Users, Loader2, Plus, Search, UserPlus } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';


const safeParseTimestamp = (timestampValue) => {
  if (!timestampValue) {
    return null;
  }
  if (typeof timestampValue === 'object' && timestampValue.seconds !== undefined) {
    const date = new Date(timestampValue.seconds * 1000);
    return isValid(date) ? date : null;
  }
  if (typeof timestampValue === 'string') {
    const date = parseISO(timestampValue);
    return isValid(date) ? date : null;
  }
  if (timestampValue instanceof Date && isValid(timestampValue)) {
    return timestampValue;
  }
  return null;
};


function Chat({ userId, userProfile, auth, isAxiosAuthReady }) {
  console.log('Chat Component Render. Props:', { userId, userProfile, isAxiosAuthReady }); 

  const [socket, setSocket] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showFindUserModal, setShowFindUserModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [selectedGroupToAddMember, setSelectedGroupToAddMember] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const SOCKET_SERVER_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[Socket.IO Client] Connected to server:', newSocket.id);
    });

    newSocket.on('message', (confirmedMessage) => {
      console.log('[Socket.IO Client] Confirmed message received:', confirmedMessage);
      if (selectedRoom && confirmedMessage.roomId === selectedRoom.id) {
        setMessages(prevMessages => {
          // Find and update message using tempId
          const updatedMessages = prevMessages.map(msg =>
            msg.tempId === confirmedMessage.tempId
              ? { ...confirmedMessage, tempId: undefined, status: undefined } // Replace with confirmed data, remove tempId and status
              : msg
          );
          if (!updatedMessages.some(msg => msg.id === confirmedMessage.id || msg.tempId === confirmedMessage.tempId)) {
            return [...updatedMessages, confirmedMessage];
          }
          return updatedMessages;
        });
      }
    });

    newSocket.on('messageError', ({ tempId, message, error }) => {
      console.error('[Socket.IO Client] Message error:', message, error);
      toast.error(message || 'Failed to send message.');
      setMessages(prevMessages => prevMessages.filter(msg => msg.tempId !== tempId));
    });


    newSocket.on('disconnect', () => {
      console.log('[Socket.IO Client] Disconnected from server.');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [SOCKET_SERVER_URL, selectedRoom]);

  // Fetch Chat Rooms
  useEffect(() => {
    const fetchChatRooms = async () => {
      if (!userId || !auth || !isAxiosAuthReady) {
        console.log('Chat: Skipping fetchChatRooms. Conditions not met:', { userId, auth: !!auth, isAxiosAuthReady });
        return;
      }
      console.log('Chat: Attempting to fetch chat rooms...');

      try {
        const response = await axios.get(`${API_BASE_URL}/api/chat/rooms`);

        const roomsWithDisplayNames = await Promise.all(response.data.map(async (room) => {
          if (room.type === 'private' && room.members && room.members.length === 2) {
            const otherUserId = room.members.find(memberId => memberId !== userId);
            if (otherUserId) {
              try {
                const userRes = await axios.get(`${API_BASE_URL}/api/auth/users/${otherUserId}`);
                return { ...room, name: `Chat with ${userRes.data.username || 'Unknown User'}` };
              } catch (profileError) {
                console.warn(`Could not fetch profile for user ${otherUserId}:`, profileError);
                return { ...room, name: `Private Chat (User not found)` };
              }
            }
          }
          return room;
        }));

        setChatRooms(roomsWithDisplayNames);
        if (roomsWithDisplayNames.length > 0 && !selectedRoom) {
          setSelectedRoom(roomsWithDisplayNames[0]);
        }
        console.log('[Client] Fetched chat rooms:', roomsWithDisplayNames);
      } catch (error) {
        console.error('[Client] Error fetching chat rooms:', error);
        toast.error('Failed to load chat rooms.');
      }
    };

    fetchChatRooms();
  }, [userId, auth, API_BASE_URL, isAxiosAuthReady]); 


  // Fetch Messages for Selected Room 
  useEffect(() => {
    const fetchMessagesAndJoinRoom = async () => {
      if (!selectedRoom || !userId || !auth || !socket || !isAxiosAuthReady) {
        console.log('Chat: Skipping fetchMessagesAndJoinRoom. Conditions not met:', { selectedRoom, userId, auth: !!auth, socket: !!socket, isAxiosAuthReady });
        return;
      }
      console.log('Chat: Attempting to fetch messages and join room...');

      setLoadingMessages(true);
      setMessages([]);

      socket.emit('joinRoom', selectedRoom.id, userId);
      console.log(`[Socket.IO Client] Emitted 'joinRoom' for ${selectedRoom.id}`);

      try {
        const response = await axios.get(`${API_BASE_URL}/api/chat/messages/${selectedRoom.id}`);
        setMessages(response.data);
        console.log(`[Client] Fetched messages for ${selectedRoom.name}:`, response.data);
      } catch (error) {
        console.error(`[Client] Error fetching messages for ${selectedRoom.name}:`, error);
        toast.error(`Failed to load messages for ${selectedRoom.name}.`);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessagesAndJoinRoom();

    return () => {};
  }, [selectedRoom, userId, auth, socket, API_BASE_URL, isAxiosAuthReady]);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom || !userId || !userProfile?.username || !socket) {
      toast.error('Cannot send empty message or no room selected.');
      return;
    }

    // Immediate message display
    const tempId = Date.now(); // Unique temporary ID
    const optimisticMessage = {
      tempId: tempId, 
      roomId: selectedRoom.id,
      senderId: userId,
      senderName: userProfile.username,
      messageText: newMessage.trim(),
      timestamp: new Date(), 
      status: 'pending', 
    };

    setMessages(prevMessages => [...prevMessages, optimisticMessage]);
    setNewMessage(''); 

    socket.emit('sendMessage', { ...optimisticMessage, tempId });
  };


  // New Chat Room Management
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      toast.error('Group name cannot be empty.');
      return;
    }
    if (!userId || !auth || !isAxiosAuthReady) {
      toast.error('You must be logged in and authenticated to create groups.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/chat/rooms`, { roomName: newGroupName });
      toast.success(`Group "${newGroupName}" created!`);
      setChatRooms(prev => [...prev, response.data]);
      setSelectedRoom(response.data);
      setNewGroupName('');
      setShowCreateGroupModal(false);
    } catch (error) {
      console.error('Error creating group:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create group.';
      toast.error(errorMessage);
    }
  };

  const handleSearchUsers = async (searchTerm, type) => {
    if (!searchTerm.trim()) {
      type === 'private' ? setUserSearchResults([]) : setMemberSearchResults([]);
      return;
    }
    if (!userId || !auth || !isAxiosAuthReady) {
      toast.error('You must be logged in and authenticated to search users.');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/users?search=${searchTerm}`);
      const results = response.data.filter(user => user.id !== userId);
      type === 'private' ? setUserSearchResults(results) : setMemberSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      const errorMessage = error.response?.data?.message || 'Failed to search users.';
      toast.error(errorMessage);
      type === 'private' ? setUserSearchResults([]) : setMemberSearchResults([]);
    }
  };

  const handleStartPrivateChat = async (targetUser) => {
    if (!userId || !auth || !isAxiosAuthReady) {
      toast.error('You must be logged in and authenticated to start a chat.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/chat/private`, { targetUserId: targetUser.id });
      toast.success(`${targetUser.username} started!`);
      const newRoom = response.data;
      const existingRoom = chatRooms.find(room => room.id === newRoom.id);
      if (!existingRoom) {
        newRoom.name = `${targetUser.username || 'Unknown User'}`;
        setChatRooms(prev => [...prev, newRoom]);
      }
      setSelectedRoom(newRoom);
      setShowFindUserModal(false);
      setUserSearchTerm('');
      setUserSearchResults([]);
    } catch (error) {
      console.error('Error starting private chat:', error);
      const errorMessage = error.response?.data?.message || 'Failed to start private chat.';
      toast.error(errorMessage);
    }
  };

  const handleAddMember = async (memberUser) => {
    if (!selectedGroupToAddMember || !userId || !auth || !isAxiosAuthReady) {
      toast.error('No group selected or not logged in/authenticated.');
      return;
    }
    if (selectedGroupToAddMember.members.includes(memberUser.id)) {
      toast.error(`${memberUser.username} is already a member.`);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/chat/rooms/${selectedGroupToAddMember.id}/members`, { userIdToAdd: memberUser.id });
      toast.success(`${memberUser.username} added to ${selectedGroupToAddMember.name}!`);
      setChatRooms(prev => prev.map(room =>
        room.id === selectedGroupToAddMember.id ? { ...room, members: response.data.members } : room
      ));
      setSelectedRoom(prev => ({ ...prev, members: response.data.members }));
      setMemberSearchTerm('');
      setMemberSearchResults([]);
      setShowAddMemberModal(false);
    } catch (error) {
      console.error('Error adding member:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add member.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex-grow p-4 md:p-8 flex flex-col h-[calc(100vh-120px)]">
      <div className="max-w-7xl mx-auto flex flex-grow w-full bg-white rounded-xl shadow-custom-medium overflow-hidden">
        {/* Left Panel: Chat Rooms List */}
        <div className="w-1/4 min-w-[200px] border-r border-student-os-light-gray flex flex-col">
          <div className="p-4 border-b border-student-os-light-gray flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users size={20} className="text-student-os-accent" />
              <h3 className="font-semibold text-student-os-dark-gray">Chat Rooms</h3>
            </div>
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="p-1 rounded-full bg-student-os-accent text-black hover:bg-student-os-accent/90 transition-colors"
              aria-label="Create New Group"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto">
            {chatRooms.length === 0 ? (
              <p className="p-4 text-sm text-student-os-light-gray">No chat rooms available. Create one!</p>
            ) : (
              chatRooms.map(room => (
                <div
                  key={room.id}
                  className={`flex items-center justify-between w-full text-left p-4 border-b border-student-os-light-gray transition-colors
                    ${selectedRoom?.id === room.id ? 'bg-student-os-accent text-black' : 'bg-white text-student-os-dark-gray hover:bg-student-os-light-gray'}`}
                >
                  <button
                    onClick={() => setSelectedRoom(room)}
                    className={`flex-grow text-left ${selectedRoom?.id === room.id ? 'text-black' : 'text-student-os-dark-gray'}`}
                  >
                    <span className="font-medium">{room.name}</span>
                    {room.type === 'private' && <span className="text-xs opacity-75 block">Private Chat</span>}
                    {room.type === 'group' && <span className="text-xs opacity-75 block">{room.members.length} members</span>}
                  </button>
                  {room.type === 'group' && selectedRoom?.id === room.id && (
                    <button
                      onClick={() => {
                        setSelectedGroupToAddMember(room);
                        setShowAddMemberModal(true);
                      }}
                      className="ml-2 p-1 rounded-full bg-white text-student-os-accent hover:bg-student-os-light-gray transition-colors"
                      aria-label="Add member"
                    >
                      <UserPlus size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-student-os-light-gray">
            <button
              onClick={() => setShowFindUserModal(true)}
              className="w-full px-4 py-2 rounded-lg bg-student-os-dark-gray text-black flex items-center justify-center space-x-2 transition-colors shadow-sm"
            >
              <Search size={18} />
              <span>Find User / Private Chat</span>
            </button>
          </div>
        </div>

        {/* Right Panel: Chat Messages */}
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-student-os-light-gray flex items-center space-x-2">
                <MessageSquare size={20} className="text-student-os-accent" />
                <h3 className="font-semibold text-student-os-dark-gray">{selectedRoom.name}</h3>
              </div>

              {/* Messages Display Area */}
              <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 size={24} className="animate-spin text-student-os-accent" />
                    <p className="ml-2 text-student-os-dark-gray">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-student-os-light-gray">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((message, index) => {
                    const messageDate = safeParseTimestamp(message.timestamp);
                    return (
                      <div
                        key={message.id || message.tempId || index} 
                        className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] p-3 rounded-xl shadow-sm
                          ${message.senderId === userId
                            ? 'bg-student-os-accent text-black rounded-br-none'
                            : 'bg-student-os-light-gray text-student-os-dark-gray rounded-bl-none'
                          }`}
                        >
                          <p className="font-semibold text-sm mb-1">
                            {message.senderId === userId ? 'You' : message.senderName}
                          </p>
                          <p className="text-base break-words">{message.messageText}</p>
                          <p className="text-right text-xs mt-1 opacity-75">
                            {message.status === 'pending' ? 'Sending...' : (messageDate ? format(messageDate, 'p') : '')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-student-os-light-gray flex items-center space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-grow p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors"
                />
                <button
                  type="submit"
                  className="p-3 rounded-full bg-student-os-accent text-black hover:bg-student-os-accent/90 transition-colors shadow-md"
                  aria-label="Send Message"
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-student-os-dark-gray">
              <p>Select a chat room or create a new one to start messaging.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-custom-medium p-6 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6 text-student-os-accent">Create New Group</h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label htmlFor="groupName" className="block text-sm font-medium text-student-os-dark-gray mb-1">Group Name</label>
                <input
                  type="text"
                  id="groupName"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="px-5 py-2 rounded-lg border border-student-os-light-gray text-student-os-dark-gray hover:bg-student-os-light-gray transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-student-os-accent text-black hover:bg-student-os-accent/90 transition-colors shadow-md"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Find User For Private Chat Modal */}
      {showFindUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-custom-medium p-6 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6 text-student-os-accent">Find User To Start Private Chat</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="userSearch" className="block text-sm font-medium text-student-os-dark-gray mb-1">Search by Username</label>
                <input
                  type="text"
                  id="userSearch"
                  value={userSearchTerm}
                  onChange={(e) => {
                    setUserSearchTerm(e.target.value);
                    if (e.target.value.length > 2) {
                        setTimeout(() => handleSearchUsers(e.target.value, 'private'), 300);
                    } else {
                        setUserSearchResults([]);
                    }
                  }}
                  className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors"
                  placeholder="e.g., john_doe"
                />
              </div>
              {userSearchTerm.trim() && userSearchResults.length > 0 && (
                <div className="border border-student-os-light-gray rounded-lg max-h-48 overflow-y-auto">
                  {userSearchResults.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleStartPrivateChat(user)}
                      className="w-full text-left p-3 border-b border-student-os-light-gray last:border-b-0 hover:bg-student-os-light-gray transition-colors text-student-os-dark-gray"
                    >
                      <span className="font-medium">{user.username}</span>
                      <span className="text-sm text-student-os-light-gray block">{user.email}</span>
                    </button>
                  ))}
                </div>
              )}
              {userSearchTerm.trim() && userSearchResults.length === 0 && (
                <p className="text-center text-sm text-student-os-light-gray">No users found.</p>
              )}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowFindUserModal(false);
                    setUserSearchTerm('');
                    setUserSearchResults([]);
                  }}
                  className="px-5 py-2 rounded-lg border border-student-os-light-gray text-student-os-dark-gray hover:bg-student-os-light-gray transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member to Group Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-custom-medium p-6 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6 text-student-os-accent">Add Member to "{selectedGroupToAddMember?.name}"</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="memberSearch" className="block text-sm font-medium text-student-os-dark-gray mb-1">Search by Username</label>
                <input
                  type="text"
                  id="memberSearch"
                  value={memberSearchTerm}
                  onChange={(e) => {
                    setMemberSearchTerm(e.target.value);
                    if (e.target.value.length > 2) {
                        setTimeout(() => handleSearchUsers(e.target.value, 'member'), 300);
                    } else {
                        setMemberSearchResults([]);
                    }
                  }}
                  className="w-full p-3 border border-student-os-light-gray rounded-lg focus:ring-2 focus:ring-student-os-accent focus:border-transparent transition-colors"
                  placeholder="e.g., jane_doe"
                />
              </div>
              {memberSearchTerm.trim() && memberSearchResults.length > 0 && (
                <div className="border border-student-os-light-gray rounded-lg max-h-48 overflow-y-auto">
                  {memberSearchResults.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleAddMember(user)}
                      className="w-full text-left p-3 border-b border-student-os-light-gray last:border-b-0 hover:bg-student-os-light-gray transition-colors text-student-os-dark-gray"
                    >
                      <span className="font-medium">{user.username}</span>
                      <span className="text-sm text-student-os-light-gray block">{user.email}</span>
                    </button>
                  ))}
                </div>
              )}
              {memberSearchTerm.trim() && memberSearchResults.length === 0 && (
                <p className="text-center text-sm text-student-os-light-gray">No users found.</p>
              )}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setMemberSearchTerm('');
                    setMemberSearchResults([]);
                    setSelectedGroupToAddMember(null);
                  }}
                  className="px-5 py-2 rounded-lg border border-student-os-light-gray text-student-os-dark-gray hover:bg-student-os-light-gray transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
