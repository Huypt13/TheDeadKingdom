using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class LobbyScreenHandler : MonoBehaviour
{
    // main scence
    public Button btnAvatarFrame;
    public Button btnCurrentRank;
    public Button btnSetting;
    public Button btnTanks;
    public Button btnAchievements;
    public Button btnRanking;
    public Button btnFindMatch;
    private float timer = 0.0f;
    private bool isFinding = false;

    // setting popup
    public GameObject settingPopup;
    public Button btnCloseSetting;
    public Dropdown drResolutions;
    public Button btnLowGraphic;
    public Button btnMediumGraphic;
    public Button btnHighGraphic;
    public Button btnSoundOn;
    public Button btnSoundOff;
    public SpriteRenderer spBgSoundSelected;
    public Button btnLogout;
    public Button btnExitGame;
    public Sprite[] switchGraphicSprites; // Element 0 - Selected, Element 1 - UnSelected
    private Button currrentGraphic;
    private bool isCurrentSoundOn;
    
    // exit popup
    public GameObject exitPopup;
    public Button btnCloseExitPopup;
    public Button btnConfirmExit;
    public Button btnCancelExit;

    // Start is called before the first frame update
    void Start()
    {
        // main scence
        btnAvatarFrame.onClick.AddListener(() => MoveToScene("PlayerProfile"));
        btnCurrentRank.onClick.AddListener(() => MoveToScene("RankingReward"));
        btnSetting.onClick.AddListener(OpenSettingPopup);
        btnTanks.onClick.AddListener(() => MoveToScene("ListTank"));
        btnAchievements.onClick.AddListener(() => MoveToScene("Missions"));
        btnRanking.onClick.AddListener(() => MoveToScene("Leaderboard"));
        btnFindMatch.onClick.AddListener(FindMatch);

        // setting popup
        btnCloseSetting.onClick.AddListener(CloseSettingPopup);
        btnLogout.onClick.AddListener(LogoutAccount);
        btnExitGame.onClick.AddListener(OpenExitPopup);
        btnLowGraphic.onClick.AddListener(() => ChangeGraphic(btnLowGraphic));
        btnMediumGraphic.onClick.AddListener(() => ChangeGraphic(btnMediumGraphic));
        btnHighGraphic.onClick.AddListener(() => ChangeGraphic(btnHighGraphic));
        btnSoundOn.onClick.AddListener(() => ToggleSoundOn(true));
        btnSoundOff.onClick.AddListener(() => ToggleSoundOn(false));
        // TODO: maybe need get defaut setting of player
        currrentGraphic = btnHighGraphic;
        // TODO: maybe need get defaut setting of player
        isCurrentSoundOn = btnSoundOn;

        // exit popup
        btnCloseExitPopup.onClick.AddListener(CloseExitPopup);
        btnConfirmExit.onClick.AddListener(ExitGame);
        btnCancelExit.onClick.AddListener(CancelExitGame);

        string playMode = PlayerPrefs.GetString("PlayMode");
        if (playMode == "NEW_BATTLE")
            FindMatch();
        else if (playMode == "PLAY_AGAIN")
            FindMatch();
        else
            PlayerPrefs.SetString("PlayMode", "NOTHING");
    }

    // Update is called once per frame
    void Update()
    {
        if (isFinding)
        {
            timer += Time.deltaTime;
            DisplayFindingTime();
        }
    }

    #region main scence actions
    private void OpenSettingPopup()
    {
        if (!settingPopup.activeSelf && !isFinding)
        {
            settingPopup.SetActive(true);
        }
    }  
    
    private void MoveToScene(string sceneName)
    {
        if (!settingPopup.activeSelf && !isFinding)
        {
            SceneManager.LoadScene(sceneName);
        }
    }

    private void FindMatch()
    {
        // TODO: update time per second and find match
        //btnFindMatch.GetComponentInChildren<Text>().text = "FINDING 0:30";
        isFinding = !isFinding;
        if (isFinding)
        {
            // after 5 seconds move to ChooseTank Scene
            StartCoroutine(DelayAction(5f));
        } 
        else
        {
            timer = 0.0f;
            btnFindMatch.GetComponentInChildren<Text>().text = "FIND MATCH";
            PlayerPrefs.SetString("PlayMode", "NOTHING");
        }
    }

    private void DisplayFindingTime()
    {
        int minutes = Mathf.FloorToInt(timer / 60.0f);
        int seconds = Mathf.FloorToInt(timer - minutes * 60);
        btnFindMatch.GetComponentInChildren<Text>().text = string.Format("FINDING {0:0}:{1:00}", minutes, seconds);
    }

    IEnumerator DelayAction(float delayTime)
    {
        //Wait for the specified delay time before continuing.
        yield return new WaitForSeconds(delayTime);

        //Do the action after the delay time has finished.
        // TODO: Call Api to get team player info
        if (isFinding)
            SceneManager.LoadScene("ChooseTank");
        PlayerPrefs.SetString("PlayMode", "NOTHING");
    }

    #endregion

    #region setting popup actions
    private void CloseSettingPopup()
    {
        settingPopup.SetActive(false);
    }

    private void LogoutAccount()
    {
        // TODO: 
        Debug.Log("Click Logout");
    }

    private void OpenExitPopup()
    {
        CloseSettingPopup();
        exitPopup.SetActive(true);
    }

    private void ChangeGraphic(Button btnGraphicSelected)
    {
        // if player select other graphic options then change background color
        bool isOtherGraphicOption = btnGraphicSelected.image.sprite != currrentGraphic.image.sprite;
        if (isOtherGraphicOption)
        {
            // change currrentGraphic background to unselected 
            currrentGraphic.image.sprite = switchGraphicSprites[1];
            // change btnGraphicSelected background to selected
            btnGraphicSelected.image.sprite = switchGraphicSprites[0];
            // TODO: change graphics settings

            // uppdate currrentGraphic
            currrentGraphic = btnGraphicSelected;
        }
    }

    private void ToggleSoundOn(bool isSelectSoundON)
    {
        // if player select other option then move bgSoundSelected
        bool isOtherSoundOption = isSelectSoundON != isCurrentSoundOn;
        if (isOtherSoundOption)
        {
            Button newBgSoundSelected = isCurrentSoundOn ? btnSoundOff : btnSoundOn;
            // move spBgSoundSelected to new position
            spBgSoundSelected.transform.position = Vector2.Lerp(spBgSoundSelected.transform.position, newBgSoundSelected.transform.position,  1);
            // TODO: change sound settings

            // uppdate isCurrentSoundOn
            isCurrentSoundOn = !isCurrentSoundOn;
        }

    }

    #endregion

    #region exit popup actions
    private void CloseExitPopup()
    {
        // TODO: 
        //OpenSettingPopup();
        exitPopup.SetActive(false);
    }


    private void ExitGame()
    {
        // TODO: 
        Debug.Log("Click ExitGame");
    }

    private void CancelExitGame()
    {
        // TODO: 
        Debug.Log("Click CancelExitGame");
    }
    #endregion
}
