using Newtonsoft.Json.Linq;
using SocketIO;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

public class LobbyScreenManager : MonoBehaviour
{
    private bool iswaiting = false;

    private SocketIOComponent socketReference;

    public static List<TankRemain> myTankList;

    private float time = 0;

    [SerializeField]
    private Text findMatchText;

    public SocketIOComponent SocketReference
    {
        get
        {
            return socketReference = (socketReference == null) ? FindObjectOfType<NetworkClient>() : socketReference;
        }
    }
    // Start is called before the first frame update
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {

    }


    public void FindMatch()
    {
        Debug.Log("on queue " + MenuManager.access_token);
        if (!iswaiting)
        {
            InvokeRepeating("SetTime", 0f, 1f);
            StartCoroutine(GetListTank("http://localhost:8080"));

        }
        else
        {
            CancelInvoke("SetTime");
            time = 0;
            findMatchText.text = "FindMatch";
            SocketReference.Emit("quitGame");

        }
        iswaiting = !iswaiting;
        // SocketReference.Emit("joinGame");
    }

    void SetTime()
    {
        int minutes = Mathf.FloorToInt(time / 60.0f);
        int seconds = Mathf.FloorToInt(time - minutes * 60);
        findMatchText.text = string.Format("FINDING {0:0}:{1:00}", minutes, seconds);
        time++;
    }

    private IEnumerator GetListTank(string uri)
    {
        using (UnityWebRequest request = UnityWebRequest.Get(uri + "/tank"))
        {
            request.SetRequestHeader("x-access-token", MenuManager.access_token);
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
                    //message.gameObject.SetActive(true);
                    //message.text = "Not enough tank";
                    //Text text = queueButton.GetComponentInChildren<Text>();
                    //text.text = "joingame";

                    Debug.Log("Not enough tank");

                    iswaiting = false;
                }
            }
        }
    }
}
