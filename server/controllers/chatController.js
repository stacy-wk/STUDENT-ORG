import admin from 'firebase-admin';

const db = admin.firestore();

const saveMessage = async (roomId, senderId, senderName, messageText) => {
  try {
    console.log(`[ChatController:saveMessage] Saving message to room ${roomId} from ${senderName}`); 
    const messagesCollectionRef = db.collection(`chatRooms/${roomId}/messages`);
    const newMessageRef = await messagesCollectionRef.add({
      senderId,
      senderName,
      messageText,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    const docSnap = await newMessageRef.get();
    const messageData = docSnap.data();
    console.log(`[ChatController:saveMessage] Message saved with ID: ${docSnap.id}`); 
    return {
      id: docSnap.id,
      ...messageData,
    };
  } catch (error) {
    console.error('Error saving message to Firestore:', error.message);
    console.error(error.stack);
    throw new Error('Failed to save message.');
  }
};

const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log(`[ChatController:getMessages] Fetching messages for room: ${roomId}`); 
    if (!roomId) {
      return res.status(400).json({ message: 'Room ID is required.' });
    }

    const messagesCollectionRef = db.collection(`chatRooms/${roomId}/messages`);
    const querySnapshot = await messagesCollectionRef
      .orderBy('timestamp', 'asc')
      .limit(50)
      .get();

    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp ? doc.data().timestamp.toDate().toISOString() : null,
    }));
    console.log(`[ChatController:getMessages] Fetched ${messages.length} messages for room: ${roomId}`); 
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages from Firestore:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to fetch messages.', error: error.message });
  }
};

const getChatRooms = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(`[ChatController:getChatRooms] Fetching chat rooms for userId: ${userId}`); 
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
    }

    const chatRoomsRef = db.collection('chatRooms');
    const q = chatRoomsRef.where('members', 'array-contains', userId);
    const querySnapshot = await q.get();

    const rooms = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(`[ChatController:getChatRooms] Found ${rooms.length} chat rooms for userId: ${userId}`); 
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error fetching chat rooms:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to fetch chat rooms.', error: error.message });
  }
};

const createChatRoom = async (req, res) => {
  try {
    const userId = req.userId;
    const { roomName } = req.body;
    console.log(`[ChatController:createChatRoom] Creating group "${roomName}" for userId: ${userId}`);

    if (!roomName || roomName.trim() === '') {
      return res.status(400).json({ message: 'Room name is required.' });
    }

    const newRoomData = {
      name: roomName.trim(),
      members: [userId],
      type: 'group',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('chatRooms').add(newRoomData);
    const newRoom = { id: docRef.id, ...newRoomData };
    console.log(`[ChatController:createChatRoom] Group created with ID: ${docRef.id}`); 
    res.status(201).json(newRoom);
  } catch (error) {
    console.error('Error creating chat room:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to create chat room.', error: error.message });
  }
};

const createPrivateChat = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { targetUserId } = req.body;
    console.log(`[ChatController:createPrivateChat] Attempting private chat between ${currentUserId} and ${targetUserId}`); 

    if (!targetUserId || currentUserId === targetUserId) {
      return res.status(400).json({ message: 'Invalid target user ID.' });
    }

    const members = [currentUserId, targetUserId].sort();
    const roomId = `private_${members[0]}_${members[1]}`;

    const roomRef = db.collection('chatRooms').doc(roomId);
    const roomSnap = await roomRef.get();

    if (roomSnap.exists) {
      console.log(`[ChatController:createPrivateChat] Private chat room ${roomId} already exists.`); 
      return res.status(200).json({ id: roomSnap.id, ...roomSnap.data() });
    } else {
      console.log(`[ChatController:createPrivateChat] Creating new private chat room: ${roomId}`); 
      const newRoomData = {
        name: `Private Chat`,
        members: members,
        type: 'private',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await roomRef.set(newRoomData);
      res.status(201).json({ id: roomId, ...newRoomData });
    }
  } catch (error) {
    console.error('Error creating/retrieving private chat:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to create/retrieve private chat.', error: error.message });
  }
};

const addMemberToChatRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userIdToAdd } = req.body;
    console.log(`[ChatController:addMemberToChatRoom] Adding ${userIdToAdd} to room ${roomId}`); 

    if (!roomId || !userIdToAdd) {
      return res.status(400).json({ message: 'Room ID and User ID to add are required.' });
    }

    const roomRef = db.collection('chatRooms').doc(roomId);
    const roomSnap = await roomRef.get();

    if (!roomSnap.exists) {
      console.log(`[ChatController:addMemberToChatRoom] Room ${roomId} not found.`); 
      return res.status(404).json({ message: 'Chat room not found.' });
    }

    const roomData = roomSnap.data();
    if (roomData.type !== 'group') {
      console.log(`[ChatController:addMemberToChatRoom] Cannot add members to private chat ${roomId}.`); 
      return res.status(403).json({ message: 'Cannot add members to a private chat.' });
    }

    if (roomData.members.includes(userIdToAdd)) {
      console.log(`[ChatController:addMemberToChatRoom] User ${userIdToAdd} already a member of ${roomId}.`); 
      return res.status(409).json({ message: 'User is already a member of this room.' });
    }

    await roomRef.update({
      members: admin.firestore.FieldValue.arrayUnion(userIdToAdd),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedRoomSnap = await roomRef.get();
    console.log(`[ChatController:addMemberToChatRoom] User ${userIdToAdd} added successfully to ${roomId}.`); 
    res.status(200).json({ id: updatedRoomSnap.id, ...updatedRoomSnap.data() });
  } catch (error) {
    console.error('Error adding member to chat room:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to add member to chat room.', error: error.message });
  }
};

export {
  saveMessage,
  getMessages,
  getChatRooms,
  createChatRoom,
  createPrivateChat,
  addMemberToChatRoom,
};
