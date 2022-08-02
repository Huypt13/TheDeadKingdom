using System;
using System.Collections;
using System.Collections.Generic;
using SocketIO;
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
    private Text totalKillTeam2;

    [SerializeField]
    private Image imageSkill1;

    [SerializeField]
    private Image imageSkill2;

    [SerializeField]
    private Image imageSkill3;

    public void Start()
    {
        InitKillDead();
        imageSkill1.type = Image.Type.Filled;
        imageSkill2.type = Image.Type.Filled;
        imageSkill3.type = Image.Type.Filled;


        NetworkClient.OnGameStateChange = OnGameStateChange;
        NetworkClient.OnTimeUpdate = OnTimeUpdate;
        NetworkClient.OnKillDeadUpdate = OnKillDeadUpdate;
        NetworkClient.OnTimeSkillUpdate = OnTimeSKillUpdate;
        //Initial Turn off screens
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
                break;
            case "EndGame":
                gameLobbyContainer.SetActive(false);
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
        text.text = dateTime.ToString("mm:ss");
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
    }


    public void OnQuit()
    {
        networkClient.OnQuit();
    }
}
