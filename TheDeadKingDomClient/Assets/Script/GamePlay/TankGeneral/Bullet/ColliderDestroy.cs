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

        // dan cham nhau

        if (ni.GetComponent<WhoActivatedMe>() != null)
        {
            return;
        }

        // khong phai ai ban nhau

        var niActive = NetworkClient.serverObjects[whoActiveMe.GetActivator()];

        if (ni.GetComponent<AiManager>() == null || niActive.GetComponent<AiManager>() == null)
        {
            // ko phai cham chinh minh
            if (ni.GetId() != whoActiveMe.GetActivator())
            {



                networkIdentity.GetSocket().Emit("collisionDestroy", new JSONObject(JsonUtility.ToJson(new IDData()
                {
                    id = networkIdentity.GetId(),
                    enemyId = ni.GetId()
                })));
                Destroy(gameObject);
                NetworkClient.serverObjects.Remove(networkIdentity.GetId());
            }
        }

        // nguoi ban nguoi



    }

}
