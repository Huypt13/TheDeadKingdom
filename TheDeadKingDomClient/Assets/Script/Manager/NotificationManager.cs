using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class NotificationManager : Singleton<NotificationManager>
{
    [SerializeField]
    private GameObject prefabCanvasNotification;

    // Start is called before the first frame update
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {

    }

    public void DisplayNotification(string message, string sceneName)
    {
        GameObject notification = Instantiate(prefabCanvasNotification);
        notification.GetComponentInChildren<Text>().text = message;
        notification.GetComponentInChildren<Button>().onClick.AddListener(() =>
        {
            Destroy(notification);
        });
        SceneManager.MoveGameObjectToScene(notification, SceneManager.GetSceneByName(sceneName));
    }
}
