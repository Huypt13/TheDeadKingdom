using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class PlayerProfileHandle : MonoBehaviour
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

    }

    // Update is called once per frame
    //void Update()
    //{

    //}

    #region main screen actions
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
            SceneManager.LoadScene("LobbyScreen");
        }

    }
    #endregion

    #region summary section actions
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
    #endregion

}
