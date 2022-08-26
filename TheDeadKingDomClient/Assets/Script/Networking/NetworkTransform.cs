using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class NetworkTransform : MonoBehaviour
{
    [SerializeField]
    private Vector3 oldPosition;

    private NetworkIdentity networkIdentity;
    private Player player;

    private float stillCounter = 0;

    private bool isFocusOn;
    public bool IsFocusOn { get => isFocusOn; set => isFocusOn = value; }

    public void Start()
    {
        networkIdentity = GetComponent<NetworkIdentity>();
        oldPosition = transform.position;
        player = new Player();
        player.position = new Position();
        player.position.x = 0;
        player.position.y = 0;

        if (!networkIdentity.IsControlling())
        {
            enabled = false;
        }
    }

    public void Update()
    {
        if (networkIdentity.IsControlling())
        {
            if (!isFocusOn)
            {
                //if (transform.position != oldPosition)
                //{
                //    sendData();
                //}
                //else
                //{
                stillCounter += Time.deltaTime;

                if (stillCounter >= 0.1f)
                {
                    stillCounter = 0;
                    sendData();
                }
                //  }

            }

        }
    }

    private void sendData()
    {
        //Update player information
        player.position.x = transform.position.x.TwoDecimals();
        player.position.y = transform.position.y.TwoDecimals();

        networkIdentity.GetSocket().Emit("updatePosition", new JSONObject(JsonUtility.ToJson(player)));
    }
}
