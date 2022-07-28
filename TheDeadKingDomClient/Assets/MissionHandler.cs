using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class MissionHandler : MonoBehaviour
{
    public Button btnClose;
    public Button btnChallengeCategory;
    public Button btnDailyCategory;
    public Sprite[] switchBackgrounds; // Element 0 - Selected, Element 1 - UnSelected
    private Button currentCategoryDisplay;

    public GameObject challengeMissionsSection;
    public GameObject dailyMissonsSection;
    public GameObject listChallengeMission;
    public GameObject listDailyMisson;


    // Start is called before the first frame update
    void Start()
    {
        btnClose.onClick.AddListener(BackToLobbyScreen);
        btnChallengeCategory.onClick.AddListener(DisplayChallengeSection);
        btnDailyCategory.onClick.AddListener(DisplayDailySection);
        //btnCollect.onClick.AddListener(CollectCoin);
        foreach (Transform challengeMission in listChallengeMission.transform)
        {
            Button btnCollect = challengeMission.transform.Find("BtnCollect").gameObject.GetComponent<Button>();
            if (btnCollect.interactable)
                btnCollect.onClick.AddListener(CollectCoin);
        }

        foreach (Transform dailyMission in listDailyMisson.transform)
        {
            Button btnCollect = dailyMission.transform.Find("BtnCollect").gameObject.GetComponent<Button>();
            if (btnCollect.interactable)
                btnCollect.onClick.AddListener(CollectCoin);
        }

        currentCategoryDisplay = btnChallengeCategory;

    }

    // Update is called once per frame
    //void Update()
    //{

    //}

    private void BackToLobbyScreen()
    {
        SceneManager.LoadScene("LobbyScreen");
    }

    private void DisplayChallengeSection()
    {
        // if player select other category display then change background color
        bool isOtherCategoryDisplay = currentCategoryDisplay.image.sprite != btnChallengeCategory.image.sprite;
        if (isOtherCategoryDisplay)
        {
            // change currentCategoryDisplay background to unselected 
            currentCategoryDisplay.image.sprite = switchBackgrounds[1];
            // change btnSummaryCategory background to selected
            btnChallengeCategory.image.sprite = switchBackgrounds[0];
            dailyMissonsSection.SetActive(false);
            challengeMissionsSection.SetActive(true);
            // uppdate currentCategoryDisplay
            currentCategoryDisplay = btnChallengeCategory;
        }
    }

    private void DisplayDailySection()
    {
        // if player select other category display then change background color
        bool isOtherCategoryDisplay = currentCategoryDisplay.image.sprite != btnDailyCategory.image.sprite;
        if (isOtherCategoryDisplay)
        {
            // change currentCategoryDisplay background to unselected 
            currentCategoryDisplay.image.sprite = switchBackgrounds[1];
            // change btnSummaryCategory background to selected
            btnDailyCategory.image.sprite = switchBackgrounds[0];
            challengeMissionsSection.SetActive(false);
            dailyMissonsSection.SetActive(true);
            // uppdate currentCategoryDisplay
            currentCategoryDisplay = btnDailyCategory;
        }
    }

    private void CollectCoin()
    {
        Debug.Log("Collect Coin");
    }
}
