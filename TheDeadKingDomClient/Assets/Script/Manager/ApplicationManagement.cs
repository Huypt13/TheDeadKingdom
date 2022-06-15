using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ApplicationManagement : MonoBehaviour
{
    public void Start()
    {
        SceneManagement.Instance.LoadLevel(SceneList.MAIN_MENU, (levelName) => { });
    }
}
