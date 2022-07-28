using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class LeaderboardHandler : MonoBehaviour
{
    public Button btnClose;
    public Button btnRankingCategory;
    public Button btnVictoryCategory;
    public Button btnTankCategory;
    public Sprite[] switchBackgrounds; // Element 0 - Selected, Element 1 - UnSelected
    private Button currentCategoryDisplay;

    public GameObject rankingSection;
    public GameObject victorySection;
    public GameObject tankSection;
    private GameObject currentSectionDisplay;
    
    // Start is called before the first frame update
    void Start()
    {
        btnClose.onClick.AddListener(BackToLobbyScreen);
        btnRankingCategory.onClick.AddListener(() => DisplaySection(btnRankingCategory, rankingSection));
        btnVictoryCategory.onClick.AddListener(() => DisplaySection(btnVictoryCategory, victorySection));
        btnTankCategory.onClick.AddListener(() => DisplaySection(btnTankCategory, tankSection));

        currentCategoryDisplay = btnRankingCategory;
        currentSectionDisplay = rankingSection;

    }

    // Update is called once per frame
    //void Update()
    //{

    //}

    private void BackToLobbyScreen()
    {
        SceneManager.LoadScene("LobbyScreen");
    }

    private void DisplaySection(Button btnCategorySelected, GameObject newDisplaySection)
    {
        // if player select other category display then change background color
        bool isOtherCategoryDisplay = currentCategoryDisplay.image.sprite != btnCategorySelected.image.sprite;
        if (isOtherCategoryDisplay)
        {
            // change currentCategoryDisplay background to unselected, btnCategorySelected background to selected
            currentCategoryDisplay.image.sprite = switchBackgrounds[1];
            btnCategorySelected.image.sprite = switchBackgrounds[0];
            
            // hidden old section and display new section
            currentSectionDisplay.SetActive(false);
            newDisplaySection.SetActive(true);

            // uppdate currentCategoryDisplay and currentSectionDisplay
            currentCategoryDisplay = btnCategorySelected;
            currentSectionDisplay = newDisplaySection;
        }
    }

}
