using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class WhoActivatedMe : MonoBehaviour
{
    private string whoActivatedMe;

    public void SetActivator(string ID)
    {
        whoActivatedMe = ID;
    }

    public string GetActivator()
    {
        return whoActivatedMe;
    }
}
