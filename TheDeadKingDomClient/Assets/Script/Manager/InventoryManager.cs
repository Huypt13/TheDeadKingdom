using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.UI;

public class InventoryManager : MonoBehaviour
{
    [SerializeField]
    private GameObject prefabTankInventory;

    [SerializeField]
    private GameObject tankInventoryContainer;

    [SerializeField]
    private Text countTankOwned;

    public static TankRemain tankDetail;

    private int sortType = 0;

    [SerializeField]
    private Sprite bgSelected;

    [SerializeField]
    private Sprite bgUnselected;

    public Button btnFilterAllTank;
    public Button btnSortLevel;
    public Button btnSortRemaining;

    // Start is called before the first frame update
    void Start()
    {
        ClearContainer();
        DisplayTanks(LobbyScreenManager.myTankList);

        countTankOwned.text = "OWNED: " + (LobbyScreenManager.myTankList).Count;

        btnFilterAllTank.onClick.AddListener(() => DisplayAllTanks());
        btnSortLevel.onClick.AddListener(() => SortByLevel());
        btnSortRemaining.onClick.AddListener(() => SortByRemaining());
    }

    public void SortByRemaining()
    {
        ClearContainer();

        List<TankRemain> tr = new List<TankRemain>(LobbyScreenManager.myTankList);
        if (sortType == 1)
        {
            sortType = 2;
            tr.Sort((x, y) => x.remaining.CompareTo(y.remaining));
            DisplayTanks(tr);
        }
        else
        {
            sortType = 1;
            tr.Sort((x, y) => -(x.remaining.CompareTo(y.remaining)));
            DisplayTanks(tr);
        }
        ChangeUI();
    }

    public void SortByLevel()
    {
        ClearContainer();

        List<TankRemain> tr = new List<TankRemain>(LobbyScreenManager.myTankList);
        if (sortType == 3)
        {
            sortType = 4;
            tr.Sort((x, y) => x.tank.level.CompareTo(y.tank.level));
            DisplayTanks(tr);
        }
        else
        {
            sortType = 3;
            tr.Sort((x, y) => -(x.tank.level.CompareTo(y.tank.level)));
            DisplayTanks(tr);
        }
        ChangeUI();
    }
    public void DisplayAllTanks()
    {
        ClearContainer();

        sortType = 0;
        ChangeUI();
        DisplayTanks(LobbyScreenManager.myTankList);
    }

    private void ClearContainer()
    {
        foreach (Transform child in tankInventoryContainer.transform)
        {
            GameObject.Destroy(child.gameObject);
        }
    }

    private void ChangeUI()
    {
        GameObject iconSortRemaining = btnSortRemaining.transform.Find("IconSortBy").gameObject;
        iconSortRemaining.SetActive(true);
        RectTransform sortRemainingTransform = iconSortRemaining.GetComponent<RectTransform>();

        GameObject iconSortLevel = btnSortLevel.transform.Find("IconSortBy").gameObject;
        iconSortLevel.SetActive(true);
        RectTransform sortLevelTransform = iconSortLevel.GetComponent<RectTransform>();

        btnFilterAllTank.image.sprite = bgSelected;
        btnSortRemaining.image.sprite = bgSelected;
        btnSortLevel.image.sprite = bgSelected;

        if (sortType == 1)
        {
            sortRemainingTransform.rotation = Quaternion.Euler(0f, 0f, 0f);
        }
        else if (sortType == 2)
        {
            sortRemainingTransform.rotation = Quaternion.Euler(0f, 0f, 180f);
        }
        else
        {
            iconSortRemaining.SetActive(false);
            btnSortRemaining.image.sprite = bgUnselected;
        }

        if (sortType == 3)
        {
            sortLevelTransform.rotation = Quaternion.Euler(0f, 0f, 0f);
        }
        else if (sortType == 4)
        {
            sortLevelTransform.rotation = Quaternion.Euler(0f, 0f, 180f);
        }
        else
        {
            iconSortLevel.SetActive(false);
            btnSortLevel.image.sprite = bgUnselected;
        }

        if (sortType != 0)
        {
            btnFilterAllTank.image.sprite = bgUnselected;
        }
    }


    private void DisplayTanks(List<TankRemain> tankList)
    {
        tankList.ForEach(e =>
        {
            GameObject tankInventory = Instantiate(prefabTankInventory);
            tankInventory.transform.parent = tankInventoryContainer.transform;
            tankInventory.transform.localScale = new Vector3(1f, 1f, 1f);
            GameObject imgTankIcon = tankInventory.transform.GetChild(0).gameObject;
            imgTankIcon.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(e.tank.typeId, e.tank.level, ImageManager.ImageType.TankEndMatch);
            GameObject txtTankLevel = tankInventory.transform.GetChild(1).GetChild(1).gameObject;
            txtTankLevel.GetComponent<Text>().text = e.tank.level + "";
            GameObject txtTankRemaining = tankInventory.transform.GetChild(2).GetChild(1).gameObject;
            txtTankRemaining.GetComponent<Text>().text = e.remaining + "";
            GameObject txtTankName = tankInventory.transform.GetChild(3).gameObject;
            txtTankName.GetComponent<Text>().text = e.tank.name + "";

            tankInventory.GetComponent<Button>().onClick.AddListener(() =>
            {
                tankDetail = e;
                SceneManagement.Instance.LoadLevel(SceneList.TANK_DETAIL, (levelName) =>
                {
                    //SceneManagement.Instance.UnLoadLevel(SceneList.LOBBY_SCREEN);
                });
            });


        });
    }

    // Update is called once per frame
    void Update()
    {

    }

    public void BackToMainLobby()
    {
        SceneManagement.Instance.UnLoadLevel(SceneList.TANK_INVENTORY);
    }
}
