using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class RankingRewardHandler : MonoBehaviour
{
    // main screen
    public Button btnClose;
    public Button btnOKAward;
    public GameObject awardPopup;

    [SerializeField]
    private GameObject listRankPoint;

    // Start is called before the first frame update
    void Start()
    {
        btnClose.onClick.AddListener(BackToLobbyScreen);
        btnOKAward.onClick.AddListener(CloseAwardPopup);
        foreach (Transform rankPoint in listRankPoint.transform)
        {
            //child.gameObject.transform.Find("BtnClaim").gameObject.GetComponent<Button>().onClick.AddListener(ClaimReward);
            GameObject btnClaim = rankPoint.gameObject.transform.Find("BtnClaim").gameObject;
            if (btnClaim.activeSelf)
                btnClaim.GetComponent<Button>().onClick.AddListener(ClaimReward);
        }

    }

    // Update is called once per frame
    //void Update()
    //{

    //}
    private void OpenAwardPopup()
    {
        awardPopup.SetActive(true);
    }
    
    private void CloseAwardPopup()
    {
        awardPopup.SetActive(false);
    }

    private void BackToLobbyScreen()
    {
        if (!awardPopup.activeSelf)
        {
            SceneManager.LoadScene("LobbyScreen");
        }
    }

    private void ClaimReward()
    {
        if (!awardPopup.activeSelf)
        {
            OpenAwardPopup();
            Debug.Log("Claim reward");
        }
    }
}
