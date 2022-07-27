using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class EndOfMatchPersonalHandler : MonoBehaviour
{
    public Button btnBackToHome;
    public Button btnPlayAgain;
    public Button btnNewBattle;

    // Start is called before the first frame update
    void Start()
    {
        btnBackToHome.onClick.AddListener(BackToLobbyScreen);
        btnPlayAgain.onClick.AddListener(PlayAgain);
        btnNewBattle.onClick.AddListener(NewBattle);

    }

    // Update is called once per frame
    //void Update()
    //{

    //}

    private void BackToLobbyScreen()
    {
        SceneManager.LoadScene("LobbyScreen");
    }

    private void PlayAgain()
    {
        SceneManager.LoadScene("LobbyScreen");
        PlayerPrefs.SetString("PlayMode", "PLAY_AGAIN");
    }

    private void NewBattle()
    {
        SceneManager.LoadScene("LobbyScreen");
        PlayerPrefs.SetString("PlayMode", "NEW_BATTLE"); 
    }
}
