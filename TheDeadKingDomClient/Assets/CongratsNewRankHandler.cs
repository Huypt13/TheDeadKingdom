using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class CongratsNewRankHandler : MonoBehaviour
{
    public Button btnOK;

    // Start is called before the first frame update
    void Start()
    {
        btnOK.onClick.AddListener(GoToEndOfMatchPersonal);

    }

    // Update is called once per frame
    //void Update()
    //{

    //}

    private void GoToEndOfMatchPersonal()
    {
        SceneManager.LoadScene("EndOfMatchPersonal");
    }
}
