using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class NetworkRotation : MonoBehaviour
{
    [SerializeField]
    private float oldTankRotation;
    [SerializeField]
    private float oldBarrelRotation;

    [Header("Class References")]
    [SerializeField]
    private TankGeneral tankGeneral;

    private NetworkIdentity networkIdentity;
    private PlayerRotation player;

    private float stillCounter = 0;

    public void Start()
    {
        networkIdentity = GetComponent<NetworkIdentity>();

        player = new PlayerRotation();
        player.tankRotation = 0;
        player.barrelRotation = 0;

        if (!networkIdentity.IsControlling())
        {
            enabled = false;
        }
    }

    public void Update()
    {
        if (networkIdentity.IsControlling())
        {
            //if (oldTankRotation != transform.localEulerAngles.z || oldBarrelRotation != tankGeneral.GetLastRotation())
            //{
            //    oldTankRotation = transform.localEulerAngles.z;
            //    oldBarrelRotation = tankGeneral.GetLastRotation();
            //    stillCounter = 0;
            //    sendData();
            //}
            //else
            //{
            stillCounter += Time.deltaTime;

            if (stillCounter >= 0.05f)
            {
                stillCounter = 0;
                sendData();
            }
            //  }
        }
    }

    private void sendData()
    {
        player.tankRotation = transform.localEulerAngles.z.TwoDecimals();
        player.barrelRotation = tankGeneral.GetLastRotation().TwoDecimals();

        networkIdentity.GetSocket().Emit("updateRotation", new JSONObject(JsonUtility.ToJson(player)));
    }
}
