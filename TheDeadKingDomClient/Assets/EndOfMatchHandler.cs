using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class EndOfMatchHandler : MonoBehaviour
{
    public Button btnNext;

    // Start is called before the first frame update
    void Start()
    {
        btnNext.onClick.AddListener(GoToCongratsNewRank);

    }

    // Update is called once per frame
    //void Update()
    //{

    //}

    private void GoToCongratsNewRank()
    {
        SceneManager.LoadScene("CongratsNewRank");
    }
}
