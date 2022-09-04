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
using UnityEngine.SceneManagement;

public class MenuManager : MonoBehaviour
{
    //[SerializeField]

    public static string uri = "http://3.1.196.5:8080";
    // public static string uri = "http://localhost:8080";
    // public static string uri = "http://192.168.1.2:8080";
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

    private bool iswaiting = false;
    private SocketIOComponent socketReference;
    public static List<TankRemain> myTankList;

    [SerializeField]
    private InputField inputUsername;

    [SerializeField]
    private InputField inputPassword;

    [SerializeField]
    private Button btnLogin;

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

        if (PlayerPrefs.HasKey("lastUser"))
        {
            inputUsername.text = PlayerPrefs.GetString("lastUser");
        }
    }


    // join game
    public void OnQueue()
    {
        Debug.Log("on queue " + access_token);
        Text text = queueButton.GetComponentInChildren<Text>();
        if (!iswaiting)
        {
            text.text = "Waiting";
            StartCoroutine(GetListTank(uri));

        }
        else
        {
            text.text = "joingame";
            SocketReference.Emit("quitGame");

        }
        iswaiting = !iswaiting;
        // SocketReference.Emit("joinGame");
    }

    private IEnumerator GetListTank(string uri)
    {
        using (UnityWebRequest request = UnityWebRequest.Get(uri + "/tank"))
        {
            request.SetRequestHeader("x-access-token", access_token);
            yield return request.SendWebRequest();

            if (request.isNetworkError)
            {
                Debug.Log("Error: " + request.error);
            }
            else
            {

                var jo = JObject.Parse(request.downloadHandler.text);
                myTankList = jo["data"]["tankList"].ToObject<List<TankRemain>>();
                Debug.Log(myTankList.Count);
                bool canJoin = false;
                myTankList.ForEach((e) =>
                {
                    if (e.remaining > 0)
                    {
                        canJoin = true;
                    }
                });
                if (canJoin)
                {
                    SocketReference.Emit("joinGame");
                }
                else
                {
                    message.gameObject.SetActive(true);
                    message.text = "Not enough tank";
                    Text text = queueButton.GetComponentInChildren<Text>();
                    text.text = "joingame";
                    iswaiting = false;
                }
            }
        }
    }

    bool IsValidEmail(string email)
    {
        var trimmedEmail = email.Trim();

        if (trimmedEmail.EndsWith("."))
        {
            return false; // suggested by @TK-421
        }
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == trimmedEmail;
        }
        catch
        {
            return false;
        }
    }

    public void Login()
    {
        //if (IsValidEmail(inputUsername.text))
        //{
        //    StartCoroutine(LoginRequest(uri));
        //}
        //else
        //{
        //    NotificationManager.Instance.DisplayNotification("Email is not valid", SceneList.MAIN_MENU);
        //}

        StartCoroutine(LoginRequest(uri));
        btnLogin.interactable = false;
    }


    private IEnumerator LoginRequest(string uri)
    {
        var userInfor = new UserInfor();

        userInfor.email = inputUsername.text;
        userInfor.password = inputPassword.text;

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
                if (jo["status"].ToString() == "0")
                {
                    //message.gameObject.SetActive(true);
                    //message.text = jo["message"].ToString();

                    NotificationManager.Instance.DisplayNotification(jo["message"].ToString(), SceneList.MAIN_MENU);

                }
                else
                {
                    access_token = jo["data"]["token"].ToString();
                    myName = jo["data"]["username"].ToString();
                    ClientInfor ci = new ClientInfor();
                    ci.id = access_token;
                    ci.username = myName;
                    NetworkClient.ClientName = myName;
                    SocketReference.Emit("clientJoin", new JSONObject(JsonUtility.ToJson(ci)));

                    PlayerPrefs.SetString("lastUser", inputUsername.text);

                    OnSignInComplete();
                }
            }
        }
        btnLogin.interactable = true;
    }
    public void OnSignInComplete()
    {
        //message.gameObject.SetActive(false);
        //signInContainer.SetActive(false);
        //joinContainer.SetActive(true);
        //queueButton.interactable = true;
        //iswaiting = false;

        // chuyen scene thanh LobbyScreen
        SceneManagement.Instance.LoadLevel(SceneList.LOBBY_SCREEN, (levelName) =>
        {
            SceneManagement.Instance.UnLoadLevel(SceneList.MAIN_MENU);
        });
    }

    //public void CreateAccount()
    //{
    //    StartCoroutine(CreateRequest($"{uri}/user/create"));

    //}


    //private IEnumerator CreateRequest(string uri)
    //{
    //    var userInfor = new UserInfor();
    //    userInfor.username = inputUsername.text;
    //    userInfor.password = inputPassword.text;
    //    using (UnityWebRequest request = UnityWebRequest.Post(uri, new JSONObject(JsonUtility.ToJson(userInfor))))
    //    {
    //        yield return request.SendWebRequest();

    //        if (request.isNetworkError)
    //        {
    //            Debug.Log("Error: " + request.error);
    //        }
    //        else
    //        {
    //            var jo = JObject.Parse(request.downloadHandler.text);

    //            message.gameObject.SetActive(true);
    //            message.text = jo["message"].ToString();
    //        }
    //    }
    //}

}
