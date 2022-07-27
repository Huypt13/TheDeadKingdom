using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class ListTankHandler : MonoBehaviour
{
    // main screen
    public Button btnFilterAllTank;
    public Button btnSortLevel;
    public Button btnSortRemaining;
    public Sprite[] switchBackgrounds; // Element 0 - Selected, Element 1 - UnSelected
    public Button btnClose;
    [SerializeField]
    private GameObject listTanks;

    // Start is called before the first frame update
    void Start()
    {
        // main screen
        btnFilterAllTank.onClick.AddListener(FilterAllTank);
        btnSortLevel.onClick.AddListener(() => SortByField(btnSortLevel));
        btnSortRemaining.onClick.AddListener(() => SortByField(btnSortRemaining));
        btnClose.onClick.AddListener(BackToLobbyScreen);
        foreach (Transform child in listTanks.transform)
            child.gameObject.GetComponent<Button>().onClick.AddListener(GoToTankDetailsScene);
        //Debug.Log(listTanks.transform.childCount);
    }

    #region main screen actions
    private void FilterAllTank()
    {
        bool isFilterAllTank = btnFilterAllTank.image.sprite == switchBackgrounds[0];
        btnFilterAllTank.image.sprite = isFilterAllTank ? switchBackgrounds[1] : switchBackgrounds[0];
        DisplayNewListTank();
    }

    // Type 1: Descending - when icon sort hidden 
    // Type 2: Ascending - when icon sort visible and don't flip y
    // Type 0: Unsort - when icon sort visible and flip y
    private int GetNewSortingType(GameObject iconSortByObject, SpriteRenderer iconSortBy)
    {
        return iconSortByObject.activeSelf ? (!iconSortBy.flipY ? 2 : 0) : 1;
    }

    // Type 1: Descending - when icon sort visible and don't flip y
    // Type 2: Ascending - when icon sort visible and flip y
    // Type 0: Unsort - when icon sort hidden
    private int GetCurrentSortingType(Button btnSort)
    {
        GameObject iconSortByObject = btnSort.transform.Find("IconSortBy").gameObject;
        SpriteRenderer iconSortBy = iconSortByObject.GetComponent<SpriteRenderer>();

        return iconSortByObject.activeSelf ? (!iconSortBy.flipY ? 1 : 2) : 0;
    }

    // update background button and icon sort with each sort type
    // Type 1: 1st player click sort by level then order data descending 
    // Type 2: 2nd player click sort by level then order data ascending
    // Type 0: 3th player click sort by level then unselected sort by level
    private void ChangeSortButtonType(Button btnSort, GameObject iconSortByObject, SpriteRenderer iconSortBy, int newSortingType)
    {
        if (newSortingType == 1)
        {
            iconSortByObject.SetActive(true);
            btnSort.image.sprite = switchBackgrounds[0];
        }
        else if (newSortingType == 2)
            iconSortBy.flipY = true;
        else if (newSortingType == 0)
        {
            iconSortByObject.SetActive(false);
            iconSortBy.flipY = false;
            btnSort.image.sprite = switchBackgrounds[1];
        }
    }

    // change button styles and update new data
    private void SortByField(Button btnSort)
    {
        GameObject iconSortByObject = btnSort.transform.Find("IconSortBy").gameObject;
        SpriteRenderer iconSortBy = iconSortByObject.GetComponent<SpriteRenderer>();

        int newSortingType = GetNewSortingType(iconSortByObject, iconSortBy);
        ChangeSortButtonType(btnSort, iconSortByObject, iconSortBy, newSortingType);
        DisplayNewListTank();
    }

    private void DisplayNewListTank()
    {
        bool isFilterAllTank = btnFilterAllTank.image.sprite == switchBackgrounds[0];
        int sortByLevelType = GetCurrentSortingType(btnSortLevel);
        int sortByRemainingType = GetCurrentSortingType(btnSortRemaining);

        Debug.Log("Display Tank by: isFilterAllTank - " + isFilterAllTank);
        Debug.Log("Display Tank by: sortByLevelType - " + sortByLevelType);
        Debug.Log("Display Tank by: sortByRemainingType - " + sortByRemainingType);
        // TODO: filter data and display

    }

    private void BackToLobbyScreen()
    {
        SceneManager.LoadScene("LobbyScreen");
    }
    
    private void GoToTankDetailsScene()
    {
        SceneManager.LoadScene("TankDetails");
    }
    #endregion
}
