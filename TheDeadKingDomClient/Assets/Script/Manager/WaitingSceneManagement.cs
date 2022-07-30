using System.Collections;
using System.Collections.Generic;
using SocketIO;
using UnityEngine;
using UnityEngine.UI;

public class WaitingSceneManagement : MonoBehaviour
{
    // Start is called before the first frame update
    [SerializeField]
    private Text liTank;
    [SerializeField]
    private Text timeText;
    [SerializeField]
    private Text myHero;
    private SocketIOComponent socketReference;
    public float time = 10;
    [SerializeField]
    private Transform Team1;
    [SerializeField]
    private Transform Team2;

    [SerializeField]
    private GameObject players;
    private Dictionary<string, GameObject> playerText;

    public SocketIOComponent SocketReference
    {
        get
        {
            return socketReference = (socketReference == null) ? FindObjectOfType<NetworkClient>() : socketReference;
        }
    }
    void Start()
    {

        InvokeRepeating("SetTime", 0f, 1f);

        LoadListTank();
        NetworkClient.OnUpdatePlayer = UpdatePlayer;
        NetworkClient.OnChangeHero = ChangeHero;

    }

    void SetTime()
    {
        timeText.text = time.ToString();  //  time
        time--;
    }

    private void ChangeHero(SocketIOEvent e)
    {
        string id = e.data["id"].str;  // id nguoi choi
        string typeId = e.data["typeId"].str;
        float level = e.data["level"].f;
        Debug.Log("change hero" + id + "." + typeId + "." + level);
        GameObject textGO = playerText[id];
        Text text = textGO.GetComponent<Text>();
        text.text = $"{e.data["username"].str} - {typeId} - {level}";
    }

    private void UpdatePlayer(SocketIOEvent e)
    {
        playerText = new Dictionary<string, GameObject>();

        var players = e.data["players"].list;   // player["id"] , player["team"] ,  player["username"]

        int index = 0;
        players.ForEach((player) =>
        {

            // player["id"] , player["team"] , player["username"]

            if (NetworkClient.ClientID == player["id"].str)
            {
                NetworkClient.MyTeam = player["team"].f;
            }
            // 
            Font arial;
            arial = (Font)Resources.GetBuiltinResource(typeof(Font), "Arial.ttf");

            // Create Canvas GameObject.
            GameObject canvasGO = new GameObject();
            canvasGO.name = "Canvas";
            canvasGO.AddComponent<Canvas>();
            canvasGO.AddComponent<CanvasScaler>();
            canvasGO.AddComponent<GraphicRaycaster>();

            // Get canvas from the GameObject.
            Canvas canvas;
            canvas = canvasGO.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;

            // Create the Text GameObject.
            GameObject textGO = new GameObject();
            textGO.name = player["id"].str;
            textGO.transform.parent = canvasGO.transform;
            textGO.AddComponent<Text>();

            // Set Text component properties.
            Text text = textGO.GetComponent<Text>();
            text.font = arial;
            text.text = player["username"].str;
            text.fontSize = 48;
            text.alignment = TextAnchor.MiddleCenter;
            Debug.Log(playerText.Count);
            playerText.Add(player["id"].str, textGO);



            // Provide Text position and size using RectTransform.

            if (player["team"].f == 1)
            {
                RectTransform rectTransform;
                rectTransform = text.GetComponent<RectTransform>();
                rectTransform.localPosition = new Vector3(-500, 200 * (index / 2), 0);
                rectTransform.sizeDelta = new Vector2(600, 200);
                canvasGO.transform.SetParent(Team1);
            }
            else
            {

                RectTransform rectTransform;
                rectTransform = text.GetComponent<RectTransform>();
                rectTransform.localPosition = new Vector3(500, 200 * (index - 1 / 2), 0);
                rectTransform.sizeDelta = new Vector2(600, 200);
                canvasGO.transform.SetParent(Team2);
            }
            index++;
        });
    }


    public void LoadListTank()
    {
        string a = "";
        MenuManager.myTankList.ForEach(e =>
        {
            a += e._id + " - " + e.tank.typeId + " - " + e.tank.level + " ....  ";  // thieu  class , name

            // bind list tank

        });
        liTank.text = a;
    }


    public void ChooseHero()
    {
        // gui _id
        SocketReference.Emit("chooseHero", myHero.text);
    }
}
