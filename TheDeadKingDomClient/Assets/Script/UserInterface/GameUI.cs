using System;
using System.Collections;
using System.Collections.Generic;
using SocketIO;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class GameUI : MonoBehaviour
{
    [SerializeField]
    private GameObject gameLobbyContainer;

    [SerializeField]
    private NetworkClient networkClient;

    [SerializeField]
    private Transform timeTransform;

    [SerializeField]
    private Text totalKillTeam1;

    [SerializeField]
    private Transform chatBox;
    private float count = 0;

    [SerializeField]
    private Text totalKillTeam2;

    [SerializeField]
    private Image imageSkill1;

    [SerializeField]
    private Image imageSkill2;

    [SerializeField]
    private Image imageSkill3;

    [SerializeField]
    private Text txtGameMode;

    private string skill1Description;
    private string skill2Description;
    private string skill3Description;

    [SerializeField]
    private Text txtDeadTimeCountdown;

    [SerializeField]
    private GameObject panelDead;
    private string strMaxTime;

    private float deadTime;

    [SerializeField]
    private GameObject tooltip;

    [SerializeField]
    private GameObject loadingCover;

    public void Start()
    {
        InitKillDead();
        NetworkClient.OnPlayerDied = DisplayDeadPanel;
        NetworkClient.OnPlayerRespawn = RemoveDeadPanel;
        NetworkClient.OnLoadGameMode = LoadGameMode;
        NetworkClient.OnSpawnMyTank = ChangeTankUI;
        NetworkClient.OnGameStateChange = OnGameStateChange;
        NetworkClient.OnTimeUpdate = OnTimeUpdate;
        NetworkClient.OnKillDeadUpdate = OnKillDeadUpdate;
        NetworkClient.OnTimeSkillUpdate = OnTimeSKillUpdate;
        //Initial Turn off screens
        gameLobbyContainer.SetActive(false);
    }
    public void Update()
    {
        OnChatBoxUpdate();
        OnChatBoxViewUpdate();
    }

    private void LoadGameMode(string gameMode, string map, float maxTime)
    {
        txtGameMode.text = gameMode;
        TimeSpan t = TimeSpan.FromSeconds(maxTime);
        DateTime dateTime = DateTime.Today.Add(t);
        strMaxTime = dateTime.ToString("mm:ss");
    }

    private void ChangeTankUI(SocketIOEvent E)
    {
        string tankType = E.data["tank"]["typeId"].str;
        float tankLevel = E.data["tank"]["level"].f;

        skill1Description = E.data["tank"]["skill1"]["name"] + ": " + E.data["tank"]["skill1"]["description"];
        skill2Description = E.data["tank"]["skill2"]["name"] + ": " + E.data["tank"]["skill2"]["description"];
        skill3Description = E.data["tank"]["skill3"]["name"] + ": " + E.data["tank"]["skill3"]["description"];

        imageSkill1.type = Image.Type.Filled;
        imageSkill2.type = Image.Type.Filled;
        imageSkill3.type = Image.Type.Filled;

        imageSkill1.sprite = ImageManager.Instance.GetImage(tankType, tankLevel, ImageManager.ImageType.Skill1);
        imageSkill1.gameObject.transform.GetChild(0).GetComponent<Image>().sprite = ImageManager.Instance.GetImage(tankType, tankLevel, ImageManager.ImageType.Skill1);

        imageSkill2.sprite = ImageManager.Instance.GetImage(tankType, tankLevel, ImageManager.ImageType.Skill2);
        imageSkill2.gameObject.transform.GetChild(0).GetComponent<Image>().sprite = ImageManager.Instance.GetImage(tankType, tankLevel, ImageManager.ImageType.Skill2);

        imageSkill3.sprite = ImageManager.Instance.GetImage(tankType, tankLevel, ImageManager.ImageType.Skill3);
        imageSkill3.gameObject.transform.GetChild(0).GetComponent<Image>().sprite = ImageManager.Instance.GetImage(tankType, tankLevel, ImageManager.ImageType.Skill3);
    }

    private void DisplayDeadPanel(float dtime)
    {
        deadTime = dtime;
        panelDead.SetActive(true);
        InvokeRepeating("SetTime", 0f, 1f);
    }

    private void RemoveDeadPanel()
    {
        //CancelInvoke("SetTime");
        panelDead.SetActive(false);
    }

    void SetTime()
    {
        txtDeadTimeCountdown.text = deadTime.ToString();  //  time
        if (deadTime == 0)
        {
            CancelInvoke("SetTime");
        }
        deadTime--;
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

    public void ResetPanel()
    {
        loadingCover.SetActive(false);
        gameLobbyContainer.SetActive(false);
    }

    private void OnGameStateChange(SocketIOEvent e)
    {
        string state = e.data["state"].str;
        Debug.Log(state);
        InitKillDead();
        switch (state)
        {
            case "Game":
                gameLobbyContainer.SetActive(true);
                AudioManager.Instance.PlayBackgroundSound("gameBackground");
                loadingCover.SetActive(false);
                RemoveDeadPanel();
                break;
            case "EndGame":
                gameLobbyContainer.SetActive(false);
                RemoveDeadPanel();
                AudioManager.Instance.StopBackgroundSound();
                loadingCover.SetActive(true);
                break;
            case "Lobby":
                gameLobbyContainer.SetActive(false);
                break;
            case "Error":
                gameLobbyContainer.SetActive(false);
                break;
            default:
                gameLobbyContainer.SetActive(false);
                break;
        }
    }

    private void InitKillDead()
    {
        //string kill1 = (NetworkClient.MyTeam == 1) ? $"<color=red><b>0</b></color>" : 0 + "";
        //string kill2 = (NetworkClient.MyTeam == 2) ? $"<color=red><b>0</b></color>" : 0 + "";
        //Text text = killDeadTransform.GetComponent<Text>();
        //text.text = $"{kill1} - {kill2}";
        totalKillTeam1.text = "0";
        totalKillTeam2.text = "0";

    }
    private void OnTimeUpdate(SocketIOEvent E)
    {
        float time = E.data["matchTime"].f;
        Text text = timeTransform.GetComponent<Text>();
        TimeSpan t = TimeSpan.FromSeconds(time);
        DateTime dateTime = DateTime.Today.Add(t);
        text.text = dateTime.ToString("mm:ss") + " / " + strMaxTime;
    }

    private void OnTimeSKillUpdate(SocketIOEvent E)
    {
        float time1 = E.data["time1"].f;
        float time2 = E.data["time2"].f;
        float time3 = E.data["time3"].f;
        float timeFull1 = E.data["timeFull1"].f;
        float timeFull2 = E.data["timeFull2"].f;
        float timeFull3 = E.data["timeFull3"].f;

        imageSkill1.fillAmount = 1 - time1 / timeFull1;
        imageSkill2.fillAmount = 1 - time2 / timeFull2;
        imageSkill3.fillAmount = 1 - time3 / timeFull3;


    }
    private void OnKillDeadUpdate(SocketIOEvent E)
    {
        //string kill1 = (NetworkClient.MyTeam == 1) ? $"<color=red><b>{E.data["kill1"].f}</b></color>" : E.data["kill1"].f + "";
        //string kill2 = (NetworkClient.MyTeam == 2) ? $"<color=red><b>{E.data["kill2"].f}</b></color>" : E.data["kill2"].f + "";
        //Text text = killDeadTransform.GetComponent<Text>();
        //text.text = $"{kill1} - {kill2}";
        totalKillTeam1.text = E.data["kill1"].f + "";
        totalKillTeam2.text = E.data["kill2"].f + "";

        string kill1 = (NetworkClient.MyTeam == 1) ? $"<color=red><b>{E.data["kill1"].f}</b></color>" : E.data["kill1"].f + "";
        string kill2 = (NetworkClient.MyTeam == 2) ? $"<color=red><b>{E.data["kill2"].f}</b></color>" : E.data["kill2"].f + "";
        var listPlayer = E.data["listPlayer"].list;
        listPlayer.ForEach(kd =>
        {
            Debug.Log(kd["id"] + " " + kd["kill"] + " " + kd["dead"]);
        });
        //Text text = killDeadTransform.GetComponent<Text>();
        //text.text = $"{kill1} - {kill2}";
    }


    public void OnQuit()
    {
        networkClient.OnQuit();
    }
    public float time;
    private void OnChatBoxUpdate()
    {
        if (!ChatBoxInfor.IsTurnChatBox && Input.GetKeyDown(KeyCode.Return))
        {

            chatBox.Find("Input").transform.gameObject
                .SetActive(true);
            chatBox.Find("ScrollView").transform.gameObject
                .SetActive(true);
            ChatBoxInfor.IsTurnChatBox = true;
            ChatBoxInfor.IsTurnChatView = false;
            return;
        }
        if (ChatBoxInfor.IsTurnChatBox && Input.GetKeyDown(KeyCode.Return))
        {
            chatBox.Find("Input").transform.gameObject
                .SetActive(false);
            count = Time.time;
            StartCoroutine(DoEvent());

            ChatBoxInfor.IsTurnChatBox = false;
        }
    }
    public IEnumerator DoEvent()
    {
        yield return new WaitUntil(() => Mathf.Floor(Time.time - count) > 3);
        if (!ChatBoxInfor.IsTurnChatBox)
            ChatBoxInfor.IsTurnChatView = true;

    }
    public void OnChatBoxViewUpdate()
    {
        if (ChatBoxInfor.IsTurnChatView && !ChatBoxInfor.IsTurnChatBox)
        {
            chatBox.Find("ScrollView").transform.gameObject
                .SetActive(false);
        }
    }




}


