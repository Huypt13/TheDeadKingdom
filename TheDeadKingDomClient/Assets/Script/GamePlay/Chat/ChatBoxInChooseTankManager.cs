using SocketIO;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class ChatBoxInChooseTankManager : MonoBehaviour
{
    public Button btnSendMessage;
    [SerializeField]
    private Text txtCountTime;
    private float timeRemaining;

    public GameObject chatPanel, textObject;
    public InputField chatBox;
    public Color playerMessage, info;
    private SocketIOComponent socketReference;
    private int maxMessages = 4;
    private bool toTeam = true;

    [SerializeField]
    private List<Message> messageList = new List<Message>();

    // Start is called before the first frame update
    void Start()
    {
        Debug.Log("start1");
        NetworkClient.OnChat = ReceivedMessage;
        btnSendMessage.onClick.AddListener(SendPlayerMessage);
        timeRemaining = float.Parse(txtCountTime.text);
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

        if (chatBox.text != "")
        {
            if (Input.GetKeyDown(KeyCode.Return))
            {
                SendPlayerMessage();
            }
        } else if (!chatBox.isFocused && Input.GetKeyDown(KeyCode.Return))
        {
            chatBox.ActivateInputField();
        }
    }

    private void SendPlayerMessage()
    {
        SendMessageToChat(NetworkClient.ClientName + ": " + chatBox.text);
        chatBox.text = "";
    }
    private void ReceivedMessage(SocketIOEvent e)
    {
        Message.messageType messageType;
        if (messageList.Count >= maxMessages)
        {
            Destroy(messageList[0].textObject.gameObject);
            messageList.Remove(messageList[0]);
        }
        Message newMessage = new Message();
        string text = e.data["text"].str;
        string id = e.data["id"].str;
        if (NetworkClient.ClientID == id)
        {
            messageType = Message.messageType.playerMessage;
        }
        else
        {
            messageType = Message.messageType.info;
        }
        newMessage.text = text;

        GameObject newText = Instantiate(textObject, chatPanel.transform);
        newMessage.textObject = newText.GetComponent<Text>();
        newMessage.textObject.text = newMessage.text;
        newMessage.textObject.color = MesssageTypeColor(messageType);
        messageList.Add(newMessage);
    }
    private void SendMessageToChat(string text)
    {
        if (messageList.Count >= maxMessages)
        {
            Destroy(messageList[0].textObject.gameObject);
            messageList.Remove(messageList[0]);
        }
        Message newMessage = new Message();
        newMessage.text = text;
        SocketReference.Emit("sendMessage", new JSONObject(JsonUtility.ToJson(new MessageData()
        {
            text = text,
            toTeam = toTeam,
        })));
    }

    private Color MesssageTypeColor(Message.messageType messageType)
    {
        Color color = playerMessage;
        switch (messageType)
        {
            case Message.messageType.playerMessage:
                color = new Color(playerMessage.r, playerMessage.g, playerMessage.b);
                break;
            case Message.messageType.info:
                color = new Color(info.r, info.g, info.b);
                break;
        }
        return color;
    }

}

[System.Serializable]
public class Message
{
    public string text;
    public Text textObject;
    public enum messageType
    {
        playerMessage,
        info
    }
}
