using System.Collections;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using SocketIO;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

public class RsMatchSceneManagement : MonoBehaviour
{
    private SocketIOComponent socketReference;

    [SerializeField]
    private GameObject prefabPlayerEndMatch;

    [SerializeField]
    private GameObject team1Container;

    [SerializeField]
    private Text team1TotalKill;

    [SerializeField]
    private GameObject team2Container;

    [SerializeField]
    private Text team2TotalKill;

    [SerializeField]
    private GameObject winResultImage;

    [SerializeField]
    private GameObject loseResultImage;

    private int playerStar;

    private string playerName;

    [SerializeField]
    private Image imgTankEndgame;

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

    [SerializeField]
    private Text txtCoinReward;

    [SerializeField]
    private Text txtCongratulationRank;

    [SerializeField]
    private Image imageCongratulationRank;

    [SerializeField]
    private GameObject canvasResult;

    [SerializeField]
    private GameObject canvasResultDetail;

    [SerializeField]
    private GameObject canvasCongratulation;

    private bool isWin = false;

    //private Dictionary<string, GameObject> playerDictionary;

    public SocketIOComponent SocketReference
    {
        get
        {
            return socketReference = (socketReference == null) ? FindObjectOfType<NetworkClient>() : socketReference;
        }
    }

    void Start()
    {
        NetworkClient.OnResultMatch = UpdateRs;
        StartCoroutine(GetUserInfor(MenuManager.uri));
    }

    private void UpdateRs(SocketIOEvent e)
    {
        GameObject.Find("Canvas [ GameLobby]").GetComponent<GameUI>().ResetPanel();

        foreach (Transform child in team1Container.transform)
        {
            GameObject.Destroy(child.gameObject);
        }
        foreach (Transform child in team2Container.transform)
        {
            GameObject.Destroy(child.gameObject);
        }


        string rs = e.data["result"].str;
        if (rs == "win")
        {
            winResultImage.SetActive(true);
            isWin = true;
        }
        else
        {
            loseResultImage.SetActive(true);
            isWin = false;
        }

        float kill1 = e.data["kill1"].f;
        float kill2 = e.data["kill2"].f;
        txtCoinReward.text = "x" + e.data["reward"].f;

        team1TotalKill.text = kill1.ToString();
        team2TotalKill.text = kill2.ToString();

        var playersRs = e.data["playerRs"].list;
        playersRs.ForEach(player =>
        {
            var username = player["username"].str;
            var kill = player["kill"].f;
            var dead = player["dead"].f;
            var team = player["team"].f;
            var tankType = player["tankType"].str;
            var tankLevel = player["tankLevel"].f;

            GameObject playerEndMatch = Instantiate(prefabPlayerEndMatch);
            if (team == 1)
            {
                playerEndMatch.transform.parent = team1Container.transform;
            }
            else
            {
                playerEndMatch.transform.parent = team2Container.transform;
            }
            playerEndMatch.transform.localScale = new Vector3(1f, 1f, 1f);
            GameObject imgTankIcon = playerEndMatch.transform.GetChild(0).gameObject;
            imgTankIcon.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(tankType, tankLevel, ImageManager.ImageType.TankEndMatch);
            GameObject txtPlayerName = playerEndMatch.transform.GetChild(3).gameObject;
            txtPlayerName.GetComponent<Text>().text = username;
            GameObject txtKillDead = playerEndMatch.transform.GetChild(4).gameObject;
            txtKillDead.GetComponent<Text>().text = $"{kill} / {dead}";
            if (player["id"].str == NetworkClient.ClientID)
            {
                txtPlayerName.GetComponent<Text>().color = Color.green;
                txtKillDead.GetComponent<Text>().color = Color.green;

                imgTankEndgame.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(tankType, tankLevel, ImageManager.ImageType.TankEndMatch);

            }
        });
    }

    private IEnumerator GetUserInfor(string uri)
    {
        using (UnityWebRequest request = UnityWebRequest.Get(uri + "/user/infor"))
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
                playerStar = jo["data"]["numOfStars"].ToObject<int>();
                playerName = jo["data"]["username"].ToObject<string>();

                //txtPlayerName.text = playerName;

                txtRank.text = ImageManager.Instance.GetRankName(playerStar);
                txtCongratulationRank.text = ImageManager.Instance.GetRankName(playerStar);

                imageRank.sprite = ImageManager.Instance.GetRankImage(playerStar);
                imageCongratulationRank.sprite = ImageManager.Instance.GetRankImage(playerStar);
                if (playerStar <= 100)
                {
                    imageStar.sprite = ImageManager.Instance.GetStarImage(playerStar);
                }
                else
                {
                    imageStar.gameObject.SetActive(false);
                    imageSingleStar.gameObject.SetActive(true);
                    txtMasterStar.text = (playerStar % 100) + "";
                }
            }
        }
    }

    public void DisplayResultDetail()
    {
        canvasResult.SetActive(false);
        if (isWin && playerStar % 5 == 1)
        {
            canvasCongratulation.SetActive(true);
        }
        canvasResultDetail.SetActive(true);
    }

    public void GoToMenu()
    {
        SceneManagement.Instance.LoadLevel(SceneList.LOBBY_SCREEN, (levelName) =>
        {
            SceneManagement.Instance.UnLoadLevel(SceneList.MATCHRS);
        });
    }
}
