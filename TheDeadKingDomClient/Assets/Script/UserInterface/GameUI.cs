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
    private Transform killDeadTransform;
    [SerializeField]
    private Transform skillTransform;

    public void Start()
    {
        string kill1 = (NetworkClient.MyTeam == 1) ? $"<color=red><b>0</b></color>" : 0 + "";
        string kill2 = (NetworkClient.MyTeam == 2) ? $"<color=red><b>0</b></color>" : 0 + "";
        Text text = killDeadTransform.GetComponent<Text>();
        text.text = $"{kill1} - {kill2}";
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
        string kill1 = (NetworkClient.MyTeam == 1) ? $"<color=red><b>0</b></color>" : 0 + "";
        string kill2 = (NetworkClient.MyTeam == 2) ? $"<color=red><b>0</b></color>" : 0 + "";
        Text text = killDeadTransform.GetComponent<Text>();
        text.text = $"{kill1} - {kill2}";
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
        Text text = skillTransform.GetComponent<Text>();
        text.text = time1 + "/" + timeFull1 + "  " + time2 + "/" + timeFull2 + "  " + time3 + "/" + timeFull3;

    }
    private void OnKillDeadUpdate(SocketIOEvent E)
    {

        string kill1 = (NetworkClient.MyTeam == 1) ? $"<color=red><b>{E.data["kill1"].f}</b></color>" : E.data["kill1"].f + "";
        string kill2 = (NetworkClient.MyTeam == 2) ? $"<color=red><b>{E.data["kill2"].f}</b></color>" : E.data["kill2"].f + "";
        var listPlayer = E.data["listPlayer"].list;
        listPlayer.ForEach(kd =>
        {
            Debug.Log(kd["id"] + " " + kd["kill"] + " " + kd["dead"]);
        });
        Text text = killDeadTransform.GetComponent<Text>();
        text.text = $"{kill1} - {kill2}";
    }


    public void OnQuit()
    {
        networkClient.OnQuit();
    }
}


