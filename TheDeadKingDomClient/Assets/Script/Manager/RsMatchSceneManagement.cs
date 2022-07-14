using System.Collections;
using System.Collections.Generic;
using SocketIO;
using UnityEngine;
using UnityEngine.UI;

public class RsMatchSceneManagement : MonoBehaviour
{
    [SerializeField]
    private Transform result;
    private SocketIOComponent socketReference;

    public SocketIOComponent SocketReference
    {
        get
        {
            return socketReference = (socketReference == null) ? FindObjectOfType<NetworkClient>() : socketReference;
        }
    }

    void Start()
    {
        result.GetComponent<Text>().text = "";
        NetworkClient.OnResultMatch = UpdateRs;
    }

    private void UpdateRs(SocketIOEvent e)
    {
        string rs = e.data["result"].str;
        float kill1 = e.data["kill1"].f;
        float kill2 = e.data["kill2"].f;
        var playersRs = e.data["playerRs"].list;
        string text1 = "";
        string text2 = "";
        playersRs.ForEach(player =>
        {
            var username = player["username"].str;
            var kill = player["kill"].f;
            var dead = player["dead"].f;
            var team = player["team"].f;
            if (team == 1)
            {
                text1 += $"{username} : {kill}-{dead} \n";
            }
            else
            {
                text2 += $"{username} : {kill}-{dead} \n";
            }
        });
        if (result != null)
            result.GetComponent<Text>().text = $"{rs}  {kill1}- {kill2} \n\n {text1} \n\n\n {text2}";
    }

    public void GoToMenu()
    {
        SceneManagement.Instance.LoadLevel(SceneList.MAIN_MENU, (levelName) =>
        {
            SceneManagement.Instance.UnLoadLevel(SceneList.MATCHRS);
            FindObjectOfType<MenuManager>().OnSignInComplete();
        });
    }
}
