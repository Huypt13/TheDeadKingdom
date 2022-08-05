using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ChatBoxInfor : MonoBehaviour
{
    private static bool isTurnChatBox;
    private static bool isTurnChatView;

    public static bool IsTurnChatBox { get => isTurnChatBox; set => isTurnChatBox = value; }
    public static bool IsTurnChatView { get => isTurnChatView; set => isTurnChatView = value; }
}
