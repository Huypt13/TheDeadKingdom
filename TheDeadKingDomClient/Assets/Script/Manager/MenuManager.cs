using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using SocketIO;
using UnityEngine.Networking;
using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using TMPro;

public class MenuManager : MonoBehaviour
{
    [SerializeField]
    private string uri;
    public static string access_token = "";
    public static string myName = "";
    [Header("Join Now")]
    [SerializeField]
    private GameObject joinContainer;

    [SerializeField]
    private Button queueButton;

    [Header("Sign In")]
    [SerializeField]
    private GameObject signInContainer;

    public Text message;

    private string username;
    private string password;
    private SocketIOComponent socketReference;
    public SocketIOComponent SocketReference
    {
        get
        {
            return socketReference = (socketReference == null) ? FindObjectOfType<NetworkClient>() : socketReference;
        }
    }
    void Start()
    {

        queueButton.interactable = false;
        SceneManagement.Instance.LoadLevel(SceneList.ONLINE, (levelName) =>
        {
            queueButton.interactable = true;
        });

    }


    // join game
    public void OnQueue()
    {
        //   Debug.LogError("on queue");
        Debug.Log("Join game");
        Debug.Log(SocketReference);
        SocketReference.Emit("joinGame");
    }


    public void Login()
    {
        StartCoroutine(LoginRequest(uri));
    }


    private IEnumerator LoginRequest(string uri)
    {
        var userInfor = new UserInfor();
        userInfor.username = username;
        userInfor.password = password;
        using (UnityWebRequest request = UnityWebRequest.Post(uri + "/user", new JSONObject(JsonUtility.ToJson(userInfor))))
        {
            yield return request.SendWebRequest();

            if (request.isNetworkError)
            {
                Debug.Log("Error: " + request.error);
            }
            else
            {
                var jo = JObject.Parse(request.downloadHandler.text);
                Debug.Log(jo["status"].ToString());
                if (jo["status"].ToString() == "error")
                {
                    Debug.Log("kaka");
                    message.gameObject.SetActive(true);
                    message.text = jo["message"].ToString();
                }
                else
                {
                    access_token = jo["data"]["id"].ToString();
                    myName = jo["data"]["username"].ToString();
                    ClientInfor ci = new ClientInfor();
                    ci.id = access_token;
                    ci.username = myName;
                    SocketReference.Emit("clientJoin", new JSONObject(JsonUtility.ToJson(ci)));
                    message.gameObject.SetActive(false);
                    signInContainer.SetActive(false);
                    joinContainer.SetActive(true);
                    queueButton.interactable = true;

                }
            }
        }
    }


    public void CreateAccount()
    {
        StartCoroutine(CreateRequest($"{uri}/user/create"));

    }


    private IEnumerator CreateRequest(string uri)
    {
        var userInfor = new UserInfor();
        userInfor.username = username;
        userInfor.password = password;
        using (UnityWebRequest request = UnityWebRequest.Post(uri, new JSONObject(JsonUtility.ToJson(userInfor))))
        {
            yield return request.SendWebRequest();

            if (request.isNetworkError)
            {
                Debug.Log("Error: " + request.error);
            }
            else
            {
                var jo = JObject.Parse(request.downloadHandler.text);

                message.gameObject.SetActive(true);
                message.text = jo["message"].ToString();
            }
        }
    }

    public void EditUsername(string text)
    {
        username = text;
    }

    public void EditPassword(string text)
    {
        password = text;
    }
}
