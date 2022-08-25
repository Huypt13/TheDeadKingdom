using Newtonsoft.Json.Linq;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class PlayerProfileManager : MonoBehaviour
{
    // main screen
    public Button btnClose;
    public Button btnSummaryCategory;
    public Button btnBattleLogCategory;
    public Sprite[] switchBackgrounds; // Element 0 - Selected, Element 1 - UnSelected
    private Button currentCategoryDisplay;
    public GameObject summarySection;
    public GameObject battleLogSection;

    // summary section
    public Button btnEditName;
    public Button btnCopyID;
    public GameObject popupChangePlayerName;

    // popup change player name
    public Button btnClosePopup;
    public Button btnApplyChange;
    public InputField inputNewName;

    public static List<MatchHistory> matchHistories;

    [SerializeField]
    private GameObject prefabMatchHistoryUI;

    [SerializeField]
    private GameObject matchHistoryContainer;

    [SerializeField]
    private Sprite imageWin;

    [SerializeField]
    private Sprite imageLose;

    [SerializeField]
    private Text txtCountBattle;

    [SerializeField]
    private Text txtCountWin;

    [SerializeField]
    private Text txtWinRate;

    [SerializeField]
    private Text txtCountTank;

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
    private Text txtPlayerName;

    // battlelog section

    //public Button btnClose;

    // Start is called before the first frame update
    void Start()
    {
        // main screen
        btnClose.onClick.AddListener(BackToLobbyScreen);
        btnSummaryCategory.onClick.AddListener(DisplaySummaryFilter);
        btnBattleLogCategory.onClick.AddListener(DisplayBattleLogFilter);
        currentCategoryDisplay = btnSummaryCategory;

        // summary section
        btnEditName.onClick.AddListener(OpenEditNamePopup);
        btnCopyID.onClick.AddListener(CopyPlayerID);

        // popup change player name
        btnClosePopup.onClick.AddListener(CloseEditNamePopup);
        btnApplyChange.onClick.AddListener(ApplyNewName);

        StartCoroutine(GetMatchHistory(MenuManager.uri));

        StartCoroutine(GetMatchSummary(MenuManager.uri));

        int star = LobbyScreenManager.playerStar;
        txtPlayerName.text = LobbyScreenManager.playerName;
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
    //void Update()
    //{

    //}


    private IEnumerator GetMatchHistory(string uri)
    {
        using (UnityWebRequest request = UnityWebRequest.Get(uri + "/history"))
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
                matchHistories = jo["data"].ToObject<List<MatchHistory>>();
                Debug.Log(matchHistories.Count);

                DisplayMatchHistory();
            }
        }
    }

    private IEnumerator GetMatchSummary(string uri)
    {
        using (UnityWebRequest request = UnityWebRequest.Get(uri + "/history/summary"))
        {
            request.SetRequestHeader("x-access-token", MenuManager.access_token);
            yield return request.SendWebRequest();

            if (request.isNetworkError)
            {
                Debug.Log("Error: " + request.error);
            }
            else
            {
                try
                {
                    txtCountTank.text = LobbyScreenManager.myTankList.Count + "";
                    var jo = JObject.Parse(request.downloadHandler.text);
                    int win = jo["data"]["win"].ToObject<int>();
                    int lose = jo["data"]["lose"].ToObject<int>();
                    float winRate = jo["data"]["winRate"].ToObject<float>();
                    txtCountBattle.text = (win + lose) + "";
                    txtCountWin.text = win + "";
                    txtWinRate.text = Math.Round(winRate * 100, 1) + "%";
                }
                catch
                {
                    Debug.Log("Chua co lich su dau");
                }

            }
        }
    }

    private void DisplayMatchHistory()
    {
        foreach (Transform child in matchHistoryContainer.transform)
        {
            GameObject.Destroy(child.gameObject);
        }

        matchHistories.ForEach(matchData =>
        {
            GameObject matchHistoryGameObject = Instantiate(prefabMatchHistoryUI);
            matchHistoryGameObject.transform.parent = matchHistoryContainer.transform;
            matchHistoryGameObject.transform.localScale = new Vector3(1f, 1f, 1f);

            Member myself = new Member();

            matchData.members.ForEach(mem =>
            {
                if (mem.isMe) myself = mem;
            });

            GameObject imgTankIcon = matchHistoryGameObject.transform.GetChild(0).gameObject;
            imgTankIcon.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(myself.tank.typeId, myself.tank.level, ImageManager.ImageType.TankEndMatch);

            GameObject imageResult = matchHistoryGameObject.transform.GetChild(1).gameObject;
            imageResult.GetComponent<Image>().sprite = myself.isWin ? imageWin : imageLose;

            GameObject txtTankName = matchHistoryGameObject.transform.GetChild(4).gameObject;
            txtTankName.GetComponent<Text>().text = myself.tank.name + "";

            GameObject txtMatchType = matchHistoryGameObject.transform.GetChild(5).gameObject;
            txtMatchType.GetComponent<Text>().text = matchData.gameMode;

            GameObject txtTime = matchHistoryGameObject.transform.GetChild(6).gameObject;
            txtTime.GetComponent<Text>().text = matchData.time + "";

            GameObject txtKill = matchHistoryGameObject.transform.GetChild(7).gameObject;
            txtKill.GetComponent<Text>().text = myself.kill + "";

            GameObject txtDead = matchHistoryGameObject.transform.GetChild(8).gameObject;
            txtDead.GetComponent<Text>().text = myself.dead + "";

            //matchHistoryGameObject.GetComponent<Button>().onClick.AddListener(() =>
            //{
            //    tankDetail = matchData;
            //    SceneManagement.Instance.LoadLevel(SceneList.TANK_DETAIL, (levelName) =>
            //    {
            //        //SceneManagement.Instance.UnLoadLevel(SceneList.LOBBY_SCREEN);
            //    });
            //});


        });


    }

    private void DisplaySummaryFilter()
    {
        if (!popupChangePlayerName.activeSelf)
        {
            // if player select other category display then change background color
            bool isOtherCategoryDisplay = currentCategoryDisplay.image.sprite != btnSummaryCategory.image.sprite;
            if (isOtherCategoryDisplay)
            {
                // change currentCategoryDisplay background to unselected 
                currentCategoryDisplay.image.sprite = switchBackgrounds[1];
                // change btnSummaryCategory background to selected
                btnSummaryCategory.image.sprite = switchBackgrounds[0];
                battleLogSection.SetActive(false);
                summarySection.SetActive(true);
                // uppdate currentCategoryDisplay
                currentCategoryDisplay = btnSummaryCategory;
            }
        }
    }

    private void DisplayBattleLogFilter()
    {
        if (!popupChangePlayerName.activeSelf)
        {
            // if player select other category display then change background color
            bool isOtherCategoryDisplay = currentCategoryDisplay.image.sprite != btnBattleLogCategory.image.sprite;
            if (isOtherCategoryDisplay)
            {
                // change currentCategoryDisplay background to unselected 
                currentCategoryDisplay.image.sprite = switchBackgrounds[1];
                // change btnBattleLogCategory background to selected
                btnBattleLogCategory.image.sprite = switchBackgrounds[0];
                battleLogSection.SetActive(true);
                summarySection.SetActive(false);
                // uppdate currentCategoryDisplay
                currentCategoryDisplay = btnBattleLogCategory;
            }
        }
    }

    private void BackToLobbyScreen()
    {
        if (!popupChangePlayerName.activeSelf)
        {
            SceneManagement.Instance.UnLoadLevel(SceneList.PLAYER_PROFILE);
        }

    }


    private void OpenEditNamePopup()
    {
        if (!popupChangePlayerName.activeSelf)
        {
            popupChangePlayerName.SetActive(true);
        }
    }

    private void CloseEditNamePopup()
    {
        popupChangePlayerName.SetActive(false);
    }

    private void ApplyNewName()
    {
        CloseEditNamePopup();
        Debug.Log("Click ApplyNewName: " + inputNewName.text);
        inputNewName.text = "";
    }

    private void CopyPlayerID()
    {
        if (!popupChangePlayerName.activeSelf)
        {
            // TODO: copy playerID and save to clipboard
            Debug.Log("Click CopyID");
        }
    }

}
