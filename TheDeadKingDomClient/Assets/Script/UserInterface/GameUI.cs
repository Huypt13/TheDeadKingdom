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
    public void Start()
    {
        string kill1 = (NetworkClient.MyTeam == 1) ? $"<color=red><b>0</b></color>" : 0 + "";
        string kill2 = (NetworkClient.MyTeam == 2) ? $"<color=red><b>0</b></color>" : 0 + "";
        Text text = killDeadTransform.GetComponent<Text>();
        text.text = $"{kill1} - {kill2}";
        NetworkClient.OnGameStateChange += OnGameStateChange;
        NetworkClient.OnTimeUpdate += OnTimeUpdate;
        NetworkClient.OnKillDeadUpdate += OnKillDeadUpdate;
        //Initial Turn off screens
        gameLobbyContainer.SetActive(false);
    }

    private void OnGameStateChange(SocketIOEvent e)
    {
        string state = e.data["state"].str;
        Debug.Log(state);
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
            default:
                gameLobbyContainer.SetActive(false);
                break;
        }
    }
    private void OnTimeUpdate(SocketIOEvent E)
    {
        float time = E.data["matchTime"].f;
        Text text = timeTransform.GetComponent<Text>();
        TimeSpan t = TimeSpan.FromSeconds(time);
        DateTime dateTime = DateTime.Today.Add(t);
        text.text = dateTime.ToString("mm:ss");
    }
    private void OnKillDeadUpdate(SocketIOEvent E)
    {

        string kill1 = (NetworkClient.MyTeam == 1) ? $"<color=red><b>{E.data["kill1"].f}</b></color>" : E.data["kill1"].f + "";
        string kill2 = (NetworkClient.MyTeam == 2) ? $"<color=red><b>{E.data["kill2"].f}</b></color>" : E.data["kill2"].f + "";
        Text text = killDeadTransform.GetComponent<Text>();
        text.text = $"{kill1} - {kill2}";
    }

    public void OnQuit()
    {
        networkClient.OnQuit();
    }
}
