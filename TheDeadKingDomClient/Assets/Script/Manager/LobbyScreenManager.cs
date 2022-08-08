using Newtonsoft.Json.Linq;
using SocketIO;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

public class LobbyScreenManager : MonoBehaviour
{
    private bool isFinding = false;

    private SocketIOComponent socketReference;

    public static List<TankRemain> myTankList;

    private float time = 0;

    private bool canJoin = false;

    [SerializeField]
    private Text findMatchText;

    [SerializeField]
    private Dropdown dropdownResolution;

    [SerializeField]
    private Text txtRank;

    [SerializeField]
    private Image imageRank;

    [SerializeField]
    private Image imageStar;


    [SerializeField]
    private Text txtMasterStar;
    [SerializeField]
    private Image imageSingleStar;

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
        StartCoroutine(GetListTank(MenuManager.uri));

        dropdownResolution.onValueChanged.AddListener((option) => { ChangeResolution(option); });

        int star = 21;
        txtRank.text = ImageManager.Instance.GetRankName(star);
        imageRank.sprite = ImageManager.Instance.GetRankImage(star);
        if (star <= 100)
        {
            imageStar.sprite = ImageManager.Instance.GetStarImage(star);
        }
        else
        {
            imageStar.gameObject.SetActive(false);
            imageSingleStar.gameObject.SetActive(true);
            txtMasterStar.text = (star % 100) + "";
        }
    }

    // Update is called once per frame
    void Update()
    {

    }


    public void FindMatch()
    {
        Debug.Log("on queue " + MenuManager.access_token);
        if (!isFinding)
        {
            if (canJoin)
            {
                InvokeRepeating("SetTime", 0f, 1f);
                SocketReference.Emit("joinGame");
                isFinding = true;
            }
            else
            {
                Debug.Log("Not enough tank");
                isFinding = false;
            }
        }
        else
        {
            CancelInvoke("SetTime");
            time = 0;
            findMatchText.text = "FindMatch";
            SocketReference.Emit("quitGame");
            isFinding = false;
        }
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
                canJoin = false;
                myTankList.ForEach((e) =>
                {
                    if (e.remaining > 0)
                    {
                        canJoin = true;
                    }
                });
            }
        }
    }

    public void LoadTanksInventory()
    {
        if (!isFinding)
        {
            SceneManagement.Instance.LoadLevel(SceneList.TANK_INVENTORY, (levelName) =>
            {
            });
        }
    }

    public void LoadLeaderboard()
    {
        if (!isFinding)
        {
            SceneManagement.Instance.LoadLevel(SceneList.LEADERBOARD, (levelName) =>
            {
            });
        }
    }

    public void LoadPlayerProfile()
    {
        if (!isFinding)
        {
            SceneManagement.Instance.LoadLevel(SceneList.PLAYER_PROFILE, (levelName) =>
            {
            });
        }
    }

    public void ChangeResolution(int option)
    {
        int[] width = { 1920, 1366, 1280 };
        int[] height = { 1080, 768, 720 };
        Screen.SetResolution(width[option], height[option], FullScreenMode.Windowed);
    }
}
