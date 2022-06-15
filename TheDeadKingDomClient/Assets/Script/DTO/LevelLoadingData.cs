using System;
using UnityEngine;

[Serializable]
public class LevelLoadingData
{
    public AsyncOperation ao;
    public string sceneName;
    public Action<string> onLevelLoaded;
}
