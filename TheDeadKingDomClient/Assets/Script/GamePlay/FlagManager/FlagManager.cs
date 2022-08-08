using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FlagManager : MonoBehaviour
{

    private float timeCounter = 0;
    private float timeSend = 0.5f;
    private bool isOnFlag = false;
    [SerializeField]
    private NetworkIdentity networkIdentity;

    private void Update()
    {
        if (isOnFlag)
        {
            timeCounter += Time.deltaTime;
            if (timeCounter >= timeSend)
            {
                // update point
                networkIdentity.GetSocket().Emit("UpdatePoint", new JSONObject(JsonUtility.ToJson(new FlagData()
                {
                    id = networkIdentity.GetId(),
                    team = NetworkClient.MyTeam
                })));
                timeCounter = 0;
            }
        }
    }
    private void OnCollisionEnter2D(Collision2D collision)
    {
        NetworkIdentity ni = collision?.gameObject?.GetComponent<NetworkIdentity>();

        if (ni.IsControlling())
        {
            Debug.Log("enter");
            isOnFlag = true;
            timeCounter = 0;
        }

    }
    private void OnCollisionExit2D(Collision2D collision)
    {
        NetworkIdentity ni = collision?.gameObject?.GetComponent<NetworkIdentity>();

        if (ni.IsControlling())
        {
            Debug.Log("exit");

            isOnFlag = false;
        }
    }

}


