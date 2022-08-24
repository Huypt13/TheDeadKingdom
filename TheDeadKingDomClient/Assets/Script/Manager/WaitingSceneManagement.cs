using System.Collections;
using System.Collections.Generic;
using SocketIO;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class WaitingSceneManagement : MonoBehaviour
{
    // Start is called before the first frame update
    [SerializeField]
    private Text timeText;

    private SocketIOComponent socketReference;
    public float time = 10;

    [SerializeField]
    private GameObject players;

    private Dictionary<string, GameObject> teammateDictionary;

    [SerializeField]
    private GameObject prefabButtonPickTank;

    [SerializeField]
    private GameObject playerTanksContainer;

    [SerializeField]
    private GameObject prefabTeammatePickTank;

    [SerializeField]
    private GameObject teammateContainer;

    [SerializeField]
    private GameObject tankPickedName;

    [SerializeField]
    private GameObject tankPickedRole;

    [SerializeField]
    private GameObject tankPickedBackground;

    [SerializeField]
    private GameObject skill1Icon;

    [SerializeField]
    private GameObject skill2Icon;

    [SerializeField]
    private GameObject skill3Icon;

    [SerializeField]
    private GameObject tooltip;

    [SerializeField]
    private Text txtGameMode;

    [SerializeField]
    private Text txtGameMap;

    private string skill1Description;
    private string skill2Description;
    private string skill3Description;

    public SocketIOComponent SocketReference
    {
        get
        {
            return socketReference = (socketReference == null) ? FindObjectOfType<NetworkClient>() : socketReference;
        }
    }
    void Start()
    {
        AudioManager.Instance.PlayEffectSoundOneShot("pickTank");
        InvokeRepeating("SetTime", 0f, 1f);

        LoadListTank();
        NetworkClient.OnUpdatePlayer = UpdatePlayer;
        NetworkClient.OnChangeHero = ChangeHero;

        tankPickedBackground.SetActive(false);
    }

    public void DisplayTooltip(int skill)
    {

        switch (skill)
        {
            case 1:
                tooltip.GetComponent<Tooltip>().ShowTooltip(skill1Description);
                break;
            case 2:
                tooltip.GetComponent<Tooltip>().ShowTooltip(skill2Description);
                break;
            case 3:
                tooltip.GetComponent<Tooltip>().ShowTooltip(skill3Description);
                break;
        }

    }

    public void HideTooltip()
    {
        tooltip.GetComponent<Tooltip>().HideTooltip();
    }

    void SetTime()
    {
        if (time == 3)
        {
            AudioManager.Instance.PlayEffectSoundOneShot("countDownFight");
        }
        timeText.text = time.ToString();  //  time
        if (time > 0)
        {
            time--;
        }
    }

    private void ChangeHero(SocketIOEvent e)
    {
        string id = e.data["id"].str;  // id nguoi choi
        string typeId = e.data["typeId"].str;
        float level = e.data["level"].f;
        Debug.Log("change hero" + id + "." + typeId + "." + level);
        GameObject teammatePickTank = teammateDictionary[id];
        GameObject txtTankName = teammatePickTank.transform.GetChild(2).gameObject;
        txtTankName.GetComponent<Text>().text = "";// typeId + "-" + level;

        GameObject imgTankIcon = teammatePickTank.transform.GetChild(0).gameObject;
        imgTankIcon.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(typeId, level, ImageManager.ImageType.TankIconCircle);
        //ImageManager.Instance.GetImage(typeId, level, ImageManager.ImageType.TankIcon).

    }

    private void UpdatePlayer(SocketIOEvent e)
    {
        string gameMode = e.data["gameMode"].str;
        string map = e.data["map"].str;
        txtGameMode.text = "Game Mode: " + gameMode;
        txtGameMap.text = "Map: " + map;
        //Debug.Log("Game Mode: " + gameMode + " - Map: " + map);

        foreach (Transform child in teammateContainer.transform)
        {
            GameObject.Destroy(child.gameObject);
        }

        teammateDictionary = new Dictionary<string, GameObject>();

        var players = e.data["players"].list;   // player["id"] , player["team"] ,  player["username"]

        players.ForEach((player) =>
        {

            // player["id"] , player["team"] , player["username"]

            if (NetworkClient.ClientID == player["id"].str)
            {
                NetworkClient.MyTeam = player["team"].f;
            }
        });
        players.ForEach((player) =>
        {
            if (player["team"].f == NetworkClient.MyTeam)
            {
                GameObject teammatePickTank = Instantiate(prefabTeammatePickTank);
                teammatePickTank.transform.parent = teammateContainer.transform;
                teammatePickTank.transform.localScale = new Vector3(1f, 1f, 1f);
                GameObject txtPlayerName = teammatePickTank.transform.GetChild(1).gameObject;
                txtPlayerName.GetComponent<Text>().text = player["username"].str;
                GameObject txtTankName = teammatePickTank.transform.GetChild(2).gameObject;
                txtTankName.GetComponent<Text>().text = "Picking";

                teammateDictionary.Add(player["id"].str, teammatePickTank);
            }
        });
    }


    public void LoadListTank()
    {
        //a += e._id + " - " + e.tank.typeId + " - " + e.tank.level + " ....  ";  // thieu  class , name

        foreach (Transform child in playerTanksContainer.transform)
        {
            GameObject.Destroy(child.gameObject);
        }

        LobbyScreenManager.myTankList.ForEach(e =>
        {
            if (e.remaining > 0)
            {
                GameObject btnPickTank = Instantiate(prefabButtonPickTank);
                btnPickTank.transform.parent = playerTanksContainer.transform;
                btnPickTank.transform.localScale = new Vector3(1f, 1f, 1f);
                btnPickTank.transform.localPosition = new Vector3(btnPickTank.transform.localPosition.x, btnPickTank.transform.localPosition.y, 0f);
                btnPickTank.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(e.tank.typeId, e.tank.level, ImageManager.ImageType.TankIcon);

                btnPickTank.GetComponent<Button>().onClick.AddListener(() =>
                {
                    ChooseHero(e);
                });
            }
        });

        LobbyScreenManager.myTankList.ForEach(e =>
        {
            if (e.remaining <= 0)
            {
                GameObject btnPickTank = Instantiate(prefabButtonPickTank);
                btnPickTank.transform.parent = playerTanksContainer.transform;
                btnPickTank.transform.localScale = new Vector3(1f, 1f, 1f);
                btnPickTank.transform.localPosition = new Vector3(btnPickTank.transform.localPosition.x, btnPickTank.transform.localPosition.y, 0f);
                btnPickTank.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(e.tank.typeId, e.tank.level, ImageManager.ImageType.TankIcon);

                btnPickTank.GetComponent<Button>().interactable = false;
            }
        });
    }


    public void ChooseHero(TankRemain t)
    {
        // gui _id
        SocketReference.Emit("chooseHero", t._id);

        tankPickedBackground.SetActive(true);

        tankPickedName.GetComponent<Text>().text = t.tank.name + " - level " + t.tank.level;
        tankPickedRole.GetComponent<Text>().text = "Remain: " + t.remaining;
        tankPickedBackground.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(t.tank.typeId, t.tank.level, ImageManager.ImageType.TankBackground);
        skill1Icon.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(t.tank.typeId, t.tank.level, ImageManager.ImageType.Skill1);
        skill2Icon.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(t.tank.typeId, t.tank.level, ImageManager.ImageType.Skill2);
        skill3Icon.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(t.tank.typeId, t.tank.level, ImageManager.ImageType.Skill3);

        skill1Description = t.tank.skill1.name + ": " + t.tank.skill1.description;
        skill2Description = t.tank.skill2.name + ": " + t.tank.skill2.description;
        skill3Description = t.tank.skill3.name + ": " + t.tank.skill3.description;
    }
}
