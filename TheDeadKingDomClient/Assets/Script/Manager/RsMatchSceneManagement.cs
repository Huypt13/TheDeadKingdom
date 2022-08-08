using System.Collections;
using System.Collections.Generic;
using SocketIO;
using UnityEngine;
using UnityEngine.UI;

public class RsMatchSceneManagement : MonoBehaviour
{
    private SocketIOComponent socketReference;

    [SerializeField]
    private GameObject prefabPlayerEndMatch;

    [SerializeField]
    private GameObject team1Container;

    [SerializeField]
    private Text team1TotalKill;

    [SerializeField]
    private GameObject team2Container;

    [SerializeField]
    private Text team2TotalKill;

    [SerializeField]
    private GameObject winResultImage;

    [SerializeField]
    private GameObject loseResultImage;

    //private Dictionary<string, GameObject> playerDictionary;

    public SocketIOComponent SocketReference
    {
        get
        {
            return socketReference = (socketReference == null) ? FindObjectOfType<NetworkClient>() : socketReference;
        }
    }

    void Start()
    {
        NetworkClient.OnResultMatch = UpdateRs;
    }

    private void UpdateRs(SocketIOEvent e)
    {
        foreach (Transform child in team1Container.transform)
        {
            GameObject.Destroy(child.gameObject);
        }
        foreach (Transform child in team2Container.transform)
        {
            GameObject.Destroy(child.gameObject);
        }


        string rs = e.data["result"].str;
        if (rs == "win")
        {
            winResultImage.SetActive(true);
        }
        else
        {
            loseResultImage.SetActive(true);
        }

        float kill1 = e.data["kill1"].f;
        float kill2 = e.data["kill2"].f;

        team1TotalKill.text = kill1.ToString();
        team2TotalKill.text = kill2.ToString();

        var playersRs = e.data["playerRs"].list;
        playersRs.ForEach(player =>
        {
            var username = player["username"].str;
            var kill = player["kill"].f;
            var dead = player["dead"].f;
            var team = player["team"].f;
            GameObject playerEndMatch = Instantiate(prefabPlayerEndMatch);
            if (team == 1)
            {
                playerEndMatch.transform.parent = team1Container.transform;
            }
            else
            {
                playerEndMatch.transform.parent = team2Container.transform;
            }
            playerEndMatch.transform.localScale = new Vector3(1f, 1f, 1f);
            GameObject imgTankIcon = playerEndMatch.transform.GetChild(0).gameObject;
            imgTankIcon.GetComponent<Image>().sprite = ImageManager.Instance.GetImage("003", 3, ImageManager.ImageType.TankEndMatch);
            GameObject txtPlayerName = playerEndMatch.transform.GetChild(3).gameObject;
            txtPlayerName.GetComponent<Text>().text = username;
            GameObject txtKillDead = playerEndMatch.transform.GetChild(4).gameObject;
            txtKillDead.GetComponent<Text>().text = $"{kill}/{dead}";
            if (player["id"].str == NetworkClient.ClientID)
            {
                txtPlayerName.GetComponent<Text>().color = Color.green;
                txtKillDead.GetComponent<Text>().color = Color.green;
            }
        });
    }

    public void GoToMenu()
    {
        SceneManagement.Instance.LoadLevel(SceneList.LOBBY_SCREEN, (levelName) =>
        {
            SceneManagement.Instance.UnLoadLevel(SceneList.MATCHRS);
        });
    }
}
