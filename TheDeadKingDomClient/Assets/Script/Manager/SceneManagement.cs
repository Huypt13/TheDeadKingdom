using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.SceneManagement;

public class SceneManagement : Singleton<SceneManagement>
{
    private List<LevelLoadingData> levelsLoading;
    private List<string> currentlyLoadedScenes;

    public List<string> CurrentlyLoadedScenes { get => currentlyLoadedScenes; set => currentlyLoadedScenes = value; }

    public override void Awake()
    {
        base.Awake();
        levelsLoading = new List<LevelLoadingData>();
        CurrentlyLoadedScenes = new List<string>();
    }

    public void Update()
    {
        for (int i = levelsLoading.Count - 1; i >= 0; i--)
        {
            if (levelsLoading[i] == null)
            {
                levelsLoading.RemoveAt(i);
                continue;
            }

            if (levelsLoading[i].ao.isDone)
            {
                levelsLoading[i].ao.allowSceneActivation = true; //Needed to make sure the scene while fully loaded gets turned on for the player
                levelsLoading[i].onLevelLoaded.Invoke(levelsLoading[i].sceneName);
                CurrentlyLoadedScenes.Add(levelsLoading[i].sceneName);
                levelsLoading.RemoveAt(i);
                //Hide your loading screen here
                //ApplicationManager.Instance.HideLoadingScreen();
            }
        }
    }

    public void LoadLevel(string levelName, Action<string> onLevelLoaded, bool isShowingLoadingScreen = false)
    {
        bool value = CurrentlyLoadedScenes.Any(x => x == levelName);

        if (value)
        {
            Debug.LogFormat("Current level ({0}) is already loaded into the game.", levelName);
            return;
        }

        LevelLoadingData lld = new LevelLoadingData();
        lld.ao = SceneManager.LoadSceneAsync(levelName, LoadSceneMode.Additive);
        lld.sceneName = levelName;
        lld.onLevelLoaded = onLevelLoaded;
        levelsLoading.Add(lld);

        if (isShowingLoadingScreen)
        {
            //Turn on your loading screen here
            //ApplicationManager.Instance.ShowLoadingScreen();
        }
    }

    public void UnLoadLevel(string levelName)
    {
        foreach (string item in CurrentlyLoadedScenes)
        {
            if (item == levelName)
            {
                SceneManager.UnloadSceneAsync(levelName);
                CurrentlyLoadedScenes.Remove(item);
                return;
            }
        }

        Debug.LogErrorFormat("Failed to unload level ({0}), most likely was never loaded to begin with or was already unloaded.", levelName);
    }
}
