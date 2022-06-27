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

    public void Start()
    {

        NetworkClient.OnGameStateChange += OnGameStateChange;
        NetworkClient.OnTimeUpdate += OnTimeUpdate;
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

    public void OnQuit()
    {
        networkClient.OnQuit();
    }
}
