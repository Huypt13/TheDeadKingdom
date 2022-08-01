using System.Collections;
using System.Collections.Generic;
using SocketIO;
using UnityEngine;
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



    public SocketIOComponent SocketReference
    {
        get
        {
            return socketReference = (socketReference == null) ? FindObjectOfType<NetworkClient>() : socketReference;
        }
    }
    void Start()
    {
        AudioManager.Instance.PlayBackgroundSound("pickTank");
        InvokeRepeating("SetTime", 0f, 1f);

        LoadListTank();
        NetworkClient.OnUpdatePlayer = UpdatePlayer;
        NetworkClient.OnChangeHero = ChangeHero;


    }

    void SetTime()
    {
        if (time == 3)
        {
            AudioManager.Instance.PlayEffectSoundOneShot("countDownFight");
        }
        timeText.text = time.ToString();  //  time
        time--;
    }

    private void ChangeHero(SocketIOEvent e)
    {
        string id = e.data["id"].str;  // id nguoi choi
        string typeId = e.data["typeId"].str;
        float level = e.data["level"].f;
        Debug.Log("change hero" + id + "." + typeId + "." + level);
        GameObject teammatePickTank = teammateDictionary[id];
        GameObject txtTankName = teammatePickTank.transform.GetChild(2).gameObject;
        txtTankName.GetComponent<Text>().text = typeId + "-" + level;

        GameObject imgTankIcon = teammatePickTank.transform.GetChild(0).gameObject;
        imgTankIcon.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(typeId, level, ImageManager.ImageType.TankIconCircle);
        //ImageManager.Instance.GetImage(typeId, level, ImageManager.ImageType.TankIcon).

    }

    private void UpdatePlayer(SocketIOEvent e)
    {
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
                btnPickTank.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(e.tank.typeId, e.tank.level, ImageManager.ImageType.TankIcon);
                btnPickTank.GetComponent<Button>().onClick.AddListener(() =>
                {
                    ChooseHero(e._id, e.tank.typeId, e.tank.level, e.remaining);
                });
            }


        });
    }


    public void ChooseHero(string tankId, string typeId, float level, float remaining)
    {
        // gui _id
        SocketReference.Emit("chooseHero", tankId);
        tankPickedName.GetComponent<Text>().text = typeId + "-" + level;
        tankPickedRole.GetComponent<Text>().text = "Remain: " + remaining;
        tankPickedBackground.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(typeId, level, ImageManager.ImageType.TankBackground);
        skill1Icon.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(typeId, level, ImageManager.ImageType.Skill1);
        skill2Icon.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(typeId, level, ImageManager.ImageType.Skill2);
        skill3Icon.GetComponent<Image>().sprite = ImageManager.Instance.GetImage(typeId, level, ImageManager.ImageType.Skill3);
    }
}
