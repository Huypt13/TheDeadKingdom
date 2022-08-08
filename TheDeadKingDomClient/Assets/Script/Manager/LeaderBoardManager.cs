using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class LeaderboardManager : MonoBehaviour
{
    [SerializeField]
    private GameObject prefabRankLeaderboard;

    [SerializeField]
    private GameObject rankLeaderboardContainer;


    // Start is called before the first frame update
    void Start()
    {
        foreach (Transform child in rankLeaderboardContainer.transform)
        {
            GameObject.Destroy(child.gameObject);
        }
        for (int i = 0; i < 10; i++)
        {
            GameObject rankLeaderboard = Instantiate(prefabRankLeaderboard);
            rankLeaderboard.transform.parent = rankLeaderboardContainer.transform;
            rankLeaderboard.transform.localScale = new Vector3(1f, 1f, 1f);

            rankLeaderboard.transform.GetChild(0).gameObject.GetComponent<Text>().text = i + ""; // index
            //rankLeaderboard.transform.GetChild(1).gameObject.GetComponent<Image>().sprite = i + ""; // Avatar
            rankLeaderboard.transform.GetChild(2).gameObject.GetComponent<Text>().text = "Player name";
            int star = 95;
            rankLeaderboard.transform.GetChild(3).gameObject.GetComponent<Image>().sprite = ImageManager.Instance.GetRankImage(star);
            rankLeaderboard.transform.GetChild(4).gameObject.GetComponent<Text>().text = ImageManager.Instance.GetRankName(star);
            if (star <= 100)
            {
                rankLeaderboard.transform.GetChild(5).gameObject.GetComponent<Image>().sprite = ImageManager.Instance.GetStarImage(star);
            }
            else
            {
                rankLeaderboard.transform.GetChild(5).gameObject.SetActive(false);
                rankLeaderboard.transform.GetChild(7).gameObject.SetActive(true);
                rankLeaderboard.transform.GetChild(6).gameObject.GetComponent<Text>().text = (star % 100) + "";
            }

        }
    }

    public void BackToMainLobby()
    {
        SceneManagement.Instance.UnLoadLevel(SceneList.LEADERBOARD);
    }

    // Update is called once per frame
    void Update()
    {

    }
}
