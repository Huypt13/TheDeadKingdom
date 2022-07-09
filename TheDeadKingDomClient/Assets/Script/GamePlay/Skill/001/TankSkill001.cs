using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TankSkill001 : MonoBehaviour
{

    [SerializeField]
    private Transform bulletSpawnPoint;

    [SerializeField]
    private NetworkIdentity networkIdentity;
    Skill1001Data sk1;
    // Start is called before the first frame update
    void Start()
    {
        sk1 = new Skill1001Data();
        sk1.direction = new Position();
        sk1.position = new Position();
    }


    // Update is called once per frame
    void Update()
    {
        if (networkIdentity.IsControlling())
        {
            var tankGen = networkIdentity.GetComponent<TankGeneral>();
            if (!tankGen.Stunned)
            {
                Skill1();
                Skill2();
                Skill3();
            }
        }
    }


    // skill e phong 1 luong nang luong lam cham ke dich tren duong di
    private void Skill1()
    {
        if (Input.GetKeyDown(KeyCode.E))
        {
            //Define skill1
            sk1.activator = NetworkClient.ClientID;
            sk1.num = 1;
            sk1.typeId = networkIdentity.TypeId;
            sk1.position.x = bulletSpawnPoint.position.x.TwoDecimals();
            sk1.position.y = bulletSpawnPoint.position.y.TwoDecimals();
            sk1.direction.x = bulletSpawnPoint.up.x;
            sk1.direction.y = bulletSpawnPoint.up.y;

            //Send skill1
            networkIdentity.GetSocket().Emit("skill", new JSONObject(JsonUtility.ToJson(sk1)));
        }

    }

    // skill r phong day xich troi ke dich dau tien gap phai
    private void Skill2()
    {
        if (Input.GetKeyDown(KeyCode.R))
        {
            //Define skill1
            sk1.activator = NetworkClient.ClientID;
            sk1.typeId = networkIdentity.TypeId;
            sk1.num = 2;
            sk1.position.x = bulletSpawnPoint.position.x.TwoDecimals();
            sk1.position.y = bulletSpawnPoint.position.y.TwoDecimals();
            sk1.direction.x = bulletSpawnPoint.up.x;
            sk1.direction.y = bulletSpawnPoint.up.y;

            //Send skill1
            networkIdentity.GetSocket().Emit("skill", new JSONObject(JsonUtility.ToJson(sk1)));
        }

    }

    private void Skill3()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            sk1.activator = NetworkClient.ClientID;
            sk1.typeId = networkIdentity.TypeId;
            sk1.num = 3;

            networkIdentity.GetSocket().Emit("skill", new JSONObject(JsonUtility.ToJson(sk1)));

        }
    }


    // skill space cuong hoa cong giap speep toc danh mau ao
}

[Serializable]
class Skill1001Data
{
    public string id;
    public float num;
    public string typeId;
    public string activator;
    public Position position;
    public Position direction;
}