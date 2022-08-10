using Newtonsoft.Json.Linq;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

public class LeaderboardManager : MonoBehaviour
{
    [SerializeField]
    private GameObject prefabRankLeaderboard;

    [SerializeField]
    private GameObject rankLeaderboardContainer;

    private List<CommonUserInfo> topRanks;

    // Start is called before the first frame update
    void Start()
    {
        StartCoroutine(GetTopRank(MenuManager.uri));
    }

    private IEnumerator GetTopRank(string uri)
    {
        using (UnityWebRequest request = UnityWebRequest.Get(uri + "/user/rank"))
        {
            request.SetRequestHeader("x-access-token", MenuManager.access_token);
            yield return request.SendWebRequest();

            if (request.isNetworkError)
            {
                Debug.Log("Error: " + request.error);
            }
            else
            {
                var jo = JObject.Parse(request.downloadHandler.text);
                topRanks = jo["data"]["listTop"].ToObject<List<CommonUserInfo>>();
                //Debug.Log(topRanks.Count);

                DisplayTopRank();
            }
        }
    }

    private void DisplayTopRank()
    {
        foreach (Transform child in rankLeaderboardContainer.transform)
        {
            GameObject.Destroy(child.gameObject);
        }
        int i = 1;
        topRanks.ForEach(userRank =>
        {
            GameObject rankLeaderboard = Instantiate(prefabRankLeaderboard);
            rankLeaderboard.transform.parent = rankLeaderboardContainer.transform;
            rankLeaderboard.transform.localScale = new Vector3(1f, 1f, 1f);

            rankLeaderboard.transform.GetChild(0).gameObject.GetComponent<Text>().text = i + ""; // index
            //rankLeaderboard.transform.GetChild(1).gameObject.GetComponent<Image>().sprite = i + ""; // Avatar
            rankLeaderboard.transform.GetChild(2).gameObject.GetComponent<Text>().text = userRank.username;
            rankLeaderboard.transform.GetChild(3).gameObject.GetComponent<Image>().sprite = ImageManager.Instance.GetRankImage(userRank.numOfStars);
            rankLeaderboard.transform.GetChild(4).gameObject.GetComponent<Text>().text = ImageManager.Instance.GetRankName(userRank.numOfStars);
            if (userRank.numOfStars <= 100)
            {
                rankLeaderboard.transform.GetChild(5).gameObject.GetComponent<Image>().sprite = ImageManager.Instance.GetStarImage(userRank.numOfStars);
            }
            else
            {
                rankLeaderboard.transform.GetChild(5).gameObject.SetActive(false);
                rankLeaderboard.transform.GetChild(7).gameObject.SetActive(true);
                rankLeaderboard.transform.GetChild(6).gameObject.GetComponent<Text>().text = (userRank.numOfStars % 100) + "";
            }
            i++;
        });
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
