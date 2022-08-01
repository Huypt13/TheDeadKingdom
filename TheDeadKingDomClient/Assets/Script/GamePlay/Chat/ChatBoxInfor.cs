using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ChatBoxInfor : MonoBehaviour
{
    private static bool isTurnChatBox;
    private static bool isTurnChatView;
    private static List<ChatMessage> messageList;

    public static bool IsTurnChatBox { get => isTurnChatBox; set => isTurnChatBox = value; }
    public static bool IsTurnChatView { get => isTurnChatView; set => isTurnChatView = value; }
    public static List<ChatMessage> MessageList { get => messageList; set => messageList = value; }
}
