using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ColliderDestroy : MonoBehaviour
{
    [SerializeField]
    private NetworkIdentity networkIdentity;

    [SerializeField]
    private WhoActivatedMe whoActiveMe;



    private void OnCollisionEnter2D(Collision2D collision)
    {


        NetworkIdentity ni = collision?.gameObject?.GetComponent<NetworkIdentity>();

        // cham cay
        if (ni == null)
        {
            Destroy(gameObject);
            NetworkClient.serverObjects.Remove(networkIdentity.GetId());
            networkIdentity.GetSocket().Emit("collisionDestroy", new JSONObject(JsonUtility.ToJson(new IDData()
            {
                id = networkIdentity.GetId(),
                enemyId = null
            })));
            return;
        }


        // bullet cham nhau

        if (ni.tag == "BulletThrough")
        {
            return;
        }


        // khong phai ai ban nhau

        var niActive = NetworkClient.serverObjects[whoActiveMe.GetActivator()];

        if (!(ni.GetComponent<AiManager>() != null && niActive.GetComponent<AiManager>() != null))
        {
            // ko phai cham chinh minh
            if (ni.GetId() != whoActiveMe.GetActivator())
            {
                if (ni.Team == niActive.Team)
                {
                    return;
                }

                Destroy(gameObject);

                // nguoi ban nguoi , firer gui reques

                if ((niActive.IsControlling() && ni.GetComponent<TankGeneral>() != null) // nguoi trung dan
                    || (niActive.IsControlling() && ni.GetComponent<AiManager>() != null) // ai trung dan
                    || (niActive.IsControlling() && ni.tag == "MainHouse")  // main house trung dan
                    || (ni.IsControlling() && niActive.GetComponent<AiManager>() != null))  // ai ban nguoi nguoi bi ban gui request 
                {
                    networkIdentity.GetSocket().Emit("collisionDestroy", new JSONObject(JsonUtility.ToJson(new IDData()
                    {
                        id = networkIdentity.GetId(),
                        enemyId = ni.GetId()
                    })));
                    NetworkClient.serverObjects.Remove(networkIdentity.GetId());
                    Debug.Log("trung dan");

                    return;
                }

                // ban trung hop mau firer gui reques
                if (ni.tag == "HpBox" && niActive.IsControlling())
                {
                    networkIdentity.GetSocket().Emit("collisionDestroyHpBox", new JSONObject(JsonUtility.ToJson(new IDData()
                    {
                        id = networkIdentity.GetId(),
                        enemyId = ni.GetId()
                    })));
                    NetworkClient.serverObjects.Remove(networkIdentity.GetId());

                    return;
                }

                if (ni.tag == "Box" && niActive.IsControlling())
                {
                    networkIdentity.GetSocket().Emit("collisionDestroyBox", new JSONObject(JsonUtility.ToJson(new IDData()
                    {
                        id = networkIdentity.GetId(),
                        enemyId = ni.GetId()
                    })));
                    NetworkClient.serverObjects.Remove(networkIdentity.GetId());

                    return;

                }


            }
        }




    }

}
