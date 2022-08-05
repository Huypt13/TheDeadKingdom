using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class TankDetailsHandler : MonoBehaviour
{
    // main screen
    public Button btnBack;
    public Button btnStasCategory;
    public Button btnSkillsCategory;
    public Sprite[] switchBackgrounds; // Element 0 - Selected, Element 1 - UnSelected
    private Button currentCategoryDisplay;

    public GameObject statsSection;
    public GameObject skillsSection;

    public Button btnSelect;

    // Start is called before the first frame update
    void Start()
    {
        // main screen
        btnBack.onClick.AddListener(BackToListTank);
        btnStasCategory.onClick.AddListener(DisplayTankStats);
        btnSkillsCategory.onClick.AddListener(DisplayTankSkills);
        currentCategoryDisplay = btnStasCategory;
        btnSelect.onClick.AddListener(SelectTankAndNavigate);
    }

    // Update is called once per frame
    //void Update()
    //{

    //}

    #region main screen actions
    private void DisplayTankStats()
    {
        // if player select other category display then change background color
        bool isOtherCategoryDisplay = currentCategoryDisplay.image.sprite != btnStasCategory.image.sprite;
        if (isOtherCategoryDisplay)
        {
            // change currentCategoryDisplay background to unselected 
            currentCategoryDisplay.image.sprite = switchBackgrounds[1];
            // change btnSummaryCategory background to selected
            btnStasCategory.image.sprite = switchBackgrounds[0];
            skillsSection.SetActive(false);
            statsSection.SetActive(true);
            // uppdate currentCategoryDisplay
            currentCategoryDisplay = btnStasCategory;
        }
    }

    private void DisplayTankSkills()
    {
        // if player select other category display then change background color
        bool isOtherCategoryDisplay = currentCategoryDisplay.image.sprite != btnSkillsCategory.image.sprite;
        if (isOtherCategoryDisplay)
        {
            // change currentCategoryDisplay background to unselected 
            currentCategoryDisplay.image.sprite = switchBackgrounds[1];
            // change btnSummaryCategory background to selected
            btnSkillsCategory.image.sprite = switchBackgrounds[0];
            statsSection.SetActive(false);
            skillsSection.SetActive(true);
            // uppdate currentCategoryDisplay
            currentCategoryDisplay = btnSkillsCategory;
        }
    }

    private void BackToListTank()
    {
        //SceneManager.LoadScene("ListTank");
        SceneManagement.Instance.UnLoadLevel(SceneList.TANK_DETAIL);
    }

    private void SelectTankAndNavigate()
    {
        Debug.Log("Click Select");
        SceneManager.LoadScene("LobbyScreen");
    }
    #endregion
}
