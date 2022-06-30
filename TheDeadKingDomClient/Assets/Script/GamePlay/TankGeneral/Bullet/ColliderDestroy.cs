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
        string enemyName = collision?.gameObject?.name.Substring(0, 5);
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

        if (ni.GetComponent<WhoActivatedMe>() != null)
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

                // client bi ban , thi client trung dan gui request

                if (ni.IsControlling())
                {
                    Destroy(gameObject);
                    NetworkClient.serverObjects.Remove(networkIdentity.GetId());
                    networkIdentity.GetSocket().Emit("collisionDestroy", new JSONObject(JsonUtility.ToJson(new IDData()
                    {
                        id = networkIdentity.GetId(),
                        enemyId = ni.GetId()
                    })));
                    return;
                }

                //  ai trung dan , firer gui request

                if (niActive.IsControlling() && ni.GetComponent<AiManager>() != null)
                {
                    Destroy(gameObject);
                    NetworkClient.serverObjects.Remove(networkIdentity.GetId());
                    networkIdentity.GetSocket().Emit("collisionDestroy", new JSONObject(JsonUtility.ToJson(new IDData()
                    {
                        id = networkIdentity.GetId(),
                        enemyId = ni.GetId()
                    })));
                    return;
                }

                if (enemyName == "hpBox")
                {
                    Destroy(gameObject);
                    NetworkClient.serverObjects.Remove(networkIdentity.GetId());
                    networkIdentity.GetSocket().Emit("collisionDestroyHpBox", new JSONObject(JsonUtility.ToJson(new IDData()
                    {
                        id = networkIdentity.GetId(),
                        enemyId = ni.GetId()
                    })));
                    return;
                }

            }
        }




    }

}
