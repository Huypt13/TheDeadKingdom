using SocketIO;
using System;
using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class ChatBoxInGameManager : MonoBehaviour
{
    public Button btnSendMessage;
    public GameObject chatPanel, textObject;
    public TMP_InputField inputChatBox;
    public Transform chatBox;
    public Transform sendTo;
    public Color playerMessage, info;
    private SocketIOComponent socketReference;
    private int maxMessages = 4;
    private float count;
    private bool toTeam = true;
    private bool canSent = true;
    private float timeChat = 2;
    private float timeWait = 0;

    [SerializeField]
    private List<ChatMessage> messageList = new List<ChatMessage>();

    // Start is called before the first frame update
    void Start()
    {
        Debug.Log("start2");
        NetworkClient.OnStartChat = ChangeOnChat;

        btnSendMessage.onClick.AddListener(ChangeRecevied);
    }
    public SocketIOComponent SocketReference
    {
        get
        {
            return socketReference = (socketReference == null) ? FindObjectOfType<NetworkClient>() : socketReference;
        }
    }
    // Update is called once per frame
    void Update()
    {
        // box chat
        if (!canSent)
        {
            timeWait += Time.deltaTime;
            if (timeWait >= timeChat)
            {
                canSent = true;
            }
        }

        inputChatBox.ActivateInputField();
        if (inputChatBox.text != "")
        {
            if (Input.GetKeyDown(KeyCode.Return))
            {
                SendPlayerMessage();
            }
        }
        else if (!inputChatBox.isFocused && Input.GetKeyDown(KeyCode.Return))
        {
            inputChatBox.ActivateInputField();
        }
    }
    private void ChangeOnChat(SocketIOEvent e)
    {
        ResetChatBox();
        NetworkClient.OnChat = ReceivedMessage;

    }
    private void ChangeRecevied()
    {
        if (sendTo.GetComponent<TextMeshProUGUI>().text == "Team")
        {
            sendTo.GetComponent<TextMeshProUGUI>().text = "All";
            toTeam = false;
        }
        else
        {
            sendTo.GetComponent<TextMeshProUGUI>().text = "Team";
            toTeam = true;
        }
    }
    private void SendPlayerMessage()
    {
        string text = NetworkClient.ClientName.ToString() + ": " + inputChatBox.text;
        if (!toTeam) text = "[All] " + text;
        if (canSent)
        {
            SendMessageToChat(text);
            canSent = false;
            timeWait = 0;
        }
        else
        {
            if (messageList.Count >= maxMessages)
            {
                Destroy(messageList[0].textObject.gameObject);
                messageList.Remove(messageList[0]);
            }
            ChatMessage newMessage = new ChatMessage();
            newMessage.text = $"Wait {timeChat - Math.Ceiling(timeWait)}s";
            GameObject newText = Instantiate(textObject, chatPanel.transform);
            newMessage.textObject = newText.GetComponent<TextMeshProUGUI>();
            newMessage.textObject.text = newMessage.text;
            newMessage.textObject.color = Color.red;
            messageList.Add(newMessage);
        }
        inputChatBox.text = "";
    }
    private void ReceivedMessage(SocketIOEvent e)
    {
        ChatMessage.messageType messageType;
        if (messageList.Count >= maxMessages)
        {
            Destroy(messageList[0].textObject.gameObject);
            messageList.Remove(messageList[0]);
        }
        chatBox.gameObject.SetActive(true);
        chatBox.Find("ScrollView").transform.gameObject
                .SetActive(true);
        count = Time.time;
        ChatBoxInfor.IsTurnChatView = false;
        StartCoroutine(DoEvent());
        ChatMessage newMessage = new ChatMessage();
        string text = e.data["text"].str;
        string id = e.data["id"].str;
        if (NetworkClient.ClientID == id)
        {
            messageType = ChatMessage.messageType.playerMessage;
        }
        else
        {
            messageType = ChatMessage.messageType.info;
        }
        newMessage.text = text;
        GameObject newText = Instantiate(textObject, chatPanel.transform);
        newMessage.textObject = newText.GetComponent<TextMeshProUGUI>();
        newMessage.textObject.text = newMessage.text;
        newMessage.textObject.color = MesssageTypeColor(messageType);
        messageList.Add(newMessage);
    }
    public IEnumerator DoEvent()
    {
        yield return new WaitUntil(() => Mathf.Floor(Time.time - count) > 3);
        if (!ChatBoxInfor.IsTurnChatBox)
            ChatBoxInfor.IsTurnChatView = true;

    }
    private void SendMessageToChat(string text)
    {
        if (messageList.Count >= maxMessages)
        {
            Destroy(messageList[0].textObject.gameObject);
            messageList.Remove(messageList[0]);
        }
        ChatMessage newMessage = new ChatMessage();
        newMessage.text = text;
        SocketReference.Emit("sendMessage", new JSONObject(JsonUtility.ToJson(new MessageData()
        {
            text = text,
            toTeam = toTeam,
        })));
    }

    private Color MesssageTypeColor(ChatMessage.messageType messageType)
    {
        Color color = playerMessage;
        switch (messageType)
        {
            case ChatMessage.messageType.playerMessage:
                color = new Color(playerMessage.r, playerMessage.g, playerMessage.b);
                break;
            case ChatMessage.messageType.info:
                color = new Color(info.r, info.g, info.b);
                break;
        }
        return color;
    }
    private void ClearListMessage()
    {
        Debug.Log("clear");
        messageList.ForEach((message) =>
        {
            DestroyImmediate(message.textObject);
        });
        messageList.Clear();
    }
    public void ResetChatBox()
    {
        chatBox.Find("Input").transform.gameObject
          .SetActive(false);
        chatBox.Find("ScrollView").transform.gameObject
          .SetActive(false);
        chatBox.Find("Input").transform.gameObject
                .SetActive(false);
        ChatBoxInfor.IsTurnChatBox = false;
        inputChatBox.text = "";
        ClearListMessage();
    }

}


